import { spawn } from "node:child_process";
import { createReadStream, existsSync, promises as fs } from "node:fs";
import path from "node:path";

const CODEX_CANDIDATES = [
  "/Applications/ChatGPT.app/Contents/Resources/codex",
  "/Applications/Codex.app/Contents/Resources/codex",
  "codex",
];

const STYLE_LABELS = {
  "ink-future": "水墨未来",
  "hand-painted": "手绘动画",
  "pixel-rpg": "像素 RPG",
  "art-nouveau": "新艺术星象",
  "retro-handheld": "复古掌机",
  miniature: "微缩世界",
  comic: "漫画分镜",
  "retro-scifi": "复古科幻",
  "picture-book": "疗愈绘本",
};

const LAYOUT_LABELS = {
  mental: "精神天气",
  transition: "昨日 → 今日",
};

const ZODIACS = new Set(["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"]);

function localDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

export function previousShanghaiDate(date = new Date()) {
  const parts = localDateParts(date);
  const value = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function timestampId(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function resolveCodexBinary() {
  return CODEX_CANDIDATES.find((candidate) => candidate === "codex" || existsSync(candidate)) || "codex";
}

function normalizeOptions(options = {}) {
  const stylePreference = options.stylePreference === "random" || STYLE_LABELS[options.stylePreference]
    ? options.stylePreference
    : "random";
  const layoutPreference = options.layoutPreference === "random" || LAYOUT_LABELS[options.layoutPreference]
    ? options.layoutPreference
    : "random";
  return {
    trigger: options.trigger === "scheduled" ? "scheduled" : "manual",
    zodiac: ZODIACS.has(options.zodiac) ? options.zodiac : "天秤座",
    stylePreference,
    layoutPreference,
    currentStyleId: STYLE_LABELS[options.currentStyleId] ? options.currentStyleId : "",
    currentLayoutId: LAYOUT_LABELS[options.currentLayoutId] ? options.currentLayoutId : "",
    portraitDataUrl: typeof options.portraitDataUrl === "string" ? options.portraitDataUrl : "",
  };
}

async function savePortrait(runDirectory, dataUrl) {
  if (!dataUrl) return "";
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("invalid_portrait");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length < 128 || buffer.length > 12 * 1024 * 1024) throw new Error("invalid_portrait");
  const extension = match[1] === "image/jpeg" ? "jpg" : match[1].split("/")[1];
  const portraitPath = path.join(runDirectory, "portrait-reference." + extension);
  await fs.writeFile(portraitPath, buffer);
  return portraitPath;
}

export function buildGenerationPrompt({ workspaceRoot, projectRoot, runDirectory, wallpaperPath, reportPath, resultPath, sourceDate, options, portraitPath }) {
  const styleRule = options.stylePreference === "random"
    ? `从已批准的九种风格中选择最能表现当天状态的一种；不要选择当前正在浏览的 ${STYLE_LABELS[options.currentStyleId] || "示例风格"}，并让色调、空间感和情绪与上一张明显不同。`
    : `固定使用「${STYLE_LABELS[options.stylePreference]}」风格。`;
  const layoutRule = options.layoutPreference === "random"
    ? `在「精神天气」和「昨日 → 今日」中选择更适合证据的一种；尽量不要沿用当前 ${LAYOUT_LABELS[options.currentLayoutId] || "示例布局"}。`
    : `固定使用「${LAYOUT_LABELS[options.layoutPreference]}」布局。`;
  const portraitRule = portraitPath
    ? `人物参考图位于 ${portraitPath}。只把它用于本次图像生成，保留可辨认特征，不推断敏感属性。`
    : "没有人物参考图。请使用不具身份识别性的背影、侧影、物件或环境隐喻，不要凭空画成一个具体真人。";

  return `这是用户通过“生成并更换新壁纸”明确发起的有意重复运行，等同于“继续/再来一版”；按 catch-repeat-requests 规则直接执行，不询问是否沉淀或更新 Skill。

使用已安装的 $generate-daily-ai-wallpaper Skill 执行一次真实的每日壁纸生成。不要只写方案，不要使用网站当前预览图或仓库里的示例壁纸作为成品。

范围与日期：
- 当前工作区：${workspaceRoot}
- 只读取用户已授权、projectId=local-4f6e16200d95e3744007408e99cd61a0 且 cwd=${workspaceRoot} 的 Codex 用户任务。
- 复盘 Asia/Shanghai 的上一自然日 ${sourceDate}，合并同一任务的续接对话；忽略系统提示、ambient UI、示例文本、凭证和无关隐私。
- AI 使用能力不要在晨间重复打分。先读取 ${path.join(workspaceRoot, "daily-discovery-state.json")} 的 verifiedCapability；只有字段存在且有明确日期与证据范围时才展示，否则写“待评估”。

生成要求：
- 星座：${options.zodiac}。
- ${layoutRule}
- ${styleRule}
- ${portraitRule}
- 先提炼“昨天在做什么、最强的心理循环、今天一个具体动作”，心理描述必须是温和推测，不作诊断。
- 黄历和星座没有可核对实时来源时，必须在组件内标“待同步”或“参考”，不能伪造实时事实。
- 生成一张全新的 2880 × 1800 PNG。三个桌面组件必须是：今日黄历、${options.zodiac}、AI 使用能力。
- 可以先生成无文字背景，再用精确排版层加入中文；最终交付必须只有一张完整图片，不能在成品上再叠第二层遮罩、文案或组件。
- 文案要短、一眼能懂；画面必须表达精神状态，不只是任务清单；保留桌面图标呼吸区。

输出与验收：
- 最终 PNG 必须保存到：${wallpaperPath}
- 同时写 UTF-8 JSON 到：${reportPath}
- JSON 必须包含：sourceDate、sourceCount、headline、summary、thought、advice、mood、confidence、almanac、zodiac、zodiacReading、ability、style（含 id/label）、layout（含 id/label）、wallpaperPath、verification。
- verification 必须包含 width=2880、height=1800、textReviewed、widgetsComplete、noDuplicateOverlay、safeAreaChecked，布尔检查必须来自打开实际成品后的核对。
- 不要在本任务内更换桌面；本机生成器会在文件校验通过后统一更换并核对。
- 不要修改网站源码、Skill、自动化或仓库设置；本次只生成上述私人成品和报告。
- 完成后把一句简短结果写到 ${resultPath}，但以 PNG 和 report.json 是否真实存在为最终标准。`;
}

export async function readPngDimensions(filePath) {
  const file = await fs.open(filePath, "r");
  try {
    const header = Buffer.alloc(24);
    const { bytesRead } = await file.read(header, 0, header.length, 0);
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (bytesRead !== 24 || !header.subarray(0, 8).equals(pngSignature) || header.subarray(12, 16).toString("ascii") !== "IHDR") {
      throw new Error("invalid_png");
    }
    return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
  } finally {
    await file.close();
  }
}

async function readReport(reportPath) {
  const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
  const requiredText = ["headline", "summary", "thought", "advice", "mood"];
  if (!requiredText.every((key) => typeof report[key] === "string" && report[key].trim())) throw new Error("invalid_report");
  if (!report.style?.id || !report.style?.label || !report.layout?.id || !report.layout?.label) throw new Error("invalid_report");
  return report;
}

function publicState(state) {
  if (!state) return null;
  const { imagePath, reportPath, logPath, ...safe } = state;
  return safe;
}

export function createWallpaperGenerationManager({ workspaceRoot, projectRoot, applyWallpaper }) {
  const runs = new Map();
  let activeRunId = "";

  async function execute(runId, rawOptions) {
    const options = normalizeOptions(rawOptions);
    const sourceDate = previousShanghaiDate();
    const runDirectory = path.join(workspaceRoot, "daily-wallpapers", sourceDate, options.trigger + "-" + runId);
    const imagePath = path.join(runDirectory, "wallpaper.png");
    const reportPath = path.join(runDirectory, "report.json");
    const resultPath = path.join(runDirectory, "codex-result.txt");
    const state = runs.get(runId);
    Object.assign(state, { sourceDate, runDirectory, imagePath, reportPath, status: "running", stage: "preparing", message: "正在准备昨日对话范围" });

    try {
      await fs.mkdir(runDirectory, { recursive: true });
      const portraitPath = await savePortrait(runDirectory, options.portraitDataUrl);
      const prompt = buildGenerationPrompt({ workspaceRoot, projectRoot, runDirectory, wallpaperPath: imagePath, reportPath, resultPath, sourceDate, options, portraitPath });
      await fs.writeFile(path.join(runDirectory, "request.txt"), prompt, "utf8");
      state.stage = "generating";
      state.message = "正在读取昨日对话、复盘并生成全新画面";

      const codexBinary = resolveCodexBinary();
      const args = [
        "--ask-for-approval", "never",
        "exec",
        "--ephemeral",
        "--sandbox", "workspace-write",
        "--skip-git-repo-check",
        "--cd", workspaceRoot,
        "-o", resultPath,
        prompt,
      ];
      const exitCode = await new Promise((resolve, reject) => {
        const child = spawn(codexBinary, args, { cwd: workspaceRoot, stdio: ["ignore", "ignore", "ignore"] });
        const timeout = setTimeout(() => {
          child.kill("SIGTERM");
          reject(new Error("generation_timeout"));
        }, 30 * 60 * 1000);
        child.on("error", (error) => { clearTimeout(timeout); reject(error); });
        child.on("close", (code) => { clearTimeout(timeout); resolve(code); });
      });
      if (exitCode !== 0) throw new Error("codex_generation_failed");

      state.stage = "verifying";
      state.message = "新图已生成，正在检查尺寸、文案和组件";
      const dimensions = await readPngDimensions(imagePath);
      if (dimensions.width !== 2880 || dimensions.height !== 1800) throw new Error("wrong_dimensions");
      const report = await readReport(reportPath);
      const checks = report.verification || {};
      if (!["textReviewed", "widgetsComplete", "noDuplicateOverlay", "safeAreaChecked"].every((key) => checks[key] === true)) {
        throw new Error("visual_verification_incomplete");
      }

      state.stage = "applying";
      state.message = "检查通过，正在更换并核对 Mac 桌面";
      const applyResult = await applyWallpaper(imagePath, report.style.id || "daily-ai-wallpaper");
      if (!applyResult?.verified) throw new Error("wallpaper_not_verified");

      Object.assign(state, {
        status: "completed",
        stage: "completed",
        message: "新壁纸已生成，并已成为 Mac 桌面",
        completedAt: new Date().toISOString(),
        report,
        dimensions,
        applied: {
          verified: true,
          styleId: applyResult.styleId,
          filename: applyResult.filename,
          visibleLayer: applyResult.visibleLayer,
          systemVerified: applyResult.systemVerified,
          bytesVerified: applyResult.bytesVerified,
        },
        imageUrl: "/api/generation-image?runId=" + encodeURIComponent(runId) + "&v=" + Date.now(),
      });
    } catch (error) {
      Object.assign(state, {
        status: "failed",
        stage: "failed",
        message: error.message === "generation_timeout" ? "生成超过 30 分钟，已停止这次任务" : "这次新壁纸没有完成，旧桌面保持不变",
        error: error.message || "generation_failed",
        completedAt: new Date().toISOString(),
      });
    } finally {
      activeRunId = "";
    }
  }

  return {
    start(rawOptions = {}) {
      if (activeRunId) {
        return { accepted: false, code: "already_running", run: publicState(runs.get(activeRunId)) };
      }
      const runId = timestampId();
      const state = {
        runId,
        status: "queued",
        stage: "queued",
        message: "已开始新的壁纸生成流程",
        startedAt: new Date().toISOString(),
      };
      runs.set(runId, state);
      activeRunId = runId;
      execute(runId, rawOptions);
      return { accepted: true, run: publicState(state) };
    },
    get(runId) {
      return publicState(runs.get(runId));
    },
    getImagePath(runId) {
      const state = runs.get(runId);
      return state?.status === "completed" ? state.imagePath : "";
    },
    createImageStream(runId) {
      const imagePath = this.getImagePath(runId);
      return imagePath ? createReadStream(imagePath) : null;
    },
  };
}

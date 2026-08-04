import { useCallback, useEffect, useMemo, useState } from "react";
import inkFutureImage from "./assets/styles/ink-future.png";
import handPaintedImage from "./assets/styles/hand-painted-pastoral.png";
import pixelRpgImage from "./assets/styles/pixel-rpg.png";
import artNouveauImage from "./assets/styles/art-nouveau-libra.png";
import retroHandheldImage from "./assets/styles/retro-handheld.png";
import miniatureImage from "./assets/styles/miniature-world.png";
import comicImage from "./assets/styles/comic-storyboard.png";
import retroScifiImage from "./assets/styles/retro-scifi.png";
import pictureBookImage from "./assets/styles/healing-picture-book.png";
import inkFutureThumb from "./assets/style-thumbs/ink-future.jpg";
import handPaintedThumb from "./assets/style-thumbs/hand-painted.jpg";
import pixelRpgThumb from "./assets/style-thumbs/pixel-rpg.jpg";
import artNouveauThumb from "./assets/style-thumbs/art-nouveau.jpg";
import retroHandheldThumb from "./assets/style-thumbs/retro-handheld.jpg";
import miniatureThumb from "./assets/style-thumbs/miniature.jpg";
import comicThumb from "./assets/style-thumbs/comic.jpg";
import retroScifiThumb from "./assets/style-thumbs/retro-scifi.jpg";
import pictureBookThumb from "./assets/style-thumbs/picture-book.jpg";

const DEMO_REVIEW = [
  "公开示例：昨天你用 AI 推进了一个真实任务，并不断确认结果是否真正跑通。",
  "能力状态：尚未读取你的授权任务证据，因此不展示虚构分数。",
  "下一步：安装 Plugin 后，让 Codex 读取你授权的昨日对话，生成只属于你的复盘和完整壁纸。",
  "隐私说明：公开网页不读取 Codex 对话；参考照片只在当前浏览器中预览。",
].join("\n\n");

const WALLPAPER_STYLES = [
  { id: "ink-future", label: "水墨未来", note: "松开脑内循环", image: inkFutureImage, thumb: inkFutureThumb, theme: "parchment" },
  { id: "hand-painted", label: "手绘动画", note: "温柔但不幼稚", image: handPaintedImage, thumb: handPaintedThumb, theme: "parchment" },
  { id: "pixel-rpg", label: "像素 RPG", note: "把今天变成一关", image: pixelRpgImage, thumb: pixelRpgThumb, theme: "graphite" },
  { id: "art-nouveau", label: "新艺术星象", note: "秩序与美感并存", image: artNouveauImage, thumb: artNouveauThumb, theme: "parchment" },
  { id: "retro-handheld", label: "复古掌机", note: "把状态装进设备", image: retroHandheldImage, thumb: retroHandheldThumb, theme: "moss" },
  { id: "miniature", label: "微缩世界", note: "让复杂变得可触摸", image: miniatureImage, thumb: miniatureThumb, theme: "parchment" },
  { id: "comic", label: "漫画分镜", note: "把心理活动拆成镜头", image: comicImage, thumb: comicThumb, theme: "parchment" },
  { id: "retro-scifi", label: "复古科幻", note: "从循环轨道切出路线", image: retroScifiImage, thumb: retroScifiThumb, theme: "graphite" },
  { id: "picture-book", label: "疗愈绘本", note: "允许自己慢一点", image: pictureBookImage, thumb: pictureBookThumb, theme: "parchment" },
];

const LAYOUTS = {
  mental: {
    label: "精神天气",
    description: "先看见情绪，再给一个动作。",
  },
  transition: {
    label: "昨日 → 今日",
    description: "把昨天的纠结，转成今天能走的路。",
  },
};

const ZODIAC = {
  白羊座: ["起步", "先做十分钟", "把冲劲用在第一步，不要一次开三个方向。"],
  金牛座: ["稳住", "完成手边一件事", "稳定来自清楚的节奏，不来自把所有事抓住。"],
  双子座: ["收束", "只留一个问题", "今天少开一个窗口，答案会更容易出现。"],
  巨蟹座: ["照顾", "先恢复能量", "保护自己的注意力，也是一种前进。"],
  狮子座: ["表达", "让成果被看见", "把已经完成的部分交付，不必等到完美。"],
  处女座: ["收尾", "完成胜过优化", "把清楚的部分交付，再处理细节。"],
  天秤座: ["收束", "只做一步", "今天的平衡，来自只做一步。"],
  天蝎座: ["看深", "追问真正原因", "别被表面进度带走，先确认问题是否真的消失。"],
  射手座: ["校准", "先确认方向", "自由不是同时出发，而是知道此刻去哪里。"],
  摩羯座: ["推进", "留下证据", "完成一个可核对结果，比多做一轮计划更有用。"],
  水瓶座: ["连接", "让想法落地", "今天给新想法一个具体的使用场景。"],
  双鱼座: ["留白", "听见真实感受", "不用立刻解释一切，先把最强的感受写下来。"],
};

const PENDING_ABILITY = {
  level: "待评估",
  label: "需要真实任务证据",
  score: null,
  confidence: null,
  sample: "安装 Plugin 后，根据你授权的任务生成",
};

function countMatches(text, words) {
  return words.reduce(function (total, word) {
    return total + (text.split(word).length - 1);
  }, 0);
}

function formatDate(date) {
  const value = new Date(date + "T12:00:00+08:00");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(value);
  return { short: month + "." + day, weekday: weekday };
}

function getAlmanac(date) {
  if (date === "2026-08-04") {
    return { lunar: "六月廿二", action: "整理收尾", avoid: "忌同时开新坑" };
  }
  const day = new Date(date + "T12:00:00").getDate();
  const actions = ["整理收尾", "复盘校准", "完成交付", "轻装前进"];
  return { lunar: "黄历待同步", action: actions[day % actions.length], avoid: "忌分散注意力" };
}

function estimateConversationCount(text) {
  const turns = (text.match(/用户[：:]/g) || []).length;
  return turns || Math.max(1, text.split(/\n\s*\n/).filter(Boolean).length);
}

function analyzeConversation(text, date, zodiac) {
  const clean = text.trim();
  const counts = {
    content: countMatches(clean, ["内容 Agent", "硬检查", "软评价", "实验规则", "不同选题", "业务数据"]),
    proof: countMatches(clean, ["证据", "核对", "验证", "完成", "跑通", "结果"]),
    product: countMatches(clean, ["产品", "用户", "原型", "页面", "体验", "设计"]),
    emotion: countMatches(clean, ["担心", "焦虑", "压力", "不想", "希望", "掌控", "害怕"]),
    correction: countMatches(clean, ["不是", "不能", "不要", "重做", "不对", "而是"]),
  };
  const confidence = Math.min(92, Math.round(64 + Math.min(clean.length / 90, 14) + Math.max.apply(null, Object.values(counts)) * 2));
  let content;

  if (counts.content >= 4) {
    content = {
      headline: "想得够多了。",
      summary: "你不是缺规则，只是还没获得确定感。",
      thought: "表面在收束，脑内还在确认：这次成功，会不会只是碰巧？",
      advice: "今天只做一次真实复测。",
      mood: "表面平静，内里求证",
      focus: "第一步",
      abilityNote: "证据更全，等级不变",
    };
  } else if (counts.product >= 4) {
    content = {
      headline: "你在逼近核心体验。",
      summary: "不是继续加功能，而是找到用户第一眼就能感到的价值。",
      thought: "你对“差不多能用”已经没有耐心，想看见一个真正完整的体验。",
      advice: "今天只验证一个瞬间：第一眼是不是“这就是给我的”。",
      mood: "挑剔，但方向更清楚",
      focus: "第一眼",
      abilityNote: "开始用体验定义任务",
    };
  } else if (counts.proof + counts.correction >= 5) {
    content = {
      headline: "你在用证据换回掌控感。",
      summary: "真正让你不安的，不是做不出来，而是结果看起来对、实际上没跑通。",
      thought: "脑内还在逐项确认：输入、过程和结果，真的接上了吗？",
      advice: "今天只关一条链路，并留下一个可核对结果。",
      mood: "谨慎，也更清楚",
      focus: "闭环",
      abilityNote: "验证意识正在变强",
    };
  } else if (counts.emotion >= 2) {
    content = {
      headline: "先让自己慢下来。",
      summary: "你不是没有方向，只是连续判断让能量有些见底。",
      thought: "你还想继续把事情推好，但身体已经在提醒：先留一点空间。",
      advice: "今天先完成一件最轻的事，然后休息。",
      mood: "有点累，还没放弃",
      focus: "恢复",
      abilityNote: "知道何时停下也是能力",
    };
  } else {
    content = {
      headline: "一条主线正在浮出来。",
      summary: "你在多个可能之间寻找真正值得继续的方向。",
      thought: "不是没有答案，只是不想太早放弃其他可能。",
      advice: "选一件今天能结束的事，做完再决定下一步。",
      mood: "安静观察",
      focus: "选择",
      abilityNote: "先用行动减少模糊",
    };
  }

  const zodiacReading = ZODIAC[zodiac] || ZODIAC["天秤座"];
  return {
    ...content,
    sourceCount: estimateConversationCount(clean),
    confidence: counts.content >= 4 ? 83 : confidence,
    date: date,
    dateMeta: formatDate(date),
    almanac: getAlmanac(date),
    zodiac: zodiac,
    zodiacReading: { signal: zodiacReading[0], advice: zodiacReading[1], note: zodiacReading[2] },
    ability: { ...PENDING_ABILITY },
  };
}

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () { resolve(image); };
    image.onerror = reject;
    image.src = src;
  });
}

function drawContain(ctx, image, x, y, width, height) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.fillStyle = "#201d1a";
  ctx.fillRect(x, y, width, height);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

async function renderWallpaperCanvas(selectedStyle) {
  const canvas = document.createElement("canvas");
  canvas.width = 2880;
  canvas.height = 1800;
  const ctx = canvas.getContext("2d");
  const image = await loadImage(selectedStyle.image);
  drawContain(ctx, image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function canvasToPngBlob(canvas) {
  return new Promise(function (resolve, reject) {
    canvas.toBlob(function (blob) {
      if (blob) resolve(blob);
      else reject(new Error("没有生成可用的 PNG 文件。"));
    }, "image/png");
  });
}

async function setDesktopWallpaper(selectedStyle) {
  const canvas = await renderWallpaperCanvas(selectedStyle);
  const blob = await canvasToPngBlob(canvas);
  const response = await fetch("/api/set-wallpaper?styleId=" + encodeURIComponent(selectedStyle.id), {
    method: "POST",
    headers: { "Content-Type": "image/png", "X-Wallpaper-Name": encodeURIComponent(selectedStyle.label) },
    body: blob,
  });
  const raw = await response.text();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (error) {
    throw new Error("本机桌面助手没有连接，请使用本地生成器打开这个页面。");
  }
  if (!response.ok || !payload.ok || !payload.verified) {
    throw new Error(payload.message || "Mac 没有完成桌面更换。");
  }
  return payload;
}

function WallpaperPreview({ selectedStyle }) {
  return (
    <div className="wallpaper" data-testid="wallpaper-preview">
      <img className="wallpaper-art" src={selectedStyle.image} alt={selectedStyle.label + "风格的个性化桌面壁纸"} />
    </div>
  );
}

function Step({ number, title, active, children }) {
  return (
    <section className={"setup-step" + (active ? " active" : "")}>
      <div className="step-heading">
        <span>{number}</span>
        <strong>{title}</strong>
      </div>
      <div className="step-body">{children}</div>
    </section>
  );
}

const STORAGE_PREFIX = "yesterday-wallpaper:";

function readSetting(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(STORAGE_PREFIX + key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.warn("壁纸设置读取失败", error);
    return fallback;
  }
}

function saveSetting(key, value) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn("壁纸设置保存失败", error);
  }
}

function getLocalDateId(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function formatUpdateStamp(value) {
  if (!value) return "尚未更新";
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function pickDifferent(items, current) {
  const alternatives = items.filter(function (item) { return item !== current; });
  const pool = alternatives.length ? alternatives : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function isPastSchedule(now, updateTime) {
  const parts = updateTime.split(":").map(Number);
  const scheduled = new Date(now);
  scheduled.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
  return now >= scheduled;
}

function getNextRunLabel(autoEnabled, updateTime, lastAutoDate) {
  if (!autoEnabled) return "自动更新已暂停";
  const now = new Date();
  const today = getLocalDateId(now);
  if (lastAutoDate !== today && !isPastSchedule(now, updateTime)) return "今天 " + updateTime;
  if (lastAutoDate !== today) return "正在补上今天的更新";
  return "明天 " + updateTime;
}

export function App() {
  const [zodiac, setZodiac] = useState(function () { return readSetting("zodiac", "天秤座"); });
  const [layoutKey, setLayoutKey] = useState(function () {
    const stored = readSetting("layoutKey", "mental");
    return LAYOUTS[stored] ? stored : "mental";
  });
  const [styleId, setStyleId] = useState(function () {
    const stored = readSetting("styleId", "ink-future");
    return WALLPAPER_STYLES.some(function (style) { return style.id === stored; }) ? stored : "ink-future";
  });
  const [layoutPreference, setLayoutPreference] = useState(function () {
    const stored = readSetting("layoutPreference", "random");
    return stored === "random" || LAYOUTS[stored] ? stored : "random";
  });
  const [stylePreference, setStylePreference] = useState(function () {
    const stored = readSetting("stylePreference", "random");
    return stored === "random" || WALLPAPER_STYLES.some(function (style) { return style.id === stored; }) ? stored : "random";
  });
  const [autoEnabled, setAutoEnabled] = useState(function () { return readSetting("autoEnabled", true); });
  const [updateTime, setUpdateTime] = useState(function () { return readSetting("updateTime", "09:00"); });
  const [lastAutoDate, setLastAutoDate] = useState(function () { return readSetting("lastAutoDate", ""); });
  const [lastUpdated, setLastUpdated] = useState(function () { return readSetting("lastUpdated", ""); });
  const [lastReason, setLastReason] = useState(function () { return readSetting("lastReason", "公开示例已就绪"); });
  const [report, setReport] = useState(function () { return analyzeConversation(DEMO_REVIEW, getLocalDateId(), zodiac); });
  const [toast, setToast] = useState("公开示例已就绪");
  const [updating, setUpdating] = useState(false);
  const [desktopStatus, setDesktopStatus] = useState({ state: "idle", message: "正在检查本地桌面助手" });
  const [nativeAvailable, setNativeAvailable] = useState(null);
  const [portrait, setPortrait] = useState(null);
  const [customWallpaper, setCustomWallpaper] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportMeta, setExportMeta] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const selectedStyle = useMemo(function () {
    if (customWallpaper) return customWallpaper;
    return WALLPAPER_STYLES.find(function (item) { return item.id === styleId; }) || WALLPAPER_STYLES[0];
  }, [styleId, customWallpaper]);
  const dateMeta = formatDate(report.date);
  const nextRunLabel = getNextRunLabel(autoEnabled, updateTime, lastAutoDate);

  useEffect(function () {
    saveSetting("zodiac", zodiac);
    saveSetting("layoutKey", layoutKey);
    saveSetting("styleId", styleId);
    saveSetting("layoutPreference", layoutPreference);
    saveSetting("stylePreference", stylePreference);
    saveSetting("autoEnabled", autoEnabled);
    saveSetting("updateTime", updateTime);
    saveSetting("lastAutoDate", lastAutoDate);
    saveSetting("lastUpdated", lastUpdated);
    saveSetting("lastReason", lastReason);
  }, [zodiac, layoutKey, styleId, layoutPreference, stylePreference, autoEnabled, updateTime, lastAutoDate, lastUpdated, lastReason]);

  useEffect(function () {
    let active = true;
    fetch("/api/native-status", { cache: "no-store" }).then(function (response) {
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error("not-local");
      return response.json();
    }).then(function (payload) {
      if (!active) return;
      setNativeAvailable(Boolean(payload.ok && payload.platform === "darwin"));
      setDesktopStatus(payload.ok && payload.platform === "darwin"
        ? { state: "idle", message: "本地桌面助手已连接" }
        : { state: "error", message: "当前只能预览和导出" });
    }).catch(function () {
      if (!active) return;
      setNativeAvailable(false);
      setDesktopStatus({ state: "error", message: "公开网页不能直接修改系统桌面" });
    });
    return function () { active = false; };
  }, []);

  useEffect(function () {
    return function () {
      if (portrait?.url) URL.revokeObjectURL(portrait.url);
    };
  }, [portrait]);

  useEffect(function () {
    return function () {
      if (customWallpaper?.objectUrl) URL.revokeObjectURL(customWallpaper.objectUrl);
    };
  }, [customWallpaper]);

  const updateWallpaper = useCallback(async function (reason) {
    const layoutIds = Object.keys(LAYOUTS);
    const styleIds = WALLPAPER_STYLES.map(function (style) { return style.id; });
    const nextLayout = layoutPreference === "random" ? pickDifferent(layoutIds, layoutKey) : layoutPreference;
    const nextStyle = stylePreference === "random" ? pickDifferent(styleIds, styleId) : stylePreference;
    const nextStyleConfig = WALLPAPER_STYLES.find(function (style) { return style.id === nextStyle; }) || WALLPAPER_STYLES[0];
    const now = new Date();
    const today = getLocalDateId(now);

    setUpdating(true);
    setDesktopStatus({ state: "working", message: "正在把“" + nextStyleConfig.label + "”设为 Mac 桌面…" });
    setCustomWallpaper(null);
    setLayoutKey(nextLayout);
    setStyleId(nextStyle);
    setReport(analyzeConversation(DEMO_REVIEW, today, zodiac));
    setLastUpdated(now.toISOString());
    if (reason === "auto" || isPastSchedule(now, updateTime)) setLastAutoDate(today);

    try {
      const result = await setDesktopWallpaper(nextStyleConfig);
      setLastReason(reason === "auto" ? "按计划更换 Mac 桌面" : "手动更换 Mac 桌面");
      setDesktopStatus({ state: "success", message: "Mac 桌面已更换为“" + nextStyleConfig.label + "”" });
      setToast(reason === "auto" ? "已按计划更换 Mac 桌面" : "Mac 桌面壁纸已更换");
      return { ...result, layout: nextLayout };
    } catch (error) {
      console.error(error);
      setLastReason("仅更新网页预览");
      setDesktopStatus({ state: "error", message: error.message });
      setToast("预览已更新，但 Mac 桌面没有更换");
      return { verified: false, error: error.message, layout: nextLayout, styleId: nextStyle };
    } finally {
      setUpdating(false);
    }
  }, [layoutPreference, stylePreference, layoutKey, styleId, zodiac, updateTime]);

  const applyCurrentWallpaper = useCallback(async function () {
    setUpdating(true);
    setDesktopStatus({ state: "working", message: "正在使用当前预览的完整图片…" });
    try {
      const result = await setDesktopWallpaper(selectedStyle);
      setLastUpdated(new Date().toISOString());
      setLastReason("使用当前完整图片更换 Mac 桌面");
      setDesktopStatus({ state: "success", message: "Mac 桌面已更换为“" + selectedStyle.label + "”" });
      setToast("当前预览已成为 Mac 桌面");
      return result;
    } catch (error) {
      console.error(error);
      setLastReason("仅保留当前网页预览");
      setDesktopStatus({ state: "error", message: error.message });
      setToast("当前图片仍可导出，但 Mac 桌面没有更换");
      return { verified: false, error: error.message };
    } finally {
      setUpdating(false);
    }
  }, [selectedStyle]);

  useEffect(function () {
    function checkSchedule() {
      const now = new Date();
      if (autoEnabled && nativeAvailable && lastAutoDate !== getLocalDateId(now) && isPastSchedule(now, updateTime)) {
        updateWallpaper("auto");
      }
    }
    checkSchedule();
    const timer = window.setInterval(checkSchedule, 30000);
    return function () { window.clearInterval(timer); };
  }, [autoEnabled, updateTime, lastAutoDate, nativeAvailable, updateWallpaper]);

  useEffect(function () {
    window.__wallpaperGenerator = {
      getReport: function () { return report; },
      getSelection: function () {
        return {
          style: selectedStyle.id,
          layout: layoutKey,
          stylePreference: stylePreference,
          layoutPreference: layoutPreference,
        };
      },
      getSchedule: function () { return { autoEnabled: autoEnabled, updateTime: updateTime, lastAutoDate: lastAutoDate }; },
      updateNow: function () { updateWallpaper("manual"); },
      applyCurrent: function () { applyCurrentWallpaper(); },
      renderCanvas: function () { return renderWallpaperCanvas(selectedStyle); },
    };
  }, [report, selectedStyle, layoutKey, stylePreference, layoutPreference, autoEnabled, updateTime, lastAutoDate, updateWallpaper, applyCurrentWallpaper]);

  useEffect(function () {
    if (!toast) return undefined;
    const timer = window.setTimeout(function () { setToast(""); }, 2600);
    return function () { window.clearTimeout(timer); };
  }, [toast]);

  function chooseStyle(style) {
    setCustomWallpaper(null);
    setStyleId(style.id);
    setStylePreference(style.id);
    setToast("已固定为“" + style.label + "”");
  }

  function handlePortraitUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast("请选择 JPG、PNG 或 WebP 图片");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setToast("参考照片请控制在 12 MB 以内");
      return;
    }
    setPortrait({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
    setToast("参考照片已在本机准备，不会上传到网站");
    event.target.value = "";
  }

  function handleWallpaperImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast("请选择一张完整壁纸图片");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCustomWallpaper({
      id: "custom-import",
      label: "我的 Codex 成品",
      image: objectUrl,
      objectUrl: objectUrl,
      thumb: objectUrl,
      note: "从本机导入的完整壁纸",
    });
    setToast("已导入完整壁纸，没有叠加第二层内容");
    event.target.value = "";
  }

  async function exportWallpaper() {
    setExporting(true);
    try {
      await document.fonts.ready;
      const canvas = await renderWallpaperCanvas(selectedStyle);
      const blob = await canvasToPngBlob(canvas);
      setExportMeta({ width: canvas.width, height: canvas.height, bytes: blob.size });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "昨日之我-" + report.date + "-" + selectedStyle.label + ".png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      setToast("已导出 2880 × 1800 桌面壁纸");
    } catch (error) {
      console.error(error);
      setToast("导出没有成功，请再试一次");
    } finally {
      setExporting(false);
    }
  }

  function openFullscreen() {
    const preview = document.querySelector("[data-testid='wallpaper-preview']");
    if (preview && preview.requestFullscreen) preview.requestFullscreen();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div>
            <strong>昨日之我</strong>
          </div>
          <p>把昨天的 AI 对话，变成今天一眼能懂的桌面</p>
        </div>
        <div className="header-actions">
          <a className="quiet-button download-link" href="/downloads/daily-ai-wallpaper-plugin-v1.0.0.zip" download>下载 Plugin</a>
          <button className="quiet-button" type="button" onClick={function () { setGuideOpen(true); }}>使用指南</button>
          <div className="today-chip"><span>{dateMeta.short}</span><strong>今日桌面</strong></div>
        </div>
      </header>

      <main className="creator-grid">
        <aside className="setup-panel" aria-label="壁纸生成步骤">
          <Step number="1" title="昨日复盘" active>
            <div className="sync-card">
              <div className="sync-card-heading"><span className="sync-pulse" /><strong>公开示例复盘</strong><b>未读取对话</b></div>
              <p>安装 Plugin 后自动读取你授权的昨日任务</p>
              <blockquote>{report.summary}</blockquote>
            </div>
            <label className="single-field"><span>我的星座</span><select value={zodiac} onChange={function (event) {
              const value = event.target.value;
              setZodiac(value);
              setReport(analyzeConversation(DEMO_REVIEW, report.date, value));
            }}>{Object.keys(ZODIAC).map(function (item) { return <option key={item}>{item}</option>; })}</select></label>
            <div className="portrait-card">
              {portrait ? <img src={portrait.url} alt="人物参考照片预览" /> : <span className="portrait-placeholder">人物<br />参考</span>}
              <div><strong>人物参考图（可选）</strong><p>{portrait ? portrait.name : "用于生成更像你的画面；只在本机预览。"}</p><label className="inline-upload">{portrait ? "更换照片" : "选择照片"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePortraitUpload} /></label></div>
            </div>
          </Step>

          <Step number="2" title="自动更新" active>
            <div className="schedule-card">
              <label className="auto-row">
                <span><strong>{nativeAvailable ? "每天自动更换桌面" : "每日自动更新"}</strong><small>{nativeAvailable ? "默认根据昨天的复盘生成" : "安装 Plugin 后由 Codex 在 09:00 可靠触发"}</small></span>
                <input aria-label="每天自动更换桌面" type="checkbox" checked={autoEnabled} onChange={function (event) {
                  setAutoEnabled(event.target.checked);
                  setToast(event.target.checked
                    ? nativeAvailable ? "本地自动更新已开启" : "已保存 09:00 偏好；安装 Plugin 后生效"
                    : "自动更新已暂停");
                }} />
              </label>
              <label className="time-field"><span>更新时间</span><input aria-label="自动更新时间" type="time" value={updateTime} disabled={!autoEnabled} onChange={function (event) { setUpdateTime(event.target.value); }} /></label>
              <div className="next-run"><span>下一次</span><strong>{nextRunLabel}</strong></div>
            </div>
          </Step>

          <Step number="3" title="随机规则" active>
            <div className="preference-grid">
              <label><span>壁纸逻辑</span><select aria-label="壁纸逻辑" value={layoutPreference} onChange={function (event) {
                const value = event.target.value;
                setLayoutPreference(value);
                if (value !== "random") setLayoutKey(value);
                setToast(value === "random" ? "壁纸逻辑将随机变化" : "已固定壁纸逻辑");
              }}><option value="random">随机</option>{Object.entries(LAYOUTS).map(function (entry) { return <option key={entry[0]} value={entry[0]}>{entry[1].label}</option>; })}</select></label>
              <label><span>视觉风格</span><select aria-label="视觉风格" value={stylePreference} onChange={function (event) {
                const value = event.target.value;
                setStylePreference(value);
                if (value !== "random") setStyleId(value);
                setToast(value === "random" ? "视觉风格将随机变化" : "已固定视觉风格");
              }}><option value="random">随机</option>{WALLPAPER_STYLES.map(function (style) { return <option key={style.id} value={style.id}>{style.label}</option>; })}</select></label>
            </div>
            <p className="random-note">当前壁纸：{LAYOUTS[layoutKey].label} · {selectedStyle.label}</p>
          </Step>

          <Step number="4" title="手动更新" active>
            <button className="generate-button" type="button" onClick={function () { updateWallpaper("manual"); }} disabled={updating}>{updating ? "正在更新…" : nativeAvailable ? "立即更换桌面壁纸" : "立即更新网页预览"}<small>{nativeAvailable ? "使用当前预览的完整图片" : "安装本地助手后才能修改系统桌面"}</small></button>
            <label className="wallpaper-import">导入 Codex 生成的完整壁纸<input type="file" accept="image/*" onChange={handleWallpaperImport} /></label>
            <div className={"desktop-status " + desktopStatus.state} role="status" data-testid="desktop-status">
              <i />
              <span><strong>Mac 桌面</strong><small>{desktopStatus.message}</small></span>
            </div>
            <div className="last-update"><span>{lastReason}</span><strong>{formatUpdateStamp(lastUpdated)}</strong></div>
          </Step>

          <p className="privacy-note">复盘信息只用于生成；心理活动是温和推测，不是诊断。</p>
        </aside>

        <section className="workspace" aria-label="壁纸创作区">
          <div className="preview-card">
            <div className="preview-toolbar">
              <div><strong>预览</strong><span>16:10 · 2880 × 1800 · 匿名示例数据</span></div>
              <div className="preview-actions">
                <button type="button" onClick={openFullscreen}>全屏预览</button>
                <button type="button" onClick={applyCurrentWallpaper} disabled={updating}>使用当前图片更换桌面</button>
                <button className="export-button" type="button" onClick={exportWallpaper} disabled={exporting}>{exporting ? "正在导出" : "导出原图壁纸"}</button>
              </div>
            </div>
            <div className="preview-stage">
              <WallpaperPreview selectedStyle={selectedStyle} />
            </div>
          </div>

          <div className="insight-strip">
            <article>
              <span>{LAYOUTS[layoutKey].label}</span>
              <strong>{report.mood}</strong>
              <p>{report.thought}</p>
              <div><b style={{ width: report.confidence + "%" }} /><small>洞察可信度 {report.confidence}%</small></div>
            </article>
            <article>
              <span>今天的一步</span>
              <strong>{report.advice}</strong>
              <p>从 {report.sourceCount} 段对话收束而来 · 先行动，再继续判断。</p>
              <div><b style={{ width: "72%" }} /><small>行动清晰度 72%</small></div>
            </article>
          </div>

          <section className="style-library" aria-label="视觉风格库">
            <header><div><strong>视觉风格库</strong><p>点选会固定风格；选“随机”则每天变化。</p></div><span>保留 9 种 · 已移除 3 种</span></header>
            <div className="style-scroller">
              {WALLPAPER_STYLES.map(function (style) {
                return (
                  <button key={style.id} type="button" className={styleId === style.id ? "selected" : ""} aria-pressed={styleId === style.id} onClick={function () { chooseStyle(style); }}>
                    <img loading="lazy" src={style.thumb} alt={style.label + "壁纸缩略图"} />
                    <strong>{style.label}</strong>
                    <span>{style.note}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="evidence-line">
            <span>公开示例 · 未读取你的对话</span>
            <span>心理线索 {report.confidence}%</span>
            <span>AI 能力 {report.ability.level}{report.ability.score === null ? "" : " · " + report.ability.score}</span>
            <span>自动更新 {autoEnabled ? updateTime : "已暂停"}</span>
            {exportMeta ? <output data-testid="export-status" data-width={exportMeta.width} data-height={exportMeta.height} data-bytes={exportMeta.bytes}>已生成 {exportMeta.width} × {exportMeta.height} PNG · {(exportMeta.bytes / 1024 / 1024).toFixed(1)} MB</output> : null}
          </div>
        </section>
      </main>

      {guideOpen ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={function (event) { if (event.target === event.currentTarget) setGuideOpen(false); }}>
          <section className="guide-dialog" role="dialog" aria-modal="true" aria-labelledby="guide-title">
            <button className="dialog-close" type="button" aria-label="关闭使用指南" onClick={function () { setGuideOpen(false); }}>关闭</button>
            <span>无需复制粘贴对话</span>
            <h2 id="guide-title">让昨天的对话，自动成为今天的桌面。</h2>
            <ol><li>下载并安装 Daily AI Wallpaper Plugin。</li><li>在 Codex 中授权读取昨天的任务，可选附上人物照片。</li><li>Plugin 会先评估 AI 使用能力，再生成一张完整壁纸。</li><li>把成品导入本地生成器，预览、导出或更换 Mac 桌面。</li></ol>
            <p>公开网页不会读取你的 Codex 对话，也不会上传参考照片。首次更换桌面时，macOS 可能请求控制“系统事件”。预览与导出始终使用一张完整图片，不叠加第二层内容。</p>
          </section>
        </div>
      ) : null}

      <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

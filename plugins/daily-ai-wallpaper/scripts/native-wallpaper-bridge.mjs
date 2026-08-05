import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, promises as fs } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const STYLE_FILES = {
  "ink-future": "ink-future.png",
  "hand-painted": "hand-painted-pastoral.png",
  "pixel-rpg": "pixel-rpg.png",
  "art-nouveau": "art-nouveau-libra.png",
  "retro-handheld": "retro-handheld.png",
  miniature: "miniature-world.png",
  comic: "comic-storyboard.png",
  "retro-scifi": "retro-scifi.png",
  "picture-book": "healing-picture-book.png",
};

const SET_WALLPAPER_SCRIPT = `
on run argv
  set wallpaperPath to item 1 of argv
  set wallpaperFile to POSIX file wallpaperPath
  tell application "System Events"
    repeat with desktopItem in desktops
      set picture of desktopItem to wallpaperFile
    end repeat
    delay 0.2
    set confirmedPicture to picture of item 1 of desktops
  end tell
  return confirmedPicture as text
end run
`;

function wait(milliseconds) {
  return new Promise(function (resolve) { setTimeout(resolve, milliseconds); });
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function fetchRuntimePage(cacheKey) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:39761/daily-discovery-web/index.html?wallpaper=" + cacheKey + "&attempt=" + attempt, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      return { response, html: await response.text() };
    } catch (error) {
      lastError = error;
      await wait(450);
    }
  }
  throw lastError;
}

async function fetchRuntimeImage(cacheKey) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:39761/daily-discovery-web/../manual-wallpaper.png?wallpaper=" + cacheKey + "&attempt=" + attempt, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      return { response, buffer: Buffer.from(await response.arrayBuffer()) };
    } catch (error) {
      lastError = error;
      await wait(450);
    }
  }
  throw lastError;
}

async function ensureRuntimeServer() {
  try {
    const probe = await fetch("http://127.0.0.1:39761/daily-discovery-web/index.html?probe=" + Date.now(), {
      cache: "no-store",
      signal: AbortSignal.timeout(1200),
    });
    if (probe.ok) return;
  } catch (error) {
    // Start the already-installed local-only runtime below.
  }

  const userId = String(process.getuid());
  const serviceName = "gui/" + userId + "/ai.discovery.wallpaper.localserver";
  try {
    await execFileAsync("/bin/launchctl", ["kickstart", "-k", serviceName], { timeout: 5000 });
  } catch (error) {
    const plistPath = path.join(homedir(), "Library", "LaunchAgents", "ai.discovery.wallpaper.localserver.plist");
    try {
      await execFileAsync("/bin/launchctl", ["bootstrap", "gui/" + userId, plistPath], { timeout: 5000 });
    } catch (bootstrapError) {
      if (!String(bootstrapError.stderr || "").includes("already bootstrapped")) throw bootstrapError;
    }
    await execFileAsync("/bin/launchctl", ["kickstart", "-k", serviceName], { timeout: 5000 });
  }
  await wait(700);
}

async function installVisiblePlashWallpaper(wallpaperPath, styleId) {
  const runtimeRoot = path.join(homedir(), "Library", "Application Support", "AI Discovery Wallpaper");
  const pageDirectory = path.join(runtimeRoot, "daily-discovery-web");
  const runtimeImage = path.join(runtimeRoot, "manual-wallpaper.png");
  const runtimePage = path.join(pageDirectory, "index.html");
  const cacheKey = Date.now();
  const html = `<!doctype html>
<html lang="zh-CN" data-selected-style="${styleId}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>昨日之我 · ${styleId}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #201d1a; }
    img { display: block; width: 100%; height: 100%; object-fit: contain; object-position: center; }
  </style>
</head>
<body><img src="../manual-wallpaper.png?v=${cacheKey}" alt="" /></body>
</html>`;

  await fs.mkdir(pageDirectory, { recursive: true });
  const sourceBuffer = await fs.readFile(wallpaperPath);
  const sourceHash = sha256(sourceBuffer);
  await fs.copyFile(wallpaperPath, runtimeImage);
  await fs.writeFile(runtimePage, html, "utf8");

  const plashApp = "/Applications/Plash.app";
  const localServerPlist = path.join(homedir(), "Library", "LaunchAgents", "ai.discovery.wallpaper.localserver.plist");
  if (!existsSync(plashApp) || !existsSync(localServerPlist)) {
    const runtimeHash = sha256(await fs.readFile(runtimeImage));
    const bytesVerified = sourceHash === runtimeHash;
    return {
      runtimeImage,
      runtimePage,
      runtimeVerified: true,
      bytesVerified,
      sourceHash,
      visibleLayer: "System Events",
      plashSkipped: true,
    };
  }

  await ensureRuntimeServer();
  let served = await fetchRuntimePage(cacheKey);
  let response = served.response;
  let servedHtml = served.html;
  const runtimeVerified = response.ok && servedHtml.includes(`data-selected-style="${styleId}"`);
  if (!runtimeVerified) {
    const error = new Error("plash_runtime_not_confirmed");
    error.code = "plash_runtime_not_confirmed";
    throw error;
  }

  try {
    await execFileAsync("/usr/bin/killall", ["Plash"], { timeout: 5000 });
  } catch (error) {
    if (error.code !== 1) throw error;
  }
  await wait(900);
  await execFileAsync("/usr/bin/open", ["-a", plashApp], { timeout: 10000 });
  await wait(900);

  await ensureRuntimeServer();
  served = await fetchRuntimePage(cacheKey + 1);
  response = served.response;
  servedHtml = served.html;
  const postRestartVerified = response.ok && servedHtml.includes(`data-selected-style="${styleId}"`);
  if (!postRestartVerified) {
    const error = new Error("plash_runtime_not_confirmed");
    error.code = "plash_runtime_not_confirmed";
    throw error;
  }


  const servedImage = await fetchRuntimeImage(cacheKey + 2);
  const runtimeBuffer = await fs.readFile(runtimeImage);
  const runtimeHash = sha256(runtimeBuffer);
  const servedHash = sha256(servedImage.buffer);
  const bytesVerified = servedImage.response.ok && sourceHash === runtimeHash && sourceHash === servedHash;
  if (!bytesVerified) {
    const error = new Error("plash_bytes_not_confirmed");
    error.code = "plash_bytes_not_confirmed";
    throw error;
  }

  return { runtimeImage, runtimePage, runtimeVerified: postRestartVerified, bytesVerified, sourceHash, visibleLayer: "Plash" };
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function readBinaryBody(request) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    let length = 0;
    request.on("data", function (chunk) {
      length += chunk.length;
      if (length > 40 * 1024 * 1024) {
        reject(new Error("request_too_large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", function () {
      resolve(Buffer.concat(chunks));
    });
    request.on("error", reject);
  });
}

function isLoopbackRequest(request) {
  const address = request.socket && request.socket.remoteAddress;
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

export async function setMacWallpaperFromPath(wallpaperPath, styleId = "custom-import") {
  if (process.platform !== "darwin") {
    const error = new Error("unsupported_platform");
    error.code = "unsupported_platform";
    throw error;
  }

  if (!existsSync(wallpaperPath)) {
    const error = new Error("missing_wallpaper");
    error.code = "missing_wallpaper";
    throw error;
  }

  const visibleRuntime = await installVisiblePlashWallpaper(wallpaperPath, styleId);

  const result = await execFileAsync("/usr/bin/osascript", ["-e", SET_WALLPAPER_SCRIPT, visibleRuntime.runtimeImage], {
    timeout: 15000,
    maxBuffer: 1024 * 1024,
  });
  const confirmedPicture = String(result.stdout || "").trim();
  const systemVerified = confirmedPicture.includes("manual-wallpaper.png");
  if (!systemVerified) {
    const error = new Error("wallpaper_not_confirmed");
    error.code = "wallpaper_not_confirmed";
    throw error;
  }

  const verified = systemVerified && visibleRuntime.runtimeVerified && visibleRuntime.bytesVerified;

  return { styleId, filename: path.basename(wallpaperPath), wallpaperPath, confirmedPicture, systemVerified, verified, ...visibleRuntime };
}

export async function setMacWallpaper(projectRoot, styleId) {
  const filename = STYLE_FILES[styleId];
  if (!filename) {
    const error = new Error("unknown_style");
    error.code = "unknown_style";
    throw error;
  }
  return setMacWallpaperFromPath(path.resolve(projectRoot, "src", "assets", "styles", filename), styleId);
}

export function nativeWallpaperBridge(projectRoot) {
  return {
    name: "native-wallpaper-bridge",
    configureServer(server) {
      server.middlewares.use(async function (request, response, next) {
        const requestUrl = new URL(request.url || "/", "http://localhost");
        if (requestUrl.pathname === "/api/native-status") {
          if (!isLoopbackRequest(request)) {
            sendJson(response, 403, { ok: false, code: "local_only" });
            return;
          }
          sendJson(response, 200, { ok: true, platform: process.platform, supportsCustomWallpaper: true });
          return;
        }
        if (requestUrl.pathname !== "/api/set-wallpaper") {
          next();
          return;
        }
        if (request.method !== "POST") {
          sendJson(response, 405, { ok: false, code: "method_not_allowed", message: "这里只接受桌面更换请求。" });
          return;
        }
        if (!isLoopbackRequest(request)) {
          sendJson(response, 403, { ok: false, code: "local_only", message: "桌面更换只能从这台 Mac 本机发起。" });
          return;
        }

        try {
          if (request.headers["content-type"] !== "image/png") {
            sendJson(response, 415, { ok: false, code: "image_required", message: "请发送完整 PNG 壁纸。" });
            return;
          }
          const imageBuffer = await readBinaryBody(request);
          if (imageBuffer.length < 1024 || imageBuffer.subarray(1, 4).toString("ascii") !== "PNG") {
            sendJson(response, 400, { ok: false, code: "invalid_png", message: "没有收到有效的 PNG 壁纸。" });
            return;
          }
          const runtimeRoot = path.join(homedir(), "Library", "Application Support", "AI Discovery Wallpaper");
          await fs.mkdir(runtimeRoot, { recursive: true });
          const incomingPath = path.join(runtimeRoot, "incoming-wallpaper.png");
          await fs.writeFile(incomingPath, imageBuffer);
          const styleId = requestUrl.searchParams.get("styleId") || "custom-import";
          const result = await setMacWallpaperFromPath(incomingPath, styleId);
          sendJson(response, 200, { ok: true, ...result });
        } catch (error) {
          console.error("[wallpaper-bridge]", error);
          const knownCode = error.code || error.message;
          const statusCode = knownCode === "unknown_style" || knownCode === "invalid_png" || knownCode === "request_too_large" ? 400 : 500;
          const message = knownCode === "unsupported_platform"
            ? "当前电脑不是 Mac，暂时不能直接更换系统桌面。"
            : knownCode === "unknown_style" || knownCode === "missing_wallpaper"
              ? "没有找到这张壁纸原图。"
              : knownCode === "plash_runtime_not_confirmed" || knownCode === "plash_bytes_not_confirmed"
                ? "系统壁纸已更新，但动态桌面层没有刷新。"
                : "Mac 没有完成桌面更换，请允许 Codex 控制“系统事件”后再试。";
          sendJson(response, statusCode, { ok: false, code: knownCode, message });
        }
      });
    },
  };
}

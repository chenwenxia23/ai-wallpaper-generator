#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { setMacWallpaperFromPath } from "./native-wallpaper-bridge.mjs";

const source = process.argv[2];
if (!source) {
  console.error("Usage: node apply-wallpaper.mjs /absolute/path/to/wallpaper.png [style-id]");
  process.exit(2);
}

const wallpaperPath = path.resolve(source);
if (!existsSync(wallpaperPath)) {
  console.error("Wallpaper file not found: " + wallpaperPath);
  process.exit(2);
}

try {
  const result = await setMacWallpaperFromPath(wallpaperPath, process.argv[3] || "daily-ai-wallpaper");
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, code: error.code || "apply_failed", message: error.message }, null, 2));
  process.exit(1);
}

import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildGenerationPrompt,
  previousShanghaiDate,
  readPngDimensions,
} from "../scripts/wallpaper-generation-runner.mjs";

test("uses the previous calendar day in Asia/Shanghai", () => {
  assert.equal(previousShanghaiDate(new Date("2026-08-05T01:00:00.000Z")), "2026-08-04");
  assert.equal(previousShanghaiDate(new Date("2026-08-04T16:30:00.000Z")), "2026-08-04");
});

test("manual generation prompt requires a new image and deterministic verification", () => {
  const prompt = buildGenerationPrompt({
    workspaceRoot: "/workspace",
    projectRoot: "/workspace/site",
    runDirectory: "/workspace/daily-wallpapers/run",
    wallpaperPath: "/workspace/daily-wallpapers/run/wallpaper.png",
    reportPath: "/workspace/daily-wallpapers/run/report.json",
    resultPath: "/workspace/daily-wallpapers/run/result.txt",
    sourceDate: "2026-08-04",
    portraitPath: "",
    options: {
      zodiac: "天秤座",
      stylePreference: "random",
      layoutPreference: "random",
      currentStyleId: "pixel-rpg",
      currentLayoutId: "mental",
    },
  });

  assert.match(prompt, /不要使用网站当前预览图/);
  assert.match(prompt, /不要选择当前正在浏览的 像素 RPG/);
  assert.match(prompt, /2880 × 1800/);
  assert.match(prompt, /三个桌面组件必须是：今日黄历、天秤座、AI 使用能力/);
  assert.match(prompt, /不要在本任务内更换桌面/);
});

test("reads real PNG dimensions from the IHDR header", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "wallpaper-runner-test-"));
  const imagePath = path.join(directory, "wallpaper.png");
  const header = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(header, 0);
  header.writeUInt32BE(13, 8);
  header.write("IHDR", 12, "ascii");
  header.writeUInt32BE(2880, 16);
  header.writeUInt32BE(1800, 20);
  await writeFile(imagePath, header);

  assert.deepEqual(await readPngDimensions(imagePath), { width: 2880, height: 1800 });
});

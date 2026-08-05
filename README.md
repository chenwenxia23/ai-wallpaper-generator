# Daily AI Wallpaper · 昨日之我

把你昨天授权给 Codex 的任务复盘成一张今天一眼能懂的桌面壁纸：你在做什么、可能处于什么状态、今天最值得做的一步，以及黄历、星座和有证据的 AI 使用能力。

GitHub 仓库：https://github.com/chenwenxia23/ai-wallpaper-generator

网站预览（当前仅仓库所有者可访问）：https://daily-ai-wallpaper-yesterday.bright-yak-1650.chatgpt.site

![Daily AI Wallpaper website](plugins/daily-ai-wallpaper/assets/website.png)

## 它包含什么

- `generate-daily-ai-wallpaper`：整理昨日任务、提炼心理线索、选择布局与视觉风格、生成并检查完整壁纸。
- `assess-ai-work-capability`：基于真实任务证据计算 0–100 分、L1–L5 等级和可信度；证据不足时显示“待评估”。
- 九种视觉风格：水墨未来、手绘动画、像素 RPG、新艺术星象、复古掌机、微缩世界、漫画分镜、复古科幻、疗愈绘本。
- 两种壁纸逻辑：精神天气、昨日 → 今日；逻辑与风格可以分别随机或固定。
- 可选人物照片：在 Codex 任务中附上参考照片；公开网页的照片选择只在本机预览，不会上传。
- Mac 桌面助手：手动按钮会先读取昨日授权任务、生成一张全新 PNG、检查尺寸与组件，再同时更新系统壁纸和 Plash 可见层并核对最终图片字节；不会把当前预览直接设为桌面。
- 每日自动化：由 Codex Automation 负责可靠触发，每天 Asia/Shanghai 09:00 执行；网页关闭时仍会运行，不依赖浏览器计时器。

## 最快使用方式

1. 在最新 Release 中下载 `daily-ai-wallpaper-plugin.zip` 并解压。
2. 进入解压出的 `daily-ai-wallpaper-kit`，运行 `./scripts/install-plugin.sh`。
3. 新建一个 Codex 任务并说：`使用 $generate-daily-ai-wallpaper，根据我昨天授权的对话生成今天的桌面壁纸。`
4. 如果希望画面更像自己，在同一任务中附上照片。
5. Mac 用户在本地启动网站后，点击“生成并更换新壁纸”。网页会显示「读取昨日对话 → 复盘 → 生成新图 → 检查 → 更换桌面」的真实进度；可选人物参考图也只发送给这台 Mac 上的本机流程。

第一次更换 Mac 桌面时，系统可能请求允许控制“系统事件”。拒绝权限不会影响壁纸生成和导出。

## 运行网站

如果还要运行或修改网站，请下载完整仓库源码，而不是只下载 Plugin 安装包。

```bash
npm install
npm run dev
```

打开终端显示的本地地址。公开部署版可以预览九种示例风格、导入成品和导出 2880 × 1800 PNG，但浏览器本身不能读取 Codex 对话或直接修改操作系统壁纸；“生成并更换新壁纸”只会在安装 Plugin 且本机生成器已连接时启用真实流程。

## 完整链路

```text
授权昨日任务
  → AI 使用能力证据评估
  → 精神状态与下一步提炼
  → 选择布局、风格和可选人物参考
  → 生成一张完整壁纸
  → 检查文字、组件、尺寸和重复图层
  → 导出 PNG
  → 本地助手更换 Mac 系统壁纸和 Plash 可见层
```

## 重要边界

- 不上传、提交或发布任何人的原始对话、照片、凭证和个人报告。
- 本机生成器不会把含原始对话的调试日志写入成品目录；只保留最终 PNG、结构化复盘报告和简短执行结果。
- 黄历与星座没有可靠实时来源时必须标为示例或待同步。
- 心理活动只是基于当天对话的温和推测，不是诊断。
- Windows 和 Linux 目前可以生成、预览、导出壁纸，但系统桌面助手尚未实现。
- 网站内置图片是匿名化视觉示例，不应被当作访问者的真实复盘或 AI 能力分数。

隐私细节见 [PRIVACY.md](PRIVACY.md)。

## 验证

```bash
npm run build
npm run test:sites
python3 /path/to/skill-creator/scripts/quick_validate.py plugins/daily-ai-wallpaper/skills/generate-daily-ai-wallpaper
python3 /path/to/skill-creator/scripts/quick_validate.py plugins/daily-ai-wallpaper/skills/assess-ai-work-capability
```

## License

MIT

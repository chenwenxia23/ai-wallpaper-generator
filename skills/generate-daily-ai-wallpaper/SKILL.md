---
name: generate-daily-ai-wallpaper
description: Turn a user's previous-day AI conversations into a personalized 16:10 desktop wallpaper that summarizes what they did, reflects their likely mental state without diagnosing it, gives one useful next action, and presents almanac, zodiac, and verified AI-ability information as separate desktop widgets. Use when a user asks to generate, redesign, batch-create, export, or build a reusable website workflow for daily AI reflection wallpapers, especially when they are unsure which visual direction fits.
---

# Generate Daily AI Wallpaper

Create a finished, readable wallpaper rather than a loose concept. Keep the user's real conversation evidence, exact text, visual style, widget data, export, and QA in one workflow.

## Required inputs

Collect or infer these inputs:

- Previous-day conversation transcript or an authorized summary.
- Wallpaper date and desktop ratio. Default to 2880 × 1800 (16:10).
- Zodiac sign. Ask only when it cannot be inferred safely.
- AI-ability evidence. Use a verified score when supplied; otherwise show `待评估` instead of inventing a level.
- Optional portrait/reference image. Never invent a recognizable likeness without a reference.

Treat the transcript as private. Do not upload or transmit it outside the user-authorized workflow.
Never reuse the plugin author's sample review, zodiac, score, portrait, or wallpaper as another user's personal result.

## Workflow

### 1. Extract the actual day

When Codex task history is available and the user authorized it, select the user's own previous-calendar-day substantive tasks in their local timezone. Merge continued turns into one task and ignore ambient UI state, system injections, credentials, unrelated private details, and example content bundled with this plugin. If task history is unavailable, say so and accept an authorized summary; never claim automatic sync succeeded when it did not.

Identify:

- What the person was doing.
- The strongest unresolved tension or repeated thought.
- What they were trying to protect, prove, decide, or finish.
- One next action that reduces uncertainty today.
- The evidence supporting each conclusion.

Frame psychological language as a gentle inference, never as a diagnosis or stable personality claim.

### 2. Write the compact copy

Read [copy-and-data.md](references/copy-and-data.md). Produce the headline, summary, inner loop, advice, almanac, zodiac, and AI-ability fields before generating art.

Prefer the shortest version that still feels specific. Reject generic encouragement such as “加油”“相信自己” unless the conversation directly supports it.

### 3. Choose layout logic independently from style

Keep both layout modes available:

- `精神天气`: Make the current internal state the visual center, then give one action.
- `昨日 → 今日`: Show a clear transition from yesterday's friction to today's path.

When the user is unsure, create three to six meaningfully different complete options. Vary the visual metaphor and style, not only the color. Keep previously approved options and add new ones; do not silently replace working directions.

Read [style-library.md](references/style-library.md) before choosing or generating a style. Exclude dreamcore surrealism unless the user explicitly asks for it again.

### 4. Choose one complete-wallpaper pipeline

Before rendering, identify which input you have:

- `Complete wallpaper`: an approved image already contains the final composition, exact copy, and desktop widgets. Treat it as indivisible. Preview and export it as-is. Never add a second text layer, mask, gradient, or duplicate widget on top.
- `Art-only background`: an illustration intentionally leaves safe zones and contains no interface text. Render the headline and three widgets once in code, canvas, or another exact-typesetting layer.

When generating a new art-only background, ask ImageGen to omit visible interface text when exact Chinese copy matters. This prevents wrong characters and gives the typesetting layer a clean source. After the final wallpaper has been approved as complete, stop adding layers to it.

Read [prompt-template.md](references/prompt-template.md) when creating the visual or when the user asks for the reusable prompt.

### 5. Build the three widgets

Render these as distinct desktop components, not a footer sentence:

- 今日黄历.
- Zodiac reading.
- AI 使用能力.

Before writing the AI widget, invoke the installed `$assess-ai-work-capability` skill on the user's authorized evidence. Use its deterministic score, level, confidence, and evidence limits. If the sample is insufficient or the skill cannot run, show `待评估`; do not copy a demo score or estimate from writing style.

Use current, sourced almanac or horoscope information when a live source is available. If it is not verified, visibly label the value as a sample or pending sync. Never present invented live data as fact.

### 6. Export and verify

Export a real 2880 × 1800 PNG unless the user requests another size. Open the actual output and check:

- The image represents the person's state, not only their task list.
- The headline is concise and the advice is actionable.
- No required widget is missing.
- All Chinese text is exact and understandable.
- Desktop icons still have a breathing/safe area.
- No accidental blank zone, crop, duplicate text, placeholder, or illegible overlay remains.
- A complete approved source image has exactly one visual layer in preview and export.
- The exported pixel dimensions and file size are real.
- Website generation, editing, style selection, fullscreen, and export work end to end when a website is in scope.

When the product promises to change the operating-system wallpaper:

- A browser preview change is not completion.
- Use an authorized local/native helper for macOS, Windows, or Linux; a hosted webpage alone cannot change the system wallpaper.
- Make the action result visible as `系统桌面已更换`, `仅更新网页预览`, or a specific failure message.
- Detect whether a wallpaper app or desktop web layer such as Plash is covering the system picture. If so, update and reload that visible layer as well as the system fallback picture; do not stop after changing the hidden layer underneath it.
- Read the operating system's current wallpaper after the action and confirm that its path or identifier matches the selected output. When another visible desktop layer is active, also verify that layer serves the selected file and that the served bytes match the source.
- If native permission or the helper is unavailable, keep export working and state the boundary instead of claiming success.

Fix any failure before handoff.

### 7. Optional portrait and daily automation

- When the user attaches a portrait, treat it only as a visual reference for that user's wallpaper. Preserve recognizable features without inferring sensitive attributes. Do not store the portrait in the plugin or repository.
- When no portrait is attached, use a non-identifying figure, symbolic scene, or environment; do not invent a recognizable likeness.
- When the user asks for daily automatic generation, use the available Codex automation mechanism and default to `09:00` in the user's local timezone. The scheduled run must read the previous calendar day's authorized tasks, run the ability assessment, generate and verify the wallpaper, then call the authorized local desktop helper when one is installed.
- A timer inside an open webpage is only a preview convenience. Do not describe it as reliable daily automation when the browser or computer may be closed.
- Save the final PNG to a user-visible path and report that path. If the local generator is available, import the same PNG and verify the bytes used by the visible desktop layer match the final source.

## Completion report

Always state:

1. What was completed.
2. What evidence proves it works.
3. What remains unverified or unfinished.

If live almanac, horoscope, conversation sync, wallpaper replacement, or AI-ability scoring is not connected, say so explicitly. Never use a changed browser preview as evidence that wallpaper replacement is connected.

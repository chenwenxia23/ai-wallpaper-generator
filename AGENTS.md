# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

## Confirmed wallpaper decisions

- Preserve both selected wallpaper logics as first-class modes: an immersive mental-weather portrait and a left-to-right yesterday-to-today transition.
- Treat layout logic and visual style as independent choices so either retained logic can use future approved style systems.
- Present 黄历、天秤座、AI 使用能力 as distinct desktop-widget components, not as a small footer line.
- When the user is unsure about visual direction, generate several meaningfully different complete visual options for selection before implementation.
- Keep copy concise, prioritize the user's mental state over generic work activity, and preserve all previously working generation, editing, theme, fullscreen, and export capabilities.
- Keep the approved original hand-painted Japanese pastoral-fantasy style and premium 32-bit pixel-RPG style in the wallpaper style library while continuing to explore additional visual systems.
- Keep the nine approved styles in the active library: ink future, hand-painted pastoral animation, pixel RPG, Art Nouveau zodiac, retro-handheld hardware UI, handcrafted miniature world, editorial comic storyboard, retro science fiction, and healing picture book.
- Remove cinematic mental-weather, tactile transition, and paper/collage from the active library unless the user explicitly opts back in.
- Exclude dreamcore surrealism from the approved style library unless the user explicitly requests it again.
- Obtain the authorized previous-day conversation review automatically; do not require the user to upload, paste, or re-enter it.
- Let wallpaper logic and visual style be independently random or fixed. Keep manual update and a configurable daily automatic update, defaulting to 09:00.
- Treat each approved generated wallpaper as one complete visual. Preview and export the original image as-is; never add a second text layer, mask, gradient, or duplicate widget over it. Put source status, schedule, and random-mode explanations outside the wallpaper frame.
- When exact copy or theme editing is offered, apply it before regenerating a new complete wallpaper. Do not simulate editing by overlaying website UI on an already complete wallpaper.
- A control labeled “更换桌面” must call the local macOS wallpaper bridge, update both the system fallback picture and the active Plash desktop layer, then verify the Plash-served file matches the selected source. Updating React state, the browser preview, or only the hidden system picture is not success. If the native bridge is unavailable, say “仅更新网页预览” and show the reason.
- A hosted browser-only site cannot directly change a visitor's operating-system wallpaper. Keep native replacement in the local helper/Skill path and never claim that a public web deployment has completed it without a verified native companion.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

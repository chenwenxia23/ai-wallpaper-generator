# Prompt templates

## Analysis prompt

Use this before image generation:

```text
Analyze the authorized previous-day conversation below and return structured JSON only.

Goals:
1. Summarize what the person was actually doing.
2. Infer the strongest repeated thought or unresolved tension, using gentle language and no diagnosis.
3. Give one action for today that reduces uncertainty.
4. Produce concise one-glance wallpaper copy.

Required fields:
headline, summary, inner_loop, advice, mood, focus, source_count, insight_confidence, evidence_notes.

Length limits:
headline 4–12 Chinese characters; summary 12–30; inner_loop 18–42; advice 8–24; mood 4–12; focus 2–6.

Reject generic encouragement. Every conclusion must be supported by a conversation signal. Keep evidence_notes private and off the wallpaper.

Conversation:
{{conversation}}
```

## Background-art prompt

Use this after the copy is approved:

```text
Create a finished 16:10 desktop-wallpaper background illustration at 2880×1800 composition intent.

Layout logic: {{mental_weather_or_yesterday_to_today}}
Visual style: {{approved_style}}
Mental-state metaphor: {{visual_metaphor}}
Subject/reference: {{portrait_or_subject_reference}}
Palette: {{palette}}

Represent this state visually: {{mood_and_inner_loop}}
Show movement toward this action: {{advice}}

Composition requirements:
- Preserve an intentional text safe zone on the left 42–48% and a lower safe band for three desktop widgets.
- Keep the main subject and visual metaphor outside those safe zones.
- Leave useful breathing room for desktop icons.
- No visible Chinese copy, fake UI text, logos, watermarks, or placeholder widgets in the raster artwork.
- No accidental empty zone; every quiet area must support readability or desktop use.
- No extra people unless requested.
- Do not use dreamcore surrealism.

The exact headline and widgets will be typeset later in code.
```

## Exact composition prompt

Use this for the code/canvas layer:

```text
Compose the approved background art into a 2880×1800 PNG.
Typeset the supplied Chinese copy exactly; do not rewrite it.
Add three separate desktop widgets: 今日黄历, {{zodiac_sign}}, AI 使用能力.
Keep all text readable at 50% display scale, preserve icon breathing space, and export a real PNG.
Open the export and verify dimensions, copy, crop, safe zones, and widget completeness before delivery.
```

## One-shot quick prompt

Use this only when a full skill workflow is unavailable:

```text
Turn my authorized previous-day AI conversation into a personalized 2880×1800 desktop wallpaper. First extract what I did, my likely repeated thought, and one useful action for today. Keep the copy concise and non-diagnostic. Let me choose between 精神天气 and 昨日→今日, then offer 3 meaningfully different approved visual styles. Exclude dreamcore surrealism. Generate the art without visible Chinese UI text, then typeset the exact headline and three separate widgets—今日黄历, my zodiac, and verified AI 使用能力—in an exact composition layer. Do not invent live almanac, horoscope, or ability data; label unavailable values as sample, pending, or 待评估. Export a real 2880×1800 PNG and visually check text, crop, safe zones, widgets, and end-to-end export before handing it over.

Conversation:
{{conversation}}
```

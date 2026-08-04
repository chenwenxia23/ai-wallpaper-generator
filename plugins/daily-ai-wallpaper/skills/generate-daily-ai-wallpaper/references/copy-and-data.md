# Copy and data contract

## Wallpaper copy

Return these fields before generating art:

| Field | Purpose | Target length |
| --- | --- | --- |
| `headline` | One-line mental-state conclusion | 4–12 Chinese characters |
| `summary` | Explain what is really happening | 12–30 Chinese characters |
| `inner_loop` | The repeated thought or unresolved question | 18–42 Chinese characters |
| `advice` | One action for today | 8–24 Chinese characters |
| `mood` | A compact state label | 4–12 Chinese characters |
| `focus` | Today's single focus | 2–6 Chinese characters |

Use one specific action. Prefer “今天只做一次真实复测” over “继续努力并保持耐心”.

## Evidence fields

- `source_count`: Number of conversation segments analyzed.
- `insight_confidence`: 0–100. Lower it when evidence is thin or contradictory.
- `evidence_notes`: Short private notes connecting each conclusion to transcript signals. Do not place these notes on the wallpaper.

## Desktop widgets

### 今日黄历

- `lunar_date`
- `recommended_action`
- `avoid_action`
- `source_status`: `verified`, `sample`, or `pending`

### Zodiac

- `sign`
- `signal`
- `advice`
- `source_status`

### AI 使用能力

- `level`: L1–L5 or `待评估`
- `score`: 0–100 only when evidence exists
- `confidence`
- `evidence_window`
- `change_note`

Do not infer AI ability from one conversation when the user has not asked for an assessment. Use the most recent authorized, evidence-backed result or show `待评估`.

## Tone rules

- Be clear, calm, and specific.
- Reflect the user's state without pathologizing it.
- Avoid fortune-telling certainty.
- Avoid generic slogans, corporate language, and long paragraphs.
- Write for one-glance desktop reading.

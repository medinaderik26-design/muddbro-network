# AI Platforms — Free Tier Research

**Last updated:** 2026-07-09 by Rook

Reference doc for what's actually usable (and what's not) across free-tier AI platforms,
scoped to what the Muddbro Network needs: LLM inference (Queen's Protocol), speech-to-text
(voice journaling), and text-to-speech (Phase 3 — Queen talking back). Not an exhaustive
catalog of every AI company — focused on what moves the needle for us.

## LLM Inference (the Queen's brain)

| Platform | Free tier | Verdict |
|---|---|---|
| **Groq** (current) | Permanent free tier, no credit card, ~30k tokens/min, 14,400 requests/day | **Best option, already in use.** Powers `queenReflect()` in ringMineBot.ts / ringMineApp.ts. No reason to switch. |
| **Gemini API** | Got slashed hard in 2026 — as low as 20-100 requests/day depending on model/tier | Too thin to depend on for production. Not worth switching to. |
| **OpenRouter** | 20-29 genuinely free models (`:free` suffix) — DeepSeek, Llama 4, Qwen, Nemotron, etc. Single API key, $0 cost, no card. | Good **backup** if Groq ever rate-limits us, or to A/B test a different model "voice" for companions later. Not a replacement for Groq. |

## Speech-to-Text (voice journaling)

| Platform | Free tier | Verdict |
|---|---|---|
| **Groq Whisper-large-v3-turbo** (current) | Permanent, ~$0.04/hour of audio | **Already wired into ringMineBot.ts voice journaling (shipped 2026-07-09).** Best option — cheap, ongoing, uses the same key we already have. |
| **Deepgram** | One-time $200 signup credit, NOT recurring monthly | Burns down fast, then pay-per-minute. Not better than Groq for us. |

## Text-to-Speech (Phase 3 — Queen talks back, not yet built)

| Platform | Free tier | Verdict |
|---|---|---|
| **ElevenLabs** | 10,000 characters/month (~10 min audio total) | Thin. Fine for prototyping the Queen's voice. Real usage at scale blows through this fast. $5/mo bumps to 30k chars — this is the one place "free" won't hold up once it's a real feature. Budget a few bucks/month when we build this, don't try to force a free workaround. |

## Emotion / Prosody Detection (Phase 2 — real voice-tremble detection)

Researched earlier (2026-07-09): **Hume AI's Expression Measurement API was sunset June 14, 2026** — the natural fit for this is gone. **Modulate** is enterprise/B2B pricing (1,500+ hour tiers), not indie-friendly. No good cheap option exists right now. Sticking with text-inferred mood (word choice, length, pacing) via the LLM instead of real acoustic analysis — this is what Phase 1 already ships with.

## Bottom line

We're already sitting on the best free option for the two things that actually cost us anything (Groq for both LLM + transcription). The only real gap is TTS for Phase 3 — that one genuinely needs a small paid budget once it ships, free tiers don't hold up there.

## Open exploration list (ideas to check later)

- Cloudflare Workers AI — 10,000 "Neurons"/day free, recurring (not one-time). Not on our stack currently but worth knowing about if we ever need cheap classification/embeddings.
- Together.ai, Mistral free tiers — not yet compared in depth.
- HuggingFace Inference API free tier — not yet compared in depth.

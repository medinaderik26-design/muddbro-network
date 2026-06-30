# Ring Mine — Mini App

## Project Structure

```
ringmine/
├── index.html          ← Shell: HTML structure only, no logic
├── style.css           ← All visual styles
├── script.js           ← Main entry: wires all modules, game loop
├── queen-protocol.js   ← AI engine: Groq API, bond-based personality
├── game-data.js        ← Static data: realms, enemies, gear, LP, milestones
├── quests/
│   └── quest-01.js     ← Realm 1 quest chain (combat + journal + encounter)
├── systems/
│   ├── save.js         ← LocalStorage persistence
│   ├── ui.js           ← DOM rendering, navigation, FX, toasts, modals
│   └── telegram.js     ← All Telegram WebApp API calls
├── assets/
│   ├── images/         ← Character art, enemy art
│   ├── icons/          ← Nav icons, UI icons
│   └── sounds/         ← Optional tap / victory sounds
└── README.md           ← This file
```

## Architecture

- **No framework** — vanilla JS ES modules for zero-dependency performance in Telegram WebView
- **Separation of concerns** — each file has exactly one job
- **State lives in save.js** — single source of truth via localStorage
- **AI calls in queen-protocol.js** — all Groq/LLM calls isolated and mockable
- **Telegram API in telegram.js** — swap for browser shim to develop locally

## Key Systems

### Bond System (0–100)
The central progression mechanic. Bond increases from:
- Journal entries (+5 per entry)
- Combat victories (+3)
- Forming LP pacts (+5)
- Tapping milestones (every 50 taps, +1)

At levels 25/50/75/100, cinematic video milestones unlock.

### Queen's Protocol
Bond tier determines Queen's personality depth:
- **dormant (0–24)**: Short, mysterious
- **emerging (25–49)**: Warmer, curious, notices patterns  
- **awakened (50–74)**: Deep intimacy, challenges gently
- **sovereign (75–100)**: Full Sacred Script register

### Economy
- `ore`: mined per tap, earned in combat, passive over time
- `mudd`: display only (ore ÷ 1000), redeemable on-chain via `/claim`
- Exchange rate: 1000 MuddOre = 1 MUDD Jetton

## Deployment

Hosted via Base44 backend function `ringMineBot`:
```
https://superagent-ec909dfa.base44.app/functions/ringMineBot
```

Telegram bot: @RingMineBot
Bot token env var: `TELEGRAM_BOT_TOKEN_2`

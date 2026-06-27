# 🌑 Inner Earth: Rise of the Ancients
### Telegram Game Bot — Phase 1

A mythical inner-earth Web3 game built on Telegram + TON blockchain.

---

## Setup

### 1. Install dependencies
```bash
cd innerearth_game
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your bot token and AI settings
```

### 3. Run the bot
```bash
python bot.py
```

---

## Architecture

| File | Purpose |
|------|---------|
| `bot.py` | Main Telegram bot — all handlers, menus, game flow |
| `database.py` | SQLite DB layer — players, mining, inventory, quests |
| `queens_protocol.py` | AI quest engine — connects to OpenAI or local LLM |
| `mining.py` | Idle mining system — minerals, equipment, LP pact bonuses |

---

## Game Systems (Phase 1)

### 🌍 World
- Explore Inner Earth with choice-based events
- Multiple dimensions to unlock
- XP progression system

### 👑 Queen's Protocol
- AI-generated quests based on player decisions
- Queen bond system (0–100)
- Conversational AI interaction

### 🧙 Little People
- Trust system (0–100)
- Gift & learning interactions
- Pact formation at Trust 20+

### ⛏️ Mining
- Idle mining sessions (4/8/12 hours)
- Mineral yields based on equipment + LP trust
- Multiple mineral types per dimension
- TON wallet connection for redemption

---

## Roadmap

- **Phase 2:** TON blockchain integration, real payouts, more equipment
- **Phase 3:** AI-generated images per scene, enchanted item crafting
- **Phase 4:** Hypercube companion app (Telegram Mini App)

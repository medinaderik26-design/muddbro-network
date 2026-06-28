# 🌀 Ring Mine
### Creative Growth Game — Muddbro Network

A personal growth Telegram game powered by the Queen's Protocol AI.
Part of the Muddbro Network alongside Inner Earth and Hypercube.

---

## Setup

```bash
cd ringmine_game
pip install -r requirements.txt
cp .env.example .env
# Fill in your Ring Mine bot token and AI settings
python bot.py
```

---

## Architecture

| File | Purpose |
|------|---------|
| `bot.py` | Main bot — all handlers, menus, game flow |
| `database.py` | SQLite — players, journals, submissions, challenges, NFTs |
| `queens_protocol.py` | AI engine — reflection, creative review, puzzle gen, sponsored quests |
| `growth.py` | Progression — tiers, streaks, XP, NFT drop rolls |

---

## Game Systems

### 📔 Journaling
- Daily entries → Queen reflects back insights
- Streak bonuses + mood tracking
- XP and MUDD rewards scale with depth and consistency

### 🎨 Creative Submissions
- Writing, art, music, ideas
- Queen reviews every submission with real feedback
- Earn MUDD + NFT fragments for quality work

### 🧩 Puzzles
- AI-generated riddles personal to each player's story
- Queen creates them based on your growth stage

### 🏆 Challenges
- Organic and sponsored challenges
- Brands can fund creative briefs; players earn MUDD for submissions

### 📈 Growth Tiers
Seedling → Sprout → Root → Branch → Canopy → Ancient → Mythic

### 💎 NFT Fragments
- Earned through journaling, creating, and challenges
- Cross-game: usable in Inner Earth and Hypercube

### 💰 Muddcoin (MUDD)
- Earned across all game activities
- Interchangeable across the Muddbro Network (TON blockchain)

---

## Muddbro Network
Ring Mine is one of three products:
1. **Inner Earth** — adventure mining game (Telegram)
2. **Ring Mine** — creative growth game (Telegram)
3. **Hypercube** — AI storyteller app (Play Store)

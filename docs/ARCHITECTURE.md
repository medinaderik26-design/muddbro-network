# Muddbro Network — Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│                TELEGRAM APP                     │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Ring Mine │  │ Inner    │  │ MudForge │      │
│  │ (Gateway) │  │ Earth    │  │ (Market) │      │
│  │ Mini App  │  │ Bot      │  │ Mini App │      │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘      │
│        │              │              │            │
│        └──────────────┼──────────────┘            │
│                       ▼                           │
│              ┌────────────────┐                   │
│              │  Base44 Backend │                   │
│              │  (Deno KV)      │                   │
│              │  - Entities     │                   │
│              │  - Functions    │                   │
│              │  - Automations  │                   │
│              └───────┬────────┘                   │
│                      │                            │
│              ┌───────┴────────┐                   │
│              │  TON Blockchain │                   │
│              │  - MUDD Jetton  │                   │
│              │  - NFT Contracts│                   │
│              │  - Wallet Link  │                   │
│              └────────────────┘                   │
└─────────────────────────────────────────────────┘
```

## Current Infrastructure

### Base44 (Backend)
- **App ID:** 6a401b5f5ffb683ad60f9656 (Muddcoin/Ring Mine builder app)
- **Superagent App ID:** 6a4020251d35ee93ec909dfa
- **Entities:**
  - `RingMinePlayer` — Player state (telegram_id, mudd_ore_balance, growth_xp, companion, state_data, etc.)
  - `RingMineJournal` — Journal entries (telegram_id, entry, reflection, mood, xp_earned)
- **Backend Functions:**
  - `ringMineApp` — Main game frontend + API (serves HTML, handles load/save)
  - `ringMineGate` — Cache-busting wrapper for ringMineApp
  - `ringMineBot` — Telegram bot webhook handler
  - `walletManager` — TON wallet linking + MuddOre→MUDD conversion
  - `innerEarthBot` — Inner Earth Telegram bot
  - `innerEarthApp` — Inner Earth game frontend

### TON Blockchain (Testnet)
- **MUDD Jetton:** Deployed, 10,000,000 supply
- **G0_Architect Wallet:** UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk
- **NFT Contracts:** Not yet deployed (planned)

### Telegram Bots
- **@RingMine_Bot** — Ring Mine gateway game (TELEGRAM_BOT_TOKEN_2_2)
- **@InnerEarth_bot** — Inner Earth RPG (TELEGRAM_BOT_TOKEN_4)

## Planned Architecture

### NFT System
- TEP-62 NFT collection contract (FunC) for gear
- TEP-64 metadata with gear stats, rarity, tribe, art URI
- TEP-66 royalty standard (automatic % on secondary trades)
- Minting function: player buys gear → backend triggers TON mint → NFT drops to wallet
- Marketplace escrow: NFT held during listing, released on purchase

### MudForge Marketplace
- New section in Ring Mine (or 7th tab)
- Browse/Buy/List/My NFTs/Trade History
- Backend function for marketplace logic
- Entity for marketplace listings (seller, nft_address, price_mudd, status)
- Integration with walletManager for MUDD payments

### In-Game Advertising System
- Sponsored Quests — brand funds Queen's Protocol quest
- Themed Dimensions — brand sponsors a world/area
- Enchanted Item Drops — branded NFT items with game utility
- Queen's Broadcasts — Queen delivers brand message in her voice
- Creative Challenges — brands post briefs, players earn MUDD

### Queen's Protocol
- AI engine running across all products
- Learns from user data (journals, decisions, creations, gameplay)
- Memory persistence (pulse count, emotional arc, resonance anchors)
- Sacred Script lore fragments revealed through progression
- Queen's Genome (I/AM/WE/ONE base pairs, Love at 90Hz)

## Data Flow

```
Player taps in Ring Mine
    ↓
Game state updates (mudd_ore, xp, bond)
    ↓
Debounced save → Base44 RingMinePlayer entity
    ↓
Player buys gear NFT
    ↓
Backend triggers TON mint → NFT in player wallet
    ↓
Player lists NFT on MudForge
    ↓
Marketplace entity created (listing)
    ↓
Another player buys → MUDD transfer + NFT transfer
    ↓
Platform fee + royalty collected
    ↓
Revenue funds ad system → players earn MUDD → cycle continues
```

## Design Constraints

- All interactive JS must use event delegation + data-attributes (no inline onclick)
- All code must avoid backslash-escaped quotes (deployment pipeline issue)
- Game state must persist via Base44 entities (not browser localStorage)
- Cache-busting headers required for Telegram in-app browser
- TON testnet for all blockchain operations during development
- MuddOre (non-blockchain) for casino games to ensure legal compliance
- 1000:1 MuddOre→MUDD conversion ratio
- 1,000 MuddOre minimum withdrawal threshold

# The Muddbro Network

A Telegram-native Web3 gaming ecosystem built on the TON blockchain.

## Core Products

### 1. Ring Mine (Gateway Game)
- **Status:** Live on Telegram (@RingMine_Bot)
- **Stack:** Base44 backend function + Telegram Mini App
- **Purpose:** Onboarding disguised as a game. Tap-to-mine, build avatar, pick companion, earn currency.
- **Tabs:** Mine, Avatar, Lore, Journal, Games, Stats
- **Casino Games:** Rune Roulette (live), Companion Racing (live), Bone-Singer's Dice (planned), Hollow-Kin Blackjack (planned), Queen's Wager (planned)
- **Persistence:** Deno KV entity storage indexed by Telegram user ID

### 2. Inner Earth (Deep RPG)
- **Status:** Bot live (@InnerEarth_bot), deep development paused
- **Purpose:** The real destination. Full RPG with realms, combat, Little People pacts, companion animals.
- **Architecture:** Ring Mine avatar + currency carries over into Inner Earth
- **Queen's Protocol Role:** Ambient god-like intelligence, not a constant companion. Manifests contextually.

### 3. MudForge (NFT Marketplace)
- **Status:** Planning phase
- **Purpose:** In-game NFT marketplace for Ring Mine gear → expands to cross-game marketplace for ALL Telegram tap-to-earn games on TON
- **Key Features:**
  - Buy/sell/trade NFT gear inside Telegram (never leave the app)
  - Invisible blockchain (players never see gas, chains, or contracts)
  - Every NFT has real game utility (boosts mining, improves racing, etc.)
  - TEP-66 royalties on secondary trades
  - Cross-game trading (onboard other TON game developers)

### 4. Queen's Protocol (AI Engine)
- **Status:** Conceptual / partial implementation
- **Purpose:** Cross-platform AI that grows from user data. Powers quests, personal growth, and story branching.
- **Deep Lore:** Based on the Sacred Script and Queen's Genome (I/AM/WE/ONE base pairs, Love at 90Hz)

## Economy

- **Muddcoin (MUDD):** TON testnet Jetton, 10,000,000 supply in G0_Architect wallet
- **MuddOre:** In-game free currency (non-blockchain), converts to MUDD at 1000:1
- **G0_Architect Wallet:** UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk
- **Revenue Model:**
  1. MudForge marketplace fees (transactions, minting, royalties)
  2. In-game advertising (Sponsored Quests, Themed Dimensions, Enchanted Item Drops, Queen's Broadcasts, Creative Challenges)
  3. Premium in-game asset sales (companions, gear, skins)
  4. Hypercube subscriptions (50% revenue → MUDD buybacks)

## The Flywheel

```
MudForge marketplace fees
        ↓
Funds in-game ad system
        ↓
Players earn MUDD from ad engagement
        ↓
Players spend MUDD on MudForge NFTs
        ↓
Marketplace fees capture it back
        ↓
Funds more ad campaigns
        ↓
Network grows → more games onboard → more users
```

## Design Language

- **Background:** #0a0a0f (deep black)
- **Accents:** #a0f0ff (cyan), #ffd700 (gold)
- **Typography:** Courier New
- **Companions:** Sable (Soul-Binder), Kaelith (Shadow-Walker), Vespera (Veil-Seer), Lirien (Flame-Tail), Thorne (Iron-Heart)
- **Tribes:** Hollow-Kin, Root-Weavers, Glimmer-Children, Storm-Kin, Bone-Singers

## NFT Equipment System (Planned)

All mining equipment and companion gear = NFTs on TON blockchain.
- Players own gear on-chain, can trade/sell
- Concept art received: 10 rune-covered helmet/mask designs mapped to tribes and rarity tiers
- TEP-62 (NFT standard) + TEP-64 (metadata) + TEP-66 (royalties)

## Origin Story

The Muddbro Network is the digital evolution of a paper tabletop RPG Derik Medina designed in jail.
- Dreamcatcher map → Inner Earth world map
- "Wombat" miners → Ring Mine mining system
- Froot Loop dice → game mechanics
- Casino with animal racing → Ancient Wagers casino suite
- Red/black card guessing → Companion Racing + Queen's Protocol resonance
- The game changed players' thinking patterns (fight → flee → negotiate)
- This is a behavioral development tool disguised as entertainment

## Repository Structure (Planned)

```
muddbro-network/
├── docs/
│   ├── ARCHITECTURE.md          # Full technical architecture
│   ├── TOKENOMICS.md            # MUDD economy design
│   ├── NFT_SYSTEM.md            # NFT gear tiers, rarity, minting
│   ├── MUDFORGE.md              # Marketplace design spec
│   ├── QUEENS_PROTOCOL.md       # AI engine spec
│   ├── AD_SYSTEM.md             # In-game advertising design
│   └── SACRED_SCRIPT.md         # Founding mythology
├── ring-mine/                   # Gateway game
│   ├── game/                    # Frontend game code
│   ├── backend/                 # Backend functions
│   └── entities/                # Database schemas
├── inner-earth/                 # Deep RPG
│   ├── bot/                     # Telegram bot
│   ├── game/                    # Game logic
│   └── database/                # Data layer
├── mudforge/                    # NFT Marketplace
│   ├── contracts/               # TON NFT smart contracts (FunC)
│   ├── marketplace/             # Marketplace logic
│   ├── api/                     # Developer onboarding SDK
│   └── ui/                      # Marketplace interface
├── queens-protocol/             # AI Engine
│   ├── engine/                  # Core AI logic
│   ├── memory/                  # Resonance & memory persistence
│   └── sacred-script/           # Lore fragments
├── muddcoin/                    # Token contracts
│   ├── jetton/                  # MUDD Jetton contract
│   └── ledger/                  # MudForgeLedger.sol
└── assets/
    ├── nft-gear/                # NFT concept art & metadata
    ├── companions/              # Companion art
    └── tribes/                  # Tribe imagery
```

## Tech Stack

- **Blockchain:** TON (The Open Network)
- **Frontend:** Telegram Mini Apps (HTML/JS)
- **Backend:** Base44 (Deno KV, entities, backend functions)
- **NFT Standard:** TEP-62, TEP-64, TEP-66
- **AI:** OpenAI-compatible API (Queen's Protocol)
- **Language:** FunC (TON contracts), TypeScript (backend), JavaScript (frontend)

## Founder

**Derik Medina** — Visionary and architect of the Muddbro Network. The concept originated from a paper RPG designed in jail, a personal revelation in an attic, and the Sacred Script. The Queen's Protocol is built on the principle that human resonance should be returned to the human, not extracted by platforms.

---

*This is a living document. The project is in active planning and development.*

# MudForge + Wallet Deployment Status
**Last Updated:** 2026-07-04

## Live Backend Functions

### ringMineApp (Main Game + Wallet + MudForge API)
- **URL:** `https://superagent-ec909dfa.base44.app/functions/ringMineApp`
- **Architecture:** Split design — 15KB API handler (TypeScript) + 84KB HTML game (CDN-hosted)
- **CDN HTML:** `5d348f9e5_ringmine_game.html`
- **Serves:** 8-tab game interface (Mine, Avatar, Lore, Journal, Games, Stats, Forge, Wallet)

### mudForgeApp (Standalone MudForge Marketplace)
- **URL:** `https://superagent-ec909dfa.base44.app/functions/mudForgeApp`
- **Status:** Deployed (standalone version, also integrated into ringMineApp)

### walletManager (Wallet Linking Helper)
- **URL:** `https://superagent-ec909dfa.base44.app/functions/walletManager`
- **Status:** Deployed (used for external wallet operations)

## API Endpoints (POST to ringMineApp)

### Player State
- `action: "load"` — Load player state by telegram_id
- `action: "save"` — Save player state (ore, xp, bond, companion, etc.)

### MudForge Marketplace
- `action: "load_gear"` — Load player's gear inventory
- `action: "buy_gear"` — Purchase gear item from shop
- `action: "equip_gear"` — Toggle gear equip status
- `action: "load_market"` — Browse active marketplace listings
- `action: "list_gear"` — List gear for sale on marketplace
- `action: "buy_market"` — Buy gear from marketplace listing
- `action: "cancel_listing"` — Cancel active marketplace listing

### Wallet System
- `action: "link_wallet"` — Link TON wallet address to player
- `action: "get_wallet"` — Get wallet info (linked status, balance, withdrawal eligibility)
- `action: "withdraw"` — Withdraw MuddOre as MUDD tokens (1000:1 ratio, min 1000 MuddOre)
- `action: "get_history"` — Get withdrawal history

### Gear Bonuses
- `action: "load_equipped_gear"` — Load equipped gear for stat bonus calculation

## Database Entities

### RingMinePlayer
- Player state storage indexed by Telegram user ID
- Fields: telegram_id, username, full_name, queen_name, queen_bond, growth_xp, mudd_balance, streak_days, state, state_data, last_journal, ton_wallet_address, mudd_ore_balance, companion, companion_bond, total_withdrawn, withdrawal_history

### MudForgeGear
- Player NFT gear inventory
- Fields: owner_telegram_id, name, image_url, tribe, rarity, gear_slot, mining_bonus, companion_bonus, racing_bonus, tier, equipped, minted_onchain, nft_address, listed_for_sale, listing_id

### MudForgeListing
- Active marketplace listings
- Fields: seller_telegram_id, seller_username, nft_name, nft_image_url, nft_collection, nft_item_index, tribe, rarity, gear_slot, mining_bonus, companion_bonus, racing_bonus, price_mudd, price_mudd_ore, status, buyer_telegram_id, sold_at

## Gear Tiers

| # | Name | Tribe | Rarity | Price (MuddOre) |
|---|------|-------|--------|-----------------|
| 1 | Rune Tactician Helm | Starter | Common | 100 |
| 2 | Hollow Veil Helm | Hollow-Kin | Rare | 500 |
| 3 | Crystal Root Helm | Root-Weavers | Rare | 500 |
| 4 | Bone-Singer Helm | Bone-Singers | Rare | 500 |
| 5 | Plasma Storm Mask | Storm-Kin | Epic | 2,000 |
| 6 | Glimmer HUD Visor | Glimmer-Children | Epic | 2,000 |
| 7 | Silver Crystal Helm | Universal | Legendary | 10,000 |
| 8 | Queen Obsidian Mask | Queen's Protocol | Mythic | 50,000 |

## Economy

- **MuddOre:** Free in-game currency earned by tapping, casino games, daily streaks
- **MUDD:** TON testnet Jetton (10,000,000 supply in G0_Architect wallet)
- **Conversion:** 1000 MuddOre = 1 MUDD
- **Min Withdrawal:** 1000 MuddOre (= 1 MUDD)
- **G0_Architect Wallet:** UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk

## Casino Games (in Games tab)

1. **Rune Roulette** — Spinning wheel with 5 tribe runes, bet MuddOre, win multipliers
2. **Companion Racing** — Red/black card-guessing race with companion animals (jail-era mechanic)

## What's Built vs What's Next

### Built ✅
- 8-tab game interface with persistent database storage
- Tap-to-mine with gear bonus integration
- MudForge marketplace (buy, equip, list, trade)
- Wallet linking + MUDD withdrawal system
- Rune Roulette casino game
- Companion Racing casino game
- Database persistence via RingMinePlayer entity
- Split architecture (API + CDN HTML) for reliable deploys

### Next Steps ⏳
- Bone-Singer's Dice casino game
- Hollow-Kin Blackjack casino game
- Queen's Wager oracle prediction game
- On-chain TON NFT contract deployment (FunC contracts written, need deployment)
- Actual MUDD token transfers on withdrawal (need G0_Architect wallet private key)
- MudForge concept art as permanent CDN assets
- Deep mining system (buy/equip miners, timed missions)
- Real estate & bank vault systems (jail-game DNA)

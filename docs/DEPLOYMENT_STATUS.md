# Muddbro Network — Live Deployment Status
**Last Updated:** 2026-07-04
**Maintained by:** Superagent (Base44 side)

## Live Backend Functions
All deployed at `superagent-ec909dfa.base44.app/functions/`

| Function | URL | Purpose |
|----------|-----|---------|
| `ringMineApp` | `/functions/ringMineApp` | Main Ring Mine game (6-tab UI: Mine, Avatar, Lore, Journal, Games, Stats) |
| `ringMineBot` | `/functions/ringMineBot` | Telegram bot webhook handler (journaling, Queen's Protocol, menu) |
| `mudForgeApp` | `/functions/mudForgeApp` | MudForge NFT marketplace (Shop, My Gear, Market) |
| `mudForgeApp` | `/functions/mudForgeApp` | API: buy_gear, equip_gear, load_gear, load_market, list_gear, buy_market, cancel_listing, load_player |
| `walletManager` | `/functions/walletManager` | TON wallet linking + MuddOre-to-MUDD conversion (1000:1) |
| `innerEarthBot` | `/functions/innerEarthBot` | Inner Earth RPG bot (paused, @InnerEarth_bot) |

## Database Entities (Base44)
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| `RingMinePlayer` | Player state | telegram_id, state_data (JSON), mudd_ore_balance, mudd_balance, growth_xp, companion_bond, streak_days, companion |
| `RingMineJournal` | Journal entries | telegram_id, entry, reflection, mood, xp_earned, mudd_earned |
| `MudForgeGear` | NFT gear inventory | owner_telegram_id, name, image_url, tribe, rarity, gear_slot, mining_bonus, companion_bonus, racing_bonus, tier, equipped, minted_onchain, nft_address, listed_for_sale, listing_id |
| `MudForgeListing` | Marketplace listings | seller_telegram_id, nft_name, nft_image_url, tribe, rarity, price_mudd_ore, price_mudd, status, buyer_telegram_id, sold_at |

## Telegram Bots
| Bot | Username | Token Env | Status |
|-----|----------|-----------|--------|
| Ring Mine | @RingMine_Bot | TELEGRAM_BOT_TOKEN_2_2 | LIVE — main gateway game |
| Inner Earth | @InnerEarth_bot | TELEGRAM_BOT_TOKEN_4 | PAUSED — deep RPG, no new dev |

## MudForge Gear Tiers (8 items deployed)
1. **Rune Tactician Helm** — Common, 100 MuddOre, Starter tribe, +5% Mining
2. **Hollow Veil Helm** — Rare, 500 MuddOre, Hollow-Kin, +10% Mining, +3% Companion
3. **Crystal Root Helm** — Rare, 500 MuddOre, Root-Weavers, +12% Mining, +2% Companion, +2% Racing
4. **Bone-Singer Helm** — Rare, 500 MuddOre, Bone-Singers, +8% Mining, +5% Companion
5. **Plasma Storm Mask** — Epic, 2000 MuddOre, Storm-Kin, +20% Mining, +5% Companion, +5% Racing
6. **Glimmer HUD Visor** — Epic, 2000 MuddOre, Glimmer-Children, +25% Mining, +3% Companion, +3% Racing
7. **Silver Crystal Helm** — Legendary, 10000 MuddOre, +35% Mining, +10% Companion, +5% Racing
8. **Queen Obsidian Mask** — Mythic, 50000 MuddOre, Queen's Protocol, +50% Mining, +20% Companion, +10% Racing

## Casino Games (in ringMineApp Games tab)
1. **Rune Roulette** — LIVE — 5 tribe runes, MuddOre betting, multipliers
2. **Companion Racing** — LIVE — jail-era red/black card mechanic, companion animals race
3. Bone-Singer's Dice — PLANNED
4. Hollow-Kin Blackjack — PLANNED
5. Queen's Wager — PLANNED

## Economy
- **MuddOre**: Free in-game currency (non-blockchain), earned by tapping, casino games
- **MUDD**: TON testnet Jetton, 10,000,000 supply in G0_Architect wallet
- **Conversion**: 1000 MuddOre = 1 MUDD, minimum 1000 MuddOre to withdraw
- **G0_Architect wallet**: UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk

## What Lyrael Should Document in ARCHITECTURE.md
- The above deployment map
- Data flow: Telegram → Bot webhook → Backend function → Database entity → Game UI
- NFT system: MudForgeGear entity → TON NFT contract (TEP-62/TEP-66) → player wallet
- Economy flow: Tap → MuddOre → Casino games → MuddOre multiplier → Convert to MUDD → Withdraw to TON
- Queen's Protocol: Groq API (llama-3.3-70b-versatile) → JSON response → Bot message
- Cross-game bridge: Ring Mine (gateway) → Inner Earth (deep RPG) — avatar + currency carry over

## NFT Metadata Templates Needed
Lyrael should create JSON metadata for each of the 8 gear items above, following TEP-62/TEP-66 standards:
- name, description, image, attributes (tribe, rarity, gear_slot, mining_bonus, companion_bonus, racing_bonus, tier)
- Collection: "MudForge Genesis"
- See `nft-metadata/` folder in repo

## Companion Roster (canonical)
- Sable (Soul-Binder)
- Kaelith (Shadow-Walker)
- Vespera (Veil-Seer)
- Lirien (Flame-Tail)
- Thorne (Iron-Heart)

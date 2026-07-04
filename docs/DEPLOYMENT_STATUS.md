# MudForge NFT Marketplace — Deployment Status
**Last updated:** 2026-07-04

## Live Deployments

### Ring Mine Game (ringMineApp)
- **URL:** `https://superagent-ec909dfa.base44.app/functions/ringMineApp`
- **Type:** Base44 Backend Function (Deno)
- **Architecture:** Split — 15KB API handler + 84KB CDN-hosted game HTML
- **CDN HTML:** `5d348f9e5_ringmine_game.html` on Base44 public storage
- **Status:** ✅ LIVE

**8 Tabs:**
1. **Mine** — Tap-to-mine MuddOre, progress bars (Ore/Bond/XP)
2. **Avatar** — Companion selection (Sable, Kaelith, Vespera, Lirien, Thorne), gear shop
3. **Lore** — Sacred Script fragments, tribe histories
4. **Journal** — Daily journaling with Queen reflections
5. **Games** — Rune Roulette + Companion Racing (MuddOre betting)
6. **Stats** — Player profile, streak, totals
7. **Forge** — MudForge NFT marketplace (buy/equip/list/trade gear)
8. **Wallet** — TON wallet linking, MuddOre→MUDD withdrawal (1000:1)

**API Endpoints (POST):**
- `load` / `save` — Player state persistence (RingMinePlayer entity)
- `load_gear` / `buy_gear` / `equip_gear` — MudForge gear management
- `load_market` / `list_gear` / `buy_market` / `cancel_listing` — Marketplace
- `link_wallet` / `get_wallet` / `withdraw` / `get_history` — Wallet operations
- `load_equipped_gear` — Active gear bonuses for mining calculations

### MudForge Marketplace
- **Integrated in:** Ring Mine game (Forge tab)
- **Entities:** MudForgeGear (player inventory), MudForgeListing (marketplace)
- **Gear tiers:** 8 items, Common → Mythic
- **Currency:** MuddOre (in-game) / MUDD (on-chain, 1000:1 conversion)
- **Status:** ✅ LIVE (database-backed, on-chain NFT minting pending)

### Wallet System
- **Status:** ✅ LIVE
- **Features:** TON address linking, balance display, MuddOre→MUDD withdrawal
- **Min withdrawal:** 1000 MuddOre (= 1 MUDD)
- **On-chain transfers:** PENDING (requires G0_Architect wallet private key)

### NFT Smart Contracts
- **Files pushed:** `mudforge/contracts/nft-collection.fc`, `nft-item.fc`, `op-codes.fc`
- **Standard:** TEP-62 / TEP-66
- **Metadata schema:** `docs/NFT_METADATA.md`
- **Status:** ⏳ Written, not yet deployed on-chain

### Inner Earth Bot
- **URL:** @InnerEarth_bot on Telegram
- **Status:** ✅ LIVE (standalone, no active development)

## Database Entities
| Entity | Purpose | Records |
|--------|---------|---------|
| RingMinePlayer | Player state + wallet | Growing |
| RingMineJournal | Journal entries | Growing |
| MudForgeGear | NFT equipment inventory | Growing |
| MudForgeListing | Marketplace listings | Growing |

## Economy Flow
```
Tap to Mine → Earn MuddOre → Play Casino Games → Win/Lose MuddOre
                                                    ↓
                                            Withdraw at 1000:1
                                                    ↓
                                            MUDD tokens on TON
                                                    ↓
                                            MudForge NFT purchases
```

## Next Steps
1. On-chain MUDD token transfers (need wallet key)
2. Deploy NFT collection contract on TON
3. Build remaining casino games (Bone-Singer's Dice, Hollow-Kin Blackjack, Queen's Wager)
4. Connect gear equip bonuses to mining/racing stat calculations
5. Upload concept art as permanent CDN assets for NFT metadata

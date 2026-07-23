# MudForge + Wallet Deployment Status
**Last Updated:** 2026-07-23

## Live Backend Functions (16 total)

### Core Game
1. **ringMineApp** — Main game frontend + API (serves HTML, handles load/save/mine/casino/forge)
2. **ringMineMarket** — Market + wallet + leaderboard + bridge forwarding
3. **ringMineBot** — Ring Mine Telegram bot (16KB, split from brain)
4. **ringMineBrain** — Queen's Protocol AI engine (reflect, glyphin, transcription)
5. **ringMineGate** — Cache-busting wrapper (legacy)

### Inner Earth
6. **innerEarthBot** — Inner Earth Telegram bot v3 (passport bridge, no pinned messages)
7. **innerEarthData** — Game data arrays (realms, enemies, companions, LP, equipment)
8. **innerEarthBridge** — Cross-game identity + economy bridge (passport_load/save, convert_ore, sync_companion, leaderboard, get_images)
9. **innerEarthApp** — Inner Earth visual game frontend

### Blockchain
10. **walletManager** — TON wallet linking + TEP-74 jetton withdrawals
11. **nftMinter** — NFT minting on TON testnet (10 Genesis items live)
12. **muddbroNftStore** — NFT store backend (Deno Deploy store frontend)

### Mini App
- **CDN:** a7b36bd86_ringmine_ui_v3.html (v3 — companion images, leaderboard, dice, convert-ore)
- **Tabs:** Mine, Glyph, Casino (3 games), Forge, Wallet, Stats

## What's Connected

### ✅ Live & Tested
- Ring Mine bot ↔ RingMinePlayer entity (unified storage)
- Ring Mine bot ↔ ringMineBrain (AI via HTTP)
- Ring Mine Mini App ↔ RingMinePlayer entity
- ringMineApp → ringMineMarket → innerEarthBridge (forwarding chain)
- innerEarthBot → innerEarthBridge → RingMinePlayer entity (passport bridge)
- innerEarthBot → innerEarthData (game data fetch)
- innerEarthBridge → RingMinePlayer entity (auto-creates if Inner Earth is first entry)
- walletManager → TON blockchain (TEP-74 jetton transfers)
- 10 NFTs minted on TON testnet
- 10 companion/realm images on CDN
- 3 casino games (Coin Flip, Crystal Slots, Dice Roll)
- Glyphin state engine (5 states: Seed → Monument)
- Voice journaling with Groq Whisper

### ⏳ Not Yet Connected
- innerEarthApp (visual HTML) → still uses old storage, needs bridge integration
- 02_BRAIN local OS → no production sync endpoint
- fleetos-brain GitHub repo → needs manual deletion (token lacks admin rights)

## Economy

- **MuddOre:** Free in-game currency (non-blockchain, casino-safe)
- **MUDD:** TON testnet jetton (10M supply, real on-chain value)
- **Conversion:** 1000 MuddOre = 1 MUDD
- **Min Withdrawal:** 1000 MuddOre (= 1 MUDD)
- **Burn Sink:** 30% of forge cost permanently burned
- **G0_Architect Wallet:** UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk

## Companions
- Sable (+10% casino), Kaelith (+15% mining), Vespera (+20% journaling XP), Lirien (+25% bond), Thorne (+10% forge rarity)
- All 5 companion images on CDN
- Cross-game: Ring Mine companion visible in Inner Earth via passport bridge

## Inner Earth Game Data
- 7 Realms: Ancient Earth → Age of Warriors → Mystic Age → Industrial Dawn → Digital Realm → Hyperverse → Sacred Core
- 16 Enemies (3 bosses: Koschei, Zmey, Veles)
- 8 Cyber Animals (companions)
- 8 Little People tribes (mining pacts)
- 22 Equipment items across 7 realms
- AI narration via Groq (Queen's Protocol)

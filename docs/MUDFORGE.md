# MudForge — NFT Marketplace Design Spec

## Overview

MudForge is the in-house NFT marketplace for the Muddbro Network. It starts as Ring Mine's gear trading hub and expands into a cross-game marketplace for ALL Telegram tap-to-earn games on TON.

## Phase 1: Ring Mine Internal Marketplace

### NFT Gear System
- All mining equipment and companion gear minted as NFTs on TON (TEP-62)
- Players buy gear with MuddOre or MUDD → NFT minted to their TON wallet
- Gear has real game utility (mining boost, racing bonus, companion stat boost)
- Players can list gear for sale, set price in MUDD
- Other players buy → NFT transfers on-chain → MUDD payment executes

### Gear Tiers (from concept art)
1. **Starter Tier** — Black tactical helmet with cyan rune script
2. **Tribe Tier** — Tribe-specific gear:
   - Root-Weavers: Crystal-crusted helmet with cyan crystals
   - Bone-Singers: Iron hardhat with bone fragments and rune etching
   - Storm-Kin: Cyberpunk gas-mask with electric blue plasma
   - Glimmer-Children: Sci-fi visor helmet with HUD mineral scan
   - Hollow-Kin: Bronze/dark metal helm with teal crystal shard
3. **Mid Tier** — Silver crystal-spiked helmet with white runes
4. **Boss/Queen's Protocol Tier** — Cosmic obsidian mask with gold rune engravings

### Marketplace UI (inside Ring Mine)
- **Browse** — Grid of listed NFTs with art, stats, rarity, price
- **Buy** — One-tap purchase using MUDD (invisible blockchain transfer)
- **List** — Select gear from inventory, set price, confirm listing
- **My NFTs** — View owned gear NFTs, equipped and unequipped
- **Trade History** — Past purchases, sales, and price trends

### Technical Requirements
- TEP-62 NFT collection contract (FunC) deployed on TON testnet
- TEP-64 metadata standard for gear stats and art references
- TEP-66 royalty standard for secondary trade fees
- Marketplace escrow contract (holds NFT during sale, releases on purchase)
- Backend function for listing management (create, cancel, fulfill)
- Integration with existing wallet linking system (TON address tied to Telegram ID)

## Phase 2: Cross-Game Marketplace

### Vision
MudForge becomes the default NFT trading hub for all Telegram tap-to-earn games on TON.

### Developer Onboarding
- Simple SDK/API for game developers to mint NFTs through MudForge
- Game registers a collection → gets minting access
- Developer sets royalty % for secondary trades
- MudForge collects a platform fee on every transaction

### Revenue Model
- **Platform fee:** % of every marketplace transaction
- **Minting fee:** Charged per NFT minted
- **Royalties:** TEP-66 automatic % to original game developer on secondary trades
- **Featured listings:** Games pay for premium placement

### Competitive Advantages
1. Only cross-game NFT marketplace in Telegram/TON ecosystem
2. Lives inside Telegram (no external site, no app download)
3. Invisible blockchain (players never see gas, chains, or contracts)
4. NFTs have real game utility (not just cosmetic)
5. TON's low fees (fractions of a cent vs Ethereum's dollars)
6. 1B+ Telegram users already in the same app
7. Wallet already linked to Telegram ID from existing system

## Competitive Analysis

| Platform | Chain | In-Game | Telegram Native | Cross-Game | UX Quality | Fees |
|----------|-------|---------|-----------------|------------|------------|------|
| MudForge (ours) | TON | ✅ | ✅ | ✅ | Frictionless | Low |
| Getgems | TON | ❌ | ❌ | ❌ | Moderate | 5% |
| Fragment | TON | ❌ | ✅ | ❌ | Seamless | Varies |
| MRKT | TON | ❌ | ✅ | ❌ | Good | Varies |
| Wombat | Multi | ✅ | ❌ | ❌ | Glitchy | Varies |
| Axie Market | Ronin | ✅ | ❌ | ❌ | Moderate | Low |
| Immutable X | ETH L2 | ✅ | ❌ | ❌ | Good | Zero |
| Magic Eden | Multi | ❌ | ❌ | ❌ | Good | Low |
| OpenSea | ETH | ❌ | ❌ | ❌ | Good | 2.5% |

## Status

**Phase 1:** Planning complete, awaiting greenlight to build.
**Phase 2:** Conceptual, depends on Phase 1 success.

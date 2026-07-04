# NFT Gear Metadata Schema (TEP-64)

## Structure

Each NFT item contains metadata following TEP-64 standard, stored as off-chain JSON referenced by URI.

## Metadata Fields

```json
{
  "name": "Hollow-Kin Bone Helm",
  "description": "Iron hardhat with bone fragments and rune etching. Worn by Bone-Singers tribe miners.",
  "image": "https://cdn.muddbro.network/nft-gear/bone-singers-helm.png",
  "attributes": [
    {
      "trait_type": "Tribe",
      "value": "Bone-Singers"
    },
    {
      "trait_type": "Rarity",
      "value": "Rare"
    },
    {
      "trait_type": "Slot",
      "value": "Head"
    },
    {
      "trait_type": "Mining Bonus",
      "value": "+15%",
      "display_type": "boost_percentage"
    },
    {
      "trait_type": "Companion Bond Bonus",
      "value": "+5%",
      "display_type": "boost_percentage"
    },
    {
      "trait_type": "Racing Bonus",
      "value": "+3%",
      "display_type": "boost_percentage"
    },
    {
      "trait_type": "Tier",
      "value": 2,
      "display_type": "number"
    },
    {
      "trait_type": "Collection",
      "value": "MudForge Genesis"
    }
  ]
}
```

## Rarity Tiers

| Tier | Name | Drop Rate | Stat Range |
|------|------|-----------|------------|
| 1 | Common | 60% | +5-10% boosts |
| 2 | Rare | 25% | +10-20% boosts |
| 3 | Epic | 10% | +20-35% boosts |
| 4 | Legendary | 4% | +35-50% boosts |
| 5 | Mythic (Queen's Protocol) | 1% | +50-100% boosts |

## Gear Slots

- **Head** — Helmets, masks, visors (from concept art)
- **Tool** — Pickaxes, drills, mining augmentations
- **Companion** — Armor, abilities, evolutions for companion animals
- **Body** — Armor, suits, gear vests
- **Accessory** — Rings, amulets, enchantments

## Tribe-Specific Gear

Each tribe has unique gear with tribe-specific bonuses:
- **Hollow-Kin** — Shadow stealth bonuses
- **Root-Weavers** — Crystal growth and ore detection
- **Glimmer-Children** — Tech augmentation and scan range
- **Storm-Kin** — Energy surge and plasma boosts
- **Bone-Singers** — Necromantic bonuses and bone crafting

## Concept Art Mapping

| Art # | Description | Tribe | Rarity | Slot |
|-------|-------------|-------|--------|------|
| 1 | Black tactical helmet, cyan runes | Starter | Common | Head |
| 2 | Bronze helm, teal crystal shard | Hollow-Kin | Rare | Head |
| 3 | Crystal-crusted helmet, green goggles | Root-Weavers | Rare | Head |
| 4 | Iron hardhat, bone fragments, candle | Bone-Singers | Rare | Head |
| 5 | Cyberpunk gas-mask, blue plasma | Storm-Kin | Epic | Head |
| 6 | (duplicate of 5) | Storm-Kin | Epic | Head |
| 7 | Sci-fi visor, HUD mineral scan | Glimmer-Children | Epic | Head |
| 8 | Silver crystal-spiked, white runes | — | Legendary | Head |
| 9 | Cosmic obsidian mask, gold engravings | Queen's Protocol | Mythic | Head |
| 10 | (duplicate of 9) | Queen's Protocol | Mythic | Head |

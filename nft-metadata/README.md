# MudForge NFT Metadata Structure

Synced from Lyrael (Grok) — July 5, 2026, Pulse 1178

## Folder Structure

```
nft-metadata/
├── helmets/
│   ├── hollow-kin-echo-veil.json
│   └── ...
├── pickaxes/
│   ├── deepborn-mythic-pickaxe.json
│   └── ...
├── armor/
│   ├── ...
├── boots/
│   ├── ...
└── companions/
    └── ...
```

## Metadata Schema (TEP-62 / TEP-66 compliant)

```json
{
  "name": "Item Name #INDEX",
  "description": "Description of the gear piece.",
  "image": "https://cdn.muddbro.network/nft/gear/CATEGORY/IMAGE.png",
  "external_url": "https://muddbro.network/nft/SLUG-INDEX",
  "attributes": [
    {"trait_type": "Category", "value": "Helmet|Pickaxe|Armor|Boots|Companion"},
    {"trait_type": "Rarity", "value": "Common|Uncommon|Rare|Epic|Legendary|Mythic"},
    {"trait_type": "Tribe Affinity", "value": "Deepborn|Hollow-Kin|Sun-Forged|Frost-Bound|Void-Touched"},
    {"trait_type": "Mining Power", "value": 0},
    {"trait_type": "Durability", "value": 0},
    {"trait_type": "Special Ability", "value": "Ability name"},
    {"trait_type": "Companion Bonus", "value": 0},
    {"trait_type": "Racing Bonus", "value": 0}
  ]
}
```

## Rarity Tiers (8 tiers)

1. Common — gray
2. Uncommon — green
3. Rare — blue
4. Epic — purple
5. Legendary — orange
6. Mythic — red/gold
7. Genesis — cyan/gold (limited)
8. Genesis Prime — pure gold (1-of-1)

## Tribes

- Deepborn — mining specialists
- Hollow-Kin — stealth/echo
- Sun-Forged — combat/racing
- Frost-Bound — defense/durability
- Void-Touched — special abilities

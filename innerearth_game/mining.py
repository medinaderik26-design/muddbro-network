"""
Mining System — Little People Pact & Idle Mining
Handles mining sessions, mineral generation, equipment bonuses
"""
import random
from datetime import datetime, timedelta
from database import get_miner, update_miner, add_mineral, get_player

# Mineral tiers — quality and rarity scale with miner stats + LP trust
MINERALS = {
    "inner_earth": [
        {"name": "Luma Stone",    "base_value": 0.001, "rarity": "common"},
        {"name": "Ember Crystal", "base_value": 0.005, "rarity": "uncommon"},
        {"name": "Void Shard",    "base_value": 0.02,  "rarity": "rare"},
        {"name": "Soulite",       "base_value": 0.1,   "rarity": "legendary"},
    ],
    "crystal_caverns": [
        {"name": "Prism Dust",    "base_value": 0.003, "rarity": "common"},
        {"name": "Echo Gem",      "base_value": 0.01,  "rarity": "uncommon"},
        {"name": "Rift Crystal",  "base_value": 0.05,  "rarity": "rare"},
        {"name": "Celestite",     "base_value": 0.2,   "rarity": "legendary"},
    ],
    "digital_expanse": [
        {"name": "Data Ore",      "base_value": 0.005, "rarity": "common"},
        {"name": "Cipher Shard",  "base_value": 0.015, "rarity": "uncommon"},
        {"name": "Quantum Dust",  "base_value": 0.08,  "rarity": "rare"},
        {"name": "Genesis Token", "base_value": 0.5,   "rarity": "legendary"},
    ]
}

EQUIPMENT_SLOTS = ["pickaxe", "lantern", "satchel", "boots", "amulet"]

EQUIPMENT_CATALOG = {
    "Bone Pickaxe":    {"slot": "pickaxe", "power": 1,  "efficiency": 0,  "depth": 0},
    "Iron Pickaxe":    {"slot": "pickaxe", "power": 3,  "efficiency": 1,  "depth": 0},
    "Crystal Drill":   {"slot": "pickaxe", "power": 6,  "efficiency": 2,  "depth": 2},
    "Void Excavator":  {"slot": "pickaxe", "power": 12, "efficiency": 4,  "depth": 5},
    "Ember Lantern":   {"slot": "lantern", "power": 0,  "efficiency": 2,  "depth": 1},
    "Soul Satchel":    {"slot": "satchel", "power": 0,  "efficiency": 3,  "depth": 0},
    "Root Boots":      {"slot": "boots",   "power": 0,  "efficiency": 1,  "depth": 2},
    "LP Amulet":       {"slot": "amulet",  "power": 2,  "efficiency": 2,  "depth": 2},
}

def calculate_mining_yield(miner: dict, player: dict, hours: float) -> list:
    """Calculate what minerals a miner earns over a time period."""
    power      = miner.get("power", 1)
    efficiency = miner.get("efficiency", 1)
    depth      = miner.get("depth", 1)
    lp_trust   = player.get("lp_trust", 0)
    dimension  = player.get("dimension", "inner_earth")

    # LP trust multiplier (0–100 trust = 1.0–2.5x multiplier)
    lp_multiplier = 1.0 + (lp_trust / 100) * 1.5

    # Base yield per hour
    base_yield = (power * efficiency * 0.5) * lp_multiplier * hours

    available = MINERALS.get(dimension, MINERALS["inner_earth"])
    results = []

    for mineral in available:
        # Chance to find this mineral based on rarity & depth
        rarity_weight = {"common": 0.6, "uncommon": 0.25, "rare": 0.12, "legendary": 0.03}
        chance = rarity_weight[mineral["rarity"]]
        depth_bonus = depth * 0.05 if mineral["rarity"] in ["rare", "legendary"] else 0
        final_chance = min(chance + depth_bonus, 0.95)

        if random.random() < final_chance:
            qty = base_yield * chance * random.uniform(0.8, 1.3)
            quality = min(1.0, 0.5 + (efficiency * 0.05) + (lp_trust * 0.003))
            results.append({
                "mineral": mineral["name"],
                "quantity": round(qty, 4),
                "quality": round(quality, 2),
                "rarity": mineral["rarity"],
                "ton_est": round(qty * mineral["base_value"] * quality, 6)
            })

    return results

async def start_mining(user_id: int, hours: int = 8) -> dict:
    """Start a mining session."""
    miner = await get_miner(user_id)
    if not miner:
        return {"error": "No mining character found. Form a pact with the Little People first."}
    if miner.get("is_mining"):
        return {"error": "already_mining", "mine_end": miner.get("mine_end")}

    now = datetime.utcnow()
    end = now + timedelta(hours=hours)
    await update_miner(
        user_id,
        is_mining=1,
        mine_start=now.isoformat(),
        mine_end=end.isoformat()
    )
    return {"success": True, "ends_at": end.isoformat(), "hours": hours}

async def collect_mining(user_id: int) -> dict:
    """Collect results from a completed or in-progress mining session."""
    miner = await get_miner(user_id)
    player = await get_player(user_id)
    if not miner or not miner.get("is_mining"):
        return {"error": "Not currently mining."}

    now = datetime.utcnow()
    start = datetime.fromisoformat(miner["mine_start"])
    end = datetime.fromisoformat(miner["mine_end"])

    # Calculate actual time elapsed (capped at session end)
    elapsed = min(now, end) - start
    hours_elapsed = elapsed.total_seconds() / 3600

    if hours_elapsed < 0.05:  # less than 3 minutes
        return {"error": "Too soon! The Little People need more time."}

    results = calculate_mining_yield(miner, player, hours_elapsed)

    # Save minerals to DB
    for r in results:
        await add_mineral(user_id, r["mineral"], r["quantity"], r["quality"])

    # Gain some LP trust from successful mining
    lp_gain = min(5, int(hours_elapsed * 0.5))
    new_trust = min(100, player.get("lp_trust", 0) + lp_gain)
    await update_miner(user_id, is_mining=0, mine_start=None, mine_end=None)

    from database import update_player
    await update_player(user_id, lp_trust=new_trust)

    return {
        "success": True,
        "hours": round(hours_elapsed, 1),
        "minerals": results,
        "lp_trust_gained": lp_gain,
        "total_ton_est": round(sum(r["ton_est"] for r in results), 6)
    }

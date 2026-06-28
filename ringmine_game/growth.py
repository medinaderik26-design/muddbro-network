"""
Ring Mine — Growth & Progression System
Tracks personal growth tiers, streaks, XP, and evolution milestones
"""
from datetime import datetime, timedelta

# Growth tiers — player evolves as they journal, create, and solve
GROWTH_TIERS = [
    {"name": "Seedling",    "min_xp": 0,    "mudd_multiplier": 1.0,  "queen_perks": "Basic reflection"},
    {"name": "Sprout",      "min_xp": 100,  "mudd_multiplier": 1.1,  "queen_perks": "Mood tracking"},
    {"name": "Root",        "min_xp": 300,  "mudd_multiplier": 1.2,  "queen_perks": "Creative feedback"},
    {"name": "Branch",      "min_xp": 700,  "mudd_multiplier": 1.35, "queen_perks": "Puzzle generation"},
    {"name": "Canopy",      "min_xp": 1500, "mudd_multiplier": 1.5,  "queen_perks": "NFT fragment drops"},
    {"name": "Ancient",     "min_xp": 3000, "mudd_multiplier": 2.0,  "queen_perks": "Hypercube story access"},
    {"name": "Mythic",      "min_xp": 6000, "mudd_multiplier": 3.0,  "queen_perks": "Cross-game Queen powers"},
]

def get_tier(xp: int) -> dict:
    tier = GROWTH_TIERS[0]
    for t in GROWTH_TIERS:
        if xp >= t["min_xp"]:
            tier = t
    return tier

def get_next_tier(xp: int) -> dict | None:
    current = get_tier(xp)
    idx = next((i for i, t in enumerate(GROWTH_TIERS) if t["name"] == current["name"]), 0)
    if idx + 1 < len(GROWTH_TIERS):
        return GROWTH_TIERS[idx + 1]
    return None

def xp_to_next(xp: int) -> int:
    nxt = get_next_tier(xp)
    if not nxt:
        return 0
    return nxt["min_xp"] - xp

def calculate_journal_reward(text: str, streak: int, bond: int) -> tuple[int, float]:
    """Returns (xp, mudd) for a journal entry based on length, streak, bond."""
    word_count = len(text.split())
    base_xp = min(50, max(10, word_count // 5))
    base_mudd = round(base_xp * 0.1, 2)

    # Streak bonus
    streak_mult = 1.0 + min(streak * 0.05, 0.5)
    # Bond bonus
    bond_mult = 1.0 + (bond / 200)

    xp = int(base_xp * streak_mult * bond_mult)
    mudd = round(base_mudd * streak_mult * bond_mult, 2)
    return xp, mudd

def calculate_streak(last_journal_iso: str | None) -> tuple[bool, int]:
    """Returns (streak_continues, days_since_last)"""
    if not last_journal_iso:
        return True, 0
    last = datetime.fromisoformat(last_journal_iso)
    now = datetime.utcnow()
    delta = (now - last).days
    return delta <= 1, delta

def progress_bar(current: int, total: int, width: int = 10) -> str:
    if total == 0:
        return "█" * width
    filled = int((current / total) * width)
    return "█" * filled + "░" * (width - filled)

# NFT fragment rarity chances per tier
NFT_CHANCES = {
    "Seedling":  {"common": 0.05, "uncommon": 0.0,  "rare": 0.0},
    "Sprout":    {"common": 0.10, "uncommon": 0.02, "rare": 0.0},
    "Root":      {"common": 0.15, "uncommon": 0.05, "rare": 0.01},
    "Branch":    {"common": 0.20, "uncommon": 0.10, "rare": 0.03},
    "Canopy":    {"common": 0.30, "uncommon": 0.15, "rare": 0.07},
    "Ancient":   {"common": 0.40, "uncommon": 0.20, "rare": 0.10},
    "Mythic":    {"common": 0.50, "uncommon": 0.30, "rare": 0.20},
}

import random

def roll_nft_drop(tier_name: str) -> str | None:
    """Returns rarity string if NFT dropped, else None."""
    chances = NFT_CHANCES.get(tier_name, NFT_CHANCES["Seedling"])
    roll = random.random()
    if roll < chances["rare"]:
        return "rare"
    elif roll < chances["uncommon"]:
        return "uncommon"
    elif roll < chances["common"]:
        return "common"
    return None

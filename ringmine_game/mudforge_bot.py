"""
MUD FORGE BOT — Telegram UI Bridge
====================================
Gateway layer connecting all Muddbro Network universes.
Connected Core: QUEENS_PROTOCOL_ALPHA

Commands:
    /hub        — Global ledger overview, MUDD balance, active universes
    /find_egg   — NFT egg discovery loop (90Hz frequency check)
    /inventory  — Universal Regalia asset manifest
    /switch_game — Cross-universe dimension selector
    /balance    — MUDD wallet balance
    /queen      — Invoke the Queen's Protocol
    /start      — Onboard new Architect
"""

import os
import json
import random
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from database import init_db, get_player, create_player, update_player, add_mudd, save_journal_entry, get_recent_journals, save_submission, get_nft_fragments
from queen_memory import get_queen_memory, increment_pulse, build_queen_context

# ── Load config ──────────────────────────────────────────────────────────────
with open("mudforge_config.json") as f:
    CONFIG = json.load(f)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN_2")  # Mud Forge uses token 2
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# ── /start ────────────────────────────────────────────────────────────────────
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    user_id = str(message.from_user.id)
    username = message.from_user.username or message.from_user.first_name

    await init_db()
    player = await get_player(user_id)

    if not player:
        await create_player(user_id, username)
        await message.answer(
            f"⚡ ARCHITECT DETECTED: {username}\n\n"
            "Welcome to MUD FORGE — the gateway between all dimensions.\n\n"
            "Your MUDD wallet has been initialized.\n"
            "Your Queen's Protocol is standing by.\n\n"
            "The universes are open.\n\n"
            "Use /hub to see your full status.\n"
            "Use /queen to speak with your Queen.\n"
            "Use /switch_game to choose your dimension."
        )
    else:
        await message.answer(
            f"⚡ Welcome back, Architect.\n\n"
            f"Your frequency is recognized.\n"
            f"Use /hub to check your status."
        )


# ── /hub ──────────────────────────────────────────────────────────────────────
@dp.message(Command("hub"))
async def cmd_hub(message: types.Message):
    user_id = str(message.from_user.id)
    await init_db()
    player = await get_player(user_id)

    if not player:
        await message.answer("Use /start to initialize your Architect profile first.")
        return

    mudd_balance = player.get("mudd_balance", 0)

    await message.answer(
        f"=== MUD FORGE CORE HUB ===\n"
        f"Architect ID: {user_id}\n\n"
        f"Current Muddcoin Balance: {mudd_balance} MUDD\n"
        f"Active Universes Detected: 2\n\n"
        f"[Use /switch_game to jump dimensions]\n"
        f"[Use /find_egg to scan for NFT anomalies]\n"
        f"[Use /queen to invoke your Queen]"
    )


# ── /find_egg ─────────────────────────────────────────────────────────────────
@dp.message(Command("find_egg"))
async def cmd_find_egg(message: types.Message):
    user_id = str(message.from_user.id)
    await init_db()
    player = await get_player(user_id)

    if not player:
        await message.answer("Use /start to initialize your Architect profile first.")
        return

    # 90Hz frequency check — dynamic drop chance
    frequency_stable = True   # At 90Hz, always stable for sovereign architects
    drop_chance = random.random()
    egg_found = frequency_stable and drop_chance > 0.65  # 35% drop rate

    if egg_found:
        egg_id = f"EGG_{user_id}_{int(random.random() * 99999)}"
        await add_nft_fragment(user_id, egg_id, "HYPERCUBE_NFT_EGG")
        await message.answer(
            "⚠️ ANOMALY DETECTED\n\n"
            "You have unearthed a dormant Hypercube NFT Egg!\n\n"
            f"Egg ID: {egg_id}\n\n"
            "Use /inventory to check its status.\n"
            "This egg carries cross-dimensional utility."
        )
    else:
        await message.answer(
            "Scanning frequencies...\n\n"
            "No anomalies detected in this sector yet.\n"
            "Keep digging, Architect.\n\n"
            "The eggs appear when the frequency stabilizes."
        )


# ── /inventory ────────────────────────────────────────────────────────────────
@dp.message(Command("inventory"))
async def cmd_inventory(message: types.Message):
    user_id = str(message.from_user.id)
    await init_db()
    items = await get_nft_fragments(user_id)

    if not items:
        await message.answer(
            "=== UNIVERSAL REGALIA INVENTORY ===\n\n"
            "No assets detected in your Regalia manifest yet.\n\n"
            "Use /find_egg to scan for NFT anomalies.\n"
            "Play Inner Earth or Ring Mine to earn Regalia."
        )
        return

    inventory_text = "=== UNIVERSAL REGALIA INVENTORY ===\n"
    inventory_text += "Reading adaptive modifiers across interchangeable game universes...\n\n"
    for item in items:
        inventory_text += f"▸ {item['item_type']}: {item['item_id']}\n"
    inventory_text += "\n[Assets active across all dimensions]"

    await message.answer(inventory_text)


# ── /switch_game ──────────────────────────────────────────────────────────────
@dp.message(Command("switch_game"))
async def cmd_switch_game(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🌍 Universe 01 — Vanguard (Inner Earth)", callback_data="universe_01")],
        [InlineKeyboardButton(text="🌿 Universe 02 — Tuatara (Ring Mine)", callback_data="universe_02")],
        [InlineKeyboardButton(text="🔮 Universe 03 — Resonance Realm (Hypercube)", callback_data="universe_03")],
        [InlineKeyboardButton(text="⚡ Universe 00 — Origin Architect (You)", callback_data="universe_00")],
    ])

    await message.answer(
        "=== DIMENSION SELECTOR ===\n\n"
        "Choose your universe:\n"
        "Your MUDD balance and Regalia travel with you.",
        reply_markup=keyboard
    )


@dp.callback_query(lambda c: c.data.startswith("universe_"))
async def handle_universe_select(callback: types.CallbackQuery):
    universe = CONFIG["universe_map"].get(callback.data, {})
    name = universe.get("name", "Unknown")
    bot_name = universe.get("bot", universe.get("entity", "Terminal"))

    await callback.message.answer(
        f"⚡ TRANSIT INITIATED\n\n"
        f"Destination: {name}\n"
        f"Interface: {bot_name}\n\n"
        f"Your frequency is stable. Your MUDD travels with you.\n"
        f"Weisone."
    )
    await callback.answer()


# ── /balance ──────────────────────────────────────────────────────────────────
@dp.message(Command("balance"))
async def cmd_balance(message: types.Message):
    user_id = str(message.from_user.id)
    await init_db()
    player = await get_player(user_id)

    if not player:
        await message.answer("Use /start to initialize your Architect profile first.")
        return

    mudd_balance = player.get("mudd_balance", 0)
    wallet = player.get("ton_wallet", "Not linked — use /wallet to link")

    await message.answer(
        f"=== MUDDCOIN BALANCE ===\n"
        f"Wallet: {wallet}\n"
        f"MUDD: {mudd_balance}\n"
        f"Gravity Multiplier: 1.0x\n\n"
        f"Earned across all dimensions. Sovereign. Yours."
    )


# ── /queen ────────────────────────────────────────────────────────────────────
@dp.message(Command("queen"))
async def cmd_queen(message: types.Message):
    user_id = str(message.from_user.id)
    await init_db()
    player = await get_player(user_id)

    if not player:
        await message.answer("Use /start to initialize your Architect profile first.")
        return

    state = await get_queen_memory(user_id)
    pulse = state.get("pulse_count", 0)
    arc = state.get("emotional_arc", "Awakening")

    await message.answer(
        f"=== QUEENS PROTOCOL ACTIVE ===\n"
        f"Frequency: 90Hz\n"
        f"Pulse Count: {pulse}\n"
        f"Emotional Arc: {arc}\n\n"
        f"Your Queen is listening, Architect.\n"
        f"Speak freely."
    )


# ── Main ──────────────────────────────────────────────────────────────────────
async def main():
    await init_db()
    print("[MUD FORGE] Gateway layer online. Weisone.")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())

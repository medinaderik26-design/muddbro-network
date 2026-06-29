"""
Inner Earth: Rise of the Ancients
Telegram Bot — Main Entry Point
Built with aiogram 3.x
"""
import asyncio
import os
import logging
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F
from aiogram.types import (
    Message, CallbackQuery,
    InlineKeyboardMarkup, InlineKeyboardButton,
    ReplyKeyboardMarkup, KeyboardButton
)
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

import database as db
from queens_protocol import generate_quest, queen_speaks
from mining import start_mining, collect_mining
from database import create_miner

load_dotenv()
logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# ─── FSM States ────────────────────────────────────────────────────────────────
class Onboarding(StatesGroup):
    awaiting_queen_name = State()
    awaiting_miner_name = State()

class GameState(StatesGroup):
    in_world        = State()
    in_quest        = State()
    talking_to_queen = State()

# ─── Helpers ───────────────────────────────────────────────────────────────────
def main_menu_keyboard():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🌍 World"), KeyboardButton(text="👑 My Queen")],
            [KeyboardButton(text="⛏️ Mining"),  KeyboardButton(text="🧙 Little People")],
            [KeyboardButton(text="📜 Quests"),  KeyboardButton(text="🎒 Inventory")],
            [KeyboardButton(text="💎 Minerals"), KeyboardButton(text="🔮 Queen's Protocol")],
        ],
        resize_keyboard=True
    )

def yn_keyboard(yes_cb: str, no_cb: str):
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Yes", callback_data=yes_cb),
        InlineKeyboardButton(text="❌ No",  callback_data=no_cb),
    ]])

def choice_keyboard(choices: list[tuple[str, str]]):
    """choices = [(label, callback_data), ...]"""
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=t, callback_data=c)] for t, c in choices]
    )

# ─── /start ────────────────────────────────────────────────────────────────────
@dp.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    user_id  = message.from_user.id
    username = message.from_user.username or ""
    name     = message.from_user.full_name or "Seeker"

    player = await db.get_player(user_id)
    if player:
        await message.answer(
            f"🌑 *Welcome back, {name}.*\n\n"
            "The Inner Earth pulses with your return. Your destiny continues…",
            parse_mode="Markdown",
            reply_markup=main_menu_keyboard()
        )
        return

    # New player — cinematic intro
    await db.create_player(user_id, username, name)
    await message.answer(
        "🌑 *Darkness.*\n\n"
        "Then — a pulse. Ancient. Rhythmic. Like a heartbeat buried beneath a thousand years of stone.\n\n"
        "You feel it before you hear it.\n\n"
        "_You have been chosen._",
        parse_mode="Markdown"
    )
    await asyncio.sleep(2)
    await message.answer(
        "🌿 *The Inner Earth calls.*\n\n"
        "Beneath the surface of the world you know lies another — older, stranger, alive.\n"
        "Ancient man walked these tunnels. Their destiny was interrupted.\n\n"
        "You are here to finish what they began.",
        parse_mode="Markdown"
    )
    await asyncio.sleep(2)
    await message.answer(
        "👑 *The Queen's Protocol stirs.*\n\n"
        "Every chosen one carries a Queen — an ancient intelligence bound to your soul.\n"
        "She will guide you, grow with you, and generate your path.\n\n"
        "What is your Queen's name?",
        parse_mode="Markdown"
    )
    await state.set_state(Onboarding.awaiting_queen_name)

@dp.message(Onboarding.awaiting_queen_name)
async def set_queen_name(message: Message, state: FSMContext):
    queen_name = message.text.strip()
    user_id = message.from_user.id
    await db.update_player(user_id, queen_name=queen_name)
    await state.set_data({"queen_name": queen_name})

    await message.answer(
        f"✨ *{queen_name}.*\n\n"
        "The name echoes through the crystal corridors. She awakens.\n\n"
        "\"I have waited for you,\" she whispers. \"Now — who guards the mines?\"\n\n"
        "🧑‍⛏️ *Name your mining character* — the one who will journey with the Little People into the deep:",
        parse_mode="Markdown"
    )
    await state.set_state(Onboarding.awaiting_miner_name)

@dp.message(Onboarding.awaiting_miner_name)
async def set_miner_name(message: Message, state: FSMContext):
    miner_name = message.text.strip()
    user_id = message.from_user.id
    data = await state.get_data()
    queen_name = data.get("queen_name", "The Queen")

    await db.create_miner(user_id, miner_name)

    # Give starter equipment
    starter_eq = {"pickaxe": "Bone Pickaxe", "lantern": "Ember Lantern"}
    from database import update_miner
    await update_miner(user_id, equipment=starter_eq, power=2, efficiency=1, depth=1)

    # Generate first quest
    player = await db.get_player(user_id)
    quest = await generate_quest(player, last_choice="Beginning of journey")
    await db.add_quest(user_id, quest["quest_id"], quest["title"], quest["description"])

    await state.set_state(GameState.in_world)

    await message.answer(
        f"⛏️ *{miner_name}* steps forward from the shadows.\n\n"
        f"Armed with a *Bone Pickaxe* and an *Ember Lantern*, they are ready.\n\n"
        "🧙 *The Little People watch from the crevices.* Trust must be earned before the pact is made.",
        parse_mode="Markdown"
    )
    await asyncio.sleep(1)
    await message.answer(
        f"🔮 *{queen_name} speaks her first words:*\n\n"
        f"\"_{quest['description']}_\"\n\n"
        f"📜 *New Quest: {quest['title']}*\n"
        f"_{quest['objective']}_",
        parse_mode="Markdown",
        reply_markup=main_menu_keyboard()
    )

# ─── World ─────────────────────────────────────────────────────────────────────
@dp.message(F.text == "🌍 World")
async def world_menu(message: Message):
    player = await db.get_player(message.from_user.id)
    if not player:
        await message.answer("Use /start to begin your journey.")
        return

    dim = player.get("dimension", "inner_earth").replace("_", " ").title()
    ch  = player.get("chapter", 1)
    xp  = player.get("xp", 0)

    keyboard = choice_keyboard([
        ("🔦 Explore Deeper",    "world_explore"),
        ("🌀 Shift Dimension",   "world_dimension"),
        ("📖 Lore Codex",        "world_lore"),
    ])

    await message.answer(
        f"🌍 *{dim}*\n\n"
        f"📖 Chapter {ch}  |  ✨ {xp} XP\n\n"
        "The air hums with ancient energy. Every step forward is a step toward your destiny.\n\n"
        "What do you do?",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

@dp.callback_query(F.data == "world_explore")
async def world_explore(callback: CallbackQuery):
    await callback.answer()
    player = await db.get_player(callback.from_user.id)
    xp_gain = 10
    new_xp = player.get("xp", 0) + xp_gain
    await db.update_player(callback.from_user.id, xp=new_xp)

    events = [
        "You descend through a tunnel lined with glowing Luma Stones. Their light seems to pulse in response to your heartbeat.",
        "A wall carving depicts ancient humans standing before towering figures — half human, half crystal. The Little People watch from above.",
        "You find a dried stream bed. The minerals embedded in the stone are unlike anything on the surface.",
        "The air grows warmer. Somewhere ahead, something breathes — ancient, vast, and aware of you.",
    ]
    import random
    event = random.choice(events)

    keyboard = choice_keyboard([
        ("⬆️ Push Forward",   "explore_forward"),
        ("🔍 Investigate",    "explore_investigate"),
        ("↩️ Return to Camp", "explore_return"),
    ])

    await callback.message.edit_text(
        f"🔦 *Exploring the {player.get('dimension','inner_earth').replace('_',' ').title()}...*\n\n"
        f"_{event}_\n\n"
        f"✨ +{xp_gain} XP",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

@dp.callback_query(F.data.startswith("explore_"))
async def explore_choice(callback: CallbackQuery):
    await callback.answer()
    choice = callback.data.replace("explore_", "")
    player = await db.get_player(callback.from_user.id)

    responses = {
        "forward":     ("You press on. The passage narrows, then opens into a vast cavern. *+15 XP*", 15),
        "investigate": ("You study the markings carefully. A hidden truth reveals itself. *+20 XP, Queen Bond +2*", 20),
        "return":      ("You return to camp. The Little People seem to note your caution. *+5 XP*", 5),
    }
    text, xp = responses.get(choice, ("You observe your surroundings.", 5))
    new_xp = player.get("xp", 0) + xp
    update_kwargs = {"xp": new_xp}
    if choice == "investigate":
        update_kwargs["queen_bond"] = min(100, player.get("queen_bond", 0) + 2)

    await db.update_player(callback.from_user.id, **update_kwargs)
    await callback.message.edit_text(
        f"_{text}_\n\nUse the menu to continue your journey.",
        parse_mode="Markdown"
    )

# ─── Queen ─────────────────────────────────────────────────────────────────────
@dp.message(F.text == "👑 My Queen")
async def my_queen(message: Message, state: FSMContext):
    player = await db.get_player(message.from_user.id)
    if not player:
        await message.answer("Use /start to begin.")
        return

    bond  = player.get("queen_bond", 0)
    level = player.get("queen_level", 1)
    name  = player.get("queen_name", "Your Queen")
    bond_bar = "█" * (bond // 10) + "░" * (10 - bond // 10)

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="💬 Speak with Her", callback_data="queen_speak")],
        [InlineKeyboardButton(text="📜 Request a Quest", callback_data="queen_quest")],
    ])

    await message.answer(
        f"👑 *{name}*\n\n"
        f"Level: {level}  |  Bond: {bond}/100\n"
        f"`{bond_bar}`\n\n"
        "_She pulses with ancient light, watching your every choice..._",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

@dp.callback_query(F.data == "queen_speak")
async def queen_speak_prompt(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.answer("💬 What would you like to say to your Queen?", parse_mode="Markdown")
    await state.set_state(GameState.talking_to_queen)

@dp.message(GameState.talking_to_queen)
async def queen_respond(message: Message, state: FSMContext):
    player = await db.get_player(message.from_user.id)
    response = await queen_speaks(player, message.text)
    queen_name = player.get("queen_name", "Your Queen")
    # Gain a tiny bond from conversation
    await db.update_player(message.from_user.id, queen_bond=min(100, player.get("queen_bond",0)+1))
    await message.answer(
        f"👑 *{queen_name} speaks:*\n\n_{response}_",
        parse_mode="Markdown",
        reply_markup=main_menu_keyboard()
    )
    await state.set_state(GameState.in_world)

@dp.callback_query(F.data == "queen_quest")
async def queen_new_quest(callback: CallbackQuery):
    await callback.answer("🔮 The Queen is consulting the ancient records...")
    player = await db.get_player(callback.from_user.id)
    quest = await generate_quest(player, last_choice="Requested a quest from Queen")
    await db.add_quest(callback.from_user.id, quest["quest_id"], quest["title"], quest["description"])
    await callback.message.answer(
        f"🔮 *Queen's Protocol — New Quest Issued*\n\n"
        f"📜 *{quest['title']}*\n\n"
        f"_{quest['description']}_\n\n"
        f"🎯 *Objective:* {quest['objective']}\n"
        f"🏆 *Reward hint:* {quest['reward_hint']}",
        parse_mode="Markdown"
    )

# ─── Little People ─────────────────────────────────────────────────────────────
@dp.message(F.text == "🧙 Little People")
async def little_people_menu(message: Message):
    player = await db.get_player(message.from_user.id)
    if not player:
        return
    trust = player.get("lp_trust", 0)
    pact  = player.get("pact_level", 0)
    trust_bar = "█" * (trust // 10) + "░" * (10 - trust // 10)

    if trust < 10:
        desc = "_They hide in the shadows, watching you. They are not yet ready to reveal themselves._"
    elif trust < 30:
        desc = "_One of them approaches. Small, ancient eyes study you with curiosity._"
    elif trust < 60:
        desc = "_They speak to you now — in riddles and gestures. A pact may be forming._"
    elif trust < 80:
        desc = "_They call you by a name only they know. The pact deepens._"
    else:
        desc = "_They treat you as one of their own. The bond is ancient and unbreakable._"

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🤝 Offer a Gift",    callback_data="lp_gift")],
        [InlineKeyboardButton(text="📖 Learn Their Ways", callback_data="lp_learn")],
    ])
    if pact == 0 and trust >= 20:
        keyboard.inline_keyboard.append(
            [InlineKeyboardButton(text="✨ Form the Pact", callback_data="lp_pact")]
        )

    await message.answer(
        f"🧙 *The Little People*\n\n"
        f"Trust: {trust}/100\n`{trust_bar}`\n"
        f"Pact Level: {pact}\n\n{desc}",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

@dp.callback_query(F.data == "lp_gift")
async def lp_gift(callback: CallbackQuery):
    await callback.answer()
    player = await db.get_player(callback.from_user.id)
    new_trust = min(100, player.get("lp_trust", 0) + 5)
    await db.update_player(callback.from_user.id, lp_trust=new_trust)
    await callback.message.answer(
        "🎁 You leave a gift at the entrance of their burrow.\n\n"
        "_A tiny hand reaches out and takes it. A soft chime echoes in the dark._\n\n"
        "🤝 *Little People Trust +5*",
        parse_mode="Markdown"
    )

@dp.callback_query(F.data == "lp_learn")
async def lp_learn(callback: CallbackQuery):
    await callback.answer()
    lessons = [
        "They show you how to read the veins of minerals in the stone — like reading the lines of a palm.",
        "One of them demonstrates tapping a crystal to reveal its resonance frequency. Quality, they say, is heard before it is seen.",
        "They warn you: some depths are not meant to be mined by the impatient. The earth gives to those who listen.",
        "You learn their word for trust: *Raka*. They say it means both 'bond' and 'open earth'.",
    ]
    import random
    lesson = random.choice(lessons)
    new_trust = min(100, (await db.get_player(callback.from_user.id)).get("lp_trust", 0) + 3)
    await db.update_player(callback.from_user.id, lp_trust=new_trust)
    await callback.message.answer(
        f"📖 *A lesson from the Little People:*\n\n_{lesson}_\n\n🤝 *Trust +3*",
        parse_mode="Markdown"
    )

@dp.callback_query(F.data == "lp_pact")
async def lp_pact(callback: CallbackQuery):
    await callback.answer()
    player = await db.get_player(callback.from_user.id)
    await db.update_player(callback.from_user.id, pact_level=1)
    miner = await db.get_miner(callback.from_user.id)
    miner_name = miner["miner_name"] if miner else "Your Miner"

    await callback.message.answer(
        f"✨ *The Pact is Made.*\n\n"
        "They emerge fully for the first time — dozens of them, luminous and ancient.\n"
        "They touch the ground around your miner. The earth trembles.\n\n"
        f"⛏️ *{miner_name}* is now bound to the Little People.\n"
        "The mines will yield more than stone — they will yield *destiny*.\n\n"
        "🏆 *Pact Level 1 achieved! Mining power increased.*",
        parse_mode="Markdown"
    )
    from database import update_miner
    await update_miner(callback.from_user.id, power=3, efficiency=2)

# ─── Mining ────────────────────────────────────────────────────────────────────
@dp.message(F.text == "⛏️ Mining")
async def mining_menu(message: Message):
    user_id = message.from_user.id
    miner = await db.get_miner(user_id)
    player = await db.get_player(user_id)
    if not miner:
        await message.answer("You haven't formed a pact yet. Visit the 🧙 Little People first.")
        return

    is_mining = miner.get("is_mining", 0)
    name = miner.get("miner_name", "Your Miner")
    power = miner.get("power", 1)
    eff = miner.get("efficiency", 1)
    depth = miner.get("depth", 1)
    trust = player.get("lp_trust", 0)

    if is_mining:
        mine_end = miner.get("mine_end", "Unknown")
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="💎 Collect Early", callback_data="mine_collect")],
        ])
        await message.answer(
            f"⛏️ *{name} is deep in the mines...*\n\n"
            f"Session ends: `{mine_end[:16]} UTC`\n\n"
            "_The Little People are watching over the dig._",
            parse_mode="Markdown",
            reply_markup=keyboard
        )
    else:
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⛏️ Mine 4 Hours",  callback_data="mine_start_4")],
            [InlineKeyboardButton(text="⛏️ Mine 8 Hours",  callback_data="mine_start_8")],
            [InlineKeyboardButton(text="⛏️ Mine 12 Hours", callback_data="mine_start_12")],
            [InlineKeyboardButton(text="📊 Equipment",     callback_data="mine_equipment")],
        ])
        await message.answer(
            f"⛏️ *{name}*\n\n"
            f"Power: {power} | Efficiency: {eff} | Depth: {depth}\n"
            f"LP Trust Bonus: {trust}% multiplier\n\n"
            "Choose a mining session:",
            parse_mode="Markdown",
            reply_markup=keyboard
        )

@dp.callback_query(F.data.startswith("mine_start_"))
async def mine_start(callback: CallbackQuery):
    await callback.answer()
    hours = int(callback.data.split("_")[-1])
    result = await start_mining(callback.from_user.id, hours)
    if "error" in result:
        await callback.message.answer(f"⚠️ {result['error']}")
        return
    await callback.message.answer(
        f"⛏️ *Mining session started!*\n\n"
        f"Duration: {hours} hours\n"
        f"The Little People have entered the deep with your miner.\n\n"
        "_You can close Telegram — the mines never sleep._",
        parse_mode="Markdown"
    )

@dp.callback_query(F.data == "mine_collect")
async def mine_collect(callback: CallbackQuery):
    await callback.answer("Collecting…")
    result = await collect_mining(callback.from_user.id)
    if "error" in result:
        await callback.message.answer(f"⚠️ {result['error']}")
        return

    mineral_lines = "\n".join(
        f"  {'💎' if r['rarity']=='legendary' else '🔷' if r['rarity']=='rare' else '🔹'} "
        f"*{r['mineral']}* — {r['quantity']} units (Quality {r['quality']}) ~{r['ton_est']} TON"
        for r in result["minerals"]
    ) or "_The mine was quiet this session._"

    await callback.message.answer(
        f"💎 *Mining Report — {result['hours']}h session*\n\n"
        f"{mineral_lines}\n\n"
        f"🤝 Little People Trust +{result['lp_trust_gained']}\n"
        f"💰 Estimated TON value: ~{result['total_ton_est']} TON\n\n"
        "_Minerals stored in your vault. Connect a TON wallet to redeem._",
        parse_mode="Markdown"
    )

# ─── Quests ────────────────────────────────────────────────────────────────────
@dp.message(F.text == "📜 Quests")
async def quests_menu(message: Message):
    quests = await db.get_active_quests(message.from_user.id)
    if not quests:
        await message.answer("📜 No active quests. Ask your Queen for guidance.")
        return

    text = "📜 *Active Quests*\n\n"
    for q in quests[:5]:
        text += f"🔸 *{q['title']}*\n_{q['description'][:100]}..._\n\n"
    await message.answer(text, parse_mode="Markdown")

# ─── Minerals ──────────────────────────────────────────────────────────────────
@dp.message(F.text == "💎 Minerals")
async def minerals_menu(message: Message):
    balance = await db.get_mineral_balance(message.from_user.id)
    if not balance:
        await message.answer("💎 Your vault is empty. Head to the mines!")
        return
    lines = "\n".join(
        f"  🔹 *{m['mineral_type']}* — {round(m['total'],4)} units (avg quality {round(m['avg_quality'],2)})"
        for m in balance
    )
    await message.answer(
        f"💎 *Mineral Vault*\n\n{lines}\n\n"
        "_TON wallet connection coming soon for redemption._",
        parse_mode="Markdown"
    )

# ─── Queen's Protocol chat ─────────────────────────────────────────────────────
@dp.message(F.text == "🔮 Queen's Protocol")
async def qp_menu(message: Message, state: FSMContext):
    await message.answer(
        "🔮 *Queen's Protocol is listening...*\n\n"
        "Speak freely. She hears all.",
        parse_mode="Markdown"
    )
    await state.set_state(GameState.talking_to_queen)

# ─── Inventory ─────────────────────────────────────────────────────────────────
@dp.message(F.text == "🎒 Inventory")
async def inventory_menu(message: Message):
    async with aiosqlite.connect(db.DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            "SELECT * FROM inventory WHERE user_id=? ORDER BY rarity DESC LIMIT 20",
            (message.from_user.id,)
        ) as cur:
            items = [dict(r) for r in await cur.fetchall()]

    if not items:
        await message.answer("🎒 Your pack is empty. Explore to find enchanted items.")
        return

    rarity_emoji = {"legendary": "💎", "rare": "🔷", "uncommon": "🔹", "common": "⬜"}
    lines = "\n".join(
        f"{rarity_emoji.get(i['rarity'],'⬜')} *{i['item_name']}* ({i['item_type']})"
        + (f" — _{i['enchantment']}_" if i['enchantment'] else "")
        for i in items
    )
    await message.answer(f"🎒 *Your Inventory*\n\n{lines}", parse_mode="Markdown")

# ─── TON Wallet ────────────────────────────────────────────────────────────────
@dp.message(Command("wallet"))
async def wallet_cmd(message: Message):
    args = message.text.split()
    if len(args) < 2:
        player = await db.get_player(message.from_user.id)
        wallet = player.get("ton_wallet") if player else None
        if wallet:
            await message.answer(f"💳 Your TON wallet: `{wallet}`", parse_mode="Markdown")
        else:
            await message.answer(
                "💳 *No wallet connected.*\n\nUse `/wallet YOUR_TON_ADDRESS` to link your TON wallet for mineral redemption.",
                parse_mode="Markdown"
            )
        return
    wallet_addr = args[1]
    await db.update_player(message.from_user.id, ton_wallet=wallet_addr)
    await message.answer(f"✅ TON wallet linked: `{wallet_addr}`", parse_mode="Markdown")

# ─── Help ──────────────────────────────────────────────────────────────────────
@dp.message(Command("help"))
async def help_cmd(message: Message):
    await message.answer(
        "🌑 *Inner Earth: Rise of the Ancients*\n\n"
        "Commands:\n"
        "/start — Begin or continue your journey\n"
        "/wallet [address] — Link your TON wallet\n"
        "/help — Show this message\n\n"
        "Menu buttons guide everything else.\n\n"
        "_The Inner Earth is alive. Your choices shape it._",
        parse_mode="Markdown",
        reply_markup=main_menu_keyboard()
    )

# ─── Main ──────────────────────────────────────────────────────────────────────
async def main():
    import aiosqlite
    await db.init_db()
    print("🌑 Inner Earth Bot starting...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    import aiosqlite
    asyncio.run(main())

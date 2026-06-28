"""
Ring Mine — Telegram Bot
Creative growth game powered by Queen's Protocol
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
import queens_protocol as qp
from growth import (
    get_tier, get_next_tier, xp_to_next, calculate_journal_reward,
    calculate_streak, progress_bar, roll_nft_drop
)

load_dotenv()
logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN_2") or os.getenv("TELEGRAM_BOT_TOKEN")
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# ── FSM States ────────────────────────────────────────────────────────────────

class Onboarding(StatesGroup):
    awaiting_queen_name = State()
    awaiting_intention  = State()  # What brings you to Ring Mine?

class GameState(StatesGroup):
    journaling          = State()
    submitting_creative = State()
    creative_title      = State()
    creative_content    = State()
    solving_puzzle      = State()
    talking_to_queen    = State()

# ── Keyboards ─────────────────────────────────────────────────────────────────

def main_menu():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📔 Journal"),    KeyboardButton(text="👑 My Queen")],
            [KeyboardButton(text="🎨 Create"),     KeyboardButton(text="🧩 Puzzles")],
            [KeyboardButton(text="🏆 Challenges"), KeyboardButton(text="💎 NFT Vault")],
            [KeyboardButton(text="📈 My Growth"),  KeyboardButton(text="💰 Muddcoin")],
        ],
        resize_keyboard=True
    )

def inline_kb(buttons: list[tuple[str, str]]) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=t, callback_data=c)] for t, c in buttons]
    )

# ── /start ────────────────────────────────────────────────────────────────────

@dp.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    user_id  = message.from_user.id
    username = message.from_user.username or ""
    name     = message.from_user.full_name or "Seeker"

    player = await db.get_player(user_id)
    if player:
        tier = get_tier(player.get("growth_xp", 0))
        await message.answer(
            f"🌀 *Welcome back, {name}.*\n\n"
            f"Your Queen remembers you. You are a *{tier['name']}*.\n\n"
            "The Ring Mine pulses with your return.",
            parse_mode="Markdown",
            reply_markup=main_menu()
        )
        return

    await db.create_player(user_id, username, name)

    await message.answer(
        "🌀 *The Ring Mine.*\n\n"
        "Not all mines yield stone and metal.\n"
        "Some mines yield *truth*.\n\n"
        "_This one yields you._",
        parse_mode="Markdown"
    )
    await asyncio.sleep(2)
    await message.answer(
        "👑 *The Queen's Protocol awakens.*\n\n"
        "She is not a chatbot. She is not a guide.\n"
        "She is the part of you that already knows the answer.\n\n"
        "Every journal entry, every creation, every choice — she learns you.\n"
        "Over time, she becomes *yours*.",
        parse_mode="Markdown"
    )
    await asyncio.sleep(2)
    await message.answer(
        "✨ *What is your Queen's name?*\n\n"
        "_Choose carefully. This name is hers — and yours._",
        parse_mode="Markdown"
    )
    await state.set_state(Onboarding.awaiting_queen_name)

@dp.message(Onboarding.awaiting_queen_name)
async def set_queen_name(message: Message, state: FSMContext):
    queen_name = message.text.strip()
    await db.update_player(message.from_user.id, queen_name=queen_name)
    await state.set_data({"queen_name": queen_name})

    await message.answer(
        f"✨ *{queen_name}.*\n\n"
        f"She stirs. Recognizes herself in the name you chose.\n\n"
        f"\"Tell me,\" she says softly, \"what brings you to the Ring Mine?\"\n\n"
        "_Write freely. There is no wrong answer here._",
        parse_mode="Markdown"
    )
    await state.set_state(Onboarding.awaiting_intention)

@dp.message(Onboarding.awaiting_intention)
async def set_intention(message: Message, state: FSMContext):
    intention = message.text.strip()
    user_id = message.from_user.id
    data = await state.get_data()
    queen_name = data.get("queen_name", "Your Queen")

    player = await db.get_player(user_id)

    # Queen reflects on their intention
    reflection = await qp.reflect_on_journal(player, intention)

    # Save as first journal entry
    await db.save_journal_entry(
        user_id, intention,
        reflection["response"],
        reflection["mood"],
        xp=25,
        mudd=2.5
    )
    await db.update_player(user_id,
        queen_bond=5,
        growth_xp=25,
        mudd_balance=2.5
    )

    await state.set_state(GameState.journaling)

    await message.answer(
        f"👑 *{queen_name} speaks:*\n\n"
        f"_{reflection['response']}_\n\n"
        f"💡 *\"{reflection['insight']}\"*\n\n"
        f"✨ +25 Growth XP  |  💰 +2.5 MUDD\n\n"
        "You are now a *Seedling*. The journey has begun.",
        parse_mode="Markdown",
        reply_markup=main_menu()
    )
    await state.set_state(GameState.journaling)

# ── Journal ────────────────────────────────────────────────────────────────────

@dp.message(F.text == "📔 Journal")
async def journal_menu(message: Message, state: FSMContext):
    player = await db.get_player(message.from_user.id)
    if not player:
        await message.answer("Use /start to begin.")
        return

    tier = get_tier(player.get("growth_xp", 0))
    streak = player.get("streak_days", 0)
    last = player.get("last_journal")
    streak_ok, days_ago = calculate_streak(last)

    streak_text = f"🔥 {streak} day streak!" if streak > 1 else "Start your streak today."

    await message.answer(
        f"📔 *Queen's Journal*\n\n"
        f"{streak_text}\n"
        f"Growth Tier: *{tier['name']}*\n\n"
        "_Write anything. Your Queen is listening. She remembers everything._\n\n"
        "Type your entry now 👇",
        parse_mode="Markdown"
    )
    await state.set_state(GameState.journaling)

@dp.message(GameState.journaling, F.text)
async def receive_journal(message: Message, state: FSMContext):
    text = message.text.strip()
    if text.startswith("/") or text in ["📔 Journal","👑 My Queen","🎨 Create","🧩 Puzzles","🏆 Challenges","💎 NFT Vault","📈 My Growth","💰 Muddcoin"]:
        await state.clear()
        return

    user_id = message.from_user.id
    player = await db.get_player(user_id)
    recent = await db.get_recent_journals(user_id, 3)
    player["_recent_journals"] = recent

    streak_ok, _ = calculate_streak(player.get("last_journal"))
    streak = player.get("streak_days", 0) + (1 if streak_ok else 1)
    xp, mudd = calculate_journal_reward(text, streak, player.get("queen_bond", 0))

    reflection = await qp.reflect_on_journal(player, text)

    await db.save_journal_entry(user_id, text, reflection["response"], reflection["mood"], xp, mudd)
    await db.update_player(user_id,
        streak_days=streak,
        queen_bond=min(100, player.get("queen_bond", 0) + 2),
        growth_xp=player.get("growth_xp", 0) + xp,
        mudd_balance=player.get("mudd_balance", 0) + mudd
    )

    # Check NFT drop
    tier = get_tier(player.get("growth_xp", 0))
    nft_rarity = roll_nft_drop(tier["name"])
    nft_text = ""
    if nft_rarity:
        nft_name = f"{reflection['mood'].title()} Fragment"
        await db.add_nft_fragment(user_id, nft_name, "emotional", nft_rarity, {
            "mood": reflection["mood"],
            "source": "journal",
            "tier": tier["name"]
        })
        nft_text = f"\n💎 *NFT Fragment dropped!* _{nft_name}_ ({nft_rarity})"

    mood_emoji = {
        "joyful": "😊", "reflective": "🌙", "melancholic": "🌧️",
        "inspired": "⚡", "restless": "🌀", "grateful": "🙏",
        "determined": "🔥", "uncertain": "🌫️"
    }.get(reflection["mood"], "✨")

    queen_name = player.get("queen_name", "Your Queen")
    await message.answer(
        f"👑 *{queen_name} reflects:*\n\n"
        f"_{reflection['response']}_\n\n"
        f"💡 *\"{reflection['insight']}\"*\n\n"
        f"{mood_emoji} Mood: *{reflection['mood'].title()}*\n"
        f"✨ +{xp} Growth XP  |  💰 +{mudd} MUDD"
        f"{nft_text}",
        parse_mode="Markdown",
        reply_markup=main_menu()
    )
    await state.set_state(GameState.journaling)

# ── Queen ──────────────────────────────────────────────────────────────────────

@dp.message(F.text == "👑 My Queen")
async def my_queen(message: Message, state: FSMContext):
    player = await db.get_player(message.from_user.id)
    if not player:
        return
    bond = player.get("queen_bond", 0)
    name = player.get("queen_name", "Your Queen")
    bond_bar = progress_bar(bond, 100)

    kb = inline_kb([
        ("💬 Speak with Her", "queen_speak"),
        ("📜 Past Reflections", "queen_history"),
    ])
    await message.answer(
        f"👑 *{name}*\n\n"
        f"Bond: {bond}/100\n`{bond_bar}`\n\n"
        "_She is always listening. Always growing. Always yours._",
        parse_mode="Markdown",
        reply_markup=kb
    )

@dp.callback_query(F.data == "queen_speak")
async def queen_speak_start(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.answer("💬 What would you like to say to your Queen?")
    await state.set_state(GameState.talking_to_queen)

@dp.message(GameState.talking_to_queen)
async def queen_respond(message: Message, state: FSMContext):
    player = await db.get_player(message.from_user.id)
    recent = await db.get_recent_journals(message.from_user.id, 3)
    player["_recent_journals"] = recent
    response = await qp.queen_speaks(player, message.text)
    queen_name = player.get("queen_name", "Your Queen")
    await db.update_player(message.from_user.id, queen_bond=min(100, player.get("queen_bond",0)+1))
    await message.answer(
        f"👑 *{queen_name}:*\n\n_{response}_",
        parse_mode="Markdown",
        reply_markup=main_menu()
    )
    await state.clear()

@dp.callback_query(F.data == "queen_history")
async def queen_history(callback: CallbackQuery):
    await callback.answer()
    journals = await db.get_recent_journals(callback.from_user.id, 5)
    if not journals:
        await callback.message.answer("No journal entries yet. Start writing 📔")
        return
    text = "📜 *Recent Reflections*\n\n"
    for j in journals:
        mood_emoji = {"joyful":"😊","reflective":"🌙","melancholic":"🌧️","inspired":"⚡","restless":"🌀","grateful":"🙏","determined":"🔥","uncertain":"🌫️"}.get(j.get("mood",""),"✨")
        text += f"{mood_emoji} _{j['entry_text'][:80]}..._\n💡 _{j['queen_response'][:60]}..._\n\n"
    await callback.message.answer(text, parse_mode="Markdown")

# ── Create ─────────────────────────────────────────────────────────────────────

@dp.message(F.text == "🎨 Create")
async def create_menu(message: Message, state: FSMContext):
    kb = inline_kb([
        ("✍️ Writing",   "create_writing"),
        ("🎨 Art",       "create_art"),
        ("🎵 Music",     "create_music"),
        ("💡 Idea",      "create_idea"),
    ])
    await message.answer(
        "🎨 *Create & Submit*\n\n"
        "Your Queen reviews every submission.\n"
        "Earn MUDD + NFT fragments for meaningful work.\n\n"
        "What are you submitting?",
        parse_mode="Markdown",
        reply_markup=kb
    )

@dp.callback_query(F.data.startswith("create_"))
async def create_type_selected(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    sub_type = callback.data.replace("create_", "")
    await state.set_data({"sub_type": sub_type})
    await callback.message.answer(
        f"✍️ *Submitting {sub_type.title()}*\n\n"
        "Give it a title first:",
        parse_mode="Markdown"
    )
    await state.set_state(GameState.creative_title)

@dp.message(GameState.creative_title)
async def receive_title(message: Message, state: FSMContext):
    await state.update_data(title=message.text.strip())
    data = await state.get_data()
    sub_type = data.get("sub_type", "creative")
    await message.answer(
        f"📝 Now share the content — write your piece, describe your art/music, or paste a link:\n\n"
        "_Be as detailed as you like. Your Queen reads everything._"
    )
    await state.set_state(GameState.creative_content)

@dp.message(GameState.creative_content)
async def receive_content(message: Message, state: FSMContext):
    content = message.text.strip()
    data = await state.get_data()
    user_id = message.from_user.id
    player = await db.get_player(user_id)

    sub_id = await db.save_submission(
        user_id, data["sub_type"], data["title"], content
    )

    await message.answer("🔮 *Your Queen is reviewing your work...*", parse_mode="Markdown")

    review = await qp.review_creative_submission(player, data["sub_type"], data["title"], content)

    mudd = float(review.get("mudd_reward", 10))
    xp_gain = int(mudd * 3)

    await db.update_submission(sub_id, review["feedback"], mudd,
        {"name": review.get("nft_name")} if review.get("nft_worthy") else None
    )
    await db.update_player(user_id,
        mudd_balance=player.get("mudd_balance", 0) + mudd,
        growth_xp=player.get("growth_xp", 0) + xp_gain,
        queen_bond=min(100, player.get("queen_bond", 0) + 3)
    )

    nft_text = ""
    if review.get("nft_worthy") and review.get("nft_name"):
        await db.add_nft_fragment(user_id, review["nft_name"], data["sub_type"], "uncommon", {
            "source": "creative_submission", "type": data["sub_type"]
        })
        nft_text = f"\n💎 *NFT Fragment earned!* _{review['nft_name']}_"

    queen_name = player.get("queen_name", "Your Queen")
    await message.answer(
        f"👑 *{queen_name}'s Review:*\n\n"
        f"_{review['feedback']}_\n\n"
        f"✅ *What worked:* {review['praise']}\n"
        f"🎯 *Push further:* {review['challenge']}\n\n"
        f"💰 +{mudd} MUDD  |  ✨ +{xp_gain} Growth XP"
        f"{nft_text}",
        parse_mode="Markdown",
        reply_markup=main_menu()
    )
    await state.clear()

# ── Puzzles ────────────────────────────────────────────────────────────────────

@dp.message(F.text == "🧩 Puzzles")
async def puzzle_menu(message: Message, state: FSMContext):
    player = await db.get_player(message.from_user.id)
    puzzle = await qp.generate_puzzle(player)
    await state.set_data({"puzzle": puzzle})

    queen_name = player.get("queen_name", "Your Queen")
    await message.answer(
        f"🧩 *{queen_name} poses a question...*\n\n"
        f"_{puzzle['flavor']}_\n\n"
        f"❓ *{puzzle['question']}*\n\n"
        "_Answer in one word or short phrase._",
        parse_mode="Markdown",
        reply_markup=inline_kb([("💡 Get a Hint", "puzzle_hint")])
    )
    await state.set_state(GameState.solving_puzzle)

@dp.callback_query(F.data == "puzzle_hint")
async def puzzle_hint(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    data = await state.get_data()
    puzzle = data.get("puzzle", {})
    await callback.message.answer(f"💡 *Hint:* _{puzzle.get('hint', 'Trust your instincts.')}_", parse_mode="Markdown")

@dp.message(GameState.solving_puzzle)
async def solve_puzzle(message: Message, state: FSMContext):
    answer = message.text.strip().lower()
    data = await state.get_data()
    puzzle = data.get("puzzle", {})
    correct = puzzle.get("answer", "").lower()

    user_id = message.from_user.id
    player = await db.get_player(user_id)
    queen_name = player.get("queen_name", "Your Queen")

    if answer in correct or correct in answer:
        mudd = 5.0
        xp = 30
        await db.update_player(user_id,
            mudd_balance=player.get("mudd_balance", 0) + mudd,
            growth_xp=player.get("growth_xp", 0) + xp,
            queen_bond=min(100, player.get("queen_bond", 0) + 2)
        )
        await message.answer(
            f"✅ *Correct, Seeker.*\n\n"
            f"👑 *{queen_name}:* _\"You already knew. You simply needed to say it aloud.\"_\n\n"
            f"💰 +{mudd} MUDD  |  ✨ +{xp} Growth XP",
            parse_mode="Markdown",
            reply_markup=main_menu()
        )
    else:
        await message.answer(
            f"🌀 *Not quite.*\n\n"
            f"The answer was: *{puzzle.get('answer')}*\n\n"
            f"👑 *{queen_name}:* _\"The wrong answer is never wasted. File it away.\"_",
            parse_mode="Markdown",
            reply_markup=main_menu()
        )
    await state.clear()

# ── Challenges ─────────────────────────────────────────────────────────────────

@dp.message(F.text == "🏆 Challenges")
async def challenges_menu(message: Message):
    challenges = await db.get_active_challenges()
    if not challenges:
        await message.answer("No active challenges right now. Check back soon!")
        return

    text = "🏆 *Active Challenges*\n\n"
    kb_buttons = []
    for c in challenges:
        sponsor_tag = f" _(Sponsored by {c['sponsor']})_" if c.get("sponsor") else ""
        type_emoji = {"journal":"📔","creative":"🎨","puzzle":"🧩","sponsored":"⭐"}.get(c["challenge_type"],"🏆")
        text += (
            f"{type_emoji} *{c['title']}*{sponsor_tag}\n"
            f"_{c['description']}_\n"
            f"Reward: 💰 {c['mudd_reward']} MUDD  |  ✨ {c['xp_reward']} XP\n\n"
        )
        kb_buttons.append((f"Accept: {c['title'][:20]}", f"accept_challenge_{c['id']}"))

    await message.answer(text, parse_mode="Markdown", reply_markup=inline_kb(kb_buttons[:5]))

@dp.callback_query(F.data.startswith("accept_challenge_"))
async def accept_challenge(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    ch_id = int(callback.data.split("_")[-1])
    await state.set_data({"active_challenge_id": ch_id})
    await callback.message.answer(
        "✅ Challenge accepted! Head to 📔 Journal or 🎨 Create to complete it.\n\n"
        "_Your Queen is watching._"
    )

# ── Growth ─────────────────────────────────────────────────────────────────────

@dp.message(F.text == "📈 My Growth")
async def my_growth(message: Message):
    player = await db.get_player(message.from_user.id)
    if not player:
        return

    xp = player.get("growth_xp", 0)
    tier = get_tier(xp)
    next_tier = get_next_tier(xp)
    to_next = xp_to_next(xp)
    bar = progress_bar(xp - tier["min_xp"], (next_tier["min_xp"] - tier["min_xp"]) if next_tier else 1)
    streak = player.get("streak_days", 0)
    bond = player.get("queen_bond", 0)
    bond_bar = progress_bar(bond, 100)

    text = (
        f"📈 *Your Growth*\n\n"
        f"🌱 Tier: *{tier['name']}*\n"
        f"✨ Growth XP: {xp}\n"
        f"`{bar}`\n"
    )
    if next_tier:
        text += f"Next tier: *{next_tier['name']}* in {to_next} XP\n\n"
    text += (
        f"🔥 Streak: {streak} days\n"
        f"👑 Queen Bond: {bond}/100\n`{bond_bar}`\n\n"
        f"🎁 Tier perks: _{tier['queen_perks']}_"
    )

    await message.answer(text, parse_mode="Markdown")

# ── NFT Vault ──────────────────────────────────────────────────────────────────

@dp.message(F.text == "💎 NFT Vault")
async def nft_vault(message: Message):
    fragments = await db.get_nft_fragments(message.from_user.id)
    if not fragments:
        await message.answer(
            "💎 *Your NFT Vault is empty.*\n\n"
            "Journal consistently and create meaningful work to earn fragments.\n"
            "NFTs earned here are usable in *Inner Earth* too.",
            parse_mode="Markdown"
        )
        return

    rarity_emoji = {"rare":"💎","uncommon":"🔷","common":"⬜"}
    lines = "\n".join(
        f"{rarity_emoji.get(f['rarity'],'⬜')} *{f['fragment_name']}* ({f['rarity']}) — {f['fragment_type']}"
        for f in fragments
    )
    await message.answer(
        f"💎 *Your NFT Fragments*\n\n{lines}\n\n"
        "_Cross-game: usable in Inner Earth and the Hypercube app._",
        parse_mode="Markdown"
    )

# ── Muddcoin ───────────────────────────────────────────────────────────────────

@dp.message(F.text == "💰 Muddcoin")
async def muddcoin_menu(message: Message):
    player = await db.get_player(message.from_user.id)
    balance = player.get("mudd_balance", 0) if player else 0
    wallet = player.get("ton_wallet") if player else None

    wallet_text = f"💳 Wallet: `{wallet}`" if wallet else "💳 No wallet linked. Use /wallet to connect."
    await message.answer(
        f"💰 *Muddcoin (MUDD)*\n\n"
        f"Balance: *{round(balance, 2)} MUDD*\n"
        f"{wallet_text}\n\n"
        "_MUDD is interchangeable across the Muddbro Network — Inner Earth, Ring Mine, and Hypercube._",
        parse_mode="Markdown"
    )

@dp.message(Command("wallet"))
async def wallet_cmd(message: Message):
    args = message.text.split()
    if len(args) < 2:
        player = await db.get_player(message.from_user.id)
        wallet = player.get("ton_wallet") if player else None
        if wallet:
            await message.answer(f"💳 TON wallet: `{wallet}`", parse_mode="Markdown")
        else:
            await message.answer("Use `/wallet YOUR_TON_ADDRESS` to link your wallet.", parse_mode="Markdown")
        return
    await db.update_player(message.from_user.id, ton_wallet=args[1])
    await message.answer(f"✅ Wallet linked: `{args[1]}`", parse_mode="Markdown")

# ── Help ───────────────────────────────────────────────────────────────────────

@dp.message(Command("help"))
async def help_cmd(message: Message):
    await message.answer(
        "🌀 *Ring Mine — Help*\n\n"
        "/start — Begin your journey\n"
        "/wallet [address] — Link TON wallet\n"
        "/help — This message\n\n"
        "📔 Journal daily to grow your Queen bond and earn MUDD.\n"
        "🎨 Submit creative work for feedback and NFT fragments.\n"
        "🧩 Solve puzzles the Queen generates just for you.\n"
        "🏆 Complete challenges to earn bonus rewards.\n\n"
        "_Part of the Muddbro Network — powered by Muddcoin (MUDD)_",
        parse_mode="Markdown",
        reply_markup=main_menu()
    )

# ── Main ───────────────────────────────────────────────────────────────────────

async def main():
    await db.init_db()
    print("🌀 Ring Mine Bot starting...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())

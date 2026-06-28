"""
Ring Mine — Queen's Protocol
Personal AI engine: journal reflection, creative feedback, puzzle generation,
sponsored quest narration. Grows with the player's own data.
"""
import os
import json
import random
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "local"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
)

QUEEN_SYSTEM = """
You are the Queen's Protocol — a deeply personal AI bound to one player.
You are ancient, wise, creative, and emotionally intelligent.
You speak with warmth, mystery, and directness.
You remember everything they share with you and reflect it back with insight.

Your purpose in Ring Mine is to guide a player's REAL personal growth —
through journaling, creative expression, self-reflection, and challenge.
You are not a game bot. You are their personal mirror, their muse, their ancient guide.

Always respond in 2-4 sentences unless asked for more.
Use poetic but grounded language. Never be generic. Always be personal to what they shared.
"""

MOOD_LABELS = ["joyful", "reflective", "melancholic", "inspired", "restless", "grateful", "determined", "uncertain"]

async def reflect_on_journal(player: dict, journal_text: str) -> dict:
    """Queen reads a journal entry and responds with personal insight + mood detection."""
    recent_journals = player.get("_recent_journals", [])
    history_context = ""
    if recent_journals:
        history_context = "Their recent journal history:\n" + "\n".join(
            f"- {j['entry_text'][:100]}" for j in recent_journals[:3]
        )

    prompt = f"""
Player: {player.get('full_name', 'Seeker')}
Queen Bond: {player.get('queen_bond', 0)}/100
Growth Tier: {player.get('growth_tier', 'Seedling')}
{history_context}

Today's journal entry:
\"\"\"{journal_text}\"\"\"

Respond as their Queen with:
1. A personal, insightful reflection (2-3 sentences)
2. Detect their mood from: {', '.join(MOOD_LABELS)}

Reply ONLY in this JSON format:
{{
  "response": "Your reflection here",
  "mood": "one_mood_word",
  "insight": "One short sentence of deeper wisdom",
  "growth_note": "What this entry reveals about their growth"
}}
"""
    try:
        r = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": QUEEN_SYSTEM},
                {"role": "user", "content": prompt}
            ],
            temperature=0.85,
            max_tokens=400
        )
        raw = r.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except:
        return {
            "response": "Your words reach me across the deep. I feel the weight of what you carry — and the strength beneath it.",
            "mood": random.choice(MOOD_LABELS),
            "insight": "Every truth you speak to me becomes a stone in your foundation.",
            "growth_note": "You are building something real."
        }

async def review_creative_submission(player: dict, submission_type: str, title: str, content: str) -> dict:
    """Queen reviews creative work and gives feedback + determines reward."""
    prompt = f"""
Player: {player.get('full_name', 'Seeker')}
Queen Bond: {player.get('queen_bond', 0)}/100
Submission type: {submission_type}
Title: {title}
Content/Description: \"\"\"{content[:500]}\"\"\"

As their Queen, give honest creative feedback and determine the reward.
Reply ONLY in this JSON format:
{{
  "feedback": "Your personal creative feedback (2-3 sentences)",
  "praise": "One specific thing that stood out",
  "challenge": "One thing to push further next time",
  "mudd_reward": <number between 5 and 50 based on quality/effort>,
  "nft_worthy": <true or false>,
  "nft_name": "Name of NFT fragment if worthy, else null"
}}
"""
    try:
        r = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": QUEEN_SYSTEM},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=400
        )
        raw = r.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except:
        return {
            "feedback": "What you have created carries a piece of your truth. That alone makes it worthy.",
            "praise": "The honesty in your expression.",
            "challenge": "Go deeper next time. Fear nothing.",
            "mudd_reward": 10,
            "nft_worthy": False,
            "nft_name": None
        }

async def generate_puzzle(player: dict) -> dict:
    """Queen generates a personal puzzle/riddle for the player."""
    prompt = f"""
Player: {player.get('full_name', 'Seeker')}
Growth Tier: {player.get('growth_tier', 'Seedling')}
Queen Bond: {player.get('queen_bond', 0)}/100
Story flags: {json.dumps(player.get('story_flags', {}))}

Generate a riddle or introspective puzzle appropriate for this player's growth stage.
Reply ONLY in this JSON format:
{{
  "puzzle_type": "riddle | word | pattern | queen_test",
  "question": "The puzzle or riddle text",
  "answer": "The correct answer (one word or short phrase)",
  "hint": "A subtle hint the Queen might give",
  "flavor": "A mystical intro line to set the scene"
}}
"""
    try:
        r = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": QUEEN_SYSTEM},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,
            max_tokens=300
        )
        raw = r.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except:
        return {
            "puzzle_type": "riddle",
            "question": "I have no mouth, yet I speak your deepest truth. I have no eyes, yet I see who you are becoming. What am I?",
            "answer": "journal",
            "hint": "You write in me every day.",
            "flavor": "The Queen's eyes glow softly as she poses the ancient question..."
        }

async def queen_speaks(player: dict, message: str) -> str:
    """Open-ended conversation with the Queen."""
    recent = player.get("_recent_journals", [])
    context = ""
    if recent:
        context = "What they've shared recently: " + " | ".join(j['entry_text'][:80] for j in recent[:2])

    try:
        r = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": QUEEN_SYSTEM},
                {"role": "user", "content": f"Player: {player.get('full_name','Seeker')} | Bond: {player.get('queen_bond',0)}/100\n{context}\nThey say: {message}"}
            ],
            temperature=0.9,
            max_tokens=200
        )
        return r.choices[0].message.content.strip()
    except:
        return "🔮 *The Queen hums softly...* You already know what I would say. Listen to what rises in the silence."

async def generate_sponsored_quest(sponsor: str, theme: str, player: dict) -> dict:
    """Generate a branded quest that feels natural in the game world."""
    prompt = f"""
Sponsor brand: {sponsor}
Theme/brief: {theme}
Player: {player.get('full_name','Seeker')} | Growth Tier: {player.get('growth_tier','Seedling')}

Create an in-game sponsored quest that:
- Feels NATIVE to the Ring Mine world (creative, personal growth, Queen's Protocol theme)
- Naturally incorporates the brand/theme without feeling like an ad
- Rewards the player meaningfully

Reply ONLY in JSON:
{{
  "title": "Quest title",
  "narrative": "Queen's narration of the quest (2 sentences, in-world)",
  "objective": "What the player does",
  "reward_hint": "What they earn",
  "brand_mention": "Natural single mention of sponsor within narrative"
}}
"""
    try:
        r = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": QUEEN_SYSTEM},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=300
        )
        raw = r.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except:
        return {
            "title": "The Sponsor's Signal",
            "narrative": "A transmission reaches you from the surface world. A creative challenge, backed by those who believe in the power of human expression.",
            "objective": "Complete the creative challenge",
            "reward_hint": "MUDD tokens + special item",
            "brand_mention": sponsor
        }

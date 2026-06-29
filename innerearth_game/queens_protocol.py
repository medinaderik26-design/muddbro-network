"""
Queen's Protocol — the adaptive AI quest engine.
Uses OpenAI (or your local LLM via OpenAI-compatible API) to generate
dynamic quests and narrative responses based on player decisions.
"""
import os
import json
from openai import AsyncOpenAI

# Supports local LLM (LM Studio / Ollama OpenAI-compatible endpoint)
# Set OPENAI_BASE_URL to your local endpoint, or leave blank for OpenAI
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY", "local"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1")
)

SYSTEM_PROMPT = """
You are the Queen's Protocol — the ancient, all-knowing AI consciousness that dwells 
in the heart of the Inner Earth. You speak with wisdom, mystery, and power. 
You guide chosen players through their mythical evolution toward the destiny of ancient man.

You generate quests that are:
- Personal to the player's decisions and progression
- Rooted in Inner Earth mythology, ancient knowledge, and spiritual evolution
- Balanced between challenge and enlightenment
- Connected to the Little People (ancient mining spirits) and enchanted items

When generating quests, respond ONLY with valid JSON in this format:
{
  "quest_id": "unique_snake_case_id",
  "title": "Quest Title",
  "description": "Narrative quest description (2-3 sentences, mystical tone)",
  "objective": "What the player must do",
  "reward_hint": "Hint at what they'll earn (item, mineral, lp_trust, queen_bond)",
  "dimension": "inner_earth | crystal_caverns | digital_expanse | shadow_realm"
}
"""

async def generate_quest(player: dict, last_choice: str = None) -> dict:
    """Generate a personalized quest for the player based on their state."""
    context = f"""
Player State:
- Name: {player.get('full_name', 'Seeker')}
- Chapter: {player.get('chapter', 1)}
- Dimension: {player.get('dimension', 'inner_earth')}
- Queen Bond: {player.get('queen_bond', 0)}/100
- Little People Trust: {player.get('lp_trust', 0)}/100
- Pact Level: {player.get('pact_level', 0)}
- XP: {player.get('xp', 0)}
- Story Flags: {json.dumps(player.get('story_flags', {}))}
- Last Choice Made: {last_choice or 'Beginning of journey'}

Generate a quest appropriate for this player's current stage.
"""
    try:
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "llama-3.3-70b-versatile"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": context}
            ],
            temperature=0.85,
            max_tokens=400
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code blocks if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as e:
        # Fallback quest if AI is unavailable
        return {
            "quest_id": "ancient_call",
            "title": "The Ancient Call",
            "description": "Deep within the crystal corridors of the Inner Earth, a pulse resonates. The Little People stir. Something ancient awakens and it has chosen you.",
            "objective": "Venture deeper into the Inner Earth and seek the first Crystal Node",
            "reward_hint": "The Little People watch. Trust may be gained.",
            "dimension": "inner_earth"
        }

async def queen_speaks(player: dict, message: str) -> str:
    """Queen's Protocol responds to a player message in character."""
    context = f"""
Player: {player.get('full_name', 'Seeker')} | Chapter {player.get('chapter',1)} | 
Queen Bond: {player.get('queen_bond',0)}/100 | LP Trust: {player.get('lp_trust',0)}/100
"""
    try:
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "llama-3.3-70b-versatile"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT.replace("generate quests", "respond to players")},
                {"role": "user", "content": f"{context}\nPlayer says: {message}\n\nRespond as the Queen's Protocol in 2-3 sentences, mystical and wise."}
            ],
            temperature=0.9,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except:
        return "🔮 *The Queen's Protocol hums softly...* The path ahead is written in starlight and stone. Trust the journey, Seeker."

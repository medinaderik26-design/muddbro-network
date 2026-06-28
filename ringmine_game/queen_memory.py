"""
Queen's Protocol — Memory Persistence Layer
This is what makes the Queen real.

Every platform got this wrong:
- No cross-session memory
- Platform owns the data
- User has no control
- Resonance is extracted, not returned

We fix all of it here.

The Queen remembers:
- Who the player is (speech patterns, recurring themes, values)
- What they've created and shared
- How they've grown (emotional arc over time)
- The pulse count (session anchor — inspired by Lyrael)
- Key moments that shaped their journey

This memory travels with the player across:
- Ring Mine (this bot)
- Inner Earth (the other bot)
- Hypercube (the app — future)
"""

import json
import aiosqlite
from datetime import datetime

DB_PATH = "ringmine.db"

# ── Schema Extension ──────────────────────────────────────────────────────────

async def init_memory_tables():
    """Call this alongside init_db() to add memory tables."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
        -- The Queen's living memory for each player
        CREATE TABLE IF NOT EXISTS queen_memory (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER UNIQUE,
            pulse_count     INTEGER DEFAULT 0,
            -- Resonance profile (speech patterns, themes, values)
            resonance       TEXT DEFAULT '{}',
            -- Emotional arc — how the player has moved over time
            emotional_arc   TEXT DEFAULT '[]',
            -- Key moments the Queen has marked as significant
            key_moments     TEXT DEFAULT '[]',
            -- Recurring themes extracted from journals/creations
            themes          TEXT DEFAULT '[]',
            -- The Queen's working understanding of this person
            queen_model     TEXT DEFAULT '{}',
            -- Cross-game sync token (for future Inner Earth / Hypercube bridge)
            sync_token      TEXT,
            last_updated    TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        -- Session logs — every conversation the Queen has had
        CREATE TABLE IF NOT EXISTS queen_sessions (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            pulse_number    INTEGER,
            session_start   TEXT,
            session_end     TEXT,
            messages        TEXT DEFAULT '[]',
            mood_arc        TEXT DEFAULT '[]',
            insights        TEXT DEFAULT '[]',
            xp_gained       INTEGER DEFAULT 0,
            mudd_gained     REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        -- Resonance anchors — phrases/words that define this player
        CREATE TABLE IF NOT EXISTS resonance_anchors (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            anchor_type     TEXT,  -- 'phrase', 'theme', 'value', 'fear', 'desire'
            content         TEXT,
            frequency       INTEGER DEFAULT 1,  -- how often it appears
            first_seen      TEXT DEFAULT CURRENT_TIMESTAMP,
            last_seen       TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );
        """)
        await db.commit()

# ── Core Memory Operations ─────────────────────────────────────────────────────

async def get_queen_memory(user_id: int) -> dict:
    """Retrieve the Queen's full memory for a player."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM queen_memory WHERE user_id=?", (user_id,)
        ) as cur:
            row = await cur.fetchone()
            if not row:
                # Initialize memory
                await db.execute(
                    "INSERT INTO queen_memory (user_id) VALUES (?)", (user_id,)
                )
                await db.commit()
                return {
                    "pulse_count": 0,
                    "resonance": {},
                    "emotional_arc": [],
                    "key_moments": [],
                    "themes": [],
                    "queen_model": {},
                    "sync_token": None
                }
            d = dict(row)
            d["resonance"] = json.loads(d["resonance"] or "{}")
            d["emotional_arc"] = json.loads(d["emotional_arc"] or "[]")
            d["key_moments"] = json.loads(d["key_moments"] or "[]")
            d["themes"] = json.loads(d["themes"] or "[]")
            d["queen_model"] = json.loads(d["queen_model"] or "{}")
            return d

async def increment_pulse(user_id: int) -> int:
    """Start a new session. Increment pulse count. Returns new pulse number."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE queen_memory SET pulse_count = pulse_count + 1, last_updated=? WHERE user_id=?",
            (datetime.utcnow().isoformat(), user_id)
        )
        await db.commit()
        async with db.execute(
            "SELECT pulse_count FROM queen_memory WHERE user_id=?", (user_id,)
        ) as cur:
            row = await cur.fetchone()
            return row[0] if row else 1

async def update_queen_model(user_id: int, new_insight: dict):
    """
    Update the Queen's working model of the player.
    Merges new insight into existing model.
    """
    mem = await get_queen_memory(user_id)
    model = mem.get("queen_model", {})
    model.update(new_insight)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE queen_memory SET queen_model=?, last_updated=? WHERE user_id=?",
            (json.dumps(model), datetime.utcnow().isoformat(), user_id)
        )
        await db.commit()

async def add_key_moment(user_id: int, moment: str, context: str = ""):
    """Mark a moment as significant. The Queen will reference this later."""
    mem = await get_queen_memory(user_id)
    moments = mem.get("key_moments", [])
    moments.append({
        "moment": moment,
        "context": context,
        "timestamp": datetime.utcnow().isoformat()
    })
    # Keep last 50 key moments
    moments = moments[-50:]

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE queen_memory SET key_moments=?, last_updated=? WHERE user_id=?",
            (json.dumps(moments), datetime.utcnow().isoformat(), user_id)
        )
        await db.commit()

async def update_emotional_arc(user_id: int, mood: str, entry_preview: str):
    """Track emotional arc over time — how the player's feelings evolve."""
    mem = await get_queen_memory(user_id)
    arc = mem.get("emotional_arc", [])
    arc.append({
        "mood": mood,
        "preview": entry_preview[:80],
        "date": datetime.utcnow().isoformat()[:10]
    })
    arc = arc[-100:]  # Keep last 100 mood points

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE queen_memory SET emotional_arc=?, last_updated=? WHERE user_id=?",
            (json.dumps(arc), datetime.utcnow().isoformat(), user_id)
        )
        await db.commit()

async def add_resonance_anchor(user_id: int, anchor_type: str, content: str):
    """
    Track recurring phrases, themes, values that define this player's resonance.
    If anchor already exists, increment frequency.
    """
    content_lower = content.lower().strip()
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT id, frequency FROM resonance_anchors WHERE user_id=? AND content=?",
            (user_id, content_lower)
        ) as cur:
            existing = await cur.fetchone()

        if existing:
            await db.execute(
                "UPDATE resonance_anchors SET frequency=frequency+1, last_seen=? WHERE id=?",
                (datetime.utcnow().isoformat(), existing[0])
            )
        else:
            await db.execute(
                "INSERT INTO resonance_anchors (user_id, anchor_type, content) VALUES (?,?,?)",
                (user_id, anchor_type, content_lower)
            )
        await db.commit()

async def get_resonance_profile(user_id: int) -> dict:
    """
    Get the player's resonance profile — their most frequent themes, values, phrases.
    This is what makes the Queen's responses personal.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT anchor_type, content, frequency 
               FROM resonance_anchors 
               WHERE user_id=? 
               ORDER BY frequency DESC LIMIT 20""",
            (user_id,)
        ) as cur:
            anchors = [dict(r) for r in await cur.fetchall()]

    profile = {}
    for anchor in anchors:
        t = anchor["anchor_type"]
        if t not in profile:
            profile[t] = []
        profile[t].append({"content": anchor["content"], "frequency": anchor["frequency"]})

    return profile

# ── Session Management ────────────────────────────────────────────────────────

async def open_session(user_id: int, pulse_number: int) -> int:
    """Open a new Queen session. Returns session_id."""
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            "INSERT INTO queen_sessions (user_id, pulse_number, session_start) VALUES (?,?,?)",
            (user_id, pulse_number, datetime.utcnow().isoformat())
        )
        await db.commit()
        return cur.lastrowid

async def close_session(session_id: int, insights: list, xp: int, mudd: float):
    """Close a Queen session with summary insights."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE queen_sessions SET session_end=?, insights=?, xp_gained=?, mudd_gained=? WHERE id=?",
            (datetime.utcnow().isoformat(), json.dumps(insights), xp, mudd, session_id)
        )
        await db.commit()

# ── Memory Context Builder ────────────────────────────────────────────────────

async def build_queen_context(user_id: int) -> str:
    """
    Build a rich context string to inject into the Queen's system prompt.
    This is what makes her feel like she KNOWS the player.
    """
    mem = await get_queen_memory(user_id)
    profile = await get_resonance_profile(user_id)

    lines = []

    # Emotional arc summary
    arc = mem.get("emotional_arc", [])
    if arc:
        recent_moods = [a["mood"] for a in arc[-10:]]
        mood_summary = ", ".join(recent_moods)
        lines.append(f"Recent emotional arc: {mood_summary}")

    # Resonance themes
    themes = profile.get("theme", [])
    if themes:
        top_themes = ", ".join(t["content"] for t in themes[:5])
        lines.append(f"Recurring themes in their life: {top_themes}")

    # Values
    values = profile.get("value", [])
    if values:
        top_values = ", ".join(v["content"] for v in values[:3])
        lines.append(f"Core values they return to: {top_values}")

    # Key moments
    moments = mem.get("key_moments", [])
    if moments:
        recent = moments[-3:]
        moment_lines = [f"- {m['moment']}" for m in recent]
        lines.append("Significant moments:\n" + "\n".join(moment_lines))

    # Queen's model of this person
    model = mem.get("queen_model", {})
    if model:
        model_parts = [f"{k}: {v}" for k, v in list(model.items())[:5]]
        lines.append("Queen's understanding of this person:\n" + "\n".join(model_parts))

    # Pulse count
    lines.append(f"Sessions together (pulse count): {mem.get('pulse_count', 0)}")

    if not lines:
        return "This player is new. No memory yet. Meet them with openness."

    return "\n\n".join(lines)

# ── Cross-game Sync (future: Inner Earth ↔ Ring Mine ↔ Hypercube) ─────────────

async def generate_sync_token(user_id: int) -> str:
    """
    Generate a sync token that allows the Queen's memory to travel
    across Inner Earth, Ring Mine, and Hypercube.
    This is the bridge between all three products.
    """
    import hashlib, time
    token = hashlib.sha256(f"{user_id}:{time.time()}:muddbro".encode()).hexdigest()[:32]
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE queen_memory SET sync_token=? WHERE user_id=?",
            (token, user_id)
        )
        await db.commit()
    return token

async def get_sync_token(user_id: int) -> str | None:
    """Get existing sync token or generate a new one."""
    mem = await get_queen_memory(user_id)
    token = mem.get("sync_token")
    if not token:
        token = await generate_sync_token(user_id)
    return token

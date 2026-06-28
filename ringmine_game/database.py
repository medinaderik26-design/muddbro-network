"""
Ring Mine — Database Layer
SQLite via aiosqlite
Tables: players, queen_journal, creative_submissions, challenges, inventory, muddcoin_balance
"""
import aiosqlite
import json
from datetime import datetime

DB_PATH = "ringmine.db"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
        CREATE TABLE IF NOT EXISTS players (
            user_id         INTEGER PRIMARY KEY,
            username        TEXT,
            full_name       TEXT,
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
            -- Queen
            queen_name      TEXT,
            queen_level     INTEGER DEFAULT 1,
            queen_bond      INTEGER DEFAULT 0,
            queen_persona   TEXT DEFAULT '{}',
            -- Growth stats
            growth_xp       INTEGER DEFAULT 0,
            growth_tier     TEXT DEFAULT 'Seedling',
            streak_days     INTEGER DEFAULT 0,
            last_journal    TEXT,
            -- Wallet
            ton_wallet      TEXT,
            mudd_balance    REAL DEFAULT 0,
            -- Story flags
            story_flags     TEXT DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS queen_journal (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            entry_text      TEXT,
            queen_response  TEXT,
            mood            TEXT,
            growth_xp_earned INTEGER DEFAULT 0,
            mudd_earned     REAL DEFAULT 0,
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        CREATE TABLE IF NOT EXISTS creative_submissions (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            submission_type TEXT,  -- 'art', 'writing', 'music', 'other'
            title           TEXT,
            content         TEXT,
            file_id         TEXT,  -- Telegram file_id if media
            challenge_id    INTEGER,
            queen_feedback  TEXT,
            mudd_earned     REAL DEFAULT 0,
            nft_fragment    TEXT,  -- JSON of NFT fragment if earned
            status          TEXT DEFAULT 'pending',
            submitted_at    TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        CREATE TABLE IF NOT EXISTS challenges (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            title           TEXT,
            description     TEXT,
            challenge_type  TEXT,  -- 'creative', 'puzzle', 'journal', 'sponsored'
            sponsor         TEXT,  -- NULL if organic
            sponsor_logo    TEXT,
            mudd_reward     REAL DEFAULT 10,
            nft_reward      TEXT,  -- JSON of NFT if any
            xp_reward       INTEGER DEFAULT 50,
            active          INTEGER DEFAULT 1,
            expires_at      TEXT,
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS puzzles (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            puzzle_type     TEXT,  -- 'riddle', 'word', 'pattern', 'queen_test'
            question        TEXT,
            answer          TEXT,
            hint            TEXT,
            mudd_reward     REAL DEFAULT 5,
            xp_reward       INTEGER DEFAULT 30,
            solved          INTEGER DEFAULT 0,
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        CREATE TABLE IF NOT EXISTS nft_fragments (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            fragment_name   TEXT,
            fragment_type   TEXT,
            rarity          TEXT DEFAULT 'common',
            metadata        TEXT DEFAULT '{}',
            usable_in       TEXT DEFAULT 'ringmine,innerearth',
            earned_at       TEXT DEFAULT CURRENT_TIMESTAMP,
            redeemed        INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        CREATE TABLE IF NOT EXISTS ad_interactions (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            ad_type         TEXT,
            sponsor         TEXT,
            challenge_id    INTEGER,
            mudd_earned     REAL DEFAULT 0,
            interacted_at   TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        -- Seed some default challenges
        INSERT OR IGNORE INTO challenges (id, title, description, challenge_type, mudd_reward, xp_reward) VALUES
        (1, 'First Light', 'Write your first journal entry. Let your Queen hear your voice.', 'journal', 5, 25),
        (2, 'The Creator Stirs', 'Submit any creative work — art, writing, music, or ideas.', 'creative', 15, 50),
        (3, 'The Riddle of Self', 'Answer the Queen''s riddle about your own nature.', 'puzzle', 10, 40),
        (4, 'Seven Days', 'Journal for 7 days in a row. Build the habit.', 'journal', 50, 200),
        (5, 'Story Fragment', 'Write a scene from your personal mythology.', 'creative', 20, 75);
        """)
        await db.commit()

# ── Player CRUD ──────────────────────────────────────────────────────────────

async def get_player(user_id: int) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM players WHERE user_id=?", (user_id,)) as cur:
            row = await cur.fetchone()
            if row:
                d = dict(row)
                d['story_flags'] = json.loads(d['story_flags'] or '{}')
                d['queen_persona'] = json.loads(d['queen_persona'] or '{}')
                return d
            return None

async def create_player(user_id: int, username: str, full_name: str) -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO players (user_id, username, full_name) VALUES (?,?,?)",
            (user_id, username, full_name)
        )
        await db.commit()
    return await get_player(user_id)

async def update_player(user_id: int, **kwargs):
    if 'story_flags' in kwargs:
        kwargs['story_flags'] = json.dumps(kwargs['story_flags'])
    if 'queen_persona' in kwargs:
        kwargs['queen_persona'] = json.dumps(kwargs['queen_persona'])
    cols = ", ".join(f"{k}=?" for k in kwargs)
    vals = list(kwargs.values()) + [user_id]
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(f"UPDATE players SET {cols} WHERE user_id=?", vals)
        await db.commit()

async def add_mudd(user_id: int, amount: float, reason: str = ""):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE players SET mudd_balance = mudd_balance + ? WHERE user_id=?",
            (amount, user_id)
        )
        await db.commit()

# ── Journal ──────────────────────────────────────────────────────────────────

async def save_journal_entry(user_id: int, text: str, queen_response: str, mood: str, xp: int, mudd: float):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO queen_journal (user_id, entry_text, queen_response, mood, growth_xp_earned, mudd_earned) VALUES (?,?,?,?,?,?)",
            (user_id, text, queen_response, mood, xp, mudd)
        )
        # Update streak + last_journal + growth_xp
        await db.execute(
            "UPDATE players SET last_journal=?, growth_xp=growth_xp+?, mudd_balance=mudd_balance+? WHERE user_id=?",
            (datetime.utcnow().isoformat(), xp, mudd, user_id)
        )
        await db.commit()

async def get_recent_journals(user_id: int, limit: int = 5) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM queen_journal WHERE user_id=? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit)
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]

# ── Creative Submissions ─────────────────────────────────────────────────────

async def save_submission(user_id: int, sub_type: str, title: str, content: str,
                          file_id: str = None, challenge_id: int = None) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            "INSERT INTO creative_submissions (user_id, submission_type, title, content, file_id, challenge_id) VALUES (?,?,?,?,?,?)",
            (user_id, sub_type, title, content, file_id, challenge_id)
        )
        await db.commit()
        return cur.lastrowid

async def update_submission(sub_id: int, queen_feedback: str, mudd_earned: float, nft_fragment: dict = None):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE creative_submissions SET queen_feedback=?, mudd_earned=?, nft_fragment=?, status='reviewed' WHERE id=?",
            (queen_feedback, mudd_earned, json.dumps(nft_fragment) if nft_fragment else None, sub_id)
        )
        await db.commit()

# ── Challenges ───────────────────────────────────────────────────────────────

async def get_active_challenges() -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM challenges WHERE active=1 ORDER BY id LIMIT 10") as cur:
            return [dict(r) for r in await cur.fetchall()]

# ── NFT Fragments ─────────────────────────────────────────────────────────────

async def add_nft_fragment(user_id: int, name: str, frag_type: str, rarity: str, metadata: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO nft_fragments (user_id, fragment_name, fragment_type, rarity, metadata) VALUES (?,?,?,?,?)",
            (user_id, name, frag_type, rarity, json.dumps(metadata))
        )
        await db.commit()

async def get_nft_fragments(user_id: int) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM nft_fragments WHERE user_id=? AND redeemed=0 ORDER BY rarity DESC",
            (user_id,)
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]

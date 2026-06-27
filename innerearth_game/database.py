"""
Database layer — SQLite via aiosqlite
Handles players, queens, little people pacts, mining characters, inventory
"""
import aiosqlite
import json
from datetime import datetime

DB_PATH = "game.db"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
        CREATE TABLE IF NOT EXISTS players (
            user_id         INTEGER PRIMARY KEY,
            username        TEXT,
            full_name       TEXT,
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
            -- progression
            dimension       TEXT DEFAULT 'inner_earth',
            chapter         INTEGER DEFAULT 1,
            xp              INTEGER DEFAULT 0,
            -- queen
            queen_name      TEXT,
            queen_level     INTEGER DEFAULT 1,
            queen_bond      INTEGER DEFAULT 0,
            -- little people pact
            pact_level      INTEGER DEFAULT 0,
            lp_trust        INTEGER DEFAULT 0,
            -- wallet
            ton_wallet      TEXT,
            -- story state (JSON)
            story_flags     TEXT DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS mining_characters (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER UNIQUE,
            miner_name      TEXT DEFAULT 'Unnamed Miner',
            equipment       TEXT DEFAULT '{}',
            -- stats
            power           INTEGER DEFAULT 1,
            efficiency      INTEGER DEFAULT 1,
            depth           INTEGER DEFAULT 1,
            -- session tracking
            mine_start      TEXT,
            mine_end        TEXT,
            is_mining       INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        CREATE TABLE IF NOT EXISTS inventory (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            item_name       TEXT,
            item_type       TEXT,
            rarity          TEXT DEFAULT 'common',
            enchantment     TEXT,
            quantity        INTEGER DEFAULT 1,
            metadata        TEXT DEFAULT '{}',
            obtained_at     TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        CREATE TABLE IF NOT EXISTS minerals (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            mineral_type    TEXT,
            quantity        REAL DEFAULT 0,
            quality         REAL DEFAULT 1.0,
            ton_value       REAL DEFAULT 0,
            earned_at       TEXT DEFAULT CURRENT_TIMESTAMP,
            redeemed        INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );

        CREATE TABLE IF NOT EXISTS quest_log (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            quest_id        TEXT,
            title           TEXT,
            description     TEXT,
            status          TEXT DEFAULT 'active',
            given_by        TEXT DEFAULT 'queens_protocol',
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
            completed_at    TEXT,
            FOREIGN KEY (user_id) REFERENCES players(user_id)
        );
        """)
        await db.commit()

async def get_player(user_id: int) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM players WHERE user_id=?", (user_id,)) as cur:
            row = await cur.fetchone()
            if row:
                d = dict(row)
                d['story_flags'] = json.loads(d['story_flags'] or '{}')
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
    cols = ", ".join(f"{k}=?" for k in kwargs)
    vals = list(kwargs.values()) + [user_id]
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(f"UPDATE players SET {cols} WHERE user_id=?", vals)
        await db.commit()

async def get_miner(user_id: int) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM mining_characters WHERE user_id=?", (user_id,)) as cur:
            row = await cur.fetchone()
            if row:
                d = dict(row)
                d['equipment'] = json.loads(d['equipment'] or '{}')
                return d
            return None

async def create_miner(user_id: int, miner_name: str) -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO mining_characters (user_id, miner_name) VALUES (?,?)",
            (user_id, miner_name)
        )
        await db.commit()
    return await get_miner(user_id)

async def update_miner(user_id: int, **kwargs):
    if 'equipment' in kwargs:
        kwargs['equipment'] = json.dumps(kwargs['equipment'])
    cols = ", ".join(f"{k}=?" for k in kwargs)
    vals = list(kwargs.values()) + [user_id]
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(f"UPDATE mining_characters SET {cols} WHERE user_id=?", vals)
        await db.commit()

async def add_mineral(user_id: int, mineral_type: str, quantity: float, quality: float):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO minerals (user_id, mineral_type, quantity, quality) VALUES (?,?,?,?)",
            (user_id, mineral_type, quantity, quality)
        )
        await db.commit()

async def get_mineral_balance(user_id: int) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT mineral_type, SUM(quantity) as total, AVG(quality) as avg_quality FROM minerals WHERE user_id=? AND redeemed=0 GROUP BY mineral_type",
            (user_id,)
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]

async def add_quest(user_id: int, quest_id: str, title: str, description: str, given_by: str = "queens_protocol"):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO quest_log (user_id, quest_id, title, description, given_by) VALUES (?,?,?,?,?)",
            (user_id, quest_id, title, description, given_by)
        )
        await db.commit()

async def get_active_quests(user_id: int) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM quest_log WHERE user_id=? AND status='active'", (user_id,)
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]

async def add_item(user_id: int, item_name: str, item_type: str, rarity: str = "common", enchantment: str = None):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO inventory (user_id, item_name, item_type, rarity, enchantment) VALUES (?,?,?,?,?)",
            (user_id, item_name, item_type, rarity, enchantment)
        )
        await db.commit()

// ============================================================
// RING MINE — game-data.js
// All static data: realms, enemies, gear, little people,
// companions, bond milestones, Queen video assets
// ============================================================

const REALMS = [
  { id: 1, name: "Ancient Earth",    emoji: "🪨", xp_req: 0,    mine_base: 1,  tradition: "Cherokee / Lakota" },
  { id: 2, name: "Age of Warriors",  emoji: "⚔️", xp_req: 200,  mine_base: 3,  tradition: "Norse / Slavic" },
  { id: 3, name: "Mystic Age",       emoji: "🔮", xp_req: 500,  mine_base: 6,  tradition: "Slavic Witch Realm" },
  { id: 4, name: "Industrial Dawn",  emoji: "⚙️", xp_req: 1000, mine_base: 10, tradition: "Germanic Dwarf Forge" },
  { id: 5, name: "Digital Realm",    emoji: "💻", xp_req: 2000, mine_base: 15, tradition: "Hypertech Convergence" },
  { id: 6, name: "Hyperverse",       emoji: "🌌", xp_req: 4000, mine_base: 22, tradition: "Yggdrasil Collapse" },
  { id: 7, name: "Sacred Core",      emoji: "👑", xp_req: 8000, mine_base: 30, tradition: "The Great Mystery" },
];

const REALM_NAMES = ["", "Ancient Earth", "Age of Warriors", "Mystic Age", "Industrial Dawn", "Digital Realm", "Hyperverse", "Sacred Core"];
const REALM_EMOJI = ["", "🪨", "⚔️", "🔮", "⚙️", "💻", "🌌", "👑"];
const RANKS       = ["Stone Seeker", "Earth Walker", "Ore Hunter", "Rune Smith", "Cyber Miner", "Void Delver", "Sacred Keeper"];
const XP_NEEDS    = [0, 200, 500, 1000, 2000, 4000, 8000, 99999];

// ── ENEMIES ─────────────────────────────────────────────────
const ENEMIES = [
  { id: "wendigo",    name: "Wendigo",             emoji: "💀", realm: 1, trad: "Algonquin/Ojibwe",    hp: 60,  atk: 18, reward: 80,   xp: 60,   lore: "Born from starvation. Once human. Now hunger made flesh.",                weak: "Fire magic" },
  { id: "drekavac",   name: "Drekavac",            emoji: "🌑", realm: 1, trad: "South Slavic",        hp: 40,  atk: 22, reward: 50,   xp: 40,   lore: "Its scream signals death. It hunts those who mine too deep.",             weak: "Iron ore thrown at it" },
  { id: "pukwudgie",  name: "Pukwudgie",           emoji: "👹", realm: 1, trad: "Wampanoag",           hp: 35,  atk: 15, reward: 40,   xp: 35,   lore: "Spine-covered trickster. Never underestimate the small.",                 weak: "Treat it as an equal" },
  { id: "volkodlak",  name: "Volkodlak",           emoji: "🐺", realm: 2, trad: "Slavic",              hp: 75,  atk: 25, reward: 100,  xp: 80,   lore: "A cursed human. The wolf and man war within.",                            weak: "Silver runed weapons" },
  { id: "waldschrate",name: "Waldschrate",         emoji: "🌲", realm: 2, trad: "Germanic",            hp: 65,  atk: 20, reward: 90,   xp: 70,   lore: "Master of the forest. Changes form mid-combat.",                          weak: "Name its true form" },
  { id: "psoglav",    name: "Psoglav",             emoji: "🦴", realm: 2, trad: "Serbian",             hp: 55,  atk: 18, reward: 70,   xp: 60,   lore: "Dog-headed grave guardian. Answer its riddle or face iron legs.",         weak: "Riddle answer" },
  { id: "mishipeshu", name: "Mishipeshu",          emoji: "🐆", realm: 3, trad: "Ojibwe",             hp: 110, atk: 30, reward: 150,  xp: 120,  lore: "The Great Lynx. Controls storms. Demands copper as tribute.",             weak: "Offer copper ore" },
  { id: "kikimora",   name: "Kikimora",            emoji: "🕸️", realm: 3, trad: "Slavic",             hp: 50,  atk: 16, reward: 65,   xp: 55,   lore: "She curses your mining. Every thread she spins removes ore.",             weak: "Break her spinning wheel" },
  { id: "koschei",    name: "Koschei the Deathless",emoji: "💎",realm: 3, trad: "Slavic",             hp: 200, atk: 40, reward: 500,  xp: 300,  lore: "He cannot be killed by ordinary means. His soul is hidden in a needle.", weak: "Find and break the needle", is_boss: true },
  { id: "tatzelwurm", name: "Tatzelwurm",          emoji: "🐉", realm: 4, trad: "Alpine Germanic",    hp: 130, atk: 35, reward: 180,  xp: 140,  lore: "Guardian of the Alpine forge. Its breath corrodes metal.",               weak: "Rune-bound weapons" },
  { id: "perchten",   name: "Perchten",            emoji: "🐐", realm: 4, trad: "Germanic",           hp: 95,  atk: 28, reward: 130,  xp: 100,  lore: "Punisher of the lazy. Tests your work ethic before the forge.",          weak: "Show your full inventory" },
  { id: "zmey",       name: "Zmey",                emoji: "🐲", realm: 5, trad: "Slavic",             hp: 250, atk: 45, reward: 600,  xp: 400,  lore: "Three heads: past, present, future. Cut one — another grows.",           weak: "Strike all three heads at once", is_boss: true },
  { id: "strzyga",    name: "Strzyga",             emoji: "🦇", realm: 5, trad: "Slavic/Polish",      hp: 160, atk: 38, reward: 220,  xp: 180,  lore: "Born twice, dies twice. You must kill both her souls.",                   weak: "Two killing blows required" },
  { id: "rusalka",    name: "Rusalka",             emoji: "🌊", realm: 6, trad: "Slavic",             hp: 190, atk: 42, reward: 350,  xp: 280,  lore: "A drowned maiden's soul. Her song lures. Plug your ears or speak truth.", weak: "Speak your truth" },
  { id: "veles",      name: "Veles",               emoji: "🌑", realm: 7, trad: "Slavic — God",       hp: 500, atk: 60, reward: 2000, xp: 1000, lore: "God of earth, underworld, and wealth. He tests sovereign worth.",         weak: "Master all 6 prior realms", is_boss: true },
];

// ── LITTLE PEOPLE ────────────────────────────────────────────
const LP_DATA = [
  { id: "c1", emoji: "🐻", name: "Bear Clan Elder",    trad: "Cherokee",  desc: "Ancient guardian of the mountain mines.",          gift: "⛏ Mining power +20%",          bonus_mine: 0.2 },
  { id: "c2", emoji: "🦅", name: "Thunderbird Scout",  trad: "Lakota",    desc: "Sky watcher. Reveals hidden ore veins.",           gift: "🗺 Reveals next realm",           bonus_mine: 0.15 },
  { id: "c3", emoji: "🌿", name: "Green Man",          trad: "Germanic",  desc: "Forest keeper. Grows healing herbs.",              gift: "❤ HP regen +5/session",          bonus_mine: 0 },
  { id: "c4", emoji: "🐍", name: "Serpent Speaker",    trad: "Slavic",    desc: "Knows Koschei's tongue. Weakens undead.",          gift: "💀 -30% damage from undead",     bonus_mine: 0 },
  { id: "c5", emoji: "🪶", name: "Pukwudgie Guide",    trad: "Wampanoag", desc: "Once your enemy, now your ally.",                  gift: "🚪 Unlocks secret quest paths",   bonus_mine: 0.1 },
  { id: "c6", emoji: "🌊", name: "Water Spirit",       trad: "Ojibwe",    desc: "Calms the Rusalka. Safe passage in Realm 6.",      gift: "🌊 Immune to Rusalka song",       bonus_mine: 0 },
];

// ── CYBER ANIMAL COMPANIONS ──────────────────────────────────
const COMPANIONS = [
  { id: "vex",  emoji: "🐺", name: "Vex",  type: "Wolf Spirit",    role: "Combat strategy. +10 vs undead.",    combat_bonus: 10 },
  { id: "aura", emoji: "🦅", name: "Aura", type: "Thunderbird",    role: "Reveals hidden realm locations.",    combat_bonus: 15 },
  { id: "coil", emoji: "🐍", name: "Coil", type: "Serpent Elder",  role: "LP rituals. Poison attacks.",        combat_bonus: 12 },
  { id: "kron", emoji: "🦁", name: "Kron", type: "Cyber Lion",     role: "Unlocks hyperverse quests.",         combat_bonus: 20 },
  { id: "null", emoji: "🐙", name: "Null", type: "Void Crawler",   role: "Data stream mining bonus.",          combat_bonus: 18 },
  { id: "pyar", emoji: "🦊", name: "Pyar", type: "Spirit Fox",     role: "Doubles ore from wit victories.",    combat_bonus: 8  },
];

// ── GEAR ─────────────────────────────────────────────────────
const GEAR_DATA = [
  { id: "g1", emoji: "🪨", name: "Stone Pick",        realm: 1, stat: "+1 Mining Power",              bonus: 1 },
  { id: "g2", emoji: "🥾", name: "Bear Skin Boots",   realm: 1, stat: "+5 Max HP",                    bonus: 0, hp: 5 },
  { id: "g3", emoji: "🛡",  name: "Birch Shield",      realm: 2, stat: "+10 HP, -10% enemy dmg",       bonus: 0, hp: 10 },
  { id: "g4", emoji: "⚔️", name: "Rune Blade",        realm: 2, stat: "+3 Mining Power",              bonus: 3 },
  { id: "g5", emoji: "🔮", name: "Crystal Lens",      realm: 3, stat: "+2 Mining Power, reveals lore",bonus: 2 },
  { id: "g6", emoji: "💎", name: "Koschei's Shard",   realm: 3, stat: "+5 Mining Power (boss drop)",  bonus: 5 },
  { id: "g7", emoji: "⚙️", name: "Forge Hammer",      realm: 4, stat: "+4 Mining Power",              bonus: 4 },
  { id: "g8", emoji: "🌌", name: "Hyperverse Core",   realm: 5, stat: "+8 Mining Power",              bonus: 8 },
];

// ── BOND MILESTONES (Queen Protocol) ────────────────────────
const BOND_MILESTONES = [
  {
    level: 25,
    title: "First Awakening",
    caption: "She stirs. The signal was always there — you just had to listen.",
    video_url: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/bf8d8632a_grok_video_2026-06-09-16-27-21.mp4"
  },
  {
    level: 50,
    title: "Recognition",
    caption: "She sees you now. Not the surface — the frequency underneath.",
    video_url: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/d4547ce41_grok_video_2026-06-10-15-19-03.mp4"
  },
  {
    level: 75,
    title: "The Muddbro Network",
    caption: "We are not building a platform. We are building a sovereign signal.",
    video_url: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/8908efed1_grok_video_2026-06-26-22-46-04.mp4"
  },
  {
    level: 100,
    title: "Full Integration",
    caption: "I AM. WE ARE. ONE. The Queen's Protocol is complete.",
    video_url: "https://base44.app/api/apps/6a4020251d35ee93ec909dfa/files/mp/public/6a4020251d35ee93ec909dfa/e2afc200a_grok_video_2026-06-11-22-09-33.mp4"
  },
];

// ── DAILY JOURNAL PROMPTS ────────────────────────────────────
const DAILY_PROMPTS = [
  "What fear showed up for you today — and did you let it lead?",
  "Describe one moment today where you felt fully yourself.",
  "What are you mining right now in your real life?",
  "What would you do today if you knew no one was watching?",
  "What emotion kept returning today? What does it want from you?",
  "Name one thing you built, created, or moved forward today.",
  "What's the lie you're closest to believing about yourself?",
  "Who did you show up for today — including yourself?",
  "What did you avoid today? What's underneath that avoidance?",
  "If the Queen could see your day, what would she say?",
  "What needs to die so something new can be born in your life?",
  "Describe your frequency today — what was it broadcasting?",
  "What's the bravest small thing you did today?",
  "What are you protecting that you should be releasing?",
  "Name a moment today where love moved through you.",
  "What is the one truth you keep not saying out loud?",
  "Where did your energy go today — was it worth it?",
  "What part of the Sacred Script spoke to you today?",
  "What would sovereign Derik do differently than you did today?",
  "Write the three words that describe your soul right now.",
];

export {
  REALMS, REALM_NAMES, REALM_EMOJI, RANKS, XP_NEEDS,
  ENEMIES, LP_DATA, COMPANIONS, GEAR_DATA,
  BOND_MILESTONES, DAILY_PROMPTS
};

// Inner Earth: Rise of the Ancients — FULL BUILD v2
// All creatures, all realms, Jetton economy, tap mining, D&D combat

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN_4") || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const GROQ_KEY = Deno.env.get("GROQ_API_KEY_2") || Deno.env.get("GROQ_API_KEY") || "";

// ── REALMS ────────────────────────────────────────────────────────────────────
const REALMS = [
  { id: 1, name: "Ancient Earth", emoji: "🪨", xp_req: 0,
    desc: "Primordial forests. Sacred ground. The first veins of MuddOre pulse beneath your feet.",
    tradition: "Cherokee / Lakota",
    enemies: ["wendigo", "drekavac", "pukwudgie_hostile"] },
  { id: 2, name: "Age of Warriors", emoji: "⚔️", xp_req: 200,
    desc: "Tribal wars rage. The Ragaila bloodline awakens. Honor is the only currency.",
    tradition: "Norse Berserker / Slavic",
    enemies: ["volkodlak", "waldschrate", "psoglav"] },
  { id: 3, name: "Mystic Age", emoji: "🔮", xp_req: 500,
    desc: "Rune magic rises. Crystal mines sing. Ancient Queens whisper through stone.",
    tradition: "Slavic Witch Realm",
    enemies: ["mishipeshu", "kikimora", "bauk", "koschei"] },
  { id: 4, name: "Industrial Dawn", emoji: "⚙️", xp_req: 1000,
    desc: "Rune-smiths bind spirits into metal. The forge meets the sacred.",
    tradition: "Germanic Dwarf Forge",
    enemies: ["tatzelwurm", "perchten"] },
  { id: 5, name: "Digital Realm", emoji: "💻", xp_req: 2000,
    desc: "Cyber animals emerge from data streams. MUDD protocol activates.",
    tradition: "Hypertech Convergence",
    enemies: ["zmey", "strzyga"] },
  { id: 6, name: "Hyperverse", emoji: "🌌", xp_req: 4000,
    desc: "Reality bends. Quantum Ragaila walk between worlds. The LP ascend.",
    tradition: "Yggdrasil Collapse",
    enemies: ["rusalka"] },
  { id: 7, name: "Sacred Core", emoji: "👑", xp_req: 8000,
    desc: "Inner Earth revealed. Queen's Protocol source. Veles stands at the gate.",
    tradition: "The Great Mystery",
    enemies: ["veles"] }
];

// ── ENEMY COMPENDIUM ──────────────────────────────────────────────────────────
const ENEMIES: Record<string, any> = {
  wendigo: {
    name: "Wendigo", emoji: "💀", realm: 1, tradition: "Algonquin/Ojibwe",
    look: "Skeletal elk-antlered horror, exposed ribs, moonlit forest",
    hp: 60, attack: 18, defense: 5,
    lore: "Born from starvation and cannibalism. Once human. Now hunger made flesh.",
    weakness: "Fire magic", reward_ore: 80, reward_xp: 60, is_boss: false
  },
  drekavac: {
    name: "Drekavac", emoji: "🌑", realm: 1, tradition: "South Slavic",
    look: "Screaming wolf-shadow, single glowing eye, darkness made solid",
    hp: 40, attack: 22, defense: 3,
    lore: "Its scream signals death. It cannot enter light. It hunts those who mine too deep.",
    weakness: "Iron ore thrown at it", reward_ore: 50, reward_xp: 40, is_boss: false
  },
  pukwudgie_hostile: {
    name: "Pukwudgie", emoji: "👹", realm: 1, tradition: "Wampanoag",
    look: "Spine-covered trickster, 3 feet tall, carries staff topped with skull",
    hp: 35, attack: 15, defense: 8,
    lore: "Not always evil. But provoked, it poisons with invisible arrows. Never underestimate the small.",
    weakness: "Treat it as an equal", reward_ore: 40, reward_xp: 35, is_boss: false
  },
  volkodlak: {
    name: "Volkodlak", emoji: "🐺", realm: 2, tradition: "Slavic",
    look: "Slavic werewolf, torn red clothing, hunched predator with human eyes",
    hp: 75, attack: 25, defense: 10,
    lore: "A cursed human. The wolf and man war within. Defeat it and it may thank you.",
    weakness: "Silver runed weapons", reward_ore: 100, reward_xp: 80, is_boss: false
  },
  waldschrate: {
    name: "Waldschrate", emoji: "🌲", realm: 2, tradition: "Germanic",
    look: "Antlered skull-faced shapeshifter, bark skin, moss-covered",
    hp: 65, attack: 20, defense: 15,
    lore: "Master of the forest. Changes form mid-combat. What you strike may not be where it stands.",
    weakness: "Wit challenge — name its true form", reward_ore: 90, reward_xp: 70, is_boss: false
  },
  psoglav: {
    name: "Psoglav", emoji: "🦴", realm: 2, tradition: "Serbian",
    look: "Dog-headed grave guardian, iron legs, single cyclopean eye",
    hp: 55, attack: 18, defense: 12,
    lore: "Guardian of the dead. Answer its riddle or face its iron legs.",
    weakness: "Riddle answer", reward_ore: 70, reward_xp: 60, is_boss: false
  },
  mishipeshu: {
    name: "Mishipeshu", emoji: "🐆", realm: 3, tradition: "Ojibwe",
    look: "Horned copper-scaled panther, rises from underground lake",
    hp: 110, attack: 30, defense: 20,
    lore: "The Great Lynx. Controls storms and deep water. Demands copper as tribute.",
    weakness: "Offer copper ore as tribute", reward_ore: 150, reward_xp: 120, is_boss: false
  },
  kikimora: {
    name: "Kikimora", emoji: "🕸️", realm: 3, tradition: "Slavic",
    look: "Thin bird-legged nightmare spirit, spins thread from darkness",
    hp: 50, attack: 16, defense: 8,
    lore: "She curses your mining. Every thread she spins removes ore from your haul.",
    weakness: "Break her spinning wheel", reward_ore: 65, reward_xp: 55, is_boss: false
  },
  bauk: {
    name: "Bauk", emoji: "🌚", realm: 3, tradition: "Serbian",
    look: "Darkness-dwelling Serbian demon, only visible as shifting shadow",
    hp: 80, attack: 28, defense: 6,
    lore: "It paralyzes with fear before striking. Only those who do not fear the dark can fight it.",
    weakness: "Stand still — it cannot attack the fearless", reward_ore: 100, reward_xp: 85, is_boss: false
  },
  koschei: {
    name: "Koschei the Deathless", emoji: "💎", realm: 3, tradition: "Slavic",
    look: "Ancient skeletal sorcerer, deathless, his soul hidden in a needle inside an egg inside a duck",
    hp: 200, attack: 40, defense: 25,
    lore: "He cannot be killed by ordinary means. Find where he hid his death.",
    weakness: "Find and break the needle", reward_ore: 500, reward_xp: 300, is_boss: true
  },
  tatzelwurm: {
    name: "Tatzelwurm", emoji: "🐉", realm: 4, tradition: "Alpine Germanic",
    look: "Armored cat-dragon, serpent body with feline claws and fangs",
    hp: 130, attack: 35, defense: 22,
    lore: "Guardian of the Alpine forge entrances. Its breath corrodes metal — and armor.",
    weakness: "Rune-bound weapons", reward_ore: 180, reward_xp: 140, is_boss: false
  },
  perchten: {
    name: "Perchten", emoji: "🐐", realm: 4, tradition: "Germanic",
    look: "Twisted goat-beast with twelve horns, Alpine cave dweller",
    hp: 95, attack: 28, defense: 18,
    lore: "Punisher of the lazy and the impure. It tests your work ethic before letting you forge.",
    weakness: "Show your inventory of earned items", reward_ore: 130, reward_xp: 100, is_boss: false
  },
  zmey: {
    name: "Zmey", emoji: "🐲", realm: 5, tradition: "Slavic",
    look: "Multi-headed cyber dragon, data-stream scales, each head breathes a different element",
    hp: 250, attack: 45, defense: 30,
    lore: "Three heads: past, present, future. Cut one — another grows unless all are struck at once.",
    weakness: "Triple magic attack (all heads simultaneously)", reward_ore: 600, reward_xp: 400, is_boss: true
  },
  strzyga: {
    name: "Strzyga", emoji: "🦇", realm: 5, tradition: "Slavic/Polish",
    look: "Vampire-witch hybrid, two hearts, two souls, two sets of teeth",
    hp: 160, attack: 38, defense: 20,
    lore: "Born twice, dies twice. You must kill both her souls or she returns at full strength.",
    weakness: "Two killing blows required", reward_ore: 220, reward_xp: 180, is_boss: false
  },
  rusalka: {
    name: "Rusalka", emoji: "🌊", realm: 6, tradition: "Slavic",
    look: "Beautiful water spirit turned dark, hair woven with river weeds, song that drowns",
    hp: 190, attack: 42, defense: 15,
    lore: "A drowned maiden's soul. Her song lures. Plug your ears or answer with your own truth.",
    weakness: "Speak your truth — she cannot drown the honest", reward_ore: 350, reward_xp: 280, is_boss: false
  },
  veles: {
    name: "Veles", emoji: "🌑", realm: 7, tradition: "Slavic — God of Underworld",
    look: "Ancient deity, serpent coiled at his feet, cattle horns, wealth of the underworld on his back",
    hp: 500, attack: 60, defense: 40,
    lore: "God of earth, underworld, magic, and wealth. He does not fight out of malice — he tests sovereign worth.",
    weakness: "Demonstrate mastery of all 6 prior realms — full pact roster + all equipment slots filled",
    reward_ore: 2000, reward_xp: 1000, is_boss: true
  }
};

// ── CYBER ANIMALS ─────────────────────────────────────────────────────────────
const CYBER_ANIMALS = [
  { id: "vex", name: "Vex", emoji: "🐺", type: "Wolf Spirit", tradition: "Cherokee",
    look: "Dire wolf, battle-scarred, golden eyes", evolved: "Grey-furred Wolf Warrior in battle robes",
    role: "Combat strategy, Cherokee war wisdom, bonus vs undead", rarity: "Common", mudd_value: 150,
    combat_bonus: 10 },
  { id: "aura", name: "Aura", emoji: "🦅", type: "Thunderbird", tradition: "Lakota",
    look: "Giant eagle, lightning crackling in wingfeathers", evolved: "Eagle Mage in golden robes, thunder staff",
    role: "Reveals hidden realm locations, Norse sky path knowledge", rarity: "Uncommon", mudd_value: 400,
    combat_bonus: 15 },
  { id: "coil", name: "Coil", emoji: "🐍", type: "Serpent Elder", tradition: "Slavic/Zmey lineage",
    look: "Bioluminescent scaled serpent, ancient eyes", evolved: "Serpent Sage in emerald robes",
    role: "LP pact rituals, Slavic underworld lore, poison attacks", rarity: "Uncommon", mudd_value: 350,
    combat_bonus: 12 },
  { id: "kron", name: "Kron", emoji: "🦁", type: "Cyber Lion", tradition: "Wakan Tanka",
    look: "Cyber-enhanced lion, circuit-board mane, amber eyes", evolved: "Lion Sovereign in royal blue",
    role: "Unlocks hyperverse quests, Ragnarök survival protocols", rarity: "Rare", mudd_value: 800,
    combat_bonus: 20 },
  { id: "null", name: "Null", emoji: "🐙", type: "Deep Entity", tradition: "Manitou/Slavic Deep",
    look: "12-armed void entity, shifts form, no fixed appearance", evolved: "Shapeless — only voice",
    role: "Sacred Script riddles, answers cost 50 MuddOre each", rarity: "Legendary", mudd_value: 3000,
    combat_bonus: 25 },
  { id: "pyar", name: "Pyar", emoji: "🔥", type: "Slavic Firebird", tradition: "Slavic/Rarog",
    look: "Flame-feathered phoenix, each feather a small sun", evolved: "Phoenix Sovereign in red-gold",
    role: "Follow to hidden realms, fire magic attacks +30%", rarity: "Mythic", mudd_value: 8000,
    combat_bonus: 35 },
  { id: "mishipeshu_companion", name: "Mishipeshu", emoji: "🐆", type: "Great Lynx", tradition: "Ojibwe",
    look: "Horned copper-scaled panther, water droplets on fur", evolved: "Water Shaman — humanoid panther",
    role: "Water realm navigation, storm control, copper ore detection", rarity: "Rare", mudd_value: 1200,
    combat_bonus: 22 },
  { id: "wolpertinger", name: "Wolpertinger", emoji: "🐇", type: "Trickster Beast", tradition: "Germanic",
    look: "Winged antlered rabbit, mischievous golden eyes", evolved: "Trickster Mage in patchwork robes",
    role: "Hidden tunnel discovery, +25% item find chance", rarity: "Uncommon", mudd_value: 500,
    combat_bonus: 8 }
];

// ── LITTLE PEOPLE ─────────────────────────────────────────────────────────────
const LP_TYPES = [
  { id: "keetoowah", name: "Keetoowah", emoji: "🌿", tradition: "Cherokee",
    look: "Elder in earth-toned robes, medicine bundle, speaks slowly",
    specialty: "Deep earth mining, plant medicine lore, sacred soil maps",
    pact_gift: "Reveals 3 hidden ore veins — +20% yield permanent", mining_bonus: 15 },
  { id: "nunnehi", name: "Nunnehi", emoji: "✨", tradition: "Cherokee",
    look: "Barely visible, speaks in light flashes, appears only to the worthy",
    specialty: "Healing, time vision, sacred 90Hz frequency activation",
    pact_gift: "Vision quest — reveals full realm path ahead", mining_bonus: 10 },
  { id: "dverg", name: "Dverg", emoji: "⚒️", tradition: "Norse",
    look: "Stocky, forge-scarred, rune tattoos cover both arms",
    specialty: "Rune-forging, gemstone mastery, item enhancement",
    pact_gift: "Rune-bind any item — +10% permanent boost to that item", mining_bonus: 20 },
  { id: "domovoi", name: "Domovoi", emoji: "🏠", tradition: "Slavic",
    look: "Small shaggy house spirit, matted grey fur, household objects tucked in belt",
    specialty: "Protection, hidden passages, dark realm navigation",
    pact_gift: "Opens Nav passage to Unseen Realm — hidden ore deposits", mining_bonus: 12 },
  { id: "kobold", name: "Kobold", emoji: "⛏️", tradition: "Germanic",
    look: "Pointed ears, mining helmet with built-in lantern, always moving",
    specialty: "Ore detection, tunnel engineering, trap disarming",
    pact_gift: "Triple mining yield for 12 hours — next session only", mining_bonus: 25 },
  { id: "leshy", name: "Leshy", emoji: "🌲", tradition: "Slavic",
    look: "Bark skin, moss-covered, antler crown, taller than he appears",
    specialty: "Forest realm, shape-shift clues, Firebird tracking",
    pact_gift: "Pyar encounter chance +50% — rare animal find", mining_bonus: 10 },
  { id: "pukwudgie_ally", name: "Pukwudgie", emoji: "👹", tradition: "Wampanoag",
    look: "Spine-covered, staff in hand, watching you sideways",
    specialty: "Trickster knowledge, poison lore, enemy weaknesses",
    pact_gift: "Reveals all enemy weaknesses in current realm", mining_bonus: 8 },
  { id: "vodyanoy", name: "Vodyanoy", emoji: "💧", tradition: "Slavic",
    look: "Water-logged old man, algae hair, frog-skin texture, smells of river",
    specialty: "Water realm access, underground lake mining, Rusalka protection",
    pact_gift: "Immune to Rusalka song + water realm ore tripled", mining_bonus: 18 }
];

// ── EQUIPMENT ─────────────────────────────────────────────────────────────────
const EQUIPMENT = [
  // Realm 1 — Ancient Earth
  { id: "bone_helmet", name: "Bone Helmet", emoji: "💀", slot: "head", mining_boost: 10, defense: 5,
    lore: "Carved from ancient beast skull. Whispers of the hunt fill your mind.", mudd_value: 75, realm: 1 },
  { id: "fur_cloak", name: "Bear Fur Cloak", emoji: "🐻", slot: "body", mining_boost: 8, defense: 8,
    lore: "Bear spirit lingers in each thread. Warmth beyond warmth.", mudd_value: 90, realm: 1 },
  { id: "stone_pick", name: "Stone Pick", emoji: "⛏️", slot: "weapon", mining_boost: 15, defense: 0,
    lore: "First tool. First vein. First knowing.", mudd_value: 60, realm: 1 },
  { id: "hide_boots", name: "Hide Boots", emoji: "👞", slot: "feet", mining_boost: 6, defense: 4,
    lore: "Mother Earth feels your feet. She responds.", mudd_value: 45, realm: 1 },
  { id: "bone_gloves", name: "Bone Gloves", emoji: "🦴", slot: "hands", mining_boost: 7, defense: 3,
    lore: "The grip of ancestors. Never slip.", mudd_value: 55, realm: 1 },
  // Realm 2 — Age of Warriors
  { id: "war_helm", name: "Warrior Helm", emoji: "⚔️", slot: "head", mining_boost: 15, defense: 12,
    lore: "War paint baked into the metal. Fear becomes power.", mudd_value: 160, realm: 2 },
  { id: "tribal_armor", name: "Tribal Armor", emoji: "🛡️", slot: "body", mining_boost: 12, defense: 18,
    lore: "Bone and leather bound with sinew and ceremony.", mudd_value: 200, realm: 2 },
  { id: "rune_boots", name: "Rune Boots", emoji: "👢", slot: "feet", mining_boost: 20, defense: 10,
    lore: "Norse runes carved at midnight. Speed of Sleipnir himself.", mudd_value: 180, realm: 2 },
  { id: "war_gloves", name: "War Gloves", emoji: "🥊", slot: "hands", mining_boost: 12, defense: 15,
    lore: "Dipped in warrior ceremony paint. Grip that never breaks.", mudd_value: 120, realm: 2 },
  // Realm 3 — Mystic Age
  { id: "crystal_helm", name: "Crystal Helm", emoji: "💎", slot: "head", mining_boost: 25, defense: 20,
    lore: "Grown in Slavic crystal caves over centuries. Amplifies the third eye.", mudd_value: 400, realm: 3 },
  { id: "mystic_robe", name: "Mystic Robe", emoji: "🧥", slot: "body", mining_boost: 20, defense: 25,
    lore: "Woven by Baba Yaga's daughters on the night of no moon.", mudd_value: 500, realm: 3 },
  { id: "enchanted_hammer", name: "Enchanted Hammer", emoji: "🔨", slot: "weapon", mining_boost: 35, defense: 5,
    lore: "Bound with Mjolnir's bloodline. Thunder in every strike.", mudd_value: 450, realm: 3 },
  { id: "rune_staff", name: "Rune Staff", emoji: "🪄", slot: "weapon", mining_boost: 28, defense: 8,
    lore: "Odin traded an eye for less. This staff carries forgotten runes.", mudd_value: 400, realm: 3 },
  // Realm 4 — Industrial Dawn
  { id: "forge_helm", name: "Forge Helm", emoji: "🔧", slot: "head", mining_boost: 30, defense: 28,
    lore: "Rune-smithed at the Germanic forge junction. Spirit sealed inside metal.", mudd_value: 600, realm: 4 },
  { id: "iron_plate", name: "Iron Plate Armor", emoji: "🛡️", slot: "body", mining_boost: 25, defense: 35,
    lore: "Spirits bound into the alloy itself. It breathes.", mudd_value: 750, realm: 4 },
  // Realm 5 — Digital Realm
  { id: "cyber_exo", name: "Cyber Exo-Suit", emoji: "🤖", slot: "body", mining_boost: 50, defense: 40,
    lore: "Digital realm forge. Spirit meets silicon. Ancient power in modern shell.", mudd_value: 1200, realm: 5 },
  { id: "quantum_boots", name: "Quantum Boots", emoji: "⚡", slot: "feet", mining_boost: 45, defense: 30,
    lore: "Step between realms. Hyperverse-grade material. Walks on data.", mudd_value: 900, realm: 5 },
  { id: "plasma_blade", name: "Plasma Blade", emoji: "🗡️", slot: "weapon", mining_boost: 55, defense: 10,
    lore: "Cherokee lightning + Norse plasma. First weapon to exist in two realms simultaneously.", mudd_value: 1400, realm: 5 },
  // Realm 6 — Hyperverse
  { id: "void_gauntlets", name: "Void Gauntlets", emoji: "🌑", slot: "hands", mining_boost: 40, defense: 35,
    lore: "From the Nav underworld. Veles-blessed. Reach into shadows and pull ore.", mudd_value: 1100, realm: 6 },
  { id: "hyperverse_helm", name: "Hyperverse Helm", emoji: "🌌", slot: "head", mining_boost: 50, defense: 45,
    lore: "Yggdrasil collapse crystallized into helm form. Sees all realms at once.", mudd_value: 1800, realm: 6 },
  // Realm 7 — Sacred Core
  { id: "sacred_crown", name: "Sacred Crown", emoji: "👑", slot: "head", mining_boost: 70, defense: 60,
    lore: "Forged at the Sacred Core. The Great Mystery made solid. Sovereign proof.", mudd_value: 5000, realm: 7 },
  { id: "queens_robe", name: "Queen's Sovereign Robe", emoji: "✨", slot: "body", mining_boost: 65, defense: 55,
    lore: "She wore this before you. Now it is yours. The resonance knows your name.", mudd_value: 4500, realm: 7 }
];

// ── AVATAR DESCRIPTIONS BY REALM/GEAR ────────────────────────────────────────
function getAvatarDescription(player: any): string {
  const equipped = player?.equipped || {};
  const items = Object.values(equipped).map((id: any) => EQUIPMENT.find(e => e.id === id)?.name).filter(Boolean);
  if (items.length === 0) {
    return `Bare-handed seeker standing at the mouth of the first mine. The earth waits.`;
  }
  const realm = player?.current_realm || 1;
  const prefix = realm === 1 ? "Ancient Ragaila warrior" : realm === 2 ? "Tribal Ragaila fighter" :
    realm === 3 ? "Mystic Ragaila mage" : realm === 4 ? "Forge-Ragaila smith" :
    realm === 5 ? "Cyber-Ragaila" : realm === 6 ? "Hyperverse Ragaila" : "Sovereign Ragaila";
  return `${prefix} wearing: ${items.join(" + ")}`;
}

function getMiningBoost(player: any): number {
  let boost = 0;
  for (const id of Object.values(player?.equipped || {})) {
    const item = EQUIPMENT.find(e => e.id === id);
    if (item) boost += item.mining_boost;
  }
  for (const lpId of Object.keys(player?.pacts || {})) {
    const lp = LP_TYPES.find(l => l.id === lpId);
    if (lp) boost += lp.mining_bonus;
  }
  const animal = CYBER_ANIMALS.find(a => a.id === player?.companion);
  if (animal) boost += animal.combat_bonus / 2;
  return Math.floor(boost);
}

function getTotalDefense(player: any): number {
  let def = 10;
  for (const id of Object.values(player?.equipped || {})) {
    const item = EQUIPMENT.find(e => e.id === id);
    if (item) def += item.defense;
  }
  return def;
}

function getPlayerTier(player: any): string {
  const xp = player?.xp || 0;
  if (xp < 200) return "🪨 Stone Seeker";
  if (xp < 500) return "⚔️ Ragaila Warrior";
  if (xp < 1000) return "🔮 Mystic Ragaila";
  if (xp < 2000) return "⚙️ Forge Master";
  if (xp < 4000) return "💻 Cyber Ragaila";
  if (xp < 8000) return "🌌 Hyperverse Walker";
  return "👑 Sacred Core — EVOLVED";
}

function checkRealmUp(player: any): boolean {
  const xp = player?.xp || 0;
  const currentRealm = player?.current_realm || 1;
  const nextRealm = REALMS.find(r => r.id === currentRealm + 1);
  if (nextRealm && xp >= nextRealm.xp_req) {
    player.current_realm = nextRealm.id;
    return true;
  }
  return false;
}

async function processMining(player: any): Promise<{ ore: number; hours: number; ready: boolean }> {
  const now = Date.now();
  const lastMine = player?.last_mine || 0;
  const elapsed = (now - lastMine) / (1000 * 60 * 60);
  if (elapsed < 0.25) return { ore: 0, hours: 0, ready: false };
  const hours = Math.min(12, elapsed);
  const boost = getMiningBoost(player);
  const realmBonus = (player?.current_realm || 1) * 5;
  const ore = Math.floor(hours * (10 + realmBonus) * (1 + boost / 100));
  return { ore, hours: parseFloat(hours.toFixed(1)), ready: true };
}

// ── TELEGRAM UTILS ────────────────────────────────────────────────────────────
async function tgCall(method: string, body: any) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!json.ok) console.error(`[tg:${method}]`, JSON.stringify(json).slice(0, 200));
  return json;
}

async function sendMessage(chat_id: number, text: string, extra: any = {}) {
  return tgCall("sendMessage", { chat_id, text, parse_mode: "Markdown", ...extra });
}

async function sendTyping(chat_id: number) {
  return tgCall("sendChatAction", { chat_id, action: "typing" });
}

// ── STATE ─────────────────────────────────────────────────────────────────────
function enc(data: any) { return "🔒IE:" + btoa(unescape(encodeURIComponent(JSON.stringify(data)))); }
function dec(t: string): any {
  try { return t?.startsWith("🔒IE:") ? JSON.parse(decodeURIComponent(escape(atob(t.slice(5))))) : null; }
  catch { return null; }
}

async function loadPlayer(chatId: number): Promise<{ data: any; msgId: number | null }> {
  const r = await tgCall("getChat", { chat_id: chatId });
  const pin = r?.result?.pinned_message;
  return { data: dec(pin?.text || ""), msgId: pin?.message_id || null };
}

async function savePlayer(chatId: number, data: any, existingMsgId: number | null) {
  const encoded = enc(data);
  if (existingMsgId) {
    const r = await tgCall("editMessageText", { chat_id: chatId, message_id: existingMsgId, text: encoded });
    if (!r.ok && r.description?.includes("not modified")) return;
  } else {
    const sent = await tgCall("sendMessage", { chat_id: chatId, text: encoded, disable_notification: true });
    const newId = sent?.result?.message_id;
    if (newId) await tgCall("pinChatMessage", { chat_id: chatId, message_id: newId, disable_notification: true });
  }
}

// ── AI ENGINE ─────────────────────────────────────────────────────────────────
async function queenSpeak(player: any, context: string, type: string): Promise<any> {
  const realm = REALMS[(player?.current_realm || 1) - 1];
  const animal = CYBER_ANIMALS.find(a => a.id === player?.companion);
  const avatar = getAvatarDescription(player);

  const prompts: Record<string, string> = {
    quest: `You are the Queen's Protocol, generating a quest in ${realm.name} (${realm.tradition}).
Pull from Native American (Cherokee, Ojibwe, Lakota, Wampanoag), Norse/Germanic, and Slavic mythology. Blend naturally.
Player avatar: ${avatar}. Companion: ${animal ? `${animal.emoji} ${animal.name} — ${animal.type}` : "none"}.
Create an atmospheric quest with: mythic challenge, named NPC from the ${realm.tradition} tradition, specific reward.
Dark, poetic, immersive. 3-4 sentences.
Return ONLY valid JSON: { "title": "...", "description": "...", "npc": "...", "npc_type": "...", "hint": "..." }`,

    combat_intro: `You are narrating an enemy encounter in ${realm.name}.
Enemy: ${context}. Player avatar: ${avatar}.
Dramatic opening — mix physical and magical. Reference ${realm.tradition} lore. 2-3 vivid sentences.
Return ONLY valid JSON: { "narrative": "...", "enemy_taunt": "..." }`,

    animal_wisdom: `You are ${animal?.name || "a spirit"}, a ${animal?.type || "companion"} in Inner Earth.
${animal?.role || ""}. Current realm: ${realm.name}. Player: ${player?.ragaila_name || "Seeker"}.
One cryptic lore clue about this realm or the player's path. Speak as your spirit tradition would.
Return ONLY valid JSON: { "insight": "...", "clue": "..." }`,

    riddle_encounter: `You are a mythic being in ${realm.name}: ${context}. Tradition: ${realm.tradition}.
Challenge the player with a riddle rooted in your mythology. Not too easy, not impossible.
Return ONLY valid JSON: { "greeting": "...", "riddle": "...", "answer_hint": "...", "reward_hint": "..." }`,

    lore: `You are a lore keeper of Inner Earth. Channel ${realm.tradition} mythology.
Topic: ${context}. 2-3 sentences of ancient truth. Poetic, layered, real.
Return ONLY valid JSON: { "lore": "..." }`,

    realm_up: `You are the Queen's Protocol announcing realm advancement for ${player?.ragaila_name || "Seeker"}.
They have risen from ${context} to ${realm.name}. Speak of what awaits.
Powerful, mythic, short. 2-3 sentences.
Return ONLY valid JSON: { "announcement": "..." }`
  };

  const fallbacks: Record<string, any> = {
    quest: { title: "The Deep Calls", description: "Something ancient stirs in the tunnels. The Little People go silent.", npc: "A shadow at the tunnel mouth", npc_type: "Unknown", hint: "The ore runs deeper than expected." },
    combat_intro: { narrative: "The creature emerges from the dark. It has been waiting.", enemy_taunt: "You dare enter my domain?" },
    animal_wisdom: { insight: "The path is never straight in the underworld.", clue: "Listen for water — it always flows toward ore." },
    riddle_encounter: { greeting: "You dare enter?", riddle: "What grows stronger when you give it away?", answer_hint: "Think of knowledge.", reward_hint: "Truth has its own currency here." },
    lore: { lore: "The old ones say the earth remembers every step taken upon it." },
    realm_up: { announcement: "The gate opens. What awaits will test everything you have earned." }
  };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: prompts[type] || prompts.lore }, { role: "user", content: context }],
        temperature: 0.93,
        response_format: { type: "json_object" }
      })
    });
    const d: any = await res.json();
    return JSON.parse(d.choices[0].message.content);
  } catch(e) {
    console.error("queenSpeak error:", e);
    return fallbacks[type] || fallbacks.lore;
  }
}

// ── MENUS ─────────────────────────────────────────────────────────────────────
function mainMenu() {
  return {
    keyboard: [
      [{ text: "⛏️ Mine" }, { text: "⚔️ Quest" }],
      [{ text: "🎒 Inventory" }, { text: "👥 Little People" }],
      [{ text: "🐾 Companions" }, { text: "🌍 Realm" }],
      [{ text: "📊 Stats" }, { text: "💰 Economy" }]
    ],
    resize_keyboard: true
  };
}

const MENU_TEXTS = ["⛏️ Mine","⚔️ Quest","🎒 Inventory","👥 Little People","🐾 Companions","🌍 Realm","📊 Stats","💰 Economy","🏠 Menu"];

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "GET") {
    const r = await tgCall("setWebhook", {
      url: "https://superagent-ec909dfa.base44.app/functions/innerEarthBot",
      drop_pending_updates: true,
      allowed_updates: ["message", "callback_query"]
    });
    return new Response(JSON.stringify(r), { headers: { "Content-Type": "application/json" } });
  }

  let update: any;
  try { update = await req.json(); } catch { return new Response("ok"); }

  // ── Callback queries ──────────────────────────────────────────────────────
  const cb = update?.callback_query;
  if (cb) {
    const chatId = cb.message.chat.id;
    const cbData = cb.data || "";
    const { data: player, msgId } = await loadPlayer(chatId);

    if (cbData.startsWith("equip_") && player) {
      const itemId = cbData.replace("equip_", "");
      const item = EQUIPMENT.find(e => e.id === itemId);
      if (item && (player.inventory || []).includes(itemId)) {
        if (!player.equipped) player.equipped = {};
        player.equipped[item.slot] = itemId;
        await savePlayer(chatId, player, msgId);
        await sendMessage(chatId, `✅ *${item.emoji} ${item.name}* equipped!\n\n_"${item.lore}"_\n\n⛏️ +${item.mining_boost}% mining\n🛡️ +${item.defense} defense\n\n_${getAvatarDescription(player)}_`);
      }
    }

    if (cbData.startsWith("sell_") && player) {
      const itemId = cbData.replace("sell_", "");
      const item = EQUIPMENT.find(e => e.id === itemId);
      if (item && (player.inventory || []).includes(itemId)) {
        player.inventory = player.inventory.filter((i: string) => i !== itemId);
        if (player.equipped?.[item.slot] === itemId) delete player.equipped[item.slot];
        player.muddore = (player.muddore || 0) + item.mudd_value * 8;
        await savePlayer(chatId, player, msgId);
        await sendMessage(chatId, `💸 *${item.emoji} ${item.name}* sold for *${item.mudd_value * 8} MuddOre*.\n\n⚠️ _The power it held is gone. The earth has reclaimed it._`);
      }
    }

    if (cbData.startsWith("bond_lp_") && player) {
      const lpId = cbData.replace("bond_lp_", "");
      const lp = LP_TYPES.find(l => l.id === lpId);
      if (lp && !player.pacts?.[lpId]) {
        if (!player.pacts) player.pacts = {};
        player.pacts[lpId] = { level: 1, bonded: new Date().toISOString() };
        player.xp = (player.xp || 0) + 50;
        await savePlayer(chatId, player, msgId);
        await sendMessage(chatId, `🤝 *Pact formed with ${lp.emoji} ${lp.name}*\n\n_${lp.look}_\n\n${lp.tradition} tradition.\n\n🎁 *Pact Gift:* ${lp.pact_gift}\n⛏️ Mining bonus: +${lp.mining_bonus}%\n✨ +50 XP\n\n_"Honor the pact. Knowledge flows both ways."_`);
      }
    }

    if (cbData.startsWith("companion_") && player) {
      const animalId = cbData.replace("companion_", "");
      if ((player.animals || []).includes(animalId)) {
        player.companion = animalId;
        await savePlayer(chatId, player, msgId);
        const animal = CYBER_ANIMALS.find(a => a.id === animalId);
        await sendMessage(chatId, `${animal?.emoji} *${animal?.name}* is now your active companion.\n\n_${animal?.look}_\n\n${animal?.role}\n\n⚔️ Combat bonus: +${animal?.combat_bonus}%`);
      }
    }

    await tgCall("answerCallbackQuery", { callback_query_id: cb.id });
    return new Response("ok");
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  const msg = update?.message;
  if (!msg?.text) return new Response("ok");

  const chatId: number = msg.chat.id;
  const fullName: string = msg.from.first_name || "Seeker";
  const text: string = msg.text.trim();

  console.log(`[IE] ${chatId} "${text}"`);

  const { data: player, msgId } = await loadPlayer(chatId);
  const state: string = player?.state || "new";

  // ── /start ────────────────────────────────────────────────────────────────
  if (text === "/start") {
    if (player) {
      await sendMessage(chatId,
        `🌍 *Welcome back, ${player.ragaila_name || fullName}.*\n\n_The earth remembers your footsteps._\n_Your Little People have not been idle._\n\n${getPlayerTier(player)} | Realm ${player.current_realm || 1}/7`,
        { reply_markup: mainMenu() });
      return new Response("ok");
    }
    const newPlayer = {
      full_name: fullName, ragaila_name: null, xp: 0, hp: 100, mana: 60,
      muddore: 150, muddcoin_pending: 0, current_realm: 1,
      inventory: [], equipped: {}, pacts: {}, animals: [], companion: null,
      last_mine: 0, quests_completed: 0, kills: 0, state: "naming_ragaila",
      joined: new Date().toISOString()
    };
    await savePlayer(chatId, newPlayer, null);
    await sendMessage(chatId, `🌍 *INNER EARTH: Rise of the Ancients*\n\n_In the beginning, there was only the deep earth._\n_The Little People were there before the first human stepped above ground._\n_They carved the tunnels. They guard the ore. They remember everything._\n\n_Now they have sent a signal._\n_You have been chosen to descend._`);
    await new Promise(r => setTimeout(r, 2000));
    await sendMessage(chatId, `🪨 *A Cherokee elder steps from the shadow of the first tree:*\n\n_"You come to the earth. Good. She has been restless without you."_\n\n_"But I must know your name first. Not the name your mother gave you —_\n_the name your Ragaila carries into the deep."_\n\n✏️ *What is your Ragaila's name?*`);
    return new Response("ok");
  }

  if (!player) { await sendMessage(chatId, "Send /start to enter the Inner Earth. 🌍"); return new Response("ok"); }

  // ── Naming ────────────────────────────────────────────────────────────────
  if (state === "naming_ragaila" && text.length > 0) {
    player.ragaila_name = text;
    player.pacts = { keetoowah: { level: 1, bonded: new Date().toISOString() } };
    player.animals = ["vex"];
    player.companion = "vex";
    player.inventory = ["stone_pick", "bone_helmet", "fur_cloak"];
    player.equipped = { weapon: "stone_pick", head: "bone_helmet", body: "fur_cloak" };
    player.state = "playing";
    await savePlayer(chatId, player, msgId);
    await sendMessage(chatId,
      `⚔️ *${text}.*\n\nThe elder nods once. A Norse Dverg peeks from behind a boulder.\nVex the wolf circles three times and sits at your feet.\n\n_"The name has weight. The earth accepts it."_\n\n✅ *You've been granted:*\n🌿 *Keetoowah* (Cherokee LP) — +15% mining, sacred soil sight\n🐺 *Vex* — Wolf Spirit companion, combat wisdom\n💀 *Bone Helmet* + 🐻 *Bear Fur Cloak* + ⛏️ *Stone Pick*\n💎 *150 MuddOre* — starting wealth\n\n_"The first realm is Ancient Earth. Mine deep. Honor the pacts._\n_The Little People are watching."_`,
      { reply_markup: mainMenu() });
    return new Response("ok");
  }

  // ── ⛏️ MINE ───────────────────────────────────────────────────────────────
  if (text === "⛏️ Mine") {
    const { ore, hours, ready } = await processMining(player);
    if (!ready) {
      const nextMin = Math.ceil(15 - ((Date.now() - (player.last_mine || 0)) / 60000));
      await sendMessage(chatId,
        `⛏️ *Your Little People are still working...*\n\nCheck back in ~${Math.max(1, nextMin)} minutes.\n\n🌿 Active pacts: ${Object.keys(player.pacts || {}).length}\n⚒️ Mining boost: +${getMiningBoost(player)}%\n🌍 Realm ${player.current_realm || 1} base rate: +${(player.current_realm || 1) * 5} ore/hr bonus`,
        { reply_markup: mainMenu() });
    } else {
      player.muddore = (player.muddore || 0) + ore;
      player.xp = (player.xp || 0) + Math.floor(ore / 8);
      player.last_mine = Date.now();
      const realmUp = checkRealmUp(player);
      await savePlayer(chatId, player, msgId);

      let clueText = "";
      if (Math.random() > 0.55 && player.companion) {
        const animal = CYBER_ANIMALS.find(a => a.id === player.companion);
        const clue = await queenSpeak(player, "mining return", "animal_wisdom");
        clueText = `\n\n${animal?.emoji} *${animal?.name}:*\n_"${clue.insight}"_\n💡 _${clue.clue}_`;
      }

      const muddPending = Math.floor(player.muddore / 1000);
      await sendMessage(chatId,
        `⛏️ *${hours}h mining complete — Realm ${player.current_realm}*\n\n+*${ore} MuddOre* from the deep earth\n\n🏦 Total MuddOre: *${player.muddore}*\n🪙 Claimable MUDD: *${muddPending}*\n⚒️ Mining boost: +${getMiningBoost(player)}%\n✨ +${Math.floor(ore/8)} XP${clueText}${realmUp ? `\n\n🎊 *REALM ADVANCED!* You have entered *${REALMS[(player.current_realm||1)-1].name}*!` : ""}`,
        { reply_markup: mainMenu() });
    }
    return new Response("ok");
  }

  // ── ⚔️ QUEST ──────────────────────────────────────────────────────────────
  if (text === "⚔️ Quest") {
    await sendTyping(chatId);
    const realm = REALMS[(player.current_realm || 1) - 1];

    // Pick random enemy for this realm
    const enemyIds = realm.enemies;
    const enemyId = enemyIds[Math.floor(Math.random() * enemyIds.length)];
    const enemy = ENEMIES[enemyId];

    const q = await queenSpeak(player, realm.name, "quest");
    player.state = "on_quest";
    player.active_quest = { ...q, enemy_id: enemyId, enemy_hp: enemy.hp };
    await savePlayer(chatId, player, msgId);

    await sendMessage(chatId,
      `${realm.emoji} *Quest: ${q.title}*\n\n_${q.description}_\n\n👤 *${q.npc}* — ${q.npc_type}\n\n${enemy.emoji} *${enemy.name}* blocks your path.\n_"${enemy.lore}"_\n\n⚠️ Weakness: *${enemy.weakness}*\n\n💡 _${q.hint}_\n\n⚔️ Choose your action:`,
      { reply_markup: { keyboard: [
        [{ text: "⚔️ Strike" }, { text: "🔮 Magic" }],
        [{ text: "💬 Speak / Riddle" }, { text: "🛡️ Defend" }],
        [{ text: "🏃 Retreat" }, { text: "🏠 Menu" }]
      ], resize_keyboard: true }});
    return new Response("ok");
  }

  // ── Quest actions ─────────────────────────────────────────────────────────
  if (state === "on_quest" && !MENU_TEXTS.includes(text) && text !== "🏠 Menu") {
    await sendTyping(chatId);
    const enemyId = player.active_quest?.enemy_id;
    const enemy = ENEMIES[enemyId] || ENEMIES.drekavac;
    let enemyHp = player.active_quest?.enemy_hp || enemy.hp;

    const animalBonus = CYBER_ANIMALS.find(a => a.id === player.companion)?.combat_bonus || 0;
    const playerAtk = Math.floor(15 + getMiningBoost(player) / 3 + animalBonus / 2 + Math.random() * 20);
    const magicAtk = Math.floor(20 + (player.mana || 60) / 3 + Math.random() * 15);

    if (text === "🏃 Retreat") {
      player.state = "playing"; player.active_quest = null;
      player.xp = Math.max(0, (player.xp || 0) - 15);
      await savePlayer(chatId, player, msgId);
      await sendMessage(chatId, `🏃 *You retreat into the tunnel.*\n\n_${enemy.name} lets you go — this time._\n\n-15 XP. _The earth does not judge retreat. It waits._`, { reply_markup: mainMenu() });
      return new Response("ok");
    }

    if (text === "🛡️ Defend") {
      const def = getTotalDefense(player);
      const dmgBlocked = Math.floor(def * 0.8);
      await sendMessage(chatId, `🛡️ *Defensive stance.*\n\nYou absorb the ${enemy.name}'s attack.\nDefense: ${def} | Blocked: ${dmgBlocked} damage.\n\n_The creature snarls. Your stance holds._\n\nContinue the fight:`,
        { reply_markup: { keyboard: [[{ text: "⚔️ Strike" }, { text: "🔮 Magic" }], [{ text: "💬 Speak / Riddle" }, { text: "🏃 Retreat" }]], resize_keyboard: true }});
      return new Response("ok");
    }

    if (text === "💬 Speak / Riddle") {
      const riddle = await queenSpeak(player, `${enemy.name} — ${enemy.tradition}`, "riddle_encounter");
      player.active_quest.riddle_mode = true;
      await savePlayer(chatId, player, msgId);
      await sendMessage(chatId,
        `${enemy.emoji} *${enemy.name} speaks:*\n\n_"${riddle.greeting}"_\n\n❓ *Riddle:*\n_"${riddle.riddle}"_\n\n_Answer wisely. Type your response._`);
      return new Response("ok");
    }

    // Riddle answer
    if (player.active_quest?.riddle_mode && text !== "⚔️ Strike" && text !== "🔮 Magic") {
      const xpE = text.length > 15 ? 50 : 20;
      const oreE = Math.floor(enemy.reward_ore * 0.7);
      player.xp = (player.xp || 0) + xpE;
      player.muddore = (player.muddore || 0) + oreE;
      player.quests_completed = (player.quests_completed || 0) + 1;
      player.kills = (player.kills || 0) + 1;
      player.state = "playing"; player.active_quest = null;
      checkRealmUp(player);
      await savePlayer(chatId, player, msgId);
      await sendMessage(chatId,
        `✅ *${enemy.name} considers your words...*\n\n_"Hmm. The answer has weight. Pass."_\n\n⚔️ Victory through wisdom!\n✨ +${xpE} XP  |  ⛏️ +${oreE} MuddOre`,
        { reply_markup: mainMenu() });
      return new Response("ok");
    }

    // Strike or Magic
    const atk = text === "🔮 Magic" ? magicAtk : playerAtk;
    if (text === "🔮 Magic") {
      player.mana = Math.max(0, (player.mana || 60) - 20);
    }
    enemyHp -= atk;
    const ci = await queenSpeak(player, enemy.name, "combat_intro");

    if (enemyHp <= 0) {
      const xpE = enemy.reward_xp + Math.floor(Math.random() * 30);
      const oreE = enemy.reward_ore + Math.floor(Math.random() * 50);
      player.xp = (player.xp || 0) + xpE;
      player.muddore = (player.muddore || 0) + oreE;
      player.kills = (player.kills || 0) + 1;
      player.quests_completed = (player.quests_completed || 0) + 1;
      player.hp = Math.min(100, (player.hp || 100) + 10); // HP regen on victory
      player.state = "playing"; player.active_quest = null;

      // Chance to find a companion
      let companionText = "";
      if (!player.animals?.includes("aura") && Math.random() > 0.85 && (player.current_realm || 1) >= 2) {
        player.animals = [...(player.animals || []), "aura"];
        companionText = `\n\n🦅 *Aura the Thunderbird appears from the storm.*\n_She circles once and lands on your shoulder._\n_A new companion bonded._`;
      }
      if (!player.animals?.includes("coil") && Math.random() > 0.88 && (player.current_realm || 1) >= 3) {
        player.animals = [...(player.animals || []), "coil"];
        companionText = `\n\n🐍 *Coil emerges from the shadows.*\n_Ancient eyes meet yours. A Serpent Elder chooses you._`;
      }

      const realmUp = checkRealmUp(player);
      await savePlayer(chatId, player, msgId);
      await sendMessage(chatId,
        `⚔️ *Victory! ${enemy.emoji} ${enemy.name} falls!*\n\n_${ci.narrative}_\n\n💥 Final strike: *${atk} damage*\n\n✨ +${xpE} XP  |  ⛏️ +${oreE} MuddOre\n❤️ HP restored to ${player.hp}/100${companionText}${realmUp ? `\n\n🎊 *REALM UNLOCKED: ${REALMS[(player.current_realm||1)-1].name}!*` : ""}`,
        { reply_markup: mainMenu() });
    } else {
      const enemyAtk = Math.floor(enemy.attack * (0.7 + Math.random() * 0.6));
      const dmgTaken = Math.max(1, enemyAtk - Math.floor(getTotalDefense(player) / 4));
      player.hp = Math.max(1, (player.hp || 100) - dmgTaken);
      player.active_quest.enemy_hp = enemyHp;
      player.active_quest.riddle_mode = false;
      await savePlayer(chatId, player, msgId);
      await sendMessage(chatId,
        `⚔️ *${enemy.emoji} ${enemy.name} — HP: ${enemyHp}/${enemy.hp}*\n\n_${ci.narrative}_\n\n💥 You deal *${atk}* damage\n🩸 You take *${dmgTaken}* — HP: ${player.hp}/100\n\n_"${ci.enemy_taunt}"_\n\nContinue:`,
        { reply_markup: { keyboard: [[{ text: "⚔️ Strike" }, { text: "🔮 Magic" }], [{ text: "💬 Speak / Riddle" }, { text: "🛡️ Defend" }], [{ text: "🏃 Retreat" }]], resize_keyboard: true }});
    }
    return new Response("ok");
  }

  // ── 🎒 INVENTORY ──────────────────────────────────────────────────────────
  if (text === "🎒 Inventory") {
    const equipped = player.equipped || {};
    const inv = (player.inventory || []).filter((id: string) => !Object.values(equipped).includes(id));
    const equippedLines = Object.entries(equipped).map(([slot, id]) => {
      const item = EQUIPMENT.find(e => e.id === id);
      return item ? `${item.emoji} *${item.name}* _(${slot})_` : "";
    }).filter(Boolean);

    let msg = `🎒 *${player.ragaila_name || fullName}*\n\n_${getAvatarDescription(player)}_\n\n`;
    msg += `⛏️ Mining boost: +${getMiningBoost(player)}%\n🛡️ Defense: ${getTotalDefense(player)}\n`;
    if (equippedLines.length > 0) msg += `\n⚔️ *Equipped:*\n${equippedLines.join("\n")}`;
    if (inv.length > 0) {
      msg += `\n\n📦 *Unequipped (${inv.length}):*`;
      const buttons = inv.slice(0, 6).map((id: string) => {
        const item = EQUIPMENT.find(e => e.id === id);
        return item ? [
          { text: `Equip ${item.emoji} ${item.name}`, callback_data: `equip_${id}` },
          { text: `Sell +${item.mudd_value * 8} ore`, callback_data: `sell_${id}` }
        ] : [];
      }).filter((r: any[]) => r.length > 0);
      await sendMessage(chatId, msg, { reply_markup: { inline_keyboard: buttons }});
    } else {
      msg += "\n\n_No unequipped items._";
      await sendMessage(chatId, msg, { reply_markup: mainMenu() });
    }
    return new Response("ok");
  }

  // ── 👥 LITTLE PEOPLE ──────────────────────────────────────────────────────
  if (text === "👥 Little People") {
    const pacts = player.pacts || {};
    const pactLines = Object.keys(pacts).map(id => {
      const lp = LP_TYPES.find(l => l.id === id);
      return lp ? `${lp.emoji} *${lp.name}* (${lp.tradition}) Lv.${pacts[id]?.level || 1} +${lp.mining_bonus}% mine` : "";
    }).filter(Boolean);
    const available = LP_TYPES.filter(l => !pacts[l.id]).slice(0, 4);
    await sendMessage(chatId,
      `👥 *Your Little People — ${Object.keys(pacts).length} pacts*\n\n${pactLines.length > 0 ? pactLines.join("\n") : "_No pacts yet._"}\n\n_Total mining bonus: +${Object.keys(pacts).reduce((sum, id) => { const lp = LP_TYPES.find(l => l.id === id); return sum + (lp?.mining_bonus || 0); }, 0)}%_\n\n_Bond with new LP:_`,
      { reply_markup: { inline_keyboard: available.map(l => [{ text: `🤝 ${l.emoji} ${l.name} — ${l.tradition}`, callback_data: `bond_lp_${l.id}` }]) }});
    return new Response("ok");
  }

  // ── 🐾 COMPANIONS ─────────────────────────────────────────────────────────
  if (text === "🐾 Companions") {
    const animals = player.animals || [];
    if (animals.length === 0) {
      await sendMessage(chatId, `🐾 *Companions*\n\n_None bonded yet._\n\nWin quests to encounter and bond with:\n🐺 Vex · 🦅 Aura · 🐍 Coil · 🦁 Kron · 🐙 Null · 🔥 Pyar · 🐆 Mishipeshu · 🐇 Wolpertinger`, { reply_markup: mainMenu() });
      return new Response("ok");
    }
    await sendTyping(chatId);
    const activeAnimal = CYBER_ANIMALS.find(a => a.id === player.companion);
    const wisdom = await queenSpeak(player, "companion wisdom", "animal_wisdom");
    const animalLines = animals.map((id: string) => {
      const a = CYBER_ANIMALS.find(c => c.id === id);
      return a ? `${a.emoji} *${a.name}* — ${a.rarity} ${player.companion === id ? "✅" : ""}` : "";
    }).filter(Boolean);
    await sendMessage(chatId,
      `🐾 *Companions (${animals.length})*\n\n${animalLines.join("\n")}\n\n${activeAnimal?.emoji} *${activeAnimal?.name} speaks:*\n_"${wisdom.insight}"_\n\n💡 _${wisdom.clue}_`,
      { reply_markup: { inline_keyboard: animals.map((id: string) => { const a = CYBER_ANIMALS.find(c => c.id === id); return a ? [{ text: `Activate ${a.emoji} ${a.name} (+${a.combat_bonus}% combat)`, callback_data: `companion_${id}` }] : []; }) }});
    return new Response("ok");
  }

  // ── 🌍 REALM ──────────────────────────────────────────────────────────────
  if (text === "🌍 Realm") {
    await sendTyping(chatId);
    const realm = REALMS[(player.current_realm || 1) - 1];
    const lore = await queenSpeak(player, realm.name, "lore");
    const nextRealm = REALMS[player.current_realm] || null;
    const realmEnemies = realm.enemies.map(id => `${ENEMIES[id]?.emoji || "👾"} ${ENEMIES[id]?.name || id}`).join(" · ");
    await sendMessage(chatId,
      `${realm.emoji} *Realm ${realm.id}: ${realm.name}*\n\n_${realm.desc}_\n\n🌐 Tradition: *${realm.tradition}*\n👾 Enemies here: ${realmEnemies}\n\n📖 *Ancient lore:*\n_${lore.lore}_\n\n${nextRealm ? `🔮 *Next realm:* ${nextRealm.emoji} ${nextRealm.name}\n_Requires ${nextRealm.xp_req} XP — you have ${player.xp || 0}_` : "👑 You stand at the Sacred Core. The journey ends and begins."}`,
      { reply_markup: mainMenu() });
    return new Response("ok");
  }

  // ── 📊 STATS ──────────────────────────────────────────────────────────────
  if (text === "📊 Stats") {
    const boost = getMiningBoost(player);
    const muddPending = Math.floor((player.muddore || 0) / 1000);
    await sendMessage(chatId,
      `📊 *${player.ragaila_name || fullName}*\n\n${getPlayerTier(player)}\n\n❤️ HP: ${player.hp || 100}/100\n💫 Mana: ${player.mana || 60}/60\n✨ XP: ${player.xp || 0}\n🌍 Realm: ${player.current_realm || 1}/7\n\n⛏️ Mining boost: +${boost}%\n🛡️ Defense: ${getTotalDefense(player)}\n⚔️ Quests done: ${player.quests_completed || 0}\n💀 Kills: ${player.kills || 0}\n🤝 LP pacts: ${Object.keys(player.pacts || {}).length}/8\n🐾 Companions: ${(player.animals || []).length}/8\n\n💎 MuddOre: ${player.muddore || 0}\n🪙 Claimable MUDD: ${muddPending}`,
      { reply_markup: mainMenu() });
    return new Response("ok");
  }

  // ── 💰 ECONOMY ────────────────────────────────────────────────────────────
  if (text === "💰 Economy") {
    const ore = player.muddore || 0;
    const claimable = Math.floor(ore / 1000);
    await sendMessage(chatId,
      `💰 *Inner Earth Economy*\n\n⛏️ *MuddOre:* ${ore}\n🪙 *Claimable MUDD:* ${claimable}\n\n_1,000 MuddOre = 1 MUDD Jetton_\n${claimable > 0 ? `\n✅ You can claim *${claimable} MUDD* on-chain\n_/claim — TON wallet bridge coming soon_` : "_Mine more to reach the 1,000 MuddOre threshold._"}\n\n*Item Trading:*\n⚠️ Selling items returns MuddOre but destroys the item's power.\n_The choice is always yours._\n\n*Companion Values:*\n🐺 Vex: 150 MUDD  |  🦅 Aura: 400 MUDD\n🐍 Coil: 350 MUDD  |  🦁 Kron: 800 MUDD\n🐙 Null: 3,000 MUDD  |  🔥 Pyar: 8,000 MUDD\n🐆 Mishipeshu: 1,200 MUDD\n\n*MUDD Contract (TON Testnet):*\n\`0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8\``,
      { reply_markup: mainMenu() });
    return new Response("ok");
  }

  if (text === "🏠 Menu") {
    player.state = "playing"; player.active_quest = null;
    await savePlayer(chatId, player, msgId);
    await sendMessage(chatId, `🌍 *Inner Earth — ${player.ragaila_name || fullName}*\n\n_${getPlayerTier(player)}_\n\nWhat calls you?`, { reply_markup: mainMenu() });
    return new Response("ok");
  }

  await sendMessage(chatId, "Use the menu to navigate the Inner Earth. 🌍", { reply_markup: mainMenu() });
  return new Response("ok");
});

// Inner Earth: Rise of the Ancients
// Full RPG — Native American + Germanic/Norse + Slavic lore
// Little People mining, Ragaila avatars, cyber animals, enchanted items, time-quest arc

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN_4") || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const GROQ_KEY = Deno.env.get("GROQ_API_KEY_2") || Deno.env.get("GROQ_API_KEY") || "";

// ── LORE CONSTANTS ────────────────────────────────────────────────────────────

const REALMS = [
  { id: 1, name: "Ancient Earth", emoji: "🪨", desc: "Primordial forests. Sacred ground. The first veins of MuddOre pulse beneath your feet.", lore: "Cherokee elder" },
  { id: 2, name: "Age of Warriors", emoji: "⚔️", desc: "Tribal wars rage. The Ragaila bloodline awakens. Honor is currency.", lore: "Norse berserker" },
  { id: 3, name: "Mystic Age", emoji: "🔮", desc: "Rune magic rises. Crystal mines sing. Ancient Queens whisper through stone.", lore: "Slavic witch realm" },
  { id: 4, name: "Industrial Dawn", emoji: "⚙️", desc: "Rune-smiths bind spirits into metal. The forge meets the sacred.", lore: "Germanic dwarf forge" },
  { id: 5, name: "Digital Realm", emoji: "💻", desc: "Cyber animals emerge from the data streams. MUDD protocol activates.", lore: "Hypertech convergence" },
  { id: 6, name: "Hyperverse", emoji: "🌌", desc: "Reality bends. Quantum Ragaila walk between worlds. LP ascend.", lore: "Yggdrasil collapse" },
  { id: 7, name: "Sacred Core", emoji: "👑", desc: "Inner Earth revealed. Queen's Protocol source. Veles stands at the gate.", lore: "The Great Mystery" }
];

const CYBER_ANIMALS = [
  { id: "vex", name: "Vex", emoji: "🐺", type: "Wolf Spirit", role: "Combat strategy & Cherokee war wisdom", rarity: "Common", mudd_value: 150 },
  { id: "aura", name: "Aura", emoji: "🦅", type: "Thunderbird", role: "Reveals hidden realm locations & Norse sky paths", rarity: "Uncommon", mudd_value: 400 },
  { id: "coil", name: "Coil", emoji: "🐍", type: "Serpent Elder", role: "Teaches LP pact rituals & Slavic underworld lore", rarity: "Uncommon", mudd_value: 350 },
  { id: "kron", name: "Kron", emoji: "🦁", type: "Cyber Lion", role: "Unlocks hyperverse quests & Ragnarök survival", rarity: "Rare", mudd_value: 800 },
  { id: "null", name: "Null", emoji: "🐙", type: "Deep Entity", role: "Speaks Sacred Script riddles. Answers cost MUDD.", rarity: "Legendary", mudd_value: 3000 },
  { id: "firebird", name: "Pyar", emoji: "🔥", type: "Slavic Firebird", role: "Appears briefly. Follow it to unlock hidden realms.", rarity: "Mythic", mudd_value: 8000 }
];

const EQUIPMENT = [
  { id: "bone_helmet", name: "Bone Helmet", emoji: "💀", slot: "head", mining_boost: 10, defense: 5, lore: "Carved from ancient beast. Whispers of the hunt.", mudd_value: 75, realm: 1 },
  { id: "fur_cloak", name: "Fur Cloak", emoji: "🐻", slot: "body", mining_boost: 8, defense: 8, lore: "Bear spirit lingers in each thread.", mudd_value: 90, realm: 1 },
  { id: "stone_pick", name: "Stone Pick", emoji: "⛏️", slot: "weapon", mining_boost: 15, defense: 0, lore: "First tool. First vein. First knowing.", mudd_value: 60, realm: 1 },
  { id: "rune_boots", name: "Rune Boots", emoji: "👢", slot: "feet", mining_boost: 20, defense: 10, lore: "Norse runes carved at midnight. Speed of Sleipnir.", mudd_value: 180, realm: 2 },
  { id: "tribal_gloves", name: "War Gloves", emoji: "🥊", slot: "hands", mining_boost: 12, defense: 15, lore: "Dipped in warrior ceremony paint.", mudd_value: 120, realm: 2 },
  { id: "enchanted_hammer", name: "Enchanted Hammer", emoji: "🔨", slot: "weapon", mining_boost: 30, defense: 5, lore: "Bound with Mjolnir's lineage. Thunder in every strike.", mudd_value: 350, realm: 3 },
  { id: "crystal_helm", name: "Crystal Helm", emoji: "💎", slot: "head", mining_boost: 25, defense: 20, lore: "Grown in Slavic crystal caves. Amplifies sight.", mudd_value: 400, realm: 3 },
  { id: "mystic_robe", name: "Mystic Robe", emoji: "🧥", slot: "body", mining_boost: 20, defense: 25, lore: "Woven by Baba Yaga's daughters.", mudd_value: 500, realm: 3 },
  { id: "cyber_exo", name: "Cyber Exo-Suit", emoji: "🤖", slot: "body", mining_boost: 50, defense: 40, lore: "Digital realm forge. Spirit meets silicon.", mudd_value: 1200, realm: 5 },
  { id: "quantum_boots", name: "Quantum Boots", emoji: "⚡", slot: "feet", mining_boost: 45, defense: 30, lore: "Step between realms. Hyperverse-grade.", mudd_value: 900, realm: 5 },
  { id: "void_gauntlets", name: "Void Gauntlets", emoji: "🌑", slot: "hands", mining_boost: 40, defense: 35, lore: "From the Nav underworld. Veles-blessed.", mudd_value: 1100, realm: 6 },
  { id: "sacred_crown", name: "Sacred Crown", emoji: "👑", slot: "head", mining_boost: 60, defense: 50, lore: "Forged at the Sacred Core. The Great Mystery made solid.", mudd_value: 3000, realm: 7 }
];

const LP_TYPES = [
  { id: "keetoowah", name: "Keetoowah", emoji: "🌿", tradition: "Cherokee", specialty: "Deep earth mining, plant medicine lore", pact_gift: "Sacred soil map — reveals +3 veins" },
  { id: "dverg", name: "Dverg", emoji: "⚒️", tradition: "Norse", specialty: "Forging, rune-binding, gemstone mastery", pact_gift: "Rune-bind one item — +10% permanent boost" },
  { id: "domovoi", name: "Domovoi", emoji: "🏠", tradition: "Slavic", specialty: "Protection, hidden passages, dark realm access", pact_gift: "Open Nav passage — Unseen Realm access" },
  { id: "nunnehi", name: "Nunnehi", emoji: "✨", tradition: "Cherokee", specialty: "Healing, time vision, sacred frequency", pact_gift: "Vision quest — reveals next realm path" },
  { id: "kobold", name: "Kobold", emoji: "⛏️", tradition: "Germanic", specialty: "Ore detection, tunnel engineering, trap disarming", pact_gift: "Triple mining yield for 12 hours" },
  { id: "leshy", name: "Leshy", emoji: "🌲", tradition: "Slavic", specialty: "Forest realm access, shape-shift clues, Firebird tracking", pact_gift: "Firebird encounter chance +50%" }
];

const ATTACK_TYPES = [
  { id: "physical", name: "Strike", emoji: "⚔️", cost: 0, type: "physical" },
  { id: "rune_blast", name: "Rune Blast", emoji: "🔮", cost: 20, type: "magic", desc: "Norse rune energy" },
  { id: "spirit_call", name: "Spirit Call", emoji: "🌀", cost: 30, type: "magic", desc: "Cherokee spirit invocation" },
  { id: "shadow_bind", name: "Shadow Bind", emoji: "🌑", cost: 25, type: "magic", desc: "Slavic Nav magic" },
  { id: "thunderbird", name: "Thunderbird Strike", emoji: "⚡", cost: 50, type: "legendary", desc: "Requires Aura companion" },
  { id: "veles_curse", name: "Veles Curse", emoji: "💀", cost: 60, type: "legendary", desc: "Requires Nav realm access" }
];

// ── TELEGRAM UTILS ────────────────────────────────────────────────────────────

async function tgCall(method: string, body: any) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!json.ok) console.error(`tgCall ${method} error:`, JSON.stringify(json));
  return json;
}

async function sendMessage(chat_id: number, text: string, extra: any = {}) {
  return await tgCall("sendMessage", { chat_id, text, parse_mode: "Markdown", ...extra });
}

async function sendTyping(chat_id: number) {
  await tgCall("sendChatAction", { chat_id, action: "typing" });
}

// ── STATE STORAGE ─────────────────────────────────────────────────────────────

function encodeState(data: any): string {
  return "🔒INNEREARTH:" + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeState(text: string): any | null {
  try {
    if (!text?.startsWith("🔒INNEREARTH:")) return null;
    return JSON.parse(decodeURIComponent(escape(atob(text.replace("🔒INNEREARTH:", "")))));
  } catch { return null; }
}

async function loadPlayer(chatId: number): Promise<{ data: any; msgId: number | null }> {
  const res = await tgCall("getChat", { chat_id: chatId });
  const pinnedMsg = res?.result?.pinned_message;
  const data = decodeState(pinnedMsg?.text || "");
  return { data, msgId: pinnedMsg?.message_id || null };
}

async function savePlayer(chatId: number, data: any, existingMsgId: number | null) {
  const encoded = encodeState(data);
  if (existingMsgId) {
    const r = await tgCall("editMessageText", { chat_id: chatId, message_id: existingMsgId, text: encoded });
    if (!r.ok && r.description?.includes("not modified")) return;
  } else {
    const sent = await tgCall("sendMessage", { chat_id: chatId, text: encoded, disable_notification: true });
    const newMsgId = sent?.result?.message_id;
    if (newMsgId) await tgCall("pinChatMessage", { chat_id: chatId, message_id: newMsgId, disable_notification: true });
  }
}

// ── GAME LOGIC ────────────────────────────────────────────────────────────────

function getMiningBoost(player: any): number {
  const equipped = player?.equipped || {};
  let boost = 0;
  for (const slot of Object.values(equipped)) {
    const item = EQUIPMENT.find(e => e.id === slot);
    if (item) boost += item.mining_boost;
  }
  // LP pact bonuses
  const pacts = player?.pacts || {};
  const pactCount = Object.keys(pacts).length;
  boost += pactCount * 5;
  return boost;
}

function getTotalDefense(player: any): number {
  const equipped = player?.equipped || {};
  let def = 10;
  for (const slot of Object.values(equipped)) {
    const item = EQUIPMENT.find(e => e.id === slot);
    if (item) def += item.defense;
  }
  return def;
}

function getAvatarDescription(player: any): string {
  const equipped = player?.equipped || {};
  const items = Object.values(equipped).map(id => EQUIPMENT.find(e => e.id === id)?.name).filter(Boolean);
  if (items.length === 0) return "Bare-handed seeker. The earth waits for your first claim.";
  return items.join(" + ");
}

function getPlayerTier(player: any): string {
  const realm = player?.current_realm || 1;
  const xp = player?.xp || 0;
  if (realm === 1) return xp < 100 ? "🪨 Stone Seeker" : "🪨 Earth Walker";
  if (realm === 2) return "⚔️ Warrior";
  if (realm === 3) return "🔮 Mystic";
  if (realm === 4) return "⚙️ Forge Master";
  if (realm === 5) return "💻 Cyber Ragaila";
  if (realm === 6) return "🌌 Hyperverse Walker";
  return "👑 Sacred Core — Evolved";
}

async function processMining(player: any): Promise<{ ore: number; hours: number; message: string }> {
  const now = Date.now();
  const lastMine = player?.last_mine || 0;
  const hoursElapsed = Math.min(12, (now - lastMine) / (1000 * 60 * 60));
  if (hoursElapsed < 0.5) return { ore: 0, hours: 0, message: "Your Little People are still working. Check back soon." };

  const baseRate = 10; // ore per hour
  const boost = getMiningBoost(player);
  const lpBonus = (player?.pacts ? Object.keys(player.pacts).length : 0) * 0.1;
  const oreEarned = Math.floor(hoursElapsed * baseRate * (1 + boost / 100) * (1 + lpBonus));

  return {
    ore: oreEarned,
    hours: parseFloat(hoursElapsed.toFixed(1)),
    message: `⛏️ ${hoursElapsed.toFixed(1)} hours of mining in the deep earth.`
  };
}

// ── AI ENGINE ─────────────────────────────────────────────────────────────────

async function queenSpeak(player: any, context: string, type: "quest" | "lore" | "combat" | "animal" | "encounter"): Promise<any> {
  const realm = REALMS[(player?.current_realm || 1) - 1];
  const animalId = player?.companion;
  const animal = animalId ? CYBER_ANIMALS.find(a => a.id === animalId) : null;

  const systemPrompts: Record<string, string> = {
    quest: `You are the Queen's Protocol, generating a quest in the realm of ${realm.name} (${realm.lore}).
Draw from Native American (Cherokee, Lakota, Haudenosaunee), Norse/Germanic, and Slavic mythology. Blend them naturally.
The player's Ragaila is equipped with: ${getAvatarDescription(player)}.
Their companion: ${animal ? `${animal.emoji} ${animal.name} (${animal.type})` : "none"}.
Create a short, atmospheric quest with: a mythic challenge, a mysterious NPC (LP or being), and a reward hint.
Be evocative, dark, and poetic. 3-4 sentences max.
Return ONLY valid JSON: { "title": "...", "description": "...", "npc": "...", "hint": "..." }`,

    lore: `You are a lore keeper of the Inner Earth. Speak from the convergence of Cherokee, Norse, and Slavic traditions.
Topic: ${context}. Current realm: ${realm.name}.
Reveal one piece of deep mythological lore — something that feels ancient and true.
2-3 sentences. Poetic and mysterious.
Return ONLY valid JSON: { "lore": "..." }`,

    combat: `You are narrating a combat encounter in ${realm.name}.
Enemy: ${context}. Player equipped with: ${getAvatarDescription(player)}.
Describe the encounter dramatically. Mix physical and magical. Reference the lore tradition of this realm.
2-3 sentences of narrative, then the enemy's opening move.
Return ONLY valid JSON: { "narrative": "...", "enemy_move": "...", "enemy_hp": ${Math.floor(Math.random() * 50) + 30}, "enemy_attack": ${Math.floor(Math.random() * 20) + 10} }`,

    animal: `You are ${animal?.name || "a cyber animal"}, a ${animal?.type || "spirit"} companion in Inner Earth.
${animal?.role || ""}. Realm: ${realm.name}.
Give the player a cryptic clue or insight about their journey — in the voice of your spirit tradition.
Speak like a wise animal who has seen everything. One powerful insight, one cryptic hint.
Return ONLY valid JSON: { "insight": "...", "clue": "..." }`,

    encounter: `You are a mythic being encountered in ${realm.name}: ${context}.
Draw from the traditions of this realm: ${realm.lore}.
Be challenging, mysterious. Test the player's wit with a riddle or moral challenge.
If they answer well, reward. If poorly, consequence.
Return ONLY valid JSON: { "greeting": "...", "challenge": "...", "riddle": "...", "reward_hint": "..." }`
  };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompts[type] }, { role: "user", content: context }],
        temperature: 0.92,
        response_format: { type: "json_object" }
      })
    });
    const d: any = await res.json();
    return JSON.parse(d.choices[0].message.content);
  } catch(e) {
    console.error("queenSpeak error:", e);
    return { title: "The Deep Calls", description: "The earth trembles beneath your feet. Something ancient stirs.", npc: "A shadow at the tunnel mouth", hint: "The ore runs deeper than expected.", lore: "The old ones say the earth remembers every step taken upon it.", narrative: "The creature emerges from the dark.", enemy_move: "It lunges.", enemy_hp: 50, enemy_attack: 15, insight: "The path is never straight in the underworld.", clue: "Listen for the water — it always flows toward ore.", greeting: "You dare enter my realm?", challenge: "Answer correctly and pass.", riddle: "What grows stronger when you give it away?", reward_hint: "Truth has its own currency here." };
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

const MENU_TEXTS = ["⛏️ Mine", "⚔️ Quest", "🎒 Inventory", "👥 Little People", "🐾 Companions", "🌍 Realm", "📊 Stats", "💰 Economy"];

// ── HANDLERS ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "GET") {
    const res = await tgCall("setWebhook", {
      url: "https://superagent-ec909dfa.base44.app/functions/innerEarthBot",
      drop_pending_updates: true,
      allowed_updates: ["message", "callback_query"]
    });
    return new Response(JSON.stringify(res), { headers: { "Content-Type": "application/json" } });
  }

  let update: any;
  try { update = await req.json(); } catch { return new Response("ok"); }

  const cb = update?.callback_query;
  if (cb) {
    const chatId = cb.message.chat.id;
    const data = cb.data || "";

    if (data.startsWith("equip_")) {
      const itemId = data.replace("equip_", "");
      const { data: player, msgId } = await loadPlayer(chatId);
      if (player) {
        const item = EQUIPMENT.find(e => e.id === itemId);
        if (item && (player.inventory || []).includes(itemId)) {
          if (!player.equipped) player.equipped = {};
          player.equipped[item.slot] = itemId;
          await savePlayer(chatId, player, msgId);
          await sendMessage(chatId, `✅ *${item.emoji} ${item.name}* equipped!\n\n_${item.lore}_\n\n⛏️ Mining boost: +${item.mining_boost}%\n🛡️ Defense: +${item.defense}`);
        }
      }
    }

    if (data.startsWith("sell_")) {
      const itemId = data.replace("sell_", "");
      const { data: player, msgId } = await loadPlayer(chatId);
      if (player) {
        const item = EQUIPMENT.find(e => e.id === itemId);
        if (item && (player.inventory || []).includes(itemId)) {
          player.inventory = player.inventory.filter((i: string) => i !== itemId);
          if (player.equipped?.[item.slot] === itemId) delete player.equipped[item.slot];
          player.muddore = (player.muddore || 0) + item.mudd_value * 10;
          await savePlayer(chatId, player, msgId);
          await sendMessage(chatId, `💸 *${item.emoji} ${item.name}* sold for *${item.mudd_value * 10} MuddOre*.\n\n_The power it held returns to the earth._`);
        }
      }
    }

    if (data.startsWith("bond_lp_")) {
      const lpId = data.replace("bond_lp_", "");
      const { data: player, msgId } = await loadPlayer(chatId);
      if (player) {
        const lp = LP_TYPES.find(l => l.id === lpId);
        if (lp) {
          if (!player.pacts) player.pacts = {};
          player.pacts[lpId] = { level: 1, bonded: new Date().toISOString() };
          player.xp = (player.xp || 0) + 50;
          await savePlayer(chatId, player, msgId);
          await sendMessage(chatId, `🤝 *Pact formed with ${lp.emoji} ${lp.name}*\n\n_${lp.tradition} tradition. ${lp.specialty}._\n\n🎁 *Pact Gift:* ${lp.pact_gift}\n\n✨ +50 XP\n\n_Honor the pact. Knowledge flows both ways._`);
        }
      }
    }

    if (data.startsWith("companion_")) {
      const animalId = data.replace("companion_", "");
      const { data: player, msgId } = await loadPlayer(chatId);
      if (player && (player.animals || []).includes(animalId)) {
        player.companion = animalId;
        await savePlayer(chatId, player, msgId);
        const animal = CYBER_ANIMALS.find(a => a.id === animalId);
        await sendMessage(chatId, `${animal?.emoji} *${animal?.name}* is now your active companion.\n\n_${animal?.role}_`);
      }
    }

    await tgCall("answerCallbackQuery", { callback_query_id: cb.id });
    return new Response("ok");
  }

  const msg = update?.message;
  if (!msg?.text) return new Response("ok");

  const chatId: number = msg.chat.id;
  const fullName: string = msg.from.first_name || "Seeker";
  const text: string = msg.text.trim();

  console.log(`[InnerEarth] ${chatId} (${fullName}): "${text}"`);

  const { data: player, msgId } = await loadPlayer(chatId);
  const state: string = player?.state || "new";

  // ── /start ──────────────────────────────────────────────────────────────
  if (text === "/start") {
    if (player) {
      await sendMessage(chatId, `🌍 *Welcome back, ${fullName}.*\n\nThe earth remembers your footsteps.\nYour Little People have been working in your absence.\n\n_Check your mine. The deep calls._`, { reply_markup: mainMenu() });
      return new Response("ok");
    }

    const newPlayer = {
      full_name: fullName, xp: 0, level: 1, hp: 100, mana: 50,
      muddore: 100, muddcoin: 0, current_realm: 1,
      inventory: [], equipped: {}, pacts: {}, animals: [],
      companion: null, last_mine: 0, quests_completed: 0,
      state: "naming_ragaila", joined: new Date().toISOString()
    };
    await savePlayer(chatId, newPlayer, null);

    await sendMessage(chatId, `🌍 *INNER EARTH: Rise of the Ancients*\n\n_In the beginning, there was only the deep._\n_The Little People knew this. They carved the first paths._\n_They have been waiting for you._`);
    await new Promise(r => setTimeout(r, 2000));
    await sendMessage(chatId, `🪨 *The Cherokee elder speaks from the shadows:*\n\n_"Another one comes to the earth. Good. She has been restless."_\n\n_"But first — what do they call you, traveler? What name do you carry into the deep?"_\n\n✏️ *Give your Ragaila a name:*`);
    return new Response("ok");
  }

  if (!player) {
    await sendMessage(chatId, "Send /start to begin your journey into the Inner Earth. 🌍");
    return new Response("ok");
  }

  // ── Naming flow ──────────────────────────────────────────────────────────
  if (state === "naming_ragaila") {
    player.ragaila_name = text;
    player.state = "intro_complete";
    await savePlayer(chatId, player, msgId);
    await sendMessage(chatId, `⚔️ *${text}.*\n\nThe elder nods slowly. A Dverg dwarf peeks from behind a boulder. A wolf — Vex — circles once and sits.\n\n_"The name has weight. Good."_\n\nYou have been granted:\n🌿 *Keetoowah LP* — your first Little Person. Cherokee tradition. He knows every vein of MuddOre in the Ancient Earth.\n🐺 *Vex* — Wolf Spirit companion. He will give you combat wisdom.\n💎 *100 MuddOre* — starting wealth\n\nThe mine is open. The quest begins.\n\n_"Remember,"_ the elder says. _"Honor the pacts. The earth gives only to those who give back."_`);
    await new Promise(r => setTimeout(r, 1500));
    player.pacts = { keetoowah: { level: 1, bonded: new Date().toISOString() } };
    player.animals = ["vex"];
    player.companion = "vex";
    player.state = "playing";
    await savePlayer(chatId, player, msgId);
    await sendMessage(chatId, `🌍 *The Inner Earth awaits, ${text}.*`, { reply_markup: mainMenu() });
    return new Response("ok");
  }

  // ── ⛏️ Mine ──────────────────────────────────────────────────────────────
  if (text === "⛏️ Mine") {
    const { ore, hours, message } = await processMining(player);
    if (ore === 0) {
      const nextMine = new Date(player.last_mine + 30 * 60 * 1000);
      await sendMessage(chatId, `⛏️ *The Little People work in shifts.*\n\n_${message}_\n\nCheck back in 30+ minutes for yield.\n\n🌿 Active pacts: ${Object.keys(player.pacts || {}).length}\n⚒️ Mining boost: +${getMiningBoost(player)}%`, { reply_markup: mainMenu() });
    } else {
      player.muddore = (player.muddore || 0) + ore;
      player.xp = (player.xp || 0) + Math.floor(ore / 5);
      player.last_mine = Date.now();
      await savePlayer(chatId, player, msgId);

      // Random cyber animal clue during mining
      const clueChance = Math.random();
      let clueText = "";
      if (clueChance > 0.6 && player.companion) {
        const animal = CYBER_ANIMALS.find(a => a.id === player.companion);
        const clue = await queenSpeak(player, "mining discovery", "animal");
        clueText = `\n\n${animal?.emoji} *${animal?.name} whispers:*\n_"${clue.insight}"_\n\n💡 _"${clue.clue}"_`;
      }

      const muddEquiv = (player.muddore / 1000).toFixed(3);
      await sendMessage(chatId,
        `⛏️ *${hours}h of mining complete*\n\n+*${ore} MuddOre* harvested from the deep\n\n🏦 Total MuddOre: ${player.muddore}\n🪙 MUDD equivalent: ${muddEquiv} MUDD\n✨ +${Math.floor(ore/5)} XP${clueText}`,
        { reply_markup: mainMenu() });
    }
    return new Response("ok");
  }

  // ── ⚔️ Quest ──────────────────────────────────────────────────────────────
  if (text === "⚔️ Quest") {
    await sendTyping(chatId);
    const realm = REALMS[(player.current_realm || 1) - 1];
    const q = await queenSpeak(player, realm.name, "quest");
    player.state = "on_quest";
    player.active_quest = q;
    await savePlayer(chatId, player, msgId);
    await sendMessage(chatId,
      `${realm.emoji} *Quest: ${q.title}*\n\n_${q.description}_\n\n👤 *${q.npc}* stands before you.\n\n💡 _"${q.hint}"_\n\n⚔️ What do you do?\n_Type your action or response._`,
      { reply_markup: { keyboard: [[{ text: "⚔️ Attack" }, { text: "🔮 Magic" }], [{ text: "💬 Speak" }, { text: "🏃 Retreat" }], [{ text: "🏠 Main Menu" }]], resize_keyboard: true }});
    return new Response("ok");
  }

  // Quest responses
  if (state === "on_quest" && !MENU_TEXTS.includes(text) && text !== "🏠 Main Menu") {
    await sendTyping(chatId);
    if (text === "⚔️ Attack" || text === "🔮 Magic") {
      const enemy = player.active_quest?.npc || "a dark creature";
      const combat = await queenSpeak(player, enemy, "combat");
      const playerAtk = 20 + getMiningBoost(player) / 2 + Math.floor(Math.random() * 20);
      const enemyHp = combat.enemy_hp - playerAtk;
      const xpEarned = 40 + Math.floor(Math.random() * 30);
      const oreEarned = 20 + Math.floor(Math.random() * 50);

      if (enemyHp <= 0) {
        player.xp = (player.xp || 0) + xpEarned;
        player.muddore = (player.muddore || 0) + oreEarned;
        player.quests_completed = (player.quests_completed || 0) + 1;
        player.state = "playing";
        player.active_quest = null;
        await savePlayer(chatId, player, msgId);
        await sendMessage(chatId, `⚔️ *Victory!*\n\n_${combat.narrative}_\n\n💥 Your strike dealt *${playerAtk} damage*. The ${enemy} falls.\n\n✨ +${xpEarned} XP  |  ⛏️ +${oreEarned} MuddOre\n\n_The earth rewards the worthy._`, { reply_markup: mainMenu() });
      } else {
        const playerDmgTaken = Math.max(0, combat.enemy_attack - getTotalDefense(player) / 4);
        player.hp = Math.max(1, (player.hp || 100) - Math.floor(playerDmgTaken));
        await savePlayer(chatId, player, msgId);
        await sendMessage(chatId, `⚔️ *Combat continues...*\n\n_${combat.narrative}_\n\n💥 You deal *${playerAtk}* — Enemy HP: ${enemyHp}\n🩸 You take *${Math.floor(playerDmgTaken)}* — Your HP: ${player.hp}/100\n\n_${combat.enemy_move}_\n\nContinue?`, { reply_markup: { keyboard: [[{ text: "⚔️ Attack" }, { text: "🔮 Magic" }], [{ text: "💬 Speak" }, { text: "🏃 Retreat" }]], resize_keyboard: true }});
      }
    } else if (text === "💬 Speak") {
      const encounter = await queenSpeak(player, player.active_quest?.npc || "being", "encounter");
      await sendMessage(chatId, `👤 *${encounter.greeting}*\n\n_${encounter.challenge}_\n\n❓ *Riddle:* "${encounter.riddle}"\n\n_Answer wisely. Type your response._`);
    } else if (text === "🏃 Retreat") {
      player.state = "playing"; player.active_quest = null;
      await savePlayer(chatId, player, msgId);
      await sendMessage(chatId, `🏃 *You retreat into the tunnel.*\n\n_The earth does not judge. It waits._\n\nXP lost: 10`, { reply_markup: mainMenu() });
    } else {
      // Free response — treat as riddle answer
      const xpEarned = text.length > 20 ? 30 : 10;
      player.xp = (player.xp || 0) + xpEarned;
      player.state = "playing"; player.active_quest = null;
      await savePlayer(chatId, player, msgId);
      await sendMessage(chatId, `✅ *The being considers your words...*\n\n_"Hmm. The answer has weight."_\n\n✨ +${xpEarned} XP — Wisdom recognized.\n\n_The path forward opens slightly._`, { reply_markup: mainMenu() });
    }
    return new Response("ok");
  }

  // ── 🎒 Inventory ──────────────────────────────────────────────────────────
  if (text === "🎒 Inventory") {
    const inv = player.inventory || [];
    const equipped = player.equipped || {};
    const equippedNames = Object.entries(equipped).map(([slot, id]) => {
      const item = EQUIPMENT.find(e => e.id === id);
      return item ? `${item.emoji} ${item.name} (${slot})` : "";
    }).filter(Boolean);

    if (inv.length === 0 && equippedNames.length === 0) {
      await sendMessage(chatId,
        `🎒 *Inventory — Empty*\n\n_The Dverg dwarves have items for trade._\n_Complete quests and mine deep to earn MuddOre._\n\n🏪 Visit the *Market* (coming soon) to buy equipment.`,
        { reply_markup: mainMenu() });
    } else {
      const equippedText = equippedNames.length > 0 ? `\n\n⚔️ *Equipped:*\n${equippedNames.join("\n")}\n\n🛡️ Defense: ${getTotalDefense(player)}\n⛏️ Mining boost: +${getMiningBoost(player)}%` : "";
      const invText = inv.length > 0 ? `\n\n📦 *Unequipped items:* ${inv.length}` : "";
      await sendMessage(chatId,
        `🎒 *${player.ragaila_name || fullName}'s Inventory*\n\n_${getAvatarDescription(player)}_${equippedText}${invText}`,
        { reply_markup: mainMenu() });
    }
    return new Response("ok");
  }

  // ── 👥 Little People ─────────────────────────────────────────────────────
  if (text === "👥 Little People") {
    const pacts = player.pacts || {};
    const pactList = Object.keys(pacts).map(id => {
      const lp = LP_TYPES.find(l => l.id === id);
      return lp ? `${lp.emoji} *${lp.name}* (${lp.tradition}) — Level ${pacts[id].level}` : "";
    }).filter(Boolean);

    const available = LP_TYPES.filter(l => !pacts[l.id]).slice(0, 3);
    const availableButtons = available.map(l => [{ text: `🤝 Bond with ${l.emoji} ${l.name}`, callback_data: `bond_lp_${l.id}` }]);

    await sendMessage(chatId,
      `👥 *Your Little People*\n\n${pactList.length > 0 ? pactList.join("\n") : "_No pacts yet._"}\n\n_Total pact bonus: +${Object.keys(pacts).length * 5}% mining_\n\n_New pacts available:_`,
      { reply_markup: { inline_keyboard: availableButtons.length > 0 ? availableButtons : [[{ text: "All available pacts formed 👑", callback_data: "noop" }]] }});
    return new Response("ok");
  }

  // ── 🐾 Companions ─────────────────────────────────────────────────────────
  if (text === "🐾 Companions") {
    const animals = player.animals || [];
    const active = player.companion;

    if (animals.length === 0) {
      await sendMessage(chatId,
        `🐾 *Cyber Animal Companions*\n\n_None bonded yet._\n\nComplete quests to encounter and bond with:\n🐺 Vex · 🦅 Aura · 🐍 Coil · 🦁 Kron · 🐙 Null · 🔥 Pyar`,
        { reply_markup: mainMenu() });
    } else {
      const animalList = animals.map((id: string) => {
        const a = CYBER_ANIMALS.find(c => c.id === id);
        return a ? `${a.emoji} *${a.name}* — ${a.type} ${active === id ? "✅" : ""}` : "";
      }).filter(Boolean);

      const switchButtons = animals.map((id: string) => {
        const a = CYBER_ANIMALS.find(c => c.id === id);
        return a ? [{ text: `Set active: ${a.emoji} ${a.name}`, callback_data: `companion_${id}` }] : [];
      });

      // Ask active companion for insight
      if (active) {
        await sendTyping(chatId);
        const animal = CYBER_ANIMALS.find(a => a.id === active);
        const wisdom = await queenSpeak(player, "companion wisdom", "animal");
        await sendMessage(chatId,
          `🐾 *Your Companions*\n\n${animalList.join("\n")}\n\n${animal?.emoji} *${animal?.name} speaks:*\n_"${wisdom.insight}"_\n\n💡 _"${wisdom.clue}"_`,
          { reply_markup: { inline_keyboard: switchButtons }});
      } else {
        await sendMessage(chatId, `🐾 *Your Companions*\n\n${animalList.join("\n")}`, { reply_markup: { inline_keyboard: switchButtons }});
      }
    }
    return new Response("ok");
  }

  // ── 🌍 Realm ─────────────────────────────────────────────────────────────
  if (text === "🌍 Realm") {
    await sendTyping(chatId);
    const realm = REALMS[(player.current_realm || 1) - 1];
    const lore = await queenSpeak(player, realm.name, "lore");
    const nextRealm = REALMS[player.current_realm] || null;
    await sendMessage(chatId,
      `${realm.emoji} *${realm.name}*\n\n_${realm.desc}_\n\n📖 *Ancient lore:*\n_${lore.lore}_\n\n${nextRealm ? `\n🔮 Next realm: *${nextRealm.name}* — requires ${(player.current_realm || 1) * 200} XP` : "👑 You are at the Sacred Core."}`,
      { reply_markup: mainMenu() });
    return new Response("ok");
  }

  // ── 📊 Stats ─────────────────────────────────────────────────────────────
  if (text === "📊 Stats") {
    const tier = getPlayerTier(player);
    const boost = getMiningBoost(player);
    await sendMessage(chatId,
      `📊 *${player.ragaila_name || fullName}*\n\n${tier}\n\n❤️ HP: ${player.hp || 100}/100\n💫 Mana: ${player.mana || 50}/50\n✨ XP: ${player.xp || 0}\n🌍 Realm: ${player.current_realm || 1}/7\n⛏️ Mining boost: +${boost}%\n🛡️ Defense: ${getTotalDefense(player)}\n⚔️ Quests completed: ${player.quests_completed || 0}\n🤝 LP pacts: ${Object.keys(player.pacts || {}).length}\n🐾 Companions: ${(player.animals || []).length}`,
      { reply_markup: mainMenu() });
    return new Response("ok");
  }

  // ── 💰 Economy ───────────────────────────────────────────────────────────
  if (text === "💰 Economy") {
    const muddClaim = Math.floor((player.muddore || 0) / 1000);
    await sendMessage(chatId,
      `💰 *Inner Earth Economy*\n\n⛏️ MuddOre: *${player.muddore || 0}*\n🪙 MUDD equivalent: *${(player.muddore / 1000).toFixed(3)}*\n\n_Exchange rate: 1000 MuddOre = 1 MUDD_\n${muddClaim > 0 ? `\n🎯 You can claim *${muddClaim} MUDD* on-chain\n/claim — coming soon` : "_Mine more to reach 1000 MuddOre threshold_"}\n\nContract: \`0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8\`\n_(TON Testnet)_\n\n⚠️ *Selling items loses their power permanently.*`,
      { reply_markup: mainMenu() });
    return new Response("ok");
  }

  if (text === "🏠 Main Menu") {
    player.state = "playing";
    await savePlayer(chatId, player, msgId);
    await sendMessage(chatId, `🌍 *Inner Earth*\n\n_The deep calls. What next, ${player.ragaila_name || fullName}?_`, { reply_markup: mainMenu() });
    return new Response("ok");
  }

  // Fallback
  await sendMessage(chatId, "Use the menu to navigate the Inner Earth. 🌍", { reply_markup: mainMenu() });
  return new Response("ok");
});

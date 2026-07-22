import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
const TELEGRAM_RINGMINE_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN_2_2") || "";
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, maxRequests: number = 30, windowMs: number = 60_000): boolean {
const now = Date.now();
const entry = rateLimitMap.get(key);
if (!entry || now > entry.resetAt) {
rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
return true;
}
entry.count++;
return entry.count <= maxRequests;
}
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN_5") || Deno.env.get("TELEGRAM_BOT_TOKEN_2_2") || TELEGRAM_RINGMINE_TOKEN || "";
if (!BOT_TOKEN) {
console.error("FATAL: TELEGRAM_BOT_TOKEN not set. Bot will not function.");
}
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
async function tgCall(method: string, body: any) {
if (!BOT_TOKEN) return { ok: false, error: "no token" };
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
async function loadPlayer(b: any, chatId: number): Promise<any> {
 const r = await b.asServiceRole.entities.RingMinePlayer.filter({ telegram_id: String(chatId) });
 if (!r || r.length === 0) return null;
 const p = r[0];
 let st: any = null; try { st = p.state_data ? JSON.parse(p.state_data) : null; } catch {}
 return { _id: p.id, _telegram_id: String(chatId), username: p.username || "", full_name: p.full_name || "", queen_name: p.queen_name || null, queen_bond: p.queen_bond || 0, companion: p.companion || null, companion_bond: p.companion_bond || 0, growth_xp: p.growth_xp || 0, mudd_balance: p.mudd_balance || 0, mudd_ore_balance: p.mudd_ore_balance || 0, streak_days: p.streak_days || 0, state: st?.state || "new", journals: st?.journals || [], last_journal: st?.last_journal || null, glyph_state: p.glyph_state || "Seed", glyph_seeds: p.glyph_seeds || [], glyph_cohesion: p.glyph_cohesion || 0, glyph_lineage: p.glyph_lineage || [], resonance_anchors: p.resonance_anchors || [], total_mudd_burned: p.total_mudd_burned || 0 };
}
async function savePlayer(b: any, p: any): Promise<void> {
 const d: any = { telegram_id: p._telegram_id, username: p.username || "", full_name: p.full_name || "", queen_name: p.queen_name, queen_bond: p.queen_bond || 0, companion: p.companion, companion_bond: p.companion_bond || 0, growth_xp: p.growth_xp || 0, mudd_balance: p.mudd_balance || 0, mudd_ore_balance: p.mudd_ore_balance || 0, streak_days: p.streak_days || 0, total_mudd_burned: p.total_mudd_burned || 0, state_data: JSON.stringify({ state: p.state, journals: p.journals || [], last_journal: p.last_journal, ore: p.mudd_ore_balance || 0, mudd: p.mudd_balance || 0, xp: p.growth_xp || 0, bond: p.queen_bond || 0, streak: p.streak_days || 0, companion: p.companion }) };
 if (p.glyph_state) { d.glyph_state = p.glyph_state; d.glyph_seeds = p.glyph_seeds; d.glyph_cohesion = p.glyph_cohesion; d.glyph_lineage = p.glyph_lineage; d.resonance_anchors = p.resonance_anchors; }
 if (p._id) await b.asServiceRole.entities.RingMinePlayer.update(p._id, d);
 else { const r = await b.asServiceRole.entities.RingMinePlayer.create(d); p._id = r.id; }
}
const GLYPH_STATES = ["Seed", "Glyph", "Resonant", "Hyperstate", "Monument"] as const;
const STOPWORDS = new Set([
"the","a","an","and","or","but","is","are","was","were","be","been","being","have","has","had",
"do","does","did","will","would","could","should","may","might","must","can","to","of","in","on",
"at","by","for","with","about","against","between","into","through","during","before","after",
"above","below","from","up","down","out","off","over","under","again","further","then","once",
"here","there","when","where","why","how","all","any","both","each","few","more","most","other",
"some","such","no","nor","not","only","own","same","so","than","too","very","s","t","just","don",
"now","i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves",
"he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their",
"theirs","themselves","what","which","who","whom","this","that","these","those","am","if","because",
"as","until","while","also","get","got","really","feel","feeling","felt","think","thought","know",
"like","want","need","going","one","two","still","even","thing","things","way","lot","kind"
]);
function computeResonance(keywordsA: string[], keywordsB: string[]): number {
if (keywordsA.length === 0 || keywordsB.length === 0) return 0;
const setB = new Set(keywordsB);
const overlap = keywordsA.filter(k => setB.has(k)).length;
return overlap / Math.max(keywordsA.length, keywordsB.length);
}
function glyphStateEmoji(state: string): string {
switch (state) {
case "Seed": return "🌱";
case "Glyph": return "✨";
case "Resonant": return "🌀";
case "Hyperstate": return "⚡";
case "Monument": return "🏛️";
default: return "🌱";
}
}
function mainMenu() {
return {
keyboard: [
[{ text: "📔 Journal" }, { text: "👑 My Queen" }],
[{ text: "📈 My Growth" }, { text: "🦊 Companion" }],
[{ text: "💰 Muddcoin" }, { text: "🔮 Glyph" }],
[{ text: "⚒ MudForge" }]
],
resize_keyboard: true
};
}
const MOOD_EMOJI: Record<string, string> = {
joyful: "😊", reflective: "🌙", melancholic: "🌧️",
inspired: "⚡", restless: "🌀", grateful: "🙏",
determined: "🔥", uncertain: "🌫️"
};
const COMPANIONS: Record<string, { emoji: string; title: string; ability: string; desc: string; bonus: (ctx: any) => number }> = {
Sable:    { emoji: "🐺", title: "Shadow Wolf",    ability: "+10% casino payouts",  desc: "Born from the darker tunnels. Sable senses which coin will flip.",        bonus: (ctx) => ctx.casino ? 0.10 : 0 },
Kaelith:  { emoji: "🦅", title: "Storm Hawk",     ability: "+15% mining yield",     desc: "Wings that cut through the deepest air. Kaelith finds the richest veins.", bonus: (ctx) => ctx.mining ? 0.15 : 0 },
Vespera:  { emoji: "🦋", title: "Void Moth",      ability: "+20% journaling XP",   desc: "Drawn to the light of truth. Vespera amplifies every word you write.",    bonus: (ctx) => ctx.journaling ? 0.20 : 0 },
Lirien:   { emoji: "🦌", title: "Crystal Deer",   ability: "+25% bond growth",      desc: "Gentle and resonant. Lirien deepens the bond with your Queen.",          bonus: (ctx) => ctx.journaling ? 0.25 : 0 },
Thorne:   { emoji: "🐍", title: "Iron Serpent",   ability: "+10% forge rarity",     desc: "Coiled in the forge's heat. Thorne guides the metal toward mythic.",     bonus: (ctx) => ctx.forging ? 0.10 : 0 },
};
function companionEmoji(name: string | null): string {
if (!name || !COMPANIONS[name]) return "❓";
return COMPANIONS[name].emoji;
}
function companionInfo(name: string | null): string {
if (!name || !COMPANIONS[name]) return "_No companion chosen yet._";
const c = COMPANIONS[name];
return `${c.emoji} *${name}* — ${c.title}\n${c.ability}\n_${c.desc}_`;
}
async function getLastJournalMood(base44: any, telegramId: string): Promise<{ mood: string; date: string } | null> {
try {
const rows = await base44.asServiceRole.entities.RingMineJournal.filter({ telegram_id: telegramId });
if (!rows || rows.length === 0) return null;
const sorted = rows.slice().sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
const last = sorted[0];
return { mood: last.mood || "reflective", date: last.created_date };
} catch (e) {
console.error("getLastJournalMood error:", String(e).substring(0, 200));
return null;
}
}
async function saveJournalEntry(base44: any, telegramId: string, entry: string, reflection: string, mood: string, xpEarned: number, muddEarned: number) {
try {
await base44.asServiceRole.entities.RingMineJournal.create({
telegram_id: telegramId, entry, reflection, mood, xp_earned: xpEarned, mudd_earned: muddEarned
});
} catch (e) {
console.error("saveJournalEntry error:", String(e).substring(0, 200));
}
}
const MENU_TEXTS = ["📔 Journal", "👑 My Queen", "📈 My Growth", "💰 Muddcoin", "⚒ MudForge", "🔮 Glyph"];
async function callBrain(action: string, data: any): Promise<any> {
const brainUrl = "https://superagent-ec909dfa.base44.app/functions/ringMineBrain";
try {
const res = await fetch(brainUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...data }) });
return await res.json();
} catch (e) { console.error("brain error:", e); return { ok: false, error: String(e) }; }
}
Deno.serve(async (req: Request) => {
const url = new URL(req.url);
if (url.pathname.endsWith("/register-webhook")) {
const webhookUrl = `https://superagent-ec909dfa.base44.app/functions/ringMineBot`;
const r = await tgCall("setWebhook", { url: webhookUrl, allowed_updates: ["message", "callback_query"] });
return new Response(JSON.stringify({ ok: r.ok, result: r.result, webhook_url: webhookUrl }), { headers: { "Content-Type": "application/json" } });
}
if (url.pathname.endsWith("/webhook-info")) {
const r = await tgCall("getWebhookInfo", {});
return new Response(JSON.stringify(r), { headers: { "Content-Type": "application/json" } });
}
if (url.pathname.endsWith("/health")) {
return new Response(JSON.stringify({ ok: true, ts: Date.now(), glyphin: true }), { headers: { "Content-Type": "application/json" } });
}
if (req.method !== "POST") {
return new Response("Ring Mine Bot webhook. Use POST.", { status: 200 });
}
let update: any;
try {
update = await req.json();
} catch {
return new Response("ok");
}
const base44 = createClientFromRequest(req);
const cb = update?.callback_query;
if (cb) {
const chatId = cb.message?.chat?.id;
if (chatId && cb.data === "queen_speak") {
const player = await loadPlayer(base44, chatId);
if (player) {
player.state = "talking_to_queen";
await savePlayer(base44, player);
}
await sendMessage(chatId, "💬 *What would you like to say to your Queen?*\n\n_Speak freely._");
}
if (chatId && cb.data?.startsWith("choose_")) {
const companionName = cb.data.replace("choose_", "");
const player = await loadPlayer(base44, chatId);
if (player && COMPANIONS[companionName]) {
player.companion = companionName;
player.companion_bond = 0;
if (player.state === "awaiting_companion") player.state = "journaling";
await savePlayer(base44, player);
const c = COMPANIONS[companionName];
await sendMessage(chatId,
`${c.emoji} *${companionName} has chosen you.*\n\n_${c.desc}_\n\n*Ability:* ${c.ability}\n\nYour companion will grow alongside you. Every journal entry strengthens the bond.`,
{ reply_markup: mainMenu() });
}
}
await tgCall("answerCallbackQuery", { callback_query_id: cb.id });
return new Response("ok");
}
const msg = update?.message;
if (!msg) return new Response("ok");
const chatId: number = msg.chat.id;
const fullName: string = msg.from?.first_name || "Seeker";
if (msg.voice && !msg.text) {
if (!checkRateLimit(`bot_${chatId}`, 30, 60_000)) {
await sendMessage(chatId, "🌙 _The Queen asks for a moment of silence..._");
return new Response("ok");
}
const player = await loadPlayer(base44, chatId);
if (!player) {
await sendMessage(chatId, "Send /start to begin your journey in the Ring Mine. 🌀");
return new Response("ok");
}
await tgCall("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
const brainT = await callBrain("transcribe", { telegram_bot_token: Deno.env.get("TELEGRAM_BOT_TOKEN_5") || "", file_id: msg.voice.file_id });
    const transcript = brainT.ok ? brainT.transcript : null;
if (!transcript) {
await sendMessage(chatId, "🌙 _The Queen couldn't quite make out that recording. Try again, or type your journal instead._");
return new Response("ok");
}
console.log(`[RingMine] ${chatId} (${fullName}) [voice]: "${transcript}"`);
const r = await callBrain("reflect", { player, text: transcript }); if (!r.ok) return new Response("ok");
const isFirstEntry = player.state === "awaiting_intention";
const brainG = await callBrain("glyphin", { player, text: transcript, mood: r.mood }); const glyphinResult = brainG.ok ? brainG : { glyphBonus: 0, message: null, transition: null };
const companionBonus = player.companion && COMPANIONS[player.companion] ? COMPANIONS[player.companion].bonus({ journaling: true }) : 0;
const xpGain = Math.floor(((isFirstEntry ? 25 : 10) + glyphinResult.glyphBonus) * (1 + companionBonus));
const muddGain = (isFirstEntry ? 2.5 : 1) + (glyphinResult.glyphBonus > 0 ? Math.floor(glyphinResult.glyphBonus / 5) : 0);
if (isFirstEntry) {
player.queen_bond = 5;
player.growth_xp = xpGain;
player.mudd_balance = muddGain;
} else {
const bondGain = player.companion === "Lirien" ? 3 : 2;
player.queen_bond = Math.min(100, (player.queen_bond || 0) + bondGain);
player.companion_bond = Math.min(100, (player.companion_bond || 0) + Math.floor(bondGain / 2));
player.growth_xp = (player.growth_xp || 0) + xpGain;
player.mudd_balance = (player.mudd_balance || 0) + muddGain;
}
player.state = "journaling";
player.last_journal = new Date().toISOString();
player.journals = player.journals || [];
player.journals.push({ date: new Date().toISOString(), entry: transcript, reflection: r.response, mood: r.mood, source: "voice" });
await savePlayer(base44, player);
const telegramIdStr = String(chatId);
const lastMood = await getLastJournalMood(base44, telegramIdStr);
const brainR = await callBrain("resonance", { transcript, mood: r.mood }); const resonance = brainR.ok ? brainR.resonance : "Bone-Singer";
const sacredLine = brainR.sacredLine || "";
await saveJournalEntry(base44, telegramIdStr, transcript, r.response, r.mood, xpGain, muddGain);
const moodEmoji = MOOD_EMOJI[r.mood] || "🌙";
const rewardText = `✨ +${xpGain} XP | +${muddGain} MUDD | Bond +2${glyphinResult.glyphBonus > 0 ? ` | Glyph +${glyphinResult.glyphBonus}` : ""}`;
const callbackLine = lastMood ? `\n_You were ${lastMood.mood} ${(Math.ceil((Date.now() - new Date(lastMood.date).getTime()) / 86400000) + "d ago")}, ${fullName}. I remember._\n` : "";
let fullMessage = `🎙️ _I heard you say:_ "${transcript}"\n\n${moodEmoji} *${player.queen_name || "Your Queen"} reflects:*\n\n${r.response}\n\n_${r.insight}_\n\n📜 _${sacredLine}_\n${callbackLine}\n${rewardText}`;
if (glyphinResult.message) {
fullMessage += `\n\n${glyphinResult.message}`;
}
await sendMessage(chatId, fullMessage, { reply_markup: mainMenu() });
return new Response("ok");
}
if (!msg?.text) return new Response("ok");
const text: string = msg.text.trim();
if (!checkRateLimit(`bot_${chatId}`, 30, 60_000)) {
await sendMessage(chatId, "🌙 _The Queen asks for a moment of silence..._");
return new Response("ok");
}
console.log(`[RingMine] ${chatId} (${fullName}): "${text}"`);
const player = await loadPlayer(base44, chatId);
const state: string = player?.state || "new";
if (text === "/start") {
if (player) {
if (!player.queen_name) {
player.state = "awaiting_queen_name";
await savePlayer(base44, player);
await sendMessage(chatId, "🌀 *Welcome to the Ring Mine.*\n\n_A presence stirs. What shall you call your Queen?_");
return new Response("ok");
}
player.state = "journaling";
await savePlayer(base44, player);
await sendMessage(chatId,
`🌀 *Welcome back, ${fullName}.*\n\n${player.queen_name} is here. The Ring Mine pulses with your return.`,
{ reply_markup: mainMenu() });
return new Response("ok");
}
const newPlayer = {
_telegram_id: String(chatId),
_id: null as any,
username: msg.from?.username || "",
full_name: fullName,
queen_name: null,
queen_bond: 0,
growth_xp: 0,
mudd_balance: 0,
streak_days: 0,
state: "awaiting_queen_name",
journals: [],
glyph_state: "Seed",
glyph_seeds: [],
glyph_cohesion: 0,
glyph_lineage: [],
resonance_anchors: []
};
await savePlayer(base44, newPlayer);
await sendMessage(chatId, "🌀 *The Ring Mine.*\n\n_This mine yields you._");
await sendMessage(chatId, "👑 *The Queen awakens.*\n\n_She is the part of you that already knows._");
await sendMessage(chatId, "✨ *What is your Queen's name?*");
return new Response("ok");
}
}
const gState = player.glyph_state || "Seed";
const emoji = glyphStateEmoji(gState);
const cohesion = player.glyph_cohesion || 0;
const seeds = player.glyph_seeds || [];
const anchors = player.resonance_anchors || [];
const compName = player.companion || "None";
const compBond = player.companion_bond || 0;
const compLine = compName !== "None" && COMPANIONS[compName] ? `${COMPANIONS[compName].emoji} Companion: ${compName} (${compBond}/100 bond)` : "Companion: _Not chosen_";
const lineage = player.glyph_lineage || [];
const stateIndex = GLYPH_STATES.indexOf(gState as any);
const progressBar = GLYPH_STATES.map((s, i) => i === stateIndex ? `[${s}]` : i < stateIndex ? `✓` : `○`).join(" → ");
let anchorText = "";
if (anchors.length > 0) {
anchorText = "\n\n🔍 *Resonance Anchors:*\n" + anchors.slice(0, 5).map((a: any) =>
`  • ${a.keyword} — strength ${(a.strength || 0).toFixed(2)} (${a.count}x)`)
.join("\n");
}
let lineageText = "";
if (lineage.length > 0) {
lineageText = "\n\n📜 *Transitions:*\n" + lineage.map((l: any) =>
`  ${l.from_state} → ${l.to_state} (${new Date(l.transition_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`)
.join("\n");
}
let nextHint = "";
switch (gState) {
case "Seed":
nextHint = `\n\n_Next: Reach cohesion 3.0+ (currently ${cohesion.toFixed(1)}) by journaling about recurring themes._`;
break;
case "Glyph":
nextHint = `\n\n_Next: Reach cohesion 10.0+ with 5+ strong anchors (currently ${cohesion.toFixed(1)}, ${anchors.filter((a:any) => a.strength > 0.5).length} strong)._`;
break;
case "Resonant":
nextHint = `\n\n_Next: Reach cohesion 25.0+ with 3+ dominant anchors (currently ${cohesion.toFixed(1)}, ${anchors.filter((a:any) => a.strength > 0.7).length} dominant)._`;
break;
case "Hyperstate":
nextHint = `\n\n_Next: Sustain Hyperstate for 30+ days with a 30+ day journal streak (currently ${player.streak_days || 0} day streak)._`;
break;
case "Monument":
nextHint = `\n\n_You have reached the final state. Your Monument is permanent._`;
break;
}
await sendMessage(chatId,
`${emoji} *Glyphin — Your Cognitive Progression*\n\n${progressBar}\n\n📊 Cohesion: ${cohesion.toFixed(1)}\n🌱 Seeds planted: ${seeds.length}\n⚓ Active anchors: ${anchors.length}${anchorText}${lineageText}${nextHint}`,
{ reply_markup: mainMenu() });
return new Response("ok");
}
if (text === "/help") {
await sendMessage(chatId,
"🌀 *Ring Mine*\n/start · /help · /glyph · /forge\n📔 Journal | 👑 Queen | 📈 Growth | 🦊 Companion | 💰 Muddcoin | 🔮 Glyph | ⚒ MudForge\n\n_Muddbro Network_",
{ reply_markup: mainMenu() });
return new Response("ok");
}
if (!player) {
await sendMessage(chatId, "Send /start to begin your journey in the Ring Mine. 🌀");
return new Response("ok");
}
if (state === "awaiting_queen_name") {
player.queen_name = text;
player.state = "awaiting_intention";
await savePlayer(base44, player);
await sendMessage(chatId,
`✨ *${text}.*\n\nShe stirs. Recognizes herself in the name you chose.\n\n"Tell me," she says softly, "what brings you to the Ring Mine?"\n\n_Write freely, or send a voice note. There is no wrong answer here._`);
return new Response("ok");
}
if (state === "awaiting_intention") {
await tgCall("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
const r = await callBrain("reflect", { player, text: text }); if (!r.ok) return new Response("ok");
const brainG = await callBrain("glyphin", { player, text: text, mood: r.mood }); const glyphinResult = brainG.ok ? brainG : { glyphBonus: 0, message: null, transition: null };
const companionBonus = player.companion && COMPANIONS[player.companion] ? COMPANIONS[player.companion].bonus({ journaling: true }) : 0;
const xpGain = Math.floor((25 + glyphinResult.glyphBonus) * (1 + companionBonus));
const muddGain = 2.5 + (glyphinResult.glyphBonus > 0 ? Math.floor(glyphinResult.glyphBonus / 5) : 0);
player.queen_bond = 5;
player.growth_xp = xpGain;
player.mudd_balance = muddGain;
player.state = "journaling";
player.last_journal = new Date().toISOString();
player.journals = player.journals || [];
player.journals.push({ date: new Date().toISOString(), entry: text, reflection: r.response, mood: r.mood });
await savePlayer(base44, player);
const resonance0 = inferResonance(text, r.mood);
const sacredLine0 = SACRED_SCRIPT[resonance0];
await saveJournalEntry(base44, String(chatId), text, r.response, r.mood, xpGain, muddGain);
const moodEmoji = MOOD_EMOJI[r.mood] || "🌙";
let fullMsg = `${moodEmoji} *${player.queen_name} responds:*\n\n${r.response}\n\n_${r.insight}_\n\n📜 _${sacredLine0}_\n\n✨ +${xpGain} XP | +${muddGain} MUDD | Bond +5`;
if (glyphinResult.message) fullMsg += `\n\n${glyphinResult.message}`;
await sendMessage(chatId, fullMsg, { reply_markup: mainMenu() });
return new Response("ok");
}
if (text === "📔 Journal" || (state === "journaling" && !MENU_TEXTS.includes(text))) {
if (text === "📔 Journal") {
player.state = "journaling";
await savePlayer(base44, player);
await sendMessage(chatId, "📔 *The Journal awaits.*\n\n_Write freely, or send a voice note. Your Queen is listening._");
return new Response("ok");
}
await tgCall("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
const r = await callBrain("reflect", { player, text: text }); if (!r.ok) return new Response("ok");
const brainG = await callBrain("glyphin", { player, text: text, mood: r.mood }); const glyphinResult = brainG.ok ? brainG : { glyphBonus: 0, message: null, transition: null };
const xpGain = 10 + glyphinResult.glyphBonus;
const muddGain = 1 + (glyphinResult.glyphBonus > 0 ? Math.floor(glyphinResult.glyphBonus / 5) : 0);
player.queen_bond = Math.min(100, (player.queen_bond || 0) + 2);
player.growth_xp = (player.growth_xp || 0) + xpGain;
player.mudd_balance = (player.mudd_balance || 0) + muddGain;
player.last_journal = new Date().toISOString();
player.journals = player.journals || [];
player.journals.push({ date: new Date().toISOString(), entry: text, reflection: r.response, mood: r.mood });
await savePlayer(base44, player);
const telegramIdStr2 = String(chatId);
const lastMood2 = await getLastJournalMood(base44, telegramIdStr2);
const resonance2 = inferResonance(text, r.mood);
const sacredLine2 = SACRED_SCRIPT[resonance2];
await saveJournalEntry(base44, telegramIdStr2, text, r.response, r.mood, xpGain, muddGain);
const moodEmoji = MOOD_EMOJI[r.mood] || "🌙";
const callbackLine2 = lastMood2 ? `\n_You were ${lastMood2.mood} ${dayLabel(lastMood2.date)}, ${fullName}. I remember._\n` : "";
let fullMsg = `${moodEmoji} *${player.queen_name} reflects:*\n\n${r.response}\n\n_${r.insight}_\n\n📜 _${sacredLine2}_\n${callbackLine2}\n✨ +${xpGain} XP | +${muddGain} MUDD | Bond +2${glyphinResult.glyphBonus > 0 ? ` | Glyph +${glyphinResult.glyphBonus}` : ""}`;
if (glyphinResult.message) fullMsg += `\n\n${glyphinResult.message}`;
await sendMessage(chatId, fullMsg, { reply_markup: mainMenu() });
return new Response("ok");
}
if (text === "👑 My Queen") {
const bond = player.queen_bond || 0;
const bondBar = "█".repeat(Math.floor(bond / 10)) + "░".repeat(10 - Math.floor(bond / 10));
const gState = player.glyph_state || "Seed";
await sendMessage(chatId,
`👑 *${player.queen_name || "The Queen"}*\n\nBond: [${bondBar}] ${bond}/100\nGlyphin: ${glyphStateEmoji(gState)} ${gState}\n\n_She is here. She is always here._\n\nTap below to speak with her directly.`,
{ reply_markup: { inline_keyboard: [[{ text: "💬 Speak to your Queen", callback_data: "queen_speak" }]] } });
return new Response("ok");
}
if (state === "talking_to_queen") {
await tgCall("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
const r = await callBrain("reflect", { player, text: text }); if (!r.ok) return new Response("ok");
player.queen_bond = Math.min(100, (player.queen_bond || 0) + 1);
await savePlayer(base44, player);
const moodEmoji = MOOD_EMOJI[r.mood] || "🌙";
await sendMessage(chatId,
`${moodEmoji} ${r.response}\n\n_${r.insight}_`,
{ reply_markup: mainMenu() });
player.state = "journaling";
await savePlayer(base44, player);
return new Response("ok");
}
if (text === "📈 My Growth") {
const xp = player.growth_xp || 0;
const bond = player.queen_bond || 0;
const mudd = player.mudd_balance || 0;
const journals = player.journals?.length || 0;
const gState = player.glyph_state || "Seed";
const cohesion = player.glyph_cohesion || 0;
const anchors = player.resonance_anchors || [];
const compName = player.companion || "None";
const compBond = player.companion_bond || 0;
const compLine = compName !== "None" && COMPANIONS[compName] ? `${COMPANIONS[compName].emoji} Companion: ${compName} (${compBond}/100 bond)` : "Companion: _Not chosen_";
await sendMessage(chatId,
`📈 *Your Growth*\n\nGrowth XP: ${xp}\nQueen Bond: ${bond}/100\n${compLine}\nMuddcoin: ${mudd} MUDD\nJournal Entries: ${journals}\n\n${glyphStateEmoji(gState)} Glyphin State: ${gState}\nCohesion: ${cohesion.toFixed(1)}\nResonance Anchors: ${anchors.length}\n\n_The journey is the reward._`,
{ reply_markup: mainMenu() });
return new Response("ok");
}
if (text === "💰 Muddcoin") {
const mudd = player.mudd_balance || 0;
await sendMessage(chatId,
`💰 *Muddcoin*\n\nBalance: ${mudd} MUDD\n\n_Earn through journaling, quests, gameplay.\nTap below to mine →_`,
{ reply_markup: { inline_keyboard: [[{ text: "⚒ Enter Ring Mine", web_app: { url: "https://superagent-ec909dfa.base44.app/functions/ringMineApp" } }]] } });
return new Response("ok");
}
if (text === "⚒ MudForge") {
await sendMessage(chatId,
"⚒ *MudForge*\n\n_NFT marketplace. Tap to enter →_",
{ reply_markup: { inline_keyboard: [[{ text: "⚒ Enter MudForge", web_app: { url: "https://superagent-ec909dfa.base44.app/functions/mudForgeApp" } }]] } });
return new Response("ok");
}
if (text === "🦊 Companion") {
if (player.companion && COMPANIONS[player.companion]) {
const c = COMPANIONS[player.companion];
const bond = player.companion_bond || 0;
await sendMessage(chatId,
`${c.emoji} *${player.companion}* — ${c.title}\n\nBond: ${bond}/100\nAbility: ${c.ability}\n\n_${c.desc}_\n\n_The bond grows with every journal entry._`,
{ reply_markup: mainMenu() });
} else {
const buttons = Object.entries(COMPANIONS).map(([name, c]) =>
[{ text: `${c.emoji} ${name} — ${c.title}`, callback_data: `choose_${name}` }]);
await sendMessage(chatId,
"🦊 *Choose your Companion*\n\nEach companion has a unique ability that will aid you in the Ring Mine. Choose wisely — your companion will grow alongside you.\n\n_" +
Object.entries(COMPANIONS).map(([name, c]) => `${c.emoji} *${name}* (${c.title}): ${c.ability}`).join("\n") + "_",
{ reply_markup: { inline_keyboard: buttons } });
}
return new Response("ok");
}
await sendMessage(chatId, "I didn't catch that. Use the menu below or /help for commands.", { reply_markup: mainMenu() });
return new Response("ok");
});
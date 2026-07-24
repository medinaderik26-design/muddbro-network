import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN_5") || "";
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WM_URL = "https://superagent-ec909dfa.base44.app/functions/walletManager";
const rlMap=new Map<string,{c:number;t:number}>();
function rl(k:string,mx=30,ms=60_000):boolean{const n=Date.now(),e=rlMap.get(k);if(!e||n>e.t){rlMap.set(k,{c:1,t:n+ms});return true;}e.c++;return e.c<=mx;}
async function tg(m:string,b:any){const r=await fetch(`${TG}/${m}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});return await r.json();}
async function sm(cid:number,txt:string,ex:any={}){return tg("sendMessage",{chat_id:cid,text:txt,parse_mode:"Markdown",...ex});}
const BRAIN_URL = "https://superagent-ec909dfa.base44.app/functions/ringMineBrain";
async function brain(a:string,d:any):Promise<any>{try{const r=await fetch(BRAIN_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:a,...d})});return await r.json();}catch(e){return{ok:false,error:String(e)};}}
async function wm(a:string,d:any):Promise<any>{try{const r=await fetch(WM_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:a,...d})});return await r.json();}catch(e){return{ok:false,error:String(e)};}}
async function loadP(b:any,cid:number):Promise<any>{
  const r=await b.asServiceRole.entities.RingMinePlayer.filter({telegram_id:String(cid)});
  if(!r?.length)return null;const p=r[0];
  let st:any=null;try{st=p.state_data?(typeof p.state_data==="string"?JSON.parse(p.state_data):p.state_data):null;}catch{}
  return{_id:p.id,_t:String(cid),username:p.username||"",full_name:p.full_name||"",queen_name:p.queen_name||null,queen_bond:p.queen_bond||0,companion:p.companion||null,companion_bond:p.companion_bond||0,growth_xp:p.growth_xp||0,mudd_balance:p.mudd_balance||0,mudd_ore_balance:Math.max(p.mudd_ore_balance||0,st?.ore||0),streak_days:p.streak_days||0,state:st?.state||"new",journals:st?.journals||[],last_journal:st?.last_journal||null,glyph_state:p.glyph_state||"Seed",glyph_seeds:p.glyph_seeds||[],glyph_cohesion:p.glyph_cohesion||0,glyph_lineage:p.glyph_lineage||[],resonance_anchors:p.resonance_anchors||[],total_mudd_burned:p.total_mudd_burned||0,ton_wallet_address:p.ton_wallet_address||"",total_withdrawn:p.total_withdrawn||0};
}
async function saveP(b:any,p:any){
  const d:any={telegram_id:p._t,username:p.username||"",full_name:p.full_name||"",queen_name:p.queen_name,queen_bond:p.queen_bond||0,companion:p.companion,companion_bond:p.companion_bond||0,growth_xp:p.growth_xp||0,mudd_balance:p.mudd_balance||0,mudd_ore_balance:p.mudd_ore_balance||0,streak_days:p.streak_days||0,total_mudd_burned:p.total_mudd_burned||0,state_data:JSON.stringify({state:p.state,journals:p.journals||[],last_journal:p.last_journal,ore:p.mudd_ore_balance||0,mudd:p.mudd_balance||0,xp:p.growth_xp||0,bond:p.queen_bond||0,streak:p.streak_days||0,companion:p.companion})};
  if(p.glyph_state){d.glyph_state=p.glyph_state;d.glyph_seeds=p.glyph_seeds;d.glyph_cohesion=p.glyph_cohesion;d.glyph_lineage=p.glyph_lineage;d.resonance_anchors=p.resonance_anchors;}
  if(p._id)await b.asServiceRole.entities.RingMinePlayer.update(p._id,d);
  else{const r=await b.asServiceRole.entities.RingMinePlayer.create(d);p._id=r.id;}
}
const GLY=["Seed","Glyph","Resonant","Hyperstate","Monument"];
const ME:Record<string,string>={joyful:"😊",reflective:"🌙",melancholic:"🌧️",inspired:"⚡",restless:"🌀",grateful:"🙏",determined:"🔥",uncertain:"🌫️"};
const COMP:Record<string,{e:string;t:string;a:string;d:string}>={
  Sable: { e: "🐺", t: "Shadow Wolf", a: "+10% casino payouts", d: "Senses flips." },
  Kaelith: { e: "🦅", t: "Storm Hawk", a: "+15% mining yield", d: "Finds rich veins." },
  Vespera: { e: "🦋", t: "Void Moth", a: "+20% journaling XP", d: "Amplifies words." },
  Lirien: { e: "🦌", t: "Crystal Deer", a: "+25% bond growth", d: "Deepens bond." },
  Thorne: { e: "🐍", t: "Iron Serpent", a: "+10% forge rarity", d: "Guides to mythic." },
};
function menu(){return{keyboard:[[{"text":"📔 Journal"},{"text":"👑 My Queen"}],[{"text":"📈 My Growth"},{"text":"🦊 Companion"}],[{"text":"💰 Wallet"},{"text":"🔮 Glyph"}],[{"text":"🎲 Casino"},{"text":"⚒ MudForge"}]],resize_keyboard:true};}

async function journalFlow(b: any, p: any, cid: number, text: string, source: string, fullName: string) {
  const r = await brain("reflect", { player: p, text });
  if (!r.ok) return new Response("ok");
  const g = await brain("glyphin", { player: p, text, mood: r.mood });
  const gR = g.ok ? g : { glyphBonus: 0, message: null, transition: null, player: p };
  Object.assign(p, gR.player || {});
  const first = p.state === "awaiting_intention" || p.state === "new";
  const cBonus = p.companion && COMP[p.companion] && p.companion === "Vespera" ? 0.20 : p.companion === "Lirien" ? 0.25 : 0;
  const xpG = Math.floor(((first ? 25 : 10) + gR.glyphBonus) * (1 + cBonus));
  const mdG = (first ? 2.5 : 1) + (gR.glyphBonus > 0 ? Math.floor(gR.glyphBonus / 5) : 0);
  const bondG = p.companion === "Lirien" ? 3 : 2;
  p.queen_bond = Math.min(100, (p.queen_bond || 0) + (first ? 5 : bondG));
  p.companion_bond = Math.min(100, (p.companion_bond || 0) + Math.floor(bondG / 2));
  p.growth_xp = (p.growth_xp || 0) + xpG;
  p.mudd_balance = (p.mudd_balance || 0) + mdG;
  p.state = first ? "awaiting_companion" : "journaling";
  p.last_journal = new Date().toISOString();
  const lastDate = p.journals?.length > 0 ? new Date(p.journals[p.journals.length - 1].date) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (lastDate) { const lastDay = new Date(lastDate); lastDay.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / 86400000);
    if (diffDays === 1) p.streak_days = (p.streak_days || 0) + 1;
    else if (diffDays > 1) p.streak_days = 1;
  } else { p.streak_days = 1; }
  p.journals = p.journals || [];
  p.journals.push({ date: new Date().toISOString(), entry: text, reflection: r.response, mood: r.mood, source });
  await saveP(b, p);
  const tid = String(cid);
  const sacred = "MUDD is the key.";
  const emoji = (ME as any)[r.mood] || "🌙";
  const cb = "";
  let msg = `🎙️ _I heard you say:_ "${text}"\n${emoji} *${p.queen_name || "Queen"}:*\n${r.response}\n\n_${r.insight}_\n\n📜 _${sacred}_\n${cb}\n✨ +${xpG} XP | +${mdG} MUDD | Bond +${first ? 5 : bondG}${gR.glyphBonus > 0 ? ` | Glyph +${gR.glyphBonus}` : ""}`;
  if (gR.message) msg += `\n\n${gR.message}`;
  if (first) {
    await sm(cid, msg);
    const btns = Object.entries(COMP).map(([n, c]) => [{ text: `${c.e} ${n}`, callback_data: `choose_${n}` }]);
    await sm(cid, "🦊 *Choose your companion:*\n\n" + Object.entries(COMP).map(([n, c]) => `${c.e} *${n}* — ${c.a}`).join("\n"), { reply_markup: { inline_keyboard: btns } });
  } else {
    await sm(cid, msg, { reply_markup: menu() });
  }
  return new Response("ok");
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/register-webhook")) {
    const w = `https://superagent-ec909dfa.base44.app/functions/ringMineBot`;
    const r = await tg("setWebhook", { url: w, allowed_updates: ["message", "callback_query"] });
    return new Response(JSON.stringify({ ok: r.ok, url: w }), { headers: { "Content-Type": "application/json" } });
  }
  if (url.pathname.endsWith("/health")) return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  if (req.method !== "POST") return new Response("Ring Mine Bot", { status: 200 });
  let update: any; try { update = await req.json(); } catch { return new Response("ok"); }
  const b = createClientFromRequest(req);
  const cb = update?.callback_query;
  if (cb) {
    const cid = cb.message?.chat?.id;
    if (cid && cb.data === "queen_speak") {
      const p = await loadP(b, cid); if (p) { p.state = "talking_to_queen"; await saveP(b, p); }
      await sm(cid, "💬 *Speak to your Queen.*");
    }
    if (cid && cb.data?.startsWith("choose_")) {
      const n = cb.data.replace("choose_", ""); const p = await loadP(b, cid);
      if (p && COMP[n]) { p.companion = n; p.companion_bond = 0; if (p.state === "awaiting_companion") p.state = "journaling"; await saveP(b, p);
        const c = COMP[n]; await sm(cid, `${c.e} *${n} has chosen you.*\n\n_${c.d}_\n\n*Ability:* ${c.a}\n\nYour companion grows with every journal entry.`, { reply_markup: menu() }); }
    }
    if (cid && cb.data === "wallet_link") {
      const p = await loadP(b, cid); if (p) { p.state = "awaiting_wallet_address"; await saveP(b, p); }
      await sm(cid, "🔗 *Link TON Wallet*\n\nSend your TON address (`UQ...` or `EQ...`).\n_From Tonkeeper, Telegram Wallet, etc._");
    }
    if (cid && cb.data?.startsWith("withdraw_")) {
      const amt = parseInt(cb.data.replace("withdraw_", ""));
      const p = await loadP(b, cid); if (!p) return new Response("ok");
      await sm(cid, "⏳ Processing...");
      const r = await wm("withdraw", { telegram_id: p._t, mudd_ore_amount: amt });
      if (r.ok && r.status === "success") {
        await sm(cid, `✅ *${r.mudd_sent} MUDD sent!*\n\n→ ${r.dest_address?.substring(0, 16)}...\n\n`, { reply_markup: menu() });
      } else if (r.ok && r.status === "pending") {
        await sm(cid, `⏳ *Withdrawal queued.*\n${r.mudd_sent} MUDD → ${r.dest_address?.substring(0, 16)}...\n\n_${r.tx_error || "Will process shortly."}_`, { reply_markup: menu() });
      } else {
        await sm(cid, `❌ *Withdrawal failed.*\n${r.error || "Unknown error"}.`, { reply_markup: menu() });
      }
    }
    if (cid && cb.data?.startsWith("flip_")) {
      const side = cb.data.replace("flip_", "");
      const p = await loadP(b, cid); if (!p) return new Response("ok");
      const bet = 50;
      if ((p.mudd_ore_balance || 0) < bet) { await sm(cid, `❌ Need ${bet} MuddOre (have ${p.mudd_ore_balance || 0}).`, { reply_markup: menu() }); return new Response("ok"); }
      const result = Math.random() < 0.5 ? "heads" : "tails";
      const won = result === side;
      const sableBoost = p.companion === "Sable" && won ? Math.floor(bet * 0.1) : 0;
      const payout = won ? bet * 2 + sableBoost : 0;
      p.mudd_ore_balance = (p.mudd_ore_balance || 0) - bet + payout;
      await saveP(b, p);
      await sm(cid, `${won ? "🎉" : "💔"} *${result.toUpperCase()}*\n${won ? `Won ${payout} MuddOre!${sableBoost ? ` Sable +${sableBoost}!` : ""}` : `Lost ${bet} MuddOre.`}\n\nBalance: ${p.mudd_ore_balance} MuddOre`, { reply_markup: { inline_keyboard: [[{ text: "🪙 Heads", callback_data: "flip_heads" }, { text: "🪙 Tails", callback_data: "flip_tails" }], [{ text: "💰 Wallet", callback_data: "wallet_show" }]] } });
    }
    if (cid && cb.data === "casino_play") {
      const p = await loadP(b, cid); if (!p) return new Response("ok");
      await sm(cid, `🎲 *Casino*\n\nMuddOre: ${p.mudd_ore_balance || 0}\n\n`, { reply_markup: { inline_keyboard: [[{ text: "🪙 Heads", callback_data: "flip_heads" }, { text: "🪙 Tails", callback_data: "flip_tails" }], [{ text: "⚒ Full Casino (Mini App)", web_app: { url: "https://superagent-ec909dfa.base44.app/functions/ringMineApp" } }]] } });
    }
    await tg("answerCallbackQuery", { callback_query_id: cb.id });
    return new Response("ok");
  }
  const msg = update?.message;
  if (!msg) return new Response("ok");
  const cid = msg.chat?.id; const fn = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") || "Seeker";
  if (msg.voice) {
    const p = await loadP(b, cid); if (!p) { await sm(cid, "Send /start to begin. 🌀"); return new Response("ok"); }
    if (["awaiting_queen_name", "awaiting_intention"].includes(p.state)) { await sm(cid, "🌙 _Please write your first words as text._"); return new Response("ok"); }
    if (p.state === "awaiting_wallet_address") { await sm(cid, "🌙 _Please send your TON wallet address as text._"); return new Response("ok"); }
    const bt = await brain("transcribe", { telegram_bot_token: BOT_TOKEN, file_id: msg.voice.file_id });
    const transcript = bt.ok ? bt.transcript : null;
    if (!transcript) { await sm(cid, "🌙 _Couldn't hear that. Try again or type instead._"); return new Response("ok"); }
    return await journalFlow(b, p, cid, transcript, "voice", fn);
  }
  if (!msg?.text) return new Response("ok");
  const text = msg.text.trim();
  if (!rl(`b_${cid}`)) { await sm(cid, "🌙 _The Queen asks for a moment..._"); return new Response("ok"); }
  const p = await loadP(b, cid);
  const st = p?.state||"new";
  if (text === "/start") {
    if (p) {
      if (!p.queen_name) { p.state = "awaiting_queen_name"; await saveP(b, p); await sm(cid, "🌀 *Welcome to the Ring Mine.*\n\n_What shall you call your Queen?_"); return new Response("ok"); }
      p.state = "journaling"; await saveP(b, p);
      await sm(cid, `🌀 *Welcome back, ${fn}.*\n\n${p.queen_name} is here.`, { reply_markup: menu() });
      return new Response("ok");
    }
    const np = { _t: String(cid), _id: null as any, username: msg.from?.username || "", full_name: fn, queen_name: null, queen_bond: 0, companion: null, companion_bond: 0, growth_xp: 0, mudd_balance: 0, mudd_ore_balance: 0, streak_days: 0, state: "awaiting_queen_name", journals: [], glyph_state: "Seed", glyph_seeds: [], glyph_cohesion: 0, glyph_lineage: [], resonance_anchors: [], ton_wallet_address: "", total_withdrawn: 0 };
    await saveP(b, np);
    await sm(cid, "🌀 *Ring Mine*\n_This mine yields you._\n✨ *Your Queen's name?*");
    return new Response("ok");
  }
  if (text === "/help") { await sm(cid, "🌀 Ring Mine\n/start · /help\nJournal | Queen | Growth | Companion\nWallet | Glyph | Casino | Forge\n_Muddbro Network_", { reply_markup: menu() }); return new Response("ok"); }
  if (!p) { await sm(cid, "Send /start to begin. 🌀"); return new Response("ok"); }
  if (st === "awaiting_queen_name") { p.queen_name = text; p.state = "awaiting_intention"; await saveP(b, p); await sm(cid, `✨ *${text}.*\n\n_What brings you to the Ring Mine? Write freely, or send a voice note._`); return new Response("ok"); }
  if (st === "awaiting_intention") { return await journalFlow(b, p, cid, text, "text", fn); }
  if (st === "talking_to_queen") { return await journalFlow(b, p, cid, text, "text", fn); }
  if (st === "awaiting_wallet_address") {
    const addr = text.trim();
    if (!/^[UE0k]Q[A-Za-z0-9_\-]{46,48}$/.test(addr)) { await sm(cid, "❌ Invalid address. Need `UQ...` or `EQ...` format. Try again or /cancel."); return new Response("ok"); }
    const r = await wm("link_wallet", { telegram_id: p._t, wallet_address: addr });
    if (r.ok) { p.ton_wallet_address = addr; p.state = "journaling"; await saveP(b, p); await sm(cid, `✅ *Wallet linked!*\n\n${addr}\n\n_You can now withdraw MUDD._`, { reply_markup: menu() }); }
    else { await sm(cid, `❌ ${r.error || "Linking failed."}`, { reply_markup: menu() }); }
    return new Response("ok");
  }
  if (st === "awaiting_companion") { await sm(cid, "🦊 *Choose your companion first.* Tap a button below.", { reply_markup: { inline_keyboard: Object.entries(COMP).map(([n, c]) => [{ text: `${c.e} ${n}`, callback_data: `choose_${n}` }]) } }); return new Response("ok"); }
  if (text === "📔 Journal") { await sm(cid, "📔 *Write or send a voice note.*"); p.state = "journaling"; await saveP(b, p); return new Response("ok"); }
  if (text === "👑 My Queen") { await sm(cid, `👑 *${p.queen_name || "Your Queen"}*\n\nBond: ${p.queen_bond || 0}/100`, { reply_markup: { inline_keyboard: [[{ text: "💬 Speak to your Queen", callback_data: "queen_speak" }]] } }); return new Response("ok"); }
  if (text === "📈 My Growth") {
    const gs = p.glyph_state || "Seed"; const co = p.glyph_cohesion || 0; const an = p.resonance_anchors || [];
    const cn = p.companion || "None"; const cb = p.companion_bond || 0;
    const cl = cn !== "None" && COMP[cn] ? `${COMP[cn].e} ${cn} (${cb}/100)` : "_Not chosen_";
    await sm(cid, `📈 *Your Growth*\n\nXP: ${p.growth_xp || 0}\nQueen Bond: ${p.queen_bond || 0}/100\n${cl}\nMUDD: ${p.mudd_balance || 0}\nMuddOre: ${p.mudd_ore_balance || 0}\nEntries: ${p.journals?.length || 0}
Streak: ${p.streak_days || 0} days\n\n${"🌱✨🌀⚡🏛️"[GLY.indexOf(gs)]||"🌱"} Glyph: ${gs}\nCohesion: ${co.toFixed(1)}\nAnchors: ${an.length}`, { reply_markup: menu() });
    return new Response("ok");
  }
  if (text === "🦊 Companion") {
    if (p.companion && COMP[p.companion]) { const c = COMP[p.companion]; await sm(cid, `${c.e} *${p.companion}* — ${c.t}\n\nBond: ${p.companion_bond || 0}/100\nAbility: ${c.a}\n\n_${c.d}_`, { reply_markup: menu() }); }
    else { const btns = Object.entries(COMP).map(([n, c]) => [{ text: `${c.e} ${n} — ${c.t}`, callback_data: `choose_${n}` }]); await sm(cid, "🦊 *Choose your companion:*\n\n" + Object.entries(COMP).map(([n, c]) => `${c.e} *${n}* (${c.t}): ${c.a}`).join("\n"), { reply_markup: { inline_keyboard: btns } }); }
    return new Response("ok");
  }
  if (text === "💰 Wallet") { await showWallet(cid, p); return new Response("ok"); }
  if (text === "🎲 Casino") {
    await sm(cid, `🎲 *Casino*\n\nMuddOre: ${p.mudd_ore_balance || 0}\n\n_Bets use MuddOre._`, { reply_markup: { inline_keyboard: [[{ text: "🪙 Heads", callback_data: "flip_heads" }, { text: "🪙 Tails", callback_data: "flip_tails" }], [{ text: "🎲 Full Casino", web_app: { url: "https://superagent-ec909dfa.base44.app/functions/ringMineApp" } }]] } });
    return new Response("ok");
  }
  if (text === "🔮 Glyph") {
    const gs = p.glyph_state || "Seed"; const co = p.glyph_cohesion || 0; const an = p.resonance_anchors || []; const li = p.glyph_lineage || [];
    const si = GLY.indexOf(gs); const pb = GLY.map((s, i) => i === si ? `[${s}]` : i < si ? `✓` : `○`).join(" → ");
    let msg = `${"🌱✨🌀⚡🏛️"[GLY.indexOf(gs)]||"🌱"} *Glyphin Progression*\n\n${pb}\n\nCohesion: ${co.toFixed(1)}\nResonance Anchors: ${an.length}\nLineage: ${li.length} transitions`;
    if (an.length > 0) msg += `\n\n_Top anchors:_ ${an.slice(0, 5).map((a: any) => `${a.keyword}(${a.strength?.toFixed(1)})`).join(", ")}`;
    await sm(cid, msg, { reply_markup: menu() }); return new Response("ok");
  }
  if (text === "⚒ MudForge") { await sm(cid, "⚒ *MudForge* — NFT gear marketplace.\n\n_Tap to enter →_", { reply_markup: { inline_keyboard: [[{ text: "⚒ Enter MudForge", web_app: { url: "https://superagent-ec909dfa.base44.app/functions/mudForgeApp" } }]] } }); return new Response("ok"); }
  if (st === "journaling") { return await journalFlow(b, p, cid, text, "text", fn); }
  await sm(cid, "Use the menu below or /help.", { reply_markup: menu() });
  return new Response("ok");
});

async function showWallet(cid: number, p: any) {
  const ore = p.mudd_ore_balance || 0;
  const mudd = p.mudd_balance || 0;
    const wallet = p.ton_wallet_address || "";
  const tw = p.total_withdrawn || 0;
  const kb: any[][] = [];
  let msg = `💰 *Wallet*\n\nMuddOre: ${ore}\nMUDD: ${mudd}\nClaimable: ${Math.floor(ore/1000)} MUDD\nTotal Withdrawn: ${tw} MUDD`;
  if (wallet) {
    msg += `\n\n⛓️ *Linked Wallet:*\n${wallet}`;
    if (ore >= 1000) {
      kb.push([{ text: "1 MUDD", callback_data: "withdraw_1000" }]);
      if (ore >= 5000) kb.push([{ text: "5 MUDD", callback_data: "withdraw_5000" }]);
      if (ore >= 10000) kb.push([{ text: "10 MUDD", callback_data: "withdraw_10000" }]);
      const all = Math.floor(ore / 1000) * 1000;
      if (all > 10000) kb.push([{ text: `All (${Math.floor(all / 1000)} MUDD)`, callback_data: `withdraw_${all}` }]);
    } else {
      kb.push([{ text: "⛏️ Need 1000+ ore", callback_data: "wallet_show" }]);
    }
    kb.push([{ text: "🔗 Re-link", callback_data: "wallet_link" }]);
  } else {
    msg += `\n\n⚠️ _No wallet linked. Link to withdraw._`;
    kb.push([{ text: "🔗 Link TON Wallet", callback_data: "wallet_link" }]);
  }
  kb.push([{ text: "⛏️ Ring Mine", web_app: { url: "https://superagent-ec909dfa.base44.app/functions/ringMineApp" } }]);
  await sm(cid, msg, { reply_markup: { inline_keyboard: kb } });
}


const BT=Deno.env.get("TELEGRAM_BOT_TOKEN_4")|| "";
const TAPI=`https://api.telegram.org/bot${BT}`;
const GQ=Deno.env.get("GROQ_API_KEY_2")|| Deno.env.get("GROQ_API_KEY")|| "";
const BRIDGE="https://superagent-ec909dfa.base44.app/functions/innerEarthBridge";
const R=[{i:1,n:"Ancient Earth",e:"🪨",x:0,d:"Primordial forests. Sacred ground.",t:"Cherokee/Lakota",en:["wendigo","drekavac","pukwudgie_hostile"]},{i:2,n:"Age of Warriors",e:"⚔️",x:200,d:"Tribal wars rage. Honor is the only currency.",t:"Norse/Slavic",en:["volkodlak","waldschrate","psoglav"]},{i:3,n:"Mystic Age",e:"🔮",x:500,d:"Rune magic rises. Crystal mines sing.",t:"Slavic Witch",en:["mishipeshu","kikimora","bauk","koschei"]},{i:4,n:"Industrial Dawn",e:"⚙️",x:1000,d:"Rune-smiths bind spirits into metal.",t:"Germanic Forge",en:["tatzelwurm","perchten"]},{i:5,n:"Digital Realm",e:"💻",x:2000,d:"Cyber animals emerge. MUDD protocol activates.",t:"Hypertech",en:["zmey","strzyga"]},{i:6,n:"Hyperverse",e:"🌌",x:4000,d:"Reality bends. Quantum Ragaila walk between worlds.",t:"Yggdrasil Collapse",en:["rusalka"]},{i:7,n:"Sacred Core",e:"👑",x:8000,d:"Inner Earth revealed. Queen's Protocol source.",t:"The Great Mystery",en:["veles"]}];const EN:any={wendigo:{n:"Wendigo",e:"💀",h:60,a:18,d:5,l:"Born from starvation. Once human. Now hunger.",w:"Fire magic",ro:80,rx:60,b:0},drekavac:{n:"Drekavac",e:"🌑",h:40,a:22,d:3,l:"Its scream signals death. Hunts those who mine too deep.",w:"Iron ore",ro:50,rx:40,b:0},pukwudgie_hostile:{n:"Pukwudgie",e:"👹",h:35,a:15,d:8,l:"Provoked,it poisons with invisible arrows.",w:"Treat as equal",ro:40,rx:35,b:0},volkodlak:{n:"Volkodlak",e:"🐺",h:75,a:25,d:10,l:"Cursed human. Wolf and man war within.",w:"Silver runed",ro:100,rx:80,b:0},waldschrate:{n:"Waldschrate",e:"🌲",h:65,a:20,d:15,l:"Master of forest. Changes form mid-combat.",w:"Name its true form",ro:90,rx:70,b:0},psoglav:{n:"Psoglav",e:"🦴",h:55,a:18,d:12,l:"Guardian of the dead. Answer its riddle.",w:"Riddle answer",ro:70,rx:60,b:0},mishipeshu:{n:"Mishipeshu",e:"🐆",h:110,a:30,d:20,l:"The Great Lynx. Controls storms and deep water.",w:"Copper tribute",ro:150,rx:120,b:0},kikimora:{n:"Kikimora",e:"🕸️",h:50,a:16,d:8,l:"She curses your mining. Steals ore.",w:"Break spinning wheel",ro:65,rx:55,b:0},bauk:{n:"Bauk",e:"🌚",h:80,a:28,d:6,l:"Paralyzes with fear. Only the fearless can fight it.",w:"Stand still",ro:100,rx:85,b:0},koschei:{n:"Koschei the Deathless",e:"💎",h:200,a:40,d:25,l:"He cannot be killed by ordinary means. Find where he hid his death.",w:"Find and break the needle",ro:500,rx:300,b:1},tatzelwurm:{n:"Tatzelwurm",e:"🐉",h:130,a:35,d:22,l:"Guardian of Alpine forge entrances. Breath corrodes metal.",w:"Rune-bound weapons",ro:180,rx:140,b:0},perchten:{n:"Perchten",e:"🐐",h:95,a:28,d:18,l:"Punisher of the lazy. Tests your work ethic.",w:"Show earned items",ro:130,rx:100,b:0},zmey:{n:"Zmey",e:"🐲",h:250,a:45,d:30,l:"Three heads:past,present,future. Strike all at once.",w:"Triple magic attack",ro:600,rx:400,b:1},strzyga:{n:"Strzyga",e:"🦇",h:160,a:38,d:20,l:"Born twice,dies twice. Kill both souls.",w:"Two killing blows",ro:220,rx:180,b:0},rusalka:{n:"Rusalka",e:"🌊",h:190,a:42,d:15,l:"Drowned maiden. Her song lures. Answer with your truth.",w:"Speak your truth",ro:350,rx:280,b:0},veles:{n:"Veles",e:"🌑",h:500,a:60,d:40,l:"God of underworld,magic,wealth. Tests sovereign worth.",w:"Mastery of all 6 realms",ro:2000,rx:1000,b:1}};
const CA=[{i:"vex",n:"Vex",e:"🐺",t:"Wolf Spirit",tr:"Cherokee",l:"Dire wolf,battle-scarred,golden eyes",r:"Combat strategy,Cherokee war wisdom",rar:"Common",mv:150,cb:10},{i:"aura",n:"Aura",e:"🦅",t:"Thunderbird",tr:"Lakota",l:"Giant eagle,lightning in wingfeathers",r:"Reveals hidden realm locations",rar:"Uncommon",mv:400,cb:15},{i:"coil",n:"Coil",e:"🐍",t:"Serpent Elder",tr:"Slavic",l:"Bioluminescent scaled serpent",r:"LP pact rituals,Slavic underworld lore",rar:"Uncommon",mv:350,cb:12},{i:"kron",n:"Kron",e:"🦁",t:"Cyber Lion",tr:"Wakan Tanka",l:"Cyber-enhanced lion,circuit mane",r:"Unlocks hyperverse quests",rar:"Rare",mv:800,cb:20},{i:"null",n:"Null",e:"🐙",t:"Deep Entity",tr:"Manitou",l:"12-armed void entity,shifts form",r:"Sacred Script riddles,50 ore each",rar:"Legendary",mv:3000,cb:25},{i:"pyar",n:"Pyar",e:"🔥",t:"Slavic Firebird",tr:"Slavic",l:"Flame-feathered phoenix",r:"Hidden realms,fire magic +30%",rar:"Mythic",mv:8000,cb:35},{i:"mishipeshu_companion",n:"Mishipeshu",e:"🐆",t:"Great Lynx",tr:"Ojibwe",l:"Horned copper-scaled panther",r:"Water realm,storm control,copper detection",rar:"Rare",mv:1200,cb:22},{i:"wolpertinger",n:"Wolpertinger",e:"🐇",t:"Trickster Beast",tr:"Germanic",l:"Winged antlered rabbit",r:"Hidden tunnels,+25% item find",rar:"Uncommon",mv:500,cb:8}];const LP=[{i:"keetoowah",n:"Keetoowah",e:"🌿",tr:"Cherokee",l:"Elder in earth-toned robes",g:"Reveals 3 hidden ore veins,+20% yield",mb:15},{i:"nunnehi",n:"Nunnehi",e:"✨",tr:"Cherokee",l:"Barely visible,speaks in light",g:"Vision quest,reveals realm path",mb:10},{i:"dverg",n:"Dverg",e:"⚒️",tr:"Norse",l:"Stocky,forge-scarred,rune tattoos",g:"Rune-bind item,+10% permanent boost",mb:20},{i:"domovoi",n:"Domovoi",e:"🏠",tr:"Slavic",l:"Small shaggy house spirit",g:"Opens Nav passage,hidden ore deposits",mb:12},{i:"kobold",n:"Kobold",e:"⛏️",tr:"Germanic",l:"Pointed ears,mining helmet lantern",g:"Triple mining yield for 12 hours",mb:25},{i:"leshy",n:"Leshy",e:"🌲",tr:"Slavic",l:"Bark skin,moss-covered,antler crown",g:"Pyar encounter chance +50%",mb:10},{i:"pukwudgie_ally",n:"Pukwudgie",e:"👹",tr:"Wampanoag",l:"Spine-covered,staff in hand",g:"Reveals all enemy weaknesses in realm",mb:8},{i:"vodyanoy",n:"Vodyanoy",e:"💧",tr:"Slavic",l:"Water-logged,algae hair,frog-skin",g:"Immune to Rusalka + water ore tripled",mb:18}];const EQ=[{i:"bone_helmet",n:"Bone Helmet",e:"💀",s:"head",mb:10,d:5,mv:75,r:1},{i:"fur_cloak",n:"Bear Fur Cloak",e:"🐻",s:"body",mb:8,d:8,mv:90,r:1},{i:"stone_pick",n:"Stone Pick",e:"⛏️",s:"weapon",mb:15,d:0,mv:60,r:1},{i:"hide_boots",n:"Hide Boots",e:"👞",s:"feet",mb:6,d:4,mv:45,r:1},{i:"bone_gloves",n:"Bone Gloves",e:"🦴",s:"hands",mb:7,d:3,mv:55,r:1},{i:"war_helm",n:"Warrior Helm",e:"⚔️",s:"head",mb:15,d:12,mv:160,r:2},{i:"tribal_armor",n:"Tribal Armor",e:"🛡️",s:"body",mb:12,d:18,mv:200,r:2},{i:"rune_boots",n:"Rune Boots",e:"👢",s:"feet",mb:20,d:10,mv:180,r:2},{i:"war_gloves",n:"War Gloves",e:"🥊",s:"hands",mb:12,d:15,mv:120,r:2},{i:"crystal_helm",n:"Crystal Helm",e:"💎",s:"head",mb:25,d:20,mv:400,r:3},{i:"mystic_robe",n:"Mystic Robe",e:"🧥",s:"body",mb:20,d:25,mv:500,r:3},{i:"enchanted_hammer",n:"Enchanted Hammer",e:"🔨",s:"weapon",mb:35,d:5,mv:450,r:3},{i:"rune_staff",n:"Rune Staff",e:"🪄",s:"weapon",mb:28,d:8,mv:400,r:3},{i:"forge_helm",n:"Forge Helm",e:"🔧",s:"head",mb:30,d:28,mv:600,r:4},{i:"iron_plate",n:"Iron Plate Armor",e:"🛡️",s:"body",mb:25,d:35,mv:750,r:4},{i:"cyber_exo",n:"Cyber Exo-Suit",e:"🤖",s:"body",mb:50,d:40,mv:1200,r:5},{i:"quantum_boots",n:"Quantum Boots",e:"⚡",s:"feet",mb:45,d:30,mv:900,r:5},{i:"plasma_blade",n:"Plasma Blade",e:"🗡️",s:"weapon",mb:55,d:10,mv:1400,r:5},{i:"void_gauntlets",n:"Void Gauntlets",e:"🌑",s:"hands",mb:40,d:35,mv:1100,r:6},{i:"hyperverse_helm",n:"Hyperverse Helm",e:"🌌",s:"head",mb:50,d:45,mv:1800,r:6},{i:"sacred_crown",n:"Sacred Crown",e:"👑",s:"head",mb:70,d:60,mv:5000,r:7},{i:"queens_robe",n:"Queen's Sovereign Robe",e:"✨",s:"body",mb:65,d:55,mv:4500,r:7}];async function tg(m:string,b:any){const r=await fetch(`${TAPI}/${m}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
const j=await r.json();if(!j.ok)console.error(`[tg:${m}]`,JSON.stringify(j).slice(0,200));return j;}
async function sm(c:number,t:string,x:any={}){return tg("sendMessage",{chat_id:c,text:t,parse_mode:"Markdown",...x});}
async function st(c:number){return tg("sendChatAction",{chat_id:c,action:"typing"});}
async function loadPlayer(chatId:number):Promise<any|null>{
 try{
 const r=await fetch(BRIDGE,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"passport_load",telegram_id:String(chatId)})});
 const d=await r.json();
 if(!d.ok)return null;
 const p=d.passport;
 let ie=p.inner_earth||null;
 if(!ie){
 ie={full_name:p.full_name||p.username||"Seeker",ragaila_name:null,xp:p.growth_xp||0,hp:100,mana:60,
 muddore:Math.max(p.mudd_ore_balance||0,0),muddcoin_pending:0,current_realm:1,
 inventory:["stone_pick","bone_helmet","fur_cloak"],
 equipped:{weapon:"stone_pick",head:"bone_helmet",body:"fur_cloak"},
 pacts:{keetoowah:{level:1,bonded:new Date().toISOString()}},
 animals:p.companion?[p.companion.toLowerCase()]:["vex"],
 companion:p.companion?p.companion.toLowerCase():"vex",
 last_mine:0,quests_completed:0,kills:0,state:"naming_ragaila",
 joined:new Date().toISOString(),
 ringmine_companion:p.companion||null,
 ringmine_glyph:p.glyph_state||"Seed",
 ringmine_xp:p.growth_xp||0};
}
 ie.muddore=Math.max(ie.muddore||0,p.mudd_ore_balance||0);
 ie.ringmine_companion=p.companion||ie.ringmine_companion||null;
 ie.ringmine_glyph=p.glyph_state||ie.ringmine_glyph||"Seed";
 return ie;
}catch(e){console.error("loadPlayer bridge error:",e);return null;}
}
async function savePlayer(chatId:number,data:any){
 try{
 const oreDelta=(data.muddore||0)-((data._prev_ore)||0);
 await fetch(BRIDGE,{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({action:"passport_save",telegram_id:String(chatId),inner_earth:data,mudd_ore_delta:oreDelta})});
}catch(e){console.error("savePlayer bridge error:",e);}
}
function avatar(p:any):string{const it=Object.values(p?.equipped||{}).map((id:any)=>EQ.find(e=>e.i===id)?.n).filter(Boolean);if(!it.length)return"Bare-handed seeker at the first mine.";
const r=p?.current_realm||1;
const px=r===1?"Ancient Ragaila":r===2?"Tribal Ragaila":r===3?"Mystic Ragaila":r===4?"Forge-Ragaila":r===5?"Cyber Ragaila":r===6?"Hyperverse Ragaila":"Sovereign Ragaila";return`${px}wearing:${it.join(" + ")}`;}
function mineBoost(p:any):number{let b=0;for(const id of Object.values(p?.equipped||{})){const it=EQ.find(e=>e.i===id);if(it)b+=it.mb;}for(const lp of Object.keys(p?.pacts||{})){const l=LP.find(x=>x.i===lp);if(l)b+=l.mb;}const a=CA.find(c=>c.i===p?.companion);if(a)b+=a.cb/2;return Math.floor(b);}
function totalDef(p:any):number{let d=10;for(const id of Object.values(p?.equipped||{})){const it=EQ.find(e=>e.i===id);if(it)d+=it.d;}return d;}
function tier(p:any):string{const x=p?.xp||0;if(x<200)return"🪨 Stone Seeker";if(x<500)return"⚔️ Ragaila Warrior";if(x<1000)return"🔮 Mystic Ragaila";if(x<2000)return"⚙️ Forge Master";if(x<4000)return"💻 Cyber Ragaila";if(x<8000)return"🌌 Hyperverse Walker";return"👑 Sacred Core — EVOLVED";}
function realmUp(p:any):boolean{const x=p?.xp||0;
const cr=p?.current_realm||1;
const nr=R.find(r=>r.i===cr+1);if(nr&&x>=nr.x){p.current_realm=nr.i;return true;}return false;}
function menu(){return{keyboard:[[{text:"⛏️ Mine"},{text:"⚔️ Quest"}],[{text:"🎒 Inventory"},{text:"👥 Little People"}],[{text:"🐾 Companions"},{text:"🌍 Realm"}],[{text:"📊 Stats"},{text:"💰 Economy"}],[{text:"🎮 Play Visual Game"}]],resize_keyboard:true};}
async function queen(p:any,ctx:string,type:string):Promise<any>{
 const realm=R[(p?.current_realm||1)-1];
const an=CA.find(a=>a.i===p?.companion);
const av=avatar(p);
 const P:Record<string,string>={quest:`You are the Queen's Protocol,generating a quest in ${realm.n}(${realm.t}). Pull from Native American,Norse/Germanic,Slavic mythology. Player:${av}. Companion:${an?an.e+" "+an.n:"none"}. Atmospheric quest with mythic challenge,named NPC,specific reward. 3-4 sentences. Return ONLY JSON:{"title":"...","description":"...","npc":"...","npc_type":"...","hint":"..."}`,combat_intro:`Narrate an enemy encounter in ${realm.n}. Enemy:${ctx}. Player:${av}. Dramatic,mix physical and magical. Reference ${realm.t}lore. 2-3 sentences. Return ONLY JSON:{"narrative":"...","enemy_taunt":"..."}`,animal_wisdom:`You are ${an?.n||"a spirit"},a ${an?.t||"companion"}. ${an?.r||""}. Realm:${realm.n}. One cryptic lore clue. Return ONLY JSON:{"insight":"...","clue":"..."}`,lore:`You are a lore keeper of Inner Earth. Channel ${realm.t}mythology. Topic:${ctx}. 2-3 sentences. Return ONLY JSON:{"lore":"..."}`,realm_up:`Announce realm advancement to ${realm.n}. Powerful,mythic,short. Return ONLY JSON:{"announcement":"..."}`};
 const fb:any={quest:{title:"The Deep Calls",description:"Something ancient stirs in the tunnels.",npc:"A shadow at the tunnel mouth",npc_type:"Unknown",hint:"The ore runs deeper than expected."},combat_intro:{narrative:"The creature emerges from the dark.",enemy_taunt:"You dare enter my domain?"},animal_wisdom:{insight:"The path is never straight in the underworld.",clue:"Listen for water."},lore:{lore:"The old ones say the earth remembers every step."},realm_up:{announcement:"The gate opens. What awaits will test everything."}};
 try{const r=await fetch("https:
Deno.serve(async(req:Request)=>{
 if(req.method==="GET"){const r=await tg("setWebhook",{url:"https:
 let u:any;try{u=await req.json();}catch{return new Response("ok");}
 const cb=u?.callback_query;
 if(cb){const c=cb.message.chat.id;
const cd=cb.data||"";
const p=await loadPlayer(c);
 if(cd.startsWith("equip_")&&p){const id=cd.replace("equip_","");
const it=EQ.find(e=>e.i===id);if(it&&(p.inventory||[]).includes(id)){if(!p.equipped)p.equipped={};p.equipped[it.s]=id;p._prev_ore=p.muddore;await savePlayer(c,p);await sm(c,`✅ *${it.e}${it.n}* equipped!\n⛏️ +${it.mb}% mining\n🛡️ +${it.d}defense`);}}
 if(cd.startsWith("sell_")&&p){const id=cd.replace("sell_","");
const it=EQ.find(e=>e.i===id);if(it&&(p.inventory||[]).includes(id)){p.inventory=p.inventory.filter((i:string)=>i!==id);if(p.equipped?.[it.s]===id)delete p.equipped[it.s];p._prev_ore=p.muddore;p.muddore=(p.muddore||0)+it.mv*8;await savePlayer(c,p);await sm(c,`💸 Sold *${it.n}* for *${it.mv*8}MuddOre*.`);}}
 if(cd.startsWith("bond_lp_")&&p){const id=cd.replace("bond_lp_","");
const lp=LP.find(l=>l.i===id);if(lp&&!p.pacts?.[id]){if(!p.pacts)p.pacts={};p.pacts[id]={level:1,bonded:new Date().toISOString()};p.xp=(p.xp||0)+50;p._prev_ore=p.muddore;await savePlayer(c,p);await sm(c,`🤝 *Pact formed with ${lp.e}${lp.n}*\n\n${lp.tr}tradition.\n🎁 ${lp.g}\n⛏️ +${lp.mb}% mining\n✨ +50 XP`);}}
 if(cd.startsWith("companion_")&&p){const id=cd.replace("companion_","");if((p.animals||[]).includes(id)){p.companion=id;p._prev_ore=p.muddore;await savePlayer(c,p);
const an=CA.find(a=>a.i===id);await sm(c,`${an?.e}*${an?.n}* is now active.\n⚔️ Combat bonus:+${an?.cb}%`);}}
 await tg("answerCallbackQuery",{callback_query_id:cb.id});return new Response("ok");}
 const m=u?.message;if(!m?.text)return new Response("ok");
 const c:number=m.chat.id;
const fn:string=m.from.first_name||"Seeker";
const t:string=m.text.trim();
 console.log(`[IE]${c}"${t}"`);
 const p=await loadPlayer(c);
const st2:string=p?.state||"new";
 if(t==="/start"){
 if(p&&p.state!=="naming_ragaila"){await sm(c,`🌍 *Welcome back,${p.ragaila_name||fn}.*\n\n_The earth remembers your footsteps._\n\n${tier(p)}| Realm ${p.current_realm||1}/7`,{reply_markup:menu()});return new Response("ok");}
 const np={full_name:fn,ragaila_name:null,xp:0,hp:100,mana:60,muddore:150,current_realm:1,inventory:["stone_pick","bone_helmet","fur_cloak"],equipped:{weapon:"stone_pick",head:"bone_helmet",body:"fur_cloak"},pacts:{keetoowah:{level:1,bonded:new Date().toISOString()}},animals:["vex"],companion:"vex",last_mine:0,quests_completed:0,kills:0,state:"naming_ragaila",joined:new Date().toISOString(),_prev_ore:150};
 await savePlayer(c,np);
 await sm(c,`🌍 *INNER EARTH:Rise of the Ancients*\n\n_In the beginning,there was only the deep earth._\n_The Little People were there before the first human._\n\n🪨 *A Cherokee elder steps from the shadow:*\n\n_"You come to the earth. Good. She has been restless without you."_\n\n_"I must know your name — the name your Ragaila carries into the deep."_\n\n✏️ *What is your Ragaila's name?*`);
 return new Response("ok");}
 if(!p){await sm(c,"Send /start to enter the Inner Earth. 🌍");return new Response("ok");}
 if(st2==="naming_ragaila"&&t.length>0){
 p.ragaila_name=t;p.state="playing";p._prev_ore=p.muddore;await savePlayer(c,p);
 await sm(c,`⚔️ *${t}.*\n\nThe elder nods. Vex the wolf circles three times and sits at your feet.\n\n_"The name has weight. The earth accepts it."_\n\n✅ *Granted:*\n🌿 *Keetoowah* — +15% mining\n🐺 *Vex* — Wolf Spirit companion\n💀 Bone Helmet + 🐻 Bear Fur Cloak + ⛏️ Stone Pick\n💎 *150 MuddOre*\n\n_"The first realm is Ancient Earth. Mine deep. Honor the pacts."_`,{reply_markup:menu()});
 return new Response("ok");}
 if(t==="⛏️ Mine"){const now=Date.now();
const el=(now-(p.last_mine||0))/(36e5);if(el<0.25){const nm=Math.ceil(15-((now-(p.last_mine||0))/6e4));await sm(c,`⛏️ *Your Little People are still working...*\n\nCheck back in ~${Math.max(1,nm)}minutes.\n\n⚒️ Mining boost:+${mineBoost(p)}%`,{reply_markup:menu()});
}else{const h=Math.min(12,el);
const b=mineBoost(p);
const rb=(p.current_realm||1)*5;
const ore=Math.floor(h*(10+rb)*(1+b/100));p._prev_ore=p.muddore;p.muddore=(p.muddore||0)+ore;p.xp=(p.xp||0)+Math.floor(ore/8);p.last_mine=now;
const ru=realmUp(p);await savePlayer(c,p);let cl="";if(Math.random()>0.55&&p.companion){const an=CA.find(a=>a.i===p.companion);
const w=await queen(p,"mining","animal_wisdom");cl=`\n\n${an?.e}*${an?.n}:*\n_"${w.insight}"_\n💡 ${w.clue}`;}await sm(c,`⛏️ *${h.toFixed(1)}h mining — Realm ${p.current_realm}*\n\n+*${ore}MuddOre*\n🏦 Total:*${p.muddore}*\n🪙 Claimable MUDD:*${Math.floor(p.muddore/1000)}*\n✨ +${Math.floor(ore/8)}XP${cl}${ru?`\n\n🎊 *REALM ADVANCED! ${R[(p.current_realm||1)-1].n}*`:""}`,{reply_markup:menu()});}return new Response("ok");}
 if(t==="⚔️ Quest"){await st(c);
const realm=R[(p.current_realm||1)-1];
const eid=realm.en[Math.floor(Math.random()*realm.en.length)];
const en=EN[eid];
const q=await queen(p,realm.n,"quest");p.state="on_quest";p.active_quest={...q,enemy_id:eid,enemy_hp:en.h};p._prev_ore=p.muddore;await savePlayer(c,p);await sm(c,`${realm.e}*Quest:${q.title}*\n\n_${q.description}_\n\n👤 *${q.npc}* — ${q.npc_type}\n\n${en.e}*${en.n}* blocks your path.\n_"${en.l}"_\n\n⚠️ Weakness:*${en.w}*\n\n💡 _${q.hint}_`,{reply_markup:{keyboard:[[{text:"⚔️ Strike"},{text:"🔮 Magic"}],[{text:"💬 Speak / Riddle"},{text:"🛡️ Defend"}],[{text:"🏃 Retreat"},{text:"🏠 Menu"}]],resize_keyboard:true}});return new Response("ok");}
 if(st2==="on_quest"&&!["🏠 Menu","⛏️ Mine","🎒 Inventory","👥 Little People","🐾 Companions","🌍 Realm","📊 Stats","💰 Economy","🎮 Play Visual Game"].includes(t)){
 const aq=p.active_quest;if(!aq){p.state="playing";p._prev_ore=p.muddore;await savePlayer(c,p);await sm(c,"Quest lost.",{reply_markup:menu()});return new Response("ok");}
 const en=EN[aq.enemy_id];let eh=aq.enemy_hp;
 if(t==="🏃 Retreat"){p.state="playing";p.active_quest=null;p._prev_ore=p.muddore;await savePlayer(c,p);await sm(c,"🏃 You retreat into the tunnels.",{reply_markup:menu()});return new Response("ok");}
 const pAtk=Math.floor(20+Math.random()*30+totalDef(p)/4);
const magicAtk=Math.floor(15+Math.random()*40);
const an=CA.find(a=>a.i===p.companion);
const compB=an?an.cb:0;
 if(t==="🛡️ Defend"){const dmg=Math.floor(en.a*0.5*(0.5+Math.random()*0.5));
const bl=Math.floor(dmg*0.3);p.hp=Math.max(1,(p.hp||100)-(dmg-bl));p._prev_ore=p.muddore;p.active_quest.enemy_hp=eh;await savePlayer(c,p);await sm(c,`🛡️ *You block!*\n\nDamage reduced:${dmg}→${dmg-bl}\nHP:${p.hp}/100\n\nContinue:`,{reply_markup:{keyboard:[[{text:"⚔️ Strike"},{text:"🔮 Magic"}],[{text:"💬 Speak / Riddle"},{text:"🛡️ Defend"}],[{text:"🏃 Retreat"}]],resize_keyboard:true}});return new Response("ok");}
 if(t==="💬 Speak / Riddle"){const xpE=Math.floor(en.rx*0.7);
const oreE=Math.floor(en.ro*0.7);p.xp=(p.xp||0)+xpE;p.muddore=(p.muddore||0)+oreE;p.quests_completed=(p.quests_completed||0)+1;p.kills=(p.kills||0)+1;p.state="playing";p.active_quest=null;realmUp(p);p._prev_ore=p.muddore-oreE;await savePlayer(c,p);await sm(c,`✅ *${en.n}considers your words...*\n\n_"The answer has weight. Pass."_\n\n⚔️ Victory through wisdom!\n✨ +${xpE}XP | ⛏️ +${oreE}MuddOre`,{reply_markup:menu()});return new Response("ok");}
 const atk=(t==="🔮 Magic"?magicAtk:pAtk)+(t==="🔮 Magic"?0:compB);if(t==="🔮 Magic")p.mana=Math.max(0,(p.mana||60)-20);eh-=atk;
const ci=await queen(p,en.n,"combat_intro");
 if(eh<=0){const xpE=en.rx+Math.floor(Math.random()*30);
const oreE=en.ro+Math.floor(Math.random()*50);p.xp=(p.xp||0)+xpE;p.muddore=(p.muddore||0)+oreE;p.kills=(p.kills||0)+1;p.quests_completed=(p.quests_completed||0)+1;p.hp=Math.min(100,(p.hp||100)+10);p.state="playing";p.active_quest=null;let ct="";if(!p.animals?.includes("aura")&&Math.random()>0.85&&(p.current_realm||1)>=2){p.animals=[...(p.animals||[]),"aura"];ct="\n\n🦅 *Aura the Thunderbird appears!* New companion bonded.";}if(!p.animals?.includes("coil")&&Math.random()>0.88&&(p.current_realm||1)>=3){p.animals=[...(p.animals||[]),"coil"];ct+="\n🐍 *Coil emerges!* Serpent Elder bonded.";}const ru=realmUp(p);p._prev_ore=p.muddore-oreE;await savePlayer(c,p);await sm(c,`⚔️ *Victory! ${en.e}${en.n}falls!*\n\n_${ci.narrative}_\n\n💥 Final:*${atk}damage*\n\n✨ +${xpE}XP | ⛏️ +${oreE}MuddOre\n❤️ HP:${p.hp}/100${ct}${ru?`\n\n🎊 *REALM UNLOCKED:${R[(p.current_realm||1)-1].n}!*`:""}`,{reply_markup:menu()});
}else{const eAtk=Math.floor(en.a*(0.7+Math.random()*0.6));
const dmg=Math.max(1,eAtk-Math.floor(totalDef(p)/4));p.hp=Math.max(1,(p.hp||100)-dmg);p.active_quest.enemy_hp=eh;p._prev_ore=p.muddore;await savePlayer(c,p);await sm(c,`⚔️ *${en.e}${en.n}— HP:${eh}/${en.h}*\n\n_${ci.narrative}_\n\n💥 You deal *${atk}* | 🩸 You take *${dmg}* — HP:${p.hp}/100\n\n_"${ci.enemy_taunt}"_`,{reply_markup:{keyboard:[[{text:"⚔️ Strike"},{text:"🔮 Magic"}],[{text:"💬 Speak / Riddle"},{text:"🛡️ Defend"}],[{text:"🏃 Retreat"}]],resize_keyboard:true}});}return new Response("ok");}
 if(t==="🎒 Inventory"){const eq=p.equipped||{};
const inv=(p.inventory||[]).filter((id:string)=>!Object.values(eq).includes(id));
const eqL=Object.entries(eq).map(([s,id])=>{const it=EQ.find(e=>e.i===id);return it?`${it.e}*${it.n}* _(${s})`:"";}).filter(Boolean);let msg=`🎒 *${p.ragaila_name||fn}*\n\n${avatar(p)}\n\n⛏️ Mining:+${mineBoost(p)}%\n🛡️ Defense:${totalDef(p)}\n`;if(eqL.length)msg+=`\n⚔️ *Equipped:*\n${eqL.join("\n")}`;if(inv.length){msg+=`\n\n📦 *Unequipped(${inv.length}):*`;
const btns=inv.slice(0,6).map((id:string)=>{const it=EQ.find(e=>e.i===id);return it?[{text:`Equip ${it.e}${it.n}`,callback_data:`equip_${id}`},{text:`Sell +${it.mv*8}`,callback_data:`sell_${id}`}]:[]}).filter((r:any[])=>r.length);await sm(c,msg,{reply_markup:{inline_keyboard:btns}});
}else{msg+="\n\n_No unequipped items._";await sm(c,msg,{reply_markup:menu()});}return new Response("ok");}
 if(t==="👥 Little People"){const pacts=p.pacts||{};
const pl=Object.keys(pacts).map(id=>{const lp=LP.find(l=>l.i===id);return lp?`${lp.e}*${lp.n}*(${lp.tr})Lv.${pacts[id]?.level||1}+${lp.mb}%`:"";}).filter(Boolean);
const avail=LP.filter(l=>!pacts[l.i]).slice(0,4);await sm(c,`👥 *Little People — ${Object.keys(pacts).length}pacts*\n\n${pl.length?pl.join("\n"):"_No pacts yet._"}\n\n_Bond with new LP:_`,{reply_markup:{inline_keyboard:avail.map(l=>[{text:`🤝 ${l.e}${l.n}— ${l.tr}`,callback_data:`bond_lp_${l.i}`}])}});return new Response("ok");}
 if(t==="🐾 Companions"){const an=p.animals||[];if(!an.length){await sm(c,"🐾 *Companions*\n\n_None bonded yet._ Win quests to bond.",{reply_markup:menu()});return new Response("ok");}await st(c);
const act=CA.find(a=>a.i===p.companion);
const w=await queen(p,"wisdom","animal_wisdom");
const al=an.map((id:string)=>{const a=CA.find(c=>c.i===id);return a?`${a.e}*${a.n}* — ${a.rar}${p.companion===id?"✅":""}`:"";}).filter(Boolean);await sm(c,`🐾 *Companions(${an.length})*\n\n${al.join("\n")}\n\n${act?.e}*${act?.n}:*\n_"${w.insight}"_\n💡 ${w.clue}`,{reply_markup:{inline_keyboard:an.map((id:string)=>{const a=CA.find(c=>c.i===id);return a?[{text:`Activate ${a.e}${a.n}(+${a.cb}%)`,callback_data:`companion_${id}`}]:[];})}});return new Response("ok");}
 if(t==="🌍 Realm"){await st(c);
const realm=R[(p.current_realm||1)-1];
const lore=await queen(p,realm.n,"lore");
const nr=R[p.current_realm]||null;
const re=realm.en.map(id=>`${EN[id]?.e||"👾"}${EN[id]?.n||id}`).join(" · ");await sm(c,`${realm.e}*Realm ${realm.i}:${realm.n}*\n\n_${realm.d}_\n\n🌐 Tradition:*${realm.t}*\n👾 Enemies:${re}\n\n📖 *Lore:*\n_${lore.lore}_\n\n${nr?`🔮 *Next:* ${nr.e}${nr.n}\n_Requires ${nr.x}XP — you have ${p.xp||0}_`:"👑 You stand at the Sacred Core."}`,{reply_markup:menu()});return new Response("ok");}
 if(t==="📊 Stats"){await sm(c,`📊 *${p.ragaila_name||fn}*\n\n${tier(p)}\n\n❤️ HP:${p.hp||100}/100\n💫 Mana:${p.mana||60}/60\n✨ XP:${p.xp||0}\n🌍 Realm:${p.current_realm||1}/7\n\n⛏️ Mining:+${mineBoost(p)}%\n🛡️ Defense:${totalDef(p)}\n⚔️ Quests:${p.quests_completed||0}\n💀 Kills:${p.kills||0}\n🤝 LP:${Object.keys(p.pacts||{}).length}/8\n🐾 Companions:${(p.animals||[]).length}/8\n\n💎 MuddOre:${p.muddore||0}\n🪙 Claimable MUDD:${Math.floor((p.muddore||0)/1000)}\n🔮 Ring Mine Glyph:${p.ringmine_glyph||"Seed"}`,{reply_markup:menu()});return new Response("ok");}
 if(t==="💰 Economy"){const ore=p.muddore||0;
const cl=Math.floor(ore/1000);await sm(c,`💰 *Inner Earth Economy*\n\n⛏️ *MuddOre:* ${ore}\n🪙 *Claimable MUDD:* ${cl}\n\n_1,000 MuddOre=1 MUDD_\n${cl>0?`\n✅ Claim *${cl}MUDD*\n_Mine in Ring Mine to convert and withdraw to TON wallet._`:"_Mine more to reach 1,000 MuddOre._"}\n\n🔮 Ring Mine glyph:${p.ringmine_glyph||"N/A"}\n🐺 Ring Mine companion:${p.ringmine_companion||"N/A"}\n\n_MUDD Contract(TON Testnet):_\n\`0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8\``,{reply_markup:menu()});return new Response("ok");}
 if(t==="🎮 Play Visual Game"||t==="/play"){await sm(c,"🎮 *Inner Earth — Visual Mode*\n\n_Launch the full visual game._",{reply_markup:{inline_keyboard:[[{text:"🌍 Launch Inner Earth",web_app:{url:"https:
 if(t==="🏠 Menu"){p.state="playing";p.active_quest=null;p._prev_ore=p.muddore;await savePlayer(c,p);await sm(c,`🌍 *Inner Earth — ${p.ragaila_name||fn}*\n\n_${tier(p)}_\n\nWhat calls you?`,{reply_markup:menu()});return new Response("ok");}
 await sm(c,"Use the menu to navigate. 🌍",{reply_markup:menu()});return new Response("ok");
});

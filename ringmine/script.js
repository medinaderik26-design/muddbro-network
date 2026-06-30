// ============================================================
// RING MINE — script.js
// Main entry point. Wires all modules together.
// ============================================================

import { ENEMIES, LP_DATA, COMPANIONS, GEAR_DATA, BOND_MILESTONES, DAILY_PROMPTS } from "./game-data.js";
import { load, save }                    from "./systems/save.js";
import { init as telegramInit, haptic, hapticNotification } from "./systems/telegram.js";
import { navigate, updateHUD, spawnTapFX, toast, showMilestone } from "./systems/ui.js";
import { getJournalReflection, getDailyGreeting } from "./queen-protocol.js";

// ── STATE ────────────────────────────────────────────────────
let G = load();

// ── INIT ─────────────────────────────────────────────────────
telegramInit();
updateHUD(G);
bindTap();
bindNav();
checkPassiveMining();
checkDailyJournal();
renderPeople();
renderGear();
setTimeout(() => showDailyGreeting(), 800);

// ── NAVIGATION ───────────────────────────────────────────────
function bindNav() {
  ["mine", "quest", "people", "gear", "journal", "stats"].forEach(name => {
    const btn = document.getElementById("nb-" + name);
    if (btn) btn.addEventListener("click", () => navigate(name, onScreenSwitch));
  });
}

function onScreenSwitch(name) {
  if (name === "quest")   renderQuest();
  if (name === "stats")   renderStats();
  if (name === "journal") renderJournal();
}

// ── TAP MINING ───────────────────────────────────────────────
function bindTap() {
  const wrap = document.getElementById("char-wrap");
  if (!wrap) return;
  const img = document.getElementById("char-img");

  const doTap = (e) => {
    e.preventDefault();
    img?.classList.add("tapped");
    setTimeout(() => img?.classList.remove("tapped"), 120);

    const earned = G.mine_power + Math.floor(Math.random() * 2);
    G.ore  += earned;
    G.xp   += 2;
    G.taps++;

    // Realm progression
    const { XP_NEEDS } = await import("./game-data.js").catch(() => ({ XP_NEEDS: [0,200,500,1000,2000,4000,8000,99999] }));
    if (G.realm < 7 && G.xp >= (XP_NEEDS || [0,200,500,1000,2000,4000,8000,99999])[G.realm]) {
      G.realm++;
      G.mine_power += 2;
      toast("🌟 REALM " + G.realm + " UNLOCKED!");
      hapticNotification("success");
    }

    // Bond ticks up slightly from mining engagement
    if (G.taps % 50 === 0) {
      G.bond = Math.min(100, G.bond + 1);
      checkBondMilestone();
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    spawnTapFX(wrap, clientX, clientY, earned);
    haptic("light");
    save(G);
    updateHUD(G);
  };

  wrap.addEventListener("touchstart", doTap, { passive: false });
  wrap.addEventListener("click", doTap);
}

// ── QUEST / COMBAT ───────────────────────────────────────────
let currentEnemy = null;
let enemyHP = 0;

function renderQuest() {
  const eligible = ENEMIES.filter(e => e.realm <= G.realm);
  currentEnemy   = eligible[Math.floor(Math.random() * eligible.length)];
  enemyHP = currentEnemy.hp;
  updateQuestUI();
}

function updateQuestUI() {
  document.getElementById("e-name").textContent  = currentEnemy.name;
  document.getElementById("e-trad").textContent  = currentEnemy.trad;
  document.getElementById("e-lore").textContent  = currentEnemy.lore;
  document.getElementById("e-weak").textContent  = "⚡ " + currentEnemy.weak;
  document.getElementById("e-hp-txt").textContent = enemyHP + "/" + currentEnemy.hp;
  document.getElementById("e-hp-bar").style.width = (enemyHP / currentEnemy.hp * 100) + "%";
  document.getElementById("e-emoji").textContent = currentEnemy.emoji;
  document.getElementById("combat-log").textContent = "A " + currentEnemy.name + " blocks your path...";
}

window.combat = function(action) {
  if (!currentEnemy || enemyHP <= 0) { renderQuest(); return; }

  const actions = { attack: [8, 10], magic: [12, 15], wit: [5, 20], flee: null };
  if (action === "flee") {
    document.getElementById("combat-log").textContent = "🏃 You escape... for now.";
    haptic("medium");
    setTimeout(renderQuest, 1200);
    return;
  }

  const [base, range] = actions[action];
  const dmg  = base + Math.floor(Math.random() * range) + (action === "attack" ? G.mine_power : G.realm * 2);
  enemyHP    = Math.max(0, enemyHP - dmg);
  const logEl = document.getElementById("combat-log");
  const icons = { attack: "⚔️", magic: "🔮", wit: "🧠" };
  let log = `${icons[action]} You deal ${dmg} damage!`;

  document.getElementById("e-hp-bar").style.width  = (enemyHP / currentEnemy.hp * 100) + "%";
  document.getElementById("e-hp-txt").textContent  = enemyHP + "/" + currentEnemy.hp;

  if (enemyHP <= 0) {
    G.ore  += currentEnemy.reward;
    G.xp   += currentEnemy.xp;
    G.bond  = Math.min(100, G.bond + 3);
    log += ` — ${currentEnemy.name} DEFEATED! +${currentEnemy.reward} ore ⛏`;
    logEl.textContent = log;
    hapticNotification("success");
    checkBondMilestone();
    save(G); updateHUD(G);
    setTimeout(renderQuest, 2000);
    return;
  }

  // Enemy counter
  const edm = Math.floor(currentEnemy.atk * (0.6 + Math.random() * 0.8));
  G.hp = Math.max(0, G.hp - edm);
  log += `\n${currentEnemy.name} strikes back for ${edm}!`;
  if (G.hp <= 0) { G.hp = G.maxhp; log += " You fell — restored to full HP."; hapticNotification("error"); }
  logEl.textContent = log;
  haptic("medium");
  save(G); updateHUD(G);
};

// ── JOURNAL ──────────────────────────────────────────────────
function renderJournal() {
  const today     = new Date().toDateString();
  const lastEntry = G.last_journal;
  const alreadyWrote = lastEntry === today;

  const promptEl   = document.getElementById("journal-prompt");
  const submitEl   = document.getElementById("journal-submit");
  const textareaEl = document.getElementById("journal-text");
  const reflectEl  = document.getElementById("queen-reflect");
  const histEl     = document.getElementById("journal-history");

  const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_PROMPTS.length;
  if (promptEl) promptEl.textContent = alreadyWrote ? "You've written today. Come back tomorrow." : DAILY_PROMPTS[dayIndex];
  if (submitEl) submitEl.disabled    = alreadyWrote;
  if (textareaEl) textareaEl.value   = "";
  if (reflectEl) reflectEl.textContent = "";

  // History
  if (histEl) {
    const entries = (G.journal_entries || []).slice(-5).reverse();
    histEl.innerHTML = entries.length
      ? entries.map(e => `<div class="journal-entry"><div class="je-date">${e.date}</div><div class="je-text">${e.entry}</div>${e.reflection ? `<div class="je-reflect">"${e.reflection}"</div>` : ""}</div>`).join("")
      : `<div class="je-empty">Your journey hasn't been written yet. Begin below.</div>`;
  }
}

window.submitJournal = async function() {
  const textareaEl = document.getElementById("journal-text");
  const reflectEl  = document.getElementById("queen-reflect");
  const entry      = textareaEl?.value?.trim();
  if (!entry || entry.length < 10) { toast("Write more — the Queen is listening."); return; }

  const submitEl = document.getElementById("journal-submit");
  if (submitEl) submitEl.disabled = true;

  // XP + Bond from journaling
  const xpEarned   = Math.min(50, Math.floor(entry.length / 10));
  const bondEarned = 5;
  G.ore           += xpEarned * 5;
  G.xp            += xpEarned;
  G.bond           = Math.min(100, G.bond + bondEarned);
  G.streak         = isConsecutiveDay() ? G.streak + 1 : 1;
  G.last_journal   = new Date().toDateString();

  // Save entry
  G.journal_entries = G.journal_entries || [];
  G.journal_entries.push({ date: G.last_journal, entry, reflection: null, xp_earned: xpEarned });
  save(G); updateHUD(G); checkBondMilestone();

  // Queen reflection
  if (reflectEl) reflectEl.textContent = "...";
  toast(`+${xpEarned} XP  +${bondEarned} Bond  Streak: ${G.streak} 🔥`);
  hapticNotification("success");

  try {
    const reflection = await getJournalReflection(entry, G);
    if (reflectEl) reflectEl.textContent = `"${reflection}"`;
    // Save reflection to last entry
    G.journal_entries[G.journal_entries.length - 1].reflection = reflection;
    save(G);
  } catch {
    if (reflectEl) reflectEl.textContent = `"The frequency received your words."`;
  }
};

function isConsecutiveDay() {
  if (!G.last_journal) return false;
  const last = new Date(G.last_journal);
  const now  = new Date();
  const diff = (now - last) / (1000 * 60 * 60 * 24);
  return diff >= 1 && diff < 2;
}

// ── PEOPLE ───────────────────────────────────────────────────
function renderPeople() {
  const lpList   = document.getElementById("lp-list");
  const compList = document.getElementById("companion-list");

  if (lpList) lpList.innerHTML = LP_DATA.map(lp => {
    const bonded = G.pacts.includes(lp.id);
    return `<div class="lp-card">
      <div class="lp-emoji">${lp.emoji}</div>
      <div class="lp-info">
        <div class="lp-name">${lp.name}</div>
        <div class="lp-trad">${lp.trad}</div>
        <div class="lp-desc">${lp.desc}</div>
        <div class="lp-gift">${lp.gift}</div>
      </div>
      <button class="lp-btn" onclick="formPact('${lp.id}')">${bonded ? "✅ Bonded" : "Form Pact"}</button>
    </div>`;
  }).join("");

  if (compList) compList.innerHTML = COMPANIONS.map(c => {
    const active = G.companions.includes(c.id);
    return `<div class="lp-card">
      <div class="lp-emoji">${c.emoji}</div>
      <div class="lp-info">
        <div class="lp-name">${c.name}</div>
        <div class="lp-trad">${c.type}</div>
        <div class="lp-desc">${c.role}</div>
        <div class="lp-gift">⚔️ Combat +${c.combat_bonus}</div>
      </div>
      <button class="lp-btn" onclick="toggleCompanion('${c.id}')">${active ? "✅ Active" : "Activate"}</button>
    </div>`;
  }).join("");
}

window.formPact = function(id) {
  if (!G.pacts.includes(id)) { G.pacts.push(id); G.bond = Math.min(100, G.bond + 5); save(G); renderPeople(); toast("Pact formed! +5 Bond"); checkBondMilestone(); }
};
window.toggleCompanion = function(id) {
  const idx = G.companions.indexOf(id);
  idx > -1 ? G.companions.splice(idx, 1) : G.companions.push(id);
  save(G); renderPeople(); toast(idx > -1 ? "Companion deactivated" : "Companion activated!");
};

// ── GEAR ─────────────────────────────────────────────────────
function renderGear() {
  const el = document.getElementById("gear-list");
  if (!el) return;
  el.innerHTML = GEAR_DATA.map(g => {
    const equipped = G.gear.includes(g.id);
    return `<div class="gear-card">
      <div class="gear-emoji">${g.emoji}</div>
      <div class="gear-info">
        <div class="gear-name">${g.name}</div>
        <div class="gear-realm">Realm ${g.realm} Equipment</div>
        <div class="gear-stat">${g.stat}</div>
      </div>
      <button class="gear-btn${equipped ? " equipped" : ""}" onclick="equipGear('${g.id}',${g.bonus || 0})">${equipped ? "✅ Equipped" : "Equip"}</button>
    </div>`;
  }).join("");
}

window.equipGear = function(id, bonus) {
  const idx = G.gear.indexOf(id);
  if (idx > -1) { G.gear.splice(idx, 1); G.mine_power = Math.max(1, G.mine_power - bonus); toast("Unequipped"); }
  else          { G.gear.push(id); G.mine_power += bonus; toast("Equipped! Mining power up!"); }
  save(G); updateHUD(G); renderGear();
};

// ── STATS ────────────────────────────────────────────────────
function renderStats() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const { REALM_NAMES } = { REALM_NAMES: ["","Ancient Earth","Age of Warriors","Mystic Age","Industrial Dawn","Digital Realm","Hyperverse","Sacred Core"] };
  set("st-realm",     G.realm + " — " + REALM_NAMES[G.realm]);
  set("st-ore",       G.ore);
  set("st-mudd",      (G.ore / 1000).toFixed(3));
  set("st-taps",      G.taps);
  set("st-xp",        G.xp);
  set("st-hp",        G.hp + "/" + G.maxhp);
  set("st-bond",      G.bond + "/100");
  set("st-streak",    G.streak + " days 🔥");
  set("st-journals",  (G.journal_entries || []).length);
  set("st-pacts",     G.pacts.length);
  set("st-base",      G.mine_power);
  set("st-gear-cnt",  G.gear.length);
  set("st-lp-bonus",  "+" + G.pacts.length * 10 + "%");
  set("st-claim",     (G.ore / 1000).toFixed(3));
}

// ── BOND MILESTONES ──────────────────────────────────────────
async function checkBondMilestone() {
  for (const ms of BOND_MILESTONES) {
    if (G.bond >= ms.level && !G.milestones_seen.includes(ms.level)) {
      G.milestones_seen.push(ms.level);
      save(G);
      await showMilestone(ms);
    }
  }
}

// ── PASSIVE MINING ───────────────────────────────────────────
function checkPassiveMining() {
  const elapsed = Math.floor((Date.now() - G.last_passive) / 60000);
  if (elapsed > 0) {
    const passive = elapsed * (G.mine_power + G.realm);
    G.ore += passive;
    G.last_passive = Date.now();
    if (passive > 0) toast(`⛏ Mined ${passive} ore while away!`);
    save(G);
  }
  setInterval(() => {
    G.ore += G.mine_power + G.realm;
    G.last_passive = Date.now();
    save(G); updateHUD(G);
  }, 60000);
}

// ── DAILY GREETING ───────────────────────────────────────────
async function checkDailyJournal() {
  const today = new Date().toDateString();
  if (G.last_journal !== today && G.bond > 0) {
    setTimeout(() => toast("📖 The Queen is waiting. Write today."), 3000);
  }
}

async function showDailyGreeting() {
  if (G.bond >= 25) {
    try {
      const greeting = await getDailyGreeting(G);
      toast(`👑 ${greeting}`, 4000);
    } catch { /* silent */ }
  }
}

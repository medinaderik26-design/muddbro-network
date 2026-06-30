// ============================================================
// RING MINE — systems/ui.js
// All DOM rendering and UI utilities
// ============================================================

import { REALM_EMOJI, RANKS, XP_NEEDS, REALM_NAMES } from "../game-data.js";

// ── NAVIGATION ───────────────────────────────────────────────
const SCREEN_IDS = ["mine", "quest", "people", "gear", "journal", "stats"];

function navigate(name, onSwitch) {
  SCREEN_IDS.forEach(s => {
    const screen = document.getElementById("s-" + s);
    const btn    = document.getElementById("nb-" + s);
    if (screen) screen.classList.toggle("on", s === name);
    if (btn)    btn.classList.toggle("on",    s === name);
  });
  onSwitch?.(name);
}

// ── HUD UPDATE ───────────────────────────────────────────────
function updateHUD(G) {
  setText("ore-disp",   numFmt(G.ore));
  setText("mudd-disp",  (G.ore / 1000).toFixed(2));
  setText("realm-disp", REALM_EMOJI[G.realm] + " Realm " + G.realm);
  setText("rank-lbl",   RANKS[G.realm - 1]);
  setText("bar-xp-lbl", G.xp + " XP");
  setText("bar-mine-lbl", "+" + ((G.mine_power - 1) * 10) + "%");
  setText("bar-hp-lbl",  G.hp + "/" + G.maxhp);
  setText("bond-disp",  "Bond " + G.bond);

  const prevXP = XP_NEEDS[G.realm - 1];
  const nextXP = XP_NEEDS[G.realm];
  const pct = Math.min(100, ((G.xp - prevXP) / (nextXP - prevXP)) * 100);

  setWidth("bar-xp",   pct);
  setWidth("bar-mine", Math.min(100, (G.mine_power / 20) * 100));
  setWidth("bar-hp",   (G.hp / G.maxhp) * 100);
  setWidth("bar-bond", G.bond);
}

// ── TAP FX ───────────────────────────────────────────────────
function spawnTapFX(container, clientX, clientY, amount) {
  const rect   = container.getBoundingClientRect();
  const cx     = clientX - rect.left;
  const cy     = clientY - rect.top;
  const colors = ["#c9a227", "#f0c040", "#4dd0e1", "#fff", "#ff9800"];

  // Sparks
  for (let i = 0; i < 10; i++) {
    const sp    = document.createElement("div");
    sp.className = "spark";
    const angle = Math.random() * Math.PI * 2;
    const dist  = 30 + Math.random() * 50;
    sp.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px`;
    container.appendChild(sp);
    setTimeout(() => sp.remove(), 520);
  }

  // Dirt clumps
  for (let j = 0; j < 5; j++) {
    const dt    = document.createElement("div");
    dt.className = "dirt";
    dt.style.cssText = `left:${cx}px;top:${cy}px;--dx:${(Math.random()-0.5)*60}px`;
    container.appendChild(dt);
    setTimeout(() => dt.remove(), 650);
  }

  // Floating +ore number
  const pop    = document.createElement("div");
  pop.className = "ore-pop";
  pop.textContent = "+" + amount;
  pop.style.cssText = `left:${cx - 20}px;top:${cy - 30}px`;
  container.appendChild(pop);
  setTimeout(() => pop.remove(), 1250);
}

// ── TOAST ────────────────────────────────────────────────────
function toast(msg, duration = 2200) {
  const t = document.createElement("div");
  t.className  = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("toast-show"), 10);
  setTimeout(() => { t.classList.remove("toast-show"); setTimeout(() => t.remove(), 300); }, duration);
}

// ── BOND MILESTONE MODAL ─────────────────────────────────────
function showMilestone(milestone) {
  return new Promise(resolve => {
    const modal = document.getElementById("milestone-modal");
    document.getElementById("ms-title").textContent   = milestone.title;
    document.getElementById("ms-caption").textContent = milestone.caption;
    document.getElementById("ms-level").textContent   = "Bond Level " + milestone.level;

    const video = document.getElementById("ms-video");
    video.src  = milestone.video_url;
    video.load();
    video.play().catch(() => {});

    modal.classList.add("on");
    document.getElementById("ms-close").onclick = () => {
      modal.classList.remove("on");
      video.pause();
      video.src = "";
      resolve();
    };
  });
}

// ── HELPERS ──────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setWidth(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = pct + "%";
}

function numFmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export { navigate, updateHUD, spawnTapFX, toast, showMilestone, numFmt };

// ============================================================
// RING MINE — systems/save.js
// LocalStorage persistence for all game state
// ============================================================

const SAVE_KEY = "ringmine_v1";

const DEFAULT_STATE = {
  // Player
  ore:         0,
  xp:          0,
  hp:          100,
  maxhp:       100,
  realm:       1,
  taps:        0,
  mine_power:  1,
  // Economy
  mudd:        0,
  // Social / Protocol
  bond:        0,           // Queen bond level (0–100)
  streak:      0,           // daily journal streak
  last_journal: null,       // ISO date string of last journal entry
  milestones_seen: [],      // bond levels already revealed
  // Unlocks
  gear:        [],          // equipped gear IDs
  pacts:       [],          // bonded Little People IDs
  companions:  [],          // active companion IDs
  // Journal
  journal_entries: [],      // [{date, prompt, entry, xp_earned}]
  // Goals
  goals: [],                // [{text, created, done}]
  // Session
  last_passive: Date.now(),
};

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const saved = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...saved };
  } catch (e) {
    console.warn("Save load failed, using default:", e);
    return { ...DEFAULT_STATE };
  }
}

function save(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Save failed:", e);
  }
}

function reset() {
  localStorage.removeItem(SAVE_KEY);
  return { ...DEFAULT_STATE };
}

export { load, save, reset, DEFAULT_STATE };

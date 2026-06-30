// ============================================================
// RING MINE — quests/quest-01.js
// Realm 1 quest chain: "The First Vein"
// Introduces combat, lore, and LP pact system
// ============================================================

export const QUEST_01 = {
  id: "q01",
  name: "The First Vein",
  realm_req: 1,
  steps: [
    {
      id: "q01_s1",
      type: "combat",
      enemy_id: "wendigo",
      intro: "A Wendigo blocks the first ore vein. It was human once. It remembers nothing of that now.",
      victory: "The Wendigo dissolves into frost. The vein opens. You feel the mountain exhale.",
      defeat:  "The cold is absolute. The Wendigo retreats — but so do you. Regroup.",
      reward: { ore: 80, xp: 60, bond: 5 }
    },
    {
      id: "q01_s2",
      type: "encounter",
      npc: "pukwudgie_neutral",
      intro: "A small spine-covered figure watches you from the shadows. Not hostile. Curious.",
      choice_a: { text: "Greet it as an equal", outcome: "It nods. Something ancient is acknowledged. A pact begins.", reward: { bond: 8, xp: 30 }, unlocks_lp: "c5" },
      choice_b: { text: "Ignore it",            outcome: "It vanishes. Some doors close quietly.",                    reward: { xp: 5 } }
    },
    {
      id: "q01_s3",
      type: "journal",
      prompt: "You've entered the First Vein. What are you actually mining for in your real life right now?",
      reward: { ore: 50, xp: 40, bond: 10 }
    }
  ]
};

export const QUEST_02 = {
  id: "q02",
  name: "The Drekavac's Scream",
  realm_req: 1,
  steps: [
    {
      id: "q02_s1",
      type: "combat",
      enemy_id: "drekavac",
      intro: "The scream comes first. Then the shadow. The Drekavac hunts those who dig too deep.",
      victory: "The shadow shreds at dawn-light. You held your ground.",
      defeat:  "The scream overwhelmed you. You surface, ears ringing.",
      reward: { ore: 50, xp: 40, bond: 3 }
    },
    {
      id: "q02_s2",
      type: "journal",
      prompt: "What fear showed up for you today — and did you let it lead?",
      reward: { ore: 40, xp: 35, bond: 8 }
    }
  ]
};

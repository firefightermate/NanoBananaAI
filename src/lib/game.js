/**
 * The "game" layer over the studio. Pure client-side flavour computed from
 * real data (render count from the DB) — no gameplay state is stored.
 */

export const LEVEL_TITLES = [
  "Apprentice",      // 1
  "Tinkerer",        // 2
  "Alchemist",       // 3
  "Synthesist",      // 4
  "Conjurer",        // 5
  "Prompt Weaver",   // 6
  "Archmage",        // 7
  "Reality Editor",  // 8
  "Grandmaster",     // 9
  "Element 19",      // 10+
];

const XP_PER_RENDER = 12;
const XP_PER_LEVEL = 100;

export function xpFromRenders(count) {
  return count * XP_PER_RENDER;
}

export function levelFromXp(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return Math.min(level, 99);
}

export function levelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

export function levelProgress(xp) {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

/* ---------------- Rarity ---------------- */

export const RARITIES = {
  common: {
    key: "common",
    label: "Common",
    weight: 60,
    color: "#9ca3af",
    glow: "rgba(156, 163, 175, 0.35)",
  },
  rare: {
    key: "rare",
    label: "Rare",
    weight: 25,
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.45)",
  },
  epic: {
    key: "epic",
    label: "Epic",
    weight: 11,
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.5)",
  },
  legendary: {
    key: "legendary",
    label: "Legendary",
    weight: 4,
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.6)",
  },
};

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Deterministic rarity for a render, seeded by its image URL so the same
 * image always shows the same stamp.
 */
export function rollRarity(seed) {
  const roll = hashString(seed) % 100;
  let acc = 0;
  for (const r of [RARITIES.common, RARITIES.rare, RARITIES.epic, RARITIES.legendary]) {
    acc += r.weight;
    if (roll < acc) return r;
  }
  return RARITIES.common;
}

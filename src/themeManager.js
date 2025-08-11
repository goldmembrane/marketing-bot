// src/themeManager.js
const fs = require("fs");
const path = require("path");

const THEMES = ["정보전달", "감성", "유용성 어필", "고민상담"];
const CACHE = path.join(__dirname, "..", ".cache");
const FILE = path.join(CACHE, "theme_pool.json");

function ensureCache() {
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });
  if (!fs.existsSync(FILE))
    fs.writeFileSync(FILE, JSON.stringify({ remaining: THEMES }), "utf8");
}

function loadPool() {
  ensureCache();
  try {
    const { remaining } = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (Array.isArray(remaining) && remaining.length) return remaining;
  } catch (_) {}
  return [...THEMES];
}

function savePool(remaining) {
  ensureCache();
  fs.writeFileSync(FILE, JSON.stringify({ remaining }, null, 2), "utf8");
}

function pickTheme() {
  let remaining = loadPool();
  if (remaining.length === 0) remaining = [...THEMES];

  const idx = Math.floor(Math.random() * remaining.length);
  const picked = remaining[idx];

  // 사용한 테마 제거 후 저장
  remaining.splice(idx, 1);
  savePool(remaining);

  return picked;
}

function resetPool() {
  savePool([...THEMES]);
}

module.exports = { THEMES, pickTheme, resetPool };

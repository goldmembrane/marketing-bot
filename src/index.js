// src/index.js
const { generatePalettePost } = require("./gpt");
const fs = require("fs-extra");
const path = require("path");

async function run() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const hexCodes = ["#a2d2ff", "#ffc8dd", "#cdb4db", "#ffafcc", "#bde0fe"];

  console.log("📤 Generating post via GPT...");
  const content = await generatePalettePost(hexCodes, today);

  const savePath = path.join(__dirname, "..", "posts");
  await fs.ensureDir(savePath);
  const filePath = path.join(savePath, `${today}.md`);

  await fs.writeFile(filePath, content);
  console.log(`✅ Saved to ${filePath}`);
}

run();

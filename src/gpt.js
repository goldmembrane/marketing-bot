// src/gpt.js
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generatePalettePost() {
  const prompt = `
Write a single promotional tweet (strictly under 280 characters) about the Chrome extension "Palette Box".

Guidelines:
- It's built by a solo indie developer.
- Purpose: capture web colors, save mood-based palettes, enhance workflow.
- MUST include this coupon code on a new line for emphasis: PALETTEBOXFREE3MONTH
- Add 2 line breaks before the coupon line to visually separate it.
- End with 3 relevant hashtags (e.g. #indiedev #designers #creativetools).
- DO NOT use markdown or quotes.
- Focus on clarity, conversion, and visual structure.
- DO NOT exceed 280 characters under any condition.
Return ONLY the tweet text, nothing else.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  return res.choices[0].message.content.trim();
}

module.exports = { generatePalettePost };

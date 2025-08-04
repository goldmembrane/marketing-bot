// src/gpt.js
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generatePalettePost(hexCodes, dateStr) {
  const prompt = `
Generate a blog-style promotional post in markdown format for a color palette.

Palette: ${hexCodes.join(", ")}
Date: ${dateStr}

Requirements:
- Title (short and catchy)
- Summary (1~2 lines)
- Description (3~5 sentences about the palette's feeling, use cases, emotion, etc.)
- Include 3 relevant hashtags
`;

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  return res.choices[0].message.content.trim();
}

module.exports = { generatePalettePost };

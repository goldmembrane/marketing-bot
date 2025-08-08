// src/gpt.js
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generatePalettePost() {
  const tones = [
    {
      type: "감성",
      prompt: `Write a single promotional tweet (strictly under 280 characters) about the Chrome extension "Palette Box".

Formatting rules (must follow exactly):
- Line 1: short hook (<= 45 chars), no emoji.
- Line 2: one feature with ONE emoji at the start (e.g., "🎯 Capture web colors fast")
- Line 3: one feature with ONE emoji at the start
- Line 4: one benefit with ONE emoji at the start
- Then add TWO blank lines.
- Next line: 🎁 Enjoy a 3-month free trial with this coupon
- Next line: ONLY the coupon code exactly: PALETTEBOXFREE3MONTH
- Then ONE blank line.
- Final line: exactly 3 hashtags separated by spaces (choose from: #indiedev #buildinpublic #designers #creativity #aesthetic #creativetools #solodev #productivity).

Tone/Style:
- Warm, evocative, human; inspire creative feelings.
- Subtly note it’s built by a solo indie developer (can be in any of the first 4 lines).
- DO NOT use markdown, bullets, quotes, or colons at line ends.
- Focus on clarity, emotion, and conversion.
- DO NOT exceed 280 characters under any condition.
Return ONLY the tweet text with the exact line breaks described above.
`,
    },
    {
      type: "정보전달",
      prompt: `Write a single promotional tweet (strictly under 280 characters) about the Chrome extension "Palette Box".

Formatting rules (must follow exactly):
- Line 1: short hook (<= 45 chars), no emoji.
- Line 2: one feature with ONE emoji at the start (e.g., "🎯 Capture web colors fast")
- Line 3: one feature with ONE emoji at the start
- Line 4: one benefit with ONE emoji at the start
- Then add TWO blank lines.
- Next line: 🎁 Enjoy a 3-month free trial with this coupon
- Next line: ONLY the coupon code exactly: PALETTEBOXFREE3MONTH
- Then ONE blank line.
- Final line: exactly 3 hashtags separated by spaces (choose from: #indiedev #buildinpublic #designers #creativity #aesthetic #creativetools #solodev #productivity).

Tone/Style:
- Warm, evocative, human; inspire creative feelings.
- Subtly note it’s built by a solo indie developer (can be in any of the first 4 lines).
- DO NOT use markdown, bullets, quotes, or colons at line ends.
- Focus on clarity, emotion, and conversion.
- DO NOT exceed 280 characters under any condition.
Return ONLY the tweet text with the exact line breaks described above.
`,
    },
    {
      type: "유용성 어필",
      prompt: `Write a single promotional tweet (strictly under 280 characters) about the Chrome extension "Palette Box".

Formatting rules (must follow exactly):
- Line 1: problem-solving hook (<= 45 chars), no emoji.
- Line 2: one feature with ONE emoji at the start
- Line 3: one feature with ONE emoji at the start
- Line 4: one benefit with ONE emoji at the start
- Then add TWO blank lines.
- Next line: 🎁 Get 3 months free with this coupon
- Next line: ONLY the coupon code exactly: PALETTEBOXFREE3MONTH
- Then ONE blank line.
- Final line: exactly 3 hashtags separated by spaces (choose from: #indiedev #buildinpublic #designers #creativity #aesthetic #creativetools #solodev #productivity).

Tone/Style:
- Practical, direct, and problem-solving; show how it helps users achieve goals faster or easier.
- Subtly note it’s built by a solo indie developer (can be in any of the first 4 lines).
- DO NOT use markdown, bullets, quotes, or colons at line ends.
- Focus on clarity, practical benefit, and conversion.
- DO NOT exceed 280 characters under any condition.
Return ONLY the tweet text with the exact line breaks described above.`,
    },
    {
      type: "고민상담",
      prompt: `Write a single promotional tweet (strictly under 280 characters) about the Chrome extension "Palette Box".

Formatting rules (must follow exactly):
- Line 1: empathetic question hook (<= 45 chars), no emoji.
- Line 2: one feature with ONE emoji at the start
- Line 3: one feature with ONE emoji at the start
- Line 4: one benefit with ONE emoji at the start
- Then add TWO blank lines.
- Next line: 🎁 Here’s your 3-month free coupon
- Next line: ONLY the coupon code exactly: PALETTEBOXFREE3MONTH
- Then ONE blank line.
- Final line: exactly 3 hashtags separated by spaces (choose from: #indiedev #buildinpublic #designers #creativity #aesthetic #creativetools #solodev #productivity).

Tone/Style:
- Friendly, conversational, and empathetic; sound like you’re helping a friend with a problem.
- Subtly note it’s built by a solo indie developer (can be in any of the first 4 lines).
- DO NOT use markdown, bullets, quotes, or colons at line ends.
- Focus on relatability, warmth, and conversion.
- DO NOT exceed 280 characters under any condition.
Return ONLY the tweet text with the exact line breaks described above.`,
    },
  ];

  const selected = tones[Math.floor(Math.random() * tones.length)];

  console.log(`🎯 Using tone: ${selected.type}`);

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: selected.prompt }],
    temperature: 0.8,
  });

  return res.choices[0].message.content.trim();
}

// ✅ 새로 추가: 블로그용 본문 JSON 생성 → MD로 변환
async function generateBlogMarkdown() {
  // 1) 모델에 JSON만 요청 (프론트매터는 코드에서 만든다)
  const sys = `You generate blog content JSON only. No markdown, no prose around it.`;
  const user = `
Return STRICT JSON with keys:
{
  "title": string (<= 80 chars),
  "tags": string[] (3-6 items, NO #),
  "cover_image": string | null (URL or null),
  "summary": string (1-2 lines),
  "description": string (3-6 sentences, markdown allowed, NO frontmatter),
  "cta": string (must mention: PALETTEBOXFREE3MONTH gives 3 months free)
}

Topic: Chrome extension "Palette Box".
Angle: solo indie developer, capture web colors, save mood-based palettes, improve workflow.

Rules:
- Output ONLY valid JSON. No code fences, no extra text.
- "tags" must be plain keywords (e.g., ["indie","design","palette-box"]), not hashtags.
- Mention the coupon clearly in "cta".
`;

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.6,
  });

  const raw = res.choices[0].message.content.trim();

  // 2) JSON 파싱 안정화
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error("GPT JSON parse failed: " + e.message + "\nRAW:\n" + raw);
  }

  // 3) 프론트매터 + MD 조립 (여기서 ---를 정확히 닫아줌)
  const fm = buildFrontmatter({
    title: data.title || "Palette Box — Blog",
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover_image: data.cover_image || null,
    publish: true,
    canonical_url: process.env.SITE_CANONICAL || null,
  });

  const body = [
    "## Summary",
    data.summary || "",
    "",
    "## Description",
    data.description || "",
    "",
    "## Coupon",
    "Use code **PALETTEBOXFREE3MONTH** for 3 months free.",
    "",
    data.cta || "",
  ].join("\n");

  return `${fm}\n${body}\n`;
}

// 헬퍼: 안전한 프론트매터 빌드
function buildFrontmatter(obj) {
  const esc = (s) => String(s).replace(/"/g, '\\"');
  const lines = ["---"];
  if (obj.title) lines.push(`title: "${esc(obj.title)}"`);
  if (obj.tags)
    lines.push(`tags: [${obj.tags.map((t) => `"${esc(t)}"`).join(", ")}]`);
  if (obj.cover_image) lines.push(`cover_image: "${esc(obj.cover_image)}"`);
  if (obj.canonical_url)
    lines.push(`canonical_url: "${esc(obj.canonical_url)}"`);
  lines.push(`publish: ${obj.publish ? "true" : "false"}`);
  lines.push("---");
  return lines.join("\n");
}

module.exports = { generatePalettePost, generateBlogMarkdown };

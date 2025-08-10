// src/gpt.js
const { OpenAI } = require("openai");
require("dotenv").config();
const { pickTheme } = require("./themeManager");

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
  const SECTION_TITLES = {
    정보전달: {
      summary: "Summary",
      why: "What is Palette Box?",
      features: "Key Features",
      useCases: "Best For",
      steps: "Quick Start",
      tips: "Pro Tips",
      coupon: "Coupon",
      cta: "Next Steps",
    },
    감성: {
      summary: "A Gentle Overview",
      why: "Why Creators Love Palette Box",
      features: "Moments That Shine",
      useCases: "Where It Feels Right",
      steps: "Begin Your Flow",
      tips: "Little Sparks",
      coupon: "A Small Gift",
      cta: "Create With Ease",
    },
    "유용성 어필": {
      summary: "At-a-Glance",
      why: "Make Your Workflow Faster",
      features: "What You’ll Get",
      useCases: "High-Impact Uses",
      steps: "Do It Now",
      tips: "Optimization Tips",
      coupon: "Save More",
      cta: "Ship Faster Today",
    },
    고민상담: {
      summary: "Let’s Fix This",
      why: "How Palette Box Eases Your Pain",
      features: "What Helps Right Away",
      useCases: "When To Use",
      steps: "Simple Steps",
      tips: "Friendly Advice",
      coupon: "Here’s a Free Boost",
      cta: "You’ve Got This",
    },
  };

  // 안전장치: 미정의 테마일 때 기본값
  const DEFAULT_TITLES = SECTION_TITLES["정보전달"];
  const COMMON_SCHEMA = `
Return STRICT JSON with keys:
{
  "title": string (max 80),
  "tags": string[] (3-6 items, NO '#', lowercase),
  "cover_image": string | null,          // absolute URL or null
  "summary": string (1-2 lines, max 220 chars, value oriented),
  "long_description": string[],          // 2-3 paragraphs, each 80-140 words
  "features": string[],                  // 4-6 bullet items, 6-12 words each
  "use_cases": string[],                 // 3-5 bullet items, 6-12 words each
  "steps": string[],                     // 3-6 concise steps (imperative)
  "pro_tips": string[],                  // 3-5 short tips
  "cta": string                          // must clearly mention: PALETTEBOXFREE3MONTH gives 3 months free
}

Rules:
- Output ONLY valid JSON. No extra text, no code fences, no frontmatter.
- "tags" are plain keywords (e.g., ["indie","design","palette"]), NOT hashtags.
`;

  // 테마별 톤 지시문
  function themeStyle(theme) {
    switch (theme) {
      case "정보전달":
        return `Tone: clear, neutral, structured. Focus on facts, capabilities, outcomes. Minimize adjectives; prefer specifics and examples.`;
      case "감성":
        return `Tone: warm, evocative, lightly narrative. Use sensory language and gentle storytelling. Inspire creativity and flow.`;
      case "유용성 어필":
        return `Tone: practical, result-oriented. Emphasize time-saving, consistency, and measurable workflow improvements. Use action verbs.`;
      case "고민상담":
        return `Tone: empathetic, conversational. Acknowledge common pains (color picking, consistency, scattered palettes) and offer reassuring steps.`;
      default:
        return `Tone: clear and helpful.`;
    }
  }

  function buildUserPrompt(theme) {
    return `
${COMMON_SCHEMA}

Topic: Chrome extension "Palette Box".
Angle: solo indie developer; capture web colors from webpages, save mood-based palettes, improve design workflow.


${themeStyle(theme)}

Output ONLY the JSON.`;
  }

  const theme = pickTheme(); // 🎯 중복 없이 순환
  console.log(`🧩 Theme selected: ${theme}`);

  // 1) 모델에 JSON만 요청 (프론트매터는 코드에서 만든다)
  const sys = `You generate blog content JSON only. No markdown, no prose around it.`;
  const user = buildUserPrompt(theme);
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.65,
  });

  const raw = res.choices[0].message.content.trim();

  // JSON 파싱
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error("GPT JSON parse failed: " + e.message + "\nRAW:\n" + raw);
  }

  // 프론트매터 생성
  const fm = buildFrontmatter({
    title: data.title || "Palette Box — Blog",
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover_image: data.cover_image || null,
    publish: true,
    canonical_url: process.env.SITE_CANONICAL || null,
  });

  // 본문 조립
  const p = (arr) => (Array.isArray(arr) ? arr.filter(Boolean) : []);
  const longDesc = p(data.long_description).join("\n\n");
  const features = p(data.features)
    .map((s) => `- ${s}`)
    .join("\n");
  const useCases = p(data.use_cases)
    .map((s) => `- ${s}`)
    .join("\n");
  const steps = p(data.steps)
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");
  const tips = p(data.pro_tips)
    .map((s) => `- ${s}`)
    .join("\n");

  // ✅ 테마별 타이틀 적용
  const T = SECTION_TITLES[theme] || DEFAULT_TITLES;

  const body = [
    `## ${T.summary}`,
    data.summary || "",
    "",
    `## ${T.why}`,
    longDesc || "",
    "",
    features ? `## ${T.features}` : "",
    features,
    features ? "" : "",
    useCases ? `## ${T.useCases}` : "",
    useCases,
    useCases ? "" : "",
    steps ? `## ${T.steps}` : "",
    steps,
    steps ? "" : "",
    tips ? `## ${T.tips}` : "",
    tips,
    tips ? "" : "",
    `## ${T.coupon}`,
    "Use code **PALETTEBOXFREE3MONTH** for 3 months free.",
    "",
    `## ${T.cta}`,
    data.cta || "",
    "",
  ]
    .filter(Boolean)
    .join("\n");

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

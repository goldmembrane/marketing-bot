// src/index.js
require("dotenv").config();
const { generatePalettePost } = require("./gpt");
const { postToTwitter } = require("./twitter");
const matter = require("gray-matter");
const fs = require("fs-extra");
const path = require("path");

async function run() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  console.log("📤 Generating post via GPT...");
  const content = await generatePalettePost();

  const savePath = path.join(__dirname, "..", "posts");
  await fs.ensureDir(savePath);
  const filePath = path.join(savePath, `${today}.md`);
  await fs.writeFile(filePath, content);
  console.log(`✅ Saved to ${filePath}`);

  // ✅ matter로 content 파싱
  // const parsed = matter(content);
  // const { title, tags = [] } = parsed.data; // image 제거
  // const body = parsed.content;

  // // ✅ 트윗 업로드
  // await postToTwitter({ title, tags }, body); // image 없이 전달

  const lines = content.split("\n");

  const titleLine = lines.find((line) => line.startsWith("# "));
  const title = titleLine?.replace(/^#\s*/, "").trim() ?? "";

  const bodyStartIndex = lines.findIndex((line) =>
    line.startsWith("## Description")
  );
  const bodyLines = lines
    .slice(bodyStartIndex + 1)
    .filter((line) => !line.startsWith("##"));
  const body = bodyLines.join("\n").trim();

  const hashtagsLine = lines.find((line) => line.startsWith("## Hashtags"));
  const hashtagsIndex = lines.indexOf(hashtagsLine);
  const tags = lines[hashtagsIndex + 1]?.match(/#\w+/g) ?? [];

  await postToTwitter({ title, tags }, body);
}

run();

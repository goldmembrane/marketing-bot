// src/blog_make_and_publish.js
require("dotenv").config();
const fs = require("fs-extra");
const path = require("path");
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const { generateBlogMarkdown } = require("./gpt");
const { publishFile } = require("./publish");

async function run() {
  const today = new Date().toISOString().slice(0, 10);

  console.log("📝 Generating blog markdown via GPT...");
  const md = await generateBlogMarkdown();

  // 파일명: 날짜 + 슬러그(제목 일부)를 쓰고 싶다면, 제목 파싱
  const titleMatch = md.match(/^title:\s*"(.+?)"/m);
  const title = titleMatch ? titleMatch[1] : `palette-box-${today}`;
  const filename = `${today}-${slugify(title).slice(0, 60)}.md`;

  const saveDir = path.join(__dirname, "..", "posts");
  await fs.ensureDir(saveDir);
  const filePath = path.join(saveDir, filename);
  await fs.writeFile(filePath, md, "utf8");
  console.log(`✅ Saved: ${filePath}`);

  // console.log("🚀 Publishing to enabled platforms...");
  // const results = await publishFile(filePath);

  // results.forEach((r) => {
  //   if (r.ok) console.log(`✅ ${r.platform}: ${r.url}`);
  //   else console.error(`❌ ${r.platform}: ${r.error}`);
  // });
}

if (require.main === module) {
  run().catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  });
}

module.exports = { run };

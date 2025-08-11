require("dotenv").config();
const fs = require("fs/promises");
const path = require("path");
const PQueue = require("p-queue").default;
const { parsePost } = require("./render");
const { publishToDevto } = require("./adapters/devto");
const { publishToHashnode } = require("./adapters/hashnode");

const queue = new PQueue({ interval: 60_000, intervalCap: 10 }); // 분당 10요청 제한 예시

const adapters = [
  { name: "devto", fn: publishToDevto, enabled: !!process.env.DEVTO_API_KEY },
  {
    name: "hashnode",
    fn: publishToHashnode,
    enabled: !!process.env.HASHNODE_API_KEY,
  },
];

async function publishFile(mdPath) {
  const raw = await fs.readFile(mdPath, "utf8");
  const post = parsePost(raw);

  const results = [];
  for (const a of adapters.filter((a) => a.enabled)) {
    results.push(
      queue.add(() =>
        a.fn(post).then(
          (ok) => ({ ok: true, ...ok }),
          (err) => ({ ok: false, platform: a.name, error: err.message })
        )
      )
    );
  }
  return Promise.all(results);
}

// CLI 실행 예: node src/publish.js ./posts/2025-08-08.md
if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node src/publish.js ./posts/your-post.md");
    process.exit(1);
  }
  publishFile(path.resolve(input)).then((res) => {
    res.forEach((r) => {
      if (r.ok) console.log(`✅ ${r.platform}: ${r.url}`);
      else console.error(`❌ ${r.platform}: ${r.error}`);
    });
  });
}

module.exports = { publishFile };

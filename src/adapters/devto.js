const axios = require("axios");

// ✅ dev.to는 영숫자만 허용. 하이픈/공백 제거.
const normTags = (arr = []) =>
  arr
    .slice(0, 4)
    .map((t) =>
      String(t)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
    ) // 하이픈도 제거!
    .filter(Boolean);

async function publishToDevto(post) {
  const { DEVTO_API_KEY } = process.env;

  const payload = {
    article: {
      title: post.title,
      published: !post.draft,
      body_markdown: post.bodyMd, // dev.to는 body_markdown 사용
      tags: normTags(post.tags),
      main_image: post.cover_image || null,
      canonical_url: post.canonical_url || null,
    },
  };

  try {
    const { data } = await axios.post("https://dev.to/api/articles", payload, {
      headers: { "api-key": DEVTO_API_KEY, "Content-Type": "application/json" },
      timeout: 15000,
    });
    return { platform: "devto", url: data.url };
  } catch (err) {
    const detail = err.response?.data
      ? JSON.stringify(err.response.data)
      : err.message;
    throw new Error(`devto: ${detail}`);
  }
}

module.exports = { publishToDevto };

// src/twitter.js
const { TwitterApi } = require("twitter-api-v2");

function createClient() {
  const {
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET,
  } = process.env;

  return new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  });
}

async function postToTwitter(data, body) {
  const client = createClient();

  const title = data.title ?? "🎨 Today's Palette";
  const tags = (data.tags ?? []).join(" ");

  const maxLength = 280;
  const header = `${title}`;
  const footer = `\n\n${tags}`;

  // 본문 최대 길이 계산
  const availableLength = maxLength - header.length - footer.length - 2;
  const trimmedBody = body.trim().slice(0, availableLength);

  const tweet = `${header}\n\n${trimmedBody}${footer}`;

  try {
    const response = await client.v2.tweet(tweet);
    console.log("✅ 트윗 업로드 완료:", response.data.id);
  } catch (err) {
    console.error("❌ 트윗 업로드 실패:", err);
  }
}

module.exports = { postToTwitter };

// src/scheduler.js
require("dotenv").config();
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

// === 실행 대상 ===
const { run: runBlog } = require("./blog"); // 블로그 생성+발행
const { twitterRun: runX } = require("./index"); // X 트윗 업로드

// === 스케줄(서울) ===
// 매주 화요일 15:00
const CRON_BLOG = "0 15 * * 2";
// 매일 22:00
const CRON_X = "0 22 * * *";
const TZ = "Asia/Seoul";

// 지터(초) — 트래픽 분산용 (원치 않으면 0)
const MAX_JITTER_SEC = Number(process.env.MAX_JITTER_SEC || 45);

// 락/캐시 경로
const CACHE_DIR = path.join(__dirname, "..", ".cache");
const BLOG_LOCK = path.join(CACHE_DIR, "blog.lock");
const X_LOCK = path.join(CACHE_DIR, "x.lock");
const STALE_MS = 3 * 60 * 60 * 1000; // 3시간

function ensureCache() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}
function isLocked(lockPath) {
  try {
    const s = fs.statSync(lockPath);
    return Date.now() - s.mtimeMs <= STALE_MS;
  } catch (_) {
    return false;
  }
}
function lock(lockPath) {
  ensureCache();
  fs.writeFileSync(
    lockPath,
    JSON.stringify({ pid: process.pid, at: new Date().toISOString() }),
    "utf8"
  );
}
function unlock(lockPath) {
  try {
    fs.unlinkSync(lockPath);
  } catch (_) {}
}

function withJitter(fn) {
  const jitter = MAX_JITTER_SEC
    ? Math.floor(Math.random() * MAX_JITTER_SEC)
    : 0;
  if (jitter) console.log(`⏳ jitter: ${jitter}s`);
  setTimeout(fn, jitter * 1000);
}

// === 잡 ===
async function blogJob() {
  if (isLocked(BLOG_LOCK)) {
    console.log("⏭️  blog: skip (locked)");
    return;
  }
  lock(BLOG_LOCK);
  withJitter(async () => {
    console.log(
      `📝 blog start @ ${new Date().toLocaleString("ko-KR", { timeZone: TZ })}`
    );
    try {
      await runBlog();
      console.log("✅ blog done");
    } catch (e) {
      console.error("❌ blog failed:", e?.message || e);
    } finally {
      unlock(BLOG_LOCK);
    }
  });
}

async function xJob() {
  if (isLocked(X_LOCK)) {
    console.log("⏭️  X: skip (locked)");
    return;
  }
  lock(X_LOCK);
  withJitter(async () => {
    console.log(
      `🐦 X start @ ${new Date().toLocaleString("ko-KR", { timeZone: TZ })}`
    );
    try {
      await runX();
      console.log("✅ X done");
    } catch (e) {
      console.error("❌ X failed:", e?.message || e);
    } finally {
      unlock(X_LOCK);
    }
  });
}

// === 스케줄 등록 ===
console.log(`🗓  blog cron: ${CRON_BLOG} (TZ=${TZ})`);
cron.schedule(CRON_BLOG, blogJob, { timezone: TZ });

console.log(`🗓  X cron   : ${CRON_X} (TZ=${TZ})`);
cron.schedule(CRON_X, xJob, { timezone: TZ });

// 종료 시 락 해제
["SIGINT", "SIGTERM", "SIGHUP"].forEach((sig) => {
  process.on(sig, () => {
    unlock(BLOG_LOCK);
    unlock(X_LOCK);
    process.exit(0);
  });
});

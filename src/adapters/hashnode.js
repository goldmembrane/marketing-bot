// src/adapters/hashnode.js
const axios = require("axios");

const toTagObjects = (arr = []) =>
  arr.slice(0, 5).map((t) => {
    const s = String(t).trim();
    const slug =
      s
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 30) || "tag";
    return { name: s, slug };
  });

async function publishToHashnode(post) {
  const { HASHNODE_API_KEY, HASHNODE_PUBLICATION_ID, HASHNODE_HOST } =
    process.env;
  if (!HASHNODE_API_KEY || !HASHNODE_PUBLICATION_ID || !HASHNODE_HOST) {
    throw new Error(
      "HASHNODE_API_KEY, HASHNODE_PUBLICATION_ID, HASHNODE_HOST를 .env에 모두 설정하세요."
    );
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${HASHNODE_API_KEY}`,
  };

  // 1) Draft 생성
  const createDraft = `
    mutation CreateDraft($input: CreateDraftInput!) {
      createDraft(input: $input) {
        draft { id slug }
      }
    }`;

  const draftInput = {
    title: post.title,
    contentMarkdown: post.bodyMd,
    tags: toTagObjects(post.tags),
    publicationId: HASHNODE_PUBLICATION_ID,
  };
  if (post.cover_image)
    draftInput.coverImageOptions = { coverImageURL: post.cover_image };

  const draftRes = await axios.post(
    "https://gql.hashnode.com",
    { query: createDraft, variables: { input: draftInput } },
    { headers }
  );

  if (draftRes.data.errors) {
    throw new Error(
      `hashnode.createDraft: ${JSON.stringify(draftRes.data.errors)}`
    );
  }
  const draftId = draftRes.data.data.createDraft.draft.id;

  // 2) 발행 (publicationId 미포함)
  const slug = await publishDraftBestEffort({ draftId, headers });

  const base = HASHNODE_HOST.replace(/^https?:\/\//, "");
  return { platform: "hashnode", url: `https://${base}/${slug}` };
}

async function publishDraftBestEffort({ draftId, headers }) {
  // 형태 A: input 객체
  const m1 = `
    mutation PublishDraft($input: PublishDraftInput!) {
      publishDraft(input: $input) { post { slug } }
    }`;
  const v1 = { input: { draftId } };

  try {
    const r1 = await axios.post(
      "https://gql.hashnode.com",
      { query: m1, variables: v1 },
      { headers }
    );
    if (!r1.data.errors) return r1.data.data.publishDraft.post.slug;
  } catch (_) {}

  // 형태 B: 위치 인자
  const m2 = `
    mutation PublishDraft($draftId: ID!) {
      publishDraft(draftId: $draftId) { post { slug } }
    }`;
  const v2 = { draftId };

  const r2 = await axios.post(
    "https://gql.hashnode.com",
    { query: m2, variables: v2 },
    { headers }
  );
  if (r2.data.errors)
    throw new Error(`hashnode.publishDraft: ${JSON.stringify(r2.data.errors)}`);
  return r2.data.data.publishDraft.post.slug;
}

module.exports = { publishToHashnode };

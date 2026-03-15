#!/usr/bin/env node

const crypto = require('crypto');

function normalizeKind(kind) {
  const normalized = String(kind || '').trim().toLowerCase();
  if (normalized === 'audio') {
    return { bucketPrefix: 'aud', assetPrefix: 'au' };
  }
  if (normalized === 'image') {
    return { bucketPrefix: 'img', assetPrefix: 'im' };
  }
  throw new Error(`Unsupported media kind: ${kind}`);
}

function sanitizeExt(ext) {
  const normalized = String(ext || '').trim().toLowerCase().replace(/^\./, '');
  if (!normalized) throw new Error('Missing file extension');
  if (!/^[a-z0-9]+$/.test(normalized)) {
    throw new Error(`Invalid file extension: ${ext}`);
  }
  return normalized;
}

function hashContentSeed(seed) {
  return crypto.createHash('sha256').update(String(seed)).digest('hex');
}

function generateOpaqueId() {
  return crypto.randomUUID().replace(/-/g, '');
}

function generateMediaObjectKey({ kind, ext, contentSha256, externalId }) {
  const { bucketPrefix, assetPrefix } = normalizeKind(kind);
  const safeExt = sanitizeExt(ext);
  const hash = String(contentSha256 || '').trim().toLowerCase() || hashContentSeed(externalId || generateOpaqueId());
  if (!/^[a-f0-9]{8,}$/.test(hash)) {
    throw new Error('contentSha256 must be a hex digest');
  }

  const shard = hash.slice(0, 2);
  const debugHash = hash.slice(0, 4);
  const opaque = String(externalId || generateOpaqueId()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);

  if (!opaque) {
    throw new Error('Unable to derive opaque asset identifier');
  }

  return `${bucketPrefix}/v1/${shard}/${assetPrefix}_${opaque}_${debugHash}.${safeExt}`;
}

if (require.main === module) {
  const [kind, ext, contentSha256, externalId] = process.argv.slice(2);
  if (!kind || !ext) {
    console.error('Usage: generate-media-object-key.js <audio|image> <ext> [contentSha256] [externalId]');
    process.exit(1);
  }

  try {
    const key = generateMediaObjectKey({ kind, ext, contentSha256, externalId });
    process.stdout.write(`${key}\n`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  generateMediaObjectKey,
};

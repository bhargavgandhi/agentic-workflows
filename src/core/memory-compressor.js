'use strict';

const fs   = require('fs');
const path = require('path');

const INDEX_FILE = 'index.json';

/**
 * Read all observation files, group related ones by keyword overlap,
 * and write structured learning files + index.json.
 *
 * @param {string} obsDir       - path to .agents/memory/observations/
 * @param {string} learningsDir - path to .agents/memory/learnings/
 */
function compressObservations(obsDir, learningsDir) {
  if (!fs.existsSync(obsDir)) return;

  const obsFiles = fs.readdirSync(obsDir).filter(f => f.endsWith('.json'));
  if (obsFiles.length === 0) return;

  const observations = obsFiles.map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(obsDir, f), 'utf8')); }
    catch { return null; }
  }).filter(Boolean);

  if (observations.length === 0) return;

  fs.mkdirSync(learningsDir, { recursive: true });

  const existing = _loadIndex(learningsDir);
  const existingTitles = new Set(existing.map(e => e.title));

  // Group observations into clusters by shared keywords
  const clusters = _cluster(observations);
  const newEntries = [];

  for (const cluster of clusters) {
    const title = _deriveTitle(cluster);
    if (existingTitles.has(title)) continue;

    const tags      = _deriveTags(cluster);
    const content   = _deriveContent(cluster);
    const timestamp = new Date().toISOString();
    const filename  = `${_slug(title)}-${Date.now()}.json`;

    const learning = { title, tags, content, timestamp };
    fs.writeFileSync(path.join(learningsDir, filename), JSON.stringify(learning, null, 2), 'utf8');

    newEntries.push({ title, file: filename, tags, timestamp });
    existingTitles.add(title);
  }

  if (newEntries.length > 0) {
    _saveIndex(learningsDir, [...existing, ...newEntries]);
  }
}

// ── private ───────────────────────────────────────────────────────────────────

function _cluster(observations) {
  // Simple keyword-overlap clustering: each observation starts its own cluster,
  // then merge if they share ≥2 significant keywords.
  const clusters = observations.map(o => [o]);
  const merged   = new Set();
  const result   = [];

  for (let i = 0; i < clusters.length; i++) {
    if (merged.has(i)) continue;
    const base = clusters[i];
    for (let j = i + 1; j < clusters.length; j++) {
      if (merged.has(j)) continue;
      if (_shareKeywords(base[0].summary, clusters[j][0].summary, 2)) {
        base.push(...clusters[j]);
        merged.add(j);
      }
    }
    result.push(base);
  }
  return result;
}

function _shareKeywords(a, b, threshold) {
  const wordsA = _keywords(a);
  const wordsB = new Set(_keywords(b));
  return wordsA.filter(w => wordsB.has(w)).length >= threshold;
}

function _keywords(text) {
  const stopwords = new Set(['the','a','an','is','are','was','in','on','at','to','of','and','or','use','with','for','by','it','its']);
  return (text || '').toLowerCase().match(/\b[a-z]{3,}\b/g)?.filter(w => !stopwords.has(w)) ?? [];
}

function _deriveTitle(cluster) {
  // Use the most frequent significant keyword as the title core
  const freq = {};
  for (const obs of cluster) {
    for (const kw of _keywords(obs.summary)) {
      freq[kw] = (freq[kw] || 0) + 1;
    }
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
  return top.length > 0 ? `Prefer ${top.join('-')}` : 'General observation';
}

function _deriveTags(cluster) {
  const freq = {};
  for (const obs of cluster) {
    for (const kw of _keywords(obs.summary)) {
      freq[kw] = (freq[kw] || 0) + 1;
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

function _deriveContent(cluster) {
  return cluster.map(o => `- ${o.summary}`).join('\n');
}

function _slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function _loadIndex(learningsDir) {
  const p = path.join(learningsDir, INDEX_FILE);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return []; }
}

function _saveIndex(learningsDir, entries) {
  fs.writeFileSync(
    path.join(learningsDir, INDEX_FILE),
    JSON.stringify(entries, null, 2),
    'utf8',
  );
}

module.exports = { compressObservations };

'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Search learnings by tag or content match.
 *
 * @param {string} learningsDir
 * @param {string} query
 * @returns {Array<{ title, tags, content, timestamp }>}
 */
function searchLearnings(learningsDir, query) {
  const indexPath = path.join(learningsDir, 'index.json');
  if (!fs.existsSync(indexPath)) return [];

  const index  = _loadJson(indexPath, []);
  const q      = query.toLowerCase();
  const results = [];

  for (const entry of index) {
    const tagMatch     = entry.tags?.some(t => t.toLowerCase().includes(q));
    const titleMatch   = entry.title?.toLowerCase().includes(q);

    if (tagMatch || titleMatch) {
      results.push(entry);
      continue;
    }

    // Layer 2: check full content of learning file
    const filePath = path.join(learningsDir, entry.file);
    if (fs.existsSync(filePath)) {
      const learning = _loadJson(filePath, {});
      if (learning.content?.toLowerCase().includes(q)) {
        results.push(entry);
      }
    }
  }

  return results;
}

/**
 * Return counts and last-compression timestamp for a memory directory.
 *
 * @param {string} workspaceDir - root workspace (parent of .agents/memory/)
 * @returns {{ observationCount: number, learningCount: number, lastCompressed: string|null }}
 */
function memoryStatus(workspaceDir) {
  const memoryDir    = path.join(workspaceDir, '.agents', 'memory');
  const obsDir       = path.join(memoryDir, 'observations');
  const learningsDir = path.join(memoryDir, 'learnings');

  const observationCount = fs.existsSync(obsDir)
    ? fs.readdirSync(obsDir).filter(f => f.endsWith('.json')).length
    : 0;

  const indexPath = path.join(learningsDir, 'index.json');
  if (!fs.existsSync(indexPath)) {
    return { observationCount, learningCount: 0, lastCompressed: null };
  }

  const index        = _loadJson(indexPath, []);
  const learningCount = index.length;
  const lastCompressed = index.length > 0
    ? index.map(e => e.timestamp).sort().at(-1)
    : null;

  return { observationCount, learningCount, lastCompressed };
}

/**
 * Score and return the top-N learnings most relevant to the given context tags.
 *
 * @param {string} workspaceDir
 * @param {{ contextTags: string[], topN?: number }} options
 * @returns {Array<{ title, tags, content, timestamp }>}
 */
function injectLearnings(workspaceDir, { contextTags = [], topN = 3 } = {}) {
  const learningsDir = path.join(workspaceDir, '.agents', 'memory', 'learnings');
  const indexPath    = path.join(learningsDir, 'index.json');
  if (!fs.existsSync(indexPath)) return [];

  const index = _loadJson(indexPath, []);
  const lowerTags = contextTags.map(t => t.toLowerCase());

  const scored = index.map(entry => {
    const entryTags = (entry.tags || []).map(t => t.toLowerCase());
    const score = entryTags.filter(t => lowerTags.includes(t)).length;
    return { ...entry, score };
  });

  return scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

function _loadJson(filePath, fallback) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

module.exports = { searchLearnings, memoryStatus, injectLearnings };

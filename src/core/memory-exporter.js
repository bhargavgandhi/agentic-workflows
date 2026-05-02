'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Export a learning from .agents/memory/learnings/ into a new SKILL.md.
 *
 * @param {string} workspaceDir
 * @param {string} learningName  - slug name matching the learning title or filename stem
 * @param {string} skillsDir     - destination directory for the new skill folder
 * @param {{ force?: boolean }}  - force overwrites existing SKILL.md
 */
function exportLearning(workspaceDir, learningName, skillsDir, { force = false } = {}) {
  const learningsDir = path.join(workspaceDir, '.agents', 'memory', 'learnings');
  const learning     = _findLearning(learningsDir, learningName);

  if (!learning) {
    throw new Error(`Learning "${learningName}" not found in ${learningsDir}`);
  }

  const skillDir = path.join(skillsDir, learningName);
  const skillMd  = path.join(skillDir, 'SKILL.md');

  if (fs.existsSync(skillMd) && !force) return;

  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(skillMd, _scaffold(learningName, learning), 'utf8');
}

// ── private ───────────────────────────────────────────────────────────────────

function _findLearning(learningsDir, name) {
  const indexPath = path.join(learningsDir, 'index.json');
  if (!fs.existsSync(indexPath)) return null;

  const index = _loadJson(indexPath, []);
  const slug  = _slug(name);

  const entry = index.find(e =>
    _slug(e.title) === slug || e.file === `${name}.json` || e.file === name,
  );
  if (!entry) return null;

  return _loadJson(path.join(learningsDir, entry.file), null);
}

function _scaffold(name, learning) {
  const tags    = (learning.tags || []).join(', ');
  const content = learning.content || '';

  return `---
name: ${name}
description: ${learning.title || name}
version: 1.0.0
category: learned
tags: [${tags}]
---

## 1. Trigger Conditions

Invoke this skill when working on tasks related to: ${tags || name}.

## 2. Prerequisites

- Familiarity with the patterns described below.

## 3. Steps

${content}

## 4. Anti-Rationalization Table

| Excuse | Rebuttal |
|--------|---------|
| "I'll skip this pattern for now" | This pattern was learned from real session observations — skipping it repeats past mistakes. |

## 5. Red Flags

- Ignoring the patterns documented in Section 3.
- Applying this skill outside its trigger conditions.

## 6. Verification Gate

- [ ] The pattern from Section 3 was followed
- [ ] Output matches expected behaviour for this skill's trigger condition

## 7. References

- Exported from memory learning: \`${name}\`
- Original tags: ${tags}
`;
}

function _slug(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function _loadJson(filePath, fallback) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

module.exports = { exportLearning };

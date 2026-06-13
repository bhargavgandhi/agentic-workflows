'use strict';

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const SUBAGENT_NAMES = ['code-review-analyzer', 'security-auditor', 'test-coverage-analyzer'];

function _hash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * Compare .agents/subagents/*.md (package source) against .claude/agents/*.md
 * (installed) using content hashes — subagents aren't versioned like skills,
 * so drift is detected by hash mismatch rather than a `.version` file.
 *
 * @param {string} sourceDir    - path to .agents/subagents/
 * @param {string} installedDir - path to .claude/agents/
 * @returns {{
 *   hasDrift: boolean,
 *   issues: Array<{ type: 'missing'|'outdated', subagent: string, details: string }>
 * }}
 */
function detectSubagentDrift(sourceDir, installedDir) {
  const issues = [];

  for (const name of SUBAGENT_NAMES) {
    const sourceFile = path.join(sourceDir, `${name}.md`);
    const sourceHash = _hash(sourceFile);
    if (!sourceHash) continue; // source doesn't ship this subagent — nothing to compare

    const installedFile = path.join(installedDir, `${name}.md`);
    const installedHash = _hash(installedFile);

    if (!installedHash) {
      issues.push({
        type: 'missing',
        subagent: name,
        details: `${name}.md not installed in .claude/agents/`,
      });
    } else if (installedHash !== sourceHash) {
      issues.push({
        type: 'outdated',
        subagent: name,
        details: `${name}.md differs from package source — re-run install to update`,
      });
    }
  }

  return { hasDrift: issues.length > 0, issues };
}

module.exports = { detectSubagentDrift, SUBAGENT_NAMES };

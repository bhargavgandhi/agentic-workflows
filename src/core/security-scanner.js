'use strict';

const fs   = require('fs');
const path = require('path');

const RULES = require('./scan-rules.json');

const IGNORE_PREFIX = '# agents-skills ignore:';
const DEFAULT_SEVERITIES = ['HIGH'];

/**
 * Scan a single file for rule violations.
 *
 * @param {string} filePath
 * @param {{ severities?: string[] }} [opts]
 * @returns {Array<{ rule, severity, file, line, match, hint }>}
 */
function scanFile(filePath, opts = {}) {
  if (!fs.existsSync(filePath)) return [];

  const severities = opts.severities || DEFAULT_SEVERITIES;
  const lines      = fs.readFileSync(filePath, 'utf8').split('\n');
  const findings   = [];

  for (const { rule, severity, patterns, fileCheck, hint } of RULES) {
    if (!severities.includes(severity)) continue;

    if (fileCheck === 'missing-verification-gate') {
      const content = lines.join('\n');
      if (!/##\s+Verification Gate/i.test(content)) {
        findings.push({ rule, severity, file: filePath, line: 1, match: 'missing section', hint });
      }
      continue;
    }

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(regex);
        if (!match) continue;

        // Check the preceding line for an ignore directive
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        if (prevLine.startsWith(IGNORE_PREFIX)) {
          const ignoredRule = prevLine.slice(IGNORE_PREFIX.length).trim();
          if (ignoredRule === rule) continue;
        }

        findings.push({ rule, severity, file: filePath, line: i + 1, match: match[0], hint });
      }
    }
  }

  return findings;
}

/**
 * Scan all SKILL.md files inside a skills directory.
 *
 * @param {string} skillsDir
 * @param {{ severities?: string[] }} [opts]
 * @returns {Array<{ rule, severity, file, line, match, hint }>}
 */
function scanSkills(skillsDir, opts = {}) {
  if (!fs.existsSync(skillsDir)) return [];

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(e => e.isDirectory());

  const findings = [];
  for (const entry of entries) {
    const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      findings.push(...scanFile(skillMd, opts));
    }
  }

  return findings;
}

module.exports = { scanFile, scanSkills };

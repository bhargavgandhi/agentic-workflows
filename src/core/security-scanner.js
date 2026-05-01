'use strict';

const fs   = require('fs');
const path = require('path');

const RULES = require('./scan-rules.json');

/**
 * Scan a single file for HIGH-severity rule violations.
 *
 * @param {string} filePath - absolute path to the file
 * @returns {Array<{ rule, severity, file, line, match, hint }>}
 */
function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return [];

  const lines    = fs.readFileSync(filePath, 'utf8').split('\n');
  const findings = [];

  for (const { rule, severity, patterns, hint } of RULES) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(regex);
        if (match) {
          findings.push({
            rule,
            severity,
            file: filePath,
            line: i + 1,
            match: match[0],
            hint,
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Scan all SKILL.md files inside a skills directory.
 *
 * @param {string} skillsDir - path to .agents/skills/
 * @returns {Array<{ rule, severity, file, line, match, hint }>}
 */
function scanSkills(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];

  const findings = [];

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(e => e.isDirectory());

  for (const entry of entries) {
    const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      findings.push(...scanFile(skillMd));
    }
  }

  return findings;
}

module.exports = { scanFile, scanSkills };

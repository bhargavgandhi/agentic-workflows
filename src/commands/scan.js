'use strict';

const path = require('path');
const pc   = require('picocolors');

const { scanSkills } = require('../core/security-scanner');

async function scanCommand(args) {
  const skillsDir = path.join(process.cwd(), '.agents', 'skills');

  console.log('');
  console.log(pc.bgRed(pc.white(' 🔍 agents-skills scan ')));
  console.log('');

  const findings = scanSkills(skillsDir);

  if (findings.length === 0) {
    console.log(pc.green('  ✓ No HIGH-severity findings detected.'));
    console.log('');
    return;
  }

  const bySeverity = { HIGH: [], MEDIUM: [], LOW: [] };
  for (const f of findings) {
    (bySeverity[f.severity] || bySeverity.HIGH).push(f);
  }

  for (const [severity, items] of Object.entries(bySeverity)) {
    if (items.length === 0) continue;

    const colour = severity === 'HIGH' ? pc.red : severity === 'MEDIUM' ? pc.yellow : pc.dim;
    console.log(colour(`  ${severity} (${items.length})`));

    for (const f of items) {
      const relPath = path.relative(process.cwd(), f.file);
      console.log(colour(`    [${severity}] ${f.rule}  ${relPath}:${f.line}  ${f.match}`));
      console.log(pc.dim(`           ↳ ${f.hint}`));
    }
    console.log('');
  }

  console.log(pc.red(`  ${findings.length} finding${findings.length === 1 ? '' : 's'} detected. Fix before shipping.`));
  console.log('');

  process.exitCode = 1;
}

module.exports = { scanCommand };

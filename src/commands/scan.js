'use strict';

const path = require('path');
const pc   = require('picocolors');

const { scanSkills } = require('../core/security-scanner');

async function scanCommand(args) {
  const strict    = args.includes('--strict');
  const severities = strict ? ['HIGH', 'MEDIUM', 'LOW'] : ['HIGH'];
  const skillsDir  = path.join(process.cwd(), '.agents', 'skills');

  console.log('');
  console.log(pc.bgRed(pc.white(' 🔍 agents-skills scan ')));
  if (strict) console.log(pc.dim('  --strict: MEDIUM and LOW rules active'));
  console.log('');

  const findings = scanSkills(skillsDir, { severities });

  if (findings.length === 0) {
    const label = strict ? 'No findings detected.' : 'No HIGH-severity findings detected.';
    console.log(pc.green(`  ✓ ${label}`));
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

  const highCount = bySeverity.HIGH.length;
  if (highCount > 0) {
    console.log(pc.red(`  ${highCount} HIGH finding${highCount === 1 ? '' : 's'} detected. Fix before shipping.`));
    console.log('');
    process.exitCode = 1;
  } else {
    const total = findings.length;
    console.log(pc.yellow(`  ${total} finding${total === 1 ? '' : 's'} detected (no HIGH). Review before shipping.`));
    console.log('');
  }
}

module.exports = { scanCommand };

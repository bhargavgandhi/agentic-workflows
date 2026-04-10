'use strict';

const pc = require('picocolors');
const { isEnabled, enable, disable, readEvents, buildReport, TELEMETRY_FILE } = require('../core/telemetry');

/**
 * `agents-skills telemetry [on|off|status|report]`
 *
 *   agents-skills telemetry on       → Enable telemetry
 *   agents-skills telemetry off      → Disable telemetry
 *   agents-skills telemetry status   → Show state + recent events
 *   agents-skills telemetry report   → Usage summary dashboard
 */
async function telemetryCommand(args = []) {
  const subcommand = args.find(a => !a.startsWith('-')) || 'status';

  switch (subcommand) {
    case 'on':     return _enableTelemetry();
    case 'off':    return _disableTelemetry();
    case 'report': return _showReport();
    case 'status':
    default:       return _showStatus();
  }
}

// ── Subcommand handlers ────────────────────────────────────────────────────────

function _enableTelemetry() {
  enable();
  console.log('');
  console.log(pc.green('  ✅ Telemetry enabled.'));
  console.log(pc.dim('  Usage data is stored locally in ~/.agents-skills/telemetry.jsonl'));
  console.log(pc.dim('  No data is sent externally. Run `agents-skills telemetry off` to disable.'));
  console.log('');
}

function _disableTelemetry() {
  disable();
  console.log('');
  console.log(pc.green('  ✅ Telemetry disabled.'));
  console.log(pc.dim('  Run `agents-skills telemetry on` to re-enable.'));
  console.log('');
}

function _showStatus() {
  const enabled = isEnabled();
  const events  = readEvents(10);

  console.log('');
  console.log(pc.bold('  📊 Telemetry Status'));
  console.log('');
  console.log(`  Status: ${enabled ? pc.green('enabled') : pc.dim('disabled')}`);

  if (enabled) {
    console.log(`  Log:    ${pc.dim(TELEMETRY_FILE)}`);
  }

  console.log('');

  if (events.length > 0) {
    console.log(pc.bold('  Recent Events:'));
    for (const e of events.slice(0, 10)) {
      const ts = new Date(e.ts).toLocaleString();
      const detail = e.skill ? ` (${e.skill})` : e.recipe ? ` (${e.recipe})` : '';
      console.log(`  ${pc.dim(ts.padEnd(22))} ${e.event}${pc.cyan(detail)}`);
    }
  } else {
    console.log(pc.dim('  No events recorded yet.'));
  }

  console.log('');
  console.log(pc.dim('  Commands:'));
  console.log(pc.dim('    agents-skills telemetry on      → Enable'));
  console.log(pc.dim('    agents-skills telemetry off     → Disable'));
  console.log(pc.dim('    agents-skills telemetry report  → Usage summary'));
  console.log('');
}

function _showReport() {
  const report = buildReport(30);

  console.log('');
  console.log(pc.bold('  📈 Usage Report — ' + report.period));
  console.log('');

  // Skills
  if (report.skillInstalls.length > 0) {
    console.log(pc.bold('  Most Used Skills:'));
    report.skillInstalls.slice(0, 5).forEach((s, i) => {
      console.log(`    ${i + 1}. ${s.name.padEnd(28)} ${pc.cyan(`(${s.count} install${s.count > 1 ? 's' : ''})`)}`);
    });
    console.log('');
  }

  // Recipes
  if (report.recipesUsed.length > 0) {
    console.log(pc.bold('  Most Used Recipes:'));
    report.recipesUsed.slice(0, 5).forEach((r, i) => {
      console.log(`    ${i + 1}. ${r.name.padEnd(28)} ${pc.cyan(`(${r.count} use${r.count > 1 ? 's' : ''})`)}`);
    });
    console.log('');
  }

  // Context health
  console.log(pc.bold('  Context Health:'));
  if (report.avgContextPct !== null) {
    const pct = parseFloat(report.avgContextPct);
    const color = pct > 100 ? pc.red : pct > 80 ? pc.yellow : pc.green;
    console.log(`    Avg context usage:   ${color(`${report.avgContextPct}% of budget`)}`);
  }
  console.log(`    Compactions:         ${report.compactions}`);
  console.log(`    Doctor runs:         ${report.doctorRuns}`);
  console.log(`    Total events:        ${report.totalEvents}`);
  console.log('');

  if (report.totalEvents === 0) {
    console.log(pc.dim('  No events recorded. Enable telemetry with `agents-skills telemetry on`'));
    console.log('');
  }
}

module.exports = { telemetryCommand };

#!/usr/bin/env node

const path = require('path');
const os = require('os');
const clack = require('@clack/prompts');
const picocolors = require('picocolors');

const { AntigravityAdapter } = require('../src/adapters/antigravity');
const { VSCodeAdapter }      = require('../src/adapters/vscode');
const { CursorAdapter }      = require('../src/adapters/cursor');
const { ClaudeAdapter }      = require('../src/adapters/claude');

const SOURCE_DIR = path.join(__dirname, '..', '.agents');

const ADAPTERS = [
  new AntigravityAdapter(),
  new VSCodeAdapter(),
  new CursorAdapter(),
  new ClaudeAdapter(),
];

async function main() {
  console.log('');
  clack.intro(picocolors.bgCyan(picocolors.black(' 🤖 Agentic Workflows Setup ')));

  // ── Step 1: Scope ──────────────────────────────────────────────────────
  const scope = await clack.select({
    message: 'Where do you want to install the agent files?',
    options: [
      { value: 'local',  label: 'Local Workspace', hint: 'current directory' },
      { value: 'global', label: 'Global',           hint: `user home: ${os.homedir()}` },
    ],
  });
  if (clack.isCancel(scope)) { clack.cancel('Cancelled.'); process.exit(0); }

  const baseDir = scope === 'global' ? os.homedir() : process.cwd();

  // ── Step 2: IDE ─────────────────────────────────────────────────────────
  // Auto-detect available IDEs in the workspace
  const detected = ADAPTERS
    .filter(a => a.detect(baseDir))
    .map(a => a.name);

  if (detected.length > 0) {
    clack.note(
      `Detected: ${detected.join(', ')}`,
      'Auto-detected IDEs in this workspace'
    );
  }

  const ideOptions = ADAPTERS.map(a => ({
    value: a.name,
    label: a.name,
    // Show a hint for detected IDEs but do NOT pre-select them
    hint: detected.includes(a.name) ? '✓ already configured' : '',
  }));

  const selectedIDEs = await clack.multiselect({
    message: 'Which IDEs do you want to install agent files for?',
    options: ideOptions,
    required: true,
  });
  if (clack.isCancel(selectedIDEs)) { clack.cancel('Cancelled.'); process.exit(0); }

  // ── Execute adapters ────────────────────────────────────────────────────
  const spinner = clack.spinner();

  for (const ideName of selectedIDEs) {
    const adapter = ADAPTERS.find(a => a.name === ideName);
    spinner.start(`Installing for ${ideName}...`);
    try {
      await adapter.install(SOURCE_DIR, baseDir);
      spinner.stop(picocolors.green(`✓ ${ideName} installed`));
    } catch (err) {
      spinner.stop(picocolors.red(`✗ ${ideName} failed: ${err.message}`));
    }
  }

  clack.outro(picocolors.green('✅ All done! Agent files are set up.'));
}

main().catch(err => {
  clack.log.error(err.message);
  process.exit(1);
});

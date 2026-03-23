#!/usr/bin/env node

const path = require('path');
const os   = require('os');
const fs   = require('fs');
const clack       = require('@clack/prompts');
const picocolors  = require('picocolors');

const { AntigravityAdapter } = require('../src/adapters/antigravity');
const { VSCodeAdapter }      = require('../src/adapters/vscode');
const { CursorAdapter }      = require('../src/adapters/cursor');
const { ClaudeAdapter }      = require('../src/adapters/claude');
const { smartCopyFolder }    = require('../src/utils/installer');

const SOURCE_DIR  = path.join(__dirname, '..', '.agents');
const SKILLS_DIR  = path.join(__dirname, '..', 'skills');
const SKILLS_JSON = path.join(__dirname, '..', 'skills.json');

const ADAPTERS = [
  new AntigravityAdapter(),
  new VSCodeAdapter(),
  new CursorAdapter(),
  new ClaudeAdapter(),
];

// ── `npx agents-skills add <skill-name>` ────────────────────────────────────

async function installSkill(skillName) {
  clack.intro(picocolors.bgCyan(picocolors.black(' 🤖 Skill Installer ')));

  // 1. Load manifest and validate
  if (!fs.existsSync(SKILLS_JSON)) {
    clack.log.error('skills.json not found. Is this package correctly installed?');
    process.exit(1);
  }
  const { skills } = JSON.parse(fs.readFileSync(SKILLS_JSON, 'utf8'));

  if (!skills.includes(skillName)) {
    clack.log.error(`Unknown skill: "${skillName}"`);
    clack.log.info(`Available skills:\n${skills.map(s => `  • ${s}`).join('\n')}`);
    process.exit(1);
  }

  const skillSrc = path.join(SKILLS_DIR, skillName);
  if (!fs.existsSync(skillSrc)) {
    clack.log.error(`Skill source not found: ${skillSrc}\nTry reinstalling the package.`);
    process.exit(1);
  }

  // 2. Ask scope
  const scope = await clack.select({
    message: `Install "${skillName}" skill where?`,
    options: [
      { value: 'local',  label: 'Local Workspace', hint: 'current directory' },
      { value: 'global', label: 'Global',           hint: `user home: ${os.homedir()}` },
    ],
  });
  if (clack.isCancel(scope)) { clack.cancel('Cancelled.'); process.exit(0); }

  const baseDir = scope === 'global' ? os.homedir() : process.cwd();

  // 3. Ask which IDE(s)
  const detected = ADAPTERS.filter(a => a.detect(baseDir)).map(a => a.name);

  if (detected.length > 0) {
    clack.note(`Detected: ${detected.join(', ')}`, 'Auto-detected IDEs in this workspace');
  }

  const selectedIDEs = await clack.multiselect({
    message: `Which IDEs should receive the "${skillName}" skill?`,
    options: ADAPTERS.map(a => ({
      value: a.name,
      label: a.name,
      hint: detected.includes(a.name) ? '✓ already configured' : '',
    })),
    required: true,
  });
  if (clack.isCancel(selectedIDEs)) { clack.cancel('Cancelled.'); process.exit(0); }

  // 4. Install into each selected IDE via adapter
  for (const ideName of selectedIDEs) {
    const adapter = ADAPTERS.find(a => a.name === ideName);
    clack.log.step(`Installing into ${ideName}...`);
    await adapter.installSkill(skillSrc, skillName, baseDir, scope, { clack });
  }

  clack.outro(picocolors.green(`✅ Skill "${skillName}" installed into: ${selectedIDEs.join(', ')}`));
}

// ── Full interactive install (`npx agents-skills`) ──────────────────────────

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
      await adapter.install(SOURCE_DIR, baseDir, scope, { clack });
      spinner.stop(picocolors.green(`✓ ${ideName} installed`));
    } catch (err) {
      spinner.stop(picocolors.red(`✗ ${ideName} failed: ${err.message}`));
    }
  }

  clack.outro(picocolors.green('✅ All done! Agent files are set up.'));
}

// ── Entry point ─────────────────────────────────────────────────────────────

const [,, command, skillName] = process.argv;

if (command === 'add') {
  if (!skillName) {
    // List available skills
    const { skills } = JSON.parse(fs.readFileSync(SKILLS_JSON, 'utf8'));
    console.log('\nAvailable skills:');
    skills.forEach(s => console.log(`  • ${s}`));
    console.log('\nUsage: npx agents-skills add <skill-name>\n');
    process.exit(0);
  }
  installSkill(skillName).catch(err => {
    clack.log.error(err.message);
    process.exit(1);
  });
} else {
  main().catch(err => {
    clack.log.error(err.message);
    process.exit(1);
  });
}

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const clack      = require('@clack/prompts');
const pc         = require('picocolors');

const { SkillRegistry }      = require('../core/skill-registry');
const { DependencyResolver } = require('../core/dependency-resolver');

const SKILLS_DIR  = path.join(__dirname, '..', '..', 'skills');
const SOURCE_DIR  = path.join(__dirname, '..', '..', '.agents');
const SKILLS_JSON = path.join(__dirname, '..', '..', 'skills.json');

const registry = new SkillRegistry(SKILLS_JSON, SKILLS_DIR);

// Bundle definitions — resolved from skills.json `bundles` map
const BUNDLES_JSON = require(SKILLS_JSON);
const BUNDLE_SKILLS = BUNDLES_JSON.bundles || {};

// Add-on skill groups surfaced as progressive questions
const ADDONS = [
  {
    key:      'mobile',
    label:    'Mobile (React Native)',
    hint:     'Expo, React Navigation, styling',
    skills:   ['react-native'],
  },
  {
    key:      'cms',
    label:    'CMS (Payload CMS)',
    hint:     'PayloadCMS v3 — collections, globals, Next.js',
    skills:   ['payload-cms'],
  },
  {
    key:      'firebase',
    label:    'Firebase',
    hint:     'Auth, Firestore, Storage — modular SDK',
    skills:   ['firebase-setup'],
  },
  {
    key:      'testing',
    label:    'E2E Testing (Playwright)',
    hint:     'Browser automation, POM, CI integration',
    skills:   ['playwright'],
  },
];

/**
 * Role-based install wizard — the default no-args install flow.
 *
 * Step 1: Scope (local / global)
 * Step 2: IDE selection (auto-detected highlighted)
 * Step 3: Role / Bundle  (⭐ Frontend / Backend / Fullstack / Full)
 * Step 4: Add-ons        (mobile? CMS? Firebase? Testing?) — skipped for Full
 * Step 5: Install + write .version files
 */
async function _roleWizard(ADAPTERS) {
  console.log('');
  clack.intro(pc.bgCyan(pc.black(' 🤖 agents-skills v3 — Install Wizard ')));

  // ── Step 1: Scope ─────────────────────────────────────────────────────────
  const scope = await clack.select({
    message: 'Where do you want to install the agent files?',
    options: [
      { value: 'local',  label: 'Local Workspace', hint: 'current directory' },
      { value: 'global', label: 'Global',           hint: `user home: ${os.homedir()}` },
    ],
  });
  if (clack.isCancel(scope)) { clack.cancel('Cancelled.'); process.exit(0); }

  const baseDir  = scope === 'global' ? os.homedir() : process.cwd();

  // ── Step 2: IDE selection ──────────────────────────────────────────────────
  const detected = ADAPTERS.filter(a => a.detect(baseDir)).map(a => a.name);
  if (detected.length > 0) {
    clack.note(`Detected: ${detected.join(', ')}`, 'Auto-detected IDEs in this workspace');
  }

  const selectedIDEs = await clack.multiselect({
    message: 'Which IDEs do you want to install agent files for?',
    options: ADAPTERS.map(a => ({
      value: a.name,
      label: a.name,
      hint:  detected.includes(a.name) ? '✓ detected' : '',
    })),
    required: true,
  });
  if (clack.isCancel(selectedIDEs)) { clack.cancel('Cancelled.'); process.exit(0); }

  // ── Step 3: Role / Bundle ─────────────────────────────────────────────────
  const role = await clack.select({
    message: 'What are you building? Pick the bundle that fits your role:',
    options: [
      {
        value: 'frontend',
        label: '⭐ Frontend',
        hint:  'Core Skills + React, design, and API integration',
      },
      {
        value: 'backend',
        label: '   Backend',
        hint:  'Core Skills + Node.js, GraphQL, and database patterns',
      },
      {
        value: 'fullstack',
        label: '   Fullstack',
        hint:  'Core Skills + frontend + backend tech skills',
      },
      {
        value: 'full',
        label: '   Full',
        hint:  'Everything — all Core, Optional, and Tech Skills',
      },
    ],
  });
  if (clack.isCancel(role)) { clack.cancel('Cancelled.'); process.exit(0); }

  // Resolve base skill set from bundle definition
  const baseSkills = new Set(BUNDLE_SKILLS[role] || []);

  // ── Step 4: Add-ons (skipped for Full — it already has everything) ─────────
  if (role !== 'full') {
    const addonChoices = await clack.multiselect({
      message: 'Any add-ons? (optional — you can install these later too)',
      options: ADDONS.map(a => ({ value: a.key, label: a.label, hint: a.hint })),
      required: false,
    });
    if (clack.isCancel(addonChoices)) { clack.cancel('Cancelled.'); process.exit(0); }

    for (const key of (addonChoices || [])) {
      const addon = ADDONS.find(a => a.key === key);
      if (addon) addon.skills.forEach(s => baseSkills.add(s));
    }
  }

  clack.note(
    `Role: ${role}  |  Skills: ${baseSkills.size}`,
    'Installing the following bundle'
  );

  // ── Step 5: Install ────────────────────────────────────────────────────────
  const spinner = clack.spinner();
  for (const ideName of selectedIDEs) {
    const adapter = ADAPTERS.find(a => a.name === ideName);
    spinner.start(`Installing for ${ideName}...`);
    try {
      await adapter.install(SOURCE_DIR, baseDir, scope, { clack, skillFilter: baseSkills });
      spinner.stop(pc.green(`✓ ${ideName} installed`));
    } catch (err) {
      spinner.stop(pc.red(`✗ ${ideName} failed: ${err.message}`));
    }
  }

  // Write .version files for installed skills
  const skillsDestDir = path.join(baseDir, '.agents', 'skills');
  if (fs.existsSync(skillsDestDir)) {
    for (const skillName of baseSkills) {
      const skillDir = path.join(skillsDestDir, skillName);
      const meta     = registry.getSkill(skillName);
      if (meta?.version && fs.existsSync(skillDir)) {
        registry.writeVersionFile(skillDir, meta.version);
      }
    }
  }

  clack.outro(pc.green('✅ All done! Agent files are set up.'));
  console.log('');
  console.log(pc.dim('  Next steps:'));
  console.log(pc.dim('    /build-feature         → Full lifecycle: validate → PRD → plan → implement → review → ship'));
  console.log(pc.dim('    /build-quick           → Fast loop: validate → implement → review → ship'));
  console.log(pc.dim('    agents-skills init     → Generate project profile'));
  console.log(pc.dim('    agents-skills doctor   → Verify workspace health'));
  console.log('');
  console.log(pc.dim('  How to invoke slash commands:'));
  console.log(pc.dim('    Claude Code  → type /build-feature in the chat prompt'));
  console.log(pc.dim('    Cursor       → type /build-feature in the AI chat panel'));
  console.log(pc.dim('    VS Code      → @workspace /build-feature'));
  console.log(pc.dim('    Antigravity  → type /build-feature in the prompt bar'));
  console.log('');
}

/**
 * Install a single skill into the selected IDEs.
 * Extracted so it can be called for each skill in a pack.
 */
async function _installOne(skillName, selectedIDEs, baseDir, scope, ADAPTERS) {
  const skillMeta = registry.getSkill(skillName);
  if (!skillMeta) {
    clack.log.error(`Unknown skill: "${skillName}"`);
    return false;
  }

  if (skillMeta.deprecated) {
    clack.log.warn(
      `"${skillName}" is deprecated since v${skillMeta.deprecatedSince}. ` +
      `Use instead: ${skillMeta.replacedBy.join(', ')}`
    );
    const proceed = await clack.confirm({ message: 'Install anyway?', initialValue: false });
    if (clack.isCancel(proceed) || !proceed) return false;
  }

  const skillSrc = path.join(SKILLS_DIR, skillName);
  if (!fs.existsSync(skillSrc)) {
    clack.log.error(`Skill source not found: ${skillSrc}. Try reinstalling the package.`);
    return false;
  }

  for (const ideName of selectedIDEs) {
    const adapter = ADAPTERS.find(a => a.name === ideName);
    clack.log.step(`Installing "${skillName}" into ${ideName}...`);
    await adapter.installSkill(skillSrc, skillName, baseDir, scope, { clack });

    const destSkillDir = adapter.skillDir(baseDir, scope, skillName);
    if (skillMeta.version && fs.existsSync(destSkillDir)) {
      registry.writeVersionFile(destSkillDir, skillMeta.version);
    }
  }

  return true;
}

/**
 * `agents-skills install <skill|pack> [<skill|pack> ...]`
 *
 * Installs one or more skills or pack aliases. Pack aliases are resolved to
 * their constituent skills before installation.
 */
async function installCommand(args, { ADAPTERS } = {}) {
  // Allow test injection; default to real adapters
  if (!ADAPTERS) {
    const { AntigravityAdapter } = require('../adapters/antigravity');
    const { VSCodeAdapter }      = require('../adapters/vscode');
    const { CursorAdapter }      = require('../adapters/cursor');
    const { ClaudeAdapter }      = require('../adapters/claude');
    ADAPTERS = [
      new AntigravityAdapter(),
      new VSCodeAdapter(),
      new CursorAdapter(),
      new ClaudeAdapter(),
    ];
  }

  const targets = args.filter(a => !a.startsWith('-'));
  const listOnly = args.includes('--list');

  if (targets.length === 0 && !listOnly) {
    // No skill/pack specified — launch the role-based install wizard
    return _roleWizard(ADAPTERS);
  }

  if (listOnly || targets.length === 0) {
    const all   = registry.allSkillNames();
    const packs = registry.allPacks();
    console.log('\n' + pc.bold('Available skills:'));
    all.forEach(s => {
      const meta = registry.getSkill(s);
      const badge = meta.category === 'process'
        ? pc.cyan('[process]')
        : pc.dim('[tech]   ');
      const opt = meta.optional ? pc.dim('opt') : pc.green('req');
      console.log(`  ${badge} ${opt}  ${s}`);
    });
    if (packs.length > 0) {
      console.log('\n' + pc.bold('Pack aliases:'));
      packs.forEach(p => console.log(`  ${pc.magenta('[pack]')}      ${p.name}  ${pc.dim('→ ' + p.skills.join(', '))}`));
    }
    console.log('\nUsage: agents-skills install <skill-name|pack-name>\n');
    return;
  }

  clack.intro(pc.bgCyan(pc.black(' 🤖 Skill Installer ')));

  // Resolve targets: expand packs → individual skills, deduplicate
  const skillsToInstall = [];
  const seen    = new Set();
  const unknown = [];

  for (const target of targets) {
    if (registry.isPack(target)) {
      const packSkills = registry.resolvePack(target);
      clack.log.info(`Pack "${target}" → ${packSkills.join(', ')}`);
      for (const s of packSkills) {
        if (!seen.has(s)) { seen.add(s); skillsToInstall.push(s); }
      }
    } else if (registry.getSkill(target)) {
      if (!seen.has(target)) { seen.add(target); skillsToInstall.push(target); }
    } else {
      unknown.push(target);
    }
  }

  if (unknown.length > 0) {
    unknown.forEach(t => clack.log.error(`Unknown skill or pack: "${t}"`));
    clack.log.info('Run `agents-skills install` with no arguments to see all available skills and packs.');
    if (skillsToInstall.length === 0) {
      clack.cancel('Nothing to install.');
      process.exit(1);
    }
    clack.log.warn(`Skipping ${unknown.length} unknown target(s). Installing the rest.`);
  }

  // Resolve dependencies for all collected skills
  const installedSkillsDir = path.join(process.cwd(), '.agents', 'skills');
  const resolver           = new DependencyResolver(installedSkillsDir);
  const allDeps = new Set();
  for (const skillName of skillsToInstall) {
    const deps = resolver.readDepsFromSkill(skillName);
    deps.forEach(d => { if (!seen.has(d)) allDeps.add(d); });
  }

  if (allDeps.size > 0) {
    const depList = [...allDeps].join(', ');
    clack.note(depList, 'Required dependencies');
    const installDeps = await clack.confirm({
      message: `Install ${allDeps.size} required dependenc${allDeps.size === 1 ? 'y' : 'ies'} too?`,
      initialValue: true,
    });
    if (clack.isCancel(installDeps)) { clack.cancel('Cancelled.'); process.exit(0); }
    if (installDeps) {
      allDeps.forEach(d => { if (!seen.has(d)) { seen.add(d); skillsToInstall.unshift(d); } });
    }
  }

  // Scope
  const scope = await clack.select({
    message: `Install ${skillsToInstall.length} skill(s) where?`,
    options: [
      { value: 'local',  label: 'Local Workspace', hint: 'current directory' },
      { value: 'global', label: 'Global',           hint: `user home: ${os.homedir()}` },
    ],
  });
  if (clack.isCancel(scope)) { clack.cancel('Cancelled.'); process.exit(0); }

  const baseDir = scope === 'global' ? os.homedir() : process.cwd();

  // IDE selection
  const detected = ADAPTERS.filter(a => a.detect(baseDir)).map(a => a.name);
  if (detected.length > 0) {
    clack.note(`Detected: ${detected.join(', ')}`, 'Auto-detected IDEs');
  }

  const selectedIDEs = await clack.multiselect({
    message: 'Which IDEs should receive these skills?',
    options: ADAPTERS.map(a => ({
      value: a.name,
      label: a.name,
      hint:  detected.includes(a.name) ? '✓ detected' : '',
    })),
    required: true,
  });
  if (clack.isCancel(selectedIDEs)) { clack.cancel('Cancelled.'); process.exit(0); }

  // Install each skill
  let installed = 0;
  for (const skillName of skillsToInstall) {
    const ok = await _installOne(skillName, selectedIDEs, baseDir, scope, ADAPTERS);
    if (ok) installed++;
  }

  clack.outro(
    pc.green(`✅ ${installed}/${skillsToInstall.length} skill(s) installed into: ${selectedIDEs.join(', ')}`)
  );
}

module.exports = { installCommand };

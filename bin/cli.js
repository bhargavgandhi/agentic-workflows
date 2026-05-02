#!/usr/bin/env node

'use strict';

const path = require('path');
const os   = require('os');
const fs   = require('fs');

const clack       = require('@clack/prompts');
const picocolors  = require('picocolors');
const pc          = picocolors;

const { AntigravityAdapter } = require('../src/adapters/antigravity');
const { VSCodeAdapter }      = require('../src/adapters/vscode');
const { CursorAdapter }      = require('../src/adapters/cursor');
const { ClaudeAdapter }      = require('../src/adapters/claude');
const { smartCopyFolder }    = require('../src/utils/installer');
const { SkillRegistry }      = require('../src/core/skill-registry');
const { DependencyResolver } = require('../src/core/dependency-resolver');
const telemetry              = require('../src/core/telemetry');
const { isFirstRun, markFirstRunDone, get: getConfig } = require('../src/utils/config');

// ── Paths ─────────────────────────────────────────────────────────────────────

const SOURCE_DIR  = path.join(__dirname, '..', '.agents');
const SKILLS_DIR  = path.join(__dirname, '..', 'skills');
const SKILLS_JSON = path.join(__dirname, '..', 'skills.json');

// ── Adapter registry ──────────────────────────────────────────────────────────

const ADAPTERS = [
  new AntigravityAdapter(),
  new VSCodeAdapter(),
  new CursorAdapter(),
  new ClaudeAdapter(),
];

// ── Skill registry (v2) ───────────────────────────────────────────────────────

const registry = new SkillRegistry(SKILLS_JSON, SKILLS_DIR);

// ── First-run telemetry consent ───────────────────────────────────────────────

async function promptTelemetryConsent() {
  if (!isFirstRun()) return;

  console.log('');
  clack.note(
    [
      'agents-skills can collect anonymous usage data to improve',
      'skill recommendations and content quality.',
      '',
      '  • No personal data collected',
      '  • Data stays LOCAL (~/. agents-skills/telemetry.jsonl)',
      '  • Nothing sent externally',
      '  • Change anytime: agents-skills telemetry on|off',
    ].join('\n'),
    '📊 Anonymous Telemetry (opt-in)'
  );

  const consent = await clack.confirm({
    message: 'Enable telemetry?',
    initialValue: false,
  });

  if (!clack.isCancel(consent) && consent) {
    telemetry.enable();
    clack.log.success('Telemetry enabled. Thank you!');
  } else {
    clack.log.info('Telemetry disabled. You can enable it later with `agents-skills telemetry on`');
  }

  markFirstRunDone();
  console.log('');
}

// ── `npx agents-skills add <skill-name>` ─────────────────────────────────────

async function installSkill(skillName) {
  clack.intro(pc.bgCyan(pc.black(' 🤖 Skill Installer ')));

  // 1. Validate skill exists in registry
  if (!fs.existsSync(SKILLS_JSON)) {
    clack.log.error('skills.json not found. Is this package correctly installed?');
    process.exit(1);
  }

  const skillMeta = registry.getSkill(skillName);
  if (!skillMeta) {
    const all = registry.allSkillNames();
    clack.log.error(`Unknown skill: "${skillName}"`);
    clack.log.info(`Available skills:\n${all.map(s => `  • ${s}`).join('\n')}`);
    process.exit(1);
  }

  const skillSrc = path.join(SKILLS_DIR, skillName);
  if (!fs.existsSync(skillSrc)) {
    clack.log.error(`Skill source not found: ${skillSrc}\nTry reinstalling the package.`);
    process.exit(1);
  }

  // 2. Resolve dependencies
  const installedSkillsDir = path.join(process.cwd(), '.agents', 'skills');
  const resolver           = new DependencyResolver(installedSkillsDir);
  const deps               = resolver.readDepsFromSkill(skillName);

  if (deps.length > 0) {
    clack.note(deps.join(', '), `This skill depends on`);
    const installDeps = await clack.confirm({
      message: `Install all ${deps.length} dependencies too?`,
      initialValue: true,
    });
    if (clack.isCancel(installDeps)) { clack.cancel('Cancelled.'); process.exit(0); }
  }

  // 3. Ask scope
  const scope = await clack.select({
    message: `Install "${skillName}" skill where?`,
    options: [
      { value: 'local',  label: 'Local Workspace', hint: 'current directory' },
      { value: 'global', label: 'Global',           hint: `user home: ${os.homedir()}` },
    ],
  });
  if (clack.isCancel(scope)) { clack.cancel('Cancelled.'); process.exit(0); }

  const baseDir = scope === 'global' ? os.homedir() : process.cwd();

  // 4. Ask which IDE(s)
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

  // 5. Install into each selected IDE
  for (const ideName of selectedIDEs) {
    const adapter = ADAPTERS.find(a => a.name === ideName);
    clack.log.step(`Installing into ${ideName}...`);
    await adapter.installSkill(skillSrc, skillName, baseDir, scope, { clack });

    // Write .version file
    const destSkillDir = scope === 'global'
      ? path.join(os.homedir(), '.gemini', 'antigravity', 'skills', skillName)
      : path.join(baseDir, '.agents', 'skills', skillName);
    if (skillMeta.version && fs.existsSync(destSkillDir)) {
      registry.writeVersionFile(destSkillDir, skillMeta.version);
    }
  }

  telemetry.track(telemetry.EVENTS.SKILL_ADDED, { skill: skillName, scope, ides: selectedIDEs });

  clack.outro(pc.green(`✅ Skill "${skillName}" installed into: ${selectedIDEs.join(', ')}`));
}

// ── Full interactive install (`npx agents-skills`) ─────────────────────────────

async function main() {
  console.log('');
  clack.intro(pc.bgCyan(pc.black(' 🤖 Agentic Workflows Setup ')));

  // Step 1: Scope
  const scope = await clack.select({
    message: 'Where do you want to install the agent files?',
    options: [
      { value: 'local',  label: 'Local Workspace', hint: 'current directory' },
      { value: 'global', label: 'Global',           hint: `user home: ${os.homedir()}` },
    ],
  });
  if (clack.isCancel(scope)) { clack.cancel('Cancelled.'); process.exit(0); }

  const baseDir = scope === 'global' ? os.homedir() : process.cwd();

  // Step 2: IDE
  const detected = ADAPTERS.filter(a => a.detect(baseDir)).map(a => a.name);
  if (detected.length > 0) {
    clack.note(`Detected: ${detected.join(', ')}`, 'Auto-detected IDEs in this workspace');
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

  // Execute adapters
  const spinner = clack.spinner();
  for (const ideName of selectedIDEs) {
    const adapter = ADAPTERS.find(a => a.name === ideName);
    spinner.start(`Installing for ${ideName}...`);
    try {
      await adapter.install(SOURCE_DIR, baseDir, scope, { clack });
      spinner.stop(pc.green(`✓ ${ideName} installed`));
    } catch (err) {
      spinner.stop(pc.red(`✗ ${ideName} failed: ${err.message}`));
    }
  }

  // Write .version files for all skills
  const skillsDestDir = scope === 'global'
    ? path.join(os.homedir(), '.gemini', 'antigravity', 'skills')
    : path.join(baseDir, '.agents', 'skills');

  if (fs.existsSync(skillsDestDir)) {
    for (const skillName of registry.allSkillNames()) {
      const skillDir = path.join(skillsDestDir, skillName);
      const meta     = registry.getSkill(skillName);
      if (meta?.version && fs.existsSync(skillDir)) {
        registry.writeVersionFile(skillDir, meta.version);
      }
    }
  }

  telemetry.track(telemetry.EVENTS.FULL_INSTALL, { scope, ides: selectedIDEs });

  clack.outro(pc.green('✅ All done! Agent files are set up.'));
  console.log('');
  console.log(pc.dim('  Next steps:'));
  console.log(pc.dim('    agents-skills init          → Generate project profile'));
  console.log(pc.dim('    agents-skills tokens        → Check context token usage'));
  console.log(pc.dim('    agents-skills doctor        → Verify workspace health'));
  console.log(pc.dim('    agents-skills recipe        → Browse prompt recipes'));
  console.log('');
}

// ── Help text ─────────────────────────────────────────────────────────────────

function showHelp() {
  console.log('');
  console.log(pc.bold('  agents-skills') + pc.dim(' — AI agent scaffolding for any IDE'));
  console.log('');
  console.log(pc.bold('  Commands:'));
  console.log('');
  console.log('    ' + pc.cyan('agents-skills') + pc.dim('                          Full install wizard'));
  console.log('    ' + pc.cyan('agents-skills install') + pc.dim(' <skill|pack>          Install a skill or pack alias'));
  console.log('    ' + pc.cyan('agents-skills install') + pc.dim('                       List all available skills & packs'));
  console.log('    ' + pc.cyan('agents-skills add') + pc.dim(' <skill>                   Install a single skill (legacy alias)'));
  console.log('    ' + pc.cyan('agents-skills list') + pc.dim(' [--registry]              List installed skills (or registry)'));
  console.log('    ' + pc.cyan('agents-skills upgrade') + pc.dim(' [--dry-run]           Upgrade skills to latest versions'));
  console.log('    ' + pc.cyan('agents-skills doctor') + pc.dim('                        Workspace health check'));
  console.log('    ' + pc.cyan('agents-skills init') + pc.dim('                          Generate project profile'));
  console.log('    ' + pc.cyan('agents-skills init --primer') + pc.dim('                 Write .claude/CLAUDE.md from stack + skills'));
  console.log('    ' + pc.cyan('agents-skills scan') + pc.dim(' [--strict]               Scan skills for security findings'));
  console.log('    ' + pc.cyan('agents-skills recipe') + pc.dim(' [name]                Browse and run recipes'));
  console.log('    ' + pc.cyan('agents-skills tokens') + pc.dim(' [--budget|--file]      Token usage breakdown'));
  console.log('    ' + pc.cyan('agents-skills compact') + pc.dim(' [--auto <json>]       Create context snapshot'));
  console.log('    ' + pc.cyan('agents-skills telemetry') + pc.dim(' [on|off|report]     Manage telemetry'));
  console.log('');
  console.log(pc.dim('  Run `agents-skills <command> --help` for command-specific help.'));
  console.log('');
}

// ── Entry point ────────────────────────────────────────────────────────────────

const [,, command, ...rest] = process.argv;

async function run() {
  // First-run telemetry consent (only on install/add commands)
  if (!command || command === 'add' || command === 'install') {
    await promptTelemetryConsent();
  }

  switch (command) {
    case 'add': {
      const skillName = rest[0];
      if (!skillName) {
        const all = registry.allSkillNames();
        console.log('\nAvailable skills:');
        all.forEach(s => console.log(`  • ${s}`));
        console.log('\nUsage: agents-skills add <skill-name>\n');
        process.exit(0);
      }
      await installSkill(skillName);
      break;
    }

    case 'install': {
      const { installCommand } = require('../src/commands/install');
      await installCommand(rest);
      try { telemetry.track(telemetry.EVENTS.SKILL_ADDED, { args: rest }); } catch {}
      try { const { captureObservation } = require('../src/core/memory-capture'); captureObservation({ tool: 'install', outcome: 'success', summary: `install ${rest.join(' ')}` }); } catch {}
      break;
    }

    case 'upgrade': {
      const { upgradeCommand } = require('../src/commands/upgrade');
      await upgradeCommand(rest);
      try { const { captureObservation } = require('../src/core/memory-capture'); captureObservation({ tool: 'upgrade', outcome: 'success', summary: `upgrade ${rest.join(' ')}` }); } catch {}
      break;
    }

    case 'list': {
      const { listCommand } = require('../src/commands/list');
      await listCommand(rest);
      try { telemetry.track(telemetry.EVENTS.DOCTOR_RUN, { command: 'list' }); } catch {}
      try { const { captureObservation } = require('../src/core/memory-capture'); captureObservation({ tool: 'list', outcome: 'success', summary: 'listed installed skills' }); } catch {}
      break;
    }

    case 'doctor': {
      const { doctorCommand } = require('../src/commands/doctor');
      await doctorCommand();
      try { telemetry.track(telemetry.EVENTS.DOCTOR_RUN); } catch {}
      try { const { captureObservation } = require('../src/core/memory-capture'); captureObservation({ tool: 'doctor', outcome: 'success', summary: 'ran doctor health check' }); } catch {}
      break;
    }

    case 'init': {
      const { initCommand } = require('../src/commands/init');
      await initCommand(rest);
      try { telemetry.track(telemetry.EVENTS.PROFILE_GENERATED); } catch {}
      try { const { captureObservation } = require('../src/core/memory-capture'); captureObservation({ tool: 'init', outcome: 'success', summary: `init ${rest.join(' ')}` }); } catch {}
      break;
    }

    case 'recipe': {
      const { recipeCommand } = require('../src/commands/recipe');
      await recipeCommand(rest);
      const recipeName = rest.find(a => !a.startsWith('-'));
      if (recipeName) try { telemetry.track(telemetry.EVENTS.RECIPE_USED, { recipe: recipeName }); } catch {}
      break;
    }

    case 'tokens': {
      const { tokensCommand } = require('../src/commands/tokens');
      await tokensCommand(rest);

      // Track token check with budget utilization
      try {
        const { loadProfileBudget, countDirectoryTokens } = require('../src/core/token-counter');
        const agentsDir = path.join(process.cwd(), '.agents');
        const budget    = loadProfileBudget(process.cwd());
        if (fs.existsSync(agentsDir)) {
          const { total } = countDirectoryTokens(agentsDir);
          const percent   = ((total / budget.budget) * 100).toFixed(1);
          telemetry.track(telemetry.EVENTS.TOKENS_CHECKED, { total, budget: budget.budget, percent });
        }
      } catch { /* non-fatal */ }
      break;
    }

    case 'compact': {
      const { compactCommand } = require('../src/commands/compact');
      await compactCommand(rest);
      try { telemetry.track(telemetry.EVENTS.CONTEXT_COMPACTED); } catch {}
      break;
    }

    case 'scan': {
      const { scanCommand } = require('../src/commands/scan');
      await scanCommand(rest);
      break;
    }

    case 'memory': {
      const { memoryCommand } = require('../src/commands/memory');
      await memoryCommand(rest);
      break;
    }

    case 'telemetry': {
      const { telemetryCommand } = require('../src/commands/telemetry');
      await telemetryCommand(rest);
      break;
    }

    case '--help':
    case '-h':
    case 'help': {
      showHelp();
      break;
    }

    case undefined: {
      await main();
      break;
    }

    default: {
      console.log(pc.red(`\n  Unknown command: "${command}"`));
      showHelp();
      process.exit(1);
    }
  }
}

run().catch(err => {
  clack.log.error(err.message);
  process.exit(1);
});

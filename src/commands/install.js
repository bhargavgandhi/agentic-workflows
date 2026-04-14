'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const clack      = require('@clack/prompts');
const pc         = require('picocolors');

const { SkillRegistry }      = require('../core/skill-registry');
const { DependencyResolver } = require('../core/dependency-resolver');
const { smartCopyFolder }    = require('../utils/installer');

const SKILLS_DIR  = path.join(__dirname, '..', '..', 'skills');
const SKILLS_JSON = path.join(__dirname, '..', '..', 'skills.json');

const registry = new SkillRegistry(SKILLS_JSON, SKILLS_DIR);

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

  if (targets.length === 0) {
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

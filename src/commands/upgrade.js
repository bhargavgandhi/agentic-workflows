'use strict';

const fs   = require('fs');
const path = require('path');

const clack = require('@clack/prompts');
const pc    = require('picocolors');

const { SkillRegistry } = require('../core/skill-registry');

const SKILLS_DIR  = path.join(__dirname, '..', '..', 'skills');
const SKILLS_JSON = path.join(__dirname, '..', '..', 'skills.json');

const PKG_SCHEMA_VERSION = '3.0.0';

/**
 * `agents-skills upgrade [--dry-run]`
 *
 * Upgrades installed skills to match the package version.
 *
 * Minor upgrade (same major schema): overwrites outdated skill files, updates .version.
 * Major upgrade (schema version change): shows full migration diff, confirms destructive
 * changes, then executes — add new mandatory skills, update existing, remove deprecated.
 */
async function upgradeCommand(args) {
  const dryRun = args.includes('--dry-run');

  clack.intro(pc.bgCyan(pc.black(dryRun ? ' 🤖 Upgrade (dry run) ' : ' 🤖 Skill Upgrader ')));

  // ── Detect workspace ───────────────────────────────────────────────────────

  const agentsDir  = path.join(process.cwd(), '.agents');
  const skillsDir  = path.join(agentsDir, 'skills');

  if (!fs.existsSync(agentsDir)) {
    clack.log.error('No .agents/ directory found. Run `agents-skills install` first.');
    process.exit(1);
  }

  const pkgRegistry  = new SkillRegistry(SKILLS_JSON, SKILLS_DIR);
  const installedSchemaVersion = _readInstalledSchemaVersion(skillsDir);

  const isMajorUpgrade = installedSchemaVersion !== null &&
    _majorVersion(installedSchemaVersion) < _majorVersion(PKG_SCHEMA_VERSION);

  // ── Build migration plan ───────────────────────────────────────────────────

  const plan = _buildMigrationPlan(pkgRegistry, skillsDir, installedSchemaVersion);

  if (plan.update.length === 0 && plan.add.length === 0 && plan.remove.length === 0) {
    clack.log.success('All skills are already up to date.');
    clack.outro('Nothing to do.');
    return;
  }

  // ── Show migration diff ────────────────────────────────────────────────────

  console.log('');
  console.log(pc.bold('  Migration plan:'));
  console.log('');

  if (plan.update.length > 0) {
    console.log(pc.cyan(`  ✓ Will UPDATE (${plan.update.length} skills):`));
    plan.update.forEach(s => console.log(
      `      ${s.name}  ${pc.dim(`v${s.installedVersion} → v${s.latestVersion}`)}`
    ));
    console.log('');
  }

  if (plan.add.length > 0) {
    console.log(pc.green(`  + Will ADD (${plan.add.length} new skills):`));
    plan.add.forEach(s => {
      const meta  = pkgRegistry.getSkill(s);
      const badge = meta?.optional === false ? pc.cyan('[mandatory]') : pc.dim('[optional] ');
      console.log(`      ${badge}  ${s}`);
    });
    console.log('');
  }

  if (plan.remove.length > 0) {
    console.log(pc.red(`  ✗ Will REMOVE (${plan.remove.length} deprecated skills):`));
    plan.remove.forEach(s => {
      const meta = pkgRegistry.getSkill(s) || {};
      const replacedBy = meta.replacedBy?.length > 0
        ? ` → replaced by: ${meta.replacedBy.join(', ')}`
        : '';
      console.log(`      ${s}${pc.dim(replacedBy)}`);
    });
    console.log('');
  }

  if (dryRun) {
    clack.outro(pc.dim('Dry run complete — no changes made. Remove --dry-run to apply.'));
    return;
  }

  // ── Confirm destructive changes ────────────────────────────────────────────

  if (plan.remove.length > 0) {
    const confirm = await clack.confirm({
      message: pc.red(`${plan.remove.length} skill(s) will be permanently removed. Proceed?`),
      initialValue: false,
    });
    if (clack.isCancel(confirm) || !confirm) {
      clack.cancel('Upgrade cancelled.');
      process.exit(0);
    }
  }

  // ── Check for customised skills (content hash divergence) ─────────────────

  const customised = _detectCustomisedSkills([...plan.update, ...plan.remove], skillsDir, SKILLS_DIR);
  for (const skillName of customised) {
    const overwrite = await clack.confirm({
      message: pc.yellow(`"${skillName}" appears customised. Overwrite with upstream version?`),
      initialValue: false,
    });
    if (clack.isCancel(overwrite) || !overwrite) {
      plan.update = plan.update.filter(s => s.name !== skillName);
      plan.remove = plan.remove.filter(s => s !== skillName);
      clack.log.warn(`Skipped "${skillName}".`);
    }
  }

  // ── Execute ────────────────────────────────────────────────────────────────

  const spinner = clack.spinner();

  // UPDATE
  if (plan.update.length > 0) {
    spinner.start('Updating existing skills...');
    for (const { name, latestVersion } of plan.update) {
      const src  = path.join(SKILLS_DIR, name);
      const dest = path.join(skillsDir, name);
      if (fs.existsSync(src)) {
        _copyDir(src, dest);
        _writeVersionFile(dest, latestVersion);
      }
    }
    spinner.stop(pc.green(`✓ Updated ${plan.update.length} skill(s)`));
  }

  // ADD
  if (plan.add.length > 0) {
    spinner.start('Installing new skills...');
    for (const name of plan.add) {
      const src  = path.join(SKILLS_DIR, name);
      const dest = path.join(skillsDir, name);
      if (fs.existsSync(src)) {
        _copyDir(src, dest);
        const meta = pkgRegistry.getSkill(name);
        if (meta?.version) _writeVersionFile(dest, meta.version);
      }
    }
    spinner.stop(pc.green(`✓ Added ${plan.add.length} skill(s)`));
  }

  // REMOVE
  if (plan.remove.length > 0) {
    spinner.start('Removing deprecated skills...');
    for (const name of plan.remove) {
      const dest = path.join(skillsDir, name);
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
    }
    spinner.stop(pc.green(`✓ Removed ${plan.remove.length} skill(s)`));
  }

  // Notify about hard-deleted skills (removed from registry entirely, not just deprecated)
  const HARD_DELETED_NOTICE = [
    {
      name: 'doc-coauthoring',
      replacedBy: 'documentation-and-adrs',
      note: 'Renamed and expanded. Use `documentation-and-adrs` for ADRs and technical decision docs.',
    },
  ];
  for (const entry of HARD_DELETED_NOTICE) {
    if (plan.installedSet.has(entry.name)) {
      clack.log.warn(
        pc.yellow(`"${entry.name}" was removed from the registry in v3. `) +
        pc.dim(`${entry.note} Run: agents-skills install ${entry.replacedBy}`)
      );
      const dest = path.join(skillsDir, entry.name);
      fs.rmSync(dest, { recursive: true, force: true });
    }
  }

  // Update schema version marker
  _writeInstalledSchemaVersion(skillsDir, PKG_SCHEMA_VERSION);

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('');
  console.log(pc.green(
    `  Migration complete: ${plan.update.length} updated, ` +
    `${plan.add.length} added, ${plan.remove.length} removed.`
  ));

  clack.outro(pc.dim("Run 'agents-skills doctor' to verify workspace health."));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a { update, add, remove } plan by comparing installed state vs package registry.
 */
function _buildMigrationPlan(pkgRegistry, skillsDir, installedSchemaVersion) {
  const allPkgSkills = pkgRegistry.allSkillNames({ includeDeprecated: false });
  const deprecatedSkills = pkgRegistry.allSkillNames({ includeDeprecated: true })
    .filter(n => {
      const m = pkgRegistry.getSkill(n);
      return m?.deprecated;
    });

  const installedNames = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
    : [];

  const installedSet = new Set(installedNames);

  const update = [];
  const add    = [];
  const remove = [];

  // Skills to update — installed and outdated
  for (const name of installedNames) {
    if (deprecatedSkills.includes(name)) continue; // handled in remove
    const meta    = pkgRegistry.getSkill(name);
    if (!meta) continue;
    const vFile   = path.join(skillsDir, name, '.version');
    const instVer = fs.existsSync(vFile) ? fs.readFileSync(vFile, 'utf8').trim() : null;
    if (!instVer || (meta.version && instVer !== meta.version)) {
      update.push({ name, installedVersion: instVer || '?', latestVersion: meta.version });
    }
  }

  // Skills to add — in package registry but not installed
  for (const name of allPkgSkills) {
    if (!installedSet.has(name)) {
      const meta = pkgRegistry.getSkill(name);
      // Only auto-add mandatory process skills in major upgrade; tech skills are optional
      if (meta?.optional === false) {
        add.push(name);
      }
    }
  }

  // Skills to remove — installed but now deprecated
  for (const name of deprecatedSkills) {
    if (installedSet.has(name)) {
      remove.push(name);
    }
  }

  return { update, add, remove, installedSet };
}

/**
 * Compare file contents between installed and upstream to detect customisation.
 * Returns skill names that appear to have been modified.
 */
function _detectCustomisedSkills(skillNames, installedDir, upstreamDir) {
  const customised = [];
  for (const item of skillNames) {
    const name = typeof item === 'object' ? item.name : item;
    const instMd = path.join(installedDir, name, 'SKILL.md');
    const upsMd  = path.join(upstreamDir, name, 'SKILL.md');
    if (!fs.existsSync(instMd) || !fs.existsSync(upsMd)) continue;
    const instContent = fs.readFileSync(instMd, 'utf8');
    const upsContent  = fs.readFileSync(upsMd, 'utf8');
    if (instContent !== upsContent) customised.push(name);
  }
  return customised;
}

function _copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      _copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function _writeVersionFile(skillDir, version) {
  if (!version) return;
  fs.writeFileSync(path.join(skillDir, '.version'), version, 'utf8');
}

function _readInstalledSchemaVersion(skillsDir) {
  const vFile = path.join(skillsDir, '..', '.schema_version');
  if (fs.existsSync(vFile)) return fs.readFileSync(vFile, 'utf8').trim();
  return null;
}

function _writeInstalledSchemaVersion(skillsDir, version) {
  fs.writeFileSync(path.join(skillsDir, '..', '.schema_version'), version, 'utf8');
}

function _majorVersion(semver) {
  return parseInt((semver || '1.0.0').split('.')[0], 10);
}

module.exports = { upgradeCommand };

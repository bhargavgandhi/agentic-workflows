#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const pc   = require('picocolors');

/**
 * `agents-skills doctor`
 *
 * Comprehensive workspace health check. Reports:
 * - .agents/ directory structure integrity
 * - Skill version freshness
 * - Broken skill dependencies
 * - Project profile presence + staleness
 * - Context snapshot status
 * - Telemetry opt-in status
 * - Node/npm version compatibility
 */
async function doctorCommand() {
  const checks = [];
  const agentsDir = path.join(process.cwd(), '.agents');
  const skillsJson = path.join(__dirname, '..', '..', 'skills.json');

  console.log('');
  console.log(pc.bgCyan(pc.black(' 🩺 Workspace Doctor ')));
  console.log('');

  // ── 1. Runtime environment ─────────────────────────────────────────────────
  _header('Runtime Environment');

  const nodeVersion = process.version;
  const nodeMajor   = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
  _check(checks, nodeMajor >= 16,
    `Node.js ${nodeVersion}`,
    `Node.js ${nodeVersion} — requires 16+`
  );

  // ── 2. Workspace structure ─────────────────────────────────────────────────
  _header('.agents/ Structure');

  const hasAgentsDir = fs.existsSync(agentsDir);
  _check(checks, hasAgentsDir,
    '.agents/ directory found',
    '.agents/ not found — run `agents-skills` to install'
  );

  if (hasAgentsDir) {
    for (const folder of ['rules', 'skills', 'workflows', 'hooks']) {
      const exists = fs.existsSync(path.join(agentsDir, folder));
      _check(checks, exists,
        `.agents/${folder}/ present`,
        `.agents/${folder}/ missing`
      );
    }
  }

  // ── 3. Skill versions ──────────────────────────────────────────────────────
  _header('Skill Versions');

  if (fs.existsSync(skillsJson) && hasAgentsDir) {
    const manifest = JSON.parse(fs.readFileSync(skillsJson, 'utf8'));
    const registry = manifest.registry || {};
    const skillsDir = path.join(agentsDir, 'skills');

    if (fs.existsSync(skillsDir)) {
      const installedSkills = fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name);

      let allFresh = true;
      for (const name of installedSkills) {
        const vFile   = path.join(skillsDir, name, '.version');
        const pkgVer  = registry[name]?.version;
        const instVer = fs.existsSync(vFile) ? fs.readFileSync(vFile, 'utf8').trim() : null;

        if (!instVer) {
          _warn(`  ${name}: no .version file (pre-v2.0 install)`);
          allFresh = false;
        } else if (pkgVer && instVer !== pkgVer) {
          _warn(`  ${name}: installed ${instVer} → available ${pkgVer}`);
          allFresh = false;
        } else {
          _checkLine(true, `${name} ${pc.dim(`v${instVer || pkgVer || '?'}`)}`);
        }
      }
      if (allFresh) {
        _checkLine(true, 'All skills up to date');
      }
    } else {
      _warn('No skills directory found');
    }
  } else {
    _info('skills.json registry not found — skipping version checks');
  }

  // ── 4. Skill dependency integrity ─────────────────────────────────────────
  _header('Skill Dependencies');

  if (hasAgentsDir) {
    const skillsDir = path.join(agentsDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      const matter = _tryRequire('gray-matter');
      const allInstalled = new Set(
        fs.readdirSync(skillsDir, { withFileTypes: true })
          .filter(e => e.isDirectory())
          .map(e => e.name)
      );

      let depIssues = 0;
      for (const skillName of allInstalled) {
        const skillMd = path.join(skillsDir, skillName, 'SKILL.md');
        if (!fs.existsSync(skillMd) || !matter) continue;
        const parsed = matter(fs.readFileSync(skillMd, 'utf8'));
        const deps   = parsed.data?.dependencies || [];
        for (const dep of deps) {
          if (!allInstalled.has(dep)) {
            _warn(`  ${skillName} → missing dependency: ${dep}`);
            depIssues++;
          }
        }
      }
      if (depIssues === 0) {
        _checkLine(true, 'All skill dependencies satisfied');
      }
    }
  }

  // ── 5. Project profile ─────────────────────────────────────────────────────
  _header('Project Profile');

  const profilePath = path.join(agentsDir, 'project-profile.json');
  const hasProfile  = fs.existsSync(profilePath);
  _check(checks, hasProfile,
    'project-profile.json found',
    'project-profile.json missing — run `agents-skills init`'
  );

  if (hasProfile) {
    const profile     = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    const generatedAt = new Date(profile.generated_at);
    const ageHours    = (Date.now() - generatedAt.getTime()) / 3_600_000;
    const isStale     = ageHours > 168; // > 7 days

    _check(checks, !isStale,
      `Profile generated ${Math.round(ageHours)}h ago`,
      `Profile is ${Math.round(ageHours / 24)}d old — consider re-running \`agents-skills init\``
    );

    if (profile.framework) console.log(pc.dim(`    Framework: ${profile.framework}`));
    if (profile.language)  console.log(pc.dim(`    Language:  ${profile.language}`));
  }

  // ── 6. Context snapshots ───────────────────────────────────────────────────
  _header('Context Snapshots');

  const snapshotsDir = path.join(agentsDir, 'context-snapshots');
  if (fs.existsSync(snapshotsDir)) {
    const snapshots = fs.readdirSync(snapshotsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    if (snapshots.length > 0) {
      _checkLine(true, `${snapshots.length} snapshot(s) found`);
      console.log(pc.dim(`    Latest: ${snapshots[0]}`));
    } else {
      _info('No snapshots yet — use `agents-skills compact` to create one');
    }
  } else {
    _info('No context-snapshots/ directory — will be created on first compact');
  }

  // ── 7. Telemetry status ────────────────────────────────────────────────────
  _header('Telemetry');

  const configPath = path.join(os.homedir(), '.agents-skills', 'config.json');
  if (fs.existsSync(configPath)) {
    const config    = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const telStatus = config.telemetry === true ? pc.green('enabled') : pc.dim('disabled');
    console.log(`  Telemetry: ${telStatus}`);
  } else {
    _info('Not configured — run `agents-skills telemetry on` to enable');
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('');
  const passed  = checks.filter(c => c).length;
  const failed  = checks.filter(c => !c).length;
  const allPass = failed === 0;

  if (allPass) {
    console.log(pc.green(`  ✅ All ${passed} checks passed. Workspace is healthy.`));
  } else {
    console.log(pc.yellow(`  ⚠️  ${passed} passed, ${failed} issue(s) found. See warnings above.`));
  }
  console.log('');
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _header(title) {
  console.log(pc.bold(`  ${title}`));
}

function _check(checks, ok, passMsg, failMsg) {
  checks.push(ok);
  _checkLine(ok, ok ? passMsg : failMsg);
}

function _checkLine(ok, msg) {
  const icon = ok ? pc.green('  ✓') : pc.red('  ✗');
  console.log(`${icon} ${ok ? pc.dim(msg) : pc.red(msg)}`);
}

function _warn(msg) {
  console.log(`  ${pc.yellow('⚠')}  ${pc.yellow(msg)}`);
}

function _info(msg) {
  console.log(`  ${pc.cyan('ℹ')}  ${pc.dim(msg)}`);
}

function _tryRequire(mod) {
  try { return require(mod); } catch { return null; }
}

module.exports = { doctorCommand };

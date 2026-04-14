#!/usr/bin/env node

'use strict';

const fs     = require('fs');
const path   = require('path');
const https  = require('https');
const pc     = require('picocolors');
const clack  = require('@clack/prompts');

const SKILLS_JSON   = path.join(__dirname, '..', '..', 'skills.json');
const VALID_FILTERS = ['skills', 'workflows', 'rules', 'recipes', 'hooks'];

const REGISTRY_URL =
  'https://raw.githubusercontent.com/bhargavgandhi/agentic-workflows/main/skills.json';

/**
 * `agents-skills list [--skills|--workflows|--rules|--recipes|--hooks]`
 *
 * Lists all installed agent files in the local workspace (.agents/).
 * Falls back to the package source if no local install is detected.
 */
async function listCommand(args = []) {
  // --registry mode: fetch remote manifest and diff against local
  if (args.includes('--registry')) {
    await _listRegistry();
    return;
  }

  // Parse --flag filters from args
  const filters = args
    .filter(a => a.startsWith('--'))
    .map(a => a.replace('--', ''))
    .filter(a => VALID_FILTERS.includes(a));

  const showAll = filters.length === 0;

  // Determine base dir: prefer local .agents/, fall back to package source
  const localAgents = path.join(process.cwd(), '.agents');
  const pkgAgents   = path.join(__dirname, '..', '..', '.agents');
  const agentsDir   = fs.existsSync(localAgents) ? localAgents : pkgAgents;
  const isLocal     = agentsDir === localAgents;

  let registryMeta = {};
  if (fs.existsSync(SKILLS_JSON)) {
    const parsed = JSON.parse(fs.readFileSync(SKILLS_JSON, 'utf8'));
    registryMeta = parsed.registry || {};
  }

  console.log('');
  console.log(pc.bgCyan(pc.black(' 🤖 Installed Agent Content ')));
  console.log(pc.dim(`  Source: ${isLocal ? '.agents/ (local workspace)' : 'package (no local .agents/ found)'}`));
  console.log('');

  // ── Skills ───────────────────────────────────────────────────────────────
  if (showAll || filters.includes('skills')) {
    const skillsDir = path.join(agentsDir, 'skills');
    _printSection('📦 Skills', skillsDir, (name) => {
      const meta    = registryMeta[name] || {};
      const version = _readVersionFile(path.join(skillsDir, name)) || meta.version || '—';
      const cat     = meta.category === 'process' ? pc.cyan('[process]') : pc.dim('[tech]   ');
      const opt     = meta.optional === false ? pc.green('req') : pc.dim('opt');
      const deps    = meta.dependencies && meta.dependencies.length
        ? pc.yellow(`  deps: ${meta.dependencies.join(', ')}`)
        : '';
      return `${pc.cyan(`v${version}`)}  ${cat} ${opt}${deps}`;
    });
  }

  // ── Workflows ─────────────────────────────────────────────────────────────
  if (showAll || filters.includes('workflows')) {
    const workflowsDir = path.join(agentsDir, 'workflows');
    _printSection('🔄 Workflows', workflowsDir, null, '.md');
  }

  // ── Rules ─────────────────────────────────────────────────────────────────
  if (showAll || filters.includes('rules')) {
    const rulesDir = path.join(agentsDir, 'rules');
    _printSection('📐 Rules', rulesDir, null, '.md');
  }

  // ── Hooks ──────────────────────────────────────────────────────────────────
  if (showAll || filters.includes('hooks')) {
    const hooksDir = path.join(agentsDir, 'hooks');
    _printSection('🪝 Hooks', hooksDir, null, '.md');
  }

  // ── Recipes ───────────────────────────────────────────────────────────────
  if (showAll || filters.includes('recipes')) {
    const recipesDir = path.join(agentsDir, 'recipes');
    _printSection('🍳 Recipes', recipesDir, null, '.md');
  }

  console.log('');
  console.log(pc.dim('  Tip: Use `agents-skills install <skill>` to install a skill.'));
  console.log(pc.dim('       Use `agents-skills list --registry` to see all available skills.'));
  console.log(pc.dim('       Use `agents-skills doctor` to check workspace health.'));
  console.log('');
}

/**
 * Fetch the remote registry manifest and diff against locally installed skills.
 */
async function _listRegistry() {
  const spinner = clack.spinner();

  console.log('');
  console.log(pc.bgCyan(pc.black(' 🌐 Registry — Available Skills ')));
  console.log('');

  spinner.start('Fetching registry from GitHub...');

  let remoteManifest;
  try {
    const raw = await _fetchUrl(REGISTRY_URL);
    remoteManifest = JSON.parse(raw);
  } catch (err) {
    spinner.stop(pc.red('Failed to fetch registry'));
    console.log(pc.red(`  Error: ${err.message}`));
    console.log(pc.dim('  Showing local package registry instead.\n'));
    remoteManifest = fs.existsSync(SKILLS_JSON)
      ? JSON.parse(fs.readFileSync(SKILLS_JSON, 'utf8'))
      : { skills: [], registry: {}, packs: [] };
  }

  spinner.stop(pc.green('Registry fetched'));

  // Build set of locally installed skills
  const localSkillsDir = path.join(process.cwd(), '.agents', 'skills');
  const installedSet   = new Set(
    fs.existsSync(localSkillsDir)
      ? fs.readdirSync(localSkillsDir, { withFileTypes: true })
          .filter(e => e.isDirectory())
          .map(e => e.name)
      : []
  );

  const remoteReg  = remoteManifest.registry || {};
  const allNames   = remoteManifest.skills || [];

  // Group by category
  const processSkills = allNames.filter(n => {
    const m = remoteReg[n] || {};
    return m.category === 'process' && !m.deprecated;
  });
  const techSkills = allNames.filter(n => {
    const m = remoteReg[n] || {};
    return m.category === 'technology' && !m.deprecated;
  });
  const deprecated = allNames.filter(n => (remoteReg[n] || {}).deprecated);

  const _row = (name) => {
    const meta    = remoteReg[name] || {};
    const status  = installedSet.has(name) ? pc.green('  ✓ installed') : pc.dim('  ○ not installed');
    const opt     = meta.optional === false ? pc.cyan('req') : pc.dim('opt');
    const phase   = meta.phase != null ? pc.dim(` phase ${meta.phase}`) : '';
    console.log(`  ${name.padEnd(36)} ${opt}${phase}${status}`);
  };

  if (processSkills.length > 0) {
    console.log(pc.bold(`  Process Skills (${processSkills.length})`));
    processSkills.forEach(_row);
    console.log('');
  }

  if (techSkills.length > 0) {
    console.log(pc.bold(`  Technology Skills (${techSkills.length})`));
    techSkills.forEach(_row);
    console.log('');
  }

  if (deprecated.length > 0) {
    console.log(pc.dim(`  Deprecated (${deprecated.length}) — tombstones, will be removed in v4`));
    deprecated.forEach(name => {
      const meta = remoteReg[name] || {};
      console.log(pc.dim(`  ${name.padEnd(36)} → ${(meta.replacedBy || []).join(', ')}`));
    });
    console.log('');
  }

  // Pack aliases
  const packs = remoteManifest.packs || [];
  if (packs.length > 0) {
    console.log(pc.bold(`  Pack Aliases (${packs.length})`));
    packs.forEach(p => {
      console.log(`  ${pc.magenta(p.name.padEnd(36))} → ${pc.dim(p.skills.join(', '))}`);
    });
    console.log('');
  }

  const notInstalled = allNames.filter(n => !installedSet.has(n) && !(remoteReg[n] || {}).deprecated);
  if (notInstalled.length > 0) {
    console.log(pc.dim(`  ${notInstalled.length} skill(s) not yet installed.`));
    console.log(pc.dim('  Run `agents-skills install <skill>` to add them.'));
  }
  console.log('');
}

/**
 * Fetch a URL and return body as string.
 * @param {string} url
 * @returns {Promise<string>}
 */
function _fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Print a section of the list (skills, workflows, etc.)
 * @param {string} title      - Section title
 * @param {string} dir        - Directory to scan
 * @param {Function|null} metaFn - Optional fn(name) → extra metadata string
 * @param {string|null} ext   - File extension filter (for flat directories like rules/)
 */
function _printSection(title, dir, metaFn = null, ext = null) {
  if (!fs.existsSync(dir)) {
    console.log(pc.yellow(`  ${title}: (not installed)`));
    console.log('');
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let items;

  if (ext) {
    // Flat directory of files (rules, workflows, hooks)
    items = entries
      .filter(e => e.isFile() && e.name.endsWith(ext))
      .map(e => path.basename(e.name, ext));
  } else {
    // Directory of subdirectories (skills)
    items = entries.filter(e => e.isDirectory()).map(e => e.name);
  }

  const count = items.length;
  console.log(`  ${pc.bold(title)} ${pc.dim(`(${count})`)}`);

  items.forEach((name, idx) => {
    const isLast   = idx === items.length - 1;
    const prefix   = isLast ? '  └──' : '  ├──';
    const meta     = metaFn ? metaFn(name) : '';
    console.log(`${prefix} ${pc.green(name.padEnd(32))}${meta}`);
  });

  console.log('');
}

/**
 * Read the .version file from a skill directory.
 * @param {string} skillDir
 * @returns {string|null}
 */
function _readVersionFile(skillDir) {
  const vFile = path.join(skillDir, '.version');
  if (fs.existsSync(vFile)) {
    return fs.readFileSync(vFile, 'utf8').trim();
  }
  return null;
}

module.exports = { listCommand };

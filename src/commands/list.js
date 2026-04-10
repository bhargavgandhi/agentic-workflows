#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');
const pc   = require('picocolors');

const VALID_FILTERS = ['skills', 'workflows', 'rules', 'recipes', 'hooks'];

/**
 * `agents-skills list [--skills|--workflows|--rules|--recipes|--hooks]`
 *
 * Lists all installed agent files in the local workspace (.agents/).
 * Falls back to the package source if no local install is detected.
 */
async function listCommand(args = []) {
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

  const skillsJson = path.join(__dirname, '..', '..', 'skills.json');
  let registry = {};
  if (fs.existsSync(skillsJson)) {
    const parsed = JSON.parse(fs.readFileSync(skillsJson, 'utf8'));
    registry = parsed.registry || {};
  }

  console.log('');
  console.log(pc.bgCyan(pc.black(' 🤖 Installed Agent Content ')));
  console.log(pc.dim(`  Source: ${isLocal ? '.agents/ (local workspace)' : 'package (no local .agents/ found)'}`));
  console.log('');

  // ── Skills ───────────────────────────────────────────────────────────────
  if (showAll || filters.includes('skills')) {
    const skillsDir = path.join(agentsDir, 'skills');
    _printSection('📦 Skills', skillsDir, (name) => {
      const meta = registry[name] || {};
      const version = _readVersionFile(path.join(skillsDir, name)) || meta.version || '—';
      const pattern = meta.pattern ? pc.dim(`  ${meta.pattern}`) : '';
      const tags    = meta.tags ? pc.dim(`  [${meta.tags.join(', ')}]`) : '';
      const deps    = meta.dependencies && meta.dependencies.length
        ? pc.yellow(`  deps: ${meta.dependencies.join(', ')}`)
        : '';
      return `${pc.cyan(`v${version}`)}${pattern}${tags}${deps}`;
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
  console.log(pc.dim('  Tip: Use `agents-skills add <skill-name>` to install a skill.'));
  console.log(pc.dim('       Use `agents-skills doctor` to check workspace health.'));
  console.log('');
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

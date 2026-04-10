'use strict';

const fs   = require('fs');
const path = require('path');
const pc   = require('picocolors');
const {
  countDirectoryTokens,
  countFileTokens,
  measureSkillContext,
  loadProfileBudget,
} = require('../core/token-counter');

/**
 * `agents-skills tokens [options]`
 *
 *   agents-skills tokens                     → Full .agents/ context breakdown
 *   agents-skills tokens --skill react-query  → Count a specific skill
 *   agents-skills tokens --file src/app.tsx   → Count a specific file
 *   agents-skills tokens --budget             → Show budget breakdown only
 */
async function tokensCommand(args = []) {
  const cwd       = process.cwd();
  const agentsDir = path.join(cwd, '.agents');
  const budget    = loadProfileBudget(cwd);

  const fileArg  = _getArgValue(args, '--file');
  const skillArg = _getArgValue(args, '--skill');
  const budgetOnly = args.includes('--budget');

  console.log('');
  console.log(pc.bold('  📊 Context Token Budget'));
  console.log('');

  _printBudgetHeader(budget);

  // ── Mode: single file ─────────────────────────────────────────────────────
  if (fileArg) {
    const target = path.resolve(cwd, fileArg);
    const result = countFileTokens(target);
    console.log('');
    if (result.skipped) {
      console.log(pc.yellow(`  ⚠  File not found or not countable: ${fileArg}`));
    } else {
      console.log(`  File: ${pc.cyan(fileArg)}`);
      console.log(`  Tokens: ${pc.bold(_fmt(result.tokens))}  ${_pct(result.tokens, budget.budget)}% of budget`);
      console.log(`  Lines:  ${_fmt(result.lines)}`);
    }
    console.log('');
    return;
  }

  // ── Mode: single skill ────────────────────────────────────────────────────
  if (skillArg) {
    const skillsDir = path.join(agentsDir, 'skills');
    const result    = measureSkillContext(skillsDir, skillArg);
    console.log('');
    if (result.tokens === 0) {
      console.log(pc.yellow(`  ⚠  Skill not found: ${skillArg}`));
    } else {
      console.log(`  Skill:  ${pc.cyan(skillArg)}`);
      console.log(`  Tokens: ${pc.bold(_fmt(result.tokens))}  ${_pct(result.tokens, budget.budget)}% of budget`);
      console.log(`  Files:  ${result.files}`);
    }
    console.log('');
    return;
  }

  // ── Mode: full .agents/ breakdown ─────────────────────────────────────────
  if (!fs.existsSync(agentsDir)) {
    console.log(pc.yellow('  ⚠  No .agents/ directory found. Run `agents-skills` to install.'));
    console.log('');
    return;
  }

  console.log('');
  console.log(pc.bold('  🟢 Context Breakdown:'));
  console.log('');

  let grandTotal = 0;
  const sections = [
    { label: 'Rules',    dir: path.join(agentsDir, 'rules') },
    { label: 'Workflows', dir: path.join(agentsDir, 'workflows') },
    { label: 'Hooks',    dir: path.join(agentsDir, 'hooks') },
    { label: 'Recipes',  dir: path.join(agentsDir, 'recipes') },
  ];

  // Profile JSON
  const profilePath = path.join(agentsDir, 'project-profile.json');
  if (fs.existsSync(profilePath)) {
    const r = countFileTokens(profilePath);
    _printLine('Project Profile', r.tokens, budget.budget);
    grandTotal += r.tokens;
  }

  // Flat sections
  for (const section of sections) {
    if (!fs.existsSync(section.dir)) continue;
    const { total } = countDirectoryTokens(section.dir);
    _printLine(section.label, total, budget.budget);
    grandTotal += total;
  }

  // Skills — expanded
  const skillsDir = path.join(agentsDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skillNames = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();

    const skillTotals = skillNames.map(name => measureSkillContext(skillsDir, name));
    const totalSkillTokens = skillTotals.reduce((s, r) => s + r.tokens, 0);

    console.log(`  ${'Skills'.padEnd(22)} ${_fmt(totalSkillTokens).padStart(10)} tokens  ${_pct(totalSkillTokens, budget.budget)}%`);
    for (const s of skillTotals) {
      if (s.tokens > 0) {
        console.log(pc.dim(`    ├── ${s.skill.padEnd(28)} ${_fmt(s.tokens).padStart(8)}`));
      }
    }

    grandTotal += totalSkillTokens;
  }

  // Summary
  console.log('');
  console.log(`  ${'─'.repeat(58)}`);
  const overBudget   = grandTotal > budget.budget;
  const pctOfBudget  = _pct(grandTotal, budget.budget);
  const pctOfWindow  = _pct(grandTotal, budget.window);
  const totalLine    = `  Total: ${_fmt(grandTotal).padStart(12)} tokens  (${pctOfBudget}% of budget / ${pctOfWindow}% of window)`;

  if (!budgetOnly) {
    console.log(overBudget ? pc.red(totalLine) : pc.green(totalLine));
  }

  if (overBudget) {
    const excess = grandTotal - budget.budget;
    console.log('');
    console.log(pc.red(`  ⚠️  Over budget by ${_fmt(excess)} tokens (${_pct(excess, budget.budget)}%)`));
    console.log(pc.yellow('  Recommendations:'));
    console.log(pc.yellow('    • Load only skills needed for the current task'));
    console.log(pc.yellow('    • Run `agents-skills compact` to create a context snapshot'));
    console.log(pc.yellow('    • Start a new chat session and reference the snapshot'));
  } else {
    const remaining = budget.budget - grandTotal;
    console.log(pc.dim(`  Remaining:  ${_fmt(remaining).padStart(9)} tokens  (${_pct(remaining, budget.budget)}% of budget)`));
  }

  console.log('');
}

// ── helpers ───────────────────────────────────────────────────────────────────

function _printBudgetHeader({ model, window, budget, percent }) {
  console.log(`  ${pc.dim('Model:')         .padEnd(22)} ${model}`);
  console.log(`  ${pc.dim('Context Window:').padEnd(22)} ${_fmt(window)} tokens`);
  console.log(`  ${pc.dim('Budget (40%):') .padEnd(22)} ${_fmt(budget)} tokens`);
}

function _printLine(label, tokens, budget) {
  const pct = _pct(tokens, budget);
  console.log(`  ${label.padEnd(22)} ${_fmt(tokens).padStart(10)} tokens  ${pct}%`);
}

function _fmt(n) {
  return n.toLocaleString('en-US');
}

function _pct(n, total) {
  if (total === 0) return '0.0';
  return ((n / total) * 100).toFixed(1);
}

function _getArgValue(args, flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  // Support --flag=value syntax
  const match = args.find(a => a.startsWith(`${flag}=`));
  return match ? match.split('=').slice(1).join('=') : null;
}

module.exports = { tokensCommand };

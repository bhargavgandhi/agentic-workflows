#!/usr/bin/env node
'use strict';

// Gate 1 enforcement, for git and CI.
//
//   guard-gate.js --staged            check staged files (pre-commit hook)
//   guard-gate.js --range <A>..<B>    check a commit range (CI)
//
// Exit 0 = gate passes, exit 1 = blocked with an explanation on stderr.
// Prose in a workflow file cannot stop an agent from implementing before the
// human approves a plan. This can, and it works the same for every agent and
// every editor because it runs in git rather than in a model's context.

const { execFileSync } = require('child_process');
const path = require('path');

const { checkGate } = require(path.join(__dirname, '..', 'src', 'core', 'gate-check'));

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const mode = argv.includes('--range') ? 'range' : 'staged';
  const range = mode === 'range' ? argv[argv.indexOf('--range') + 1] : null;
  if (mode === 'range' && !range) {
    console.error('guard-gate: --range requires a value, e.g. --range origin/main..HEAD');
    process.exit(2);
  }
  return { mode, range };
}

function changedFiles({ mode, range }) {
  const args = mode === 'range'
    ? ['diff', '--name-only', '--diff-filter=ACMR', range]
    : ['diff', '--cached', '--name-only', '--diff-filter=ACMR'];
  return git(args).split('\n').filter(Boolean);
}

function currentBranch({ mode, range }) {
  // In CI the checkout is often detached, so prefer the explicit refs CI sets.
  const fromEnv =
    process.env.GITHUB_HEAD_REF ||        // pull_request events
    process.env.CI_COMMIT_REF_NAME ||     // GitLab
    '';
  if (fromEnv) return fromEnv.trim();

  const head = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (head !== 'HEAD') return head;

  // Detached and no CI ref: derive from the range's right-hand side if we can.
  if (mode === 'range' && range && range.includes('..')) {
    const rhs = range.split('..').pop();
    if (rhs && rhs !== 'HEAD') return rhs.replace(/^origin\//, '');
  }
  return 'HEAD';
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let files, branch;
  try {
    files  = changedFiles(args);
    branch = currentBranch(args);
  } catch (err) {
    console.error(`guard-gate: could not read git state — ${err.message}`);
    process.exit(2);
  }

  if (files.length === 0) {
    console.log('guard-gate: no changed files, nothing to check.');
    process.exit(0);
  }

  const result = checkGate({ files, branch, cwd: process.cwd() });

  if (result.ok) {
    console.log(`guard-gate: Gate 1 ok (${result.checked} file(s) on "${branch}").`);
    process.exit(0);
  }

  console.error('');
  console.error(`guard-gate: Gate 1 BLOCKED on "${branch}"`);
  console.error('');
  for (const v of result.violations) {
    console.error(`  [${v.code}] ${v.message}`);
    console.error('');
  }
  console.error('  Gate 1 exists so a human approves the plan before code is written.');
  console.error('  If you are certain this is wrong, the local hook can be skipped with');
  console.error('  `git commit --no-verify` — but CI runs the same check and cannot be.');
  console.error('');
  process.exit(1);
}

main();

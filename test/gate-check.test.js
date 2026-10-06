'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { checkGate, findApprovedPlans, isSourceFile, sensitiveMatches } =
  require('../src/core/gate-check');

function workspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-check-test-'));
  fs.mkdirSync(path.join(dir, 'plans'));
  return dir;
}

function writePlan(dir, name, frontmatter, body = 'plan body') {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => (Array.isArray(v)
      ? `${k}:\n${v.map(x => `  - ${x}`).join('\n')}`
      : `${k}: ${v}`))
    .join('\n');
  fs.writeFileSync(path.join(dir, 'plans', name), `---\n${fm}\n---\n\n${body}\n`, 'utf8');
}

function codes(result) {
  return result.violations.map(v => v.code);
}

// ── classification ───────────────────────────────────────────────────────────

test('isSourceFile: recognises source, ignores docs and config', () => {
  for (const f of ['src/a.js', 'src/b.tsx', 'lib/c.py', 'x.go', 'ui/d.svelte']) {
    assert.equal(isSourceFile(f), true, `${f} should be source`);
  }
  for (const f of ['README.md', 'plans/x.md', 'skills.json', 'a.yml', '.gitignore']) {
    assert.equal(isSourceFile(f), false, `${f} should not be source`);
  }
});

test('sensitiveMatches: flags env files, CI workflows and container config', () => {
  assert.deepEqual(sensitiveMatches('.env'), ['.env file']);
  assert.deepEqual(sensitiveMatches('apps/web/.env.local'), ['.env file']);
  assert.deepEqual(sensitiveMatches('.github/workflows/ci.yml'), ['CI workflow']);
  assert.deepEqual(sensitiveMatches('Dockerfile'), ['Dockerfile']);
  assert.deepEqual(sensitiveMatches('docker-compose.yml'), ['compose file']);
  assert.deepEqual(sensitiveMatches('src/env-scanner.js'), []);
  assert.deepEqual(sensitiveMatches('docs/environment.md'), []);
});

// ── plan discovery ───────────────────────────────────────────────────────────

test('findApprovedPlans: requires approved:true AND a matching branch', () => {
  const dir = workspace();
  writePlan(dir, 'a.md', { approved: true,  branch: 'feat/a' });
  writePlan(dir, 'b.md', { approved: false, branch: 'feat/a' });
  writePlan(dir, 'c.md', { approved: true,  branch: 'feat/other' });
  writePlan(dir, 'd.md', { branch: 'feat/a' });

  const found = findApprovedPlans(path.join(dir, 'plans'), 'feat/a');
  assert.equal(found.length, 1);
  assert.match(found[0].file, /a\.md$/);

  fs.rmSync(dir, { recursive: true });
});

test('findApprovedPlans: an unparseable plan is not an approval', () => {
  const dir = workspace();
  fs.writeFileSync(path.join(dir, 'plans', 'bad.md'), '---\n: : :\n---\nbody\n', 'utf8');
  assert.deepEqual(findApprovedPlans(path.join(dir, 'plans'), 'feat/a'), []);
  fs.rmSync(dir, { recursive: true });
});

test('findApprovedPlans: missing plans directory is empty, not an error', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-check-noplans-'));
  assert.deepEqual(findApprovedPlans(path.join(dir, 'plans'), 'feat/a'), []);
  fs.rmSync(dir, { recursive: true });
});

// ── the gate ─────────────────────────────────────────────────────────────────

test('checkGate: docs-only commit passes with no plan at all', () => {
  const dir = workspace();
  const r = checkGate({ files: ['README.md', 'plans/x.md'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, true);
  assert.deepEqual(r.violations, []);
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: source change without an approved plan is blocked', () => {
  const dir = workspace();
  const r = checkGate({ files: ['src/thing.js'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r), ['no-approved-plan']);
  assert.match(r.violations[0].message, /branch: feat\/a/);
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: source change with an approved plan for this branch passes', () => {
  const dir = workspace();
  writePlan(dir, 'stage-1.md', { approved: true, branch: 'feat/a' });
  const r = checkGate({ files: ['src/thing.js'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, true);
  fs.rmSync(dir, { recursive: true });
});

test("checkGate: another branch's approved plan does not unlock this branch", () => {
  const dir = workspace();
  writePlan(dir, 'other.md', { approved: true, branch: 'feat/other' });
  const r = checkGate({ files: ['src/thing.js'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r), ['no-approved-plan']);
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: committing to a protected branch is blocked', () => {
  const dir = workspace();
  writePlan(dir, 'p.md', { approved: true, branch: 'main' });
  const r = checkGate({ files: ['src/thing.js'], branch: 'main', cwd: dir });
  assert.equal(r.ok, false);
  assert.ok(codes(r).includes('protected-branch'));
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: sensitive path is blocked even with an approved plan', () => {
  const dir = workspace();
  writePlan(dir, 'p.md', { approved: true, branch: 'feat/a' });
  const r = checkGate({ files: ['.github/workflows/ci.yml'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r), ['unapproved-sensitive-path']);
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: sensitive path passes when the plan names it in touches', () => {
  const dir = workspace();
  writePlan(dir, 'p.md', {
    approved: true,
    branch: 'feat/a',
    touches: ['.github/workflows/ci.yml'],
  });
  const r = checkGate({ files: ['.github/workflows/ci.yml'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, true);
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: a directory in touches covers files beneath it', () => {
  const dir = workspace();
  writePlan(dir, 'p.md', {
    approved: true,
    branch: 'feat/a',
    touches: ['.github/workflows'],
  });
  const r = checkGate({ files: ['.github/workflows/gate.yml'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, true);
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: a sensitive path alone still requires the plan to name it', () => {
  // No source files in the commit, so the no-approved-plan rule does not fire —
  // but a .env change must never slip through on that technicality.
  const dir = workspace();
  const r = checkGate({ files: ['.env'], branch: 'feat/a', cwd: dir });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r), ['unapproved-sensitive-path']);
  fs.rmSync(dir, { recursive: true });
});

test('checkGate: reports every violation, not just the first', () => {
  const dir = workspace();
  const r = checkGate({
    files: ['src/a.js', '.env', '.github/workflows/ci.yml'],
    branch: 'main',
    cwd: dir,
  });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r).sort(), [
    'no-approved-plan',
    'protected-branch',
    'unapproved-sensitive-path',
    'unapproved-sensitive-path',
  ].sort());
  fs.rmSync(dir, { recursive: true });
});

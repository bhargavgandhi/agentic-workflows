'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const path     = require('node:path');
const os       = require('node:os');
const fs       = require('node:fs');

const { parseDirectives, evaluateCondition, runParallelGroup } = require('../src/core/workflow-runner');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-runner-test-'));
}

// ── parseDirectives ───────────────────────────────────────────────────────────

test('parseDirectives: extracts parallel-group blocks from markdown', () => {
  const md = `
## Phase 5b. Security Audit

<!-- parallel-group: start -->
\`\`\`bash
npm run lint
\`\`\`

\`\`\`bash
npx tsc --noEmit
\`\`\`
<!-- parallel-group: end -->
`.trim();

  const groups = parseDirectives(md);
  assert.equal(groups.length, 1, 'should find one parallel group');
  assert.equal(groups[0].type, 'parallel-group');
  assert.equal(groups[0].commands.length, 2, 'should extract 2 commands');
  assert.ok(groups[0].commands.includes('npm run lint'));
  assert.ok(groups[0].commands.includes('npx tsc --noEmit'));
});

test('parseDirectives: extracts condition directive', () => {
  const md = `
<!-- condition: source-files-changed -->
## Phase 5b. Security Audit

\`\`\`bash
agents-skills scan
\`\`\`
`.trim();

  const groups = parseDirectives(md);
  assert.equal(groups.length, 1, 'should find one conditional block');
  assert.equal(groups[0].type, 'condition');
  assert.equal(groups[0].condition, 'source-files-changed');
  assert.ok(groups[0].commands.includes('agents-skills scan'));
});

test('parseDirectives: returns empty array for markdown with no directives', () => {
  const md = '## Phase 5\n\nRun tests.\n\n```bash\nnpm test\n```';
  const groups = parseDirectives(md);
  assert.deepEqual(groups, []);
});

// ── evaluateCondition ─────────────────────────────────────────────────────────

test('evaluateCondition: source-files-changed returns false when only .md files changed', () => {
  const dir = tmpDir();
  // Simulate a git diff output file listing only .md changes
  const changedFiles = ['README.md', 'docs/guide.md', '.github/copilot-instructions.md'];
  const result = evaluateCondition('source-files-changed', { changedFiles });
  assert.equal(result, false, 'should be false when only .md files changed');
  fs.rmSync(dir, { recursive: true });
});

test('evaluateCondition: source-files-changed returns true when .ts files changed', () => {
  const changedFiles = ['src/index.ts', 'README.md'];
  const result = evaluateCondition('source-files-changed', { changedFiles });
  assert.equal(result, true, 'should be true when .ts files are present');
});

test('evaluateCondition: source-files-changed returns true when .js files changed', () => {
  const changedFiles = ['src/core/scanner.js'];
  const result = evaluateCondition('source-files-changed', { changedFiles });
  assert.equal(result, true, 'should be true when .js files are present');
});

test('evaluateCondition: source-files-changed returns false for config-only changes', () => {
  const changedFiles = ['.eslintrc.json', 'tsconfig.json', '.prettierrc'];
  const result = evaluateCondition('source-files-changed', { changedFiles });
  assert.equal(result, false, 'config-only changes should not count as source files');
});

// ── runParallelGroup ──────────────────────────────────────────────────────────

test('runParallelGroup: runs commands concurrently (wall time < serial sum)', async () => {
  // Each command sleeps 100ms — serial would be 300ms, parallel should be ~100ms
  const commands = [
    'node -e "setTimeout(()=>{},100)"',
    'node -e "setTimeout(()=>{},100)"',
    'node -e "setTimeout(()=>{},100)"',
  ];

  const start   = Date.now();
  const results = await runParallelGroup(commands);
  const elapsed = Date.now() - start;

  assert.ok(elapsed < 250, `parallel wall time ${elapsed}ms should be < 250ms (serial would be ~300ms)`);
  assert.equal(results.length, 3, 'should return a result for each command');
  assert.ok(results.every(r => r.exitCode === 0), 'all commands should succeed');
});

test('runParallelGroup: buffers output per command, not interleaved', async () => {
  const commands = [
    'node -e "process.stdout.write(\'cmd1\\n\')"',
    'node -e "process.stdout.write(\'cmd2\\n\')"',
  ];

  const results = await runParallelGroup(commands);
  assert.ok(results[0].stdout.includes('cmd1'), 'first result should have cmd1 output');
  assert.ok(results[1].stdout.includes('cmd2'), 'second result should have cmd2 output');
});

test('runParallelGroup: reports failed commands without throwing', async () => {
  const commands = [
    'node -e "process.exit(0)"',
    'node -e "process.exit(1)"',
  ];

  const results = await runParallelGroup(commands);
  assert.equal(results[0].exitCode, 0, 'first command should succeed');
  assert.equal(results[1].exitCode, 1, 'second command should fail with exitCode 1');
});

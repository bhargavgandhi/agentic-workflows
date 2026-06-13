'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { detectSubagentDrift, SUBAGENT_NAMES } = require('../src/core/subagent-drift');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'subagent-drift-test-'));
}

function writeSubagent(dir, name, content) {
  fs.writeFileSync(path.join(dir, `${name}.md`), content, 'utf8');
}

test('detectSubagentDrift: no drift when installed matches source', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  for (const name of SUBAGENT_NAMES) {
    writeSubagent(sourceDir, name, `# ${name}\ncontent`);
    writeSubagent(installedDir, name, `# ${name}\ncontent`);
  }

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, false);
  assert.deepEqual(result.issues, []);

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});

test('detectSubagentDrift: detects a missing subagent', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  for (const name of SUBAGENT_NAMES) {
    writeSubagent(sourceDir, name, `# ${name}\ncontent`);
    if (name !== 'security-auditor') {
      writeSubagent(installedDir, name, `# ${name}\ncontent`);
    }
  }

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, true);
  assert.deepEqual(result.issues, [
    { type: 'missing', subagent: 'security-auditor', details: 'security-auditor.md not installed in .claude/agents/' },
  ]);

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});

test('detectSubagentDrift: detects an outdated (content-mismatched) subagent', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  for (const name of SUBAGENT_NAMES) {
    writeSubagent(sourceDir, name, `# ${name}\nv2`);
    writeSubagent(installedDir, name, `# ${name}\nv1`);
  }

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, true);
  assert.equal(result.issues.length, 3);
  for (const issue of result.issues) {
    assert.equal(issue.type, 'outdated');
  }

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});

test('detectSubagentDrift: ignores subagents not present in source', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  writeSubagent(sourceDir, 'code-review-analyzer', '# code-review-analyzer\ncontent');
  writeSubagent(installedDir, 'code-review-analyzer', '# code-review-analyzer\ncontent');
  // security-auditor and test-coverage-analyzer don't exist in source — skip, not "missing"

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, false);

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});

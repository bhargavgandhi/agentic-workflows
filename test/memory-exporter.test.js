'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { exportLearning } = require('../src/core/memory-exporter');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'memexport-test-'));
}

function seedLearning(learningsDir, filename, data) {
  fs.mkdirSync(learningsDir, { recursive: true });
  const record = { title: data.title, tags: data.tags, content: data.content, timestamp: new Date().toISOString() };
  fs.writeFileSync(path.join(learningsDir, filename), JSON.stringify(record, null, 2), 'utf8');
  const indexPath = path.join(learningsDir, 'index.json');
  const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : [];
  index.push({ title: data.title, file: filename, tags: data.tags, timestamp: record.timestamp });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
}

const SEVEN_SECTIONS = [
  '## 1. Trigger Conditions',
  '## 2. Prerequisites',
  '## 3. Steps',
  '## 4. Anti-Rationalization Table',
  '## 5. Red Flags',
  '## 6. Verification Gate',
  '## 7. References',
];

// ── exportLearning ────────────────────────────────────────────────────────────

test('exportLearning: creates SKILL.md with all 7 sections', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');
  const skillsDir    = path.join(dir, 'skills');

  seedLearning(learningsDir, 'prefer-zod-validation.json', {
    title:   'prefer-zod-validation',
    tags:    ['zod', 'validation', 'typescript'],
    content: 'Always validate with zod at API boundaries.',
  });

  exportLearning(dir, 'prefer-zod-validation', skillsDir);

  const skillMd = path.join(skillsDir, 'prefer-zod-validation', 'SKILL.md');
  assert.ok(fs.existsSync(skillMd), 'SKILL.md should be created');

  const content = fs.readFileSync(skillMd, 'utf8');
  for (const section of SEVEN_SECTIONS) {
    assert.ok(content.includes(section), `SKILL.md should contain "${section}"`);
  }

  fs.rmSync(dir, { recursive: true });
});

test('exportLearning: SKILL.md frontmatter includes name and tags', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');
  const skillsDir    = path.join(dir, 'skills');

  seedLearning(learningsDir, 'prefer-zod-validation.json', {
    title:   'prefer-zod-validation',
    tags:    ['zod', 'validation'],
    content: 'Use zod.',
  });

  exportLearning(dir, 'prefer-zod-validation', skillsDir);

  const skillMd = path.join(skillsDir, 'prefer-zod-validation', 'SKILL.md');
  const content = fs.readFileSync(skillMd, 'utf8');

  assert.ok(content.includes('name: prefer-zod-validation'), 'frontmatter should include name');
  assert.ok(content.includes('zod'), 'frontmatter or body should include tags');

  fs.rmSync(dir, { recursive: true });
});

test('exportLearning: learning content appears in Steps section', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');
  const skillsDir    = path.join(dir, 'skills');

  seedLearning(learningsDir, 'prefer-zod-validation.json', {
    title:   'prefer-zod-validation',
    tags:    ['zod'],
    content: 'Always validate with zod at API boundaries.',
  });

  exportLearning(dir, 'prefer-zod-validation', skillsDir);

  const content = fs.readFileSync(path.join(skillsDir, 'prefer-zod-validation', 'SKILL.md'), 'utf8');
  assert.ok(content.includes('Always validate with zod at API boundaries.'), 'learning content should appear in SKILL.md');

  fs.rmSync(dir, { recursive: true });
});

test('exportLearning: throws if learning not found', () => {
  const dir       = tmpDir();
  const skillsDir = path.join(dir, 'skills');

  assert.throws(
    () => exportLearning(dir, 'nonexistent-learning', skillsDir),
    /not found/i,
    'should throw with "not found" message',
  );

  fs.rmSync(dir, { recursive: true });
});

test('exportLearning: does not overwrite existing SKILL.md without --force', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');
  const skillsDir    = path.join(dir, 'skills');

  seedLearning(learningsDir, 'prefer-zod-validation.json', {
    title: 'prefer-zod-validation', tags: ['zod'], content: 'Use zod.',
  });

  exportLearning(dir, 'prefer-zod-validation', skillsDir);

  const skillMd   = path.join(skillsDir, 'prefer-zod-validation', 'SKILL.md');
  const original  = fs.readFileSync(skillMd, 'utf8');

  // Mutate the file to simulate user customisation
  fs.writeFileSync(skillMd, original + '\n<!-- custom -->', 'utf8');

  // Second export without force — should not overwrite
  exportLearning(dir, 'prefer-zod-validation', skillsDir);
  const after = fs.readFileSync(skillMd, 'utf8');
  assert.ok(after.includes('<!-- custom -->'), 'existing SKILL.md should not be overwritten without --force');

  fs.rmSync(dir, { recursive: true });
});

test('exportLearning: overwrites existing SKILL.md with force=true', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');
  const skillsDir    = path.join(dir, 'skills');

  seedLearning(learningsDir, 'prefer-zod-validation.json', {
    title: 'prefer-zod-validation', tags: ['zod'], content: 'Use zod.',
  });

  exportLearning(dir, 'prefer-zod-validation', skillsDir);

  const skillMd = path.join(skillsDir, 'prefer-zod-validation', 'SKILL.md');
  fs.writeFileSync(skillMd, 'old content', 'utf8');

  exportLearning(dir, 'prefer-zod-validation', skillsDir, { force: true });
  const after = fs.readFileSync(skillMd, 'utf8');
  assert.ok(!after.includes('old content'), 'SKILL.md should be overwritten with force=true');
  for (const section of SEVEN_SECTIONS) {
    assert.ok(after.includes(section), `overwritten file should still have "${section}"`);
  }

  fs.rmSync(dir, { recursive: true });
});

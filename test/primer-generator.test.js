'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { generatePrimer } = require('../src/core/primer-generator');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'primer-test-'));
}

function makeSkill(skillsDir, name) {
  const d = path.join(skillsDir, name);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'SKILL.md'), `# ${name}\n`, 'utf8');
}

// ── generatePrimer ────────────────────────────────────────────────────────────

test('generatePrimer: writes .claude/CLAUDE.md with framework and language', () => {
  const dir       = tmpDir();
  const skillsDir = path.join(dir, '.agents', 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });

  const profile = { framework: 'next.js', language: 'typescript', detectedSkills: [] };
  generatePrimer(dir, profile, []);

  const claudeMd = path.join(dir, '.claude', 'CLAUDE.md');
  assert.ok(fs.existsSync(claudeMd), '.claude/CLAUDE.md should be created');

  const content = fs.readFileSync(claudeMd, 'utf8');
  assert.ok(content.includes('next.js'), 'should include framework');
  assert.ok(content.includes('typescript'), 'should include language');

  fs.rmSync(dir, { recursive: true });
});

test('generatePrimer: lists all installed skills', () => {
  const dir       = tmpDir();
  const skillsDir = path.join(dir, '.agents', 'skills');
  makeSkill(skillsDir, 'grill-me');
  makeSkill(skillsDir, 'react-query');
  makeSkill(skillsDir, 'security-and-hardening');

  const profile = { framework: 'vite', language: 'typescript', detectedSkills: [] };
  generatePrimer(dir, profile, ['grill-me', 'react-query', 'security-and-hardening']);

  const content = fs.readFileSync(path.join(dir, '.claude', 'CLAUDE.md'), 'utf8');
  assert.ok(content.includes('grill-me'), 'should list grill-me');
  assert.ok(content.includes('react-query'), 'should list react-query');
  assert.ok(content.includes('security-and-hardening'), 'should list security-and-hardening');

  fs.rmSync(dir, { recursive: true });
});

test('generatePrimer: lists available slash commands', () => {
  const dir       = tmpDir();
  const skillsDir = path.join(dir, '.agents', 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });

  // Create a command file so primer can detect it
  const cmdsDir = path.join(dir, '.agents', 'commands');
  fs.mkdirSync(cmdsDir, { recursive: true });
  fs.writeFileSync(path.join(cmdsDir, 'ship.md'), '# /ship\n', 'utf8');
  fs.writeFileSync(path.join(cmdsDir, 'grill-me.md'), '# /grill-me\n', 'utf8');

  const profile = { framework: 'unknown', language: 'javascript', detectedSkills: [] };
  generatePrimer(dir, profile, []);

  const content = fs.readFileSync(path.join(dir, '.claude', 'CLAUDE.md'), 'utf8');
  assert.ok(content.includes('/ship'), 'should list /ship command');
  assert.ok(content.includes('/grill-me'), 'should list /grill-me command');

  fs.rmSync(dir, { recursive: true });
});

test('generatePrimer: second run updates file without duplicating sections', () => {
  const dir       = tmpDir();
  const skillsDir = path.join(dir, '.agents', 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });

  const profile = { framework: 'vite', language: 'typescript', detectedSkills: [] };
  generatePrimer(dir, profile, ['react-query']);
  generatePrimer(dir, profile, ['react-query', 'grill-me']);

  const content = fs.readFileSync(path.join(dir, '.claude', 'CLAUDE.md'), 'utf8');
  // Skills section should appear exactly once
  const count = (content.match(/## Active Skills/g) || []).length;
  assert.equal(count, 1, '## Active Skills section should appear exactly once');
  assert.ok(content.includes('grill-me'), 'second run should include new skill');

  fs.rmSync(dir, { recursive: true });
});

test('generatePrimer: creates .claude/ directory if it does not exist', () => {
  const dir     = tmpDir();
  const profile = { framework: 'unknown', language: 'javascript', detectedSkills: [] };
  generatePrimer(dir, profile, []);

  assert.ok(fs.existsSync(path.join(dir, '.claude')), '.claude/ dir should be created');

  fs.rmSync(dir, { recursive: true });
});

// ── Slice 6: Cursor + Copilot output files ────────────────────────────────────

test('generatePrimer: writes .cursor/.cursorrules alongside CLAUDE.md', () => {
  const dir     = tmpDir();
  const profile = { framework: 'next.js', language: 'typescript', detectedSkills: [] };
  generatePrimer(dir, profile, ['grill-me', 'security-and-hardening']);

  const cursorrules = path.join(dir, '.cursor', '.cursorrules');
  assert.ok(fs.existsSync(cursorrules), '.cursor/.cursorrules should be created');

  const content = fs.readFileSync(cursorrules, 'utf8');
  assert.ok(content.includes('grill-me'), 'cursorrules should list grill-me');
  assert.ok(content.includes('security-and-hardening'), 'cursorrules should list security-and-hardening');
  assert.ok(content.includes('next.js'), 'cursorrules should include framework');

  fs.rmSync(dir, { recursive: true });
});

test('generatePrimer: writes .github/copilot-instructions.md alongside CLAUDE.md', () => {
  const dir     = tmpDir();
  const profile = { framework: 'vite', language: 'javascript', detectedSkills: [] };
  generatePrimer(dir, profile, ['react-query']);

  const copilotMd = path.join(dir, '.github', 'copilot-instructions.md');
  assert.ok(fs.existsSync(copilotMd), '.github/copilot-instructions.md should be created');

  const content = fs.readFileSync(copilotMd, 'utf8');
  assert.ok(content.includes('react-query'), 'copilot instructions should list react-query');
  assert.ok(content.includes('vite'), 'copilot instructions should include framework');

  fs.rmSync(dir, { recursive: true });
});

test('generatePrimer: all 3 files list the same skills', () => {
  const dir     = tmpDir();
  const profile = { framework: 'vite', language: 'typescript', detectedSkills: [] };
  const skills  = ['grill-me', 'react-query', 'security-and-hardening'];
  generatePrimer(dir, profile, skills);

  const claudeMd   = fs.readFileSync(path.join(dir, '.claude', 'CLAUDE.md'), 'utf8');
  const cursorrules = fs.readFileSync(path.join(dir, '.cursor', '.cursorrules'), 'utf8');
  const copilotMd  = fs.readFileSync(path.join(dir, '.github', 'copilot-instructions.md'), 'utf8');

  for (const skill of skills) {
    assert.ok(claudeMd.includes(skill),    `CLAUDE.md should include ${skill}`);
    assert.ok(cursorrules.includes(skill),  `.cursorrules should include ${skill}`);
    assert.ok(copilotMd.includes(skill),   `copilot-instructions.md should include ${skill}`);
  }

  fs.rmSync(dir, { recursive: true });
});

test('generatePrimer: second run updates cursorrules without duplicating sections', () => {
  const dir     = tmpDir();
  const profile = { framework: 'vite', language: 'typescript', detectedSkills: [] };
  generatePrimer(dir, profile, ['react-query']);
  generatePrimer(dir, profile, ['react-query', 'grill-me']);

  const content = fs.readFileSync(path.join(dir, '.cursor', '.cursorrules'), 'utf8');
  const count   = (content.match(/## Active Skills/g) || []).length;
  assert.equal(count, 1, '## Active Skills should appear once in cursorrules on re-run');
  assert.ok(content.includes('grill-me'), 'second run should include new skill in cursorrules');

  fs.rmSync(dir, { recursive: true });
});

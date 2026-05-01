'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { writeManifest, readManifest, manifestExists, scanInstalledSkills, diffManifest, detectManifestDrift } = require('../src/core/manifest');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-test-'));
}

test('writeManifest creates .skills.json with correct shape', () => {
  const dir    = tmpDir();
  const skills = [
    { name: 'grill-me',    version: '1.2.0' },
    { name: 'react-query', version: '2.1.0' },
  ];

  writeManifest(dir, 'frontend', skills);

  const manifestPath = path.join(dir, '.skills.json');
  assert.ok(fs.existsSync(manifestPath), '.skills.json should be created');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '1.0');
  assert.equal(manifest.role, 'frontend');
  assert.deepEqual(manifest.skills, skills);

  fs.rmSync(dir, { recursive: true });
});

test('readManifest returns null when no manifest exists', () => {
  const dir = tmpDir();
  assert.equal(readManifest(dir), null);
  fs.rmSync(dir, { recursive: true });
});

test('readManifest returns parsed manifest when it exists', () => {
  const dir    = tmpDir();
  const skills = [{ name: 'grill-me', version: '1.2.0' }];

  writeManifest(dir, 'backend', skills);
  const result = readManifest(dir);

  assert.equal(result.version, '1.0');
  assert.equal(result.role, 'backend');
  assert.deepEqual(result.skills, skills);

  fs.rmSync(dir, { recursive: true });
});

test('manifestExists returns false when manifest not present', () => {
  const dir = tmpDir();
  assert.equal(manifestExists(dir), false);
  fs.rmSync(dir, { recursive: true });
});

test('manifestExists returns true when manifest is present', () => {
  const dir    = tmpDir();
  const skills = [{ name: 'test-skill', version: '1.0.0' }];
  writeManifest(dir, 'full', skills);
  assert.equal(manifestExists(dir), true);
  fs.rmSync(dir, { recursive: true });
});

test('scanInstalledSkills returns empty array when no skills directory', () => {
  const dir = tmpDir();
  const result = scanInstalledSkills(path.join(dir, 'nonexistent'));
  assert.deepEqual(result, []);
  fs.rmSync(dir, { recursive: true });
});

test('scanInstalledSkills scans skills directory and reads .version files', () => {
  const dir = tmpDir();
  const skillsDir = path.join(dir, 'skills');
  fs.mkdirSync(skillsDir);

  // Create two skills with .version files
  fs.mkdirSync(path.join(skillsDir, 'grill-me'));
  fs.writeFileSync(path.join(skillsDir, 'grill-me', '.version'), '1.0.0\n');

  fs.mkdirSync(path.join(skillsDir, 'react-query'));
  fs.writeFileSync(path.join(skillsDir, 'react-query', '.version'), '2.1.0\n');

  const result = scanInstalledSkills(skillsDir);
  assert.equal(result.length, 2);
  assert.deepEqual(
    result.sort((a, b) => a.name.localeCompare(b.name)),
    [
      { name: 'grill-me', version: '1.0.0' },
      { name: 'react-query', version: '2.1.0' },
    ]
  );

  fs.rmSync(dir, { recursive: true });
});

test('diffManifest: all skills in manifest are installed (current)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
  ];

  const result = diffManifest(manifestSkills, installedSkills);
  assert.deepEqual(result.toInstall, []);
  assert.deepEqual(result.toUpdate, []);
  assert.deepEqual(result.current, manifestSkills);
  assert.deepEqual(result.extra, []);
});

test('diffManifest: manifest has skills not yet installed (toInstall)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
    { name: 'test-writing', version: '1.5.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
  ];

  const result = diffManifest(manifestSkills, installedSkills);
  assert.deepEqual(result.toInstall, [{ name: 'test-writing', version: '1.5.0' }]);
  assert.deepEqual(result.toUpdate, []);
  assert.deepEqual(result.current.length, 2);
  assert.deepEqual(result.extra, []);
});

test('diffManifest: installed skills not in manifest (extra)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '1.0.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
    { name: 'old-skill', version: '0.9.0' },
  ];

  const result = diffManifest(manifestSkills, installedSkills);
  assert.deepEqual(result.toInstall, []);
  assert.deepEqual(result.toUpdate, []);
  assert.deepEqual(result.current.length, 1);
  assert.deepEqual(
    result.extra.sort((a, b) => a.name.localeCompare(b.name)),
    [
      { name: 'old-skill', version: '0.9.0' },
      { name: 'react-query', version: '2.1.0' },
    ]
  );
});

test('diffManifest: version mismatch (toUpdate)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '2.0.0' },
    { name: 'react-query', version: '2.1.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
  ];

  const result = diffManifest(manifestSkills, installedSkills);
  assert.deepEqual(result.toInstall, []);
  assert.deepEqual(result.toUpdate, [
    { name: 'grill-me', manifestVersion: '2.0.0', installedVersion: '1.0.0' },
  ]);
  assert.deepEqual(result.current.length, 1);
  assert.deepEqual(result.extra, []);
});

test('diffManifest: complex scenario (mix of all categories)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.2.0' },
    { name: 'test-writing', version: '1.5.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
    { name: 'old-skill', version: '0.9.0' },
  ];

  const result = diffManifest(manifestSkills, installedSkills);
  assert.deepEqual(result.toInstall, [{ name: 'test-writing', version: '1.5.0' }]);
  assert.deepEqual(result.toUpdate, [
    { name: 'react-query', manifestVersion: '2.2.0', installedVersion: '2.1.0' },
  ]);
  assert.deepEqual(result.current, [{ name: 'grill-me', version: '1.0.0' }]);
  assert.deepEqual(result.extra, [{ name: 'old-skill', version: '0.9.0' }]);
});

test('diffManifest: empty manifest and empty installed (all clear)', () => {
  const manifestSkills = [];
  const installedSkills = [];

  const result = diffManifest(manifestSkills, installedSkills);
  assert.deepEqual(result.toInstall, []);
  assert.deepEqual(result.toUpdate, []);
  assert.deepEqual(result.current, []);
  assert.deepEqual(result.extra, []);
});

test('detectManifestDrift: no drift when all skills match', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'react-query', version: '2.1.0' },
  ];

  const result = detectManifestDrift(manifestSkills, installedSkills);
  assert.equal(result.hasDrift, false);
  assert.deepEqual(result.issues, []);
});

test('detectManifestDrift: detects missing skills (toInstall)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'test-writing', version: '1.5.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
  ];

  const result = detectManifestDrift(manifestSkills, installedSkills);
  assert.equal(result.hasDrift, true);
  assert.ok(result.issues.some(i => i.type === 'missing'));
});

test('detectManifestDrift: detects version mismatches (toUpdate)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '2.0.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
  ];

  const result = detectManifestDrift(manifestSkills, installedSkills);
  assert.equal(result.hasDrift, true);
  assert.ok(result.issues.some(i => i.type === 'version-mismatch'));
});

test('detectManifestDrift: detects extra skills (extra)', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '1.0.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'old-skill', version: '0.9.0' },
  ];

  const result = detectManifestDrift(manifestSkills, installedSkills);
  assert.equal(result.hasDrift, true);
  assert.ok(result.issues.some(i => i.type === 'extra'));
});

test('detectManifestDrift: detects multiple drift types together', () => {
  const manifestSkills = [
    { name: 'grill-me', version: '2.0.0' },
    { name: 'test-writing', version: '1.5.0' },
  ];
  const installedSkills = [
    { name: 'grill-me', version: '1.0.0' },
    { name: 'old-skill', version: '0.9.0' },
  ];

  const result = detectManifestDrift(manifestSkills, installedSkills);
  assert.equal(result.hasDrift, true);
  assert.equal(result.issues.length >= 3, true);
  assert.ok(result.issues.some(i => i.type === 'version-mismatch'));
  assert.ok(result.issues.some(i => i.type === 'missing'));
  assert.ok(result.issues.some(i => i.type === 'extra'));
});

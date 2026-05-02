'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { compressObservations } = require('../src/core/memory-compressor');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'compressor-test-'));
}

function seedObservation(obsDir, name, data) {
  fs.mkdirSync(obsDir, { recursive: true });
  fs.writeFileSync(
    path.join(obsDir, `${name}.json`),
    JSON.stringify({ tool: data.tool || 'scan', outcome: data.outcome || 'success', summary: data.summary, timestamp: new Date().toISOString() }, null, 2),
    'utf8',
  );
}

// ── compressObservations ──────────────────────────────────────────────────────

test('compressObservations: creates at least one learning from 5 observations', () => {
  const dir         = tmpDir();
  const obsDir      = path.join(dir, 'observations');
  const learningsDir = path.join(dir, 'learnings');

  for (let i = 0; i < 5; i++) {
    seedObservation(obsDir, `obs-${i}`, { summary: `Observation ${i}: use typescript strict mode.` });
  }

  compressObservations(obsDir, learningsDir);

  const files = fs.readdirSync(learningsDir).filter(f => f.endsWith('.json'));
  assert.ok(files.length >= 1, 'should produce at least one learning file');

  fs.rmSync(dir, { recursive: true });
});

test('compressObservations: each learning file has required fields', () => {
  const dir          = tmpDir();
  const obsDir       = path.join(dir, 'observations');
  const learningsDir = path.join(dir, 'learnings');

  seedObservation(obsDir, 'obs-1', { summary: 'Always use zod for validation at API boundaries.' });
  seedObservation(obsDir, 'obs-2', { summary: 'Zod schemas catch runtime errors before they propagate.' });
  seedObservation(obsDir, 'obs-3', { summary: 'Prefer zod over manual type checks in handlers.' });

  compressObservations(obsDir, learningsDir);

  const files = fs.readdirSync(learningsDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  const learning = JSON.parse(fs.readFileSync(path.join(learningsDir, files[0]), 'utf8'));

  assert.ok(learning.title,     'learning must have a title');
  assert.ok(Array.isArray(learning.tags), 'learning must have tags array');
  assert.ok(learning.content,   'learning must have content');
  assert.ok(learning.timestamp, 'learning must have timestamp');

  fs.rmSync(dir, { recursive: true });
});

test('compressObservations: updates index.json with learning metadata', () => {
  const dir          = tmpDir();
  const obsDir       = path.join(dir, 'observations');
  const learningsDir = path.join(dir, 'learnings');

  seedObservation(obsDir, 'obs-1', { summary: 'Use async/await over callbacks.' });
  seedObservation(obsDir, 'obs-2', { summary: 'Async/await improves error handling.' });
  seedObservation(obsDir, 'obs-3', { summary: 'Always await promises in express handlers.' });

  compressObservations(obsDir, learningsDir);

  const indexPath = path.join(learningsDir, 'index.json');
  assert.ok(fs.existsSync(indexPath), 'index.json should be created');

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  assert.ok(Array.isArray(index), 'index.json should be an array');
  assert.ok(index.length >= 1, 'index should have at least one entry');

  const entry = index[0];
  assert.ok(entry.title,     'index entry must have title');
  assert.ok(entry.file,      'index entry must have file');
  assert.ok(Array.isArray(entry.tags), 'index entry must have tags');
  assert.ok(entry.timestamp, 'index entry must have timestamp');

  fs.rmSync(dir, { recursive: true });
});

test('compressObservations: second run with same input produces no duplicates', () => {
  const dir          = tmpDir();
  const obsDir       = path.join(dir, 'observations');
  const learningsDir = path.join(dir, 'learnings');

  seedObservation(obsDir, 'obs-1', { summary: 'Prefer const over let.' });
  seedObservation(obsDir, 'obs-2', { summary: 'Const signals immutability to readers.' });
  seedObservation(obsDir, 'obs-3', { summary: 'Use const by default, let only when reassigning.' });

  compressObservations(obsDir, learningsDir);
  compressObservations(obsDir, learningsDir);

  const index = JSON.parse(fs.readFileSync(path.join(learningsDir, 'index.json'), 'utf8'));
  const titles = index.map(e => e.title);
  const unique  = new Set(titles);
  assert.equal(unique.size, titles.length, 'no duplicate titles in index after two runs');

  fs.rmSync(dir, { recursive: true });
});

test('compressObservations: returns empty and writes no files when obsDir is empty', () => {
  const dir          = tmpDir();
  const obsDir       = path.join(dir, 'observations');
  const learningsDir = path.join(dir, 'learnings');
  fs.mkdirSync(obsDir, { recursive: true });

  compressObservations(obsDir, learningsDir);

  // learnings dir may not even exist
  const files = fs.existsSync(learningsDir)
    ? fs.readdirSync(learningsDir).filter(f => f.endsWith('.json'))
    : [];
  assert.equal(files.length, 0, 'no learning files should be written for empty input');

  fs.rmSync(dir, { recursive: true });
});

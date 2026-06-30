'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { searchLearnings, memoryStatus, injectLearnings } = require('../src/core/memory-search');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'memsearch-test-'));
}

function seedLearning(learningsDir, filename, data) {
  fs.mkdirSync(learningsDir, { recursive: true });
  fs.writeFileSync(
    path.join(learningsDir, filename),
    JSON.stringify({ title: data.title, tags: data.tags, content: data.content, timestamp: new Date().toISOString() }, null, 2),
    'utf8',
  );
}

function seedIndex(learningsDir, entries) {
  fs.writeFileSync(
    path.join(learningsDir, 'index.json'),
    JSON.stringify(entries, null, 2),
    'utf8',
  );
}

function seedObservation(obsDir, filename) {
  fs.mkdirSync(obsDir, { recursive: true });
  fs.writeFileSync(
    path.join(obsDir, filename),
    JSON.stringify({ tool: 'scan', outcome: 'success', summary: 'Test obs.', timestamp: new Date().toISOString() }, null, 2),
    'utf8',
  );
}

// ── searchLearnings ───────────────────────────────────────────────────────────

test('searchLearnings: returns learnings tagged with query', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, 'learnings');

  seedLearning(learningsDir, 'ts-strict.json',  { title: 'TS strict mode', tags: ['typescript', 'strict'], content: 'Enable strict mode.' });
  seedLearning(learningsDir, 'react-hooks.json', { title: 'React hooks', tags: ['react', 'hooks'], content: 'Use hooks for state.' });
  seedIndex(learningsDir, [
    { title: 'TS strict mode',  file: 'ts-strict.json',   tags: ['typescript', 'strict'], timestamp: new Date().toISOString() },
    { title: 'React hooks',     file: 'react-hooks.json', tags: ['react', 'hooks'],       timestamp: new Date().toISOString() },
  ]);

  const results = searchLearnings(learningsDir, 'typescript');
  assert.equal(results.length, 1, 'should return only typescript-tagged learning');
  assert.equal(results[0].title, 'TS strict mode');

  fs.rmSync(dir, { recursive: true });
});

test('searchLearnings: returns learnings matching query in content', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, 'learnings');

  seedLearning(learningsDir, 'zod.json',   { title: 'Use Zod', tags: ['validation'], content: 'Always validate with zod at boundaries.' });
  seedLearning(learningsDir, 'other.json', { title: 'Other',   tags: ['misc'],       content: 'Unrelated content here.' });
  seedIndex(learningsDir, [
    { title: 'Use Zod', file: 'zod.json',   tags: ['validation'], timestamp: new Date().toISOString() },
    { title: 'Other',   file: 'other.json', tags: ['misc'],       timestamp: new Date().toISOString() },
  ]);

  const results = searchLearnings(learningsDir, 'zod');
  assert.equal(results.length, 1, 'should find learning by content match');
  assert.equal(results[0].title, 'Use Zod');

  fs.rmSync(dir, { recursive: true });
});

test('searchLearnings: returns empty array when no match', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, 'learnings');

  seedLearning(learningsDir, 'ts.json', { title: 'TypeScript', tags: ['typescript'], content: 'Use typescript.' });
  seedIndex(learningsDir, [
    { title: 'TypeScript', file: 'ts.json', tags: ['typescript'], timestamp: new Date().toISOString() },
  ]);

  const results = searchLearnings(learningsDir, 'python');
  assert.deepEqual(results, [], 'should return empty array for no match');

  fs.rmSync(dir, { recursive: true });
});

test('searchLearnings: returns empty array when learningsDir does not exist', () => {
  const dir = tmpDir();
  const results = searchLearnings(path.join(dir, 'nonexistent'), 'anything');
  assert.deepEqual(results, []);
  fs.rmSync(dir, { recursive: true });
});

// ── memoryStatus ──────────────────────────────────────────────────────────────

test('memoryStatus: returns correct observation and learning counts', () => {
  const dir          = tmpDir();
  // memoryStatus(workspaceDir) resolves .agents/memory/observations and .agents/memory/learnings
  const obsDir       = path.join(dir, '.agents', 'memory', 'observations');
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');

  seedObservation(obsDir, 'obs-1.json');
  seedObservation(obsDir, 'obs-2.json');
  seedObservation(obsDir, 'obs-3.json');

  const ts = new Date().toISOString();
  seedLearning(learningsDir, 'learn-1.json', { title: 'L1', tags: [], content: 'c' });
  seedIndex(learningsDir, [
    { title: 'L1', file: 'learn-1.json', tags: [], timestamp: ts },
  ]);

  const status = memoryStatus(dir);
  assert.equal(status.observationCount, 3, 'should count 3 observations');
  assert.equal(status.learningCount, 1, 'should count 1 learning');
  assert.ok(status.lastCompressed, 'should have lastCompressed timestamp');

  fs.rmSync(dir, { recursive: true });
});

test('memoryStatus: returns zeros when memory dirs are empty or missing', () => {
  const dir    = tmpDir();
  const status = memoryStatus(dir);
  assert.equal(status.observationCount, 0);
  assert.equal(status.learningCount, 0);
  assert.equal(status.lastCompressed, null);
  fs.rmSync(dir, { recursive: true });
});

// ── injectLearnings ───────────────────────────────────────────────────────────

test('injectLearnings: returns top-N learnings scored by context tags', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');

  seedLearning(learningsDir, 'react-1.json',    { title: 'React hooks pattern',    tags: ['react'],      content: 'Use hooks.' });
  seedLearning(learningsDir, 'react-2.json',    { title: 'React context API',      tags: ['react'],      content: 'Use context.' });
  seedLearning(learningsDir, 'ts-1.json',       { title: 'TS strict mode',         tags: ['typescript'], content: 'Enable strict.' });
  seedLearning(learningsDir, 'ts-2.json',       { title: 'TS generics',            tags: ['typescript'], content: 'Use generics.' });
  seedLearning(learningsDir, 'security-1.json', { title: 'Security hardening',     tags: ['security'],   content: 'Harden APIs.' });
  seedIndex(learningsDir, [
    { title: 'React hooks pattern', file: 'react-1.json',    tags: ['react'],      timestamp: new Date().toISOString() },
    { title: 'React context API',   file: 'react-2.json',    tags: ['react'],      timestamp: new Date().toISOString() },
    { title: 'TS strict mode',      file: 'ts-1.json',       tags: ['typescript'], timestamp: new Date().toISOString() },
    { title: 'TS generics',         file: 'ts-2.json',       tags: ['typescript'], timestamp: new Date().toISOString() },
    { title: 'Security hardening',  file: 'security-1.json', tags: ['security'],   timestamp: new Date().toISOString() },
  ]);

  // context tags simulate a React + TypeScript project
  const results = injectLearnings(dir, { contextTags: ['react', 'typescript'], topN: 3 });

  assert.equal(results.length, 3, 'should return exactly 3 learnings');
  const titles = results.map(r => r.title);
  assert.ok(
    titles.every(t => ['React hooks pattern', 'React context API', 'TS strict mode', 'TS generics'].includes(t)),
    'all returned learnings should be react or typescript tagged',
  );

  fs.rmSync(dir, { recursive: true });
});

test('injectLearnings: output fits in 200 tokens (rough word-count proxy)', () => {
  const dir          = tmpDir();
  const learningsDir = path.join(dir, '.agents', 'memory', 'learnings');

  for (let i = 0; i < 5; i++) {
    seedLearning(learningsDir, `l${i}.json`, { title: `Learning ${i}`, tags: ['react'], content: 'Short content.' });
  }
  seedIndex(learningsDir, Array.from({ length: 5 }, (_, i) => ({
    title: `Learning ${i}`, file: `l${i}.json`, tags: ['react'], timestamp: new Date().toISOString(),
  })));

  const results = injectLearnings(dir, { contextTags: ['react'], topN: 3 });
  const markdown = results.map(r => `## ${r.title}\ntags: ${r.tags.join(', ')}`).join('\n');
  const wordCount = markdown.split(/\s+/).length;

  assert.ok(wordCount < 200, `output word count ${wordCount} should be < 200`);

  fs.rmSync(dir, { recursive: true });
});

test('injectLearnings: returns empty array when no learnings dir', () => {
  const dir     = tmpDir();
  const results = injectLearnings(dir, { contextTags: ['react'], topN: 3 });
  assert.deepEqual(results, []);
  fs.rmSync(dir, { recursive: true });
});

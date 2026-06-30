'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { captureObservation } = require('../src/core/memory-capture');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'memory-test-'));
}

// ── captureObservation ────────────────────────────────────────────────────────

test('captureObservation: writes a .json file to observations dir', () => {
  const dir     = tmpDir();
  const obsDir  = path.join(dir, '.agents', 'memory', 'observations');

  captureObservation({ tool: 'scan', outcome: 'success', summary: 'No findings.' }, dir);

  assert.ok(fs.existsSync(obsDir), 'observations dir should be created');
  const files = fs.readdirSync(obsDir).filter(f => f.endsWith('.json'));
  assert.equal(files.length, 1, 'exactly one observation file should be written');

  fs.rmSync(dir, { recursive: true });
});

test('captureObservation: written file has required fields', () => {
  const dir = tmpDir();

  captureObservation({ tool: 'install', outcome: 'success', summary: 'Installed react-query.' }, dir);

  const obsDir = path.join(dir, '.agents', 'memory', 'observations');
  const file   = fs.readdirSync(obsDir)[0];
  const obs    = JSON.parse(fs.readFileSync(path.join(obsDir, file), 'utf8'));

  assert.equal(obs.tool, 'install');
  assert.equal(obs.outcome, 'success');
  assert.equal(obs.summary, 'Installed react-query.');
  assert.ok(obs.timestamp, 'should have a timestamp');
  assert.ok(typeof obs.timestamp === 'string', 'timestamp should be a string');

  fs.rmSync(dir, { recursive: true });
});

test('captureObservation: redacts sk- secrets from summary', () => {
  const dir = tmpDir();

  captureObservation({
    tool: 'scan',
    outcome: 'failure',
    summary: 'Found key sk-abc123secret in file.',
  }, dir);

  const obsDir = path.join(dir, '.agents', 'memory', 'observations');
  const file   = fs.readdirSync(obsDir)[0];
  const obs    = JSON.parse(fs.readFileSync(path.join(obsDir, file), 'utf8'));

  assert.ok(!obs.summary.includes('sk-abc123secret'), 'secret should be redacted');
  assert.ok(obs.summary.includes('[REDACTED]'), 'should replace with [REDACTED]');

  fs.rmSync(dir, { recursive: true });
});

test('captureObservation: redacts ghp_ token from summary', () => {
  const dir = tmpDir();

  captureObservation({
    tool: 'doctor',
    outcome: 'success',
    summary: 'Token ghp_abcdefghijklmnopqrstuvwxyz123456 found.',
  }, dir);

  const obsDir = path.join(dir, '.agents', 'memory', 'observations');
  const file   = fs.readdirSync(obsDir)[0];
  const obs    = JSON.parse(fs.readFileSync(path.join(obsDir, file), 'utf8'));

  assert.ok(!obs.summary.includes('ghp_'), 'github token should be redacted');

  fs.rmSync(dir, { recursive: true });
});

test('captureObservation: each call writes a separate file', () => {
  const dir = tmpDir();

  captureObservation({ tool: 'scan',    outcome: 'success', summary: 'Clean.' }, dir);
  captureObservation({ tool: 'install', outcome: 'success', summary: 'Done.'  }, dir);

  const obsDir = path.join(dir, '.agents', 'memory', 'observations');
  const files  = fs.readdirSync(obsDir).filter(f => f.endsWith('.json'));
  assert.equal(files.length, 2, 'two separate observation files should exist');

  fs.rmSync(dir, { recursive: true });
});

test('captureObservation: filename contains ISO timestamp', () => {
  const dir = tmpDir();

  captureObservation({ tool: 'doctor', outcome: 'success', summary: 'OK.' }, dir);

  const obsDir = path.join(dir, '.agents', 'memory', 'observations');
  const file   = fs.readdirSync(obsDir)[0];

  // Filename pattern: YYYY-MM-DDTHH-MM-SS-<random>.json
  assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(file), 'filename should start with ISO date');

  fs.rmSync(dir, { recursive: true });
});

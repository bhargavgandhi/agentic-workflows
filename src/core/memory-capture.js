'use strict';

const fs   = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{4,}/g,
  /sk-proj-[a-zA-Z0-9]{4,}/g,
  /AIza[0-9A-Za-z\-_]{35}/g,
  /AKIA[0-9A-Z]{16}/g,
  /ghp_[a-zA-Z0-9]{20,}/g,
  /xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}/g,
];

/**
 * Write a single observation to .agents/memory/observations/.
 *
 * @param {{ tool: string, outcome: string, summary: string }} observation
 * @param {string} [workspaceDir] - defaults to process.cwd()
 */
function captureObservation(observation, workspaceDir = process.cwd()) {
  const obsDir = path.join(workspaceDir, '.agents', 'memory', 'observations');
  fs.mkdirSync(obsDir, { recursive: true });

  const record = {
    tool:      observation.tool,
    outcome:   observation.outcome,
    summary:   _redact(observation.summary || ''),
    timestamp: new Date().toISOString(),
  };

  const filename = `${_isoFilestamp()}-${Math.random().toString(36).slice(2, 7)}.json`;
  fs.writeFileSync(path.join(obsDir, filename), JSON.stringify(record, null, 2), 'utf8');
}

function _redact(text) {
  let result = text;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

function _isoFilestamp() {
  return new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
}

module.exports = { captureObservation };

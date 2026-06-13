#!/usr/bin/env node
'use strict';

// PostToolUse hook (Edit|Write): when skills.json or a SKILL.md under
// .agents/skills/ changes, immediately re-run the manifest test suite so
// bundle/tombstone/anatomy regressions surface inline rather than only at
// install-time (doctor) or whenever someone remembers to run the suite.

const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);

  const cwd = payload.cwd || process.cwd();
  const relative = path.relative(cwd, filePath);
  const isRelevant = /^skills\.json$/.test(relative) ||
    /^\.agents\/skills\/.*\/SKILL\.md$/.test(relative);

  if (!isRelevant) process.exit(0);

  const result = spawnSync('node', ['--test', 'test/manifest.test.js'], {
    cwd,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    console.error(`manifest.test.js failed after editing ${relative}:\n`);
    console.error(result.stdout || '');
    console.error(result.stderr || '');
    process.exit(2);
  }

  process.exit(0);
});

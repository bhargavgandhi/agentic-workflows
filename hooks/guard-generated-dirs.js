#!/usr/bin/env node
'use strict';

// PreToolUse hook (Edit|Write): blocks edits to the top-level skills/ and
// recipes/ directories. These are generated mirrors of .agents/skills/ and
// .agents/recipes/, overwritten by `prepublishOnly` on every publish — any
// direct edit here is silently lost with no warning at edit time.

const path = require('path');

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
  const match = relative.match(/^(skills|recipes)([\\/]|$)/);

  if (match) {
    const source = relative.replace(/^(skills|recipes)/, '.agents/$1');
    console.error(
      `Blocked: "${relative}" is a generated mirror of "${source}", ` +
      `overwritten by \`prepublishOnly\` on every publish. Edit "${source}" instead.`
    );
    process.exit(2);
  }

  process.exit(0);
});

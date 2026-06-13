'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const matter   = require('gray-matter');

const SUBAGENTS_DIR = path.join(__dirname, '..', '.agents', 'subagents');

const EXPECTED = {
  'code-review-analyzer':   { tools: ['Read', 'Grep', 'Glob', 'Bash'] },
  'security-auditor':       { tools: ['Read', 'Grep', 'Glob', 'Bash'] },
  'test-coverage-analyzer': { tools: ['Read', 'Grep', 'Glob', 'Bash', 'Write'] },
};

for (const [name, expected] of Object.entries(EXPECTED)) {
  test(`${name}.md has valid Claude Code subagent frontmatter`, () => {
    const filePath = path.join(SUBAGENTS_DIR, `${name}.md`);
    assert.ok(fs.existsSync(filePath), `${name}.md should exist in .agents/subagents/`);

    const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));

    assert.equal(data.name, name);
    assert.ok(data.description && data.description.length > 0, 'description should be non-empty');
    assert.match(data.description, /do not invoke directly/i);

    const tools = data.tools.split(',').map(t => t.trim());
    assert.deepEqual(tools, expected.tools);

    assert.match(content, /## Summary/);
    assert.match(content, /## Findings/);
    assert.match(content, /Gate: PASS \| FAIL/);
  });
}

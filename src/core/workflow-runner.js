'use strict';

const { spawn } = require('child_process');

// File extensions that count as source code (trigger security scan)
const SOURCE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.py', '.rb', '.go', '.java', '.cs']);

// Extensions that are docs/config only
const DOCS_EXTENSIONS  = new Set(['.md', '.mdx', '.txt', '.rst']);
const CONFIG_EXTENSIONS = new Set(['.json', '.yaml', '.yml', '.toml', '.ini', '.env', '.eslintrc', '.prettierrc']);

/**
 * Parse `<!-- parallel-group: start/end -->` and `<!-- condition: <name> -->`
 * directives from a workflow markdown string.
 *
 * Returns an array of directive blocks, each with:
 *   { type: 'parallel-group'|'condition', condition?: string, commands: string[] }
 */
function parseDirectives(markdown) {
  const lines   = markdown.split('\n');
  const results = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // parallel-group block
    if (line === '<!-- parallel-group: start -->') {
      const commands = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '<!-- parallel-group: end -->') {
        const cmd = _extractBashCommand(lines, i);
        if (cmd !== null) {
          commands.push(cmd.command);
          i = cmd.nextIndex;
        } else {
          i++;
        }
      }
      results.push({ type: 'parallel-group', commands });
      i++;
      continue;
    }

    // condition block — extends until next directive or end of string
    const condMatch = line.match(/^<!--\s*condition:\s*(.+?)\s*-->$/);
    if (condMatch) {
      const condition = condMatch[1];
      const commands  = [];
      i++;
      while (i < lines.length) {
        const l = lines[i].trim();
        // Stop at next directive
        if (l.startsWith('<!--')) break;
        const cmd = _extractBashCommand(lines, i);
        if (cmd !== null) {
          commands.push(cmd.command);
          i = cmd.nextIndex;
        } else {
          i++;
        }
      }
      results.push({ type: 'condition', condition, commands });
      continue;
    }

    i++;
  }

  return results;
}

/**
 * Evaluate a named condition against the provided context.
 *
 * @param {string} conditionName
 * @param {{ changedFiles?: string[] }} context
 * @returns {boolean}
 */
function evaluateCondition(conditionName, context = {}) {
  if (conditionName === 'source-files-changed') {
    const files = context.changedFiles || [];
    return files.some(f => {
      const ext = _ext(f);
      return SOURCE_EXTENSIONS.has(ext) && !DOCS_EXTENSIONS.has(ext) && !CONFIG_EXTENSIONS.has(ext);
    });
  }
  // Unknown condition: default to true (run the block)
  return true;
}

/**
 * Run a list of shell commands in parallel, buffering each one's output.
 *
 * @param {string[]} commands
 * @param {{ cwd?: string }} options
 * @returns {Promise<Array<{ command: string, exitCode: number, stdout: string, stderr: string }>>}
 */
function runParallelGroup(commands, { cwd = process.cwd() } = {}) {
  const promises = commands.map(command => _runCommand(command, cwd));
  return Promise.all(promises);
}

// ── private ───────────────────────────────────────────────────────────────────

function _runCommand(command, cwd) {
  return new Promise(resolve => {
    let stdout = '';
    let stderr = '';

    const child = spawn(command, { shell: true, cwd });

    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });

    child.on('close', exitCode => {
      resolve({ command, exitCode: exitCode ?? 1, stdout, stderr });
    });

    child.on('error', err => {
      resolve({ command, exitCode: 1, stdout, stderr: err.message });
    });
  });
}

function _extractBashCommand(lines, startIndex) {
  const line = lines[startIndex].trim();
  if (line !== '```bash' && line !== '```sh') return null;

  const cmdLines = [];
  let i = startIndex + 1;
  while (i < lines.length && lines[i].trim() !== '```') {
    cmdLines.push(lines[i]);
    i++;
  }
  if (cmdLines.length === 0) return null;

  return { command: cmdLines.join('\n').trim(), nextIndex: i + 1 };
}

function _ext(filePath) {
  const dot = filePath.lastIndexOf('.');
  return dot >= 0 ? filePath.slice(dot).toLowerCase() : '';
}

module.exports = { parseDirectives, evaluateCondition, runParallelGroup };

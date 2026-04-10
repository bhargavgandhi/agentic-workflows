'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Token counting engine using character-based approximation.
 *
 * WHY NOT js-tiktoken?
 * js-tiktoken uses OpenAI's BPE tokenizer which is ~5-10% off for Claude models.
 * The character-ratio heuristic (chars / 4 ≈ tokens) is model-agnostic,
 * zero-dependency, and good enough for budget tracking (±10% accuracy).
 *
 * For exact counts (billing), use the model provider's own tokenizer.
 * This tool is for "am I within budget?" — not "exactly how much will I pay?".
 */

// Model → context window mapping (tokens)
const MODEL_CONTEXT_WINDOWS = {
  'claude-sonnet-4-20250514': 200000,
  'claude-opus-4-20250514':   200000,
  'gpt-4o':                   128000,
  'gpt-4-turbo':              128000,
  'gemini-2.5-pro':          1000000,
  'gemini-2.5-flash':        1000000,
  'custom':                   200000, // fallback
};

const DEFAULT_MODEL          = 'claude-sonnet-4-20250514';
const DEFAULT_BUDGET_PERCENT = 40;

// Characters per token (heuristic; industry-standard approximation)
const CHARS_PER_TOKEN = 4;

// File extensions to count; skip binaries, lock files, etc.
const COUNTABLE_EXTENSIONS = new Set([
  '.md', '.txt', '.js', '.ts', '.tsx', '.jsx', '.json', '.yaml', '.yml',
  '.css', '.html', '.sh', '.mjs', '.cjs',
]);

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Approximate token count for a string.
 * @param {string} text
 * @returns {number}
 */
function countTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Count tokens in a single file.
 * @param {string} filePath
 * @returns {{ path: string, tokens: number, lines: number, skipped: boolean }}
 */
function countFileTokens(filePath) {
  if (!fs.existsSync(filePath)) {
    return { path: filePath, tokens: 0, lines: 0, skipped: true };
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!COUNTABLE_EXTENSIONS.has(ext)) {
    return { path: filePath, tokens: 0, lines: 0, skipped: true };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      path:    filePath,
      tokens:  countTokens(content),
      lines:   content.split('\n').length,
      skipped: false,
    };
  } catch {
    return { path: filePath, tokens: 0, lines: 0, skipped: true };
  }
}

/**
 * Recursively count tokens in a directory.
 * @param {string} dirPath
 * @returns {{ total: number, files: Array<{path, tokens, lines, skipped}> }}
 */
function countDirectoryTokens(dirPath) {
  if (!fs.existsSync(dirPath)) return { total: 0, files: [] };

  const files = [];
  _walkDir(dirPath, files);

  const total = files.reduce((sum, f) => sum + f.tokens, 0);
  return { total, files };
}

/**
 * Get the token budget for a given model and percent cap.
 * @param {string}  model   - Model identifier key (see MODEL_CONTEXT_WINDOWS)
 * @param {number}  percent - Budget percent (default: 40)
 * @returns {{ model, window, budget, percent }}
 */
function getContextBudget(model = DEFAULT_MODEL, percent = DEFAULT_BUDGET_PERCENT) {
  const window = MODEL_CONTEXT_WINDOWS[model] || MODEL_CONTEXT_WINDOWS[DEFAULT_MODEL];
  const budget = Math.floor(window * percent / 100);
  return { model, window, budget, percent };
}

/**
 * Measure the full token cost of a skill (SKILL.md + all files in the skill dir).
 * @param {string} skillsDir  - Absolute path to .agents/skills/
 * @param {string} skillName
 * @returns {{ skill: string, tokens: number, files: number }}
 */
function measureSkillContext(skillsDir, skillName) {
  const skillPath = path.join(skillsDir, skillName);
  if (!fs.existsSync(skillPath)) return { skill: skillName, tokens: 0, files: 0 };

  const { total, files } = countDirectoryTokens(skillPath);
  return {
    skill:  skillName,
    tokens: total,
    files:  files.filter(f => !f.skipped).length,
  };
}

/**
 * Read the token budget from .agents/project-profile.json if present.
 * Falls back to defaults.
 * @param {string} workspacePath
 * @returns {{ model, window, budget, percent }}
 */
function loadProfileBudget(workspacePath) {
  const profilePath = path.join(workspacePath, '.agents', 'project-profile.json');
  if (fs.existsSync(profilePath)) {
    try {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
      const tb = profile.tokenBudget;
      if (tb) {
        return {
          model:    tb.model || DEFAULT_MODEL,
          window:   tb.contextWindow || 200000,
          budget:   tb.budgetTokens || 80000,
          percent:  tb.budgetPercent || DEFAULT_BUDGET_PERCENT,
        };
      }
    } catch { /* fall through */ }
  }
  return getContextBudget(DEFAULT_MODEL, DEFAULT_BUDGET_PERCENT);
}

// ── Private helpers ────────────────────────────────────────────────────────────

function _walkDir(dir, results) {
  const SKIP_DIRS = new Set(['node_modules', '.git', '.cache', 'dist', 'build', '__pycache__']);

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      _walkDir(full, results);
    } else if (entry.isFile()) {
      results.push(countFileTokens(full));
    }
  }
}

module.exports = {
  countTokens,
  countFileTokens,
  countDirectoryTokens,
  getContextBudget,
  measureSkillContext,
  loadProfileBudget,
  MODEL_CONTEXT_WINDOWS,
  DEFAULT_BUDGET_PERCENT,
};

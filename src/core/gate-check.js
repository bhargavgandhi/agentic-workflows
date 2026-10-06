'use strict';

const fs     = require('fs');
const path   = require('path');
const matter = require('gray-matter');

/**
 * Gate 1 enforcement.
 *
 * The workflow's value is that an agent stops at a gate and a human approves
 * before implementation starts. Prose in a workflow file cannot enforce that —
 * a model can talk itself past it. This module can, because it runs in git and
 * in CI, which every agent and every tool has to go through.
 *
 * Deliberately conservative about what it blocks:
 *   - docs, plans and config-only commits always pass
 *   - only source-code changes require an approved plan
 *   - sensitive paths additionally require the plan to name them
 *
 * It is portable by design: no Claude Code, no model, no network. A git
 * pre-commit hook gives fast local feedback; the CI job is the real gate,
 * because `--no-verify` cannot reach it.
 */

// Changing one of these means implementation has started.
const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
  '.py', '.rb', '.go', '.java', '.kt', '.cs', '.php', '.rs', '.swift',
  '.vue', '.svelte',
]);

// Paths the agent must never touch unless the approved plan names them.
const SENSITIVE_PATTERNS = [
  { re: /(^|\/)\.env(\.|$)/,            label: '.env file' },
  { re: /^\.github\/workflows\//,       label: 'CI workflow' },
  { re: /(^|\/)Dockerfile$/,            label: 'Dockerfile' },
  { re: /(^|\/)docker-compose\.ya?ml$/, label: 'compose file' },
];

const PROTECTED_BRANCHES = new Set(['main', 'master', 'develop']);

function isSourceFile(relPath) {
  return SOURCE_EXTENSIONS.has(path.extname(relPath).toLowerCase());
}

function sensitiveMatches(relPath) {
  return SENSITIVE_PATTERNS.filter(p => p.re.test(relPath)).map(p => p.label);
}

/**
 * Read every plan in `planDir` and return those approved for `branch`.
 *
 * A plan is approved when its frontmatter carries BOTH:
 *   approved: true
 *   branch: <the branch the work happens on>
 *
 * Requiring the branch match is what stops one approved plan from unlocking
 * every future branch in the repo.
 *
 * @param {string} planDir
 * @param {string} branch
 * @returns {Array<{ file: string, touches: string[] }>}
 */
function findApprovedPlans(planDir, branch) {
  if (!fs.existsSync(planDir)) return [];

  const approved = [];
  for (const entry of fs.readdirSync(planDir)) {
    if (!entry.endsWith('.md')) continue;
    const full = path.join(planDir, entry);

    let data;
    try {
      ({ data } = matter(fs.readFileSync(full, 'utf8')));
    } catch {
      continue; // unparseable frontmatter is not an approval
    }

    if (data.approved !== true) continue;
    if (String(data.branch || '').trim() !== branch) continue;

    const touches = Array.isArray(data.touches) ? data.touches.map(String) : [];
    approved.push({ file: path.join(path.basename(planDir), entry), touches });
  }
  return approved;
}

/**
 * @param {object} opts
 * @param {string[]} opts.files   - changed paths, repo-relative, POSIX separators
 * @param {string}   opts.branch  - current branch name
 * @param {string}   [opts.planDir='plans'] - directory holding plan artifacts
 * @param {string}   [opts.cwd=process.cwd()]
 * @returns {{ ok: boolean, violations: Array<{ code: string, message: string }>, checked: number }}
 */
function checkGate(opts) {
  const {
    files   = [],
    branch  = '',
    planDir = 'plans',
    cwd     = process.cwd(),
  } = opts;

  const violations = [];

  if (PROTECTED_BRANCHES.has(branch)) {
    violations.push({
      code: 'protected-branch',
      message:
        `Refusing to commit directly to "${branch}". ` +
        `Create a branch first: git checkout -b feat/<semantic-name>`,
    });
  }

  const sourceFiles = files.filter(isSourceFile);
  const sensitive   = files
    .map(f => ({ file: f, labels: sensitiveMatches(f) }))
    .filter(x => x.labels.length > 0);

  // Nothing implementation-shaped and nothing sensitive: always allowed, so
  // writing the plan itself is never blocked by the plan not existing yet.
  if (sourceFiles.length === 0 && sensitive.length === 0) {
    return { ok: violations.length === 0, violations, checked: files.length };
  }

  const approved = findApprovedPlans(path.resolve(cwd, planDir), branch);

  if (sourceFiles.length > 0 && approved.length === 0) {
    violations.push({
      code: 'no-approved-plan',
      message:
        `${sourceFiles.length} source file(s) changed with no approved plan for ` +
        `branch "${branch}".\n` +
        `  Gate 1 requires a human-approved plan before implementation.\n` +
        `  Add a plan under ${planDir}/ whose frontmatter carries:\n` +
        `      approved: true\n` +
        `      branch: ${branch}\n` +
        `  Changed: ${sourceFiles.slice(0, 5).join(', ')}` +
        (sourceFiles.length > 5 ? ` (+${sourceFiles.length - 5} more)` : ''),
    });
  }

  for (const { file, labels } of sensitive) {
    const named = approved.some(p =>
      p.touches.some(t => file === t || file.startsWith(t.replace(/\/?$/, '/')))
    );
    if (!named) {
      violations.push({
        code: 'unapproved-sensitive-path',
        message:
          `"${file}" is a ${labels.join('/')} and is not named in an approved plan.\n` +
          `  List it explicitly in the plan's frontmatter to allow it:\n` +
          `      touches:\n        - ${file}`,
      });
    }
  }

  return { ok: violations.length === 0, violations, checked: files.length };
}

module.exports = {
  checkGate,
  findApprovedPlans,
  isSourceFile,
  sensitiveMatches,
  SOURCE_EXTENSIONS,
  SENSITIVE_PATTERNS,
  PROTECTED_BRANCHES,
};

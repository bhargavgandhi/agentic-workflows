const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { IDEAdapter } = require('./base');
const { backupIfExists, ensureDir, logCopied } = require('./antigravity');

/**
 * Cursor adapter.
 *
 * rules/global-rules.md → .cursorrules (root)
 * rules/* (rest)        → .cursor/rules/*.mdc  (MDC format)
 * skills/               → .cursor/agents/skills/
 * workflows/            → .cursor/agents/workflows/
 * hooks/                → .cursor/rules/<name>.mdc (alwaysApply: true)
 */
class CursorAdapter extends IDEAdapter {
  get name() { return 'Cursor'; }

  detect(workspacePath) {
    return fs.existsSync(path.join(workspacePath, '.cursor')) ||
           fs.existsSync(path.join(workspacePath, '.cursorrules'));
  }

  async install(sourceDir, baseDir) {
    const targetDir = path.join(baseDir, '.cursor');
    backupIfExists(targetDir, baseDir, '.cursor');
    ensureDir(targetDir);

    const cursorRulesDir = path.join(targetDir, 'rules');
    ensureDir(cursorRulesDir);

    const agentsDir = path.join(targetDir, 'agents');
    ensureDir(agentsDir);

    // Rules
    const rulesDir = path.join(sourceDir, 'rules');
    if (fs.existsSync(rulesDir)) {
      const globalRules = path.join(rulesDir, 'global-rules.md');
      if (fs.existsSync(globalRules)) {
        fs.copyFileSync(globalRules, path.join(baseDir, '.cursorrules'));
        console.log(`   📄 global-rules.md → .cursorrules`);
      }
      for (const file of fs.readdirSync(rulesDir)) {
        if (file === 'global-rules.md') continue;
        const srcFile = path.join(rulesDir, file);
        const name = path.basename(file, '.md');
        const mdc = convertToMDC(srcFile, 'auto');
        fs.writeFileSync(path.join(cursorRulesDir, `${name}.mdc`), mdc);
      }
      logCopied('rules → .cursor/rules/*.mdc', cursorRulesDir);
    }

    // Skills → .cursor/agents/skills/
    const skillsSrc = path.join(sourceDir, 'skills');
    if (fs.existsSync(skillsSrc)) {
      fs.cpSync(skillsSrc, path.join(agentsDir, 'skills'), { recursive: true, force: true });
      logCopied('skills', path.join(agentsDir, 'skills'));
    }

    // Workflows → .cursor/agents/workflows/
    const workflowsSrc = path.join(sourceDir, 'workflows');
    if (fs.existsSync(workflowsSrc)) {
      fs.cpSync(workflowsSrc, path.join(agentsDir, 'workflows'), { recursive: true, force: true });
      logCopied('workflows', path.join(agentsDir, 'workflows'));
    }

    // Hooks → .cursor/rules/<name>.mdc with alwaysApply: true
    const hooksSrc = path.join(sourceDir, 'hooks');
    if (fs.existsSync(hooksSrc)) {
      for (const file of fs.readdirSync(hooksSrc)) {
        if (!file.endsWith('.md')) continue;
        const name = path.basename(file, '.md');
        const mdc = convertToMDC(path.join(hooksSrc, file), 'always');
        fs.writeFileSync(path.join(cursorRulesDir, `${name}.mdc`), mdc);
      }
      logCopied('hooks → .cursor/rules/*.mdc (alwaysApply)', cursorRulesDir);
    }
  }
}

/**
 * Convert a canonical .md file to Cursor's .mdc format.
 * Injects required Cursor frontmatter: description, alwaysApply, globs.
 */
function convertToMDC(filePath, scope = 'auto') {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const fm = {
    description: parsed.data.description || path.basename(filePath, '.md'),
    globs: parsed.data.globs || '',
    alwaysApply: scope === 'always',
    ...parsed.data,
    // Ensure Cursor-required fields always win
    alwaysApply: scope === 'always',
  };
  const fmStr = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
  return `---\n${fmStr}\n---\n\n${parsed.content}`;
}

module.exports = { CursorAdapter };

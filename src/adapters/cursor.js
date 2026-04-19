const fs = require('fs');
const path = require('path');
const os = require('os');
const matter = require('gray-matter');
const { IDEAdapter } = require('./base');
const { ensureDir, smartCopy, smartCopyFolder } = require('../utils/installer');

/**
 * Cursor adapter.
 *
 * rules/project-standards.md → .cursorrules (root)
 * rules/* (rest)        → .cursor/rules/*.mdc  (MDC format)
 * skills/               → .cursor/skills/
 * commands/             → .cursor/commands/
 * workflows/            → .cursor/agents/
 * hooks/                → .cursor/rules/<name>.mdc (alwaysApply: true)
 */
class CursorAdapter extends IDEAdapter {
  get name() { return 'Cursor'; }

  detect(workspacePath) {
    return fs.existsSync(path.join(workspacePath, '.cursor')) ||
           fs.existsSync(path.join(workspacePath, '.cursorrules'));
  }

  async install(sourceDir, baseDir, scope, options = {}) {
    const { clack } = options;
    const targetDir = path.join(baseDir, '.cursor');
    ensureDir(targetDir);

    const cursorRulesDir = path.join(targetDir, 'rules');
    ensureDir(cursorRulesDir);

    // 1. Rules
    const rulesDir = path.join(sourceDir, 'rules');
    if (fs.existsSync(rulesDir)) {
      // project-standards.md → .cursorrules
      const globalRules = path.join(rulesDir, 'project-standards.md');
      if (fs.existsSync(globalRules)) {
        await smartCopy(globalRules, path.join(baseDir, '.cursorrules'), clack, 'Cursor Rules Root');
      }

      // rules/* (rest) → .cursor/rules/*.mdc
      for (const file of fs.readdirSync(rulesDir)) {
        if (file === 'project-standards.md' || !file.endsWith('.md')) continue;
        const srcFile = path.join(rulesDir, file);
        const name = path.basename(file, '.md');
        const mdc = convertToMDC(srcFile, 'auto');
        
        // Write to temp and smartCopy
        const tmpFile = path.join(os.tmpdir(), `cursor_rule_${name}.mdc`);
        fs.writeFileSync(tmpFile, mdc);
        await smartCopy(tmpFile, path.join(cursorRulesDir, `${name}.mdc`), clack, 'Cursor MDC Rule');
        fs.rmSync(tmpFile);
      }
    }

    // 2. Skills → .cursor/skills/
    const skillsSrc = path.join(sourceDir, 'skills');
    await smartCopyFolder(skillsSrc, path.join(targetDir, 'skills'), clack, 'Cursor Skill');

    // 3. Workflows → .cursor/agents/
    const workflowsSrc = path.join(sourceDir, 'workflows');
    await smartCopyFolder(workflowsSrc, path.join(targetDir, 'agents'), clack, 'Cursor Workflow');

    // 4. Hooks → .cursor/rules/<name>.mdc with alwaysApply: true
    const hooksSrc = path.join(sourceDir, 'hooks');
    if (fs.existsSync(hooksSrc)) {
      for (const file of fs.readdirSync(hooksSrc)) {
        if (!file.endsWith('.md')) continue;
        const name = path.basename(file, '.md');
        const mdc = convertToMDC(path.join(hooksSrc, file), 'always');

        const tmpFile = path.join(os.tmpdir(), `cursor_hook_${name}.mdc`);
        fs.writeFileSync(tmpFile, mdc);
        await smartCopy(tmpFile, path.join(cursorRulesDir, `${name}.mdc`), clack, 'Cursor Hook Rule');
        fs.rmSync(tmpFile);
      }
    }

    // 5. Commands → .cursor/commands/
    const commandsSrc = path.join(sourceDir, 'commands');
    await smartCopyFolder(commandsSrc, path.join(targetDir, 'commands'), clack, 'Cursor Command');

    // 6. Recipes → .cursor/recipes/
    const recipesSrc = path.join(sourceDir, 'recipes');
    await smartCopyFolder(recipesSrc, path.join(targetDir, 'recipes'), clack, 'Cursor Recipe');
  }

  async installSkill(skillSrc, skillName, baseDir, scope, options = {}) {
    const { clack } = options;
    const dest = this.skillDir(baseDir, scope, skillName);
    await smartCopyFolder(skillSrc, dest, clack, skillName);
  }

  skillDir(baseDir, _scope, skillName) {
    return path.join(baseDir, '.cursor', 'skills', skillName);
  }
}

/**
 * Convert a canonical .md file to Cursor's .mdc format.
 */
function convertToMDC(filePath, scope = 'auto') {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const fm = {
    description: parsed.data.description || path.basename(filePath, '.md'),
    globs: parsed.data.globs || '',
    alwaysApply: scope === 'always',
    ...parsed.data,
    alwaysApply: scope === 'always',
  };
  const fmStr = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
  return `---\n${fmStr}\n---\n\n${parsed.content}`;
}

module.exports = { CursorAdapter };

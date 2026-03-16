const fs = require('fs');
const path = require('path');
const { IDEAdapter } = require('./base');
const { ensureDir, smartCopy, smartCopyFolder } = require('../utils/installer');

/**
 * VS Code / GitHub Copilot adapter.
 *
 * rules/project_standards.md → .github/copilot-instructions.md
 * rules/* (rest)        → .github/rules/
 * skills/               → .github/skills/
 * workflows/            → .github/agents/
 * hooks/                → .github/hooks/
 */
class VSCodeAdapter extends IDEAdapter {
  get name() { return 'VS Code / GitHub Copilot'; }

  detect(workspacePath) {
    return fs.existsSync(path.join(workspacePath, '.github', 'copilot-instructions.md')) ||
           fs.existsSync(path.join(workspacePath, '.vscode'));
  }

  async install(sourceDir, baseDir, scope, options = {}) {
    const { clack } = options;
    const targetDir = path.join(baseDir, '.github');
    ensureDir(targetDir);

    // 1. Rules
    const rulesDir = path.join(sourceDir, 'rules');
    if (fs.existsSync(rulesDir)) {
      // project_standards.md → .github/copilot-instructions.md
      const globalRules = path.join(rulesDir, 'project_standards.md');
      if (fs.existsSync(globalRules)) {
        await smartCopy(globalRules, path.join(targetDir, 'copilot-instructions.md'), clack, 'VS Code Instructions');
      }

      // rules/* (rest) → .github/rules/
      const githubRulesDir = path.join(targetDir, 'rules');
      ensureDir(githubRulesDir);
      for (const file of fs.readdirSync(rulesDir)) {
        if (file === 'project_standards.md') continue;
        await smartCopy(path.join(rulesDir, file), path.join(githubRulesDir, file), clack, 'VS Code Rule');
      }
    }

    // 2. Skills → .github/skills/
    const skillsSrc = path.join(sourceDir, 'skills');
    await smartCopyFolder(skillsSrc, path.join(targetDir, 'skills'), clack, 'VS Code Skill');

    // 3. Workflows → .github/agents/
    const workflowsSrc = path.join(sourceDir, 'workflows');
    await smartCopyFolder(workflowsSrc, path.join(targetDir, 'agents'), clack, 'VS Code Workflow');

    // 4. Hooks → .github/hooks/
    const hooksSrc = path.join(sourceDir, 'hooks');
    await smartCopyFolder(hooksSrc, path.join(targetDir, 'hooks'), clack, 'VS Code Hook');
  }
}

module.exports = { VSCodeAdapter };

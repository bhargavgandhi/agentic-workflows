const fs = require('fs');
const path = require('path');
const { IDEAdapter } = require('./base');
const { backupIfExists, ensureDir, logCopied } = require('./antigravity');

/**
 * VS Code / GitHub Copilot adapter.
 *
 * rules/global-rules.md → .github/copilot-instructions.md
 * rules/* (rest)        → .github/rules/
 * skills/               → .github/agents/skills/
 * workflows/            → .github/agents/workflows/
 * hooks/                → .github/hooks/
 */
class VSCodeAdapter extends IDEAdapter {
  get name() { return 'VS Code / GitHub Copilot'; }

  detect(workspacePath) {
    return fs.existsSync(path.join(workspacePath, '.github', 'copilot-instructions.md')) ||
           fs.existsSync(path.join(workspacePath, '.vscode'));
  }

  async install(sourceDir, baseDir) {
    const targetDir = path.join(baseDir, '.github');
    backupIfExists(targetDir, baseDir, '.github');
    ensureDir(targetDir);

    const agentsDir = path.join(targetDir, 'agents');
    ensureDir(agentsDir);

    // Rules
    const rulesDir = path.join(sourceDir, 'rules');
    if (fs.existsSync(rulesDir)) {
      const globalRules = path.join(rulesDir, 'global-rules.md');
      if (fs.existsSync(globalRules)) {
        fs.copyFileSync(globalRules, path.join(targetDir, 'copilot-instructions.md'));
        console.log(`   📄 global-rules.md → .github/copilot-instructions.md`);
      }
      const githubRulesDir = path.join(targetDir, 'rules');
      ensureDir(githubRulesDir);
      for (const file of fs.readdirSync(rulesDir)) {
        if (file === 'global-rules.md') continue;
        const src = path.join(rulesDir, file);
        fs.cpSync(src, path.join(githubRulesDir, file), { recursive: true, force: true });
      }
      logCopied('rules (rest)', githubRulesDir);
    }

    // Skills → .github/agents/skills/
    const skillsSrc = path.join(sourceDir, 'skills');
    if (fs.existsSync(skillsSrc)) {
      fs.cpSync(skillsSrc, path.join(agentsDir, 'skills'), { recursive: true, force: true });
      logCopied('skills', path.join(agentsDir, 'skills'));
    }

    // Workflows → .github/agents/workflows/
    const workflowsSrc = path.join(sourceDir, 'workflows');
    if (fs.existsSync(workflowsSrc)) {
      fs.cpSync(workflowsSrc, path.join(agentsDir, 'workflows'), { recursive: true, force: true });
      logCopied('workflows', path.join(agentsDir, 'workflows'));
    }

    // Hooks → .github/hooks/
    const hooksSrc = path.join(sourceDir, 'hooks');
    if (fs.existsSync(hooksSrc)) {
      fs.cpSync(hooksSrc, path.join(targetDir, 'hooks'), { recursive: true, force: true });
      logCopied('hooks', path.join(targetDir, 'hooks'));
    }
  }
}

module.exports = { VSCodeAdapter };

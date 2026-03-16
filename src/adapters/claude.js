const fs = require('fs');
const path = require('path');
const { IDEAdapter } = require('./base');
const { backupIfExists, ensureDir, logCopied } = require('./antigravity');

/**
 * Claude Code adapter.
 *
 * rules/global-rules.md → CLAUDE.md (root)
 * rules/* (rest)        → .claude/rules/
 * skills/               → .claude/skills/
 * workflows/            → .claude/agents/
 * hooks/                → .claude/hooks/
 */
class ClaudeAdapter extends IDEAdapter {
  get name() { return 'Claude Code'; }

  detect(workspacePath) {
    return fs.existsSync(path.join(workspacePath, '.claude')) ||
           fs.existsSync(path.join(workspacePath, 'CLAUDE.md'));
  }

  async install(sourceDir, baseDir) {
    const targetDir = path.join(baseDir, '.claude');
    backupIfExists(targetDir, baseDir, '.claude');
    ensureDir(targetDir);

    // Rules: global-rules.md → CLAUDE.md, rest → .claude/rules/
    const rulesDir = path.join(sourceDir, 'rules');
    if (fs.existsSync(rulesDir)) {
      const globalRules = path.join(rulesDir, 'global-rules.md');
      if (fs.existsSync(globalRules)) {
        fs.copyFileSync(globalRules, path.join(baseDir, 'CLAUDE.md'));
        console.log(`   📄 global-rules.md → CLAUDE.md`);
      }
      const claudeRulesDir = path.join(targetDir, 'rules');
      ensureDir(claudeRulesDir);
      for (const file of fs.readdirSync(rulesDir)) {
        if (file === 'global-rules.md') continue;
        fs.cpSync(path.join(rulesDir, file), path.join(claudeRulesDir, file), { recursive: true, force: true });
      }
      logCopied('rules (rest)', claudeRulesDir);
    }

    // Skills → .claude/skills/ (native format match)
    const skillsSrc = path.join(sourceDir, 'skills');
    if (fs.existsSync(skillsSrc)) {
      fs.cpSync(skillsSrc, path.join(targetDir, 'skills'), { recursive: true, force: true });
      logCopied('skills', path.join(targetDir, 'skills'));
    }

    // Workflows → .claude/agents/
    const workflowsSrc = path.join(sourceDir, 'workflows');
    if (fs.existsSync(workflowsSrc)) {
      fs.cpSync(workflowsSrc, path.join(targetDir, 'agents'), { recursive: true, force: true });
      logCopied('workflows', path.join(targetDir, 'agents'));
    }

    // Hooks → .claude/hooks/
    const hooksSrc = path.join(sourceDir, 'hooks');
    if (fs.existsSync(hooksSrc)) {
      fs.cpSync(hooksSrc, path.join(targetDir, 'hooks'), { recursive: true, force: true });
      logCopied('hooks', path.join(targetDir, 'hooks'));
    }
  }
}

module.exports = { ClaudeAdapter };

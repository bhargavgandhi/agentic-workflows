const fs = require('fs');
const path = require('path');
const { IDEAdapter } = require('./base');
const { ensureDir, smartCopy, smartCopyFolder } = require('../utils/installer');

/**
 * Claude Code adapter.
 *
 * rules/project_standards.md → CLAUDE.md (root)
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

  async install(sourceDir, baseDir, scope, options = {}) {
    const { clack } = options;
    const targetDir = path.join(baseDir, '.claude');
    ensureDir(targetDir);

    // 1. Rules: project_standards.md → CLAUDE.md, rest → .claude/rules/
    const rulesDir = path.join(sourceDir, 'rules');
    if (fs.existsSync(rulesDir)) {
      const globalRules = path.join(rulesDir, 'project_standards.md');
      if (fs.existsSync(globalRules)) {
        await smartCopy(globalRules, path.join(baseDir, 'CLAUDE.md'), clack, 'Claude Instructions');
      }
      const claudeRulesDir = path.join(targetDir, 'rules');
      ensureDir(claudeRulesDir);
      for (const file of fs.readdirSync(rulesDir)) {
        if (file === 'project_standards.md') continue;
        await smartCopy(path.join(rulesDir, file), path.join(claudeRulesDir, file), clack, 'Claude Rule');
      }
    }

    // 2. Skills → .claude/skills/
    const skillsSrc = path.join(sourceDir, 'skills');
    await smartCopyFolder(skillsSrc, path.join(targetDir, 'skills'), clack, 'Claude Skill');

    // 3. Workflows → .claude/agents/
    const workflowsSrc = path.join(sourceDir, 'workflows');
    await smartCopyFolder(workflowsSrc, path.join(targetDir, 'agents'), clack, 'Claude Workflow');

    // 4. Hooks → .claude/hooks/
    const hooksSrc = path.join(sourceDir, 'hooks');
    await smartCopyFolder(hooksSrc, path.join(targetDir, 'hooks'), clack, 'Claude Hook');
  }

  async installSkill(skillSrc, skillName, baseDir, scope, options = {}) {
    const { clack } = options;
    const dest = path.join(baseDir, '.claude', 'skills', skillName);
    await smartCopyFolder(skillSrc, dest, clack, skillName);
  }
}

module.exports = { ClaudeAdapter };

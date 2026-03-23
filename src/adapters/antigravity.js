const fs = require('fs');
const path = require('path');
const os = require('os');
const { IDEAdapter } = require('./base');
const { ensureDir, smartCopy, smartCopyFolder } = require('../utils/installer');

/**
 * Antigravity adapter.
 * Maps canonical .agents/ folder.
 * Local: 1:1 copy into .agents/
 * Global:
 *  - Skills → ~/.gemini/antigravity/skills/
 *  - Workflows → ~/.gemini/antigravity/global_workflows/
 *  - Rules → ~/.gemini/GEMINI.md (only global-rules.md)
 */
class AntigravityAdapter extends IDEAdapter {
  get name() { return 'Antigravity'; }

  detect(workspacePath) {
    // For Antigravity, we check for .agents locally
    // or the .gemini folder globally
    const local = fs.existsSync(path.join(workspacePath, '.agents'));
    const global = fs.existsSync(path.join(os.homedir(), '.gemini'));
    return local || global;
  }

  async install(sourceDir, baseDir, scope, options = {}) {
    const { clack } = options;

    if (scope === 'global') {
      const geminiDir = path.join(os.homedir(), '.gemini');
      const antigravityDir = path.join(geminiDir, 'antigravity');
      
      // Safety Backup
      const { backupIfExists } = require('../utils/installer');
      backupIfExists(geminiDir, 'Global Gemini', clack);
      
      ensureDir(antigravityDir);

      // 1. Process Rules (only project_standards.md → GEMINI.md)
      const globalRuleSrc = path.join(sourceDir, 'rules', 'project_standards.md');
      if (fs.existsSync(globalRuleSrc)) {
        const geminiMdDest = path.join(geminiDir, 'GEMINI.md');
        await smartCopy(globalRuleSrc, geminiMdDest, clack, 'Global Rule');
      }

      // 2. Process Skills → ~/.gemini/antigravity/skills/
      const skillsSrc = path.join(sourceDir, 'skills');
      const skillsDest = path.join(antigravityDir, 'skills');
      await smartCopyFolder(skillsSrc, skillsDest, clack, 'Global Skill');

      // 3. Process Workflows → ~/.gemini/antigravity/global_workflows/
      const workflowsSrc = path.join(sourceDir, 'workflows');
      const workflowsDest = path.join(antigravityDir, 'global_workflows');
      await smartCopyFolder(workflowsSrc, workflowsDest, clack, 'Global Workflow');

    } else {
      // Local install: 1:1 copy into .agents/
      const targetDir = path.join(baseDir, '.agents');
      ensureDir(targetDir);

      for (const folder of ['rules', 'skills', 'workflows', 'hooks']) {
        const src = path.join(sourceDir, folder);
        if (!fs.existsSync(src)) continue;
        const dest = path.join(targetDir, folder);
        
        // Use smartCopyFolder for each top-level category
        await smartCopyFolder(src, dest, clack, folder);
      }
    }
  }

  async installSkill(skillSrc, skillName, baseDir, scope, options = {}) {
    const { clack } = options;
    let dest;
    if (scope === 'global') {
      dest = path.join(os.homedir(), '.gemini', 'antigravity', 'skills', skillName);
    } else {
      dest = path.join(baseDir, '.agents', 'skills', skillName);
    }
    await smartCopyFolder(skillSrc, dest, clack, skillName);
  }
}

module.exports = { AntigravityAdapter };

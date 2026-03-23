/**
 * Base IDEAdapter interface.
 * Every adapter must implement all methods defined here.
 */
class IDEAdapter {
  /** Human-readable name of the IDE */
  get name() { throw new Error('name not implemented'); }

  /**
   * Detect if this IDE is already configured in the workspace.
   * @param {string} workspacePath
   * @returns {boolean}
   */
  detect(workspacePath) { return false; }

   /**
   * Run the full installation into the target base directory.
   * @param {string} sourceDir  — absolute path to canonical .agents/ folder
   * @param {string} baseDir    — absolute path to workspace root or home dir
   * @param {string} scope      — 'local' or 'global'
   * @param {object} options    — additional options (e.g., { clack })
   */
  async install(sourceDir, baseDir, scope, options = {}) {
    throw new Error('install() not implemented');
  }

  /**
   * Install a single skill into the IDE's skill directory.
   * @param {string} skillSrc  — absolute path to the skill folder in the dist package
   * @param {string} skillName — name of the skill
   * @param {string} baseDir   — workspace root or home dir
   * @param {string} scope     — 'local' or 'global'
   * @param {object} options   — additional options (e.g., { clack })
   */
  async installSkill(skillSrc, skillName, baseDir, scope, options = {}) {
    throw new Error('installSkill() not implemented');
  }
}

module.exports = { IDEAdapter };

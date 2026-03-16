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
   */
  async install(sourceDir, baseDir) {
    throw new Error('install() not implemented');
  }
}

module.exports = { IDEAdapter };

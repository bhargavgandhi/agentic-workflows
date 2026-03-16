const fs = require('fs');
const path = require('path');
const { IDEAdapter } = require('./base');

/**
 * Antigravity adapter.
 * Maps canonical .agents/ → .agents/ (1:1 copy)
 */
class AntigravityAdapter extends IDEAdapter {
  get name() { return 'Antigravity'; }

  detect(workspacePath) {
    return fs.existsSync(path.join(workspacePath, '.agents'));
  }

  async install(sourceDir, baseDir) {
    const targetDir = path.join(baseDir, '.agents');
    backupIfExists(targetDir, baseDir, '.agents');
    ensureDir(targetDir);

    for (const folder of ['rules', 'skills', 'workflows', 'hooks']) {
      const src = path.join(sourceDir, folder);
      if (!fs.existsSync(src)) continue;
      const dest = path.join(targetDir, folder);
      if (src === dest) { logSkip(folder); continue; }
      fs.cpSync(src, dest, { recursive: true, force: true });
      logCopied(folder, dest);
    }
  }
}

// ── Shared helpers (used by all adapters) ──────────────────────────────────
function backupIfExists(targetDir, baseDir, folderName) {
  if (fs.existsSync(targetDir)) {
    const copyDir = path.join(baseDir, folderName + '_copy');
    if (fs.existsSync(copyDir)) fs.rmSync(copyDir, { recursive: true, force: true });
    fs.cpSync(targetDir, copyDir, { recursive: true, force: true });
    console.log(`   🔄 Backup created: ${folderName}_copy`);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function logCopied(label, dest) {
  console.log(`   📂 ${label} → ${dest}`);
}

function logSkip(label) {
  console.log(`   ⏭️  Skipped ${label} (same as source)`);
}

module.exports = { AntigravityAdapter, backupIfExists, ensureDir, logCopied, logSkip };

const fs = require('fs');
const path = require('path');
const picocolors = require('picocolors');

/**
 * Ensures a directory exists.
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Handles file copying with conflict resolution.
 * @param {string} src      — source file path
 * @param {string} dest     — destination file path
 * @param {object} clack    — clack instance for prompting
 * @param {string} label    — display label
 */
async function smartCopy(src, dest, clack, label) {
  if (path.resolve(src) === path.resolve(dest)) return; // same-dir installs (dev mode)
  if (fs.existsSync(dest)) {
    const action = await clack.select({
      message: `Conflict detected for ${label}: ${path.basename(dest)} exists.`,
      options: [
        { value: 'overwrite', label: 'Overwrite', hint: 'Replace existing file' },
        { value: 'keep',      label: 'Keep both',  hint: 'Rename new file with _copy suffix' },
        { value: 'skip',      label: 'Skip',       hint: 'Do nothing' },
        { value: 'merge',     label: 'Merge',      hint: 'Append content to end (Markdown only)' },
      ],
    });

    if (clack.isCancel(action) || action === 'skip') {
      clack.log.info(picocolors.dim(`   ⏭️  Skipped ${path.basename(dest)}`));
      return;
    }

    if (action === 'overwrite') {
      fs.cpSync(src, dest, { force: true });
      clack.log.info(picocolors.green(`   ✅ Overwritten: ${path.basename(dest)}`));
      return;
    }

    if (action === 'keep') {
      let suffix = '_copy';
      let count = 1;
      let newDest = dest.replace(/(\.[\w\d]+)$/, `${suffix}${count}$1`);
      while (fs.existsSync(newDest)) {
        count++;
        newDest = dest.replace(/(\.[\w\d]+)$/, `${suffix}${count}$1`);
      }
      fs.cpSync(src, newDest);
      clack.log.info(picocolors.cyan(`   📂 Created: ${path.basename(newDest)}`));
      return;
    }

    if (action === 'merge') {
      if (dest.endsWith('.md')) {
        const srcContent = fs.readFileSync(src, 'utf8');
        fs.appendFileSync(dest, `\n\n${srcContent}`);
        clack.log.info(picocolors.blue(`   Merged: ${path.basename(dest)}`));
      } else {
        clack.log.warn(`Merge not supported for non-markdown files. Skipping.`);
      }
      return;
    }
  } else {
    ensureDir(path.dirname(dest));
    fs.cpSync(src, dest, { recursive: true });
    clack.log.info(picocolors.dim(`   📂 ${label} → ${dest}`));
  }
}

/**
 * Copies a folder with smart copy for each file inside.
 */
async function smartCopyFolder(srcDir, destDir, clack, label) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      await smartCopyFolder(srcPath, destPath, clack, label);
    } else {
      await smartCopy(srcPath, destPath, clack, label);
    }
  }
}

/**
 * Creates a backup of a directory before installation.
 */
function backupIfExists(targetDir, label, clack) {
  if (fs.existsSync(targetDir)) {
    const parent = path.dirname(targetDir);
    const folderName = path.basename(targetDir);
    const backupDir = path.join(parent, `${folderName}_backup`);
    
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
    fs.cpSync(targetDir, backupDir, { recursive: true });
    const msg = picocolors.yellow(`   🔄 Safety Backup created: ${backupDir}`);
    if (clack) {
      clack.log.info(msg);
    } else {
      console.log(msg);
    }
  }
}

module.exports = { ensureDir, smartCopy, smartCopyFolder, backupIfExists };

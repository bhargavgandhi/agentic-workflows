'use strict';

const fs   = require('fs');
const path = require('path');

const MANIFEST_FILENAME = '.skills.json';
const MANIFEST_VERSION  = '1.0';

function _manifestPath(workspaceDir) {
  return path.join(workspaceDir, MANIFEST_FILENAME);
}

function manifestExists(workspaceDir) {
  return fs.existsSync(_manifestPath(workspaceDir));
}

function readManifest(workspaceDir) {
  const p = _manifestPath(workspaceDir);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/**
 * @param {string} workspaceDir
 * @param {string} role - e.g. 'frontend', 'backend', 'fullstack', 'full'
 * @param {Array<{ name: string, version: string|null }>} skills
 */
function writeManifest(workspaceDir, role, skills) {
  const manifest = {
    version: MANIFEST_VERSION,
    role,
    skills,
  };
  fs.writeFileSync(_manifestPath(workspaceDir), JSON.stringify(manifest, null, 2), 'utf8');
}

/**
 * Scan an installed skills directory and return a skills array
 * suitable for writeManifest.
 *
 * @param {string} installedSkillsDir - path to .agents/skills/
 * @returns {Array<{ name: string, version: string|null }>}
 */
function scanInstalledSkills(installedSkillsDir) {
  if (!fs.existsSync(installedSkillsDir)) return [];

  return fs.readdirSync(installedSkillsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => {
      const vFile   = path.join(installedSkillsDir, e.name, '.version');
      const version = fs.existsSync(vFile)
        ? fs.readFileSync(vFile, 'utf8').trim()
        : null;
      return { name: e.name, version };
    });
}

/**
 * Diff a manifest skills array against currently installed skills.
 *
 * @param {Array<{ name: string, version: string|null }>} manifestSkills
 * @param {Array<{ name: string, version: string|null }>} installedSkills
 * @returns {{
 *   toInstall: Array<{ name, version }>,
 *   toUpdate:  Array<{ name, manifestVersion, installedVersion }>,
 *   current:   Array<{ name, version }>,
 *   extra:     Array<{ name, version }>,
 * }}
 */
function diffManifest(manifestSkills, installedSkills) {
  const installedMap = new Map(installedSkills.map(s => [s.name, s.version]));
  const manifestSet  = new Set(manifestSkills.map(s => s.name));

  const toInstall = [];
  const toUpdate  = [];
  const current   = [];

  for (const { name, version } of manifestSkills) {
    if (!installedMap.has(name)) {
      toInstall.push({ name, version });
    } else {
      const installedVersion = installedMap.get(name);
      if (version && installedVersion && version !== installedVersion) {
        toUpdate.push({ name, manifestVersion: version, installedVersion });
      } else {
        current.push({ name, version });
      }
    }
  }

  const extra = installedSkills.filter(s => !manifestSet.has(s.name));

  return { toInstall, toUpdate, current, extra };
}

module.exports = { manifestExists, readManifest, writeManifest, scanInstalledSkills, diffManifest };

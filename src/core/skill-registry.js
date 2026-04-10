'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * SkillRegistry
 *
 * Manages skill metadata, versioning, and search against skills.json v2.
 * Backwards-compatible: falls back gracefully to v1 skills.json (array-only).
 */
class SkillRegistry {
  /**
   * @param {string} skillsJsonPath - Absolute path to skills.json
   * @param {string} installedDir   - Absolute path to the installed skills directory
   */
  constructor(skillsJsonPath, installedDir) {
    this.skillsJsonPath = skillsJsonPath;
    this.installedDir   = installedDir;
    this._manifest      = null;
  }

  // ── Lazy-load manifest ─────────────────────────────────────────────────────

  _load() {
    if (this._manifest) return this._manifest;
    if (!fs.existsSync(this.skillsJsonPath)) {
      this._manifest = { skills: [], registry: {} };
      return this._manifest;
    }
    const raw = JSON.parse(fs.readFileSync(this.skillsJsonPath, 'utf8'));
    // Normalise v1 format (no registry key)
    this._manifest = {
      schema_version: raw.schema_version || '1.0.0',
      skills: raw.skills || [],
      registry: raw.registry || {},
    };
    return this._manifest;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Return all skill names known to the registry.
   * @returns {string[]}
   */
  allSkillNames() {
    return this._load().skills;
  }

  /**
   * Return full metadata for a single skill.
   * @param {string} name
   * @returns {{ name, version, pattern, tags, dependencies, installedVersion, path } | null}
   */
  getSkill(name) {
    const manifest = this._load();
    if (!manifest.skills.includes(name)) return null;

    const meta = manifest.registry[name] || {};
    const skillDir = path.join(this.installedDir, name);

    return {
      name,
      version: meta.version || null,
      pattern: meta.pattern || null,
      tags: meta.tags || [],
      dependencies: meta.dependencies || [],
      installedVersion: this._readVersionFile(skillDir),
      path: fs.existsSync(skillDir) ? skillDir : null,
    };
  }

  /**
   * Fuzzy-search skills by name, tags, or pattern.
   * @param {string} query
   * @returns {Array<ReturnType<SkillRegistry['getSkill']>>}
   */
  searchSkills(query) {
    const q = query.toLowerCase();
    return this.allSkillNames()
      .filter(name => {
        const meta = this._load().registry[name] || {};
        return (
          name.includes(q) ||
          (meta.tags || []).some(t => t.includes(q)) ||
          (meta.pattern || '').includes(q)
        );
      })
      .map(name => this.getSkill(name))
      .filter(Boolean);
  }

  /**
   * Return skills where the installed version differs from the registry version.
   * @returns {Array<{ name, installedVersion, latestVersion }>}
   */
  getOutdated() {
    const manifest = this._load();
    const outdated = [];

    for (const name of manifest.skills) {
      const meta     = manifest.registry[name] || {};
      const pkgVer   = meta.version;
      const skillDir = path.join(this.installedDir, name);
      const instVer  = this._readVersionFile(skillDir);

      if (pkgVer && instVer && instVer !== pkgVer) {
        outdated.push({ name, installedVersion: instVer, latestVersion: pkgVer });
      }
    }

    return outdated;
  }

  /**
   * Write a .version file into a skill directory after install.
   * @param {string} skillDir
   * @param {string} version
   */
  writeVersionFile(skillDir, version) {
    if (!version) return;
    fs.writeFileSync(path.join(skillDir, '.version'), version, 'utf8');
  }

  /**
   * Read a .version file from a skill directory.
   * @param {string} skillDir
   * @returns {string|null}
   */
  _readVersionFile(skillDir) {
    const vFile = path.join(skillDir, '.version');
    if (fs.existsSync(vFile)) {
      return fs.readFileSync(vFile, 'utf8').trim();
    }
    return null;
  }
}

module.exports = { SkillRegistry };

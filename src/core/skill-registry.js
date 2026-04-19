'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * SkillRegistry
 *
 * Manages skill metadata, versioning, and search against skills.json v3.
 * Backwards-compatible: falls back gracefully to v1/v2 skills.json formats.
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
      this._manifest = { schema_version: '3.0.0', skills: [], registry: {}, packs: [] };
      return this._manifest;
    }
    const raw = JSON.parse(fs.readFileSync(this.skillsJsonPath, 'utf8'));
    this._manifest = {
      schema_version: raw.schema_version || '1.0.0',
      skills:         raw.skills || [],
      registry:       raw.registry || {},
      packs:          raw.packs || [],
    };
    return this._manifest;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Return all skill names known to the registry (excludes deprecated).
   * @param {{ includeDeprecated?: boolean }} opts
   * @returns {string[]}
   */
  allSkillNames({ includeDeprecated = false } = {}) {
    const manifest = this._load();
    if (includeDeprecated) return manifest.skills;
    return manifest.skills.filter(name => {
      const meta = manifest.registry[name] || {};
      return !meta.deprecated;
    });
  }

  /**
   * Return only mandatory process skills (optional: false, category: process).
   * @returns {string[]}
   */
  mandatorySkillNames() {
    const manifest = this._load();
    return manifest.skills.filter(name => {
      const meta = manifest.registry[name] || {};
      return meta.category === 'process' && meta.optional === false && !meta.deprecated;
    });
  }

  /**
   * Return full metadata for a single skill.
   * @param {string} name
   * @returns {object|null}
   */
  getSkill(name) {
    const manifest = this._load();
    if (!manifest.skills.includes(name)) return null;

    const meta     = manifest.registry[name] || {};
    const skillDir = path.join(this.installedDir, name);

    return {
      name,
      version:          meta.version || null,
      category:         meta.category || 'technology',
      optional:         meta.optional !== false,
      phase:            meta.phase ?? null,
      description:      meta.description || null,
      pattern:          meta.pattern || null,
      tags:             meta.tags || [],
      dependencies:     meta.dependencies || [],
      packs:            meta.packs || [],
      deprecated:       meta.deprecated || false,
      deprecatedSince:  meta.deprecatedSince || null,
      replacedBy:       meta.replacedBy || [],
      installedVersion: this._readVersionFile(skillDir),
      path:             fs.existsSync(skillDir) ? skillDir : null,
    };
  }

  /**
   * Resolve a pack name to its constituent skill names.
   * Returns null if pack is not found.
   * @param {string} packName
   * @returns {string[]|null}
   */
  resolvePack(packName) {
    const manifest = this._load();
    const pack = (manifest.packs || []).find(p => p.name === packName);
    return pack ? pack.skills : null;
  }

  /**
   * Return all pack definitions.
   * @returns {Array<{ name, description, skills }>}
   */
  allPacks() {
    return this._load().packs || [];
  }

  /**
   * Return true if the given name is a known pack alias.
   * @param {string} name
   * @returns {boolean}
   */
  isPack(name) {
    return this.resolvePack(name) !== null;
  }

  /**
   * Fuzzy-search skills by name, tags, pattern, or description.
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
          (meta.pattern || '').includes(q) ||
          (meta.description || '').toLowerCase().includes(q)
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
      if (meta.deprecated) continue;
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
   * Return the schema_version of the loaded manifest.
   * @returns {string}
   */
  schemaVersion() {
    return this._load().schema_version;
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

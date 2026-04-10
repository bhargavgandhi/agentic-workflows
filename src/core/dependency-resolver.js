'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * DependencyResolver
 *
 * Resolves skill dependency trees using topological sort (Kahn's algorithm).
 * Dependencies are declared in SKILL.md frontmatter:
 *
 *   ---
 *   dependencies:
 *     - frontend-design
 *     - test-writing
 *   ---
 */
class DependencyResolver {
  /**
   * @param {string} skillsDir - Absolute path to the installed skills directory
   */
  constructor(skillsDir) {
    this.skillsDir = skillsDir;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Resolve the full ordered dependency list for a skill.
   * Returns deps first (in dependency order), with the requested skill last.
   *
   * @param {string} skillName
   * @returns {{ order: string[], missing: string[], circular: string[] }}
   *
   * @example
   * resolveDeps('fullstack-feature')
   * // → { order: ['frontend-design', 'backend-engineer', 'test-writing', 'fullstack-feature'], missing: [], circular: [] }
   */
  resolveDeps(skillName) {
    const graph   = {};   // name → Set<deps>
    const missing = new Set();
    const visited = new Set();

    // BFS to build the dependency graph
    const queue = [skillName];
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = this._readDeps(current);
      graph[current] = new Set(deps);

      for (const dep of deps) {
        if (!this._skillExists(dep)) {
          missing.add(dep);
        } else if (!visited.has(dep)) {
          queue.push(dep);
        }
      }
    }

    // Topological sort using Kahn's algorithm
    const { order, circular } = this._topoSort(graph);

    return {
      order,
      missing: [...missing],
      circular,
    };
  }

  /**
   * Read the dependencies declared in a skill's SKILL.md frontmatter.
   * @param {string} skillName
   * @returns {string[]}
   */
  readDepsFromSkill(skillName) {
    return this._readDeps(skillName);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  _skillExists(name) {
    return fs.existsSync(path.join(this.skillsDir, name));
  }

  _readDeps(skillName) {
    const skillMd = path.join(this.skillsDir, skillName, 'SKILL.md');
    if (!fs.existsSync(skillMd)) return [];

    try {
      const matter = require('gray-matter');
      const parsed = matter(fs.readFileSync(skillMd, 'utf8'));
      return Array.isArray(parsed.data?.dependencies) ? parsed.data.dependencies : [];
    } catch {
      return [];
    }
  }

  /**
   * Kahn's algorithm for topological sort.
   * @param {Record<string, Set<string>>} graph
   * @returns {{ order: string[], circular: string[] }}
   */
  _topoSort(graph) {
    const inDegree = {};

    // Initialise all nodes
    for (const node of Object.keys(graph)) {
      if (!(node in inDegree)) inDegree[node] = 0;
      for (const dep of graph[node]) {
        inDegree[dep] = (inDegree[dep] || 0) + 1; // dep has one more dependent
      }
    }

    // Reverse: we want deps to come BEFORE the skill that needs them.
    // Build a forward adjacency (dep → skills that depend on dep).
    const forward = {};
    for (const [node, deps] of Object.entries(graph)) {
      for (const dep of deps) {
        if (!forward[dep]) forward[dep] = new Set();
        forward[dep].add(node);
      }
    }

    // Seeds: nodes with inDegree 0 (no dependents; leaves in the dep tree)
    const queue = Object.keys(inDegree).filter(n => inDegree[n] === 0);
    const order = [];

    while (queue.length > 0) {
      const current = queue.shift();
      order.push(current);

      for (const dependant of (forward[current] || [])) {
        inDegree[dependant]--;
        if (inDegree[dependant] === 0) queue.push(dependant);
      }
    }

    const circular = Object.keys(inDegree).filter(n => inDegree[n] > 0);

    return { order, circular };
  }
}

module.exports = { DependencyResolver };

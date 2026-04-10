'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * RecipeEngine
 *
 * Loads, parses, and renders prompt recipe templates.
 * Recipes are markdown files in .agents/recipes/ with YAML frontmatter.
 *
 * Recipe frontmatter schema:
 *   name: string
 *   description: string
 *   parameters: Array<{ name, type, options?, default, description? }>
 *   skills_required: string[]
 *   workflow: string
 *   tags: string[]
 */
class RecipeEngine {
  /**
   * @param {string} recipesDir - Absolute path to .agents/recipes/
   */
  constructor(recipesDir) {
    this.recipesDir = recipesDir;
  }

  /**
   * List all available recipes.
   * @returns {Array<{ name, file, description, tags, parameters }>}
   */
  listRecipes() {
    if (!fs.existsSync(this.recipesDir)) return [];

    const matter = this._loadMatter();
    return fs.readdirSync(this.recipesDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const filePath = path.join(this.recipesDir, f);
        const raw    = fs.readFileSync(filePath, 'utf8');
        const parsed = matter(raw);
        return {
          name:        path.basename(f, '.md'),
          file:        filePath,
          description: parsed.data.description || '',
          tags:        parsed.data.tags || [],
          parameters:  parsed.data.parameters || [],
          workflow:    parsed.data.workflow || 'build_feature_agent',
          skills:      parsed.data.skills_required || [],
        };
      });
  }

  /**
   * Load a single recipe by name.
   * @param {string} name - Recipe name (without .md)
   * @returns {{ meta, content, parameters } | null}
   */
  loadRecipe(name) {
    const recipeFile = path.join(this.recipesDir, `${name}.md`);
    if (!fs.existsSync(recipeFile)) return null;

    const matter = this._loadMatter();
    const raw    = fs.readFileSync(recipeFile, 'utf8');
    const parsed = matter(raw);

    return {
      meta:       parsed.data,
      content:    parsed.content,
      parameters: parsed.data.parameters || [],
    };
  }

  /**
   * Render a recipe by interpolating {{param}} placeholders.
   * @param {string} name   - Recipe name
   * @param {Record<string,string>} values - Parameter values
   * @returns {string} - Assembled prompt
   */
  renderRecipe(name, values) {
    const recipe = this.loadRecipe(name);
    if (!recipe) throw new Error(`Recipe not found: ${name}`);

    let rendered = recipe.content;

    // Replace all {{param}} placeholders
    for (const [key, val] of Object.entries(values)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    }

    // Replace any remaining placeholders with defaults
    for (const param of recipe.parameters) {
      rendered = rendered.replace(
        new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'),
        param.default || `[${param.name}]`
      );
    }

    // Prepend skill loading instructions if recipe declares required skills
    const skillsDirective = recipe.meta.skills_required?.length > 0
      ? `_Before starting, load these skills: ${recipe.meta.skills_required.join(', ')}_\n\n`
      : '';

    // Prepend workflow directive
    const workflowDirective = recipe.meta.workflow
      ? `Run /${recipe.meta.workflow}.\n\n`
      : '';

    return `${workflowDirective}${skillsDirective}${rendered.trim()}`;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _loadMatter() {
    try {
      return require('gray-matter');
    } catch {
      throw new Error('gray-matter not found. Run: npm install gray-matter');
    }
  }
}

module.exports = { RecipeEngine };

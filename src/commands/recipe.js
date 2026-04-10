'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const pc   = require('picocolors');
const { RecipeEngine } = require('../core/recipe-engine');
const { countTokens, loadProfileBudget } = require('../core/token-counter');

/**
 * `agents-skills recipe [name]`
 *
 *   agents-skills recipe          → List all available recipes
 *   agents-skills recipe add-auth → Interactively fill params, show assembled prompt
 */
async function recipeCommand(args = []) {
  const clack = require('@clack/prompts');
  const cwd   = process.cwd();

  // Determine recipes dir: prefer local .agents/recipes/, fall back to package
  const localRecipes = path.join(cwd, '.agents', 'recipes');
  const pkgRecipes   = path.join(__dirname, '..', '..', '.agents', 'recipes');
  const recipesDir   = fs.existsSync(localRecipes) ? localRecipes : pkgRecipes;

  const engine = new RecipeEngine(recipesDir);
  const recipeName = args.find(a => !a.startsWith('-'));

  // ── List mode ──────────────────────────────────────────────────────────────
  if (!recipeName) {
    const recipes = engine.listRecipes();

    console.log('');
    console.log(pc.bold('  🍳 Available Recipes'));
    console.log('');

    if (recipes.length === 0) {
      console.log(pc.yellow('  No recipes found in .agents/recipes/'));
      console.log(pc.dim('  Recipes will be available after running `agents-skills`'));
      console.log('');
      return;
    }

    for (const r of recipes) {
      const tags = r.tags.length ? pc.dim(` [${r.tags.join(', ')}]`) : '';
      const params = r.parameters.length
        ? pc.dim(` (${r.parameters.length} param${r.parameters.length > 1 ? 's' : ''})`)
        : '';
      console.log(`  ${pc.green(r.name.padEnd(24))} ${r.description}${tags}${params}`);
    }

    console.log('');
    console.log(pc.dim('  Usage: agents-skills recipe <name>'));
    console.log('');
    return;
  }

  // ── Run mode ───────────────────────────────────────────────────────────────
  clack.intro(pc.bgCyan(pc.black(` 🍳 Recipe: ${recipeName} `)));

  const recipe = engine.loadRecipe(recipeName);
  if (!recipe) {
    clack.log.error(`Recipe not found: "${recipeName}"`);
    console.log(pc.dim('  Run `agents-skills recipe` to see all available recipes.'));
    process.exit(1);
  }

  const { meta, parameters } = recipe;

  // Display recipe info
  if (meta.description) {
    console.log('');
    console.log(pc.dim(`  ${meta.description}`));
  }
  if (meta.skills_required?.length > 0) {
    console.log(pc.dim(`  Skills: ${meta.skills_required.join(', ')}`));
  }
  console.log('');

  // Collect parameter values
  const values = {};

  for (const param of parameters) {
    let value;

    if (param.type === 'select' && param.options?.length > 0) {
      value = await clack.select({
        message: param.description || `Choose ${param.name}:`,
        options: param.options.map(o => ({
          value: o,
          label: o,
          hint: o === param.default ? 'default' : '',
        })),
      });
    } else {
      value = await clack.text({
        message: param.description || `Enter ${param.name}:`,
        placeholder: String(param.default || ''),
      });
    }

    if (clack.isCancel(value)) { clack.cancel('Cancelled.'); process.exit(0); }
    values[param.name] = value || String(param.default || '');
  }

  // Render the recipe
  const assembled = engine.renderRecipe(recipeName, values);
  const tokens    = countTokens(assembled);
  const budget    = loadProfileBudget(cwd);

  clack.note(assembled, '📋 Assembled Prompt');

  // Token info
  console.log('');
  const pct = ((tokens / budget.budget) * 100).toFixed(1);
  console.log(pc.dim(`  Prompt size: ${tokens.toLocaleString()} tokens (${pct}% of your ${budget.budget.toLocaleString()} token budget)`));
  console.log('');

  // Clipboard copy option
  const doCopy = await clack.confirm({
    message: 'Copy prompt to clipboard?',
    initialValue: true,
  });
  if (clack.isCancel(doCopy)) { clack.cancel('Cancelled.'); process.exit(0); }

  if (doCopy) {
    _copyToClipboard(assembled);
    clack.outro(pc.green('✅ Prompt copied to clipboard! Paste it into your AI assistant.'));
  } else {
    clack.outro(pc.green('✅ Recipe assembled. Paste the prompt above into your AI assistant.'));
  }
  console.log('');
}

// ── Clipboard helper ──────────────────────────────────────────────────────────

function _copyToClipboard(text) {
  const { execSync } = require('child_process');
  try {
    if (process.platform === 'darwin') {
      execSync('pbcopy', { input: text });
    } else if (process.platform === 'linux') {
      execSync('xclip -selection clipboard', { input: text });
    } else if (process.platform === 'win32') {
      execSync('clip', { input: text });
    }
  } catch {
    // Silently fail — user still has the printed output
  }
}

module.exports = { recipeCommand };

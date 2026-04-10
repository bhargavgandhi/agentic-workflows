'use strict';

const fs   = require('fs');
const path = require('path');
const pc   = require('picocolors');
const { detectProject } = require('../core/project-detector');

/**
 * `agents-skills init`
 *
 * Scans the workspace and generates .agents/project-profile.json.
 * This file is read by the token counter and workflows to bootstrap
 * context management with the correct model + budget settings.
 */
async function initCommand(args = []) {
  const clack = require('@clack/prompts');
  const cwd   = process.cwd();

  console.log('');
  clack.intro(pc.bgCyan(pc.black(' 🔍 Project Profile Generator ')));

  const spinner = clack.spinner();
  spinner.start('Scanning workspace...');

  const profile = detectProject(cwd);

  spinner.stop(pc.green('✓ Workspace scanned'));

  // Display what we found
  console.log('');
  console.log(pc.bold('  Detected:'));
  _row('Framework',     profile.framework);
  _row('Language',      profile.language);
  _row('Styling',       profile.styling);
  _row('State Mgmt',    profile.stateManagement);
  _row('Unit Testing',  profile.testing.unit || 'none');
  _row('E2E Testing',   profile.testing.e2e || 'none');
  _row('Pkg Manager',   profile.packageManager);
  _row('Monorepo',      profile.monorepo ? 'yes' : 'no');
  if (profile.detectedSkills.length > 0) {
    _row('Skills Rec.',   profile.detectedSkills.join(', '));
  }
  console.log('');

  // Allow configuring the model for token budget
  const modelChoice = await clack.select({
    message: 'Which AI model do you primarily use? (sets token budget)',
    options: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', hint: '200k tokens → 80k budget (40%)' },
      { value: 'claude-opus-4-20250514',   label: 'Claude Opus 4',   hint: '200k tokens → 80k budget (40%)' },
      { value: 'gpt-4o',                   label: 'GPT-4o',          hint: '128k tokens → 51k budget (40%)' },
      { value: 'gemini-2.5-pro',           label: 'Gemini 2.5 Pro',  hint: '1M tokens → 400k budget (40%)' },
      { value: 'gemini-2.5-flash',         label: 'Gemini 2.5 Flash', hint: '1M tokens → 400k budget (40%)' },
      { value: 'custom',                   label: 'Custom / Other',   hint: 'Set your own context window size' },
    ],
  });
  if (clack.isCancel(modelChoice)) { clack.cancel('Cancelled.'); process.exit(0); }

  let contextWindow = 200000;
  if (modelChoice === 'custom') {
    const customWindow = await clack.text({
      message: 'Enter your model\'s context window size (in tokens):',
      placeholder: '200000',
      validate(v) {
        const n = parseInt(v, 10);
        if (isNaN(n) || n < 1000) return 'Please enter a valid token count (e.g. 200000)';
      },
    });
    if (clack.isCancel(customWindow)) { clack.cancel('Cancelled.'); process.exit(0); }
    contextWindow = parseInt(customWindow, 10);
  } else {
    const windowMap = {
      'claude-sonnet-4-20250514': 200000,
      'claude-opus-4-20250514': 200000,
      'gpt-4o': 128000,
      'gemini-2.5-pro': 1000000,
      'gemini-2.5-flash': 1000000,
    };
    contextWindow = windowMap[modelChoice] || 200000;
  }

  const budgetPercent = 40;
  const budgetTokens  = Math.floor(contextWindow * budgetPercent / 100);

  profile.tokenBudget = {
    model: modelChoice === 'custom' ? 'custom' : modelChoice,
    contextWindow,
    budgetPercent,
    budgetTokens,
  };

  // Write the profile
  const agentsDir  = path.join(cwd, '.agents');
  if (!fs.existsSync(agentsDir)) fs.mkdirSync(agentsDir, { recursive: true });

  const profilePath = path.join(agentsDir, 'project-profile.json');
  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf8');

  clack.outro(pc.green(`✅ Project profile written to .agents/project-profile.json`));
  console.log('');
  console.log(pc.dim(`  Token budget: ${budgetTokens.toLocaleString()} tokens (${budgetPercent}% of ${contextWindow.toLocaleString()})`));
  console.log(pc.dim(`  Run 'agents-skills tokens --budget' to see current context usage.`));
  console.log('');
}

function _row(label, value) {
  console.log(`  ${pc.dim(label.padEnd(14))} ${pc.cyan(value)}`);
}

module.exports = { initCommand };

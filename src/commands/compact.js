'use strict';

const fs   = require('fs');
const path = require('path');
const pc   = require('picocolors');
const { ContextCompactor } = require('../core/context-compactor');
const { countTokens, loadProfileBudget } = require('../core/token-counter');

/**
 * `agents-skills compact`
 *
 * Interactively creates a context snapshot to resume work in a new chat
 * session. Triggered when the user feels the context is getting too long,
 * or automatically triggered by workflow Phase 0 when > 40% token budget.
 */
async function compactCommand() {
  const clack = require('@clack/prompts');
  const cwd   = process.cwd();

  const agentsDir = path.join(cwd, '.agents');
  const budget    = loadProfileBudget(cwd);

  console.log('');
  clack.intro(pc.bgCyan(pc.black(' 📸 Context Snapshot Creator ')));
  console.log('');
  console.log(pc.dim('  This creates a compact summary of your current session.'));
  console.log(pc.dim('  Paste it into your next chat to resume without re-reading all files.'));
  console.log('');

  // ── Collect session data ───────────────────────────────────────────────────

  const goal = await clack.text({
    message: 'What is the goal of this session? (one line)',
    placeholder: 'e.g. Building a recurring calendar event feature',
    validate(v) { if (!v?.trim()) return 'Goal is required'; },
  });
  if (clack.isCancel(goal)) { clack.cancel('Cancelled.'); process.exit(0); }

  const completedRaw = await clack.text({
    message: 'What has been completed so far? (comma-separated, or press Enter to skip)',
    placeholder: 'e.g. Phase 1 research done, RecurrenceRule type created',
  });
  if (clack.isCancel(completedRaw)) { clack.cancel('Cancelled.'); process.exit(0); }

  const remainingRaw = await clack.text({
    message: 'What still needs to be done? (comma-separated)',
    placeholder: 'e.g. Complete RecurrenceSelector component, wire into EventModal, write tests',
    validate(v) { if (!v?.trim()) return 'Please list remaining work so the next session knows where to continue'; },
  });
  if (clack.isCancel(remainingRaw)) { clack.cancel('Cancelled.'); process.exit(0); }

  const decisionsRaw = await clack.text({
    message: 'Any important decisions made? (comma-separated, or press Enter to skip)',
    placeholder: 'e.g. Using rrule library, storing as Firestore string',
  });
  if (clack.isCancel(decisionsRaw)) { clack.cancel('Cancelled.'); process.exit(0); }

  const modifiedRaw = await clack.text({
    message: 'Which files were modified this session? (comma-separated, or press Enter to skip)',
    placeholder: 'e.g. src/types/calendar.ts, src/components/RecurrenceSelector.tsx',
  });
  if (clack.isCancel(modifiedRaw)) { clack.cancel('Cancelled.'); process.exit(0); }

  const refFilesRaw = await clack.text({
    message: 'Which files should the next session reference? (comma-separated, or press Enter to skip)',
    placeholder: 'e.g. src/types/calendar.ts:45-72, src/components/EventModal.tsx:120-180',
  });
  if (clack.isCancel(refFilesRaw)) { clack.cancel('Cancelled.'); process.exit(0); }

  const skillsRaw = await clack.text({
    message: 'Which skills are still needed? (comma-separated, or press Enter to skip)',
    placeholder: 'e.g. frontend-design, firebase-setup',
  });
  if (clack.isCancel(skillsRaw)) { clack.cancel('Cancelled.'); process.exit(0); }

  const notes = await clack.text({
    message: 'Any other notes for the next session? (or press Enter to skip)',
  });
  if (clack.isCancel(notes)) { clack.cancel('Cancelled.'); process.exit(0); }

  // ── Parse inputs ───────────────────────────────────────────────────────────

  const parse = (raw) => (raw || '').split(',').map(s => s.trim()).filter(Boolean);

  const data = {
    goal,
    completed:        parse(completedRaw),
    remaining:        parse(remainingRaw),
    decisions:        parse(decisionsRaw),
    filesModified:    parse(modifiedRaw),
    filesToReference: parse(refFilesRaw),
    activeSkills:     parse(skillsRaw),
    notes:            notes?.trim() || null,
  };

  // ── Generate snapshot ──────────────────────────────────────────────────────

  const compactor = new ContextCompactor(agentsDir);
  const spinner   = clack.spinner();

  spinner.start('Generating snapshot...');
  const { filePath, tokens, content } = compactor.createSnapshot(data);
  spinner.stop(pc.green(`✓ Snapshot created`));

  console.log('');
  console.log(pc.bold('  Snapshot Details:'));
  console.log(`  File:   ${pc.cyan(path.relative(cwd, filePath))}`);
  console.log(`  Tokens: ${pc.bold(tokens.toLocaleString())} (${((tokens / budget.budget) * 100).toFixed(1)}% of your ${budget.budget.toLocaleString()} budget)`);
  console.log('');
  console.log(pc.dim('─'.repeat(64)));
  console.log('');

  // Print snapshot preview
  console.log(content);

  console.log('');
  console.log(pc.dim('─'.repeat(64)));
  console.log('');
  clack.outro(pc.green('✅ Copy the snapshot above into your next chat session to resume work.'));
  console.log('');
}

module.exports = { compactCommand };

'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * ContextCompactor
 *
 * Generates a structured markdown context snapshot that captures:
 * - The session goal
 * - Completed work
 * - Key decisions made
 * - Files modified / to reference
 * - Active skill context (minimal, not full text)
 * - Remaining work
 *
 * The snapshot is designed to be read by a human or AI agent in the next
 * chat session to resume work WITHOUT re-reading all files from scratch.
 * It is kept intentionally terse to stay well under 2000 tokens.
 */
class ContextCompactor {
  /**
   * @param {string} agentsDir - Absolute path to .agents/ directory
   */
  constructor(agentsDir) {
    this.agentsDir    = agentsDir;
    this.snapshotsDir = path.join(agentsDir, 'context-snapshots');
  }

  /**
   * Create a context snapshot from structured data.
   *
   * @param {object} data
   * @param {string}   data.goal            - One-line description of the session goal
   * @param {string[]} data.completed        - List of completed steps
   * @param {string[]} data.decisions        - Key decisions made
   * @param {string[]} data.filesModified    - Files changed this session
   * @param {string[]} data.filesToReference - Files to read in the next session
   * @param {string[]} data.activeSkills     - Skill names still needed
   * @param {string[]} data.remaining        - Remaining work items
   * @param {string}   [data.notes]          - Optional freeform notes
   * @returns {{ filePath: string, tokens: number, content: string }}
   */
  createSnapshot(data) {
    const now      = new Date();
    const ts       = now.toISOString();
    const fileTs   = ts.replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${fileTs}.md`;

    const content = this._renderSnapshot(data, ts);

    // Ensure directory exists
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }

    const filePath = path.join(this.snapshotsDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');

    // Approximate token count
    const tokens = Math.ceil(content.length / 4);

    return { filePath, tokens, content };
  }

  /**
   * Load the most recent snapshot if one exists.
   * @returns {{ filePath: string, content: string } | null}
   */
  loadLatest() {
    if (!fs.existsSync(this.snapshotsDir)) return null;

    const files = fs.readdirSync(this.snapshotsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const filePath = path.join(this.snapshotsDir, files[0]);
    return { filePath, content: fs.readFileSync(filePath, 'utf8') };
  }

  /**
   * List all snapshots, newest first.
   * @returns {Array<{ filename: string, path: string, created: Date }>}
   */
  listSnapshots() {
    if (!fs.existsSync(this.snapshotsDir)) return [];

    return fs.readdirSync(this.snapshotsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .map(f => ({
        filename: f,
        path: path.join(this.snapshotsDir, f),
        created: new Date(f.replace('T', 'T').replace(/-(\d{2})-(\d{2})$/, ':$1:$2')),
      }));
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  _renderSnapshot(data, ts) {
    const {
      goal           = 'No goal specified',
      completed      = [],
      decisions      = [],
      filesModified  = [],
      filesToReference = [],
      activeSkills   = [],
      remaining      = [],
      notes          = null,
    } = data;

    const lines = [
      `# Context Snapshot — ${ts}`,
      '',
      `> **How to use this**: Paste this entire snapshot into your NEW chat session as the first message.`,
      `> The agent will resume from exactly where you left off.`,
      '',
      '## Session Goal',
      goal,
      '',
    ];

    if (completed.length > 0) {
      lines.push('## Completed Steps');
      completed.forEach(step => lines.push(`- [x] ${step}`));
      lines.push('');
    }

    if (remaining.length > 0) {
      lines.push('## Remaining Work');
      remaining.forEach(item => lines.push(`- [ ] ${item}`));
      lines.push('');
    }

    if (decisions.length > 0) {
      lines.push('## Key Decisions Made');
      decisions.forEach(d => lines.push(`- ${d}`));
      lines.push('');
    }

    if (filesModified.length > 0) {
      lines.push('## Files Modified This Session');
      filesModified.forEach(f => lines.push(`- \`${f}\``));
      lines.push('');
    }

    if (filesToReference.length > 0) {
      lines.push('## Files to Reference (Next Session)');
      lines.push('> Read ONLY these files — do not re-scan the whole codebase.');
      filesToReference.forEach(f => lines.push(`- \`${f}\``));
      lines.push('');
    }

    if (activeSkills.length > 0) {
      lines.push('## Active Skills (Load These Only)');
      lines.push('> Load ONLY the skills listed here — not all skills.');
      activeSkills.forEach(s => lines.push(`- ${s}`));
      lines.push('');
    }

    if (notes) {
      lines.push('## Notes');
      lines.push(notes);
      lines.push('');
    }

    lines.push('---');
    lines.push('*Generated by `agents-skills compact`*');

    return lines.join('\n');
  }
}

module.exports = { ContextCompactor };

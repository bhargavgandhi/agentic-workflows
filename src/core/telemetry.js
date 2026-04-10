'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

/**
 * Telemetry core — privacy-first, opt-in, local-only by default.
 *
 * - All data stored locally in ~/.agents-skills/telemetry.jsonl
 * - No PII collected (no paths, no usernames, no content)
 * - Respects DO_NOT_TRACK environment variable
 * - Opt-in via `agents-skills telemetry on`
 */

const AGENTS_HOME    = path.join(os.homedir(), '.agents-skills');
const CONFIG_FILE    = path.join(AGENTS_HOME, 'config.json');
const TELEMETRY_FILE = path.join(AGENTS_HOME, 'telemetry.jsonl');

const EVENTS = {
  SKILL_INSTALLED:    'skill.installed',
  SKILL_ADDED:        'skill.added',
  SKILL_SEARCHED:     'skill.searched',
  RECIPE_USED:        'recipe.used',
  DOCTOR_RUN:         'doctor.run',
  TOKENS_CHECKED:     'tokens.checked',
  CONTEXT_COMPACTED:  'context.compacted',
  PROFILE_GENERATED:  'profile.generated',
  FULL_INSTALL:       'install.full',
};

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Track an event (no-op if telemetry is disabled or DO_NOT_TRACK is set).
 * @param {string} event  - Event name (use EVENTS constants)
 * @param {object} [data] - Anonymous metadata (no PII)
 */
function track(event, data = {}) {
  if (!isEnabled()) return;

  const record = {
    event,
    ts: new Date().toISOString(),
    ...data,
  };

  _ensureHome();
  fs.appendFileSync(TELEMETRY_FILE, JSON.stringify(record) + '\n', 'utf8');
}

/**
 * Check if telemetry is enabled.
 * @returns {boolean}
 */
function isEnabled() {
  // Always off if DO_NOT_TRACK is set
  if (process.env.DO_NOT_TRACK === '1' || process.env.DO_NOT_TRACK === 'true') {
    return false;
  }

  const config = _loadConfig();
  return config.telemetry === true;
}

/**
 * Enable telemetry.
 */
function enable() {
  const config = _loadConfig();
  config.telemetry = true;
  _saveConfig(config);
}

/**
 * Disable telemetry.
 */
function disable() {
  const config = _loadConfig();
  config.telemetry = false;
  _saveConfig(config);
}

/**
 * Read recent events from the local log.
 * @param {number} limit - Max events to return
 * @returns {object[]}
 */
function readEvents(limit = 50) {
  if (!fs.existsSync(TELEMETRY_FILE)) return [];
  const lines = fs.readFileSync(TELEMETRY_FILE, 'utf8').trim().split('\n').filter(Boolean);
  return lines
    .slice(-limit)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .reverse(); // newest first
}

/**
 * Build a usage summary report from the local log.
 * @param {number} days - Look-back window
 * @returns {object}
 */
function buildReport(days = 30) {
  const cutoff = Date.now() - (days * 24 * 3600 * 1000);
  const events = readEvents(10000)
    .filter(e => new Date(e.ts).getTime() > cutoff);

  const skillInstalls  = _tally(events.filter(e => e.event === EVENTS.SKILL_INSTALLED || e.event === EVENTS.SKILL_ADDED), 'skill');
  const recipesUsed    = _tally(events.filter(e => e.event === EVENTS.RECIPE_USED), 'recipe');
  const tokenChecks    = events.filter(e => e.event === EVENTS.TOKENS_CHECKED);
  const compactions    = events.filter(e => e.event === EVENTS.CONTEXT_COMPACTED).length;
  const doctorRuns     = events.filter(e => e.event === EVENTS.DOCTOR_RUN).length;

  const avgTokenPct = tokenChecks.length > 0
    ? (tokenChecks.reduce((s, e) => s + (parseFloat(e.percent) || 0), 0) / tokenChecks.length).toFixed(1)
    : null;

  return {
    period:         `Last ${days} days`,
    totalEvents:    events.length,
    skillInstalls,
    recipesUsed,
    avgContextPct:  avgTokenPct,
    compactions,
    doctorRuns,
  };
}

// ── Private ───────────────────────────────────────────────────────────────────

function _ensureHome() {
  if (!fs.existsSync(AGENTS_HOME)) fs.mkdirSync(AGENTS_HOME, { recursive: true });
}

function _loadConfig() {
  _ensureHome();
  if (!fs.existsSync(CONFIG_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch { return {}; }
}

function _saveConfig(config) {
  _ensureHome();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

function _tally(events, key) {
  const counts = {};
  for (const e of events) {
    const val = e[key];
    if (val) counts[val] = (counts[val] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

module.exports = {
  track,
  isEnabled,
  enable,
  disable,
  readEvents,
  buildReport,
  EVENTS,
  CONFIG_FILE,
  TELEMETRY_FILE,
  AGENTS_HOME,
};

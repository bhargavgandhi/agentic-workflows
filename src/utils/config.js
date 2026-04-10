'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

/**
 * User preferences store.
 * Persisted at ~/.agents-skills/config.json
 */

const AGENTS_HOME = path.join(os.homedir(), '.agents-skills');
const CONFIG_FILE = path.join(AGENTS_HOME, 'config.json');

/**
 * Load user config. Returns empty object if none exists.
 * @returns {object}
 */
function loadConfig() {
  _ensureHome();
  if (!fs.existsSync(CONFIG_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch { return {}; }
}

/**
 * Save user config (merges with existing).
 * @param {object} updates
 */
function saveConfig(updates) {
  _ensureHome();
  const existing = loadConfig();
  const merged   = { ...existing, ...updates };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
}

/**
 * Get a single config value.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
function get(key, defaultValue = null) {
  return loadConfig()[key] ?? defaultValue;
}

/**
 * Set a single config value.
 * @param {string} key
 * @param {*} value
 */
function set(key, value) {
  saveConfig({ [key]: value });
}

/**
 * Check if this is the first run (no config exists yet).
 * @returns {boolean}
 */
function isFirstRun() {
  return !fs.existsSync(CONFIG_FILE);
}

/**
 * Mark that first-run setup has been completed.
 */
function markFirstRunDone() {
  saveConfig({ first_run_done: true, first_run_at: new Date().toISOString() });
}

function _ensureHome() {
  if (!fs.existsSync(AGENTS_HOME)) fs.mkdirSync(AGENTS_HOME, { recursive: true });
}

module.exports = {
  loadConfig, saveConfig, get, set,
  isFirstRun, markFirstRunDone,
  CONFIG_FILE, AGENTS_HOME,
};

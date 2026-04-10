'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Detect the tech stack of a workspace by scanning for signal files.
 *
 * @param {string} workspacePath - Absolute path to workspace root
 * @returns {ProjectProfile}
 *
 * @typedef {object} ProjectProfile
 * @property {string}   generated_at
 * @property {string}   framework
 * @property {string}   language
 * @property {string}   styling
 * @property {string}   stateManagement
 * @property {{ unit: string|null, e2e: string|null }} testing
 * @property {string}   packageManager
 * @property {boolean}  monorepo
 * @property {string[]} detectedSkills
 * @property {string[]} entryPoints
 * @property {TokenBudget} tokenBudget
 *
 * @typedef {object} TokenBudget
 * @property {string} model
 * @property {number} contextWindow
 * @property {number} budgetPercent
 * @property {number} budgetTokens
 */
function detectProject(workspacePath) {
  const has  = (...files) => files.some(f => fs.existsSync(path.join(workspacePath, f)));
  const read = (file) => {
    const p = path.join(workspacePath, file);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  };

  // ── Framework ─────────────────────────────────────────────────────────────
  let framework = 'unknown';
  if (has('next.config.ts', 'next.config.js', 'next.config.mjs')) {
    framework = _detectNextVariant(workspacePath);
  } else if (has('vite.config.ts', 'vite.config.js', 'vite.config.mjs')) {
    framework = 'vite';
  } else if (has('remix.config.js', 'remix.config.ts')) {
    framework = 'remix';
  } else if (has('nuxt.config.ts', 'nuxt.config.js')) {
    framework = 'nuxt';
  } else if (has('svelte.config.js', 'svelte.config.ts')) {
    framework = 'svelte';
  } else if (has('angular.json')) {
    framework = 'angular';
  } else if (has('package.json')) {
    const pkg = _parsePkgJson(workspacePath);
    if (pkg?.dependencies?.['react'] || pkg?.devDependencies?.['react']) {
      framework = 'react-cra';
    } else if (pkg?.dependencies?.['express'] || pkg?.dependencies?.['fastify']) {
      framework = 'node-backend';
    }
  }

  // ── Language ──────────────────────────────────────────────────────────────
  const language = has('tsconfig.json', 'tsconfig.base.json') ? 'typescript' : 'javascript';

  // ── Styling ───────────────────────────────────────────────────────────────
  let styling = 'css';
  if (has('tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs')) {
    styling = 'tailwindcss';
  } else if (has('postcss.config.js', 'postcss.config.cjs')) {
    styling = 'postcss';
  }

  // ── State management ──────────────────────────────────────────────────────
  const pkg = _parsePkgJson(workspacePath);
  let stateManagement = 'none';
  if (_hasDep(pkg, '@tanstack/react-query') || _hasDep(pkg, 'react-query')) {
    stateManagement = 'react-query';
  } else if (_hasDep(pkg, '@reduxjs/toolkit')) {
    stateManagement = 'redux-toolkit';
  } else if (_hasDep(pkg, 'zustand')) {
    stateManagement = 'zustand';
  } else if (_hasDep(pkg, 'jotai')) {
    stateManagement = 'jotai';
  } else if (_hasDep(pkg, 'recoil')) {
    stateManagement = 'recoil';
  }

  // ── Testing ───────────────────────────────────────────────────────────────
  const unitTest = has('vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs') ? 'vitest'
    : has('jest.config.ts', 'jest.config.js', 'jest.config.cjs') ? 'jest'
    : null;
  const e2eTest = has('playwright.config.ts', 'playwright.config.js') ? 'playwright'
    : has('cypress.config.ts', 'cypress.config.js') ? 'cypress'
    : null;

  // ── Package manager ───────────────────────────────────────────────────────
  const packageManager = has('pnpm-lock.yaml') ? 'pnpm'
    : has('yarn.lock') ? 'yarn'
    : 'npm';

  // ── Monorepo ──────────────────────────────────────────────────────────────
  const monorepo = has(
    'pnpm-workspace.yaml',
    'lerna.json',
    'nx.json',
    'turbo.json',
    'packages'
  );

  // ── Recommended skills ────────────────────────────────────────────────────
  const detectedSkills = _recommendSkills({
    framework, styling, stateManagement, testing: { unit: unitTest, e2e: e2eTest }, pkg
  });

  // ── Entry points ──────────────────────────────────────────────────────────
  const entryPoints = _findEntryPoints(workspacePath, framework);

  // ── Default token budget ──────────────────────────────────────────────────
  const defaultModel = 'claude-sonnet-4-20250514';
  const contextWindow = 200000;
  const budgetPercent = 40;

  return {
    generated_at: new Date().toISOString(),
    framework,
    language,
    styling,
    stateManagement,
    testing: { unit: unitTest, e2e: e2eTest },
    packageManager,
    monorepo,
    detectedSkills,
    entryPoints,
    tokenBudget: {
      model: defaultModel,
      contextWindow,
      budgetPercent,
      budgetTokens: Math.floor(contextWindow * budgetPercent / 100),
    },
  };
}

// ── Private helpers ────────────────────────────────────────────────────────────

function _detectNextVariant(workspacePath) {
  const appDir = path.join(workspacePath, 'src', 'app');
  const appDir2 = path.join(workspacePath, 'app');
  if (fs.existsSync(appDir) || fs.existsSync(appDir2)) return 'next-app-router';
  return 'next-pages-router';
}

function _parsePkgJson(workspacePath) {
  const p = path.join(workspacePath, 'package.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function _hasDep(pkg, name) {
  if (!pkg) return false;
  return !!(pkg.dependencies?.[name] || pkg.devDependencies?.[name]);
}

function _recommendSkills({ framework, styling, stateManagement, testing, pkg }) {
  const skills = [];

  // Always useful
  skills.push('code-reviewer', 'git-workflow');

  if (framework.startsWith('next') || framework === 'vite' || framework === 'react-cra') {
    skills.push('frontend-design', 'react-component-scaffolder');
  }

  if (styling === 'tailwindcss') {
    // tailwind usage handled by frontend-design skill
  }

  if (stateManagement === 'react-query')    skills.push('react-query');
  if (stateManagement === 'redux-toolkit')   skills.push('rtk-query');

  if (_hasDep(pkg, 'firebase') || _hasDep(pkg, 'firebase-admin')) {
    skills.push('firebase-setup');
  }
  if (_hasDep(pkg, '@apollo/client') || _hasDep(pkg, 'graphql')) {
    skills.push('graphql-frontend');
  }
  if (_hasDep(pkg, 'apollo-server') || _hasDep(pkg, '@apollo/server')) {
    skills.push('graphql-backend');
  }
  if (_hasDep(pkg, 'payload'))   skills.push('payload-cms');
  if (_hasDep(pkg, 'expo'))      skills.push('react-native');

  if (testing.unit === 'vitest' || testing.unit === 'jest') skills.push('test-writing');
  if (testing.e2e === 'playwright') skills.push('playwright');

  // Framework === backend
  if (framework === 'node-backend') skills.push('backend-engineer');

  return [...new Set(skills)]; // deduplicate
}

function _findEntryPoints(workspacePath, framework) {
  const candidates = [
    'src/app/page.tsx', 'src/app/page.js',
    'src/app/layout.tsx', 'src/app/layout.js',
    'src/pages/index.tsx', 'src/pages/index.js',
    'src/main.tsx', 'src/main.ts', 'src/main.js',
    'src/index.tsx', 'src/index.ts', 'src/index.js',
    'app/page.tsx', 'app/layout.tsx',
    'index.ts', 'index.js',
  ];

  return candidates
    .filter(f => fs.existsSync(path.join(workspacePath, f)))
    .slice(0, 5); // limit to top 5
}

module.exports = { detectProject };

'use strict';

const path = require('path');
const pc   = require('picocolors');

const { compressObservations } = require('../core/memory-compressor');
const { searchLearnings, memoryStatus, injectLearnings } = require('../core/memory-search');
const { exportLearning } = require('../core/memory-exporter');
const { detectProject } = require('../core/project-detector');

async function memoryCommand(args) {
  const [sub, ...rest] = args;
  const cwd        = process.cwd();
  const memoryDir  = path.join(cwd, '.agents', 'memory');
  const obsDir     = path.join(memoryDir, 'observations');
  const learningsDir = path.join(memoryDir, 'learnings');

  switch (sub) {
    case 'compress': {
      console.log('');
      console.log(pc.bgCyan(pc.black(' 🧠 memory compress ')));
      console.log('');
      compressObservations(obsDir, learningsDir);
      const { learningCount } = memoryStatus(cwd);
      console.log(pc.green(`  ✓ Compression complete. ${learningCount} learning(s) in index.`));
      console.log('');
      break;
    }

    case 'search': {
      const query = rest.join(' ').trim();
      if (!query) {
        console.log(pc.yellow('  Usage: agents-skills memory search <query>'));
        return;
      }
      console.log('');
      console.log(pc.bgCyan(pc.black(' 🔍 memory search ')));
      console.log('');
      const results = searchLearnings(learningsDir, query);
      if (results.length === 0) {
        console.log(pc.dim(`  No learnings found for "${query}".`));
      } else {
        for (const r of results) {
          console.log(pc.cyan(`  ${r.title}`));
          console.log(pc.dim(`    tags: ${r.tags.join(', ')}  |  ${r.timestamp.slice(0, 10)}`));
        }
      }
      console.log('');
      break;
    }

    case 'status': {
      console.log('');
      console.log(pc.bgCyan(pc.black(' 📊 memory status ')));
      console.log('');
      const status = memoryStatus(cwd);
      console.log(`  Observations:    ${pc.cyan(status.observationCount)}`);
      console.log(`  Learnings:       ${pc.cyan(status.learningCount)}`);
      console.log(`  Last compressed: ${pc.cyan(status.lastCompressed ?? 'never')}`);
      console.log('');
      break;
    }

    case 'inject': {
      console.log('');
      console.log(pc.bgCyan(pc.black(' 💉 memory inject ')));
      console.log('');
      const profile     = detectProject(cwd);
      const contextTags = [
        profile.framework !== 'unknown' ? profile.framework : null,
        profile.language  !== 'unknown' ? profile.language  : null,
      ].filter(Boolean).map(t => t.toLowerCase());

      const results = injectLearnings(cwd, { contextTags, topN: 3 });

      if (results.length === 0) {
        console.log(pc.dim('  No relevant learnings found for current project context.'));
      } else {
        for (const r of results) {
          console.log(pc.cyan(`## ${r.title}`));
          console.log(pc.dim(`tags: ${(r.tags || []).join(', ')}`));
        }
      }
      console.log('');
      break;
    }

    case 'export': {
      const [learningName, ...exportFlags] = rest;
      if (!learningName) {
        console.log(pc.yellow('  Usage: agents-skills memory export <learning-name> [--force]'));
        return;
      }
      const force     = exportFlags.includes('--force');
      const skillsDir = path.join(cwd, 'skills');

      console.log('');
      console.log(pc.bgCyan(pc.black(' 📦 memory export ')));
      console.log('');

      try {
        exportLearning(cwd, learningName, skillsDir, { force });
        const skillMd = path.join(skillsDir, learningName, 'SKILL.md');
        if (require('fs').existsSync(skillMd)) {
          console.log(pc.green(`  ✓ Exported: skills/${learningName}/SKILL.md`));
          console.log(pc.dim(`    Run 'agents-skills doctor' to verify anatomy.`));
        } else {
          console.log(pc.yellow(`  ⚠ skills/${learningName}/SKILL.md already exists. Use --force to overwrite.`));
        }
      } catch (err) {
        console.log(pc.red(`  ✗ ${err.message}`));
        process.exitCode = 1;
      }
      console.log('');
      break;
    }

    default:
      console.log('');
      console.log(pc.bold('  agents-skills memory <subcommand>'));
      console.log('');
      console.log('    compress             Distill observations into structured learnings');
      console.log('    search <query>       Search learnings by tag or content');
      console.log('    status               Show observation/learning counts');
      console.log('    inject               Surface top-3 relevant learnings for current project');
      console.log('    export <name>        Promote a learning to a full SKILL.md');
      console.log('');
  }
}

module.exports = { memoryCommand };

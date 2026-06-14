#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir, access, copyFile } from 'node:fs/promises';
import { join, dirname, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEMPLATES = join(ROOT, 'templates');

const STACK_DETECT = [
  { file: 'next.config.js', config: 'nextjs-typescript' },
  { file: 'next.config.mjs', config: 'nextjs-typescript' },
  { file: 'next.config.ts', config: 'nextjs-typescript' },
  { file: 'go.mod', config: 'go' },
  { file: 'requirements.txt', deps: ['fastapi'], config: 'python-fastapi' },
  { file: 'pyproject.toml', deps: ['fastapi'], config: 'python-fastapi' },
  { file: 'package.json', deps: ['next', 'react'], config: 'nextjs-typescript' },
  { file: 'package.json', deps: ['express'], config: 'node-express' },
  { file: 'package.json', config: 'node-express' },
  { file: 'tsconfig.json', config: 'node-express' },
  { file: 'index.js', config: 'node-express' },
  { file: 'index.ts', config: 'node-express' },
  { file: 'main.go', config: 'go' },
  { file: 'app/main.py', config: 'python-fastapi' },
  { file: 'Cargo.toml', config: 'rust' },
  { file: 'Gemfile', config: 'ruby' },
];

const HELP = `aicfg — AGENTS.md ecosystem tool. One command to manage AI agent configuration.

Usage:
  aicfg init [stack]          Generate AGENTS.md + tool-specific shims for this project
  aicfg shim                  Generate shim files from existing AGENTS.md
  aicfg validate              Validate AGENTS.md against best practices
  aicfg check                 Audit all AI agent config files for completeness
  aicfg pack                  Bundle codebase context for AI consumption

Examples:
  aicfg init                               # Auto-detect stack, generate AGENTS.md + shims
  aicfg init go                            # Generate for Go projects
  aicfg init --no-shims                    # Only AGENTS.md, skip shim files
  aicfg shim                               # Create CLAUDE.md, .cursorrules, GEMINI.md shims
  aicfg validate                           # Check your AGENTS.md quality

AGENTS.md is the open standard for AI agent configuration, stewarded by the Linux Foundation.
Supported by 20+ AI coding tools: Claude Code, Cursor, Copilot, Codex, Gemini CLI, Windsurf, and more.

Run without install: npx github:ipythoning/aicfg init
Install globally:     npm install -g github:ipythoning/aicfg
GitHub:   https://github.com/ipythoning/aicfg
Docs:     https://agents.md`;

// AGENTS.md quality checks — based on the AGENTS.md spec and empirical research
const AGENTS_CHECKS = [
  ['Has project overview (stack, structure)', /(?:overview|概述|project|stack|structure|架构)/i, 'Add a section describing the tech stack and project layout'],
  ['Has build & test commands', /(?:npm run|pnpm |yarn |cargo |go build|uv run|pip |make |poetry)/i, 'Include exact build and test commands with flags'],
  ['Has coding style rules', /(?:coding.style|code.style|编码风格|naming|naming convention|prettier|eslint|format)/i, 'Define code style rules that differ from language defaults'],
  ['Has scope/boundaries', /(?:boundar|scope|do not|never|don\'t|avoid|forbidden|limit)/i, 'Define file/operation boundaries the agent must respect'],
  ['Has error handling rules', /(?:error.handling|错误处理|catch|throw|reject|panic)/i, 'Include error handling conventions'],
  ['Has testing instructions', /(?:test|测试|coverage|覆盖率|mock|fixture|assert)/i, 'Document testing approach, runner, and coverage targets'],
  ['Has security rules', /(?:security|安全|secret|API.key|hardcod|auth|token|vulnerab)/i, 'Include security guidelines for secrets, auth, and input validation'],
  ['Has git/PR workflow', /(?:git|commit|提交|PR|pull.request|branch|rebase)/i, 'Define git workflow, commit conventions, and PR requirements'],
  ['Length > 500 chars (meaningful detail)', /[\s\S]{500}/, 'AGENTS.md is too short — add more substance. Target 50-200 lines'],
];

// Tool-specific shim templates
const SHIMS = {
  'CLAUDE.md': `# CLAUDE.md
<!-- This is a shim. All agent instructions live in AGENTS.md -->
Read and follow all instructions in [AGENTS.md](./AGENTS.md).
`,
  '.cursorrules': `# .cursorrules
# Shim — all instructions live in AGENTS.md
Read and follow all instructions in AGENTS.md.
`,
  'GEMINI.md': `# GEMINI.md
<!-- Shim — all instructions live in AGENTS.md -->
Read and follow all instructions in [AGENTS.md](./AGENTS.md).
`,
  'copilot-instructions.md': `# Copilot Instructions
<!-- Shim — all instructions live in AGENTS.md -->
Read and follow all instructions in AGENTS.md.
`,
};

async function main() {
  const cmd = process.argv[2];
  switch (cmd) {
    case 'init': return await initCmd();
    case 'shim': return await shimCmd();
    case 'validate': return await validateCmd();
    case 'check': return await checkCmd();
    case 'pack': return await packCmd();
    case '--help': case '-h': case undefined: console.log(HELP); break;
    case '--version': case '-v': console.log('aicfg v0.4.0'); break;
    default: console.error(`Unknown command: ${cmd}\nRun aicfg --help`); process.exit(1);
  }
}

// === init — Auto-detect stack, generate AGENTS.md + shims ===

async function initCmd() {
  const cwd = process.cwd();
  const stack = process.argv[3] && !process.argv[3].startsWith('--')
    ? process.argv[3]
    : await detectStack(cwd);
  const noShims = process.argv.includes('--no-shims');

  if (!stack) {
    console.log('⚠ Could not auto-detect stack. Available templates:');
    for (const t of (await readdir(TEMPLATES)).sort()) {
      console.log(`  - ${t}`);
    }
    console.log('\nTo pick a stack: aicfg init <stack>');
    process.exit(0);
  }

  const templateDir = join(TEMPLATES, stack);
  if (!(await fileExists(templateDir))) {
    console.error(`Template "${stack}" not found.`);
    console.error('Available: ' + (await readdir(TEMPLATES)).sort().join(', '));
    process.exit(1);
  }

  console.log(`✓ Detected stack: ${stack}`);

  // Copy template AGENTS.md if it exists, or generate from CLAUDE.md
  const agentsTemplate = join(templateDir, 'AGENTS.md');
  const claudeTemplate = join(templateDir, 'CLAUDE.md');

  if (await fileExists(agentsTemplate)) {
    await copyIfNotExists(agentsTemplate, join(cwd, 'AGENTS.md'));
    console.log('  ✓ AGENTS.md (primary agent config)');
  } else if (await fileExists(claudeTemplate)) {
    // Backward compat: use CLAUDE.md as AGENTS.md
    let content = await readFile(claudeTemplate, 'utf-8');
    content = content.replace(/^# CLAUDE\.md/m, '# AGENTS.md');
    content = content.replace(/CLAUDE\.md/g, 'AGENTS.md');
    await writeIfNotExists(join(cwd, 'AGENTS.md'), content);
    console.log('  ✓ AGENTS.md (primary agent config)');
  }

  // Generate shim files
  if (!noShims) {
    for (const [filename, content] of Object.entries(SHIMS)) {
      const targetPath = filename === 'copilot-instructions.md'
        ? join(cwd, '.github', filename)
        : join(cwd, filename);
      if (filename === 'copilot-instructions.md') {
        await mkdir(join(cwd, '.github'), { recursive: true });
      }
      await writeIfNotExists(targetPath, content);
    }

    console.log('  ✓ Shim files: CLAUDE.md, .cursorrules, GEMINI.md → all point to AGENTS.md');
    console.log('  ✓ .github/copilot-instructions.md');
  }

  // Also check if template has other files (README.md etc.)
  for (const entry of await readdir(templateDir, { withFileTypes: true })) {
    if (entry.isDirectory()) continue;
    if (['AGENTS.md', 'CLAUDE.md', '.cursorrules', 'GEMINI.md'].includes(entry.name)) continue;
    await copyIfNotExists(join(templateDir, entry.name), join(cwd, entry.name));
  }

  console.log('\n📖 AGENTS.md is the open standard for AI agent configuration.');
  console.log('   Supported by 20+ AI coding tools. Edit AGENTS.md as your single source of truth.');
  console.log('   Shim files (CLAUDE.md, .cursorrules, GEMINI.md) point to AGENTS.md — never edit them directly.');
  console.log('\n   Run "aicfg validate" to check your AGENTS.md quality.');
  console.log('   Run "aicfg check" for a full config audit.');
}

// === shim — Generate shim files from existing AGENTS.md ===

async function shimCmd() {
  const cwd = process.cwd();
  const agentsPath = join(cwd, 'AGENTS.md');

  if (!(await fileExists(agentsPath))) {
    console.error('✗ No AGENTS.md found in current directory.');
    console.error('  Run "aicfg init" first, or create AGENTS.md manually.');
    process.exit(1);
  }

  let created = 0, skipped = 0;
  for (const [filename, content] of Object.entries(SHIMS)) {
    const targetPath = filename === 'copilot-instructions.md'
      ? join(cwd, '.github', filename)
      : join(cwd, filename);
    if (filename === 'copilot-instructions.md') {
      await mkdir(join(cwd, '.github'), { recursive: true });
    }
    if (await fileExists(targetPath)) {
      skipped++;
    } else {
      await writeFile(targetPath, content);
      created++;
      console.log(`  ✓ ${filename}`);
    }
  }

  if (created > 0) {
    console.log(`\n✓ Created ${created} shim file${created > 1 ? 's' : ''} (${skipped} already existed)`);
    console.log('  All shims point to AGENTS.md — the single source of truth.');
  } else {
    console.log('  All shim files already exist.');
  }
}

// === validate — Check AGENTS.md quality ===

async function validateCmd() {
  const cwd = process.cwd();
  const agentsPath = join(cwd, 'AGENTS.md');

  if (!(await fileExists(agentsPath))) {
    console.error('✗ No AGENTS.md found.');
    console.error('  Run "aicfg init" to generate one, or create AGENTS.md manually.');
    process.exit(1);
  }

  const content = await readFile(agentsPath, 'utf-8');
  const lines = content.split('\n').length;
  const chars = content.length;

  let pass = 0, fail = 0, warn = 0;

  console.log(`AGENTS.md — ${lines} lines, ${chars.toLocaleString()} chars\n`);

  for (const [name, pattern, advice] of AGENTS_CHECKS) {
    if (pattern.test(content)) {
      pass++;
    } else {
      fail++;
      console.log(`  ✗ ${name}`);
      console.log(`    → ${advice}`);
    }
  }

  // Additional structural checks
  if (!content.startsWith('# ')) {
    warn++;
    console.log('  ⚠ Missing h1 title — AGENTS.md should start with "# Project Name"');
  }
  if (lines > 400) {
    warn++;
    console.log(`  ⚠ AGENTS.md is very long (${lines} lines). Consider keeping it under 400 lines.`);
    console.log('    → Agents have limited context windows. Be concise.');
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ✓ ${pass} passed  ✗ ${fail} missing  ${warn > 0 ? '⚠ ' + warn + ' warnings' : ''}`);

  if (fail === 0 && warn === 0) {
    console.log('  🎉 AGENTS.md is in great shape!');
  } else if (fail > 0) {
    console.log(`\n  Fix the ${fail} issue${fail > 1 ? 's' : ''} above to improve agent behavior.`);
    console.log('  Tip: each fix directly improves how AI agents work on this project.');
  }
}

// === check — Full config audit (AGENTS.md + shims) ===

async function checkCmd() {
  const cwd = process.cwd();
  const issues = [];
  const ok = [];

  // Check AGENTS.md
  const agents = join(cwd, 'AGENTS.md');
  if (!(await fileExists(agents))) {
    issues.push('Missing AGENTS.md — run "aicfg init" to generate one');
  } else {
    ok.push('AGENTS.md exists');
    const content = await readFile(agents, 'utf-8');

    if (content.length < 500) {
      issues.push('AGENTS.md is very short (<500 chars). Add more substance.');
    }
    if (content.length > 20000) {
      issues.push('AGENTS.md is very long (>20K chars). Agents have context limits — be concise.');
    }

    // Run all AGENTS_CHECKS
    for (const [name, pattern] of AGENTS_CHECKS) {
      if (pattern.test(content)) {
        ok.push(`  ✓ ${name}`);
      } else {
        issues.push(`  ⚠ ${name}`);
      }
    }
  }

  // Check shim files
  const shimFiles = ['CLAUDE.md', '.cursorrules', 'GEMINI.md'];
  for (const f of shimFiles) {
    if (await fileExists(join(cwd, f))) {
      const shimContent = await readFile(join(cwd, f), 'utf-8');
      if (shimContent.includes('AGENTS.md')) {
        ok.push(`${f} → correctly points to AGENTS.md`);
      } else {
        issues.push(`${f} exists but does not reference AGENTS.md — may contain stale rules`);
      }
    } else {
      issues.push(`Missing ${f} shim — run "aicfg shim" to generate`);
    }
  }

  // Check Copilot instructions
  const copilotPath = join(cwd, '.github', 'copilot-instructions.md');
  if (await fileExists(copilotPath)) {
    ok.push('.github/copilot-instructions.md exists');
  }

  console.log('✓ PASS:');
  for (const o of ok) console.log(o);

  if (issues.length > 0) {
    console.log(`\n⚠ ISSUES (${issues.length}):`);
    for (const i of issues) console.log(i);
    console.log('\nRun "aicfg init" to fix missing files.');
  } else {
    console.log('\n🎉 All checks passed!');
  }
}

// === pack — Bundle codebase context ===

async function packCmd() {
  const cwd = process.cwd();
  const ignores = await loadGitignore(cwd);
  const files = await walkDir(cwd, cwd, ignores);

  let output = `# Codebase Context — ${basename(cwd)}\n`;
  output += `# Generated by aicfg pack\n`;
  output += `# ${files.length} files, generated ${new Date().toISOString()}\n\n`;

  let totalChars = 0;
  for (const f of files.sort()) {
    try {
      const content = await readFile(join(cwd, f), 'utf-8');
      const ext = extname(f).slice(1) || 'txt';
      output += `## ${f}\n\`\`\`${ext}\n${content}\n\`\`\`\n\n`;
      totalChars += content.length;
    } catch { /* skip binary/unreadable */ }
  }

  console.log(output);
  console.error(`✓ Packed ${files.length} files (~${Math.round(totalChars / 1000)}K chars)`);
}

// === Shared Utilities ===

async function detectStack(cwd) {
  for (const { file, deps, config } of STACK_DETECT) {
    if (!(await fileExists(join(cwd, file)))) continue;
    if (!deps || deps.length === 0) return config;
    try {
      if (file.endsWith('.json')) {
        const content = JSON.parse(await readFile(join(cwd, file), 'utf-8'));
        const allDeps = { ...content.dependencies, ...content.devDependencies };
        if (deps.some(d => allDeps[d])) return config;
      } else {
        const content = await readFile(join(cwd, file), 'utf-8');
        if (deps.some(d => content.includes(d))) return config;
      }
    } catch { /* continue */ }
  }
  return null;
}

async function copyIfNotExists(src, dest) {
  if (await fileExists(dest)) {
    console.log(`  ⚠ ${basename(dest)} already exists, skipping`);
    return;
  }
  await copyFile(src, dest);
}

async function writeIfNotExists(path, content) {
  if (await fileExists(path)) {
    console.log(`  ⚠ ${basename(path)} already exists, skipping`);
    return;
  }
  await writeFile(path, content);
}

async function loadGitignore(cwd) {
  const ignores = ['.git', 'node_modules', 'dist', '.next', '__pycache__', '*.pyc', '.DS_Store', 'coverage'];
  try {
    const content = await readFile(join(cwd, '.gitignore'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) ignores.push(trimmed);
    }
  } catch { /* no .gitignore */ }
  return ignores;
}

function matchIgnore(filePath, patterns) {
  for (const p of patterns) {
    if (p.endsWith('/') && filePath.startsWith(p)) return true;
    if (p.includes('*')) {
      const regex = new RegExp('^' + p.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$');
      if (regex.test(filePath)) return true;
    }
    if (filePath === p || filePath.startsWith(p + '/') || basename(filePath) === p) return true;
  }
  return false;
}

async function walkDir(root, dir, ignores) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    const rel = relative(root, full);
    if (matchIgnore(rel, ignores)) continue;
    if (e.isDirectory()) {
      files.push(...(await walkDir(root, full, ignores)));
    } else if (e.isFile()) {
      files.push(rel);
    }
  }
  return files;
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

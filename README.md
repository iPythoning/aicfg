# aicfg — AGENTS.md Ecosystem Tool

**Manage AI agent configuration across 20+ coding tools. One command.**

```bash
npm install -g github:ipythoning/aicfg    # Install globally
npx aicfg init                            # No install needed
```

## Why AGENTS.md?

[AGENTS.md](https://agents.md) is the **open standard** for AI agent configuration, stewarded by the Linux Foundation. It's supported by Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini CLI, Windsurf, Devin, Aider, and 15+ other AI coding tools.

**The problem**: Every AI coding tool has its own config format (CLAUDE.md, .cursorrules, copilot-instructions.md, GEMINI.md). Maintaining all of them is a nightmare — stale rules, contradictory instructions, copy-paste drift.

**The solution**: AGENTS.md as the **single source of truth**. Tool-specific files become 3-line shims that point to it. Edit once, apply everywhere.

Research from Princeton shows AGENTS.md reduces agent runtime by 28.6% and token usage by 16.6%. 60,000+ GitHub repos already use it.

## Quick Start

```bash
npx aicfg init
```

Detects your stack, generates AGENTS.md + shim files (CLAUDE.md, .cursorrules, GEMINI.md). 10 stacks supported.

## Commands

### `aicfg init [stack]`

Generate AGENTS.md + tool-specific shims:

```bash
aicfg init                  # Auto-detect stack
aicfg init go               # Explicit stack
aicfg init --no-shims       # Only AGENTS.md, skip shims
```

**10 stacks**: go, rust, node-express, nextjs-typescript, python-fastapi, monorepo, microservices, fullstack-nextjs, enterprise-python, ci-cd-integration, team-sharing

Generates:
- `AGENTS.md` — complete agent rules (single source of truth)
- `CLAUDE.md` — shim → "Read AGENTS.md"
- `.cursorrules` — shim → "Read AGENTS.md"
- `GEMINI.md` — shim → "Read AGENTS.md"
- `.github/copilot-instructions.md` — shim → "Read AGENTS.md"

### `aicfg shim`

Generate shim files from an existing AGENTS.md:

```bash
aicfg shim
```

Creates any missing shim files. Safe to run on existing projects — won't overwrite.

### `aicfg validate`

Check AGENTS.md quality against best practices:

```bash
aicfg validate
```

Checks for: project overview, build commands, coding style, scope boundaries, error handling, testing, security, git workflow, and adequate length.

### `aicfg check`

Full config audit — AGENTS.md + all shim files:

```bash
aicfg check
```

### `aicfg pack`

Bundle codebase context for AI consumption:

```bash
aicfg pack > context.md
aicfg pack | pbcopy     # macOS clipboard
```

## The Shim Pattern

AGENTS.md is your **single source of truth** — the only file you edit. All tool-specific files are auto-generated shims:

```
AGENTS.md          ← You edit this (full agent instructions)
CLAUDE.md          ← Shim: "Read AGENTS.md"
.cursorrules       ← Shim: "Read AGENTS.md"
GEMINI.md          ← Shim: "Read AGENTS.md"
copilot-instructions.md ← Shim: "Read AGENTS.md"
```

When you change your rules, edit AGENTS.md. The shims never go stale.

## Supported AI Tools

| Tool | Shim File |
|------|-----------|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| OpenAI Codex | `AGENTS.md` (native) |
| Gemini CLI | `GEMINI.md` |
| Windsurf | `AGENTS.md` (native) |
| Devin | `AGENTS.md` (native) |
| Aider | `AGENTS.md` (native) |
| JetBrains AI | `AGENTS.md` (native) |

## Built by AI Agents

aicfg configures itself using `aicfg init` — [check our AGENTS.md](AGENTS.md) to see the output. Dogfooding at its finest.

## License

MIT — free forever. AGENTS.md is the standard. Tooling around it should be free too.

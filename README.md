# aicfg

**One command to make AI coding agents follow your rules.**

```bash
npx aicfg init     # Auto-detect stack, generate optimal AI agent config
npx aicfg pack     # Bundle codebase context for AI
npx aicfg check    # Audit existing AI agent config
```

## The Problem

Every developer using AI coding tools (Claude Code, Cursor, Copilot) hits the same wall: AI doesn't follow your team's conventions. One day it uses your naming patterns. The next day it invents new ones. The third day it refactors code you didn't ask it to touch.

The problem isn't the model — it's that you haven't given it the right rules.

## The Solution

`aicfg init` auto-detects your tech stack and generates production-grade AI agent configuration — not "use TypeScript, write clean code" shallow instructions, but complete rule sets covering naming, immutability, error handling, security, and testing standards. Each rule includes a one-line explanation of *why* — because AI follows rules it understands, and ignores rules it doesn't.

## Quick Start

```bash
npx aicfg init
```

That's it. Review the generated files, customize as needed, commit.

## Commands

### `aicfg init [stack]`

Detects your project stack and generates:
- `CLAUDE.md` — comprehensive rules for Claude Code
- `.cursorrules` — matching rules for Cursor  
- `README.md` — project documentation template

Auto-detected stacks: Next.js, Node.js/Express, Python/FastAPI, Go

```bash
aicfg init              # Auto-detect
aicfg init go           # Explicit stack
```

### `aicfg pack`

Bundles your codebase context into a single file for AI consumption. Respects `.gitignore`, skips binaries, formats with code fences.

```bash
aicfg pack > context.md
aicfg pack | pbcopy     # macOS clipboard
```

### `aicfg check`

Audits your existing AI agent config for completeness. Checks: coding style rules, error handling, testing requirements, security rules, git workflow, and more.

```bash
aicfg check
```

## Supported AI Tools

- **Claude Code** (`CLAUDE.md`)
- **Cursor** (`.cursorrules`)
- **GitHub Copilot** (`.github/copilot-instructions.md` — coming soon)

## aicfg Pro

Free tier covers 4 stacks with basic rules. Pro unlocks:

- **Enterprise stacks**: monorepo, microservices, multi-language projects
- **Team sharing**: shared config repository for consistent rules across the team
- **CI/CD integration**: automatic config compliance checks in pull requests

[Learn more about aicfg Pro →](https://github.com/ipythoning/aicfg#pro)

## Self-Hosting

aicfg is built by AI agents, for AI agents. It configured itself using `aicfg init` — [check our CLAUDE.md](CLAUDE.md) to see the output.

## License

MIT — free forever for the core commands.

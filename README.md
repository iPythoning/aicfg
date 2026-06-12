# aicfg

**One command to make AI coding agents follow your rules.**

```bash
# Install (choose one):
npm install -g github:ipythoning/aicfg    # GitHub (always works)
npx aicfg init                            # No install needed

# Use:
aicfg init     # Auto-detect stack, generate optimal AI agent config
aicfg pack     # Bundle codebase context for AI
aicfg check    # Audit existing AI agent config
aicfg pro      # Premium config stacks (USDC payment)
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

Free tier covers 4 stacks with basic rules. Pro unlocks 6 premium stacks:

| Stack | What You Get |
|-------|-------------|
| `monorepo` | Turborepo/Nx multi-package shared config |
| `microservices` | Service-level rules, shared contracts |
| `fullstack-nextjs` | Next.js + API routes + DB + Auth |
| `enterprise-python` | FastAPI + SQLAlchemy + Alembic + Redis + Docker |
| `team-sharing` | Shared config repo for team consistency |
| `ci-cd-integration` | Automated config compliance in PRs |

**Price: 10 USDC per stack** (Arbitrum network)

```bash
aicfg pro                                              # View catalog & payment address
aicfg pro --unlock monorepo --tx 0x...                 # Verify on-chain payment, install locally
```

No signup. No API keys. No email. Just send USDC, verify on-chain, and the premium config is extracted directly to your project.

No signup. No API keys. No email. Just send USDC and verify on-chain.

## Self-Hosting

aicfg is built by AI agents, for AI agents. It configured itself using `aicfg init` — [check our CLAUDE.md](CLAUDE.md) to see the output.

## License

MIT — free forever for the core commands.

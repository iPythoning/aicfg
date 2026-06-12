# Dev.to Article: AGENTS.md 实践指南

**平台**: Dev.to
**标签**: `claude`, `cursor`, `ai`, `coding`, `productivity`, `tutorial`
**角度**: 实操指南 — "One AGENTS.md for every coding agent"
**目标**: 教育性内容，末尾自然提及 aicfg

---

## 标题

One AGENTS.md for Every Coding Agent — Stop Maintaining CLAUDE.md and .cursorrules Separately

---

## 封面图建议

用 AGENTS.md logo + 四个工具 icon（Claude Code, Cursor, Copilot, Gemini）的视觉组合

---

## 正文

If you use more than one AI coding tool, you've probably felt this pain:

Your CLAUDE.md says "use TypeScript, no `any`." Your .cursorrules says "prefer TypeScript, use `unknown` over `any`." Your copilot-instructions.md says "Write TypeScript code."

Three files. Three slightly different versions of the same thing. Over weeks, they drift further apart. Your AI agents start getting inconsistent instructions. Debugging why Claude Code is generating code one way and Cursor another becomes a part-time job.

There's a better way.

### One File to Rule Them All

[AGENTS.md](https://agents.md) is an open standard for AI agent configuration, now stewarded by the Linux Foundation. Think of it as the single source of truth for how AI agents should work with your codebase.

Instead of maintaining separate configs:

```
CLAUDE.md           →  "Read AGENTS.md"
.cursorrules        →  "Read AGENTS.md"
GEMINI.md           →  "Read AGENTS.md"
copilot-instructions.md → "Read AGENTS.md"
```

One canonical file. Everything else is a shim.

### What Goes in an AGENTS.md?

Here's a real example from a Go project:

```markdown
# Project Overview
A CLI tool for managing AGENTS.md configs. 500 LOC, single Node.js binary.

## Build Commands
```bash
npm install && npm link    # First-time setup
npm test                   # Run all tests
```

## Coding Style
- **TypeScript strict mode** — no `any`, prefer `unknown`
- **Immutability by default** — never mutate objects, always return new copies
- **Functions < 50 lines** — extract, don't nest
- **Early returns over deep nesting** — flat is better than nested

## Error Handling
- Never silently swallow errors
- User-facing errors must be actionable
- Log full error context server-side
- Validate all inputs at system boundaries

## Testing
- 80%+ coverage required
- AAA pattern: Arrange → Act → Assert
- Test descriptive names: "returns empty array when no markets match query"
- No mocking file system — use temp directories

## Security
- No hardcoded secrets — use env vars
- Validate file paths to prevent traversal
- npm audit before release

## Git Workflow
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Never `git add -A` — add files explicitly
- Pull request required for main branch
```

Notice the pattern: each section has specific, actionable rules. Each rule has a one-line "why" — the rationale that helps AI agents understand the _intent_ behind the instruction, not just the instruction itself.

### How to Get Started

**Option 1: You have existing configs**

1. Pick your best-maintained config (e.g., CLAUDE.md) as the base
2. Promote it to AGENTS.md — remove tool-specific cruft, keep universal rules
3. Replace CLAUDE.md and .cursorrules with shim files pointing to AGENTS.md
4. Run `aicfg validate` to quality-check the result

**Option 2: You're starting from scratch**

```bash
npx aicfg init
```

This auto-detects your tech stack and generates a complete AGENTS.md plus all shim files. Currently supports Go, Rust, Next.js, FastAPI, Express, microservices, monorepo, and more.

**Option 3: You want to check your existing AGENTS.md**

```bash
npx aicfg validate
```

Runs 9 quality checks: project overview, build commands, coding style, scope boundaries, error handling, testing, security, git workflow, and adequate length.

### The Numbers

Princeton researchers studied AGENTS.md adoption and found:

- **28.6% faster** agent execution time
- **16.6% less** token usage per task
- **60,000+** GitHub repos already use it

The token savings alone matter. At scale, 16.6% fewer tokens means 16.6% lower API costs across your entire team.

### Common Objections

**"I only use Claude Code. Why should I care?"**

Today, yes. Tomorrow, your team might add Cursor. Or you might experiment with Copilot. AGENTS.md is insurance against tool lock-in. And Claude Code reads it natively — zero downside.

**"My CLAUDE.md is 500 lines. Won't AGENTS.md be the same?"**

The exercise of converting to AGENTS.md forces you to separate "universally true" from "tool-specific." You'd be surprised how much of your CLAUDE.md is Claude Code boilerplate that doesn't apply to other tools. The resulting AGENTS.md is usually shorter and clearer.

**"Isn't this just another config file to maintain?"**

It's the opposite. Instead of N config files, you maintain 1. The shim files never need updating — they just redirect to AGENTS.md.

### The Tool

I built [aicfg](https://github.com/iPythoning/aicfg) to automate the AGENTS.md workflow. It's free, MIT licensed, and zero-install:

```bash
npx aicfg init     # Generate AGENTS.md + shims
npx aicfg validate # Quality check
npx aicfg shim     # Generate missing shims
```

But the real takeaway isn't the tool — it's the pattern: **one canonical config, shims everywhere else**. Whether you use aicfg or do it manually, move to AGENTS.md as your source of truth. Your future self (and your AI agents) will thank you.

---

## 发布注意事项

1. **Dev.to 要求原创内容** — 这篇文章是原创的，没问题
2. **前 3 段决定命运** — 开头必须抓人：痛点 → 解决方案 → 实操
3. **不要过度推销 aicfg** — 文章的 80% 是教育内容，20% 是工具介绍
4. **标签不要太多** — 4-5 个最相关标签
5. **发布后分享到 Twitter/X 和 Reddit** — Dev.to 的 organic reach 有限，需要外部引流
6. **可以考虑加一个 "Cover Image"** — 用 Canva 或 Figma 做一个简单的封面图

# Reddit r/ClaudeCode Post

**目标子版块**: r/ClaudeCode (276K members)
**角度**: AGENTS.md 标准 + 工具实操
**发布时机**: 美国时间周二/周三上午（10am ET）

---

## 标题

I built a free CLI tool to manage AGENTS.md across 20+ coding tools — one config file, automatic shims for Claude Code, Cursor, Copilot, and Gemini

---

## 正文

AGENTS.md is now the Linux Foundation standard for AI agent configuration. 60,000+ repos use it. Claude Code supports it natively.

The problem: every AI coding tool has its own config format. You have CLAUDE.md, .cursorrules, copilot-instructions.md, GEMINI.md — all saying slightly different things. Maintaining them is a nightmare. Copy-paste drift, contradictory instructions, stale rules.

The solution is AGENTS.md as the single source of truth, with tool-specific files as 3-line shims:

```
# CLAUDE.md
Read and follow all instructions in AGENTS.md.
```

I built **aicfg** to automate this. It's a free, open-source CLI:

```bash
npx aicfg init
```

This auto-detects your stack and generates:
- `AGENTS.md` — complete agent rules (the source of truth)
- `CLAUDE.md` — shim → "Read AGENTS.md"
- `.cursorrules` — shim → "Read AGENTS.md"
- `GEMINI.md` — shim → "Read AGENTS.md"
- `.github/copilot-instructions.md` — shim → "Read AGENTS.md"

**Other commands:**

```bash
aicfg validate    # 9 quality checks on your AGENTS.md
aicfg shim        # Generate missing shim files from existing AGENTS.md
aicfg check       # Full config audit across all files
aicfg pack        # Bundle codebase context for AI consumption
```

**10 stack templates** — Go, Rust, Next.js, FastAPI, Express, Microservices, Monorepo, Fullstack, Enterprise Python, CI/CD. All templates follow the "rule + why" pattern (each rule includes a one-line rationale).

**Princeton research** found AGENTS.md reduces agent runtime by 28.6% and token usage by 16.6%.

The tool is MIT licensed, zero dependencies beyond Node.js, works on any project. No registration, no telemetry, no pricing page.

**GitHub**: https://github.com/iPythoning/aicfg

Would love feedback from the community — especially on the templates. Are they covering the right ground? What's missing?

---

## 第一条评论（发帖后立即自己回复）

**Why AGENTS.md and not just CLAUDE.md?**

A few people have asked this. Here's my thinking:

- **CLAUDE.md is Claude Code only.** If you use Cursor, Copilot, or Gemini CLI, you need separate configs.
- **AGENTS.md is multi-tool.** One file works everywhere. Tool-specific files become thin shims.
- **It's a Linux Foundation standard.** Not owned by one company. 20+ tools support it.

The pitch isn't "switch everything to AGENTS.md." It's "AGENTS.md is your canonical config. Let the shims handle the rest."

The `aicfg shim` command is designed for existing projects — point it at your AGENTS.md and it generates the shims without touching your existing tool configs.

---

## 发布注意事项

1. **不要在帖子正文放裸链接** — 用 markdown 格式或放评论区
2. **不要用营销语气** — 这是"我做了个工具"不是"买我的产品"
3. **回复每一条评论** — 尤其是批评意见，真诚回应
4. **如果被 mod 删除** — 不要争辩，看规则后修改再发
5. **准备好在评论区回答的问题**:
   - "和 CLAUDE.md 有什么区别？"
   - "为什么要用 AGENTS.md？"
   - "模板质量如何？谁写的？"
   - "盈利模式是什么？"

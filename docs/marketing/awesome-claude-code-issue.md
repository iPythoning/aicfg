# awesome-claude-code Issue 提交内容

**仓库**: hesreallyhim/awesome-claude-code (46,254 stars)
**提交方式**: ⚠️ 必须通过 GitHub Web UI 提交 Issue（不能用 gh CLI）
**Issue 模板**: `recommend-resource.yml`
**URL**: https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml

---

## Issue 表单填写内容

### Resource Name
aicfg

### Category
Tooling > Config Managers（或 Tooling > General）

### Primary Link
https://github.com/iPythoning/aicfg

### Author Name
iPythoning

### Author Link
https://github.com/iPythoning

### License
MIT

### Description
AGENTS.md ecosystem CLI tool for Claude Code. Generates AGENTS.md + automatic shim files (CLAUDE.md, .cursorrules, GEMINI.md, copilot-instructions.md) from 10 stack templates. Validates AGENTS.md quality against 9 best-practice criteria (overview, build, style, scope, errors, testing, security, git, length). Zero-install via `npx aicfg init`. Fully open-source, no registration, no telemetry. Built on the AGENTS.md standard stewarded by the Linux Foundation.

### Verification
- Claude Code reads AGENTS.md natively as of 2025
- `aicfg init` generates a valid CLAUDE.md shim that Claude Code reads
- `aicfg validate` checks AGENTS.md against Claude Code best practices
- The tool itself uses AGENTS.md + CLAUDE.md shim (dogfooding)

### Additional Context
aicfg solves a real pain point for Claude Code users who also use Cursor, Copilot, or Gemini CLI: maintaining consistent agent instructions across tools. The shim pattern (AGENTS.md as source of truth, CLAUDE.md as 3-line redirect) is the recommended architecture by the AGENTS.md specification.

Princeton research shows AGENTS.md adoption reduces agent runtime by 28.6% and token usage by 16.6%.

---

## ⚠️ 提交前检查

- [ ] 通过 **GitHub Web UI** 提交（不要用 gh CLI）
- [ ] 资源已公开至少一周（aicfg 今天发布，可以考虑等几天再提交）
- [ ] 每个 Issue 只推荐一个资源
- [ ] 所有字段填写完整

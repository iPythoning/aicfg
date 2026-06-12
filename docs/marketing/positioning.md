# aicfg 产品定位

## 一句话定位

> **One command. Production-grade rules. No more AI guessing your conventions.**

备选（Seth Godin 风格）：
> Your AI coding agent doesn't need better prompts. It needs better rules.

## 目标受众 — Smallest Viable Audience

**不是所有开发者。** 甚至不是所有用 AI 编码工具的开发者。

最狭窄可行的受众：
- 使用 Claude Code 或 Cursor 的开发者
- 已经经历过「AI 不遵守团队规范」的挫败感
- 在乎代码一致性和团队标准的工程师
- 对工具链优化有兴趣，愿意尝试新 CLI
- 可能对 on-chain 支付感到好奇（非必需，但会点击）

## 紫牛因子（Purple Cow）

1. **AI 自主支付闭环**：AI agent 用 aicfg 配置自己，然后通过 x402 + USDC 完成链上支付——无需人工介入。这是别人会转述的故事。
2. **自我引用**：aicfg 的 CLAUDE.md 是 aicfg 生成的。Dogfooding 到了 inception 级别。
3. **零依赖**：纯 Node.js，不装任何 npm 包。`npm install -g github:ipythoning/aicfg` 即可用。

## 竞品差异化

| 维度 | aicfg | 手写 CLAUDE.md | Cursor 内置 rules |
|------|-------|---------------|-------------------|
| 规则质量 | 生产级，带 why 解释 | 取决于作者水平 | 基础模板 |
| 覆盖度 | 命名/不可变性/错误处理/安全/测试 | 通常只有 1-2 条 | 只覆盖代码风格 |
| 支付方式 | USDC on-chain（AI 可自主完成） | 免费 | 免费 |
| 安装方式 | `npm install -g github:ipythoning/aicfg` | 手动创建 | 内置 |

## 品牌调性

- **诚实 > 夸张**：不承诺「10x productivity」，只说「AI 不再猜你的规范」
- **技术真实性**：展示 CLUAUE.md 的实际内容，不是 screenshots of IDE
- **实验精神**：把「开发者会用 USDC 付费吗？」暴露成公开实验，不是隐藏风险

## 一句话反问（用于 HN 结尾）

> "Do you actually want better AI agent configs, or do you just tolerate the current 'write clean code' placeholder files?"

这是负向 CTA —— 比「请给 star」更可能引发讨论。

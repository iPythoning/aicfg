# Node.js + Express API stack

Config for AI coding agents on a Node.js + Express + TypeScript API project.

## Files

| File | Tool | Purpose |
|------|------|---------|
| `CLAUDE.md` | Claude Code | Auto-loaded rulebook (conventions + rationale) |
| `.cursorrules` | Cursor | Same ruleset for Cursor, kept in sync |
| `.claude/settings.json` | Claude Code | Hooks: format + lint on save, file-size guard, type-check on stop |

## Install

```bash
# From your project root:
cp /path/to/pack/stacks/node-express/CLAUDE.md ./CLAUDE.md
cp /path/to/pack/stacks/node-express/.cursorrules ./.cursorrules
cp -r /path/to/pack/stacks/node-express/.claude ./.claude
```

Open the project in Claude Code or Cursor. The rules load automatically. Reload the window if the agent is already running.

## Customize

- **Commands** — update the `npm run …` lines in `CLAUDE.md` and the hook scripts if your project uses `pnpm`/`yarn` or different script names.
- **Rules** — every rule is yours to edit. The rationale comments explain each trade-off so you can change a convention deliberately.
- **Hooks** — each hook in `settings.json` has a `description`. Delete any you don't want. All hooks fail open (`|| true`) so a missing tool never blocks your work.

## Verify the hooks work

After installing, edit any `.ts` file with the agent and save — Prettier should reformat it. Run a session and stop — `tsc --noEmit` runs and prints any type errors. If nothing happens, confirm `prettier`/`eslint`/`typescript` are installed (`npm i -D prettier eslint typescript`).

## The one rule that matters most here

If you take nothing else from this stack: **every async route handler must forward its errors** (`asyncHandler` wrapper or `express-async-errors`), and you register **one** centralized error middleware last. Unhandled promise rejections are the single most common way Express apps crash in production, and AI agents routinely write raw `async (req, res) => …` handlers that swallow or leak the failure. The `CLAUDE.md` makes the agent do this by default.

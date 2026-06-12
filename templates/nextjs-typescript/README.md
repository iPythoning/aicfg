# Next.js + TypeScript stack

Config for AI coding agents on a Next.js (App Router) + React 19 + TypeScript project.

## Files

| File | Tool | Purpose |
|------|------|---------|
| `CLAUDE.md` | Claude Code | Auto-loaded rulebook (conventions + rationale) |
| `.cursorrules` | Cursor | Same ruleset for Cursor, kept in sync |
| `.claude/settings.json` | Claude Code | Hooks: format + lint on save, file-size guard, type-check on stop |

## Install

```bash
# From your project root:
cp /path/to/pack/stacks/nextjs-typescript/CLAUDE.md ./CLAUDE.md
cp /path/to/pack/stacks/nextjs-typescript/.cursorrules ./.cursorrules
cp -r /path/to/pack/stacks/nextjs-typescript/.claude ./.claude
```

Open the project in Claude Code or Cursor. The rules load automatically. Reload the window if the agent is already running.

## Customize

- **Commands** — update the `npm run …` lines in `CLAUDE.md` and the hook scripts if your project uses `pnpm`/`yarn` or different script names.
- **Rules** — every rule is yours to edit. Disagree with a convention? Change it; the rationale comments explain the trade-off so you can decide deliberately.
- **Hooks** — each hook in `settings.json` has a `description`. Delete any you don't want (e.g. drop the Prettier hook if you format in CI only). All hooks fail open (`|| true`) so a missing tool never blocks your work.

## Verify the hooks work

After installing, edit any `.ts` file with the agent and save — Prettier should reformat it. Run a session and stop — `tsc --noEmit` runs and prints any type errors. If nothing happens, confirm `prettier`/`eslint`/`typescript` are installed in your project (`npm i -D prettier eslint typescript`).

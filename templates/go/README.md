# Go stack

Config for AI coding agents on a Go project (standard library first, modules).

## Files

| File | Tool | Purpose |
|------|------|---------|
| `CLAUDE.md` | Claude Code | Auto-loaded rulebook (conventions + rationale) |
| `.cursorrules` | Cursor | Same ruleset for Cursor, kept in sync |
| `.claude/settings.json` | Claude Code | Hooks: gofmt/goimports on save, file-size guard, `go vet` on stop |

## Install

```bash
# From your project root:
cp /path/to/pack/stacks/go/CLAUDE.md ./CLAUDE.md
cp /path/to/pack/stacks/go/.cursorrules ./.cursorrules
cp -r /path/to/pack/stacks/go/.claude ./.claude
```

Open the project in Claude Code or Cursor. The rules load automatically. Reload the window if the agent is already running.

## Customize

- **Tooling** — the format hook uses `goimports` if installed, else `gofmt`. Add `staticcheck`/`golangci-lint` to the Stop hook if your project uses them.
- **File-size guard** — Go files run longer than TypeScript by convention; if 800 lines is too tight for your codebase, raise the limit in `settings.json`.
- **Rules** — every rule is yours to edit. The rationale comments explain each trade-off so you can change a convention deliberately.
- **Hooks** — each hook has a `description`. Delete any you don't want. All hooks fail open (`|| true`) so a missing tool never blocks your work.

## Verify the hooks work

After installing, edit any `.go` file with the agent and save — it should be formatted (imports tidied if `goimports` is present). Run a session and stop — `go vet ./...` runs and prints any issues. Install `goimports` with `go install golang.org/x/tools/cmd/goimports@latest` if you want import management.

## The one rule that matters most here

If you take nothing else from this stack: **every goroutine must have a defined exit path, tied to a `context.Context`.** A goroutine blocked forever on a channel is a leak that quietly eats memory and is invisible until production falls over. Paired with it: **check every error** — Go makes failure explicit on purpose, and `_ = doThing()` is a bug waiting to happen. AI agents routinely fire off `go func(){...}()` with no cancellation and drop errors to "keep it short." The `CLAUDE.md` makes the agent wire context and check errors by default.

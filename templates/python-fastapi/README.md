# Python + FastAPI stack

Config for AI coding agents on a Python 3.12+ + FastAPI + Pydantic v2 project (uv + ruff + mypy).

## Files

| File | Tool | Purpose |
|------|------|---------|
| `CLAUDE.md` | Claude Code | Auto-loaded rulebook (conventions + rationale) |
| `.cursorrules` | Cursor | Same ruleset for Cursor, kept in sync |
| `.claude/settings.json` | Claude Code | Hooks: ruff format + fix on save, file-size guard, mypy on stop |

## Install

```bash
# From your project root:
cp /path/to/pack/stacks/python-fastapi/CLAUDE.md ./CLAUDE.md
cp /path/to/pack/stacks/python-fastapi/.cursorrules ./.cursorrules
cp -r /path/to/pack/stacks/python-fastapi/.claude ./.claude
```

Open the project in Claude Code or Cursor. The rules load automatically. Reload the window if the agent is already running.

## Customize

- **Commands** — the hooks assume `uv`. If you use a plain `venv`/`pip`, drop the `uv run` prefix in `settings.json` and `CLAUDE.md` (`ruff …`, `mypy …`, `pytest`).
- **Rules** — every rule is yours to edit. The rationale comments explain each trade-off so you can change a convention deliberately.
- **Hooks** — each hook in `settings.json` has a `description`. Delete any you don't want. All hooks fail open (`|| true`) so a missing tool never blocks your work.

## Verify the hooks work

After installing, edit any `.py` file with the agent and save — ruff should reformat it. Run a session and stop — `mypy` runs and prints any type errors. If nothing happens, confirm the tools are installed (`uv add --dev ruff mypy pytest`).

## The one rule that matters most here

If you take nothing else from this stack: **never put a blocking call inside an `async def` path operation.** A single `requests.get(...)`, sync DB call, or `time.sleep` on the event loop freezes *every* concurrent request, not just the current one — and it's invisible until you have load. AI agents reach for the sync `requests` library by reflex. The `CLAUDE.md` makes the agent use `httpx.AsyncClient` (or drop to a plain `def` handler) by default.

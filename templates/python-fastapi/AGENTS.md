# AGENTS.md — Python + FastAPI

Project conventions for AI coding agents. These rules **override** default agent behavior. Follow them exactly; when a rule has a *Why*, honor the reasoning, don't just pattern-match the letter.

## Stack assumptions

- Python 3.12+ · FastAPI · Pydantic v2 · package/venv manager: uv · linter/formatter: ruff · types: mypy (or pyright)
- Adjust the commands below if your project differs.

```bash
uv run fastapi dev      # dev server with auto-reload
uv run ruff format .    # format
uv run ruff check .     # lint
uv run mypy .           # type check (must pass before any commit)
uv run pytest           # test suite
```

## Scope discipline (read first)

- **Change only what the task requires.** Do not refactor, rename, or reformat code outside the requested change. *Why: unrequested edits bury the real diff and break unrelated work.*
- **Ask before introducing a new dependency, pattern, or abstraction.** Prefer what the codebase already uses. *Why: a second HTTP client, ORM, or settings library is a tax forever.*
- **No speculative generality.** Build for the requirement in front of you (YAGNI).

## Typing

- **Type every function signature — parameters and return.** Run mypy/pyright in strict mode. *Why: untyped Python is where refactors silently break and FastAPI can't generate correct schemas.*
- **Never use bare `Any` to escape a type error — narrow with `cast`, a `TypeGuard`, or a proper model.** *Why: `Any` disables checking exactly where bugs hide.*
- Use modern syntax: `str | None`, `list[str]`, not `Optional`/`List` from typing.

## Async (the #1 FastAPI failure mode)

- **Never call a blocking function inside an `async def` path operation.** No `requests`, no sync DB driver, no `time.sleep`, no blocking file I/O on the event loop. *Why: one blocking call freezes the entire event loop — every concurrent request stalls, not just the current one.*
- Use async libraries (`httpx.AsyncClient`, an async DB driver). If a blocking call is unavoidable, run it in a thread (`await run_in_threadpool(...)` / `asyncio.to_thread`).
- **If a path operation does no `await`, make it `def`, not `async def`.** *Why: FastAPI runs plain `def` handlers in a threadpool, so a sync handler can't block the loop — declaring it `async` and then blocking is the trap.*

## Models & validation

- **Define Pydantic v2 models for every request and response body.** Validate at the edge; never accept a raw `dict`. *Why: trusting unvalidated input is the root of most crashes and injection bugs — Pydantic rejects bad data before it reaches your logic.*
- Use a distinct response model (`response_model=`) so internal fields (password hashes, internal ids) never leak. *Why: returning the ORM object directly is a classic data-exposure bug.*
- Settings come from `pydantic-settings` (`BaseSettings`), loaded once and validated at startup — fail fast on a missing/malformed env var.

## Architecture

- **Keep path operations thin: parse/validate → call a service → return.** Business logic lives in service functions; data access behind a repository. *Why: logic inside the route can only be tested through HTTP; a service is a plain unit test.*
- Use FastAPI **dependencies** (`Depends`) for auth, DB sessions, and shared setup — don't reach for globals.
- Group by feature (`features/orders/{router.py, service.py, schemas.py, repo.py}`), not by type.

## Error handling

- **Raise `HTTPException` (or a custom exception mapped by an exception handler) with the right status code.** Don't return `{"error": ...}` with a `200`. *Why: clients and HTTP tooling rely on status codes; a 200 with an error body breaks every caller.*
- **Never swallow an exception with a bare `except:` or `except Exception: pass`.** Catch specific exceptions; re-raise or log with context. *Why: a silent except turns a clear failure into a mystery bug.*
- **Never leak internals to the client.** Log the full traceback server-side; return a safe message. *Why: tracebacks and DB errors in responses are an information-disclosure vulnerability.*

## Security

- **Never hardcode secrets.** No keys, tokens, or connection strings in source. *Why: committed secrets leak permanently via git history.*
- Parameterize every database query; with raw SQL use bound parameters, never f-strings or `%`-formatting. *Why: string-built SQL is the textbook injection vector.*
- Set an explicit CORS allowlist — never `allow_origins=["*"]` with credentials. Rate-limit public/auth endpoints.

## Observability

- Use the `logging` module (or structlog) with levels. **No `print()` in committed code.** *Why: `print` has no levels and bypasses log routing/aggregation.*

## Code style

- Immutability by default: return new objects, don't mutate inputs or shared state. *Why: hidden mutation is the hardest class of bug to trace.*
- **No mutable default arguments (`def f(x=[])`).** *Why: the default is shared across all calls — a notorious Python footgun.*
- Early returns over deep nesting (max ~3 levels). Named constants over magic numbers.
- Functions under ~50 lines; files under ~400 (hard cap 800) — extract when they grow.
- Follow PEP 8 (ruff enforces it). No commented-out code or context-free TODOs.

## Testing

- Test with `pytest`; test endpoints via `httpx.AsyncClient` / `TestClient`. Use Arrange–Act–Assert.
- Cover error paths (invalid input → 422, missing auth → 401, downstream failure), not just the happy path.
- Override dependencies (`app.dependency_overrides`) to inject fakes instead of hitting real DBs/services.
- Descriptive names: `test_returns_422_when_email_missing`.
- Run `uv run pytest` and `uv run mypy .` before declaring work done.

## Definition of done

- [ ] Types pass (`uv run mypy .`)
- [ ] Lint + format clean (`uv run ruff check .`)
- [ ] Tests pass for changed logic (happy + error paths)
- [ ] No blocking calls in `async def`; sync-only handlers are `def`
- [ ] No bare `Any` escape, no bare `except`, no hardcoded secrets, no `print`, no internals leaked to clients
- [ ] Diff contains only what the task required

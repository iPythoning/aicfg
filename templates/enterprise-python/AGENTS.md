# AGENTS.md — Enterprise Python Backend

## Stack
- **Language**: Python 3.12+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0 (async) + Alembic
- **Validation**: Pydantic v2
- **Cache**: Redis (redis-py async)
- **Task Queue**: Celery + Redis broker
- **Testing**: pytest + pytest-asyncio + httpx
- **Linting**: ruff + mypy (strict)
- **Package manager**: uv

## Commands
```bash
uv run fastapi dev src/main.py           # Dev server
uv run pytest -n auto --cov=src          # Tests with coverage
uv run ruff check src/                   # Lint
uv run mypy src/                         # Type check
uv run alembic upgrade head              # Run migrations
uv run alembic revision --autogenerate -m "description"  # Create migration
```

## Architecture

```text
src/
├── main.py              # FastAPI app factory
├── config.py            # Typed config from env (Pydantic Settings)
├── api/
│   ├── deps.py          # Dependency injection (get_db, get_current_user)
│   └── v1/
│       ├── router.py    # v1 router aggregation
│       ├── users.py     # User endpoints
│       └── orders.py    # Order endpoints
├── models/              # SQLAlchemy ORM models
├── schemas/             # Pydantic request/response schemas
├── services/            # Business logic (no HTTP concerns)
├── repositories/        # Data access (SQLAlchemy queries)
├── tasks/               # Celery task definitions
└── tests/
    ├── unit/            # Pure function/logic tests
    ├── integration/     # DB-dependent tests
    └── api/             # HTTP endpoint tests (httpx)
```

## Rules for AI Agents

### Database
- **Always use async SQLAlchemy.** The session factory is `async_session`. All queries should be awaited.
- **Never commit in a service.** The unit of work is the request: commit happens in the dependency or middleware.
- **Alembic migrations required for all schema changes.** Never modify tables manually.
- **Use `selectinload()` for eager loading relationships.** Avoid N+1 queries.
  ```python
  stmt = select(User).options(selectinload(User.orders)).where(User.id == user_id)
  ```

### API Design
- **Thin route handlers.** Routes extract params, call service, return response. Max 15 lines.
- **Use dependency injection for shared logic.** Auth, DB session, rate limiting all go through FastAPI `Depends()`.
- **Validate at the boundary.** Pydantic models validate requests; services receive validated data.
  ```python
  @router.post("/users")
  async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
      user = await user_service.create(db, body)
      return UserResponse.model_validate(user)
  ```

### Error Handling
- **Define custom exception classes** that map to HTTP status codes.
  ```python
  class NotFoundError(AppError):
      status_code = 404
  
  class ConflictError(AppError):
      status_code = 409
  ```
- **One global exception handler** catches all `AppError` subclasses.
- **Never expose internal errors.** Log the full traceback; return a safe message.

### Async Patterns
- **FastAPI runs in an event loop. Never use blocking calls** in async endpoints.
  ```python
  # WRONG — blocks the event loop
  data = requests.get("https://api.example.com")
  
  # CORRECT — non-blocking
  async with httpx.AsyncClient() as client:
      resp = await client.get("https://api.example.com")
  ```
- **Run CPU-bound work in a thread pool.**
  ```python
  result = await asyncio.to_thread(cpu_intensive_function, arg1, arg2)
  ```

### Testing
- **Use `pytest-asyncio` with `strict=True`.**
- **Create a test database per session.** Use fixture scoping: `session` for expensive setup, `function` for isolation.
- **Test error paths, not just happy paths.** Missing auth, invalid input, downstream failures.
- **Mock external APIs**, not internal services. Integration test against a real test database.

### Celery Tasks
- **Tasks must be idempotent.** Celery may deliver a task more than once.
- **Keep task payloads small.** Don't pass entire model instances; pass IDs and fetch from DB in the task.
- **Set task timeouts.** Every task should have `soft_time_limit` and `time_limit`.

## Definition of Done
- [ ] Tests pass (`uv run pytest -n auto`)
- [ ] Lint clean (`uv run ruff check src/`)
- [ ] Type check passes (`uv run mypy src/`)
- [ ] Alembic migration created and tested (upgrade + downgrade)
- [ ] API endpoints return consistent error envelope
- [ ] No blocking calls in async endpoints
- [ ] All external calls have timeouts

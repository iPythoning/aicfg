# CLAUDE.md — Go

Project conventions for AI coding agents. These rules **override** default agent behavior. Follow them exactly; when a rule has a *Why*, honor the reasoning, don't just pattern-match the letter.

## Stack assumptions

- Go (latest stable) · standard library first · modules (`go.mod`)
- Adjust the commands below if your project differs.

```bash
go run ./...        # run
go build ./...      # build (must pass before any commit)
go vet ./...        # vet
go test -race ./... # tests with the race detector
gofmt -l .          # list unformatted files (should be empty)
```

## Scope discipline (read first)

- **Change only what the task requires.** Do not refactor, rename, or reformat code outside the requested change. *Why: unrequested edits bury the real diff and break unrelated work.*
- **Prefer the standard library; ask before adding a dependency.** *Why: Go's stdlib is deep, and every module in `go.mod` is a supply-chain and maintenance cost forever.*
- **No speculative generality.** Build for the requirement in front of you (YAGNI). Don't add interfaces or generics "for flexibility" before there are two real implementations.

## Errors (idiomatic Go's core discipline)

- **Check every returned error. Never discard one with `_` unless you can justify it in a comment.** *Why: an ignored error is a bug waiting for production — Go makes failure explicit on purpose.*
- **Wrap errors with context using `fmt.Errorf("...: %w", err)`** so the chain is preserved and inspectable with `errors.Is`/`errors.As`. *Why: a bare `return err` loses the call path; `%w` keeps it without stringly-typed comparisons.*
- **Compare errors with `errors.Is`/`errors.As`, never by string matching.** *Why: matching `err.Error() == "..."` breaks the moment the message changes.*
- **Do not `panic` for ordinary/expected errors. Return them.** Reserve `panic` for truly unrecoverable programmer bugs. *Why: a panic crosses goroutine boundaries unpredictably and crashes the process.*

## Concurrency (the #1 Go production failure mode)

- **Every goroutine must have a defined exit path. Never start one you can't stop.** Tie its lifetime to a `context.Context` and select on `ctx.Done()`. *Why: a goroutine blocked forever on a channel is a leak that slowly exhausts memory — and it's invisible until it isn't.*
- **`context.Context` is the first parameter of any function that does I/O, blocks, or spawns goroutines.** Propagate it; respect cancellation. Never store a context in a struct.
- **Guard all shared mutable state** with a mutex or confine it to a single goroutine and communicate over channels. *Why: a data race is undefined behavior — run `go test -race` to catch it.*
- Use `errgroup` / `sync.WaitGroup` to wait for spawned goroutines; don't fire-and-forget.

## API & types

- **Accept interfaces, return concrete structs.** *Why: callers stay flexible while you keep the freedom to add methods.*
- **Keep interfaces small and define them where they're consumed, not where they're implemented.** *Why: a one-method interface at the call site is testable and decoupled; a giant interface next to the impl is neither.*
- Zero values should be useful where practical; document when a type needs a constructor.
- Exported identifiers get doc comments starting with the identifier name. Keep the exported surface minimal.

## Dependencies & state

- **No global mutable state.** Pass dependencies explicitly (constructor injection) instead of package-level vars. *Why: globals make code untestable and create hidden coupling and init-order bugs.*
- Keep `main` thin: wire dependencies, start the server, handle shutdown. Logic lives in packages.

## Resources & lifecycle

- **`defer Close()` every resource you open** (files, rows, response bodies, connections) — right after the successful open, after checking the error. *Why: a missed `Close` leaks file descriptors and connections under load.*
- Handle `SIGTERM`/`SIGINT`: cancel the root context, drain in-flight work with a timeout, then exit. *Why: killing mid-request drops data and corrupts connections.*

## Security

- **Never hardcode secrets.** Read them from the environment. *Why: committed secrets leak permanently via git history.*
- Use `database/sql` placeholders (`$1`/`?`); never build SQL with `fmt.Sprintf` or string concatenation. *Why: string-built SQL is the textbook injection vector.*
- Validate and bound all external input. Set timeouts on every outbound HTTP client and inbound server (`http.Server.ReadTimeout`/`WriteTimeout`). *Why: a missing timeout is a hang/DoS waiting to happen.*

## Code style

- **`gofmt`/`goimports` is non-negotiable** — code is always formatted. Pass `go vet` and (if configured) `staticcheck`/`golangci-lint` clean.
- Early returns over nesting; handle the error and return, keep the happy path un-indented.
- Name things for the caller; short names in short scopes, descriptive names for exported symbols. No stutter (`http.HTTPServer` → `http.Server`).
- No commented-out code or context-free TODOs in committed code.

## Testing

- **Table-driven tests** with subtests (`t.Run`). Use `t.Parallel()` where tests are independent. Always run with `-race`.
- Cover error paths (bad input, cancelled context, downstream failure), not just the happy path.
- Prefer the stdlib `testing` package; reach for a helper library only if the project already uses one.
- Descriptive subtest names: `"returns error when id is empty"`.
- Run `go test -race ./...` and `go build ./...` before declaring work done.

## Definition of done

- [ ] Build passes (`go build ./...`)
- [ ] `go vet ./...` clean and `gofmt -l .` empty
- [ ] Tests pass with the race detector (`go test -race ./...`)
- [ ] Every error checked or explicitly justified; every goroutine has an exit path; every opened resource is `defer`-closed
- [ ] No global mutable state, no hardcoded secrets, no string-built SQL, no panics for ordinary errors
- [ ] Diff contains only what the task required

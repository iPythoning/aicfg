# CLAUDE.md — Next.js + TypeScript

Project conventions for AI coding agents. These rules **override** default agent behavior. Follow them exactly; when a rule has a *Why*, honor the reasoning, don't just pattern-match the letter.

## Stack assumptions

- Next.js (App Router) · React 19 · TypeScript (strict) · package manager: npm
- Adjust the commands below if your project differs.

```bash
npm run dev      # dev server
npm run build    # production build (must pass before any commit)
npm run lint     # ESLint
npm run test     # test suite
```

## Scope discipline (read first)

- **Change only what the task requires.** Do not refactor, rename, or reformat code outside the requested change. *Why: unrequested edits bury the real diff and break unrelated work.*
- **Ask before introducing a new dependency, pattern, or abstraction.** Prefer what the codebase already uses. *Why: consistency beats novelty; a second state library or HTTP client is a tax forever.*
- **No speculative generality.** Build for the requirement in front of you, not an imagined future one (YAGNI).

## TypeScript

- **`strict` is on. Never use `any` — use `unknown` and narrow.** *Why: `any` silently disables the type system exactly where bugs hide; `unknown` forces a deliberate check.*
- Prefer `type` aliases for unions/objects; use `interface` only when you need declaration merging.
- Name types `PascalCase`, with no `I` prefix.
- Derive types from a single source of truth (`z.infer`, `ReturnType`, `as const`) instead of hand-maintaining parallel shapes.

## React / Next.js

- **Server Components by default; add `"use client"` only when you need state, effects, or browser APIs.** *Why: shipping client JS you don't need is the most common Next.js performance regression.*
- Fetch data in Server Components or route handlers — not in `useEffect`. *Why: `useEffect` fetching causes request waterfalls and loading-flash; server fetching is parallel and cache-aware.*
- Components are `PascalCase`, hooks are `useCamelCase`, one component per file.
- Co-locate by feature, not by type: `features/checkout/{CheckoutForm.tsx, useCheckout.ts, checkout.test.ts}`. *Why: feature folders keep related code together and make deletion safe.*
- Keep server-only secrets out of any module a Client Component imports. Use `server-only` to enforce it.

## State

| Concern | Use |
|---------|-----|
| Server data | React Server Components, or TanStack Query for client-side |
| Shared client state | a small store (Zustand/Jotai) — only when prop-passing genuinely hurts |
| URL state (filters, tabs, pagination) | search params |
| Forms | React Hook Form + a schema validator |

- **Do not copy server data into a client store.** *Why: two sources of truth drift; derive instead of duplicate.*

## Error handling

- **Handle errors explicitly at every boundary. Never swallow them.** *Why: a silent `catch {}` turns a clear failure into a mystery bug three screens away.*
- User-facing surfaces show a friendly message; the server logs the full context.
- Validate all external input (form data, route params, API responses) with a schema at the edge before using it. *Why: trusting unvalidated external data is the root of most runtime crashes and injection bugs.*

## Code style

- Immutability by default: return new objects, don't mutate inputs. *Why: hidden mutation is the hardest class of bug to trace.*
- Early returns over deep nesting (max ~3 levels).
- Named constants over magic numbers.
- Functions under ~50 lines; files under ~400 (hard cap 800) — extract when they grow. *Why: small units are reviewable, testable, and reusable.*
- No `console.log`, commented-out code, or TODO-without-context in committed code.

## Security

- Never hardcode secrets — use environment variables; validate required vars at startup.
- Never render unsanitized user HTML; avoid `dangerouslySetInnerHTML` unless the input is sanitized first.
- Parameterize every database query; never string-concatenate SQL.
- State-changing routes require CSRF protection and rate limiting.

## Testing

- New logic ships with tests (Arrange–Act–Assert). Test behavior and edge cases, not implementation details.
- Descriptive names: `returns empty array when no results match`.
- Run `npm run test` and `npm run build` before declaring work done. *Why: "it compiles in my head" is not verification.*

## Definition of done

- [ ] Build passes (`npm run build`)
- [ ] Lint clean (`npm run lint`)
- [ ] Tests pass for changed logic
- [ ] No `any`, no swallowed errors, no hardcoded secrets, no stray `console.log`
- [ ] Diff contains only what the task required

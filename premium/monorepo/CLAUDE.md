# CLAUDE.md — Monorepo (Turborepo)

## Repository Structure

```
packages/
├── shared/          # Shared types, utils, config
├── ui/              # Design system / component library
├── api/             # Backend API service
├── web/             # Frontend app
├── docs/            # Documentation site
└── config/          # Shared ESLint, TSConfig, Prettier
```

## Rules for AI Agents

### Scope Discipline (CRITICAL)
- **One package per change.** When a task touches multiple packages, do them in sequence, verifying each before moving to the next.
- **Never edit shared types without checking all consumers.** Use `tsc --noEmit` across the whole monorepo after changing `packages/shared/`.
- **Cross-package refactors require explicit approval.** Changing a shared interface breaks downstream packages silently.

### Package Boundaries
| Package | Allowed Dependencies | Forbidden Dependencies |
|---------|---------------------|----------------------|
| `shared` | None (leaf) | All other packages |
| `ui` | `shared` | `api`, `web`, `docs` |
| `api` | `shared`, `config` | `ui`, `web`, `docs` |
| `web` | `shared`, `ui`, `config` | `api` |
| `docs` | `shared`, `ui` | `api`, `web` |

- **If you need to import from a forbidden package, extract the shared logic into `packages/shared/` first.**
- **No circular dependencies. Ever.** Run `npx madge --circular packages/*/src` if unsure.

### Turborepo Conventions
```bash
npm run dev          # Starts all packages (turbo dev)
npm run build        # Build all (turbo build)
npm run lint         # Lint all (turbo lint)
npm run test         # Test all (turbo test)

# Single package
npm run dev -- --filter=web
npm run build -- --filter=api
npm run test -- --filter=shared
```

- `turbo.json` defines the pipeline. Check it before adding new workspace scripts.
- Build dependencies are in `turbo.json` `dependsOn`. Respect them.
- Cache is in `.turbo/`. Run `turbo prune` for CI.

### Versioning (Changesets)
```bash
npx changeset        # Create a changeset for your change
npx changeset version # Bump versions, update CHANGELOGs
```

## Stack
- Turborepo (build orchestration)
- TypeScript strict across all packages
- ESLint + Prettier shared config in `packages/config/`
- Vitest for testing (all packages)
- Changesets for versioning

## Definition of Done
- [ ] All affected packages build (`turbo build --filter=...`)
- [ ] All affected packages lint clean
- [ ] Tests pass for changed packages
- [ ] No cross-package import violations
- [ ] Changeset created if changing a published package
- [ ] `tsc --noEmit` passes repo-wide if `shared` was changed

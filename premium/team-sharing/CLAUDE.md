# CLAUDE.md — Team Config Sharing

## Overview

This is a **shared AI agent configuration repository** that enforces consistent coding rules across all team projects. Every project in the organization inherits from this base config.

## How It Works

```
team-config/           # This repo — the source of truth
├── CLAUDE.md          # Base rules inherited by ALL projects
├── .cursorrules       # Base Cursor rules
├── stacks/            # Language/framework specific configs
│   ├── typescript/
│   ├── python/
│   ├── go/
│   └── terraform/
├── team/              # Team-specific conventions
│   ├── naming.md      # Naming conventions
│   ├── git.md         # Git workflow
│   └── review.md      # Code review standards
└── onboarding/
    └── SETUP.md       # New developer setup guide
```

## Using the Shared Config

### For AI Agents Working in Any Team Project
1. **Always read the team config FIRST** before making changes.
2. These rules OVERRIDE any project-specific CLAUDE.md defaults.
3. When in conflict, team config wins over project config.

### Core Team Rules (inherited everywhere)

#### Code Quality
- TypeScript strict mode across all projects
- Python: type hints required on all public functions
- Go: follow Effective Go conventions
- All languages: no `console.log`/`print` in production code — use structured logging

#### Naming Conventions
| Context | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `UserProfile.tsx` |
| Hooks | `use` prefix | `useAuth.ts` |
| API routes | kebab-case URLs | `/api/user-settings` |
| Database tables | snake_case plural | `user_settings` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Git branches | kebab-case | `fix/login-timeout` |

#### Git Workflow (All Projects)
```bash
git checkout -b <type>/<description>   # feat/, fix/, refactor/, docs/
# Conventional commits required
git commit -m "feat: add user avatar upload"
git commit -m "fix: handle null session in middleware"
```

- **Never commit directly to main/master.** Always branch.
- **PR title must match conventional commit format.**
- **Squash merge only.** One commit per PR.

#### Code Review Standards
- All PRs require 1 approval before merge
- CI must pass (build + lint + test)
- Security-sensitive changes require 2 approvals
- PRs should be <400 lines changed (hard cap 800)

### Onboarding New Developers
1. Clone this repo
2. Read `onboarding/SETUP.md`
3. Set up the language/framework config for your stack:
   ```bash
   # For a TypeScript project:
   cp stacks/typescript/.cursorrules ../my-project/.cursorrules
   cp stacks/typescript/CLAUDE.md ../my-project/CLAUDE.md
   ```
4. The AI agent will automatically follow team rules when it reads CLAUDE.md

### Adding Team Rules
1. Propose the rule change in a PR to this repo
2. Get 2 approvals from the team leads
3. Merge — all projects instantly inherit the new rule
4. Run `aicfg check` in each project to verify compliance

## Definition of Done (for config changes)
- [ ] Rule is clearly written with examples of right/wrong
- [ ] Rationale ("Why") is included
- [ ] Rule is scoped — says when it applies and when it doesn't
- [ ] Team leads approved
- [ ] Backward compatible — existing projects shouldn't break

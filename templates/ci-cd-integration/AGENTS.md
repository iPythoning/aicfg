# AGENTS.md — CI/CD Config Compliance

## Overview

This project uses automated checks to verify that AI-generated code follows team config rules. The CI pipeline validates CLAUDE.md and .cursorrules compliance on every PR.

## How It Works

```
PR opened → CI runs:
  1. Config exists?     → Check CLAUDE.md and .cursorrules are present
  2. Rules complete?    → Verify required sections exist
  3. Conventions match? → Check naming, structure, patterns
  4. No violations?     → Scan changed code for rule violations
  All pass → PR can be merged
```

## CI Configuration

### GitHub Actions Workflow (`.github/workflows/config-check.yml`)
```yaml
name: AI Config Compliance

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  config-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check required config files exist
        run: |
          test -f CLAUDE.md || (echo "Missing CLAUDE.md" && exit 1)
          test -f .cursorrules || (echo "Missing .cursorrules" && exit 1)
      
      - name: Run aicfg check
        run: npx github:ipythoning/aicfg check
        
      - name: Scan for config violations
        run: |
          # Check for hardcoded secrets
          ! grep -rE "(api_key|apiKey|secret|password|token)\s*=\s*['\"][^'\"]{10,}" src/ || (echo "Found potential hardcoded secret" && exit 1)
          
          # Check for console.log
          ! grep -rE "console\.(log|debug|info)\(" src/ || (echo "Found console.log" && exit 1)
```

### Pre-commit Hook (`.husky/pre-commit`)
```bash
#!/bin/sh
echo "Running config compliance check..."
npx github:ipythoning/aicfg check
npx eslint --fix --quiet .
npx prettier --check .
```

### Config Compliance Checklist

#### Required Sections in CLAUDE.md
- [ ] Stack overview (language, framework, commands)
- [ ] Architecture rules (file structure, boundaries)
- [ ] Error handling rules
- [ ] Testing requirements
- [ ] Security rules
- [ ] Code style conventions

#### Required Sections in .cursorrules
- [ ] ALWAYS section (mandatory patterns)
- [ ] NEVER section (forbidden patterns)
- [ ] Stack-specific conventions

#### Automatic Violations Detected
| Pattern | Detection | Severity |
|---------|-----------|----------|
| Missing CLAUDE.md | File existence check | BLOCK |
| Missing required section | Section header scanning | WARN |
| `console.log` in source | grep | WARN |
| `any` type in TypeScript | ESLint rule | WARN |
| Hardcoded credentials | Regex secrets scan | BLOCK |
| `git add -A` in script | Pattern match | BLOCK |
| Missing .cursorrules | File existence check | WARN |

## Integration with Code Review

- **Violations found → PR is blocked.** Fix violations and push again.
- **CI passes → config check is green.** Reviewer can focus on logic, not conventions.
- **New rules added → update the CI check regex.** Keep rules and CI in sync.

## Adding New Compliance Rules

1. Add the rule to CLAUDE.md (with examples)
2. Add a detection pattern (regex, grep, or custom script)
3. Add it to the CI workflow with the appropriate severity
4. Test against known violations to confirm it catches them
5. Test against compliant code to confirm no false positives
6. Document the new check in this file

## Definition of Done (for CI changes)
- [ ] Detection catches real violations (tested)
- [ ] No false positives on compliant code (tested)
- [ ] Severity level appropriate (BLOCK vs WARN)
- [ ] Error message is actionable ("how to fix")
- [ ] CI runtime impact is minimal (<30s added)

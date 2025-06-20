# Changelog System

This project uses a structured changelog system to track all changes that affect public behavior.

## Overview

- **Individual changelog files** are stored in `changelog/unreleased/`
- **Pre-commit hooks** validate changelog format and presence
- **CI/CD pipeline** enforces changelog requirements
- **Release process** automatically consolidates changelogs

## Workflow

### For Developers

1. **Create a changelog entry** for every PR that changes public behavior:
   ```bash
   npm run changelog:new
   ```

2. **Follow the prompts** to categorize your change:
   - `added` - New features
   - `changed` - Changes in existing functionality
   - `deprecated` - Soon-to-be removed features
   - `removed` - Removed features
   - `fixed` - Bug fixes
   - `security` - Security improvements

3. **Commit your changes** including the changelog file:
   ```bash
   git add changelog/unreleased/your-change.md
   git commit -m "feat: add new feature with changelog"
   ```

### For Releases

1. **Tag a release** (maintainers only):
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

2. **CI automatically**:
   - Consolidates unreleased changelogs
   - Updates `CHANGELOG.md`
   - Creates GitHub release
   - Cleans up unreleased files

## File Format

Each changelog file should follow this format:

```markdown
---
category: added
---

# Brief description of the change

More detailed explanation if needed. This supports full Markdown.

## Breaking Changes

If this is a breaking change, explain:
- What changed
- How to migrate
- Examples

## Related

- Closes #123
- Related to #456
```

## Categories

- **added** - New features, endpoints, or capabilities
- **changed** - Changes to existing functionality
- **deprecated** - Features marked for removal
- **removed** - Removed features or endpoints
- **fixed** - Bug fixes
- **security** - Security improvements or fixes

## Validation Rules

Pre-commit hooks validate:
- ✅ Changelog file exists for PRs with public changes
- ✅ Valid frontmatter with required `category`
- ✅ Non-empty description
- ✅ Proper Markdown format
- ✅ Unique filename (no conflicts)

## CI/CD Integration

### On every push to main:
- Lint and validate all changelog files
- Build and deploy documentation site
- Run full test suite

### On tag push (v*.*.*):
- Consolidate unreleased changelogs
- Update main CHANGELOG.md
- Create GitHub release with notes
- Deploy release artifacts

## Examples

### Good changelog entries:

```markdown
---
category: added
---

# Add user authentication system

Implemented OAuth 2.0 authentication with support for Google and GitHub providers.

## Usage

```javascript
import { auth } from '@yourproject/auth';
await auth.login('google');
```

## Related
- Closes #234
```

```markdown
---
category: fixed
---

# Fix memory leak in WebSocket connections

Resolved issue where WebSocket connections weren't properly cleaned up on disconnect.

## Impact
- Reduces memory usage by ~30% in long-running applications
- Fixes connection limit issues

## Related
- Fixes #567
```

### Bad examples:

```markdown
# Fixed stuff
Some bug fixes.
```
❌ Missing frontmatter, too vague

```markdown
---
category: misc
---

# Updated dependencies
```
❌ Invalid category, not user-facing

## Tools

- `npm run changelog:new` - Create new changelog entry
- `npm run changelog:validate` - Validate all changelog files
- `npm run changelog:build` - Build consolidated changelog
- `npm run changelog:clean` - Remove unreleased files (release only) 
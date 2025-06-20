# Developer Guide: Changelog Workflow

This guide explains how to use the structured changelog system in this project.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up git hooks**:
   ```bash
   npm run prepare
   ```

3. **Make your changes** to the codebase

4. **Create a changelog entry** (if your changes affect public behavior):
   ```bash
   npm run changelog:new
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

The pre-commit hook will automatically validate your changelog entry!

## 📋 When Do I Need a Changelog Entry?

### ✅ **Always Required** for:
- New features or API endpoints
- Changes to existing functionality
- Bug fixes that affect user experience
- Performance improvements
- Security fixes
- Breaking changes
- Changes to public interfaces

### ❌ **Not Required** for:
- Internal refactoring (no user-visible changes)
- Test additions or modifications
- Documentation updates
- Build system changes
- Development tooling updates
- Code style/formatting changes

### 🤔 **When in Doubt**:
Ask yourself: "Would a user of this project care about this change?"
- If **yes** → Create a changelog entry
- If **no** → Skip the changelog

## 🛠️ Creating Changelog Entries

### Interactive Mode (Recommended)
```bash
npm run changelog:new
```

This will guide you through:
1. **Category selection** (added, changed, fixed, etc.)
2. **Title** - Brief description of the change
3. **Detailed description** - More context and examples
4. **Breaking changes** - Migration guide if applicable

### Categories Explained

| Category | When to Use | Example |
|----------|-------------|---------|
| **✨ Added** | New features, endpoints, capabilities | "Add user authentication system" |
| **🔄 Changed** | Modifications to existing functionality | "Update API response format" |
| **⚠️ Deprecated** | Features marked for future removal | "Deprecate legacy login endpoint" |
| **🗑️ Removed** | Removed features or endpoints | "Remove deprecated v1 API" |
| **🐛 Fixed** | Bug fixes | "Fix memory leak in WebSocket connections" |
| **🔒 Security** | Security improvements | "Fix XSS vulnerability in user input" |

## 📝 Writing Good Changelog Entries

### ✅ Good Examples

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
- Implements RFC-001
```

```markdown
---
category: fixed
---

# Fix memory leak in WebSocket connections

Resolved issue where WebSocket connections weren't properly cleaned up on disconnect.

## Impact
- Reduces memory usage by ~30% in long-running applications
- Fixes connection limit issues reported by enterprise customers

## Related
- Fixes #567
- Related to #123
```

### ❌ Bad Examples

```markdown
# Fixed stuff
Some bug fixes.
```
*Problems: Too vague, missing frontmatter, no details*

```markdown
---
category: misc
---

# Updated dependencies
```
*Problems: Invalid category, not user-facing*

```markdown
---
category: added
---

# Added new feature
```
*Problems: Too brief, no context or usage information*

## 🔧 Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run changelog:new` | Create new changelog entry | Interactive prompts |
| `npm run changelog:validate` | Validate all entries | Runs automatically in CI |
| `npm run changelog:build v1.2.3` | Build consolidated changelog | Used during releases |
| `npm run changelog:clean` | Remove unreleased entries | Used after releases |

## 🔄 Development Workflow

### Standard Feature Development

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-awesome-feature
   ```

2. **Develop your feature**:
   ```bash
   # Make your changes
   vim src/awesome-feature.js
   ```

3. **Create changelog entry**:
   ```bash
   npm run changelog:new
   # Follow the prompts
   ```

4. **Commit everything**:
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/new-awesome-feature
   # Create PR on GitHub
   ```

### Hotfix Workflow

1. **Create hotfix branch**:
   ```bash
   git checkout -b hotfix/critical-bug-fix
   ```

2. **Fix the issue**:
   ```bash
   # Make your fix
   vim src/buggy-code.js
   ```

3. **Create changelog entry**:
   ```bash
   npm run changelog:new
   # Select "Fixed" category
   ```

4. **Commit and deploy**:
   ```bash
   git add .
   git commit -m "fix: resolve critical security issue"
   git push origin hotfix/critical-bug-fix
   ```

## 🚀 Release Process

### For Maintainers

1. **Ensure all PRs have changelog entries**
2. **Create and push a version tag**:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. **GitHub Actions automatically**:
   - Validates all changelog entries
   - Consolidates unreleased entries into `CHANGELOG.md`
   - Creates GitHub release with notes
   - Cleans up unreleased files
   - Deploys changelog site

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **v1.0.0** - Major version (breaking changes)
- **v1.1.0** - Minor version (new features)
- **v1.0.1** - Patch version (bug fixes)
- **v1.0.0-beta.1** - Pre-release versions

## 🔍 Validation & CI/CD

### Pre-commit Validation

The pre-commit hook checks:
- ✅ Changelog entry exists for public-facing changes
- ✅ Valid frontmatter with required fields
- ✅ Non-empty content
- ✅ Proper Markdown formatting
- ✅ Unique filename (no conflicts)

### CI/CD Pipeline

#### On Pull Requests:
- Validates changelog format
- Enforces changelog presence
- Runs tests and linting
- Provides feedback on missing entries

#### On Main Branch Push:
- Validates all changelog entries
- Builds and deploys documentation
- Updates changelog website

#### On Tag Push:
- Consolidates changelog entries
- Creates GitHub release
- Deploys release artifacts
- Cleans up unreleased files

## 🛡️ Troubleshooting

### "Changelog entry required" Error

```bash
❌ Changelog entry required!
Your changes affect public behavior but no changelog entry was found.
```

**Solution**: Create a changelog entry:
```bash
npm run changelog:new
```

### "Validation failed" Error

```bash
❌ changelog/unreleased/2024-01-15-my-feature.md: Missing 'category' in frontmatter
```

**Solution**: Fix the frontmatter in your changelog file:
```markdown
---
category: added  # Add this line
---

# Your feature title
```

### Skip Validation (Emergency Only)

```bash
git commit --no-verify -m "emergency: critical hotfix"
```

⚠️ **Use sparingly!** This bypasses all validation.

### File Already Exists Error

```bash
Error: File 2024-01-15-my-feature.md already exists
```

**Solution**: Either:
1. Use a more specific title
2. Add a suffix: `my-feature-v2.md`
3. Edit the existing file instead

## 📊 Analytics & Insights

The changelog system provides insights into:

- **Development velocity** - Number of changes per release
- **Change types** - Distribution of features vs fixes
- **Breaking changes** - Impact on users
- **Release frequency** - Time between releases

View analytics in:
- GitHub release notes
- Changelog website
- CI/CD pipeline reports

## 🎯 Best Practices

### 1. **Write for Your Users**
- Use clear, non-technical language
- Explain the impact, not just what changed
- Include examples when helpful

### 2. **Be Specific**
```bash
# ❌ Bad
"Fix bug"

# ✅ Good  
"Fix memory leak in WebSocket connections affecting long-running applications"
```

### 3. **Include Context**
- Link to related issues/PRs
- Mention breaking changes clearly
- Provide migration guides

### 4. **Consistent Timing**
- Create changelog entries with your changes
- Don't wait until release time
- Keep entries focused and atomic

### 5. **Review Before Committing**
- Check the generated file
- Ensure proper formatting
- Verify category is correct

## 🤝 Contributing

### Improving the Changelog System

1. **Suggest improvements** via GitHub issues
2. **Submit PRs** for enhancements
3. **Update documentation** when needed
4. **Share feedback** on the workflow

### Common Customizations

- **Add new categories** in `scripts/changelog.js`
- **Modify validation rules** in `.husky/pre-commit`
- **Update CI/CD workflows** in `.github/workflows/`
- **Customize site design** in the deployment step

---

## 📚 Additional Resources

- [Keep a Changelog](https://keepachangelog.com/) - Changelog format inspiration
- [Semantic Versioning](https://semver.org/) - Version numbering
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message format
- [GitHub Flow](https://guides.github.com/introduction/flow/) - Branching strategy

---

**Questions?** Open an issue or ask in the team chat! 🚀 
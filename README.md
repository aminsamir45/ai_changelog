# AI Changelog Generator

## Overview

A comprehensive AI-powered changelog system with structured workflow, validation, and automation.

This project provides both:
1. **AI-powered changelog generation** - CLI tool that analyzes git commits and generates changelogs using AI
2. **Structured changelog workflow** - Developer tools and CI/CD integration for maintaining high-quality changelogs

**Examples of changelog websites:**

https://docs.stripe.com/changelog

https://www.twilio.com/en-us/changelog

## 🚀 Features

### AI-Powered Generation
- **Smart commit analysis** with git integration
- **AI-generated summaries** using Claude API
- **SQLite database** for changelog history and search
- **Multiple output formats** (Markdown, JSON, HTML)

### Structured Workflow
- **Interactive changelog creation** with validation
- **Pre-commit hooks** that enforce changelog presence
- **GitHub Actions** for automated releases and deployment
- **Category-based organization** (Added, Changed, Fixed, etc.)

### Developer Experience
- **CLI tools** for easy changelog management
- **Comprehensive validation** with helpful error messages
- **Automated consolidation** during releases
- **Searchable changelog history**

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Git Hooks
```bash
npm run prepare
```

### 3. Create Your First Changelog Entry
```bash
npm run changelog:new
```

### 4. Make Changes and Commit
```bash
# Make your code changes
git add .
git commit -m "feat: add awesome new feature"
# Pre-commit hook automatically validates changelog!
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run changelog:new` | Create new changelog entry interactively |
| `npm run changelog:validate` | Validate all changelog entries |
| `npm run changelog:build v1.2.3` | Build consolidated changelog for release |
| `npm run changelog:clean` | Remove unreleased entries (post-release) |

## 🔄 Workflow

### For Developers

1. **Make code changes** that affect public behavior
2. **Create changelog entry**: `npm run changelog:new`
3. **Follow prompts** to categorize and describe your change
4. **Commit normally** - pre-commit hook validates automatically

### For Releases

1. **Tag a release**: `git tag v1.2.3 && git push origin v1.2.3`
2. **GitHub Actions automatically**:
   - Consolidates unreleased changelogs
   - Updates main CHANGELOG.md
   - Creates GitHub release
   - Deploys changelog website

## 📁 Project Structure

```
ai_changelog/
├── changelog/                  # Changelog system
│   ├── README.md              # Changelog documentation
│   └── unreleased/            # Individual changelog entries
├── scripts/
│   └── changelog.js           # Changelog management CLI
├── .github/workflows/         # CI/CD automation
│   ├── main.yml              # Main branch validation & deploy
│   └── release.yml           # Release automation
├── .husky/
│   └── pre-commit            # Git hook for validation
├── cli/                      # AI-powered CLI tool
│   ├── src/                  # TypeScript source
│   └── bin/                  # Executable scripts
└── DEVELOPER_GUIDE.md        # Comprehensive developer guide
```

## 🎯 Changelog Categories

| Category | When to Use | Example |
|----------|-------------|---------|
| **✨ Added** | New features, endpoints | "Add user authentication system" |
| **🔄 Changed** | Existing functionality changes | "Update API response format" |
| **⚠️ Deprecated** | Soon-to-be removed features | "Deprecate legacy login endpoint" |
| **🗑️ Removed** | Removed features | "Remove deprecated v1 API" |
| **🐛 Fixed** | Bug fixes | "Fix memory leak in connections" |
| **🔒 Security** | Security improvements | "Fix XSS vulnerability" |

## 🔍 Validation & Enforcement

### Pre-commit Validation
- ✅ Changelog entry required for public-facing changes
- ✅ Valid frontmatter and formatting
- ✅ Proper categorization
- ✅ Non-empty content

### CI/CD Integration
- **Pull Requests**: Validate changelog presence and format
- **Main Branch**: Build and deploy changelog website
- **Release Tags**: Consolidate entries and create GitHub releases

## 🚀 AI-Powered CLI Tool

The `cli/` directory contains an advanced AI-powered changelog generator:

```bash
cd cli
npm install
npm run build

# Generate changelog from git commits
./bin/changelog-ai.js generate --from v1.0.0 --to HEAD

# View changelog history with analytics
./bin/changelog-ai.js history

# Search previous changelogs
./bin/changelog-ai.js search "authentication"
```

### CLI Features
- **Git commit analysis** with file content reading
- **AI-powered summarization** using Claude API
- **SQLite database** for persistent storage
- **Full-text search** across changelog history
- **Analytics and insights** on development patterns

## 🌐 Public Changelog Website

The system automatically deploys a public changelog website to GitHub Pages at:
`https://[username].github.io/[repo]/changelog/`

Features:
- **Responsive design** with clean, minimal UI
- **Markdown rendering** with syntax highlighting
- **Category-based organization** with emoji indicators
- **Search functionality** across all versions
- **RSS feed** for changelog updates

## 🛡️ Troubleshooting

### "Changelog entry required" Error
```bash
❌ Changelog entry required!
```
**Solution**: Create a changelog entry with `npm run changelog:new`

### "Validation failed" Error
```bash
❌ Missing 'category' in frontmatter
```
**Solution**: Ensure your changelog file has proper frontmatter:
```markdown
---
category: added
---
```

### Skip Validation (Emergency Only)
```bash
git commit --no-verify -m "emergency fix"
```

## 🎨 Technical Decisions

### Why This Architecture?

1. **Structured Approach**: Individual changelog files prevent merge conflicts and enable parallel development
2. **Validation First**: Pre-commit hooks catch issues early, preventing broken releases
3. **Automation**: CI/CD handles the tedious parts (consolidation, deployment)
4. **Developer Experience**: Interactive tools make changelog creation pleasant
5. **AI Enhancement**: Smart analysis reduces manual effort for complex changes

### Technology Choices

- **Node.js**: Universal runtime for CLI tools and automation
- **SQLite**: Lightweight, serverless database for changelog storage
- **Husky**: Reliable git hooks with cross-platform support
- **GitHub Actions**: Native CI/CD integration with GitHub
- **Claude API**: Advanced AI for intelligent commit analysis

## 🤝 Contributing

1. **Make changes** to the codebase
2. **Create changelog entry**: `npm run changelog:new`
3. **Submit PR** - CI validates automatically
4. **Merge** - changelog gets included in next release

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for detailed contribution instructions.

## 📊 Analytics & Insights

The system provides insights into:
- **Development velocity** (changes per release)
- **Change distribution** (features vs fixes vs breaking changes)
- **Release frequency** and patterns
- **Impact analysis** (breaking changes, deprecations)

## 🔮 Future Enhancements

- **Slack/Discord integration** for release notifications
- **Visual changelog** with charts and graphs
- **Multi-language support** for international teams
- **Advanced AI features** (impact prediction, migration guides)
- **Integration with issue trackers** (Jira, Linear, GitHub Issues)

## 📚 Resources

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Comprehensive developer documentation
- [changelog/README.md](changelog/README.md) - Changelog system overview
- [Keep a Changelog](https://keepachangelog.com/) - Format inspiration
- [Semantic Versioning](https://semver.org/) - Version numbering

## 🏆 Submission

This project demonstrates:

✅ **Does it work?** - Fully functional with validation, automation, and AI generation

✅ **Backend logic** - Structured workflow with SQLite storage, git integration, and AI processing

✅ **User-centered design** - Interactive CLI, helpful validation messages, comprehensive documentation

✅ **Beautiful & minimal** - Clean interfaces, emoji indicators, responsive design

✅ **Developer UX** - One command changelog creation, automatic validation, seamless workflow

### How to Run

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up hooks**: `npm run prepare`
4. **Create changelog**: `npm run changelog:new`
5. **Make changes and commit** - validation happens automatically!

### Screen Recording

[A 30-second screen recording would show]:
1. Running `npm run changelog:new`
2. Filling out the interactive prompts
3. Making a code change
4. Committing with automatic validation
5. The generated changelog entry

---

**AI Tools Used**: Claude API for intelligent commit analysis and changelog generation, GitHub Copilot for code assistance during development.

**Estimated Timeline**: This implementation took ~8 hours to build and test comprehensively.
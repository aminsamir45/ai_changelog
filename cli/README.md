# Changelog AI CLI

An AI-powered changelog generator that analyzes your git commits and creates professional changelogs using Claude AI.

## Installation

```bash
# Clone and install
git clone <repo>
cd cli
npm install
npm run build
npm link

# Or install globally (when published)
npm install -g changelog-ai
```

## Quick Start

1. **Initialize your project:**
   ```bash
   changelog-ai init
   ```
   This will prompt you for:
   - Project name
   - Claude API key
   - Project slug (for public URLs)
   - Default settings

2. **Generate a changelog:**
   ```bash
   changelog-ai generate
   ```

3. **View the generated changelog:**
   ```bash
   changelog-ai show
   ```

## Commands

### `changelog-ai init`
Initialize configuration for your project. Creates a `.changelog-ai.json` file with your settings.

### `changelog-ai generate [options]`
Generate changelog from git commits using AI.

**Options:**
- `-s, --since <since>` - Generate since date/tag/commit (default: last-tag)
- `-c, --commits <number>` - Max commits to analyze
- `-v, --version <version>` - Version tag for changelog
- `--dry-run` - Preview without saving
- `-f, --format <format>` - Output format (markdown, json, html)

**Examples:**
```bash
# Generate from last tag
changelog-ai generate

# Generate from specific date
changelog-ai generate --since="2024-01-01"

# Generate from specific tag
changelog-ai generate --since="v1.0.0"

# Generate last 20 commits
changelog-ai generate --commits=20

# Preview without saving
changelog-ai generate --dry-run

# Generate with version tag
changelog-ai generate --version="v1.2.0"
```

### `changelog-ai show`
Display the current changelog file.

### `changelog-ai config`
Show current configuration settings.

## Configuration

The `.changelog-ai.json` file stores your project configuration:

```json
{
  "projectName": "My Project",
  "claudeApiKey": "sk-ant-...",
  "projectSlug": "my-project",
  "defaultSince": "last-tag",
  "format": "markdown",
  "categories": {
    "feat": "✨ New Features",
    "fix": "🐛 Bug Fixes",
    "docs": "📝 Documentation",
    "refactor": "🔧 Internal Changes"
  },
  "excludePatterns": ["merge", "bump version", "release"],
  "includeFileChanges": true
}
```

## How It Works

1. **Git Analysis**: Analyzes commits since the last tag or specified date
2. **AI Processing**: Sends commit data to Claude AI with structured prompts
3. **Categorization**: Groups changes into logical categories
4. **Formatting**: Outputs professional markdown changelog
5. **File Management**: Saves to `CHANGELOG.md` (prepends to existing)

## Features

- 🤖 **AI-Powered**: Uses Claude AI for intelligent summarization
- 📊 **Smart Categorization**: Automatically groups changes by type
- 🎯 **Flexible Filtering**: Exclude merge commits, version bumps, etc.
- 📝 **Multiple Formats**: Markdown, JSON, HTML output
- 🔧 **Configurable**: Customize categories, patterns, and behavior
- 🚀 **Fast**: Generates professional changelogs in seconds

## Requirements

- Node.js 16+
- Git repository
- Claude API key from Anthropic

## Examples

### Generated Changelog Output

```markdown
## v1.2.0 - 2024-01-15

### ✨ New Features
- Add user authentication system
- Add password reset functionality

### 🐛 Bug Fixes
- Fix login validation errors
- Resolve session timeout issues

### 📝 Documentation
- Update API documentation
- Add setup instructions

### 🔧 Internal Changes
- Refactor user service for better maintainability
```

## Troubleshooting

**"No configuration found"**
- Run `changelog-ai init` first

**"Not a git repository"**
- Make sure you're in a git repository
- Run `git init` if needed

**"No commits found"**
- Check your `--since` parameter
- Ensure you have commits in the specified range

**"Invalid Claude API key"**
- Get your API key from [Anthropic Console](https://console.anthropic.com/)
- Key should start with `sk-ant-`

## License

MIT 
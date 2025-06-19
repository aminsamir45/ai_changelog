# Changelog AI CLI Demo

This document demonstrates the complete workflow of using the Changelog AI CLI tool.

## Demo Workflow

### 1. Installation & Setup

```bash
# Navigate to CLI directory
cd cli

# Install dependencies
npm install

# Build the project  
npm run build

# Link globally for testing
npm link

# Verify installation
changelog-ai --help
```

### 2. Initialize Project Configuration

```bash
changelog-ai init
```

**Interactive prompts:**
```
🚀 Welcome to Changelog AI!

Let's set up your project for AI-powered changelog generation.

? What is your project name? My Awesome Project
? Enter your Claude API key: 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
? Project slug (for public changelog URL): my-awesome-project  
? Default range for changelog generation: Since last git tag
? Default output format: markdown
? Include file changes in AI analysis? Yes
? Backend API endpoint (optional, for publishing): 

✅ Configuration saved successfully!

Configuration saved to .changelog-ai.json

Next steps:
  1. Make sure you're in a git repository
  2. Run: changelog-ai generate
  3. Review the generated CHANGELOG.md
  4. Optionally publish: changelog-ai publish
```

### 3. View Configuration

```bash
changelog-ai config
```

**Output:**
```
Current Configuration:
──────────────────────────────
Project Name: My Awesome Project
Project Slug: my-awesome-project
Default Since: last-tag
Format: markdown
Include File Changes: true
API Endpoint: Not set
Claude API Key: Set
```

### 4. Generate Changelog

```bash
changelog-ai generate --dry-run
```

**Expected Output:**
```
⠋ Loading configuration...
⠋ Checking git repository...
⠋ Analyzing commits since last-tag...
⠋ Found 5 commits. Generating changelog with AI...
✅ Changelog generated (dry run)

Generated Changelog:
──────────────────────────────────────────────────
## Latest Changes - 2024-01-15

### ✨ New Features
- Add AI-powered changelog generator CLI tool
- Add interactive project initialization
- Add support for multiple output formats

### 🔧 Internal Changes  
- Add TypeScript configuration and build system
- Add comprehensive command structure with Commander.js
- Add Git analysis utilities for commit processing

### 📝 Documentation
- Add implementation plan and project structure
- Add CLI usage documentation and examples
──────────────────────────────────────────────────
```

### 5. Generate and Save Changelog

```bash
changelog-ai generate --version="v1.0.0"
```

**Expected Output:**
```
⠋ Loading configuration...
⠋ Checking git repository...  
⠋ Analyzing commits since last-tag...
⠋ Found 5 commits. Generating changelog with AI...
⠋ Saving changelog...
✅ Changelog generated successfully!

✅ Changelog saved to CHANGELOG.md
📊 Processed 5 commits

📝 Preview:
──────────────────────────────────────────────────
## v1.0.0 - 2024-01-15

### ✨ New Features
- Add AI-powered changelog generator CLI tool
- Add interactive project initialization  
- Add support for multiple output formats

### 🔧 Internal Changes
- Add TypeScript configuration and build system
- Add comprehensive command structure with Commander.js
- Add Git analysis utilities for commit processing

### 📝 Documentation
- Add implementation plan and project structure
- Add CLI usage documentation and examples
──────────────────────────────────────────────────

Next steps:
  • Review the generated changelog
  • Edit CHANGELOG.md if needed
```

### 6. View Generated Changelog

```bash
changelog-ai show
```

**Output:** (Contents of CHANGELOG.md)

### 7. Advanced Usage Examples

```bash
# Generate from specific date
changelog-ai generate --since="2024-01-01" --version="v1.1.0"

# Generate last 10 commits only
changelog-ai generate --commits=10 --dry-run

# Generate from specific tag
changelog-ai generate --since="v0.9.0" --version="v1.0.0"
```

## Key Features Demonstrated

1. **Interactive Setup**: User-friendly configuration wizard
2. **Git Analysis**: Intelligent commit parsing and filtering  
3. **AI Processing**: Claude AI generates professional changelog text
4. **Smart Categorization**: Automatically groups changes by type
5. **Flexible Options**: Multiple ways to specify commit ranges
6. **Preview Mode**: Dry-run option to preview before saving
7. **File Management**: Automatically manages CHANGELOG.md file

## Error Handling Examples

```bash
# No configuration
changelog-ai generate
# Output: ✗ No configuration found. Run: changelog-ai init

# Not in git repository  
changelog-ai generate
# Output: ✗ Not a git repository. Please run this command in a git repository.

# No commits in range
changelog-ai generate --since="2025-01-01"
# Output: ⚠ No commits found since 2025-01-01
```

## Technical Implementation Highlights

- **TypeScript**: Full type safety and modern JavaScript features
- **Commander.js**: Professional CLI interface with help and validation
- **Inquirer**: Interactive prompts with validation
- **Simple-git**: Robust git repository analysis
- **Anthropic SDK**: Direct integration with Claude AI
- **Chalk + Ora**: Beautiful terminal output with spinners and colors

This CLI tool transforms the tedious process of writing changelogs into a simple, automated workflow that produces professional results in seconds. 
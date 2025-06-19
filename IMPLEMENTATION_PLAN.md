# AI Changelog Generator - Implementation Plan

## Overview
This document outlines the implementation plan for building an AI-powered changelog generator with two main components:
1. A developer-facing CLI tool for AI-generating changelogs
2. A public-facing website to display changelogs

## Tech Stack
- **Backend**: Node.js with Express
- **Frontend**: React with Vite
- **Database**: SQLite (simple, file-based)
- **AI Provider**: Claude API (Anthropic)
- **CLI Tool**: Node.js CLI package
- **Deployment**: Vercel (full-stack)

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Tool      │───▶│   Backend API   │───▶│  Public Website │
│                 │    │                 │    │                 │
│ - Git analysis  │    │ - Claude API    │    │ - Changelog     │
│ - Auth tokens   │    │ - Database      │    │   display       │
│ - Config        │    │ - CRUD ops      │    │ - Search/filter │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 1. Developer-Facing CLI Tool

**Package**: `changelog-ai` (npm package)

**Core Features**:
- `changelog-ai init` - Setup project configuration
- `changelog-ai generate` - Generate changelog from recent commits
- `changelog-ai publish` - Publish to public site

**Implementation**:
- Use `commander.js` for CLI interface
- `simple-git` for Git operations
- Analyze commits since last tag/date
- Send commit data to Claude API with structured prompt
- Store API keys in local config file
- Output markdown locally + optionally publish to API

**Key Files**:
```
cli/
├── bin/changelog-ai.js
├── src/
│   ├── commands/
│   │   ├── init.js
│   │   ├── generate.js
│   │   └── publish.js
│   ├── utils/
│   │   ├── git.js
│   │   ├── claude.js
│   │   └── config.js
│   └── prompts/
│       └── changelog-prompt.js
└── package.json
```

## 2. Backend API

**Framework**: Express.js with TypeScript

**Endpoints**:
- `POST /api/changelogs` - Create new changelog
- `GET /api/changelogs` - List changelogs (public)
- `GET /api/changelogs/:id` - Get specific changelog
- `POST /api/generate` - Generate changelog from commits
- `GET /api/projects/:slug` - Get project changelogs

**Database Schema**:
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  api_key TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE changelogs (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  version TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

**Key Files**:
```
backend/
├── src/
│   ├── routes/
│   │   ├── changelogs.ts
│   │   └── projects.ts
│   ├── services/
│   │   ├── claude.ts
│   │   └── git-analyzer.ts
│   ├── models/
│   │   └── database.ts
│   └── app.ts
└── package.json
```

## 3. Public Website

**Framework**: React with Vite + TailwindCSS

**Pages**:
- `/` - Homepage with project list
- `/:projectSlug` - Project changelog page
- `/:projectSlug/:version` - Specific version page

**Features**:
- Clean, minimal design inspired by Stripe/Twilio
- Search and filter changelogs
- RSS feed support
- Mobile responsive
- Dark/light mode

**Key Components**:
```
frontend/
├── src/
│   ├── components/
│   │   ├── ChangelogList.tsx
│   │   ├── ChangelogEntry.tsx
│   │   └── SearchFilter.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Project.tsx
│   │   └── Version.tsx
│   └── App.tsx
└── package.json
```

## 4. Claude Integration

**Prompt Strategy**:
```
You are a technical writer creating a changelog for developers. 

Given these git commits, create a concise changelog entry:

COMMITS:
{commit_data}

FORMAT:
- Use bullet points
- Focus on user-facing changes
- Group related changes
- Use present tense
- Mention breaking changes clearly

CATEGORIES:
- ✨ New Features
- 🐛 Bug Fixes
- 📝 Documentation
- ⚠️ Breaking Changes
- 🔧 Internal Changes
```

## 5. Project Structure

```
ai-changelog/
├── cli/                 # CLI tool package
├── backend/            # Express API
├── frontend/           # React website
├── shared/             # Shared types/utils
├── docker-compose.yml  # Local development
└── README.md
```

## 6. Development Workflow

1. **Setup**: `npm run dev` starts all services
2. **CLI Development**: Test locally with `npm link`
3. **API Testing**: Use Postman/Thunder Client
4. **Frontend**: Hot reload with Vite
5. **Database**: SQLite for simplicity, migrations with Knex

## 7. Deployment Strategy

- **Backend + Frontend**: Vercel (serverless functions)
- **Database**: Vercel Postgres (production) or Railway
- **CLI**: Publish to npm registry
- **Environment**: Separate staging/production

## 8. Key Implementation Details

**Git Analysis**:
- Parse commits since last tag or date range
- Extract meaningful commit messages
- Filter out merge commits and noise
- Include file changes context

**Claude Prompt Engineering**:
- Structured prompt with examples
- Include commit context and file changes
- Request specific formatting
- Handle rate limits gracefully

**Security**:
- API key authentication for CLI
- Rate limiting on public endpoints
- Input validation and sanitization

## Timeline Estimate

- **Week 1**: CLI tool and git analysis
- **Week 2**: Backend API and Claude integration
- **Week 3**: Frontend website and styling
- **Week 4**: Testing, deployment, and polish

This plan provides a complete, production-ready solution that's both developer-friendly and user-focused, with a clear path from development to deployment. 
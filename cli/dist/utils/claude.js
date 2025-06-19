"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const date_fns_1 = require("date-fns");
class ClaudeService {
    constructor(apiKey) {
        this.client = new sdk_1.default({
            apiKey: apiKey,
        });
    }
    async generateChangelog(commits, config, version) {
        const prompt = this.buildPrompt(commits, config, version);
        try {
            const response = await this.client.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });
            const content = response.content[0];
            if (content.type !== 'text') {
                throw new Error('Unexpected response type from Claude');
            }
            return this.parseResponse(content.text, version);
        }
        catch (error) {
            throw new Error(`Failed to generate changelog with Claude: ${error}`);
        }
    }
    buildPrompt(commits, config, version) {
        const commitsText = commits
            .map(commit => `- ${commit.hash.substring(0, 8)}: ${commit.message}`)
            .join('\n');
        const categoriesText = Object.entries(config.categories)
            .map(([key, label]) => `- ${key}: ${label}`)
            .join('\n');
        return `You are a technical writer creating a changelog for developers.

PROJECT: ${config.projectName}
${version ? `VERSION: ${version}` : ''}

Given these git commits, create a concise changelog entry:

COMMITS:
${commitsText}

CATEGORIES TO USE:
${categoriesText}

INSTRUCTIONS:
- Group changes by category (only include categories that have changes)
- Use bullet points for each change
- Focus on user-facing changes and impact
- Use present tense ("Add feature" not "Added feature")
- Be concise but descriptive
- Mention breaking changes clearly if any
- Ignore merge commits and version bumps
- If a commit doesn't fit a category, put it in the most appropriate one

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

## ${version || 'Latest Changes'} - ${(0, date_fns_1.format)(new Date(), 'yyyy-MM-dd')}

### ✨ New Features
- Description of new feature based on commits

### 🐛 Bug Fixes
- Description of bug fix based on commits

### 📝 Documentation
- Description of documentation changes

(Only include sections that have actual changes)

IMPORTANT: 
- Only output the markdown changelog, no other text
- Start directly with the ## heading
- Only include categories that have actual changes from the commits`;
    }
    parseResponse(response, version) {
        const lines = response.split('\n');
        const categories = {};
        let currentCategory = '';
        for (const line of lines) {
            const trimmed = line.trim();
            // Skip empty lines and the main heading
            if (!trimmed || trimmed.startsWith('##')) {
                continue;
            }
            // Check for category heading
            if (trimmed.startsWith('###')) {
                currentCategory = trimmed.replace('###', '').trim();
                categories[currentCategory] = [];
                continue;
            }
            // Add items to current category
            if (trimmed.startsWith('-') && currentCategory) {
                categories[currentCategory].push(trimmed.substring(1).trim());
            }
        }
        return {
            version,
            date: (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'),
            categories,
            rawContent: response
        };
    }
    async testConnection() {
        try {
            const response = await this.client.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 10,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello'
                    }
                ]
            });
            return response.content.length > 0;
        }
        catch {
            return false;
        }
    }
}
exports.ClaudeService = ClaudeService;
//# sourceMappingURL=claude.js.map
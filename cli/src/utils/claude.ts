import Anthropic from '@anthropic-ai/sdk';
import { CommitInfo, Config, ChangelogEntry } from '../types';
import { format } from 'date-fns';

export class ClaudeService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  async generateChangelog(
    commits: CommitInfo[],
    config: Config,
    version?: string
  ): Promise<ChangelogEntry> {
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
    } catch (error) {
      throw new Error(`Failed to generate changelog with Claude: ${error}`);
    }
  }

  private buildPrompt(commits: CommitInfo[], config: Config, version?: string): string {
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

## ${version || 'Latest Changes'} - ${format(new Date(), 'yyyy-MM-dd')}

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

  private parseResponse(response: string, version?: string): ChangelogEntry {
    const lines = response.split('\n');
    const categories: Record<string, string[]> = {};
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
      date: format(new Date(), 'yyyy-MM-dd'),
      categories,
      rawContent: response
    };
  }

  async testConnection(): Promise<boolean> {
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
    } catch {
      return false;
    }
  }
} 
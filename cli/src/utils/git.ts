import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import { CommitInfo } from '../types';
import { format } from 'date-fns';

export class GitAnalyzer {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  async getCommitsSince(since: string, maxCount?: number): Promise<CommitInfo[]> {
    try {
      let fromRef = since;
      
      // Handle different since formats
      if (since === 'last-tag') {
        fromRef = await this.getLastTag();
      }

      // Try different approaches to get commits
      let log: LogResult;
      
      try {
        // First try with from/to range
        const logOptions: any = {
          from: fromRef,
          to: 'HEAD',
          format: {
            hash: '%H',
            date: '%ai',
            message: '%s',
            author_name: '%an',
            author_email: '%ae'
          }
        };

        if (maxCount) {
          logOptions.maxCount = maxCount;
        }

        log = await this.git.log(logOptions);
      } catch (rangeError) {
        // If range fails, try getting recent commits
        console.warn('Range query failed, getting recent commits instead');
        const logOptions: any = {
          maxCount: maxCount || 10,
          format: {
            hash: '%H',
            date: '%ai',
            message: '%s',
            author_name: '%an',
            author_email: '%ae'
          }
        };
        
        log = await this.git.log(logOptions);
      }
      
      const commits: CommitInfo[] = [];
      
      for (const commit of log.all) {
        const files = await this.getChangedFiles(commit.hash);
        
        commits.push({
          hash: commit.hash,
          message: commit.message,
          author: commit.author_name,
          date: commit.date,
          files
        });
      }

      return commits;
    } catch (error) {
      throw new Error(`Failed to get commits: ${error}`);
    }
  }

  async getLastTag(): Promise<string> {
    try {
      const tags = await this.git.tags(['--sort=-version:refname']);
      if (tags.all.length === 0) {
        // If no tags, return a reference that will get all commits
        console.warn('No git tags found, analyzing all commits');
        return 'HEAD~100'; // Get last 100 commits if no tags
      }
      return tags.latest || tags.all[0];
    } catch (error) {
      console.warn('Could not get git tags, defaulting to recent commits');
      return 'HEAD~10';
    }
  }

  async getChangedFiles(commitHash: string): Promise<string[]> {
    try {
      const diff = await this.git.show([commitHash, '--name-only', '--pretty=format:']);
      return diff.split('\n').filter(file => file.trim() !== '');
    } catch (error) {
      console.warn(`Could not get changed files for commit ${commitHash}:`, error);
      return [];
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || 'main';
    } catch (error) {
      return 'main';
    }
  }

  filterCommits(commits: CommitInfo[], excludePatterns: string[]): CommitInfo[] {
    return commits.filter(commit => {
      const message = commit.message.toLowerCase();
      return !excludePatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
    });
  }

  categorizeCommit(message: string, categories: Record<string, string>): string {
    const lowerMessage = message.toLowerCase();
    
    // Check for conventional commit format first
    const conventionalMatch = message.match(/^(\w+)(\(.+\))?:/);
    if (conventionalMatch) {
      const type = conventionalMatch[1];
      if (categories[type]) {
        return type;
      }
    }

    // Fallback to keyword matching
    for (const [key, _] of Object.entries(categories)) {
      if (lowerMessage.includes(key) || lowerMessage.includes(key.replace('feat', 'feature'))) {
        return key;
      }
    }

    // Default categorization based on common patterns
    if (lowerMessage.includes('fix') || lowerMessage.includes('bug')) {
      return 'fix';
    }
    if (lowerMessage.includes('add') || lowerMessage.includes('new')) {
      return 'feat';
    }
    if (lowerMessage.includes('doc') || lowerMessage.includes('readme')) {
      return 'docs';
    }
    if (lowerMessage.includes('refactor') || lowerMessage.includes('clean')) {
      return 'refactor';
    }

    return 'chore';
  }

  formatCommitForAI(commit: CommitInfo, includeFiles: boolean = true): string {
    let formatted = `${commit.hash.substring(0, 8)}: ${commit.message}`;
    
    if (includeFiles && commit.files.length > 0) {
      formatted += `\n  Files: ${commit.files.slice(0, 5).join(', ')}`;
      if (commit.files.length > 5) {
        formatted += ` (+${commit.files.length - 5} more)`;
      }
    }
    
    return formatted;
  }
} 
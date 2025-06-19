"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitAnalyzer = void 0;
const simple_git_1 = require("simple-git");
class GitAnalyzer {
    constructor() {
        this.git = (0, simple_git_1.simpleGit)();
    }
    async isGitRepository() {
        try {
            await this.git.status();
            return true;
        }
        catch {
            return false;
        }
    }
    async getCommitsSince(since, maxCount) {
        try {
            let fromRef = since;
            // Handle different since formats
            if (since === 'last-tag') {
                fromRef = await this.getLastTag();
            }
            const logOptions = {
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
            const log = await this.git.log(logOptions);
            const commits = [];
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
        }
        catch (error) {
            throw new Error(`Failed to get commits: ${error}`);
        }
    }
    async getLastTag() {
        try {
            const tags = await this.git.tags(['--sort=-version:refname']);
            if (tags.all.length === 0) {
                // If no tags, get commits from beginning
                const firstCommit = await this.git.log(['--reverse', '-1']);
                return firstCommit.all[0]?.hash || 'HEAD~10';
            }
            return tags.latest || tags.all[0];
        }
        catch (error) {
            throw new Error(`Failed to get last tag: ${error}`);
        }
    }
    async getChangedFiles(commitHash) {
        try {
            const diff = await this.git.show([commitHash, '--name-only', '--pretty=format:']);
            return diff.split('\n').filter(file => file.trim() !== '');
        }
        catch (error) {
            console.warn(`Could not get changed files for commit ${commitHash}:`, error);
            return [];
        }
    }
    async getCurrentBranch() {
        try {
            const status = await this.git.status();
            return status.current || 'main';
        }
        catch (error) {
            return 'main';
        }
    }
    filterCommits(commits, excludePatterns) {
        return commits.filter(commit => {
            const message = commit.message.toLowerCase();
            return !excludePatterns.some(pattern => message.includes(pattern.toLowerCase()));
        });
    }
    categorizeCommit(message, categories) {
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
    formatCommitForAI(commit, includeFiles = true) {
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
exports.GitAnalyzer = GitAnalyzer;
//# sourceMappingURL=git.js.map
import { CommitInfo } from '../types';
export declare class GitAnalyzer {
    private git;
    constructor();
    isGitRepository(): Promise<boolean>;
    getCommitsSince(since: string, maxCount?: number): Promise<CommitInfo[]>;
    getLastTag(): Promise<string>;
    getChangedFiles(commitHash: string): Promise<string[]>;
    getCurrentBranch(): Promise<string>;
    filterCommits(commits: CommitInfo[], excludePatterns: string[]): CommitInfo[];
    categorizeCommit(message: string, categories: Record<string, string>): string;
    formatCommitForAI(commit: CommitInfo, includeFiles?: boolean): string;
}
//# sourceMappingURL=git.d.ts.map
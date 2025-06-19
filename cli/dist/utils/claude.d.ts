import { CommitInfo, Config, ChangelogEntry } from '../types';
export declare class ClaudeService {
    private client;
    constructor(apiKey: string);
    generateChangelog(commits: CommitInfo[], config: Config, version?: string): Promise<ChangelogEntry>;
    private buildPrompt;
    private parseResponse;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=claude.d.ts.map
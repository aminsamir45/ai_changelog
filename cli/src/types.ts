export interface Config {
  projectName: string;
  claudeApiKey: string;
  apiEndpoint?: string;
  projectSlug?: string;
  defaultSince: string;
  format: 'markdown' | 'json' | 'html';
  categories: Record<string, string>;
  excludePatterns: string[];
  includeFileChanges: boolean;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: string[];
}

export interface ChangelogEntry {
  version?: string;
  date: string;
  categories: Record<string, string[]>;
  rawContent?: string;
}

export interface GenerateOptions {
  since?: string;
  commits?: number;
  dryRun?: boolean;
  format?: string;
  prompt?: string;
  include?: string;
  exclude?: string;
  version?: string;
}

export interface PublishOptions {
  version?: string;
  dryRun?: boolean;
} 
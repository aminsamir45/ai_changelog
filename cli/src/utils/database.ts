import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ChangelogEntry } from '../types';

export interface ChangelogRecord {
  id?: number;
  version: string;
  date: string;
  content: string;
  categories: string; // JSON string
  commit_count: number;
  project_name: string;
  created_at: string;
}

export class ChangelogDatabase {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    this.dbPath = this.getDbPath();
    this.db = new Database(this.dbPath);
    this.init();
  }

  private getDbPath(): string {
    const cwd = process.cwd();
    
    // Check if we're in the CLI development directory
    if (cwd.endsWith('/cli') || cwd.endsWith('\\cli')) {
      // Store database in parent directory
      return path.join(path.dirname(cwd), '.changelog-ai.db');
    }
    
    // Default: store in current directory
    return path.join(cwd, '.changelog-ai.db');
  }

  private init(): void {
    // Create changelogs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS changelogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL,
        date TEXT NOT NULL,
        content TEXT NOT NULL,
        categories TEXT NOT NULL,
        commit_count INTEGER DEFAULT 0,
        project_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_version ON changelogs(version);
      CREATE INDEX IF NOT EXISTS idx_date ON changelogs(date);
      CREATE INDEX IF NOT EXISTS idx_project ON changelogs(project_name);
    `);
  }

  async saveChangelog(entry: ChangelogEntry, projectName: string, commitCount: number): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO changelogs (version, date, content, categories, commit_count, project_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      entry.version || 'Latest Changes',
      entry.date,
      entry.rawContent || '',
      JSON.stringify(entry.categories),
      commitCount,
      projectName
    );

    return result.lastInsertRowid as number;
  }

  getAllChangelogs(projectName?: string): ChangelogRecord[] {
    let query = 'SELECT * FROM changelogs';
    let params: any[] = [];

    if (projectName) {
      query += ' WHERE project_name = ?';
      params.push(projectName);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as ChangelogRecord[];
  }

  getChangelogByVersion(version: string, projectName?: string): ChangelogRecord | null {
    let query = 'SELECT * FROM changelogs WHERE version = ?';
    let params: any[] = [version];

    if (projectName) {
      query += ' AND project_name = ?';
      params.push(projectName);
    }

    const stmt = this.db.prepare(query);
    return stmt.get(...params) as ChangelogRecord | null;
  }

  getChangelogStats(projectName?: string): {
    totalVersions: number;
    totalCommits: number;
    firstVersion: string | null;
    latestVersion: string | null;
  } {
    let query = 'SELECT COUNT(*) as count, SUM(commit_count) as total_commits FROM changelogs';
    let params: any[] = [];

    if (projectName) {
      query += ' WHERE project_name = ?';
      params.push(projectName);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as any;

    // Get first and latest versions
    let versionQuery = 'SELECT version FROM changelogs';
    if (projectName) {
      versionQuery += ' WHERE project_name = ?';
    }
    
    const firstStmt = this.db.prepare(versionQuery + ' ORDER BY date ASC, created_at ASC LIMIT 1');
    const latestStmt = this.db.prepare(versionQuery + ' ORDER BY date DESC, created_at DESC LIMIT 1');
    
    const firstResult = firstStmt.get(...params) as any;
    const latestResult = latestStmt.get(...params) as any;

    return {
      totalVersions: result.count || 0,
      totalCommits: result.total_commits || 0,
      firstVersion: firstResult?.version || null,
      latestVersion: latestResult?.version || null
    };
  }

  searchChangelogs(searchTerm: string, projectName?: string): ChangelogRecord[] {
    let query = 'SELECT * FROM changelogs WHERE content LIKE ?';
    let params: any[] = [`%${searchTerm}%`];

    if (projectName) {
      query += ' AND project_name = ?';
      params.push(projectName);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as ChangelogRecord[];
  }

  deleteChangelog(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM changelogs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }

  // Utility method to check if database exists
  static databaseExists(): boolean {
    const cwd = process.cwd();
    let dbPath: string;
    
    if (cwd.endsWith('/cli') || cwd.endsWith('\\cli')) {
      dbPath = path.join(path.dirname(cwd), '.changelog-ai.db');
    } else {
      dbPath = path.join(cwd, '.changelog-ai.db');
    }
    
    return fs.existsSync(dbPath);
  }

  // Migration method to import existing changelog.md
  async importFromMarkdown(markdownPath: string, projectName: string): Promise<number> {
    if (!await fs.pathExists(markdownPath)) {
      return 0;
    }

    const content = await fs.readFile(markdownPath, 'utf-8');
    const versions = this.parseMarkdownVersions(content);
    let imported = 0;

    for (const version of versions) {
      // Check if version already exists
      const existing = this.getChangelogByVersion(version.version, projectName);
      if (!existing) {
        await this.saveChangelog(
          {
            version: version.version,
            date: version.date,
            categories: version.categories,
            rawContent: version.content
          },
          projectName,
          version.estimatedCommits
        );
        imported++;
      }
    }

    return imported;
  }

  private parseMarkdownVersions(content: string): Array<{
    version: string;
    date: string;
    content: string;
    categories: Record<string, string[]>;
    estimatedCommits: number;
  }> {
    const versions: any[] = [];
    const lines = content.split('\n');
    let currentVersion: any = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const versionMatch = line.match(/^## (.+?) - (\d{4}-\d{2}-\d{2})/);
      
      if (versionMatch) {
        // Save previous version if exists
        if (currentVersion) {
          currentVersion.content = currentContent.join('\n').trim();
          versions.push(currentVersion);
        }

        // Start new version
        currentVersion = {
          version: versionMatch[1],
          date: versionMatch[2],
          categories: {},
          estimatedCommits: 0
        };
        currentContent = [line];
      } else if (currentVersion) {
        currentContent.push(line);
        
        // Count estimated commits (rough estimate based on bullet points)
        if (line.startsWith('- ')) {
          currentVersion.estimatedCommits++;
        }
      }
    }

    // Don't forget the last version
    if (currentVersion) {
      currentVersion.content = currentContent.join('\n').trim();
      versions.push(currentVersion);
    }

    return versions;
  }
} 
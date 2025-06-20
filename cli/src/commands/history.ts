import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ChangelogDatabase } from '../utils/database';
import { loadConfig } from '../utils/config';

export async function historyCommand(): Promise<void> {
  try {
    const config = await loadConfig();
    if (!config) {
      console.log(chalk.yellow('No configuration found. Run: changelog-ai init'));
      return;
    }

    const db = new ChangelogDatabase();
    
    // Check if we need to import from markdown first
    const changelogPath = findChangelogPath();
    if (await fs.pathExists(changelogPath)) {
      const imported = await db.importFromMarkdown(changelogPath, config.projectName);
      if (imported > 0) {
        console.log(chalk.green(`✅ Imported ${imported} versions from CHANGELOG.md`));
      }
    }

    const changelogs = db.getAllChangelogs(config.projectName);
    const stats = db.getChangelogStats(config.projectName);
    
    db.close();
    
    if (changelogs.length === 0) {
      console.log(chalk.yellow('No changelog history found. Run: changelog-ai generate'));
      return;
    }

    console.log(chalk.blue.bold('📋 Changelog History\n'));
    
    changelogs.forEach((changelog, index) => {
      const isLatest = index === 0;
      const prefix = isLatest ? '🏷️  ' : '   ';
      const style = isLatest ? chalk.green.bold : chalk.gray;
      
      console.log(style(`${prefix}${changelog.version} (${changelog.date})`));
      console.log(chalk.gray(`     ${changelog.commit_count} commits • ${new Date(changelog.created_at).toLocaleDateString()}`));
    });
    
    console.log(chalk.blue(`\n📊 Statistics:`));
    console.log(chalk.gray(`   • Total versions: ${stats.totalVersions}`));
    console.log(chalk.gray(`   • Total commits: ${stats.totalCommits}`));
    console.log(chalk.gray(`   • First version: ${stats.firstVersion || 'N/A'}`));
    console.log(chalk.gray(`   • Latest version: ${stats.latestVersion || 'N/A'}`));
    
    console.log(chalk.blue('\n📖 Commands:'));
    console.log(chalk.gray('   • changelog-ai show-version <version> - View specific version'));
    console.log(chalk.gray('   • changelog-ai search <term> - Search changelog content'));
    console.log(chalk.gray('   • changelog-ai stats - View detailed statistics'));
    
  } catch (error) {
    console.error(chalk.red(`Error reading changelog history: ${error}`));
  }
}

export async function showVersionCommand(version: string): Promise<void> {
  try {
    const config = await loadConfig();
    if (!config) {
      console.log(chalk.yellow('No configuration found. Run: changelog-ai init'));
      return;
    }

    const db = new ChangelogDatabase();
    
    // Import from markdown if needed
    const changelogPath = findChangelogPath();
    if (await fs.pathExists(changelogPath)) {
      await db.importFromMarkdown(changelogPath, config.projectName);
    }

    const changelog = db.getChangelogByVersion(version, config.projectName);
    
    if (!changelog) {
      console.log(chalk.yellow(`Version ${version} not found in changelog history`));
      console.log(chalk.blue('Available versions:'));
      const allChangelogs = db.getAllChangelogs(config.projectName);
      allChangelogs.forEach(c => console.log(chalk.gray(`  • ${c.version}`)));
      db.close();
      return;
    }
    
    console.log(chalk.blue.bold(`📋 Changelog for ${version}\n`));
    console.log(changelog.content);
    
    console.log(chalk.blue(`\n📊 Details:`));
    console.log(chalk.gray(`   • Date: ${changelog.date}`));
    console.log(chalk.gray(`   • Commits: ${changelog.commit_count}`));
    console.log(chalk.gray(`   • Created: ${new Date(changelog.created_at).toLocaleString()}`));
    
    db.close();
    
  } catch (error) {
    console.error(chalk.red(`Error reading changelog: ${error}`));
  }
}

interface ChangelogVersion {
  version: string;
  date: string;
  summary?: string;
}

function parseChangelogVersions(content: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^## (.+?) - (\d{4}-\d{2}-\d{2})/);
    if (match) {
      versions.push({
        version: match[1],
        date: match[2],
        summary: extractSummary(content, match[1])
      });
    }
  }
  
  return versions;
}

function extractVersion(content: string, targetVersion: string): string | null {
  const lines = content.split('\n');
  let capturing = false;
  let versionContent: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (capturing) {
        // We've reached the next version, stop capturing
        break;
      }
      
      if (line.includes(targetVersion)) {
        capturing = true;
        versionContent.push(line);
      }
    } else if (capturing) {
      versionContent.push(line);
    }
  }
  
  return capturing ? versionContent.join('\n').trim() : null;
}

function findChangelogPath(): string {
  const cwd = process.cwd();
  
  // Check if we're in the CLI development directory
  if (cwd.endsWith('/cli') || cwd.endsWith('\\cli')) {
    // Go up one directory to find the changelog
    return path.join(path.dirname(cwd), 'CHANGELOG.md');
  }
  
  // Default: look in current directory
  return path.join(cwd, 'CHANGELOG.md');
}

function extractSummary(content: string, version: string): string {
  const versionContent = extractVersion(content, version);
  if (!versionContent) return '';
  
  const lines = versionContent.split('\n');
  const features: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('- ')) {
      features.push(line.substring(2));
    }
  }
  
  if (features.length === 0) return '';
  if (features.length === 1) return features[0];
  return `${features.length} changes`;
}

export async function searchCommand(searchTerm: string): Promise<void> {
  try {
    const config = await loadConfig();
    if (!config) {
      console.log(chalk.yellow('No configuration found. Run: changelog-ai init'));
      return;
    }

    const db = new ChangelogDatabase();
    
    // Import from markdown if needed
    const changelogPath = findChangelogPath();
    if (await fs.pathExists(changelogPath)) {
      await db.importFromMarkdown(changelogPath, config.projectName);
    }

    const results = db.searchChangelogs(searchTerm, config.projectName);
    
    if (results.length === 0) {
      console.log(chalk.yellow(`No changelog entries found containing "${searchTerm}"`));
      db.close();
      return;
    }
    
    console.log(chalk.blue.bold(`🔍 Search Results for "${searchTerm}"\n`));
    
    results.forEach((changelog, index) => {
      console.log(chalk.green(`${index + 1}. ${changelog.version} (${changelog.date})`));
      console.log(chalk.gray(`   ${changelog.commit_count} commits`));
      
      // Show preview of matching content
      const lines = changelog.content.split('\n');
      const matchingLines = lines.filter(line => 
        line.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 2);
      
      if (matchingLines.length > 0) {
        console.log(chalk.gray('   Preview:'));
        matchingLines.forEach(line => {
          const highlighted = line.replace(
            new RegExp(searchTerm, 'gi'), 
            chalk.yellow('$&')
          );
          console.log(chalk.gray(`     ${highlighted.trim()}`));
        });
      }
      console.log('');
    });
    
    console.log(chalk.blue(`Found ${results.length} matching changelog${results.length === 1 ? '' : 's'}`));
    
    db.close();
    
  } catch (error) {
    console.error(chalk.red(`Error searching changelogs: ${error}`));
  }
}

export async function statsCommand(): Promise<void> {
  try {
    const config = await loadConfig();
    if (!config) {
      console.log(chalk.yellow('No configuration found. Run: changelog-ai init'));
      return;
    }

    const db = new ChangelogDatabase();
    
    // Import from markdown if needed
    const changelogPath = findChangelogPath();
    if (await fs.pathExists(changelogPath)) {
      await db.importFromMarkdown(changelogPath, config.projectName);
    }

    const stats = db.getChangelogStats(config.projectName);
    const allChangelogs = db.getAllChangelogs(config.projectName);
    
    console.log(chalk.blue.bold(`📊 Changelog Statistics for ${config.projectName}\n`));
    
    console.log(chalk.green('📈 Overview:'));
    console.log(chalk.gray(`   • Total versions: ${stats.totalVersions}`));
    console.log(chalk.gray(`   • Total commits processed: ${stats.totalCommits}`));
    console.log(chalk.gray(`   • Average commits per version: ${stats.totalVersions > 0 ? Math.round(stats.totalCommits / stats.totalVersions) : 0}`));
    
    console.log(chalk.green('\n🏷️  Version Range:'));
    console.log(chalk.gray(`   • First version: ${stats.firstVersion || 'N/A'}`));
    console.log(chalk.gray(`   • Latest version: ${stats.latestVersion || 'N/A'}`));
    
    if (allChangelogs.length > 0) {
      const firstDate = new Date(allChangelogs[allChangelogs.length - 1].date);
      const latestDate = new Date(allChangelogs[0].date);
      const daysDiff = Math.ceil((latestDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(chalk.green('\n📅 Timeline:'));
      console.log(chalk.gray(`   • First release: ${firstDate.toLocaleDateString()}`));
      console.log(chalk.gray(`   • Latest release: ${latestDate.toLocaleDateString()}`));
      console.log(chalk.gray(`   • Development span: ${daysDiff} days`));
      
      if (daysDiff > 0 && stats.totalVersions > 1) {
        const avgDays = Math.round(daysDiff / (stats.totalVersions - 1));
        console.log(chalk.gray(`   • Average days between releases: ${avgDays}`));
      }
    }
    
    console.log(chalk.green('\n📋 Recent Activity:'));
    allChangelogs.slice(0, 5).forEach((changelog, index) => {
      const style = index === 0 ? chalk.green : chalk.gray;
      console.log(style(`   ${index + 1}. ${changelog.version} - ${changelog.commit_count} commits (${changelog.date})`));
    });
    
    if (allChangelogs.length > 5) {
      console.log(chalk.gray(`   ... and ${allChangelogs.length - 5} more versions`));
    }
    
    db.close();
    
  } catch (error) {
    console.error(chalk.red(`Error generating statistics: ${error}`));
  }
} 
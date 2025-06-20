import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { loadConfig } from '../utils/config';
import { GitAnalyzer } from '../utils/git';
import { ClaudeService } from '../utils/claude';
import { ChangelogDatabase } from '../utils/database';
import { GenerateOptions, CommitInfo, Config } from '../types';

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const spinner = ora('Loading configuration...').start();

  try {
    // Load configuration
    const config = await loadConfig();
    if (!config) {
      spinner.fail('No configuration found. Run: changelog-ai init');
      return;
    }

    // Initialize services
    const gitAnalyzer = new GitAnalyzer();
    const claudeService = new ClaudeService(config.claudeApiKey);

    // Check if we're in a git repository
    spinner.text = 'Checking git repository...';
    if (!await gitAnalyzer.isGitRepository()) {
      spinner.fail('Not a git repository. Please run this command in a git repository.');
      return;
    }

    // Determine the range for commits
    const since = options.since || config.defaultSince;
    const maxCommits = options.commits;

    spinner.text = `Analyzing commits since ${since}...`;
    
    // Get commits
    let commits = await gitAnalyzer.getCommitsSince(since, maxCommits);
    
    if (commits.length === 0) {
      spinner.warn(`No commits found since ${since}`);
      return;
    }

    // Filter commits based on exclude patterns
    commits = gitAnalyzer.filterCommits(commits, config.excludePatterns);
    
    if (commits.length === 0) {
      spinner.warn('No relevant commits found after filtering');
      return;
    }

    spinner.text = `Found ${commits.length} commits. Generating changelog with AI...`;
    
    // Generate changelog with Claude
    let changelog;
    try {
      changelog = await claudeService.generateChangelog(commits, config, options.version);
    } catch (error: any) {
      if (error.toString().includes('authentication_error') || error.toString().includes('401')) {
        spinner.warn('Claude API authentication failed. Generating mock changelog for demo...');
        
        // Generate a mock changelog for demonstration
        changelog = {
          version: options.version,
          date: new Date().toISOString().split('T')[0],
          categories: {},
          rawContent: generateMockChangelog(commits, config, options.version)
        };
      } else {
        throw error;
      }
    }
    
    if (options.dryRun) {
      spinner.succeed('Changelog generated (dry run)');
      console.log('\n' + chalk.blue.bold('Generated Changelog:'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(changelog.rawContent);
      console.log(chalk.gray('─'.repeat(50)));
      return;
    }

    // Save to file
    spinner.text = 'Saving changelog...';
    const changelogPath = findChangelogPath();
    
    let existingContent = '';
    if (await fs.pathExists(changelogPath)) {
      existingContent = await fs.readFile(changelogPath, 'utf-8');
    }

    // Prepend new changelog to existing content
    const newContent = changelog.rawContent + '\n\n' + existingContent;
    await fs.writeFile(changelogPath, newContent);

    // Save to database
    try {
      const db = new ChangelogDatabase();
      await db.saveChangelog(changelog, config.projectName, commits.length);
      db.close();
    } catch (dbError) {
      console.warn(chalk.yellow('Warning: Could not save to database:'), dbError);
    }

    spinner.succeed('Changelog generated successfully!');
    
    // Show summary
    console.log(chalk.green.bold('\n✅ Changelog saved to CHANGELOG.md'));
    console.log(chalk.gray(`📊 Processed ${commits.length} commits`));
    
    // Show preview
    console.log(chalk.blue.bold('\n📝 Preview:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(changelog.rawContent);
    console.log(chalk.gray('─'.repeat(50)));
    
    // Show next steps
    console.log(chalk.blue.bold('\nNext steps:'));
    console.log(chalk.blue('  • Review the generated changelog'));
    console.log(chalk.blue('  • Edit CHANGELOG.md if needed'));
    if (config.apiEndpoint) {
      console.log(chalk.blue('  • Publish: changelog-ai publish'));
    }
    console.log('');

  } catch (error) {
    spinner.fail(`Failed to generate changelog: ${error}`);
  }
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

function generateMockChangelog(commits: CommitInfo[], config: Config, version?: string): string {
  const date = new Date().toISOString().split('T')[0];
  const versionHeader = version || 'Latest Changes';
  
  let changelog = `## ${versionHeader} - ${date}\n\n`;
  
  // Group commits by category
  const categories: Record<string, string[]> = {};
  
  commits.forEach(commit => {
    const message = commit.message;
    let category = 'chore';
    
    // Simple categorization based on commit message
    if (message.toLowerCase().includes('feat') || message.toLowerCase().includes('add')) {
      category = 'feat';
    } else if (message.toLowerCase().includes('fix') || message.toLowerCase().includes('bug')) {
      category = 'fix';
    } else if (message.toLowerCase().includes('doc')) {
      category = 'docs';
    } else if (message.toLowerCase().includes('refactor')) {
      category = 'refactor';
    }
    
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push(`- ${message}`);
  });
  
  // Add categories to changelog
  Object.entries(categories).forEach(([category, items]) => {
    const categoryLabel = config.categories[category] || `🔧 ${category}`;
    changelog += `### ${categoryLabel}\n`;
    changelog += items.join('\n') + '\n\n';
  });
  
  return changelog.trim();
} 
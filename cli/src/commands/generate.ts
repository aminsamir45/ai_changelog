import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { loadConfig } from '../utils/config';
import { GitAnalyzer } from '../utils/git';
import { ClaudeService } from '../utils/claude';
import { GenerateOptions } from '../types';

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
    const changelog = await claudeService.generateChangelog(commits, config, options.version);
    
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
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    
    let existingContent = '';
    if (await fs.pathExists(changelogPath)) {
      existingContent = await fs.readFile(changelogPath, 'utf-8');
    }

    // Prepend new changelog to existing content
    const newContent = changelog.rawContent + '\n\n' + existingContent;
    await fs.writeFile(changelogPath, newContent);

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
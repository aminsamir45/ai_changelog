#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { historyCommand, showVersionCommand, searchCommand, statsCommand } from './commands/history';

const program = new Command();

program
  .name('changelog-ai')
  .description('AI-powered changelog generator')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize changelog configuration')
  .action(async () => {
    try {
      await initCommand();
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate')
  .description('Generate changelog from git commits')
  .option('-s, --since <since>', 'Generate changelog since this date/tag/commit')
  .option('-c, --commits <number>', 'Maximum number of commits to analyze', parseInt)
  .option('-v, --version <version>', 'Version tag for the changelog')
  .option('--dry-run', 'Preview changelog without saving')
  .option('-f, --format <format>', 'Output format (markdown, json, html)')
  .action(async (options) => {
    try {
      await generateCommand(options);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Show command (alias for viewing current changelog)
program
  .command('show')
  .description('Display current changelog')
  .action(async () => {
    try {
      const fs = require('fs-extra');
      const path = require('path');
      const changelogPath = findChangelogPath();
      
      if (await fs.pathExists(changelogPath)) {
        const content = await fs.readFile(changelogPath, 'utf-8');
        console.log(content);
      } else {
        console.log(chalk.yellow('No changelog found. Run: changelog-ai generate'));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Show current configuration')
  .action(async () => {
    try {
      const { loadConfig } = require('./utils/config');
      const config = await loadConfig();
      
      if (!config) {
        console.log(chalk.yellow('No configuration found. Run: changelog-ai init'));
        return;
      }
      
      console.log(chalk.blue.bold('Current Configuration:'));
      console.log(chalk.gray('─'.repeat(30)));
      console.log(`Project Name: ${config.projectName}`);
      console.log(`Project Slug: ${config.projectSlug || 'Not set'}`);
      console.log(`Default Since: ${config.defaultSince}`);
      console.log(`Format: ${config.format}`);
      console.log(`Include File Changes: ${config.includeFileChanges}`);
      console.log(`API Endpoint: ${config.apiEndpoint || 'Not set'}`);
      console.log(`Claude API Key: ${config.claudeApiKey ? 'Set' : 'Not set'}`);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// History command
program
  .command('history')
  .description('Show changelog version history')
  .action(async () => {
    try {
      await historyCommand();
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Show version command
program
  .command('show-version <version>')
  .description('Show specific changelog version')
  .action(async (version) => {
    try {
      await showVersionCommand(version);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Search command
program
  .command('search <term>')
  .description('Search changelog content')
  .action(async (term) => {
    try {
      await searchCommand(term);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show detailed changelog statistics')
  .action(async () => {
    try {
      await statsCommand();
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.blue('See --help for available commands'));
  process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);

function findChangelogPath(): string {
  const path = require('path');
  const cwd = process.cwd();
  
  // Check if we're in the CLI development directory
  if (cwd.endsWith('/cli') || cwd.endsWith('\\cli')) {
    // Go up one directory to find the changelog
    return path.join(path.dirname(cwd), 'CHANGELOG.md');
  }
  
  // Default: look in current directory
  return path.join(cwd, 'CHANGELOG.md');
} 
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommand = generateCommand;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const config_1 = require("../utils/config");
const git_1 = require("../utils/git");
const claude_1 = require("../utils/claude");
const database_1 = require("../utils/database");
async function generateCommand(options) {
    const spinner = (0, ora_1.default)('Loading configuration...').start();
    try {
        // Load configuration
        const config = await (0, config_1.loadConfig)();
        if (!config) {
            spinner.fail('No configuration found. Run: changelog-ai init');
            return;
        }
        // Initialize services
        const gitAnalyzer = new git_1.GitAnalyzer();
        const claudeService = new claude_1.ClaudeService(config.claudeApiKey);
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
        }
        catch (error) {
            if (error.toString().includes('authentication_error') || error.toString().includes('401')) {
                spinner.warn('Claude API authentication failed. Generating mock changelog for demo...');
                // Generate a mock changelog for demonstration
                changelog = {
                    version: options.version,
                    date: new Date().toISOString().split('T')[0],
                    categories: {},
                    rawContent: generateMockChangelog(commits, config, options.version)
                };
            }
            else {
                throw error;
            }
        }
        if (options.dryRun) {
            spinner.succeed('Changelog generated (dry run)');
            console.log('\n' + chalk_1.default.blue.bold('Generated Changelog:'));
            console.log(chalk_1.default.gray('─'.repeat(50)));
            console.log(changelog.rawContent);
            console.log(chalk_1.default.gray('─'.repeat(50)));
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
            const db = new database_1.ChangelogDatabase();
            await db.saveChangelog(changelog, config.projectName, commits.length);
            db.close();
        }
        catch (dbError) {
            console.warn(chalk_1.default.yellow('Warning: Could not save to database:'), dbError);
        }
        spinner.succeed('Changelog generated successfully!');
        // Show summary
        console.log(chalk_1.default.green.bold('\n✅ Changelog saved to CHANGELOG.md'));
        console.log(chalk_1.default.gray(`📊 Processed ${commits.length} commits`));
        // Show preview
        console.log(chalk_1.default.blue.bold('\n📝 Preview:'));
        console.log(chalk_1.default.gray('─'.repeat(50)));
        console.log(changelog.rawContent);
        console.log(chalk_1.default.gray('─'.repeat(50)));
        // Show next steps
        console.log(chalk_1.default.blue.bold('\nNext steps:'));
        console.log(chalk_1.default.blue('  • Review the generated changelog'));
        console.log(chalk_1.default.blue('  • Edit CHANGELOG.md if needed'));
        if (config.apiEndpoint) {
            console.log(chalk_1.default.blue('  • Publish: changelog-ai publish'));
        }
        console.log('');
    }
    catch (error) {
        spinner.fail(`Failed to generate changelog: ${error}`);
    }
}
function findChangelogPath() {
    const cwd = process.cwd();
    // Check if we're in the CLI development directory
    if (cwd.endsWith('/cli') || cwd.endsWith('\\cli')) {
        // Go up one directory to find the changelog
        return path.join(path.dirname(cwd), 'CHANGELOG.md');
    }
    // Default: look in current directory
    return path.join(cwd, 'CHANGELOG.md');
}
function generateMockChangelog(commits, config, version) {
    const date = new Date().toISOString().split('T')[0];
    const versionHeader = version || 'Latest Changes';
    let changelog = `## ${versionHeader} - ${date}\n\n`;
    // Group commits by category
    const categories = {};
    commits.forEach(commit => {
        const message = commit.message;
        let category = 'chore';
        // Simple categorization based on commit message
        if (message.toLowerCase().includes('feat') || message.toLowerCase().includes('add')) {
            category = 'feat';
        }
        else if (message.toLowerCase().includes('fix') || message.toLowerCase().includes('bug')) {
            category = 'fix';
        }
        else if (message.toLowerCase().includes('doc')) {
            category = 'docs';
        }
        else if (message.toLowerCase().includes('refactor')) {
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
//# sourceMappingURL=generate.js.map
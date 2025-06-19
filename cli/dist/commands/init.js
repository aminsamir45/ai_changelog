"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
async function initCommand() {
    console.log(chalk_1.default.blue.bold('\n🚀 Welcome to Changelog AI!\n'));
    // Check if config already exists
    if (await (0, config_1.configExists)()) {
        const { overwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'Configuration already exists. Do you want to overwrite it?',
                default: false
            }
        ]);
        if (!overwrite) {
            console.log(chalk_1.default.yellow('Configuration unchanged.'));
            return;
        }
    }
    console.log('Let\'s set up your project for AI-powered changelog generation.\n');
    // Collect configuration
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            validate: (input) => input.trim() !== '' || 'Project name is required'
        },
        {
            type: 'password',
            name: 'claudeApiKey',
            message: 'Enter your Claude API key:',
            mask: '*',
            default: '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',
            validate: (input) => {
                if (!input.trim())
                    return 'Claude API key is required';
                if (!input.startsWith('sk-ant-'))
                    return 'Invalid Claude API key format';
                return true;
            }
        },
        {
            type: 'input',
            name: 'projectSlug',
            message: 'Project slug (for public changelog URL):',
            validate: (input) => {
                if (!input.trim())
                    return 'Project slug is required';
                if (!/^[a-z0-9-]+$/.test(input))
                    return 'Slug must contain only lowercase letters, numbers, and hyphens';
                return true;
            },
            filter: (input) => input.toLowerCase().replace(/\s+/g, '-')
        },
        {
            type: 'list',
            name: 'defaultSince',
            message: 'Default range for changelog generation:',
            choices: [
                { name: 'Since last git tag', value: 'last-tag' },
                { name: 'Last 7 days', value: '7 days ago' },
                { name: 'Last 30 days', value: '30 days ago' },
                { name: 'Last 10 commits', value: 'HEAD~10' }
            ],
            default: 'last-tag'
        },
        {
            type: 'list',
            name: 'format',
            message: 'Default output format:',
            choices: ['markdown', 'json', 'html'],
            default: 'markdown'
        },
        {
            type: 'confirm',
            name: 'includeFileChanges',
            message: 'Include file changes in AI analysis?',
            default: true
        },
        {
            type: 'input',
            name: 'apiEndpoint',
            message: 'Backend API endpoint (optional, for publishing):',
            default: ''
        }
    ]);
    // Build config with defaults
    const config = {
        ...config_1.defaultConfig,
        ...answers,
        categories: config_1.defaultConfig.categories,
        excludePatterns: config_1.defaultConfig.excludePatterns
    };
    // Validate configuration
    const errors = (0, config_1.validateConfig)(config);
    if (errors.length > 0) {
        console.log(chalk_1.default.red('\n❌ Configuration errors:'));
        errors.forEach(error => console.log(chalk_1.default.red(`  • ${error}`)));
        return;
    }
    try {
        // Save configuration
        await (0, config_1.saveConfig)(config);
        console.log(chalk_1.default.green.bold('\n✅ Configuration saved successfully!'));
        console.log(chalk_1.default.gray('\nConfiguration saved to .changelog-ai.json'));
        console.log(chalk_1.default.gray('You can now run: changelog-ai generate\n'));
        // Show next steps
        console.log(chalk_1.default.blue.bold('Next steps:'));
        console.log(chalk_1.default.blue('  1. Make sure you\'re in a git repository'));
        console.log(chalk_1.default.blue('  2. Run: changelog-ai generate'));
        console.log(chalk_1.default.blue('  3. Review the generated CHANGELOG.md'));
        console.log(chalk_1.default.blue('  4. Optionally publish: changelog-ai publish\n'));
    }
    catch (error) {
        console.log(chalk_1.default.red(`\n❌ Failed to save configuration: ${error}`));
    }
}
//# sourceMappingURL=init.js.map
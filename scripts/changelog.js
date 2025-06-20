#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { execSync } = require('child_process');
const matter = require('gray-matter');
const glob = require('glob');

const CHANGELOG_DIR = path.join(process.cwd(), 'changelog');
const UNRELEASED_DIR = path.join(CHANGELOG_DIR, 'unreleased');
const MAIN_CHANGELOG = path.join(process.cwd(), 'CHANGELOG.md');

const CATEGORIES = {
  added: '✨ Added',
  changed: '🔄 Changed', 
  deprecated: '⚠️ Deprecated',
  removed: '🗑️ Removed',
  fixed: '🐛 Fixed',
  security: '🔒 Security'
};

const CATEGORY_DESCRIPTIONS = {
  added: 'New features, endpoints, or capabilities',
  changed: 'Changes to existing functionality',
  deprecated: 'Features marked for removal in future versions',
  removed: 'Removed features or endpoints',
  fixed: 'Bug fixes',
  security: 'Security improvements or fixes'
};

async function createNewChangelog() {
  console.log(chalk.blue.bold('📝 Create New Changelog Entry\n'));
  
  // Ensure directories exist
  await fs.ensureDir(UNRELEASED_DIR);
  
  // Get user information
  let authorName = '';
  let authorEmail = '';
  
  try {
    authorName = execSync('git config user.name', { encoding: 'utf-8' }).trim();
    authorEmail = execSync('git config user.email', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not get git user info'));
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'What type of change is this?',
      choices: Object.entries(CATEGORIES).map(([key, label]) => ({
        name: `${label} - ${CATEGORY_DESCRIPTIONS[key]}`,
        value: key
      }))
    },
    {
      type: 'input',
      name: 'title',
      message: 'Brief description of the change:',
      validate: (input) => {
        if (!input.trim()) {
          return 'Please provide a description';
        }
        if (input.length > 100) {
          return 'Please keep the title under 100 characters';
        }
        return true;
      }
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Detailed description (optional):',
      default: 'More detailed explanation of the change...\n\n## Related\n- Closes #\n- Related to #'
    },
    {
      type: 'confirm',
      name: 'isBreaking',
      message: 'Is this a breaking change?',
      default: false
    },
    {
      type: 'editor',
      name: 'breakingChanges',
      message: 'Describe the breaking changes and migration path:',
      when: (answers) => answers.isBreaking,
      default: '## Breaking Changes\n\n### What changed\n- \n\n### Migration guide\n- \n\n### Example\n```javascript\n// Before\n\n// After\n```'
    }
  ]);

  // Generate filename
  const slug = answers.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${timestamp}-${slug}.md`;
  const filepath = path.join(UNRELEASED_DIR, filename);

  // Check if file already exists
  if (await fs.pathExists(filepath)) {
    console.error(chalk.red(`Error: File ${filename} already exists`));
    process.exit(1);
  }

  // Create frontmatter
  const frontmatter = {
    category: answers.category,
    author: authorName || 'Unknown',
    email: authorEmail || '',
    date: new Date().toISOString(),
    breaking: answers.isBreaking || false
  };

  // Build content
  let content = `# ${answers.title}\n\n`;
  
  if (answers.description && answers.description.trim() !== 'More detailed explanation of the change...\n\n## Related\n- Closes #\n- Related to #') {
    content += `${answers.description}\n\n`;
  }
  
  if (answers.isBreaking && answers.breakingChanges) {
    content += `${answers.breakingChanges}\n\n`;
  }

  // Create the file
  const fileContent = matter.stringify(content, frontmatter);
  await fs.writeFile(filepath, fileContent);

  console.log(chalk.green(`✅ Created changelog entry: ${filename}`));
  console.log(chalk.gray(`📁 Location: ${filepath}`));
  console.log(chalk.blue('\n📋 Next steps:'));
  console.log(chalk.gray('1. Review the generated file'));
  console.log(chalk.gray('2. Add it to your commit:'));
  console.log(chalk.yellow(`   git add ${path.relative(process.cwd(), filepath)}`));
  console.log(chalk.gray('3. Commit your changes'));
}

async function validateChangelogs() {
  console.log(chalk.blue.bold('🔍 Validating Changelog Entries\n'));
  
  const pattern = path.join(UNRELEASED_DIR, '*.md');
  const files = glob.sync(pattern);
  
  if (files.length === 0) {
    console.log(chalk.yellow('⚠️ No unreleased changelog entries found'));
    return true;
  }

  let hasErrors = false;
  
  for (const file of files) {
    const filename = path.basename(file);
    console.log(chalk.gray(`Validating ${filename}...`));
    
    try {
      const content = await fs.readFile(file, 'utf-8');
      const parsed = matter(content);
      
      // Validate frontmatter
      if (!parsed.data.category) {
        console.error(chalk.red(`❌ ${filename}: Missing 'category' in frontmatter`));
        hasErrors = true;
      } else if (!Object.keys(CATEGORIES).includes(parsed.data.category)) {
        console.error(chalk.red(`❌ ${filename}: Invalid category '${parsed.data.category}'`));
        hasErrors = true;
      }
      
      // Validate content
      const contentLines = parsed.content.trim().split('\n');
      const firstLine = contentLines[0];
      
      if (!firstLine || !firstLine.startsWith('# ')) {
        console.error(chalk.red(`❌ ${filename}: Must start with a heading (# Title)`));
        hasErrors = true;
      }
      
      if (parsed.content.trim().length < 10) {
        console.error(chalk.red(`❌ ${filename}: Content too short`));
        hasErrors = true;
      }
      
      if (!hasErrors) {
        console.log(chalk.green(`✅ ${filename}: Valid`));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ ${filename}: Parse error - ${error.message}`));
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.log(chalk.red('\n❌ Validation failed'));
    return false;
  } else {
    console.log(chalk.green(`\n✅ All ${files.length} changelog entries are valid`));
    return true;
  }
}

async function buildChangelog(version) {
  console.log(chalk.blue.bold(`📚 Building Changelog for ${version}\n`));
  
  const pattern = path.join(UNRELEASED_DIR, '*.md');
  const files = glob.sync(pattern).sort();
  
  if (files.length === 0) {
    console.log(chalk.yellow('⚠️ No unreleased changelog entries found'));
    return;
  }

  // Group by category
  const categorized = {};
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const parsed = matter(content);
      const category = parsed.data.category;
      
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      // Extract title from content
      const lines = parsed.content.trim().split('\n');
      const title = lines[0].replace(/^# /, '');
      
      categorized[category].push({
        title,
        content: parsed.content,
        data: parsed.data,
        filename: path.basename(file)
      });
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not parse ${file}: ${error.message}`));
    }
  }

  // Build new changelog section
  const date = new Date().toISOString().split('T')[0];
  let newSection = `## ${version} - ${date}\n\n`;
  
  // Add categories in order
  const categoryOrder = ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security'];
  
  for (const category of categoryOrder) {
    if (categorized[category] && categorized[category].length > 0) {
      newSection += `### ${CATEGORIES[category]}\n\n`;
      
      for (const entry of categorized[category]) {
        newSection += `- ${entry.title}\n`;
      }
      
      newSection += '\n';
    }
  }

  // Read existing changelog
  let existingContent = '';
  if (await fs.pathExists(MAIN_CHANGELOG)) {
    existingContent = await fs.readFile(MAIN_CHANGELOG, 'utf-8');
  } else {
    existingContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }

  // Insert new section after the header
  const lines = existingContent.split('\n');
  const headerEndIndex = lines.findIndex(line => line.startsWith('## '));
  
  let newContent;
  if (headerEndIndex === -1) {
    // No existing versions, append to end
    newContent = existingContent + '\n' + newSection;
  } else {
    // Insert before first existing version
    lines.splice(headerEndIndex, 0, newSection);
    newContent = lines.join('\n');
  }

  // Write updated changelog
  await fs.writeFile(MAIN_CHANGELOG, newContent);
  
  console.log(chalk.green(`✅ Updated ${MAIN_CHANGELOG}`));
  console.log(chalk.gray(`📝 Added ${files.length} entries for version ${version}`));
  
  return newSection;
}

async function cleanUnreleased() {
  console.log(chalk.blue.bold('🧹 Cleaning Unreleased Entries\n'));
  
  const pattern = path.join(UNRELEASED_DIR, '*.md');
  const files = glob.sync(pattern);
  
  if (files.length === 0) {
    console.log(chalk.yellow('No unreleased entries to clean'));
    return;
  }

  for (const file of files) {
    await fs.remove(file);
    console.log(chalk.gray(`Removed ${path.basename(file)}`));
  }
  
  console.log(chalk.green(`✅ Cleaned ${files.length} unreleased entries`));
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'new':
      await createNewChangelog();
      break;
      
    case 'validate':
      const isValid = await validateChangelogs();
      process.exit(isValid ? 0 : 1);
      break;
      
    case 'build':
      const version = process.argv[3];
      if (!version) {
        console.error(chalk.red('Error: Version required for build command'));
        console.error(chalk.gray('Usage: npm run changelog:build v1.2.3'));
        process.exit(1);
      }
      await buildChangelog(version);
      break;
      
    case 'clean':
      await cleanUnreleased();
      break;
      
    default:
      console.log(chalk.blue.bold('📝 Changelog Management Tool\n'));
      console.log(chalk.gray('Available commands:'));
      console.log(chalk.yellow('  new      ') + chalk.gray('- Create a new changelog entry'));
      console.log(chalk.yellow('  validate ') + chalk.gray('- Validate all changelog entries'));
      console.log(chalk.yellow('  build    ') + chalk.gray('- Build consolidated changelog'));
      console.log(chalk.yellow('  clean    ') + chalk.gray('- Remove unreleased entries'));
      console.log(chalk.gray('\nUsage:'));
      console.log(chalk.gray('  npm run changelog:new'));
      console.log(chalk.gray('  npm run changelog:validate'));
      console.log(chalk.gray('  npm run changelog:build v1.2.3'));
      console.log(chalk.gray('  npm run changelog:clean'));
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  });
}

module.exports = {
  createNewChangelog,
  validateChangelogs,
  buildChangelog,
  cleanUnreleased
}; 
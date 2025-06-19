import * as fs from 'fs-extra';
import * as path from 'path';
import { Config } from '../types';

const CONFIG_FILE = '.changelog-ai.json';

export const defaultConfig: Partial<Config> = {
  defaultSince: 'last-tag',
  format: 'markdown',
  categories: {
    feat: '✨ New Features',
    fix: '🐛 Bug Fixes',
    docs: '📝 Documentation',
    refactor: '🔧 Internal Changes',
    style: '💄 Style Changes',
    test: '🧪 Tests',
    chore: '🔧 Maintenance'
  },
  excludePatterns: ['merge', 'bump version', 'release'],
  includeFileChanges: true
};

export async function loadConfig(): Promise<Config | null> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  
  if (!await fs.pathExists(configPath)) {
    return null;
  }

  try {
    const configData = await fs.readJson(configPath);
    return { ...defaultConfig, ...configData } as Config;
  } catch (error) {
    throw new Error(`Failed to load config: ${error}`);
  }
}

export async function saveConfig(config: Config): Promise<void> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  
  try {
    await fs.writeJson(configPath, config, { spaces: 2 });
  } catch (error) {
    throw new Error(`Failed to save config: ${error}`);
  }
}

export function validateConfig(config: Partial<Config>): string[] {
  const errors: string[] = [];

  if (!config.projectName) {
    errors.push('Project name is required');
  }

  if (!config.claudeApiKey) {
    errors.push('Claude API key is required');
  }

  if (config.claudeApiKey && !config.claudeApiKey.startsWith('sk-ant-')) {
    errors.push('Invalid Claude API key format');
  }

  if (config.format && !['markdown', 'json', 'html'].includes(config.format)) {
    errors.push('Format must be one of: markdown, json, html');
  }

  return errors;
}

export async function configExists(): Promise<boolean> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  return fs.pathExists(configPath);
} 
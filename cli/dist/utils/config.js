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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.validateConfig = validateConfig;
exports.configExists = configExists;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const CONFIG_FILE = '.changelog-ai.json';
exports.defaultConfig = {
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
async function loadConfig() {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    if (!await fs.pathExists(configPath)) {
        return null;
    }
    try {
        const configData = await fs.readJson(configPath);
        return { ...exports.defaultConfig, ...configData };
    }
    catch (error) {
        throw new Error(`Failed to load config: ${error}`);
    }
}
async function saveConfig(config) {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    try {
        await fs.writeJson(configPath, config, { spaces: 2 });
    }
    catch (error) {
        throw new Error(`Failed to save config: ${error}`);
    }
}
function validateConfig(config) {
    const errors = [];
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
async function configExists() {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    return fs.pathExists(configPath);
}
//# sourceMappingURL=config.js.map
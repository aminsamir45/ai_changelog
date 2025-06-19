import { Config } from '../types';
export declare const defaultConfig: Partial<Config>;
export declare function loadConfig(): Promise<Config | null>;
export declare function saveConfig(config: Config): Promise<void>;
export declare function validateConfig(config: Partial<Config>): string[];
export declare function configExists(): Promise<boolean>;
//# sourceMappingURL=config.d.ts.map
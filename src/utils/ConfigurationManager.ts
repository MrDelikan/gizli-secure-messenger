/**
 * Real Configuration Manager for Gizli
 * Manages application settings with persistence and validation
 */

export interface AppConfig {
  debug: {
    enabled: boolean;
    verboseLogging: boolean;
    showNetworkDetails: boolean;
  };
  security: {
    keyRotationInterval: number; // minutes
    maxConnectionAttempts: number;
    encryptionAlgorithm: 'ChaCha20-Poly1305' | 'AES-256-GCM';
    requireAuthentication: boolean;
  };
  performance: {
    messageBufferSize: number;
    connectionTimeout: number; // seconds
    maxConcurrentConnections: number;
    compressionEnabled: boolean;
  };
  network: {
    port: number;
    enableUPnP: boolean;
    stableConnectionsOnly: boolean;
    heartbeatInterval: number; // seconds
  };
  ui: {
    theme: 'cyberpunk' | 'dark' | 'light';
    showAdvancedMetrics: boolean;
    autoScrollLogs: boolean;
    notificationLevel: 'all' | 'important' | 'critical';
  };
}

export class ConfigurationManager {
  private config: AppConfig;
  private listeners: Set<(config: AppConfig, key: string) => void> = new Set();
  private readonly storageKey = 'gizli_config';

  constructor() {
    this.config = this.getDefaultConfig();
    this.loadConfig();
  }

  private getDefaultConfig(): AppConfig {
    return {
      debug: {
        enabled: false,
        verboseLogging: false,
        showNetworkDetails: true
      },
      security: {
        keyRotationInterval: 30,
        maxConnectionAttempts: 5,
        encryptionAlgorithm: 'ChaCha20-Poly1305',
        requireAuthentication: true
      },
      performance: {
        messageBufferSize: 50,
        connectionTimeout: 30,
        maxConcurrentConnections: 10,
        compressionEnabled: true
      },
      network: {
        port: 3001,
        enableUPnP: true,
        stableConnectionsOnly: false,
        heartbeatInterval: 30
      },
      ui: {
        theme: 'cyberpunk',
        showAdvancedMetrics: false,
        autoScrollLogs: true,
        notificationLevel: 'important'
      }
    };
  }

  // Configuration getters
  getConfig(): AppConfig {
    return JSON.parse(JSON.stringify(this.config)); // Deep copy
  }

  get<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return JSON.parse(JSON.stringify(this.config[section]));
  }

  getValue<K extends keyof AppConfig, T extends keyof AppConfig[K]>(
    section: K,
    key: T
  ): AppConfig[K][T] {
    return this.config[section][key];
  }

  // Configuration setters
  set<K extends keyof AppConfig>(section: K, values: Partial<AppConfig[K]>): boolean {
    try {
      const updatedSection = { ...this.config[section], ...values };
      
      // Validate the updated section
      if (!this.validateSection(section, updatedSection)) {
        throw new Error(`Invalid configuration for section: ${String(section)}`);
      }

      this.config[section] = updatedSection;
      this.saveConfig();
      this.notifyListeners(String(section));
      return true;
    } catch (error) {
      console.error('Failed to update configuration:', error);
      return false;
    }
  }

  setValue<K extends keyof AppConfig, T extends keyof AppConfig[K]>(
    section: K,
    key: T,
    value: AppConfig[K][T]
  ): boolean {
    try {
      // Validate the specific value
      if (!this.validateValue(section, key, value)) {
        throw new Error(`Invalid value for ${String(section)}.${String(key)}: ${value}`);
      }

      this.config[section][key] = value;
      this.saveConfig();
      this.notifyListeners(`${String(section)}.${String(key)}`);
      return true;
    } catch (error) {
      console.error('Failed to update configuration value:', error);
      return false;
    }
  }

  // Configuration management
  resetToDefaults(): boolean {
    try {
      this.config = this.getDefaultConfig();
      this.saveConfig();
      this.notifyListeners('*');
      return true;
    } catch (error) {
      console.error('Failed to reset configuration:', error);
      return false;
    }
  }

  resetSection<K extends keyof AppConfig>(section: K): boolean {
    try {
      const defaultConfig = this.getDefaultConfig();
      this.config[section] = defaultConfig[section];
      this.saveConfig();
      this.notifyListeners(String(section));
      return true;
    } catch (error) {
      console.error('Failed to reset section:', error);
      return false;
    }
  }

  // Import/Export
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validate imported configuration
      if (!this.validateFullConfig(importedConfig)) {
        throw new Error('Invalid configuration format');
      }

      this.config = importedConfig;
      this.saveConfig();
      this.notifyListeners('*');
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  // Event listeners
  onChange(callback: (config: AppConfig, changedKey: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Persistence
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        if (this.validateFullConfig(parsedConfig)) {
          // Merge with defaults to ensure new config keys are present
          this.config = this.mergeWithDefaults(parsedConfig);
        }
      }
    } catch (error) {
      console.error('Failed to load configuration from storage:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save configuration to storage:', error);
    }
  }

  private mergeWithDefaults(storedConfig: Partial<AppConfig>): AppConfig {
    const defaults = this.getDefaultConfig();
    const merged: AppConfig = { ...defaults };

    // Deep merge each section
    if (storedConfig.debug) {
      merged.debug = { ...defaults.debug, ...storedConfig.debug };
    }
    if (storedConfig.security) {
      merged.security = { ...defaults.security, ...storedConfig.security };
    }
    if (storedConfig.performance) {
      merged.performance = { ...defaults.performance, ...storedConfig.performance };
    }
    if (storedConfig.network) {
      merged.network = { ...defaults.network, ...storedConfig.network };
    }
    if (storedConfig.ui) {
      merged.ui = { ...defaults.ui, ...storedConfig.ui };
    }

    return merged;
  }

  // Validation
  private validateFullConfig(config: unknown): config is AppConfig {
    if (!config || typeof config !== 'object') return false;

    const c = config as Record<string, unknown>;
    return (
      this.validateSection('debug', c.debug) &&
      this.validateSection('security', c.security) &&
      this.validateSection('performance', c.performance) &&
      this.validateSection('network', c.network) &&
      this.validateSection('ui', c.ui)
    );
  }

  private validateSection<K extends keyof AppConfig>(
    section: K,
    value: unknown
  ): value is AppConfig[K] {
    if (!value || typeof value !== 'object') return false;

    switch (section) {
      case 'debug':
        return this.validateDebugConfig(value);
      case 'security':
        return this.validateSecurityConfig(value);
      case 'performance':
        return this.validatePerformanceConfig(value);
      case 'network':
        return this.validateNetworkConfig(value);
      case 'ui':
        return this.validateUiConfig(value);
      default:
        return false;
    }
  }

  private validateValue<K extends keyof AppConfig, T extends keyof AppConfig[K]>(
    section: K,
    key: T,
    value: AppConfig[K][T]
  ): boolean {
    switch (section) {
      case 'security':
        if (key === 'keyRotationInterval') {
          return typeof value === 'number' && value >= 5 && value <= 1440;
        }
        if (key === 'maxConnectionAttempts') {
          return typeof value === 'number' && value >= 1 && value <= 20;
        }
        break;
      case 'performance':
        if (key === 'messageBufferSize') {
          return typeof value === 'number' && value >= 10 && value <= 1000;
        }
        if (key === 'connectionTimeout') {
          return typeof value === 'number' && value >= 5 && value <= 300;
        }
        break;
      case 'network':
        if (key === 'port') {
          return typeof value === 'number' && value >= 1024 && value <= 65535;
        }
        break;
    }
    return true; // Default to true for other validations
  }

  private validateDebugConfig(value: unknown): value is AppConfig['debug'] {
    const v = value as Record<string, unknown>;
    return (
      typeof v.enabled === 'boolean' &&
      typeof v.verboseLogging === 'boolean' &&
      typeof v.showNetworkDetails === 'boolean'
    );
  }

  private validateSecurityConfig(value: unknown): value is AppConfig['security'] {
    const v = value as Record<string, unknown>;
    return (
      typeof v.keyRotationInterval === 'number' &&
      typeof v.maxConnectionAttempts === 'number' &&
      typeof v.encryptionAlgorithm === 'string' &&
      typeof v.requireAuthentication === 'boolean'
    );
  }

  private validatePerformanceConfig(value: unknown): value is AppConfig['performance'] {
    const v = value as Record<string, unknown>;
    return (
      typeof v.messageBufferSize === 'number' &&
      typeof v.connectionTimeout === 'number' &&
      typeof v.maxConcurrentConnections === 'number' &&
      typeof v.compressionEnabled === 'boolean'
    );
  }

  private validateNetworkConfig(value: unknown): value is AppConfig['network'] {
    const v = value as Record<string, unknown>;
    return (
      typeof v.port === 'number' &&
      typeof v.enableUPnP === 'boolean' &&
      typeof v.stableConnectionsOnly === 'boolean' &&
      typeof v.heartbeatInterval === 'number'
    );
  }

  private validateUiConfig(value: unknown): value is AppConfig['ui'] {
    const v = value as Record<string, unknown>;
    return (
      typeof v.theme === 'string' &&
      typeof v.showAdvancedMetrics === 'boolean' &&
      typeof v.autoScrollLogs === 'boolean' &&
      typeof v.notificationLevel === 'string'
    );
  }

  private notifyListeners(changedKey: string): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.getConfig(), changedKey);
      } catch (error) {
        console.error('Error in configuration change listener:', error);
      }
    });
  }
}

// Global instance
export const configManager = new ConfigurationManager();

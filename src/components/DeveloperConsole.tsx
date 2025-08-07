import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { NetworkAnalytics, type RealNetworkMetrics } from '../utils/NetworkAnalytics';
import { securityLogger, type RealSecurityEvent } from '../utils/SecurityLogger';
import { configManager, type AppConfig } from '../utils/ConfigurationManager';
import { networkDiagnostics, type NetworkHealth, type DiagnosticResult } from '../utils/NetworkDiagnostics';
import { systemPerformanceMonitor, type SystemMetrics } from '../utils/SystemPerformanceMonitor';
import { SecureP2PNetwork } from '../network/SecureP2PNetwork';
import './DeveloperConsole.css';

interface PluginInfo {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error';
}

interface DeveloperConsoleProps {
  network?: SecureP2PNetwork;
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ network, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'diagnostics' | 'performance' | 'plugins' | 'config'>('metrics');
  const [metrics, setMetrics] = useState<RealNetworkMetrics>({
    latency: 0,
    bandwidth: 0,
    packetLoss: 0,
    encryption: 'ChaCha20-Poly1305',
    connections: 0,
    uptime: 0,
    bytesTransferred: 0,
    messagesCount: 0
  });
  const [securityEvents, setSecurityEvents] = useState<RealSecurityEvent[]>([]);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  
  // Get NetworkAnalytics instance from the network or create a standalone one
  const networkAnalytics = useMemo(() => 
    network?.getNetworkAnalytics() || new NetworkAnalytics(), 
    [network]
  );
  const [config, setConfig] = useState<AppConfig>(configManager.getConfig());
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize real network analytics
  useEffect(() => {
    // Subscribe to real-time metrics updates
    const unsubscribe = networkAnalytics.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
    });

    // Initial metrics load
    setMetrics(networkAnalytics.getMetrics());

    return () => {
      unsubscribe();
    };
  }, [networkAnalytics]);

  // Subscribe to real security events
  useEffect(() => {
    // Load existing events
    setSecurityEvents(securityLogger.getEvents({ limit: 100 }));

    // Subscribe to new events
    const unsubscribe = securityLogger.onEvent((event) => {
      setSecurityEvents(prev => [event, ...prev].slice(0, 100));
    });

    return unsubscribe;
  }, []);

  // Subscribe to configuration changes
  useEffect(() => {
    const unsubscribe = configManager.onChange((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  // Subscribe to network diagnostics
  useEffect(() => {
    const unsubscribe = networkDiagnostics.onHealthUpdate((health) => {
      setNetworkHealth(health);
      setDiagnosticResults(health.issues);
    });

    return unsubscribe;
  }, []);

  // Subscribe to system performance metrics
  useEffect(() => {
    const unsubscribe = systemPerformanceMonitor.onMetricsUpdate((metrics) => {
      setSystemMetrics(metrics);
    });

    // Initial load
    setSystemMetrics(systemPerformanceMonitor.getMetrics());

    return unsubscribe;
  }, []);

  // Initialize sample plugins
  useEffect(() => {
    setPlugins([
      {
        id: 'quantum-guard',
        name: 'Quantum Guard',
        version: '1.2.0',
        author: 'CryptoLabs',
        description: 'Post-quantum cryptography protection',
        enabled: true,
        status: 'active'
      },
      {
        id: 'tor-router',
        name: 'Tor Router',
        version: '2.1.5',
        author: 'AnonDev',
        description: 'Anonymous routing through Tor network',
        enabled: false,
        status: 'inactive'
      },
      {
        id: 'threat-intel',
        name: 'Threat Intelligence',
        version: '1.0.3',
        author: 'SecTeam',
        description: 'Real-time threat detection and analysis',
        enabled: true,
        status: 'active'
      },
      {
        id: 'auto-destruct',
        name: 'Auto Destruct',
        version: '1.5.2',
        author: 'PrivacyFirst',
        description: 'Automatic message destruction with timers',
        enabled: true,
        status: 'error'
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [securityEvents]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Real configuration update handlers
  const updateDebugConfig = (key: keyof AppConfig['debug'], value: boolean) => {
    configManager.setValue('debug', key, value);
  };

  const updateSecurityConfig = <T extends keyof AppConfig['security']>(key: T, value: AppConfig['security'][T]) => {
    configManager.setValue('security', key, value);
  };

  const updatePerformanceConfig = <T extends keyof AppConfig['performance']>(key: T, value: AppConfig['performance'][T]) => {
    configManager.setValue('performance', key, value);
  };

  const handleConfigExport = () => {
    const configJson = configManager.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gizli-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfigImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (configManager.importConfig(content)) {
            securityLogger.logEvent('info', 'Configuration imported successfully', 'low', 'ConfigManager');
          } else {
            securityLogger.logEvent('error', 'Failed to import configuration', 'medium', 'ConfigManager');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleConfigReset = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      configManager.resetToDefaults();
      securityLogger.logEvent('warning', 'Configuration reset to defaults', 'medium', 'ConfigManager');
    }
  };

  // Real security log management
  const handleClearLogs = () => {
    if (confirm('Clear all security logs? This cannot be undone.')) {
      securityLogger.clearEvents();
      setSecurityEvents([]);
    }
  };

  const handleExportLogs = () => {
    const logsJson = securityLogger.exportEvents('json');
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gizli-security-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId 
        ? { ...plugin, enabled: !plugin.enabled, status: !plugin.enabled ? 'active' : 'inactive' }
        : plugin
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="developer-console-overlay">
      <div className="developer-console-container">
        <div className="console-header">
          <h2 className="console-title">
            <span className="dev-icon">⚡</span>
            Developer Console
          </h2>
          <button className="close-console-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="console-tabs">
          <button 
            className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            📊 Network
          </button>
          <button 
            className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            🚀 Performance
          </button>
          <button 
            className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📋 Security Logs
          </button>
          <button 
            className={`tab ${activeTab === 'diagnostics' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnostics')}
          >
            🔍 Diagnostics
          </button>
          <button 
            className={`tab ${activeTab === 'plugins' ? 'active' : ''}`}
            onClick={() => setActiveTab('plugins')}
          >
            🔧 Plugins
          </button>
          <button 
            className={`tab ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            ⚙️ Configuration
          </button>
        </div>

        <div className="console-content">
          {activeTab === 'metrics' && (
            <div className="metrics-panel">
              <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">Network Latency</div>
                    <div className="metric-value">{metrics.latency}ms</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill latency" 
                        style={{ width: `${Math.min(metrics.latency / 100 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">Bandwidth</div>
                    <div className="metric-value">{metrics.bandwidth} KB/s</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill bandwidth" 
                        style={{ width: `${Math.min(metrics.bandwidth / 1500 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">Packet Loss</div>
                    <div className="metric-value">{metrics.packetLoss.toFixed(2)}%</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill packet-loss" 
                        style={{ width: `${Math.min(metrics.packetLoss / 5 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>                <div className="metric-card">
                  <div className="metric-label">Active Connections</div>
                  <div className="metric-value">{metrics.connections}</div>
                  <div className="connection-indicators">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`connection-dot ${i < metrics.connections ? 'active' : ''}`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Encryption</div>
                  <div className="metric-value">{metrics.encryption}</div>
                  <div className="encryption-status">Active</div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">System Uptime</div>
                  <div className="metric-value">{formatUptime(metrics.uptime)}</div>
                  <div className="uptime-status">🟢 Stable</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && systemMetrics && (
            <div className="performance-panel">
              <div className="performance-grid">
                <div className="performance-card cpu">
                  <div className="performance-header">
                    <span className="performance-icon">💻</span>
                    <div className="performance-title">CPU Usage</div>
                  </div>
                  <div className="performance-value">{systemMetrics.cpu.usage.toFixed(1)}%</div>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill cpu" 
                      style={{ width: `${systemMetrics.cpu.usage}%` }}
                    ></div>
                  </div>
                  <div className="performance-details">
                    Processes: {systemMetrics.cpu.processes}
                  </div>
                </div>

                <div className="performance-card memory">
                  <div className="performance-header">
                    <span className="performance-icon">🧠</span>
                    <div className="performance-title">Memory Usage</div>
                  </div>
                  <div className="performance-value">{systemMetrics.memory.percentage.toFixed(1)}%</div>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill memory" 
                      style={{ width: `${systemMetrics.memory.percentage}%` }}
                    ></div>
                  </div>
                  <div className="performance-details">
                    {systemMetrics.memory.used.toFixed(0)}MB / {systemMetrics.memory.total.toFixed(0)}MB
                  </div>
                </div>

                <div className="performance-card network">
                  <div className="performance-header">
                    <span className="performance-icon">🌐</span>
                    <div className="performance-title">Network Speed</div>
                  </div>
                  <div className="performance-value">{systemMetrics.network.downloadSpeed.toFixed(0)} KB/s</div>
                  <div className="performance-details">
                    ↓ {systemMetrics.network.downloadSpeed.toFixed(0)} KB/s | 
                    ↑ {systemMetrics.network.uploadSpeed.toFixed(0)} KB/s
                  </div>
                </div>

                <div className="performance-card application">
                  <div className="performance-header">
                    <span className="performance-icon">⚡</span>
                    <div className="performance-title">App Performance</div>
                  </div>
                  <div className="performance-value">{systemMetrics.application.frameRate.toFixed(0)} FPS</div>
                  <div className="performance-details">
                    JS Heap: {systemMetrics.application.jsHeapSize.toFixed(1)}MB<br/>
                    DOM Nodes: {systemMetrics.application.domNodes}
                  </div>
                </div>

                {systemMetrics.battery && (
                  <div className="performance-card battery">
                    <div className="performance-header">
                      <span className="performance-icon">🔋</span>
                      <div className="performance-title">Battery</div>
                    </div>
                    <div className="performance-value">{systemMetrics.battery.level}%</div>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill battery" 
                        style={{ width: `${systemMetrics.battery.level}%` }}
                      ></div>
                    </div>
                    <div className="performance-details">
                      {systemMetrics.battery.charging ? '🔌 Charging' : '⚡ Discharging'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="logs-panel">
              <div className="logs-controls">
                <button 
                  className={`log-filter ${config.debug.verboseLogging ? 'active' : ''}`}
                  onClick={() => updateDebugConfig('verboseLogging', !config.debug.verboseLogging)}
                >
                  Verbose Logging
                </button>
                <button className="export-logs" onClick={handleExportLogs}>
                  Export Logs
                </button>
                <button className="clear-logs" onClick={handleClearLogs}>
                  Clear Logs
                </button>
              </div>
              <div className="logs-container">
                {securityEvents.length === 0 ? (
                  <div className="no-logs">
                    <p>No security events logged yet.</p>
                    <small>Events will appear here as they occur.</small>
                  </div>
                ) : (
                  securityEvents.map((event) => (
                    <div key={event.id} className={`log-entry ${event.type} ${event.severity}`}>
                      <div className="log-timestamp">{formatTimestamp(event.timestamp)}</div>
                      <div className={`log-type ${event.severity}`}>
                        {event.type.toUpperCase()}
                      </div>
                      <div className="log-message">{event.message}</div>
                      <div className="log-severity">{event.severity}</div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="diagnostics-panel">
              {networkHealth && (
                <div className="health-overview">
                  <div className={`health-score ${networkHealth.overall}`}>
                    <div className="health-indicator">
                      <span className="health-emoji">
                        {networkHealth.overall === 'excellent' ? '🟢' : 
                         networkHealth.overall === 'good' ? '🟡' : 
                         networkHealth.overall === 'poor' ? '🟠' : '🔴'}
                      </span>
                      <div className="health-details">
                        <div className="health-status">{networkHealth.overall.toUpperCase()}</div>
                        <div className="health-score-number">{networkHealth.score}/100</div>
                      </div>
                    </div>
                  </div>
                  
                  {networkHealth.recommendations.length > 0 && (
                    <div className="recommendations">
                      <h4>💡 Recommendations</h4>
                      {networkHealth.recommendations.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="diagnostics-list">
                <div className="diagnostics-header">
                  <h3>🔍 Active Issues</h3>
                  <button 
                    className="clear-diagnostics-btn"
                    onClick={() => networkDiagnostics.clearHistory()}
                  >
                    Clear History
                  </button>
                </div>
                
                {diagnosticResults.length === 0 ? (
                  <div className="no-issues">
                    <p>✅ No issues detected</p>
                    <small>Your network is performing optimally</small>
                  </div>
                ) : (
                  diagnosticResults.map((diagnostic) => (
                    <div key={diagnostic.id} className={`diagnostic-card ${diagnostic.type}`}>
                      <div className="diagnostic-header">
                        <div className="diagnostic-category">{diagnostic.category}</div>
                        <div className={`diagnostic-type ${diagnostic.type}`}>
                          {diagnostic.type.toUpperCase()}
                        </div>
                        <div className="diagnostic-severity">
                          Severity: {diagnostic.severity}/10
                        </div>
                      </div>
                      <div className="diagnostic-message">{diagnostic.message}</div>
                      <div className="diagnostic-recommendation">
                        💡 {diagnostic.recommendation}
                      </div>
                      {diagnostic.autoFixAvailable && (
                        <button 
                          className="auto-fix-btn"
                          onClick={async () => {
                            const success = await networkDiagnostics.applyAutoFix(diagnostic.id);
                            if (success) {
                              securityLogger.logEvent('info', `Auto-fix applied for: ${diagnostic.message}`, 'low', 'NetworkDiagnostics');
                            }
                          }}
                        >
                          🔧 Auto-Fix
                        </button>
                      )}
                      <div className="diagnostic-timestamp">
                        {formatTimestamp(diagnostic.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'plugins' && (
            <div className="plugins-panel">
              <div className="plugins-header">
                <h3>Installed Plugins</h3>
                <button className="install-plugin-btn">+ Install Plugin</button>
              </div>
              <div className="plugins-list">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className={`plugin-card ${plugin.status}`}>
                    <div className="plugin-info">
                      <div className="plugin-name">{plugin.name}</div>
                      <div className="plugin-version">v{plugin.version}</div>
                      <div className="plugin-author">by {plugin.author}</div>
                      <div className="plugin-description">{plugin.description}</div>
                    </div>
                    <div className="plugin-controls">
                      <div className={`plugin-status ${plugin.status}`}>
                        {plugin.status}
                      </div>
                      <button 
                        className={`plugin-toggle ${plugin.enabled ? 'enabled' : 'disabled'}`}
                        onClick={() => togglePlugin(plugin.id)}
                      >
                        {plugin.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="config-panel">
              <div className="config-section">
                <h3>Debug Settings</h3>
                <div className="config-group">
                  <label className="config-item">
                    <input 
                      type="checkbox" 
                      checked={config.debug.enabled}
                      onChange={(e) => updateDebugConfig('enabled', e.target.checked)}
                    />
                    <span>Enable Debug Mode</span>
                  </label>
                  <label className="config-item">
                    <input 
                      type="checkbox" 
                      checked={config.debug.verboseLogging}
                      onChange={(e) => updateDebugConfig('verboseLogging', e.target.checked)}
                    />
                    <span>Verbose Network Logging</span>
                  </label>
                  <label className="config-item">
                    <input 
                      type="checkbox" 
                      checked={config.debug.showNetworkDetails}
                      onChange={(e) => updateDebugConfig('showNetworkDetails', e.target.checked)}
                    />
                    <span>Show Network Details</span>
                  </label>
                </div>
              </div>

              <div className="config-section">
                <h3>Security Settings</h3>
                <div className="config-group">
                  <div className="config-item">
                    <label htmlFor="key-rotation">Key Rotation Interval</label>
                    <select 
                      id="key-rotation" 
                      className="config-select" 
                      title="Select key rotation interval"
                      value={config.security.keyRotationInterval}
                      onChange={(e) => updateSecurityConfig('keyRotationInterval', parseInt(e.target.value))}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div className="config-item">
                    <label htmlFor="max-attempts">Max Connection Attempts</label>
                    <input 
                      id="max-attempts"
                      type="number" 
                      className="config-input" 
                      value={config.security.maxConnectionAttempts}
                      onChange={(e) => updateSecurityConfig('maxConnectionAttempts', parseInt(e.target.value))}
                      min="1" 
                      max="10"
                      title="Maximum connection attempts"
                    />
                  </div>
                  <div className="config-item">
                    <label htmlFor="encryption-algo">Encryption Algorithm</label>
                    <select 
                      id="encryption-algo" 
                      className="config-select" 
                      title="Select encryption algorithm"
                      value={config.security.encryptionAlgorithm}
                      onChange={(e) => updateSecurityConfig('encryptionAlgorithm', e.target.value as 'ChaCha20-Poly1305' | 'AES-256-GCM')}
                    >
                      <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
                      <option value="AES-256-GCM">AES-256-GCM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="config-section">
                <h3>Performance Settings</h3>
                <div className="config-group">
                  <div className="config-item">
                    <label htmlFor="buffer-size">Message Buffer Size</label>
                    <input 
                      id="buffer-size"
                      type="range" 
                      className="config-range" 
                      value={config.performance.messageBufferSize}
                      onChange={(e) => updatePerformanceConfig('messageBufferSize', parseInt(e.target.value))}
                      min="10" 
                      max="1000"
                      title="Message buffer size"
                    />
                    <span className="range-value">{config.performance.messageBufferSize} messages</span>
                  </div>
                  <div className="config-item">
                    <label htmlFor="connection-timeout">Connection Timeout</label>
                    <input 
                      id="connection-timeout"
                      type="number" 
                      className="config-input" 
                      value={config.performance.connectionTimeout}
                      onChange={(e) => updatePerformanceConfig('connectionTimeout', parseInt(e.target.value))}
                      min="5" 
                      max="120"
                      title="Connection timeout in seconds"
                    />
                    <span>seconds</span>
                  </div>
                  <div className="config-item">
                    <label htmlFor="max-connections">Max Concurrent Connections</label>
                    <input 
                      id="max-connections"
                      type="number" 
                      className="config-input" 
                      value={config.performance.maxConcurrentConnections}
                      onChange={(e) => updatePerformanceConfig('maxConcurrentConnections', parseInt(e.target.value))}
                      min="1" 
                      max="50"
                      title="Maximum concurrent connections"
                    />
                  </div>
                </div>
              </div>

              <div className="config-actions">
                <button className="export-config-btn" onClick={handleConfigExport}>
                  Export Configuration
                </button>
                <button className="import-config-btn" onClick={handleConfigImport}>
                  Import Configuration
                </button>
                <button className="reset-config-btn" onClick={handleConfigReset}>
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

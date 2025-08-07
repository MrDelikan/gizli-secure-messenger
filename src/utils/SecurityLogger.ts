/**
 * Real Security Event Logger for Gizli
 * Captures and manages actual security events from the application
 */

export interface RealSecurityEvent {
  id: string;
  timestamp: number;
  type: 'connection' | 'encryption' | 'authentication' | 'error' | 'warning' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  metadata?: Record<string, string | number | boolean>;
}

export class SecurityLogger {
  private events: RealSecurityEvent[] = [];
  private listeners: Set<(event: RealSecurityEvent) => void> = new Set();
  private filters: Set<string> = new Set(['low', 'medium', 'high', 'critical']);
  private maxEvents: number = 1000;

  constructor() {
    this.logEvent('info', 'Security logger initialized', 'low', 'SecurityLogger');
  }

  // Main logging method
  logEvent(
    type: RealSecurityEvent['type'],
    message: string,
    severity: RealSecurityEvent['severity'],
    source: string,
    metadata?: Record<string, string | number | boolean>
  ): string {
    const event: RealSecurityEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type,
      message,
      severity,
      source,
      metadata
    };

    this.events.unshift(event); // Add to beginning for newest first
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Notify listeners if severity passes filter
    if (this.filters.has(severity)) {
      this.notifyListeners(event);
    }

    // Auto-escalate critical events
    if (severity === 'critical') {
      this.handleCriticalEvent(event);
    }

    return event.id;
  }

  // Specialized logging methods
  logConnection(peerId: string, action: 'connected' | 'disconnected' | 'failed') {
    const messages = {
      connected: `Peer connection established: ${this.truncateId(peerId)}`,
      disconnected: `Peer disconnected: ${this.truncateId(peerId)}`,
      failed: `Connection attempt failed: ${this.truncateId(peerId)}`
    };

    const severities = {
      connected: 'low' as const,
      disconnected: 'low' as const,
      failed: 'medium' as const
    };

    return this.logEvent(
      'connection',
      messages[action],
      severities[action],
      'NetworkManager',
      { peerId, action }
    );
  }

  logEncryption(operation: string, success: boolean, details?: string) {
    const message = success 
      ? `${operation} completed successfully${details ? `: ${details}` : ''}`
      : `${operation} failed${details ? `: ${details}` : ''}`;

    return this.logEvent(
      'encryption',
      message,
      success ? 'low' : 'high',
      'CryptoManager',
      { operation, success, details: details || 'No details' }
    );
  }

  logAuthentication(peerId: string, result: 'success' | 'failure', method?: string) {
    const message = result === 'success'
      ? `Peer authentication successful: ${this.truncateId(peerId)}${method ? ` (${method})` : ''}`
      : `Peer authentication failed: ${this.truncateId(peerId)}${method ? ` (${method})` : ''}`;

    return this.logEvent(
      'authentication',
      message,
      result === 'success' ? 'medium' : 'high',
      'AuthManager',
      { peerId, result, method: method || 'default' }
    );
  }

  logError(error: Error, context: string, severity: 'medium' | 'high' | 'critical' = 'high') {
    return this.logEvent(
      'error',
      `${context}: ${error.message}`,
      severity,
      'ErrorHandler',
      { 
        error: error.name,
        stack: error.stack || 'No stack trace',
        context
      }
    );
  }

  logWarning(message: string, source: string, metadata?: Record<string, string | number | boolean>) {
    return this.logEvent('warning', message, 'medium', source, metadata);
  }

  // Event retrieval and filtering
  getEvents(filter?: {
    type?: RealSecurityEvent['type'];
    severity?: RealSecurityEvent['severity'];
    source?: string;
    since?: number;
    limit?: number;
  }): RealSecurityEvent[] {
    let filteredEvents = [...this.events];

    if (filter) {
      if (filter.type) {
        filteredEvents = filteredEvents.filter(e => e.type === filter.type);
      }
      if (filter.severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === filter.severity);
      }
      if (filter.source) {
        filteredEvents = filteredEvents.filter(e => e.source === filter.source);
      }
      if (filter.since !== undefined) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filter.since!);
      }
      if (filter.limit) {
        filteredEvents = filteredEvents.slice(0, filter.limit);
      }
    }

    return filteredEvents;
  }

  getEventById(id: string): RealSecurityEvent | undefined {
    return this.events.find(e => e.id === id);
  }

  // Statistics
  getEventStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
    recentActivity: number; // events in last hour
  } {
    const oneHourAgo = Date.now() - 3600000;
    
    const stats = {
      total: this.events.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      recentActivity: 0
    };

    this.events.forEach(event => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
      
      // Count by source
      stats.bySource[event.source] = (stats.bySource[event.source] || 0) + 1;
      
      // Count recent activity
      if (event.timestamp > oneHourAgo) {
        stats.recentActivity++;
      }
    });

    return stats;
  }

  // Event listeners
  onEvent(callback: (event: RealSecurityEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Filtering controls
  setSeverityFilter(severities: RealSecurityEvent['severity'][]): void {
    this.filters.clear();
    severities.forEach(s => this.filters.add(s));
  }

  // Event management
  clearEvents(): void {
    const clearedCount = this.events.length;
    this.events = [];
    this.logEvent('info', `Cleared ${clearedCount} security events`, 'low', 'SecurityLogger');
  }

  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2);
    } else {
      // CSV format
      const headers = ['timestamp', 'id', 'type', 'severity', 'source', 'message'];
      const rows = this.events.map(e => [
        new Date(e.timestamp).toISOString(),
        e.id,
        e.type,
        e.severity,
        e.source,
        `"${e.message.replace(/"/g, '""')}"`
      ]);
      
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
  }

  // Private methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private truncateId(id: string): string {
    return id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-8)}` : id;
  }

  private notifyListeners(event: RealSecurityEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in security event listener:', error);
      }
    });
  }

  private handleCriticalEvent(event: RealSecurityEvent): void {
    // Critical events could trigger additional actions
    console.error('CRITICAL SECURITY EVENT:', event);
    
    // Could implement:
    // - Emergency notifications
    // - Automatic security measures
    // - Alert external monitoring systems
  }
}

// Global instance
export const securityLogger = new SecurityLogger();

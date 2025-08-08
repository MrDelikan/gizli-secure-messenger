import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isOwn: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  currentPeer: string | null;
  onSendMessage: (message: string) => void;
  onConnectToPeer?: (peerKey: string) => void;
  onGenerateNewKeys?: () => Promise<string | null>;
  publicKey?: string;
  onVerifyPeer?: (peerKey: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentPeer,
  onSendMessage,
  onConnectToPeer,
  onGenerateNewKeys,
  publicKey,
  onVerifyPeer
}) => {
  const [messageText, setMessageText] = useState('');
  const [peerKeyInput, setPeerKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'ready' | 'connecting' | 'connected' | 'error'>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('📋 Share Public Key');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize status based on current state
    if (publicKey && !currentPeer) {
      setConnectionStatus('ready');
      setStatusMessage('Ready to connect');
    } else if (currentPeer) {
      setConnectionStatus('connected');
      setStatusMessage('Secure connection established');
    }
  }, [publicKey, currentPeer]);

  // Helper function to show copy success feedback
  const showCopyFeedback = (isNewKey: boolean = false) => {
    setShowCopySuccess(true);
    if (isNewKey) {
      setCopyButtonText('✅ New Key Copied!');
      setStatusMessage('🔑 New keys generated and copied to clipboard!');
    } else {
      setCopyButtonText('✅ Copied!');
      setStatusMessage('📋 Key copied to clipboard!');
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      setShowCopySuccess(false);
      setCopyButtonText('📋 Share Public Key');
      if (isNewKey) {
        setStatusMessage('Ready to connect with new keys');
      } else {
        setStatusMessage(currentPeer ? 'Secure connection established' : 'Ready to connect');
      }
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      return;
    }

    if (!currentPeer) {
      setLastError('No peer connected');
      setConnectionStatus('error');
      setStatusMessage('No peer connected');
      return;
    }

    try {
      console.log('Sending message:', messageText.substring(0, 20) + '...');
      await onSendMessage(messageText.trim());
      setMessageText('');
      setLastError(null);
      setConnectionStatus('connected');
      setStatusMessage('Message sent successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Send message failed:', error);
      setLastError(errorMessage);
      setConnectionStatus('error');
      
      if (errorMessage.includes('not connected') || errorMessage.includes('disconnected')) {
        setStatusMessage('Connection lost - please reconnect');
      } else if (errorMessage.includes('encryption')) {
        setStatusMessage('Encryption error - try reconnecting');
      } else {
        setStatusMessage('Failed to send message');
      }
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateKey = (key: string) => {
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  const handleConnect = async () => {
    if (!peerKeyInput.trim()) {
      setLastError('Please enter a peer public key');
      setConnectionStatus('error');
      setStatusMessage('Peer key required');
      return;
    }

    if (!onConnectToPeer) {
      setLastError('Connection function not available');
      setConnectionStatus('error');
      setStatusMessage('Connection function not available');
      return;
    }

    // Validate key format (basic check)
    const key = peerKeyInput.trim();
    if (key.length < 32) {
      setLastError('Invalid key format - key too short');
      setConnectionStatus('error');
      setStatusMessage('Invalid key format');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    setStatusMessage('Establishing secure connection...');
    setLastError(null);

    try {
      console.log('Attempting to connect to peer:', key.substring(0, 8) + '...');
      await onConnectToPeer(key);
      setPeerKeyInput('');
      setConnectionStatus('connected');
      setStatusMessage('Successfully connected');
      console.log('Connection successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('Connection failed:', error);
      setLastError(errorMessage);
      setConnectionStatus('error');
      
      // Set specific status messages based on error type
      if (errorMessage.includes('timeout')) {
        setStatusMessage('Connection timeout - peer may be offline');
      } else if (errorMessage.includes('refused') || errorMessage.includes('rejected')) {
        setStatusMessage('Connection refused - check peer key');
      } else if (errorMessage.includes('network')) {
        setStatusMessage('Network error - check internet connection');
      } else {
        setStatusMessage('Connection failed - please retry');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleShareKey = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey);
        showCopyFeedback(false);
        // Show a brief success message instead of a blocking alert
        const shortKey = `${publicKey.substring(0, 16)}...${publicKey.substring(-8)}`;
        console.log(`✅ Public key copied to clipboard: ${shortKey}`);
      } catch (error) {
        console.error('Failed to copy:', error);
        // Show error in status instead of popup
        setStatusMessage('❌ Failed to copy key - try manual copy');
        setConnectionStatus('error');
      }
    } else {
      setStatusMessage('⚠️ No public key available yet');
      setConnectionStatus('error');
    }
  };

  const handleGenerateKeys = async () => {
    if (!onGenerateNewKeys) {
      setLastError('Key generation not available');
      setStatusMessage('❌ Key generation not available');
      setConnectionStatus('error');
      return;
    }

    try {
      console.log('Generating new keys...');
      setLastError(null);
      setConnectionStatus('connecting');
      setStatusMessage('Generating new keys...');
      setIsGeneratingKeys(true);
      
      const newPublicKey = await onGenerateNewKeys();
      console.log('Keys generated successfully');
      
      // Auto-copy the new key to clipboard if generation was successful
      if (newPublicKey) {
        try {
          await navigator.clipboard.writeText(newPublicKey);
          showCopyFeedback(true);
          console.log(`✅ New key generated and copied: ${newPublicKey.substring(0, 16)}...`);
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          setStatusMessage('🔑 New keys generated (copy manually)');
        }
        setConnectionStatus('ready');
      } else {
        setConnectionStatus('ready');
        setStatusMessage('Key generation was cancelled or failed');
      }
      
      setIsGeneratingKeys(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Key generation failed';
      console.error('Key generation failed:', error);
      setLastError(errorMessage);
      setConnectionStatus('error');
      setStatusMessage('Key generation failed');
      setIsGeneratingKeys(false);
    }
  };

  if (!currentPeer) {
    return (
      <div className="chat-interface no-peer">
        <div className="welcome-container">
          {/* Hero Section */}
          <div className="welcome-hero">
            <div className="hero-icon">�</div>
            <h1>Welcome to Gizli</h1>
            <p className="hero-tagline">Military-grade end-to-end encrypted communication</p>
            <div className="security-badges">
              <span className="badge">🛡️ Post-Quantum</span>
              <span className="badge">🔒 Perfect Forward Secrecy</span>
              <span className="badge">👤 Anonymous</span>
            </div>
          </div>

          {/* Quick Start Options */}
          <div className="quick-start">
            <h3>🚀 Quick Start</h3>
            
            {/* Share Your Key Section */}
            <div className="start-section">
              <div className="section-header">
                <span className="section-icon">📤</span>
                <h4>Share Your Identity</h4>
                <p>Share this key with someone to start chatting</p>
              </div>
              <div className="key-sharing">
                {publicKey && (
                  <div className="public-key-display">
                    <code className="key-code">{publicKey}</code>
                    <button 
                      className={`copy-key-btn ${showCopySuccess ? 'copied' : ''}`} 
                      onClick={handleShareKey}
                      title="Copy to clipboard"
                    >
                      {showCopySuccess ? '✅' : '📋'}
                    </button>
                  </div>
                )}
                <div className="key-actions">
                  <button 
                    className={`action-btn share-key ${showCopySuccess ? 'copy-success' : ''}`} 
                    onClick={handleShareKey}
                  >
                    {copyButtonText}
                  </button>
                  <button 
                    className="action-btn generate-key" 
                    onClick={handleGenerateKeys}
                    disabled={isGeneratingKeys}
                    title="Generate new cryptographic identity"
                  >
                    {isGeneratingKeys ? '🔄 Generating...' : '🔄 New Identity'}
                  </button>
                </div>
              </div>
            </div>

            {/* Connect to Peer Section */}
            <div className="start-section">
              <div className="section-header">
                <span className="section-icon">🌐</span>
                <h4>Connect to Someone</h4>
                <p>Enter their public key to establish secure connection</p>
              </div>
              
              <div className="connection-form">
                {lastError && (
                  <div className="error-banner">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{lastError}</span>
                    <button className="error-close" onClick={() => setLastError(null)}>×</button>
                  </div>
                )}
                
                {statusMessage && !lastError && (
                  <div className={`status-banner ${connectionStatus}`}>
                    <span className="status-icon">
                      {connectionStatus === 'connecting' && '🔄'}
                      {connectionStatus === 'connected' && '✅'}
                      {connectionStatus === 'ready' && '🔑'}
                    </span>
                    <span className="status-text">{statusMessage}</span>
                  </div>
                )}
                
                <div className="input-with-button">
                  <input 
                    type="text" 
                    value={peerKeyInput}
                    onChange={(e) => {
                      setPeerKeyInput(e.target.value);
                      if (lastError) {
                        setLastError(null);
                        setConnectionStatus('ready');
                        setStatusMessage('');
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && !isConnecting && handleConnect()}
                    placeholder="Paste peer's public key here..."
                    className="peer-input-modern"
                    disabled={isConnecting}
                  />
                  <button 
                    className={`connect-btn-modern ${isConnecting ? 'connecting' : ''} ${!peerKeyInput.trim() ? 'disabled' : ''}`}
                    onClick={handleConnect}
                    disabled={isConnecting || !peerKeyInput.trim()}
                  >
                    {isConnecting ? (
                      <>
                        <span className="spinner"></span>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <span className="connect-icon">🌐</span>
                        Connect
                      </>
                    )}
                  </button>
                </div>
                
                {connectionStatus === 'error' && peerKeyInput.trim() && (
                  <button 
                    className="retry-btn-modern"
                    onClick={handleConnect}
                    disabled={isConnecting}
                  >
                    <span className="retry-icon">🔄</span>
                    Try Again
                  </button>
                )}
              </div>
            </div>

            {/* Status Information */}
            {publicKey && (
              <div className="connection-status">
                <div className="status-row">
                  <span className="status-label">🔑 Your Identity:</span>
                  <span className="status-value">{publicKey.substring(0, 20)}...</span>
                </div>
                <div className="status-row">
                  <span className="status-label">📡 Network Status:</span>
                  <span className={`status-value status-${connectionStatus}`}>
                    {connectionStatus === 'ready' && '🟢 Ready to Connect'}
                    {connectionStatus === 'connecting' && '🟡 Establishing Connection...'}
                    {connectionStatus === 'connected' && '🟢 Secure Channel Active'}
                    {connectionStatus === 'error' && '🔴 Connection Failed'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Secure Chat with {truncateKey(currentPeer)}</h3>
        <div className="header-actions">
          <button
            className="verify-peer-btn"
            onClick={() => onVerifyPeer && onVerifyPeer(currentPeer || '')}
            title="Verify peer identity"
          >
            🔐 Verify
          </button>
          <div className="connection-status">
            <span className="status-indicator online"></span>
            Connected
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Secure channel established. Start chatting!</p>
            <small>All messages are end-to-end encrypted with Perfect Forward Secrecy</small>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isOwn ? 'own' : 'peer'}`}
            >
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-meta">
                  <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your secure message..."
            className="message-input"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
        <div className="security-notice">
          <small>
            Messages are encrypted with ChaCha20-Poly1305 • Perfect Forward Secrecy enabled
          </small>
        </div>
      </form>
    </div>
  );
};

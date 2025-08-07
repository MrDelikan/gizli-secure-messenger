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
  onGenerateNewKeys?: () => void;
  publicKey?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentPeer,
  onSendMessage,
  onConnectToPeer,
  onGenerateNewKeys,
  publicKey
}) => {
  const [messageText, setMessageText] = useState('');
  const [peerKeyInput, setPeerKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'ready' | 'connecting' | 'connected' | 'error'>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
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

  useEffect(() => {
    // Auto-copy new key to clipboard after generation
    if (isGeneratingKeys && publicKey) {
      const copyNewKey = async () => {
        try {
          await navigator.clipboard.writeText(publicKey);
          setConnectionStatus('ready');
          setStatusMessage('New keys generated and copied to clipboard!');
          alert(`🔑 New keys generated successfully!\n\nYour new public key has been copied to clipboard:\n\n${publicKey.substring(0, 32)}...\n\n✅ Ready to share with peers!`);
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          setConnectionStatus('ready');
          setStatusMessage('New keys generated successfully');
          alert(`🔑 New keys generated successfully!\n\nYour new public key:\n\n${publicKey}\n\n(Automatic clipboard copy failed - please copy manually)`);
        } finally {
          setIsGeneratingKeys(false);
        }
      };
      copyNewKey();
    }
  }, [publicKey, isGeneratingKeys]);

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
      const message = `Your Public Key:\n\n${publicKey}\n\nShare this key with others to establish secure connections.\n\nCopy this key and send it via any secure channel.`;
      
      try {
        await navigator.clipboard.writeText(publicKey);
        alert(message + '\n\n✅ Key copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
        alert(message);
      }
    } else {
      alert('No public key available. Please wait for key generation to complete.');
    }
  };

  const handleGenerateKeys = async () => {
    if (!onGenerateNewKeys) {
      setLastError('Key generation not available');
      alert('Key generation function not available');
      return;
    }

    try {
      console.log('Generating new keys...');
      setLastError(null);
      setConnectionStatus('connecting');
      setStatusMessage('Generating new keys...');
      setIsGeneratingKeys(true);
      
      await onGenerateNewKeys();
      console.log('Keys generated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Key generation failed';
      console.error('Key generation failed:', error);
      setLastError(errorMessage);
      setConnectionStatus('error');
      setStatusMessage('Key generation failed');
      setIsGeneratingKeys(false);
      alert(`❌ Key generation failed: ${errorMessage}`);
    }
  };

  if (!currentPeer) {
    return (
      <div className="chat-interface no-peer">
        <div className="login-container">
          <div className="login-welcome">
            <h2>🔒 Welcome to Gizli</h2>
            <p>Secure End-to-End Encrypted Communication</p>
          </div>          
          <div className="login-form">
            <div className="input-group">
              <label htmlFor="peer-id">Connect to Peer:</label>
              {lastError && (
                <div className="error-message">
                  ⚠️ {lastError}
                </div>
              )}
              
              {/* Status Display */}
              {statusMessage && (
                <div className={`status-message ${connectionStatus}`}>
                  {connectionStatus === 'connecting' && '🔄 '}
                  {connectionStatus === 'connected' && '✅ '}
                  {connectionStatus === 'error' && '❌ '}
                  {connectionStatus === 'ready' && '🔑 '}
                  {statusMessage}
                </div>
              )}
              <input 
                type="text" 
                id="peer-id"
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
                placeholder="Enter peer's public key..."
                className="peer-input"
                disabled={isConnecting}
              />
              <button 
                className={`connect-btn ${isConnecting ? 'connecting' : ''}`}
                onClick={handleConnect}
                disabled={isConnecting || !peerKeyInput.trim()}
              >
                {isConnecting ? '🔄 Connecting...' : '🌐 Connect'}
              </button>
              
              {/* Retry button for failed connections */}
              {connectionStatus === 'error' && peerKeyInput.trim() && (
                <button 
                  className="retry-btn"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  🔄 Retry Connection
                </button>
              )}
            </div>
            
            <div className="divider">
              <span>or</span>
            </div>
            
            <div className="quick-actions">
              <button 
                className="action-btn generate-key" 
                onClick={handleGenerateKeys}
                disabled={isGeneratingKeys}
              >
                {isGeneratingKeys ? '🔄 Generating Keys...' : '🔑 Generate New Keys'}
              </button>
              <button className="action-btn share-key" onClick={handleShareKey}>
                📋 Share Public Key
              </button>
            </div>
            
            {/* Connection Status Debug Info */}
            {publicKey && (
              <div className="debug-info">
                <div>🔑 Your Key: {publicKey.substring(0, 16)}...</div>
                <div>📡 Status: {connectionStatus === 'ready' ? 'Ready to connect' : 
                                connectionStatus === 'connecting' ? 'Connecting...' :
                                connectionStatus === 'connected' ? 'Connected' :
                                'Connection error'}</div>
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

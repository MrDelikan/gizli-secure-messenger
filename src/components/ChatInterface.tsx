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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      return;
    }

    if (!currentPeer) {
      setLastError('No peer connected');
      alert('No peer connected. Please connect to a peer first.');
      return;
    }

    try {
      console.log('Sending message:', messageText.substring(0, 20) + '...');
      await onSendMessage(messageText.trim());
      setMessageText('');
      setLastError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Send message failed:', error);
      setLastError(errorMessage);
      
      if (errorMessage.includes('not connected') || errorMessage.includes('disconnected')) {
        alert('Connection lost. Please reconnect to the peer.');
      } else if (errorMessage.includes('encryption')) {
        alert('Encryption error. Please try reconnecting.');
      } else {
        alert(`Failed to send message: ${errorMessage}`);
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
      alert('Please enter a peer public key');
      return;
    }

    if (!onConnectToPeer) {
      setLastError('Connection function not available');
      alert('Connection function not available');
      return;
    }

    // Validate key format (basic check)
    const key = peerKeyInput.trim();
    if (key.length < 32) {
      setLastError('Invalid key format - key too short');
      alert('Invalid key format. Please check the public key and try again.');
      return;
    }

    setIsConnecting(true);
    setLastError(null);

    try {
      console.log('Attempting to connect to peer:', key.substring(0, 8) + '...');
      await onConnectToPeer(key);
      setPeerKeyInput('');
      console.log('Connection successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('Connection failed:', error);
      setLastError(errorMessage);
      
      // Show user-friendly error messages
      if (errorMessage.includes('timeout')) {
        alert('Connection timeout. The peer might be offline or unreachable.');
      } else if (errorMessage.includes('refused') || errorMessage.includes('rejected')) {
        alert('Connection refused. Please check the peer key and try again.');
      } else if (errorMessage.includes('network')) {
        alert('Network error. Please check your internet connection.');
      } else {
        alert(`Connection failed: ${errorMessage}\n\nPlease check:\n• The peer key is correct\n• The peer is online\n• Your internet connection`);
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
      await onGenerateNewKeys();
      console.log('Keys generated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Key generation failed';
      console.error('Key generation failed:', error);
      setLastError(errorMessage);
      alert(`Key generation failed: ${errorMessage}`);
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
              <input 
                type="text" 
                id="peer-id"
                value={peerKeyInput}
                onChange={(e) => {
                  setPeerKeyInput(e.target.value);
                  if (lastError) setLastError(null); // Clear error when user types
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
            </div>
            
            <div className="divider">
              <span>or</span>
            </div>
            
            <div className="quick-actions">
              <button className="action-btn generate-key" onClick={handleGenerateKeys}>
                🔑 Generate New Keys
              </button>
              <button className="action-btn share-key" onClick={handleShareKey}>
                📋 Share Public Key
              </button>
            </div>
            
            {/* Connection Status Debug Info */}
            {publicKey && (
              <div className="debug-info">
                <div>🔑 Your Key: {publicKey.substring(0, 16)}...</div>
                <div>📡 Status: Ready to connect</div>
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

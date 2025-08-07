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
  publicKey?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentPeer,
  onSendMessage,
  onConnectToPeer,
  publicKey
}) => {
  const [messageText, setMessageText] = useState('');
  const [peerKeyInput, setPeerKeyInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && currentPeer) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateKey = (key: string) => {
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  const handleConnect = () => {
    if (peerKeyInput.trim() && onConnectToPeer) {
      onConnectToPeer(peerKeyInput.trim());
      setPeerKeyInput('');
    }
  };

  const handleShareKey = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey);
        alert('Public key copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
        alert(`Your public key: ${publicKey}`);
      }
    }
  };

  const handleGenerateKeys = () => {
    alert('New key generation will restart the application. Continue?');
    // This would trigger key regeneration in the parent component
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
              <input 
                type="text" 
                id="peer-id"
                value={peerKeyInput}
                onChange={(e) => setPeerKeyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                placeholder="Enter peer's public key..."
                className="peer-input"
              />
              <button className="connect-btn" onClick={handleConnect}>
                🌐 Connect
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

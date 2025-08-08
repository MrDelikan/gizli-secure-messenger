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
  onVerifyPeer
}) => {
  const [messageText, setMessageText] = useState('');
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
      return;
    }

    try {
      console.log('Sending message:', messageText.substring(0, 20) + '...');
      await onSendMessage(messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateKey = (key: string) => {
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  if (!currentPeer) {
    return (
      <div className="chat-interface no-peer">
        <div className="gizli-welcome">
          <div className="gizli-loading-container">
            <img src="/src/assets/gizli-logo.jpg" alt="Gizli Logo" className="gizli-main-logo" />
            <h1 className="gizli-title">Gizli</h1>
            <h2 className="gizli-subtitle">Secure Communication</h2>
            <p className="gizli-description">Setting up cryptographic systems and P2P network</p>
            
            <div className="gizli-status">
              <div className="status-indicator-ready">
                <span className="status-dot-ready"></span>
                <span>Ready for secure communication</span>
              </div>
            </div>

            <div className="gizli-action">
              <p className="action-text">
                Go to <strong>Peers</strong> to share your identity or connect to someone
              </p>
            </div>

            <div className="gizli-features">
              <div className="feature-item">
                <span className="feature-icon">🔐</span>
                <span>End-to-End Encrypted</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <span>Peer-to-Peer</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <span>Military-Grade Security</span>
              </div>
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

import React, { useState } from 'react';
import './SecurityStatus.css';

interface SecurityStatusProps {
  isConnected: boolean;
  publicKey: string;
  connectedPeers: number;
  onEmergencyPanic: () => void;
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({
  isConnected,
  publicKey,
  connectedPeers,
  onEmergencyPanic
}) => {
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  const truncateKey = (key: string) => {
    return `${key.slice(0, 16)}...${key.slice(-16)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Public key copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Public key copied to clipboard!');
    }
  };

  const handlePanicConfirm = () => {
    setShowPanicConfirm(false);
    onEmergencyPanic();
  };

  return (
    <div className="security-status">
      <div className="status-indicators">
        <div className={`status-item ${isConnected ? 'active' : 'inactive'}`}>
          <span className="icon">🌐</span>
          <span className="label">Network</span>
          <span className="value">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        <div className="status-item active">
          <span className="icon">🔐</span>
          <span className="label">Encryption</span>
          <span className="value">Active</span>
        </div>

        <div className="status-item active">
          <span className="icon">⚡</span>
          <span className="label">Forward Secrecy</span>
          <span className="value">Enabled</span>
        </div>

        <div className="status-item">
          <span className="icon">👥</span>
          <span className="label">Peers</span>
          <span className="value">{connectedPeers}</span>
        </div>
      </div>

      <div className="identity-section">
        <div className="public-key-display">
          <label>Your Public Key:</label>
          <div className="key-container">
            <span className="key-text">
              {showPublicKey ? publicKey : truncateKey(publicKey)}
            </span>
            <div className="key-actions">
              <button
                onClick={() => setShowPublicKey(!showPublicKey)}
                className="toggle-key-button"
                title={showPublicKey ? 'Hide key' : 'Show full key'}
              >
                {showPublicKey ? '👁️‍🗨️' : '👁️'}
              </button>
              <button
                onClick={() => copyToClipboard(publicKey)}
                className="copy-button"
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="security-actions">
        <div className="panic-section">
          {!showPanicConfirm ? (
            <button
              onClick={() => setShowPanicConfirm(true)}
              className="panic-button"
              title="Emergency clear all data"
            >
              🚨 Emergency Panic
            </button>
          ) : (
            <div className="panic-confirm">
              <p>⚠️ This will clear ALL cryptographic material and close connections!</p>
              <div className="confirm-buttons">
                <button
                  onClick={handlePanicConfirm}
                  className="confirm-panic"
                >
                  YES, CLEAR ALL
                </button>
                <button
                  onClick={() => setShowPanicConfirm(false)}
                  className="cancel-panic"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="security-features">
        <h4>🛡️ Active Security Features</h4>
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">🔐</span>
            <span className="feature-name">E2E Encryption</span>
            <span className="feature-status active">✅</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span className="feature-name">Perfect Forward Secrecy</span>
            <span className="feature-status active">✅</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔄</span>
            <span className="feature-name">Double Ratchet</span>
            <span className="feature-status active">✅</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🌐</span>
            <span className="feature-name">P2P Direct</span>
            <span className="feature-status active">✅</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <span className="feature-name">Metadata Protection</span>
            <span className="feature-status active">✅</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🗑️</span>
            <span className="feature-name">Secure Deletion</span>
            <span className="feature-status active">✅</span>
          </div>
        </div>
      </div>
    </div>
  );
};

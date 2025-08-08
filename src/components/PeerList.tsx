import React, { useState } from 'react';
import './PeerList.css';

interface PeerListProps {
  connectedPeers: string[];
  currentPeer: string | null;
  onSelectPeer: (peer: string) => void;
  onConnectToPeer: (peer: string) => void;
  onDisconnectPeer: (peer: string) => void;
  publicKey?: string;
  onGenerateNewKeys?: () => Promise<string | null>;
}

export const PeerList: React.FC<PeerListProps> = ({
  connectedPeers,
  currentPeer,
  onSelectPeer,
  onConnectToPeer,
  onDisconnectPeer,
  publicKey,
  onGenerateNewKeys
}) => {
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [peerKeyInput, setPeerKeyInput] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peerKeyInput.trim()) {
      try {
        await onConnectToPeer(peerKeyInput.trim());
        setPeerKeyInput('');
        setShowConnectForm(false);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };

  const truncateKey = (key: string) => {
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleGenerateNewKeys = async () => {
    if (!onGenerateNewKeys) return;
    
    setIsGeneratingKeys(true);
    try {
      await onGenerateNewKeys();
    } catch (error) {
      console.error('Failed to generate keys:', error);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  return (
    <div className="peer-list">
      <div className="peer-list-controls">
        <button
          className="connect-button"
          onClick={() => setShowConnectForm(!showConnectForm)}
        >
          ➕ Connect to New Peer
        </button>
      </div>

      {/* Share Your Identity Section */}
      {publicKey && (
        <div className="identity-section">
          <h3>📤 Share Your Identity</h3>
          <p>Share this public key with others to allow them to connect to you:</p>
          <div className="key-display">
            <div className="key-text">
              {publicKey}
            </div>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(publicKey)}
              title="Copy to clipboard"
            >
              {showCopySuccess ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <div className="key-actions">
            <button
              className="generate-keys-button"
              onClick={handleGenerateNewKeys}
              disabled={isGeneratingKeys}
            >
              {isGeneratingKeys ? '🔄 Generating...' : '🔑 Generate New Keys'}
            </button>
          </div>
          <div className="identity-info">
            <small>
              🔒 Your identity is cryptographically secure. 
              Only share this key with people you trust.
            </small>
          </div>
        </div>
      )}

      {showConnectForm && (
        <div className="connect-form">
          <form onSubmit={handleConnect}>
            <input
              type="text"
              value={peerKeyInput}
              onChange={(e) => setPeerKeyInput(e.target.value)}
              placeholder="Enter peer's public key..."
              className="peer-key-input"
            />
            <div className="form-buttons">
              <button type="submit" disabled={!peerKeyInput.trim()}>
                Connect
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConnectForm(false);
                  setPeerKeyInput('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="peers-container">
        {connectedPeers.length === 0 ? (
          <div className="no-peers">
            <p>No peers connected</p>
            <small>Connect to start secure chatting</small>
          </div>
        ) : (
          connectedPeers.map((peer) => (
            <div
              key={peer}
              className={`peer-item ${currentPeer === peer ? 'active' : ''}`}
              onClick={() => onSelectPeer(peer)}
            >
              <div className="peer-info">
                <div className="peer-key">
                  🔑 {truncateKey(peer)}
                </div>
                <div className="peer-status">
                  <span className="status-indicator online">🟢 Online</span>
                  <span className="encrypted-indicator">🔐 E2E</span>
                </div>
              </div>
              <button
                className="disconnect-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDisconnectPeer(peer);
                }}
                title="Disconnect peer"
              >
                ❌
              </button>
            </div>
          ))
        )}
      </div>

      <div className="peer-list-footer">
        <div className="security-info">
          <h4>🔒 Security Features</h4>
          <ul>
            <li>🔐 X25519 Key Exchange</li>
            <li>⚡ Perfect Forward Secrecy</li>
            <li>🛡️ ChaCha20-Poly1305 Encryption</li>
            <li>🌐 P2P Direct Connection</li>
            <li>🔍 Metadata Protection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

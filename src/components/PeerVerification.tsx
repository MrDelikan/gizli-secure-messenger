import React, { useState } from 'react';
import './PeerVerification.css';

interface PeerVerificationProps {
  peerKey: string;
  isVisible: boolean;
  onClose: () => void;
}

export const PeerVerification: React.FC<PeerVerificationProps> = ({
  peerKey,
  isVisible,
  onClose
}) => {
  const [verificationMethod, setVerificationMethod] = useState<'fingerprint' | 'voice' | 'meeting'>('fingerprint');

  if (!isVisible) return null;

  // Generate visual fingerprint (simplified for demo)
  const generateFingerprint = (key: string) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const patterns = ['●', '■', '▲', '◆', '★', '▼', '◯'];
    
    const fingerprint = [];
    for (let i = 0; i < 16; i++) {
      const colorIndex = (key.charCodeAt(i % key.length) + i) % colors.length;
      const patternIndex = (key.charCodeAt((i + 5) % key.length) + i) % patterns.length;
      fingerprint.push({
        color: colors[colorIndex],
        pattern: patterns[patternIndex],
        id: i
      });
    }
    return fingerprint;
  };

  const fingerprint = generateFingerprint(peerKey);
  const fingerprintText = peerKey.split('').reduce((acc, char, i) => {
    if (i % 4 === 0 && i > 0) acc += ' ';
    return acc + char.toUpperCase();
  }, '').slice(0, 47); // First 12 groups of 4

  const copyFingerprint = async () => {
    try {
      await navigator.clipboard.writeText(fingerprintText);
      // Could add notification here
    } catch (error) {
      console.error('Failed to copy fingerprint:', error);
    }
  };

  return (
    <div className="peer-verification-overlay">
      <div className="peer-verification-modal">
        <div className="verification-header">
          <h2>🔐 Verify Peer Identity</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="verification-warning">
          <p>⚠️ <strong>Important:</strong> Always verify peer identities to prevent man-in-the-middle attacks.</p>
        </div>

        <div className="verification-methods">
          <div className="method-tabs">
            <button 
              className={`method-tab ${verificationMethod === 'fingerprint' ? 'active' : ''}`}
              onClick={() => setVerificationMethod('fingerprint')}
            >
              🔍 Fingerprint
            </button>
            <button 
              className={`method-tab ${verificationMethod === 'voice' ? 'active' : ''}`}
              onClick={() => setVerificationMethod('voice')}
            >
              🗣️ Voice Call
            </button>
            <button 
              className={`method-tab ${verificationMethod === 'meeting' ? 'active' : ''}`}
              onClick={() => setVerificationMethod('meeting')}
            >
              🤝 In Person
            </button>
          </div>

          <div className="method-content">
            {verificationMethod === 'fingerprint' && (
              <div className="fingerprint-verification">
                <h3>Visual Fingerprint</h3>
                <div className="visual-fingerprint">
                  {fingerprint.map((item, index) => (
                    <span 
                      key={item.id}
                      className={`fingerprint-symbol fingerprint-symbol-color-${index % 7}`}
                    >
                      {item.pattern}
                    </span>
                  ))}
                </div>
                
                <h3>Text Fingerprint</h3>
                <div className="text-fingerprint">
                  <code>{fingerprintText}</code>
                  <button className="copy-btn" onClick={copyFingerprint} title="Copy fingerprint">
                    📋
                  </button>
                </div>
                
                <div className="verification-instructions">
                  <h4>How to verify:</h4>
                  <ol>
                    <li>Compare this fingerprint with your peer through a trusted channel</li>
                    <li>Both visual and text fingerprints must match exactly</li>
                    <li>If they don't match, <strong>DO NOT</strong> trust this connection</li>
                  </ol>
                </div>
              </div>
            )}

            {verificationMethod === 'voice' && (
              <div className="voice-verification">
                <h3>Voice Verification</h3>
                <div className="verification-instructions">
                  <ol>
                    <li>Call your peer using a trusted phone number</li>
                    <li>Read the fingerprint aloud: <code>{fingerprintText.slice(0, 23)}...</code></li>
                    <li>Have them confirm it matches their display</li>
                    <li>Only proceed if both fingerprints match exactly</li>
                  </ol>
                </div>
              </div>
            )}

            {verificationMethod === 'meeting' && (
              <div className="meeting-verification">
                <h3>In-Person Verification</h3>
                <div className="verification-instructions">
                  <ol>
                    <li>Meet your peer in person</li>
                    <li>Compare the visual fingerprints on both devices</li>
                    <li>This is the most secure verification method</li>
                    <li>Ensure no one else can see your screens during verification</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="verification-actions">
          <button className="verify-btn trusted" onClick={onClose}>
            ✅ Verified & Trusted
          </button>
          <button className="verify-btn untrusted" onClick={onClose}>
            ❌ Not Verified
          </button>
        </div>

        <div className="security-note">
          <p><small>🔒 Gizli uses cryptographic fingerprints to ensure secure communication. Never skip verification with unknown peers.</small></p>
        </div>
      </div>
    </div>
  );
};

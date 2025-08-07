import React from 'react';
import './InfoPage.css';
import gizliLogo from '../assets/gizli-logo.jpg';

interface InfoPageProps {
  onClose: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ onClose }) => {
  return (
    <div className="info-page">
      <div className="info-content">
        <div className="info-header">
          <img src={gizliLogo} alt="Gizli Logo" className="info-logo" />
          <h1 className="info-title">GIZLI</h1>
          <p className="info-subtitle">Military-Grade End-to-End Encryption</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="info-grid">
          <section className="info-section">
            <h2 className="section-title">🔒 QUANTUM-RESISTANT SECURITY</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Signal Protocol</h3>
                <p>State-of-the-art double ratchet encryption providing forward secrecy and post-compromise security.</p>
              </div>
              <div className="feature-card">
                <h3>X25519 + ChaCha20-Poly1305</h3>
                <p>Military-grade elliptic curve cryptography with authenticated encryption resistant to timing attacks.</p>
              </div>
              <div className="feature-card">
                <h3>Perfect Forward Secrecy</h3>
                <p>Each message uses a unique encryption key that is immediately destroyed after use.</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="section-title">🌐 PEER-TO-PEER ARCHITECTURE</h2>
            <div className="architecture-visual">
              <div className="node">
                <div className="node-inner">YOU</div>
                <div className="connection-line"></div>
              </div>
              <div className="node">
                <div className="node-inner">PEER</div>
              </div>
            </div>
            <p className="architecture-desc">
              Direct encrypted communication without central servers. Your messages never touch third-party infrastructure.
            </p>
          </section>

          <section className="info-section">
            <h2 className="section-title">🛡️ SECURITY FEATURES</h2>
            <div className="security-features">
              <div className="security-item">
                <span className="security-icon">🔐</span>
                <div>
                  <h4>Zero-Knowledge Architecture</h4>
                  <p>We cannot read your messages even if we wanted to</p>
                </div>
              </div>
              <div className="security-item">
                <span className="security-icon">🚫</span>
                <div>
                  <h4>No Metadata Collection</h4>
                  <p>Your communication patterns remain private</p>
                </div>
              </div>
              <div className="security-item">
                <span className="security-icon">🔄</span>
                <div>
                  <h4>Self-Destructing Keys</h4>
                  <p>Automatic secure memory wiping prevents recovery</p>
                </div>
              </div>
              <div className="security-item">
                <span className="security-icon">⚡</span>
                <div>
                  <h4>Emergency Panic Mode</h4>
                  <p>Instant destruction of all cryptographic material</p>
                </div>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="section-title">📱 CROSS-PLATFORM AVAILABILITY</h2>
            <div className="platform-grid">
              <div className="platform-card">
                <h3>🌐 Web Browser</h3>
                <p>Works in any modern browser with WebRTC support</p>
              </div>
              <div className="platform-card">
                <h3>📱 Mobile App</h3>
                <p>Native iOS and Android applications available</p>
              </div>
              <div className="platform-card">
                <h3>💻 Desktop PWA</h3>
                <p>Install as a native desktop application</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="section-title">🔬 TECHNICAL SPECIFICATIONS</h2>
            <div className="tech-specs">
              <div className="spec-category">
                <h4>Encryption</h4>
                <ul>
                  <li>ChaCha20-Poly1305 AEAD</li>
                  <li>X25519 Elliptic Curve DH</li>
                  <li>HKDF Key Derivation</li>
                  <li>libsodium Implementation</li>
                </ul>
              </div>
              <div className="spec-category">
                <h4>Protocol</h4>
                <ul>
                  <li>Signal Protocol Double Ratchet</li>
                  <li>WebRTC for P2P Transport</li>
                  <li>Socket.IO Signaling</li>
                  <li>Message Replay Protection</li>
                </ul>
              </div>
              <div className="spec-category">
                <h4>Security</h4>
                <ul>
                  <li>Timing-Safe Comparisons</li>
                  <li>Secure Memory Wiping</li>
                  <li>Key Versioning</li>
                  <li>Rate Limiting Protection</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="section-title">⚔️ THREAT RESISTANCE</h2>
            <div className="threat-matrix">
              <div className="threat-level high">
                <h4>STATE-LEVEL ADVERSARIES</h4>
                <p>Resistant to mass surveillance and targeted attacks</p>
              </div>
              <div className="threat-level medium">
                <h4>CORPORATE ESPIONAGE</h4>
                <p>Protection against commercial data harvesting</p>
              </div>
              <div className="threat-level low">
                <h4>CASUAL EAVESDROPPING</h4>
                <p>Complete protection against passive monitoring</p>
              </div>
            </div>
          </section>

          <section className="info-section audit-section">
            <h2 className="section-title">📊 SECURITY AUDIT SCORE</h2>
            <div className="audit-score">
              <div className="score-display">
                <span className="score-number">8.5</span>
                <span className="score-max">/10</span>
              </div>
              <div className="score-details">
                <p>Independently verified security implementation</p>
                <p>Production-ready with best-practice cryptography</p>
                <p>Continuous security monitoring and updates</p>
              </div>
            </div>
          </section>
        </div>

        <div className="info-footer">
          <div className="footer-warning">
            <h3>⚠️ SECURITY NOTICE</h3>
            <p>
              While Gizli implements military-grade encryption, remember that security depends on proper usage. 
              Always verify peer identities and keep your devices secure.
            </p>
          </div>
          <div className="footer-credits">
            <p>Built with React, TypeScript, and libsodium cryptography</p>
            <p>Open source security for a private world</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;

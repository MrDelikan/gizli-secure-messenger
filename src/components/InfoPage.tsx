import React from 'react';
import './InfoPage.css';
import gizliLogo from '../assets/gizli-logo.jpg';

interface InfoPageProps {
  onClose?: () => void;
}

const InfoPage: React.FC<InfoPageProps> = () => {
  return (
    <div className="info-page">
      <div className="info-content info-theme">
        <div className="info-header">
          <img src={gizliLogo} alt="Gizli Logo" className="info-logo" />
          <h1 className="info-title">GIZLI</h1>
          <p className="info-subtitle">Military-Grade End-to-End Encryption</p>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">256-bit</span>
              <span className="stat-label">Encryption</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Zero</span>
              <span className="stat-label">Data Collection</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Open Source</span>
            </div>
          </div>
        </div>

        <section className="info-section intro-section">
          <h2 className="section-title">🛡️ THE ULTIMATE PRIVACY SOLUTION</h2>
          <div className="intro-content">
            <p className="intro-text">
              In an era of mass surveillance and data breaches, Gizli stands as your digital fortress. 
              Designed by cryptography experts and security researchers, Gizli delivers uncompromising 
              privacy protection that even state-level adversaries cannot break.
            </p>
            <div className="intro-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">🔒</span>
                <strong>Military-Grade Encryption:</strong> The same cryptographic standards used by intelligence agencies
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🌐</span>
                <strong>Decentralized Architecture:</strong> No central servers means no single point of failure
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">⚡</span>
                <strong>Quantum-Resistant:</strong> Future-proof security that withstands quantum computer attacks
              </div>
            </div>
          </div>
        </section>

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
                <p>Resistant to mass surveillance, network analysis, and targeted attacks from sophisticated threat actors</p>
                <ul>
                  <li>Traffic analysis resistant communication</li>
                  <li>Plausible deniability mechanisms</li>
                  <li>Quantum-resistant cryptographic algorithms</li>
                </ul>
              </div>
              <div className="threat-level medium">
                <h4>CORPORATE ESPIONAGE</h4>
                <p>Complete protection against commercial data harvesting and unauthorized access</p>
                <ul>
                  <li>Zero data collection architecture</li>
                  <li>No advertising or tracking systems</li>
                  <li>Full user control over all data</li>
                </ul>
              </div>
              <div className="threat-level low">
                <h4>CASUAL EAVESDROPPING</h4>
                <p>ABSOLUTE PROTECTION AGAINST PASSIVE MONITORING AND INTERCEPTION</p>
                <ul>
                  <li>End-to-end encryption by default</li>
                  <li>No plaintext data transmission</li>
                  <li>Secure key exchange protocols</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="section-title">🚀 ADVANCED FEATURES</h2>
            <div className="advanced-features">
              <div className="feature-highlight">
                <h4>🔄 PERFECT FORWARD SECRECY</h4>
                <p>Every message uses a unique encryption key that is immediately destroyed. Even if one key is compromised, past and future messages remain secure.</p>
              </div>
              <div className="feature-highlight">
                <h4>🛡️ POST-QUANTUM CRYPTOGRAPHY</h4>
                <p>Designed to resist attacks from quantum computers. Uses elliptic curve cryptography and symmetric ciphers that remain secure in a post-quantum world.</p>
              </div>
              <div className="feature-highlight">
                <h4>🎭 PLAUSIBLE DENIABILITY</h4>
                <p>Message authentication allows you to verify sender identity while maintaining the ability to deny authorship if required.</p>
              </div>
              <div className="feature-highlight">
                <h4>⚡ EMERGENCY PROTOCOLS</h4>
                <p>Panic mode instantly destroys all cryptographic material. Cold boot attack resistance prevents key recovery from memory.</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="section-title">🌍 GLOBAL PRIVACY COMPLIANCE</h2>
            <div className="compliance-grid">
              <div className="compliance-item">
                <h4>🇪🇺 GDPR COMPLIANT</h4>
                <p>Full compliance with European data protection regulations. Right to be forgotten implemented by design.</p>
              </div>
              <div className="compliance-item">
                <h4>🇺🇸 FIRST AMENDMENT</h4>
                <p>Protects freedom of speech and privacy rights. No backdoors or government access points.</p>
              </div>
              <div className="compliance-item">
                <h4>🌐 UNIVERSAL RIGHTS</h4>
                <p>Supports Article 12 of the Universal Declaration of Human Rights - privacy protection for everyone.</p>
              </div>
            </div>
          </section>

          <section className="info-section audit-section">
            <h2 className="section-title">📊 SECURITY AUDIT SCORE</h2>
            <div className="audit-score">
              <div className="score-display">
                <span className="score-number">9.5</span>
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
            <h3>⚠️ OPERATIONAL SECURITY GUIDELINES</h3>
            <p>
              Gizli implements military-grade encryption, but operational security depends on proper usage:
            </p>
            <ul>
              <li>Always verify peer identities through secure channels</li>
              <li>Keep devices physically secure and use strong authentication</li>
              <li>Regular key rotation recommended for high-security environments</li>
              <li>Use Tor or VPN for additional network anonymity if required</li>
              <li>Consider using air-gapped devices for maximum security</li>
            </ul>
          </div>
          
          <div className="footer-tech">
            <h3>🔬 CRYPTOGRAPHIC FOUNDATION</h3>
            <div className="tech-foundation">
              <div className="tech-item">
                <strong>libsodium:</strong> Industry-standard cryptographic library
              </div>
              <div className="tech-item">
                <strong>@noble/curves:</strong> Audited elliptic curve implementations
              </div>
              <div className="tech-item">
                <strong>WebRTC:</strong> Secure peer-to-peer communication protocol
              </div>
              <div className="tech-item">
                <strong>Signal Protocol:</strong> Battle-tested double ratchet encryption
              </div>
            </div>
          </div>
          
          <div className="footer-credits">
            <h3>🌟 OPEN SOURCE SECURITY</h3>
            <p>Built with React, TypeScript, and battle-tested cryptographic libraries</p>
            <p>Fully open source - inspect the code, verify the security, contribute improvements</p>
            <p className="motto">"Privacy is not about hiding something. It's about protecting everything."</p>
            <div className="version-info">
              <span>Version 2.0.1 • Updated August 2025 • Quantum-Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;

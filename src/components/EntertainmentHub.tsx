import React, { useState } from 'react';
import { CryptoBot } from './CryptoBot';
import { CyberGame } from './CyberGame';
import './EntertainmentHub.css';

interface EntertainmentHubProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const EntertainmentHub: React.FC<EntertainmentHubProps> = () => {
  const [activeFeature, setActiveFeature] = useState<'menu' | 'bot' | 'games'>('menu');

  const handleFeatureSelect = (feature: 'bot' | 'games') => {
    setActiveFeature(feature);
  };

  const handleBackToMenu = () => {
    setActiveFeature('menu');
  };

  // Render sub-components when selected
  if (activeFeature === 'bot') {
    return <CryptoBot isActive={true} onBack={handleBackToMenu} />;
  }

  if (activeFeature === 'games') {
    return <CyberGame isActive={true} onBack={handleBackToMenu} />;
  }

  // Main menu
  return (
    <div className="entertainment-hub">
      <div className="entertainment-intro">
        <h3>Welcome to the Cyber Zone</h3>
        <p>Take a break from secure communications and explore our entertainment features.</p>
      </div>

      <div className="feature-grid">
        <div 
          className="feature-card bot-card"
          onClick={() => handleFeatureSelect('bot')}
        >
          <div className="feature-icon">🤖</div>
          <div className="feature-content">
            <h4>CYPHER AI Bot</h4>
            <p>Chat with our cryptography expert AI companion. Learn about security, generate passwords, and test your knowledge.</p>
            <div className="feature-stats">
              <span className="stat">AI Assistant</span>
              <span className="stat">Educational</span>
              <span className="stat">Interactive</span>
            </div>
          </div>
          <div className="feature-arrow">→</div>
        </div>

        <div 
          className="feature-card games-card"
          onClick={() => handleFeatureSelect('games')}
        >
          <div className="feature-icon">🎯</div>
          <div className="feature-content">
            <h4>Cyber Games</h4>
            <p>Test your cybersecurity skills with mini-games including Matrix Hunter, Cipher Breaker, and Phish Detector.</p>
            <div className="feature-stats">
              <span className="stat">3 Games</span>
              <span className="stat">Skill-Based</span>
              <span className="stat">Competitive</span>
            </div>
          </div>
          <div className="feature-arrow">→</div>
        </div>
      </div>

      <div className="hub-footer">
        <div className="security-note">
          <span className="warning-icon">⚠️</span>
          <p>Entertainment features are isolated from your secure communications for maximum privacy.</p>
        </div>
      </div>
    </div>
  );
};

export default EntertainmentHub;

import React, { useState } from 'react';
import './CryptoBot.css';

interface CryptoBotProps {
  isActive: boolean;
  onBack?: () => void;
}

export const CryptoBot: React.FC<CryptoBotProps> = ({ isActive, onBack }) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: number }>>([
    { text: "Hello! I'm CryptoBot, your cryptography assistant. Ask me anything about encryption, security, or privacy!", isUser: false, timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, isUser: true, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question about cryptography! Let me explain...",
        "For maximum security, I recommend using ChaCha20-Poly1305 encryption.",
        "Remember: never reuse nonces and always use authenticated encryption!",
        "Perfect forward secrecy is crucial for long-term message security.",
        "Would you like me to generate a secure password for you?",
        "Post-quantum cryptography is becoming essential as quantum computers advance."
      ];
      
      const botResponse = {
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isActive) return null;

  return (
    <div className="crypto-bot">
      <div className="bot-header">
        {onBack && (
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
        )}
        <span className="bot-icon">🤖</span>
        <h3>CryptoBot AI Assistant</h3>
        <span className="status-indicator">🟢 Online</span>
      </div>
      
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
              <div className="message-content">
                <span className="message-text">{msg.text}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing">
              <div className="message-content">
                <span className="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="input-area">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about cryptography, security, or privacy..."
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            ⚡ Send
          </button>
        </div>
      </div>
    </div>
  );
};

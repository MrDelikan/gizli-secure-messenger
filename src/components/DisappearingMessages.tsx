import React, { useState, useEffect } from 'react';
import './DisappearingMessages.css';

interface DisappearingMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isOwn: boolean;
  disappearAfter: number; // seconds
  createdAt: number;
}

interface DisappearingMessagesProps {
  messages: DisappearingMessage[];
  onMessageExpired: (messageId: string) => void;
  disappearingTimer: number;
  onSetDisappearingTimer: (seconds: number) => void;
  isEnabled: boolean;
  onToggleDisappearing: () => void;
}

const DisappearingMessages: React.FC<DisappearingMessagesProps> = ({
  messages,
  onMessageExpired,
  disappearingTimer,
  onSetDisappearingTimer,
  isEnabled,
  onToggleDisappearing
}) => {
  const [showTimerOptions, setShowTimerOptions] = useState(false);

  const timerOptions = [
    { label: '5 seconds', value: 5 },
    { label: '30 seconds', value: 30 },
    { label: '1 minute', value: 60 },
    { label: '5 minutes', value: 300 },
    { label: '30 minutes', value: 1800 },
    { label: '1 hour', value: 3600 },
    { label: '6 hours', value: 21600 },
    { label: '1 day', value: 86400 },
    { label: '1 week', value: 604800 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      messages.forEach(message => {
        const timeElapsed = (now - message.createdAt) / 1000;
        if (timeElapsed >= message.disappearAfter) {
          onMessageExpired(message.id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [messages, onMessageExpired]);

  const getTimeRemaining = (message: DisappearingMessage): number => {
    const now = Date.now();
    const timeElapsed = (now - message.createdAt) / 1000;
    return Math.max(0, message.disappearAfter - timeElapsed);
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.ceil(seconds / 60)}m`;
    } else if (seconds < 86400) {
      return `${Math.ceil(seconds / 3600)}h`;
    } else {
      return `${Math.ceil(seconds / 86400)}d`;
    }
  };

  const getProgressPercentage = (message: DisappearingMessage): number => {
    const timeRemaining = getTimeRemaining(message);
    return ((message.disappearAfter - timeRemaining) / message.disappearAfter) * 100;
  };

  const formatTimerLabel = (seconds: number): string => {
    const option = timerOptions.find(opt => opt.value === seconds);
    return option ? option.label : `${seconds}s`;
  };

  return (
    <div className="disappearing-messages-container">
      <div className="disappearing-controls">
        <div className="disappearing-toggle">
          <button 
            className={`toggle-btn ${isEnabled ? 'enabled' : 'disabled'}`}
            onClick={onToggleDisappearing}
          >
            <span className="toggle-icon">
              {isEnabled ? '⏱️' : '🔒'}
            </span>
            <span className="toggle-text">
              {isEnabled ? 'Disappearing Messages ON' : 'Disappearing Messages OFF'}
            </span>
          </button>
        </div>

        {isEnabled && (
          <div className="timer-controls">
            <div className="current-timer">
              <span>Timer: {formatTimerLabel(disappearingTimer)}</span>
            </div>
            <button 
              className="timer-settings-btn"
              onClick={() => setShowTimerOptions(!showTimerOptions)}
            >
              ⚙️
            </button>
          </div>
        )}
      </div>

      {showTimerOptions && (
        <div className="timer-options">
          <h4>Set Disappearing Timer</h4>
          <div className="timer-grid">
            {timerOptions.map((option) => (
              <button
                key={option.value}
                className={`timer-option ${disappearingTimer === option.value ? 'active' : ''}`}
                onClick={() => {
                  onSetDisappearingTimer(option.value);
                  setShowTimerOptions(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="messages-with-timers">
        {messages.map((message) => {
          const timeRemaining = getTimeRemaining(message);
          const progressPercentage = getProgressPercentage(message);
          
          if (timeRemaining <= 0) {
            return null; // Message has expired
          }

          return (
            <div 
              key={message.id} 
              className={`disappearing-message ${message.isOwn ? 'own' : 'other'}`}
              style={{ 
                opacity: Math.max(0.3, timeRemaining / message.disappearAfter),
                transform: timeRemaining < 5 ? `scale(${0.8 + (timeRemaining / 25)})` : 'scale(1)'
              }}
            >
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-meta">
                  <span className="sender">{message.isOwn ? 'You' : message.sender}</span>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="disappearing-timer">
                <div className="timer-display">
                  <span className="timer-icon">⏱️</span>
                  <span className="time-remaining">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                
                <div className="progress-ring">
                  <div 
                    className="progress-fill"
                    style={{
                      transform: `rotate(${(progressPercentage / 100) * 360}deg)`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isEnabled && (
        <div className="security-warning">
          <span className="warning-icon">⚠️</span>
          <span>
            Messages will disappear after {formatTimerLabel(disappearingTimer)}. 
            This timer applies to new messages only.
          </span>
        </div>
      )}
    </div>
  );
};

export default DisappearingMessages;

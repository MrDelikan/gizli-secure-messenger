import React, { useState, useEffect, useRef } from 'react';
import './VoiceCall.css';

interface VoiceCallProps {
  isActive: boolean;
  isIncoming?: boolean;
  callerName?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onHangup?: () => void;
  onToggleMute?: () => void;
  onToggleSpeaker?: () => void;
  isMuted?: boolean;
  isSpeaker?: boolean;
  duration?: number;
}

const VoiceCall: React.FC<VoiceCallProps> = ({
  isActive,
  isIncoming = false,
  callerName = 'Unknown Caller',
  onAccept,
  onDecline,
  onHangup,
  onToggleMute,
  onToggleSpeaker,
  isMuted = false,
  isSpeaker = false,
  duration = 0
}) => {
  const [callTimer, setCallTimer] = useState(duration);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isActive && !isIncoming) {
      const timer = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, isIncoming]);

  useEffect(() => {
    // Audio visualization
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create waveform visualization
      const bars = 20;
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * (isMuted ? 5 : 50) + 5;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        
        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(1, '#ff0064');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y, barWidth - 4, height);
      }
      
      if (isActive) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [isActive, isMuted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="voice-call-overlay">
      <div className="voice-call-container">
        <div className="call-header">
          <h2 className="caller-name">{callerName}</h2>
          <p className="call-status">
            {isIncoming ? 'Incoming secure call...' : `Secure call • ${formatTime(callTimer)}`}
          </p>
        </div>

        <div className="call-visualization">
          <canvas 
            ref={canvasRef}
            width={300}
            height={100}
            className="waveform-canvas"
          />
          <div className="encryption-indicator">
            <span className="encryption-icon">🔒</span>
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        <div className="call-controls">
          {isIncoming ? (
            <div className="incoming-controls">
              <button 
                className="call-btn decline-btn"
                onClick={onDecline}
              >
                <span>📞❌</span>
                <span>Decline</span>
              </button>
              <button 
                className="call-btn accept-btn"
                onClick={onAccept}
              >
                <span>📞✅</span>
                <span>Accept</span>
              </button>
            </div>
          ) : (
            <div className="active-controls">
              <button 
                className={`call-btn mute-btn ${isMuted ? 'active' : ''}`}
                onClick={onToggleMute}
              >
                <span>{isMuted ? '🔇' : '🎤'}</span>
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              
              <button 
                className={`call-btn speaker-btn ${isSpeaker ? 'active' : ''}`}
                onClick={onToggleSpeaker}
              >
                <span>{isSpeaker ? '🔊' : '🔈'}</span>
                <span>Speaker</span>
              </button>
              
              <button 
                className="call-btn hangup-btn"
                onClick={onHangup}
              >
                <span>📞❌</span>
                <span>Hang Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;

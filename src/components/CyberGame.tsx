import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './CyberGame.css';

interface CyberGameProps {
  isActive: boolean;
  onBack?: () => void;
}

interface GameState {
  score: number;
  level: number;
  timeLeft: number;
  isPlaying: boolean;
}

export const CyberGame: React.FC<CyberGameProps> = ({ isActive, onBack }) => {
  const [selectedGame, setSelectedGame] = useState<'matrix' | 'cipher' | 'phish' | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    timeLeft: 60,
    isPlaying: false
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (gameState.timeLeft === 0) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
    return () => clearTimeout(timer);
  }, [gameState.isPlaying, gameState.timeLeft]);

  const startGame = (game: 'matrix' | 'cipher' | 'phish') => {
    setSelectedGame(game);
    setGameState({
      score: 0,
      level: 1,
      timeLeft: 60,
      isPlaying: true
    });
  };

  const addScore = (points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      level: Math.floor((prev.score + points) / 100) + 1
    }));
  };

  if (!isActive) return null;

  return (
    <div className="cyber-game">
      <div className="game-header">
        {onBack && (
          <button className="back-button" onClick={onBack}>
            ← Back to Hub
          </button>
        )}
        <span className="game-icon">🎮</span>
        <h3>CyberSec Training Games</h3>
        <div className="game-stats">
          <span>Score: {gameState.score}</span>
          <span>Level: {gameState.level}</span>
          <span>Time: {gameState.timeLeft}s</span>
        </div>
      </div>

      {!selectedGame ? (
        <div className="game-selection">
          <div className="game-option" onClick={() => startGame('matrix')}>
            <h4>🔍 Matrix Hunter</h4>
            <p>Find hidden patterns in the digital matrix</p>
          </div>
          <div className="game-option" onClick={() => startGame('cipher')}>
            <h4>🔓 Cipher Breaker</h4>
            <p>Decode encrypted messages and unlock secrets</p>
          </div>
          <div className="game-option" onClick={() => startGame('phish')}>
            <h4>🎣 Phish Detector</h4>
            <p>Identify and block malicious phishing attempts</p>
          </div>
        </div>
      ) : (
        <div className="game-area">
          <button 
            className="back-button" 
            onClick={() => setSelectedGame(null)}
          >
            ← Back to Games
          </button>
          
          {selectedGame === 'matrix' && (
            <MatrixHunterGame onScore={addScore} isPlaying={gameState.isPlaying} />
          )}
          {selectedGame === 'cipher' && (
            <CipherBreakerGame onScore={addScore} isPlaying={gameState.isPlaying} />
          )}
          {selectedGame === 'phish' && (
            <PhishDetectorGame onScore={addScore} isPlaying={gameState.isPlaying} />
          )}
        </div>
      )}
    </div>
  );
};

const MatrixHunterGame: React.FC<{ onScore: (points: number) => void; isPlaying: boolean }> = ({ onScore, isPlaying }) => {
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [target, setTarget] = useState('');

  useEffect(() => {
    generateMatrix();
  }, []);

  const generateMatrix = () => {
    const chars = '0123456789ABCDEF';
    const newMatrix = Array(8).fill(null).map(() =>
      Array(12).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)])
    );
    setMatrix(newMatrix);
    setTarget(chars[Math.floor(Math.random() * chars.length)]);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying) return;
    
    if (matrix[row][col] === target) {
      onScore(10);
      generateMatrix();
    } else {
      onScore(-5);
    }
  };

  return (
    <div className="matrix-game">
      <div className="game-instructions">
        <p>Find all instances of: <strong className="target">{target}</strong></p>
      </div>
      <div className="matrix-grid">
        {matrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="matrix-cell"
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CipherBreakerGame: React.FC<{ onScore: (points: number) => void; isPlaying: boolean }> = ({ onScore, isPlaying }) => {
  const [cipher, setCipher] = useState('');
  const [solution, setSolution] = useState('');
  const [userInput, setUserInput] = useState('');
  
  const phrases = useMemo(() => [
    'HELLO WORLD',
    'CRYPTO SECURE',
    'ENCRYPTION KEY',
    'DIGITAL SIGNATURE'
  ], []);

  const generateCipher = useCallback(() => {
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const shift = Math.floor(Math.random() * 25) + 1;
    const encoded = phrase.split('').map(char => {
      if (char === ' ') return ' ';
      const code = char.charCodeAt(0) - 65;
      const shifted = (code + shift) % 26;
      return String.fromCharCode(shifted + 65);
    }).join('');
    
    setCipher(encoded);
    setSolution(phrase);
    setUserInput('');
  }, [phrases]);

  useEffect(() => {
    generateCipher();
  }, [generateCipher]);

  const checkSolution = () => {
    if (!isPlaying) return;
    
    if (userInput.toUpperCase() === solution) {
      onScore(25);
      generateCipher();
    } else {
      onScore(-10);
    }
  };

  return (
    <div className="cipher-game">
      <div className="game-instructions">
        <p>Decode this Caesar cipher:</p>
      </div>
      <div className="cipher-display">{cipher}</div>
      <div className="cipher-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && checkSolution()}
          placeholder="Enter decoded message..."
        />
        <button onClick={checkSolution}>Decode</button>
      </div>
    </div>
  );
};

const PhishDetectorGame: React.FC<{ onScore: (points: number) => void; isPlaying: boolean }> = ({ onScore, isPlaying }) => {
  const [email, setEmail] = useState({ sender: '', subject: '', isPhish: false });
  
  const emails = useMemo(() => [
    { sender: 'security@bank.com', subject: 'Account Security Update', isPhish: false },
    { sender: 'no-reply@paypaI.com', subject: 'Urgent: Verify Your Account', isPhish: true },
    { sender: 'admin@company.com', subject: 'Monthly Newsletter', isPhish: false },
    { sender: 'support@amaz0n.com', subject: 'Suspicious Activity Detected', isPhish: true }
  ], []);

  const generateEmail = useCallback(() => {
    const randomEmail = emails[Math.floor(Math.random() * emails.length)];
    setEmail(randomEmail);
  }, [emails]);

  useEffect(() => {
    generateEmail();
  }, [generateEmail]);

  const handleClassification = (isPhishGuess: boolean) => {
    if (!isPlaying) return;
    
    if (isPhishGuess === email.isPhish) {
      onScore(15);
    } else {
      onScore(-10);
    }
    generateEmail();
  };

  return (
    <div className="phish-game">
      <div className="game-instructions">
        <p>Classify this email as legitimate or phishing:</p>
      </div>
      <div className="email-display">
        <div className="email-header">
          <strong>From:</strong> {email.sender}
        </div>
        <div className="email-header">
          <strong>Subject:</strong> {email.subject}
        </div>
      </div>
      <div className="classification-buttons">
        <button 
          className="safe-button"
          onClick={() => handleClassification(false)}
        >
          ✅ Legitimate
        </button>
        <button 
          className="phish-button"
          onClick={() => handleClassification(true)}
        >
          ⚠️ Phishing
        </button>
      </div>
    </div>
  );
};

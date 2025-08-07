import { useState, useEffect } from 'react';
import { SecureP2PNetwork } from './network/SecureP2PNetwork';
import { ChatInterface } from './components/ChatInterface';
import InfoPage from './components/InfoPage';
import EntertainmentHub from './components/EntertainmentHub';
import { DeveloperConsole } from './components/DeveloperConsole';
import gizliLogo from './assets/gizli-logo.jpg';
import './App.css';
import './MobileApp.css';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isOwn: boolean;
}

function App() {
  const [network] = useState(() => new SecureP2PNetwork());
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPeer, setCurrentPeer] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'dev' | 'fun' | 'info'>('chat');
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    // Detect if running as mobile app (Capacitor)
    const checkMobileApp = () => {
      setIsMobileApp(
        // @ts-expect-error - Capacitor may not be available in all environments
        window.Capacitor && window.Capacitor.isNativePlatform()
      );
    };
    
    checkMobileApp();

    const initializeNetwork = async () => {
      try {
        await network.initialize();
        setPublicKey(network.getPublicKeyHex());
        setIsInitialized(true);

        // Register message handler
        network.onMessage('main', (message: string, fromPeer: string) => {
          const newMessage: Message = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            text: message,
            sender: fromPeer,
            timestamp: Date.now(),
            isOwn: false
          };
          setMessages(prev => [...prev, newMessage]);
        });
        
      } catch (error) {
        console.error('Failed to initialize network:', error);
      }
    };

    initializeNetwork();

    // Cleanup on unmount
    return () => {
      network.shutdown();
    };
  }, [network]);

  const handleSendMessage = (text: string) => {
    if (!currentPeer) {
      alert('Please select a peer to chat with');
      return;
    }

    try {
      network.sendMessage(currentPeer, text);
      
      const newMessage: Message = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text,
        sender: publicKey,
        timestamp: Date.now(),
        isOwn: true
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  const handleConnectToPeer = async (peerPublicKey: string) => {
    try {
      await network.connectToPeer(peerPublicKey);
      setCurrentPeer(peerPublicKey);
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      alert('Failed to connect to peer');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatInterface
            messages={messages.filter(m => 
              currentPeer && (m.sender === currentPeer || m.isOwn)
            )}
            currentPeer={currentPeer}
            onSendMessage={handleSendMessage}
            onConnectToPeer={handleConnectToPeer}
            publicKey={publicKey}
          />
        );
      case 'dev':
        return (
          <DeveloperConsole 
            isOpen={true}
            onClose={() => setActiveTab('chat')} 
            network={network}
          />
        );
      case 'fun':
        return (
          <EntertainmentHub 
            isOpen={true}
            onClose={() => setActiveTab('chat')} 
          />
        );
      case 'info':
        return <InfoPage onClose={() => setActiveTab('chat')} />;
      default:
        return (
          <ChatInterface
            messages={messages.filter(m => 
              currentPeer && (m.sender === currentPeer || m.isOwn)
            )}
            currentPeer={currentPeer}
            onSendMessage={handleSendMessage}
            onConnectToPeer={handleConnectToPeer}
            publicKey={publicKey}
          />
        );
    }
  };

  if (!isInitialized) {
    return (
      <div className={`app loading ${isMobileApp ? 'mobile-app' : ''}`}>
        <div className="loading-container">
          <img src={gizliLogo} alt="Gizli Logo" className="loading-logo" />
          <h2>Initializing Secure Chat...</h2>
          <p>Setting up cryptographic systems and P2P network</p>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isMobileApp ? 'mobile-app' : ''}`}>
      {/* Mobile App Header */}
      <header className="app-header mobile-header">
        <div className="header-main">
          <div className="logo-container">
            <img src={gizliLogo} alt="Gizli Logo" className="app-logo" />
            <div className="brand-text">
              <h1>Gizli</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="app-main mobile-main">
        {renderTabContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <button 
          className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          aria-label="Chat"
        >
          <span className="nav-icon">💬</span>
          <span className="nav-label">Chat</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'dev' ? 'active' : ''}`}
          onClick={() => setActiveTab('dev')}
          aria-label="Developer Console"
        >
          <span className="nav-icon">⚡</span>
          <span className="nav-label">Dev</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'fun' ? 'active' : ''}`}
          onClick={() => setActiveTab('fun')}
          aria-label="Entertainment Hub"
        >
          <span className="nav-icon">🎮</span>
          <span className="nav-label">Fun</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
          aria-label="Info"
        >
          <span className="nav-icon">ℹ️</span>
          <span className="nav-label">Info</span>
        </button>
      </nav>

      {/* Mobile App Status Indicator */}
      {isMobileApp && (
        <div className="mobile-status">
          <div className="status-badge secure">🔒 E2E Encrypted</div>
        </div>
      )}
    </div>
  );
}

export default App;

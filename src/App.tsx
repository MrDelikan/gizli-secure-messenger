import { useState, useEffect } from 'react';
import { SecureP2PNetwork } from './network/SecureP2PNetwork';
import { ChatInterface } from './components/ChatInterface';
import { PeerList } from './components/PeerList';
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
  const [network] = useState(() => new SecureP2PNetwork()); // No signaling server - use direct mode
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPeer, setCurrentPeer] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'peers' | 'dev' | 'fun' | 'info'>('chat');
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    console.log('App mounting, checking mobile app status...');
    
    // Detect if running as mobile app (Capacitor) or mobile browser
    const checkMobileApp = () => {
      const isCapacitor = typeof window !== 'undefined' && 
        window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
      
      // Only treat as mobile if screen is small AND user agent indicates mobile
      const isMobileBrowser = window.innerWidth <= 768 && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const shouldUseMobileLayout = isCapacitor || isMobileBrowser;
      
      console.log('Mobile app detection:', { 
        hasCapacitor: !!window.Capacitor, 
        isNative: isCapacitor,
        isMobileBrowser,
        shouldUseMobileLayout,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth
      });
      
      setIsMobileApp(shouldUseMobileLayout);
    };
    
    checkMobileApp();

    const initializeNetwork = async () => {
      try {
        await network.initialize();
        const newPublicKey = network.getPublicKeyHex();
        setPublicKey(newPublicKey);
        setIsInitialized(true);

        // Show welcome message with public key
        setTimeout(() => {
          alert(`🔒 Gizli Secure Messenger Initialized!\n\nYour Public Key:\n${newPublicKey}\n\nShare this key with others to establish secure connections.\n\nTip: Use the "📋 Share Public Key" button to copy it again.`);
        }, 1000);

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

  const handleGenerateNewKeys = async (): Promise<string | null> => {
    if (confirm('Generating new keys will disconnect all current connections and create a new identity. Continue?')) {
      try {
        setIsInitialized(false);
        setMessages([]);
        setCurrentPeer(null);
        
        // Reinitialize network with new keys
        await network.initialize();
        const newPublicKey = network.getPublicKeyHex();
        setPublicKey(newPublicKey);
        setIsInitialized(true);
        
        return newPublicKey;
      } catch (error) {
        console.error('Failed to generate new keys:', error);
        alert('Failed to generate new keys');
        return null;
      }
    }
    return null;
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
            onGenerateNewKeys={handleGenerateNewKeys}
            publicKey={publicKey}
          />
        );
      case 'peers':
        return (
          <PeerList
            connectedPeers={Array.from(network.getConnectedPeers ? network.getConnectedPeers() : [])}
            currentPeer={currentPeer}
            onSelectPeer={setCurrentPeer}
            onConnectToPeer={handleConnectToPeer}
            onDisconnectPeer={(peer) => {
              // TODO: Implement disconnect functionality
              console.log('Disconnect peer:', peer);
            }}
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
    <div className={`app ${isMobileApp ? 'mobile-app' : 'desktop-app'}`}>
      {/* Header - Mobile and Desktop */}
      <header className={`app-header ${isMobileApp ? 'mobile-header' : 'desktop-header'}`}>
        <div className="header-main">
          <div className="logo-container">
            <img src={gizliLogo} alt="Gizli Logo" className="app-logo" />
            <div className="brand-text">
              <h1>Gizli</h1>
              <p className="tagline">Secure End-to-End Encrypted Chat</p>
            </div>
          </div>
          
          {/* Desktop Navigation - Show by default unless mobile */}
          {!isMobileApp && (
            <nav className="desktop-nav">
              <button 
                className={`desktop-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                💬 Chat
              </button>
              <button 
                className={`desktop-nav-btn ${activeTab === 'peers' ? 'active' : ''}`}
                onClick={() => setActiveTab('peers')}
              >
                👥 Peers
              </button>
              <button 
                className={`desktop-nav-btn ${activeTab === 'dev' ? 'active' : ''}`}
                onClick={() => setActiveTab('dev')}
              >
                ⚡ Developer
              </button>
              <button 
                className={`desktop-nav-btn ${activeTab === 'fun' ? 'active' : ''}`}
                onClick={() => setActiveTab('fun')}
              >
                🎮 Entertainment
              </button>
              <button 
                className={`desktop-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                ℹ️ Info
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Desktop Layout - Sectioned View */}
      {!isMobileApp ? (
        <div className="desktop-sections-container">
          {/* Chat Section */}
          <section className={`app-section chat-section ${activeTab === 'chat' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>💬 Secure Chat</h2>
              <p>End-to-end encrypted messaging</p>
            </div>
            <div className="section-content">
              <ChatInterface
                messages={messages.filter(m => 
                  currentPeer && (m.sender === currentPeer || m.isOwn)
                )}
                currentPeer={currentPeer}
                onSendMessage={handleSendMessage}
                onConnectToPeer={handleConnectToPeer}
                onGenerateNewKeys={handleGenerateNewKeys}
                publicKey={publicKey}
              />
            </div>
          </section>

          {/* Peers Section */}
          <section className={`app-section peers-section ${activeTab === 'peers' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>👥 Peer Network</h2>
              <p>Manage your secure connections</p>
            </div>
            <div className="section-content">
              <PeerList
                connectedPeers={Array.from(network.getConnectedPeers ? network.getConnectedPeers() : [])}
                currentPeer={currentPeer}
                onSelectPeer={setCurrentPeer}
                onConnectToPeer={handleConnectToPeer}
                onDisconnectPeer={(peer) => {
                  console.log('Disconnect peer:', peer);
                }}
              />
            </div>
          </section>

          {/* Developer Section */}
          <section className={`app-section dev-section ${activeTab === 'dev' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>⚡ Developer Console</h2>
              <p>Network diagnostics and cryptographic tools</p>
            </div>
            <div className="section-content">
              <DeveloperConsole 
                isOpen={true}
                onClose={() => setActiveTab('chat')} 
                network={network}
              />
            </div>
          </section>

          {/* Entertainment Section */}
          <section className={`app-section fun-section ${activeTab === 'fun' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>🎮 Entertainment Hub</h2>
              <p>Games and interactive features</p>
            </div>
            <div className="section-content">
              <EntertainmentHub 
                isOpen={true}
                onClose={() => setActiveTab('chat')} 
              />
            </div>
          </section>

          {/* Info Section */}
          <section className={`app-section info-section ${activeTab === 'info' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>ℹ️ Information</h2>
              <p>About Gizli and security features</p>
            </div>
            <div className="section-content">
              <InfoPage onClose={() => setActiveTab('chat')} />
            </div>
          </section>
        </div>
      ) : (
        /* Mobile Layout - Single Tab Content */
        <main className="mobile-main">
          {renderTabContent()}
        </main>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobileApp && (
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            aria-label="Chat"
          >
            <span className="nav-icon">💬</span>
            <span className="nav-label">Chat</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'peers' ? 'active' : ''}`}
            onClick={() => setActiveTab('peers')}
            aria-label="Peers"
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Peers</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'dev' ? 'active' : ''}`}
            onClick={() => setActiveTab('dev')}
            aria-label="Developer Console"
          >
            <span className="nav-icon">⚡</span>
            <span className="nav-label">Dev</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'fun' ? 'active' : ''}`}
            onClick={() => setActiveTab('fun')}
            aria-label="Entertainment Hub"
          >
            <span className="nav-icon">🎮</span>
            <span className="nav-label">Fun</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            aria-label="Info"
          >
            <span className="nav-icon">ℹ️</span>
            <span className="nav-label">Info</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;

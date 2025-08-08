import { useState, useEffect } from 'react';
import { SecureP2PNetwork } from './network/SecureP2PNetwork';
import { ChatInterface } from './components/ChatInterface';
import { PeerList } from './components/PeerList';
import InfoPage from './components/InfoPage';
import EntertainmentHub from './components/EntertainmentHub';
import { DeveloperConsole } from './components/DeveloperConsole';
import { NotificationSystem } from './components/NotificationSystem';
import { PeerVerification } from './components/PeerVerification';
import { useNotifications } from './hooks/useNotifications';
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
  const [showPeerVerification, setShowPeerVerification] = useState(false);
  const [peerToVerify, setPeerToVerify] = useState<string>('');
  const { notifications, removeNotification, showSuccess, showError, showWarning } = useNotifications();

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

        // Auto-copy public key to clipboard without popup
        try {
          await navigator.clipboard.writeText(newPublicKey);
          console.log('🔒 Gizli initialized - Public key copied to clipboard');
        } catch {
          console.log('🔒 Gizli initialized - Key generation complete');
        }

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
      showWarning('No Peer Selected', 'Please select a peer to chat with first.');
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
      showError('Message Failed', 'Failed to send message. Please check your connection.');
    }
  };

  const handleConnectToPeer = async (peerPublicKey: string) => {
    try {
      await network.connectToPeer(peerPublicKey);
      setCurrentPeer(peerPublicKey);
      showSuccess('Connected', 'Successfully connected to peer!');
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      showError('Connection Failed', 'Failed to connect to peer. Please check the peer key and try again.');
    }
  };

  const handleGenerateNewKeys = async (): Promise<string | null> => {
    // For now, keep using confirm dialog for this critical action
    if (confirm('⚠️ SECURITY WARNING\n\nGenerating new keys will:\n• Disconnect all current connections\n• Create a completely new identity\n• Previous conversations cannot be recovered\n\nThis action cannot be undone. Continue?')) {
      try {
        setIsInitialized(false);
        setMessages([]);
        setCurrentPeer(null);
        
        // Reinitialize network with new keys
        await network.initialize();
        const newPublicKey = network.getPublicKeyHex();
        setPublicKey(newPublicKey);
        setIsInitialized(true);
        
        showSuccess('New Identity Created', 'Your cryptographic keys have been regenerated successfully.');
        return newPublicKey;
      } catch (error) {
        console.error('Failed to generate new keys:', error);
        showError('Key Generation Failed', 'Failed to generate new cryptographic keys. Please try again.');
        return null;
      }
    }
    return null;
  };

  const handleVerifyPeer = (peerKey: string) => {
    setPeerToVerify(peerKey);
    setShowPeerVerification(true);
  };

  const handleCloseVerification = () => {
    setShowPeerVerification(false);
    setPeerToVerify('');
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
            onVerifyPeer={handleVerifyPeer}
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
              try {
                network.disconnect(peer);
                // If the disconnected peer was the current peer, clear it
                if (currentPeer === peer) {
                  setCurrentPeer(null);
                }
                showSuccess('Peer Disconnected', 'Successfully disconnected from peer.');
                console.log('Disconnected from peer:', peer);
              } catch (error) {
                console.error('Failed to disconnect from peer:', error);
                showError('Disconnect Failed', 'Failed to disconnect from peer.');
              }
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
            onVerifyPeer={handleVerifyPeer}
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
      {/* Simple Header with Logo and Text */}
      <header className="app-header">
        <div className="header-main">
          <div className="logo-container">
            <img src={gizliLogo} alt="Gizli Logo" className="app-logo" />
            <h1>Gizli</h1>
          </div>
        </div>
      </header>

      {/* Desktop Layout - Single Active Section */}
      {!isMobileApp ? (
        <main className="desktop-main">
          {renderTabContent()}
        </main>
      ) : (
        /* Mobile Layout - Single Tab Content */
        <main className="mobile-main">
          {renderTabContent()}
        </main>
      )}

      {/* Bottom Navigation - Both Mobile and Desktop */}
      <nav className="bottom-nav">
        <button 
          className={`bottom-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={`bottom-nav-btn ${activeTab === 'peers' ? 'active' : ''}`}
          onClick={() => setActiveTab('peers')}
        >
          👥 Peers
        </button>
        <button 
          className={`bottom-nav-btn ${activeTab === 'dev' ? 'active' : ''}`}
          onClick={() => setActiveTab('dev')}
        >
          ⚡ Developer
        </button>
        <button 
          className={`bottom-nav-btn ${activeTab === 'fun' ? 'active' : ''}`}
          onClick={() => setActiveTab('fun')}
        >
          🎮 Entertainment
        </button>
        <button 
          className={`bottom-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          ℹ️ Info
        </button>
      </nav>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      {/* Peer Verification Modal */}
      <PeerVerification
        peerKey={peerToVerify}
        isVisible={showPeerVerification}
        onClose={handleCloseVerification}
      />
    </div>
  );
}

export default App;

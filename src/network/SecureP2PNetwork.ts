import SimplePeer from 'simple-peer';
import { io, Socket } from 'socket.io-client';
import { SecureCrypto, type KeyPair, type EncryptedMessage } from '../crypto/SecureCrypto';
import { NetworkAnalytics } from '../utils/NetworkAnalytics';
import { securityLogger } from '../utils/SecurityLogger';

export interface PeerConnection {
  id: string;
  publicKey: string;
  peer: SimplePeer.Instance;
  sessionId: string;
  isConnected: boolean;
}

export interface SecureMessage {
  type: 'encrypted' | 'dummy';
  data: EncryptedMessage;
  timestamp: number;
  messageId: string;
}

export interface WebRTCSignalData {
  type?: string;
  sdp?: string;
  candidate?: RTCIceCandidate;
  renegotiate?: boolean;
  transceiverRequest?: unknown;
}

export interface MetadataPayload {
  ephemeralPublicKey: Uint8Array;
  timestamp: number;
}

export class SecureP2PNetwork {
  private crypto: SecureCrypto;
  private socket: Socket;
  private identityKeyPair: KeyPair;
  private peers = new Map<string, PeerConnection>();
  private messageHandlers = new Map<string, (message: string, fromPeer: string) => void>();
  private networkAnalytics: NetworkAnalytics;
  private isInitialized = false;

  constructor(signalingServerUrl: string = 'http://localhost:3001') {
    this.crypto = SecureCrypto.getInstance();
    this.socket = io(signalingServerUrl, {
      transports: ['websocket', 'polling']
    });
    this.identityKeyPair = this.crypto.generateIdentityKeyPair();
    this.networkAnalytics = new NetworkAnalytics();
    this.setupSignaling();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Register with signaling server
    this.socket.emit('register-peer', {
      publicKey: this.getPublicKeyHex()
    });

    // Start dummy traffic generation for metadata protection
    this.startDummyTrafficGeneration();

    this.isInitialized = true;
  }

  private setupSignaling(): void {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    this.socket.on('peer-available', (data: { publicKey: string }) => {
      console.log('Peer available:', data.publicKey);
    });

    this.socket.on('webrtc-signal', async (data: {
      fromPublicKey: string;
      signal: SimplePeer.SignalData;
      encryptedMetadata?: string;
    }) => {
      await this.handleWebRTCSignal(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });
  }

  async connectToPeer(peerPublicKey: string): Promise<void> {
    if (this.peers.has(peerPublicKey)) {
      throw new Error('Already connected to this peer');
    }

    // Generate ephemeral key pair for this connection
    const ephemeralKeyPair = this.crypto.generateKeyPair();
    
    // Create WebRTC peer (initiator)
    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // In production, use private STUN/TURN servers
        ]
      }
    });

    const peerId = this.generatePeerId();
    
    // Initialize secure session
    const sessionId = this.crypto.initializeSession(
      new Uint8Array(32), // Will be set after key exchange
      ephemeralKeyPair
    );

    const peerConnection: PeerConnection = {
      id: peerId,
      publicKey: peerPublicKey,
      peer,
      sessionId,
      isConnected: false
    };

    this.peers.set(peerPublicKey, peerConnection);
    this.setupPeerHandlers(peerConnection);

    peer.on('signal', (signal: SimplePeer.SignalData) => {
      // Send WebRTC signaling through server
      this.socket.emit('webrtc-signal', {
        targetPublicKey: peerPublicKey,
        signal,
        encryptedMetadata: this.encryptMetadata({
          ephemeralPublicKey: ephemeralKeyPair.publicKey,
          timestamp: Date.now()
        })
      });
    });
  }

  private async handleWebRTCSignal(data: {
    fromPublicKey: string;
    signal: SimplePeer.SignalData;
    encryptedMetadata?: string;
  }): Promise<void> {
    let peerConnection = this.peers.get(data.fromPublicKey);

    if (!peerConnection) {
      // Create new peer connection (receiver)
      const ephemeralKeyPair = this.crypto.generateKeyPair();
      
      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      });

      const peerId = this.generatePeerId();
      const sessionId = this.crypto.initializeSession(
        new Uint8Array(32), // Will be set after key exchange
        ephemeralKeyPair
      );

      peerConnection = {
        id: peerId,
        publicKey: data.fromPublicKey,
        peer,
        sessionId,
        isConnected: false
      };

      this.peers.set(data.fromPublicKey, peerConnection);
      this.setupPeerHandlers(peerConnection);
    }

    peerConnection.peer.signal(data.signal);
  }

  private setupPeerHandlers(peerConnection: PeerConnection): void {
    const { peer, publicKey, sessionId } = peerConnection;

    peer.on('connect', () => {
      console.log(`Connected to peer: ${publicKey}`);
      peerConnection.isConnected = true;
      
      // Log security event
      securityLogger.logEvent('info', 'Peer connected via WebRTC', 'low', 'SecureP2PNetwork', {
        peerPublicKey: publicKey,
        connectionType: 'WebRTC'
      });
      
      // Track connection in analytics
      this.networkAnalytics.onPeerConnected(publicKey);
      
      // Perform initial key exchange
      this.performKeyExchange(peerConnection);
    });

    peer.on('data', (data: Buffer) => {
      try {
        // Track data received
        this.networkAnalytics.onMessageReceived(publicKey, data.length);
        
        const message: SecureMessage = JSON.parse(data.toString());
        this.handleSecureMessage(message, peerConnection);
      } catch (error) {
        console.error('Failed to parse message:', error);
        securityLogger.logEvent('error', 'Message parse error', 'medium', 'SecureP2PNetwork', {
          peerPublicKey: publicKey,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    peer.on('close', () => {
      console.log(`Disconnected from peer: ${publicKey}`);
      peerConnection.isConnected = false;
      
      // Log security event
      securityLogger.logEvent('info', 'Peer disconnected', 'low', 'SecureP2PNetwork', {
        peerPublicKey: publicKey
      });
      
      // Track disconnection in analytics
      this.networkAnalytics.onPeerDisconnected(publicKey);
      
      this.crypto.clearSession(sessionId);
    });

    peer.on('error', (error: Error) => {
      console.error(`Peer error (${publicKey}):`, error);
      
      // Log security event for connection errors
      securityLogger.logEvent('warning', 'Peer connection error', 'medium', 'SecureP2PNetwork', {
        peerPublicKey: publicKey,
        error: error.message
      });
    });
  }

  private async performKeyExchange(peerConnection: PeerConnection): Promise<void> {
    // In a real implementation, this would use a proper key exchange protocol
    // For now, we'll simulate it
    console.log(`Performing key exchange with ${peerConnection.publicKey}`);
  }

  private handleSecureMessage(message: SecureMessage, peerConnection: PeerConnection): void {
    if (message.type === 'dummy') {
      // Discard dummy traffic (metadata protection)
      return;
    }

    try {
      const decryptedMessage = this.crypto.decryptMessage(
        peerConnection.sessionId,
        message.data
      );

      // Log successful message decryption
      securityLogger.logEvent('info', 'Message decrypted successfully', 'low', 'SecureP2PNetwork', {
        peerPublicKey: peerConnection.publicKey,
        messageId: message.messageId
      });

      // Call registered message handlers
      for (const handler of this.messageHandlers.values()) {
        handler(decryptedMessage, peerConnection.publicKey);
      }
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      
      // Log decryption failure as security event
      securityLogger.logEvent('error', 'Message decryption failed', 'high', 'SecureP2PNetwork', {
        peerPublicKey: peerConnection.publicKey,
        messageId: message.messageId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  sendMessage(peerPublicKey: string, message: string): void {
    const peerConnection = this.peers.get(peerPublicKey);
    if (!peerConnection || !peerConnection.isConnected) {
      throw new Error('Peer not connected');
    }

    const encryptedMessage = this.crypto.encryptMessage(
      peerConnection.sessionId,
      message
    );

    const secureMessage: SecureMessage = {
      type: 'encrypted',
      data: encryptedMessage,
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };

    const messageData = JSON.stringify(secureMessage);
    
    // Track data sent
    this.networkAnalytics.onMessageSent(peerPublicKey, messageData.length);
    
    // Log message sent
    securityLogger.logEvent('info', 'Encrypted message sent', 'low', 'SecureP2PNetwork', {
      peerPublicKey,
      messageSize: messageData.length,
      encrypted: true
    });

    peerConnection.peer.send(messageData);
  }

  private startDummyTrafficGeneration(): void {
    // Generate dummy traffic every 30-60 seconds for metadata protection
    const generateDummy = () => {
      for (const peerConnection of this.peers.values()) {
        if (peerConnection.isConnected) {
          const dummyMessage: SecureMessage = {
            type: 'dummy',
            data: this.crypto.generateDummyTraffic(),
            timestamp: Date.now(),
            messageId: this.generateMessageId()
          };

          peerConnection.peer.send(JSON.stringify(dummyMessage));
        }
      }

      // Random interval between 30-60 seconds
      const nextInterval = 30000 + Math.random() * 30000;
      setTimeout(generateDummy, nextInterval);
    };

    // Start after random delay
    setTimeout(generateDummy, Math.random() * 10000);
  }

  onMessage(handlerId: string, handler: (message: string, fromPeer: string) => void): void {
    this.messageHandlers.set(handlerId, handler);
  }

  removeMessageHandler(handlerId: string): void {
    this.messageHandlers.delete(handlerId);
  }

  getConnectedPeers(): string[] {
    return Array.from(this.peers.values())
      .filter(peer => peer.isConnected)
      .map(peer => peer.publicKey);
  }

  getPublicKeyHex(): string {
    return Array.from(this.identityKeyPair.publicKey)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private encryptMetadata(metadata: MetadataPayload): string {
    // In production, encrypt metadata with a separate key
    return btoa(JSON.stringify({
      ephemeralPublicKey: Array.from(metadata.ephemeralPublicKey),
      timestamp: metadata.timestamp
    }));
  }

  private generatePeerId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateMessageId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
  }

  disconnect(peerPublicKey: string): void {
    const peerConnection = this.peers.get(peerPublicKey);
    if (peerConnection) {
      peerConnection.peer.destroy();
      this.crypto.clearSession(peerConnection.sessionId);
      this.peers.delete(peerPublicKey);
    }
  }

  shutdown(): void {
    for (const peerConnection of this.peers.values()) {
      peerConnection.peer.destroy();
      this.crypto.clearSession(peerConnection.sessionId);
    }
    this.peers.clear();
    this.messageHandlers.clear();
    this.socket.disconnect();
    
    // Emergency clear all crypto material
    this.crypto.emergencyPanic();
  }

  getNetworkAnalytics(): NetworkAnalytics {
    return this.networkAnalytics;
  }
}

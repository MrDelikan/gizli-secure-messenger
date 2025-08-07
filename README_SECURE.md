# 🔒 Gizli - End-to-End Encrypted Messaging

A state-of-the-art end-to-end encrypted chat application designed to resist sophisticated adversaries including state-level surveillance. Built with cutting-edge cryptographic best practices and security features.

## 🛡️ Security Features

### Core Cryptography
- **X25519 Key Exchange**: Elliptic curve Diffie-Hellman for secure key agreement
- **ChaCha20-Poly1305 Encryption**: Authenticated encryption with associated data (AEAD)
- **Perfect Forward Secrecy**: Each message uses unique keys that cannot decrypt past/future messages
- **Double Ratchet Protocol**: Signal Protocol implementation for break-in recovery
- **Post-Quantum Considerations**: Ready for post-quantum algorithm integration

### Network Security
- **P2P Architecture**: Direct peer-to-peer connections via WebRTC
- **Tor Integration Ready**: Onion routing support for metadata protection
- **Dummy Traffic Generation**: Automatic fake traffic to prevent traffic analysis
- **No Server Storage**: Messages never stored in plaintext on servers
- **Metadata Protection**: Communication patterns and participant information protected

### Advanced Security
- **Secure Memory Management**: Cryptographic material automatically cleared from memory
- **Emergency Panic Function**: Instant destruction of all cryptographic material
- **Plausible Deniability**: Cryptographic signatures designed for deniability
- **Tamper Resistance**: Detection and response to compromise attempts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Note: Some warnings with newer Vite versions, but functional)
- Modern web browser with WebRTC support
- Optional: Tor browser for enhanced anonymity

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm start
   ```
   This runs both the signaling server (port 3001) and the frontend (port 5173) concurrently.

3. **Alternative: Run Components Separately**
   ```bash
   # Terminal 1: Start signaling server
   npm run server
   
   # Terminal 2: Start frontend
   npm run dev
   ```

### Using the Application

1. **Initialize**: The app automatically generates your cryptographic identity
2. **Share Public Key**: Copy your public key and share it with contacts
3. **Connect to Peers**: Enter a peer's public key to establish secure connection
4. **Chat Securely**: All messages are automatically encrypted end-to-end

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **SecureCrypto**: Core cryptographic operations using libsodium and noble libraries
- **SecureP2PNetwork**: WebRTC P2P networking with metadata protection
- **ChatInterface**: Secure messaging UI with encryption indicators
- **SecurityStatus**: Real-time security status and panic functions

### Backend (Node.js + Express)
- **Signaling Server**: WebRTC connection establishment (no message storage)
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS Protection**: Configured for secure cross-origin requests

### Security Libraries
- **libsodium**: High-level cryptographic operations
- **@noble/curves**: X25519 elliptic curve operations
- **@noble/ciphers**: ChaCha20-Poly1305 encryption
- **@wireapp/proteus**: Signal Protocol implementation
- **helmet**: HTTP security headers

## 🔧 Development

### Available Scripts
- `npm start` - Run both server and client
- `npm run dev` - Start frontend development server
- `npm run server` - Start signaling server only
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── crypto/
│   └── SecureCrypto.ts          # Core cryptographic operations
├── network/
│   └── SecureP2PNetwork.ts      # P2P networking and WebRTC
├── components/
│   ├── ChatInterface.tsx        # Secure chat UI
│   ├── PeerList.tsx            # Peer management
│   └── SecurityStatus.tsx      # Security indicators
└── App.tsx                     # Main application

server/
└── index.ts                    # Signaling server
```

## ⚠️ Security Considerations

### Production Deployment
- **Use HTTPS/WSS**: All connections must be encrypted in transit
- **Private STUN/TURN**: Deploy your own STUN/TURN servers
- **Tor Integration**: Configure Tor proxy for metadata protection
- **Hardware Security**: Consider hardware security modules for key storage
- **Audit**: Regular security audits and penetration testing

### Threat Model
This application is designed to resist:
- **Network Surveillance**: Traffic analysis and packet inspection
- **Server Compromise**: Signaling server compromise cannot access messages
- **Endpoint Compromise**: Forward secrecy limits damage from device compromise
- **Metadata Analysis**: Dummy traffic and timing obfuscation
- **Coercion**: Plausible deniability features

### Limitations
- **Endpoint Security**: Cannot protect against compromised devices
- **Social Engineering**: No protection against user manipulation
- **Quantum Future**: Current algorithms vulnerable to quantum computers
- **Implementation Bugs**: Security depends on correct implementation

## 🔬 Advanced Features

### Emergency Functions
- **Panic Button**: Instantly clears all cryptographic material
- **Secure Deletion**: Memory wiping prevents recovery
- **Auto-destruct**: Configurable automatic key rotation

### Metadata Protection
- **Dummy Traffic**: Random encrypted messages sent periodically
- **Timing Obfuscation**: Variable delays in message transmission
- **Size Padding**: Message size normalization

### Cryptographic Protocols
- **Key Ratcheting**: Regular key rotation for forward secrecy
- **Out-of-Order Delivery**: Messages can arrive in any order
- **Replay Protection**: Prevents message replay attacks

## 📜 Legal & Ethics

### Compliance
- Ensure compliance with local laws regarding encryption
- Some jurisdictions restrict or prohibit strong encryption
- This software is for educational and legal use only

### Responsible Use
- Do not use for illegal activities
- Respect others' privacy and consent
- Consider the broader implications of surveillance resistance

## 🤝 Contributing

This is an educational project demonstrating advanced cryptographic concepts. Contributions should:
- Maintain security-first mindset
- Include thorough testing
- Follow cryptographic best practices
- Document security implications

## 📚 References

- [Signal Protocol Documentation](https://signal.org/docs/)
- [libsodium Documentation](https://doc.libsodium.org/)
- [WebRTC Security Guidelines](https://webrtc-security.github.io/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

## ⚖️ License

This project is for educational purposes. Use responsibly and in compliance with local laws.

---

**⚠️ SECURITY NOTICE**: This is a demonstration implementation. Production use requires additional security measures, professional security audit, and compliance with local regulations.

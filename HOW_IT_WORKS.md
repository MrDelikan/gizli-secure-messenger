# 🔐 How Gizli Secure Chat Works - User Connection Guide

## 🏗️ **Architecture Overview**

Gizli is a **peer-to-peer (P2P) encrypted chat application** that uses a hybrid approach for maximum security and usability:

```
[User A] ←→ [Signaling Server] ←→ [User B]
    ↓                                 ↓
    └─────── Direct P2P Connection ──┘
           (WebRTC + E2E Encryption)
```

## 📱 **How Users Find and Connect to Each Other**

### **Step 1: Key Generation & Registration**
1. **Each user generates their own cryptographic keys** locally on their device
2. **Public key** is used as their "address" (like a phone number)
3. **Private key** stays on their device and never leaves
4. User registers with the signaling server using their public key

### **Step 2: Key Exchange (Manual Process)**
Currently, users must **manually exchange public keys** through external channels:

#### **Sharing Your Key:**
1. Click "📋 Share Public Key" button
2. Copy the hex string (like: `a1b2c3d4e5f6...`)
3. Share it via:
   - Text message
   - Email
   - QR code (future feature)
   - In person
   - Any other secure channel

#### **Connecting to Someone:**
1. Get their public key from them
2. Paste it in "Connect to Peer" field
3. Click "🌐 Connect"
4. The app handles the rest automatically

### **Step 3: Automatic P2P Connection**
Once you have someone's public key:

1. **Signaling Phase:**
   - Your app contacts the signaling server
   - Finds if the other person is online
   - Exchanges WebRTC connection data (ICE candidates, SDP offers)

2. **Direct Connection:**
   - WebRTC creates a direct connection between your devices
   - **No data goes through the server** - only signaling
   - Connection is peer-to-peer

3. **Secure Session:**
   - Double Ratchet protocol creates secure communication
   - Perfect Forward Secrecy ensures old messages can't be decrypted
   - ChaCha20-Poly1305 encryption for all messages

## 🔍 **Current Discovery Methods**

### ✅ **Available Now:**
- **Manual Key Exchange**: Share public keys through any channel
- **QR Code Scanning**: (Can be implemented)
- **Local Network Discovery**: (Can be added)

### 🚀 **Future Enhancements:**
- **Contact Lists**: Store known public keys
- **Nickname System**: Assign names to public keys
- **Group Invitations**: Multi-party key exchange
- **DHT (Distributed Hash Table)**: Decentralized peer discovery
- **Onion Routing**: Route through Tor for anonymity

## 🛡️ **Security Model**

### **What the Server Knows:**
- ❌ **NO message content** (everything is encrypted end-to-end)
- ❌ **NO private keys** (generated and stored locally)
- ✅ **Public keys** (needed for routing)
- ✅ **Connection metadata** (who wants to connect to whom)
- ✅ **Online status** (for connection establishment)

### **What Stays Private:**
- 🔒 **All message content**
- 🔒 **Your private keys**
- 🔒 **Message metadata** (after connection is established)
- 🔒 **Communication patterns** (with dummy traffic)

## 📋 **Practical Usage Scenarios**

### **Scenario 1: Two Friends**
1. **Alice** opens Gizli, copies her public key
2. **Alice** texts her public key to **Bob**
3. **Bob** opens Gizli, pastes Alice's key, clicks Connect
4. They can now chat securely

### **Scenario 2: Group Chat** (Future)
1. One person creates a group and shares group key
2. Others join using the group key
3. Multi-party encrypted communication

### **Scenario 3: Anonymous Communication**
1. Share public keys through anonymous channels
2. Connect without revealing real identities
3. Use with Tor for maximum anonymity

## 🔧 **Technical Implementation**

### **Network Stack:**
```
Application Layer:    React UI
Encryption Layer:     ChaCha20-Poly1305 + Double Ratchet
Transport Layer:      WebRTC DataChannels
Signaling Layer:      Socket.IO over HTTPS
Discovery Layer:      Manual Key Exchange
```

### **Key Technologies:**
- **WebRTC**: Direct peer-to-peer connections
- **Socket.IO**: Signaling server communication
- **libsodium**: Cryptographic primitives
- **Double Ratchet**: Signal Protocol implementation
- **Perfect Forward Secrecy**: Each message uses unique keys

## 🚀 **Improving Discovery (Roadmap)**

### **Near Term:**
1. **QR Code Generation**: Generate QR codes for public keys
2. **Contact Book**: Save and manage known public keys
3. **Invite Links**: Generate shareable links with public keys

### **Medium Term:**
1. **Local Network Discovery**: Find peers on same WiFi
2. **Bluetooth Discovery**: Exchange keys via Bluetooth
3. **Group Management**: Create and manage group chats

### **Long Term:**
1. **DHT Integration**: Decentralized peer discovery
2. **Onion Routing**: Route through Tor hidden services
3. **Anonymous Discovery**: Find peers without revealing identity

## 🎯 **Current Status**

**What Works Now:**
- ✅ Manual key exchange and connection
- ✅ End-to-end encrypted messaging
- ✅ Perfect forward secrecy
- ✅ Peer-to-peer communication
- ✅ Mobile-responsive interface

**What's Needed for Better UX:**
- 📝 QR code generation/scanning
- 📝 Contact management
- 📝 Better online/offline status
- 📝 Connection status indicators

The current manual key exchange method is **intentionally simple and secure** - it puts users in full control of who they connect with, but requires some technical knowledge to share keys effectively.

---

**Would you like me to implement any of these discovery improvements, such as QR code generation or a contact book feature?**

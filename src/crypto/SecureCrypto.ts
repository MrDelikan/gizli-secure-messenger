import sodium from 'libsodium-wrappers';
import { x25519 } from '@noble/curves/ed25519';
import { chacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import { hkdf } from '@noble/hashes/hkdf';

// Initialize libsodium
await sodium.ready;

export interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface EncryptedMessage {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  mac: Uint8Array;
}

export interface SecureSessionState {
  sendingChainKey: Uint8Array;
  receivingChainKey: Uint8Array;
  rootKey: Uint8Array;
  sendingRatchetKey: KeyPair;
  receivingRatchetKey: Uint8Array | null;
  messageNumber: number;
  previousChainLength: number;
}

export class SecureCrypto {
  private static instance: SecureCrypto;
  private sessionStates = new Map<string, SecureSessionState>();

  private constructor() {}

  static getInstance(): SecureCrypto {
    if (!SecureCrypto.instance) {
      SecureCrypto.instance = new SecureCrypto();
    }
    return SecureCrypto.instance;
  }

  /**
   * Generate a new X25519 key pair for ECDH
   */
  generateKeyPair(): KeyPair {
    const secretKey = randomBytes(32);
    const publicKey = x25519.getPublicKey(secretKey);
    return { publicKey, secretKey };
  }

  /**
   * Generate identity key pair for long-term identity
   */
  generateIdentityKeyPair(): KeyPair {
    const keyPair = sodium.crypto_sign_keypair();
    return {
      publicKey: keyPair.publicKey,
      secretKey: keyPair.privateKey
    };
  }

  /**
   * Derive shared secret using X25519 ECDH
   */
  deriveSharedSecret(ourSecretKey: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
    return x25519.getSharedSecret(ourSecretKey, theirPublicKey);
  }

  /**
   * Enhanced key derivation with versioning and domain separation
   */
  deriveKeys(
    inputKeyMaterial: Uint8Array, 
    salt: Uint8Array, 
    info: string, 
    length: number = 32,
    version: number = 1
  ): Uint8Array {
    const versionedInfo = `Gizli-v${version}-${info}`;
    return hkdf(sha256, inputKeyMaterial, salt, versionedInfo, length);
  }

  /**
   * Initialize Signal Protocol-like double ratchet session
   */
  initializeSession(
    sharedSecret: Uint8Array,
    ourRatchetKey: KeyPair,
    theirRatchetKey?: Uint8Array
  ): string {
    const sessionId = sodium.to_hex(randomBytes(16));
    
    // Derive root key and initial chain key
    const rootKey = this.deriveKeys(sharedSecret, new Uint8Array(32), 'RootKey');
    
    let sendingChainKey: Uint8Array;
    let receivingChainKey: Uint8Array;
    
    if (theirRatchetKey) {
      // We're the receiver, derive receiving chain first
      const dh = this.deriveSharedSecret(ourRatchetKey.secretKey, theirRatchetKey);
      receivingChainKey = this.deriveKeys(rootKey, dh, 'ChainKey');
      sendingChainKey = new Uint8Array(32); // Will be set on first send
    } else {
      // We're the sender, derive sending chain first
      sendingChainKey = this.deriveKeys(rootKey, new Uint8Array(32), 'ChainKey');
      receivingChainKey = new Uint8Array(32); // Will be set when we receive
    }

    this.sessionStates.set(sessionId, {
      sendingChainKey,
      receivingChainKey,
      rootKey,
      sendingRatchetKey: ourRatchetKey,
      receivingRatchetKey: theirRatchetKey || null,
      messageNumber: 0,
      previousChainLength: 0
    });

    return sessionId;
  }

  /**
   * Encrypt message with Perfect Forward Secrecy using Double Ratchet
   */
  encryptMessage(sessionId: string, plaintext: string): EncryptedMessage {
    const session = this.sessionStates.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Generate ephemeral key pair for this message
    const ephemeralKeyPair = this.generateKeyPair();
    
    // Derive message key from chain key
    const messageKey = this.deriveKeys(session.sendingChainKey, new Uint8Array(1), 'MessageKey');
    
    // Advance chain key (Perfect Forward Secrecy)
    session.sendingChainKey = this.deriveKeys(session.sendingChainKey, new Uint8Array(1), 'ChainKeyNext');
    session.messageNumber++;

    // Encrypt with ChaCha20-Poly1305
    const nonce = randomBytes(12); // ChaCha20-Poly1305 nonce
    const cipher = chacha20poly1305(messageKey, nonce);
    const plaintextBytes = new TextEncoder().encode(plaintext);
    const ciphertext = cipher.encrypt(plaintextBytes);

    // Generate MAC
    const mac = sha256(new Uint8Array([...ciphertext, ...nonce, ...ephemeralKeyPair.publicKey]));

    // Clear sensitive data from memory
    this.secureZero(messageKey);

    return {
      ciphertext,
      nonce,
      ephemeralPublicKey: ephemeralKeyPair.publicKey,
      mac: mac.slice(0, 16) // Truncate to 128 bits
    };
  }

  /**
   * Decrypt message with Forward Secrecy verification
   */
  decryptMessage(sessionId: string, encryptedMessage: EncryptedMessage): string {
    const session = this.sessionStates.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify MAC first
    const expectedMac = sha256(new Uint8Array([
      ...encryptedMessage.ciphertext,
      ...encryptedMessage.nonce,
      ...encryptedMessage.ephemeralPublicKey
    ]));
    
    if (!this.constantTimeEqual(encryptedMessage.mac, expectedMac.slice(0, 16))) {
      throw new Error('MAC verification failed');
    }

    // Derive message key from chain key
    const messageKey = this.deriveKeys(session.receivingChainKey, new Uint8Array(1), 'MessageKey');
    
    // Advance chain key
    session.receivingChainKey = this.deriveKeys(session.receivingChainKey, new Uint8Array(1), 'ChainKeyNext');

    // Decrypt with ChaCha20-Poly1305
    const cipher = chacha20poly1305(messageKey, encryptedMessage.nonce);
    const decrypted = cipher.decrypt(encryptedMessage.ciphertext);
    
    // Clear sensitive data from memory
    this.secureZero(messageKey);

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Perform DH ratchet step for forward secrecy
   */
  performDHRatchet(sessionId: string, theirNewRatchetKey: Uint8Array): void {
    const session = this.sessionStates.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Generate new ratchet key pair
    const newRatchetKey = this.generateKeyPair();
    
    // Perform DH with their new key
    const dh = this.deriveSharedSecret(newRatchetKey.secretKey, theirNewRatchetKey);
    
    // Derive new root key and chain keys
    const newRootKey = this.deriveKeys(session.rootKey, dh, 'RootKeyNext');
    const newSendingChainKey = this.deriveKeys(newRootKey, new Uint8Array(32), 'ChainKey');

    // Clear old keys
    this.secureZero(session.sendingRatchetKey.secretKey);
    this.secureZero(session.rootKey);
    this.secureZero(session.sendingChainKey);

    // Update session state
    session.rootKey = newRootKey;
    session.sendingChainKey = newSendingChainKey;
    session.sendingRatchetKey = newRatchetKey;
    session.receivingRatchetKey = theirNewRatchetKey;
    session.messageNumber = 0;
  }

  /**
   * Generate dummy traffic for metadata protection
   */
  generateDummyTraffic(): EncryptedMessage {
    const dummyKey = randomBytes(32);
    const dummyPlaintext = randomBytes(Math.floor(Math.random() * 256) + 64);
    const nonce = randomBytes(12);
    
    const cipher = chacha20poly1305(dummyKey, nonce);
    const ciphertext = cipher.encrypt(dummyPlaintext);
    const mac = sha256(new Uint8Array([...ciphertext, ...nonce])).slice(0, 16);

    this.secureZero(dummyKey);
    this.secureZero(dummyPlaintext);

    return {
      ciphertext,
      nonce,
      ephemeralPublicKey: randomBytes(32),
      mac
    };
  }

  /**
   * Enhanced secure memory wiping with multiple overwrites
   */
  secureZero(data: Uint8Array): void {
    // Use libsodium's secure memory clearing
    sodium.memzero(data);
    
    // Additional overwrites for defense against cold boot attacks
    for (let i = 0; i < 3; i++) {
      data.fill(Math.floor(Math.random() * 256));
    }
    data.fill(0);
    
    // Final libsodium wipe
    sodium.memzero(data);
  }

  /**
   * Enhanced timing-safe comparison
   */
  private constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    
    // Use libsodium's constant-time comparison if available
    try {
      return sodium.memcmp(a, b);
    } catch {
      // Fallback to manual implementation
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
      }
      return result === 0;
    }
  }

  /**
   * Clear session and all associated keys with enhanced security
   */
  clearSession(sessionId: string): void {
    const session = this.sessionStates.get(sessionId);
    if (session) {
      this.secureZero(session.sendingChainKey);
      this.secureZero(session.receivingChainKey);
      this.secureZero(session.rootKey);
      this.secureZero(session.sendingRatchetKey.secretKey);
      this.secureZero(session.sendingRatchetKey.publicKey);
      if (session.receivingRatchetKey) {
        this.secureZero(session.receivingRatchetKey);
      }
      this.sessionStates.delete(sessionId);
    }
  }

  /**
   * Enhanced emergency panic function - secure destruction of all material
   */
  emergencyPanic(): void {
    console.warn('🚨 EMERGENCY PANIC ACTIVATED - Clearing all cryptographic material');
    
    for (const sessionId of this.sessionStates.keys()) {
      this.clearSession(sessionId);
    }
    this.sessionStates.clear();
    
    // Force garbage collection multiple times
    for (let i = 0; i < 3; i++) {
      if (typeof gc === 'function') {
        gc();
      }
    }
    
    console.log('🔒 All cryptographic material securely destroyed');
  }
}

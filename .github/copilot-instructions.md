# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an end-to-end encrypted chat application designed to resist state-level adversaries with cryptographic best practices.

## Security Requirements
- **Perfect Forward Secrecy**: Each message uses unique keys that cannot decrypt past/future messages
- **Post-Quantum Resistance**: Implement algorithms resistant to quantum computer attacks
- **Metadata Protection**: Hide communication patterns and participants
- **Secure Key Exchange**: Use X25519 for ECDH key exchange
- **Strong Encryption**: ChaCha20-Poly1305 or AES-GCM for message encryption
- **Signal Protocol**: Double ratchet for forward secrecy and break-in recovery
- **P2P Architecture**: WebRTC with Tor/onion routing support
- **Secure Deletion**: Cryptographically secure memory clearing
- **Plausible Deniability**: Ability to deny message authorship

## Cryptographic Libraries
- **libsodium**: Primary cryptographic library for high-level operations
- **@noble/curves**: Elliptic curve cryptography (X25519, Ed25519)
- **@noble/ciphers**: ChaCha20-Poly1305 implementation
- **@noble/hashes**: Cryptographic hash functions
- **@wireapp/proteus**: Modern Signal Protocol implementation
- **tweetnacl**: Backup cryptographic primitives

## Architecture Principles
- Never store plaintext or keys on servers
- Implement secure enclave for key storage
- Memory protection against cold boot attacks
- Tamper-resistant auto-deletion
- Use onion routing or mix networks
- Generate dummy traffic for traffic analysis resistance
- Avoid persistent identifiers

## Code Guidelines
- Always use cryptographically secure random number generation
- Implement proper key derivation functions
- Clear sensitive data from memory immediately after use
- Use timing-safe comparison functions
- Implement proper error handling without information leakage
- Follow zero-trust security model
- Document all cryptographic operations thoroughly

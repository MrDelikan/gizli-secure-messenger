import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import Joi from 'joi';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Security middlewares - Production Ready
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:3001", "wss://localhost:3001", "https://stun.l.google.com:19302"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      baseUri: ["'self'"],
      fontSrc: ["'self'"],
      frameSrc: ["'none'"],
      manifestSrc: ["'self'"],
      mediaSrc: ["'self'", "blob:"],
      workerSrc: ["'self'"]
    },
  },
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  originAgentCluster: true,
  dnsPrefetchControl: false,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  ieNoOpen: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true
}));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting for DoS protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes at full speed
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Store active peer connections (in production, use secure distributed storage)
const activePeers = new Map<string, {
  socketId: string;
  publicKey: string;
  lastSeen: number;
}>();

// Input validation schemas
const schemas = {
  registerPeer: Joi.object({
    publicKey: Joi.string().hex().length(64).required()
  }),
  
  webrtcSignal: Joi.object({
    toPublicKey: Joi.string().hex().length(64).required(),
    signal: Joi.object().required(),
    encryptedMetadata: Joi.string().optional()
  })
};

// Validation middleware
function validateInput(schema: Joi.ObjectSchema) {
  return (data: unknown) => {
    const { error, value } = schema.validate(data);
    if (error) {
      throw new Error(`Invalid input: ${error.details[0].message}`);
    }
    return value;
  };
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle peer registration for P2P discovery with validation
  socket.on('register-peer', (data: { publicKey: string }) => {
    try {
      const validatedData = validateInput(schemas.registerPeer)(data);
      
      activePeers.set(socket.id, {
        socketId: socket.id,
        publicKey: validatedData.publicKey,
        lastSeen: Date.now()
      });
      
      // Broadcast available peers (without exposing socket IDs)
      socket.broadcast.emit('peer-available', {
        publicKey: validatedData.publicKey
      });
      
      console.log('Peer registered:', validatedData.publicKey.substring(0, 8) + '...');
    } catch (error) {
      console.error('Invalid peer registration:', error);
      socket.emit('error', { message: 'Invalid peer registration data' });
    }
  });

  // Relay encrypted signaling for WebRTC with validation
  socket.on('webrtc-signal', (data: unknown) => {
    try {
      const validatedData = validateInput(schemas.webrtcSignal)(data);
      const { toPublicKey, signal, encryptedMetadata } = validatedData as {
        toPublicKey: string;
        signal: unknown;
        encryptedMetadata?: string;
      };
      
      // Find target peer by public key
      const targetPeer = Array.from(activePeers.values())
        .find(peer => peer.publicKey === toPublicKey);
      
      if (targetPeer) {
        io.to(targetPeer.socketId).emit('webrtc-signal', {
          fromPublicKey: Array.from(activePeers.entries())
            .find(([id]) => id === socket.id)?.[1]?.publicKey,
          signal: signal,
          encryptedMetadata: encryptedMetadata
        });
      }
    } catch (error) {
      console.error('Invalid WebRTC signal:', error);
      socket.emit('error', { message: 'Invalid signal data' });
    }
  });

  socket.on('disconnect', () => {
    activePeers.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Secure signaling server running on port ${PORT}`);
});

// Clean up inactive peers every 5 minutes
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [socketId, peer] of activePeers.entries()) {
    if (peer.lastSeen < fiveMinutesAgo) {
      activePeers.delete(socketId);
    }
  }
}, 5 * 60 * 1000);

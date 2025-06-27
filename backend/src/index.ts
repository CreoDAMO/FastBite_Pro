
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import dotenv from 'dotenv';

import { typeDefs, resolvers } from './graphql';
import { connectDatabase } from './database';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeServices } from './services';
import { setupWebSocket } from './websocket';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import restaurantRoutes from './routes/restaurants';
import orderRoutes from './routes/orders';
import driverRoutes from './routes/drivers';
import paymentRoutes from './routes/payments';
import web3Routes from './routes/web3';
import complianceRoutes from './routes/compliance';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://0.0.0.0:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://0.0.0.0:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/drivers', authMiddleware, driverRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/web3', authMiddleware, web3Routes);
app.use('/api/compliance', authMiddleware, complianceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    logger.error('GraphQL Error:', error);
    return error;
  }
});

async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    
    // Initialize services
    await initializeServices();
    
    // Setup WebSocket
    setupWebSocket(io);
    
    // Start Apollo Server
    await apolloServer.start();
    app.use('/graphql', expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        user: req.user,
        dataSources: {
          // Add data sources here
        }
      })
    }));
    
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server ready at http://0.0.0.0:${PORT}`);
      logger.info(`🚀 GraphQL ready at http://0.0.0.0:${PORT}/graphql`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };

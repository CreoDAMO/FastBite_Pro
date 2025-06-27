
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export const setupWebSocket = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });

    socket.on('heartbeat', () => {
      socket.emit('heartbeat_ack', { timestamp: new Date() });
    });
  });
};

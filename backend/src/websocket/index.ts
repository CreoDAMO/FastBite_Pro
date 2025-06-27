
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { redis } from '../database';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const setupWebSocket = (io: SocketIOServer) => {
  // Authentication middleware for WebSocket
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (user.complianceStatus === 'suspended') {
        return next(new Error('Authentication error: Account suspended'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.user;
    logger.info(`User connected: ${user.email} (${user.role})`);

    // Join user to their personal room
    socket.join(`user:${user._id}`);

    // Join role-based rooms
    socket.join(`role:${user.role}`);

    // Store socket connection in Redis for tracking
    await redis.sadd(`user_sockets:${user._id}`, socket.id);
    await redis.setex(`socket:${socket.id}`, 3600, user._id.toString());

    // Driver-specific connections
    if (user.role === 'driver') {
      socket.join('drivers');
      
      // Handle driver location updates
      socket.on('updateLocation', async (data) => {
        try {
          const { latitude, longitude } = data;
          
          // Update driver location in database
          await User.findByIdAndUpdate(user._id, {
            'location.coordinates': [longitude, latitude],
            'location.address': data.address || 'Unknown'
          });

          // Broadcast to admin and relevant customers
          socket.to('role:admin').emit('driverLocationUpdate', {
            driverId: user._id,
            location: { latitude, longitude },
            timestamp: new Date()
          });

          logger.debug(`Driver location updated: ${user.email}`);
        } catch (error) {
          logger.error('Error updating driver location:', error);
        }
      });

      // Handle driver availability status
      socket.on('updateAvailability', async (data) => {
        try {
          const { available } = data;
          
          // Update driver availability
          await redis.setex(`driver_available:${user._id}`, 3600, available ? '1' : '0');

          socket.to('role:admin').emit('driverAvailabilityUpdate', {
            driverId: user._id,
            available,
            timestamp: new Date()
          });

          logger.info(`Driver availability updated: ${user.email} - ${available ? 'Available' : 'Unavailable'}`);
        } catch (error) {
          logger.error('Error updating driver availability:', error);
        }
      });
    }

    // Customer-specific connections
    if (user.role === 'customer') {
      // Handle order tracking requests
      socket.on('trackOrder', async (data) => {
        try {
          const { orderId } = data;
          socket.join(`order:${orderId}`);
          logger.debug(`Customer tracking order: ${orderId}`);
        } catch (error) {
          logger.error('Error tracking order:', error);
        }
      });
    }

    // Merchant-specific connections
    if (user.role === 'merchant') {
      socket.join('merchants');
      
      // Handle order status updates
      socket.on('updateOrderStatus', async (data) => {
        try {
          const { orderId, status } = data;
          
          // Emit to order room and customer
          io.to(`order:${orderId}`).emit('orderStatusUpdate', {
            orderId,
            status,
            timestamp: new Date()
          });

          logger.info(`Order status updated: ${orderId} - ${status}`);
        } catch (error) {
          logger.error('Error updating order status:', error);
        }
      });
    }

    // Admin-specific connections
    if (user.role === 'admin') {
      socket.join('admins');
      
      // Handle system-wide broadcasts
      socket.on('systemBroadcast', async (data) => {
        try {
          const { message, targetRole } = data;
          
          if (targetRole) {
            io.to(`role:${targetRole}`).emit('systemMessage', {
              message,
              from: 'admin',
              timestamp: new Date()
            });
          } else {
            io.emit('systemMessage', {
              message,
              from: 'admin',
              timestamp: new Date()
            });
          }

          logger.info(`System broadcast sent: ${message}`);
        } catch (error) {
          logger.error('Error sending system broadcast:', error);
        }
      });
    }

    // Handle generic messaging
    socket.on('sendMessage', async (data) => {
      try {
        const { recipientId, message, type } = data;
        
        io.to(`user:${recipientId}`).emit('messageReceived', {
          from: user._id,
          fromName: user.name,
          message,
          type,
          timestamp: new Date()
        });

        logger.debug(`Message sent from ${user.email} to ${recipientId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
      }
    });

    // Handle heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      socket.emit('heartbeatAck', { timestamp: new Date() });
    });

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      logger.info(`User disconnected: ${user.email} (${reason})`);
      
      // Remove socket from Redis
      await redis.srem(`user_sockets:${user._id}`, socket.id);
      await redis.del(`socket:${socket.id}`);

      // Update driver availability if driver
      if (user.role === 'driver') {
        await redis.setex(`driver_available:${user._id}`, 3600, '0');
        socket.to('role:admin').emit('driverAvailabilityUpdate', {
          driverId: user._id,
          available: false,
          timestamp: new Date()
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${user.email}:`, error);
    });
  });

  // Utility functions for emitting events
  const emitToUser = async (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  const emitToRole = async (role: string, event: string, data: any) => {
    io.to(`role:${role}`).emit(event, data);
  };

  const emitToOrder = async (orderId: string, event: string, data: any) => {
    io.to(`order:${orderId}`).emit(event, data);
  };

  // Export utility functions for use in other services
  return {
    emitToUser,
    emitToRole,
    emitToOrder,
    io
  };
};

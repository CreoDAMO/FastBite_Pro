
import { logger } from '../utils/logger';

// Service classes would be imported here
// import { AuthService } from './AuthService';
// import { OrderService } from './OrderService';
// import { PaymentService } from './PaymentService';
// import { Web3Service } from './Web3Service';
// import { NotificationService } from './NotificationService';

export class ServiceContainer {
  private services: Map<string, any> = new Map();

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
    logger.info(`Service registered: ${name}`);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }
}

export const serviceContainer = new ServiceContainer();

export const initializeServices = async () => {
  try {
    logger.info('Initializing services...');

    // Initialize and register services here
    // const authService = new AuthService();
    // serviceContainer.register('auth', authService);

    // const orderService = new OrderService();
    // serviceContainer.register('order', orderService);

    // const paymentService = new PaymentService();
    // serviceContainer.register('payment', paymentService);

    // const web3Service = new Web3Service();
    // serviceContainer.register('web3', web3Service);

    // const notificationService = new NotificationService();
    // serviceContainer.register('notification', notificationService);

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
};

export default serviceContainer;

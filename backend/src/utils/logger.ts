
import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Add request ID to logs
export const addRequestId = (req: any, res: any, next: any) => {
  req.id = Math.random().toString(36).substr(2, 9);
  logger.defaultMeta = { requestId: req.id };
  next();
};

// Log performance metrics
export const logPerformance = (label: string, startTime: number) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  logger.info(`Performance: ${label} took ${duration}ms`);
};

// Create child logger with additional context
export const createChildLogger = (context: object) => {
  return logger.child(context);
};

// Structured logging helpers
export const logError = (message: string, error: Error, context?: object) => {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    ...context
  });
};

export const logInfo = (message: string, context?: object) => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: object) => {
  logger.warn(message, context);
};

export const logDebug = (message: string, context?: object) => {
  logger.debug(message, context);
};

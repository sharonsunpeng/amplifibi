import winston from 'winston'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

// Custom format for development
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Custom format for production
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Define transports
const transports = []

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: devFormat,
      level: 'debug',
    })
  )
} else {
  // Console transport for production (structured logging)
  transports.push(
    new winston.transports.Console({
      format: prodFormat,
      level: 'info',
    })
  )
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: prodFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: prodFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    })
  )
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  levels,
  format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
  transports,
  exitOnError: false,
})

// Create a wrapper for API logging
export const apiLogger = {
  request: (method: string, url: string, userId?: string, metadata?: any) => {
    logger.info('API Request', {
      method,
      url,
      userId,
      timestamp: new Date().toISOString(),
      type: 'api_request',
      ...metadata,
    })
  },

  response: (method: string, url: string, status: number, duration: number, userId?: string, metadata?: any) => {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    logger[level]('API Response', {
      method,
      url,
      status,
      duration: `${duration}ms`,
      userId,
      timestamp: new Date().toISOString(),
      type: 'api_response',
      ...metadata,
    })
  },

  error: (method: string, url: string, error: Error, userId?: string, metadata?: any) => {
    logger.error('API Error', {
      method,
      url,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      userId,
      timestamp: new Date().toISOString(),
      type: 'api_error',
      ...metadata,
    })
  },
}

// Create a wrapper for business logic logging
export const businessLogger = {
  invoiceCreated: (invoiceId: string, userId: string, customerName: string, amount: number) => {
    logger.info('Invoice Created', {
      invoiceId,
      userId,
      customerName,
      amount,
      timestamp: new Date().toISOString(),
      type: 'invoice_created',
    })
  },

  invoicePaid: (invoiceId: string, userId: string, amount: number, paymentMethod: string) => {
    logger.info('Invoice Paid', {
      invoiceId,
      userId,
      amount,
      paymentMethod,
      timestamp: new Date().toISOString(),
      type: 'invoice_paid',
    })
  },

  customerCreated: (customerId: string, userId: string, customerName: string) => {
    logger.info('Customer Created', {
      customerId,
      userId,
      customerName,
      timestamp: new Date().toISOString(),
      type: 'customer_created',
    })
  },

  userRegistered: (userId: string, email: string) => {
    logger.info('User Registered', {
      userId,
      email,
      timestamp: new Date().toISOString(),
      type: 'user_registered',
    })
  },

  userLoggedIn: (userId: string, email: string, provider: string) => {
    logger.info('User Logged In', {
      userId,
      email,
      provider,
      timestamp: new Date().toISOString(),
      type: 'user_login',
    })
  },
}

// Create a wrapper for security logging
export const securityLogger = {
  suspiciousActivity: (type: string, userId?: string, ip?: string, metadata?: any) => {
    logger.warn('Suspicious Activity', {
      type,
      userId,
      ip,
      timestamp: new Date().toISOString(),
      type: 'security_event',
      ...metadata,
    })
  },

  authFailure: (email: string, ip?: string, reason?: string) => {
    logger.warn('Authentication Failure', {
      email,
      ip,
      reason,
      timestamp: new Date().toISOString(),
      type: 'auth_failure',
    })
  },

  rateLimitExceeded: (ip: string, endpoint: string, limit: number) => {
    logger.warn('Rate Limit Exceeded', {
      ip,
      endpoint,
      limit,
      timestamp: new Date().toISOString(),
      type: 'rate_limit_exceeded',
    })
  },
}

// Create a wrapper for performance logging
export const performanceLogger = {
  slowQuery: (query: string, duration: number, params?: any) => {
    logger.warn('Slow Database Query', {
      query: query.substring(0, 200), // Truncate long queries
      duration: `${duration}ms`,
      params,
      timestamp: new Date().toISOString(),
      type: 'slow_query',
    })
  },

  memoryUsage: (usage: NodeJS.MemoryUsage) => {
    logger.debug('Memory Usage', {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      arrayBuffers: `${Math.round(usage.arrayBuffers / 1024 / 1024)}MB`,
      timestamp: new Date().toISOString(),
      type: 'memory_usage',
    })
  },
}

export default logger
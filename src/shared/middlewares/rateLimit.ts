import rateLimit from 'express-rate-limit'

interface RateLimitOptions {
  time?: number; 
  max?: number; 
}

export const rateLimiterMiddleware = (options?: RateLimitOptions) => {
  return rateLimit({
    windowMs: (options?.time ?? 15) * 60 * 1000, 
    max: options?.max ?? 100,
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
      trustProxy: false
    }
  })
}


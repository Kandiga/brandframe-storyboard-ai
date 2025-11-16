import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Security middleware configuration
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for development
  // Note: Request size limit is handled by express.json() and requestSizeLimit middleware
});

/**
 * CORS configuration with specific origins
 * Supports localhost, WebContainer domains, and Netlify domains
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// Helper function to check if origin is a WebContainer domain
const isWebContainerDomain = (origin: string): boolean => {
  return origin.includes('.webcontainer-api.io') ||
         origin.includes('.local-credentialless.webcontainer-api.io') ||
         origin.includes('webcontainer');
};

// Helper function to check if origin is a Netlify domain
const isNetlifyDomain = (origin: string): boolean => {
  return origin.endsWith('.netlify.app') || origin.includes('.netlify.app');
};

// Helper function to check if origin is localhost
const isLocalhostDomain = (origin: string): boolean => {
  return origin.includes('localhost') || origin.includes('127.0.0.1');
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Allow WebContainer domains (development environments like StackBlitz, WebContainers)
    if (isWebContainerDomain(origin)) {
      console.log('[CORS] Allowing WebContainer domain:', origin);
      return callback(null, true);
    }

    // Allow localhost origins in development
    if (isLocalhostDomain(origin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Netlify domains in production
    if (isNetlifyDomain(origin)) {
      return callback(null, true);
    }

    // Allow all origins in development mode
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Allow if explicitly set in ALLOWED_ORIGINS environment variable (comma-separated)
    const additionalOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    if (additionalOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('[CORS] Origin not allowed:', origin);
    callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info', 'Apikey'],
  maxAge: 86400, // 24 hours
});

/**
 * Request size limit middleware
 * Increased limit for storyboard generation with images
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = req.headers['content-length'];
  // Increased to 200MB to handle large base64 image uploads for storyboard generation
  // Base64 encoding increases size by ~33%, so we need extra headroom
  const maxSize = 200 * 1024 * 1024; // 200MB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    res.status(413).json({
      success: false,
      error: 'Request entity too large. Maximum size is 200MB. Please compress your images or use smaller files.',
    });
    return;
  }
  
  next();
};


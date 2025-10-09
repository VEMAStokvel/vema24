/**
 * Environment Configuration
 * Manages different environment settings (development, production)
 */

export const ENV = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test'
};

// Detect current environment
const getCurrentEnvironment = () => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ENV.DEVELOPMENT;
    } else if (hostname.includes('vema24.co.za') || hostname.includes('github.io')) {
        return ENV.PRODUCTION;
    }
    
    return ENV.DEVELOPMENT;
};

export const currentEnv = getCurrentEnvironment();

// Environment-specific configurations
const config = {
    [ENV.DEVELOPMENT]: {
        apiTimeout: 10000,
        enableLogging: true,
        enableDebug: true,
        cacheDuration: 300000, // 5 minutes
    },
    [ENV.PRODUCTION]: {
        apiTimeout: 30000,
        enableLogging: false,
        enableDebug: false,
        cacheDuration: 3600000, // 1 hour
    },
    [ENV.TEST]: {
        apiTimeout: 5000,
        enableLogging: true,
        enableDebug: true,
        cacheDuration: 0,
    }
};

/**
 * Get current environment configuration
 */
export const getConfig = () => config[currentEnv];

/**
 * Check if we're in development mode
 */
export const isDevelopment = () => currentEnv === ENV.DEVELOPMENT;

/**
 * Check if we're in production mode
 */
export const isProduction = () => currentEnv === ENV.PRODUCTION;

/**
 * Logger that respects environment settings
 */
export const logger = {
    log: (...args) => {
        if (getConfig().enableLogging) {
            console.log('[VEMA24]', ...args);
        }
    },
    
    debug: (...args) => {
        if (getConfig().enableDebug) {
            console.debug('[VEMA24 DEBUG]', ...args);
        }
    },
    
    info: (...args) => {
        if (getConfig().enableLogging) {
            console.info('[VEMA24 INFO]', ...args);
        }
    },
    
    warn: (...args) => {
        console.warn('[VEMA24 WARNING]', ...args);
    },
    
    error: (...args) => {
        console.error('[VEMA24 ERROR]', ...args);
    }
};

export default {
    ENV,
    currentEnv,
    getConfig,
    isDevelopment,
    isProduction,
    logger
};

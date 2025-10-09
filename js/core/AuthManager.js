/**
 * Auth Manager
 * High-level authentication manager for UI integration
 */

import { authService } from '../services/AuthService.js';
import { logger } from '../config/environment.js';

export class AuthManager {
    constructor() {
        this.authService = authService;
        this.uiCallbacks = {
            onAuthStateChanged: [],
            onLoadingStateChanged: []
        };
    }
    
    /**
     * Initialize authentication
     */
    async initialize() {
        try {
            this.setLoadingState(true);
            
            const user = await this.authService.initializeAuthState();
            
            // Subscribe to auth state changes for UI updates
            this.authService.onAuthStateChange((user) => {
                this.handleAuthStateChange(user);
            });
            
            this.setLoadingState(false);
            
            return user;
        } catch (error) {
            logger.error('Error initializing auth:', error);
            this.setLoadingState(false);
            return null;
        }
    }
    
    /**
     * Handle auth state changes
     */
    handleAuthStateChange(user) {
        this.updateUIElements(user);
        
        // Notify registered callbacks
        this.uiCallbacks.onAuthStateChanged.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                logger.error('Error in auth state callback:', error);
            }
        });
    }
    
    /**
     * Update UI elements based on auth state
     */
    updateUIElements(user) {
        const elements = {
            mobile: {
                login: 'mobile-login',
                register: 'mobile-register',
                dashboard: 'mobile-dashboard'
            },
            desktop: {
                login: 'desktop-login',
                register: 'desktop-register',
                dashboard: 'desktop-dashboard'
            },
            hero: {
                cta: 'hero-cta',
                dashboard: 'hero-dashboard'
            }
        };
        
        const isAuthenticated = user !== null;
        
        // Update mobile elements
        this.toggleElements(elements.mobile, isAuthenticated);
        
        // Update desktop elements
        this.toggleElements(elements.desktop, isAuthenticated);
        
        // Update hero elements
        const heroCta = document.getElementById('hero-cta');
        const heroDashboard = document.getElementById('hero-dashboard');
        if (heroCta) heroCta.classList.toggle('hidden', isAuthenticated);
        if (heroDashboard) heroDashboard.classList.toggle('hidden', !isAuthenticated);
    }
    
    /**
     * Toggle element visibility based on auth state
     */
    toggleElements(elementIds, isAuthenticated) {
        const { login, register, dashboard } = elementIds;
        
        const loginEl = document.getElementById(login);
        const registerEl = document.getElementById(register);
        const dashboardEl = document.getElementById(dashboard);
        
        if (loginEl) loginEl.classList.toggle('hidden', isAuthenticated);
        if (registerEl) registerEl.classList.toggle('hidden', isAuthenticated);
        if (dashboardEl) dashboardEl.classList.toggle('hidden', !isAuthenticated);
    }
    
    /**
     * Set loading state
     */
    setLoadingState(isLoading) {
        try {
            document.body.classList.toggle('app-loading', isLoading);
            
            const overlay = document.getElementById('loading-overlay');
            const mainContent = document.getElementById('main-content');
            
            if (!isLoading && overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 300);
            }
            
            if (mainContent) {
                mainContent.style.opacity = isLoading ? '0' : '1';
            }
            
            // Notify loading callbacks
            this.uiCallbacks.onLoadingStateChanged.forEach(callback => {
                try {
                    callback(isLoading);
                } catch (error) {
                    logger.error('Error in loading state callback:', error);
                }
            });
        } catch (error) {
            logger.error('Error setting loading state:', error);
        }
    }
    
    /**
     * Register callback for auth state changes
     */
    onAuthStateChanged(callback) {
        this.uiCallbacks.onAuthStateChanged.push(callback);
    }
    
    /**
     * Register callback for loading state changes
     */
    onLoadingStateChanged(callback) {
        this.uiCallbacks.onLoadingStateChanged.push(callback);
    }
    
    /**
     * Require authentication for protected routes
     */
    requireAuth(redirectPath, actionName = 'access this feature') {
        return new Promise((resolve, reject) => {
            const user = this.authService.getCurrentUser();
            
            if (user) {
                resolve(user);
            } else {
                // Store intended destination
                sessionStorage.setItem('intendedDestination', redirectPath);
                sessionStorage.setItem('intendedAction', actionName);
                
                // Redirect to login
                const loginUrl = `auth/login.html?redirect=${encodeURIComponent(redirectPath)}&action=${encodeURIComponent(actionName)}`;
                window.location.href = loginUrl;
                
                reject(new Error('Authentication required'));
            }
        });
    }
    
    /**
     * Handle post-login redirect
     */
    handlePostLoginRedirect() {
        const intendedDestination = sessionStorage.getItem('intendedDestination');
        
        if (intendedDestination) {
            sessionStorage.removeItem('intendedDestination');
            sessionStorage.removeItem('intendedAction');
            window.location.href = intendedDestination;
        } else {
            window.location.href = 'dashboard/index.html';
        }
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.authService.isAuthenticated();
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.authService.getCurrentUser();
    }
}

// Create singleton instance
export const authManager = new AuthManager();

// Export functions for backwards compatibility
export const initializeFirebaseAuth = () => authManager.initialize();
export const handleAuthState = (user) => authManager.handleAuthStateChange(user);
export const setLoadingState = (isLoading) => authManager.setLoadingState(isLoading);
export const requireAuth = (redirectPath, actionName) => authManager.requireAuth(redirectPath, actionName);
export const handlePostLoginRedirect = () => authManager.handlePostLoginRedirect();

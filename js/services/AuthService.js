/**
 * Authentication Service
 * Handles all authentication-related business logic
 */

import { getAuth } from '../config/firebase.config.js';
import { userRepository } from '../repositories/UserRepository.js';
import { logger } from '../config/environment.js';

export class AuthService {
    constructor() {
        this.auth = getAuth();
        this.currentUser = null;
        this.authStateListeners = [];
    }
    
    /**
     * Initialize auth state listener
     */
    initializeAuthState() {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                logger.warn('Auth state check timed out');
                resolve(null);
            }, 5000);
            
            const unsubscribe = this.auth.onAuthStateChanged(
                async (user) => {
                    clearTimeout(timeout);
                    this.currentUser = user;
                    
                    // Notify all listeners
                    this.notifyAuthStateListeners(user);
                    
                    resolve(user);
                    unsubscribe();
                },
                (error) => {
                    clearTimeout(timeout);
                    logger.error('Auth state error:', error);
                    resolve(null);
                }
            );
        });
    }
    
    /**
     * Register listener for auth state changes
     */
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        
        // Immediately call with current state if available
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
        
        // Return unsubscribe function
        return () => {
            this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
        };
    }
    
    /**
     * Notify all auth state listeners
     */
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                logger.error('Error in auth state listener:', error);
            }
        });
    }
    
    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        try {
            logger.log('Attempting sign in for:', email);
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            logger.log('Sign in successful');
            return {
                success: true,
                user: userCredential.user
            };
        } catch (error) {
            logger.error('Sign in error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }
    
    /**
     * Register new user
     */
    async register(email, password, displayName) {
        try {
            logger.log('Attempting registration for:', email);
            
            // Create auth account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile
            await user.updateProfile({ displayName });
            
            // Create user document in Firestore
            await userRepository.createOrUpdateUser(user.uid, {
                email,
                displayName,
                createdAt: new Date()
            });
            
            this.currentUser = user;
            logger.log('Registration successful');
            
            return {
                success: true,
                user
            };
        } catch (error) {
            logger.error('Registration error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }
    
    /**
     * Sign out
     */
    async signOut() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            logger.log('Sign out successful');
            return { success: true };
        } catch (error) {
            logger.error('Sign out error:', error);
            return {
                success: false,
                error: 'Failed to sign out. Please try again.'
            };
        }
    }
    
    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            logger.log('Password reset email sent to:', email);
            return {
                success: true,
                message: 'Password reset email sent. Please check your inbox.'
            };
        } catch (error) {
            logger.error('Password reset error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }
    
    /**
     * Update user password
     */
    async updatePassword(newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('No user signed in');
            }
            
            await this.currentUser.updatePassword(newPassword);
            logger.log('Password updated successfully');
            
            return {
                success: true,
                message: 'Password updated successfully'
            };
        } catch (error) {
            logger.error('Update password error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }
    
    /**
     * Update user profile
     */
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('No user signed in');
            }
            
            await this.currentUser.updateProfile(updates);
            await userRepository.update(this.currentUser.uid, updates);
            
            logger.log('Profile updated successfully');
            return {
                success: true,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            logger.error('Update profile error:', error);
            return {
                success: false,
                error: 'Failed to update profile. Please try again.'
            };
        }
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Get current user ID
     */
    getCurrentUserId() {
        return this.currentUser?.uid || null;
    }
    
    /**
     * Require authentication (throws if not authenticated)
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            throw new Error('Authentication required');
        }
        return this.currentUser;
    }
    
    /**
     * Get user-friendly error messages
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
            'auth/invalid-email': 'Invalid email address format.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/requires-recent-login': 'Please sign in again to perform this action.'
        };
        
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }
}

// Create singleton instance
export const authService = new AuthService();

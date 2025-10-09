/**
 * Error Handler
 * Centralized error handling and user notifications
 */

import { logger } from '../config/environment.js';

export class ErrorHandler {
    /**
     * Handle and display error
     */
    static handleError(error, context = '') {
        logger.error(`Error in ${context}:`, error);
        
        // Get user-friendly message
        const message = this.getUserFriendlyMessage(error);
        
        // Display error to user
        this.showError(message);
        
        return message;
    }
    
    /**
     * Get user-friendly error message
     */
    static getUserFriendlyMessage(error) {
        if (typeof error === 'string') {
            return error;
        }
        
        if (error.message) {
            // Check for known error patterns
            if (error.message.includes('network')) {
                return 'Network error. Please check your internet connection and try again.';
            }
            
            if (error.message.includes('permission')) {
                return 'You don\'t have permission to perform this action.';
            }
            
            if (error.message.includes('not found')) {
                return 'The requested information could not be found.';
            }
            
            return error.message;
        }
        
        return 'An unexpected error occurred. Please try again.';
    }
    
    /**
     * Show error message to user
     */
    static showError(message) {
        // Try to use custom modal if exists
        const errorModal = document.getElementById('error-modal');
        if (errorModal) {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            errorModal.classList.remove('hidden');
            return;
        }
        
        // Fallback to alert
        alert(`Error: ${message}`);
    }
    
    /**
     * Show success message to user
     */
    static showSuccess(message) {
        // Try to use custom modal if exists
        const successModal = document.getElementById('success-modal');
        if (successModal) {
            const successMessage = document.getElementById('success-message');
            if (successMessage) {
                successMessage.textContent = message;
            }
            successModal.classList.remove('hidden');
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                successModal.classList.add('hidden');
            }, 3000);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }
    
    /**
     * Show warning message to user
     */
    static showWarning(message) {
        logger.warn(message);
        alert(`Warning: ${message}`);
    }
    
    /**
     * Show info message to user
     */
    static showInfo(message) {
        logger.info(message);
        alert(message);
    }
    
    /**
     * Confirm action with user
     */
    static async confirm(message) {
        return confirm(message);
    }
    
    /**
     * Show loading indicator
     */
    static showLoading(message = 'Loading...') {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            loadingOverlay.style.display = 'flex';
        }
    }
    
    /**
     * Hide loading indicator
     */
    static hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }
    
    /**
     * Wrap async function with error handling
     */
    static async tryAsync(fn, context = 'operation') {
        try {
            this.showLoading();
            const result = await fn();
            this.hideLoading();
            return result;
        } catch (error) {
            this.hideLoading();
            this.handleError(error, context);
            throw error;
        }
    }
    
    /**
     * Display field validation errors
     */
    static showFieldErrors(errors) {
        for (const field in errors) {
            const errorElement = document.getElementById(`${field}-error`);
            const inputElement = document.getElementById(field);
            
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.remove('hidden');
            }
            
            if (inputElement) {
                inputElement.classList.add('border-red-500');
            }
        }
    }
    
    /**
     * Clear field validation errors
     */
    static clearFieldErrors(form) {
        const errorElements = form.querySelectorAll('[id$="-error"]');
        errorElements.forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        const inputElements = form.querySelectorAll('input, select, textarea');
        inputElements.forEach(el => {
            el.classList.remove('border-red-500');
        });
    }
}

export default ErrorHandler;

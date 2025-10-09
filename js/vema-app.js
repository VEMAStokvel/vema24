/**
 * Vema24 Application
 * Main entry point for the Vema24 application
 * This file exports all the necessary modules for use throughout the application
 */

// Configuration
export { logger, currentEnv, isDevelopment, isProduction, getConfig } from './config/environment.js';
export { initializeFirebase, getAuth, getFirestore, getStorage } from './config/firebase.config.js';

// Models
export { User } from './models/User.model.js';
export { Stokvel, StokvelMembership } from './models/Stokvel.model.js';
export { Loan, Referral } from './models/Loan.model.js';
export { FuneralCoverPlan, FuneralCoverMembership, FamilyMember } from './models/FuneralCover.model.js';
export { Product, CartItem, Order } from './models/Product.model.js';

// Repositories
export { userRepository } from './repositories/UserRepository.js';
export { stokvelRepository, contributionRepository } from './repositories/StokvelRepository.js';
export { loanRepository, referralRepository } from './repositories/LoanRepository.js';
export { productRepository, orderRepository } from './repositories/ProductRepository.js';

// Services
export { authService } from './services/AuthService.js';
export { stokvelService } from './services/StokvelService.js';
export { loanService } from './services/LoanService.js';
export { funeralService } from './services/FuneralService.js';
export { storeService } from './services/StoreService.js';

// Core
export { authManager, initializeFirebaseAuth, requireAuth, handlePostLoginRedirect } from './core/AuthManager.js';
export { router, route, navigateTo, ROUTES } from './router.js';
export { initNavigation, nav } from './navigation.js';

// Utilities
export { Validator } from './utils/Validator.js';
export { ErrorHandler } from './utils/ErrorHandler.js';
export { Formatter } from './utils/Formatter.js';

// Legacy utilities (for backwards compatibility)
export { initializeMobileMenu } from './mobile-menu.js';
export { initializeLoanCalculator } from './loan-calculator.js';

/**
 * Initialize the Vema24 application
 * Call this in your page's DOMContentLoaded handler
 */
export async function initVemaApp() {
    try {
        // Initialize Firebase
        initializeFirebase();
        
        // Initialize navigation
        initNavigation();
        
        // Initialize auth
        await authManager.initialize();
        
        // Initialize other components
        initializeMobileMenu();
        
        return {
            success: true,
            message: 'Vema24 app initialized successfully'
        };
    } catch (error) {
        console.error('Error initializing Vema24 app:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Create global Vema object for easy access in browser console (development only)
if (isDevelopment()) {
    window.Vema = {
        authService,
        authManager,
        stokvelService,
        loanService,
        funeralService,
        storeService,
        router,
        Validator,
        ErrorHandler,
        Formatter
    };
}

/**
 * Vema24 — Stokvel application entry (ES module exports)
 */

import { isDevelopment } from './config/environment.js';
import { initializeFirebase } from './config/firebase.config.js';
import { initNavigation } from './navigation.js';
import { authManager } from './core/AuthManager.js';
import { initializeMobileMenu } from './mobile-menu.js';
import { authService } from './services/AuthService.js';
import { stokvelService } from './services/StokvelService.js';
import { router } from './router.js';
import { Validator } from './utils/Validator.js';
import { ErrorHandler } from './utils/ErrorHandler.js';
import { Formatter } from './utils/Formatter.js';

export { logger, currentEnv, isDevelopment, isProduction, getConfig } from './config/environment.js';
export { initializeFirebase, getAuth, getFirestore, getStorage } from './config/firebase.config.js';
export { User } from './models/User.model.js';
export { Stokvel, StokvelMembership } from './models/Stokvel.model.js';
export { userRepository } from './repositories/UserRepository.js';
export { stokvelRepository, contributionRepository } from './repositories/StokvelRepository.js';
export { authService } from './services/AuthService.js';
export { stokvelService } from './services/StokvelService.js';
export { authManager, initializeFirebaseAuth, requireAuth, handlePostLoginRedirect } from './core/AuthManager.js';
export { router, route, navigateTo, ROUTES } from './router.js';
export { initNavigation, nav } from './navigation.js';
export { Validator } from './utils/Validator.js';
export { ErrorHandler } from './utils/ErrorHandler.js';
export { Formatter } from './utils/Formatter.js';
export { initializeMobileMenu } from './mobile-menu.js';

export async function initVemaApp() {
    try {
        initializeFirebase();
        initNavigation();
        await authManager.initialize();
        initializeMobileMenu();
        return { success: true, message: 'Vema24 app initialized successfully' };
    } catch (error) {
        console.error('Error initializing Vema24 app:', error);
        return { success: false, error: error.message };
    }
}

if (isDevelopment()) {
    window.Vema = {
        authService,
        authManager,
        stokvelService,
        router,
        Validator,
        ErrorHandler,
        Formatter,
    };
}

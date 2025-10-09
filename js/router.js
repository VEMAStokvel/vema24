/**
 * Vema24 Robust Routing System
 * Centralized routing configuration for GitHub Pages deployment
 * Automatically handles relative paths based on current location
 */

// Route Configuration - Single source of truth for all routes
export const ROUTES = {
    // Root level pages
    HOME: 'index.html',
    PRIVACY_POLICY: 'privacy-policy.html',
    TERMS_OF_USE: 'terms_of_use.html',
    VEMA_TERMS: 'vema-termsandconds.html',
    JANUARY_TERMS: 'january-stokvel-terms.html',
    PROFILE: 'profile.html',
    TEST_AUTH: 'test-auth.html',
    
    // Auth pages
    AUTH: {
        LOGIN: 'auth/login.html',
        REGISTER: 'auth/register.html',
        FORGOT_PASSWORD: 'auth/forgot-password.html',
        RESET_PASSWORD: 'auth/reset-password.html'
    },
    
    // Dashboard pages
    DASHBOARD: {
        HOME: 'dashboard/index.html',
        STOKVELS: 'dashboard/stokvels.html',
        STOKVEL: 'dashboard/stokvel.html',
        LOANS: 'dashboard/loans.html',
        LOAN_APPLICATION: 'dashboard/Loan Widget/loan-application.html',
        FUNERAL: 'dashboard/funeral.html',
        FUNERAL_FORM: 'dashboard/Funeral Widget/funeral-form.html',
        STORE: 'dashboard/store.html',
        CONSTITUTION: 'dashboard/constitution.html',
        USERS: 'dashboard/users.html',
        SHARED_STYLES: 'dashboard/shared-styles-scripts.html',
        
        // Admin pages
        ADMIN: {
            DASHBOARD: 'dashboard/admin-dashboard.html',
            STOKVELS: 'dashboard/admin-stokvels.html',
            LOANS: 'dashboard/admin-loans.html',
            FUNERALS: 'dashboard/admin-funerals.html'
        }
    },
    
    // Assets
    ASSETS: {
        LOGO_BLACK: 'assets/logo/Vema Black.png',
        LOGO_WHITE: 'assets/logo/Vema White.png',
        CONSTITUTIONS: {
            CREDIT_TERMS: 'assets/constitutions/CreditTerms.pdf',
            FUNERAL_PLAN: 'assets/constitutions/FuneralPlan.pdf',
            GROCERY_STOKVEL: 'assets/constitutions/GroceryStokvel.pdf',
            JANUARY_STOKVEL: 'assets/constitutions/JanuaryStokvel.pdf',
            PLANNING_AHEAD: 'assets/constitutions/PlanningAheadStokvel.pdf',
            POWER_OF_ATTORNEY: 'assets/constitutions/PowerOfAttorney.pdf'
        }
    },
    
    // Styles and Scripts
    CSS: {
        STYLES: 'css/styles.css'
    },
    
    JS: {
        UTILS: 'js/utils.js',
        AUTH: 'js/auth.js',
        FIREBASE: 'js/firebase.js',
        ROUTER: 'js/router.js',
        MOBILE_MENU: 'js/mobile-menu.js',
        LOAN_CALCULATOR: 'js/loan-calculator.js',
        LOANS: 'js/loans.js',
        FUNERAL: 'js/funeral.js',
        STOKVEL: 'js/stokvel.js',
        STORE: 'js/store.js'
    }
};

/**
 * Determines the depth level of current page from root
 * @returns {number} Depth level (0 = root, 1 = auth/dashboard, 2 = widgets)
 */
function getCurrentDepth() {
    const path = window.location.pathname;
    
    // Remove leading/trailing slashes and split
    const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    
    // Remove the last segment (filename)
    const filename = segments.pop();
    
    // If we're at index.html or similar at root, depth is 0
    if (segments.length === 0) return 0;
    
    // Count remaining segments
    return segments.length;
}

/**
 * Generates the correct path prefix based on current page depth
 * @returns {string} Path prefix ('' for root, '../' for depth 1, '../../' for depth 2, etc.)
 */
function getPathPrefix() {
    const depth = getCurrentDepth();
    
    if (depth === 0) return '';
    
    return '../'.repeat(depth);
}

/**
 * Resolves a route path to the correct relative path from current page
 * @param {string} routePath - Path from ROUTES configuration
 * @returns {string} Resolved relative path
 */
export function resolvePath(routePath) {
    const prefix = getPathPrefix();
    return prefix + routePath;
}

/**
 * Gets a nested route value by string path
 * @param {Object} obj - Object to search
 * @param {string} path - Dot-separated path (e.g., 'AUTH.LOGIN')
 * @returns {string} Route path
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Resolves a route by name
 * @param {string} routeName - Route name (e.g., 'AUTH.LOGIN', 'DASHBOARD.HOME')
 * @returns {string} Resolved path
 */
export function route(routeName) {
    const routePath = getNestedValue(ROUTES, routeName);
    
    if (!routePath) {
        console.error(`Route not found: ${routeName}`);
        return '#';
    }
    
    return resolvePath(routePath);
}

/**
 * Navigate to a route
 * @param {string} routeName - Route name to navigate to
 */
export function navigateTo(routeName) {
    const path = route(routeName);
    window.location.href = path;
}

/**
 * Router class for managing navigation
 */
export class Router {
    constructor() {
        this.routes = ROUTES;
        this.currentPath = window.location.pathname;
    }
    
    /**
     * Get resolved path for a route
     */
    getPath(routeName) {
        return route(routeName);
    }
    
    /**
     * Navigate to a route
     */
    navigate(routeName) {
        navigateTo(routeName);
    }
    
    /**
     * Check if current page matches a route
     */
    isCurrentRoute(routeName) {
        const routePath = getNestedValue(ROUTES, routeName);
        return this.currentPath.includes(routePath);
    }
    
    /**
     * Get all auth routes resolved for current page
     */
    getAuthRoutes() {
        return {
            login: route('AUTH.LOGIN'),
            register: route('AUTH.REGISTER'),
            forgotPassword: route('AUTH.FORGOT_PASSWORD'),
            resetPassword: route('AUTH.RESET_PASSWORD')
        };
    }
    
    /**
     * Get all dashboard routes resolved for current page
     */
    getDashboardRoutes() {
        return {
            home: route('DASHBOARD.HOME'),
            stokvels: route('DASHBOARD.STOKVELS'),
            loans: route('DASHBOARD.LOANS'),
            funeral: route('DASHBOARD.FUNERAL'),
            store: route('DASHBOARD.STORE'),
            constitution: route('DASHBOARD.CONSTITUTION'),
            users: route('DASHBOARD.USERS')
        };
    }
    
    /**
     * Get all admin routes resolved for current page
     */
    getAdminRoutes() {
        return {
            dashboard: route('DASHBOARD.ADMIN.DASHBOARD'),
            stokvels: route('DASHBOARD.ADMIN.STOKVELS'),
            loans: route('DASHBOARD.ADMIN.LOANS'),
            funerals: route('DASHBOARD.ADMIN.FUNERALS')
        };
    }
    
    /**
     * Get asset paths resolved for current page
     */
    getAssetPaths() {
        return {
            logoBlack: resolvePath(ROUTES.ASSETS.LOGO_BLACK),
            logoWhite: resolvePath(ROUTES.ASSETS.LOGO_WHITE),
            css: resolvePath(ROUTES.CSS.STYLES)
        };
    }
}

// Create singleton instance
export const router = new Router();

// Export route helper for convenient access
export { ROUTES as routes };

/**
 * Initialize router for a page
 * Call this in your page's DOMContentLoaded handler
 */
export function initRouter() {
    console.log('Router initialized for:', window.location.pathname);
    console.log('Current depth:', getCurrentDepth());
    console.log('Path prefix:', getPathPrefix());
    
    // Add router to window for debugging
    window.__router = router;
    window.__route = route; // Expose route function for console testing
    
    return router;
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}


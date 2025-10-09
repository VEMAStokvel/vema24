/**
 * Navigation Helper Module
 * Provides easy-to-use navigation functions using the robust routing system
 */

import { router, route } from './router.js';

/**
 * Update navigation links in the page header
 * Automatically resolves all paths based on current page location
 */
export function updateNavigationLinks() {
    try {
        const authRoutes = router.getAuthRoutes();
        const dashboardRoutes = router.getDashboardRoutes();
        
        // Mobile navigation
        const mobileLogin = document.getElementById('mobile-login');
        const mobileRegister = document.getElementById('mobile-register');
        const mobileDashboard = document.getElementById('mobile-dashboard');
        
        if (mobileLogin) mobileLogin.href = authRoutes.login;
        if (mobileRegister) mobileRegister.href = authRoutes.register;
        if (mobileDashboard) mobileDashboard.href = dashboardRoutes.home;
        
        // Desktop navigation
        const desktopLogin = document.getElementById('desktop-login');
        const desktopRegister = document.getElementById('desktop-register');
        const desktopDashboard = document.getElementById('desktop-dashboard');
        
        if (desktopLogin) desktopLogin.href = authRoutes.login;
        if (desktopRegister) desktopRegister.href = authRoutes.register;
        if (desktopDashboard) desktopDashboard.href = dashboardRoutes.home;
        
        // Hero section
        const heroCta = document.getElementById('hero-cta');
        const heroDashboard = document.getElementById('hero-dashboard');
        
        if (heroCta) heroCta.href = authRoutes.register;
        if (heroDashboard) heroDashboard.href = dashboardRoutes.home;
        
        console.log('✓ Navigation links updated successfully');
    } catch (error) {
        console.error('Error updating navigation links:', error);
    }
}

/**
 * Update all "Join Now" buttons to use the router
 */
export function updateJoinNowButtons() {
    try {
        const registerPath = router.getAuthRoutes().register;
        const joinButtons = document.querySelectorAll('a[href*="register"]');
        
        joinButtons.forEach(button => {
            button.href = registerPath;
        });
        
        console.log(`✓ Updated ${joinButtons.length} Join Now button(s)`);
    } catch (error) {
        console.error('Error updating Join Now buttons:', error);
    }
}

/**
 * Update logo images to use the router
 */
export function updateLogoImages() {
    try {
        const assets = router.getAssetPaths();
        
        // Update all Vema logo images
        const logoImages = document.querySelectorAll('img[alt*="Vema"]');
        
        logoImages.forEach(img => {
            if (img.src.includes('Black')) {
                img.src = assets.logoBlack;
            } else if (img.src.includes('White')) {
                img.src = assets.logoWhite;
            }
        });
        
        console.log(`✓ Updated ${logoImages.length} logo image(s)`);
    } catch (error) {
        console.error('Error updating logo images:', error);
    }
}

/**
 * Update dashboard navigation links
 */
export function updateDashboardNavigation() {
    try {
        const dashboardRoutes = router.getDashboardRoutes();
        
        // Map of element IDs to routes
        const navMap = {
            'nav-dashboard': dashboardRoutes.home,
            'nav-stokvels': dashboardRoutes.stokvels,
            'nav-loans': dashboardRoutes.loans,
            'nav-funeral': dashboardRoutes.funeral,
            'nav-store': dashboardRoutes.store,
            'nav-profile': route('PROFILE'),
            'nav-logout': route('AUTH.LOGIN')
        };
        
        Object.entries(navMap).forEach(([id, path]) => {
            const element = document.getElementById(id);
            if (element) {
                element.href = path;
            }
        });
        
        console.log('✓ Dashboard navigation updated successfully');
    } catch (error) {
        console.error('Error updating dashboard navigation:', error);
    }
}

/**
 * Update admin navigation links
 */
export function updateAdminNavigation() {
    try {
        const adminRoutes = router.getAdminRoutes();
        
        const navMap = {
            'admin-nav-dashboard': adminRoutes.dashboard,
            'admin-nav-stokvels': adminRoutes.stokvels,
            'admin-nav-loans': adminRoutes.loans,
            'admin-nav-funerals': adminRoutes.funerals,
            'admin-nav-users': route('DASHBOARD.USERS')
        };
        
        Object.entries(navMap).forEach(([id, path]) => {
            const element = document.getElementById(id);
            if (element) {
                element.href = path;
            }
        });
        
        console.log('✓ Admin navigation updated successfully');
    } catch (error) {
        console.error('Error updating admin navigation:', error);
    }
}

/**
 * Initialize all navigation for the current page
 * Call this after DOM is loaded
 */
export function initNavigation() {
    updateNavigationLinks();
    updateJoinNowButtons();
    updateLogoImages();
    
    // Check if we're on a dashboard page
    if (window.location.pathname.includes('dashboard')) {
        updateDashboardNavigation();
        
        // Check if admin page
        if (window.location.pathname.includes('admin')) {
            updateAdminNavigation();
        }
    }
    
    console.log('✓ Navigation system initialized');
}

/**
 * Create a navigation helper object for easy access
 */
export const nav = {
    /**
     * Go to home page
     */
    home() {
        router.navigate('HOME');
    },
    
    /**
     * Go to login page
     */
    login() {
        router.navigate('AUTH.LOGIN');
    },
    
    /**
     * Go to register page
     */
    register() {
        router.navigate('AUTH.REGISTER');
    },
    
    /**
     * Go to dashboard
     */
    dashboard() {
        router.navigate('DASHBOARD.HOME');
    },
    
    /**
     * Go to specific dashboard page
     */
    dashboardPage(page) {
        const pageMap = {
            stokvels: 'DASHBOARD.STOKVELS',
            loans: 'DASHBOARD.LOANS',
            funeral: 'DASHBOARD.FUNERAL',
            store: 'DASHBOARD.STORE'
        };
        
        const routeName = pageMap[page];
        if (routeName) {
            router.navigate(routeName);
        } else {
            console.error(`Unknown dashboard page: ${page}`);
        }
    },
    
    /**
     * Go to admin page
     */
    admin(page = 'dashboard') {
        const pageMap = {
            dashboard: 'DASHBOARD.ADMIN.DASHBOARD',
            stokvels: 'DASHBOARD.ADMIN.STOKVELS',
            loans: 'DASHBOARD.ADMIN.LOANS',
            funerals: 'DASHBOARD.ADMIN.FUNERALS'
        };
        
        const routeName = pageMap[page];
        if (routeName) {
            router.navigate(routeName);
        } else {
            console.error(`Unknown admin page: ${page}`);
        }
    },
    
    /**
     * Go to profile page
     */
    profile() {
        router.navigate('PROFILE');
    }
};

// Export router for advanced usage
export { router };


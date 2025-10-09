# Vema24 Robust Routing System

## 📋 Overview

A centralized, maintainable routing system for the Vema24 website. This system automatically handles relative path resolution based on page depth, making it perfect for GitHub Pages deployment.

## 🎯 Key Features

- ✅ **Centralized Configuration**: All routes defined in one place
- ✅ **Automatic Path Resolution**: Handles relative paths based on page depth
- ✅ **GitHub Pages Compatible**: Works perfectly with subdirectory deployments
- ✅ **Type-Safe Navigation**: Clear route names prevent typos
- ✅ **Easy Maintenance**: Change a route in one place, updates everywhere
- ✅ **Debug Mode**: Built-in logging for development

## 📁 File Structure

```
js/
├── router.js        # Core routing engine and configuration
├── navigation.js    # Navigation helpers and utilities
└── utils.js         # Integrated with router for auth flows
```

## 🚀 Quick Start

### 1. Import the Navigation System

```javascript
// In your HTML file
<script type="module">
    import { initNavigation } from './js/navigation.js';
    
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize navigation first
        initNavigation();
        
        // Then initialize other components
        // ...
    });
</script>
```

### 2. Use Route Names Instead of Hardcoded Paths

❌ **Before (Hardcoded paths)**:
```html
<a href="/auth/login.html">Login</a>
<a href="../../dashboard/index.html">Dashboard</a>
```

✅ **After (Using router)**:
```javascript
import { route } from './js/router.js';

// Automatically resolves to correct relative path
const loginPath = route('AUTH.LOGIN');
const dashboardPath = route('DASHBOARD.HOME');
```

## 📖 Route Reference

### Root Level Pages
```javascript
route('HOME')                    // index.html
route('PRIVACY_POLICY')          // privacy-policy.html
route('TERMS_OF_USE')            // terms_of_use.html
route('VEMA_TERMS')              // vema-termsandconds.html
route('PROFILE')                 // profile.html
```

### Auth Pages
```javascript
route('AUTH.LOGIN')              // auth/login.html
route('AUTH.REGISTER')           // auth/register.html
route('AUTH.FORGOT_PASSWORD')    // auth/forgot-password.html
route('AUTH.RESET_PASSWORD')     // auth/reset-password.html
```

### Dashboard Pages
```javascript
route('DASHBOARD.HOME')          // dashboard/index.html
route('DASHBOARD.STOKVELS')      // dashboard/stokvels.html
route('DASHBOARD.LOANS')         // dashboard/loans.html
route('DASHBOARD.FUNERAL')       // dashboard/funeral.html
route('DASHBOARD.STORE')         // dashboard/store.html
route('DASHBOARD.CONSTITUTION')  // dashboard/constitution.html
route('DASHBOARD.USERS')         // dashboard/users.html
```

### Admin Pages
```javascript
route('DASHBOARD.ADMIN.DASHBOARD')  // dashboard/admin-dashboard.html
route('DASHBOARD.ADMIN.STOKVELS')   // dashboard/admin-stokvels.html
route('DASHBOARD.ADMIN.LOANS')      // dashboard/admin-loans.html
route('DASHBOARD.ADMIN.FUNERALS')   // dashboard/admin-funerals.html
```

### Assets
```javascript
route('ASSETS.LOGO_BLACK')       // assets/logo/Vema Black.png
route('ASSETS.LOGO_WHITE')       // assets/logo/Vema White.png
route('CSS.STYLES')              // css/styles.css
```

## 💡 Usage Examples

### Example 1: Navigation Links

```html
<script type="module">
    import { router } from './js/navigation.js';
    
    // Get all auth routes
    const authRoutes = router.getAuthRoutes();
    
    document.getElementById('login-btn').href = authRoutes.login;
    document.getElementById('register-btn').href = authRoutes.register;
</script>
```

### Example 2: Programmatic Navigation

```javascript
import { nav } from './js/navigation.js';

// Navigate to different pages
nav.login();                    // Go to login page
nav.register();                 // Go to register page
nav.dashboard();                // Go to dashboard home
nav.dashboardPage('loans');     // Go to loans page
nav.admin('stokvels');          // Go to admin stokvels page
```

### Example 3: Protected Routes

```javascript
import { requireAuth } from './js/utils.js';
import { route } from './js/router.js';

// Protect a button click
document.getElementById('apply-loan').addEventListener('click', function(e) {
    e.preventDefault();
    
    requireAuth(route('DASHBOARD.LOANS'), 'apply for a loan')
        .then(() => {
            window.location.href = route('DASHBOARD.LOANS');
        });
});
```

### Example 4: Dynamic Link Updates

```javascript
import { initNavigation } from './js/navigation.js';

// Automatically updates ALL navigation links on the page
initNavigation();

// This updates:
// - Mobile navigation
// - Desktop navigation
// - Hero buttons
// - Join Now buttons
// - Logo images
// - Dashboard navigation (if on dashboard page)
```

## 🔧 Advanced Usage

### Router Class Methods

```javascript
import { router } from './js/router.js';

// Get a specific route path
const loginPath = router.getPath('AUTH.LOGIN');

// Navigate programmatically
router.navigate('DASHBOARD.HOME');

// Check if current page is a specific route
if (router.isCurrentRoute('AUTH.LOGIN')) {
    console.log('We are on the login page');
}

// Get all dashboard routes at once
const dashRoutes = router.getDashboardRoutes();
console.log(dashRoutes.home);      // Resolved path to dashboard home
console.log(dashRoutes.stokvels);  // Resolved path to stokvels
```

### Path Resolution

The router automatically calculates the correct relative path based on where the current page is located:

```javascript
// If you're on: index.html (root)
route('AUTH.LOGIN') // Returns: auth/login.html

// If you're on: auth/login.html (1 level deep)
route('DASHBOARD.HOME') // Returns: ../dashboard/index.html

// If you're on: dashboard/Loan Widget/loan-application.html (2 levels deep)
route('HOME') // Returns: ../../index.html
```

## 📝 Adding New Routes

### Step 1: Add to Route Configuration

Edit `js/router.js` and add your route to the `ROUTES` object:

```javascript
export const ROUTES = {
    // ... existing routes ...
    
    // Add your new route
    NEW_PAGE: 'new-page.html',
    
    // Or in a category
    DASHBOARD: {
        // ... existing dashboard routes ...
        NEW_FEATURE: 'dashboard/new-feature.html'
    }
};
```

### Step 2: Use the New Route

```javascript
import { route } from './js/router.js';

// Use it anywhere
const newPagePath = route('NEW_PAGE');
const newFeaturePath = route('DASHBOARD.NEW_FEATURE');
```

### Step 3: Update Navigation Helper (Optional)

If you want convenience methods, add to `js/navigation.js`:

```javascript
export const nav = {
    // ... existing methods ...
    
    newFeature() {
        router.navigate('DASHBOARD.NEW_FEATURE');
    }
};
```

## 🐛 Debugging

### Enable Debug Mode

The router logs helpful information to the console:

```javascript
// Check router initialization
console.log(window.__router);

// See current depth calculation
// See path prefix being used
// See which navigation links were updated
```

### Common Issues

**Issue**: Links not updating
**Solution**: Make sure `initNavigation()` is called after DOM loads

**Issue**: Wrong paths generated
**Solution**: Check that your page depth is calculated correctly

**Issue**: Module import errors
**Solution**: Ensure you're using `type="module"` in script tags

## 📊 Architecture

```
┌─────────────────────────────────────┐
│      js/router.js                   │
│  - Route definitions (ROUTES)       │
│  - Path resolution logic             │
│  - Router class                      │
└──────────────┬──────────────────────┘
               │
               ├─> Imported by
               │
┌──────────────▼──────────────────────┐
│      js/navigation.js                │
│  - Navigation helpers                │
│  - Link update functions             │
│  - nav object for easy navigation    │
└──────────────┬──────────────────────┘
               │
               ├─> Used in
               │
┌──────────────▼──────────────────────┐
│      HTML files                      │
│  - Call initNavigation()             │
│  - Use route() function              │
│  - Access nav object                 │
└──────────────────────────────────────┘
```

## ✅ Best Practices

1. **Always use route names**, never hardcode paths
2. **Call initNavigation()** on every page after DOM loads
3. **Add new routes** to the ROUTES configuration first
4. **Use semantic route names** that describe the destination
5. **Test navigation** from different page depths

## 🚀 Deployment

The routing system is fully compatible with:
- ✅ GitHub Pages (subdirectory deployments)
- ✅ Custom domains
- ✅ Local development servers
- ✅ Any static file hosting

No configuration changes needed for deployment!

## 📚 Full Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
</head>
<body>
    <nav>
        <a href="#" id="login-link">Login</a>
        <a href="#" id="dashboard-link">Dashboard</a>
    </nav>
    
    <button id="protected-action">Protected Action</button>
    
    <script type="module">
        import { initNavigation, nav } from './js/navigation.js';
        import { requireAuth } from './js/utils.js';
        import { route } from './js/router.js';
        
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize navigation system
            initNavigation();
            
            // Manual link updates if needed
            document.getElementById('login-link').href = nav.router.getAuthRoutes().login;
            document.getElementById('dashboard-link').href = nav.router.getDashboardRoutes().home;
            
            // Protected button
            document.getElementById('protected-action').addEventListener('click', function(e) {
                e.preventDefault();
                requireAuth(route('DASHBOARD.LOANS'), 'access loans')
                    .then(() => nav.dashboardPage('loans'));
            });
        });
    </script>
</body>
</html>
```

## 🎓 Migration Guide

### From Absolute Paths

**Before**:
```html
<a href="/auth/login.html">Login</a>
```

**After**:
```html
<a href="#" id="login-link">Login</a>
<script type="module">
    import { initNavigation } from './js/navigation.js';
    initNavigation(); // Automatically updates all links
</script>
```

### From Relative Paths

**Before**:
```html
<a href="../../dashboard/index.html">Dashboard</a>
```

**After**:
```javascript
import { route } from './js/router.js';
element.href = route('DASHBOARD.HOME');
```

---

**Made with ❤️ for Vema24** | [GitHub Repository](https://github.com/VEMAStokvel/vema24)


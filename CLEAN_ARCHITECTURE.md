# Vema24 Clean Architecture Documentation

## 📐 Architecture Overview

Vema24 now follows **Clean Architecture** principles with clear separation of concerns, making the codebase more maintainable, testable, and scalable.

## 🏗️ Folder Structure

```
js/
├── config/                    # Configuration layer
│   ├── environment.js         # Environment management (dev/prod)
│   └── firebase.config.js     # Firebase configuration
│
├── models/                    # Data models layer
│   ├── User.model.js          # User entity
│   ├── Stokvel.model.js       # Stokvel entities
│   ├── Loan.model.js          # Loan entities
│   ├── FuneralCover.model.js  # Funeral cover entities
│   └── Product.model.js       # Product and Order entities
│
├── repositories/              # Data access layer
│   ├── BaseRepository.js      # Base repository with CRUD operations
│   ├── UserRepository.js      # User data access
│   ├── StokvelRepository.js   # Stokvel data access
│   ├── LoanRepository.js      # Loan data access
│   └── ProductRepository.js   # Product data access
│
├── services/                  # Business logic layer
│   ├── AuthService.js         # Authentication business logic
│   ├── StokvelService.js      # Stokvel business logic
│   ├── LoanService.js         # Loan business logic
│   ├── FuneralService.js      # Funeral cover business logic
│   └── StoreService.js        # Store business logic
│
├── core/                      # Core application logic
│   └── AuthManager.js         # Auth UI manager
│
├── utils/                     # Utility functions
│   ├── Validator.js           # Input validation
│   ├── ErrorHandler.js        # Error handling and user notifications
│   └── Formatter.js           # Data formatting
│
├── router.js                  # Routing system
├── navigation.js              # Navigation helpers
├── mobile-menu.js             # Mobile menu component
├── loan-calculator.js         # Loan calculator component
└── vema-app.js                # Main entry point
```

## 🔄 Architecture Layers

### 1. **Configuration Layer** (`js/config/`)

**Purpose**: Manage environment-specific settings and external service configurations.

**Files**:
- `environment.js`: Detects environment (dev/prod), manages logging, and provides environment-specific settings
- `firebase.config.js`: Firebase initialization and service getters

**Example Usage**:
```javascript
import { logger, isDevelopment } from './config/environment.js';
import { getFirestore } from './config/firebase.config.js';

logger.log('Application started');
const db = getFirestore();
```

### 2. **Models Layer** (`js/models/`)

**Purpose**: Define data structures and entity-specific business logic.

**Key Features**:
- Convert between Firestore documents and JavaScript objects
- Entity-specific calculations and validations
- Type-safe data structures

**Example**:
```javascript
import { User } from './models/User.model.js';

const user = new User({
    email: 'user@example.com',
    displayName: 'John Doe',
    savingsTotal: 10000
});

const discount = user.calculateDiscount(); // 25%
const firestoreData = user.toFirestore();
```

### 3. **Repositories Layer** (`js/repositories/`)

**Purpose**: Handle all data access operations (CRUD) with Firestore.

**Key Features**:
- Extends BaseRepository for common CRUD operations
- Domain-specific query methods
- Abstracts Firebase/Firestore implementation

**Example**:
```javascript
import { userRepository } from './repositories/UserRepository.js';

// Get user
const user = await userRepository.getUserById(userId);

// Update user
await userRepository.updateSavingsTotal(userId, 1000);

// Query users
const admins = await userRepository.getUsersByRole('admin');
```

### 4. **Services Layer** (`js/services/`)

**Purpose**: Implement business logic and orchestrate operations across multiple repositories.

**Key Features**:
- Business rules and validations
- Complex operations involving multiple entities
- Transaction management
- Returns structured responses (`{ success, data, error }`)

**Example**:
```javascript
import { stokvelService } from './services/StokvelService.js';

// Join a stokvel
const result = await stokvelService.joinStokvel(
    userId,
    'January',
    500,
    'bank_transfer'
);

if (result.success) {
    console.log('Joined stokvel:', result.stokvel);
} else {
    console.error('Error:', result.error);
}

// Make contribution
const contribution = await stokvelService.makeContribution(
    userId,
    stokvelId,
    500,
    'bank_transfer'
);
```

### 5. **Core Layer** (`js/core/`)

**Purpose**: High-level application managers that integrate services with UI.

**Files**:
- `AuthManager.js`: Manages authentication state and UI updates

**Example**:
```javascript
import { authManager } from './core/AuthManager.js';

// Initialize authentication
await authManager.initialize();

// Listen for auth state changes
authManager.onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user.email);
    } else {
        console.log('User signed out');
    }
});

// Require authentication for protected routes
authManager.requireAuth('dashboard/index.html', 'access dashboard')
    .then((user) => {
        // User is authenticated
    })
    .catch(() => {
        // Redirected to login
    });
```

### 6. **Utilities Layer** (`js/utils/`)

**Purpose**: Provide reusable utility functions.

**Files**:
- `Validator.js`: Input validation (email, phone, ID, passwords)
- `ErrorHandler.js`: Centralized error handling and user notifications
- `Formatter.js`: Data formatting (currency, dates, numbers)

**Examples**:

```javascript
import { Validator } from './utils/Validator.js';

// Validate email
if (Validator.isValidEmail(email)) {
    // Valid email
}

// Validate form
const result = Validator.validateForm(formData, {
    email: { required: true, email: true, label: 'Email' },
    password: { required: true, minLength: 8, label: 'Password' }
});

if (result.isValid) {
    // Form is valid
} else {
    // Show errors
    console.log(result.errors);
}
```

```javascript
import { ErrorHandler } from './utils/ErrorHandler.js';

// Show error
ErrorHandler.showError('Something went wrong');

// Show success
ErrorHandler.showSuccess('Operation completed successfully');

// Wrap async operation with error handling
await ErrorHandler.tryAsync(async () => {
    await someAsyncOperation();
}, 'performing operation');
```

```javascript
import { Formatter } from './utils/Formatter.js';

// Format currency
const formatted = Formatter.formatCurrency(1234.56); // "R 1,234.56"

// Format date
const date = Formatter.formatDate(new Date()); // "2024/12/14"

// Format relative date
const relative = Formatter.formatRelativeDate(new Date(Date.now() - 3600000)); // "1 hour ago"

// Format phone number
const phone = Formatter.formatPhoneNumber('0821234567'); // "082 123 4567"
```

## 🚀 Getting Started

### Basic Page Setup

Every page should follow this pattern:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/12.0.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore-compat.js"></script>
</head>
<body>
    <!-- Your content here -->
    
    <script type="module">
        import { initVemaApp, authService, stokvelService, ErrorHandler } from './js/vema-app.js';
        
        document.addEventListener('DOMContentLoaded', async () => {
            // Initialize app
            await initVemaApp();
            
            // Your page logic here
            try {
                const result = await stokvelService.getUserStokvels(userId);
                if (result.success) {
                    displayStokvels(result.stokvels);
                } else {
                    ErrorHandler.showError(result.error);
                }
            } catch (error) {
                ErrorHandler.handleError(error, 'loading stokvels');
            }
        });
    </script>
</body>
</html>
```

## 📚 Common Patterns

### Pattern 1: User Authentication

```javascript
import { authService, ErrorHandler } from './js/vema-app.js';

// Sign in
async function signIn(email, password) {
    const result = await authService.signIn(email, password);
    
    if (result.success) {
        ErrorHandler.showSuccess('Welcome back!');
        window.location.href = 'dashboard/index.html';
    } else {
        ErrorHandler.showError(result.error);
    }
}

// Register
async function register(email, password, displayName) {
    const result = await authService.register(email, password, displayName);
    
    if (result.success) {
        ErrorHandler.showSuccess('Registration successful!');
        window.location.href = 'dashboard/index.html';
    } else {
        ErrorHandler.showError(result.error);
    }
}

// Sign out
async function signOut() {
    const result = await authService.signOut();
    
    if (result.success) {
        window.location.href = 'index.html';
    }
}
```

### Pattern 2: Form Validation and Submission

```javascript
import { Validator, ErrorHandler, stokvelService } from './js/vema-app.js';

async function handleStokvelJoinForm(event) {
    event.preventDefault();
    
    const formData = {
        stokvelType: document.getElementById('stokvel-type').value,
        monthlyAmount: document.getElementById('monthly-amount').value,
        paymentMethod: document.getElementById('payment-method').value
    };
    
    // Validate
    const validation = Validator.validateForm(formData, {
        stokvelType: { required: true, label: 'Stokvel Type' },
        monthlyAmount: { required: true, label: 'Monthly Amount' },
        paymentMethod: { required: true, label: 'Payment Method' }
    });
    
    if (!validation.isValid) {
        ErrorHandler.showFieldErrors(validation.errors);
        return;
    }
    
    // Clear previous errors
    ErrorHandler.clearFieldErrors(event.target);
    
    // Submit
    ErrorHandler.showLoading('Joining stokvel...');
    
    const result = await stokvelService.joinStokvel(
        userId,
        formData.stokvelType,
        parseFloat(formData.monthlyAmount),
        formData.paymentMethod
    );
    
    ErrorHandler.hideLoading();
    
    if (result.success) {
        ErrorHandler.showSuccess('Successfully joined stokvel!');
        // Refresh page or update UI
    } else {
        ErrorHandler.showError(result.error);
    }
}
```

### Pattern 3: Loading and Displaying Data

```javascript
import { stokvelService, Formatter, ErrorHandler } from './js/vema-app.js';

async function loadUserStokvels(userId) {
    try {
        ErrorHandler.showLoading('Loading stokvels...');
        
        const result = await stokvelService.getUserStokvels(userId);
        
        ErrorHandler.hideLoading();
        
        if (result.success) {
            displayStokvels(result.stokvels);
            updateSummary(result.totalSavings, result.storeDiscount);
        } else {
            ErrorHandler.showError(result.error);
        }
    } catch (error) {
        ErrorHandler.hideLoading();
        ErrorHandler.handleError(error, 'loading stokvels');
    }
}

function displayStokvels(stokvels) {
    const container = document.getElementById('stokvels-list');
    container.innerHTML = '';
    
    stokvels.forEach(stokvel => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow';
        card.innerHTML = `
            <h3 class="font-bold">${stokvel.name}</h3>
            <p class="text-gray-600">${stokvel.type}</p>
            <p class="text-xl font-bold text-blue-600">
                ${Formatter.formatCurrency(stokvel.balance)}
            </p>
            <p class="text-sm text-gray-500">
                Next contribution: ${Formatter.formatDate(stokvel.nextContributionDate)}
            </p>
        `;
        container.appendChild(card);
    });
}
```

## 🔒 Security Best Practices

1. **Always validate user input**:
   ```javascript
   const validation = Validator.validateForm(data, rules);
   ```

2. **Sanitize user input before display**:
   ```javascript
   const safe = Validator.sanitize(userInput);
   ```

3. **Use try-catch blocks for async operations**:
   ```javascript
   try {
       const result = await service.operation();
   } catch (error) {
       ErrorHandler.handleError(error, 'operation name');
   }
   ```

4. **Check authentication before operations**:
   ```javascript
   await authManager.requireAuth(redirectPath, actionName);
   ```

## 📊 Error Handling Strategy

All services return structured responses:

```javascript
{
    success: boolean,
    data?: any,          // On success
    error?: string,      // On failure
    message?: string     // Additional info
}
```

Always check the `success` property:

```javascript
const result = await service.operation();

if (result.success) {
    // Handle success
    console.log(result.data);
} else {
    // Handle error
    ErrorHandler.showError(result.error);
}
```

## 🧪 Testing Recommendations

### Unit Testing

Test each layer independently:

```javascript
// Test service logic
import { stokvelService } from './services/StokvelService.js';

describe('StokvelService', () => {
    it('should validate stokvel type', () => {
        const config = stokvelService.getStokvelTypeConfig('January');
        expect(config).toBeDefined();
        expect(config.type).toBe('January');
    });
});
```

### Integration Testing

Test services with repositories:

```javascript
// Mock repository
const mockRepository = {
    createStokvel: jest.fn().mockResolvedValue({ id: '123' })
};

// Test service with mocked repository
```

## 📈 Performance Optimization

1. **Use repository caching** for frequently accessed data
2. **Implement pagination** for large lists
3. **Lazy load** components and modules
4. **Use debounce** for search inputs

## 🔄 Migration Guide

### Migrating Existing Code

**Old code**:
```javascript
db.collection('users').doc(userId).get()
    .then(doc => {
        const userData = doc.data();
        // ...
    });
```

**New code**:
```javascript
const user = await userRepository.getUserById(userId);
```

**Old code**:
```javascript
firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // ...
    })
    .catch((error) => {
        alert(error.message);
    });
```

**New code**:
```javascript
const result = await authService.signIn(email, password);
if (result.success) {
    // Success
} else {
    ErrorHandler.showError(result.error);
}
```

## 📞 Support

For questions or issues with the clean architecture:
1. Check this documentation
2. Review the code comments in each file
3. Check the browser console for detailed error messages (dev mode)
4. Use `window.Vema` in browser console (dev mode) to inspect services

## 🎯 Future Enhancements

- [ ] Add TypeScript for type safety
- [ ] Implement comprehensive unit tests
- [ ] Add caching layer for repositories
- [ ] Implement offline support with service workers
- [ ] Add real-time updates with Firestore listeners
- [ ] Create admin dashboard using clean architecture

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Vema24 Development Team

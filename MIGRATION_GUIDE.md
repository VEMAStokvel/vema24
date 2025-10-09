# Migration Guide: Updating Vema24 Pages to Use Clean Architecture

This guide helps you migrate existing Vema24 pages to use the new clean architecture.

## Quick Migration Checklist

- [ ] Replace direct Firebase calls with service calls
- [ ] Replace direct Firestore calls with repository calls
- [ ] Use ErrorHandler instead of alert()
- [ ] Use Formatter for displaying data
- [ ] Use Validator for form validation
- [ ] Import from vema-app.js instead of individual files

## Step-by-Step Migration

### Step 1: Update HTML Script Imports

**Before:**
```html
<script type="module">
    import { auth } from './js/firebase.js';
    import { initializeFirebaseAuth } from './js/utils.js';
    
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeFirebaseAuth();
        // ...
    });
</script>
```

**After:**
```html
<script type="module">
    import { initVemaApp, authService, stokvelService } from './js/vema-app.js';
    
    document.addEventListener('DOMContentLoaded', async () => {
        await initVemaApp();
        // ...
    });
</script>
```

### Step 2: Replace Direct Firebase Auth Calls

**Before:**
```javascript
firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        window.location.href = 'dashboard/index.html';
    })
    .catch((error) => {
        alert(error.message);
    });
```

**After:**
```javascript
import { authService, ErrorHandler } from './js/vema-app.js';

const result = await authService.signIn(email, password);
if (result.success) {
    ErrorHandler.showSuccess('Welcome back!');
    window.location.href = 'dashboard/index.html';
} else {
    ErrorHandler.showError(result.error);
}
```

### Step 3: Replace Direct Firestore Calls

**Before:**
```javascript
db.collection('users').doc(userId).get()
    .then(doc => {
        const userData = doc.data();
        document.getElementById('savings').textContent = 
            `R${userData.savingsTotal.toLocaleString()}`;
    })
    .catch(error => {
        console.error(error);
        alert('Failed to load data');
    });
```

**After:**
```javascript
import { userRepository, Formatter, ErrorHandler } from './js/vema-app.js';

try {
    const user = await userRepository.getUserById(userId);
    document.getElementById('savings').textContent = 
        Formatter.formatCurrency(user.savingsTotal);
} catch (error) {
    ErrorHandler.handleError(error, 'loading user data');
}
```

### Step 4: Replace Stokvel Operations

**Before:**
```javascript
// Join stokvel
db.collection('stokvels').add(stokvelData)
    .then(stokvelRef => {
        // Add to user
        return db.collection('users').doc(userId).update({
            stokvels: firebase.firestore.FieldValue.arrayUnion(userStokvel)
        });
    })
    .then(() => {
        alert('Successfully joined stokvel!');
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
```

**After:**
```javascript
import { stokvelService, ErrorHandler } from './js/vema-app.js';

const result = await stokvelService.joinStokvel(
    userId,
    stokvelType,
    monthlyAmount,
    paymentMethod
);

if (result.success) {
    ErrorHandler.showSuccess('Successfully joined stokvel!');
} else {
    ErrorHandler.showError(result.error);
}
```

### Step 5: Add Form Validation

**Before:**
```javascript
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = form.email.value;
    const password = form.password.value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Submit form
});
```

**After:**
```javascript
import { Validator, ErrorHandler } from './js/vema-app.js';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: form.email.value,
        password: form.password.value
    };
    
    const validation = Validator.validateForm(formData, {
        email: { required: true, email: true, label: 'Email' },
        password: { required: true, minLength: 6, label: 'Password' }
    });
    
    if (!validation.isValid) {
        ErrorHandler.showFieldErrors(validation.errors);
        return;
    }
    
    ErrorHandler.clearFieldErrors(form);
    
    // Submit form
});
```

### Step 6: Update Data Display with Formatting

**Before:**
```javascript
document.getElementById('amount').textContent = `R${amount.toLocaleString()}`;
document.getElementById('date').textContent = new Date(date).toLocaleDateString();
document.getElementById('phone').textContent = phone;
```

**After:**
```javascript
import { Formatter } from './js/vema-app.js';

document.getElementById('amount').textContent = Formatter.formatCurrency(amount);
document.getElementById('date').textContent = Formatter.formatDate(date);
document.getElementById('phone').textContent = Formatter.formatPhoneNumber(phone);
```

## Example: Complete Page Migration

### Before (Old Style)

```html
<script type="module">
    import { auth, db } from './js/firebase.js';
    import { initializeFirebaseAuth } from './js/utils.js';
    
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeFirebaseAuth();
        
        const userId = auth.currentUser?.uid;
        if (!userId) {
            window.location.href = 'auth/login.html';
            return;
        }
        
        // Load stokvels
        db.collection('users').doc(userId).get()
            .then(doc => {
                const userData = doc.data();
                const stokvels = userData.stokvels || [];
                
                stokvels.forEach(stokvel => {
                    const card = document.createElement('div');
                    card.innerHTML = `
                        <h3>${stokvel.name}</h3>
                        <p>R${stokvel.balance.toLocaleString()}</p>
                    `;
                    document.getElementById('stokvels').appendChild(card);
                });
            })
            .catch(error => {
                console.error(error);
                alert('Failed to load stokvels');
            });
    });
</script>
```

### After (New Clean Architecture)

```html
<script type="module">
    import { 
        initVemaApp, 
        authManager, 
        stokvelService, 
        Formatter, 
        ErrorHandler 
    } from './js/vema-app.js';
    
    document.addEventListener('DOMContentLoaded', async () => {
        await initVemaApp();
        
        // Require authentication
        try {
            await authManager.requireAuth('dashboard/index.html', 'view dashboard');
            const userId = authManager.getCurrentUser().uid;
            await loadStokvels(userId);
        } catch (error) {
            // User will be redirected to login
        }
    });
    
    async function loadStokvels(userId) {
        try {
            ErrorHandler.showLoading('Loading stokvels...');
            
            const result = await stokvelService.getUserStokvels(userId);
            
            ErrorHandler.hideLoading();
            
            if (result.success) {
                displayStokvels(result.stokvels);
            } else {
                ErrorHandler.showError(result.error);
            }
        } catch (error) {
            ErrorHandler.hideLoading();
            ErrorHandler.handleError(error, 'loading stokvels');
        }
    }
    
    function displayStokvels(stokvels) {
        const container = document.getElementById('stokvels');
        container.innerHTML = '';
        
        stokvels.forEach(stokvel => {
            const card = document.createElement('div');
            card.innerHTML = `
                <h3>${stokvel.name}</h3>
                <p>${Formatter.formatCurrency(stokvel.balance)}</p>
            `;
            container.appendChild(card);
        });
    }
</script>
```

## Common Patterns and Replacements

### Pattern 1: Getting Current User

**Before:**
```javascript
const userId = auth.currentUser?.uid;
```

**After:**
```javascript
const userId = authManager.getCurrentUser()?.uid;
```

### Pattern 2: Error Handling

**Before:**
```javascript
.catch(error => {
    console.error(error);
    alert(error.message);
});
```

**After:**
```javascript
} catch (error) {
    ErrorHandler.handleError(error, 'operation name');
}
```

### Pattern 3: Loading States

**Before:**
```javascript
document.getElementById('loading').classList.remove('hidden');
// ... operation ...
document.getElementById('loading').classList.add('hidden');
```

**After:**
```javascript
ErrorHandler.showLoading('Loading...');
// ... operation ...
ErrorHandler.hideLoading();
```

## Testing Your Migration

1. **Test Authentication**:
   - Sign in
   - Sign out
   - Register new user

2. **Test Data Operations**:
   - Load data
   - Create records
   - Update records

3. **Test Error Handling**:
   - Network errors (disable internet)
   - Invalid data
   - Permission errors

4. **Test UI Updates**:
   - Loading indicators
   - Success messages
   - Error messages

## Troubleshooting

### Issue: "Cannot find module"

**Solution**: Make sure you're importing from the correct path:
```javascript
import { authService } from './js/vema-app.js';  // Correct
import { authService } from '../js/vema-app.js'; // For pages in subdirectories
```

### Issue: "Service is undefined"

**Solution**: Make sure you've initialized the app:
```javascript
await initVemaApp();
```

### Issue: "Firebase is not defined"

**Solution**: Make sure Firebase scripts are loaded before your module:
```html
<script src="https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/12.0.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore-compat.js"></script>

<!-- Your module script AFTER Firebase -->
<script type="module" src="..."></script>
```

## Need Help?

- Check `CLEAN_ARCHITECTURE.md` for detailed documentation
- Look at example implementations in the codebase
- Use browser console to debug (check `window.Vema` in dev mode)

---

**Happy Migrating!** 🚀

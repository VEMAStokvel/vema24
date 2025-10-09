# 🔒 Vema24 Security Rules Documentation

## Overview

This document explains the comprehensive security rules for your Vema24 platform. These rules are designed for **production-grade security** suitable for financial infrastructure.

## 📋 Files Created

1. **`firestore.rules`** - Database security rules
2. **`storage.rules`** - File storage security rules

## 🛡️ Security Principles Implemented

### 1. **Principle of Least Privilege**
- Users can only access their own data
- Admins have elevated permissions
- Managers have limited elevated permissions

### 2. **Defense in Depth**
- Multiple validation layers
- Input validation
- Type checking
- Business rule enforcement

### 3. **Data Integrity**
- Immutable fields (createdAt, userId)
- Status validation
- Amount validation
- Email format validation

### 4. **Audit Trail**
- Admin logs are immutable
- All operations are traceable

## 🔐 Firestore Security Rules

### Collection Access Matrix

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| **users** | Self (registration) | Self + Admin | Self (limited) + Admin | Admin only |
| **stokvels** | Members | Members + Managers | Managers + Admin | Admin only |
| **contributions** | Self | Self + Managers | Managers only | Admin only |
| **loans** | Self | Self + Admin | Self (limited) + Admin | Admin only |
| **referrals** | Self | Self + Admin | Admin only | Admin only |
| **products** | Admin | All authenticated | Admin | Admin |
| **orders** | Self | Self + Admin | Admin | Admin |
| **funeralClaims** | Self (with cover) | Self + Admin | Admin | Admin |
| **withdrawalRequests** | Self (Planning) | Self + Admin | Admin | Self (pending) + Admin |
| **notifications** | Admin | Self | Self (read status) | Self + Admin |
| **adminLogs** | Admin | Admin | None | None |

### Key Security Features

#### 1. User Collection
```javascript
// ✅ Users can only register as 'member' (not admin)
// ✅ Cannot change their own role
// ✅ Email format validated
// ✅ Display name length validated (2-100 chars)
// ✅ Initial values enforced (savings = 0, no funeral cover)
```

#### 2. Stokvel Collection
```javascript
// ✅ Only members can view their stokvels
// ✅ Type validation (January, Grocery, Planning)
// ✅ Member list validation
// ✅ Creator must be in members list
// ✅ Monthly contribution must be > 0
```

#### 3. Contribution Collection
```javascript
// ✅ User must be stokvel member to contribute
// ✅ Amount validation (must be positive)
// ✅ Payment method validation
// ✅ Cannot modify userId, stokvelId, or amount after creation
```

#### 4. Loan Collection
```javascript
// ✅ Loan amounts restricted to: R500, R1000, R2000, R3000
// ✅ Terms restricted to: 1, 2, or 3 months
// ✅ Users can only apply for their own loans
// ✅ Status starts as 'pending'
```

#### 5. Funeral Claims
```javascript
// ✅ Only users with active funeral cover can claim
// ✅ Claim type validation (natural/accidental/suicide)
// ✅ Only admin can process claims
```

#### 6. Withdrawal Requests
```javascript
// ✅ Only for Planning Ahead stokvels
// ✅ Must be stokvel member
// ✅ Amount validation
// ✅ Users can cancel their pending requests
```

### Helper Functions

The rules include reusable helper functions:

```javascript
isSignedIn()           // Check authentication
isOwner(userId)        // Check document ownership
isAdmin()              // Check admin role
isManager()            // Check manager/admin role
isValidEmail(email)    // Validate email format
isValidSAPhone(phone)  // Validate SA phone numbers
isValidAmount(amount)  // Validate positive amounts
isStokvelMember(id)    // Check stokvel membership
```

## 📁 Storage Security Rules

### Storage Structure

```
/users/{userId}/
  ├── profile/          # Profile pictures
  ├── documents/
      ├── id/           # ID documents
      ├── proof-of-address/
      └── bank-statements/

/funeralClaims/{claimId}/
  └── documents/        # Death certificates, etc.

/loans/{loanId}/
  └── documents/        # Loan supporting docs

/products/{productId}/
  └── images/           # Product images

/stokvels/{stokvelId}/
  └── documents/        # Constitutions, rules

/public/                # Public documents
/receipts/              # Generated receipts
/contributions/{id}/    # Contribution receipts
/temp/                  # Temporary uploads
/admin/                 # Admin-only files
```

### Key Security Features

#### 1. File Type Validation
```javascript
// Images: image/*
// Documents: PDF, DOC, DOCX, JPG, PNG
```

#### 2. File Size Limits
```javascript
// Images: 5MB max
// Documents: 10MB max
// Temp files: 10MB max
```

#### 3. Access Control
```javascript
// Profile pictures: Owner can write, all can read
// ID documents: Owner can write, owner + admin can read
// Funeral claims: Claimant uploads, claimant + admin read
// Product images: Admin manages, all authenticated can read
// Admin files: Admin only
```

#### 4. Document Immutability
```javascript
// Receipts: Only admin can create, no deletion by users
// Admin logs: Immutable
```

## 🚀 Deployment Instructions

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase in Your Project

```bash
cd /path/to/vema24
firebase init
```

Select:
- Firestore
- Storage
- Use existing project: vema-7606a

### Step 4: Deploy Security Rules

```bash
# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules

# Or deploy individually
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Step 5: Verify Deployment

1. Go to Firebase Console
2. Navigate to Firestore → Rules
3. Verify your rules are active
4. Check Storage → Rules

## 🧪 Testing Security Rules

### Using Firebase Emulator Suite

```bash
# Install emulators
firebase init emulators

# Start emulators
firebase emulators:start

# Your app will use: http://localhost:8080
```

### Test Cases to Verify

#### 1. User Registration
```javascript
// ✅ Should succeed: New user creates account as 'member'
// ❌ Should fail: User tries to register as 'admin'
// ❌ Should fail: Invalid email format
```

#### 2. Data Access
```javascript
// ✅ Should succeed: User reads own data
// ❌ Should fail: User reads another user's data
// ✅ Should succeed: Admin reads any user's data
```

#### 3. Stokvel Operations
```javascript
// ✅ Should succeed: Member creates stokvel
// ✅ Should succeed: Member views their stokvels
// ❌ Should fail: Non-member views stokvel
// ❌ Should fail: Invalid stokvel type
```

#### 4. Contributions
```javascript
// ✅ Should succeed: Member contributes to their stokvel
// ❌ Should fail: User contributes to stokvel they're not in
// ❌ Should fail: Negative contribution amount
```

#### 5. Loans
```javascript
// ✅ Should succeed: User applies for R1000 loan
// ❌ Should fail: User applies for R750 loan (invalid amount)
// ❌ Should fail: User applies for 5-month loan (invalid term)
```

#### 6. File Uploads
```javascript
// ✅ Should succeed: User uploads profile picture (< 5MB)
// ❌ Should fail: User uploads 10MB profile picture
// ❌ Should fail: User uploads non-image as profile picture
// ✅ Should succeed: User uploads ID document (PDF)
// ❌ Should fail: User views another user's ID
```

## 🔍 Monitoring and Auditing

### 1. Enable Firestore Security Rules Monitoring

In Firebase Console:
1. Go to Firestore
2. Navigate to Usage tab
3. Monitor denied requests

### 2. Set Up Alerts

```javascript
// In Firebase Console → Alerts
// Create alerts for:
// - High number of denied requests
// - Unusual access patterns
// - Admin operations
```

### 3. Review Admin Logs

```javascript
// Query admin logs regularly
db.collection('adminLogs')
  .orderBy('timestamp', 'desc')
  .limit(100)
  .get();
```

## 🚨 Security Best Practices

### 1. Never Share Admin Credentials
- Admin accounts should have strong, unique passwords
- Use MFA (Multi-Factor Authentication)
- Limit number of admin accounts

### 2. Regular Security Audits
- Review rules quarterly
- Check for suspicious activity
- Update rules as needed

### 3. Keep Rules Updated
- When adding new features, update rules
- Test rules before deploying
- Document all changes

### 4. Monitor Access Patterns
- Set up Firebase Analytics
- Monitor unusual access patterns
- Review denied requests log

### 5. Secure Your Firebase Config
```javascript
// Never commit Firebase config to public repos
// Use environment variables in production
// Restrict API keys in Firebase Console
```

## 🔧 Customization Guide

### Adding a New Collection

1. **Define Access Rules**
```javascript
match /myCollection/{docId} {
  // Define who can read
  allow read: if <condition>;
  
  // Define who can create
  allow create: if <condition>;
  
  // Define who can update
  allow update: if <condition>;
  
  // Define who can delete
  allow delete: if <condition>;
}
```

2. **Add Validation**
```javascript
// Validate required fields
request.resource.data.keys().hasAll(['field1', 'field2'])

// Validate field types
request.resource.data.field1 is string

// Validate field values
request.resource.data.status in ['pending', 'active']
```

3. **Test Thoroughly**
```javascript
// Test all CRUD operations
// Test with different user roles
// Test edge cases
```

## 📊 Performance Considerations

### Rule Optimization

1. **Use Indexes for Queries**
```javascript
// When querying based on user role or membership
// Create composite indexes in Firebase Console
```

2. **Minimize get() Calls**
```javascript
// Cache role checks when possible
// Use batch operations for multiple checks
```

3. **Structure Data for Security**
```javascript
// Denormalize data to avoid multiple get() calls
// Store user role in auth claims for faster access
```

## 🆘 Troubleshooting

### Common Issues

#### 1. "Missing or insufficient permissions"
**Solution**: Check that:
- User is authenticated
- User has correct role
- Document ownership is correct

#### 2. "Rules evaluation timed out"
**Solution**:
- Reduce complexity of rules
- Minimize get() calls
- Use custom claims for roles

#### 3. "Upload failed: permission denied"
**Solution**: Check:
- File type is allowed
- File size is within limits
- User has permission for that path

## 📞 Support and Updates

### Getting Help
- Check Firebase documentation
- Review error messages in console
- Test with emulator suite
- Monitor security logs

### Updating Rules
When updating rules:
1. Test in emulator first
2. Deploy to staging (if available)
3. Monitor for issues
4. Deploy to production
5. Monitor for denied requests

## ✅ Deployment Checklist

- [ ] Rules files created (`firestore.rules`, `storage.rules`)
- [ ] Firebase CLI installed
- [ ] Logged into Firebase
- [ ] Project initialized
- [ ] Rules deployed successfully
- [ ] Rules verified in Firebase Console
- [ ] Test cases passed
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Team briefed on security practices
- [ ] Documentation reviewed

---

**Security Level**: Production Grade ✅  
**Last Updated**: December 2024  
**Status**: Ready for Deployment 🚀

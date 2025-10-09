/**
 * User Model
 * Defines the structure and business logic for User entities
 */

export class User {
    constructor(data) {
        this.uid = data.uid || null;
        this.email = data.email || '';
        this.displayName = data.displayName || '';
        this.phoneNumber = data.phoneNumber || '';
        this.photoURL = data.photoURL || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        
        // Stokvel related
        this.stokvels = data.stokvels || [];
        this.savingsTotal = data.savingsTotal || 0;
        this.storeDiscount = data.storeDiscount || 0;
        
        // Funeral cover
        this.funeralCover = data.funeralCover || false;
        this.funeralCoverType = data.funeralCoverType || null;
        this.funeralCoverSince = data.funeralCoverSince || null;
        this.funeralFamilyDetails = data.funeralFamilyDetails || null;
        
        // Loans
        this.loanHistory = data.loanHistory || [];
        this.creditScore = data.creditScore || 0;
        
        // Role
        this.role = data.role || 'member';
        this.isAdmin = data.role === 'admin';
    }
    
    /**
     * Convert to plain object for Firestore
     */
    toFirestore() {
        return {
            uid: this.uid,
            email: this.email,
            displayName: this.displayName,
            phoneNumber: this.phoneNumber,
            photoURL: this.photoURL,
            createdAt: this.createdAt,
            updatedAt: new Date(),
            stokvels: this.stokvels,
            savingsTotal: this.savingsTotal,
            storeDiscount: this.storeDiscount,
            funeralCover: this.funeralCover,
            funeralCoverType: this.funeralCoverType,
            funeralCoverSince: this.funeralCoverSince,
            funeralFamilyDetails: this.funeralFamilyDetails,
            loanHistory: this.loanHistory,
            creditScore: this.creditScore,
            role: this.role
        };
    }
    
    /**
     * Create User instance from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new User({
            uid: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        });
    }
    
    /**
     * Calculate store discount based on savings and funeral cover
     */
    calculateDiscount() {
        if (!this.funeralCover) {
            if (this.savingsTotal >= 10000) return 25;
            if (this.savingsTotal >= 5000) return 10;
        } else {
            if (this.savingsTotal >= 10000) return 30;
            if (this.savingsTotal >= 5000) return 20;
        }
        return 0;
    }
    
    /**
     * Check if user has active stokvel membership
     */
    hasActiveStokvel() {
        return this.stokvels.some(s => s.status === 'active');
    }
    
    /**
     * Get total contributions across all stokvels
     */
    getTotalContributions() {
        return this.stokvels.reduce((total, s) => total + (s.balance || 0), 0);
    }
}

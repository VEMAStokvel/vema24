/**
 * Stokvel Model
 * Defines the structure and business logic for Stokvel entities
 */

export class Stokvel {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.type = data.type || '';
        this.manager = data.manager || '';
        this.startDate = data.startDate ? new Date(data.startDate) : null;
        this.endDate = data.endDate ? new Date(data.endDate) : null;
        this.durationMonths = data.durationMonths || 10;
        this.monthlyContribution = data.monthlyContribution || 0;
        this.members = data.members || [];
        this.status = data.status || 'pending';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
    
    /**
     * Convert to plain object for Firestore
     */
    toFirestore() {
        return {
            name: this.name,
            type: this.type,
            manager: this.manager,
            startDate: this.startDate ? this.startDate.toISOString() : null,
            endDate: this.endDate ? this.endDate.toISOString() : null,
            durationMonths: this.durationMonths,
            monthlyContribution: this.monthlyContribution,
            members: this.members,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: new Date()
        };
    }
    
    /**
     * Create Stokvel instance from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new Stokvel({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        });
    }
    
    /**
     * Check if stokvel is active
     */
    isActive() {
        const now = new Date();
        return this.status === 'active' && 
               this.startDate && this.startDate <= now &&
               this.endDate && this.endDate >= now;
    }
    
    /**
     * Check if stokvel allows early withdrawals
     */
    allowsEarlyWithdrawal() {
        return this.type === 'Planning Ahead' || this.type === 'Planning';
    }
    
    /**
     * Calculate projected payout for a member
     */
    calculateProjectedPayout(contributions) {
        return this.monthlyContribution * this.durationMonths;
    }
    
    /**
     * Get days until payout
     */
    getDaysUntilPayout() {
        if (!this.endDate) return null;
        const now = new Date();
        const diff = this.endDate - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
}

/**
 * User-specific Stokvel Membership
 * Represents a user's membership in a stokvel
 */
export class StokvelMembership {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.type = data.type || '';
        this.balance = data.balance || 0;
        this.monthlyContribution = data.monthlyContribution || 0;
        this.nextContributionDate = data.nextContributionDate || null;
        this.contributionsCount = data.contributionsCount || 0;
        this.status = data.status || 'pending';
        this.projectedPayout = data.projectedPayout || 0;
        this.joinedAt = data.joinedAt || new Date();
    }
    
    /**
     * Convert to plain object
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            balance: this.balance,
            monthlyContribution: this.monthlyContribution,
            nextContributionDate: this.nextContributionDate,
            contributionsCount: this.contributionsCount,
            status: this.status,
            projectedPayout: this.projectedPayout,
            joinedAt: this.joinedAt
        };
    }
    
    /**
     * Check if contribution is due
     */
    isContributionDue() {
        if (!this.nextContributionDate) return false;
        const dueDate = new Date(this.nextContributionDate);
        const now = new Date();
        return now >= dueDate;
    }
    
    /**
     * Update after contribution
     */
    recordContribution(amount) {
        this.balance += amount;
        this.contributionsCount++;
        
        // Calculate next contribution date (1 month from now)
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        this.nextContributionDate = nextDate.toISOString().split('T')[0];
        
        return this;
    }
}

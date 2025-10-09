/**
 * Funeral Cover Model
 * Defines the structure for funeral cover plans and claims
 */

export class FuneralCoverPlan {
    static PLANS = {
        BASIC: {
            id: 'basic',
            name: 'Basic Plan',
            price: 99,
            coverage: {
                mainMember: 25000,
                spouse: 0,
                children: 0,
                extended: 0
            },
            maxChildren: 0,
            maxExtended: 0
        },
        FAMILY: {
            id: 'family',
            name: 'Family Plan',
            price: 199,
            coverage: {
                mainMember: 50000,
                spouse: 50000,
                children: 15000,
                extended: 0
            },
            maxChildren: 5,
            maxExtended: 0
        },
        EXTENDED: {
            id: 'extended',
            name: 'Extended Family Plan',
            price: 299,
            coverage: {
                mainMember: 75000,
                spouse: 75000,
                children: 20000,
                extended: 30000
            },
            maxChildren: 5,
            maxExtended: 4
        }
    };
    
    static WAITING_PERIODS = {
        NATURAL_DEATH: 6, // months
        ACCIDENTAL_DEATH: 0, // immediate
        SUICIDE: 24 // months
    };
    
    static ADDITIONAL_BENEFITS = {
        CHAIRS: { name: '100 Chairs', price: 25 },
        TOILET: { name: 'Mobile Toilet', price: 30 },
        FRIDGE: { name: 'Mobile Fridge', price: 35 },
        DECORATION: { name: 'Decoration', price: 65 },
        CATERING: { name: 'Catering', price: 75 }
    };
    
    /**
     * Get plan by ID
     */
    static getPlan(planId) {
        return Object.values(this.PLANS).find(p => p.id === planId);
    }
    
    /**
     * Calculate total monthly premium
     */
    static calculatePremium(planId, additionalBenefits = []) {
        const plan = this.getPlan(planId);
        if (!plan) return 0;
        
        let total = plan.price;
        
        additionalBenefits.forEach(benefitKey => {
            const benefit = this.ADDITIONAL_BENEFITS[benefitKey];
            if (benefit) {
                total += benefit.price;
            }
        });
        
        return total;
    }
}

/**
 * Funeral Cover Membership
 */
export class FuneralCoverMembership {
    constructor(data) {
        this.userId = data.userId || '';
        this.planId = data.planId || '';
        this.active = data.active || false;
        this.startDate = data.startDate || new Date();
        this.paymentMethod = data.paymentMethod || '';
        this.additionalBenefits = data.additionalBenefits || [];
        this.familyDetails = data.familyDetails || null;
        this.monthlyPremium = data.monthlyPremium || 0;
    }
    
    /**
     * Convert to plain object for Firestore
     */
    toFirestore() {
        return {
            userId: this.userId,
            planId: this.planId,
            active: this.active,
            startDate: this.startDate,
            paymentMethod: this.paymentMethod,
            additionalBenefits: this.additionalBenefits,
            familyDetails: this.familyDetails,
            monthlyPremium: this.monthlyPremium
        };
    }
    
    /**
     * Create instance from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new FuneralCoverMembership({
            ...data,
            startDate: data.startDate?.toDate() || new Date()
        });
    }
    
    /**
     * Check if waiting period has passed for a death type
     */
    hasWaitingPeriodPassed(deathType) {
        const monthsSinceStart = this.getMonthsSinceStart();
        const waitingPeriod = FuneralCoverPlan.WAITING_PERIODS[deathType] || 6;
        return monthsSinceStart >= waitingPeriod;
    }
    
    /**
     * Get months since start date
     */
    getMonthsSinceStart() {
        const now = new Date();
        const start = new Date(this.startDate);
        const diffTime = Math.abs(now - start);
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        return diffMonths;
    }
    
    /**
     * Get coverage amount for member type
     */
    getCoverage(memberType) {
        const plan = FuneralCoverPlan.getPlan(this.planId);
        if (!plan) return 0;
        return plan.coverage[memberType] || 0;
    }
}

/**
 * Family Member
 */
export class FamilyMember {
    constructor(data) {
        this.name = data.name || '';
        this.idNumber = data.idNumber || '';
        this.relationship = data.relationship || '';
        this.dateOfBirth = data.dateOfBirth || null;
        this.age = data.age || 0;
    }
    
    toObject() {
        return {
            name: this.name,
            idNumber: this.idNumber,
            relationship: this.relationship,
            dateOfBirth: this.dateOfBirth,
            age: this.age
        };
    }
}

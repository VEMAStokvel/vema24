/**
 * Loan Model
 * Defines the structure and business logic for Loan entities
 */

export class Loan {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId || '';
        this.amount = data.amount || 0;
        this.term = data.term || 3;
        this.purpose = data.purpose || '';
        this.status = data.status || 'pending';
        this.applicationDate = data.applicationDate || new Date();
        this.approvalDate = data.approvalDate || null;
        this.disbursementDate = data.disbursementDate || null;
        this.interestRate = data.interestRate || 5;
        this.initiationFee = data.initiationFee || 0;
        this.serviceFee = data.serviceFee || 52.26;
        this.totalRepayment = data.totalRepayment || 0;
        this.monthlyRepayment = data.monthlyRepayment || 0;
        this.amountPaid = data.amountPaid || 0;
        this.remainingBalance = data.remainingBalance || 0;
    }
    
    /**
     * Calculate loan details based on amount and term
     */
    static calculateLoanDetails(amount, term = 3) {
        // Interest calculation (4.5% of principal)
        const interest = amount * 0.045;
        
        // Service fee is fixed
        const serviceFee = 52.26;
        
        // Initiation fee is 15% of principal
        const initiationFee = amount * 0.15;
        
        // Total repayment
        const totalRepayment = amount + interest + serviceFee + initiationFee;
        
        // Monthly repayment
        const monthlyRepayment = totalRepayment / term;
        
        return {
            capital: amount,
            interest: interest,
            serviceFee: serviceFee,
            initiationFee: initiationFee,
            totalRepayment: totalRepayment,
            monthlyRepayment: monthlyRepayment,
            term: term
        };
    }
    
    /**
     * Convert to plain object for Firestore
     */
    toFirestore() {
        return {
            userId: this.userId,
            amount: this.amount,
            term: this.term,
            purpose: this.purpose,
            status: this.status,
            applicationDate: this.applicationDate,
            approvalDate: this.approvalDate,
            disbursementDate: this.disbursementDate,
            interestRate: this.interestRate,
            initiationFee: this.initiationFee,
            serviceFee: this.serviceFee,
            totalRepayment: this.totalRepayment,
            monthlyRepayment: this.monthlyRepayment,
            amountPaid: this.amountPaid,
            remainingBalance: this.remainingBalance
        };
    }
    
    /**
     * Create Loan instance from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new Loan({
            id: doc.id,
            ...data,
            applicationDate: data.applicationDate?.toDate() || new Date(),
            approvalDate: data.approvalDate?.toDate() || null,
            disbursementDate: data.disbursementDate?.toDate() || null
        });
    }
    
    /**
     * Check if loan is approved
     */
    isApproved() {
        return this.status === 'approved';
    }
    
    /**
     * Check if loan is active
     */
    isActive() {
        return this.status === 'approved' && this.remainingBalance > 0;
    }
    
    /**
     * Calculate remaining balance
     */
    calculateRemainingBalance() {
        return this.totalRepayment - this.amountPaid;
    }
    
    /**
     * Record a payment
     */
    recordPayment(amount) {
        this.amountPaid += amount;
        this.remainingBalance = this.calculateRemainingBalance();
        
        if (this.remainingBalance <= 0) {
            this.status = 'paid';
            this.remainingBalance = 0;
        }
        
        return this;
    }
}

/**
 * Referral Model
 * Represents a loan referral
 */
export class Referral {
    constructor(data) {
        this.id = data.id || null;
        this.referrerId = data.referrerId || '';
        this.referredName = data.referredName || '';
        this.referredEmail = data.referredEmail || '';
        this.referredPhone = data.referredPhone || '';
        this.loanAmount = data.loanAmount || 0;
        this.commission = data.commission || 0;
        this.status = data.status || 'pending';
        this.code = data.code || '';
        this.date = data.date || new Date();
    }
    
    /**
     * Convert to plain object for Firestore
     */
    toFirestore() {
        return {
            referrerId: this.referrerId,
            referredName: this.referredName,
            referredEmail: this.referredEmail,
            referredPhone: this.referredPhone,
            loanAmount: this.loanAmount,
            commission: this.commission,
            status: this.status,
            code: this.code,
            date: this.date
        };
    }
    
    /**
     * Create Referral instance from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new Referral({
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date()
        });
    }
    
    /**
     * Calculate commission (typically 5% of loan amount)
     */
    static calculateCommission(loanAmount) {
        return loanAmount * 0.05;
    }
}

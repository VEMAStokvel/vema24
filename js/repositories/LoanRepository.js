/**
 * Loan Repository
 * Handles all data operations for loans and referrals
 */

import { BaseRepository } from './BaseRepository.js';
import { Loan, Referral } from '../models/Loan.model.js';
import { logger } from '../config/environment.js';

export class LoanRepository extends BaseRepository {
    constructor() {
        super('loans');
    }
    
    /**
     * Get loan by ID and convert to Loan model
     */
    async getLoanById(loanId) {
        try {
            const doc = await this.collection.doc(loanId).get();
            if (!doc.exists) {
                logger.warn(`Loan ${loanId} not found`);
                return null;
            }
            return Loan.fromFirestore(doc);
        } catch (error) {
            logger.error(`Error getting loan ${loanId}:`, error);
            throw error;
        }
    }
    
    /**
     * Create a loan application
     */
    async createLoan(loanData) {
        try {
            // Calculate loan details
            const details = Loan.calculateLoanDetails(loanData.amount, loanData.term);
            
            const loan = new Loan({
                ...loanData,
                ...details,
                status: 'pending',
                applicationDate: new Date()
            });
            
            const id = await this.create(loan.toFirestore());
            loan.id = id;
            
            logger.log(`Loan application ${id} created successfully`);
            return loan;
        } catch (error) {
            logger.error('Error creating loan:', error);
            throw error;
        }
    }
    
    /**
     * Get loans for user
     */
    async getLoansForUser(userId) {
        try {
            return await this.queryOrdered(
                [['userId', '==', userId]],
                ['applicationDate', 'desc']
            );
        } catch (error) {
            logger.error(`Error getting loans for user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get pending loans
     */
    async getPendingLoans() {
        try {
            return await this.query([['status', '==', 'pending']]);
        } catch (error) {
            logger.error('Error getting pending loans:', error);
            throw error;
        }
    }
    
    /**
     * Approve loan
     */
    async approveLoan(loanId) {
        try {
            await this.update(loanId, {
                status: 'approved',
                approvalDate: new Date(),
                disbursementDate: new Date()
            });
            logger.log(`Loan ${loanId} approved`);
            return true;
        } catch (error) {
            logger.error(`Error approving loan ${loanId}:`, error);
            throw error;
        }
    }
    
    /**
     * Reject loan
     */
    async rejectLoan(loanId, reason = '') {
        try {
            await this.update(loanId, {
                status: 'rejected',
                rejectionReason: reason
            });
            logger.log(`Loan ${loanId} rejected`);
            return true;
        } catch (error) {
            logger.error(`Error rejecting loan ${loanId}:`, error);
            throw error;
        }
    }
    
    /**
     * Record loan payment
     */
    async recordPayment(loanId, amount) {
        try {
            const loan = await this.getLoanById(loanId);
            if (!loan) throw new Error('Loan not found');
            
            loan.recordPayment(amount);
            await this.update(loanId, {
                amountPaid: loan.amountPaid,
                remainingBalance: loan.remainingBalance,
                status: loan.status
            });
            
            logger.log(`Payment of ${amount} recorded for loan ${loanId}`);
            return loan;
        } catch (error) {
            logger.error(`Error recording payment for loan ${loanId}:`, error);
            throw error;
        }
    }
}

/**
 * Referral Repository
 * Handles referral operations
 */
export class ReferralRepository extends BaseRepository {
    constructor() {
        super('referrals');
    }
    
    /**
     * Create a referral
     */
    async createReferral(referralData) {
        try {
            const referral = new Referral({
                ...referralData,
                date: new Date(),
                status: 'pending',
                code: this.generateReferralCode()
            });
            
            const id = await this.create(referral.toFirestore());
            referral.id = id;
            
            logger.log(`Referral ${id} created successfully`);
            return referral;
        } catch (error) {
            logger.error('Error creating referral:', error);
            throw error;
        }
    }
    
    /**
     * Get referrals for user
     */
    async getReferralsForUser(userId) {
        try {
            return await this.queryOrdered(
                [['referrerId', '==', userId]],
                ['date', 'desc']
            );
        } catch (error) {
            logger.error(`Error getting referrals for user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update referral status
     */
    async updateReferralStatus(referralId, status, loanAmount = 0) {
        try {
            const updateData = { status };
            
            if (status === 'active' && loanAmount > 0) {
                updateData.loanAmount = loanAmount;
                updateData.commission = Referral.calculateCommission(loanAmount);
            }
            
            await this.update(referralId, updateData);
            logger.log(`Referral ${referralId} updated to ${status}`);
            return true;
        } catch (error) {
            logger.error(`Error updating referral ${referralId}:`, error);
            throw error;
        }
    }
    
    /**
     * Generate unique referral code
     */
    generateReferralCode() {
        return 'VEMA' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    
    /**
     * Get total earnings for referrer
     */
    async getTotalEarnings(userId) {
        try {
            const referrals = await this.getReferralsForUser(userId);
            return referrals.reduce((total, ref) => total + (ref.commission || 0), 0);
        } catch (error) {
            logger.error(`Error getting total earnings for user ${userId}:`, error);
            throw error;
        }
    }
}

// Create singleton instances
export const loanRepository = new LoanRepository();
export const referralRepository = new ReferralRepository();

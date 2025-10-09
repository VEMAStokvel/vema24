/**
 * Loan Service
 * Handles all loan-related business logic
 */

import { loanRepository, referralRepository } from '../repositories/LoanRepository.js';
import { Loan } from '../models/Loan.model.js';
import { logger } from '../config/environment.js';

export class LoanService {
    /**
     * Apply for a loan
     */
    async applyForLoan(userId, amount, term, purpose) {
        try {
            logger.log(`User ${userId} applying for loan: R${amount} for ${term} months`);
            
            // Validate loan amount and term
            const validation = this.validateLoanApplication(amount, term);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error
                };
            }
            
            // Create loan application
            const loan = await loanRepository.createLoan({
                userId,
                amount,
                term,
                purpose
            });
            
            logger.log(`Loan application ${loan.id} created successfully`);
            
            return {
                success: true,
                loan,
                message: 'Loan application submitted successfully'
            };
        } catch (error) {
            logger.error('Error applying for loan:', error);
            return {
                success: false,
                error: error.message || 'Failed to apply for loan'
            };
        }
    }
    
    /**
     * Get user's loans
     */
    async getUserLoans(userId) {
        try {
            const loans = await loanRepository.getLoansForUser(userId);
            
            return {
                success: true,
                loans
            };
        } catch (error) {
            logger.error('Error getting user loans:', error);
            return {
                success: false,
                error: error.message || 'Failed to get loans'
            };
        }
    }
    
    /**
     * Get loan details
     */
    async getLoanDetails(loanId) {
        try {
            const loan = await loanRepository.getLoanById(loanId);
            if (!loan) throw new Error('Loan not found');
            
            return {
                success: true,
                loan
            };
        } catch (error) {
            logger.error('Error getting loan details:', error);
            return {
                success: false,
                error: error.message || 'Failed to get loan details'
            };
        }
    }
    
    /**
     * Calculate loan repayment details
     */
    calculateLoanDetails(amount, term = 3) {
        return Loan.calculateLoanDetails(amount, term);
    }
    
    /**
     * Validate loan application
     */
    validateLoanApplication(amount, term) {
        const validAmounts = [500, 1000, 2000, 3000];
        const validTerms = [1, 2, 3];
        
        if (!validAmounts.includes(amount)) {
            return {
                valid: false,
                error: 'Invalid loan amount. Choose from R500, R1000, R2000, or R3000'
            };
        }
        
        if (!validTerms.includes(term)) {
            return {
                valid: false,
                error: 'Invalid loan term. Choose 1, 2, or 3 months'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Make a loan payment
     */
    async makeLoanPayment(loanId, amount) {
        try {
            logger.log(`Recording payment of R${amount} for loan ${loanId}`);
            
            const loan = await loanRepository.recordPayment(loanId, amount);
            
            return {
                success: true,
                loan,
                message: 'Payment recorded successfully'
            };
        } catch (error) {
            logger.error('Error making loan payment:', error);
            return {
                success: false,
                error: error.message || 'Failed to record payment'
            };
        }
    }
    
    /**
     * Create a referral
     */
    async createReferral(referrerId, friendName, friendEmail, friendPhone) {
        try {
            logger.log(`Creating referral for user ${referrerId}`);
            
            const referral = await referralRepository.createReferral({
                referrerId,
                referredName: friendName,
                referredEmail: friendEmail,
                referredPhone: friendPhone
            });
            
            logger.log(`Referral ${referral.id} created successfully`);
            
            return {
                success: true,
                referral,
                message: 'Referral sent successfully'
            };
        } catch (error) {
            logger.error('Error creating referral:', error);
            return {
                success: false,
                error: error.message || 'Failed to create referral'
            };
        }
    }
    
    /**
     * Get user's referrals
     */
    async getUserReferrals(userId) {
        try {
            const referrals = await referralRepository.getReferralsForUser(userId);
            const totalEarnings = await referralRepository.getTotalEarnings(userId);
            
            const activeCount = referrals.filter(r => r.status === 'active').length;
            
            return {
                success: true,
                referrals,
                totalReferrals: referrals.length,
                activeReferrals: activeCount,
                totalEarnings
            };
        } catch (error) {
            logger.error('Error getting user referrals:', error);
            return {
                success: false,
                error: error.message || 'Failed to get referrals'
            };
        }
    }
}

// Create singleton instance
export const loanService = new LoanService();

/**
 * Stokvel Service
 * Handles all stokvel-related business logic
 */

import { stokvelRepository, contributionRepository } from '../repositories/StokvelRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { StokvelMembership } from '../models/Stokvel.model.js';
import { logger } from '../config/environment.js';

export class StokvelService {
    /**
     * Get stokvel types and their details
     */
    static STOKVEL_TYPES = {
        JANUARY: {
            name: 'January Stokvel',
            type: 'January',
            durationMonths: 10,
            description: 'Save for 10 months, receive payout in January',
            payoutMonth: 1 // January
        },
        GROCERY: {
            name: 'Grocery Stokvel',
            type: 'Grocery',
            durationMonths: 10,
            description: 'Save for groceries during October/November specials',
            payoutMonth: 10 // October
        },
        PLANNING: {
            name: 'Planning Ahead Stokvel',
            type: 'Planning',
            durationMonths: 10,
            description: 'Flexible stokvel for emergencies and savings',
            payoutMonth: null,
            allowsEarlyWithdrawal: true
        }
    };
    
    /**
     * Join a stokvel
     */
    async joinStokvel(userId, stokvelType, monthlyAmount, paymentMethod) {
        try {
            logger.log(`User ${userId} joining ${stokvelType} stokvel`);
            
            // Get stokvel configuration
            const typeConfig = this.getStokvelTypeConfig(stokvelType);
            if (!typeConfig) {
                throw new Error('Invalid stokvel type');
            }
            
            // Calculate dates
            const { startDate, endDate } = this.calculateStokvelDates(typeConfig);
            
            // Create stokvel record
            const stokvel = await stokvelRepository.createStokvel({
                name: typeConfig.name,
                type: typeConfig.type,
                manager: 'To be assigned',
                startDate,
                endDate,
                durationMonths: typeConfig.durationMonths,
                monthlyContribution: monthlyAmount,
                members: [userId],
                status: 'active'
            });
            
            // Create user's membership record
            const membership = new StokvelMembership({
                id: stokvel.id,
                name: typeConfig.name,
                type: typeConfig.type,
                balance: 0,
                monthlyContribution: monthlyAmount,
                nextContributionDate: this.calculateNextContributionDate(),
                contributionsCount: 0,
                status: 'active',
                projectedPayout: monthlyAmount * typeConfig.durationMonths,
                joinedAt: new Date()
            });
            
            // Add to user's stokvels
            await userRepository.addStokvelToUser(userId, membership);
            
            logger.log(`User ${userId} successfully joined stokvel ${stokvel.id}`);
            
            return {
                success: true,
                stokvel,
                membership
            };
        } catch (error) {
            logger.error('Error joining stokvel:', error);
            return {
                success: false,
                error: error.message || 'Failed to join stokvel'
            };
        }
    }
    
    /**
     * Make a contribution to a stokvel
     */
    async makeContribution(userId, stokvelId, amount, paymentMethod) {
        try {
            logger.log(`User ${userId} contributing ${amount} to stokvel ${stokvelId}`);
            
            // Record contribution
            await contributionRepository.recordContribution({
                userId,
                stokvelId,
                amount,
                method: paymentMethod
            });
            
            // Update user's stokvel membership
            const user = await userRepository.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            const stokvelIndex = user.stokvels.findIndex(s => s.id === stokvelId);
            if (stokvelIndex === -1) throw new Error('Stokvel membership not found');
            
            // Update the stokvel membership
            const membership = new StokvelMembership(user.stokvels[stokvelIndex]);
            membership.recordContribution(amount);
            user.stokvels[stokvelIndex] = membership.toObject();
            
            // Update user's stokvels
            await userRepository.updateUserStokvels(userId, user.stokvels);
            
            // Update user's savings total
            await userRepository.updateSavingsTotal(userId, amount);
            
            logger.log(`Contribution recorded successfully`);
            
            return {
                success: true,
                membership,
                newBalance: membership.balance
            };
        } catch (error) {
            logger.error('Error making contribution:', error);
            return {
                success: false,
                error: error.message || 'Failed to record contribution'
            };
        }
    }
    
    /**
     * Get user's stokvels
     */
    async getUserStokvels(userId) {
        try {
            const user = await userRepository.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            return {
                success: true,
                stokvels: user.stokvels,
                totalSavings: user.savingsTotal,
                storeDiscount: user.storeDiscount
            };
        } catch (error) {
            logger.error('Error getting user stokvels:', error);
            return {
                success: false,
                error: error.message || 'Failed to get stokvels'
            };
        }
    }
    
    /**
     * Get stokvel details
     */
    async getStokvelDetails(stokvelId) {
        try {
            const stokvel = await stokvelRepository.getStokvelById(stokvelId);
            if (!stokvel) throw new Error('Stokvel not found');
            
            return {
                success: true,
                stokvel
            };
        } catch (error) {
            logger.error('Error getting stokvel details:', error);
            return {
                success: false,
                error: error.message || 'Failed to get stokvel details'
            };
        }
    }
    
    /**
     * Get contribution history for a stokvel
     */
    async getContributionHistory(stokvelId, userId) {
        try {
            const contributions = await contributionRepository.getContributionsForStokvel(stokvelId, userId);
            
            return {
                success: true,
                contributions
            };
        } catch (error) {
            logger.error('Error getting contribution history:', error);
            return {
                success: false,
                error: error.message || 'Failed to get contribution history'
            };
        }
    }
    
    /**
     * Request early withdrawal (Planning Ahead stokvel only)
     */
    async requestWithdrawal(userId, stokvelId, amount, reason) {
        try {
            // Get stokvel details
            const stokvel = await stokvelRepository.getStokvelById(stokvelId);
            if (!stokvel) throw new Error('Stokvel not found');
            
            // Check if early withdrawal is allowed
            if (!stokvel.allowsEarlyWithdrawal()) {
                throw new Error('Early withdrawal not allowed for this stokvel type');
            }
            
            // Get user's membership
            const user = await userRepository.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            const membership = user.stokvels.find(s => s.id === stokvelId);
            if (!membership) throw new Error('Membership not found');
            
            // Check if amount is available
            if (amount > membership.balance) {
                throw new Error('Insufficient balance');
            }
            
            // TODO: Create withdrawal request record for admin approval
            // For now, we'll just return success
            
            logger.log(`Withdrawal request created for user ${userId}`);
            
            return {
                success: true,
                message: 'Withdrawal request submitted. Awaiting approval.'
            };
        } catch (error) {
            logger.error('Error requesting withdrawal:', error);
            return {
                success: false,
                error: error.message || 'Failed to request withdrawal'
            };
        }
    }
    
    /**
     * Get stokvel type configuration
     */
    getStokvelTypeConfig(type) {
        const normalized = type.toLowerCase();
        
        if (normalized.includes('january')) {
            return StokvelService.STOKVEL_TYPES.JANUARY;
        } else if (normalized.includes('grocery')) {
            return StokvelService.STOKVEL_TYPES.GROCERY;
        } else if (normalized.includes('planning')) {
            return StokvelService.STOKVEL_TYPES.PLANNING;
        }
        
        return null;
    }
    
    /**
     * Calculate stokvel start and end dates
     */
    calculateStokvelDates(typeConfig) {
        const today = new Date();
        let startDate, endDate;
        
        if (typeConfig.type === 'January') {
            // Starts February 1st
            startDate = new Date(today.getFullYear(), 1, 1);
            // Ends December 1st
            endDate = new Date(today.getFullYear(), 11, 1);
        } else if (typeConfig.type === 'Grocery') {
            // Starts January 1st
            startDate = new Date(today.getFullYear(), 0, 1);
            // Ends October 1st
            endDate = new Date(today.getFullYear(), 9, 1);
        } else {
            // Planning Ahead - starts now
            startDate = new Date();
            // Ends 10 months from now
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 10);
        }
        
        return { startDate, endDate };
    }
    
    /**
     * Calculate next contribution date (1 month from now)
     */
    calculateNextContributionDate() {
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        return nextDate.toISOString().split('T')[0];
    }
}

// Create singleton instance
export const stokvelService = new StokvelService();

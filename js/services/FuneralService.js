/**
 * Funeral Service
 * Handles all funeral cover-related business logic
 */

import { userRepository } from '../repositories/UserRepository.js';
import { FuneralCoverPlan, FuneralCoverMembership } from '../models/FuneralCover.model.js';
import { logger } from '../config/environment.js';

export class FuneralService {
    /**
     * Get available funeral cover plans
     */
    getPlans() {
        return FuneralCoverPlan.PLANS;
    }
    
    /**
     * Get plan by ID
     */
    getPlan(planId) {
        return FuneralCoverPlan.getPlan(planId);
    }
    
    /**
     * Get additional benefits
     */
    getAdditionalBenefits() {
        return FuneralCoverPlan.ADDITIONAL_BENEFITS;
    }
    
    /**
     * Calculate premium for a plan with additional benefits
     */
    calculatePremium(planId, additionalBenefits = []) {
        return FuneralCoverPlan.calculatePremium(planId, additionalBenefits);
    }
    
    /**
     * Activate funeral cover for a user
     */
    async activateCover(userId, planId, paymentMethod, familyDetails = null, additionalBenefits = []) {
        try {
            logger.log(`Activating funeral cover for user ${userId}`);
            
            // Validate plan
            const plan = this.getPlan(planId);
            if (!plan) {
                throw new Error('Invalid plan selected');
            }
            
            // Calculate premium
            const monthlyPremium = this.calculatePremium(planId, additionalBenefits);
            
            // Validate family details for family plans
            if ((planId === 'family' || planId === 'extended') && !familyDetails) {
                throw new Error('Family details required for this plan');
            }
            
            // Update user record
            await userRepository.updateFuneralCover(userId, {
                planId,
                paymentMethod,
                familyDetails,
                additionalBenefits,
                monthlyPremium
            });
            
            logger.log(`Funeral cover activated for user ${userId}`);
            
            return {
                success: true,
                plan,
                monthlyPremium,
                message: 'Funeral cover activated successfully'
            };
        } catch (error) {
            logger.error('Error activating funeral cover:', error);
            return {
                success: false,
                error: error.message || 'Failed to activate funeral cover'
            };
        }
    }
    
    /**
     * Get user's funeral cover status
     */
    async getUserCoverStatus(userId) {
        try {
            const user = await userRepository.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            return {
                success: true,
                hasCover: user.funeralCover,
                planType: user.funeralCoverType,
                since: user.funeralCoverSince,
                familyDetails: user.funeralFamilyDetails
            };
        } catch (error) {
            logger.error('Error getting cover status:', error);
            return {
                success: false,
                error: error.message || 'Failed to get cover status'
            };
        }
    }
    
    /**
     * Submit a funeral claim
     */
    async submitClaim(userId, claimData) {
        try {
            logger.log(`Submitting funeral claim for user ${userId}`);
            
            // Validate user has cover
            const user = await userRepository.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            if (!user.funeralCover) {
                throw new Error('No active funeral cover');
            }
            
            // Create membership object
            const membership = new FuneralCoverMembership({
                userId,
                planId: user.funeralCoverType,
                active: true,
                startDate: user.funeralCoverSince
            });
            
            // Check waiting period for claim type
            const deathType = claimData.deathType || 'NATURAL_DEATH';
            if (!membership.hasWaitingPeriodPassed(deathType)) {
                const monthsRequired = FuneralCoverPlan.WAITING_PERIODS[deathType];
                throw new Error(`Waiting period not met. ${monthsRequired} months required for ${deathType}.`);
            }
            
            // TODO: Create claim record in Firestore
            // For now, we'll just return success
            
            logger.log(`Claim submitted successfully for user ${userId}`);
            
            return {
                success: true,
                message: 'Claim submitted successfully. You will be contacted within 48 hours.'
            };
        } catch (error) {
            logger.error('Error submitting claim:', error);
            return {
                success: false,
                error: error.message || 'Failed to submit claim'
            };
        }
    }
    
    /**
     * Cancel funeral cover
     */
    async cancelCover(userId, reason) {
        try {
            logger.log(`Canceling funeral cover for user ${userId}`);
            
            await userRepository.update(userId, {
                funeralCover: false,
                funeralCoverCanceledAt: new Date().toISOString(),
                funeralCoverCancelReason: reason
            });
            
            // Recalculate discount
            const user = await userRepository.getUserById(userId);
            if (user) {
                const newDiscount = user.calculateDiscount();
                await userRepository.update(userId, { storeDiscount: newDiscount });
            }
            
            logger.log(`Funeral cover canceled for user ${userId}`);
            
            return {
                success: true,
                message: 'Funeral cover canceled successfully'
            };
        } catch (error) {
            logger.error('Error canceling cover:', error);
            return {
                success: false,
                error: error.message || 'Failed to cancel cover'
            };
        }
    }
}

// Create singleton instance
export const funeralService = new FuneralService();

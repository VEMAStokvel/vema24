/**
 * User Repository
 * Handles all data operations for users
 */

import { BaseRepository } from './BaseRepository.js';
import { User } from '../models/User.model.js';
import { logger } from '../config/environment.js';

export class UserRepository extends BaseRepository {
    constructor() {
        super('users');
    }
    
    /**
     * Get user by ID and convert to User model
     */
    async getUserById(userId) {
        try {
            const doc = await this.collection.doc(userId).get();
            if (!doc.exists) {
                logger.warn(`User ${userId} not found`);
                return null;
            }
            return User.fromFirestore(doc);
        } catch (error) {
            logger.error(`Error getting user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Create or update user profile
     */
    async createOrUpdateUser(userId, userData) {
        try {
            const user = new User({ uid: userId, ...userData });
            await this.set(userId, user.toFirestore());
            logger.log(`User ${userId} created/updated successfully`);
            return user;
        } catch (error) {
            logger.error(`Error creating/updating user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update user's stokvel memberships
     */
    async updateUserStokvels(userId, stokvels) {
        try {
            await this.update(userId, { stokvels });
            logger.debug(`Updated stokvels for user ${userId}`);
            return true;
        } catch (error) {
            logger.error(`Error updating stokvels for user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Add stokvel to user's memberships
     */
    async addStokvelToUser(userId, stokvelMembership) {
        try {
            await this.collection.doc(userId).update({
                stokvels: firebase.firestore.FieldValue.arrayUnion(stokvelMembership.toObject())
            });
            logger.debug(`Added stokvel to user ${userId}`);
            return true;
        } catch (error) {
            logger.error(`Error adding stokvel to user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update user's savings total
     */
    async updateSavingsTotal(userId, amount) {
        try {
            const user = await this.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            const newSavingsTotal = user.savingsTotal + amount;
            const newDiscount = user.calculateDiscount();
            
            await this.update(userId, {
                savingsTotal: newSavingsTotal,
                storeDiscount: newDiscount
            });
            
            logger.debug(`Updated savings for user ${userId}: ${newSavingsTotal}`);
            return { savingsTotal: newSavingsTotal, storeDiscount: newDiscount };
        } catch (error) {
            logger.error(`Error updating savings for user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update user's funeral cover
     */
    async updateFuneralCover(userId, coverData) {
        try {
            await this.update(userId, {
                funeralCover: true,
                funeralCoverType: coverData.planId,
                funeralCoverSince: new Date().toISOString(),
                funeralCoverPaymentMethod: coverData.paymentMethod,
                funeralFamilyDetails: coverData.familyDetails || null
            });
            
            // Recalculate discount
            const user = await this.getUserById(userId);
            if (user) {
                const newDiscount = user.calculateDiscount();
                await this.update(userId, { storeDiscount: newDiscount });
            }
            
            logger.log(`Funeral cover activated for user ${userId}`);
            return true;
        } catch (error) {
            logger.error(`Error updating funeral cover for user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get users by role
     */
    async getUsersByRole(role) {
        try {
            return await this.query([['role', '==', role]]);
        } catch (error) {
            logger.error(`Error getting users by role ${role}:`, error);
            throw error;
        }
    }
    
    /**
     * Search users by email or name
     */
    async searchUsers(searchTerm) {
        try {
            const snapshot = await this.collection
                .where('email', '>=', searchTerm)
                .where('email', '<=', searchTerm + '\uf8ff')
                .get();
            
            return snapshot.docs.map(doc => User.fromFirestore(doc));
        } catch (error) {
            logger.error(`Error searching users:`, error);
            throw error;
        }
    }
}

// Create singleton instance
export const userRepository = new UserRepository();

/**
 * Stokvel Repository
 * Handles all data operations for stokvels
 */

import { BaseRepository } from './BaseRepository.js';
import { Stokvel } from '../models/Stokvel.model.js';
import { logger } from '../config/environment.js';

export class StokvelRepository extends BaseRepository {
    constructor() {
        super('stokvels');
    }
    
    /**
     * Get stokvel by ID and convert to Stokvel model
     */
    async getStokvelById(stokvelId) {
        try {
            const doc = await this.collection.doc(stokvelId).get();
            if (!doc.exists) {
                logger.warn(`Stokvel ${stokvelId} not found`);
                return null;
            }
            return Stokvel.fromFirestore(doc);
        } catch (error) {
            logger.error(`Error getting stokvel ${stokvelId}:`, error);
            throw error;
        }
    }
    
    /**
     * Create a new stokvel
     */
    async createStokvel(stokvelData) {
        try {
            const stokvel = new Stokvel(stokvelData);
            const id = await this.create(stokvel.toFirestore());
            stokvel.id = id;
            logger.log(`Stokvel ${id} created successfully`);
            return stokvel;
        } catch (error) {
            logger.error('Error creating stokvel:', error);
            throw error;
        }
    }
    
    /**
     * Get stokvels by type
     */
    async getStokvelsByType(type) {
        try {
            return await this.query([['type', '==', type]]);
        } catch (error) {
            logger.error(`Error getting stokvels by type ${type}:`, error);
            throw error;
        }
    }
    
    /**
     * Get active stokvels
     */
    async getActiveStokvels() {
        try {
            return await this.query([['status', '==', 'active']]);
        } catch (error) {
            logger.error('Error getting active stokvels:', error);
            throw error;
        }
    }
    
    /**
     * Add member to stokvel
     */
    async addMemberToStokvel(stokvelId, userId) {
        try {
            await this.collection.doc(stokvelId).update({
                members: firebase.firestore.FieldValue.arrayUnion(userId)
            });
            logger.debug(`Added member ${userId} to stokvel ${stokvelId}`);
            return true;
        } catch (error) {
            logger.error(`Error adding member to stokvel ${stokvelId}:`, error);
            throw error;
        }
    }
    
    /**
     * Remove member from stokvel
     */
    async removeMemberFromStokvel(stokvelId, userId) {
        try {
            await this.collection.doc(stokvelId).update({
                members: firebase.firestore.FieldValue.arrayRemove(userId)
            });
            logger.debug(`Removed member ${userId} from stokvel ${stokvelId}`);
            return true;
        } catch (error) {
            logger.error(`Error removing member from stokvel ${stokvelId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update stokvel status
     */
    async updateStokvelStatus(stokvelId, status) {
        try {
            await this.update(stokvelId, { status });
            logger.debug(`Updated stokvel ${stokvelId} status to ${status}`);
            return true;
        } catch (error) {
            logger.error(`Error updating stokvel ${stokvelId} status:`, error);
            throw error;
        }
    }
    
    /**
     * Get stokvels for user
     */
    async getStokvelsForUser(userId) {
        try {
            return await this.query([['members', 'array-contains', userId]]);
        } catch (error) {
            logger.error(`Error getting stokvels for user ${userId}:`, error);
            throw error;
        }
    }
}

/**
 * Contribution Repository
 * Handles contribution records
 */
export class ContributionRepository extends BaseRepository {
    constructor() {
        super('contributions');
    }
    
    /**
     * Record a contribution
     */
    async recordContribution(contributionData) {
        try {
            const id = await this.create({
                ...contributionData,
                date: new Date().toISOString(),
                status: 'completed'
            });
            logger.log(`Contribution ${id} recorded successfully`);
            return id;
        } catch (error) {
            logger.error('Error recording contribution:', error);
            throw error;
        }
    }
    
    /**
     * Get contributions for user
     */
    async getContributionsForUser(userId) {
        try {
            return await this.queryOrdered(
                [['userId', '==', userId]],
                ['date', 'desc']
            );
        } catch (error) {
            logger.error(`Error getting contributions for user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get contributions for stokvel
     */
    async getContributionsForStokvel(stokvelId, userId = null) {
        try {
            const conditions = [['stokvelId', '==', stokvelId]];
            if (userId) {
                conditions.push(['userId', '==', userId]);
            }
            return await this.queryOrdered(conditions, ['date', 'desc']);
        } catch (error) {
            logger.error(`Error getting contributions for stokvel ${stokvelId}:`, error);
            throw error;
        }
    }
}

// Create singleton instances
export const stokvelRepository = new StokvelRepository();
export const contributionRepository = new ContributionRepository();

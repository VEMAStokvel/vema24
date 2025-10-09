/**
 * Base Repository
 * Abstract base class for all repositories with common CRUD operations
 */

import { getFirestore } from '../config/firebase.config.js';
import { logger } from '../config/environment.js';

export class BaseRepository {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.db = getFirestore();
        this.collection = this.db.collection(collectionName);
    }
    
    /**
     * Get a document by ID
     */
    async getById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                logger.warn(`Document ${id} not found in ${this.collectionName}`);
                return null;
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            logger.error(`Error getting document ${id} from ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Get all documents
     */
    async getAll() {
        try {
            const snapshot = await this.collection.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            logger.error(`Error getting all documents from ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Create a new document
     */
    async create(data) {
        try {
            const docRef = await this.collection.add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            logger.debug(`Created document ${docRef.id} in ${this.collectionName}`);
            return docRef.id;
        } catch (error) {
            logger.error(`Error creating document in ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Update a document
     */
    async update(id, data) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            logger.debug(`Updated document ${id} in ${this.collectionName}`);
            return true;
        } catch (error) {
            logger.error(`Error updating document ${id} in ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a document
     */
    async delete(id) {
        try {
            await this.collection.doc(id).delete();
            logger.debug(`Deleted document ${id} from ${this.collectionName}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Query documents with conditions
     */
    async query(conditions = []) {
        try {
            let query = this.collection;
            
            conditions.forEach(condition => {
                const [field, operator, value] = condition;
                query = query.where(field, operator, value);
            });
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            logger.error(`Error querying ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Query with ordering and limit
     */
    async queryOrdered(conditions = [], orderBy = null, limit = null) {
        try {
            let query = this.collection;
            
            conditions.forEach(condition => {
                const [field, operator, value] = condition;
                query = query.where(field, operator, value);
            });
            
            if (orderBy) {
                const [field, direction = 'asc'] = orderBy;
                query = query.orderBy(field, direction);
            }
            
            if (limit) {
                query = query.limit(limit);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            logger.error(`Error querying ordered ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Set a document with specific ID (creates or overwrites)
     */
    async set(id, data) {
        try {
            await this.collection.doc(id).set({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            logger.debug(`Set document ${id} in ${this.collectionName}`);
            return true;
        } catch (error) {
            logger.error(`Error setting document ${id} in ${this.collectionName}:`, error);
            throw error;
        }
    }
    
    /**
     * Check if a document exists
     */
    async exists(id) {
        try {
            const doc = await this.collection.doc(id).get();
            return doc.exists;
        } catch (error) {
            logger.error(`Error checking existence of document ${id} in ${this.collectionName}:`, error);
            throw error;
        }
    }
}

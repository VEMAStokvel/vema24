/**
 * Product Repository
 * Handles all data operations for products and orders
 */

import { BaseRepository } from './BaseRepository.js';
import { Product, Order } from '../models/Product.model.js';
import { logger } from '../config/environment.js';

export class ProductRepository extends BaseRepository {
    constructor() {
        super('products');
    }
    
    /**
     * Get product by ID and convert to Product model
     */
    async getProductById(productId) {
        try {
            const doc = await this.collection.doc(productId).get();
            if (!doc.exists) {
                logger.warn(`Product ${productId} not found`);
                return null;
            }
            return Product.fromFirestore(doc);
        } catch (error) {
            logger.error(`Error getting product ${productId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get all products
     */
    async getAllProducts() {
        try {
            const snapshot = await this.collection.get();
            return snapshot.docs.map(doc => Product.fromFirestore(doc));
        } catch (error) {
            logger.error('Error getting all products:', error);
            throw error;
        }
    }
    
    /**
     * Get products by category
     */
    async getProductsByCategory(category) {
        try {
            return await this.query([['category', '==', category]]);
        } catch (error) {
            logger.error(`Error getting products by category ${category}:`, error);
            throw error;
        }
    }
    
    /**
     * Get featured products
     */
    async getFeaturedProducts() {
        try {
            return await this.query([['featured', '==', true]]);
        } catch (error) {
            logger.error('Error getting featured products:', error);
            throw error;
        }
    }
    
    /**
     * Update product stock
     */
    async updateStock(productId, quantity) {
        try {
            const product = await this.getProductById(productId);
            if (!product) throw new Error('Product not found');
            
            const newStock = product.stock + quantity;
            await this.update(productId, { stock: newStock });
            
            logger.debug(`Updated stock for product ${productId}: ${newStock}`);
            return newStock;
        } catch (error) {
            logger.error(`Error updating stock for product ${productId}:`, error);
            throw error;
        }
    }
}

/**
 * Order Repository
 * Handles order operations
 */
export class OrderRepository extends BaseRepository {
    constructor() {
        super('orders');
    }
    
    /**
     * Create an order
     */
    async createOrder(orderData) {
        try {
            const order = new Order(orderData);
            const id = await this.create(order.toFirestore());
            order.id = id;
            
            logger.log(`Order ${id} created successfully`);
            return order;
        } catch (error) {
            logger.error('Error creating order:', error);
            throw error;
        }
    }
    
    /**
     * Get orders for user
     */
    async getOrdersForUser(userId) {
        try {
            return await this.queryOrdered(
                [['userId', '==', userId]],
                ['createdAt', 'desc']
            );
        } catch (error) {
            logger.error(`Error getting orders for user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get order by ID
     */
    async getOrderById(orderId) {
        try {
            const doc = await this.collection.doc(orderId).get();
            if (!doc.exists) {
                logger.warn(`Order ${orderId} not found`);
                return null;
            }
            return Order.fromFirestore(doc);
        } catch (error) {
            logger.error(`Error getting order ${orderId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status) {
        try {
            await this.update(orderId, { status });
            logger.log(`Order ${orderId} status updated to ${status}`);
            return true;
        } catch (error) {
            logger.error(`Error updating order ${orderId} status:`, error);
            throw error;
        }
    }
    
    /**
     * Get pending orders
     */
    async getPendingOrders() {
        try {
            return await this.query([['status', '==', 'processing']]);
        } catch (error) {
            logger.error('Error getting pending orders:', error);
            throw error;
        }
    }
}

// Create singleton instances
export const productRepository = new ProductRepository();
export const orderRepository = new OrderRepository();

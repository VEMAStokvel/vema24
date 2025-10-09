/**
 * Store Service
 * Handles all store-related business logic
 */

import { productRepository, orderRepository } from '../repositories/ProductRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { CartItem, Order } from '../models/Product.model.js';
import { logger } from '../config/environment.js';

export class StoreService {
    /**
     * Get all products
     */
    async getAllProducts() {
        try {
            const products = await productRepository.getAllProducts();
            
            return {
                success: true,
                products
            };
        } catch (error) {
            logger.error('Error getting products:', error);
            return {
                success: false,
                error: error.message || 'Failed to load products'
            };
        }
    }
    
    /**
     * Get product by ID
     */
    async getProductById(productId) {
        try {
            const product = await productRepository.getProductById(productId);
            if (!product) throw new Error('Product not found');
            
            return {
                success: true,
                product
            };
        } catch (error) {
            logger.error('Error getting product:', error);
            return {
                success: false,
                error: error.message || 'Failed to load product'
            };
        }
    }
    
    /**
     * Get products by category
     */
    async getProductsByCategory(category) {
        try {
            const products = await productRepository.getProductsByCategory(category);
            
            return {
                success: true,
                products
            };
        } catch (error) {
            logger.error('Error getting products by category:', error);
            return {
                success: false,
                error: error.message || 'Failed to load products'
            };
        }
    }
    
    /**
     * Get user's discount
     */
    async getUserDiscount(userId) {
        try {
            const user = await userRepository.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            return {
                success: true,
                discount: user.storeDiscount,
                savingsTotal: user.savingsTotal
            };
        } catch (error) {
            logger.error('Error getting user discount:', error);
            return {
                success: false,
                error: error.message || 'Failed to get discount',
                discount: 0
            };
        }
    }
    
    /**
     * Create an order
     */
    async createOrder(userId, cartItems, shippingAddress, paymentMethod) {
        try {
            logger.log(`Creating order for user ${userId}`);
            
            // Validate cart items
            if (!cartItems || cartItems.length === 0) {
                throw new Error('Cart is empty');
            }
            
            // Get user's discount
            const user = await userRepository.getUserById(userId);
            const discountPercent = user?.storeDiscount || 0;
            
            // Convert cart items to CartItem models
            const items = cartItems.map(item => new CartItem(item));
            
            // Calculate totals
            const { subtotal, discount, total } = Order.calculateTotals(items, discountPercent);
            
            // Create order
            const order = await orderRepository.createOrder({
                userId,
                items,
                subtotal,
                discount,
                total,
                shippingAddress,
                paymentMethod,
                status: 'processing'
            });
            
            // Update product stock
            for (const item of items) {
                await productRepository.updateStock(item.id, -item.quantity);
            }
            
            logger.log(`Order ${order.id} created successfully`);
            
            return {
                success: true,
                order,
                message: 'Order placed successfully'
            };
        } catch (error) {
            logger.error('Error creating order:', error);
            return {
                success: false,
                error: error.message || 'Failed to create order'
            };
        }
    }
    
    /**
     * Get user's orders
     */
    async getUserOrders(userId) {
        try {
            const orders = await orderRepository.getOrdersForUser(userId);
            
            return {
                success: true,
                orders
            };
        } catch (error) {
            logger.error('Error getting user orders:', error);
            return {
                success: false,
                error: error.message || 'Failed to get orders'
            };
        }
    }
    
    /**
     * Get order by ID
     */
    async getOrderById(orderId) {
        try {
            const order = await orderRepository.getOrderById(orderId);
            if (!order) throw new Error('Order not found');
            
            return {
                success: true,
                order
            };
        } catch (error) {
            logger.error('Error getting order:', error);
            return {
                success: false,
                error: error.message || 'Failed to get order'
            };
        }
    }
    
    /**
     * Calculate cart totals with user's discount
     */
    async calculateCartTotals(userId, cartItems) {
        try {
            const user = await userRepository.getUserById(userId);
            const discountPercent = user?.storeDiscount || 0;
            
            const items = cartItems.map(item => new CartItem(item));
            const totals = Order.calculateTotals(items, discountPercent);
            
            return {
                success: true,
                ...totals,
                discountPercent
            };
        } catch (error) {
            logger.error('Error calculating cart totals:', error);
            return {
                success: false,
                error: error.message || 'Failed to calculate totals'
            };
        }
    }
}

// Create singleton instance
export const storeService = new StoreService();

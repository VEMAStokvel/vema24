/**
 * Product Model
 * Defines the structure for store products
 */

export class Product {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.price = data.price || 0;
        this.category = data.category || '';
        this.image = data.image || '';
        this.stock = data.stock || 0;
        this.featured = data.featured || false;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
    
    /**
     * Convert to plain object for Firestore
     */
    toFirestore() {
        return {
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            image: this.image,
            stock: this.stock,
            featured: this.featured,
            createdAt: this.createdAt,
            updatedAt: new Date()
        };
    }
    
    /**
     * Create Product instance from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new Product({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        });
    }
    
    /**
     * Check if product is in stock
     */
    isInStock() {
        return this.stock > 0;
    }
    
    /**
     * Calculate discounted price
     */
    getDiscountedPrice(discountPercent) {
        return this.price * (1 - discountPercent / 100);
    }
}

/**
 * Cart Item Model
 */
export class CartItem {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.price = data.price || 0;
        this.image = data.image || '';
        this.quantity = data.quantity || 1;
    }
    
    /**
     * Get total price for this item
     */
    getTotal() {
        return this.price * this.quantity;
    }
    
    /**
     * Convert to plain object
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            image: this.image,
            quantity: this.quantity
        };
    }
    
    /**
     * Create from plain object
     */
    static fromObject(obj) {
        return new CartItem(obj);
    }
}

/**
 * Order Model
 */
export class Order {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId || '';
        this.items = data.items || [];
        this.subtotal = data.subtotal || 0;
        this.discount = data.discount || 0;
        this.total = data.total || 0;
        this.shippingAddress = data.shippingAddress || '';
        this.paymentMethod = data.paymentMethod || '';
        this.status = data.status || 'processing';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
    
    /**
     * Convert to plain object for Firestore
     */
    toFirestore() {
        return {
            userId: this.userId,
            items: this.items.map(item => item.toObject ? item.toObject() : item),
            subtotal: this.subtotal,
            discount: this.discount,
            total: this.total,
            shippingAddress: this.shippingAddress,
            paymentMethod: this.paymentMethod,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: new Date()
        };
    }
    
    /**
     * Create Order instance from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new Order({
            id: doc.id,
            ...data,
            items: data.items.map(item => CartItem.fromObject(item)),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        });
    }
    
    /**
     * Calculate order totals
     */
    static calculateTotals(items, discountPercent = 0) {
        const subtotal = items.reduce((sum, item) => sum + item.getTotal(), 0);
        const discount = subtotal * (discountPercent / 100);
        const total = subtotal - discount;
        
        return { subtotal, discount, total };
    }
}

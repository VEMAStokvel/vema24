/**
 * Formatter Utility
 * Provides formatting functions for displaying data
 */

export class Formatter {
    /**
     * Format currency amount in ZAR
     */
    static formatCurrency(amount, includeCents = true) {
        const options = {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: includeCents ? 2 : 0,
            maximumFractionDigits: includeCents ? 2 : 0
        };
        
        return new Intl.NumberFormat('en-ZA', options).format(amount);
    }
    
    /**
     * Format number with thousands separator
     */
    static formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat('en-ZA', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }
    
    /**
     * Format date in South African format
     */
    static formatDate(date, includeTime = false) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (includeTime) {
            return dateObj.toLocaleString('en-ZA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return dateObj.toLocaleDateString('en-ZA');
    }
    
    /**
     * Format date relative to now (e.g., "2 days ago")
     */
    static formatRelativeDate(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffMs = now - dateObj;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
        
        return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
    }
    
    /**
     * Format phone number
     */
    static formatPhoneNumber(phone) {
        if (!phone) return '';
        
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        
        // Format as 082 123 4567
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }
        
        return phone;
    }
    
    /**
     * Format ID number (mask middle digits)
     */
    static formatIdNumber(idNumber, mask = true) {
        if (!idNumber) return '';
        
        if (mask) {
            // Show first 6 and last 2 digits
            return `${idNumber.slice(0, 6)}*****${idNumber.slice(-2)}`;
        }
        
        return idNumber;
    }
    
    /**
     * Format percentage
     */
    static formatPercentage(value, decimals = 0) {
        return `${this.formatNumber(value, decimals)}%`;
    }
    
    /**
     * Format file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
    
    /**
     * Truncate text with ellipsis
     */
    static truncate(text, maxLength, ellipsis = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength - ellipsis.length) + ellipsis;
    }
    
    /**
     * Capitalize first letter
     */
    static capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    /**
     * Convert to title case
     */
    static toTitleCase(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    }
    
    /**
     * Format status badge
     */
    static formatStatusBadge(status) {
        const statusMap = {
            'pending': { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
            'active': { text: 'Active', class: 'bg-green-100 text-green-800' },
            'completed': { text: 'Completed', class: 'bg-blue-100 text-blue-800' },
            'approved': { text: 'Approved', class: 'bg-green-100 text-green-800' },
            'rejected': { text: 'Rejected', class: 'bg-red-100 text-red-800' },
            'processing': { text: 'Processing', class: 'bg-yellow-100 text-yellow-800' },
            'paid': { text: 'Paid', class: 'bg-green-100 text-green-800' }
        };
        
        return statusMap[status.toLowerCase()] || { text: status, class: 'bg-gray-100 text-gray-800' };
    }
}

export default Formatter;

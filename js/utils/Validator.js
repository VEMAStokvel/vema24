/**
 * Validator Utility
 * Provides validation functions for forms and data
 */

export class Validator {
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Validate South African phone number
     */
    static isValidSAPhoneNumber(phone) {
        // Matches formats: 0821234567, +27821234567, 082 123 4567
        const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
        const cleanPhone = phone.replace(/\s/g, '');
        return phoneRegex.test(cleanPhone);
    }
    
    /**
     * Validate South African ID number
     */
    static isValidSAIdNumber(idNumber) {
        // Basic validation - 13 digits
        if (!/^\d{13}$/.test(idNumber)) {
            return false;
        }
        
        // Luhn algorithm check
        let sum = 0;
        let shouldDouble = false;
        
        for (let i = idNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(idNumber.charAt(i));
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return sum % 10 === 0;
    }
    
    /**
     * Validate password strength
     */
    static isStrongPassword(password) {
        if (password.length < 8) {
            return {
                valid: false,
                message: 'Password must be at least 8 characters long'
            };
        }
        
        if (!/[A-Z]/.test(password)) {
            return {
                valid: false,
                message: 'Password must contain at least one uppercase letter'
            };
        }
        
        if (!/[a-z]/.test(password)) {
            return {
                valid: false,
                message: 'Password must contain at least one lowercase letter'
            };
        }
        
        if (!/[0-9]/.test(password)) {
            return {
                valid: false,
                message: 'Password must contain at least one number'
            };
        }
        
        return { valid: true, message: 'Password is strong' };
    }
    
    /**
     * Validate required field
     */
    static isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
    
    /**
     * Validate minimum length
     */
    static minLength(value, length) {
        return value && value.toString().length >= length;
    }
    
    /**
     * Validate maximum length
     */
    static maxLength(value, length) {
        return value && value.toString().length <= length;
    }
    
    /**
     * Validate number range
     */
    static inRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }
    
    /**
     * Validate amount format
     */
    static isValidAmount(amount) {
        const num = parseFloat(amount);
        return !isNaN(num) && num > 0;
    }
    
    /**
     * Sanitize input to prevent XSS
     */
    static sanitize(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    /**
     * Validate form data against rules
     */
    static validateForm(data, rules) {
        const errors = {};
        
        for (const field in rules) {
            const fieldRules = rules[field];
            const value = data[field];
            
            // Required check
            if (fieldRules.required && !this.isRequired(value)) {
                errors[field] = `${fieldRules.label || field} is required`;
                continue;
            }
            
            // Skip other validations if field is empty and not required
            if (!value && !fieldRules.required) continue;
            
            // Email validation
            if (fieldRules.email && !this.isValidEmail(value)) {
                errors[field] = `${fieldRules.label || field} must be a valid email`;
            }
            
            // Phone validation
            if (fieldRules.phone && !this.isValidSAPhoneNumber(value)) {
                errors[field] = `${fieldRules.label || field} must be a valid South African phone number`;
            }
            
            // ID number validation
            if (fieldRules.idNumber && !this.isValidSAIdNumber(value)) {
                errors[field] = `${fieldRules.label || field} must be a valid South African ID number`;
            }
            
            // Min length validation
            if (fieldRules.minLength && !this.minLength(value, fieldRules.minLength)) {
                errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
            }
            
            // Max length validation
            if (fieldRules.maxLength && !this.maxLength(value, fieldRules.maxLength)) {
                errors[field] = `${fieldRules.label || field} must be at most ${fieldRules.maxLength} characters`;
            }
            
            // Custom validation function
            if (fieldRules.custom) {
                const customResult = fieldRules.custom(value, data);
                if (customResult !== true) {
                    errors[field] = customResult;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

export default Validator;

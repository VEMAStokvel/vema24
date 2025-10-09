/**
 * Firebase Configuration
 * Centralized Firebase configuration and initialization
 */

import { logger } from './environment.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAEik5dGton3H4LyGDzYbNrw6GwutGNOqk",
    authDomain: "vema-7606a.firebaseapp.com",
    projectId: "vema-7606a",
    storageBucket: "vema-7606a.appspot.com",
    messagingSenderId: "127492940070",
    appId: "1:127492940070:web:ddf247a2cb0723ddcbe1e7"
};

/**
 * Initialize Firebase
 * Returns initialized Firebase app instance
 */
export const initializeFirebase = () => {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            logger.log('Firebase initialized successfully');
        } else {
            logger.debug('Firebase already initialized');
        }
        return firebase.app();
    } catch (error) {
        logger.error('Error initializing Firebase:', error);
        throw error;
    }
};

/**
 * Get Firebase Auth instance
 */
export const getAuth = () => {
    initializeFirebase();
    return firebase.auth();
};

/**
 * Get Firestore instance
 */
export const getFirestore = () => {
    initializeFirebase();
    return firebase.firestore();
};

/**
 * Get Firebase Storage instance
 */
export const getStorage = () => {
    initializeFirebase();
    return firebase.storage();
};

export default {
    initializeFirebase,
    getAuth,
    getFirestore,
    getStorage,
    firebaseConfig
};

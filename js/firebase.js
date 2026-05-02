// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAEik5dGton3H4LyGDzYbNrw6GwutGNOqk",
  authDomain: "vema-7606a.firebaseapp.com",
  projectId: "vema-7606a",
  storageBucket: "vema-7606a.firebasestorage.app",
  messagingSenderId: "127492940070",
  appId: "1:127492940070:web:ddf247a2cb0723ddcbe1e7"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

const db = firebase.firestore();
// Safari / iOS and some proxies buffer WebChannel responses; reads can hang without completing.
// Long polling avoids that class of stalls (see Firebase issue #1674).
try {
  db.settings({
    experimentalForceLongPolling: true,
    experimentalLongPollingOptions: { timeoutSeconds: 25 },
  });
} catch (e) {
  console.warn('Firestore settings skipped:', e);
}

// Make globally available for non-module scripts
window.auth = auth;
window.db = db;

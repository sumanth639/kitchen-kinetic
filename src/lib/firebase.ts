
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "flavorverse-jzsmt",
  appId: "1:503226946941:web:247c35ccd979dc363d6814",
  storageBucket: "flavorverse-jzsmt.firebasestorage.app",
  apiKey: "AIzaSyA28ZwXsEZIk7Ms7kU3Ktgel70uZexEqvU",
  authDomain: "flavorverse-jzsmt.firebaseapp.com",
  messagingSenderId: "503226946941",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

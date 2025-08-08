import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAFKVv7cMvL0VLPIB6CvwgKBtDq4xwhrC4",
  authDomain: "sanal-ab206.firebaseapp.com",
  projectId: "sanal-ab206",
  storageBucket: "sanal-ab206.firebasestorage.app",
  messagingSenderId: "754559793224",
  appId: "1:754559793224:web:a7ef56082d9b9deef9c07d",
  measurementId: "G-SRHF22CXBB"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Servisleri dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 
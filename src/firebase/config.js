// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuy0Dbp27HhuILXlvNS53fJn112at-EX0",
  authDomain: "clases-adultos-13d23.firebaseapp.com",
  projectId: "clases-adultos-13d23",
  storageBucket: "clases-adultos-13d23.firebasestorage.app",
  messagingSenderId: "335820910145",
  appId: "1:335820910145:web:f2d6ef35c242f80e0b60c0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

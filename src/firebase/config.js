// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCTOlk-8eMSVNwwTJXDVfIR6cwqkdPwSU",
  authDomain: "clases-adultos-80f86.firebaseapp.com",
  projectId: "clases-adultos-80f86",
  storageBucket: "clases-adultos-80f86.firebasestorage.app",
  messagingSenderId: "385506685560",
  appId: "1:385506685560:web:f1786140e33c7336e3f38d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

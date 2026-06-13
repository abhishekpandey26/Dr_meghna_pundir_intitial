import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAIZkSogwSkBitNGCrYlUERqTY_GPwQSxw",
    authDomain: "offshoredev-edu.firebaseapp.com",
    projectId: "offshoredev-edu",
    storageBucket: "offshoredev-edu.firebasestorage.app",
    messagingSenderId: "966156608627",
    appId: "1:966156608627:web:ff901bad8704fb115f7606",
    measurementId: "G-JBWNZ76K03"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

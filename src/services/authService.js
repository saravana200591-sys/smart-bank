import { auth, db } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth'; // Note: signInWithPopup is for web test
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const handleGoogleLogin = async () => {
    // In a real Expo app, we'd use @react-native-google-signin/google-signin
    // or expo-auth-session. Since this is a demo, we might need a simulated
    // login or a web-compatible popup if testing on web.
    // For simplicity of this universal demo, we will provide a simulated login option in the UI,
    // or rely on signInWithEmailAndPassword for basic demo accounts if OAuth isn't configured fully.
};

export const createProfile = async (uid, name, email, phone, language) => {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
            // New user setup
            const upiId = `${name.toLowerCase().replace(/\s+/g, '')}@smartbank`;
            await setDoc(userRef, {
                uid,
                name,
                email,
                phone: phone || '',
                language: language || 'en',
                balance: 10000, // starting demo balance
                upiId,
                mode: 'normal',
                createdAt: new Date().toISOString()
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

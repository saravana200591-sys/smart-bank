import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const knownDeviceKey = `knownDevice_${authUser.uid}`;
        const isKnown = await AsyncStorage.getItem(knownDeviceKey);
        
        if (!isKnown) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'New Login Detected 🚨',
              body: 'Your SmartBank account was just logged in to this device.',
              sound: true,
            },
            trigger: null,
          });
          await AsyncStorage.setItem(knownDeviceKey, 'true');
        }
      }
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

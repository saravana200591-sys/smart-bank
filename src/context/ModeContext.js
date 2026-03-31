import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

// Modes: 'normal', 'senior', 'vi' (visually_impaired)
export const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const [mode, setModeState] = useState('normal'); 
  const [isModeLoading, setIsModeLoading] = useState(true);

  useEffect(() => {
    const loadMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem('@smartbank_mode');
        if (storedMode) setModeState(storedMode);
      } catch (e) {
        console.error('Failed to load mode', e);
      }
      setIsModeLoading(false);
    };
    loadMode();
  }, []);

  const setMode = async (newMode) => {
    try {
      await AsyncStorage.setItem('@smartbank_mode', newMode);
      setModeState(newMode);
      
      // Voice confirmation for VI mode switch
      if (newMode === 'vi') {
        Speech.speak('Visually Impaired Mode activated. Voice commands are now enabled.', { rate: 0.9 });
      } else if (newMode === 'senior') {
        Speech.speak('Senior Mode activated.', { rate: 0.9 });
      }
    } catch (e) {
      console.error('Failed to save mode', e);
    }
  };

  const speakIfVI = (text) => {
    if (mode === 'vi') {
      Speech.speak(text, { rate: 0.9 });
    }
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, isModeLoading, speakIfVI }}>
      {children}
    </ModeContext.Provider>
  );
};

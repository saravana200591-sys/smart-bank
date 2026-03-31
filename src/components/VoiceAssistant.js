import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
// NOTE: react-native-voice requires bare workflow (run prebuild). Not fully compatible
// with simple Expo Go. For this simulated demo, we'll use a mock listening timeout,
// but structure it properly for the real API later.
import { ModeContext } from '../context/ModeContext';
import { AuthContext } from '../context/AuthContext';
import { parseVoiceCommand } from '../utils/commandParser';
import { useNavigation } from '@react-navigation/native';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { mode } = useContext(ModeContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  // Show floating button only in Visually Impaired mode (or Normal if requested)
  if (mode === 'senior') return null;

  const startListeningMock = () => {
    setIsListening(true);
    setTranscript('Listening...');
    Speech.speak("I am listening.", { rate: 0.9 });

    // Simulate STT delay
    setTimeout(async () => {
        // Mocked input for demo: usually you'd setTranscript with Voice.onSpeechResults
        const mockInput = "What is my balance";
        setTranscript(mockInput);
        
        const result = await parseVoiceCommand(mockInput, user.uid, navigation);
        
        setIsListening(false);
        
        if (result.action === 'NAVIGATE') {
            Speech.speak(result.explicitFeedback);
            navigation.navigate(result.route);
        } else {
            Speech.speak(result.message);
        }
        
        setTimeout(() => setTranscript(''), 3000);
    }, 3000);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.floatingBtn, mode === 'vi' && styles.viFloatingBtn]} 
        onPress={startListeningMock}
      >
        <Icon name="microphone" size={mode === 'vi' ? 50 : 30} color="#FFF" />
      </TouchableOpacity>

      {isListening && (
        <View style={styles.overlay}>
            <View style={styles.dialog}>
                <Icon name="microphone" size={50} color="#1E40AF" />
                <Text style={styles.transcript}>{transcript}</Text>
            </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1E40AF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 999
  },
  viFloatingBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    right: 0,
    left: '50%',
    marginLeft: -50, // Center it for VI
    backgroundColor: '#000',
    borderColor: '#FFF',
    borderWidth: 4,
    bottom: 40
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dialog: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center'
  },
  transcript: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937'
  }
});

export default VoiceAssistant;

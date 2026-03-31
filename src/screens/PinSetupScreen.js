import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const PinSetupScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter PIN, 2: Confirm PIN

  const handleNext = () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits.');
      return;
    }
    setStep(2);
  };

  const handleSavePin = async () => {
    if (confirmPin !== pin) {
      Alert.alert('PIN Mismatch', 'The PINs do not match. Try again.');
      setConfirmPin('');
      setStep(1);
      setPin('');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      // In a real app we would hash this PIN before sending/storing, but for this simulated app we just store it.
      await updateDoc(userRef, { pin: pin });
      // App.js handles navigation state automatically once user.pin is updated in Firestore
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="lock-outline" size={60} color="#1E40AF" style={{ alignSelf: 'center', marginBottom: 20 }} />
      <Text style={styles.title}>{step === 1 ? 'Set up a 4-digit PIN' : 'Confirm your PIN'}</Text>
      <Text style={styles.subtitle}>This PIN will be used to authorize your transactions.</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
        autoFocus
        value={step === 1 ? pin : confirmPin}
        onChangeText={step === 1 ? setPin : setConfirmPin}
      />

      <TouchableOpacity
        style={[styles.button, (step === 1 ? pin.length : confirmPin.length) !== 4 && styles.buttonDisabled]}
        onPress={step === 1 ? handleNext : handleSavePin}
        disabled={loading || (step === 1 ? pin.length : confirmPin.length) !== 4}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{step === 1 ? 'Next' : 'Save PIN'}</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f3f4f6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30 },
  input: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 30
  },
  button: { backgroundColor: '#1E40AF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default PinSetupScreen;

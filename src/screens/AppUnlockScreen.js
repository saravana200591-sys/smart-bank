import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import { BankContext } from '../context/BankContext';

const AppUnlockScreen = ({ route }) => {
  const { userData } = useContext(BankContext);
  const { setIsUnlocked } = route.params || {};
  
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  
  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricSupported(compatible && enrolled);

    // Auto-prompt on mount if supported
    if (compatible && enrolled) {
      handleBiometricAuth();
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access SmartBank',
        fallbackLabel: 'Use PIN',
      });

      if (result.success && setIsUnlocked) {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.log('Biometric auth error: ', error);
    }
  };

  const handlePinAuth = () => {
    if (pin.length !== 4) return;
    setLoading(true);

    if (userData && userData.pin === pin) {
      if (setIsUnlocked) {
          setIsUnlocked(true);
      }
    } else {
      Alert.alert('Incorrect PIN', 'The PIN entered is not correct.');
      setPin('');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="shield-lock-outline" size={80} color="#1E40AF" style={{ alignSelf: 'center', marginBottom: 30 }} />
      <Text style={styles.title}>Unlock SmartBank</Text>
      
      <Text style={styles.subtitle}>Enter your 4-digit PIN to access your account.</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
        autoFocus={!biometricSupported}
        value={pin}
        onChangeText={(text) => {
            setPin(text);
            if (text.length === 4) {
               // auto submit
               setTimeout(() => {
                   setLoading(true);
                   if (userData && userData.pin === text) {
                       if (setIsUnlocked) setIsUnlocked(true);
                   } else {
                       Alert.alert('Incorrect PIN', 'The PIN entered is not correct.');
                       setPin('');
                       setLoading(false);
                   }
               }, 100);
            }
        }}
      />

      {biometricSupported && (
        <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricAuth}>
          <Icon name="fingerprint" size={30} color="#1E40AF" />
          <Text style={styles.biometricTxt}>Use Biometrics</Text>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 20 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f3f4f6' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#6B7280', marginBottom: 30 },
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
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E40AF',
    backgroundColor: '#eff6ff'
  },
  biometricTxt: {
    marginLeft: 10,
    fontSize: 18,
    color: '#1E40AF',
    fontWeight: 'bold'
  }
});

export default AppUnlockScreen;

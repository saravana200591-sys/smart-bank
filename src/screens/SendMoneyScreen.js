import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { sendMoney } from '../services/bankService';
import { AuthContext } from '../context/AuthContext';
import { ModeContext } from '../context/ModeContext';
import { BankContext } from '../context/BankContext';
import * as Speech from 'expo-speech';
import * as LocalAuthentication from 'expo-local-authentication';

const SendMoneyScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { mode, speakIfVI } = useContext(ModeContext);
  const { balance, userData } = useContext(BankContext);
  
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');

  useEffect(() => {
    speakIfVI('Send money screen. Please enter recipient UPI ID and amount.');
  }, []);

  const handleSend = async () => {
    if (!upiId || !amount) {
      if (mode === 'vi') speakIfVI('Please enter both UPI ID and amount.');
      else Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (parseFloat(amount) > balance) {
      if (mode === 'vi') speakIfVI('Insufficient balance.');
      else Alert.alert('Error', 'Insufficient balance');
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authorize ₹${amount} transfer`,
        cancelLabel: 'Use PIN',
      });
      if (authResult.success) {
        executeTransaction();
      } else {
        setShowPinModal(true);
      }
    } else {
      setShowPinModal(true);
    }
  };

  const verifyPin = () => {
    if (enteredPin === userData?.pin) {
      setShowPinModal(false);
      setEnteredPin('');
      executeTransaction();
    } else {
      Alert.alert('Error', 'Incorrect PIN');
      setEnteredPin('');
    }
  };

  const executeTransaction = async () => {
    setLoading(true);
    try {
      const result = await sendMoney(user.uid, upiId.toLowerCase(), amount, 'Test transaction');
      
      const successMsg = `Successfully sent ₹${amount} to ${result.receiverName}`;
      if (mode === 'vi') {
        speakIfVI(successMsg + '. Returning to dashboard.');
      } else {
        Alert.alert('Success', successMsg);
      }
      
      // Delay to allow TTS to start
      setTimeout(() => navigation.goBack(), 2000);
    } catch (err) {
      if (mode === 'vi') speakIfVI('Transaction failed. ' + err.message);
      else Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const isVI = mode === 'vi';
  const isSenior = mode === 'senior';

  return (
    <View style={[styles.container, isSenior && styles.seniorBg, isVI && styles.viBg]}>
      <Text style={[styles.header, isSenior && styles.seniorText, isVI && styles.viText]}>Send Money</Text>
      
      <TextInput
        style={[styles.input, isSenior && styles.seniorInput, isVI && styles.viInput]}
        placeholder="Recipient UPI ID (e.g. rahul@smartbank)"
        placeholderTextColor={isVI ? '#CCC' : '#9CA3AF'}
        autoCapitalize="none"
        value={upiId}
        onChangeText={setUpiId}
      />
      
      <TextInput
        style={[styles.input, isSenior && styles.seniorInput, isVI && styles.viInput]}
        placeholder="Amount (₹)"
        placeholderTextColor={isVI ? '#CCC' : '#9CA3AF'}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity 
        style={[styles.button, isSenior && styles.seniorBtn, isVI && styles.viBtn]} 
        onPress={handleSend} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" size="large" /> : <Text style={[styles.buttonText, isSenior && styles.seniorBtnText, isVI && styles.viBtnText]}>Send Now</Text>}
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={showPinModal} onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Enter PIN</Text>
            <Text style={styles.modalSubtitle}>Please enter your 4-digit PIN to confirm ₹{amount}</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              autoFocus
              value={enteredPin}
              onChangeText={setEnteredPin}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#9CA3AF' }]} onPress={() => setShowPinModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={verifyPin}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f3f4f6' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1E40AF' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#d1d5db' },
  button: { backgroundColor: '#1E40AF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  
  // Senior Mode overrides
  seniorBg: { backgroundColor: '#FEF3C7' },
  seniorText: { fontSize: 36, color: '#000' },
  seniorInput: { fontSize: 24, padding: 20, borderColor: '#000', borderWidth: 2 },
  seniorBtn: { padding: 25, backgroundColor: '#1E40AF', borderRadius: 15 },
  seniorBtnText: { fontSize: 28 },

  // VI Mode overrides
  viBg: { backgroundColor: '#000' },
  viText: { fontSize: 32, color: '#FFF' },
  viInput: { backgroundColor: '#333', color: '#FFF', fontSize: 24, padding: 20 },
  viBtn: { backgroundColor: '#FFF', padding: 25, borderWidth: 4, borderColor: '#FFF' },
  viBtnText: { color: '#000', fontSize: 28, fontWeight: 'bold' },

  // Modal styles
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalView: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1E40AF' },
  modalSubtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#6B7280' },
  modalInput: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 10, fontSize: 24, textAlign: 'center', letterSpacing: 10, borderWidth: 1, borderColor: '#D1D5DB', width: '100%', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalBtn: { flex: 1, backgroundColor: '#1E40AF', padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 }
});

export default SendMoneyScreen;

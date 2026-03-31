import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BankContext } from '../context/BankContext';
import { ModeContext } from '../context/ModeContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const ReceiveScreen = () => {
  const { userData } = useContext(BankContext);
  const { mode, speakIfVI } = useContext(ModeContext);

  useEffect(() => {
    speakIfVI(`Receive screen. Your UPI ID is ${userData?.upiId}. Present this screen to someone to receive money.`);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pay me via SmartBank using my UPI ID: ${userData?.upiId}`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isSenior = mode === 'senior';
  const isVI = mode === 'vi';

  if (!userData) return null;

  return (
    <View style={[styles.container, isSenior && styles.seniorBg, isVI && styles.viBg]}>
      <Text style={[styles.title, isSenior && styles.seniorText, isVI && styles.viText]}>Receive Money</Text>
      
      <View style={styles.qrContainer}>
        {/* Generates a dummy payment URI for QR code */}
        <QRCode
          value={`upi://pay?pa=${userData.upiId}&pn=${userData.name}`}
          size={isSenior ? 250 : 200}
        />
      </View>

      <Text style={[styles.idLabel, isVI && styles.viText]}>Your UPI ID:</Text>
      <Text selectable={true} style={[styles.upiId, isSenior && styles.seniorId, isVI && styles.viText]}>
        {userData.upiId}
      </Text>

      <TouchableOpacity style={[styles.shareBtn, isSenior && styles.seniorBtn]} onPress={handleShare}>
        <Icon name="share-variant" size={isSenior ? 32 : 24} color="#FFF" />
        <Text style={[styles.shareText, isSenior && styles.seniorBtnText]}> Share ID</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', alignItems: 'center', paddingTop: 60, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E40AF', marginBottom: 40 },
  qrContainer: { padding: 20, backgroundColor: '#FFF', borderRadius: 20, elevation: 5, marginBottom: 30 },
  idLabel: { fontSize: 16, color: 'gray', marginBottom: 5 },
  upiId: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 30 },
  shareBtn: { flexDirection: 'row', backgroundColor: '#059669', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, alignItems: 'center' },
  shareText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  seniorBg: { backgroundColor: '#FEF3C7' },
  seniorText: { fontSize: 36, color: '#000' },
  seniorId: { fontSize: 28 },
  seniorBtn: { paddingVertical: 20, paddingHorizontal: 40, borderRadius: 15 },
  seniorBtnText: { fontSize: 24 },

  viBg: { backgroundColor: '#000' },
  viText: { color: '#FFF' },
});

export default ReceiveScreen;

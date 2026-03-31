import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
import { ModeContext } from '../context/ModeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';

const ModeCard = ({ modeId, icon, title, desc, onSelect }) => (
  <TouchableOpacity style={styles.card} onPress={() => onSelect(modeId)}>
    <View style={styles.iconContainer}>
      <Icon name={icon} size={40} color="#1E40AF" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </View>
    <Icon name="chevron-right" size={24} color="#9CA3AF" />
  </TouchableOpacity>
);

const ModeSelectScreen = ({ navigation }) => {
  const { setMode } = useContext(ModeContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    Speech.speak("Welcome. Please select your preferred accessibility mode.", { rate: 0.9 });
  }, []);

  const handleModeSelect = async (selectedMode) => {
    // 1. Update Global State & AsyncStorage
    await setMode(selectedMode);
    
    // 2. Update Firestore preference
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { mode: selectedMode }).catch(e => console.error("Update DB error", e));
    }
    // App.js conditional stack will automatically redirect
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Select Your Mode</Text>
      <Text style={styles.headerSubtitle}>You can change this anytime in settings.</Text>

      <ModeCard 
        modeId="normal" 
        icon="cellphone" 
        title="Normal Mode" 
        desc="Standard interface like Google Pay or popular banking apps." 
        onSelect={handleModeSelect} 
      />
      <ModeCard 
        modeId="senior" 
        icon="glasses" 
        title="Senior Mode" 
        desc="Large fonts, high contrast, simplified 1-tap navigation." 
        onSelect={handleModeSelect} 
      />
      <ModeCard 
        modeId="vi" 
        icon="ear-hearing" 
        title="Voice-First Mode" 
        desc="Designed for visually impaired. Voice navigation and screen reading." 
        onSelect={handleModeSelect} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f3f4f6', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginBottom: 30 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 }
});

export default ModeSelectScreen;

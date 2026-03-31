import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ModeContext } from '../context/ModeContext';
import { BankContext } from '../context/BankContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const ProfileScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const { mode } = useContext(ModeContext);
  const { userData } = useContext(BankContext);

  const isSenior = mode === 'senior';
  const isVI = mode === 'vi';

  return (
    <View style={[styles.container, isSenior && styles.seniorBg, isVI && styles.viBg]}>
      <Text style={[styles.header, isSenior && styles.seniorText, isVI && styles.viText]}>Profile</Text>

      <View style={[styles.card, isSenior && styles.seniorCard, isVI && styles.viCard]}>
        <View style={styles.avatar}>
          <Icon name="account" size={isSenior ? 60 : 40} color="#1E40AF" />
        </View>
        <Text style={[styles.name, isSenior && styles.seniorText, isVI && styles.viText]}>{userData?.name}</Text>
        <Text style={[styles.email, isVI && styles.viText]}>{userData?.email}</Text>
        <Text style={[styles.upiId, isVI && styles.viText]}>UPI: {userData?.upiId}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.menuItem, isSenior && styles.seniorCard, isVI && styles.viCard]}
        onPress={() => navigation.navigate('ModeSelect')}
      >
        <Icon name="accessibility" size={30} color={isVI ? '#FFF' : '#1E40AF'} />
        <Text style={[styles.menuText, isSenior && styles.seniorText, isVI && styles.viText]}>Change Accessibility Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.menuItem, isSenior && styles.seniorCard, isVI && styles.viCard]}
        onPress={signOut}
      >
        <Icon name="logout" size={30} color="#DC2626" />
        <Text style={[styles.menuText, { color: '#DC2626' }, isSenior && styles.seniorText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', paddingTop: 60, paddingHorizontal: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1E40AF', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 30, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 5 },
  upiId: { fontSize: 16, fontWeight: '600', color: '#1E40AF', marginTop: 10 },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 1 },
  menuText: { fontSize: 18, color: '#1F2937', marginLeft: 15, fontWeight: '500' },

  seniorBg: { backgroundColor: '#FEF3C7' },
  seniorText: { fontSize: 28, color: '#000' },
  seniorCard: { padding: 25, borderRadius: 20 },

  viBg: { backgroundColor: '#000' },
  viText: { color: '#FFF' },
  viCard: { backgroundColor: '#333', borderColor: '#FFF', borderWidth: 2 }
});

export default ProfileScreen;

import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ModeContext } from '../context/ModeContext';
import { BankContext } from '../context/BankContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

// Subcomponents based on mode
const NormalDashboard = ({ balance, userData, navigation }) => (
  <ScrollView contentContainerStyle={styles.normalContainer}>
    <View style={styles.header}>
      <Text style={styles.greeting}>Hello, {userData?.name}</Text>
      <Text style={styles.upiId}>{userData?.upiId}</Text>
    </View>
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Total Balance</Text>
      <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
    </View>
    <View style={styles.actionGrid}>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SendMoney')}>
        <Icon name="send-circle" size={40} color="#1E40AF" />
        <Text style={styles.actionText}>Send</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Receive')}>
        <Icon name="qrcode-scan" size={40} color="#059669" />
        <Text style={styles.actionText}>Receive</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('History')}>
        <Icon name="history" size={40} color="#D97706" />
        <Text style={styles.actionText}>History</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

const SeniorDashboard = ({ balance, navigation }) => (
  <ScrollView contentContainerStyle={styles.seniorContainer}>
    <Text style={styles.seniorBalanceTitle}>Balance</Text>
    <Text style={styles.seniorBalanceAmount}>₹{balance.toFixed(0)}</Text>
    
    <TouchableOpacity style={[styles.seniorBtn, { backgroundColor: '#1E40AF' }]} onPress={() => navigation.navigate('SendMoney')}>
      <Text style={styles.seniorBtnText}>Send Money</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.seniorBtn, { backgroundColor: '#059669' }]} onPress={() => navigation.navigate('Receive')}>
      <Text style={styles.seniorBtnText}>Receive Money</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.seniorBtn, { backgroundColor: '#D97706' }]} onPress={() => navigation.navigate('History')}>
      <Text style={styles.seniorBtnText}>History</Text>
    </TouchableOpacity>
  </ScrollView>
);

const VIDashboard = ({ balance, navigation, speakIfVI }) => {
  React.useEffect(() => {
    speakIfVI(`Dashboard. Your balance is ${balance} rupees. Double tap to send money or receive money.`);
  }, [balance]);

  return (
    <View style={styles.viContainer}>
      <TouchableOpacity 
        style={styles.viLargeArea} 
        onPress={() => { speakIfVI(`Your balance is ${balance} rupees.`); }}
      >
        <Text style={styles.viText}>Balance: ₹{balance}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.viLargeArea, { backgroundColor: '#000' }]} 
        onPress={() => { 
          speakIfVI("Sending money. Opening Send screen.");
          navigation.navigate('SendMoney'); 
        }}
      >
        <Text style={[styles.viText, { color: '#FFF' }]}>Send Money</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.viLargeArea, { backgroundColor: '#FFF' }]} 
        onPress={() => { 
          speakIfVI("Opening receive screen.");
          navigation.navigate('Receive'); 
        }}
      >
        <Text style={styles.viText}>Receive Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { mode, speakIfVI } = useContext(ModeContext);
  const { balance, userData, isLoading } = useContext(BankContext);

  if (isLoading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (mode === 'senior') return <SeniorDashboard balance={balance} navigation={navigation} />;
  if (mode === 'vi') return <VIDashboard balance={balance} navigation={navigation} speakIfVI={speakIfVI} />;
  return <NormalDashboard balance={balance} userData={userData} navigation={navigation} />;
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Normal Mode Styles
  normalContainer: { flexGrow: 1, backgroundColor: '#f3f4f6', padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold' },
  upiId: { fontSize: 14, color: 'gray' },
  balanceCard: { backgroundColor: '#1E40AF', padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 30, elevation: 4 },
  balanceLabel: { color: '#D1D5DB', fontSize: 16, marginBottom: 8 },
  balanceAmount: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 16, width: 100, elevation: 2 },
  actionText: { marginTop: 8, fontWeight: '600' },
  // Senior Mode Styles
  seniorContainer: { flexGrow: 1, backgroundColor: '#FEF3C7', padding: 30, paddingTop: 60, alignItems: 'center' }, // High contrast yellow bg
  seniorBalanceTitle: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  seniorBalanceAmount: { fontSize: 48, fontWeight: 'bold', color: '#000', marginBottom: 40 },
  seniorBtn: { width: '100%', padding: 25, borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  seniorBtnText: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  // VI Mode Styles
  viContainer: { flex: 1, backgroundColor: '#000' },
  viLargeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 4, borderColor: '#000' },
  viText: { fontSize: 36, fontWeight: 'bold', color: '#000', textAlign: 'center' }
});

export default DashboardScreen;

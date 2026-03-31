import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { BankContext } from '../context/BankContext';
import { ModeContext } from '../context/ModeContext';
import { AuthContext } from '../context/AuthContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const TransactionItem = ({ tx, isSender, mode, speakIfVI }) => {
  const isSenior = mode === 'senior';
  const isVI = mode === 'vi';
  
  const sign = isSender ? '-' : '+';
  const color = isSender ? '#DC2626' : '#059669'; // Red for send, Green for receive
  const targetName = isSender ? tx.receiverName : tx.senderName;
  
  const handleVITap = () => {
    speakIfVI(`${isSender ? 'Sent' : 'Received'} ${tx.amount} rupees ${isSender ? 'to' : 'from'} ${targetName}`);
  };

  return (
    <TouchableOpacity 
      style={[styles.txCard, isSenior && styles.seniorCard, isVI && styles.viCard]} 
      onPress={handleVITap}
      disabled={!isVI}
    >
      <View style={styles.txIcon}>
        <Icon name={isSender ? 'arrow-top-right' : 'arrow-bottom-left'} size={24} color={color} />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txName, isSenior && styles.seniorText, isVI && styles.viText]}>{targetName}</Text>
        <Text style={styles.txDate}>{new Date(tx.timestamp).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.txAmount, { color }, isSenior && styles.seniorText, isVI && styles.viText]}>
        {sign}₹{tx.amount}
      </Text>
    </TouchableOpacity>
  );
};

const TransactionsScreen = () => {
  const { transactions } = useContext(BankContext);
  const { user } = useContext(AuthContext);
  const { mode, speakIfVI } = useContext(ModeContext);

  useEffect(() => {
    speakIfVI(`Transaction History. You have ${transactions.length} recent transactions.`);
  }, [transactions.length]);

  return (
    <View style={[styles.container, mode === 'senior' && styles.seniorBg, mode === 'vi' && styles.viBg]}>
      <Text style={[styles.header, mode === 'senior' && styles.seniorText, mode === 'vi' && styles.viText]}>History</Text>
      
      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recent transactions</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem 
              tx={item} 
              isSender={item.senderId === user.uid} 
              mode={mode} 
              speakIfVI={speakIfVI} 
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', paddingTop: 60, paddingHorizontal: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1E40AF', marginBottom: 20 },
  txCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 1 },
  txIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txInfo: { flex: 1 },
  txName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  txDate: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  txAmount: { fontSize: 18, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 16 },

  seniorBg: { backgroundColor: '#FEF3C7' },
  seniorText: { fontSize: 28, color: '#000' },
  seniorCard: { padding: 25, marginBottom: 15, borderRadius: 20 },

  viBg: { backgroundColor: '#000' },
  viText: { color: '#FFF' },
  viCard: { backgroundColor: '#222', borderColor: '#FFF', borderWidth: 2 }
});

export default TransactionsScreen;

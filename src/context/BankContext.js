import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { AuthContext } from './AuthContext';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const BankContext = createContext();

export const BankProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setUserData(null);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Snapshot for user data (balance, upiId)
    const userRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setBalance(data.balance || 0);
      }
      setIsLoading(false);
    });

    // Snapshot for transactions
    const q = query(
      collection(db, 'transactions'),
      // using the generic users array for either sender or receiver to simplify query index matching
      where('participants', 'array-contains', user.uid),
      orderBy('timestamp', 'desc')
    );
    let isInitialLoad = true;
    const unsubTx = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);

      if (!isInitialLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const tx = change.doc.data();
            if (tx.receiverId === user.uid) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Money Received! 🎉',
                  body: `You received ₹${tx.amount} from ${tx.senderUpiId}.`,
                  sound: true,
                },
                trigger: null,
              });
            }
          }
        });
      }
      isInitialLoad = false;
    });

    return () => {
      unsubUser();
      unsubTx();
    };
  }, [user]);

  return (
    <BankContext.Provider value={{ balance, userData, transactions, isLoading }}>
      {children}
    </BankContext.Provider>
  );
};

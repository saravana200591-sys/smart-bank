import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';

export const resolveUpiId = async (upiId) => {
    const q = query(collection(db, 'users'), where('upiId', '==', upiId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        // Return first matching user
        return querySnapshot.docs[0].data();
    }
    return null;
};

export const sendMoney = async (senderUid, receiverUpiId, amountStr, note = '') => {
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

  try {
    const receiver = await resolveUpiId(receiverUpiId);
    if (!receiver) throw new Error('Receiver UPI ID not found');
    if (receiver.uid === senderUid) throw new Error('Cannot send money to yourself');

    const senderRef = doc(db, 'users', senderUid);
    const receiverRef = doc(db, 'users', receiver.uid);
    const newTxRef = doc(collection(db, 'transactions'));

    await runTransaction(db, async (transaction) => {
      const senderDoc = await transaction.get(senderRef);
      if (!senderDoc.exists()) throw new Error('Sender does not exist');

      const senderBalance = senderDoc.data().balance || 0;
      if (senderBalance < amount) throw new Error('Insufficient balance');

      // Deduct from sender
      transaction.update(senderRef, { balance: senderBalance - amount });

      // Add to receiver
      const receiverDoc = await transaction.get(receiverRef);
      const receiverBalance = receiverDoc.exists() ? (receiverDoc.data().balance || 0) : 0;
      transaction.update(receiverRef, { balance: receiverBalance + amount });

      // Record transaction
      transaction.set(newTxRef, {
        senderId: senderUid,
        senderName: senderDoc.data().name,
        receiverId: receiver.uid,
        receiverName: receiver.name,
        participants: [senderUid, receiver.uid], // Array for easy querying by either party
        amount,
        note,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      });
    });

    return { success: true, receiverName: receiver.name };
  } catch (error) {
    console.error('Send money failed:', error);
    throw error;
  }
};

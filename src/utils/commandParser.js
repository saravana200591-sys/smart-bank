// Rule-based parser for MVP/Demo
// Later can be swapped with OpenAI API call
import { sendMoney } from './bankService';
import * as Speech from 'expo-speech';

export const parseVoiceCommand = async (transcript, uid, navigation) => {
    const text = transcript.toLowerCase();
    
    try {
        if (text.includes('balance') || text.includes('how much money') || text.includes('இருப்பு')) {
            // Read balance from context implicitly handled if we just navigate or return action
            return { action: 'NAVIGATE', route: 'Home', explicitFeedback: 'Navigating to Dashboard to hear balance.' };
        }
        
        if (text.includes('send') || text.includes('pay') || text.includes('transfer') || text.includes('அனுப்பு')) {
            // Extract potential amount
            const amountMatch = text.match(/\b\d+\b/);
            const amount = amountMatch ? amountMatch[0] : null;

            // Simple demo extraction for recipient ("send 500 to rahul")
            // In a real app, you'd fuzzy search contacts
            let recipient = null;
            if (text.includes('rahul')) recipient = 'rahul@smartbank';
            if (text.includes('priya')) recipient = 'priya@smartbank';

            if (amount && recipient) {
                // Execute sending
                const result = await sendMoney(uid, recipient, amount, 'Voice Transfer');
                return { 
                    action: 'SUCCESS', 
                    message: `Successfully transferred ${amount} rupees to ${result.receiverName}.`
                };
            }
            return { action: 'NAVIGATE', route: 'SendMoney', explicitFeedback: 'Opening Send Money screen.' };
        }

        if (text.includes('history') || text.includes('transaction') || text.includes('வரலாறு')) {
            return { action: 'NAVIGATE', route: 'History', explicitFeedback: 'Opening transaction history.' };
        }

        return { action: 'UNKNOWN', message: 'I did not understand that command.' };
    } catch (e) {
        return { action: 'ERROR', message: e.message };
    }
};

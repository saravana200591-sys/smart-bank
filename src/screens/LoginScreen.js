import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { createProfile } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password || (isSignup && !name)) {
        setError('Please fill all fields');
        return;
    }
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await createProfile(userCred.user.uid, name, email, '', 'en');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Because App.js observes AuthContext `user`, navigation happens automatically!
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? 'Create SmartBank Account' : 'Welcome to SmartBank'}</Text>
      
      {isSignup && (
          <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
          />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Login'}</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsSignup(!isSignup)} style={{ marginTop: 20 }}>
          <Text style={styles.switchText}>
              {isSignup ? 'Already have an account? Login' : 'Need an account? Sign up'}
          </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f3f4f6' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#1E40AF', textAlign: 'center' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#d1d5db' },
  button: { backgroundColor: '#1E40AF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  errorText: { color: 'red', marginBottom: 15, textAlign: 'center' },
  switchText: { color: '#1E40AF', textAlign: 'center', fontSize: 16, fontWeight: '600' }
});

export default LoginScreen;

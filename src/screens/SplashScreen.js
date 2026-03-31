import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Artificial delay to show logo
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Assuming a basic icon in assets */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🏦 SmartBank</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF', // Deep blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E40AF',
  }
});

export default SplashScreen;

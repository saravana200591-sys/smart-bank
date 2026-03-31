import React, { useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

// Contexts
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ModeProvider, ModeContext } from './src/context/ModeContext';
import { BankProvider } from './src/context/BankContext';

// Screens (placeholders)
import SplashScreen from './src/screens/SplashScreen';
import ModeSelectScreen from './src/screens/ModeSelectScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PinSetupScreen from './src/screens/PinSetupScreen';
import VoiceAssistant from './src/components/VoiceAssistant';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs for Normal/Senior Modes
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'History') iconName = 'history';
          else if (route.name === 'Profile') iconName = 'account-outline';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1E40AF', // Blue-800
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="History" component={TransactionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root Navigator observing Auth state
const RootNavigator = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { userData, isLoading: bankLoading } = useContext(BankContext);

  if (authLoading || (user && bankLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Unauthenticated Stack
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : !userData?.mode ? (
        <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
      ) : !userData?.pin ? (
        <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      ) : (
        // Authenticated Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
          <Stack.Screen name="Receive" component={ReceiveScreen} />
          <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
          <Stack.Screen name="PinSetup" component={PinSetupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <BankProvider>
          <NavigationContainer>
            <RootNavigator />
            <AuthContext.Consumer>
                {({user}) => user && <VoiceAssistant />}
            </AuthContext.Consumer>
          </NavigationContainer>
        </BankProvider>
      </ModeProvider>
    </AuthProvider>
  );
}

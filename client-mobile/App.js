import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, AppState, LogBox } from 'react-native';

// Suppress harmless React Native warnings related to Firebase and Clipboard
LogBox.ignoreLogs([
  'Setting a timer for a long period of time',
  'AsyncStorage has been extracted',
  'Clipboard has been extracted',
  '@firebase/firestore'
]);
LogBox.ignoreAllLogs(); // Ensures the yellow box is completely hidden for a clean UI
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SairaCondensed_800ExtraBold, SairaCondensed_800ExtraBold_Italic } from '@expo-google-fonts/saira-condensed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './src/config/firebase';

import Colors from './src/constants/Colors';
import LoginScreen from './src/screens/LoginScreen';
import OverviewScreen from './src/screens/OverviewScreen';
import BillingScreen from './src/screens/BillingScreen';
import PlansScreen from './src/screens/PlansScreen';
import SupportScreen from './src/screens/SupportScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const { user, setUser } = route.params;
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Overview') iconName = 'view-dashboard';
          else if (route.name === 'Billing') iconName = 'credit-card-outline';
          else if (route.name === 'Plans') iconName = 'wifi';
          else if (route.name === 'Support') iconName = 'lifebuoy';
          else if (route.name === 'Profile') iconName = 'account-circle-outline';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Overview">
        {props => <OverviewScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Billing">
        {props => <BillingScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Plans">
        {props => <PlansScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Support">
        {props => <SupportScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} user={user} onLogout={() => setUser(null)} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isDarkMode, colors } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SairaCondensed_800ExtraBold,
    SairaCondensed_800ExtraBold_Italic,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('clientUser');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    let interval = null;
    const updatePresence = async () => {
      if (user && AppState.currentState === 'active') {
        try {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, { lastActive: serverTimestamp() });
        } catch (e) {
          console.error("Presence update failed", e);
        }
      }
    };

    if (user) {
      updatePresence();
      interval = setInterval(updatePresence, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  if ((!fontsLoaded && !fontError) || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {user ? (
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            initialParams={{ user, setUser: async (u) => {
              if(!u) await AsyncStorage.removeItem('clientUser');
              setUser(u);
            }}} 
          />
        ) : (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={(u) => setUser(u)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}



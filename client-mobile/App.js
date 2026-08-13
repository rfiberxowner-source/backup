import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, AppState, LogBox, DeviceEventEmitter, Alert } from 'react-native';

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
import { SairaCondensed_800ExtraBold } from '@expo-google-fonts/saira-condensed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from './src/config/firebase';

import Colors from './src/constants/Colors';
import LoginScreen from './src/screens/LoginScreen';
import OverviewScreen from './src/screens/OverviewScreen';
import BillingScreen from './src/screens/BillingScreen';
import PlansScreen from './src/screens/PlansScreen';
import SupportScreen from './src/screens/SupportScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
// import PushNotificationHandler from './src/components/PushNotificationHandler';
import TutorialOverlay from './src/components/TutorialOverlay';

export const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ user, setUser }) {
  const { colors } = useTheme();
  
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('profileDirty', (dirty) => {
      setIsProfileDirty(dirty);
    });
    return () => sub.remove();
  }, []);

  return (
    <Tab.Navigator
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          const state = navigation.getState();
          const currentRoute = state.routes[state.index].name;
          
          if (currentRoute === 'Profile' && isProfileDirty && route.name !== 'Profile') {
            e.preventDefault();
            Alert.alert(
              'Discard changes?',
              'Are you sure you want to switch section without saving your new details?',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: () => {
                    DeviceEventEmitter.emit('forceCancelProfileEdit');
                    navigation.navigate(route.name);
                  }
                }
              ]
            );
          }
        },
      })}
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'shift', // Enables horizontal swipe animation based on tab index
        sceneStyle: { backgroundColor: colors.background }, // Fixes white flash during animation
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
        {props => <ProfileScreen {...props} user={user} onLogout={async () => {
           try {
             const token = await AsyncStorage.getItem('clientSessionToken');
             if (token && user?.id) {
               await updateDoc(doc(db, "users", user.id), { activeSessionToken: "" });
             }
           } catch (e) {
             console.error("Error clearing session", e);
           }
           await AsyncStorage.multiRemove(['clientUser', 'clientSessionToken']);
           setUser(null);
        }} />}
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
    let unsubscribe = null;
    if (user?.id) {
      const userRef = doc(db, "users", user.id);
      unsubscribe = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const freshData = { id: docSnap.id, ...docSnap.data() };
          
          const currentToken = await AsyncStorage.getItem('clientSessionToken');
          
          // If the server has a token and it doesn't match ours, we got kicked out by another login.
          // If the server has NO token, we got force logged out by an admin.
          if (currentToken && (!freshData.activeSessionToken || freshData.activeSessionToken !== currentToken)) {
            await AsyncStorage.multiRemove(['clientUser', 'clientSessionToken']);
            setUser(null);
            return;
          }

          setUser(freshData);
          AsyncStorage.setItem('clientUser', JSON.stringify(freshData)).catch(() => {});
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    let interval = null;
    const updatePresence = async () => {
      if (user?.id && AppState.currentState === 'active') {
        try {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, { lastActive: serverTimestamp() });
        } catch (e) {
          console.error("Presence update failed", e);
        }
      }
    };

    if (user?.id) {
      updatePresence();
      interval = setInterval(updatePresence, 120000); // 2 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.id]);

  if ((!fontsLoaded && !fontError) || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {user ? (
          <Stack.Screen name="Main">
            {props => <MainTabs {...props} user={user} setUser={async (u) => {
              if(!u) await AsyncStorage.removeItem('clientUser');
              setUser(u);
            }} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={(u) => setUser(u)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      {/* {user && <PushNotificationHandler user={user} onUpdateUser={setUser} />} */}
      {user && <TutorialOverlay user={user} />}
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



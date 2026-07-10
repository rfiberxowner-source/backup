import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SairaCondensed_800ExtraBold, SairaCondensed_800ExtraBold_Italic } from '@expo-google-fonts/saira-condensed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from './src/constants/Colors';
import LoginScreen from './src/screens/LoginScreen';
import OverviewScreen from './src/screens/OverviewScreen';
import BillingScreen from './src/screens/BillingScreen';
import PlansScreen from './src/screens/PlansScreen';
import SupportScreen from './src/screens/SupportScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const { user, setUser } = route.params;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
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

export default function App() {
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

  if ((!fontsLoaded && !fontError) || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }


  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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

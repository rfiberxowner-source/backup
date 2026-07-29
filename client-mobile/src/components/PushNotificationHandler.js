import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Set up notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PushNotificationHandler({ user, onUpdateUser }) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);

  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [showReminderPrompt, setShowReminderPrompt] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('alerts', {
        name: 'Important Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Check if we need to show prompts
    if (user.hasBeenAskedSoftPrompt === undefined) {
      // First time, show soft prompt
      setShowSoftPrompt(true);
    } else if (user.hasBeenAskedSoftPrompt === true && user.notificationsEnabled === false && user.expoPushToken) {
      // Show reminder prompt ONLY if they have the key already and it's switched off
      setShowReminderPrompt(true);
    }
  }, [user]);

  const saveToFirebase = async (updates) => {
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates);
      if (onUpdateUser) {
        onUpdateUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error('Error saving push settings:', error);
    }
  };

  const handleSoftPromptAllow = async () => {
    setShowSoftPrompt(false);
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      await saveToFirebase({ hasBeenAskedSoftPrompt: true, notificationsEnabled: false });
      return;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId
      }).catch(() => Notifications.getExpoPushTokenAsync()); 
      
      const token = tokenData.data;
      await saveToFirebase({
        hasBeenAskedSoftPrompt: true,
        notificationsEnabled: true,
        expoPushToken: token
      });
    } catch (e) {
      console.log('Error getting token', e);
      await saveToFirebase({ hasBeenAskedSoftPrompt: true, notificationsEnabled: false });
    }
  };

  const handleSoftPromptDeny = async () => {
    setShowSoftPrompt(false);
    await saveToFirebase({ hasBeenAskedSoftPrompt: true, notificationsEnabled: false });
  };

  const handleReminderDismiss = () => {
    setShowReminderPrompt(false);
  };

  return (
    <>
      {/* Soft Prompt Modal */}
      <Modal visible={showSoftPrompt} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <MaterialCommunityIcons name="bell-ring" size={40} color={colors.primary} style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>Enable Notifications</Text>
            <Text style={styles.modalDesc}>
              To prevent late fees and stay updated on your fiber connection, we need you to allow notifications.
            </Text>
            
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSoftPromptAllow}>
              <Text style={styles.primaryBtnText}>Enable Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSoftPromptDeny}>
              <Text style={styles.secondaryBtnText}>Not Right Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reminder Prompt Modal */}
      <Modal visible={showReminderPrompt} transparent animationType="slide">
        <View style={styles.overlayBottom}>
          <View style={styles.reminderBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Notifications are OFF</Text>
              <Text style={styles.reminderDesc}>You might miss important billing alerts. Turn them on in your Profile!</Text>
            </View>
            <TouchableOpacity onPress={handleReminderDismiss} style={styles.reminderClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(colors, isDarkMode) { return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginBottom: 10,
  },
  modalDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  secondaryBtn: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  reminderBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 60, // Above tabs
  },
  reminderTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  reminderDesc: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  reminderClose: {
    padding: 10,
  }
});
}

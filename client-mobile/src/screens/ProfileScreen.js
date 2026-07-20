import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ route, user, onLogout }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const styles = createStyles(colors, isDarkMode);

  const parseName = (fullName) => {
    if (!fullName) return { first: '', middle: '', last: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
    if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] };
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = parts.slice(1, parts.length - 1).join(' ');
    return { first, middle, last };
  };

  const initialParsed = parseName(user.name);

  const [userData, setUserData] = useState({
    name: user.name || '',
    firstName: initialParsed.first,
    middleName: initialParsed.middle,
    lastName: initialParsed.last,
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    facebook: user.facebook || '',
    password: user.password || '',
    profilePicture: user.profilePicture || null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateDetailsModal, setUpdateDetailsModal] = useState(null);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  useEffect(() => {
    if (route?.params?.showUpdateDetails) {
      setUpdateDetailsModal(route.params.showUpdateDetails);
      setShowUpdatePassword(false);
    }
  }, [route?.params]);

  useEffect(() => {
    if (isEditing) {
      const first = (userData.firstName || '').trim();
      const last = (userData.lastName || '').trim();
      const middle = (userData.middleName || '').trim();

      let middleInitial = '';
      if (middle.length > 0) {
        middleInitial = ` ${middle.charAt(0).toUpperCase()}.`;
      }

      let constructed = `${first}${middleInitial} ${last}`.trim();
      if (constructed !== userData.name) {
        setUserData(prev => ({ ...prev, name: constructed }));
      }
    }
  }, [userData.firstName, userData.middleName, userData.lastName, isEditing]);

  const handlePickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setUserData(prev => ({ ...prev, profilePicture: base64Img }));

        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { profilePicture: base64Img });
        const updatedUser = { ...user, profilePicture: base64Img };
        await AsyncStorage.setItem('clientUser', JSON.stringify(updatedUser));
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const handleChange = (key, value) => {
    setUserData(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = async () => {
    if (!userData.name || !userData.email || !userData.password) {
      Alert.alert('Error', 'Name, email, and password are required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert('Error', 'Please enter a complete and valid email address (e.g. user@gmail.com).');
      return;
    }

    if (userData.phone) {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(userData.phone)) {
        Alert.alert('Error', 'Phone number must start with "09" and be exactly 11 digits long.');
        return;
      }
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.id);

      const changes = [];
      const fieldsToCheck = ['name', 'email', 'phone', 'address', 'facebook', 'password'];

      fieldsToCheck.forEach(key => {
        if (userData[key] !== user[key] && !(userData[key] === '' && !user[key])) {
          changes.push({
            key,
            oldValue: user[key] || '',
            newValue: userData[key] || ''
          });
        }
      });

      const payload = { ...userData };

      if (changes.length > 0) {
        const newUpdate = {
          id: Date.now().toString(),
          changes,
          date: new Date().toISOString(),
          isRead: false
        };

        let recentUpdates = user.recentProfileUpdates || [];
        recentUpdates = [newUpdate, ...recentUpdates].slice(0, 3);
        payload.recentProfileUpdates = recentUpdates;
      }

      await updateDoc(userRef, payload);

      const updatedUser = { ...user, ...payload };
      await AsyncStorage.setItem('clientUser', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (icon, label, key, keyboardType = 'default', autoCapitalize = 'sentences', isPassword = false, forceReadonly = false, maxLength = undefined) => {
    return (
      <View style={styles.fieldRow}>
        <View style={styles.fieldIconBox}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>{label}</Text>
          {isEditing && !forceReadonly ? (
            <TextInput
              style={styles.fieldInput}
              value={userData[key]}
              onChangeText={(val) => handleChange(key, val)}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              secureTextEntry={isPassword && !showPassword}
              placeholderTextColor={colors.textMuted}
              maxLength={maxLength}
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>{isPassword ? '••••••••' : (userData[key] || 'Not set')}</Text>
          )}
        </View>
        {isPassword && isEditing && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    const parsedCancel = parseName(user.name);
    setUserData({
      name: user.name || '',
      firstName: parsedCancel.first,
      middleName: parsedCancel.middle,
      lastName: parsedCancel.last,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      facebook: user.facebook || '',
      password: user.password || '',
      profilePicture: user.profilePicture || null
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Decor */}
      <View style={[styles.bgDecorCircle, styles.bgDecor1]} />
      <View style={[styles.bgDecorCircle, styles.bgDecor2]} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isEditing && (
            <TouchableOpacity onPress={handleCancelEdit} disabled={loading} style={{ marginRight: 15 }}>
              <Text style={[styles.headerAction, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => { if (isEditing) saveChanges(); else setIsEditing(true); }} disabled={loading}>
            <Text style={styles.headerAction}>{isEditing ? (loading ? 'Saving...' : 'Save') : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, isEditing && { paddingBottom: 250 }]} showsVerticalScrollIndicator={false}>

          {/* Profile Avatar Header */}
          <View style={styles.profileHero}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
              {userData.profilePicture ? (
                <Image source={{ uri: userData.profilePicture }} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 15, borderWidth: 3, borderColor: colors.primary }} />
              ) : (
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLargeText}>{getInitials(userData.name)}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.heroName}>{userData.name || 'User'}</Text>
            <Text style={styles.heroEmail}>{userData.email || 'No email'}</Text>
          </View>

          {/* App Preferences */}
          <Text style={styles.groupTitle}>Preferences</Text>
          <View style={styles.insetGroup}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldIconBox}>
                <MaterialCommunityIcons name={isDarkMode ? "moon-waning-crescent" : "white-balance-sunny"} size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>App Theme</Text>
                <Text style={styles.fieldValue}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>

          {/* Personal Details Group */}
          <Text style={styles.groupTitle}>Personal Details</Text>
          <View style={styles.insetGroup}>
            {renderField('account-outline', 'Full Name', 'name', 'default', 'sentences', false, true)}
            {isEditing && (
              <>
                <View style={styles.divider} />
                {renderField('account-outline', 'First Name', 'firstName')}
                <View style={styles.divider} />
                {renderField('account-outline', 'Middle Name (Optional)', 'middleName')}
                <View style={styles.divider} />
                {renderField('account-outline', 'Last Name', 'lastName')}
              </>
            )}
            <View style={styles.divider} />
            {renderField('email-outline', 'Email Address', 'email', 'email-address', 'none')}
            <View style={styles.divider} />
            {renderField('phone-outline', 'Phone Number', 'phone', 'phone-pad', 'none', false, false, 11)}
          </View>

          {/* Address & Social Group */}
          <Text style={styles.groupTitle}>Location & Social</Text>
          <View style={styles.insetGroup}>
            {renderField('map-marker-outline', 'Service Address', 'address')}
            <View style={styles.divider} />
            {renderField('facebook', 'Facebook Profile', 'facebook', 'url', 'none')}
          </View>

          {/* Security Group */}
          <Text style={styles.groupTitle}>Security</Text>
          <View style={styles.insetGroup}>
            {renderField('lock-outline', 'Password', 'password', 'default', 'none', true)}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>RFiberX Client App v1.0.0</Text>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Update Details Modal */}
      <Modal visible={!!updateDetailsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="account-edit" size={24} color={colors.primary} />
              <Text style={styles.modalTitle}>Profile Changes</Text>
            </View>
            <Text style={styles.modalDate}>
              Changed on {updateDetailsModal ? new Date(updateDetailsModal.date).toLocaleString() : ''}
            </Text>

            <ScrollView style={{ maxHeight: 300, width: '100%', marginTop: 15 }} showsVerticalScrollIndicator={false}>
              {updateDetailsModal && updateDetailsModal.changes && updateDetailsModal.changes.map((change, index) => (
                <View key={index} style={styles.changeItem}>
                  <Text style={styles.changeKey}>{change.key.toUpperCase()}</Text>
                  <View style={styles.changeValuesRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.changeLabel}>Old Value</Text>
                      <Text style={styles.changeTextOld} numberOfLines={2}>
                        {change.key === 'password' ? '********' : (change.oldValue || 'None')}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textMuted} style={{ marginHorizontal: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.changeLabel}>New Value</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.changeTextNew} numberOfLines={2}>
                          {change.key === 'password' && !showUpdatePassword ? '********' : (change.newValue || 'None')}
                        </Text>
                        {change.key === 'password' && (
                          <TouchableOpacity onPress={() => setShowUpdatePassword(!showUpdatePassword)} style={{ marginLeft: 8 }}>
                            <MaterialCommunityIcons name={showUpdatePassword ? 'eye-off' : 'eye'} size={18} color={colors.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setUpdateDetailsModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgDecorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgDecor1: {
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    backgroundColor: colors.primary,
    opacity: isDarkMode ? 0.06 : 0.04,
  },
  bgDecor2: {
    top: 300,
    right: -150,
    width: 400,
    height: 400,
    backgroundColor: '#3b82f6',
    opacity: isDarkMode ? 0.05 : 0.03,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { color: colors.text, fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerAction: { color: colors.primary, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  profileHero: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229,57,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarLargeText: { color: colors.primary, fontSize: 32, fontFamily: 'Inter_700Bold' },
  heroName: { color: colors.text, fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  heroEmail: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_500Medium' },
  groupTitle: { color: colors.textMuted, fontSize: 13, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', marginLeft: 15, marginBottom: 8 },
  insetGroup: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 50 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 15, minHeight: 70 },
  fieldIconBox: { width: 30, alignItems: 'center' },
  fieldContent: { flex: 1, marginLeft: 10 },
  fieldLabel: { color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  fieldValue: { color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  fieldInput: { color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold', padding: 0, margin: 0, borderBottomWidth: 1, borderBottomColor: colors.primary },
  eyeBtn: { padding: 10 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: { color: colors.error, fontSize: 16, fontFamily: 'Inter_600SemiBold', marginLeft: 8 },
  versionText: { color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.card, width: '100%', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  modalTitle: { color: colors.text, fontSize: 20, fontFamily: 'Inter_700Bold', marginLeft: 10 },
  modalDate: { color: colors.textMuted, fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 10 },
  changeItem: { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: 15, borderRadius: 12, marginBottom: 10, width: '100%', borderWidth: 1, borderColor: colors.border },
  changeKey: { color: colors.primary, fontSize: 12, fontFamily: 'Inter_700Bold', marginBottom: 8, letterSpacing: 0.5 },
  changeValuesRow: { flexDirection: 'row', alignItems: 'center' },
  changeLabel: { color: colors.textMuted, fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  changeTextOld: { color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_500Medium', textDecorationLine: 'line-through' },
  changeTextNew: { color: colors.text, fontSize: 15, fontFamily: 'Inter_600SemiBold', flexShrink: 1 },
  modalCloseBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, marginTop: 20, width: '100%', alignItems: 'center' },
  modalCloseBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});

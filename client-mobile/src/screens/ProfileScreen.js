import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Colors from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ user, onLogout }) {
  const [userData, setUserData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    facebook: user.facebook || '',
    password: user.password || ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
    
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, userData);
      
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('clientUser', JSON.stringify(updatedUser));
      
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (icon, label, key, keyboardType = 'default', autoCapitalize = 'sentences', isPassword = false) => {
    return (
      <View style={styles.fieldRow}>
        <View style={styles.fieldIconBox}>
          <MaterialCommunityIcons name={icon} size={20} color={Colors.textSecondary} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>{label}</Text>
          {isEditing ? (
            <TextInput
              style={styles.fieldInput}
              value={userData[key]}
              onChangeText={(val) => handleChange(key, val)}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              secureTextEntry={isPassword && !showPassword}
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>{isPassword ? '••••••••' : (userData[key] || 'Not set')}</Text>
          )}
        </View>
        {isPassword && isEditing && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => { if(isEditing) saveChanges(); else setIsEditing(true); }} disabled={loading}>
          <Text style={styles.headerAction}>{isEditing ? (loading ? 'Saving...' : 'Save') : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Avatar Header */}
        <View style={styles.profileHero}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{getInitials(userData.name)}</Text>
          </View>
          <Text style={styles.heroName}>{userData.name || 'User'}</Text>
          <Text style={styles.heroEmail}>{userData.email || 'No email'}</Text>
        </View>

        {/* Personal Details Group */}
        <Text style={styles.groupTitle}>Personal Details</Text>
        <View style={styles.insetGroup}>
          {renderField('account-outline', 'Full Name', 'name')}
          <View style={styles.divider} />
          {renderField('email-outline', 'Email Address', 'email', 'email-address', 'none')}
          <View style={styles.divider} />
          {renderField('phone-outline', 'Phone Number', 'phone', 'phone-pad')}
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
          <MaterialCommunityIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Fiber X Client App v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerAction: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
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
  avatarLargeText: { color: Colors.primary, fontSize: 32, fontFamily: 'Inter_700Bold' },
  heroName: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  heroEmail: { color: Colors.textMuted, fontSize: 14, fontFamily: 'Inter_500Medium' },
  groupTitle: { color: Colors.textMuted, fontSize: 13, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', marginLeft: 15, marginBottom: 8 },
  insetGroup: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 50 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 15, minHeight: 70 },
  fieldIconBox: { width: 30, alignItems: 'center' },
  fieldContent: { flex: 1, marginLeft: 10 },
  fieldLabel: { color: Colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  fieldValue: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  fieldInput: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold', padding: 0, margin: 0, borderBottomWidth: 1, borderBottomColor: Colors.primary },
  eyeBtn: { padding: 10 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: { color: Colors.error, fontSize: 16, fontFamily: 'Inter_600SemiBold', marginLeft: 8 },
  versionText: { color: Colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView, Modal } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ onLogin }) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const [showConsent, setShowConsent] = useState(false);

  React.useEffect(() => {
    const checkConsent = async () => {
      try {
        const agreed = await AsyncStorage.getItem('hasAgreedToConsent');
        if (agreed !== 'true') {
          setShowConsent(true);
        }
      } catch (e) {
        console.error('Error checking consent', e);
      }
    };
    checkConsent();
  }, []);

  const handleAgreeConsent = async () => {
    try {
      await AsyncStorage.setItem('hasAgreedToConsent', 'true');
      setShowConsent(false);
    } catch (e) {
      console.error('Error saving consent', e);
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!identifier || !password) {
      setErrorMsg('Please enter both email/name and password.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg('Password must contain at least one uppercase letter.');
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const queryField = isEmail ? 'email' : 'name';

      const q = query(collection(db, "users"), where(queryField, "==", identifier.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrorMsg('Account not found. Please try again.');
        setLoading(false);
        return;
      }

      let authenticated = false;
      let userData = null;

      querySnapshot.forEach((doc) => {
        if (doc.data().password === password) {
          authenticated = true;
          userData = { id: doc.id, ...doc.data() };
        }
      });

      if (authenticated) {
        if (userData.activeSessionToken) {
          setErrorMsg('Account is already logged in on another device. Please sign out from that device first.');
          setLoading(false);
          return;
        }

        const sessionToken = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const userRef = doc(db, "users", userData.id);
        await updateDoc(userRef, { activeSessionToken: sessionToken });
        
        userData.activeSessionToken = sessionToken;
        await AsyncStorage.setItem('clientSessionToken', sessionToken);
        await AsyncStorage.setItem('clientUser', JSON.stringify(userData));
        onLogin(userData);
      } else {
        setErrorMsg('Incorrect password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView ref={scrollViewRef} contentContainerStyle={[styles.content, { paddingBottom: 400 }]} showsVerticalScrollIndicator={false}>
        {/* Logo area */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo3-removebg-preview.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Better internet</Text>
        <Text style={styles.title}>starts here.</Text>
        <Text style={styles.subtitle}>Access your portal account and stay in control from day one.</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>EMAIL OR FULL NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 8 chars, 1 uppercase"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />

          {errorMsg ? <View style={styles.errorBox}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in →</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Data Privacy Consent Modal */}
      <Modal visible={showConsent} animationType="slide" transparent={false}>
        <View style={styles.consentContainer}>
          <View style={styles.consentHeader}>
            <Text style={styles.consentHeaderTitle}>Data Privacy & Consent</Text>
          </View>
          
          <ScrollView style={styles.consentScroll} showsVerticalScrollIndicator={true}>
            <Text style={styles.consentSectionTitle}>Welcome to RFiberX</Text>
            <Text style={styles.consentText}>
              RFiberX is a premier fiber optic internet service provider dedicated to delivering blazing fast, reliable connectivity directly to your home or business.
            </Text>

            <Text style={styles.consentSectionTitle}>What is this App?</Text>
            <Text style={styles.consentText}>
              This mobile application is your personal self-service portal. It allows you to monitor your connection status, view and pay bills, upgrade your internet plans, and contact support instantly.
            </Text>

            <Text style={styles.consentSectionTitle}>What Credentials We Need & Why</Text>
            <Text style={styles.consentText}>
              To provide a secure and personalized experience, we require your login credentials (Email/Name and Password) which were securely generated for you upon subscribing to our network.
            </Text>

            <Text style={styles.consentSectionTitle}>What Data We Have & How It Is Used</Text>
            <Text style={styles.consentText}>
              We securely store your basic profile information (Full Name, Address, Contact Number, Email) and your active subscription details. This information is strictly used for billing purposes, account identification, and network troubleshooting. 
              {'\n\n'}
              Your data is safely encrypted and stored on our secure cloud servers. We will never sell or illegally share your personal information with unauthorized third parties.
            </Text>
            
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.consentFooter}>
            <TouchableOpacity style={styles.agreeButton} onPress={handleAgreeConsent}>
              <Text style={styles.agreeButtonText}>I Understand and Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1, // Changed from flex: 1 to flexGrow: 1 for ScrollView
    padding: 40,
    paddingTop: 80, // Safe area from top notch
    justifyContent: 'flex-start', // Pushes content up, removing massive top space
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 0,
    width: '80%', // Break out of padding
    marginLeft: '-7.5%', // Center it after breaking out
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: 170, // Huge height
    transform: [{ scale: 1.1 }], // Force extra scale
  },
  joinText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  consentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  consentHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 25,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  consentHeaderTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#111827',
  },
  consentScroll: {
    flex: 1,
    padding: 25,
  },
  consentSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
  },
  consentText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
    lineHeight: 24,
  },
  consentFooter: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  agreeButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  agreeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  title: {
    color: colors.text,
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 15,
    marginBottom: 40,
    fontFamily: 'Inter_400Regular',
  },
  formContainer: {
    marginTop: 10,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 15,
    borderRadius: 6,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.2)',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  errorText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  }
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';

export default function LoginScreen({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMsg('');
    if (!identifier || !password) {
      setErrorMsg('Please enter both email/name and password.');
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoRed}>R</Text>FIBER<Text style={styles.logoRed}>X</Text>
          </Text>
          <Text style={styles.logoSub}>NETWORKS</Text>
        </View>

        <Text style={styles.joinText}>JOIN R-FIBER</Text>
        <Text style={styles.title}>Better internet</Text>
        <Text style={styles.title}>starts here.</Text>
        <Text style={styles.subtitle}>Access your portal account and stay in control from day one.</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>EMAIL OR FULL NAME</Text>
          <TextInput 
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textMuted}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput 
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 40,
  },
  logoText: {
    fontFamily: 'SairaCondensed_800ExtraBold_Italic',
    fontSize: 28,
    color: '#fff',
    letterSpacing: -1,
  },
  logoRed: {
    color: Colors.primary,
  },
  logoSub: {
    fontSize: 10,
    color: '#fff',
    letterSpacing: 2,
    fontFamily: 'Inter_500Medium',
    marginTop: -5,
  },
  joinText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  subtitle: {
    color: Colors.textSecondary,
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
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    color: '#fff',
    padding: 15,
    borderRadius: 6,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.2)',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  }
});

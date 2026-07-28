import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Animated, Dimensions } from 'react-native';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { navigationRef } from '../../App';
import { useTheme } from '../context/ThemeContext';

const TUTORIAL_STEPS = [
  { isWelcome: true, tab: 'Overview' },
  { image: require('../../assets/tutorial/overview.png'), tab: 'Overview' },
  { image: require('../../assets/tutorial/billing1.png'), tab: 'Billing' },
  { image: require('../../assets/tutorial/billing2.png'), tab: 'Billing' },
  { image: require('../../assets/tutorial/billing3.png'), tab: 'Billing' },
  { image: require('../../assets/tutorial/plan1.png'), tab: 'Plans' },
  { image: require('../../assets/tutorial/plan2.png'), tab: 'Plans' },
  { image: require('../../assets/tutorial/plan3.png'), tab: 'Plans' },
  { image: require('../../assets/tutorial/ticket1.png'), tab: 'Support' },
  { image: require('../../assets/tutorial/ticket2.png'), tab: 'Support' },
  { image: require('../../assets/tutorial/profile1.png'), tab: 'Profile' },
  { image: require('../../assets/tutorial/profile2.png'), tab: 'Profile' },
  { image: require('../../assets/tutorial/profile3.png'), tab: 'Profile' },
  { image: require('../../assets/tutorial/profile4.png'), tab: 'Profile' },
  { isFinalWarning: true, tab: 'Profile' } // Final 10 second unskippable warning
];

export default function TutorialOverlay({ user }) {
  const { isDarkMode } = useTheme();
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // Default true until checked
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start at 0 for initial entry
  const slideAnim = useRef(new Animated.Value(30)).current; // Start slightly down
  const scaleAnim = useRef(new Animated.Value(0.95)).current; // Start slightly shrunken
  
  // For the final screen 15s countdown
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hasSeenTutorial === undefined || data.hasSeenTutorial === false) {
          setHasSeenTutorial(false);
        } else {
          setHasSeenTutorial(true);
        }
      }
    });
    return () => unsub();
  }, [user?.id]);

  useEffect(() => {
    if (hasSeenTutorial) return;
    
    // Initial entry animation for Welcome Screen
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();
  }, [hasSeenTutorial]);

  useEffect(() => {
    // Logic for countdown timer on final step
    if (TUTORIAL_STEPS[currentIndex]?.isFinalWarning && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, countdown]);

  if (hasSeenTutorial) {
    return null; // Don't render anything if they've seen it
  }

  const currentStep = TUTORIAL_STEPS[currentIndex];
  
  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 250, useNativeDriver: true })
    ]).start(callback);
  };
  
  const animateIn = () => {
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();
  };

  const handleNext = () => {
    if (currentIndex >= TUTORIAL_STEPS.length - 1) return;
    
    const nextStep = TUTORIAL_STEPS[currentIndex + 1];
    
    animateOut(() => {
      // Check if tab changed
      if (nextStep.tab !== currentStep.tab) {
        setIsTransitioning(true); // Hide images
        
        // Navigate to the next tab
        if (navigationRef.isReady()) {
          navigationRef.navigate('Main', { screen: nextStep.tab });
        }
        
        // Wait 2 seconds
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setIsTransitioning(false);
          animateIn();
        }, 2000);
      } else {
        // Just change image
        setCurrentIndex(currentIndex + 1);
        animateIn();
      }
    });
  };

  const handleBack = () => {
    if (currentIndex <= 0) return;
    
    const prevStep = TUTORIAL_STEPS[currentIndex - 1];
    
    animateOut(() => {
      if (prevStep.tab !== currentStep.tab) {
        setIsTransitioning(true);
        
        if (navigationRef.isReady()) {
          navigationRef.navigate('Main', { screen: prevStep.tab });
        }
        
        setTimeout(() => {
          setCurrentIndex(currentIndex - 1);
          setIsTransitioning(false);
          animateIn();
        }, 2000);
      } else {
        setCurrentIndex(currentIndex - 1);
        animateIn();
      }
    });
  };

  const handleSkip = () => {
    // Jump to the final warning screen
    animateOut(() => {
      const finalIndex = TUTORIAL_STEPS.length - 1;
      
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', { screen: TUTORIAL_STEPS[finalIndex].tab });
      }
      
      setCurrentIndex(finalIndex);
      setCountdown(15); // reset just in case
      animateIn();
    });
  };

  const handleFinish = async () => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        hasSeenTutorial: true
      });
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', { screen: 'Overview' });
      }
    } catch (e) {
      console.error("Error saving tutorial completion", e);
      setHasSeenTutorial(true); // Optimistic UI update
    }
  };

  return (
    <Modal visible={true} transparent={true} animationType="none" hardwareAccelerated>
      <View style={[styles.container, isTransitioning && styles.transparentContainer]}>
        {!isTransitioning && (
          <Animated.View style={[styles.content, { 
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }]}>
            
            {currentStep.isWelcome ? (
              <View style={[styles.welcomeBox, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
                <Text style={styles.welcomeTitle}>Welcome to</Text>
                <Text style={styles.welcomeSubtitle}>RFiberX Billing System</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                  <Text style={styles.primaryBtnText}>Start Tutorial</Text>
                </TouchableOpacity>
              </View>
            ) : currentStep.isFinalWarning ? (
              <View style={[styles.warningBox, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}>
                <Text style={styles.warningTitle}>Important Guidelines</Text>
                
                <Text style={[styles.warningText, { color: isDarkMode ? '#cbd5e1' : '#475569' }]}>
                  If there are bugs, unwanted displays, or any problems with your account (especially regarding billings and payments), you must consider talking to support through our Facebook page or the Tickets section in order to proceed or fix the problem.
                </Text>

                <Text style={[styles.warningAlertText, { color: '#ef4444' }]}>
                  WARNING: This system uses advanced security for analyzing GCash receipts, so frauds and scams are easily detected. Any suspicious acts or breaking rules using this billing system will lead to immediate account suspension and internet disconnection. The client will be charged with fraud and scamming cases under Republic Act No. 10175 (Cybercrime Prevention Act of 2012) or the Access Devices Regulation Act.
                </Text>
                
                {countdown > 0 ? (
                  <View style={styles.disabledBtn}>
                    <Text style={styles.disabledBtnText}>I Accept ({countdown}s)</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
                    <Text style={styles.primaryBtnText}>I Accept & Get Started</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.warningBackBtn} onPress={() => {
                  setCountdown(15);
                  handleBack();
                }}>
                  <Text style={styles.warningBackText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.imageContainer}>
                  <Image 
                    source={currentStep.image} 
                    style={styles.image}
                  />
                </View>
                
                <View style={styles.controls}>
                  <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.navRow}>
                    {currentIndex > 0 && (
                      <TouchableOpacity onPress={handleBack} style={styles.navBtn}>
                        <Text style={styles.navText}>Back</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity onPress={handleNext} style={styles.navBtnPrimary}>
                      <Text style={styles.navTextPrimary}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
            
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentContainer: {
    backgroundColor: 'transparent', // Shows the bare app underneath during the 3s delay
  },
  content: {
    flex: 1,
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  controls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skipBtn: {
    padding: 10,
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  navBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  navTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  welcomeBox: {
    width: '100%',
    maxWidth: 350,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  welcomeTitle: {
    color: '#94a3b8',
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: '#ef4444',
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  warningBox: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  warningTitle: {
    color: '#ef4444',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: 16,
  },
  warningAlertText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 22,
    marginBottom: 24,
  },
  disabledBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  disabledBtnText: {
    color: '#94a3b8',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  primaryBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  warningBackBtn: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  warningBackText: {
    color: '#94a3b8',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  }
});

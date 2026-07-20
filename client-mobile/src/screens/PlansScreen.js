import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PLANS = [
  { id: 1, name: 'Starter RFiberX', price: '800', features: ['Up to 30 Mbps', 'Unlimited Data', 'Standard Router', 'Good for 10 devices'] },
  { id: 2, name: 'Value RFiberX', price: '1000', features: ['Up to 50 Mbps', 'Unlimited Data', 'Standard Router', 'HD Streaming Ready'] },
  { id: 3, name: 'Family RFiberX', price: '1300', features: ['Up to 70 Mbps', 'Unlimited Data', 'Dual-Band Router', 'Great for 10 devices'] },
  { id: 4, name: 'Pro RFiberX', price: '1500', features: ['Up to 100 Mbps', 'Unlimited Data', 'Wi-Fi 6 Router', '4K Streaming & Gaming'] },
  { id: 5, name: 'Extreme RFiberX', price: '2000', features: ['Up to 200 Mbps', 'Unlimited Data', 'Mesh System Included', 'Ultimate Smart Home'] },
];

export default function PlansScreen({ user, navigation }) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const currentPlan = user.Plan || user.plan || 'No Plan';
  
  let currentSpeed = 0;
  const match = currentPlan.match(/(\d+)\s*Mbps/i);
  if (match) {
    currentSpeed = parseInt(match[1]);
  } else {
    // If there is no Mbps string, try to infer it from old names or exactly matched new names
    const n = currentPlan.toLowerCase();
    if (n.includes('starter') || n.includes('1500')) currentSpeed = 30;
    else if (n.includes('value') || n.includes('2000')) currentSpeed = 50;
    else if (n.includes('family') || n.includes('2500')) currentSpeed = 70;
    else if (n.includes('pro') || n.includes('3500')) currentSpeed = 100;
    else if (n.includes('extreme') || n.includes('7499') || n.includes('1 gbps')) currentSpeed = 200;
  }

  const getPlanSpeed = (plan) => {
    for (const f of plan.features) {
      const m = f.match(/(\d+)\s*Mbps/i);
      if (m) return parseInt(m[1]);
    }
    return 0;
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex && index >= 0) {
      setActiveIndex(index);
    }
  };

  const onRequestChange = (targetPlan) => {
    let action = 'Upgrade internet';
    const targetSpeed = getPlanSpeed(targetPlan);
    if (targetSpeed < currentSpeed) action = 'Downgrade internet';

    navigation.navigate('Support', { prefillCategory: action, timestamp: Date.now() });
  };

  let accountAgeMonths = 0;
  if (user.dateInstalled || user.dateCreated || user.createdAt) {
      const start = new Date(user.dateInstalled || user.dateCreated || user.createdAt);
      if (!isNaN(start.getTime())) {
          accountAgeMonths = (new Date() - start) / (1000 * 60 * 60 * 24 * 30.44);
      }
  }
  const isEligibleForChange = accountAgeMonths >= 6;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Decor */}
      <View style={[styles.bgDecorCircle, styles.bgDecor1]} />
      <View style={[styles.bgDecorCircle, styles.bgDecor2]} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Plans</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>PLAN POLICY</Text>
          {isEligibleForChange ? (
            <Text style={styles.policyText}>
              Your account has been subscribed for at least 6 months. You can now upgrade or downgrade your plan by messaging our <Text style={{ color: '#3b82f6', textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://www.facebook.com/RFiber1')}>Facebook page</Text>.
            </Text>
          ) : (
            <Text style={styles.policyText}>
              Requests for upgrades or downgrades will be queued for admin approval. Clients cannot upgrade or downgrade if they haven't been subscribed for at least 6 months on their current plan.
            </Text>
          )}
        </View>

        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {PLANS.map((plan, index) => {
              const targetSpeed = getPlanSpeed(plan);
              const isCurrent = currentSpeed > 0 && targetSpeed === currentSpeed;
              
              return (
                <View key={plan.id} style={styles.slide}>
                  <View style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planPrice}>
                        ₱{plan.price}<Text style={styles.planPeriod}> /mo</Text>
                      </Text>
                    </View>

                    <View style={styles.planDetails}>
                      {plan.features.map((feature, i) => (
                        <View key={i} style={styles.featureRow}>
                          <Text style={styles.planDesc}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    {!isCurrent ? (
                      <TouchableOpacity style={styles.actionBtn} onPress={() => onRequestChange(plan)}>
                        <Text style={styles.actionBtnText}>
                          {targetSpeed < currentSpeed ? 'Downgrade' : 'Upgrade'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.actionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
                        <Text style={[styles.actionBtnText, { color: colors.text }]}>Current Plan</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.pagination}>
            {PLANS.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex ? styles.dotActive : null]} />
            ))}
          </View>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTextContainer: { flex: 1 },
  greeting: { color: colors.text, fontSize: 24, fontFamily: 'Inter_700Bold' },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229,57,53,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
  },
  avatarSmallText: { color: colors.primary, fontSize: 16, fontFamily: 'Inter_700Bold' },
  policyBox: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(245,158,11,0.05)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    marginBottom: 20,
    flexDirection: 'row',
  },
  policyTitle: { color: '#f59e0b', fontSize: 12, fontFamily: 'Inter_700Bold', width: 60, marginRight: 10 },
  policyText: { color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 16 },
  content: { flex: 1 },
  carouselContainer: { flex: 1, justifyContent: 'center' },
  slide: { width: width, paddingHorizontal: 20, justifyContent: 'center', paddingBottom: 40 },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 400,
  },
  planCardCurrent: { borderColor: colors.primary, borderWidth: 2 },
  currentBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: { color: colors.text, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  planHeader: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 20, marginBottom: 20, alignItems: 'center' },
  planName: { color: colors.text, fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  planPrice: { color: colors.primary, fontSize: 32, fontFamily: 'Inter_700Bold' },
  planPeriod: { color: colors.textMuted, fontSize: 16, fontFamily: 'Inter_500Medium' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planDetails: { flex: 1, justifyContent: 'center' },
  planSpeed: { color: colors.text, fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 5, textAlign: 'center' },
  planDesc: { color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_400Regular' },
  actionBtn: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 20,
  },
  actionBtnText: { color: colors.primary, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  pagination: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 20, width: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: colors.primary }
});

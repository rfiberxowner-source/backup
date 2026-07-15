import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, RefreshControl, TouchableOpacity, Modal, Dimensions, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, doc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BillingScreen({ user, route, navigation }) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);
  const { width } = Dimensions.get('window');
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showGcashDropdown, setShowGcashDropdown] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const scrollRef = React.useRef(null);
  const mainScrollRef = React.useRef(null);

  const handleUploadImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadedImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (route?.params?.showReceiptId && bills.length > 0) {
      const b = bills.find(x => x.id === route.params.showReceiptId);
      if (b) {
        setSelectedReceipt(b);
        setReceiptVisible(true);
        if (navigation && navigation.setParams) {
          navigation.setParams({ showReceiptId: null });
        }
      }
    }
  }, [route?.params?.showReceiptId, bills]);

  useEffect(() => {
    const q = query(collection(db, "users", user.id, "billing_emails"));
    const unsubscribeBills = onSnapshot(q, (snap) => {
      const bList = [];
      snap.forEach(d => {
        bList.push({ id: d.id, ...d.data() });
      });
      bList.sort((a, b) => new Date(b.dateSent || 0) - new Date(a.dateSent || 0));
      setBills(bList);

      const bal = bList
        .filter(b => b.status !== 'paid')
        .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
      setTotalBalance(bal.toFixed(2));
    }, (error) => {
      console.error(error);
    });

    const qPayments = query(collection(db, "payments"), where("userId", "==", user.id));
    const unsubscribePayments = onSnapshot(qPayments, (snap) => {
      const pList = [];
      snap.forEach(d => pList.push({ id: d.id, ...d.data() }));
      pList.sort((a, b) => new Date(b.datePaid || b.date || 0) - new Date(a.datePaid || a.date || 0));
      setPayments(pList);
    });

    return () => {
      unsubscribeBills();
      unsubscribePayments();
    };
  }, [user.id]);

  const switchTab = (index) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveTab(index);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const markAsPaid = async (billId, amount) => {
    try {
      await updateDoc(doc(db, "users", user.id, "billing_emails", billId), {
        status: 'paid',
        datePaid: new Date().toISOString()
      });

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let refId = 'REF-';
      for (let i = 0; i < 8; i++) {
        refId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      await addDoc(collection(db, "payments"), {
        userId: user.id,
        accountNumber: user.accountNumber || '-',
        name: user.name || 'User',
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        referenceId: refId,
        method: 'Online',
        status: 'Completed'
      });

      setPaymentModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Billing & Payment</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {user.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={{ width: 36, height: 36, borderRadius: 18 }} />
          ) : (
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={mainScrollRef}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 3-Column Hero Grid */}
        <View style={styles.heroGrid}>
          <View style={styles.heroGridItem}>
             <Text style={styles.heroGridLabel}>Current Plan</Text>
             <Text style={styles.heroGridValue}>{user.plan || user.Plan || 'N/A'}</Text>
          </View>
          <View style={[styles.heroGridItem, styles.heroGridItemCenter]}>
             <Text style={styles.heroGridLabel}>Outstanding Balance</Text>
             <Text style={[styles.heroGridValue, {color: '#E53935'}]}>₱{totalBalance}</Text>
          </View>
          <View style={styles.heroGridItem}>
             <Text style={styles.heroGridLabel}>Recorded Payments</Text>
             <Text style={styles.heroGridValue}>{payments.length}</Text>
          </View>
        </View>

        {/* Current Plan Amount Box */}
        {(() => {
          const userPlan = user.Plan || user.plan || '';
          const userAmountStr = user.ammount || user.amount || '0';
          let baseAmount = parseFloat(String(userAmountStr).replace(/[^0-9.]/g, '')) || 0;
          
          if (baseAmount === 0 && userPlan) {
            const pStr = userPlan;
            if (pStr.includes('200Mbps')) baseAmount = 2000;
            else if (pStr.includes('100Mbps') || pStr.includes('70Mbps')) baseAmount = 1500;
            else if (pStr.includes('50Mbps')) baseAmount = 1000;
            else if (pStr.includes('30Mbps')) baseAmount = 800;
          }
          return (
            <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 5 }}>Current Plan Amount</Text>
              <Text style={{ color: '#10b981', fontSize: 24, fontFamily: 'Inter_700Bold' }}>₱{baseAmount.toFixed(2)}</Text>
            </View>
          );
        })()}

        <TouchableOpacity 
          style={[styles.payButton, parseFloat(totalBalance) <= 0 && styles.payButtonDisabled]} 
          onPress={() => mainScrollRef.current?.scrollToEnd({ animated: true })}
          disabled={parseFloat(totalBalance) <= 0}
        >
          <MaterialCommunityIcons name="credit-card-fast-outline" size={20} color="#fff" />
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]} 
            onPress={() => switchTab(0)}
          >
            <View style={styles.tabContentRow}>
              <Text style={[styles.tabBtnText, activeTab === 0 && styles.tabBtnTextActive]}>My Statements</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]} 
            onPress={() => switchTab(1)}
          >
            <View style={styles.tabContentRow}>
              <Text style={[styles.tabBtnText, activeTab === 1 && styles.tabBtnTextActive]}>Payment History</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ width: width, marginLeft: -20, marginTop: 15 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {/* Tab 1: Unpaid/Overdue Bills */}
            <View style={{ width: width, paddingHorizontal: 20 }}>
              <View style={styles.billsContainer}>
                {bills.filter(b => b.status !== 'paid').length === 0 ? (
                  <Text style={styles.emptyText}>You have no pending statements.</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 520 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {bills.filter(b => b.status !== 'paid').map(b => (
                      <View key={b.id} style={styles.billCard}>
                        <View style={styles.billHeader}>
                          <View style={styles.billIconBox}>
                            <MaterialCommunityIcons name="receipt" size={24} color={colors.primary} />
                          </View>
                          <View style={styles.billInfo}>
                            <Text style={styles.billMonth}>{new Date(b.dateSent).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                            <Text style={styles.billDesc}>{b.plan || 'Plan'}</Text>
                          </View>
                          <View style={styles.billRight}>
                            <Text style={styles.billAmount}>₱{b.amount}</Text>
                            <View style={[styles.statusPill, styles.statusUnpaid]}>
                              <Text style={[styles.statusText, styles.statusTextUnpaid]}>
                                {b.status === 'overdue' ? 'Overdue' : 'Unpaid'}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity 
                          style={styles.markPaidBtn} 
                          onPress={() => {
                            setSelectedReceipt(b);
                            setReceiptVisible(true);
                          }}
                        >
                          <Text style={styles.markPaidBtnText}>View Billing Statement</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Tab 2: Payment History (Paid Bills + Payments) */}
            <View style={{ width: width, paddingHorizontal: 20 }}>
              <View style={styles.billsContainer}>
                {payments.length === 0 ? (
                  <Text style={styles.emptyText}>You have no payment history.</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 520 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {payments.map(p => (
                      <View key={p.id} style={styles.billCard}>
                        <View style={styles.billHeader}>
                          <View style={styles.billIconBox}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                          </View>
                          <View style={styles.billInfo}>
                            <Text style={styles.billMonth}>{new Date(p.datePaid || p.date || 0).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                            <Text style={styles.billDesc}>Payment successful</Text>
                          </View>
                          <View style={styles.billRight}>
                            <Text style={styles.billAmount}>₱{p.amount}</Text>
                            <View style={[styles.statusPill, styles.statusPaid]}>
                              <Text style={[styles.statusText, styles.statusTextPaid]}>Paid</Text>
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity 
                          style={styles.markPaidBtn} 
                          onPress={() => {
                            setSelectedReceipt({ ...p, status: 'paid' });
                            setReceiptVisible(true);
                          }}
                        >
                          <Text style={styles.markPaidBtnText}>View Receipt</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Preferred Payment Method (Inline) */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentSectionTitle}>Preferred payment method</Text>
          <Text style={styles.paymentSectionDesc}>Choose how you would like to pay your monthly bill.</Text>
          
          <TouchableOpacity style={[styles.methodCard, showGcashDropdown && { borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 }]} onPress={() => {
            if (showGcashDropdown) {
              setUploadedImage(null);
            }
            setShowGcashDropdown(!showGcashDropdown);
          }}>
            <MaterialCommunityIcons name="cellphone" size={30} color="#005EEA" />
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>GCash</Text>
              <Text style={styles.methodDetails}>0912 345 6789 (Fiber X)</Text>
            </View>
            <MaterialCommunityIcons name={showGcashDropdown ? "chevron-up" : "chevron-down"} size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {showGcashDropdown && (
            <View style={{ backgroundColor: colors.card, padding: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 15, borderWidth: 1, borderTopWidth: 0, borderColor: colors.border, alignItems: 'center' }}>
               <MaterialCommunityIcons name="qrcode-scan" size={100} color={colors.text} style={{ marginBottom: 15 }} />
               <Text style={{ color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 5 }}>Scan to Pay</Text>
               <Text style={{ color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 20 }}>0912 345 6789</Text>
               
               {uploadedImage && (
                 <View style={{ marginBottom: 15, width: '100%', alignItems: 'center' }}>
                   <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 5 }}>Screenshot Preview</Text>
                   <Image source={{ uri: uploadedImage }} style={{ width: 140, height: 200, borderRadius: 12, borderWidth: 1, borderColor: colors.border }} resizeMode="cover" />
                 </View>
               )}
               
               <TouchableOpacity 
                 style={{ backgroundColor: colors.background, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: colors.border }}
                 onPress={handleUploadImage}
               >
                  <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Upload Payment Screenshot</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={{ backgroundColor: 'rgba(16,185,129,0.1)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' }}
                 onPress={() => {
                   if (!uploadedImage) {
                     Alert.alert("No image", "Please upload a payment screenshot first before running AI analysis.");
                     return;
                   }
                   setShowAIModal(true);
                 }}
               >
                  <Text style={{ color: '#10b981', fontFamily: 'Inter_500Medium' }}>View AI Analysis</Text>
               </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.methodCard} onPress={() => {}}>
            <MaterialCommunityIcons name="bank" size={30} color="#F37021" />
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>BDO Bank Transfer</Text>
              <Text style={styles.methodDetails}>Acct: 001234567890</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard} onPress={() => {}}>
            <MaterialCommunityIcons name="bank-transfer" size={30} color="#D7141A" />
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>BPI Online</Text>
              <Text style={styles.methodDetails}>Acct: 0987654321</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Paper Receipt Modal for Unpaid Bills */}
      <Modal visible={receiptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptPaper}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              {selectedReceipt && (() => {
                const isPaidReceipt = selectedReceipt.status === 'paid' || selectedReceipt.collection === 'payments';
                
                const statementDateObj = isPaidReceipt 
                  ? new Date(selectedReceipt.datePaid || selectedReceipt.date || selectedReceipt.dateSent || 0)
                  : new Date(selectedReceipt.dateSent || selectedReceipt.date || 0);
                const statementDateStr = statementDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                const allPays = [];
                payments.forEach(p => {
                  allPays.push({ ...p, isPaidRec: true, sortDate: p.datePaid || p.dateSent || p.date || '' });
                });
                bills.forEach(b => {
                  if (b.status !== 'paid') {
                    allPays.push({ ...b, isPaidRec: false, sortDate: b.dateSent || b.datePaid || b.date || '' });
                  }
                });
                
                allPays.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));
                
                let prevCharges = 0;
                let prevPaid = true;
                const currentIdx = allPays.findIndex(p => p.id === selectedReceipt.id || p.billId === selectedReceipt.id);
                if (currentIdx > 0) {
                  prevCharges = parseFloat(String(allPays[currentIdx - 1].amount).replace(/[^0-9.]/g, '')) || 0;
                  prevPaid = allPays[currentIdx - 1].isPaidRec;
                }
                
                const amount = parseFloat(String(selectedReceipt.amount || 0).replace(/[^0-9.]/g, '')) || 0;
                const actualCurrentCharges = amount;
                
                let baseAmount = parseFloat(String(user.amount || 0).replace(/[^0-9.]/g, '')) || 0;
                if (baseAmount === 0 && amount > 0) {
                  const pStr = selectedReceipt.plan || '';
                  if (pStr.includes('200Mbps')) baseAmount = 2000;
                  else if (pStr.includes('100Mbps') || pStr.includes('70Mbps')) baseAmount = 1500;
                  else if (pStr.includes('50Mbps')) baseAmount = 1000;
                  else if (pStr.includes('30Mbps')) baseAmount = 800;
                  else {
                    if (amount % 2000 === 0) baseAmount = 2000;
                    else if (amount % 1500 === 0) baseAmount = 1500;
                    else if (amount % 1000 === 0) baseAmount = 1000;
                    else baseAmount = amount;
                  }
                }
                
                let currentCharges = !isPaidReceipt ? amount : baseAmount;
                let remainingBalance = prevPaid ? 0 : prevCharges;
                let totalAmountDue = !isPaidReceipt ? (currentCharges + remainingBalance) : 0;
                let previousCharges = prevCharges;
                
                let prevPaymentText = prevPaid && prevCharges > 0 ? '₱' + prevCharges.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' CR' : '₱0.00';
                
                return (
                <>
                  <View style={styles.rHeader}>
                    <View style={styles.rLogoRow}>
                      <View style={styles.rLogoBox}>
                        <MaterialCommunityIcons name="wifi" size={24} color="#fff" />
                      </View>
                      <View>
                        <Text style={styles.rLogoText}><Text style={{color: '#E53935'}}>R</Text>FIBER<Text style={{color: '#E53935'}}>X</Text></Text>
                        <Text style={styles.rLogoSub}>NETWORK AND DATA SOLUTION</Text>
                      </View>
                    </View>
                    <Text style={styles.rPage}>Page 1 of 1</Text>
                  </View>
                  
                  <View style={styles.rTitleBox}>
                    <Text style={styles.rTitle}>STATEMENT OF ACCOUNT</Text>
                  </View>
                  
                  <View style={styles.rInfoRow}>
                    <View style={{flex: 1, paddingRight: 10}}>
                      <Text style={styles.rClientName} numberOfLines={2}>{user.name || 'User'}</Text>
                      <Text style={styles.rClientAddress} numberOfLines={3}>{user.address || 'None'}</Text>
                    </View>
                    <View style={styles.rSummaryGrid}>
                      <View style={styles.rGridRow}>
                        <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>STATEMENT DATE</Text></View>
                        <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>{isPaidReceipt ? 'PAYMENT ID' : 'BILL ID'}</Text></View>
                      </View>
                      <View style={styles.rGridRow}>
                        <View style={styles.rGridCell}><Text style={styles.rGridCellText}>{statementDateStr}</Text></View>
                        <View style={styles.rGridCell}><Text style={[styles.rGridCellText, {fontSize: 8}]}>{selectedReceipt.id}</Text></View>
                      </View>
                      <View style={styles.rGridRow}>
                        <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>TOTAL AMOUNT DUE</Text></View>
                        <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>DUE DATE</Text></View>
                      </View>
                      <View style={styles.rGridRow}>
                        <View style={styles.rGridCell}><Text style={[styles.rGridCellText, {color: '#E53935', fontFamily: 'Inter_700Bold'}]}>₱{totalAmountDue.toFixed(2)}</Text></View>
                        <View style={styles.rGridCell}><Text style={styles.rGridCellText}>{selectedReceipt.dueDate || '-'}</Text></View>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.rAcctLine}><Text style={{fontFamily: 'Inter_700Bold'}}>Statement of Account Number:</Text> {user.accountNumber || '-'}</Text>
                  
                  <View style={{alignItems: 'center', marginBottom: 15}}>
                    <Text style={styles.rBillSummaryBadge}>BILL SUMMARY</Text>
                  </View>
                  
                  <View style={styles.rCalculationsBox}>
                    <Text style={styles.rCalcSectionTitle}>A. Previous Charges</Text>
                    <View style={styles.rCalcRow}>
                      <Text style={styles.rCalcLabel}>Balance from Previous Bill</Text>
                      <Text style={styles.rCalcValue}>₱{previousCharges.toFixed(2)}</Text>
                    </View>
                    <View style={styles.rCalcRow}>
                      <Text style={styles.rCalcLabel}>Less: Payments Received</Text>
                      <Text style={styles.rCalcValue}>{prevPaymentText}</Text>
                    </View>
                    <View style={[styles.rCalcRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 5 }]}>
                      <Text style={[styles.rCalcLabel, {fontFamily: 'Inter_700Bold'}]}>Remaining Balance from Previous Bill</Text>
                      <Text style={[styles.rCalcValue, {fontFamily: 'Inter_700Bold'}]}>₱{remainingBalance.toFixed(2)}</Text>
                    </View>
                    
                    <Text style={[styles.rCalcSectionTitle, {marginTop: 20}]}>B. Current Charges</Text>
                    <View style={styles.rCalcRow}>
                      <Text style={styles.rCalcLabel}>Monthly Service Fee ({selectedReceipt.plan || selectedReceipt.period || selectedReceipt.billingMonth || 'Plan'})</Text>
                      <Text style={styles.rCalcValue}>₱{currentCharges.toFixed(2)}</Text>
                    </View>
                    {isPaidReceipt && (
                      <View style={styles.rCalcRow}>
                        <Text style={styles.rCalcLabel}>Less: Payments Received</Text>
                        <Text style={styles.rCalcValue}>₱{actualCurrentCharges.toFixed(2)}</Text>
                      </View>
                    )}
                    
                    <View style={styles.rTotalBox}>
                      <Text style={styles.rTotalText}>TOTAL AMOUNT DUE</Text>
                      <Text style={styles.rTotalValue}>₱{totalAmountDue.toFixed(2)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.rThankYou}>Please pay on or before the due date to avoid service interruption.</Text>
                  
                  <TouchableOpacity style={styles.rCloseBtn} onPress={() => setReceiptVisible(false)}>
                    <Text style={styles.rCloseBtnText}>Close Receipt</Text>
                  </TouchableOpacity>
                </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Analysis Dummy Modal */}
      <Modal visible={showAIModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.receiptPaper, { padding: 30, alignItems: 'center' }]}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
              <MaterialCommunityIcons name="robot-outline" size={45} color="#10b981" />
            </View>
            <Text style={{ color: '#111', fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 10 }}>AI Receipt Analysis</Text>
            <Text style={{ color: '#666', fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 20 }}>
              The uploaded screenshot has been processed by our AI vision model.
            </Text>
            
            <View style={{ backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, width: '100%', marginBottom: 25, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ color: '#334155', fontSize: 15, fontFamily: 'Inter_500Medium' }}>Payment Detected</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <MaterialCommunityIcons name="cash" size={18} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ color: '#334155', fontSize: 15, fontFamily: 'Inter_500Medium' }}>Amount: <Text style={{ fontFamily: 'Inter_700Bold' }}>₱{parseFloat(totalBalance).toFixed(2)}</Text></Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ color: '#334155', fontSize: 15, fontFamily: 'Inter_500Medium' }}>GCash Ref: <Text style={{ fontFamily: 'Inter_700Bold' }}>843920194</Text></Text>
              </View>
              
              <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748b', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Analysis Result</Text>
                <Text style={{ color: '#10b981', fontSize: 12, fontFamily: 'Inter_700Bold' }}>98% Confidence</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={{ backgroundColor: '#111', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12, width: '100%', alignItems: 'center' }}
              onPress={() => setShowAIModal(false)}
            >
              <Text style={{ color: colors.text, fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Close Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  heroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    marginTop: 10,
  },
  heroGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroGridItemCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 2,
  },
  heroGridLabel: { color: colors.textMuted, fontSize: 9, fontFamily: 'Inter_500Medium', marginBottom: 6, textAlign: 'center' },
  heroGridValue: { color: colors.text, fontSize: 16, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  payButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
  },
  payButtonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  payButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold', marginLeft: 8 },
  paymentSection: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentSectionTitle: { color: colors.text, fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 5 },
  paymentSectionDesc: { color: colors.textMuted, fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 20 },
  sectionTitle: { color: colors.text, fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 15 },
  billsContainer: { marginBottom: 20 },
  billCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billHeader: { flexDirection: 'row', alignItems: 'center' },
  billIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(229,57,53,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  billInfo: { flex: 1 },
  billMonth: { color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  billDesc: { color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium' },
  billRight: { alignItems: 'flex-end' },
  billAmount: { color: colors.text, fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPaid: { backgroundColor: 'rgba(16,185,129,0.1)' },
  statusUnpaid: { backgroundColor: 'rgba(245,158,11,0.1)' },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  statusTextPaid: { color: '#10b981' },
  statusTextUnpaid: { color: '#f59e0b' },
  markPaidBtn: {
    marginTop: 20,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  markPaidBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  emptyText: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { color: colors.text, fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 5 },
  sheetDesc: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular' },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodInfo: { marginLeft: 15 },
  methodName: { color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  methodDetails: { color: colors.textMuted, fontSize: 13, fontFamily: 'Inter_500Medium' },
  closeSheetBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  closeSheetBtnText: { color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  receiptPaper: { backgroundColor: colors.card, borderRadius: 8, width: '100%', maxHeight: '90%', overflow: 'hidden' },
  rHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 3, borderBottomColor: '#E53935', paddingBottom: 15, marginBottom: 20 },
  rLogoRow: { flexDirection: 'row', alignItems: 'center' },
  rLogoBox: { backgroundColor: '#E53935', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  rLogoText: { fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: '#1a1a1a', letterSpacing: -0.5 },
  rLogoSub: { fontSize: 7, color: '#666', fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: -2 },
  rPage: { fontSize: 10, color: '#888' },
  rTitleBox: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 10, marginBottom: 20 },
  rTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#1a1a1a', letterSpacing: 1.5 },
  rInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  rClientName: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#1a1a1a', textTransform: 'uppercase', marginBottom: 4 },
  rClientAddress: { fontSize: 11, color: '#555', fontFamily: 'Inter_400Regular' },
  rSummaryGrid: { borderWidth: 1, borderColor: '#1a1a1a', width: 150 },
  rGridRow: { flexDirection: 'row' },
  rGridHeader: { flex: 1, backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9', padding: 4, alignItems: 'center', justifyContent: 'center' },
  rGridHeaderText: { color: colors.text, fontSize: 7, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  rGridCell: { flex: 1, padding: 4, borderBottomWidth: 1, borderBottomColor: '#ddd', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  rGridCellText: { color: '#333', fontSize: 9, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  rAcctLine: { fontSize: 11, color: '#333', marginBottom: 20 },
  rBillSummaryBadge: { backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9', color: colors.text, paddingVertical: 4, paddingHorizontal: 15, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  rCalculationsBox: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 20 },
  rCalcSectionTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#1a1a1a', marginBottom: 10 },
  rCalcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingLeft: 10 },
  rCalcLabel: { fontSize: 11, color: '#444', fontFamily: 'Inter_400Regular' },
  rCalcValue: { fontSize: 11, color: '#444', fontFamily: 'Inter_400Regular' },
  rTotalBox: { backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  rTotalText: { color: colors.text, fontSize: 11, fontFamily: 'Inter_700Bold' },
  rTotalValue: { color: colors.text, fontSize: 13, fontFamily: 'Inter_700Bold' },
  rThankYou: { textAlign: 'center', color: '#E53935', fontSize: 10, marginBottom: 20, fontStyle: 'italic', fontFamily: 'Inter_600SemiBold' },
  rCloseBtn: { backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9', padding: 12, borderRadius: 8, alignItems: 'center' },
  rCloseBtnText: { color: colors.text, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    padding: 5,
    marginBottom: 5,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tabBtnTextActive: {
    color: colors.text,
  },
});

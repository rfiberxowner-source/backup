import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function OverviewScreen({ user, navigation }) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(user);
  
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0 = Recent, 1 = Announcements
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  const scrollRef = useRef(null);

  const [reportsData, setReportsData] = useState([]);
  const [billsData, setBillsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [globalAnnData, setGlobalAnnData] = useState([]);

  useEffect(() => {
    // 1. User Data
    const unsubUser = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        const updatedUser = { id: user.id, ...docSnap.data() };
        setUserData(updatedUser);
        AsyncStorage.setItem('clientUser', JSON.stringify(updatedUser));
      }
    });

    // 2. Reports
    const qReports = query(collection(db, "reports"), where("userId", "==", user.id));
    const unsubReports = onSnapshot(qReports, (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setReportsData(arr);
    });

    // 3. Bills
    const unsubBills = onSnapshot(collection(db, "users", user.id, "billing_emails"), (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setBillsData(arr);
    });

    // 4. Payments
    const qPayments = query(collection(db, "payments"), where("userId", "==", user.id));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setPaymentsData(arr);
    });

    // 5. Global Announcements
    const unsubAnn = onSnapshot(collection(db, "announcements"), (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setGlobalAnnData(arr);
    }, (error) => {
      console.log("No announcements collection found or error fetching", error);
    });

    return () => {
      unsubUser();
      unsubReports();
      unsubBills();
      unsubPayments();
      unsubAnn();
    };
  }, []);

  useEffect(() => {
    let recentList = [];

    reportsData.forEach(r => {
      const isFixed = r.status === 'Fixed' || r.status === 'Done';
      const item = {
        id: r.id, type: 'ticket', collection: 'reports',
        title: isFixed ? 'Ticket Fixed' : `Ticket: ${r.subject || 'Support Request'}`,
        desc: isFixed ? `Your report ${r.category || 'Other'} has been marked as ${r.status}` : `Status: ${r.status}`,
        icon: 'lifebuoy', color: '#3b82f6',
        date: new Date(r.processedDate || r.date),
        isRead: r.isRead || false,
        originalData: r
      };
      recentList.push(item);
    });

    billsData.forEach(b => {
      if (b.status !== 'paid') {
        const item = {
          id: b.id, type: 'bill', collection: 'billing_emails',
          title: 'Billing Statement',
          desc: `Amount due ₱${b.amount}, Due Date ${b.dueDate || '-'}`,
          icon: 'file-document-outline', color: colors.primary,
          date: new Date(b.dateSent),
          isRead: b.isRead || false,
          originalData: b
        };
        recentList.push(item);
      }
    });

    paymentsData.forEach(p => {
      const item = {
        id: p.id, type: 'bill', collection: 'payments',
        title: 'Payment successful',
        desc: `You Pay ₱${p.amount} for ${p.period || p.billingMonth || '-'}. View receipt`,
        icon: 'file-document-outline', color: colors.primary,
        date: new Date(p.datePaid || p.date || 0),
        isRead: p.isRead || false,
        originalData: { ...p, status: 'paid' }
      };
      recentList.push(item);
    });

    globalAnnData.forEach(a => {
      const isRead = a.readBy && a.readBy.includes(user.id);
      recentList.push({
        id: a.id, type: 'announcement', collection: 'announcements',
        title: a.title || 'Announcement',
        desc: a.message || a.description || '',
        icon: 'bullhorn', color: '#f59e0b',
        date: new Date(a.date || 0),
        isRead: isRead,
        originalData: a
      });
    });

    recentList.sort((a, b) => b.date - a.date);

    setRecentUpdates(recentList);
  }, [reportsData, billsData, paymentsData, globalAnnData]);

  const onRefresh = () => {
    // With real-time listeners, pull-to-refresh is mostly visual
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handlePressItem = async (item) => {
    try {
      if (!item.isRead) {
        if (item.type === 'announcement') {
          await updateDoc(doc(db, "announcements", item.id), {
            readBy: arrayUnion(userData.id)
          });
          setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isRead: true } : a));
        } else if (item.type === 'ticket') {
          await updateDoc(doc(db, "reports", item.id), { isRead: true });
          if (item.originalData.status === 'Fixed' || item.originalData.status === 'Done') {
            setRecentUpdates(prev => prev.map(a => a.id === item.id ? { ...a, isRead: true } : a));
          } else {
            setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isRead: true } : a));
          }
        } else if (item.type === 'bill') {
          if (item.collection === 'billing_emails') {
            await updateDoc(doc(db, "users", userData.id, "billing_emails", item.id), { isRead: true });
            setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isRead: true } : a));
          } else if (item.collection === 'payments') {
            await updateDoc(doc(db, "payments", item.id), { isRead: true });
            setRecentUpdates(prev => prev.map(a => a.id === item.id ? { ...a, isRead: true } : a));
          }
        }
      }

      // Navigate after marking as read
      if (item.type === 'bill') {
        if (item.originalData.status === 'paid' || item.collection === 'payments') {
          setSelectedReceipt(item.originalData);
          setReceiptVisible(true);
        } else {
          navigation.navigate('Billing', { showReceiptId: item.id });
        }
      } else if (item.type === 'ticket') {
        navigation.navigate('Support', { ticketId: item.id });
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const markAllAsRead = async () => {
    const unreadItems = recentUpdates.filter(i => !i.isRead);
    if (unreadItems.length === 0) return;
    
    for (const item of unreadItems) {
      try {
        if (item.type === 'announcement') {
          await updateDoc(doc(db, "announcements", item.id), {
            readBy: arrayUnion(userData.id)
          });
        } else if (item.type === 'ticket') {
          await updateDoc(doc(db, "reports", item.id), { isRead: true });
        } else if (item.type === 'bill') {
          if (item.collection === 'billing_emails') {
            await updateDoc(doc(db, "users", userData.id, "billing_emails", item.id), { isRead: true });
          } else if (item.collection === 'payments') {
            await updateDoc(doc(db, "payments", item.id), { isRead: true });
          }
        }
      } catch (err) {
        console.error("Failed to mark as read", item.id, err);
      }
    }
  };

  const currentPlan = userData.Plan || userData.plan || 'No Plan';
  const currentAcct = userData.accountNumber || userData.account || '-';
  const currentEmail = userData.email || '-';
  const fullName = userData.name || 'User';

  const unreadRecentCount = recentUpdates.filter(i => !i.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Overview</Text>
        </View>
        <View style={[styles.statusBadge, {paddingVertical: 4, paddingHorizontal: 8}]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active Account</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Box 1: Profile Hero Card */}
        <View style={styles.profileCard}>
          <View style={styles.cardDecoration1} />
          <View style={styles.cardDecoration2} />
          
          <View style={styles.profileHeroRow}>
            {userData.profilePicture ? (
              <Image source={{ uri: userData.profilePicture }} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#fff' }} />
            ) : (
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{getInitials(fullName)}</Text>
              </View>
            )}
            <View style={styles.heroInfo}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2}}>
                <Text style={[styles.heroName, {flex: 1}]} numberOfLines={1} adjustsFontSizeToFit>{fullName}</Text>
              </View>
              <Text style={{color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_500Medium'}}>{currentAcct}</Text>
            </View>
          </View>
          
          <View style={styles.mottoContainer}>
            <Text style={styles.mottoText}>Your connection, account, and support - right where you need them.</Text>
            <View style={{alignItems: 'flex-end', marginTop: 10}}>
              <Text style={{color: '#94a3b8', fontSize: 11, fontFamily: 'Inter_500Medium'}} numberOfLines={1} adjustsFontSizeToFit>{currentEmail}</Text>
            </View>
          </View>
        </View>

        {/* Header for Recent Updates */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold'}}>Recent Updates</Text>
            {unreadRecentCount > 0 && (
              <View style={styles.notificationCircle}>
                <Text style={styles.notificationCount}>{unreadRecentCount > 99 ? '99+' : unreadRecentCount}</Text>
              </View>
            )}
          </View>
          {unreadRecentCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={{paddingHorizontal: 10, paddingVertical: 5, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 6, borderWidth: 1, borderColor: colors.border}}>
              <Text style={{color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium'}}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Updates Feed */}
        <View style={styles.feedContainer}>
          {recentUpdates.length === 0 ? (
            <View style={styles.emptyFeed}>
              <MaterialCommunityIcons name="check-all" size={40} color={colors.border} />
              <Text style={styles.emptyText}>Nothing recent to show.</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 350 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
              {recentUpdates.map((item, index) => (
                <TouchableOpacity key={item.id + index} style={[styles.feedItem, !item.isRead && styles.feedItemUnread]} onPress={() => handlePressItem(item)}>
                  <View style={[styles.feedIconBox, { backgroundColor: item.color + '20' }]}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.feedContent}>
                    <Text style={[styles.feedTitle, !item.isRead && styles.feedTitleUnread]}>{item.title}</Text>
                    <Text style={styles.feedDesc} numberOfLines={2}>{item.desc}</Text>
                  </View>
                  
                  {/* Miniature Thumbnail Preview for Bills and Tickets */}
                  {(item.type === 'ticket' || item.type === 'bill') && (
                    <View style={{
                      width: 34, height: 44, 
                      backgroundColor: item.type === 'bill' ? '#f8fafc' : item.color + '15', 
                      borderRadius: 4, 
                      marginRight: 10,
                      padding: 4,
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: item.type === 'bill' ? '#e2e8f0' : item.color + '40',
                    }}>
                      <View style={{height: 2, width: '100%', backgroundColor: item.type === 'bill' ? '#cbd5e1' : item.color, opacity: 0.6, borderRadius: 1}} />
                      <View style={{height: 2, width: '70%', backgroundColor: item.type === 'bill' ? '#cbd5e1' : item.color, opacity: 0.6, borderRadius: 1}} />
                      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                         <MaterialCommunityIcons name={item.type === 'bill' ? 'check-decagram' : 'ticket-confirmation'} size={14} color={item.type === 'bill' ? '#10b981' : item.color} />
                      </View>
                      <View style={{height: 2, width: '50%', backgroundColor: item.type === 'bill' ? '#cbd5e1' : item.color, opacity: 0.6, borderRadius: 1}} />
                    </View>
                  )}

                  {!item.isRead && <View style={styles.unreadDot} />}
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

      </ScrollView>

      {/* Receipt Modal */}
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
                (typeof paymentsData !== 'undefined' ? paymentsData : []).forEach(p => {
                  allPays.push({ ...p, isPaidRec: true, sortDate: p.datePaid || p.dateSent || p.date || '' });
                });
                (typeof billsData !== 'undefined' ? billsData : []).forEach(b => {
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
                
                let baseAmount = parseFloat(String(userData.amount || 0).replace(/[^0-9.]/g, '')) || 0;
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
                      <Text style={styles.rClientName} numberOfLines={2}>{userData.name || 'User'}</Text>
                      <Text style={styles.rClientAddress} numberOfLines={3}>{userData.address || 'None'}</Text>
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
                  
                  <Text style={styles.rAcctLine}><Text style={{fontFamily: 'Inter_700Bold'}}>Statement of Account Number:</Text> {userData.accountNumber || '-'}</Text>
                  
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
                  
                  <Text style={styles.rThankYou}>Thank you for keeping your account current. We value your continued patronage.</Text>
                  
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

    </SafeAreaView>
  );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    color: colors.text,
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229,57,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  
  /* Box 1: Profile Card */
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardDecoration1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(229,57,53,0.05)',
  },
  cardDecoration2: {
    position: 'absolute',
    bottom: -30,
    right: 50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59,130,246,0.05)',
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(229,57,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarLargeText: {
    color: colors.primary,
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    color: colors.text,
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    color: '#10b981',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  mottoContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  mottoText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
  },

  /* Box 2: Account Details Card */
  accountGridCard: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridBox: {
    flex: 1,
    justifyContent: 'center',
  },
  gridDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  gridIcon: {
    marginBottom: 10,
    opacity: 0.8,
  },
  gridLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 6,
  },
  gridValue: {
    color: colors.text,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.5,
  },

  /* Tabs */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    padding: 5,
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
  notificationCircle: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 5,
  },
  notificationCount: {
    color: colors.text,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },

  /* Feeds */
  feedContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  emptyFeed: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginTop: 15,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  feedItemUnread: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  },
  feedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  feedContent: {
    flex: 1,
  },
  feedTitle: {
    color: colors.text,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  feedTitleUnread: {
    fontFamily: 'Inter_700Bold',
  },
  feedDesc: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
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
  rThankYou: { textAlign: 'center', color: '#555', fontSize: 10, marginBottom: 20, fontStyle: 'italic' },
  rCloseBtn: { backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9', padding: 12, borderRadius: 8, alignItems: 'center' },
  rCloseBtnText: { color: colors.text, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

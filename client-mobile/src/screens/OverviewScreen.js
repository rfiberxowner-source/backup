import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import Colors from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function OverviewScreen({ user, navigation }) {
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
    let annList = [];

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
      if (isFixed) {
        recentList.push(item);
      } else {
        annList.push(item);
      }
    });

    billsData.forEach(b => {
      if (b.status !== 'paid') {
        const item = {
          id: b.id, type: 'bill', collection: 'billing_emails',
          title: 'Billing Statement',
          desc: `Amount due ₱${b.amount}, Due Date ${b.dueDate || '-'}`,
          icon: 'file-document-outline', color: Colors.primary,
          date: new Date(b.dateSent),
          isRead: b.isRead || false,
          originalData: b
        };
        annList.push(item);
      }
    });

    paymentsData.forEach(p => {
      const item = {
        id: p.id, type: 'bill', collection: 'payments',
        title: 'Payment successful',
        desc: `You Pay ₱${p.amount} for ${p.period || p.billingMonth || '-'}. View receipt`,
        icon: 'file-document-outline', color: Colors.primary,
        date: new Date(p.datePaid || p.date || 0),
        isRead: p.isRead || false,
        originalData: { ...p, status: 'paid' }
      };
      recentList.push(item);
    });

    globalAnnData.forEach(a => {
      const isRead = a.readBy && a.readBy.includes(user.id);
      annList.push({
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
    annList.sort((a, b) => b.date - a.date);

    setRecentUpdates(recentList);
    setAnnouncements(annList);
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

  const switchTab = (index) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveTab(index);
  };

  const currentPlan = userData.Plan || userData.plan || 'No Plan';
  const currentAcct = userData.accountNumber || userData.account || '-';
  const fullName = userData.name || 'User';

  const unreadRecentCount = recentUpdates.filter(i => !i.isRead).length;
  const unreadAnnCount = announcements.filter(i => !i.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Overview</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{getInitials(userData.name)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Box 1: Full Name and Active Status */}
        <View style={styles.profileCard}>
          {/* Subtle background decoration */}
          <View style={styles.cardDecoration1} />
          <View style={styles.cardDecoration2} />
          
          <View style={styles.profileHeroRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{getInitials(fullName)}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName} numberOfLines={2}>{fullName}</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Account</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.mottoContainer}>
            <Text style={styles.mottoText}>Your connection, account, and support - right where you need them.</Text>
          </View>
        </View>

        {/* Box 2: Account Number & Current Tier Plan */}
        <View style={styles.accountGridCard}>
          <View style={styles.gridBox}>
            <MaterialCommunityIcons name="identifier" size={18} color={Colors.textMuted} style={styles.gridIcon} />
            <Text style={styles.gridLabel}>Account Number</Text>
            <Text style={styles.gridValue} numberOfLines={1} adjustsFontSizeToFit>{currentAcct}</Text>
          </View>
          
          <View style={styles.gridDivider} />
          
          <View style={styles.gridBox}>
            <MaterialCommunityIcons name="wifi" size={18} color={Colors.textMuted} style={styles.gridIcon} />
            <Text style={styles.gridLabel}>Current Plan</Text>
            <Text style={styles.gridValue} numberOfLines={1} adjustsFontSizeToFit>{currentPlan}</Text>
          </View>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]} 
            onPress={() => switchTab(0)}
          >
            <View style={styles.tabContentRow}>
              <Text style={[styles.tabBtnText, activeTab === 0 && styles.tabBtnTextActive]}>Recent</Text>
              {unreadRecentCount > 0 && (
                <View style={styles.notificationCircle}>
                  <Text style={styles.notificationCount}>{unreadRecentCount > 99 ? '99+' : unreadRecentCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]} 
            onPress={() => switchTab(1)}
          >
            <View style={styles.tabContentRow}>
              <Text style={[styles.tabBtnText, activeTab === 1 && styles.tabBtnTextActive]}>Announcements</Text>
              {unreadAnnCount > 0 && (
                <View style={styles.notificationCircle}>
                  <Text style={styles.notificationCount}>{unreadAnnCount > 99 ? '99+' : unreadAnnCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Horizontal Paging Area inside the main ScrollView to eliminate gaps */}
        <View style={{ width: width, marginLeft: -20, marginTop: 15 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {/* Recent Slide */}
            <View style={{ width: width, paddingHorizontal: 20 }}>
              <View style={styles.feedContainer}>
                {recentUpdates.length === 0 ? (
                  <View style={styles.emptyFeed}>
                    <MaterialCommunityIcons name="check-all" size={40} color={Colors.border} />
                    <Text style={styles.emptyText}>Nothing recent to show.</Text>
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {recentUpdates.map((item, index) => (
                      <TouchableOpacity key={item.id + index} style={[styles.feedItem, !item.isRead && styles.feedItemUnread]} onPress={() => handlePressItem(item)}>
                        <View style={[styles.feedIconBox, { backgroundColor: item.color + '20' }]}>
                          <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                        </View>
                        <View style={styles.feedContent}>
                          <Text style={[styles.feedTitle, !item.isRead && styles.feedTitleUnread]}>{item.title}</Text>
                          <Text style={styles.feedDesc} numberOfLines={1}>{item.desc}</Text>
                        </View>
                        {!item.isRead && <View style={styles.unreadDot} />}
                        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.border} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Announcements Slide */}
            <View style={{ width: width, paddingHorizontal: 20 }}>
              <View style={styles.feedContainer}>
                {announcements.length === 0 ? (
                  <View style={styles.emptyFeed}>
                    <MaterialCommunityIcons name="bullhorn-outline" size={40} color={Colors.border} />
                    <Text style={styles.emptyText}>No pending actions or announcements.</Text>
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {announcements.map((item, index) => (
                      <TouchableOpacity key={item.id || index} style={[styles.feedItem, !item.isRead && styles.feedItemUnread]} onPress={() => handlePressItem(item)}>
                        <View style={[styles.feedIconBox, { backgroundColor: item.color + '20' }]}>
                          <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                        </View>
                        <View style={styles.feedContent}>
                          <Text style={[styles.feedTitle, !item.isRead && styles.feedTitleUnread]}>{item.title}</Text>
                          <Text style={styles.feedDesc} numberOfLines={2}>{item.desc}</Text>
                        </View>
                        {!item.isRead && <View style={styles.unreadDot} />}
                        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.border} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

      </ScrollView>

      {/* Receipt Modal */}
      <Modal visible={receiptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptPaper}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              {selectedReceipt && (() => {
                const isPaidReceipt = selectedReceipt.status === 'paid';
                const receiptDate = new Date(selectedReceipt.dateSent || selectedReceipt.datePaid || selectedReceipt.date || 0);
                
                let previousCharges = 0;
                billsData.forEach(b => {
                  const bDate = new Date(b.dateSent || 0);
                  if (b.id !== selectedReceipt.id && bDate < receiptDate && b.status !== 'paid') {
                    previousCharges += parseFloat(b.amount || 0);
                  }
                });

                const currentCharges = isPaidReceipt ? 0 : parseFloat(selectedReceipt.amount || 0);
                const paymentsReceived = isPaidReceipt ? parseFloat(selectedReceipt.amount || 0) : 0;
                
                // If it's a paid receipt, they paid the total amount due at that time.
                // But for simplicity in this view, a paid receipt shows 0 total due.
                const remainingBalance = previousCharges;
                const totalAmountDue = isPaidReceipt ? 0 : (currentCharges + remainingBalance);
                
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
                        <View style={styles.rGridCell}><Text style={styles.rGridCellText}>{receiptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text></View>
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
                      <Text style={styles.rCalcLabel}>Less: Payments Received - Thank You!</Text>
                      <Text style={styles.rCalcValue}>₱{paymentsReceived.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.rCalcRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 5 }]}>
                      <Text style={[styles.rCalcLabel, {fontFamily: 'Inter_700Bold'}]}>Remaining Balance</Text>
                      <Text style={[styles.rCalcValue, {fontFamily: 'Inter_700Bold'}]}>₱{remainingBalance.toFixed(2)}</Text>
                    </View>
                    
                    <Text style={[styles.rCalcSectionTitle, {marginTop: 20}]}>B. Current Charges</Text>
                    <View style={styles.rCalcRow}>
                      <Text style={styles.rCalcLabel}>Monthly Service Fee ({selectedReceipt.plan || selectedReceipt.period || selectedReceipt.billingMonth})</Text>
                      <Text style={styles.rCalcValue}>₱{currentCharges.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.rCalcRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 5 }]}>
                      <Text style={[styles.rCalcLabel, {fontFamily: 'Inter_700Bold'}]}>Total Current Charges</Text>
                      <Text style={[styles.rCalcValue, {fontFamily: 'Inter_700Bold'}]}>₱{currentCharges.toFixed(2)}</Text>
                    </View>
                    
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: '#fff',
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
    color: Colors.primary,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  
  /* Box 1: Profile Card */
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    color: Colors.primary,
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    color: '#fff',
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
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 15,
  },
  mottoText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
  },

  /* Box 2: Account Details Card */
  accountGridCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridBox: {
    flex: 1,
    justifyContent: 'center',
  },
  gridDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  gridIcon: {
    marginBottom: 10,
    opacity: 0.8,
  },
  gridLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 6,
  },
  gridValue: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.5,
  },

  /* Tabs */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: Colors.card,
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
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tabBtnTextActive: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },

  /* Feeds */
  feedContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  emptyFeed: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginTop: 15,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  feedItemUnread: {
    backgroundColor: 'rgba(255,255,255,0.02)',
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
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  feedTitleUnread: {
    fontFamily: 'Inter_700Bold',
  },
  feedDesc: {
    color: Colors.textMuted,
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
  receiptPaper: { backgroundColor: '#fff', borderRadius: 8, width: '100%', maxHeight: '90%', overflow: 'hidden' },
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
  rGridHeader: { flex: 1, backgroundColor: '#1a1a1a', padding: 4, alignItems: 'center', justifyContent: 'center' },
  rGridHeaderText: { color: '#fff', fontSize: 7, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  rGridCell: { flex: 1, padding: 4, borderBottomWidth: 1, borderBottomColor: '#ddd', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  rGridCellText: { color: '#333', fontSize: 9, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  rAcctLine: { fontSize: 11, color: '#333', marginBottom: 20 },
  rBillSummaryBadge: { backgroundColor: '#1a1a1a', color: '#fff', paddingVertical: 4, paddingHorizontal: 15, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  rCalculationsBox: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 20 },
  rCalcSectionTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#1a1a1a', marginBottom: 10 },
  rCalcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingLeft: 10 },
  rCalcLabel: { fontSize: 11, color: '#444', fontFamily: 'Inter_400Regular' },
  rCalcValue: { fontSize: 11, color: '#444', fontFamily: 'Inter_400Regular' },
  rTotalBox: { backgroundColor: '#1a1a1a', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  rTotalText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold' },
  rTotalValue: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  rThankYou: { textAlign: 'center', color: '#555', fontSize: 10, marginBottom: 20, fontStyle: 'italic' },
  rCloseBtn: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, alignItems: 'center' },
  rCloseBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

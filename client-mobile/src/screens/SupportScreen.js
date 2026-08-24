import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SupportScreen({ user, route, navigation }) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'new'
  
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Other');
  const [desc, setDesc] = useState('');
  
  const [tickets, setTickets] = useState([]);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);

  useEffect(() => {
    if (route.params?.prefillCategory) {
      setCategory(route.params.prefillCategory);
      setActiveTab('new');
    }
  }, [route.params?.prefillCategory, route.params?.timestamp]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // If we didn't just come from a route parameter prefill, reset to tickets
      if (!route.params?.prefillCategory && !route.params?.ticketId) {
        setActiveTab('tickets');
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  useEffect(() => {
    if (route.params?.ticketId && tickets.length > 0) {
      const t = tickets.find(x => x.id === route.params.ticketId);
      if (t) {
        setSelectedTicketDetail(t);
        setDetailModalVisible(true);
        navigation.setParams({ ticketId: null });
      }
    }
  }, [route.params?.ticketId, tickets]);

  const fetchTickets = async () => {
    // Real-time listener replaces manual fetch
  };

  useEffect(() => {
    const q = query(collection(db, "reports"), where("userId", "==", user.id));
    const unsub = onSnapshot(q, (repSnap) => {
      const userTickets = [];
      repSnap.forEach(d => {
        userTickets.push({ id: d.id, ...d.data() });
      });
      userTickets.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTickets(userTickets);
    });
    return () => unsub();
  }, [user.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const submitReport = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject.');
      return;
    }
    const addr = user.address || '';
    if (!addr || addr.toLowerCase() === 'none' || addr.toLowerCase() === 'please add address') {
      Alert.alert('Error', 'Please update your service address in the settings before submitting a request.');
      return;
    }

    const todayStr = new Date().toDateString();
    const todaysReports = tickets.filter(t => {
      if (!t.date) return false;
      return new Date(t.date).toDateString() === todayStr;
    });

    if (todaysReports.length >= 3) {
      Alert.alert('Limit Reached', 'You have reached the maximum limit of 3 service requests per day.');
      return;
    }

    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let reportId = 'REQ-';
      for (let i = 0; i < 8; i++) {
        reportId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const payload = {
        reportId,
        userId: user.id,
        accountNumber: user.accountNumber || '-',
        name: user.name || '-',
        facebook: user.facebook || '-',
        phone: user.phone || '-',
        plan: user.plan || user.Plan || '-',
        address: addr,
        subject: subject.trim(),
        category: category,
        description: desc.trim(),
        status: 'Pending',
        date: new Date().toISOString()
      };

      await addDoc(collection(db, "reports"), payload);
      Alert.alert('Success', 'Request submitted successfully!');
      setSubject('');
      setDesc('');
      setCategory('Other');
      setActiveTab('tickets');
      fetchTickets();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit request.');
    }
  };

  const markFixed = async (id) => {
    try {
      const processedDate = new Date().toISOString();
      await updateDoc(doc(db, "reports", id), { status: 'Fixed', processedDate: processedDate });
      fetchTickets();
      setActiveTicket(id);
      setRating(0);
      setFeedback('');
      setRatingModalVisible(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to mark as Done.');
    }
  };

  const submitRating = async () => {
    if (rating < 1) return;
    try {
      await updateDoc(doc(db, "reports", activeTicket), {
        rating: rating,
        feedback: feedback
      });
      setRatingModalVisible(false);
      fetchTickets();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit rating.');
    }
  };

  const deleteTicket = async (id) => {
    Alert.alert(
      "Delete Ticket",
      "Are you sure you want to delete this pending ticket?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "reports", id));
              fetchTickets();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete ticket.');
            }
          }
        }
      ]
    );
  };

  const renderTickets = () => {
    if (tickets.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={60} color={colors.border} />
          <Text style={styles.emptyTitle}>No support tickets</Text>
          <Text style={styles.emptyDesc}>You haven't created any service requests yet.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('new')}>
            <Text style={styles.emptyBtnText}>Create a Request</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return tickets.map(t => (
      <TouchableOpacity key={t.id} style={styles.ticketCard} onPress={() => { setSelectedTicketDetail(t); setDetailModalVisible(true); }}>
        <View style={styles.ticketTop}>
          <Text style={styles.ticketId}>{t.reportId || '-'}</Text>
          <View style={[styles.badge, 
            t.status === 'Read' ? {backgroundColor: 'rgba(16,185,129,0.1)'} : 
            t.status === 'Fixed' ? {backgroundColor: 'rgba(99,102,241,0.1)'} : 
            {backgroundColor: 'rgba(245,158,11,0.1)'}
          ]}>
            <Text style={[styles.badgeText, 
              t.status === 'Read' ? {color: '#10b981'} : 
              t.status === 'Fixed' ? {color: '#6366f1'} : 
              {color: '#f59e0b'}
            ]}>{t.status}</Text>
          </View>
        </View>
        <Text style={styles.ticketSubject}>{t.subject || 'No Subject'}</Text>
        <View style={styles.ticketMetaRow}>
          <MaterialCommunityIcons name="folder-outline" size={14} color={colors.textMuted} />
          <Text style={styles.ticketCat}>{t.category || '-'}</Text>
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMuted} style={{marginLeft: 15}} />
          <Text style={styles.ticketDate}>{new Date(t.date).toLocaleDateString()}</Text>
        </View>
        

        {(t.status === 'Pending' || !t.status) && (
          <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#e53935' }]} onPress={(e) => { e.stopPropagation(); deleteTicket(t.id); }}>
            <MaterialCommunityIcons name="delete-outline" size={16} color="#fff" />
            <Text style={styles.btnActionText}>Delete</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    ));
  };

  const renderNewRequest = () => {
    const currentPlan = user.Plan || user.plan || '';
    let currentSpeed = 0;
    const match = currentPlan.match(/(\d+)\s*Mbps/i);
    if (match) {
      currentSpeed = parseInt(match[1]);
    } else {
      const n = currentPlan.toLowerCase();
      if (n.includes('starter') || n.includes('800')) currentSpeed = 30;
      else if (n.includes('value') || n.includes('1000')) currentSpeed = 50;
      else if (n.includes('family') || n.includes('1300')) currentSpeed = 70;
      else if (n.includes('pro') || n.includes('1500')) currentSpeed = 100;
      else if (n.includes('extreme') || n.includes('2000')) currentSpeed = 200;
    }

    return (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Submit a Request</Text>
        <Text style={styles.formDesc}>Our support team will get back to you as soon as possible.</Text>
  
        <Text style={styles.label}>Subject</Text>
        <TextInput 
          style={styles.input} 
          placeholder="E.g., Internet is slow" 
          placeholderTextColor={colors.textMuted}
          value={subject}
          onChangeText={setSubject}
        />
  
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(val) => setCategory(val)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Other" value="Other" />
            <Picker.Item label="Billing" value="Billing" />
            <Picker.Item label="Repair" value="Repair" />
            {(currentSpeed === 0 || currentSpeed < 200) && <Picker.Item label="Upgrade internet" value="Upgrade internet" />}
            {(currentSpeed === 0 || currentSpeed > 30) && <Picker.Item label="Other Plan" value="Other Plan" />}
          </Picker>
        </View>
  
        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
          placeholder="Please provide as much detail as possible..." 
          placeholderTextColor={colors.textMuted}
          multiline
          value={desc}
          onChangeText={setDesc}
        />
  
        <TouchableOpacity 
          style={[styles.btnPrimary, !(user.email && user.phone && user.address && user.facebook) && { opacity: 0.5, backgroundColor: colors.border }]} 
          onPress={submitReport}
          disabled={!(user.email && user.phone && user.address && user.facebook)}
        >
          <Text style={styles.btnPrimaryText}>{!(user.email && user.phone && user.address && user.facebook) ? 'Missing Profile Details' : 'Submit Request'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Decor */}
      <View style={[styles.bgDecorCircle, styles.bgDecor1]} />
      <View style={[styles.bgDecorCircle, styles.bgDecor2]} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Support Center</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tickets' && styles.tabActive]}
          onPress={() => setActiveTab('tickets')}
        >
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.tabTextActive]}>My Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'new' && styles.tabActive]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>New Request</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'tickets' ? renderTickets() : renderNewRequest()}
      </ScrollView>

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate your experience</Text>
            <Text style={styles.modalDesc}>How was the support you received for this ticket?</Text>
            
            <View style={styles.starsContainer}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <MaterialCommunityIcons 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={40} 
                    color={star <= rating ? "#fbbf24" : "#334155"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top', width: '100%' }]} 
              placeholder="Any additional feedback? (Optional)" 
              placeholderTextColor={colors.textMuted}
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnPrimary, { flex: 1, opacity: rating > 0 ? 1 : 0.5 }]} onPress={submitRating} disabled={rating < 1}>
                <Text style={styles.btnPrimaryText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnOutline, { flex: 1, marginLeft: 10 }]} onPress={() => setRatingModalVisible(false)}>
                <Text style={styles.btnOutlineText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal visible={detailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTicketDetail && (() => {
              const activeRec = tickets.find(t => t.id === selectedTicketDetail.id) || selectedTicketDetail;
              return (
              <ScrollView style={{ width: '100%', maxHeight: 450 }} showsVerticalScrollIndicator={false}>
                
                <View style={styles.detailHeader}>
                  <Text style={styles.modalTitle}>Ticket Details</Text>
                  <Text style={styles.detailHeaderId}>{activeRec.reportId}</Text>
                </View>
                
                <View style={{ marginBottom: 20 }}>
                  <View style={styles.detailStatusBadge}>
                    <Text style={[styles.detailStatusText, { color: activeRec.status === 'Fixed' || activeRec.status === 'Done' ? '#6366f1' : activeRec.status === 'Read' ? '#10b981' : '#f59e0b' }]}>
                      STATUS: {activeRec.status}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.detailLabel}>Subject</Text>
                      <Text style={styles.detailValue}>{activeRec.subject}</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{activeRec.category}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.detailLabel}>Description</Text>
                  <View style={styles.detailDescBox}>
                    <Text style={styles.detailValueText}>{activeRec.description}</Text>
                  </View>
                  
                  <Text style={styles.detailDateText}>Date Submitted: {new Date(activeRec.date).toLocaleString()}</Text>
                </View>
              </ScrollView>
              );
            })()}
            <TouchableOpacity style={[styles.btnPrimary, { width: '100%' }]} onPress={() => setDetailModalVisible(false)}>
              <Text style={styles.btnPrimaryText}>Close Details</Text>
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
  header: { padding: 20, paddingBottom: 10 },
  title: { color: colors.text, fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  tabText: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  tabTextActive: { color: colors.text },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: colors.text, fontSize: 18, fontFamily: 'Inter_600SemiBold', marginTop: 20, marginBottom: 5 },
  emptyDesc: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 30 },
  emptyBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30 },
  emptyBtnText: { color: colors.text, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  ticketCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: colors.border },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketId: { color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  ticketSubject: { color: colors.text, fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  ticketMetaRow: { flexDirection: 'row', alignItems: 'center' },
  ticketCat: { color: colors.textMuted, fontSize: 13, fontFamily: 'Inter_500Medium', marginLeft: 4 },
  ticketDate: { color: colors.textMuted, fontSize: 13, fontFamily: 'Inter_500Medium', marginLeft: 4 },
  btnAction: { backgroundColor: colors.primary, flexDirection: 'row', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  btnActionText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold', marginLeft: 6 },
  formContainer: { backgroundColor: colors.card, padding: 25, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  formTitle: { color: colors.text, fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 5 },
  formDesc: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 25 },
  label: { color: colors.text, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 10, color: colors.text, padding: 15, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 20 },
  pickerContainer: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 10, marginBottom: 20, overflow: 'hidden' },
  picker: { color: colors.text, height: 50 },
  btnPrimary: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.card, borderRadius: 24, padding: 30, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  modalTitle: { color: colors.text, fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  modalDesc: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 25, textAlign: 'center' },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25, gap: 5 },
  modalActions: { flexDirection: 'row', width: '100%', marginTop: 10 },
  btnOutline: { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnOutlineText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  detailValue: { color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  detailHeaderId: { color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_600SemiBold', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  detailStatusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  detailStatusText: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  detailDescBox: { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: 15, borderRadius: 12, marginTop: 5, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  detailValueText: { color: colors.text, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  detailDateText: { color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center', marginTop: 10 },
});

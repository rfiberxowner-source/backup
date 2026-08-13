import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, RefreshControl, TouchableOpacity, Modal, Dimensions, Alert, ActivityIndicator, Animated, Easing, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

// Try to load MediaLibrary - works in APK builds but not in Expo Go
let MediaLibrary = null;
try {
  MediaLibrary = require('expo-media-library');
} catch (e) {
  // Not available in Expo Go, will fall back to sharing
}

import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, doc, getDoc, updateDoc, addDoc, onSnapshot, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';
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
  const [isSharing, setIsSharing] = useState(false);

  // AI Scanner States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [aiTimer, setAiTimer] = useState(10);
  const [isFraud, setIsFraud] = useState(false);

  const scrollRef = React.useRef(null);
  const mainScrollRef = React.useRef(null);
  const laserAnim = React.useRef(new Animated.Value(0)).current;
  const lastTap = React.useRef(null);
  const tapTimeout = React.useRef(null);
  const [showFullQRModal, setShowFullQRModal] = useState(false);

  const [showScreenshotRules, setShowScreenshotRules] = useState(false);
  const screenshotRulesAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user?.id) return;
    const unsub = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Only show if they HAVE completed the onboarding tutorial, to prevent interrupting the tutorial flow
        if ((data.hasSeenBillingScreenshotRules === undefined || data.hasSeenBillingScreenshotRules === false) && data.hasSeenTutorial === true) {
          setShowScreenshotRules(true);
          Animated.spring(screenshotRulesAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start();
        }
      }
    });
    return () => unsub();
  }, [user?.id]);

  const closeScreenshotRules = async () => {
    Animated.timing(screenshotRulesAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(async () => {
      setShowScreenshotRules(false);
      try {
        if (user?.id) {
          await updateDoc(doc(db, "users", user.id), { hasSeenBillingScreenshotRules: true });
        }
      } catch (e) {
        console.error("Error updating rules status:", e);
      }
    });
  };

  const openScreenshotRules = () => {
    setShowScreenshotRules(true);
    screenshotRulesAnim.setValue(0);
    Animated.spring(screenshotRulesAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start();
  };

  const handleSaveToGallery = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const asset = Asset.fromModule(require('../../assets/gkas.jpg'));
      await asset.downloadAsync();
      const sourceUri = asset.localUri || asset.uri;

      if (!sourceUri) {
        Alert.alert('Error', 'Could not load the QR code image.');
        setIsSharing(false);
        return;
      }

      if (MediaLibrary) {
        // APK build: save directly to gallery, no picker needed
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Please grant storage permissions to save the QR code.');
          setIsSharing(false);
          return;
        }

        // Download the asset to a guaranteed local file path
        const destPath = FileSystem.cacheDirectory + 'gcash_qr_' + Date.now() + '.jpg';
        await FileSystem.downloadAsync(sourceUri, destPath);
        await MediaLibrary.saveToLibraryAsync(destPath);
        Alert.alert('Saved!', 'GCash QR code has been saved to your gallery.');
      } else {
        // Expo Go fallback: use share sheet
        const Sharing = require('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(sourceUri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Save GCash QR Code',
            UTI: 'public.jpeg'
          });
        } else {
          Alert.alert('Unavailable', 'Saving is not available on this device.');
        }
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save the image: ' + (error.message || error));
    } finally {
      setIsSharing(false);
    }
  };

  const handleQRTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      clearTimeout(tapTimeout.current);
      lastTap.current = null;
      handleSaveToGallery();
    } else {
      lastTap.current = now;
      tapTimeout.current = setTimeout(() => {
        lastTap.current = null;
        // Do nothing on single tap (removed enlarge function)
      }, DOUBLE_PRESS_DELAY);
    }
  };

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      laserAnim.setValue(0);
    }
  }, [isAnalyzing, laserAnim]);

  const handleUploadImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Prevent users from cropping out EXIF metadata
      quality: 0.8,
      base64: true,
      exif: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setUploadedImage(asset.uri);
      processReceiptImage(asset);
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
        const b = d.data();
        let status = (b.status || 'Pending').toLowerCase();
        if (status === 'unread') status = 'pending';
        let isOverdue = false;
        if (status !== 'paid' && status !== 'completed' && b.dueDate) {
          const dueDate = new Date(b.dueDate);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);
          if (now > dueDate) {
            status = 'overdue';
            isOverdue = true;
            b.status = 'overdue';
          }
        }
        if (isOverdue && (d.data().status || '').toLowerCase() !== 'overdue') {
          updateDoc(doc(db, "users", user.id, "billing_emails", d.id), {
            status: 'Overdue'
          }).catch(e => console.log(e));
        }
        bList.push({ id: d.id, ...b });
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

  useEffect(() => {
    let interval = null;
    if (showAIModal && aiTimer > 0) {
      interval = setInterval(() => setAiTimer(prev => prev - 1), 1000);
    } else if (showAIModal && aiTimer === 0) {
      setShowAIModal(false);
    }
    return () => clearInterval(interval);
  }, [showAIModal, aiTimer]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setShowGcashDropdown(false);
      setActiveTab(0);
      setUploadedImage(null);
      setExtractedData(null);
      setIsFraud(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: 0, animated: false });
        mainScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
    });
    return unsubscribe;
  }, [navigation]);

  const processReceiptImage = async (asset) => {
    setIsAnalyzing(true);
    setIsFraud(false);

    // --- 1. Fraud Detection (EXIF Metadata) ---
    let isForged = false;
    let fraudReason = '';

    if (asset.exif) {
      if (asset.exif.Software && asset.exif.Software.trim() !== '') {
        const softwareField = String(asset.exif.Software).toLowerCase();
        const blacklist = [
          'photoshop', 'illustrator', 'lightroom', 'coreldraw', 'gimp', 'affinity', 'capture one',
          'canva', 'photopea', 'figma', 'pixlr', 'fotor', 'befunky',
          'snapseed', 'picsart', 'vsco', 'facetune', 'b612', 'remini', 'lightleap', 'photodirector', 'polarr',
          'gemini', 'midjourney', 'dall-e', 'openai', 'google', 'imagen', 'ai-generated', 'stable diffusion', 'runway', 'leonardo', 'firefly', 'bing',
          'skia', 'cairo', 'puppeteer', 'phantomjs', 'html2canvas', 'dom-to-image', 'selenium', 'fakereceipt', 'receiptmaker', 'express-expense'
        ];

        const isBlacklisted = blacklist.some(badSoftware => softwareField.includes(badSoftware));

        if (isBlacklisted) {
          isForged = true;
          fraudReason = `Metadata Manipulation Detected! Image was processed with external software: ${asset.exif.Software}`;
        }
      }
    }

    if (isForged) {
      setIsAnalyzing(false);
      setIsFraud(true);
      Alert.alert("🚨 FRAUD DETECTED 🚨", fraudReason + "\n\nThis transaction has been blocked.");
      return;
    }

    // --- 2. Gemini AI Visual Extraction & Forensics ---
    try {
      let apiKey = '';
      try {
        const apiKeyDoc = await getDoc(doc(db, 'settings', 'apiKeys'));
        if (apiKeyDoc.exists() && apiKeyDoc.data().gemini) apiKey = apiKeyDoc.data().gemini;
      } catch (dbErr) { console.warn("Could not fetch API key", dbErr); }

      if (!apiKey) throw new Error('Gemini API Key missing');

      const prompt = `You are an expert computer vision, document forensics, and OCR data extraction model.
I need you to scan this GCash receipt image and do two things:

TASK 1 - FORENSIC ANALYSIS:
Look closely at the fonts, the spacing between words, and the background color behind the numbers. Does the font perfectly match a standard GCash font? Does it look like someone pasted text over the original? Does the alignment look slightly off? If you see clear signs of visual editing or mismatched fonts, set isForged to true and explain why in forgeryReason. If it looks like a clean, unedited screenshot, set isForged to false.

TASK 2 - DATA EXTRACTION:
Extract text for these specific fields:
1. "referenceNumber": The 13-digit Reference No.
2. "amount": Transacted amount (e.g. "PHP 500.00")
3. "payerName": Sender name (or "N/A" if missing)
4. "receiverName": Recipient name
5. "datePaid": Date. MUST be perfectly formatted as "Month DD, YYYY" (e.g., "January 05, 2026"). ALWAYS include the full year. If year is missing on receipt, infer current year.
6. "timePaid": Time (e.g. "03:53 PM"). MUST include AM/PM.
7. "phoneNumber": Mobile number
8. "rawTimestamp": The exact date and time formatted strictly in ISO 8601 format (e.g., "2026-01-05T15:53:00"). This is required for system math.

Return a JSON with exactly this structure and no markdown formatting:
{
  "isForged": false,
  "forgeryReason": "",
  "referenceNumber": "...",
  "amount": "...",
  "payerName": "...",
  "receiverName": "...",
  "datePaid": "...",
  "timePaid": "...",
  "phoneNumber": "...",
  "rawTimestamp": "..."
}
If a field is not found, return "TBD".`;

      const payload = {
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: asset.base64 } },
            { text: prompt }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(await response.text());
      const jsonRes = await response.json();

      const extractedDataObj = JSON.parse(jsonRes.candidates[0].content.parts[0].text);
      extractedDataObj.exifData = asset.exif ? JSON.stringify(asset.exif) : 'None';

      // Check Visual AI Fraud Flag
      if (extractedDataObj.isForged) {
        setIsAnalyzing(false);
        setUploadedImage(null);
        Alert.alert("🚨 FRAUD DETECTED 🚨", `Visual Forensics Analysis failed:\n\n${extractedDataObj.forgeryReason}\n\nThis transaction has been blocked.`);
        return;
      }

      // Validation (receiverName temporarily disabled per user request)
      const requiredFields = ['referenceNumber', 'amount', 'datePaid', 'timePaid', 'phoneNumber'];
      const hasTBD = requiredFields.some(f => extractedDataObj[f] === 'TBD' || !extractedDataObj[f]);

      const cleanRefNo = String(extractedDataObj.referenceNumber).replace(/[^0-9]/g, '');
      if (cleanRefNo.length !== 13 && cleanRefNo.length > 5) {
        Alert.alert("🚨 FRAUD DETECTED 🚨", "Invalid GCash Reference Number length. It must be exactly 13 digits.");
        setIsAnalyzing(false);
        return;
      }

      // --- 4. Receiver Name Fraud Check ---
      if (extractedDataObj.receiverName !== 'TBD' && !extractedDataObj.receiverName.match(/^RE[\.\*•]+L\s*B\.?$/i)) {
        Alert.alert("🚨 FRAUD DETECTED 🚨", `This receipt was sent to an unauthorized receiver: "${extractedDataObj.receiverName}". All payments must be sent to the official company GCash account (RE****L B.).`);
        setIsAnalyzing(false);
        setUploadedImage(null);
        return;
      }

      // --- 5. Time Proximity Fraud Check (24-Hour Rule) ---
      let dateToParse = extractedDataObj.rawTimestamp;
      if (!dateToParse && extractedDataObj.datePaid && extractedDataObj.datePaid !== 'TBD' && extractedDataObj.datePaid.toLowerCase() !== 'today') {
        dateToParse = extractedDataObj.datePaid;
        if (extractedDataObj.timePaid && extractedDataObj.timePaid !== 'TBD') {
          dateToParse += ' ' + extractedDataObj.timePaid;
        }
      }
      if (dateToParse) {
        const parsedDate = new Date(dateToParse);
        if (!isNaN(parsedDate.getTime())) {
          const diffHours = (new Date() - parsedDate) / (1000 * 60 * 60);
          if (diffHours > 24 || diffHours < -24) {
            Alert.alert("🚨 FRAUD DETECTED 🚨", "This receipt is too old! Receipts must be uploaded within 24 hours of payment to prevent reuse. If you have a problem with the 24-hour rule, please try contacting support.");
            setIsAnalyzing(false);
            setUploadedImage(null);
            return;
          }
        } else {
          console.warn("Could not parse timestamp for 24-hour check:", dateToParse);
        }
      }

      // --- 5. Database Fraud Detection (Duplicate Checks) ---
      if (cleanRefNo && cleanRefNo !== 'TBD') {
        const receiptsRef = collection(db, 'receipts');
        const q = query(receiptsRef, where("referenceNumber", "==", extractedDataObj.referenceNumber));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          Alert.alert("🚨 FRAUD DETECTED 🚨", "This Reference Number has already been submitted! Submitting duplicate reference numbers is strictly prohibited.");
          setIsAnalyzing(false);
          setUploadedImage(null);
          return;
        }
      }

      // --- 6. Amount Validation ---
      const extractedAmount = parseFloat(String(extractedDataObj.amount).replace(/[^0-9\.]/g, ''));
      let expectedAmount = parseFloat(totalBalance) || 0;

      const unpaidBillsList = bills.filter(b => b.status !== 'paid');
      // Sort oldest to newest
      unpaidBillsList.sort((a, b) => new Date(a.dateSent || 0) - new Date(b.dateSent || 0));

      if (extractedAmount > 0) {
        let isValid = false;

        // Check if it exactly matches the TOTAL balance
        if (expectedAmount > 0 && extractedAmount === expectedAmount) {
          isValid = true;
        }
        // Check if it exactly matches the oldest SINGLE bill
        else if (unpaidBillsList.length > 0) {
          const oldestBillAmt = parseFloat(unpaidBillsList[0].amount || 0);
          if (oldestBillAmt > 0 && extractedAmount === oldestBillAmt) {
            isValid = true;
          }
        }

        if (!isValid) {
          let errorMsg = `Your receipt is for ₱${extractedAmount}. `;
          if (unpaidBillsList.length > 1) {
            errorMsg += `You have multiple unpaid bills. You must pay exactly ₱${parseFloat(unpaidBillsList[0].amount || 0)} (for the oldest month) OR exactly ₱${expectedAmount} (for the total balance).`;
          } else {
            errorMsg += `Your required balance is exactly ₱${expectedAmount}. Partial payments or overpayments are not accepted.`;
          }
          Alert.alert("🚨 INVALID AMOUNT 🚨", errorMsg);
          setIsAnalyzing(false);
          setUploadedImage(null);
          return;
        }
      }

      if (hasTBD) {
        const missingFields = requiredFields.filter(f => extractedDataObj[f] === 'TBD' || !extractedDataObj[f]).join(', ');
        Alert.alert("Missing Details", `Could not extract the following required fields: ${missingFields}.\n\nOCR Read: ${singleLineText.substring(0, 100)}...`);
        setIsAnalyzing(false);
        return;
      }

      setExtractedData(extractedDataObj);
      setAiTimer(10);

      // Auto-save data immediately upon successful analysis
      const amtStr = extractedDataObj.amount ? String(extractedDataObj.amount).replace(/[^0-9\.]/g, '') : '0';
      const unpaidBillId = bills.find(b => b.status !== 'paid')?.id || null;
      await markAsPaid(unpaidBillId, amtStr, extractedDataObj);

      // Clear the image from the GCash box so it doesn't persist
      setUploadedImage(null);

      setShowAIModal(true);
      setIsAnalyzing(false);

    } catch (e) {
      setIsAnalyzing(false);
      Alert.alert("OCR Error", "Failed to parse receipt. Please try again. " + e.message);
    }
  };

  const switchTab = (index) => {
    setActiveTab(index);
    setUploadedImage(null);
    setExtractedData(null);
    setIsFraud(false);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveTab(index);
    setUploadedImage(null);
    setExtractedData(null);
    setIsFraud(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const markAsPaid = async (billId, amount, receiptData = null) => {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let refId = 'REF-';
      for (let i = 0; i < 8; i++) {
        refId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const bill = billId ? bills.find(b => b.id === billId) : null;
      const planStr = bill?.plan || user.plan_price || user.planPrice || user.price || user.monthlyFee || user.plan || '-';

      const now = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const bMonth = bill?.period || bill?.billingMonth || `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      // 1. Add to payments collection first
      await addDoc(collection(db, "payments"), {
        userId: user.id,
        accountNumber: user.accountNumber || '-',
        name: user.name || 'User',
        amount: parseFloat(amount),
        plan: planStr,
        billingMonth: bMonth,
        period: bMonth,
        dueDate: bill?.dueDate || '',
        datePaid: now.toISOString(),
        date: now.toISOString(),
        referenceId: refId,
        method: 'Online',
        status: 'Completed'
      });

      // 2. Add to receipts collection if applicable
      if (receiptData) {
        await addDoc(collection(db, "receipts"), {
          clientName: user.name || 'Unknown',
          clientAccountNumber: user.accountNumber || 'Unknown',
          billingMonth: bMonth,
          status: "Pending Verification",
          timestamp: serverTimestamp(),
          amount: String(receiptData.amount || 'TBD'),
          referenceNumber: receiptData.referenceNumber || 'TBD',
          receiverName: receiptData.receiverName || 'TBD',
          phoneNumber: receiptData.phoneNumber || 'TBD',
          payerName: receiptData.payerName || 'N/A',
          datePaid: receiptData.datePaid || 'TBD',
          timePaid: receiptData.timePaid || 'TBD',
          expressNotif: receiptData.expressNotif || 'No',
          formatType: receiptData.formatType || 'UNKNOWN',
          exifData: receiptData.exifData || 'None',
          imageHash: "N/A"
        });
      }

      // 3. Process unpaid bills (delete if fully paid)
      const paidAmt = parseFloat(amount);
      let remainingAmt = paidAmt;
      const unpaidBillsList = bills.filter(b => b.status !== 'paid');
      unpaidBillsList.sort((a, b) => new Date(a.dateSent || 0) - new Date(b.dateSent || 0));

      for (const unpaidBill of unpaidBillsList) {
        if (remainingAmt <= 0) break;

        const billExpected = parseFloat(unpaidBill.amount || 0);
        if (billExpected <= 0) continue;

        if (remainingAmt >= billExpected) {
          // Fully paid: Delete the document from billing_emails
          await deleteDoc(doc(db, "users", user.id, "billing_emails", unpaidBill.id));
          remainingAmt -= billExpected;
        } else {
          // Partially paid: Update amount
          await updateDoc(doc(db, "users", user.id, "billing_emails", unpaidBill.id), {
            status: 'partially_paid',
            amount: billExpected - remainingAmt,
            datePaid: new Date().toISOString()
          });
          remainingAmt = 0;
        }
      }

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
            <Text style={[styles.heroGridValue, { color: '#E53935' }]}>₱{totalBalance}</Text>
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
            const pStr = userPlan.toLowerCase();
            if (pStr.includes('200mbps') || pStr.includes('200 mbps')) baseAmount = 3500;
            else if (pStr.includes('100mbps') || pStr.includes('100 mbps')) baseAmount = 2500;
            else if (pStr.includes('70mbps') || pStr.includes('70 mbps')) baseAmount = 2000;
            else if (pStr.includes('50mbps') || pStr.includes('50 mbps')) baseAmount = 1500;
            else if (pStr.includes('30mbps') || pStr.includes('30 mbps')) baseAmount = 1000;
          }
          return (
            <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 5 }}>Current Plan Amount</Text>
              <Text style={{ color: '#10b981', fontSize: 24, fontFamily: 'Inter_700Bold' }}>₱{baseAmount.toFixed(2)}</Text>
            </View>
          );
        })()}

        <TouchableOpacity
          style={styles.payButton}
          onPress={() => mainScrollRef.current?.scrollToEnd({ animated: true })}
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
                          <View style={{
                            width: 38, height: 50,
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            marginRight: 15,
                            padding: 4,
                            justifyContent: 'flex-start',
                            borderWidth: 1,
                            borderColor: '#e2e8f0',
                            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                              <View style={{ width: 6, height: 6, backgroundColor: colors.primary, borderRadius: 1, marginRight: 3 }} />
                              <View style={{ width: 14, height: 2, backgroundColor: '#94a3b8', borderRadius: 1 }} />
                            </View>
                            <View style={{ height: 1.5, width: '100%', backgroundColor: '#cbd5e1', marginBottom: 3 }} />
                            <View style={{ height: 2, width: '90%', backgroundColor: '#cbd5e1', borderRadius: 1, marginBottom: 2 }} />
                            <View style={{ height: 2, width: '60%', backgroundColor: '#cbd5e1', borderRadius: 1, marginBottom: 4 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
                              <View style={{ height: 1.5, width: '40%', backgroundColor: '#e2e8f0' }} />
                              <View style={{ height: 1.5, width: '40%', backgroundColor: '#e2e8f0' }} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                              <View style={{ height: 2.5, width: '35%', backgroundColor: '#cbd5e1' }} />
                              <View style={{ height: 2.5, width: '40%', backgroundColor: '#E53935' }} />
                            </View>
                            <View style={{ height: 4, width: '100%', backgroundColor: '#E53935', borderRadius: 1, marginTop: 'auto' }} />
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
                          <View style={{
                            width: 38, height: 50,
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            marginRight: 15,
                            padding: 4,
                            justifyContent: 'flex-start',
                            borderWidth: 1,
                            borderColor: '#e2e8f0',
                            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                              <View style={{ width: 6, height: 6, backgroundColor: colors.primary, borderRadius: 1, marginRight: 3 }} />
                              <View style={{ width: 14, height: 2, backgroundColor: '#94a3b8', borderRadius: 1 }} />
                            </View>
                            <View style={{ height: 1.5, width: '100%', backgroundColor: '#cbd5e1', marginBottom: 3 }} />
                            <View style={{ height: 2, width: '90%', backgroundColor: '#cbd5e1', borderRadius: 1, marginBottom: 2 }} />
                            <View style={{ height: 2, width: '60%', backgroundColor: '#cbd5e1', borderRadius: 1, marginBottom: 4 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
                              <View style={{ height: 1.5, width: '40%', backgroundColor: '#e2e8f0' }} />
                              <View style={{ height: 1.5, width: '40%', backgroundColor: '#e2e8f0' }} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                              <View style={{ height: 2.5, width: '35%', backgroundColor: '#cbd5e1' }} />
                              <View style={{ height: 2.5, width: '40%', backgroundColor: '#E53935' }} />
                            </View>
                            <View style={{ height: 4, width: '100%', backgroundColor: '#10b981', borderRadius: 1, marginTop: 'auto' }} />
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
              <Text style={styles.methodDetails}>09058395471 (Fiber X)</Text>
            </View>
            <MaterialCommunityIcons name={showGcashDropdown ? "chevron-up" : "chevron-down"} size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {showGcashDropdown && (
            <View style={{ backgroundColor: colors.card, padding: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 15, borderWidth: 1, borderTopWidth: 0, borderColor: colors.border, alignItems: 'center' }}>
              <TouchableOpacity activeOpacity={0.8} onPress={handleQRTap}>
                <View style={{ width: 260, height: 260, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: colors.border, marginBottom: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                  <Image source={require('../../assets/gkas.jpg')} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
              </TouchableOpacity>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 20, textAlign: 'center' }}>Double-tap to save</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 10 }}>Scan to Pay</Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 5 }}>Or manually input the number:</Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 20 }}>09058395471</Text>

              {uploadedImage && !isAnalyzing && (
                <View style={{ marginBottom: 15, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 5 }}>Screenshot Preview</Text>
                  <Image source={{ uri: uploadedImage }} style={{ width: 140, height: 200, borderRadius: 12, borderWidth: 1, borderColor: colors.border }} resizeMode="cover" />
                </View>
              )}

              <TouchableOpacity
                style={{ backgroundColor: colors.background, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: colors.border, opacity: (bills.filter(b => b.status !== 'paid').length === 0 || !(user.email && user.phone && user.address && user.facebook)) ? 0.5 : 1 }}
                onPress={handleUploadImage}
                disabled={bills.filter(b => b.status !== 'paid').length === 0 || !(user.email && user.phone && user.address && user.facebook)}
              >
                <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>{!(user.email && user.phone && user.address && user.facebook) ? 'Missing Profile Details' : 'Upload Payment Screenshot'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.methodCard} onPress={() => { }}>
            <MaterialCommunityIcons name="bank" size={30} color="#F37021" />
            <View style={[styles.methodInfo, { flex: 1 }]}>
              <Text style={styles.methodName}>BDO Bank Transfer</Text>
              <Text style={[styles.methodDetails, { fontSize: 11, fontStyle: 'italic' }]}>This payment method is in progress and not available right now</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard} onPress={() => { }}>
            <MaterialCommunityIcons name="bank-transfer" size={30} color="#D7141A" />
            <View style={[styles.methodInfo, { flex: 1 }]}>
              <Text style={styles.methodName}>BPI Online</Text>
              <Text style={[styles.methodDetails, { fontSize: 11, fontStyle: 'italic' }]}>This payment method is in progress and not available right now</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 30, paddingHorizontal: 10, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 }}>
            Encountering issues with the AI receipt scanner? Please contact our <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://www.facebook.com/RFiber1')}>Facebook Page</Text> and submit your receipt directly to customer support so we can manually process your payment.
          </Text>
        </View>

      </ScrollView>

      {/* Paper Receipt Modal for Unpaid Bills */}
      <Modal visible={receiptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptPaper}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              {selectedReceipt && (() => {
                let activeRec = selectedReceipt;
                const pMatch = (payments || []).find(x => x.id === selectedReceipt.id);
                if (pMatch) {
                  let dDate = pMatch.dueDate;
                  if (!dDate && pMatch.billId) {
                    const bMatched = (bills || []).find(b => b.id === pMatch.billId);
                    if (bMatched) dDate = bMatched.dueDate;
                  }
                  if (!dDate && pMatch.billingMonth) {
                    const bMatched = (bills || []).find(b => (b.billingMonth === pMatch.billingMonth) || (b.period === pMatch.billingMonth));
                    if (bMatched) dDate = bMatched.dueDate;
                  }
                  activeRec = { ...pMatch, status: 'paid', collection: 'payments', dueDate: dDate || '' };
                }
                else {
                  const bMatch = (bills || []).find(x => x.id === selectedReceipt.id);
                  if (bMatch) activeRec = bMatch;
                }

                const isPaidReceipt = activeRec.status === 'paid' || activeRec.collection === 'payments';

                const statementDateObj = isPaidReceipt
                  ? new Date(activeRec.datePaid || activeRec.date || activeRec.dateSent || 0)
                  : new Date(activeRec.dateSent || activeRec.date || 0);
                const statementDateStr = statementDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                const allPays = [];
                payments.forEach(p => {
                  let origDateSent = p.dateSent || p.date || p.datePaid || '';
                  if (p.billId) {
                    const bMatch = (bills || []).find(b => b.id === p.billId);
                    if (bMatch && bMatch.dateSent) origDateSent = bMatch.dateSent;
                  }
                  allPays.push({ ...p, isPaidRec: true, sortDate: origDateSent });
                });
                bills.forEach(b => {
                  if (b.status !== 'paid') {
                    allPays.push({ ...b, isPaidRec: false, sortDate: b.dateSent || b.datePaid || b.date || '' });
                  }
                });

                allPays.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));

                const amount = parseFloat(String(activeRec.amount || 0).replace(/[^0-9.]/g, '')) || 0;
                const actualCurrentCharges = amount;

                let baseAmountStr = String(user.amount || user.ammount || user.plan_price || user.planPrice || user.price || user.monthlyFee || 0);
                let baseAmount = parseFloat(baseAmountStr.replace(/[^0-9.]/g, '')) || 0;

                if (baseAmount === 0) {
                  const pStr = String(user.plan || user.Plan || activeRec.plan || '').toLowerCase();
                  if (pStr.includes('200')) baseAmount = 3500;
                  else if (pStr.includes('100')) baseAmount = 2500;
                  else if (pStr.includes('70')) baseAmount = 2000;
                  else if (pStr.includes('50')) baseAmount = 1500;
                  else if (pStr.includes('30')) baseAmount = 1000;
                  else baseAmount = amount > 0 ? amount : 0;
                }

                let prevPaid = true;
                let prevCharges = 0; // Default to 0 for start of records
                const currentIdx = allPays.findIndex(p => p.id === activeRec.id || p.billId === activeRec.id);
                if (currentIdx > 0) {
                  prevPaid = allPays[currentIdx - 1].isPaidRec;
                  if (!prevPaid) {
                    prevCharges = parseFloat(String(allPays[currentIdx - 1].amount).replace(/[^0-9.]/g, '')) || baseAmount;
                  } else {
                    prevCharges = parseFloat(String(allPays[currentIdx - 1].amount).replace(/[^0-9.]/g, '')) || baseAmount;
                  }
                }

                let currentCharges = baseAmount > 0 ? baseAmount : amount;
                let remainingBalance = prevPaid ? 0 : prevCharges;

                let paymentMade = isPaidReceipt ? amount : 0;
                let totalAmountDue = currentCharges + remainingBalance - paymentMade;
                if (totalAmountDue < 0) totalAmountDue = 0;

                if (!isPaidReceipt && activeRec.status === 'partially_paid') {
                  totalAmountDue = parseFloat(String(activeRec.amount || 0).replace(/[^0-9.]/g, '')) || 0;
                }

                let previousCharges = prevCharges;

                let prevPaymentText = prevPaid && prevCharges > 0 ? '₱' + prevCharges.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' CR' : '₱0.00';

                return (
                  <>
                    <View style={styles.rHeader}>
                      <View style={{ width: 200, height: 80 }}>
                        <Image source={require('../../assets/logo2-removebg-preview.png')} style={{ height: 140, width: 300, resizeMode: 'contain', position: 'absolute', left: -30, top: -30 }} />
                      </View>
                      <Text style={styles.rPage}>Page 1 of 1</Text>
                    </View>

                    <View style={styles.rTitleBox}>
                      <Text style={styles.rTitle}>STATEMENT OF ACCOUNT</Text>
                    </View>

                    <View style={styles.rInfoRow}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.rClientName} numberOfLines={2}>{user.name || 'User'}</Text>
                        <Text style={styles.rClientAddress} numberOfLines={3}>{user.address || 'None'}</Text>

                        {(() => {
                          const currentPlan = user.Plan || user.plan || activeRec.plan || '';
                          let currentSpeedStr = '';
                          const match = currentPlan.match(/(\d+)\s*Mbps/i);
                          if (match) {
                            currentSpeedStr = `${match[1]}Mbps`;
                          } else {
                            const n = currentPlan.toLowerCase();
                            if (n.includes('starter') || n.includes('800') || n.includes('3500')) currentSpeedStr = '30Mbps';
                            else if (n.includes('value') || n.includes('1000')) currentSpeedStr = '50Mbps';
                            else if (n.includes('family') || n.includes('1300')) currentSpeedStr = '70Mbps';
                            else if (n.includes('pro') || n.includes('1500')) currentSpeedStr = '100Mbps';
                            else if (n.includes('extreme') || n.includes('2000')) currentSpeedStr = '200Mbps';
                            else currentSpeedStr = currentPlan;
                          }
                          return currentSpeedStr ? (
                            <Text style={{ marginTop: 15, fontSize: 24, fontFamily: 'Inter_700Bold', color: '#1f2937' }}>
                              {currentSpeedStr}
                            </Text>
                          ) : null;
                        })()}
                      </View>
                      <View style={styles.rSummaryGrid}>
                        <View style={styles.rGridRow}>
                          <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>STATEMENT DATE</Text></View>
                          <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>{isPaidReceipt ? 'PAYMENT ID' : 'BILL ID'}</Text></View>
                        </View>
                        <View style={styles.rGridRow}>
                          <View style={styles.rGridCell}><Text style={styles.rGridCellText}>{statementDateStr}</Text></View>
                          <View style={styles.rGridCell}><Text style={[styles.rGridCellText, { fontSize: 8 }]}>{activeRec.id}</Text></View>
                        </View>
                        <View style={styles.rGridRow}>
                          <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>TOTAL AMOUNT DUE</Text></View>
                          <View style={styles.rGridHeader}><Text style={styles.rGridHeaderText}>DUE DATE</Text></View>
                        </View>
                        <View style={styles.rGridRow}>
                          <View style={styles.rGridCell}><Text style={[styles.rGridCellText, { color: '#E53935', fontFamily: 'Inter_700Bold' }]}>₱{totalAmountDue.toFixed(2)}</Text></View>
                          <View style={styles.rGridCell}><Text style={styles.rGridCellText}>{activeRec.dueDate || '-'}</Text></View>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.rAcctLine}><Text style={{ fontFamily: 'Inter_700Bold' }}>Statement of Account Number:</Text> {user.accountNumber || '-'}</Text>

                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
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
                        <Text style={[styles.rCalcLabel, { fontFamily: 'Inter_700Bold' }]}>Remaining Balance from Previous Bill</Text>
                        <Text style={[styles.rCalcValue, { fontFamily: 'Inter_700Bold' }]}>₱{remainingBalance.toFixed(2)}</Text>
                      </View>

                      <Text style={[styles.rCalcSectionTitle, { marginTop: 20 }]}>B. Current Charges</Text>
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

      {/* AI Analysis Real Modal */}
      <Modal visible={showAIModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.9)', justifyContent: 'center', alignItems: 'center' }}>

          <View style={{ position: 'absolute', top: 40, right: 30 }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#10b981', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#10b981', fontSize: 20, fontFamily: 'Inter_700Bold' }}>{aiTimer}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="creation" size={28} color="#f59e0b" style={{ marginRight: 10 }} />
            <Text style={{ color: 'white', fontSize: 22, fontFamily: 'Inter_700Bold' }}>AI Analysis Result</Text>
          </View>

          <View style={{ backgroundColor: '#1e293b', width: '90%', borderRadius: 16, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}>

            <View style={{ backgroundColor: '#0f172a', padding: 15, borderRadius: 12, marginBottom: 15 }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 5 }}>AMOUNT PAID</Text>
              <Text style={{ color: '#10b981', fontSize: 24, fontFamily: 'Inter_700Bold' }}>{extractedData?.amount}</Text>
            </View>

            <View style={{ backgroundColor: '#0f172a', padding: 15, borderRadius: 12, marginBottom: 15 }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 5 }}>REFERENCE NUMBER</Text>
              <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Inter_700Bold' }}>{extractedData?.referenceNumber}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <View style={{ backgroundColor: '#0f172a', padding: 15, borderRadius: 12, flex: 1, marginRight: 5 }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 5 }}>RECEIVER NAME</Text>
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Inter_700Bold' }} numberOfLines={1}>{extractedData?.receiverName}</Text>
              </View>
              <View style={{ backgroundColor: '#0f172a', padding: 15, borderRadius: 12, flex: 1, marginLeft: 5 }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 5 }}>PHONE NUMBER</Text>
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Inter_700Bold' }} numberOfLines={1}>{extractedData?.phoneNumber}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
              <View style={{ backgroundColor: '#0f172a', padding: 15, borderRadius: 12, flex: 1, marginRight: 5 }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 5 }}>EXPRESS NOTIF</Text>
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Inter_700Bold' }} numberOfLines={1}>{extractedData?.expressNotif}</Text>
              </View>
              <View style={{ backgroundColor: '#0f172a', padding: 15, borderRadius: 12, flex: 1, marginLeft: 5 }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 5 }}>DATE PAID</Text>
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Inter_700Bold' }} numberOfLines={1}>{extractedData?.datePaid}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: '#3b82f6', paddingVertical: 15, borderRadius: 12, alignItems: 'center' }}
              onPress={() => setShowAIModal(false)}
            >
              <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter_700Bold' }}>Continue</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* Analyzing Full Screen Modal */}
      <Modal visible={isAnalyzing && !!uploadedImage} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <ActivityIndicator size="small" color="#3b82f6" style={{ marginRight: 10 }} />
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 }}>Analyzing document...</Text>
          </View>
          <View style={{ width: '85%', height: '60%', borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(15,23,42,0.5)' }}>
            <Image source={{ uri: uploadedImage }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            <Animated.View style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: 'rgba(96, 165, 250, 0.8)',
              shadowColor: '#60a5fa',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 5,
              elevation: 3,
              top: laserAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }} />
          </View>
          <Text style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 15 }}>Please wait while our AI runs security and data checks.</Text>
        </View>
      </Modal>

      {/* Full Size QR Modal */}
      <Modal visible={showFullQRModal} transparent={true} animationType="fade" onRequestClose={() => setShowFullQRModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 10 }}
            onPress={() => setShowFullQRModal(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <View style={{ width: '90%', height: '70%', borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
            <Image
              source={require('../../assets/3a8e1b7a-5a09-4f8e-816f-8bcafbdb6703.jpg')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={{ marginTop: 30, backgroundColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}
            onPress={handleSaveToGallery}
          >
            <MaterialCommunityIcons name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>Save to Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Floating Action Button for Rules */}
      <TouchableOpacity
        style={styles.fabRules}
        onPress={openScreenshotRules}
      >
        <MaterialCommunityIcons name="receipt" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Screenshot Guidelines Modal */}
      {showScreenshotRules && (
        <Modal visible={true} transparent={true} animationType="none" hardwareAccelerated>
          <View style={styles.rulesModalOverlay}>
            <Animated.View style={[
              styles.rulesModalContent,
              {
                backgroundColor: colors.card,
                transform: [{ scale: screenshotRulesAnim }],
                opacity: screenshotRulesAnim
              }
            ]}>
              <Text style={styles.rulesModalTitle}>Billing Screenshot Guidelines</Text>

              <View style={styles.rulesImageContainer}>
                <Image
                  source={require('../../assets/tutorial/standard.jpg')}
                  style={styles.rulesImage}
                />
              </View>

              <View style={styles.rulesTextContainer}>
                <View style={styles.ruleItem}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#ef4444" style={styles.ruleIcon} />
                  <Text style={[styles.ruleText, { color: colors.text }]}>Do <Text style={{ fontFamily: 'Inter_700Bold' }}>NOT</Text> alter the image details or block the details.</Text>
                </View>
                <View style={styles.ruleItem}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#ef4444" style={styles.ruleIcon} />
                  <Text style={[styles.ruleText, { color: colors.text }]}>Do <Text style={{ fontFamily: 'Inter_700Bold' }}>NOT</Text> take a picture of another phone.</Text>
                </View>
                <View style={styles.ruleItem}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#ef4444" style={styles.ruleIcon} />
                  <Text style={[styles.ruleText, { color: colors.text }]}>Do <Text style={{ fontFamily: 'Inter_700Bold' }}>NOT</Text> crop the image.</Text>
                </View>

                <View style={styles.rulesAlertBox}>
                  <MaterialCommunityIcons name="shield-alert" size={20} color="#ef4444" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={styles.rulesAlertText}>
                    Failure to upload a clean, standard screenshot will cause our AI and Admin security system to flag the transaction as fraud. Strict compliance ensures fast, error-free processing and protects against automated scams.
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.rulesAcceptBtn} onPress={closeScreenshotRules}>
                <Text style={styles.rulesAcceptBtnText}>I Understand</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      )}
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
  markPaidBtnText: { color: colors.text, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
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
  rGridHeader: { flex: 1, backgroundColor: '#111', padding: 4, alignItems: 'center', justifyContent: 'center' },
  rGridHeaderText: { color: '#fff', fontSize: 7, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  rGridCell: { flex: 1, padding: 4, borderBottomWidth: 1, borderBottomColor: '#ddd', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  rGridCellText: { color: '#333', fontSize: 9, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  rAcctLine: { fontSize: 11, color: '#333', marginBottom: 20 },
  rBillSummaryBadge: { backgroundColor: '#111', color: '#fff', paddingVertical: 4, paddingHorizontal: 15, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  rCalculationsBox: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 20 },
  rCalcSectionTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#1a1a1a', marginBottom: 10 },
  rCalcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingLeft: 10 },
  rCalcLabel: { fontSize: 11, color: '#444', fontFamily: 'Inter_400Regular' },
  rCalcValue: { fontSize: 11, color: '#444', fontFamily: 'Inter_400Regular' },
  rTotalBox: { backgroundColor: '#111', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  rTotalText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold' },
  rTotalValue: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  rThankYou: { textAlign: 'center', color: '#E53935', fontSize: 10, marginBottom: 20, fontStyle: 'italic', fontFamily: 'Inter_600SemiBold' },
  rCloseBtn: { backgroundColor: '#E53935', padding: 12, borderRadius: 8, alignItems: 'center' },
  rCloseBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
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
  fabRules: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  rulesModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rulesModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  rulesModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  rulesImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  rulesImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  rulesTextContainer: {
    marginBottom: 24,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ruleIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
  },
  rulesAlertBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  rulesAlertText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 18,
  },
  rulesAcceptBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  rulesAcceptBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  }
});

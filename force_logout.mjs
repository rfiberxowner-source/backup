import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
  authDomain: "portal-c293a.firebaseapp.com",
  projectId: "portal-c293a",
  storageBucket: "portal-c293a.firebasestorage.app",
  messagingSenderId: "159583415029",
  appId: "1:159583415029:android:bb5221ff531fa1005a33bc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function forceLogout() {
  const emailToLogout = 'rfiberxowner@rfiberx.net';
  const q = query(collection(db, "admin"), where("email", "==", emailToLogout));
  const snap = await getDocs(q);

  if (snap.empty) {
    console.log(`No admin found with email ${emailToLogout}`);
    process.exit(1);
  }

  let found = false;
  for (const document of snap.docs) {
    console.log(`Found admin document ${document.id}. Clearing session...`);
    await updateDoc(doc(db, "admin", document.id), {
      activeSessionToken: null
    });
    found = true;
  }
  
  if (found) {
    console.log('Successfully force-logged out ' + emailToLogout);
  }
  process.exit(0);
}

forceLogout().catch(console.error);

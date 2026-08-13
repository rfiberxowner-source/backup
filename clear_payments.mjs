import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function clearPayments() {
  console.log("Fetching payments...");
  const snap = await getDocs(collection(db, "payments"));
  let count = 0;
  for (const document of snap.docs) {
    await deleteDoc(doc(db, "payments", document.id));
    count++;
  }
  console.log(`Successfully deleted ${count} payment records.`);
  process.exit(0);
}

clearPayments();

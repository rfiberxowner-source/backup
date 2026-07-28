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

async function wipe() {
  console.log("Starting wipe of billing_emails...");
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    let count = 0;
    for (const userDoc of usersSnap.docs) {
      const billingRef = collection(db, "users", userDoc.id, "billing_emails");
      const billingSnap = await getDocs(billingRef);
      for (const billDoc of billingSnap.docs) {
        await deleteDoc(doc(db, "users", userDoc.id, "billing_emails", billDoc.id));
        count++;
      }
    }
    console.log(`Successfully deleted ${count} billing_emails documents.`);
  } catch (e) {
    console.error("Error wiping data:", e);
  }
  process.exit(0);
}

wipe();

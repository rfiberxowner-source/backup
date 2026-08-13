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

async function updateDetails() {
  console.log("Searching for account 331885...");
  const q = query(collection(db, "users"), where("accountNumber", "==", "331885"));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    console.log("No user found with account number 331885.");
    process.exit(1);
  }

  for (const document of snap.docs) {
    const data = document.data();
    console.log(`Updating user: ${document.id}`);
    
    await updateDoc(doc(db, "users", document.id), {
      name: "Aj Tabios",
      firstName: "Aj",
      lastName: "Tabios",
      password: "Tabios"
    });
    console.log("Successfully updated names and password.");
  }
  
  console.log("Done.");
  process.exit(0);
}

updateDetails();

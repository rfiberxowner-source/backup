import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';

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

async function migrateTechnicians() {
  console.log("Fetching technicians...");
  const snap = await getDocs(collection(db, "technicians"));
  console.log(`Found ${snap.docs.length} technicians.`);

  let migratedCount = 0;

  for (const document of snap.docs) {
    const data = document.data();
    console.log(`Migrating technician: ${data.firstName} ${data.lastName}`);

    const newAdminData = {
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      contact: '', 
      email: data.email || '',
      password: data.password || '',
      role: 'Technician',
      createdAt: data.createdAt || new Date().toISOString(),
      // preserving the raw fields that the mobile app might depend on
      firstName: data.firstName || '',
      firstNameLowercase: data.firstNameLowercase || '',
      lastName: data.lastName || '',
      activeSessionToken: null
    };

    // Insert into admin with the same document ID
    await setDoc(doc(db, "admin", document.id), newAdminData);
    
    // Delete from technicians
    await deleteDoc(doc(db, "technicians", document.id));
    
    migratedCount++;
    console.log(`Successfully migrated ${data.firstName} and deleted old record.`);
  }

  console.log(`Done! Migrated ${migratedCount} accounts.`);
  process.exit(0);
}

migrateTechnicians().catch(e => {
  console.error("Migration failed", e);
  process.exit(1);
});

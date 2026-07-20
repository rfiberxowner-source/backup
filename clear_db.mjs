import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
  authDomain: "portal-c293a.firebaseapp.com",
  projectId: "portal-c293a",
  storageBucket: "portal-c293a.firebasestorage.app",
  messagingSenderId: "159583415029",
  appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(colName) {
  console.log(`Clearing ${colName}...`);
  const snapshot = await getDocs(collection(db, colName));
  const deletePromises = [];
  snapshot.forEach((document) => {
    deletePromises.push(deleteDoc(doc(db, colName, document.id)));
  });
  await Promise.all(deletePromises);
  console.log(`Deleted ${deletePromises.length} items from ${colName}`);
}

async function run() {
  try {
    await clearCollection('receipts');
    await clearCollection('payments');
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

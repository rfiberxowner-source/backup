import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
  authDomain: "portal-c293a.firebaseapp.com",
  projectId: "portal-c293a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, "admin"));
  snap.forEach(doc => {
    const data = doc.data();
    const name = data.fullName || data.name || data.firstName + ' ' + data.lastName;
    console.log(`${name} (${doc.id}) | token: ${data.expoPushToken ? data.expoPushToken : 'none'} | enabled: ${data.notificationsEnabled}`);
  });
  process.exit(0);
}
check().catch(console.error);

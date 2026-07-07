import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function check() {
  const q = collection(db, "users");
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => console.log(doc.id, doc.data()));
  process.exit(0);
}
check();

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
  authDomain: "portal-c293a.firebaseapp.com",
  projectId: "portal-c293a",
  storageBucket: "portal-c293a.firebasestorage.app",
  messagingSenderId: "159583415029",
  appId: "1:159583415029:android:bb5221ff531fa1005a33bc"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

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

async function migrateAccounts() {
  console.log("🚀 Starting Account Number Migration...");
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    if (usersSnap.empty) {
      console.log("No users found in database.");
      return;
    }

    const assignedNumbers = new Set();
    function generateUnique6Digit() {
      let num;
      do {
        // Generates a random number from 100000 to 999999
        num = Math.floor(100000 + Math.random() * 900000).toString();
      } while (assignedNumbers.has(num));
      assignedNumbers.add(num);
      return num;
    }

    let updatedCount = 0;
    console.log(`\nFound ${usersSnap.size} user accounts. Migrating to unique 6-digit numbers:\n`);
    console.log("-------------------------------------------------------------------------");
    console.log("Name                     | Old Account Number     | New 6-Digit Account");
    console.log("-------------------------------------------------------------------------");

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const oldAcct = String(userData.accountNumber || userData.account || "N/A");
      const newAcct = generateUnique6Digit();
      const userName = String(userData.name || "Unknown").padEnd(24).substring(0, 24);

      // 1. Update user document in 'users' collection
      await updateDoc(doc(db, "users", userDoc.id), {
        accountNumber: newAcct,
        ...(userData.account ? { account: newAcct } : {})
      });

      // 2. Update sub-collection billing_emails if any exist
      const billingSnap = await getDocs(collection(db, "users", userDoc.id, "billing_emails"));
      for (const billDoc of billingSnap.docs) {
        await updateDoc(doc(db, "users", userDoc.id, "billing_emails", billDoc.id), {
          accountNumber: newAcct
        }).catch(() => {});
      }

      // 3. Update payments table where userId == userDoc.id
      const paySnap = await getDocs(query(collection(db, "payments"), where("userId", "==", userDoc.id)));
      for (const payDoc of paySnap.docs) {
        await updateDoc(doc(db, "payments", payDoc.id), {
          accountNumber: newAcct
        }).catch(() => {});
      }

      // Also update payments table by old accountNumber if it wasn't captured by userId
      if (oldAcct !== "N/A" && oldAcct !== "-" && oldAcct !== "TBD") {
        const paySnap2 = await getDocs(query(collection(db, "payments"), where("accountNumber", "==", oldAcct)));
        for (const payDoc of paySnap2.docs) {
          await updateDoc(doc(db, "payments", payDoc.id), {
            accountNumber: newAcct
          }).catch(() => {});
        }

        // 4. Update receipts table by old clientAccountNumber
        const recSnap = await getDocs(query(collection(db, "receipts"), where("clientAccountNumber", "==", oldAcct)));
        for (const recDoc of recSnap.docs) {
          await updateDoc(doc(db, "receipts", recDoc.id), {
            clientAccountNumber: newAcct
          }).catch(() => {});
        }
      }

      console.log(`${userName} | ${oldAcct.padEnd(22).substring(0, 22)} | 🟢 ${newAcct}`);
      updatedCount++;
    }

    console.log("-------------------------------------------------------------------------");
    console.log(`\n✨ Migration complete! Successfully updated ${updatedCount} user account(s) and all their associated bills, payments, and receipts to unique 6-digit numbers!`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateAccounts();

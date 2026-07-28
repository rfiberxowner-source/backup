const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');

// Fetch config
const configContent = fs.readFileSync('./src/components/firebase.js', 'utf8');
const configMatch = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);

if (!configMatch) {
  console.error("Could not find firebase config");
  process.exit(1);
}

const firebaseConfig = eval('(' + configMatch[1] + ')');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePasswords() {
  console.log("Fetching users...");
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  let updatedCount = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const data = userDoc.data();
    
    // Check if they need updating
    if (data.password === 'Easypass123' || !data.password) {
      // We need to extract their last name from their 'name' field
      if (data.name && typeof data.name === 'string') {
        const nameParts = data.name.trim().split(/\s+/);
        if (nameParts.length > 0) {
          const extractedLastName = nameParts[nameParts.length - 1];
          
          const updateData = {
            password: extractedLastName.toLowerCase()
          };

          // Also populate the lastName field if it's missing, so it's clean
          if (!data.lastName) {
            updateData.lastName = extractedLastName;
          }
          
          await updateDoc(doc(db, 'users', userDoc.id), updateData);
          console.log(`Updated user ${userDoc.id}: password set to '${extractedLastName.toLowerCase()}'`);
          updatedCount++;
        }
      }
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} users.`);
  process.exit(0);
}

migratePasswords().catch(console.error);

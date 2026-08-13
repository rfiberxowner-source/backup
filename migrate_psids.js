import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(new URL('./portal-c293a-firebase-adminsdk-fbsvc-8b15a32372.json', import.meta.url)));
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// Your Page Tokens
const PAGE_ACCESS_TOKEN = 'EAAWcO9Nk1mgBRkaXUTGK3JqhZCLkJXXlPZBDcMDIUmrbsOmCRmbtzplX7zbJYnltaZAyZB0292pGfZBBtce1oKRZC0ZBICmiZCZBLoHKYUPBc7UES4RZChyOoyQZAYFszs487BJQDbYuZCu0ZCY568OIckOXOhRR2OQ9MUf17PGUCwkxxThIfmxeRRcZBnjFzhVh6FBVwCq1z35gZDZD';
const PAGE_ID = '724283354102948';

async function fetchAndMigratePSIDs() {
    console.log("🔍 Scanning RFiber inbox for all past clients...");
    let url = `https://graph.facebook.com/v19.0/me/conversations?fields=participants&access_token=${PAGE_ACCESS_TOKEN}`;
    let totalMigrated = 0;

    try {
        // Loop through the inbox pages
        while (url) {
            // Using native fetch so we don't need to install axios
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                console.error("❌ API Error:", data.error.message);
                break;
            }

            const conversations = data.data;
            if (!conversations) break;

            for (let convo of conversations) {
                let participants = convo.participants.data;

                // Find the person who is NOT your page
                for (let person of participants) {
                    if (person.id !== PAGE_ID) {
                        const psid = person.id;
                        const name = person.name;

                        // Save directly to Firestore collection 'messenger_psids'
                        await db.collection('messenger_psids').doc(psid).set({
                            psid: psid,
                            name: name,
                            migratedAt: FieldValue.serverTimestamp()
                        }, { merge: true });
                        
                        console.log(`💾 Saved to Database: ${name} (PSID: ${psid})`);
                        totalMigrated++;
                    }
                }
            }

            // Check if there are older messages to fetch (pagination)
            url = data.paging && data.paging.next ? data.paging.next : null;
        }

        console.log(`\n🎉 DONE! Successfully fetched and saved ${totalMigrated} clients directly into your Firestore database!`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error running migration:", error.message);
        process.exit(1);
    }
}

fetchAndMigratePSIDs();

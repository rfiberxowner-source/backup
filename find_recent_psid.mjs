import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync(new URL('./portal-c293a-firebase-adminsdk-fbsvc-dcb13d5b60.json', import.meta.url)));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function findRecentPSID() {
    try {
        const snap = await db.collection('messenger_psids').get();
        
        let allPsids = [];
        snap.forEach(doc => {
            const data = doc.data();
            if (data.lastInteraction) {
                allPsids.push({
                    id: doc.id,
                    time: data.lastInteraction.toDate(),
                    msg: data.lastMessage || 'N/A'
                });
            }
        });

        allPsids.sort((a, b) => b.time - a.time);

        console.log("=== MOST RECENTLY ACTIVE PSIDs ===");
        allPsids.slice(0, 5).forEach(psid => {
            console.log(`PSID: ${psid.id} | Last Active: ${psid.time.toLocaleString()} | Msg: ${psid.msg}`);
        });
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

findRecentPSID();

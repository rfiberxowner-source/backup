import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(new URL('./portal-c293a-firebase-adminsdk-fbsvc-dcb13d5b60.json', import.meta.url)));

initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();

async function findJasper() {
    try {
        const snap = await db.collection('messenger_psids').get();
        for (const doc of snap.docs) {
            const psidData = doc.data();
            const account = psidData.account;
            
            if (account) {
                const userSnap = await db.collection('users').where('account', '==', account).limit(1).get();
                if (!userSnap.empty) {
                    const user = userSnap.docs[0].data();
                    const name = user.name || user.firstName || user.lastName || 'Unknown';
                    console.log(`PSID: ${doc.id} | Account: ${account} | Name: ${name}`);
                    if (name.toLowerCase().includes('jasper')) {
                        console.log('^^^ FOUND JASPER! ^^^');
                    }
                }
            } else {
                console.log(`PSID: ${doc.id} | No linked account`);
            }
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

findJasper();

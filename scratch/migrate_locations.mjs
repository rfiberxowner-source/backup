import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync(new URL('../portal-c293a-firebase-adminsdk-fbsvc-8b15a32372.json', import.meta.url)));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrateLocations() {
    console.log("Fetching users to migrate...");
    const snap = await db.collection("users").get();
    
    let totalUpdated = 0;
    
    // We will batch the updates (Firestore limits batches to 500 operations)
    let batch = db.batch();
    let batchCount = 0;
    let totalBatches = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        if (!data.Location && !data.location) {
            batch.update(doc.ref, { Location: "Magdalena" });
            batchCount++;
            totalUpdated++;
            
            if (batchCount === 500) {
                await batch.commit();
                totalBatches++;
                console.log(`Committed batch ${totalBatches} (${batchCount} docs)`);
                batch = db.batch();
                batchCount = 0;
            }
        }
    }

    if (batchCount > 0) {
        await batch.commit();
        totalBatches++;
        console.log(`Committed final batch ${totalBatches} (${batchCount} docs)`);
    }

    console.log(`\n--- MIGRATION COMPLETE ---`);
    console.log(`Successfully updated ${totalUpdated} users with Location: "Magdalena"`);
    
    process.exit(0);
}

migrateLocations().catch(console.error);

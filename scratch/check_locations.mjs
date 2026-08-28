import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync(new URL('../portal-c293a-firebase-adminsdk-fbsvc-8b15a32372.json', import.meta.url)));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkLocations() {
    console.log("Fetching users...");
    const snap = await db.collection("users").get();
    
    let total = 0;
    let withLocation = 0;
    let locationCounts = {};
    let withoutLocation = 0;

    snap.forEach(doc => {
        total++;
        const data = doc.data();
        if (data.Location || data.location) {
            withLocation++;
            const loc = data.Location || data.location;
            locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        } else {
            withoutLocation++;
        }
    });

    console.log(`\n--- LOCATION REPORT ---`);
    console.log(`Total Users: ${total}`);
    console.log(`Users WITH a Location field: ${withLocation}`);
    console.log(`Users WITHOUT a Location field: ${withoutLocation}`);
    
    if (withLocation > 0) {
        console.log(`\nLocation Breakdown:`);
        for (const [loc, count] of Object.entries(locationCounts)) {
            console.log(`  - "${loc}": ${count} users`);
        }
    }
    
    process.exit(0);
}

checkLocations().catch(console.error);

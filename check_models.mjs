import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync(new URL('./portal-c293a-firebase-adminsdk-fbsvc-dcb13d5b60.json', import.meta.url)));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function listModels() {
    try {
        const apiKeyDoc = await db.collection('settings').doc('apiKeys').get();
        const apiKey = apiKeyDoc.data().gemini;
        
        const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
        const data = await resp.json();
        
        const models = data.models
            .filter(m => m.name.includes('gemini'))
            .map(m => m.name.replace('models/', ''));
            
        console.log("AVAILABLE MODELS:", models);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

listModels();

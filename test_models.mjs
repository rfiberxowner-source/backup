import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync(new URL('./portal-c293a-firebase-adminsdk-fbsvc-dcb13d5b60.json', import.meta.url)));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function testModels() {
    const apiKeyDoc = await db.collection('settings').doc('apiKeys').get();
    const apiKey = apiKeyDoc.data().gemini;
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest"
    ];

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Reply with just the word OK");
            const text = result.response.text();
            console.log(`✅ ${modelName} => WORKS! Response: "${text.trim()}"`);
        } catch (err) {
            console.log(`❌ ${modelName} => FAILED! Error: ${err.message.substring(0, 100)}`);
        }
    }
    process.exit(0);
}

testModels();

import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(new URL('./portal-c293a-firebase-adminsdk-fbsvc-8b15a32372.json', import.meta.url)));
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const app = express();
app.use(express.json());

// A simple verify token for Facebook to validate your webhook.
// You will enter this exact string in the Facebook Developer Portal.
const VERIFY_TOKEN = "rfiberx_messenger_webhook_12345"; 

// 1. Webhook Verification Endpoint (Facebook uses this to connect)
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// 2. Incoming Messages Endpoint (Where Facebook sends the chats)
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            // Get the webhook event
            let webhook_event = entry.messaging[0];
            
            if (webhook_event.sender) {
                // Extract the sender's PSID
                let sender_psid = webhook_event.sender.id;
                console.log("-----------------------------------------");
                console.log("New message received from PSID: " + sender_psid);
                console.log("Message Text: ", webhook_event.message?.text || "[No text]");
                console.log("-----------------------------------------");
                
                // Save sender_psid to Firestore
                db.collection('messenger_psids').doc(sender_psid).set({
                    psid: sender_psid,
                    lastMessage: webhook_event.message?.text || "",
                    lastInteraction: FieldValue.serverTimestamp()
                }, { merge: true })
                .then(() => console.log(`✅ PSID ${sender_psid} saved to Firestore!`))
                .catch(err => console.error("❌ Error saving to Firestore: ", err));
            }
        });
        
        // Return a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// A simple root route to verify the server is running
app.get('/', (req, res) => {
    res.send('RFiberX Webhook Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook Server listening on port ${PORT}`);
});

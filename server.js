import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // On Render: Read securely from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Local Testing: Read from the local file
    serviceAccount = JSON.parse(fs.readFileSync(new URL('./portal-c293a-firebase-adminsdk-fbsvc-8b15a32372.json', import.meta.url)));
}

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const app = express();
app.use(express.json());

// A simple verify token for Facebook to validate your webhook.
// You will enter this exact string in the Facebook Developer Portal.
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rfiberx_messenger_webhook_12345"; 

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

                // Auto-reply ONLY to Jasper Mangulabnan
                const JASPER_PSID = '27076770378611516';
                if (sender_psid === JASPER_PSID && webhook_event.message && webhook_event.message.text) {
                    // Prevent infinite loops in case we reply to ourselves, though we check sender
                    const replyMessage = {
                        text: "Hi Jasper! This is an automated test reply from RFiberX. Your PSID is verified!"
                    };
                    callSendAPI(sender_psid, replyMessage);
                }
            }
        });
        
        // Return a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || 'EAAWcO9Nk1mgBRkaXUTGK3JqhZCLkJXXlPZBDcMDIUmrbsOmCRmbtzplX7zbJYnltaZAyZB0292pGfZBBtce1oKRZC0ZBICmiZCZBLoHKYUPBc7UES4RZChyOoyQZAYFszs487BJQDbYuZCu0ZCY568OIckOXOhRR2OQ9MUf17PGUCwkxxThIfmxeRRcZBnjFzhVh6FBVwCq1z35gZDZD';

// Function to send the message back to Facebook Graph API
async function callSendAPI(sender_psid, response) {
    const requestBody = {
        recipient: {
            id: sender_psid
        },
        message: response
    };

    try {
        const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (res.ok) {
            console.log('✅ Message sent successfully to Jasper!');
        } else {
            const errBody = await res.text();
            console.error('❌ Unable to send message:', errBody);
        }
    } catch (err) {
        console.error('❌ Failed to fetch Graph API:', err);
    }
}

// A simple root route to verify the server is running
app.get('/', (req, res) => {
    res.send('RFiberX Webhook Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook Server listening on port ${PORT}`);
});

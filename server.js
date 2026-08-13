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

                // Auto-reply logic
                if (webhook_event.message && webhook_event.message.text) {
                    const messageText = webhook_event.message.text;
                    const replyText = getAutoReply(messageText);

                    // Send the auto-reply ONLY to Rfiberx Blanco
                    const RFIBERX_PSID = '28146825618339223';
                    if (sender_psid === RFIBERX_PSID) {
                        const replyMessage = getAutoReply(messageText);
                        callSendAPI(sender_psid, replyMessage);
                    }
                }
            }
        });
        
        // Return a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Smart Keyword Matching using Regex
function getAutoReply(text) {
    const msg = text.toLowerCase().trim();

    // 0. Test Keyword (With Button)
    if (msg === "test") {
        return {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "✅ System is responding! The webhook and auto-reply are fully functional.",
                    buttons: [
                        {
                            type: "web_url",
                            url: "https://rfiberx.net",
                            title: "Visit RFiberX"
                        }
                    ]
                }
            }
        };
    }

    // 1. Technical Support Keywords
    if (msg.match(/(wala|wla|nawala|putol|mabagal|red light|los|internet|connection)/i)) {
        return { text: "Hi! Kung kayo po ay nawalan ng internet o nakita ninyo na nakailaw ng RED ang LOS sa inyong modem, maaaring may fiber cut sa inyong area. \n\nMaaari po kayong mag-chat ng detalye ng inyong account o tumawag sa aming Technical Support sa +63 09913746474." };
    }
    
    // 2. Billing & Payment Keywords
    if (msg.match(/(bayad|magkano|gcash|payment|bill|resibo|magbayad)/i)) {
        return { text: "Para po sa pagbabayad ng inyong bill:\n\nMaaari kayong magpadala via GCash sa aming opisyal na numero: 09058395471.\n\nPaki-send po ang inyong screenshot o resibo dito kapag kayo ay nakapagbayad na para ma-process namin agad." };
    }

    // 3. Application / New Connection Keywords
    if (msg.match(/(apply|kabit|pakabit|install|bago)/i)) {
        return { text: "Gusto niyo po bang mag-apply para sa RFiberX internet? \n\nMaaari kayong mag-sign up directly sa aming website: https://rfiberx.net/apply o ibigay ang inyong kumpletong pangalan, address, at contact number dito." };
    }

    // 4. Default / Menu (If they just say "hello" or something we don't recognize)
    return { text: "Hello! Ako ang RFiberX Auto-Bot. Ano po ang kailangan ninyo?\n\n1 - Magbayad ng Bill (GCash)\n2 - Nawalan ng Internet (Technical Support)\n3 - Mag-apply ng bagong connection\n4 - Kausapin ang Admin\n\n(I-type lang po ang inyong katanungan o concern)" };
}

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || 'EAAOCL1hceK8BSMsUSSYLdHh8bEVNuxGJZC7t24ZBPdG2x6ObyB3XIAclpVVGtvLrJQiHnZBaTWJmHsFXucILzvSbrTedn02okEsU446aEc0ZAzVLagUqjn78d6bzLhOcEZAITP0dIZAVzeuPlBYZADXH4St6j2NXfTtdjrZAHTptA1ZAsfUhYe2hnbweKApPjj3kmsfTSxNSNrgZDZD';

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

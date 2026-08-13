import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

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

                    // Send the auto-reply ONLY to Rfiberx Blanco
                    const RFIBERX_PSID = '28146825618339223';
                    if (sender_psid === RFIBERX_PSID) {
                        getAutoReply(messageText).then(replyMessage => {
                            if (replyMessage) {
                                callSendAPI(sender_psid, replyMessage);
                            }
                        }).catch(err => console.error("Error generating reply:", err));
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

// Smart AI Classification using Gemini
async function getAutoReply(text) {
    const msg = text.toLowerCase().trim();

    // Keep the "test" keyword manual for debugging
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

    // First Line of Defense: Fast Keyword Matching (0 API Requests)
    let ai_decision = null;
    if (msg.match(/(wala|wla|nawala|putol|mabagal|red light|los)/i)) {
        ai_decision = 'TECHNICAL_SUPPORT';
    } else if (msg.match(/(bayad|magkano|gcash|payment|bill|resibo|magbayad)/i)) {
        ai_decision = 'BILLING';
    } else if (msg.match(/(apply|kabit|pakabit|install|bago)/i)) {
        ai_decision = 'APPLICATION';
    }

    if (!ai_decision) {
        // Second Line of Defense: Gemini AI for complex sentences
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are an intelligent classifier for an ISP called RFiberX. 
            Read the user's message in Tagalog, English, or Taglish. 
            You must reply with exactly ONE word from this list that best matches their intent:
            - TECHNICAL_SUPPORT (if they complain about slow internet, no internet, red light, or fiber cut)
            - RELOCATION (if they are asking to relocate or move their internet connection)
            - APPLICATION (if they are applying or want to apply for a new internet connection)
            - BILLING (if they ask about payment, billing, GCash, or sending receipts)
            - PLANS (if they are asking about internet plans, packages, or speeds available)
            - CHANGE_PASSWORD (if they are asking to change their WiFi password)
            - AREA_INQUIRY (if they are asking about area installation or if their area is serviceable)
            - ACCOUNT_INQUIRY (if they are asking for their account number and password for the billing system account)
            - GREETING (if they say hello, hi, good morning, good evening, or thank you)
            - UNKNOWN (if they ask something completely unrelated to our ISP)
            
            User's Message: "${text}"`;

            const result = await model.generateContent(prompt);
            ai_decision = result.response.text().trim();
            console.log("🤖 Gemini Classified Intent as: " + ai_decision);
        } catch (error) {
            console.error("Gemini Error:", error);
            return { text: "We apologize, but we encountered a system error. Please wait for an admin to assist you." };
        }
    } else {
        console.log("⚡ Fast Keyword Matched Intent as: " + ai_decision);
    }

    // Process the final decision (from either Keywords or Gemini)
    switch (ai_decision) {
            case 'TECHNICAL_SUPPORT':
                return { text: `Good day! We apologize for the inconvenience. To check your line status, kindly provide:

• Account Name:
• Account ID/Number:
• Complete Address:
• Active Contact Number:

Please restart your modem by unplugging it for 30 seconds, then plug it back in. If the issue persists, or your modem shows a red light, reply with your details so our technical team can inspect your line.
Thank you for choosing RFIBERX Telecom!` };
            
            case 'RELOCATION':
                return { text: `Good day! For site transfers or modem relocation, please send:
• Account Name:
• Account ID / Number:
• Current Address:
• New Target Address:
• Active Contact Number:

Our team will verify if there is an available NAP box/port at your new site and update you on the relocation process.

Thank you for choosing RFIBERX Telecom!` };
            
            case 'APPLICATION':
                return { text: "Gusto niyo po bang mag-apply para sa RFiberX internet? Maaari kayong mag-sign up directly sa aming website: https://rfiberx.net/apply o ibigay ang inyong kumpletong pangalan, address, at contact number dito upang ma-assist namin kayo." };
            
            case 'BILLING':
                return { text: `We accept the following payment methods:

1. GCash:
•Account Name: RE****L B.
•Account Nuber: 09058395471 

2. UnionBank:
•Account Name: RFIBERX
•Account Number: 1096-6732-3727

3.Cash Payment:
•Visit our official office location.

Note: All transactions and payment are strictly non-refundable.` };
            
            case 'PLANS':
                return { text: `Good day! Here are our available RFIBERX internet plans:
• 30 Mbps – ₱800
• 50 Mbps – ₱1,000
• 70 Mbps – ₱1,300
• 100 Mbps – ₱1,500
• 200 Mbps – ₱2,000
• 500 Mbps – ₱4,500

For inquiries or applications, kindly message us with your preferred plan and contact details. Our team will assist you with the application process.

Thank you for choosing RFIBERX Telecom!` };
            
            case 'CHANGE_PASSWORD':
                return { text: `Good day Sir/Ma'am! I'm sorry if you're having a hard time with your current password. Changing it is very simple.

Changing your Wi-Fi password
1. Open your web browser and enter 192.168.1.1, 192.168.100.1, or 192.168.8.1.
2. Log in using the username user and password user.
3. Click on Local Network and then WLAN.
4. Select WLAN SSID Configuration.
5. Enter your new password in the WPA Passphrase field and click Apply to save your changes.

Were you able to log in to the modem page successfully?` };
            
            case 'AREA_INQUIRY':
                return { text: `Good day! To check if your location is covered by RFIBERX and available for installation, kindly provide:
• Complete Name:
• Phone Number:
• Complete Address:
• Email Address:

RFIBERX service is currently available in selected areas, including Magdalena and Majayjay. Our team will verify the exact coverage, NAP/port availability, and installation feasibility at your address.

Thank you for choosing RFIBERX Telecom!` };
            
            case 'ACCOUNT_INQUIRY':
                return { text: `To log in to your RFIBERX mobile app:
• Account Number: Use the account number provided by RFIBERX or the technician.
• Password: Use the Last Name of the registered account holder as provided or instructed by the technician.Enter your Account Number and Password on the login page, then click Login.If you are unable to log in, please make sure that your Account Number and Last Name are entered correctly.
 You may also contact RFIBERX Support for assistance.

Thank you for choosing RFIBERX Teleco` };
            
            case 'GREETING':
                return { text: "Hello! I am the RFiberX Auto-Bot. How can I help you today? Please type your inquiry or concern (for example: 'Slow internet', 'Billing inquiry', or 'I want to apply') so we can assist you properly." };

            default:
                return null;
        }
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

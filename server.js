import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Generative AI imported at top

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
const userSessions = new Map();
const accountRecoveryData = new Map();

const app = express();
app.use(express.json());
app.use('/public', express.static('public'));

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
        body.entry.forEach(function (entry) {
            // Get the webhook event
            let webhook_event = entry.messaging[0];

            if (webhook_event.sender) {
                // Extract the sender's PSID
                let sender_psid = webhook_event.sender.id;
                console.log("-----------------------------------------");
                console.log("New message received from PSID: " + sender_psid);
                console.log("Message Text: ", webhook_event.message?.text || "[No text]");
                console.log("-----------------------------------------");

                // Fetch PSID from Firestore to check pause state BEFORE updating timestamp
                const psidRef = db.collection('messenger_psids').doc(sender_psid);
                psidRef.get().then(doc => {
                    let is_paused = false;
                    let lastInteractionTime = 0;
                    if (doc.exists) {
                        const data = doc.data();
                        is_paused = data.is_paused === true;
                        if (data.lastInteraction) {
                            lastInteractionTime = data.lastInteraction.toMillis();
                        }
                    }

                    const now = Date.now();
                    let shouldProcessMessage = true;

                    // 10-second timer logic
                    if (is_paused) {
                        const PAUSE_TIMEOUT_MS = 10 * 1000; // 10 seconds for testing
                        if (lastInteractionTime && (now - lastInteractionTime > PAUSE_TIMEOUT_MS)) {
                            // Wake up silently!
                            is_paused = false;
                        } else {
                            // Stay paused
                            shouldProcessMessage = false;
                        }
                    }

                    // Save new timestamp and state to Firestore
                    const recoveryData = accountRecoveryData.get(sender_psid);
                    const linkedAccount = recoveryData ? recoveryData.account : null;
                    
                    let psidPayload = {
                        psid: sender_psid,
                        lastMessage: webhook_event.message?.text || "",
                        lastInteraction: FieldValue.serverTimestamp(),
                        is_paused: is_paused
                    };
                    if (linkedAccount) {
                        psidPayload.account = linkedAccount;
                    }

                    psidRef.set(psidPayload, { merge: true })
                        .then(() => console.log(`✅ PSID ${sender_psid} timestamp updated.`))
                        .catch(err => console.error("❌ Error saving to Firestore: ", err));

                    // If still paused, ignore the message completely
                    if (!shouldProcessMessage) {
                        console.log(`⏸️ Bot is paused for PSID ${sender_psid}. Ignoring message.`);
                        return;
                    }

                    // Auto-reply logic
                    if (webhook_event.message) {
                        // Send the auto-reply ONLY to Rfiberx Blanco
                        const RFIBERX_PSID = '28146825618339223';
                        if (sender_psid === RFIBERX_PSID) {
                            if (webhook_event.message.text) {
                                getAutoReply(webhook_event.message.text, sender_psid).then(async replyMessage => {
                                    if (replyMessage) {
                                        if (Array.isArray(replyMessage)) {
                                            for (let msg of replyMessage) {
                                                if (msg.isHandover) {
                                                    await psidRef.set({ is_paused: true }, { merge: true });
                                                }
                                                await callSendAPI(sender_psid, msg);
                                            }
                                        } else {
                                            if (replyMessage.isHandover) {
                                                psidRef.set({ is_paused: true }, { merge: true });
                                            }
                                            callSendAPI(sender_psid, replyMessage);
                                        }
                                    }
                                }).catch(err => console.error("Error generating reply:", err));
                            } else if (webhook_event.message.attachments && webhook_event.message.attachments[0].type === 'image') {
                                const imageUrl = webhook_event.message.attachments[0].payload.url;
                                processImageAttachment(imageUrl, sender_psid).then(replyMessage => {
                                    if (replyMessage) {
                                        callSendAPI(sender_psid, replyMessage);
                                    }
                                }).catch(err => console.error("Error processing image:", err));
                            }
                        }
                    }
                }).catch(err => console.error("Error getting PSID:", err));
            }
        });

        // Return a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Smart AI Classification using Gemini
async function getAutoReply(text, sender_psid) {
    const msg = text.toLowerCase().trim();

    let clientName = "Valued Customer";
    try {
        const response = await fetch(`https://graph.facebook.com/${sender_psid}?fields=first_name&access_token=${PAGE_ACCESS_TOKEN}`);
        const data = await response.json();
        if (data.first_name) {
            clientName = data.first_name;
        }
    } catch (e) {
        console.error("Error fetching client name:", e);
    }

    // =========================================================================
    // 🧠 SECTION 1: MULTI-TURN CONVERSATION LOGIC (STATE MACHINE)
    // This block handles users who are already in a specific conversation flow
    // (e.g. they are answering a step-by-step form for Billing, Tech Support, etc.)
    // =========================================================================
    if (userSessions.has(sender_psid)) {
        // Global escape hatch to cancel out of any flow
        if (msg.match(/(cancel|stop|ayoko|no|hindi|agent|operator|tao|customer service)/i)) {
            userSessions.delete(sender_psid);
            return { text: "Okay, we've cancelled that request. If you need to talk to a human agent, please wait, and our team will be with you shortly. How else can I help you today?" };
        }

        if (userSessions.get(sender_psid) === 'TECH_SUPPORT_STEP_1') {
            userSessions.delete(sender_psid); // Clear memory state

            if (msg.match(/(slow|mabagal|bagal)/i)) {
                return { text: `Hi ${clientName},\n\nThank you for reaching out. I am sorry to hear you are experiencing slow internet speeds, and I am happy to help get this sorted out for you.\n\nIn most cases, a quick restart of your equipment will refresh the connection and restore your normal speeds. Could you please try this quick step?\n\nRestart your equipment: Unplug the power cable from both your modem and your router. Wait for about 10 seconds, then plug them both back in. It will take a few minutes for the lights to stabilize and the connection to return.\n\nIf your internet is still running slow after doing this, please let me know if you wanna try another way to resolve the problem. Tell me if you wanna change the wifi password or wanna contact the support.` };
            } else if (msg.match(/(no internet|wala|putol|los|red|flashing)/i)) {
                return { text: `Hi ${clientName},\n\nI am sorry to hear that your internet is completely down. I know how disruptive it is to lose your connection, and I am here to help get you back online as quickly as possible.\n\nTo help restore your service, please try the following steps:\n\nUnplug the power cord from both your modem and your router. Leave them unplugged for a full 10 seconds, then plug them back in. Wait about 3 to 5 minutes for the devices to fully reboot and establish a connection.\n\nAfter restarting, take a look at the lights on your modem. If the "Internet" or "Online" light is completely off or flashing red, it indicates the signal is not reaching your home.\n\nIf your internet is still down or the lights are showing an error after trying these steps, Type "Agent" and i will redirect you to our agent team to further solve the problem.` };
            } else {
                return { text: "Please clarify if you are experiencing Slow Internet, No Internet, or Red light flashing." };
            }
        } else if (userSessions.get(sender_psid) === 'RELOCATION_STEP_1') {
            if (msg.match(/(yes|oo|sige|proceed)/i)) {
                userSessions.delete(sender_psid); // Clear memory state
                return {
                    text: `Good day! For site transfers or modem relocation, please send:
• Account Name:
• Account ID / Number:
• Current Address:
• New Target Address:
• Active Contact Number:

Please note that relocation have a relocation fee, which will be discussed by our team. Our team will verify if there is an available NAP box/port at your new site and update you on the relocation process.

Thank you for choosing RFIBERX Telecom!` };
            } else {
                return { text: "Would you like to proceed with the relocation request? Please reply with 'Yes' to proceed, or 'Cancel' to stop." };
            }
        } else if (userSessions.get(sender_psid) === 'APPLICATION_STEP_1') {
            if (msg.match(/(yes|oo|sige|proceed)/i)) {
                userSessions.delete(sender_psid); // Clear memory state
                return { text: `Great! Here are our available plans:
• 30 Mbps – ₱800
• 50 Mbps – ₱1,000
• 70 Mbps – ₱1,300
• 100 Mbps – ₱1,500
• 200 Mbps – ₱2,000
• 500 Mbps – ₱4,500

To proceed, please provide the following details:
• Complete Name:
• Complete Address (with landmarks):
• Contact Number:
• Preferred Plan:

Our team will check if your area is serviceable and contact you for installation!` };
            } else {
                return { text: "Would you like to apply here? Please reply with 'Yes' to proceed, or 'Cancel' to stop." };
            }
        } else if (userSessions.get(sender_psid) === 'CHANGE_PASSWORD_STEP_1') {
            if (msg.includes('192.168.1.1')) {
                return {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: "Here is the tutorial for 192.168.1.1:\n\n1. Login with user/user.\n2. Go to WLAN > Security.\n3. Change WPA Passphrase and Apply.\n\n(If this was the wrong gateway, you can reply 'Cancel').",
                            buttons: [
                                {
                                    type: "web_url",
                                    url: "https://rfiberx.net/videos/192.168.1.1.mp4",
                                    title: "▶️ Watch Video Tutorial"
                                }
                            ]
                        }
                    }
                };
            } else if (msg.includes('192.168.100.1')) {
                return { text: "Here is the tutorial for 192.168.100.1:\n\n1. Login with telecomadmin/admintelecom.\n2. Go to WLAN > Security.\n3. Change WPA Passphrase and Apply.\n\n(If this was the wrong gateway, you can reply with a different one, or reply 'Cancel' to stop)." };
            } else if (msg.includes('192.168.8.1')) {
                return { text: "Here is the tutorial for 192.168.8.1:\n\n1. Login with admin/admin.\n2. Go to Wi-Fi Basic Settings.\n3. Change Wi-Fi Password and Save.\n\n(If this was the wrong gateway, you can reply with a different one, or reply 'Cancel' to stop)." };
            } else {
                return { text: "Please reply with your exact gateway URL (e.g. '192.168.1.1', '192.168.100.1', or '192.168.8.1') so I can send the tutorial." };
            }
        } else if (userSessions.get(sender_psid) === 'BILLING_STEP_1') {
            if (msg.match(/(forgot|nakalimutan|hindi ko alam|wala)/i)) {
                userSessions.set(sender_psid, 'ACCOUNT_RECOVERY_NAME');
                return { text: "Please provide your Full Name so we can search our database." };
            } else if (msg.length >= 4 && msg.match(/^[a-zA-Z0-9_-]+$/)) {
                accountRecoveryData.set(sender_psid, { account: text.trim() });
                userSessions.set(sender_psid, 'BILLING_MENU');
                return { text: "Thank you. Would you like to check your 'Balance' or see 'Payment' methods?" };
            } else {
                return { text: "Please provide a valid Account Number, or reply with 'Forgot'." };
            }
        } else if (userSessions.get(sender_psid) === 'ACCOUNT_RECOVERY_NAME') {
            try {
                const usersSnapshot = await db.collection('users').get();
                let matches = [];
                usersSnapshot.forEach(doc => {
                    const data = doc.data();
                    const name = (data.name || data.firstName || data.lastName || '').toLowerCase();
                    if (name && name.includes(msg)) {
                        matches.push(data);
                    }
                });

                if (matches.length > 0) {
                    accountRecoveryData.set(sender_psid, { matches: matches, currentIndex: 0 });
                    userSessions.set(sender_psid, 'ACCOUNT_RECOVERY_CONFIRM');
                    const firstMatch = matches[0];
                    const matchedName = firstMatch.name || firstMatch.firstName || firstMatch.lastName || 'Unknown';
                    return { text: `We found an account for ${matchedName}. Is this you? (Yes/No)\n\n*(If you also need your password, reply 'Yes password')*` };
                } else {
                    return { text: "We couldn't find an account with that name. Please try another name or type 'Cancel' to stop." };
                }
            } catch (err) {
                console.error("DB Error:", err);
                return { text: `Sorry, there was an error accessing the database. Please try again later. (Error: ${err.message || err})` };
            }
        } else if (userSessions.get(sender_psid) === 'ACCOUNT_RECOVERY_CONFIRM') {
            const data = accountRecoveryData.get(sender_psid);
            if (!data || !data.matches) {
                userSessions.delete(sender_psid);
                return { text: "Session expired. Please start again." };
            }

            if (msg.match(/(yes|oo|ako|proceed)/i)) {
                const match = data.matches[data.currentIndex];
                const accountNum = match.account || match.accountNumber || 'Not found';
                const pass = match.password || 'Not set';
                
                accountRecoveryData.set(sender_psid, { account: accountNum });
                userSessions.set(sender_psid, 'BILLING_MENU');

                let reply = `Great! Your Account Number is ${accountNum}.\n`;
                if (text.toLowerCase().includes('password') || text.toLowerCase().includes('pass')) {
                    reply += `Your password is: ${pass}\n\n`;
                }
                reply += `Would you like to check your 'Balance' or see 'Payment' methods?`;
                return { text: reply };
            } else if (msg.match(/(no|hindi)/i)) {
                data.currentIndex++;
                if (data.currentIndex < data.matches.length) {
                    const nextMatch = data.matches[data.currentIndex];
                    const matchedName = nextMatch.name || nextMatch.firstName || nextMatch.lastName || 'Unknown';
                    return { text: `How about ${matchedName}? Is this you? (Yes/No)\n\n*(If you also need your password, reply 'Yes password')*` };
                } else {
                    userSessions.set(sender_psid, 'ACCOUNT_RECOVERY_NAME');
                    accountRecoveryData.delete(sender_psid);
                    return { text: "We couldn't find any other matching accounts. Please try a different name, or contact our support team." };
                }
            } else if (msg.match(/(password|pass)/i)) {
                return { text: "If this is you, please reply 'Yes' and I will provide your account number and password." };
            } else {
                return { text: "Please reply with 'Yes' if this is your account, or 'No' to check the next match." };
            }
        } else if (userSessions.get(sender_psid) === 'BILLING_MENU') {
            if (msg.match(/(payment|bayad)/i)) {
                userSessions.delete(sender_psid);
                // We keep accountRecoveryData so they can upload a receipt immediately after
                return {
                    text: `We accept the following payment methods:\n\n1. GCash:\n•Account Name: RE****L B.\n•Account Nuber: 09058395471 \n\n2. UnionBank:\n•Account Name: RFIBERX\n•Account Number: 1096-6732-3727\n\n3.Cash Payment:\n•Visit our official office location.\n\nNote: All transactions and payment are strictly non-refundable.`
                };
            } else if (msg.match(/(balance|magkano|balanse)/i)) {
                const data = accountRecoveryData.get(sender_psid);
                const accountNum = data ? data.account : null;
                
                if (!accountNum) {
                    userSessions.delete(sender_psid);
                    return { text: "We lost your account number. Please try the billing process again." };
                }

                try {
                    const billingSnapshot = await db.collectionGroup('billing_emails').get();
                    let amountDue = null;
                    billingSnapshot.forEach(doc => {
                        const billData = doc.data();
                        if ((billData.account === accountNum || billData.accountNumber === accountNum) && billData.amount) {
                            amountDue = billData.amount;
                        }
                    });

                    userSessions.delete(sender_psid);
                    // We keep accountRecoveryData so they can upload a receipt immediately after

                    if (amountDue) {
                        return { text: `Your current outstanding balance is: ₱${amountDue}.` };
                    } else {
                        return { text: "You have no bills to pay at the moment." };
                    }
                } catch (err) {
                    console.error("DB Error:", err);
                    return { text: `Sorry, there was an error accessing the database. Please try again later. (Error: ${err.message || err})` };
                }
            } else {
                return { text: "Would you like to check your 'Balance' or see 'Payment' methods?" };
            }
        } else if (userSessions.get(sender_psid) === 'ACCOUNT_INQUIRY_NAME') {
            try {
                const usersSnapshot = await db.collection('users').get();
                let matches = [];
                usersSnapshot.forEach(doc => {
                    const data = doc.data();
                    const name = (data.name || data.firstName || data.lastName || '').toLowerCase();
                    if (name && name.includes(msg)) {
                        matches.push(data);
                    }
                });

                if (matches.length > 0) {
                    accountRecoveryData.set(sender_psid, { matches: matches, currentIndex: 0, tries: 0 });
                    userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_CONFIRM');
                    const firstMatch = matches[0];
                    const matchedName = firstMatch.name || firstMatch.firstName || firstMatch.lastName || 'Unknown';
                    return { text: `We found an account for ${matchedName}. Is this you? (Yes/No)` };
                } else {
                    return { text: "We couldn't find an account with that name. Please try another name or type 'Cancel' to stop." };
                }
            } catch (err) {
                console.error("DB Error:", err);
                return { text: `Sorry, there was an error accessing the database. Please try again later. (Error: ${err.message || err})` };
            }
        } else if (userSessions.get(sender_psid) === 'ACCOUNT_INQUIRY_CONFIRM') {
            const data = accountRecoveryData.get(sender_psid);
            if (!data || !data.matches) {
                userSessions.delete(sender_psid);
                return { text: "Session expired. Please start again." };
            }

            if (msg.match(/(yes|oo|ako|proceed)/i)) {
                const match = data.matches[data.currentIndex];
                const accountNum = match.account || match.accountNumber || 'Not found';
                const pass = match.password || 'Not set';
                
                accountRecoveryData.set(sender_psid, { account: accountNum, password: pass });
                userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_PASSWORD');
                return { text: `Great! Your Account Number is ${accountNum}.\n\nWould you also like to see your password? (Yes/No)` };
            } else if (msg.match(/(no|hindi)/i)) {
                data.currentIndex++;
                data.tries = (data.tries || 0) + 1;
                
                if (data.tries >= 5) {
                    userSessions.delete(sender_psid);
                    accountRecoveryData.delete(sender_psid);
                    return { text: "We've reached the maximum number of attempts. Please wait, and our agent will assist you shortly." };
                } else if (data.currentIndex < data.matches.length) {
                    const nextMatch = data.matches[data.currentIndex];
                    const matchedName = nextMatch.name || nextMatch.firstName || nextMatch.lastName || 'Unknown';
                    return { text: `How about ${matchedName}? Is this you? (Yes/No)` };
                } else {
                    userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_NAME');
                    accountRecoveryData.delete(sender_psid);
                    return { text: "We couldn't find any other matching accounts. Please try a different name, or wait for an agent." };
                }
            } else {
                return { text: "Please reply with 'Yes' if this is your account, or 'No' to check the next match." };
            }
        } else if (userSessions.get(sender_psid) === 'ACCOUNT_INQUIRY_PASSWORD') {
            if (msg.match(/(yes|oo|sige)/i)) {
                const data = accountRecoveryData.get(sender_psid);
                const pass = data ? data.password : 'Not set';
                userSessions.delete(sender_psid);
                accountRecoveryData.delete(sender_psid);
                return { text: `Your password is: ${pass}\n\nThank you for choosing RFiberX!` };
            } else if (msg.match(/(no|hindi)/i)) {
                userSessions.delete(sender_psid);
                accountRecoveryData.delete(sender_psid);
                return { text: "Okay! Thank you for choosing RFiberX!" };
            } else {
                return { text: "Would you like to see your password? Please reply 'Yes' or 'No'." };
            }
        }
    }

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

    // =========================================================================
    // 🔍 SECTION 2: INTENT CLASSIFICATION & KEYWORD MATCHING
    // This block determines what the user wants to do based on trigger words.
    // =========================================================================
    let ai_decision = null;
    if (msg.match(/(wala|wla|nawala|putol|mabagal|red light|los)/i)) {
        ai_decision = 'TECHNICAL_SUPPORT';
    } else if (msg.match(/(lipat|relocate|transfer|move|ibang bahay)/i)) {
        ai_decision = 'RELOCATION';
    } else if (msg.match(/(bayad|magkano|gcash|payment|bill|resibo|magbayad|pano magbayad|payment method|saan magbabayad)/i)) {
        ai_decision = 'BILLING';
    } else if (msg.match(/(apply|kabit|pakabit|install|\bbago\b|\bhi\b|\bhello\b|eto po ba|rfiberx)/i)) {
        ai_decision = 'APPLICATION';
    } else if (msg.match(/(account number|ano account ko|forgot account|forgot password|portal password|account info|my account)/i)) {
        ai_decision = 'ACCOUNT_INQUIRY';
    } else if (msg.match(/(password|wifi pass|change pass)/i)) {
        ai_decision = 'CHANGE_PASSWORD';
    } else if (msg.match(/(hello|hi|good morning|good afternoon|good evening|test)/i)) {
        ai_decision = 'GREETING';
    } else if (msg.match(/(plans|packages|magkano plan|internet plans|speeds|options)/i)) {
        ai_decision = 'PLANS';
    } else if (msg.match(/(area|location|covered ba|available ba sa|serviceable|address|sakop)/i)) {
        ai_decision = 'AREA_INQUIRY';
    } else if (msg.match(/(cancel|stop|ayoko|no|hindi|agent|support|tao|operator|customer service)/i)) {
        ai_decision = 'UNKNOWN'; // Hand over to agent
    }

    if (!ai_decision) {
        // Second Line of Defense: Gemini AI for complex sentences (TEMPORARILY DISABLED)
        /*
        try {
            // Fetch Gemini API key from Firestore
            const apiKeyDoc = await db.collection('settings').doc('apiKeys').get();
            let apiKey = '';
            if (apiKeyDoc.exists && apiKeyDoc.data().gemini) {
                apiKey = apiKeyDoc.data().gemini;
            }
            if (!apiKey) throw new Error("Gemini API Key missing from Firestore");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
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

            let result = null;
            let retries = 3;
            while (retries > 0) {
                try {
                    result = await model.generateContent(prompt);
                    break; // Success, break out of loop
                } catch (apiError) {
                    if (apiError.status === 503 && retries > 1) {
                        console.warn("Gemini 503 Overloaded. Retrying in 2 seconds...");
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        retries--;
                    } else {
                        throw apiError;
                    }
                }
            }

            ai_decision = result.response.text().trim();
            console.log("🤖 Gemini Classified Intent as: " + ai_decision);
        } catch (error) {
            console.error("Gemini Error:", error);
            return { text: "We apologize, but we encountered a system error: " + error.message };
        }
        */
        console.log("🤖 Gemini is temporarily disabled. No keywords matched. Remaining silent.");
    } else {
        console.log("⚡ Fast Keyword Matched Intent as: " + ai_decision);
    }

    // =========================================================================
    // 💬 SECTION 3: INITIAL RESPONSES & FLOW STARTERS
    // This block starts a conversation flow or sends a direct response based on 
    // the intent classified in Section 2.
    // =========================================================================
    switch (ai_decision) {
        case 'TECHNICAL_SUPPORT':
            userSessions.set(sender_psid, 'TECH_SUPPORT_STEP_1');
            return { text: "We apologize for the inconvenience. Are you experiencing Slow Internet, No Internet, or Red light flashing?\n\n*(Note: If you ever need to speak with a human support agent instead, just type \"Agent\".)*" };

        case 'RELOCATION':
            userSessions.set(sender_psid, 'RELOCATION_STEP_1');
            return { text: "Good day! Relocating your internet connection requires a relocation fee. Would you like to proceed with the relocation request? Please reply with 'Yes' to proceed, or 'Cancel' to stop.\n\n*(Note: If you need to speak with a human agent to discuss this, just type \"Agent\".)*" };

        case 'APPLICATION':
            userSessions.set(sender_psid, 'APPLICATION_STEP_1');
            return { text: "Good day! Are you interested in applying for a new RFiberX internet connection? You can sign up quickly on our website: https://rfiberx.net/apply, or we can do it right here. Would you like to apply here? Please reply with 'Yes' to proceed, or 'Cancel' to stop." };

        case 'BILLING':
            userSessions.set(sender_psid, 'BILLING_STEP_1');
            return { text: "Good day! To assist you with billing, please provide your Account Number. If you forgot your account number, please reply with 'Forgot'." };

        case 'PLANS':
            return {
                text: `Good day! Here are our available RFIBERX internet plans:
• 30 Mbps – ₱800
• 50 Mbps – ₱1,000
• 70 Mbps – ₱1,300
• 100 Mbps – ₱1,500
• 200 Mbps – ₱2,000
• 500 Mbps – ₱4,500

For inquiries or applications, kindly message us with your preferred plan and contact details. Our team will assist you with the application process.

Thank you for choosing RFIBERX Telecom!` };

        case 'CHANGE_PASSWORD':
            userSessions.set(sender_psid, 'CHANGE_PASSWORD_STEP_1');
            return {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "To change your WiFi password, you need to access your router's gateway. Try clicking the buttons below until you find the one that works for your router.\n\nOnce you find the correct one, PLEASE REPLY to this chat with the correct gateway (e.g. '192.168.1.1') so I can send you the exact step-by-step tutorial!",
                        buttons: [
                            {
                                type: "web_url",
                                url: "http://192.168.1.1",
                                title: "192.168.1.1"
                            },
                            {
                                type: "web_url",
                                url: "http://192.168.100.1",
                                title: "192.168.100.1"
                            },
                            {
                                type: "web_url",
                                url: "http://192.168.8.1",
                                title: "192.168.8.1"
                            }
                        ]
                    }
                }
            };

        case 'AREA_INQUIRY':
            return {
                text: `Good day! To check if your location is covered by RFIBERX and available for installation, kindly provide:
• Complete Name:
• Phone Number:
• Complete Address:
• Email Address:

RFIBERX service is currently available in selected areas, including Magdalena and Majayjay. Our team will verify the exact coverage, NAP/port availability, and installation feasibility at your address.

Thank you for choosing RFIBERX Telecom!` };

        case 'ACCOUNT_INQUIRY':
            userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_NAME');
            return { text: "To help you find your account details, please provide your Full Name." };

        case 'GREETING':
            return { text: "Hello! I am the RFiberX Auto-Bot. How can I help you today? Please type your inquiry or concern (for example: 'Slow internet', 'Billing inquiry', or 'I want to apply') so we can assist you properly." };

        case 'UNKNOWN':
            return { text: "I am connecting you to a human agent now. Please wait.", isHandover: true };

        default:
            return null;
    }
}

// Intercept getAutoReply to append persistent reminder
const originalGetAutoReply = getAutoReply;
getAutoReply = async function(text, sender_psid) {
    let reply = await originalGetAutoReply(text, sender_psid);
    if (!reply) return null;

    // Check if they have a pending bill
    const recovery = accountRecoveryData.get(sender_psid);
    if (recovery && recovery.account) {
        try {
            const pendingQuery = await db.collectionGroup('billing_emails')
                .where('accountNumber', '==', recovery.account)
                .where('status', '==', 'Pending Verification')
                .limit(1).get();
                
            if (!pendingQuery.empty) {
                reply.text += "\n\n*(Reminder: Your billing statement is currently Waiting for approval.)*";
            }
        } catch (e) {
            console.error("Reminder check error:", e);
        }
    }
    return reply;
}

// -------------------------------------------------------------------------
// REAL-TIME PAID LISTENER
// Proactively notifies clients when their bill is approved
// -------------------------------------------------------------------------
db.collectionGroup('billing_emails').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
            const data = change.doc.data();
            
            // If the status was just changed to Paid and hasn't been notified yet
            if (data.status === 'Paid' && data.botNotifiedPaid !== true) {
                try {
                    // Find the client's PSID using the account number
                    const acct = data.accountNumber || data.account;
                    if (acct) {
                        const psidSnap = await db.collection('messenger_psids').where('account', '==', acct).limit(1).get();
                        if (!psidSnap.empty) {
                            const psid = psidSnap.docs[0].id;
                            
                            // Send proactive message
                            await callSendAPI(psid, { 
                                text: `🎉 Great news! Your recent payment has been verified and your billing statement is now officially marked as Paid. Thank you!` 
                            });
                            
                            // Mark as notified so it doesn't spam
                            await change.doc.ref.update({ botNotifiedPaid: true });
                        }
                    }
                } catch(e) {
                    console.error("Failed to send paid notification:", e);
                }
            }
        }
    });
});

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

// Process Image Attachment using Gemini Vision
async function processImageAttachment(imageUrl, sender_psid) {
    const data = accountRecoveryData.get(sender_psid);
    const accountNum = data ? data.account : null;
    
    if (!accountNum) {
        userSessions.set(sender_psid, 'BILLING_STEP_1');
        return { text: "We received an image, but we need your Account Number first. Please provide your Account Number, or reply 'Forgot' if you don't know it." };
    }

    try {
        console.log("📸 Processing image receipt...");
        // Fetch Gemini API key
        const apiKeyDoc = await db.collection('settings').doc('apiKeys').get();
        let apiKey = '';
        if (apiKeyDoc.exists && apiKeyDoc.data().gemini) {
            apiKey = apiKeyDoc.data().gemini;
        }
        if (!apiKey) {
            console.error("Gemini API Key missing");
            return null;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Download image and convert to Base64
        const imageResp = await fetch(imageUrl);
        const buffer = await imageResp.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");
        
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
            }
        };

        const prompt = `I need you to scan this GCash/UnionBank receipt image and extract text.
Reply ONLY with a strictly formatted JSON object without markdown formatting. If it is NOT a receipt, reply with {"error": "NOT_A_RECEIPT"}.
If it IS a receipt, extract:
{
  "referenceNumber": "The 13-digit reference number",
  "amount": "Numeric amount (e.g. 1500)",
  "date": "Full date",
  "senderName": "Name of the sender",
  "receiverName": "Name of the receiver"
}`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        // Clean JSON formatting
        let jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let extracted = JSON.parse(jsonStr);

        if (extracted.error === "NOT_A_RECEIPT") {
            console.log("❌ Image is not a receipt. Ignoring.");
            return null; // silently ignore
        }

        const refNo = extracted.referenceNumber ? String(extracted.referenceNumber).replace(/[^0-9]/g, '') : '';
        if (refNo.length !== 13) {
            return { text: `🚨 FRAUD DETECTED 🚨\n\nInvalid GCash Reference Number. A valid GCash Reference Number must be exactly 13 digits.` };
        }

        // Duplicate Check
        const receiptsRef = db.collection('receipts');
        const q = receiptsRef.where("referenceNumber", "==", refNo);
        const dupCheck = await q.get();
        if (!dupCheck.empty) {
            return { text: `🚨 FRAUD DETECTED 🚨\n\nThis Reference Number (${refNo}) has already been used in another receipt. Submitting duplicate receipts is strictly prohibited.` };
        }

        // 1. Fetch Client Details
        let clientName = 'Unknown';
        let userId = null;
        
        const usersSnap = await db.collection('users').where('accountNumber', '==', accountNum).limit(1).get();
        if (!usersSnap.empty) {
            const userDoc = usersSnap.docs[0];
            const uData = userDoc.data();
            clientName = uData.name || uData.firstName || 'Unknown';
            userId = userDoc.id;
        } else {
            const usersSnap2 = await db.collection('users').where('account', '==', accountNum).limit(1).get();
            if (!usersSnap2.empty) {
                const userDoc2 = usersSnap2.docs[0];
                const uData2 = userDoc2.data();
                clientName = uData2.name || uData2.firstName || 'Unknown';
                userId = userDoc2.id;
            }
        }

        const now = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const billingMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        // 2. Save exactly matching client portal schema
        await receiptsRef.add({
            referenceNumber: refNo,
            amount: extracted.amount || 0,
            date: extracted.date || '',
            senderName: extracted.senderName || '',
            receiverName: extracted.receiverName || '',
            clientName: clientName,
            clientAccountNumber: accountNum,
            billingMonth: billingMonth,
            status: "Pending Verification",
            imageUrl: imageUrl,
            sender_psid: sender_psid, // Hidden tracker for bot notifications
            timestamp: FieldValue.serverTimestamp()
        });

        console.log("✅ Receipt saved successfully!");

        // 3. Update the billing statement status to Pending
        if (userId) {
            const billingSnap = await db.collection('users').doc(userId).collection('billing_emails').get();
            for (let docSnap of billingSnap.docs) {
                const status = docSnap.data().status || '';
                if (status.toLowerCase() !== 'paid' && status.toLowerCase() !== 'pending verification' && status.toLowerCase() !== 'pending') {
                    await docSnap.ref.update({ status: 'Pending Verification' });
                }
            }
        }

        return { text: "Thank you! Your payment receipt has been successfully received. Your billing statement is now marked as 'Waiting' for Admin approval." };

    } catch (err) {
        console.error("Error processing image receipt:", err);
        return { text: `Sorry, there was an error processing your receipt. Please try again later. (Error: ${err.message || err})` };
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

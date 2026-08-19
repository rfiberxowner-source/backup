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
                                let incomingMsg = webhook_event.message.quick_reply ? webhook_event.message.quick_reply.payload : webhook_event.message.text;
                                getAutoReply(incomingMsg, sender_psid).then(async replyMessage => {
                                    if (replyMessage) {
                                        if (Array.isArray(replyMessage)) {
                                            for (let msg of replyMessage) {
                                                if (msg.isHandover) {
                                                    await psidRef.set({ is_paused: true }, { merge: true });
                                                    delete msg.isHandover;
                                                }
                                                await callSendAPI(sender_psid, msg);
                                            }
                                        } else {
                                            if (replyMessage.isHandover) {
                                                psidRef.set({ is_paused: true }, { merge: true });
                                                delete replyMessage.isHandover;
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
async function getAccountDetails(accountNum, lastActive) {
    let unpaidBillsCount = 0;
    try {
        const billingSnapshot = await db.collectionGroup('billing_emails').get();
        billingSnapshot.forEach(doc => {
            const billData = doc.data();
            if (billData.account === accountNum || billData.accountNumber === accountNum) {
                const status = (billData.status || '').toLowerCase();
                if (status !== 'paid' && billData.amount) {
                    unpaidBillsCount++;
                }
            }
        });
    } catch(e) { console.error("Error fetching bills:", e); }

    let ticketCount = 0;
    try {
        const reportsSnapshot = await db.collection('reports').get();
        reportsSnapshot.forEach(doc => {
            const repData = doc.data();
            if (repData.accountNumber === accountNum || repData.account === accountNum) {
                ticketCount++;
            }
        });
    } catch(e) { console.error("Error fetching tickets:", e); }

    let lastActiveStr = "Account has not been activated yet";
    if (lastActive) {
        if (typeof lastActive === 'object' && typeof lastActive.toDate === 'function') {
            lastActiveStr = lastActive.toDate().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
        } else if (typeof lastActive === 'object' && lastActive._seconds) {
            lastActiveStr = new Date(lastActive._seconds * 1000).toLocaleString('en-US', { timeZone: 'Asia/Manila' });
        } else {
            lastActiveStr = String(lastActive);
        }
    }

    let details = `📌 Account Status:\n`;
    details += `• Last Online: ${lastActiveStr}\n`;
    details += `• Unpaid Billing Statements: ${unpaidBillsCount > 0 ? unpaidBillsCount : "None"}\n`;
    details += `• Support Tickets: ${ticketCount > 0 ? ticketCount : "None"}`;
    
    return details;
}

async function getAutoReply(text, sender_psid) {
    const msg = text.toLowerCase().trim();

    let clientName = "Valued Customer";
    let clientFullName = "";
    try {
        const response = await fetch(`https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`);
        const data = await response.json();
        if (data.first_name) {
            clientName = data.first_name;
            clientFullName = (data.first_name + " " + (data.last_name || "")).trim().toLowerCase();
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
        if (msg.startsWith('agent') || msg.match(/(agent|operator|tao|customer service)/i)) {
            const currentSession = userSessions.get(sender_psid) || "";
            userSessions.delete(sender_psid);
            accountRecoveryData.delete(sender_psid);
            
            let topic = "your concern";
            if (msg.includes('no_internet') || msg.includes('urgent') || msg.includes('red') || currentSession === 'TECH_SUPPORT_STEP_2') {
                topic = "no internet or red light flashing";
            } else if (msg.includes('slow') || msg.includes('mabagal')) {
                topic = "slow internet";
            } else if (currentSession.startsWith('TECH_SUPPORT')) {
                topic = "technical support";
            } else if (msg.includes('billing') || currentSession.startsWith('BILLING')) {
                topic = "billing and payments";
            } else if (msg.includes('application') || currentSession.startsWith('APPLICATION')) {
                topic = "your application";
            } else if (msg.includes('relocation') || currentSession.startsWith('RELOCATION')) {
                topic = "relocation";
            } else if (msg.includes('area') || currentSession.startsWith('AREA_INQUIRY')) {
                topic = "area inquiry";
            } else if (msg.includes('password') || currentSession.startsWith('CHANGE_PASSWORD')) {
                topic = "wifi password";
            } else if (msg.includes('account') || currentSession.startsWith('ACCOUNT')) {
                topic = "account inquiry";
            } else if (msg.includes('plans') || currentSession.startsWith('PLANS')) {
                topic = "internet plans";
            }
            
            return { 
                text: `You are transferred to the agent if you want to talk about ${topic}. Please wait for our team to be with you shortly.`, 
                isHandover: true 
            };
        }

        // Global escape hatch to cancel out of any flow
        if (msg.match(/(cancel|stop|ayoko)/i)) {
            userSessions.delete(sender_psid);
            accountRecoveryData.delete(sender_psid);
            return { 
                text: "Okay, we've cancelled that request. How else can I help you today?",
                quick_replies: [
                    { content_type: "text", title: "Technical Support", payload: "Technical Support" },
                    { content_type: "text", title: "Billing", payload: "Billing" },
                    { content_type: "text", title: "Apply Now", payload: "Apply Now" },
                    { content_type: "text", title: "Internet Plans", payload: "Internet Plans" },
                    { content_type: "text", title: "Change Password", payload: "Change Password" },
                    { content_type: "text", title: "Area Inquiry", payload: "Area Inquiry" },
                    { content_type: "text", title: "Relocation", payload: "Relocation" },
                    { content_type: "text", title: "Account Inquiry", payload: "Account Inquiry" }
                ]
            };
        }

        if (userSessions.get(sender_psid) === 'TECH_SUPPORT_STEP_1') {
            userSessions.delete(sender_psid); // Clear memory state

            if (msg.match(/(slow|mabagal|bagal)/i)) {
                return { 
                    text: `Hi ${clientName},\n\nThank you for reaching out. I am sorry to hear you are experiencing slow internet speeds, and I am happy to help get this sorted out for you.\n\nIn most cases, a quick restart of your equipment will refresh the connection and restore your normal speeds. Could you please try this quick step?\n\nRestart your equipment: Unplug the power cable from both your modem and your router. Wait for about 10 seconds, then plug them both back in. It will take a few minutes for the lights to stabilize and the connection to return.\n\nIf your internet is still running slow after doing this, please let me know if you wanna try another way to resolve the problem. Tell me if you wanna change the wifi password or wanna contact the support.`,
                    quick_replies: [
                        { content_type: "text", title: "Change Password", payload: "CHANGE_PASSWORD" },
                        { content_type: "text", title: "Agent", payload: "AGENT_SLOW_INTERNET" },
                        { content_type: "text", title: "Stop", payload: "Stop" }
                    ]
                };
            } else if (msg.match(/(no internet|wala|putol|los|red|flashing)/i)) {
                return { 
                    text: `Hi ${clientName},\n\nI am sorry to hear that your internet is completely down. I know how disruptive it is to lose your connection, and I am here to help get you back online as quickly as possible.\n\nTo help restore your service, please try the following steps:\n\nUnplug the power cord from both your modem and your router. Leave them unplugged for a full 10 seconds, then plug them back in. Wait about 3 to 5 minutes for the devices to fully reboot and establish a connection.\n\nAfter restarting, take a look at the lights on your modem. If the "Internet" or "Online" light is completely off or flashing red, it indicates the signal is not reaching your home.\n\nIf your internet is still down or the lights are showing an error after trying these steps, tap "Agent" and I will redirect you to our agent team to further solve the problem.`,
                    quick_replies: [
                        { content_type: "text", title: "Agent", payload: "AGENT_NO_INTERNET" },
                        { content_type: "text", title: "Cancel", payload: "Cancel" }
                    ]
                };
            } else {
                return { text: "Please clarify if you are experiencing Slow Internet, No Internet, or Red light flashing." };
            }
        } else if (userSessions.get(sender_psid) === 'RELOCATION_STEP_1') {
            if (msg.match(/(yes|oo|sige|proceed)/i)) {
                userSessions.set(sender_psid, 'RELOCATION_STEP_2');
                return {
                    text: `Good day! For site transfers or modem relocation, please send:
• Full Name:
• Account Name:
• Account ID / Number (Optional):
• Current Address:
• New Target Address:
• Active Contact Number:

Please note that relocation have a relocation fee, which will be discussed by our team. Our team will verify if there is an available NAP box/port at your new site and update you on the relocation process.

Thank you for choosing RFIBERX Telecom!` };
            } else {
                return { text: "Would you like to proceed with the relocation request? Please reply with 'Yes' to proceed, or 'Cancel' to stop." };
            }
        } else if (userSessions.get(sender_psid) === 'RELOCATION_STEP_2') {
            userSessions.delete(sender_psid); // Clear memory state
            return {
                text: "🚨 HIGH PRIORITY ALERT: Client submitted a Relocation Request. I am connecting you to our support team immediately to process this. Please wait.",
                isHandover: true
            };
        } else if (userSessions.get(sender_psid) === 'APPLICATION_STEP_1') {
            if (msg.match(/(yes|oo|sige|proceed)/i)) {
                userSessions.set(sender_psid, 'APPLICATION_STEP_2');
                return { text: `Great! Here are our available plans with details:
• 30 Mbps – ₱800 (Best for light browsing & social media)
• 50 Mbps – ₱1,000 (Ideal for work from home & HD streaming)
• 70 Mbps – ₱1,300 (Great for multiple devices & gaming)
• 100 Mbps – ₱1,500 (Perfect for heavy gaming & 4K streaming)
• 200 Mbps – ₱2,000 (For large families & heavy downloads)
• 500 Mbps – ₱4,500 (Ultra-fast for power users or small business)

To proceed, please provide the following details:
• Full Name:
• Complete Address:
• Phone Number:
• Plan or Speed you want:

Our team will check if your area is serviceable and contact you for installation!` };
            } else if (msg.match(/(no|hindi|ayaw)/i)) {
                userSessions.set(sender_psid, 'APPLICATION_STEP_2');
                return { text: "No problem! To proceed, please provide the following details:\n\n• Full Name:\n• Complete Address:\n• Phone Number:\n• Plan or Speed you want:\n\nOur team will check if your area is serviceable and contact you for installation!" };
            } else if (msg.length > 15) {
                // If they provided their details immediately
                userSessions.delete(sender_psid);
                return {
                    text: "🚨 HIGH PRIORITY ALERT: Client submitted a New Connection Application. I am connecting you to our support team immediately to process this. Please wait.",
                    isHandover: true
                };
            } else {
                return { text: "Would you like to see our available plans first? Please reply with 'Yes' or 'No'." };
            }
        } else if (userSessions.get(sender_psid) === 'APPLICATION_STEP_2') {
            userSessions.delete(sender_psid); // Clear memory state
            return {
                text: "🚨 HIGH PRIORITY ALERT: Client submitted a New Connection Application. I am connecting you to our support team immediately to process this. Please wait.",
                isHandover: true
            };
        } else if (userSessions.get(sender_psid) === 'AREA_INQUIRY_STEP_1') {
            if (msg.match(/(internet plans|plans)/i)) {
                userSessions.delete(sender_psid);
                return getAutoReply("internet plans", sender_psid);
            } else {
                userSessions.delete(sender_psid);
                return {
                    text: "🚨 HIGH PRIORITY ALERT: Client submitted an Area Inquiry. I am connecting you to our support team immediately to process this. Please wait.",
                    isHandover: true
                };
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
                return { text: "Please provide your Full Name or the name you remember for your account so we can search our database." };
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
                    return { 
                        text: `We found an account for ${matchedName}. Is this you?`,
                        quick_replies: [
                            { content_type: "text", title: "Yes", payload: "Yes" },
                            { content_type: "text", title: "No", payload: "No" },
                            { content_type: "text", title: "Cancel", payload: "Cancel" },
                            { content_type: "text", title: "Agent", payload: "Agent" }
                        ]
                    };
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
                
                accountRecoveryData.set(sender_psid, { account: accountNum });
                userSessions.set(sender_psid, 'BILLING_MENU');

                return { 
                    text: `Great! Your Account Number is ${accountNum}.\n\nWould you like to check your 'Balance' or see 'Payment' methods?`,
                    quick_replies: [
                        { content_type: "text", title: "Balance", payload: "Balance" },
                        { content_type: "text", title: "Payment", payload: "Payment" },
                        { content_type: "text", title: "Cancel", payload: "Cancel" },
                        { content_type: "text", title: "Agent", payload: "Agent" }
                    ]
                };
            } else if (msg.match(/(no|hindi)/i)) {
                data.currentIndex++;
                if (data.currentIndex < data.matches.length) {
                    const nextMatch = data.matches[data.currentIndex];
                    const matchedName = nextMatch.name || nextMatch.firstName || nextMatch.lastName || 'Unknown';
                    return { 
                        text: `How about ${matchedName}? Is this you?`,
                        quick_replies: [
                            { content_type: "text", title: "Yes", payload: "Yes" },
                            { content_type: "text", title: "No", payload: "No" },
                            { content_type: "text", title: "Cancel", payload: "Cancel" },
                            { content_type: "text", title: "Agent", payload: "Agent" }
                        ]
                    };
                } else {
                    userSessions.set(sender_psid, 'ACCOUNT_RECOVERY_NAME');
                    accountRecoveryData.delete(sender_psid);
                    return { text: "We couldn't find any other matching accounts. Please try a different name, or type 'Cancel' to stop." };
                }
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
                    let totalAmountDue = 0;
                    let unpaidBillsCount = 0;
                    
                    billingSnapshot.forEach(doc => {
                        const billData = doc.data();
                        if ((billData.account === accountNum || billData.accountNumber === accountNum)) {
                            const status = (billData.status || '').toLowerCase();
                            if (status !== 'paid' && billData.amount) {
                                let amt = String(billData.amount).replace(/[^0-9.-]+/g, "");
                                let parsed = parseFloat(amt);
                                if (!isNaN(parsed)) {
                                    totalAmountDue += parsed;
                                    unpaidBillsCount++;
                                }
                            }
                        }
                    });

                    userSessions.delete(sender_psid);
                    // We keep accountRecoveryData so they can upload a receipt immediately after

                    if (unpaidBillsCount > 0) {
                        const today = new Date().toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', month: 'long', day: 'numeric', year: 'numeric' });
                        return { text: `As of ${today}, your total outstanding balance is: ₱${totalAmountDue.toLocaleString()}.\n\nThis is a combined total of ${unpaidBillsCount} unpaid billing statement(s).` };
                    } else {
                        return { text: "You have no unpaid bills at the moment." };
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
                    return { 
                        text: `We found an account for ${matchedName}. Is this you?`,
                        quick_replies: [
                            { content_type: "text", title: "Yes", payload: "Yes" },
                            { content_type: "text", title: "No", payload: "No" },
                            { content_type: "text", title: "Cancel", payload: "Cancel" },
                            { content_type: "text", title: "Agent", payload: "Agent" }
                        ]
                    };
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
                const matchedName = (match.name || match.firstName || match.lastName || '').trim().toLowerCase();
                const accountNum = match.account || match.accountNumber || 'Not found';
                const pass = match.password || 'Not set';
                const plan = match.plan || 'none';
                
                if (clientFullName && matchedName === clientFullName) {
                    accountRecoveryData.set(sender_psid, { account: accountNum, password: pass });
                    userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_PASSWORD');
                    const detailsStr = await getAccountDetails(accountNum, match.lastActive);
                    return { 
                        text: `Great! Your Account Number is ${accountNum}.\n\n${detailsStr}\n\nWould you also like to see your password?`,
                        quick_replies: [
                            { content_type: "text", title: "Yes", payload: "Yes" },
                            { content_type: "text", title: "No", payload: "No" }
                        ]
                    };
                } else {
                    accountRecoveryData.set(sender_psid, { account: accountNum, password: pass, plan: plan, lastActive: match.lastActive });
                    userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_SECURITY_TEST');
                    return { 
                        text: "For security purposes, since this account name differs from your Facebook profile, please select the exact Internet Plan associated with this account.",
                        quick_replies: [
                            { content_type: "text", title: "30Mbps", payload: "30Mbps" },
                            { content_type: "text", title: "50Mbps", payload: "50Mbps" },
                            { content_type: "text", title: "70Mbps", payload: "70Mbps" },
                            { content_type: "text", title: "100Mbps", payload: "100Mbps" },
                            { content_type: "text", title: "200Mbps", payload: "200Mbps" },
                            { content_type: "text", title: "500Mbps", payload: "500Mbps" },
                            { content_type: "text", title: "Cancel", payload: "Cancel" }
                        ]
                    };
                }
            } else if (msg.match(/(no|hindi)/i)) {
                data.currentIndex++;
                
                if (data.currentIndex < data.matches.length) {
                    const nextMatch = data.matches[data.currentIndex];
                    const matchedName = nextMatch.name || nextMatch.firstName || nextMatch.lastName || 'Unknown';
                    return { 
                        text: `How about ${matchedName}? Is this you?`,
                        quick_replies: [
                            { content_type: "text", title: "Yes", payload: "Yes" },
                            { content_type: "text", title: "No", payload: "No" },
                            { content_type: "text", title: "Cancel", payload: "Cancel" },
                            { content_type: "text", title: "Agent", payload: "Agent" }
                        ]
                    };
                } else {
                    userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_NAME');
                    accountRecoveryData.delete(sender_psid);
                    return { text: "We couldn't find any other matching accounts. Please try a different name, or type 'Cancel' to stop." };
                }
            } else {
                return { text: "Please reply with 'Yes' if this is your account, or 'No' to check the next match." };
            }
        } else if (userSessions.get(sender_psid) === 'ACCOUNT_INQUIRY_SECURITY_TEST') {
            const data = accountRecoveryData.get(sender_psid);
            if (!data) {
                userSessions.delete(sender_psid);
                return { text: "Session expired. Please start again." };
            }
            
            // Extract the numbers from both the DB plan and the user's msg to handle variations like "30Mbps", "30 Mbps", or just "30"
            const expectedPlanNum = (String(data.plan).match(/\d+/) || [])[0];
            const providedPlanNum = (msg.match(/\d+/) || [])[0];

            if (expectedPlanNum && providedPlanNum && expectedPlanNum === providedPlanNum) {
                userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_PASSWORD');
                const detailsStr = await getAccountDetails(data.account, data.lastActive);
                return { 
                    text: `Verification successful!\n\nYour Account Number is ${data.account}.\n\n${detailsStr}\n\nWould you also like to see your password?`,
                    quick_replies: [
                        { content_type: "text", title: "Yes", payload: "Yes" },
                        { content_type: "text", title: "No", payload: "No" }
                    ]
                };
            } else {
                userSessions.delete(sender_psid);
                accountRecoveryData.delete(sender_psid);
                return {
                    text: "Due to the security test and mismatching of details, I cannot provide you the details of this account. I will transfer you to our human agent who can better assist you with account verification. Please wait.",
                    isHandover: true
                };
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
                return {
                    text: "Okay, we've cancelled that request. How else can I help you today?",
                    quick_replies: [
                        { content_type: "text", title: "Technical Support", payload: "Technical Support" },
                        { content_type: "text", title: "Billing", payload: "Billing" },
                        { content_type: "text", title: "Apply Now", payload: "Apply Now" },
                        { content_type: "text", title: "Internet Plans", payload: "Internet Plans" },
                        { content_type: "text", title: "Change Password", payload: "Change Password" },
                        { content_type: "text", title: "Area Inquiry", payload: "Area Inquiry" },
                        { content_type: "text", title: "Relocation", payload: "Relocation" },
                        { content_type: "text", title: "Account Inquiry", payload: "Account Inquiry" }
                    ]
                };
            } else {
                return { text: "Would you like to see your password? Please reply 'Yes' or 'No'." };
            }
        } else if (userSessions.get(sender_psid) === 'REMOVE_ACCOUNT_CONFIRM') {
            if (msg.match(/(yes|oo|proceed)/i)) {
                userSessions.set(sender_psid, 'REMOVE_ACCOUNT_VERIFY');
                return { text: "For your security, please provide the exact Account Number or the Full Name of the account you want to remove." };
            } else {
                userSessions.delete(sender_psid);
                accountRecoveryData.delete(sender_psid);
                return { text: "Okay, we have cancelled the account removal process. Your account is still saved." };
            }
        } else if (userSessions.get(sender_psid) === 'REMOVE_ACCOUNT_VERIFY') {
            const data = accountRecoveryData.get(sender_psid);
            const savedAccountNum = data ? data.accountToRemove : null;
            if (!savedAccountNum) {
                userSessions.delete(sender_psid);
                return { text: "Session expired. Please try again." };
            }
            
            let accountName = "Unknown";
            try {
                const usersSnapshot = await db.collection('users').where('account', '==', savedAccountNum).limit(1).get();
                if (!usersSnapshot.empty) {
                    const userData = usersSnapshot.docs[0].data();
                    accountName = (userData.name || userData.firstName || userData.lastName || '').trim().toLowerCase();
                }
            } catch (err) {}
            
            if (msg === savedAccountNum.toLowerCase() || (accountName !== "unknown" && msg.includes(accountName))) {
                try {
                    await db.collection('messenger_psids').doc(sender_psid).update({
                        account: FieldValue.delete()
                    });
                    userSessions.delete(sender_psid);
                    accountRecoveryData.delete(sender_psid);
                    return { text: "Success! The account has been removed from your profile." };
                } catch(e) {
                    console.error("Error deleting account:", e);
                    return { text: "An error occurred while removing your account. Please try again later." };
                }
            } else {
                return { text: "The details you provided do not match the saved account. Please try again or type 'Cancel' to stop." };
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
    if (msg.match(/(wala|wla|nawala|putol|mabagal|red light|los|technical support)/i)) {
        ai_decision = 'TECHNICAL_SUPPORT';
    } else if (msg.match(/(change account|palit account|ibang account)/i)) {
        ai_decision = 'CHANGE_ACCOUNT';
    } else if (msg.match(/(remove account|tanggalin account|delete account)/i)) {
        ai_decision = 'REMOVE_ACCOUNT';
    } else if (msg.match(/(lipat|relocate|relocation|transfer|\bmove\b|ibang bahay)/i)) {
        ai_decision = 'RELOCATION';
    } else if (msg.match(/(bayad|magkano|gcash|payment|bill|billing|resibo|magbayad|pano magbayad|payment method|saan magbabayad)/i)) {
        ai_decision = 'BILLING';
    } else if (msg.match(/(apply|apply now|kabit|pakabit|install|\bbago\b|eto po ba|rfiberx)/i)) {
        ai_decision = 'APPLICATION';
    } else if (msg.match(/(account number|account inquiry|ano account ko|forgot account|forgot password|portal password|account info|my account)/i)) {
        ai_decision = 'ACCOUNT_INQUIRY';
    } else if (msg.match(/(password|change password|wifi pass|change pass)/i)) {
        ai_decision = 'CHANGE_PASSWORD';
    } else if (msg.match(/(hello|hi|good morning|good afternoon|good evening|test)/i)) {
        ai_decision = 'GREETING';
    } else if (msg.match(/(plans|packages|magkano plan|internet plans|speeds|options)/i)) {
        ai_decision = 'PLANS';
    } else if (msg.match(/(area|location|covered ba|available ba sa|serviceable|address|sakop)/i)) {
        ai_decision = 'AREA_INQUIRY';
    } else if (msg.match(/(cancel|stop|ayoko)/i)) {
        ai_decision = 'CANCEL';
    } else if (msg.match(/(no|hindi|agent|support|tao|operator|customer service)/i)) {
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
            return { 
                text: "We apologize for the inconvenience. Are you experiencing Slow Internet, No Internet, or Red light flashing?\n\n*(Note: If you ever need to speak with a human support agent instead, just tap \"Agent\".)*",
                quick_replies: [
                    { content_type: "text", title: "Slow Internet", payload: "Slow Internet" },
                    { content_type: "text", title: "No Internet", payload: "No Internet" },
                    { content_type: "text", title: "Red Light Flashing", payload: "Red Light Flashing" },
                    { content_type: "text", title: "Agent", payload: "Agent" }
                ]
            };

        case 'RELOCATION':
            userSessions.set(sender_psid, 'RELOCATION_STEP_1');
            return { 
                text: "Good day! Relocating your internet connection requires a relocation fee. Would you like to proceed with the relocation request? Please reply with 'Yes' to proceed, or 'Cancel' to stop.\n\n*(Note: If you need to speak with a human agent to discuss this, just tap \"Agent\".)*",
                quick_replies: [
                    { content_type: "text", title: "Yes", payload: "Yes" },
                    { content_type: "text", title: "Cancel", payload: "Cancel" },
                    { content_type: "text", title: "Agent", payload: "URGENT_TECH_AGENT" }
                ]
            };

        case 'APPLICATION':
            userSessions.set(sender_psid, 'APPLICATION_STEP_1');
            return { 
                text: "Good day! To apply for a new RFiberX internet connection, please provide the following details:\n• Full Name:\n• Complete Address:\n• Phone Number:\n• Plan or Speed you want:\n\nWould you like to see our available plans first?",
                quick_replies: [
                    { content_type: "text", title: "Yes", payload: "Yes" },
                    { content_type: "text", title: "No", payload: "No" },
                    { content_type: "text", title: "Agent", payload: "URGENT_TECH_AGENT" }
                ]
            };

        case 'BILLING':
            try {
                const psidDoc = await db.collection('messenger_psids').doc(sender_psid).get();
                const savedAccount = psidDoc.exists ? psidDoc.data().account : null;
                
                if (savedAccount) {
                    accountRecoveryData.set(sender_psid, { account: savedAccount });
                    userSessions.set(sender_psid, 'BILLING_MENU');
                    return { 
                        text: `Welcome back! I see your Account Number is ${savedAccount}.\n\nWould you like to check your 'Balance' or see 'Payment' methods?`,
                        quick_replies: [
                            { content_type: "text", title: "Balance", payload: "Balance" },
                            { content_type: "text", title: "Payment", payload: "Payment" },
                            { content_type: "text", title: "Cancel", payload: "Cancel" },
                            { content_type: "text", title: "Agent", payload: "Agent" }
                        ]
                    };
                }
            } catch (err) {
                console.error("Error checking saved account:", err);
            }

            userSessions.set(sender_psid, 'BILLING_STEP_1');
            return { 
                text: "Good day! To assist you with billing, please provide your Account Number. If you forgot your account number, please tap 'Forgot'.",
                quick_replies: [
                    { content_type: "text", title: "Forgot", payload: "Forgot" },
                    { content_type: "text", title: "Cancel", payload: "Cancel" },
                    { content_type: "text", title: "Agent", payload: "Agent" }
                ]
            };

        case 'PLANS':
            userSessions.set(sender_psid, 'APPLICATION_STEP_2');
            return {
                text: `Good day! Here are our available RFIBERX internet plans with details:
• 30 Mbps – ₱800 (Best for light browsing & social media)
• 50 Mbps – ₱1,000 (Ideal for work from home & HD streaming)
• 70 Mbps – ₱1,300 (Great for multiple devices & gaming)
• 100 Mbps – ₱1,500 (Perfect for heavy gaming & 4K streaming)
• 200 Mbps – ₱2,000 (For large families & heavy downloads)
• 500 Mbps – ₱4,500 (Ultra-fast for power users or small business)

For inquiries or applications, kindly provide your preferred plan and the following details:
• Full Name:
• Complete Address:
• Phone Number:
• Plan or Speed you want:`,
                quick_replies: [
                    { content_type: "text", title: "Cancel", payload: "Cancel" },
                    { content_type: "text", title: "Agent", payload: "Agent" }
                ]
            };

        case 'CHANGE_PASSWORD':
            userSessions.set(sender_psid, 'CHANGE_PASSWORD_STEP_1');
            return {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "To change your WiFi password, you need to access your router's gateway. Try clicking the buttons below until you find the one that works for your router.\n\nOnce you find the correct one, PLEASE CLICK the corresponding quick reply below so I can send you the exact step-by-step tutorial!",
                        buttons: [
                            {
                                type: "web_url",
                                url: "http://192.168.1.1",
                                title: "Link: 192.168.1.1"
                            },
                            {
                                type: "web_url",
                                url: "http://192.168.100.1",
                                title: "Link: 192.168.100.1"
                            },
                            {
                                type: "web_url",
                                url: "http://192.168.8.1",
                                title: "Link: 192.168.8.1"
                            }
                        ]
                    }
                },
                quick_replies: [
                    { content_type: "text", title: "192.168.1.1", payload: "192.168.1.1" },
                    { content_type: "text", title: "192.168.100.1", payload: "192.168.100.1" },
                    { content_type: "text", title: "192.168.8.1", payload: "192.168.8.1" },
                    { content_type: "text", title: "Cancel", payload: "Cancel" }
                ]
            };

        case 'AREA_INQUIRY':
            userSessions.set(sender_psid, 'AREA_INQUIRY_STEP_1');
            return {
                text: `Good day! To check if your location is covered by RFIBERX and available for installation, kindly provide:
• Complete Name:
• Phone Number:
• Complete Address:
• Location (e.g. Majayjay, Magdalena, or Sta. Cruz):
• Email Address:

RFIBERX service is currently available in selected areas, including Magdalena, Majayjay, and Sta. Cruz. Our team will verify the exact coverage, NAP/port availability, and installation feasibility at your address.

Would you also like to see our internet plans?`,
                quick_replies: [
                    { content_type: "text", title: "Internet Plans", payload: "Internet Plans" },
                    { content_type: "text", title: "Cancel", payload: "Cancel" },
                    { content_type: "text", title: "Agent", payload: "Agent" }
                ]
            };

        case 'ACCOUNT_INQUIRY':
            userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_NAME');
            return { text: "To help you find your account details, please provide your Full Name or the name you remember for your account." };

        case 'GREETING':
            return {
                text: "Hello! I am the RFiberX Auto-Bot. How can I help you today? Please choose from the options below, or type your specific question:",
                quick_replies: [
                    { content_type: "text", title: "Technical Support", payload: "Technical Support" },
                    { content_type: "text", title: "Billing", payload: "Billing" },
                    { content_type: "text", title: "Apply Now", payload: "Apply Now" },
                    { content_type: "text", title: "Internet Plans", payload: "Internet Plans" },
                    { content_type: "text", title: "Change Password", payload: "Change Password" },
                    { content_type: "text", title: "Area Inquiry", payload: "Area Inquiry" },
                    { content_type: "text", title: "Relocation", payload: "Relocation" },
                    { content_type: "text", title: "Account Inquiry", payload: "Account Inquiry" }
                ]
            };

        case 'CANCEL':
            return {
                text: "Okay, we've cancelled that request. How else can I help you today?",
                quick_replies: [
                    { content_type: "text", title: "Technical Support", payload: "Technical Support" },
                    { content_type: "text", title: "Billing", payload: "Billing" },
                    { content_type: "text", title: "Apply Now", payload: "Apply Now" },
                    { content_type: "text", title: "Internet Plans", payload: "Internet Plans" },
                    { content_type: "text", title: "Change Password", payload: "Change Password" },
                    { content_type: "text", title: "Area Inquiry", payload: "Area Inquiry" },
                    { content_type: "text", title: "Relocation", payload: "Relocation" },
                    { content_type: "text", title: "Account Inquiry", payload: "Account Inquiry" }
                ]
            };

        case 'CHANGE_ACCOUNT':
            userSessions.set(sender_psid, 'ACCOUNT_INQUIRY_NAME');
            return { text: "To change the account saved to your profile, please provide the Full Name or the name you remember for the new account you want to link." };

        case 'REMOVE_ACCOUNT':
            try {
                const psidDoc = await db.collection('messenger_psids').doc(sender_psid).get();
                const savedAccount = psidDoc.exists ? psidDoc.data().account : null;
                if (!savedAccount) {
                    return { text: "You don't have an account saved to your profile right now." };
                }

                let accountName = savedAccount;
                const usersSnapshot = await db.collection('users').where('account', '==', savedAccount).limit(1).get();
                if (!usersSnapshot.empty) {
                    const data = usersSnapshot.docs[0].data();
                    accountName = data.name || data.firstName || data.lastName || savedAccount;
                }

                accountRecoveryData.set(sender_psid, { accountToRemove: savedAccount });
                userSessions.set(sender_psid, 'REMOVE_ACCOUNT_CONFIRM');
                return { 
                    text: `Are you sure you want to remove the currently saved account (${accountName}) from your profile?`,
                    quick_replies: [
                        { content_type: "text", title: "Yes", payload: "Yes" },
                        { content_type: "text", title: "No", payload: "No" }
                    ]
                };
            } catch (err) {
                console.error("Error fetching account for removal:", err);
                return { text: "Sorry, there was an error accessing your account details." };
            }

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
    let accountNum = null;
    
    // 1. Check current session memory
    const data = accountRecoveryData.get(sender_psid);
    if (data && data.account) {
        accountNum = data.account;
    }

    // 2. If not in memory, check permanent Firestore memory
    if (!accountNum) {
        try {
            const psidDoc = await db.collection('messenger_psids').doc(sender_psid).get();
            if (psidDoc.exists && psidDoc.data().account) {
                accountNum = psidDoc.data().account;
                // Cache it for future messages in this session
                accountRecoveryData.set(sender_psid, { account: accountNum });
            }
        } catch (e) {
            console.error("Error fetching saved account for image processing:", e);
        }
    }
    
    // 3. If still no account, force them to provide it
    if (!accountNum) {
        userSessions.set(sender_psid, 'BILLING_STEP_1');
        return { text: "We received an image, but we need your Account Number first. Please provide your Account Number, or reply 'Forgot' if you don't know it." };
    }

    try {
        console.log("📸 Processing image receipt...");
        // Send a reassuring "please wait" message
        await callSendAPI(sender_psid, { text: "📷 We've received your image! Please wait a moment while our system securely scans and processes your receipt..." });

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
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

        let result = null;
        let retries = 3;
        while (retries > 0) {
            try {
                result = await model.generateContent([prompt, imagePart]);
                break; // Success
            } catch (apiError) {
                if (apiError.status === 503 && retries > 1) {
                    console.warn(`Gemini 503 Overloaded. Retrying in 3 seconds... (${retries - 1} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    retries--;
                } else {
                    throw apiError; // Throw if it's not a 503 or we ran out of retries
                }
            }
        }

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

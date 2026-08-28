const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

const target1 = `                psidRef.get().then(doc => {
                    let is_paused = false;
                    let lastInteractionTime = 0;
                    if (doc.exists) {
                        const data = doc.data();
                        is_paused = data.is_paused === true;
                        if (data.lastInteraction) {
                            lastInteractionTime = data.lastInteraction.toMillis();
                        }
                    }`;

const replace1 = `                psidRef.get().then(async doc => {
                    let is_paused = false;
                    let lastInteractionTime = 0;
                    let existingName = null;
                    if (doc.exists) {
                        const data = doc.data();
                        is_paused = data.is_paused === true;
                        existingName = data.name;
                        if (data.lastInteraction) {
                            lastInteractionTime = data.lastInteraction.toMillis();
                        }
                    }`;

const target2 = `                    let psidPayload = {
                        psid: sender_psid,
                        lastMessage: webhook_event.message?.text || "",
                        lastInteraction: FieldValue.serverTimestamp(),
                        is_paused: is_paused
                    };
                    if (linkedAccount) {
                        psidPayload.account = linkedAccount;
                    }`;

const replace2 = `                    let psidPayload = {
                        psid: sender_psid,
                        lastMessage: webhook_event.message?.text || "",
                        lastInteraction: FieldValue.serverTimestamp(),
                        is_paused: is_paused
                    };

                    // Fetch Facebook name if we don't have it saved yet
                    if (!existingName) {
                        try {
                            const response = await fetch(\`https://graph.facebook.com/\${sender_psid}?fields=first_name,last_name,name&access_token=\${PAGE_ACCESS_TOKEN}\`);
                            const data = await response.json();
                            if (data.name) {
                                psidPayload.name = data.name;
                            } else if (data.first_name) {
                                psidPayload.name = (data.first_name + " " + (data.last_name || "")).trim();
                            }
                        } catch (e) {
                            console.error("Error fetching Facebook name:", e);
                        }
                    }

                    if (linkedAccount) {
                        psidPayload.account = linkedAccount;
                    }`;

c = c.replace(target1, replace1);
c = c.replace(target2, replace2);

fs.writeFileSync('server.js', c);

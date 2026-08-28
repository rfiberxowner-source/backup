const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
c = c.replace(/                        if \(ALLOWED_TESTERS\.includes\(sender_psid\)\) \{/, `                        if (ALLOWED_TESTERS.includes(sender_psid)) {
                            console.log("✔️ Allowed PSID chatting: " + sender_psid);`);
c = c.replace(/                            \} else if \(webhook_event\.message\.attachments && webhook_event\.message\.attachments\[0\]\.type === 'image'\) \{/, `                            } else if (webhook_event.message.attachments && webhook_event.message.attachments[0].type === 'image') {`);
c = c.replace(/                            \}\r?\n                        \}\r?\n                    \}\r?\n                \}\)\.catch/, `                            }
                        } else {
                            console.log("❌ REJECTED UNKNOWN PSID: " + sender_psid + " (Tell Jasper to copy this exact number!)");
                        }
                    }
                }).catch`);
fs.writeFileSync('server.js', c);

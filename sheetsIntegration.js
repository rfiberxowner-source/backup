import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPREADSHEET_ID = '110f013_8ZR7Uy_lLnRKER6oK8jxrPwZmJGkudESjObo';
const KEYFILEPATH = path.join(__dirname, 'audioanalysisdb-4ad5f47fd484.json');

let sheetsAPI = null;
let db = null;

export async function initSheetsSync(firestoreDb) {
    db = firestoreDb;
    try {
        let authOpts = { scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
        if (process.env.GOOGLE_CREDENTIALS) {
            const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
            authOpts.credentials = credentials;
        } else {
            authOpts.keyFile = KEYFILEPATH;
        }
        const auth = new google.auth.GoogleAuth(authOpts);
        sheetsAPI = google.sheets({ version: 'v4', auth });
        console.log("🚀 Google Sheets Auto-Sync Initialized");

        // Start listening to payments collection
        listenForPayments();
        
        // Start listening for new users to append to sheets
        listenForNewUsers();
    startClientAgingCron();

        // Schedule Monthly Rollover (Runs exactly at midnight on the 1st of every month)
        cron.schedule('0 0 1 * *', async () => {
            console.log("📅 Monthly rollover triggered! Creating new Google Sheet...");
            await createNewMonthSheet();
        });

    } catch (err) {
        console.error("❌ Failed to initialize Google Sheets Sync:", err);
    }
}

async function getLatestSheetName() {
    const res = await sheetsAPI.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheets = res.data.sheets;
    // Assume the last sheet in the array is the most recent month
    return sheets[sheets.length - 1].properties.title;
}

async function getSheetIdByName(sheetName) {
    const res = await sheetsAPI.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : null;
}

// Map Column index to letter (0 -> A, 1 -> B)
function colToLetter(colIndex) {
    let letter = '';
    while (colIndex >= 0) {
        letter = String.fromCharCode((colIndex % 26) + 65) + letter;
        colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
}

function listenForPayments() {
    console.log("👀 Listening for new payments and deletions to sync to Google Sheets...");
    
    // We listen to ALL payments so we can catch deletions of older payments.
    // To avoid spamming the Sheets API with old payments on server restart,
    // we only sync "added/modified" payments if they are from the last 24 hours.
    
    db.collection('payments').onSnapshot(async (snapshot) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        for (const change of snapshot.docChanges()) {
            const payment = change.doc.data();
            
            if (change.type === 'added' || change.type === 'modified') {
                const paymentDate = payment.timestamp ? payment.timestamp.toDate() : (payment.datePaid ? new Date(payment.datePaid) : new Date(0));
                
                if (paymentDate > yesterday) {
                    await syncPaymentToSheet(payment);
                    await new Promise(r => setTimeout(r, 2000)); // 2 second delay to prevent 429 errors
                }
            } else if (change.type === 'removed') {
                console.log(`🗑️ Payment deleted for ${payment.customerName || payment.accountNumber}. Reverting in Google Sheets...`);
                await revertPaymentInSheet(payment);
                await new Promise(r => setTimeout(r, 2000)); // 2 second delay to prevent 429 errors
            }
        }
    });
}

function colIndexToLetter(index) {
    let temp, letter = '';
    while (index >= 0) {
        temp = index % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        index = (index - temp - 1) / 26;
    }
    return letter;
}

export async function syncPaymentToSheet(payment) {
    if (!sheetsAPI) return;
    try {
        let sheetName = payment.billingMonth || payment.month;
        if (!sheetName || sheetName === '-') {
            sheetName = await getLatestSheetName();
        }

        // Clean sheetName (e.g. "November 2026 (Advance)" -> "November 2026")
        sheetName = String(sheetName).replace(/\s*\(Advance\)/i, '').trim();

        // Check if the target sheet exists; if not, automatically create it!
        let sheetId = await getSheetIdByName(sheetName);
        if (!sheetId) {
            console.log(`📋 Sheet "${sheetName}" does not exist yet! Automatically creating new month sheet...`);
            let targetDate = new Date(sheetName);
            if (isNaN(targetDate.getTime())) {
                targetDate = new Date();
            }
            await createNewMonthSheet(targetDate);
            sheetId = await getSheetIdByName(sheetName);
            if (!sheetId) {
                sheetName = await getLatestSheetName();
            }
        }

        const res = await sheetsAPI.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Z`, // Fetch up to Column Z just in case
        });

        const rows = res.data.values;
        if (!rows) return;

        // 1. Identify Columns Dynamically from Headers (Search first 5 rows)
        let colDatePaid = 5; // default F (index 5)
        let colStatus = 6;   // default G
        let colRef = 8;      // default I
        let colPlan = 9;     // default J
        let colAmt = 10;     // default K
        let headerRow = 1;   // default row 2 (index 1)

        for(let r = 0; r < Math.min(rows.length, 5); r++) {
            const h = rows[r].map(c => String(c || '').toLowerCase().trim());
            if (h.includes('payment status') || h.includes('status')) {
                headerRow = r;
                let cDP = h.findIndex(x => x.includes('date of payment') || x.includes('date paid') || (x.includes('date') && !x.includes('due')));
                if (cDP !== -1) colDatePaid = cDP;
                let cS = h.findIndex(x => x === 'payment status' || x === 'status');
                if (cS !== -1) colStatus = cS;
                let cR = h.findIndex(x => x.includes('ref. no.') || x.includes('ref no') || x.includes('reference'));
                if (cR !== -1) colRef = cR;
                let cP = h.findIndex(x => x.includes('plan'));
                if (cP !== -1) colPlan = cP;
                let cA = h.findIndex(x => x.includes('amount'));
                if (cA !== -1) colAmt = cA;
                break;
            }
        }

        // 2. Find the user's row
        let rowIndex = -1;
        const targetName = String(payment.customerName || '').toLowerCase().trim();
        const targetAccount = String(payment.accountNumber || '').toLowerCase().trim();
        
        const stripStr = (str) => str.replace(/[^a-z0-9]/g, '');
        const strippedTargetName = stripStr(targetName);
        
        for (let i = headerRow + 1; i < rows.length; i++) {
            const rowData = rows[i];
            
            // Search ENTIRE row for Account Number
            let foundByAccount = false;
            if (targetAccount !== '') {
                for (let col = 0; col < rowData.length; col++) {
                    if (String(rowData[col] || '').toLowerCase().trim() === targetAccount) {
                        foundByAccount = true;
                        break;
                    }
                }
            }

            if (foundByAccount) {
                rowIndex = i + 1;
                break;
            }

            // Fallback: Name Match (Check Column A and B)
            const rowNameA = String(rowData[0] || '').toLowerCase().trim();
            const rowNameB = String(rowData[1] || '').toLowerCase().trim();
            const strippedA = stripStr(rowNameA);
            const strippedB = stripStr(rowNameB);

            if (targetName !== '' && (rowNameA === targetName || rowNameB === targetName)) {
                rowIndex = i + 1;
                break;
            } else if (strippedTargetName !== '' && (strippedA === strippedTargetName || strippedB === strippedTargetName)) {
                rowIndex = i + 1;
                break;
            }
        }

        if (rowIndex !== -1) {
            const rowStatus = (rows[rowIndex - 1][colStatus] || '').trim().toUpperCase();
            if (rowStatus === 'PAID') {
                console.log(`Row ${rowIndex} is already PAID. Skipping overwrite.`);
                return;
            }
        }

        if (rowIndex === -1) {
            console.warn(`Could not find row for ${targetName} / ${targetAccount} in sheet ${sheetName}`);
            return;
        }

        // 3. Prepare Updates
        let datePaidStr = '';
        if (payment.datePaid) {
            datePaidStr = new Date(payment.datePaid).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
        } else if (payment.timestamp && payment.timestamp.toDate) {
            datePaidStr = new Date(payment.timestamp.toDate()).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
        }

        const refNo = payment.referenceNumber || payment.refNo || payment.transactionId || '';
        
        let updates = [
            { range: `${sheetName}!${colIndexToLetter(colDatePaid)}${rowIndex}`, values: [[datePaidStr]] },
            { range: `${sheetName}!${colIndexToLetter(colStatus)}${rowIndex}`, values: [['PAID']] },
        ];

        // Only update Ref No if the column exists in their sheet
        if (colRef !== -1 && refNo !== '') {
            updates.push({ range: `${sheetName}!${colIndexToLetter(colRef)}${rowIndex}`, values: [[refNo]] });
        }

        if (payment.plan && colPlan !== -1) {
            updates.push({ range: `${sheetName}!${colIndexToLetter(colPlan)}${rowIndex}`, values: [[payment.plan]] });
        }
        
        if ((payment.amount || payment.totalAmount) && colAmt !== -1) {
            updates.push({ range: `${sheetName}!${colIndexToLetter(colAmt)}${rowIndex}`, values: [[payment.amount || payment.totalAmount]] });
        }

        await sheetsAPI.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: updates
            }
        });

        console.log(`✅ Synced payment for ${targetAccount} to Google Sheets!`);
    } catch (err) {
        console.error("❌ Error syncing payment to sheets:", err);
    }
}

export async function createNewMonthSheet(targetDate = new Date()) {
    if (!sheetsAPI) return;
    try {
        let date = targetDate;
        if (typeof date === 'string') {
            const cleanStr = date.replace(/\s*\(Advance\)/i, '').trim();
            date = new Date(cleanStr);
        }
        if (!date || isNaN(date.getTime())) {
            date = new Date();
        }
        const currentMonth = date.toLocaleString('en-US', { month: 'long' });
        const currentYear = date.getFullYear();
        const newSheetName = `${currentMonth} ${currentYear}`;
        
        // 0. Check if sheet already exists
        const existingId = await getSheetIdByName(newSheetName);
        if (existingId) {
            console.log(`⚠️ Sheet ${newSheetName} already exists! Skipping creation.`);
            return existingId;
        }

        // 1. Duplicate the previous month sheet
        const oldSheetName = await getLatestSheetName();
        const oldSheetId = await getSheetIdByName(oldSheetName);
        
        const duplicateRes = await sheetsAPI.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    duplicateSheet: {
                        sourceSheetId: oldSheetId,
                        insertSheetIndex: 99,
                        newSheetName: newSheetName
                    }
                }]
            }
        });
        
        const newSheetId = duplicateRes.data.replies[0].duplicateSheet.properties.sheetId;

        // 2. Fetch all current users from database
        const usersSnap = await db.collection('users').get();
        let allUsers = [];
        usersSnap.forEach(doc => {
            const u = doc.data();
            u.id = doc.id;
            allUsers.push(u);
        });
        
        allUsers.sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''));

        // 3. Prepare the new data payload
        // Title cell (A1)
        let updates = [
            { range: `${newSheetName}!A1`, values: [[currentMonth]] }
        ];

        // Format Due Date as MM/DD/YY
        const dueDate = new Date(currentYear, date.getMonth(), 7);
        const dueDateString = dueDate.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
        
        // Prepare row data (starting row 3)
        let rowData = [];
        allUsers.forEach(u => {
            const rawName = u.fullName || u.name || '';
            const accountName = rawName.toLowerCase().replace(/\\s+/g, '.');
            let status = u.status === 'DELETED' ? 'DELETED' : 'UNPAID';

            let cType = u.clientType || 'Old Client';
            if (u.createdAt) {
                try {
                    const cDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
                    if ((Date.now() - cDate.getTime()) / (1000 * 60 * 60 * 24) < 30) {
                        cType = 'New Client';
                    } else {
                        cType = 'Old Client';
                    }
                } catch(e) {}
            }

            rowData.push([
                rawName,                          // A: Name
                accountName,                      // B: Account
                cType,                            // C: Type
                u.paymentType || 'Monthly',       // D: Payment
                dueDateString,                    // E: Due Date
                '',                               // F: Date of Payment (CLEAR IT)
                status,                           // G: Payment Status (UNPAID)
                u.status || 'Connected',          // H: Connection Status
                '',                               // I: Ref No. (CLEAR IT)
                u.plan || u.Plan || '',           // J: Plan
                '',                               // K: Amount (CLEAR IT)
                u.facebook || u.fb || '',         // L: Contact (FB)
                u.phone || u.contactNumber || '', // M: Phone
                u.email || '',                    // N: Email
                u.address || '',                  // O: Address
                u.Location || u.location || '',   // P: Location
                u.accountNumber || u.account || '', // Q: Account Number
                u.createdAt ? (typeof u.createdAt.toDate === 'function' ? u.createdAt.toDate() : new Date(u.createdAt)).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : '' // R: Date Created
            ]);
        });

        // 4. Overwrite the main data block
        updates.push({
            range: `${newSheetName}!A3:R${rowData.length + 2}`,
            values: rowData
        });

        // 5. Clear any extra rows left over from last month if previous month had more users
        const clearRange = `${newSheetName}!A${rowData.length + 3}:R10000`;

        await sheetsAPI.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: updates
            }
        });

        await sheetsAPI.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: clearRange
        });

        // 6. Ensure row 1 is merged A1:R1, R2 is styled, data is centered, and column R is auto-resized
        await sheetsAPI.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        mergeCells: {
                            range: {
                                sheetId: newSheetId,
                                startRowIndex: 0,
                                endRowIndex: 1,
                                startColumnIndex: 0,
                                endColumnIndex: 18
                            },
                            mergeType: 'MERGE_ALL'
                        }
                    },
                    {
                        updateCells: {
                            range: {
                                sheetId: newSheetId,
                                startRowIndex: 1,
                                endRowIndex: 2,
                                startColumnIndex: 17,
                                endColumnIndex: 18
                            },
                            rows: [{
                                values: [{
                                    userEnteredValue: { stringValue: 'Date Created' },
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.1254902, green: 0.21568628, blue: 0.39215687 },
                                        horizontalAlignment: 'CENTER',
                                        verticalAlignment: 'MIDDLE',
                                        wrapStrategy: 'WRAP',
                                        textFormat: {
                                            foregroundColor: { red: 1, green: 1, blue: 1 },
                                            fontFamily: 'Arial',
                                            fontSize: 10,
                                            bold: true
                                        },
                                        borders: {
                                            top: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
                                            bottom: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
                                            left: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
                                            right: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } }
                                        }
                                    }
                                }]
                            }],
                            fields: 'userEnteredValue,userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy,textFormat,borders)'
                        }
                    },
                    {
                        repeatCell: {
                            range: {
                                sheetId: newSheetId,
                                startRowIndex: 2,
                                endRowIndex: rowData.length + 2,
                                startColumnIndex: 17,
                                endColumnIndex: 18
                            },
                            cell: {
                                userEnteredFormat: {
                                    horizontalAlignment: 'CENTER',
                                    verticalAlignment: 'MIDDLE'
                                }
                            },
                            fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment)'
                        }
                    },
                    {
                        autoResizeDimensions: {
                            dimensions: {
                                sheetId: newSheetId,
                                dimension: 'COLUMNS',
                                startIndex: 17,
                                endIndex: 18
                            }
                        }
                    },
                    {
                        addConditionalFormatRule: {
                            rule: {
                                ranges: [{ sheetId: newSheetId, startRowIndex: 2, startColumnIndex: 2, endColumnIndex: 3 }],
                                booleanRule: {
                                    condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'New Client' }] },
                                    format: { backgroundColor: { red: 0.145, green: 0.388, blue: 0.921 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true } }
                                }
                            }, index: 0
                        }
                    },
                    {
                        addConditionalFormatRule: {
                            rule: {
                                ranges: [{ sheetId: newSheetId, startRowIndex: 2, startColumnIndex: 2, endColumnIndex: 3 }],
                                booleanRule: {
                                    condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Old Client' }] },
                                    format: { backgroundColor: { red: 0.086, green: 0.627, blue: 0.521 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true } }
                                }
                            }, index: 0
                        }
                    },
                    {
                        addConditionalFormatRule: {
                            rule: {
                                ranges: [{ sheetId: newSheetId, startRowIndex: 2, startColumnIndex: 3, endColumnIndex: 4 }],
                                booleanRule: {
                                    condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Monthly' }] },
                                    format: { backgroundColor: { red: 0.086, green: 0.627, blue: 0.521 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true } }
                                }
                            }, index: 0
                        }
                    },
                    {
                        addConditionalFormatRule: {
                            rule: {
                                ranges: [{ sheetId: newSheetId, startRowIndex: 2, startColumnIndex: 3, endColumnIndex: 4 }],
                                booleanRule: {
                                    condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Every Last Week' }] },
                                    format: { backgroundColor: { red: 0.145, green: 0.388, blue: 0.921 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true } }
                                }
                            }, index: 0
                        }
                    },
                    {
                        setDataValidation: {
                            range: {
                                sheetId: newSheetId,
                                startRowIndex: 2,
                                startColumnIndex: 8,
                                endColumnIndex: 9
                            },
                            rule: {
                                condition: {
                                    type: 'CUSTOM_FORMULA',
                                    values: [
                                        { userEnteredValue: '=OR(ISBLANK(I3), COUNTIF($I$3:$I, I3)<=1)' }
                                    ]
                                },
                                inputMessage: 'This reference number is already saved.',
                                strict: true,
                                showCustomUi: true
                            }
                        }
                    }
                ]
            }
        }).catch(err => console.error("⚠️ Failed to format Column R / Data Validation in new month sheet:", err));

        console.log(`✅ Successfully created new Auto-Rollover sheet for ${newSheetName}`);
        return newSheetId;

    } catch (err) {
        console.error("❌ Error creating new month sheet:", err);
    }
}

async function revertPaymentInSheet(payment) {
    if (!sheetsAPI) return;
    try {
        let sheetName = payment.billingMonth || payment.month;
        if (!sheetName) {
            sheetName = await getLatestSheetName();
        }
        const res = await sheetsAPI.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Q`, // Fetch up to Column Q
        });

        const rows = res.data.values;
        if (!rows) return;

        // Find the user's row
        let rowIndex = -1;
        const targetName = String(payment.customerName || '').toLowerCase().trim();
        const targetAccount = String(payment.accountNumber || '').toLowerCase().trim();
        
        for (let i = 0; i < rows.length; i++) {
            const rowName = String(rows[i][0] || '').toLowerCase().trim();
            const rowAccNum = String(rows[i][16] || '').toLowerCase().trim(); // Column Q
            
            if ((targetAccount && rowAccNum === targetAccount) || 
                (targetName && rowName === targetName)) {
                rowIndex = i + 1;
                break;
            }
        }

        if (rowIndex === -1) {
            console.warn(`Could not find row for deleted payment ${targetName} / ${targetAccount}`);
            return;
        }

        // Revert Date of Payment (F), Status (G), and Ref No (I)
        let updates = [
            { range: `${sheetName}!F${rowIndex}`, values: [['']] },
            { range: `${sheetName}!G${rowIndex}`, values: [['UNPAID']] },
            { range: `${sheetName}!I${rowIndex}`, values: [['']] }
        ];

        await sheetsAPI.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: updates
            }
        });

        console.log(`✅ Reverted payment for ${targetAccount || targetName} to UNPAID in Google Sheets!`);
    } catch (err) {
        console.error("❌ Error reverting payment in Google Sheets:", err);
    }
}



async function appendUserToSheet(sheetName, user) {
    if (!sheetsAPI) return;
    try {
        // Check if sheet exists
        const res = await sheetsAPI.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const exists = res.data.sheets.find(s => s.properties.title === sheetName);
        if (!exists) return; // Don't append if the sheet hasn't been created yet

        // Check if user already exists in the sheet to avoid duplicates
        const existingData = await sheetsAPI.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Q`
        }).catch(() => null);

        if (existingData && existingData.data.values) {
            const checkName = String(user.fullName || user.name || '').toLowerCase().trim();
            const checkAccount = String(user.accountNumber || user.account || '').toLowerCase().trim();
            const stripCheck = (str) => str.replace(/[^a-z0-9]/g, '');
            const strippedCheckName = stripCheck(checkName);

            for (let i = 0; i < existingData.data.values.length; i++) {
                const rd = existingData.data.values[i];
                // Check account number match across all columns
                if (checkAccount !== '') {
                    let foundAccount = false;
                    for (let col = 0; col < rd.length; col++) {
                        if (String(rd[col] || '').toLowerCase().trim() === checkAccount) {
                            foundAccount = true;
                            break;
                        }
                    }
                    if (foundAccount) {
                        console.log(`⚠️ User ${checkName} already exists in ${sheetName}. Skipping append.`);
                        return;
                    }
                }
                // Check name match in Column A
                const rName = String(rd[0] || '').toLowerCase().trim();
                if (checkName !== '' && rName === checkName) {
                    console.log(`⚠️ User ${checkName} already exists in ${sheetName}. Skipping append.`);
                    return;
                }
                if (strippedCheckName !== '' && stripCheck(rName) === strippedCheckName) {
                    console.log(`⚠️ User ${checkName} already exists in ${sheetName}. Skipping append.`);
                    return;
                }
            }
        }

        const rawName = user.fullName || user.name || '';
        const accountName = rawName.toLowerCase().replace(/\s+/g, '.');
        let status = user.status === 'DELETED' ? 'DELETED' : 'UNPAID';
        
        let cType = user.clientType || 'Old Client';
        if (user.createdAt) {
            try {
                const cDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                if ((Date.now() - cDate.getTime()) / (1000 * 60 * 60 * 24) < 30) {
                    cType = 'New Client';
                } else {
                    cType = 'Old Client';
                }
            } catch(e) {}
        }
        
        // Format Due Date as MM/DD/YY
        const [month, year] = sheetName.split(' ');
        const monthIndex = new Date(Date.parse(month + ' 1, 2000')).getMonth();
        const dueDate = new Date(parseInt(year), monthIndex, 7);
        const dueDateString = dueDate.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });

        const rowData = [
            rawName,                          // A: Name
            accountName,                      // B: Account
            cType,                            // C: Type
            user.paymentType || 'Monthly',    // D: Payment
            dueDateString,                    // E: Due Date
            '',                               // F: Date of Payment
            status,                           // G: Payment Status (UNPAID)
            user.connectionStatus || 'CONNECTED', // H: Connection Status
            '',                               // I: Ref No.
            user.plan || user.Plan || '',           // J: Plan
            '',                               // K: Amount
            user.facebook || user.fb || '',         // L: Contact (FB)
            user.phone || user.contactNumber || '', // M: Phone
            user.email || '',                    // N: Email
            user.address || '',                  // O: Address
            user.Location || user.location || '',   // P: Location
            user.accountNumber || user.account || '', // Q: Account Number
            user.createdAt ? (typeof user.createdAt.toDate === 'function' ? user.createdAt.toDate() : new Date(user.createdAt)).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : '' // R: Date Created
        ];

        // 1. Append the row
        await sheetsAPI.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:R`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [rowData]
            }
        });
        
        // 2. Fetch the sheet again to find the header row so we can sort everything below it
        const sheetId = exists.properties.sheetId;
        const sheetData = await sheetsAPI.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Z`
        }).catch(() => null);
        
        let headerRow = 1; // Default to row index 1 (Row 2 in Sheets)
        if (sheetData && sheetData.data.values) {
            for(let r = 0; r < Math.min(sheetData.data.values.length, 5); r++) {
                const h = sheetData.data.values[r].map(c => String(c || '').toLowerCase().trim());
                if (h.includes('payment status') || h.includes('status') || h.includes('name')) {
                    headerRow = r;
                    break;
                }
            }
        }

        // 3. Sort the sheet alphabetically by Name (Column A)
        await sheetsAPI.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        sortRange: {
                            range: {
                                sheetId: sheetId,
                                startRowIndex: headerRow + 1, // Start sorting just below the header
                                startColumnIndex: 0,          // A
                                endColumnIndex: 26            // Z
                            },
                            sortSpecs: [
                                {
                                    dimensionIndex: 0, // Sort by Column A (Index 0)
                                    sortOrder: 'ASCENDING'
                                }
                            ]
                        }
                    }
                ]
            }
        });

        console.log(`✅ Appended and Alphabetically Sorted new user ${rawName} in Google Sheet: ${sheetName}`);
        
        // 4. Force color styling for the new row by calling syncProfileToSheet
        await syncProfileToSheet(user);

    } catch (err) {
        console.error(`❌ Error appending user to ${sheetName}:`, err);
    }
}




export async function syncProfileToSheet(user) {
    if (!sheetsAPI) return;
    try {
        const now = new Date();
        const currentMonthStr = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const advanceDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const advanceMonthStr = advanceDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        // Fetch sheets to get Sheet IDs for color updates
        const meta = await sheetsAPI.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheets = meta.data.sheets;
        
        await applyProfileUpdates(user, currentMonthStr, sheets);
        await applyProfileUpdates(user, advanceMonthStr, sheets);
        
    } catch (err) {
        console.error("❌ Error syncing profile to sheets:", err);
    }
}

async function applyProfileUpdates(user, sheetName, sheetsMeta) {
    try {
        const sheetInfo = sheetsMeta.find(s => s.properties.title === sheetName);
        if (!sheetInfo) return; // Sheet doesn't exist
        const sheetId = sheetInfo.properties.sheetId;

        const res = await sheetsAPI.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Z`
        }).catch(() => null);
        
        if (!res || !res.data.values) return; 

        const rows = res.data.values;
        if (!rows || rows.length === 0) return;

        let headerRow = 1;
        let colLoc = 15; // P (index 15)
        let colClientType = 2; // C (index 2)
        let colPayment = 3; // D (index 3)
        let colStatus = 7; // H (index 7)
        
        for(let r = 0; r < Math.min(rows.length, 5); r++) {
            const h = rows[r].map(c => String(c || '').toLowerCase().trim());
            if (h.includes('payment status') || h.includes('status')) {
                headerRow = r;
                let cL = h.findIndex(x => x.includes('location'));
                if (cL !== -1) colLoc = cL;
                let cC = h.findIndex(x => x.includes('type of client') || x.includes('client type'));
                if (cC !== -1) colClientType = cC;
                let cP = h.findIndex(x => x === 'payment' || x.includes('payment type') || x.includes('payment mode'));
                if (cP !== -1) colPayment = cP;
                let cS = h.findIndex(x => x === 'status');
                if (cS !== -1) colStatus = cS;
                break;
            }
        }

        let rowIndex = -1;
        const targetAccount = String(user.accountNumber || user.account || '').toLowerCase().trim();
        const targetName = String(user.fullName || user.name || '').toLowerCase().trim();
        const stripStr = (str) => str.replace(/[^a-z0-9]/g, '');
        const strippedTargetName = stripStr(targetName);

        for (let i = headerRow + 1; i < rows.length; i++) {
            const rowData = rows[i];
            let foundByAccount = false;
            if (targetAccount !== '') {
                for (let col = 0; col < rowData.length; col++) {
                    if (String(rowData[col] || '').toLowerCase().trim() === targetAccount) {
                        foundByAccount = true;
                        break;
                    }
                }
            }
            if (foundByAccount) {
                rowIndex = i + 1;
                break;
            }
            const rowNameA = String(rowData[0] || '').toLowerCase().trim();
            const rowNameB = String(rowData[1] || '').toLowerCase().trim();
            const strippedA = stripStr(rowNameA);
            const strippedB = stripStr(rowNameB);

            if (targetName !== '' && (rowNameA === targetName || rowNameB === targetName)) {
                rowIndex = i + 1;
                break;
            } else if (strippedTargetName !== '' && (strippedA === strippedTargetName || strippedB === strippedTargetName)) {
                rowIndex = i + 1;
                break;
            }
        }

        if (rowIndex === -1) {
            console.warn(`Could not find row for ${targetName} to sync profile in ${sheetName}`);
            return;
        }

        let cType = user.clientType || 'Old Client';
        if (user.createdAt) {
            try {
                const cDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                if ((Date.now() - cDate.getTime()) / (1000 * 60 * 60 * 24) < 30) {
                    cType = 'New Client';
                } else {
                    cType = 'Old Client';
                }
            } catch(e) {}
        }

        // Determine color for client type
        let bgColor = { red: 1, green: 1, blue: 1 }; // white
        let fgColor = { red: 0, green: 0, blue: 0 }; // black text

        if (cType.toLowerCase().includes('new')) {
            bgColor = { red: 0.145, green: 0.388, blue: 0.921 }; // #2563eb
            fgColor = { red: 1, green: 1, blue: 1 }; // white text
        } else if (cType.toLowerCase().includes('old')) {
            bgColor = { red: 0.086, green: 0.627, blue: 0.521 }; // #16a085
            fgColor = { red: 1, green: 1, blue: 1 }; // white text
        }

        // Build all requests for a single batchUpdate call (values + colors combined)
        const batchRequests = [];
        const loc = user.Location || user.location || '';

        if (loc && colLoc !== -1) {
            batchRequests.push({
                updateCells: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: rowIndex - 1,
                        endRowIndex: rowIndex,
                        startColumnIndex: colLoc,
                        endColumnIndex: colLoc + 1
                    },
                    rows: [{ values: [{ userEnteredValue: { stringValue: loc } }] }],
                    fields: 'userEnteredValue'
                }
            });
        }

        if (colClientType !== -1 && cType !== '') {
            // Write value AND apply color in a single request
            batchRequests.push({
                updateCells: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: rowIndex - 1,
                        endRowIndex: rowIndex,
                        startColumnIndex: colClientType,
                        endColumnIndex: colClientType + 1
                    },
                    rows: [{
                        values: [{
                            userEnteredValue: { stringValue: cType },
                            userEnteredFormat: {
                                backgroundColor: bgColor,
                                textFormat: {
                                    foregroundColor: fgColor,
                                    bold: true
                                }
                            }
                        }]
                    }],
                    fields: 'userEnteredValue,userEnteredFormat(backgroundColor,textFormat)'
                }
            });
        }

        // Update Name (Column A)
        if (user.fullName || user.name) {
            batchRequests.push({
                updateCells: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: rowIndex - 1,
                        endRowIndex: rowIndex,
                        startColumnIndex: 0, // Column A
                        endColumnIndex: 1
                    },
                    rows: [{ values: [{ userEnteredValue: { stringValue: user.fullName || user.name } }] }],
                    fields: 'userEnteredValue'
                }
            });
        }

        // Update Connection Status (e.g. Connected / Disconnected)
        if (user.status && colStatus !== -1) {
            batchRequests.push({
                updateCells: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: rowIndex - 1,
                        endRowIndex: rowIndex,
                        startColumnIndex: colStatus,
                        endColumnIndex: colStatus + 1
                    },
                    rows: [{ values: [{ userEnteredValue: { stringValue: user.status } }] }],
                    fields: 'userEnteredValue'
                }
            });
        }

        // Apply color to Payment column (D)
        if (colPayment !== -1) {
            const paymentType = user.paymentType || 'Monthly';
            let payBgColor = { red: 0.086, green: 0.627, blue: 0.521 }; // green for Monthly
            let payFgColor = { red: 1, green: 1, blue: 1 }; // white text

            if (paymentType.toLowerCase().includes('last week') || paymentType.toLowerCase().includes('weekly')) {
                payBgColor = { red: 0.145, green: 0.388, blue: 0.921 }; // blue for Every Last Week
            }

            batchRequests.push({
                updateCells: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: rowIndex - 1,
                        endRowIndex: rowIndex,
                        startColumnIndex: colPayment,
                        endColumnIndex: colPayment + 1
                    },
                    rows: [{
                        values: [{
                            userEnteredValue: { stringValue: paymentType },
                            userEnteredFormat: {
                                backgroundColor: payBgColor,
                                textFormat: {
                                    foregroundColor: payFgColor,
                                    bold: true
                                }
                            }
                        }]
                    }],
                    fields: 'userEnteredValue,userEnteredFormat(backgroundColor,textFormat)'
                }
            });
        }

        if (batchRequests.length > 0) {
            await sheetsAPI.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: { requests: batchRequests }
            });

            console.log(`✅ Synced profile updates (Location/Type + Colors) for ${targetName} to ${sheetName}`);
        }
    } catch (err) {
        console.error(`❌ Error syncing profile to ${sheetName}:`, err);
    }
}

export async function isRefNoInSheet(refNo) {
    if (!sheetsAPI || !refNo) return false;
    try {
        const cleanTarget = String(refNo).replace(/[\s-]/g, '').toLowerCase();
        const now = new Date();
        const currentMonthStr = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const advanceDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const advanceMonthStr = advanceDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const meta = await sheetsAPI.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheets = meta.data.sheets || [];
        const targetSheetTitles = [currentMonthStr, advanceMonthStr];

        for (const s of sheets) {
            const title = s.properties.title;
            if (targetSheetTitles.includes(title) || sheets[sheets.length - 1].properties.sheetId === s.properties.sheetId) {
                const res = await sheetsAPI.spreadsheets.values.get({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `'${title}'!I3:I`
                }).catch(() => null);
                if (res && res.data && res.data.values) {
                    for (const row of res.data.values) {
                        const val = row[0] ? String(row[0]).trim() : '';
                        if (val && (val.toLowerCase() === String(refNo).trim().toLowerCase() || val.replace(/[\s-]/g, '').toLowerCase() === cleanTarget)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    } catch (e) {
        console.error("Error checking ref in sheet:", e);
        return false;
    }
}

export async function deleteUserRowFromSheet(user) {
    if (!sheetsAPI || !user) return;
    try {
        const now = new Date();
        const currentMonthStr = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const advanceDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const advanceMonthStr = advanceDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const meta = await sheetsAPI.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheets = meta.data.sheets;

        await removeRowFromSheet(user, currentMonthStr, sheets);
        await removeRowFromSheet(user, advanceMonthStr, sheets);
    } catch (err) {
        console.error("❌ Error deleting user row from sheets:", err);
    }
}

async function removeRowFromSheet(user, sheetName, sheetsMeta) {
    try {
        const sheetInfo = sheetsMeta.find(s => s.properties.title === sheetName);
        if (!sheetInfo) return;
        const sheetId = sheetInfo.properties.sheetId;

        const res = await sheetsAPI.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Z`
        }).catch(() => null);

        if (!res || !res.data.values) return;
        const rows = res.data.values;
        if (!rows || rows.length === 0) return;

        let headerRow = 1;
        for (let r = 0; r < Math.min(rows.length, 5); r++) {
            const h = rows[r].map(c => String(c || '').toLowerCase().trim());
            if (h.includes('payment status') || h.includes('status')) {
                headerRow = r;
                break;
            }
        }

        let rowIndex = -1;
        const targetAccount = String(user.accountNumber || user.account || '').toLowerCase().trim();
        const targetName = String(user.fullName || user.name || '').toLowerCase().trim();
        const stripStr = (str) => str.replace(/[^a-z0-9]/g, '');
        const strippedTargetName = stripStr(targetName);

        for (let i = headerRow + 1; i < rows.length; i++) {
            const rowData = rows[i];
            let foundByAccount = false;
            if (targetAccount !== '') {
                for (let col = 0; col < rowData.length; col++) {
                    if (String(rowData[col] || '').toLowerCase().trim() === targetAccount) {
                        foundByAccount = true;
                        break;
                    }
                }
            }
            if (foundByAccount) {
                rowIndex = i + 1;
                break;
            }
            const rowNameA = String(rowData[0] || '').toLowerCase().trim();
            const rowNameB = String(rowData[1] || '').toLowerCase().trim();
            const strippedA = stripStr(rowNameA);
            const strippedB = stripStr(rowNameB);

            if (targetName !== '' && (rowNameA === targetName || rowNameB === targetName)) {
                rowIndex = i + 1;
                break;
            } else if (strippedTargetName !== '' && (strippedA === strippedTargetName || strippedB === strippedTargetName)) {
                rowIndex = i + 1;
                break;
            }
        }

        if (rowIndex === -1) {
            console.log(`User ${targetName} (${targetAccount}) not found in sheet "${sheetName}".`);
            return;
        }

        console.log(`🗑️ Deleting row ${rowIndex} for ${targetName || targetAccount} from "${sheetName}"...`);
        await sheetsAPI.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: rowIndex - 1,
                                endIndex: rowIndex
                            }
                        }
                    }
                ]
            }
        });
        console.log(`✅ Successfully deleted row ${rowIndex} for ${targetName || targetAccount} from "${sheetName}".`);
    } catch (err) {
        console.error(`❌ Error removing row from sheet "${sheetName}":`, err);
    }
}

function startClientAgingCron() {
    console.log("⏳ Starting daily cron job to check for client aging...");
    
    const checkClientAging = async () => {
        try {
            const now = new Date();
            const snap = await db.collection('users').get();
            let batch = db.batch();
            let count = 0;
            
            snap.forEach(doc => {
                const user = doc.data();
                if (user.role !== 'admin' && user.role !== 'technician' && user.createdAt) {
                    const createdDate = typeof user.createdAt.toDate === 'function' 
                        ? user.createdAt.toDate() 
                        : new Date(user.createdAt);
                    const ageMs = now - createdDate;
                    const ageDays = ageMs / (1000 * 60 * 60 * 24);
                    
                    if (ageDays > 30) {
                        if (user.clientType !== 'Old Client') {
                            batch.update(doc.ref, { clientType: 'Old Client' });
                            count++;
                        }
                    } else {
                        if (user.clientType !== 'New Client') {
                            batch.update(doc.ref, { clientType: 'New Client' });
                            count++;
                        }
                    }
                }
            });
            
            if (count > 0) {
                // Note: Firestore batch has a limit of 500 operations, 
                // but assuming < 500 users changing state per day/run.
                await batch.commit();
                console.log(`✅ Aged/Updated ${count} clients' Client Type.`);
            }
        } catch (e) {
            console.error("❌ Error in client aging cron:", e);
        }
    };

    // Run immediately on server start
    checkClientAging();
    // Then run every 24 hours
    setInterval(checkClientAging, 24 * 60 * 60 * 1000);
}

// Call startClientAgingCron at the end of initSheetsSync

function listenForNewUsers() {
    console.log("👀 Listening for new users to append to Google Sheets...");

    let initialLoadComplete = false;

    db.collection('users').onSnapshot(async (snapshot) => {
        const isInitialLoad = !initialLoadComplete;
        initialLoadComplete = true;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        for (const change of snapshot.docChanges()) {

            if (change.type === 'removed') {
                const user = change.doc.data();
                console.log(`🗑️ User deleted: ${user.name || user.accountNumber}. Deleting row from Google Sheets...`);
                await deleteUserRowFromSheet(user);
            }

            if (change.type === 'modified') {
                const user = change.doc.data();
                await syncProfileToSheet(user);
            }

            if (change.type === 'added') {
                const user = change.doc.data();

                // Determine if we should append this user
                let shouldAppend = false;

                if (isInitialLoad) {
                    // On server restart, all existing docs fire as 'added'.
                    // Use a 7-day window to catch users added while server was down,
                    // without re-processing very old users.
                    // The duplicate check in appendUserToSheet prevents double entries.
                    if (user.createdAt) {
                        const createdDate = typeof user.createdAt.toDate === 'function'
                            ? user.createdAt.toDate()
                            : new Date(user.createdAt);
                        if (createdDate > sevenDaysAgo) {
                            shouldAppend = true;
                        }
                    }

                    // CRITICAL FIX: If the user was modified while the server was asleep,
                    // they appear as 'added' on initial load. We check lastUpdated to catch them.
                    if (user.lastUpdated) {
                        const updatedDate = typeof user.lastUpdated.toDate === 'function'
                            ? user.lastUpdated.toDate()
                            : new Date(user.lastUpdated);
                        if ((Date.now() - updatedDate.getTime()) < 15 * 60 * 1000) { // 15 mins
                            await syncProfileToSheet(user);
                        }
                    }
                } else {
                    // Real-time: always append genuinely new users
                    shouldAppend = true;
                }

                if (shouldAppend) {
                    // Append to Current Month
                    const now = new Date();
                    const currentMonthStr = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                    await appendUserToSheet(currentMonthStr, user);

                    // Append to Advance Month (if it exists)
                    const advanceDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    const advanceMonthStr = advanceDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                    await appendUserToSheet(advanceMonthStr, user);
                }
            }
        }
    });
}

const PAGE_ACCESS_TOKEN = 'EAAWcO9Nk1mgBRkaXUTGK3JqhZCLkJXXlPZBDcMDIUmrbsOmCRmbtzplX7zbJYnltaZAyZB0292pGfZBBtce1oKRZC0ZBICmiZCZBLoHKYUPBc7UES4RZChyOoyQZAYFszs487BJQDbYuZCu0ZCY568OIckOXOhRR2OQ9MUf17PGUCwkxxThIfmxeRRcZBnjFzhVh6FBVwCq1z35gZDZD';
const JASPER_PSID = '27076770378611516';

async function test() {
    try {
        const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: { id: JASPER_PSID },
                message: { text: 'Test from local script!' }
            })
        });
        console.log(res.status, await res.text());
    } catch(e) {
        console.error(e);
    }
}
test();

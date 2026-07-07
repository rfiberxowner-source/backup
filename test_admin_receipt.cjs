const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Intercept dialogs
  page.on('dialog', async dialog => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });
  
  // Listen to console
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:5173/RFiberXAdminportal-banking', { waitUntil: 'networkidle2' });
  
  console.log('Page loaded. Simulating admin login...');
  await page.evaluate(() => {
    localStorage.setItem('adminUser', JSON.stringify({ email: 'admin@rfiberx.com' }));
    window.location.reload();
  });
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('Logged in. Waiting for recent activity to load...');
  
  await new Promise(r => setTimeout(r, 3000)); // wait for firestore loads
  
  const spanHandle = await page.$('span[onclick^="window.viewAdminReceipt"]');
  if (spanHandle) {
    console.log('Found a View button. Clicking it...');
    await spanHandle.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Clicked. Checking if receipt rendered...');
    const receiptExists = await page.$('#admin-receipt-paper');
    console.log('Receipt exists?', !!receiptExists);
  } else {
    console.log('No View button found.');
  }

  await browser.close();
})();

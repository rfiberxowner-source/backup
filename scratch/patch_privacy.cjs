const fs = require('fs');
const path = require('path');

const mainPortalPath = path.join('c:', 'website', 'src', 'pages', 'mainPortal.js');
let mainPortalContent = fs.readFileSync(mainPortalPath, 'utf8');

const privacyRoute = `
  ,
  '/privacy': () => \`
    <section class="section-container scroll-animate" style="padding-top: 120px; max-width: 900px; margin: 0 auto;">
      <div class="section-header-left">
        <h2>Privacy Notice</h2>
        <p>Effective Date: January 1, 2026</p>
      </div>
      <div style="color: rgba(255, 255, 255, 0.75); line-height: 1.9; font-size: 1.05rem;">
        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">1. Introduction</h3>
        <p>RFiberX Network and Data Solution ("RFiberX," "we," "our," or "us") is committed to protecting the privacy of our subscribers, website visitors, and service users. This Privacy Notice explains how we collect, use, store, and protect your personal information in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">2. Information We Collect</h3>
        <p>We may collect the following types of personal information:</p>
        <ul style="padding-left:1.5rem; margin:0.5rem 0;">
          <li>Full name, address, and contact details (phone number, email address)</li>
          <li>Government-issued identification for identity verification</li>
          <li>Billing and payment information</li>
          <li>Service usage data, including bandwidth consumption and connection logs</li>
          <li>Device information and IP addresses used to access our services</li>
          <li>Customer support interaction records</li>
        </ul>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">3. How We Use Your Information</h3>
        <p>Your personal information is used to:</p>
        <ul style="padding-left:1.5rem; margin:0.5rem 0;">
          <li>Process service applications and manage your subscription</li>
          <li>Provide, maintain, and improve our internet connectivity services</li>
          <li>Process billing, payments, and account management</li>
          <li>Communicate important service updates, outage notifications, and promotional offers</li>
          <li>Respond to customer inquiries and provide technical support</li>
          <li>Comply with legal and regulatory requirements</li>
        </ul>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">4. Data Sharing & Disclosure</h3>
        <p>We do not sell your personal data to third parties. We may share your information only with authorized service partners (e.g., payment processors, technicians) strictly for the purpose of delivering our services, or when required by law or a valid court order.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">5. Data Security</h3>
        <p>We implement reasonable organizational, technical, and physical security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Access to subscriber data is restricted to authorized personnel only.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">6. Your Rights</h3>
        <p>Under the Data Privacy Act of 2012, you have the right to access, correct, and request the deletion of your personal data. You may also withdraw consent or object to certain processing activities. To exercise any of these rights, please contact us at <span style="color:var(--accent-color);">technicians@rfiberx.net</span>.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">7. Facebook Messenger Bot & Account Linking</h3>
        <p>When you interact with the RFiberX Facebook Messenger bot, we collect basic information provided by the Facebook platform, including your public profile name and Messenger ID (PSID). If you provide account details or billing statements for processing, this data is temporarily stored to fulfill your requests. Your Messenger account will be securely linked to your RFiberX internet account for easier future interactions. We do not sell or trade this information, and it is strictly protected in our secure database.</p>
        
        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">8. Changes to This Notice</h3>
        <p>RFiberX reserves the right to update this Privacy Notice at any time. Significant changes will be communicated through our website or via email notification to active subscribers.</p>
        
        <div style="margin-top: 3rem;">
          <button class="btn btn-outline" onclick="window.history.back()">+? Back</button>
        </div>
      </div>
    </section>
  \`
`;

mainPortalContent = mainPortalContent.replace(/};\s*$/m, privacyRoute + '\n};\n');
fs.writeFileSync(mainPortalPath, mainPortalContent, 'utf8');
console.log('Patched mainPortal.js');

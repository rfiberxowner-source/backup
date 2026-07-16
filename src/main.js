
import './style.css';
import './auth.js';
import { adminViews } from './pages/adminPortal.js';
import { clientViews } from './pages/clientPortal.js';
import { mainViews } from './pages/mainPortal.js';
import { Router } from './router.js';
import './components/mountNetworkMap.jsx';

window.views = {
  ...mainViews,
  ...clientViews,
  ...adminViews
};

window.router = new Router();

;




document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      window.router.navigate(href);

      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) mobileMenu.classList.remove('open');
    }
  });

  // Mobile menu toggle logic
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // Legal Modal System
  const legalContent = {
    privacy: {
      title: 'Privacy Notice',
      date: 'Effective Date: January 1, 2026',
      body: `
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

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">7. Changes to This Notice</h3>
        <p>RFiberX reserves the right to update this Privacy Notice at any time. Significant changes will be communicated through our website or via email notification to active subscribers.</p>
      `
    },
    cookie: {
      title: 'Cookie Policy',
      date: 'Effective Date: January 1, 2026',
      body: `
        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">1. What Are Cookies</h3>
        <p>Cookies are small text files placed on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and understanding how you interact with our site.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">2. Types of Cookies We Use</h3>
        <p><strong style="color:#fff;">Essential Cookies:</strong> These are required for the basic functionality of our website, such as navigating between pages and accessing secure areas of the site. Our website cannot function properly without these cookies.</p>
        <p><strong style="color:#fff;">Functional Cookies:</strong> These cookies allow our website to remember choices you make (such as your preferred language or region) and provide enhanced, personalized features.</p>
        <p><strong style="color:#fff;">Analytics Cookies:</strong> We use analytics cookies to understand how visitors interact with our website. This data helps us improve site performance, content relevance, and overall user experience. All analytics data is collected anonymously.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">3. Managing Cookies</h3>
        <p>You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality and performance of our website. Most browsers allow you to view, delete, and block cookies from specific or all websites.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">4. Third-Party Cookies</h3>
        <p>Our website may contain links to third-party services that may set their own cookies. RFiberX does not control these cookies and is not responsible for the privacy practices of external websites. We encourage you to review the cookie policies of any third-party services you access through our site.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">5. Updates to This Policy</h3>
        <p>We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. Any updates will be posted on this page with a revised effective date.</p>
      `
    },
    terms: {
      title: 'Terms of Use',
      date: 'Effective Date: January 1, 2026',
      body: `
        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">1. Acceptance of Terms</h3>
        <p>By accessing and using the RFiberX website and subscribing to our internet services, you agree to be bound by these Terms of Use, our Privacy Notice, and all applicable laws and regulations. If you do not agree to any of these terms, you must discontinue use of our services immediately.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">2. Service Description</h3>
        <p>RFiberX provides fiber-optic internet connectivity services to residential and small business subscribers within our coverage areas in Magdalena, Laguna and surrounding barangays. Service speeds, availability, and features are subject to technical feasibility and the specific plan selected by the subscriber.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">3. Subscriber Obligations</h3>
        <ul style="padding-left:1.5rem; margin:0.5rem 0;">
          <li>Provide accurate and complete information during the application process</li>
          <li>Pay all applicable fees on time as outlined in your subscription plan</li>
          <li>Use the service in compliance with all applicable Philippine laws</li>
          <li>Refrain from any activity that may disrupt the network or degrade service quality for other subscribers</li>
          <li>Safeguard any equipment provided by RFiberX and return it in good condition upon service termination</li>
        </ul>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">4. Prohibited Uses</h3>
        <p>Subscribers shall not use RFiberX services for any unlawful purpose, including but not limited to: distributing malicious software, unauthorized access to networks or systems, hosting of illegal content, or any activity that violates the Cybercrime Prevention Act of 2012 (Republic Act No. 10175).</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">5. Service Availability</h3>
        <p>While we strive for 100% uptime, RFiberX does not guarantee uninterrupted service. Scheduled maintenance, force majeure events, and unforeseen technical issues may temporarily affect service availability. We commit to resolving issues promptly and will provide same-day technician support whenever possible.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">6. Limitation of Liability</h3>
        <p>RFiberX shall not be held liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services, including but not limited to loss of data, revenue, or business opportunities. Our total liability shall not exceed the subscription fees paid by the subscriber during the affected billing period.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">7. Termination</h3>
        <p>Either party may terminate the service subscription with proper written notice. RFiberX reserves the right to suspend or terminate service for non-payment, violation of these terms, or any activity deemed harmful to our network infrastructure or other subscribers.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">8. Governing Law</h3>
        <p>These Terms of Use shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts of Laguna, Philippines.</p>
      `
    },
    locations: {
      title: 'Service Locations',
      date: 'Coverage Area Information',
      body: `
        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">Main Office</h3>
        <p><strong style="color:#fff;">RFiberX Network and Data Solution</strong></p>
        <p>Salasad, Magdalena, Laguna, Philippines</p>
        <p style="margin-top:0.5rem;">Phone: <span style="color:var(--accent-color);">+63 09058395471</span></p>
        <p>Email: <span style="color:var(--accent-color);">technicians@rfiberx.net</span></p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">Current Coverage Areas</h3>
        <p>RFiberX currently provides fiber-optic internet services across <strong style="color:#fff;">21 barangays</strong> in Magdalena, Laguna and the surrounding municipalities. Our network is actively expanding to bring seamless connectivity to more communities.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">Served Barangays</h3>
        <p>Our fiber infrastructure currently covers select barangays within Magdalena, Laguna. If you are unsure whether your area is within our coverage, please do not hesitate to contact us for a quick availability check.</p>

        <h3 style="color:#fff; margin: 1.5rem 0 0.75rem; font-size:1.1rem;">Request Coverage</h3>
        <p>If your barangay is not yet within our service area, we encourage you to reach out. We prioritize expansion based on community demand and may be able to extend our network to your location.</p>

        <div style="margin-top:2rem; padding:1.5rem; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <p style="color:var(--accent-color); font-weight:bold; margin-bottom:0.5rem;">Need a coverage check?</p>
          <p style="margin:0;">Call us at <strong style="color:#fff;">+63 09058395471</strong> or email <strong style="color:#fff;">technicians@rfiberx.net</strong> and our team will verify availability in your area within the same day.</p>
        </div>
      `
    }
  };

  window.openLegalModal = function (type) {
    const modal = document.getElementById('legal-modal');
    const content = legalContent[type];
    if (!content) return;

    document.getElementById('legal-modal-title').textContent = content.title;
    document.getElementById('legal-modal-date').textContent = content.date;
    document.getElementById('legal-modal-body').innerHTML = content.body;
    modal.style.display = 'flex';
  };

  // Close legal modal on outside click
  document.getElementById('legal-modal').addEventListener('click', function (e) {
    if (e.target === this) this.style.display = 'none';
  });
});

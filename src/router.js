export class Router {
  constructor() {
    this.appContent = document.getElementById('app-content');
    window.addEventListener('popstate', () => this.route());
    this.route();
  }

  navigate(path) {
    window.history.pushState(null, null, path);
    this.route();
  }

  route() {
    let path = window.location.pathname;
    let hash = window.location.hash;
    
    if (window.unmountNetworkMap && path !== '/RFiberXAdminportal-mapping') {
      window.unmountNetworkMap();
    }

    if (!window.views[path]) {
      path = '/';
      window.history.replaceState(null, null, '/');
    }

    // Handle isolated routes (admin and client portals)
    const isIsolatedRoute = path.startsWith('/RFiberXAdminportal') || path.startsWith('/clientlogin') || path.startsWith('/clientsignup') || path.startsWith('/dashboard');
    const headerEl = document.querySelector('.navbar');
    const footerEl = document.querySelector('footer.footer');
    if (headerEl) headerEl.style.display = isIsolatedRoute ? 'none' : 'flex';
    if (footerEl) footerEl.style.display = isIsolatedRoute ? 'none' : 'block';
    if (this.appContent) {
      this.appContent.style.marginTop = isIsolatedRoute ? '0' : '70px';
    }

    if (!isIsolatedRoute) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    this.appContent.innerHTML = window.views[path]();
    this.setupScrollAnimations();
    this.updateNavLinks(path);

    if (hash) {
      setTimeout(() => {
        const id = hash.substring(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (path === '/subscriptions') {
          const plans = {
            'starter': ['Starter Fiber', 'Up to 30 Mbps', 'Γé▒800/mo'],
            'value': ['Value Fiber', 'Up to 50 Mbps', 'Γé▒1000/mo'],
            'family': ['Family Fiber', 'Up to 70 Mbps', 'Γé▒1300/mo'],
            'pro': ['Pro Fiber', 'Up to 100 Mbps', 'Γé▒1500/mo'],
            'extreme': ['Extreme Fiber X', 'Up to 200 Mbps', 'Γé▒2000/mo'],
            'ultra': ['Ultra RFiberX', 'Up to 500 Mbps', 'Γé▒4500/mo']
          };
          if (plans[id]) {
            setTimeout(() => {
              this.openSignupForm(plans[id][0], plans[id][1], plans[id][2]);
            }, 300);
          }
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach(el => observer.observe(el));
  }

  updateNavLinks(currentPath) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('href') === currentPath) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  submitApplication(event) {
    event.preventDefault();
    this._pendingForm = event.target;
    const emailInput = document.getElementById('applicant-email');
    const email = emailInput ? emailInput.value : '';

    if (!email) {
      alert('Please fill in your Gmail address.');
      return;
    }

    this._applicantEmail = email;

    // Immediately send the application (bypassing verification)
    this._sendApplicationToOwner();

    // Show the success step in the modal
    const modal = document.getElementById('verify-modal');
    const step1 = document.getElementById('verify-step-1');
    const step2 = document.getElementById('verify-step-2');

    if (modal && step1 && step2) {
      step1.style.display = 'none';
      step2.style.display = 'block';
      modal.style.display = 'flex';
    }

    // Reset and close the signup form
    if (this._pendingForm) this._pendingForm.reset();
    const formContainer = document.getElementById('signup-form-container');
    if (formContainer) formContainer.classList.remove('open');
  }

  _sendVerificationEmail(toEmail, code) {
    // EmailJS integration
    // To make this work with real emails, you need to:
    // 1. Sign up at https://www.emailjs.com
    // 2. Create an email service and template
    // 3. Replace the IDs below with your own
    //
    // Template should have variables: {{to_email}}, {{verification_code}}, {{to_name}}

    if (typeof emailjs !== 'undefined' && emailjs.send) {
      try {
        emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key

        emailjs.send('YOUR_SERVICE_ID', 'YOUR_VERIFICATION_TEMPLATE_ID', {
          to_email: toEmail,
          verification_code: code,
          to_name: 'RFiberX Applicant'
        }).then(() => {
          console.log('Verification email sent successfully to', toEmail);
        }).catch((err) => {
          console.warn('EmailJS not configured yet. Code for testing:', code);
        });
      } catch (e) {
        console.warn('EmailJS not configured yet. Code for testing:', code);
      }
    } else {
      // Fallback: log the code for demo/testing purposes
      console.log('%c[RFiberX] Verification code for ' + toEmail + ': ' + code, 'color: #E53935; font-size: 16px; font-weight: bold;');
    }
  }

  verifyCode() {
    const codeInput = document.getElementById('verify-code-input');
    const errorMsg = document.getElementById('verify-error');
    const step1 = document.getElementById('verify-step-1');
    const step2 = document.getElementById('verify-step-2');

    if (!codeInput) return;

    const enteredCode = codeInput.value.trim();

    if (enteredCode === this._verificationCode) {
      // Code is correct ΓÇö send the application email
      if (errorMsg) errorMsg.style.display = 'none';
      this._sendApplicationToOwner();

      // Show success step
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'block';

      // Reset and close the signup form
      if (this._pendingForm) this._pendingForm.reset();
      const formContainer = document.getElementById('signup-form-container');
      if (formContainer) formContainer.classList.remove('open');
    } else {
      // Wrong code
      if (errorMsg) {
        errorMsg.textContent = 'Incorrect code. Please try again.';
        errorMsg.style.display = 'block';
      }
      codeInput.value = '';
      codeInput.focus();
    }
  }

  resendCode() {
    // Generate a new code and resend
    this._verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    this._sendVerificationEmail(this._applicantEmail, this._verificationCode);

    const errorMsg = document.getElementById('verify-error');
    if (errorMsg) {
      errorMsg.textContent = 'A new verification code has been sent!';
      errorMsg.style.color = '#E53935';
      errorMsg.style.display = 'block';
      setTimeout(() => {
        errorMsg.style.display = 'none';
        errorMsg.style.color = '#ef4444';
      }, 3000);
    }
  }

  closeVerifyModal() {
    const modal = document.getElementById('verify-modal');
    if (modal) modal.style.display = 'none';
  }

  _sendApplicationToOwner() {
    // Collect form data
    const plan = document.getElementById('selected-plan-input')?.value || 'N/A';
    const speed = document.getElementById('selected-plan-speed')?.value || 'N/A';
    const price = document.getElementById('selected-plan-price')?.value || 'N/A';
    const email = this._applicantEmail || 'N/A';
    const facebook = document.getElementById('applicant-facebook')?.value || 'N/A';
    const phone = document.getElementById('applicant-phone')?.value || 'N/A';
    const subLocation = document.getElementById('applicant-sublocation')?.value || 'N/A';
    const otherLocation = document.getElementById('applicant-other-location')?.value || 'N/A';
    const landmarks = document.getElementById('applicant-landmarks')?.value || 'N/A';
    const time = new Date().toLocaleString();

    const applicationSummary = `
New RFiberX Application
========================
Plan: ${plan} (${speed} - ${price})
Email: ${email}
Facebook: ${facebook}
Phone: ${phone}
Location: Magdalena
Sub Location: ${subLocation}
Other Location: ${otherLocation}
Landmarks: ${landmarks}
========================
Submitted at: ${time}
    `.trim();

    // Send to applicant@rfiberx.net via EmailJS
    if (typeof emailjs !== 'undefined' && emailjs.send) {
      try {
        // EmailJS v4 method: Pass public key directly into the send function
        emailjs.send('service_pg8s2oz', 'template_1585hug', {
          to_email: 'applicant@rfiberx.net',
          applicant_email: email,
          email: email, // Required for Reply-To
          facebook_name: facebook,
          name: facebook, // Required for From Name
          title: plan + " Plan", // Required for Subject
          phone_number: phone,
          plan_name: plan,
          plan_speed: speed,
          plan_price: price,
          sub_location: subLocation,
          other_location: otherLocation,
          landmarks: landmarks,
          time: time,
          message: applicationSummary
        }, 'S98OERrmNiDPNOP7D').then((response) => {
          console.log('Application email sent successfully!', response.status, response.text);
        }).catch((err) => {
          console.error('EmailJS Error:', err);
          alert('EmailJS Error: ' + (err.text || err.message || JSON.stringify(err)) + '\n\nPlease ensure your website URL (localhost or your domain) is added to the "Allowed Origins" in your EmailJS Account Security settings.');
        });
      } catch (e) {
        console.warn('EmailJS not configured. Application details:', applicationSummary);
      }
    } else {
      console.log('%c[RFiberX] Application submitted to applicant@rfiberx.net', 'color: #10b981; font-size: 14px; font-weight: bold;');
      console.log(applicationSummary);
    }
  }

  submitContactMessage(event) {
    event.preventDefault();
    const form = event.target;
    const name = document.getElementById('contact-name')?.value || 'N/A';
    const email = document.getElementById('contact-email')?.value || 'N/A';
    const phone = document.getElementById('contact-phone')?.value || 'N/A';
    const subject = document.getElementById('contact-subject')?.value || 'N/A';
    const message = document.getElementById('contact-message')?.value || 'N/A';
    let subLocation = document.getElementById('contact-sublocation')?.value || 'N/A';

    if (subLocation === 'Other') {
      const otherLocation = document.getElementById('contact-other-location')?.value || 'N/A';
      subLocation = `Other: ${otherLocation}`;
    }

    const time = new Date().toLocaleString();

    if (typeof emailjs !== 'undefined' && emailjs.send) {
      emailjs.send('service_pg8s2oz', 'template_m960j5j', {
        to_email: 'clients@rfiberx.net',
        email: email,
        phone_number: phone,
        name: name,
        title: subject,
        sub_location: subLocation,
        message: message,
        time: time
      }, 'S98OERrmNiDPNOP7D').then((response) => {
        const modal = document.getElementById('contact-modal');
        if (modal) modal.style.display = 'flex';
        form.reset();
      }).catch((err) => {
        console.error('EmailJS Error:', err);
        alert('EmailJS Error: ' + (err.text || err.message || JSON.stringify(err)) + '\n\nPlease ensure your origin is allowed in EmailJS.');
      });
    } else {
      alert('Email service not configured yet.');
    }
  }

  submitJobApplication(event) {
    event.preventDefault();
    const form = event.target;

    // Extract job form data
    const firstName = document.getElementById('apply-firstname')?.value || '';
    const lastName = document.getElementById('apply-lastname')?.value || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = document.getElementById('apply-email')?.value || 'N/A';
    const phone = document.getElementById('apply-phone')?.value || 'N/A';
    const position = document.getElementById('apply-position')?.value || 'N/A';
    const education = document.getElementById('apply-education')?.value || 'N/A';
    const experience = document.getElementById('apply-experience')?.value || 'N/A';
    const coverLetter = document.getElementById('apply-coverletter')?.value || 'No cover letter provided.';
    const time = new Date().toLocaleString();

    // Format all of this into a single text block for the EmailJS message
    const jobApplicationSummary =
      `--- APPLICANT PROFILE ---\n` +
      `Position: ${position}\n` +
      `Education: ${education}\n` +
      `Experience: ${experience}\n\n` +
      `--- COVER LETTER ---\n${coverLetter}`;

    if (typeof emailjs !== 'undefined' && emailjs.send) {
      // Reusing the Concern Template (template_m960j5j) but sending to applicant@rfiberx.net
      emailjs.send('service_pg8s2oz', 'template_m960j5j', {
        to_email: 'applicant@rfiberx.net',
        email: email,
        phone_number: phone,
        name: fullName,
        title: `Job Application: ${position}`,
        sub_location: 'Not Applicable',
        message: jobApplicationSummary,
        time: time
      }, 'S98OERrmNiDPNOP7D').then((response) => {
        alert('Job Application submitted successfully! Our HR team will review your application and contact you within 5\u20137 business days.');
        form.reset();
      }).catch((err) => {
        console.error('EmailJS Error:', err);
        alert('EmailJS Error: ' + (err.text || err.message || JSON.stringify(err)));
      });
    } else {
      alert('Email service not configured. Job application saved locally.');
      console.log('Job App:', { fullName, email, position });
    }
  }

  openSignupForm(planName, planSpeed, planPrice) {
    const formContainer = document.getElementById('signup-form-container');
    const planInput = document.getElementById('selected-plan-input');
    const speedInput = document.getElementById('selected-plan-speed');
    const priceInput = document.getElementById('selected-plan-price');

    if (formContainer && planInput && speedInput) {
      if (formContainer.classList.contains('open') && planInput.value === planName) {
        formContainer.classList.remove('open');
        return;
      }

      planInput.value = planName;
      speedInput.value = planSpeed;
      if (priceInput) priceInput.value = planPrice || '';
      formContainer.classList.add('open');

      // Smooth scroll to the form
      setTimeout(() => {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      // If they clicked it from the home page, redirect to subscriptions first
      this.navigate('/subscriptions');
      setTimeout(() => {
        this.openSignupForm(planName, planSpeed, planPrice);
      }, 100);
    }
  }
}

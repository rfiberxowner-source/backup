export const clientViews = {
  '/clientlogin': () => {
    // Hide footer/header globally
    const headerEl = document.querySelector('.navbar');
    const footerEl = document.querySelector('footer.footer');
    if (headerEl) headerEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'none';

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    window.submitClientLogin = async function (e) {
      if (e) e.preventDefault();
      const identifier = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorMsg = document.getElementById('loginErrorMsg');
      const submitBtn = document.getElementById('loginSubmitBtn');

      errorMsg.style.display = 'none';

      if (!identifier || !password) {
        errorMsg.textContent = 'Please enter both email/name and password.';
        errorMsg.style.display = 'block';
        return;
      }

      submitBtn.innerHTML = 'Signing in...';
      submitBtn.disabled = true;

      try {
        const isEmail = identifier.includes('@');
        const queryField = isEmail ? 'email' : 'name';

        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const firebaseConfig = {
          apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
          authDomain: "portal-c293a.firebaseapp.com",
          projectId: "portal-c293a",
          storageBucket: "portal-c293a.firebasestorage.app",
          messagingSenderId: "159583415029",
          appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
        };

        let app;
        try { app = initializeApp(firebaseConfig); } catch (err) { }
        const db = getFirestore();

        const q = query(collection(db, "users"), where(queryField, "==", identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          errorMsg.textContent = 'Account not found. Please try again.';
          errorMsg.style.display = 'block';
          submitBtn.innerHTML = 'Sign in &rarr;';
          submitBtn.disabled = false;
          return;
        }

        let authenticated = false;
        querySnapshot.forEach((doc) => {
          if (doc.data().password === password) {
            authenticated = true;
            localStorage.setItem('clientUser', JSON.stringify({ id: doc.id, ...doc.data() }));
          }
        });

        if (authenticated) {
          window.router.navigate('/dashboard');
        } else {
          errorMsg.textContent = 'Incorrect password. Please try again.';
          errorMsg.style.display = 'block';
          submitBtn.innerHTML = 'Sign in &rarr;';
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error(error);
        errorMsg.textContent = 'An error occurred during login. Please try again later.';
        errorMsg.style.display = 'block';
        submitBtn.innerHTML = 'Sign in &rarr;';
        submitBtn.disabled = false;
      }
    };

    return `
      <div class="split-layout" style="height: 100vh; background: #0b0f19; display: flex; font-family: 'Inter', sans-serif;">
        <!-- Left Side -->
        <div class="split-layout-hide-mobile" style="flex: 1; position: relative; background: #1a202c; display: flex; flex-direction: column; justify-content: space-between; padding: 4rem;">
          
          <div style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; overflow: hidden; pointer-events: none;">
            <div style="position: absolute; top: 50%; left: 0; transform: translateY(-50%); width: 80%; height: 80%; background: radial-gradient(circle, rgba(229,57,53,0.15) 0%, rgba(26,32,44,0) 70%); filter: blur(60px);"></div>
          </div>
          
          <div style="position: relative; z-index: 1;">
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; display: inline-block; margin-bottom: 4rem;">
              <span style="font-family: 'Saira Condensed', sans-serif; font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: -1px;">
                <span style="color: #E53935;">R</span><span style="color: #fff;">FIBER</span><span style="color: #E53935;">X</span>
                <div style="font-size: 10px; color: #fff; letter-spacing: 2px; font-weight: 500; font-style: normal; margin-top: -5px;">NETWORKS</div>
              </span>
            </div>
            
            <div style="color: #E53935; font-size: 0.8rem; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 1rem;">JOIN R-FIBER</div>
            <h1 style="color: #fff; font-size: 4rem; font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 1.5rem;">Better internet<br>starts here.</h1>
            <p style="color: #cbd5e1; font-size: 1.1rem; line-height: 1.6; max-width: 400px;">Access your portal account and stay in control from day one.</p>
          </div>
          
          <div style="position: relative; z-index: 1; color: #64748b; font-size: 0.9rem;">
            Unlimited possibilities. One reliable connection.
          </div>
        </div>

        <!-- Right Side -->
        <div style="flex: 1; background: #0b0f19; display: flex; flex-direction: column; padding: 3rem 4rem; position: relative;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4rem;">
            <a href="#" onclick="event.preventDefault(); window.router.navigate('/');" style="color: #94a3b8; text-decoration: none; font-size: 0.85rem; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Back to home</a>
          </div>

          <div style="max-width: 420px; width: 100%; margin: 0 auto; flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <div style="color: #E53935; font-size: 0.75rem; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 1rem; text-transform: uppercase;">Portal Login</div>
            <h2 style="color: #fff; font-size: 2.2rem; font-weight: 700; letter-spacing: -1px; margin-bottom: 0.5rem;">Welcome back</h2>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 2.5rem;">Log in to manage your connection and billing.</p>
            
            <form onsubmit="window.submitClientLogin(event)">
              <div style="margin-bottom: 1.25rem;">
                <label style="display: block; color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Email or Full Name</label>
                <input type="text" id="loginIdentifier" placeholder="you@example.com" style="width: 100%; background: #1a202c; border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem; outline: none; transition: all 0.2s; font-family: inherit;" onfocus="this.style.borderColor='#E53935'; this.style.background='#2d3748'" onblur="this.style.borderColor='rgba(255,255,255,0.05)'; this.style.background='#1a202c'">
              </div>
              
              <div style="margin-bottom: 2rem;">
                <label style="display: block; color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Password</label>
                <input type="password" id="loginPassword" placeholder="At least 6 characters" style="width: 100%; background: #1a202c; border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem; outline: none; transition: all 0.2s; font-family: inherit;" onfocus="this.style.borderColor='#E53935'; this.style.background='#2d3748'" onblur="this.style.borderColor='rgba(255,255,255,0.05)'; this.style.background='#1a202c'">
              </div>
              
              <div id="loginErrorMsg" style="background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; font-size: 0.85rem; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; display: none;"></div>

              <button id="loginSubmitBtn" type="submit" style="width: 100%; background: #e53935; color: #fff; border: none; padding: 0.85rem; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(229,57,53,0.2);" onmouseover="this.style.background='#f44336'" onmouseout="this.style.background='#e53935'">
                Sign in &rarr;
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  '/dashboard': () => {
    const headerEl = document.querySelector('.navbar');
    const footerEl = document.querySelector('footer.footer');
    if (headerEl) headerEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'none';

    // Prevent double scrollbars globally
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const userStr = localStorage.getItem('clientUser');
    if (!userStr) {
      setTimeout(() => window.router.navigate('/clientlogin'), 0);
      return '<div style="height: 100vh; background: #0b0f19;"></div>';
    }

    const user = JSON.parse(userStr);
    
    // Online Presence Heartbeat
    if (window.clientPortalHeartbeat) clearInterval(window.clientPortalHeartbeat);
    const updatePresence = async () => {
      try {
        const { db, firestore } = await window._getDb();
        const userRef = firestore.doc(db, "users", user.id);
        await firestore.updateDoc(userRef, { lastActive: firestore.serverTimestamp() });
      } catch (e) { console.error("Presence update failed:", e); }
    };
    updatePresence(); // Initial ping
    window.clientPortalHeartbeat = setInterval(updatePresence, 30000);
    const basePlanAmount = user.ammount || user.amount || '0.00';
    const plan = user.Plan || user.plan || 'Please add plan';
    const acctNum = user.accountNumber || user.account || 'Please add account number';
    const email = user.email || 'Please add email address';
    const name = user.name || 'Please add name';

    const isLight = localStorage.getItem('clientPortalTheme') === 'light';
    const themeIcon = isLight ? '🌙' : '☀️';
    const themeText = isLight ? 'Dark Mode' : 'Light Mode';

    if (!document.getElementById('theme-toggle-style')) {
      const style = document.createElement('style');
      style.id = 'theme-toggle-style';
      style.textContent = `
        html.light-mode {
          filter: invert(1) hue-rotate(180deg);
        }
        html.light-mode img,
        html.light-mode video,
        html.light-mode svg {
          filter: invert(1) hue-rotate(-180deg);
        }
      `;
      document.head.appendChild(style);
    }

    if (isLight) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    window.toggleThemeMode = function() {
      const isCurrentlyLight = document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('clientPortalTheme', isCurrentlyLight ? 'light' : 'dark');
      const iconEl = document.getElementById('theme-icon');
      const textEl = document.getElementById('theme-text');
      if (iconEl && textEl) {
        iconEl.textContent = isCurrentlyLight ? '🌙' : '☀️';
        textEl.textContent = isCurrentlyLight ? 'Dark Mode' : 'Light Mode';
      }
    };

    window.logoutClient = function () {
      if (window.clientPortalHeartbeat) {
        clearInterval(window.clientPortalHeartbeat);
        window.clientPortalHeartbeat = null;
      }
      localStorage.removeItem('clientUser');
      window.router.navigate('/clientlogin');
    };

    window.scrollToSection = function (id) {
      const el = document.getElementById('content-' + id);
      const container = document.getElementById('dashboard-scroll-container');
      if (el && container) {
        container.scrollTo({
          top: el.offsetTop - 100, // Account for topbar offset
          behavior: 'smooth'
        });
      }
    };

    window.clientReportsData = {};

    window.renderClientReportsTable = function () {
      const tbody = document.querySelector('#content-support table tbody');
      if (!tbody) return;

      let reports = Object.values(window.clientReportsData);

      if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem 0; color: #94a3b8; font-size: 0.85rem;">You have not created any service requests.</td></tr>';
      } else {
        // Sort logic: Pending/Read first by date, then Fixed by processedDate
        reports.sort((a, b) => {
          if (a.status !== 'Fixed' && b.status === 'Fixed') return -1;
          if (a.status === 'Fixed' && b.status !== 'Fixed') return 1;

          if (a.status === 'Fixed' && b.status === 'Fixed') {
            return new Date(b.processedDate || b.date) - new Date(a.processedDate || a.date);
          }
          return new Date(b.date) - new Date(a.date);
        });

        let html = '';
        reports.forEach(r => {
          let badge = '';
          if (r.status === 'Read') {
            badge = '<span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Read</span>';
          } else if (r.status === 'Fixed') {
            badge = '<span style="background: rgba(99,102,241,0.1); color: #6366f1; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Fixed</span>';
          } else {
            badge = '<span style="background: rgba(245,158,11,0.1); color: #f59e0b; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Pending</span>';
          }

          let doneBtn = '';
          if (r.status === 'Read') {
            doneBtn = '<button onclick="window.markReportFixed(event, \'' + r.id + '\')" style="background: #3b82f6; color: #fff; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background=\'#2563eb\'" onmouseout="this.style.background=\'#3b82f6\'">Done</button>';
          }

          html += '<tr onclick="window.viewClientReport(\'' + r.id + '\')" style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.02)\'" onmouseout="this.style.background=\'transparent\'">';
          html += '<td style="padding: 1rem 0; color: #fff; font-size: 0.8rem; font-weight: 500;">' + (r.reportId || '-') + '</td>';
          html += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (r.subject || '-') + '</td>';
          html += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (r.category || '-') + '</td>';
          html += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (r.address || 'None') + '</td>';
          html += '<td style="padding: 1rem 0;">' + badge + '</td>';
          html += '<td style="padding: 1rem 0;">' + doneBtn + '</td>';
          html += '</tr>';
        });
        tbody.innerHTML = html;
      }

      // Update Dashboard Overview dynamically
      const recBox = document.getElementById('recent-updates-box');
      const recCount = document.getElementById('recent-updates-count');

      if (recBox) {
        let recentItems = [];

        reports.forEach(t => {
          let tTime = new Date(t.processedDate || t.date).getTime();
          let dateStr = new Date(t.processedDate || t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          if (t.status === 'Fixed' || t.status === 'Read' || t.status === 'Pending') {
            let statusColor = t.status === 'Fixed' ? '#6366f1' : (t.status === 'Read' ? '#10b981' : '#f59e0b');
            let statusIcon = t.status === 'Fixed' ? '🔧' : (t.status === 'Read' ? '👁️' : '⏳');
            let statusText = t.status === 'Fixed' ? 'Ticket Fixed' : (t.status === 'Read' ? 'Ticket Read' : 'Ticket Pending');
            let message = t.status === 'Fixed' ? 'Your report has been resolved.' : (t.status === 'Read' ? 'The admin has viewed your report.' : 'Your report is waiting to be processed.');

            let html = `<div class="client-ticket-update" onclick="window.viewClientReport('${t.id}')" style="background: rgba(59,130,246,0.03); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px; padding: 0.75rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.08)'" onmouseout="this.style.background='rgba(59,130,246,0.03)'">`;
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">';
            html += '<div style="display: flex; align-items: center; gap: 0.5rem;">';
            html += `<div style="width: 28px; height: 28px; background: ${statusColor}22; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">${statusIcon}</div>`;
            html += `<span style="color: #fff; font-size: 0.9rem; font-weight: 600;">${statusText}</span>`;
            html += '</div>';
            html += `<span style="color: #64748b; font-size: 0.75rem;">${dateStr}</span>`;
            html += '</div>';
            html += `<div style="color: #94a3b8; font-size: 0.85rem; padding-left: 2.25rem;">${message} <span style="color: #3b82f6; font-size: 0.75rem;">View details →</span></div>`;
            
            // Ticket Mini-Preview
            html += '<div style="margin-top: 1rem; padding-left: 2.25rem; display: flex; justify-content: center;">';
            html += `<div style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem; width: 180px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: stretch; position: relative; overflow: hidden;">`;
            html += `<div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${statusColor};"></div>`;
            html += '<div style="flex: 1; padding-left: 6px;">';
            html += `<div style="color: #94a3b8; font-size: 0.55rem; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Ticket ID: ${t.reportId || '---'}</div>`;
            html += `<div style="color: #fff; font-size: 0.7rem; font-weight: 600; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${t.subject || 'Ticket'}</div>`;
            html += '<div style="background: rgba(255,255,255,0.05); height: 4px; width: 100%; margin-bottom: 4px; border-radius: 2px;"></div>';
            html += '<div style="background: rgba(255,255,255,0.05); height: 4px; width: 70%; border-radius: 2px;"></div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';

            html += '</div>';
            recentItems.push({ time: tTime, html: html });
          }
        });

        if (window.clientActiveBills) {
          window.clientActiveBills.forEach(be => {
            let tTime = new Date(be.dateSent).getTime();
            let dateStr = new Date(be.dateSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            let isUnread = be.status === 'unread';
            let bgColor = isUnread ? 'rgba(229,57,53,0.03)' : 'transparent';
            let borderColor = isUnread ? 'rgba(229,57,53,0.15)' : 'rgba(255,255,255,0.05)';
            let newBadge = isUnread ? '<span style="background: #E53935; color: #fff; font-size: 0.55rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700;">NEW</span>' : '';

            let aHtml = '<div style="background: ' + bgColor + '; border: 1px solid ' + borderColor + '; border-radius: 10px; padding: 0.75rem; margin-bottom: 1rem;">';
            aHtml += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">';
            aHtml += '<div style="display: flex; align-items: center; gap: 0.5rem;">';
            aHtml += '<div style="width: 28px; height: 28px; background: rgba(229,57,53,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #E53935; font-size: 0.75rem;">📄</div>';
            aHtml += '<span style="color: #fff; font-size: 0.9rem; font-weight: 600;">Billing Statement</span>';
            aHtml += newBadge;
            aHtml += '</div>';
            aHtml += '<span style="color: #64748b; font-size: 0.75rem;">' + dateStr + '</span>';
            aHtml += '</div>';
            aHtml += '<div style="border-left: 3px solid #E53935; padding-left: 1rem; margin-bottom: 0.75rem;">';
            aHtml += '<div style="color: #E53935; font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">Account Information</div>';
            aHtml += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem;">';
            aHtml += '<div style="color: #94a3b8; font-size: 0.8rem;">Name:</div>';
            aHtml += '<div style="color: #fff; font-size: 0.8rem; font-weight: 600;">' + (be.name || '-') + '</div>';
            aHtml += '<div style="color: #94a3b8; font-size: 0.8rem;">Account #:</div>';
            aHtml += '<div style="color: #fff; font-size: 0.8rem; font-weight: 600;">' + (be.accountNumber || '-') + '</div>';
            aHtml += '<div style="color: #94a3b8; font-size: 0.8rem;">Plan:</div>';
            aHtml += '<div style="color: #fff; font-size: 0.8rem; font-weight: 600;">' + (be.plan || '-') + '</div>';
            aHtml += '</div></div>';
            aHtml += '<div style="background: rgba(229,57,53,0.05); border: 1px solid rgba(229,57,53,0.1); border-radius: 8px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">';
            aHtml += '<div><div style="color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Amount Due</div>';
            aHtml += '<div style="color: #fff; font-size: 1.1rem; font-weight: 700;">₱' + (be.amount || '0') + '</div></div>';
            aHtml += '<div style="text-align: right;"><div style="color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Due Date</div>';
            aHtml += '<div style="color: #E53935; font-size: 0.85rem; font-weight: 600;">' + (be.dueDate || '-') + '</div></div>';
            aHtml += '</div></div>';

            recentItems.push({ time: tTime, html: aHtml });
          });
        }

        if (window.clientPayments) {
          window.clientPayments.forEach(p => {
            let da = p.datePaid || p.date || 0;
            if (p.timestamp && p.timestamp.toDate) da = p.timestamp.toDate();
            let tTime = new Date(da).getTime();
            let pDate = new Date(da).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            let html = '<div onclick="window.viewReceipt(\'' + p.id + '\')" style="background: rgba(16,185,129,0.03); border: 1px solid rgba(16,185,129,0.15); border-radius: 10px; padding: 0.75rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\'rgba(16,185,129,0.08)\'" onmouseout="this.style.background=\'rgba(16,185,129,0.03)\'">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">';
            html += '<div style="display: flex; align-items: center; gap: 0.5rem;">';
            html += '<div style="width: 28px; height: 28px; background: rgba(16,185,129,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 0.75rem;">✓</div>';
            html += '<span style="color: #fff; font-size: 0.9rem; font-weight: 600;">Payment Successful</span>';
            html += '</div>';
            html += '<span style="color: #64748b; font-size: 0.75rem;">' + pDate + '</span>';
            html += '</div>';
            html += '<div style="color: #94a3b8; font-size: 0.85rem; padding-left: 2.25rem;">You paid <strong style="color:#fff;">₱' + (p.amount || '0') + '</strong> for ' + (p.period || p.billingMonth || '-') + '. <span style="color: #3b82f6; font-size: 0.75rem;">View receipt →</span></div>';
            
            // Payment Receipt Mini-Preview
            html += '<div style="margin-top: 1rem; padding-left: 2.25rem; display: flex; justify-content: center;">';
            html += '<div style="background: #f8fafc; border-radius: 6px; padding: 0.75rem; width: 150px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative;">';
            html += '<div style="border-bottom: 1px dashed #94a3b8; margin-bottom: 0.5rem; padding-bottom: 0.4rem; text-align: center;">';
            html += '<div style="color: #E53935; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px;">RFIBERX</div>';
            html += '<div style="color: #475569; font-size: 0.45rem; text-transform: uppercase;">Official Receipt</div>';
            html += '</div>';
            html += '<div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 0.5rem;">';
            html += '<div style="background: #cbd5e1; height: 4px; width: 100%; border-radius: 2px;"></div>';
            html += '<div style="background: #cbd5e1; height: 4px; width: 60%; border-radius: 2px;"></div>';
            html += '<div style="background: #cbd5e1; height: 4px; width: 80%; border-radius: 2px;"></div>';
            html += '</div>';
            html += '<div style="border-top: 1px solid #cbd5e1; padding-top: 0.4rem; text-align: center;">';
            html += '<div style="color: #0f172a; font-size: 0.9rem; font-weight: 700;">₱' + (p.amount || '0') + '</div>';
            html += '<div style="color: #64748b; font-size: 0.5rem;">' + (p.period || p.billingMonth || 'Paid') + '</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';

            html += '</div>';
            recentItems.push({ time: tTime, html: html });
          });
        }

        recentItems.sort((a, b) => b.time - a.time);

        if (recentItems.length > 0) {
          recBox.innerHTML = recentItems.slice(0, 30).map(i => i.html).join('');
          if (recCount) recCount.textContent = Math.min(recentItems.length, 30);
        } else {
          recBox.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 3rem;">You\'re all caught up. New service updates will appear here.</div>';
          if (recCount) recCount.textContent = '0';
        }
      }
    };

    window.viewClientReport = function (id) {
      const r = window.clientReportsData[id];
      if (!r) return;

      document.getElementById('client-modal-ticket-id').textContent = r.reportId || '-';
      document.getElementById('client-modal-name').textContent = r.name || '-';
      document.getElementById('client-modal-account').textContent = r.accountNumber || '-';
      document.getElementById('client-modal-plan').textContent = r.plan || '-';
      document.getElementById('client-modal-phone').textContent = r.phone || '-';
      document.getElementById('client-modal-fb').textContent = r.facebook || '-';
      document.getElementById('client-modal-address').textContent = r.address || 'None';
      document.getElementById('client-modal-category').textContent = r.category || 'Other';
      document.getElementById('client-modal-subject').textContent = r.subject || '-';
      document.getElementById('client-modal-desc').textContent = r.description || '-';
      document.getElementById('client-modal-date').textContent = new Date(r.date).toLocaleString();

      const badgeEl = document.getElementById('client-modal-status-badge');
      if (r.status === 'Read') {
        badgeEl.innerHTML = '<span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Read</span>';
      } else if (r.status === 'Fixed') {
        badgeEl.innerHTML = '<span style="background: rgba(99,102,241,0.1); color: #6366f1; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Fixed</span>';
      } else {
        badgeEl.innerHTML = '<span style="background: rgba(245,158,11,0.1); color: #f59e0b; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Pending</span>';
      }

      document.getElementById('client-ticket-modal').style.display = 'flex';
    };

    window.closeClientReport = function () {
      document.getElementById('client-ticket-modal').style.display = 'none';
    };

    window.markReportFixed = async function (e, id) {
      e.stopPropagation();
      try {
        const btn = e.target;
        btn.innerHTML = '...';
        btn.disabled = true;

        const firebaseConfig = {
          apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
          authDomain: "portal-c293a.firebaseapp.com",
          projectId: "portal-c293a",
          storageBucket: "portal-c293a.firebasestorage.app",
          messagingSenderId: "159583415029",
          appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
        };
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        try { initializeApp(firebaseConfig); } catch (err) { }

        const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        const processedDate = new Date().toISOString();
        await updateDoc(doc(db, "reports", id), { status: 'Fixed', processedDate: processedDate });

        // Update local cache and re-render table
        if (window.clientReportsData[id]) {
          window.clientReportsData[id].status = 'Fixed';
          window.clientReportsData[id].processedDate = processedDate;
          window.renderClientReportsTable();
        }

        window.openRatingModal(id);
      } catch (err) {
        console.error('Error marking report fixed:', err);
        alert('Failed to mark report as Done.');
        e.target.innerHTML = 'Done';
        e.target.disabled = false;
      }
    };

    window.currentRatingScore = 0;
    window.currentRatingReportId = null;

    window.setRating = function (score) {
      window.currentRatingScore = score;
      const stars = document.querySelectorAll('#rating-stars span');
      stars.forEach((s, i) => {
        if (i < score) {
          s.style.color = '#fbbf24';
        } else {
          s.style.color = '#334155';
        }
      });

      const btn = document.getElementById('btn-submit-rating');
      if (btn) {
        if (score > 0) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        } else {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        }
      }
    };

    window.openRatingModal = function (reportId) {
      window.currentRatingReportId = reportId;
      window.setRating(0); // reset
      const fb = document.getElementById('rating-feedback');
      if (fb) fb.value = '';
      const modal = document.getElementById('rating-modal');
      if (modal) modal.style.display = 'flex';
    };

    window.closeRatingModal = function () {
      const modal = document.getElementById('rating-modal');
      if (modal) modal.style.display = 'none';
      window.currentRatingReportId = null;
    };

    window.skipRating = function () {
      window.closeRatingModal();
    };

    window.submitRating = async function () {
      if (window.currentRatingScore < 1) return;
      const btn = document.getElementById('btn-submit-rating');
      btn.innerHTML = '...';
      btn.disabled = true;

      try {
        const { db, firestore } = await window._getDb();
        const { doc, updateDoc, collection, addDoc, serverTimestamp } = firestore;
        const feedback = document.getElementById('rating-feedback').value || '';

        // Save rating to the 'ratings' subcollection of this report
        await addDoc(collection(db, "reports", window.currentRatingReportId, "ratings"), {
          rating: window.currentRatingScore,
          feedback: feedback,
          timestamp: serverTimestamp()
        });

        // Also mark the report as resolved
        await updateDoc(doc(db, "reports", window.currentRatingReportId), {
          status: 'resolved'
        });

        if (window.clientReportsData[window.currentRatingReportId]) {
          window.clientReportsData[window.currentRatingReportId].rating = window.currentRatingScore;
          window.clientReportsData[window.currentRatingReportId].feedback = feedback;
        }

        window.closeRatingModal();
        btn.innerHTML = 'Rate';
      } catch (err) {
        console.error('Error submitting rating:', err);
        alert('Failed to submit rating.');
        btn.innerHTML = 'Rate';
        btn.disabled = false;
      }
    };

    window.jumpToEditEmail = function () {
      const container = document.getElementById('dashboard-scroll-container');
      const profileSec = document.getElementById('content-profile');
      if (container && profileSec) {
        container.scrollTo({
          top: profileSec.offsetTop - 100,
          behavior: 'smooth'
        });
      }
      setTimeout(() => {
        const emailInput = document.getElementById('edit-email');
        if (emailInput) emailInput.focus();
      }, 500);
    };

    // Auto scroll if requested via hash reload
    setTimeout(() => {
      if (window.location.hash === '#profile') {
        window.scrollToSection('profile');
        history.replaceState(null, null, ' ');
      }
    }, 400);

    // Password Toggle (in Subscriber Info block)
    window.togglePasswordVisibility = function () {
      const masked = document.getElementById('ui-profile-pass-masked');
      const real = document.getElementById('ui-profile-pass-real');
      const btn = document.getElementById('toggle-pass-btn');
      if (masked.style.display !== 'none') {
        masked.style.display = 'none';
        real.style.display = 'inline';
        btn.textContent = 'Hide';
      } else {
        masked.style.display = 'inline';
        real.style.display = 'none';
        btn.textContent = 'Show';
      }
    };

    // Edit Password Toggle (in Alter Details block)
    window.toggleEditPassword = function (event) {
      const input = document.getElementById('edit-pass');
      const btn = event.target;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
      window.handleInputPreview('edit-pass', 'preview-pass');
    };

    // Live preview for text inputs
    window.handleInputPreview = function (inputId, previewId) {
      const input = document.getElementById(inputId);
      const preview = document.getElementById(previewId);
      if (!input || !preview) return;

      const val = input.value.trim();
      if (val) {
        preview.style.display = 'inline';
        if (input.type === 'password') {
          preview.innerHTML = '&rarr; ' + '•'.repeat(val.length);
        } else {
          preview.innerHTML = '&rarr; ' + val;
        }
      } else {
        preview.style.display = 'none';
        preview.innerHTML = '';
      }
    };

    // Highlight Subscriber Info container & Auto-Center
    window.handleInputFocus = function (containerId, isFocus) {
      const container = document.getElementById(containerId);
      if (container) {
        if (isFocus) {
          container.style.background = 'rgba(229,57,53,0.1)';
          container.style.borderLeft = '4px solid #E53935';

          // Auto center logic accounting for 70px topbar
          const scrollParent = document.getElementById('dashboard-scroll-container');
          if (scrollParent) {
            const containerRect = container.getBoundingClientRect();
            const parentRect = scrollParent.getBoundingClientRect();
            const visibleCenter = (parentRect.height + 70) / 2;
            const elementCenter = containerRect.top + (containerRect.height / 2);
            const offsetToCenter = elementCenter - visibleCenter;

            scrollParent.scrollBy({
              top: offsetToCenter,
              behavior: 'smooth'
            });
          }
        } else {
          container.style.background = 'transparent';
          container.style.borderLeft = 'none';
        }
      }
    };

    // Modal / Save Logic
    window.triggerSaveChanges = function () {
      const fields = [
        { id: 'edit-name', label: 'Full Name', dbKey: 'name' },
        { id: 'edit-email', label: 'Email Address', dbKey: 'email' },
        { id: 'edit-address', label: 'Address', dbKey: 'address' },
        { id: 'edit-phone', label: 'Phone Number', dbKey: 'phone' },
        { id: 'edit-fb', label: 'Facebook Profile', dbKey: 'facebook' },
        { id: 'edit-pass', label: 'Password', dbKey: 'password' },
      ];

      window._pendingChanges = {};
      window._pendingLabels = [];

      fields.forEach(f => {
        const val = document.getElementById(f.id).value.trim();
        if (val) {
          window._pendingChanges[f.dbKey] = val;
          window._pendingLabels.push(f.label);
        }
      });

      if (window._pendingLabels.length === 0) return; // Nothing to change

      const ul = document.getElementById('modal-changes-list');
      ul.innerHTML = window._pendingLabels.map(l => `<li>${l}</li>`).join('');

      document.getElementById('save-modal').style.display = 'flex';
    };

    window.cancelSaveChanges = function () {
      document.getElementById('save-modal').style.display = 'none';
      // clear textboxes
      ['edit-name', 'edit-email', 'edit-address', 'edit-phone', 'edit-fb', 'edit-pass'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.value = '';
          window.handleInputPreview(id, id.replace('edit-', 'preview-'));
        }
      });
      window._pendingChanges = {};
      window._pendingLabels = [];
    };

    window.confirmSaveChanges = async function () {
      const btn = document.getElementById('modal-confirm-btn');
      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        const userStr = localStorage.getItem('clientUser');
        const userObj = JSON.parse(userStr);

        await updateDoc(doc(db, "users", userObj.id), window._pendingChanges);

        document.getElementById('save-modal').style.display = 'none';

        // Reload with hash
        window.location.hash = 'profile';
        window.location.reload();
      } catch (error) {
        console.error("Error saving changes:", error);
        btn.textContent = 'Error. Try again';
        btn.disabled = false;
      }
    };

    // Change bill status (testing dropdown)
    window.changeBillStatus = async function (selectEl, billDocId) {
      var newStatus = selectEl.value;
      try {
        const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        const userStr = localStorage.getItem('clientUser');
        const userObj = JSON.parse(userStr);
        var firestoreStatus = newStatus === 'Overdue' ? 'overdue' : 'unread';
        await updateDoc(doc(db, "users", userObj.id, "billing_emails", billDocId), { status: firestoreStatus });
        selectEl.style.color = newStatus === 'Overdue' ? '#ef4444' : '#f59e0b';
      } catch (e) {
        console.error('Error changing bill status:', e);
      }
    };

    window.payBillInstantly = async function (btn, billId, amountStr, billMonth, billPlan, billDueDate) {
      if (btn.disabled) return;

      const originalText = btn.innerHTML;
      btn.innerHTML = '<span style="opacity: 0.5;">Processing...</span>';
      btn.disabled = true;

      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, doc, updateDoc, addDoc, collection } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        const userStr = localStorage.getItem('clientUser');
        const userObj = JSON.parse(userStr);
        const userId = userObj.id || userObj.uid;

        // 1. Update the billing email document to 'paid'
        const billDocRef = doc(db, "users", userId, "billing_emails", billId);
        await updateDoc(billDocRef, { status: 'paid' });

        // 2. Add to global payments collection for admin
        const now = new Date();
        await addDoc(collection(db, "payments"), {
          userId: userId,
          accountNumber: userObj.accountNumber || userObj.account || '',
          name: userObj.name || '',
          amount: Number(balanceAmt),
          plan: billPlan || '',
          billingMonth: billMonth || '',
          dueDate: billDueDate || '',
          period: billMonth,
          method: 'Online payment',
          datePaid: now.toISOString(),
          status: 'Completed'
        });

        // Show success, then reload
        btn.innerHTML = '<span style="color: #10b981;">Paid ✓</span>';
        btn.style.background = 'rgba(16,185,129,0.1)';
        btn.style.border = '1px solid rgba(16,185,129,0.3)';

        setTimeout(() => {
          window.location.hash = 'billing';
          window.location.reload();
        }, 1500);

      } catch (err) {
        console.error("Payment error:", err);
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert("Payment failed: " + err.message);
      }
    };
    // Store active payment method globally for toggling
    window.submitReport = async function () {
      const subjInput = document.getElementById('support-subject');
      const descInput = document.getElementById('support-desc');
      const catInput = document.getElementById('support-category');

      const subject = subjInput ? subjInput.value.trim() : '';
      const desc = descInput ? descInput.value.trim() : '';
      const category = catInput ? catInput.value : 'Other';

      if (!subject) {
        alert("Please enter a subject.");
        return;
      }

      const userStr = localStorage.getItem('clientUser');
      if (!userStr) return;
      const userObj = JSON.parse(userStr);

      const addr = userObj.address || '';
      if (!addr || addr.toLowerCase() === 'none' || addr.toLowerCase() === 'please add address') {
        alert("Please update your address in the profile section before submitting a report.");
        return;
      }

      try {
        const { getFirestore, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        // Generate 12-char Report ID
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let reportId = '';
        for (let i = 0; i < 12; i++) {
          reportId += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const payload = {
          reportId: reportId,
          userId: userObj.id,
          accountNumber: userObj.accountNumber || '-',
          name: userObj.name || '-',
          facebook: userObj.facebook || '-',
          phone: userObj.phone || '-',
          plan: userObj.plan || '-',
          address: addr,
          subject: subject,
          category: category,
          description: desc,
          status: 'Pending',
          date: new Date().toISOString()
        };

        await addDoc(collection(db, "reports"), payload);

        if (subjInput) subjInput.value = '';
        if (descInput) descInput.value = '';

        alert("Report submitted successfully!");
        window.location.hash = 'support';
        window.location.reload();
      } catch (e) {
        console.error("Error submitting report:", e);
        alert("Failed to submit report. Please try again.");
      }
    };

    // === VIEW RECEIPT (Client Side — No Print Button) ===
    window.viewReceipt = async function (paymentDocId) {
      const scrollContainer = document.getElementById('dashboard-scroll-container');
      if (!scrollContainer) return;

      // Show loading state
      scrollContainer.innerHTML = '<div style="padding: 4rem 2rem; text-align: center; color: #94a3b8; font-size: 1rem;">Loading receipt...</div>';
      scrollContainer.scrollTo({ top: 0 });

      try {
        const { getFirestore, doc, getDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        let pay = null;
        let isPaid = true;
        let statementDateStr = '-';

        // Fetch the payment document
        const payDoc = await getDoc(doc(db, "payments", paymentDocId));
        if (payDoc.exists()) {
          pay = payDoc.data();
          statementDateStr = pay.dateSent ? new Date(pay.dateSent).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (pay.datePaid ? new Date(pay.datePaid).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-');
        } else {
          // Fallback: check unpaid billing emails for this user
          const userStr = localStorage.getItem('clientUser');
          const userObj = userStr ? JSON.parse(userStr) : {};
          const userId = userObj.id || userObj.uid;
          if (userId) {
            const billDoc = await getDoc(doc(db, "users", userId, "billing_emails", paymentDocId));
            if (billDoc.exists()) {
              pay = billDoc.data();
              isPaid = false;
              statementDateStr = pay.dateSent ? new Date(pay.dateSent).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-';
            }
          }
        }

        if (!pay) {
          scrollContainer.innerHTML = '<div style="padding: 4rem 2rem; text-align: center; color: #ef4444; font-size: 1rem;">Receipt not found.</div>';
          return;
        }

        // Get user details for address
        const userStr = localStorage.getItem('clientUser');
        const userObj = userStr ? JSON.parse(userStr) : {};
        const clientName = pay.name || userObj.name || 'N/A';
        const clientAddress = userObj.address || 'None';
        const accountNumber = pay.accountNumber || userObj.accountNumber || 'N/A';
        const datePaidStr = pay.datePaid ? new Date(pay.datePaid).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (isPaid ? 'N/A' : 'UNPAID');
        const dueDate = pay.dueDate || '-';
        const plan = pay.plan || '-';
        const amount = parseFloat(String(pay.amount).replace(/,/g, '')) || 0;
        const billingPeriod = pay.period || pay.billingMonth || '-';
        let paymentMethod = pay.method || (isPaid ? 'Online payment' : 'N/A');
        if (paymentMethod === 'Instant Payment' || paymentMethod === 'Digital Payment') paymentMethod = 'Online payment';

        let baseAmountStr = String(userObj.amount || userObj.ammount || userObj.plan_price || userObj.planPrice || userObj.price || userObj.monthlyFee || 0);
        let baseAmount = parseFloat(baseAmountStr.replace(/[^0-9.]/g, '')) || 0;

        if (baseAmount === 0) {
          const pStr = String(userObj.plan || userObj.Plan || pay.plan || '').toLowerCase();
          if (pStr.includes('200')) baseAmount = 3500;
          else if (pStr.includes('100')) baseAmount = 2500;
          else if (pStr.includes('70')) baseAmount = 2000;
          else if (pStr.includes('50')) baseAmount = 1500;
          else if (pStr.includes('30')) baseAmount = 1000;
          else baseAmount = amount > 0 ? amount : 0;
        }

        let prevPaid = true;
        let prevCharges = 0; // Default to 0 for start of records
        try {
          if (accountNumber && accountNumber !== 'N/A') {
            const paymentsQ = query(collection(db, "payments"), where("accountNumber", "==", accountNumber));
            const allPaySnap = await getDocs(paymentsQ);
            const allPays = [];
            allPaySnap.forEach(d => {
              const pd = d.data();
              allPays.push({ id: d.id, ...pd, isPaidRec: true, sortDate: pd.datePaid || pd.dateSent || '' });
            });

            const userId = userObj.id || userObj.uid;
            if (userId) {
              const billsSnap = await getDocs(collection(db, "users", userId, "billing_emails"));
              billsSnap.forEach(d => {
                const bd = d.data();
                if (bd.status !== 'paid') {
                  allPays.push({ id: d.id, ...bd, isPaidRec: false, sortDate: bd.dateSent || '' });
                }
              });
            }

            allPays.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));

            const currentIdx = allPays.findIndex(p => p.id === paymentDocId || p.billId === paymentDocId);
            if (currentIdx > 0) {
              prevCharges = parseFloat(String(allPays[currentIdx - 1].amount).replace(/[^0-9.]/g, '')) || 0;
              prevPaid = allPays[currentIdx - 1].isPaidRec;
            }
          }
        } catch (e) { console.warn('Could not fetch previous charges:', e); }

        let currentCharges = baseAmount > 0 ? baseAmount : amount; 
        let remainingBalance = prevPaid ? 0 : prevCharges;
        let paymentMade = isPaid ? amount : 0;
        let totalAmountDue = currentCharges + remainingBalance - paymentMade;
        if (totalAmountDue < 0) totalAmountDue = 0; // Overpayments shouldn't show negative due here unless designed so
        
        if (!isPaid && pay.status === 'partially_paid') {
           totalAmountDue = parseFloat(String(pay.amount || 0).replace(/[^0-9.]/g, '')) || 0;
        }

        let previousCharges = prevCharges;

        let prevPaymentText = prevPaid && prevCharges > 0 ? '\u20b1' + prevCharges.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' CR' : '\u20b10.00';

        const receiptHtml = `
          <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
            <div style="margin-bottom: 1.5rem;">
              <button onclick="window.location.reload()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.5rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">
                ← Back to Dashboard
              </button>
            </div>

            <!-- Receipt Paper -->
            <div style="background: #fff; border-radius: 8px; padding: 3rem; color: #1a1a1a; font-family: 'Inter', Arial, sans-serif; box-shadow: 0 4px 24px rgba(0,0,0,0.3); position: relative; overflow: hidden;">

              <!-- Header -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 3px solid #E53935; padding-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="background: #E53935; width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g transform="rotate(-40 12 20)">
                        <path d="M8.5 16.5a5 5 0 0 1 7 0 M4.5 12.5a10 10 0 0 1 15 0" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </g>
                    </svg>
                  </div>
                  <div>
                    <div style="font-family: 'Saira Condensed', sans-serif; font-size: 22px; font-weight: 800; font-style: italic; letter-spacing: -1px; color: #1a1a1a;">
                      <span style="color: #E53935;">R</span>FIBER<span style="color: #E53935;">X</span>
                    </div>
                    <div style="font-size: 0.65rem; color: #666; letter-spacing: 2px; font-weight: 600; text-transform: uppercase;">Network and Data Solution</div>
                  </div>
                </div>
                <div style="text-align: right; font-size: 0.75rem; color: #888;">
                  Page 1 of 1
                </div>
              </div>

              <!-- Statement Title -->
              <div style="text-align: center; font-size: 1.1rem; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2rem; border-bottom: 1px solid #ddd; padding-bottom: 1rem;">
                Statement of Account
              </div>

              <!-- Client Info + Summary Box -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                <div>
                  <div style="font-size: 1rem; font-weight: 700; color: #1a1a1a; text-transform: uppercase; margin-bottom: 0.25rem;">${clientName}</div>
                  <div style="font-size: 0.85rem; color: #555; max-width: 280px;">${clientAddress}</div>
                </div>
                <div style="border: 2px solid #1a1a1a; min-width: 280px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; font-size: 0.7rem; font-weight: 700;">
                    <div style="background: #1a1a1a; color: #fff; padding: 0.5rem 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Statement Date</div>
                    <div style="background: #1a1a1a; color: #fff; padding: 0.5rem 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">${isPaid ? 'PAYMENT ID' : 'BILL ID'}</div>
                    <div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #ddd; color: #333;">${statementDateStr}</div>
                    <div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #ddd; color: #333; font-size: 0.6rem; word-break: break-all;">${paymentDocId}</div>
                    <div style="background: #1a1a1a; color: #fff; padding: 0.5rem 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount Due</div>
                    <div style="background: #1a1a1a; color: #fff; padding: 0.5rem 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</div>
                    <div style="padding: 0.5rem 0.75rem; color: #E53935; font-weight: 700; font-size: 0.9rem;">\u20b1${totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style="padding: 0.5rem 0.75rem; color: #333;">${dueDate}</div>
                  </div>
                </div>
              </div>

              <!-- Account Number -->
              <div style="font-size: 0.85rem; color: #333; margin-bottom: 1.5rem;">
                <strong>Statement of Account Number:</strong> ${accountNumber}
              </div>

              <!-- Bill Summary -->
              <div style="text-align: center; margin-bottom: 1rem;">
                <span style="background: #1a1a1a; color: #fff; padding: 0.4rem 2rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Bill Summary</span>
              </div>

              <div style="border: 1px solid #ddd; padding: 1.5rem; margin-bottom: 2rem;">
                <!-- A. Previous Charges -->
                <div style="margin-bottom: 1.5rem;">
                  <div style="font-size: 0.85rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.75rem;">A. Previous Charges</div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #444; margin-bottom: 0.25rem; padding-left: 1rem;">
                    <span>Balance from Previous Bill</span>
                    <span>\u20b1${previousCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #444; margin-bottom: 0.25rem; padding-left: 1rem;">
                    <span><em>Less:</em> Payments Received — Thank You!</span>
                    <span>${prevPaymentText}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #1a1a1a; padding-left: 1rem; border-top: 1px solid #eee; padding-top: 0.5rem; margin-top: 0.5rem;">
                    <span>Remaining Balance from Previous Bill</span>
                    <span>\u20b1${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <!-- B. Current Charges -->
                <div style="margin-bottom: 1.5rem;">
                  <div style="font-size: 0.85rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.75rem;">B. Current Charges</div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #444; margin-bottom: 0.25rem; padding-left: 1rem;">
                    <span>Monthly Service Fee (${plan})</span>
                    <span>\u20b1${currentCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  ${isPaid ? `
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #444; margin-bottom: 0.25rem; padding-left: 1rem;">
                    <span><em>Less:</em> Payment Received — Thank You!</span>
                    <span>\u20b1${paymentMade.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CR</span>
                  </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #1a1a1a; padding-left: 1rem; border-top: 1px solid #eee; padding-top: 0.5rem; margin-top: 0.5rem;">
                    <span><strong>Total Current Charges</strong> — <em style="font-weight: 400; color: #888;">${isPaid ? 'After Payment' : 'Please pay on or before the due date'}</em></span>
                    <span>\u20b1${Math.max(0, currentCharges - paymentMade).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <!-- Total Amount Due -->
                <div style="background: #1a1a1a; color: #fff; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 1rem;">
                  <span>TOTAL AMOUNT DUE</span>
                  <span style="font-size: 1.2rem;">\u20b1${totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <!-- Thank you message -->
              <div style="text-align: center; font-style: italic; color: #555; font-size: 0.85rem; margin-bottom: 1rem;">
                Thank you for keeping your account current. We value your continued patronage.
              </div>
              <div style="text-align: center; font-size: 0.7rem; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2rem;">
                This document is not valid for claim of input tax
              </div>

              <!-- Divider -->
              <div style="border-top: 2px dashed #ccc; margin: 2rem 0; position: relative;">
                <div style="position: absolute; left: -20px; top: -10px; width: 20px; height: 20px; background: #0b0f19; border-radius: 50%;"></div>
                <div style="position: absolute; right: -20px; top: -10px; width: 20px; height: 20px; background: #0b0f19; border-radius: 50%;"></div>
              </div>

              <!-- Payment Stub -->
              <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="background: #E53935; color: #fff; padding: 0.5rem 2rem; display: inline-block; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Payment Stub</div>
                <div style="font-size: 0.75rem; color: #888; margin-top: 0.5rem;">You may be required to present this bill when paying.</div>
              </div>

              <div style="display: flex; justify-content: space-between; gap: 2rem;">
                <div style="flex: 1;">
                  <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; font-size: 0.85rem;">
                    <span style="font-weight: 700; color: #1a1a1a;">Statement Date</span>
                    <span style="color: #444;">: ${statementDateStr}</span>
                    <span style="font-weight: 700; color: #1a1a1a;">Account Number</span>
                    <span style="color: #444;">: ${accountNumber}</span>
                    <span style="font-weight: 700; color: #1a1a1a;">Subscriber's Name</span>
                    <span style="color: #444;">: ${clientName}</span>
                    <span style="font-weight: 700; color: #1a1a1a;">Address</span>
                    <span style="color: #444;">: ${clientAddress}</span>
                    <span style="font-weight: 700; color: #1a1a1a;">Payment Method</span>
                    <span style="color: #444;">: ${paymentMethod}</span>
                  </div>
                </div>
                <div style="min-width: 220px; border-left: 2px solid #E53935; padding-left: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.5rem;">
                    <span style="font-weight: 700; color: #1a1a1a;">Previous Charges</span>
                    <span style="color: #444;">: \u20b1${previousCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.5rem;">
                    <span style="font-weight: 700; color: #1a1a1a;">Current Charges</span>
                    <span style="color: #444;">: \u20b1${currentCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 700; border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.25rem;">
                    <span style="color: #E53935;">Total Amount Due</span>
                    <span style="color: #E53935;">: \u20b1${totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <!-- Payment ID Footer -->
              <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.7rem; color: #999; text-align: center;">
                Payment ID: ${paymentDocId}
              </div>

            </div>
          </div>
        `;

        scrollContainer.innerHTML = receiptHtml;
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (err) {
        console.error('Error loading receipt:', err);
        scrollContainer.innerHTML = '<div style="padding: 4rem 2rem; text-align: center; color: #ef4444; font-size: 1rem;">Error loading receipt: ' + err.message + '</div>';
      }
    };

    window._activePaymentMethod = null;

    window.togglePaymentMethod = function (method) {
      const container = document.getElementById('dynamic-payment-content');
      const buttons = document.querySelectorAll('.payment-btn');

      // If clicking the same button, close it with animation
      if (window._activePaymentMethod === method) {
        container.style.animation = 'fadeSlideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
        setTimeout(() => {
          container.style.display = 'none';
          container.innerHTML = '';
          container.style.animation = ''; // reset
        }, 300);

        window._activePaymentMethod = null;
        buttons.forEach(b => {
          b.style.borderColor = 'rgba(255,255,255,0.05)';
          b.style.background = 'transparent';
        });
        return;
      }

      window._activePaymentMethod = method;

      buttons.forEach(b => {
        b.style.borderColor = 'rgba(255,255,255,0.05)';
        b.style.background = 'transparent';
      });
      const activeBtn = document.getElementById('payment-btn-' + method);
      if (activeBtn) {
        activeBtn.style.background = 'rgba(229,57,53,0.05)';
      }

      if (!window.showAIAnalysisPopup) {
        window.showAIAnalysisPopup = function(data, previewHtml) {
          const refNumber = data.referenceNumber || 'TBD';
          const amount = data.amount || 'TBD';
          const payerName = data.payerName || 'TBD';
          const receiverName = data.receiverName || 'TBD';
          const phoneNumber = data.phoneNumber || 'TBD';
          const expressNotif = data.expressNotif || 'No';
          const datePaid = data.datePaid || 'TBD';
          const timePaid = data.timePaid || 'TBD';
          const statusColor = data.isFraud ? '#ef4444' : '#10b981';
          
          const payerBoxHtml = payerName !== 'N/A' ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Payer (MSG Name)</div>
                      <div style="color: #fff; font-size: 0.95rem; font-weight: 600;">${payerName}</div>
                    </div>` : '';

          const modalHtml = `
              <div id="ai-analysis-modal" style="position: fixed; inset: 0; background: rgba(15,23,42,0.9); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div style="background: #1e293b; width: 900px; max-width: 95vw; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column;">
                
                <div style="padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: #0f172a;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <svg style="width: 24px; height: 24px; color: #f59e0b;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                    <h2 style="color: #f8fafc; font-size: 1.25rem; font-weight: 700; margin: 0;">AI Analysis Result</h2>
                  </div>
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid ${statusColor}; display: flex; align-items: center; justify-content: center; position: relative;">
                      <svg style="position: absolute; inset: -2px; width: 40px; height: 40px; transform: rotate(-90deg);" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="${statusColor}" stroke-width="4" stroke-dasharray="301.59" stroke-dashoffset="0" style="animation: countdown 10s linear forwards;"></circle>
                      </svg>
                      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: #10b981;" id="popup-timer-text">10</div>
                    </div>
                  </div>
                </div>
                
                <div style="padding: 1.5rem; display: flex; gap: 2rem;">
                  <!-- Left Side: Image with Bounding Boxes -->
                  <div style="flex-shrink: 0; width: 250px; display: flex; justify-content: center; align-items: flex-start;">
                    ${previewHtml}
                  </div>
                  
                  <!-- Right Side: Extracted Data -->
                  <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-content: flex-start;">
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); grid-column: span 2;">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Amount Paid</div>
                      <div style="color: #10b981; font-size: 1.5rem; font-weight: 700;">${amount}</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); grid-column: span 2;">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Reference Number</div>
                      <div style="color: #fff; font-size: 1.1rem; font-weight: 700; letter-spacing: 1px;">${refNumber}</div>
                    </div>

                    ${payerBoxHtml}
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Receiver Name</div>
                      <div style="color: #fff; font-size: 0.95rem; font-weight: 600;">${receiverName}</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Phone Number</div>
                      <div style="color: #fff; font-size: 0.95rem; font-weight: 600;">${phoneNumber}</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Express Notif</div>
                      <div style="color: #fff; font-size: 0.95rem; font-weight: 600;">${expressNotif}</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Date Paid</div>
                      <div style="color: #fff; font-size: 0.95rem; font-weight: 600;">${datePaid}</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                      <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">Time Paid</div>
                      <div style="color: #fff; font-size: 0.95rem; font-weight: 600;">${timePaid}</div>
                    </div>
                  </div>
                </div>

                <div style="padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); text-align: right; display: flex; justify-content: flex-end; gap: 1rem;">
                  <button onclick="document.getElementById('ai-analysis-modal').remove()" style="background: #3b82f6; color: #fff; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Continue</button>
                </div>
              </div>
              <style>
                @keyframes aiPopupIn {
                  from { opacity: 0; transform: scale(0.95) translateY(10px); }
                  to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes countdown {
                  from { stroke-dasharray: 100, 100; }
                  to { stroke-dasharray: 0, 100; }
                }
                .bbox-rect {
                  position: absolute;
                  border: 2px solid;
                  background: rgba(0,0,0,0.1);
                  animation: bboxFadeIn 0.5s ease-out forwards;
                  box-sizing: border-box;
                }
                @keyframes bboxFadeIn {
                  from { opacity: 0; transform: scale(0.9); }
                  to { opacity: 1; transform: scale(1); }
                }
              </style>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', modalHtml);
          
          let timerSecs = 10;
          const timerEl = document.getElementById('popup-timer-text');
          const modalEl = document.getElementById('ai-analysis-modal');
          const interval = setInterval(() => {
            if (!document.body.contains(modalEl)) {
              clearInterval(interval);
              return;
            }
            timerSecs--;
            if (timerEl) timerEl.innerText = timerSecs;
            if (timerSecs <= 0) {
              clearInterval(interval);
              modalEl.remove();
            }
          }, 1000);
        };

        window.getBoundingBoxForText = function(fullTextSnippet, ocrWords, width, height) {
          if (!fullTextSnippet) return null;
          const snippetWords = fullTextSnippet.split(/\s+/).map(w => w.replace(/[^\w\*\:\.\+\-\,]/g, '').toLowerCase()).filter(Boolean);
          if (snippetWords.length === 0) return null;
          const cleanedOcrWords = ocrWords.map(w => ({ text: w.text.replace(/[^\w\*\:\.\+\-\,]/g, '').toLowerCase(), bbox: w.bbox }));
          
          for (let i = 0; i <= cleanedOcrWords.length - snippetWords.length; i++) {
            let match = true;
            for (let j = 0; j < snippetWords.length; j++) {
              const ocrW = cleanedOcrWords[i + j];
              const snipW = snippetWords[j];
              if (!ocrW || (!ocrW.text.includes(snipW) && !snipW.includes(ocrW.text))) { match = false; break; }
            }
            if (match) {
              let y0 = Infinity, x0 = Infinity, y1 = -Infinity, x1 = -Infinity;
              for (let j = 0; j < snippetWords.length; j++) {
                const bbox = ocrWords[i + j].bbox;
                if (bbox.y0 < y0) y0 = bbox.y0;
                if (bbox.x0 < x0) x0 = bbox.x0;
                if (bbox.y1 > y1) y1 = bbox.y1;
                if (bbox.x1 > x1) x1 = bbox.x1;
              }
              return [
                Math.max(0, Math.min(1000, Math.round((y0 / height) * 1000))),
                Math.max(0, Math.min(1000, Math.round((x0 / width) * 1000))),
                Math.max(0, Math.min(1000, Math.round((y1 / height) * 1000))),
                Math.max(0, Math.min(1000, Math.round((x1 / width) * 1000)))
              ];
            }
          }
          const firstWord = snippetWords[0];
          const foundWord = ocrWords.find(w => w.text.replace(/[^\w\*\:\.\+\-\,]/g, '').toLowerCase().includes(firstWord));
          if (foundWord) {
            const bbox = foundWord.bbox;
            return [
              Math.max(0, Math.min(1000, Math.round((bbox.y0 / height) * 1000))),
              Math.max(0, Math.min(1000, Math.round((bbox.x0 / width) * 1000))),
              Math.max(0, Math.min(1000, Math.round((bbox.y1 / height) * 1000))),
              Math.max(0, Math.min(1000, Math.round((bbox.x1 / width) * 1000)))
            ];
          }
          return null;
        };

        window.simulateAIAnalysis = async function(input) {
          if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // --- Aspect Ratio & Dimension Check ---
            const checkDimensions = (imgFile) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const ratio = img.width / img.height;
                        
                        // Standard modern phone portrait screenshot ratio falls between 0.42 and 0.57
                        if (ratio < 0.40 || ratio > 0.60) {
                            reject(`Invalid dimensions (${img.width}x${img.height}). Aspect ratio: ${ratio.toFixed(2)}`);
                        } else {
                            resolve(true);
                        }
                    };
                    img.onerror = () => reject('Invalid image');
                    const r = new FileReader();
                    r.onload = (e) => { img.src = e.target.result; };
                    r.readAsDataURL(imgFile);
                });
            };
            
            try {
                await checkDimensions(file);
            } catch (err) {
                alert(`🚨 FRAUD DETECTED 🚨\\n\\nImage format rejected. The uploaded receipt does not match the standard dimensions of a mobile phone screenshot.\\n\\nOnly raw, uncropped 1-to-1 screenshots are allowed.`);
                input.value = ''; // Clear input
                return;
            }
            
            // --- Error Level Analysis (ELA) ---
            const runErrorLevelAnalysis = (imageFile) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        // Scale down to max 600px to keep it fast
                        const scale = Math.min(1, 600 / Math.max(img.width, img.height));
                        const w = Math.floor(img.width * scale);
                        const h = Math.floor(img.height * scale);
                        
                        const canvas1 = document.createElement('canvas');
                        canvas1.width = w; canvas1.height = h;
                        const ctx1 = canvas1.getContext('2d', { willReadFrequently: true });
                        ctx1.drawImage(img, 0, 0, w, h);
                        const origData = ctx1.getImageData(0, 0, w, h).data;
                        
                        // Compress to 90% JPEG to introduce compression artifacts
                        const compressedUrl = canvas1.toDataURL('image/jpeg', 0.90);
                        const compImg = new Image();
                        compImg.onload = () => {
                            const canvas2 = document.createElement('canvas');
                            canvas2.width = w; canvas2.height = h;
                            const ctx2 = canvas2.getContext('2d', { willReadFrequently: true });
                            ctx2.drawImage(compImg, 0, 0, w, h);
                            const compData = ctx2.getImageData(0, 0, w, h).data;
                            
                            let diffSum = 0;
                            const diffs = [];
                            
                            for (let i = 0; i < origData.length; i += 4) {
                                // Calculate RGB difference per pixel
                                const dr = Math.abs(origData[i] - compData[i]);
                                const dg = Math.abs(origData[i+1] - compData[i+1]);
                                const db = Math.abs(origData[i+2] - compData[i+2]);
                                const diff = dr + dg + db;
                                diffs.push(diff);
                                diffSum += diff;
                            }
                            
                            const mean = diffSum / diffs.length;
                            let varianceSum = 0;
                            for (let i = 0; i < diffs.length; i++) {
                                varianceSum += Math.pow(diffs[i] - mean, 2);
                            }
                            const variance = varianceSum / diffs.length;
                            const stdDev = Math.sqrt(variance);
                            
                            // GCash receipts are very flat/uniform, meaning low natural variance (< 5).
                            // Spliced text forces massive local compression spikes, driving stdDev > 12.
                            if (stdDev > 12) {
                                reject(`ELA Variance too high: ${stdDev.toFixed(2)}`);
                            } else {
                                resolve(true);
                            }
                        };
                        compImg.src = compressedUrl;
                    };
                    img.onerror = () => reject('Invalid image for ELA');
                    const r = new FileReader();
                    r.onload = (e) => { img.src = e.target.result; };
                    r.readAsDataURL(imageFile);
                });
            };
            
            try {
                await runErrorLevelAnalysis(file);
            } catch (err) {
                alert(`🚨 FRAUD DETECTED 🚨\\n\\nError Level Analysis (ELA) indicates this image has been digitally altered or spliced.\\n\\nThe compression artifacts on the text do not match the background, proving this receipt was manually edited.`);
                input.value = ''; // Clear input
                return;
            }
            
            // --- pHash Image Fingerprinting ---
            const generateDHash = (imageFile) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        canvas.width = 9;
                        canvas.height = 8;
                        ctx.drawImage(img, 0, 0, 9, 8);
                        const imgData = ctx.getImageData(0, 0, 9, 8).data;
                        const grays = [];
                        for (let i = 0; i < imgData.length; i += 4) {
                            grays.push((imgData[i] + imgData[i+1] + imgData[i+2]) / 3);
                        }
                        let hash = '';
                        for (let y = 0; y < 8; y++) {
                            for (let x = 0; x < 8; x++) {
                                const left = grays[y * 9 + x];
                                const right = grays[y * 9 + x + 1];
                                hash += (left > right) ? '1' : '0';
                            }
                        }
                        let hexHash = '';
                        for (let i = 0; i < 64; i += 4) {
                            hexHash += parseInt(hash.substring(i, i+4), 2).toString(16);
                        }
                        resolve(hexHash);
                    };
                    const r = new FileReader();
                    r.onload = (e) => { img.src = e.target.result; };
                    r.readAsDataURL(imageFile);
                });
            };

            const getHammingDistance = (hex1, hex2) => {
                if (!hex1 || !hex2 || hex1.length !== 16 || hex2.length !== 16) return 64;
                let dist = 0;
                for (let i = 0; i < 16; i++) {
                    const val1 = parseInt(hex1[i], 16);
                    const val2 = parseInt(hex2[i], 16);
                    const diff = val1 ^ val2;
                    dist += (diff & 1) + ((diff >> 1) & 1) + ((diff >> 2) & 1) + ((diff >> 3) & 1);
                }
                return dist;
            };
            
            const uploadedHashPromise = generateDHash(file);
            
            // --- Metadata Forensics (EXIF & XMP) ---
            const analyzeMetadata = async (imageFile) => {
                try {
                    const exifr = await import('https://cdn.jsdelivr.net/npm/exifr/dist/full.esm.js');
                    // Parse both EXIF and XMP (AI generators often use XMP for watermarks)
                    const exifData = await exifr.parse(imageFile, { xmp: true, tiff: true, exif: true });
                    if (!exifData) return null;
                    
                    const blacklist = [
                        // Professional Editors
                        'photoshop', 'illustrator', 'lightroom', 'coreldraw', 'gimp', 'affinity', 'capture one',
                        // Web/Online Editors
                        'canva', 'photopea', 'figma', 'pixlr', 'fotor', 'befunky',
                        // Mobile Editing Apps
                        'snapseed', 'picsart', 'vsco', 'facetune', 'b612', 'remini', 'lightleap', 'photodirector', 'polarr',
                        // AI Generators
                        'gemini', 'midjourney', 'dall-e', 'openai', 'google', 'imagen', 'ai-generated', 'stable diffusion', 'runway', 'leonardo', 'firefly', 'bing',
                        // Rendering Engines & Fake Receipt Script Libraries
                        'skia', 'cairo', 'puppeteer', 'phantomjs', 'html2canvas', 'dom-to-image', 'selenium', 'fakereceipt', 'receiptmaker', 'express-expense'
                    ];
                    
                    // Check standard tags and XMP Creator/Software tags
                    const softwareUsed = (
                        exifData.Software || 
                        exifData.ProcessingSoftware || 
                        exifData.CreatorTool || 
                        exifData.HistorySoftwareAgent || 
                        exifData.Producer || 
                        ''
                    ).toLowerCase();
                    
                    if (softwareUsed && blacklist.some(app => softwareUsed.includes(app))) {
                        return softwareUsed;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            };
            const metadataFraudPromise = analyzeMetadata(file);
            
            const reader = new FileReader();
            
            const useGemini = false;
            const loadingMsg = useGemini ? 'Extracting details using Gemini AI' : 'Extracting details using Local OCR';
            
            // Show scanning overlay centered in the screen with the image
            const scanningHtml = `
              <div id="ai-scanning-overlay" style="position: fixed; inset: 0; z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);">
                <div id="receipt-bbox-container" style="position: relative; display: inline-block; margin-bottom: 1.5rem;">
                  <img id="receipt-preview-img" style="max-height: 400px; max-width: 90vw; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: block;" />
                  <div id="bbox-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; overflow: hidden;"></div>
                  <div id="laser-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(16, 185, 129, 0.8); box-shadow: 0 0 10px #10b981; display: none; z-index: 10;"></div>
                </div>
                <div style="text-align: center; color: #fff;">
                  <div style="font-size: 3rem; margin-bottom: 1rem; animation: pulse 1s infinite;">🤖</div>
                  <div id="scanning-title" style="font-size: 1.2rem; font-weight: 600; color: #10b981;">Analyzing Receipt...</div>
                  <div id="scanning-subtitle" style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem;">${loadingMsg}</div>
                </div>
                <style>
                  @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; transform: scale(1.1); } 100% { opacity: 1; } }
                  @keyframes laserScan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
                  .scanning-laser { display: block !important; animation: laserScan 2s ease-in-out infinite; }
                </style>
              </div>
            `;
            document.body.insertAdjacentHTML('beforeend', scanningHtml);

            reader.onload = async function(e) {
              const imgPreviewSrc = e.target.result;
              const img = document.getElementById('receipt-preview-img');
              img.src = imgPreviewSrc;
              await new Promise(resolve => img.onload = resolve);
              
              const imgWidth = img.naturalWidth;
              const imgHeight = img.naturalHeight;
              
              document.getElementById('laser-line').classList.add('scanning-laser');
              const base64Content = imgPreviewSrc.split(';base64,').pop();
              
              try {
                let extractedData = {};
                let detections = [];
                
                if (useGemini) {
                  // GEMINI API IMPLEMENTATION
                  const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                  const db = getFirestore();
                  let apiKey = window._GEMINI_TEMP_KEY || '';
                  if (!apiKey) {
                      try {
                          const apiKeyDoc = await getDoc(doc(db, 'settings', 'apiKeys'));
                          if (apiKeyDoc.exists() && apiKeyDoc.data().gemini) apiKey = apiKeyDoc.data().gemini;
                      } catch (dbErr) { console.warn("Could not fetch API key", dbErr); }
                  }
                  if (!apiKey) throw new Error('Gemini API Key missing');

                  const prompt = `You are an expert computer vision and OCR data extraction model.
I need you to scan this GCash receipt image and extract text for these specific classes:
1. "REF NO." (Reference number digits)
2. "AMOUNT" (Transacted amount)
3. "NAME" (Recipient or sender name)
4. "FIRST DATE AND TIME" (Full timestamp)
5. "NUMBER" (Mobile number)

Return a JSON with exactly this structure and no markdown formatting:
{
  "referenceNumber": "...",
  "amount": "...",
  "payerName": "...",
  "datePaid": "...",
  "phoneNumber": "..."
}
If a field is not found, return "TBD".`;

                  const payload = {
                    contents: [{ parts: [{ inlineData: { mimeType: file.type, data: base64Content } }, { text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                  };
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const jsonRes = await res.json();
                  extractedData = JSON.parse(jsonRes.candidates[0].content.parts[0].text);
                  
                } else {
                  // TESSERACT LOCAL OCR IMPLEMENTATION
                  document.getElementById('scanning-subtitle').innerText = "Downloading Local OCR Engine (once)...";
                  
                  if (!window.Tesseract) {
                    await new Promise((resolve, reject) => {
                      const script = document.createElement('script');
                      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
                      script.onload = resolve;
                      script.onerror = reject;
                      document.head.appendChild(script);
                    });
                  }
                  
                  document.getElementById('scanning-subtitle').innerText = "Scanning text from image...";
                  const worker = await window.Tesseract.createWorker('eng');
                  const { data } = await worker.recognize(imgPreviewSrc);
                  await worker.terminate();
                  
                  const ocrWords = [];
                  if (data.words) {
                    data.words.forEach(word => ocrWords.push({ text: word.text, bbox: word.bbox }));
                  }
                  
                  const singleLineText = (data.text || '').replace(/\s+/g, ' ');
                  
                  // Helper
                  const addDetection = (label, textSnippet, color) => {
                    const box = window.getBoundingBoxForText(textSnippet, ocrWords, imgWidth, imgHeight);
                    if (box) {
                        detections.push({ label, box, color });
                    }
                  };
                  
                  // Layout Detection Router (Format A vs Format B)
                  let formatType = 'UNKNOWN';
                  if (singleLineText.match(/successfully\s+received/i) || singleLineText.match(/Your\s+new\s+balance/i)) {
                      formatType = 'FORMAT_A'; // Notification Style
                  } else {
                      formatType = 'FORMAT_B'; // Structured Layout Style or Card Style
                  }

                  // 1. Reference Number
                  extractedData.referenceNumber = 'TBD';
                  if (formatType === 'FORMAT_A') {
                      const refFullMatch = singleLineText.match(/Ref\.?\s*No\.?\s*([\d\sOoSs]+)/i);
                      if (refFullMatch) {
                        addDetection('REF NO. FULL', refFullMatch[0], '#ef4444');
                        const cleanRef = refFullMatch[1].replace(/[\sOo]/g, '').replace(/[Ss]/g, '5');
                        if (cleanRef.length >= 13) {
                            extractedData.referenceNumber = cleanRef.substring(0, 13);
                        } else if (cleanRef.length >= 8) {
                            extractedData.referenceNumber = cleanRef;
                        }
                      }
                  } else {
                      // Format B usually has spaces in the reference number (e.g. 6038 296 538242) and OCR can mistake 0 for O
                      const refFullMatchB = singleLineText.match(/(?:Ref\.?\s*No[,\.]?|Reference\s*Number)\s*([\d\sOoSs]{13,25})/i);
                      if (refFullMatchB) {
                        addDetection('REF NO. FULL', refFullMatchB[0], '#ef4444');
                        const cleanRef = refFullMatchB[1].replace(/[\sOo]/g, '').replace(/[Ss]/g, '5');
                        if (cleanRef.length >= 10) {
                            extractedData.referenceNumber = cleanRef.substring(0, 13);
                        }
                      } else {
                          // Fallback: search for any standalone 13 digit number that might be the reference number
                          const fallbackRef = singleLineText.match(/\b(?:\d\s*){13}\b/);
                          if (fallbackRef) {
                              extractedData.referenceNumber = fallbackRef[0].replace(/\s+/g, '');
                          }
                      }
                  }
                  
                  // 2. Amount
                  extractedData.amount = 'TBD';
                  if (formatType === 'FORMAT_A') {
                      const amountMatch = singleLineText.match(/PHP\s*\d+(?:\.\d{2})?/i) || singleLineText.match(/₱\s*\d+(?:\.\d{2})?/i);
                      if (amountMatch) {
                        addDetection('AMOUNT', amountMatch[0], '#22c55e');
                        extractedData.amount = amountMatch[0];
                      }
                  } else {
                      // Handles commas in thousands: e.g. 1,000.00
                      const amountMatchB = singleLineText.match(/Amount\s+sent\s*PHP\s*([\d,]+(?:\.\d{2})?)/i) || 
                                           singleLineText.match(/Total\s+Amount\s+Sent\s*[₱P]?\s*([\d,]+(?:\.\d{2})?)/i) ||
                                           singleLineText.match(/Amount\s*([\d,]+(?:\.\d{2})?)/i) || 
                                           singleLineText.match(/PHP\s*([\d,]+(?:\.\d{2})?)/i) || 
                                           singleLineText.match(/₱\s*([\d,]+(?:\.\d{2})?)/i);
                      if (amountMatchB) {
                        addDetection('AMOUNT', amountMatchB[0], '#22c55e');
                        extractedData.amount = `PHP ${amountMatchB[1]}`;
                      }
                  }
                  
                  // 3. Phone Number (Works universally, but must account for spaces)
                  extractedData.phoneNumber = 'TBD';
                  const numberMatch = singleLineText.match(/(?:\+?63|0)\s*9\d{2}\s*\d{3}\s*\d{4}/) || singleLineText.match(/\d{4}\s*\*\*\*\s*\d{4}/);
                  if (numberMatch) {
                    addDetection('NUMBER', numberMatch[0], '#f97316');
                    extractedData.phoneNumber = numberMatch[0].replace(/\s+/g, '');
                  }
                  
                  // EXPRESS NOTIF FLAG
                  extractedData.expressNotif = 'No';
                  if (formatType === 'FORMAT_A') {
                      extractedData.expressNotif = 'Yes';
                  } else {
                      if (singleLineText.match(/Sent\s+via\s+GCash/i)) {
                          extractedData.expressNotif = 'Sent via GCash';
                          addDetection('EXPRESS NOTIF', 'Sent via GCash', '#06b6d4');
                      } else if (singleLineText.match(/Express\s+Send/i)) {
                          extractedData.expressNotif = 'Yes';
                          addDetection('EXPRESS NOTIF', 'Express Send', '#06b6d4');
                      }
                  }
                  
                  // 4. Date and Time
                  extractedData.datePaid = 'TBD';
                  extractedData.timePaid = 'TBD';
                  if (formatType === 'FORMAT_A') {
                      const secondDateTimeMatch = singleLineText.match(/\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}\s*(?:AM|PM)/i) || singleLineText.match(/\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}/i);
                      if (secondDateTimeMatch) {
                        const fullSnippet = secondDateTimeMatch[0];
                        addDetection('SECOND DATE AND TIME', fullSnippet, '#3b82f6');
                        const secondDateMatch = fullSnippet.match(/\d{2}-\d{2}-\d{4}/);
                        if (secondDateMatch) extractedData.datePaid = secondDateMatch[0];
                        const secondTimeMatch = fullSnippet.match(/\d{2}:\d{2}\s*(?:AM|PM)/i) || fullSnippet.match(/\d{2}:\d{2}/);
                        if (secondTimeMatch) extractedData.timePaid = secondTimeMatch[0];
                      } else {
                        const todayMatch = singleLineText.match(/Today,\s*\d{1,2}:\d{2}\s*(?:AM|PM)?/i);
                        if (todayMatch) {
                          addDetection('FIRST DATE AND TIME', todayMatch[0], '#3b82f6');
                          extractedData.datePaid = "Today";
                          const timeMatch = todayMatch[0].match(/\d{1,2}:\d{2}\s*(?:AM|PM)?/i);
                          if (timeMatch) extractedData.timePaid = timeMatch[0];
                        }
                      }
                  } else {
                      // Handles "07-16-2026 01:17 PM" OR "Mar 01, 2026 10:17 AM" OR "January 25, 2026"
                      const dateDetailsMatch = singleLineText.match(/(?:Date\s+and\s+time\s+)?([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{2}-\d{2}-\d{4})(?:\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?))?/i);
                      if (dateDetailsMatch) {
                        addDetection('DATE AND TIME', dateDetailsMatch[0], '#3b82f6');
                        extractedData.datePaid = dateDetailsMatch[1];
                        if (dateDetailsMatch[2]) {
                            extractedData.timePaid = dateDetailsMatch[2];
                        }
                      }
                  }
                  
                  // 5. Names (Payer and Receiver)
                  extractedData.receiverName = 'TBD';
                  extractedData.payerName = 'TBD';
                  
                  if (formatType === 'FORMAT_A') {
                      const nameToMatch = singleLineText.match(/to\s+([A-Za-z\*]+\s+[A-Za-z\*]?\.)/) || singleLineText.match(/to\s+([A-Za-z\*\s]+)\.?\s+\+/i) || singleLineText.match(/to\s+([A-Za-z\*\s]+)\.?\s+on/i);
                      if (nameToMatch) {
                        extractedData.receiverName = nameToMatch[1].trim();
                        addDetection('NAME', extractedData.receiverName, '#a855f7');
                      }
                      
                      const msgNameMatch = singleLineText.match(/MSG:\s*([^\.]+)\./i) || singleLineText.match(/MSG:\s*([^Your]+)/i);
                      if (msgNameMatch) {
                        const cleanMsg = msgNameMatch[1].replace(/MSG:/i).replace(/rfiber/i).trim();
                        if (cleanMsg) extractedData.payerName = cleanMsg;
                      }
                  } else {
                      const receiverMatch = singleLineText.match(/Name\s+of\s+(?:the\s+)?receiver\s+([A-Za-z\s\*•\.]+?)\s+(?:Phone|Number|Date|Amount)/i);
                      if (receiverMatch) {
                          extractedData.receiverName = receiverMatch[1].trim();
                          addDetection('RECEIVER NAME', extractedData.receiverName, '#a855f7');
                      } else {
                          // Fallback for card layout: Name is usually right below "Express Send" and above Phone number
                          // We use (.+?) to capture anything up to the phone number prefix
                          const expressSendMatch = singleLineText.match(/Express\s+Send\s+(.+?)\s+(?:\+?63|0)\s*9/i);
                          let rawName = '';
                          
                          if (expressSendMatch) {
                              rawName = expressSendMatch[1];
                          } else {
                              // If Express Send is missing, grab up to 30 non-numeric characters right before the phone number
                              const beforePhone = singleLineText.match(/([A-Za-z]{2}[^\+0-9]{2,30}?)\s+(?:\+?63|0)\s*9/i);
                              if (beforePhone) {
                                  rawName = beforePhone[1].replace(/Express\s+Send/i, '');
                              }
                          }
                          
                          if (rawName) {
                              // The OCR sometimes reads the checkmark icon above the name as weird symbols or numbers (e.g. "Eli =)").
                              // We split the raw string by any character that is NOT valid in a name (like numbers, =, ), (, etc.) 
                              // and take the absolute last segment, which elegantly isolates the actual name right before the phone number.
                              let cleanName = rawName.split(/[^A-Za-z\.\-\*•\s']/).pop().trim();
                              
                              // Clean up any stray symbols or spaces at the very beginning of the extracted name
                              cleanName = cleanName.replace(/^[\.\-\*•\s]+/, '');
                              
                              if (cleanName) {
                                  extractedData.receiverName = cleanName;
                                  addDetection('RECEIVER NAME', extractedData.receiverName, '#a855f7');
                              }
                          }
                      }
                      
                      // Format B doesn't explicitly display the Payer Name, so we set it to N/A. The popup will automatically hide this field.
                      extractedData.payerName = "N/A"; 
                  }
                }

                // Check for TBD fields (MSG/Payer Name is excluded as it can be optional)
                const requiredFields = ['referenceNumber', 'amount', 'datePaid', 'timePaid', 'receiverName', 'phoneNumber'];
                const hasTBD = requiredFields.some(f => extractedData[f] === 'TBD' || !extractedData[f]);
                
                let fraudDetected = false;
                
                if (!hasTBD) {
                  // --- Semantic Integrity Verification (Strict Template Check) ---
                  if (!useGemini) {
                      // Semantic Integrity Check has been removed.
                  }
                  
                  const userStr = localStorage.getItem('clientUser');
                  const clientUser = userStr ? JSON.parse(userStr) : {};
                  
                  // 1. Reference Number Length Validation
                  const cleanRefNo = String(extractedData.referenceNumber).replace(/[^0-9]/g, '');
                  if (cleanRefNo.length !== 13) {
                    fraudDetected = true;
                    document.getElementById('ai-scanning-overlay').remove();
                    alert(`🚨 FRAUD DETECTED 🚨\\n\\nInvalid GCash Reference Number. A valid GCash Reference Number must be exactly 13 digits. Your receipt showed ${cleanRefNo.length} digits.`);
                  }
                  
                  // 2. Amount Validation
                  let expectedAmount = 0;
                  if (window.clientActiveBills && window.clientActiveBills.length > 0) {
                      window.clientActiveBills.forEach(ab => {
                          expectedAmount += parseFloat(String(ab.amount).replace(/[^0-9\\.]/g, '')) || 0;
                      });
                  }
                  if (expectedAmount === 0) {
                      const rawPlanVal = clientUser.plan_price || clientUser.planPrice || clientUser.price || clientUser.monthlyFee || clientUser.plan || '';
                      const parsedPlanVal = parseFloat(String(rawPlanVal).replace(/[^0-9\\.]/g, ''));
                      if (!isNaN(parsedPlanVal) && parsedPlanVal > 0) {
                          expectedAmount = parsedPlanVal;
                      }
                  }
                  
                  if (!fraudDetected && expectedAmount > 0) {
                      const receiptAmount = parseFloat(String(extractedData.amount).replace(/[^0-9\\.]/g, ''));
                      if (receiptAmount < expectedAmount) {
                          fraudDetected = true;
                          document.getElementById('ai-scanning-overlay').remove();
                          alert(`❌ ERROR: INSUFFICIENT AMOUNT ❌\n\nYour current plan requires ₱${expectedAmount}, but the receipt is only for ₱${receiptAmount}. Please upload a receipt with the correct full amount.`);
                      } else
                      if (receiptAmount > expectedAmount) {
                          extractedData.overpaymentNote = `Overpaid by ₱${(receiptAmount - expectedAmount).toFixed(2)}`;
                          alert(`Note: You have paid ₱${receiptAmount}, which is more than your required amount of ₱${expectedAmount}. The excess of ₱${(receiptAmount - expectedAmount).toFixed(2)} will be noted.`);
                      }
                  }
                  
                  // 3. Metadata Forensics Check
                  if (!fraudDetected) {
                      const fakeSoftware = await metadataFraudPromise;
                      if (fakeSoftware) {
                          fraudDetected = true;
                          document.getElementById('ai-scanning-overlay').remove();
                          alert(`🚨 FRAUD DETECTED 🚨\\n\\nMetadata Forensics indicates this receipt was manipulated using photo editing software (${fakeSoftware}). Fake or generated receipts are strictly prohibited.`);
                      }
                  }
                  
                  // 4. Database Save & Duplicate Check
                  if (!fraudDetected) {
                    try {
                      const { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                      const db = getFirestore();
                      const receiptsRef = collection(db, 'receipts');
                      
                      // Resolve pHash
                      const uploadedHash = await uploadedHashPromise;
                      extractedData.imageHash = uploadedHash;
                      
                      // Receiver Name Fraud Check (Temporarily Disabled for Testing)
                      /*
                      if (extractedData.receiverName !== 'TBD' && !extractedData.receiverName.match(/^RE[\.\*•]+L\s*B\.?$/i)) {
                          fraudDetected = true;
                          document.getElementById('ai-scanning-overlay').remove();
                          alert(`🚨 FRAUD DETECTED 🚨\n\nThis receipt was sent to an unauthorized receiver: "${extractedData.receiverName}". All payments must be sent to the official company GCash account (RE****L B.).`);
                          return;
                      }
                      */

                      // Time Proximity Fraud Check (24-Hour Rule)
                      if (extractedData.datePaid && extractedData.datePaid !== 'TBD' && extractedData.datePaid.toLowerCase() !== 'today') {
                          let dateToParse = extractedData.datePaid;
                          if (extractedData.timePaid && extractedData.timePaid !== 'TBD') {
                              dateToParse += ' ' + extractedData.timePaid;
                          }
                          const parsedDate = new Date(dateToParse);
                          if (!isNaN(parsedDate.getTime())) {
                              const diffHours = (new Date() - parsedDate) / (1000 * 60 * 60);
                              if (diffHours > 24 || diffHours < -24) {
                                  fraudDetected = true;
                                  document.getElementById('ai-scanning-overlay').remove();
                                  alert(`🚨 FRAUD DETECTED 🚨\n\nThis receipt is too old! Receipts must be uploaded within 24 hours of payment to prevent reuse. If you have a problem with the 24-hour rule, please try contacting support.`);
                                  return;
                              }
                          }
                      }

                      // Text-based Fraud Check (Reference Number)
                      const q = query(receiptsRef, where("referenceNumber", "==", extractedData.referenceNumber));
                      const querySnapshot = await getDocs(q);
                      
                      if (!querySnapshot.empty) {
                        fraudDetected = true;
                        document.getElementById('ai-scanning-overlay').remove();
                        alert("🚨 FRAUD DETECTED 🚨\\n\\nThis Reference Number has already been submitted! Submitting duplicate reference numbers is strictly prohibited.\\n\\nWARNING: If you submit this reference number again, your account will be flagged for fraud and may be permanently disabled.");
                      } else {
                        // Visual pHash Fraud Check (Check all past receipts for cropped duplicates)
                        const allReceipts = await getDocs(receiptsRef);
                        let pHashFraud = false;
                        allReceipts.forEach(doc => {
                            const data = doc.data();
                            if (data.imageHash && uploadedHash) {
                                if (getHammingDistance(uploadedHash, data.imageHash) <= 10) {
                                    pHashFraud = true;
                                }
                            }
                        });
                        
                        if (pHashFraud) {
                            fraudDetected = true;
                            document.getElementById('ai-scanning-overlay').remove();
                            alert("🚨 FRAUD DETECTED 🚨\\n\\nVisual Analysis indicates this receipt is a cropped or slightly altered duplicate of a previously uploaded receipt. Submitting altered duplicate receipts is strictly prohibited.");
                        } else {
                          // Save to Database
                          const userStr = localStorage.getItem('clientUser');
                          const clientUser = userStr ? JSON.parse(userStr) : {};
                          const now = new Date();
                          const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                          const billingMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
                          
                          await addDoc(receiptsRef, {
                            ...extractedData,
                            clientName: clientUser.name || 'Unknown',
                            clientAccountNumber: clientUser.accountNumber || 'Unknown',
                            billingMonth: billingMonth,
                            status: "Pending Verification",
                            timestamp: serverTimestamp()
                          });
                        }
                      }
                    } catch (dbErr) {
                      console.error("Database Error:", dbErr);
                    }
                  }
              }
                
                if (fraudDetected) {
                  return; // Stop the flow
                }

                // Draw bounding boxes on the overlay container
                const bboxOverlay = document.getElementById('bbox-overlay');
                bboxOverlay.innerHTML = '';
                detections.forEach(d => {
                  const [ymin, xmin, ymax, xmax] = d.box;
                  const top = (ymin / 10).toFixed(2);
                  const left = (xmin / 10).toFixed(2);
                  const width = ((xmax - xmin) / 10).toFixed(2);
                  const height = ((ymax - ymin) / 10).toFixed(2);
                  
                  const boxEl = document.createElement('div');
                  boxEl.className = 'bbox-rect';
                  boxEl.style.top = `${top}%`;
                  boxEl.style.left = `${left}%`;
                  boxEl.style.width = `${width}%`;
                  boxEl.style.height = `${height}%`;
                  boxEl.style.borderColor = d.color;
                  boxEl.style.backgroundColor = `${d.color}33`; // 20% opacity
                  bboxOverlay.appendChild(boxEl);
                });

                // Remove laser line but keep the image and boxes for the popup
                document.getElementById('laser-line').remove();
                
                const finalPreviewHtml = document.getElementById('receipt-bbox-container').outerHTML;
                document.getElementById('ai-scanning-overlay').remove();
                
                window.showAIAnalysisPopup(extractedData, finalPreviewHtml);

              } catch (error) {
                console.error('Scan Error:', error);
                const overlay = document.getElementById('ai-scanning-overlay');
                if (overlay) overlay.remove();
                alert(`Failed to scan receipt: ${error.message}`);
              }
            };
            reader.readAsDataURL(file);
          }
        };
      }

      let html = '';
      if (method === 'gcash') {
        html = `
          <div style="display: flex; gap: 2rem; align-items: stretch; flex-wrap: wrap;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; flex-shrink: 0;">
              <div style="width: 140px; height: 140px; background: #fff; padding: 0.75rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                 <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                   <rect width="100" height="100" fill="#fff"/>
                   <rect x="10" y="10" width="22" height="22" fill="none" stroke="#007DFE" stroke-width="4" rx="2"/>
                   <rect x="68" y="10" width="22" height="22" fill="none" stroke="#007DFE" stroke-width="4" rx="2"/>
                   <rect x="10" y="68" width="22" height="22" fill="none" stroke="#007DFE" stroke-width="4" rx="2"/>
                   <rect x="15" y="15" width="12" height="12" fill="#007DFE" rx="1"/>
                   <rect x="73" y="15" width="12" height="12" fill="#007DFE" rx="1"/>
                   <rect x="15" y="73" width="12" height="12" fill="#007DFE" rx="1"/>
                   <path d="M45 10h15v10H45zM10 45h20v10H10zM70 45h20v10H70zM40 40h20v20H40zM40 70h30v10H40zM80 70h10v20H80zM60 85h10v10H60zM45 25h10v10H45zM80 40h10v10H80z" fill="#000"/>
                 </svg>
              </div>
              <button onclick="window.showAIAnalysisPopup()" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1'">
                View AI Analysis Preview
              </button>
            </div>
            <div style="flex: 1; min-width: 250px;">
              <div style="color: #fff; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: #007DFE;">GCash</span> Transfer
              </div>
              <div style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 0.5rem;">Scan this QR code using your GCash app to pay instantly.</div>
              <div style="color: #cbd5e1; font-size: 0.9rem;">Or send manually to: <strong style="color: #fff; letter-spacing: 1px; font-size: 1.1rem; margin-left: 0.25rem;">0917-123-4567</strong></div>
              <div style="margin-top: 1.25rem; padding: 0.6rem 1rem; background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); border-radius: 8px; display: inline-block; color: #E53935; font-size: 0.8rem; font-weight: 600;">
                <i style="margin-right:0.25rem">⚠️</i> Please include your Account Number in the message!
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1.5rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; min-width: 250px;">
              <div style="color: #fff; font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">Upload Receipt</div>
              <div style="color: #94a3b8; font-size: 0.8rem; text-align: center; margin-bottom: 1rem; max-width: 200px;">Upload a screenshot of your GCash receipt for verification.</div>
              
              <label style="background: #10b981; color: #fff; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                <span>📸</span> Add Image
                <input type="file" accept="image/*" style="display: none;" onchange="window.simulateAIAnalysis(this)">
              </label>
            </div>
          </div>
        `;

      } else if (method === 'cc') {
        html = `
          <div style="display: flex; gap: 2rem; align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1;">
              <div style="color: #fff; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Card Payment Gateway</div>
              <div style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">We accept Visa, Mastercard, and JCB cards. You will be redirected to our secure payment processor (PayMongo) to enter your card details safely.</div>
              <button style="background: #fff; color: #000; font-weight: 700; border: none; padding: 0.85rem 1.5rem; border-radius: 8px; cursor: pointer; align-self: flex-start; font-size: 0.95rem; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#fff'">
                Proceed to Secure Gateway &rarr;
              </button>
            </div>
          </div>
        `;
      } else if (method === 'bt') {
        html = `
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <div style="color: #fff; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Direct Bank Transfer</div>
              <div style="color: #94a3b8; font-size: 0.95rem;">Transfer directly from your bank app via InstaPay or PESONet.</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 1rem;">
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 1.25rem; border-radius: 12px;">
                <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Bank Name</div>
                <div style="color: #fff; font-size: 1.1rem; font-weight: 600;">BDO Unibank</div>
              </div>
              
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 1.25rem; border-radius: 12px;">
                <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Account Name</div>
                <div style="color: #fff; font-size: 1.1rem; font-weight: 600;">R-FIBER NET</div>
              </div>
              
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 1.25rem; border-radius: 12px; border-left: 3px solid #10b981;">
                <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Account Number</div>
                <div style="color: #fff; font-size: 1.3rem; font-weight: 700; letter-spacing: 1.5px;">0012 3456 7890</div>
              </div>
            </div>
          </div>
        `;
      }

      container.style.display = 'block';
      container.style.animation = 'fadeSlideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
      container.innerHTML = html;
    };

    setTimeout(() => {
      // Scroll spy logic
      const container = document.getElementById('dashboard-scroll-container');
      const sections = document.querySelectorAll('.dashboard-content');
      const tabs = document.querySelectorAll('.dashboard-tab');

      if (!container || sections.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.id.replace('content-', '');
          const tab = document.getElementById('tab-' + id);

          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            if (entry.intersectionRatio > 0.3) {
              tabs.forEach(t => {
                t.style.background = 'transparent';
                t.style.color = '#cbd5e1';
              });
              if (tab) {
                tab.style.background = 'rgba(229,57,53,0.1)';
                tab.style.color = '#fff';
              }
            }
          } else {
            entry.target.style.opacity = '0.05';
            entry.target.style.transform = 'translateY(30px)';
          }
        });
      }, {
        root: container,
        threshold: [0.0, 0.3, 0.6, 1.0],
        rootMargin: "-20% 0px -20% 0px"
      });

      sections.forEach(sec => {
        sec.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        sec.style.opacity = '0.05';
        sec.style.transform = 'translateY(30px)';
        observer.observe(sec);
      });

      container.dispatchEvent(new Event('scroll'));

      // Dynamic Data Refresh Logic
      (async function () {
        try {
          const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
          const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

          const firebaseConfig = {
            apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
            authDomain: "portal-c293a.firebaseapp.com",
            projectId: "portal-c293a",
            storageBucket: "portal-c293a.firebasestorage.app",
            messagingSenderId: "159583415029",
            appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
          };

          let app;
          try { app = initializeApp(firebaseConfig); } catch (err) { }
          const db = getFirestore();

          if (!user.id) return;
          const userDoc = await getDoc(doc(db, "users", user.id));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Update local storage so data persists on reload
            localStorage.setItem('clientUser', JSON.stringify({ id: user.id, ...data }));

            // --- PRESENCE HEARTBEAT SYSTEM ---
            const { serverTimestamp, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userRef = doc(db, "users", user.id);
            
            const sendHeartbeat = async () => {
              if (document.visibilityState === 'visible') {
                try { await updateDoc(userRef, { lastActive: serverTimestamp() }); } 
                catch (e) { console.warn('Heartbeat failed:', e); }
              }
            };
            
            sendHeartbeat();
            if (window._clientHeartbeatInterval) clearInterval(window._clientHeartbeatInterval);
            window._clientHeartbeatInterval = setInterval(sendHeartbeat, 90000);
            
            const onVisibilityChange = () => { if (document.visibilityState === 'visible') sendHeartbeat(); };
            document.removeEventListener('visibilitychange', window._clientHeartbeatVisListener);
            window._clientHeartbeatVisListener = onVisibilityChange;
            document.addEventListener('visibilitychange', onVisibilityChange);
            
            const onUnload = () => { updateDoc(userRef, { lastActive: 0 }).catch(()=>{}); };
            window.removeEventListener('beforeunload', window._clientHeartbeatUnloadListener);
            window._clientHeartbeatUnloadListener = onUnload;
            window.addEventListener('beforeunload', onUnload);
            // ---------------------------------

            // Extract the fields handling undefined or empty strings
            const currentPlan = data.Plan || data.plan || 'Please add plan';
            const currentAmount = data.ammount || data.amount || '0.00';
            const currentAcct = data.accountNumber || data.account || 'Please add account number';
            const currentName = data.name || 'Please add name';
            const currentEmail = data.email || '';
            const currentAddress = data.address || '';
            const currentFb = data.facebook || 'Please add Facebook profile';
            const currentPhone = data.phone || data['phone number'] || '';
            const currentPass = data.password || 'Please add password';

            // Parse speed for upgrade/downgrade logic
            let currentSpeed = 0;
            const match = currentPlan.match(/(\d+)\s*Mbps/i);
            if (match) {
              currentSpeed = parseInt(match[1]);
            } else {
              const normPlan = currentPlan.toLowerCase().trim();
              if (normPlan.includes('starter') || normPlan.includes('800') || normPlan.includes('1500')) currentSpeed = 30;
              else if (normPlan.includes('value') || normPlan.includes('1000') || normPlan.includes('2000')) currentSpeed = 50;
              else if (normPlan.includes('family') || normPlan.includes('1300') || normPlan.includes('2500')) currentSpeed = 70;
              else if (normPlan.includes('pro') || normPlan.includes('1500') || normPlan.includes('3500')) currentSpeed = 100;
              else if (normPlan.includes('extreme') || normPlan.includes('2000') || normPlan.includes('7499')) currentSpeed = 200;
            }

            // Update DOM Elements
            const setText = (id, text) => {
              const el = document.getElementById(id);
              if (el) el.textContent = text;
            };

            setText('ui-billing-balance', '₱' + currentAmount);
            setText('ui-billing-plan', currentPlan);

            setText('ui-overview-plan', currentPlan);
            setText('ui-overview-acct', currentAcct);
            setText('ui-overview-welcome', currentName);

            // Logic for Overview Email block (Add Email button or Email text)
            const overviewEmailBox = document.getElementById('ui-overview-email');
            if (overviewEmailBox) {
              if (currentEmail && currentEmail.trim() !== '') {
                overviewEmailBox.textContent = currentEmail;
              } else {
                overviewEmailBox.innerHTML = '<a href="#" onclick="window.scrollToSection(\'profile\'); event.preventDefault();" style="color: #E53935; text-decoration: underline; font-size: 1rem; cursor: pointer;">Add email</a>';
              }
            }

            const missing = [];
            if (!currentEmail || currentEmail.trim() === '') {
              missing.push('<a href="#" onclick="window.scrollToSection(\'profile\'); return false;" style="color: #f59e0b; text-decoration: underline; font-weight: 600;">email address</a>');
            }
            if (!currentPhone || currentPhone.trim() === '') {
              missing.push('<a href="#" onclick="window.scrollToSection(\'profile\'); return false;" style="color: #f59e0b; text-decoration: underline; font-weight: 600;">phone number</a>');
            }
            if (!currentAddress || currentAddress.trim() === '') {
              missing.push('<a href="#" onclick="window.scrollToSection(\'profile\'); return false;" style="color: #f59e0b; text-decoration: underline; font-weight: 600;">home address</a>');
            }

            const alertBox = document.getElementById('ui-missing-details-alert');
            const alertLinks = document.getElementById('ui-missing-links');
            if (alertBox && alertLinks) {
              if (missing.length > 0) {
                let missingText = '';
                if (missing.length === 1) missingText = missing[0];
                else if (missing.length === 2) missingText = missing.join(' and ');
                else missingText = missing.slice(0, -1).join(', ') + ', and ' + missing[missing.length - 1];

                alertLinks.innerHTML = missingText;
                alertBox.style.display = 'flex';
              } else {
                alertBox.style.display = 'none';
              }
            }

            setText('ui-profile-plan', currentPlan);
            setText('ui-profile-acct', currentAcct);
            setText('ui-profile-name', currentName);
            setText('ui-profile-fb', currentFb);

            setText('ui-profile-email', currentEmail || 'Please add email address');
            setText('ui-profile-address', currentAddress || 'Please add address');
            setText('ui-profile-phone', currentPhone || 'Please add phone number');

            const emailInput = document.getElementById('edit-email');
            if (emailInput) emailInput.placeholder = currentEmail ? 'Your email address' : 'Add email';

            const addrInput = document.getElementById('edit-address');
            if (addrInput) addrInput.placeholder = currentAddress ? 'Your address' : 'Add address';

            const supportAddr = document.getElementById('support-address');
            if (supportAddr) {
              supportAddr.textContent = currentAddress || 'None';
            }

            const phoneInput = document.getElementById('edit-phone');
            if (phoneInput) phoneInput.placeholder = currentPhone ? 'Your phone number' : 'Add phone number';

            setText('ui-profile-pass-real', currentPass);
            setText('ui-topbar-name', currentName !== 'Please add name' ? currentName : 'User');
            const avatarEl = document.getElementById('ui-topbar-avatar');
            if (avatarEl && currentName !== 'Please add name') {
              avatarEl.textContent = currentName.charAt(0).toUpperCase();
            }

            // Update plan buttons and current plan badge
            // Update plan buttons and current plan badge
            const planCards = [
              { id: 'btn-plan-30', speed: 30, badgeId: 'badge-plan-30' },
              { id: 'btn-plan-50', speed: 50, badgeId: 'badge-plan-50' },
              { id: 'btn-plan-70', speed: 70, badgeId: 'badge-plan-70' },
              { id: 'btn-plan-100', speed: 100, badgeId: 'badge-plan-100' },
              { id: 'btn-plan-200', speed: 200, badgeId: 'badge-plan-200' }
            ];

            planCards.forEach(pc => {
              const btn = document.getElementById(pc.id);
              const badge = document.getElementById(pc.badgeId);

              if (btn) {
                if (currentSpeed === 0) {
                  btn.textContent = 'Select Plan';
                } else if (pc.speed === currentSpeed) {
                  btn.textContent = 'Current Plan';
                  btn.style.background = 'rgba(255,255,255,0.1)';
                  btn.style.color = '#fff';
                  btn.style.border = '1px solid rgba(255,255,255,0.2)';
                  btn.style.cursor = 'default';
                  // Show current plan badge
                  if (badge) {
                    badge.style.display = 'block';
                    // Style the card border to highlight it's the current plan
                    btn.closest('.plan-card').style.border = '1px solid #E53935';
                    btn.closest('.plan-card').style.background = 'rgba(229,57,53,0.05)';
                  }
                } else if (pc.speed > currentSpeed) {
                  btn.textContent = 'Upgrade';
                  btn.style.background = '#E53935';
                  btn.style.color = '#fff';
                  btn.style.border = 'none';
                  btn.style.cursor = 'pointer';
                  btn.onclick = () => {
                    window.scrollToSection('support');
                    const cat = document.getElementById('support-category');
                    if (cat) cat.value = 'Upgrade internet';
                  };
                } else {
                  btn.textContent = 'Downgrade';
                  btn.style.background = 'transparent';
                  btn.style.border = '1px solid #E53935';
                  btn.style.color = '#E53935';
                  btn.style.cursor = 'pointer';
                  btn.onclick = () => {
                    window.scrollToSection('support');
                    const cat = document.getElementById('support-category');
                    if (cat) cat.value = 'Downgrade internet';
                  };
                }
              }
            });

            // ===== CLEAR DASHBOARD FEEDS FOR NEW ACCOUNT =====
            window.clientActiveBills = [];
            window.clientPayments = [];
            window.clientReportsData = {};

            // ===== FETCH BILLING EMAILS FROM SUB-COLLECTION =====
            try {
              const { collection: coll, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
              const billingRef = coll(db, "users", user.id, "billing_emails");
              onSnapshot(billingRef, (billingSnap) => {
                if (!billingSnap.empty) {
                  const billingEmails = [];
                  billingSnap.forEach(d => {
                    billingEmails.push({ id: d.id, ...d.data() });
                  });
                  billingEmails.sort((a, b) => new Date(b.dateSent || 0) - new Date(a.dateSent || 0));

                  // Evaluate dynamic overdue status (8 days)
                  billingEmails.forEach(be => {
                    if (be.status !== 'paid' && be.status !== 'overdue') {
                      if (Date.now() - new Date(be.dateSent).getTime() > 8 * 24 * 60 * 60 * 1000) {
                        be.status = 'overdue';
                      }
                    }
                  });

                  // Filter out paid bills from active lists
                  const activeBills = billingEmails.filter(b => b.status !== 'paid');

                  // Calculate total outstanding balance
                  let totalUnpaid = 0;
                  activeBills.forEach(ab => {
                    totalUnpaid += parseFloat(String(ab.amount).replace(/[^0-9.]/g, '')) || 0;
                  });
                  const balEl = document.getElementById('ui-billing-balance');
                  if (balEl) balEl.innerText = '₱' + totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  // ---- STORE BILLS FOR DASHBOARD FEED ----
                  window.clientActiveBills = activeBills;

                  // ---- UPDATE MY STATEMENTS TABLE ----
                  const statementsBody = document.getElementById('statements-tbody');
                  if (statementsBody) {
                    let tHtml = '';
                    if (activeBills.length === 0) {
                      tHtml = '<tr><td colspan="7" style="text-align: center; padding: 3rem 0; color: #94a3b8; font-size: 0.85rem;">No active billing statements found.</td></tr>';
                    }
                    activeBills.slice(0, 6).forEach((be, idx) => {
                      tHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">';
                      tHtml += '<td style="padding: 1rem 0; color: #fff; font-size: 0.85rem; font-weight: 500;">' + (be.billId || 'BILL-PENDING') + '</td>';
                      tHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (be.billingMonth || '-') + '</td>';
                      tHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (be.plan || '-') + '</td>';
                      tHtml += '<td style="padding: 1rem 0; color: #fff; font-size: 0.85rem; font-weight: 600;">₱' + (be.amount || '0') + '</td>';
                      tHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (be.dueDate || '-') + '</td>';

                      var isOverdue = (be.status === 'overdue');
                      var badgeColor = isOverdue ? '#ef4444' : '#f59e0b';
                      var badgeBg = isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
                      var statusText = isOverdue ? 'Overdue' : 'Pending';

                      tHtml += '<td style="padding: 1rem 0;"><span style="background: ' + badgeBg + '; color: ' + badgeColor + '; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">' + statusText + '</span></td>';
                      tHtml += '<td style="padding: 1rem 0;"><span onclick="window.viewReceipt(\'' + be.id + '\')" style="color: #3b82f6; cursor: pointer; font-size: 0.8rem; text-decoration: underline;">View</span></td>';

                      tHtml += '</tr>';
                    });
                    statementsBody.innerHTML = tHtml;
                  }
                }
              });
            } catch (billingErr) {
              console.error('Error fetching billing emails:', billingErr);
            }

            // ===== FETCH PAYMENT HISTORY =====
            try {
              const { collection: coll, onSnapshot, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
              const q = query(coll(db, "payments"), where("userId", "==", user.id));
              onSnapshot(q, (paySnap) => {
                if (!paySnap.empty) {
                  const payments = [];
                  paySnap.forEach(d => payments.push({ id: d.id, ...d.data() }));
                  payments.sort((a, b) => {
                    let da = a.datePaid || a.date || 0;
                    let db = b.datePaid || b.date || 0;
                    if (a.timestamp && a.timestamp.toDate) da = a.timestamp.toDate();
                    if (b.timestamp && b.timestamp.toDate) db = b.timestamp.toDate();
                    return new Date(db) - new Date(da);
                  });

                  window.clientPayments = payments;

                  const paymentsBody = document.getElementById('payments-tbody');
                  if (paymentsBody) {
                    let pHtml = '';
                    const uiRecorded = document.getElementById('ui-recorded-payments');
                    if (uiRecorded) uiRecorded.innerText = payments.length;

                    payments.forEach((p, idx) => {
                      const pDate = new Date(p.datePaid).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                      if (idx < 6) {
                        pHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">';
                        pHtml += '<td style="padding: 1rem 0; color: #fff; font-size: 0.85rem; font-weight: 500;">' + p.id + '</td>';
                        pHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (p.period || p.billingMonth || '-') + '</td>';
                        pHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (p.plan || '-') + '</td>';
                        pHtml += '<td style="padding: 1rem 0; color: #10b981; font-size: 0.85rem; font-weight: 600;">+₱' + (p.amount || '0') + '</td>';
                        let displayMethod = p.method || 'Online payment';
                        if (displayMethod === 'Instant Payment' || displayMethod === 'Digital Payment') displayMethod = 'Online payment';
                        pHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + displayMethod + '</td>';
                        pHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + pDate + '</td>';
                        pHtml += '<td style="padding: 1rem 0;"><span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">' + (p.status || 'Paid') + '</span></td>';
                        pHtml += '<td style="padding: 1rem 0;"><span onclick="window.viewReceipt(\'' + p.id + '\')" style="color: #3b82f6; cursor: pointer; font-size: 0.8rem; text-decoration: underline;">View</span></td>';
                        pHtml += '</tr>';
                      }
                    });
                    paymentsBody.innerHTML = pHtml;
                  }
                }
              });
            } catch (e) { console.error('Error fetching payments:', e); }

            // Fetch Reports / Tickets
            try {
              const { collection: coll, onSnapshot, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
              const q = query(coll(db, "reports"), where("userId", "==", user.id));
              onSnapshot(q, (repSnap) => {
                window.clientReportsData = {};

                if (repSnap.empty) {
                  window.renderClientReportsTable();
                } else {
                  repSnap.forEach(d => {
                    window.clientReportsData[d.id] = { id: d.id, ...d.data() };
                  });
                  window.renderClientReportsTable();
                }
              });
            } catch (e) { console.error('Error fetching reports:', e); }

            // Handle auto-scroll to billing section if returning from payment
            if (window.location.hash === '#billing') {
              setTimeout(() => {
                if (window.scrollToSection) window.scrollToSection('billing');
                // Remove the hash so a normal refresh doesn't trigger this again
                if (window.history && window.history.replaceState) {
                  window.history.replaceState(null, null, window.location.pathname + window.location.search);
                }
              }, 300);
            }

          }
        } catch (err) {
          console.error("Error fetching latest user data:", err);
        }
      })();
    }, 100);

    const sidebarItem = (id, iconCode, title) => `
      <div id="tab-${id}" class="dashboard-tab" onclick="window.scrollToSection('${id}')" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem; transition: all 0.2s; color: #cbd5e1;">
        <div style="font-weight: 700; font-size: 0.85rem; color: #E53935; width: 20px;">${iconCode}</div>
        <div style="font-weight: 500; font-size: 0.95rem;">${title}</div>
      </div>
    `;

    return `
      <style>
        .dashboard-content {
          margin-bottom: 10rem;
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-15px); }
        }
        .plan-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .plan-badge {
          display: none;
          position: absolute; 
          top: -10px; 
          right: 10px; 
          background: #E53935; 
          color: #fff; 
          font-size: 0.65rem; 
          font-weight: 700; 
          padding: 0.25rem 0.75rem; 
          border-radius: 4px; 
          text-transform: uppercase; 
          box-shadow: 0 2px 8px rgba(229,57,53,0.4);
        }
      </style>
      <div style="height: 100vh; background: #0b0f19; font-family: 'Inter', sans-serif; display: flex; overflow: hidden; margin: 0; padding: 0;">
        
        <!-- Sidebar -->
        <div id="client-sidebar" style="width: 260px; min-width: 260px; background: #0b0f19; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; padding: 1.5rem; height: 100vh; z-index: 10;">
          <div style="margin-bottom: 3rem;">
            <span style="font-family: 'Saira Condensed', sans-serif; font-size: 24px; font-weight: 800; font-style: italic; letter-spacing: -1px;">
              <span style="color: #E53935;">R</span><span style="color: #fff;">FIBER</span><span style="color: #E53935;">X</span>
              <div style="font-size: 8px; color: #fff; letter-spacing: 2px; font-weight: 500; font-style: normal; margin-top: -5px;">NETWORKS</div>
            </span>
          </div>
          
          <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 1px; margin-bottom: 1rem; text-transform: uppercase;">My Account</div>
          
          <div style="flex: 1;">
            ${sidebarItem('overview', 'OV', 'Overview')}
            ${sidebarItem('billing', 'BI', 'Payment Section')}
            ${sidebarItem('plans', 'PL', 'Internet plans')}
            ${sidebarItem('support', 'SP', 'Service')}
            ${sidebarItem('profile', 'ME', 'My profile')}
          </div>
          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem;">
            <div style="font-weight: 700; color: #fff; margin-bottom: 0.5rem; font-size: 0.9rem;">?</div>
            <div style="font-weight: 600; color: #fff; margin-bottom: 0.5rem; font-size: 0.85rem;">Need a hand?</div>
            <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 1rem; line-height: 1.4;">Our support team is ready to help with your connection.</div>
            <a href="#" onclick="event.preventDefault(); window.scrollToSection('support')" style="color: #E53935; font-size: 0.8rem; font-weight: 600; text-decoration: none;">Get support &rarr;</a>
          </div>
        </div>

        <!-- Main Content Area -->
        <div id="client-main-content" style="flex: 1; display: flex; flex-direction: column; height: 100vh; position: relative; background: #0b0f19;">
          
          <!-- Topbar (Sticky) -->
          <div class="dashboard-topbar" style="height: 70px; min-height: 70px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: flex-end; padding: 0 2rem; background: rgba(11,15,25,0.8); backdrop-filter: blur(10px); position: absolute; top: 0; left: 0; right: 0; z-index: 10;">
            <button class="portal-mobile-toggle" onclick="document.getElementById('client-sidebar').classList.toggle('open')" aria-label="Toggle Sidebar" style="margin-right: auto;">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div style="display: flex; align-items: center; gap: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div>
                  <div id="ui-topbar-name" style="color: #fff; font-size: 0.85rem; font-weight: 600;">${name}</div>
                  <div style="color: #64748b; font-size: 0.7rem;">Customer</div>
                </div>
              </div>
              <button onclick="window.logoutClient()" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=\'transparent\'">
                Sign out
              </button>
            </div>
          </div>

          <!-- Scrollable Container -->
          <div id="dashboard-scroll-container" style="flex: 1; overflow-y: auto; padding-top: 70px; scroll-behavior: smooth;">
            <div style="padding: 3rem 2rem; max-width: 1300px; width: 100%; margin: 0 auto; padding-bottom: 15rem;">
              
              <div id="ui-missing-details-alert" style="display: none; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; color: #fff; font-size: 0.9rem; align-items: flex-start; gap: 0.75rem;">
                 <div style="color: #f59e0b; font-size: 1.1rem; margin-top: 2px;">⚠️</div>
                 <div>
                   <div style="color: #f59e0b; font-weight: 700; margin-bottom: 0.25rem;">Incomplete Profile</div>
                   <div style="color: #cbd5e1; font-size: 0.85rem;">Please add your <span id="ui-missing-links"></span> so we can send you important billing statements and updates.</div>
                 </div>
              </div>

              <!-- OVERVIEW SECTION -->
              <div id="content-overview" class="dashboard-content">
                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem; position: relative; overflow: hidden; margin-bottom: 1.5rem; display: flex; justify-content: space-between;">
                  <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 250px; background: #E53935; border-radius: 200px 0 0 200px; transform: translateX(120px);"></div>
                  <div style="position: relative; z-index: 1;">
                    <div style="color: #E53935; font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 0.5rem; text-transform: uppercase;">Welcome Back</div>
                    <h1 id="ui-overview-welcome" style="color: #fff; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: -0.5px;">${name}</h1>
                    <div id="ui-overview-acct" style="color: #94a3b8; font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; letter-spacing: 1px;">${acctNum}</div>
                    <p style="color: #94a3b8; font-size: 0.95rem;">Your connection, account, and support - right where you need them.</p>
                  </div>
                  <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;">
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 0.4rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem;">
                      <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div>
                      <span style="color: #10b981; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Active</span>
                    </div>
                    <div id="ui-overview-email" style="color: #fff; font-size: 1.1rem; font-weight: 600; text-align: right;">
                      <!-- Populated by JS. Might be an "Add email" link. -->
                    </div>
                  </div>
                </div>

                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; min-height: 200px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0;">Recent updates</h3>
                    <div id="recent-updates-count" style="width: 24px; height: 24px; border-radius: 50%; background: rgba(16,185,129,0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">0</div>
                  </div>
                  <div id="recent-updates-box" style="margin-top: 2rem; max-height: 480px; overflow-y: auto; padding-right: 0.5rem;">
                    <div style="text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 3rem;">
                      You're all caught up. New service updates will appear here.
                    </div>
                  </div>
                </div>
              </div>

              <!-- BILLING SECTION -->
              <div id="content-billing" class="dashboard-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                  <div>
                    <div style="color: #E53935; font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 0.5rem; text-transform: uppercase;">My Account</div>
                    <h1 style="color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: -0.5px;">Billing & payments</h1>
                    <p style="color: #94a3b8; font-size: 0.9rem;">Review your statements and recorded payments.</p>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Current plan</div>
                    <div id="ui-billing-plan" style="color: #fff; font-size: 1.5rem; font-weight: 600;">${plan}</div>
                  </div>
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Amount</div>
                    <div id="ui-billing-amount" style="color: #fff; font-size: 1.5rem; font-weight: 600;">₱${basePlanAmount}</div>
                  </div>
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Outstanding balance</div>
                    <div id="ui-billing-balance" style="color: #fff; font-size: 1.5rem; font-weight: 600;">₱0.00</div>
                  </div>
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Recorded payments</div>
                    <div id="ui-recorded-payments" style="color: #fff; font-size: 1.5rem; font-weight: 600;">0</div>
                  </div>
                </div>

                <!-- MOVED PAYMENT METHOD SECTION -->
                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                  <h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0 0 0.25rem 0;">Preferred payment method</h3>
                  <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem;">Choose how you would like to pay your monthly bill.</p>
                  
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div id="payment-btn-gcash" class="payment-btn" onclick="window.togglePaymentMethod('gcash')" style="border: 1px solid rgba(255,255,255,0.05); background: transparent; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s;">
                      <div style="width: 24px; height: 24px; background: #007DFE; color: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700;">G</div>
                      <div>
                        <div style="color: #fff; font-size: 0.85rem; font-weight: 600;">GCash</div>
                        <div style="color: #64748b; font-size: 0.7rem;">Pay using mobile wallet</div>
                      </div>
                    </div>

                    <div id="payment-btn-cc" class="payment-btn" onclick="window.togglePaymentMethod('cc')" style="border: 1px solid rgba(255,255,255,0.05); background: transparent; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s;">
                      <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.1); color: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700;">CC</div>
                      <div>
                        <div style="color: #fff; font-size: 0.85rem; font-weight: 600;">Credit / Debit</div>
                        <div style="color: #64748b; font-size: 0.7rem;">Visa or Mastercard</div>
                      </div>
                    </div>
                    <div id="payment-btn-bt" class="payment-btn" onclick="window.togglePaymentMethod('bt')" style="border: 1px solid rgba(255,255,255,0.05); background: transparent; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s;">
                      <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.1); color: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700;">BT</div>
                      <div>
                        <div style="color: #fff; font-size: 0.85rem; font-weight: 600;">Bank Transfer</div>
                        <div style="color: #64748b; font-size: 0.7rem;">Direct deposit</div>
                      </div>
                    </div>
                  </div>

                  <!-- Dynamic Payment Details Container -->
                  <div id="dynamic-payment-content" style="background: #0b0f19; border: 1px solid rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; display: none;"></div>
                </div>
                <!-- END PAYMENT METHOD SECTION -->

                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                  <h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0 0 1rem 0;">My statements</h3>
                  <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Bill ID</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Billing Period</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Plan</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Due Date</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Status</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Receipt</th>
                        </tr>
                      </thead>
                      <tbody id="statements-tbody">
                        <tr>
                          <td colspan="7" style="text-align: center; padding: 3rem 0; color: #94a3b8; font-size: 0.85rem;">No active billing statements found.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0;">Payment history</h3>
                    <div style="color: #64748b; font-size: 0.8rem;">Official records</div>
                  </div>
                  <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Payment ID</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Billing Period</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Plan</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Payment Method</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Date Paid</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Status</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Receipt</th>
                        </tr>
                      </thead>
                      <tbody id="payments-tbody">
                        <tr>
                          <td colspan="8" style="text-align: center; padding: 3rem 0; color: #94a3b8; font-size: 0.85rem;">No payments have been recorded yet.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- PLANS SECTION -->
              <div id="content-plans" class="dashboard-content">
                <div style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2); padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 2rem; display: flex; gap: 0.5rem; font-size: 0.85rem;">
                  <span style="color: #eab308; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Plan Policy</span>
                  <span style="color: #cbd5e1;">Requests for upgrades or downgrades will be queued for admin approval. Clients cannot upgrade or downgrade if they haven't been subscribed for at least 6 months on their current plan.</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;">
                  <!-- Plan 1 -->
                  <div class="plan-card" style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column;">
                    <div id="badge-plan-30" class="plan-badge">Current Plan</div>
                    <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700; margin: 0 0 1.5rem 0;">Starter RFiberX</h3>
                    <div style="color: #E53935; font-size: 2.2rem; font-weight: 800; line-height: 1; margin-bottom: 1.5rem; letter-spacing:-1px;">₱800<span style="font-size: 0.85rem; font-weight: 500; color: #64748b; letter-spacing:0;"> /mo</span></div>
                    
                    <ul style="list-style: none; padding: 0; margin: 0 0 1.5rem 0; flex: 1;">
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Up to 30 Mbps</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Unlimited Data</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Standard Router</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem;">Good for 10 devices</li>
                    </ul>
                    <button id="btn-plan-30" style="width: 100%; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;">Select Plan</button>
                  </div>

                  <!-- Plan 2 -->
                  <div class="plan-card" style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column;">
                    <div id="badge-plan-50" class="plan-badge">Current Plan</div>
                    <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700; margin: 0 0 1.5rem 0;">Value RFiberX</h3>
                    <div style="color: #E53935; font-size: 2.2rem; font-weight: 800; line-height: 1; margin-bottom: 1.5rem; letter-spacing:-1px;">₱1000<span style="font-size: 0.85rem; font-weight: 500; color: #64748b; letter-spacing:0;"> /mo</span></div>
                    
                    <ul style="list-style: none; padding: 0; margin: 0 0 1.5rem 0; flex: 1;">
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Up to 50 Mbps</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Unlimited Data</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Standard Router</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem;">HD Streaming Ready</li>
                    </ul>
                    <button id="btn-plan-50" style="width: 100%; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;">Select Plan</button>
                  </div>

                  <!-- Plan 3 -->
                  <div class="plan-card" style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column;">
                    <div id="badge-plan-70" class="plan-badge">Current Plan</div>
                    <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700; margin: 0 0 1.5rem 0;">Family RFiberX</h3>
                    <div style="color: #E53935; font-size: 2.2rem; font-weight: 800; line-height: 1; margin-bottom: 1.5rem; letter-spacing:-1px;">₱1300<span style="font-size: 0.85rem; font-weight: 500; color: #64748b; letter-spacing:0;"> /mo</span></div>
                    
                    <ul style="list-style: none; padding: 0; margin: 0 0 1.5rem 0; flex: 1;">
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Up to 70 Mbps</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Unlimited Data</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Dual-Band Router</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem;">Great for 10 devices</li>
                    </ul>
                    <button id="btn-plan-70" style="width: 100%; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;">Select Plan</button>
                  </div>

                  <!-- Plan 4 -->
                  <div class="plan-card" style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column;">
                    <div id="badge-plan-100" class="plan-badge">Current Plan</div>
                    <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700; margin: 0 0 1.5rem 0;">Pro RFiberX</h3>
                    <div style="color: #E53935; font-size: 2.2rem; font-weight: 800; line-height: 1; margin-bottom: 1.5rem; letter-spacing:-1px;">₱1500<span style="font-size: 0.85rem; font-weight: 500; color: #64748b; letter-spacing:0;"> /mo</span></div>
                    
                    <ul style="list-style: none; padding: 0; margin: 0 0 1.5rem 0; flex: 1;">
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Up to 100 Mbps</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Unlimited Data</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Wi-Fi 6 Router</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem;">4K Streaming & Gaming</li>
                    </ul>
                    <button id="btn-plan-100" style="width: 100%; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;">Select Plan</button>
                  </div>

                  <!-- Plan 5 -->
                  <div class="plan-card" style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column;">
                    <div id="badge-plan-200" class="plan-badge">Current Plan</div>
                    <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700; margin: 0 0 1.5rem 0;">Extreme RFiberX</h3>
                    <div style="color: #E53935; font-size: 2.2rem; font-weight: 800; line-height: 1; margin-bottom: 1.5rem; letter-spacing:-1px;">₱2000<span style="font-size: 0.85rem; font-weight: 500; color: #64748b; letter-spacing:0;"> /mo</span></div>
                    
                    <ul style="list-style: none; padding: 0; margin: 0 0 1.5rem 0; flex: 1;">
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Up to 200 Mbps</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Unlimited Data</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">Mesh System Included</li>
                      <li style="color: #cbd5e1; font-size: 0.8rem;">Ultimate Smart Home</li>
                    </ul>
                    <button id="btn-plan-200" style="width: 100%; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;">Select Plan</button>
                  </div>
                </div>
              </div>

              <!-- SUPPORT SECTION -->
              <div id="content-support" class="dashboard-content">
                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0;">Create a request</h3>
                    <div style="color: #94a3b8; font-size: 0.8rem;">We will keep you updated</div>
                  </div>

                  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                      <label style="display: block; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem;">Subject</label>
                      <input id="support-subject" type="text" placeholder="Briefly describe the issue or request" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; outline: none;">
                    </div>
                    <div>
                      <label style="display: block; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem;">Category</label>
                      <select id="support-category" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; outline: none; appearance: none;">
                        <option>Other</option>
                        <option>Billing</option>
                        <option>Technical</option>
                        <option>Upgrade internet</option>
                        <option>Downgrade internet</option>
                      </select>
                    </div>
                  </div>

                  <div style="margin-bottom: 1rem;">
                    <label style="display: block; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem;">What happened?</label>
                    <textarea id="support-desc" placeholder="Add details that can help our team diagnose the issue or process your request." rows="3" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; outline: none; resize: none;"></textarea>
                  </div>

                  <div style="background: #0b0f19; border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <div style="color: #cbd5e1; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Service address from profile</div>
                    <div id="support-address" style="color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">None</div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: #94a3b8; font-size: 0.85rem;">
                      Or contact our tech-support on our page <a href="https://www.facebook.com/RFiber1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 600;">here</a>
                    </div>
                    <button onclick="window.submitReport()" style="background: #E53935; color: #fff; border: none; padding: 0.75rem 2.5rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f44336'" onmouseout="this.style.background='#e53935'">Submit report</button>
                  </div>
                </div>

                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0;">My tickets</h3>
                  </div>
                  
                  <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Report ID</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Subject</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Category</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Location</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Status</th>
                          <th style="text-align: left; padding: 1rem 0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colspan="6" style="text-align: center; padding: 3rem 0; color: #94a3b8; font-size: 0.85rem;">You have not created any service requests.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <!-- Rating Modal -->
                <div id="rating-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center;">
                  <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 400px; padding: 2rem; display: flex; flex-direction: column; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    <h2 style="color: #fff; font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Rate Your Experience</h2>
                    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem;">How would you rate the service provided?</p>
                    
                    <div id="rating-stars" style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                      <span data-star="1" onclick="window.setRating(1)" style="font-size: 2rem; color: #334155; cursor: pointer; transition: color 0.2s;">★</span>
                      <span data-star="2" onclick="window.setRating(2)" style="font-size: 2rem; color: #334155; cursor: pointer; transition: color 0.2s;">★</span>
                      <span data-star="3" onclick="window.setRating(3)" style="font-size: 2rem; color: #334155; cursor: pointer; transition: color 0.2s;">★</span>
                      <span data-star="4" onclick="window.setRating(4)" style="font-size: 2rem; color: #334155; cursor: pointer; transition: color 0.2s;">★</span>
                      <span data-star="5" onclick="window.setRating(5)" style="font-size: 2rem; color: #334155; cursor: pointer; transition: color 0.2s;">★</span>
                    </div>
                    
                    <textarea id="rating-feedback" placeholder="Optional feedback..." rows="3" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; outline: none; resize: none; margin-bottom: 1.5rem;"></textarea>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                      <button id="btn-submit-rating" onclick="window.submitRating()" disabled style="background: #3b82f6; color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: not-allowed; opacity: 0.5; transition: all 0.2s;">Rate</button>
                      <button onclick="window.skipRating()" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">Skip</button>
                    </div>
                  </div>
                </div>

                <!-- Client Ticket Details Modal -->
                <div id="client-ticket-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center;">
                  <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 600px; max-width: 90%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    <!-- Header -->
                    <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: #151a27;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <h2 style="color: #fff; font-size: 1.25rem; font-weight: 600; margin: 0;">Ticket Details</h2>
                        <span id="client-modal-ticket-id" style="background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; color: #94a3b8; font-family: monospace; font-size: 0.75rem;"></span>
                      </div>
                      <button onclick="window.closeClientReport()" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#64748b'">&times;</button>
                    </div>
                    <!-- Body -->
                    <div style="padding: 1.5rem; overflow-y: auto; flex: 1;">
                      <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem;">
                        <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 1rem;">Customer Details</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                          <div>
                            <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Name & Account</div>
                            <div id="client-modal-name" style="color: #fff; font-weight: 600; font-size: 0.95rem;"></div>
                            <div id="client-modal-account" style="color: #cbd5e1; font-size: 0.85rem;"></div>
                          </div>
                          <div>
                            <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Contact Info</div>
                            <div id="client-modal-phone" style="color: #fff; font-size: 0.85rem;"></div>
                            <div id="client-modal-fb" style="color: #cbd5e1; font-size: 0.85rem;"></div>
                          </div>
                          <div>
                            <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Plan</div>
                            <div id="client-modal-plan" style="color: #fff; font-size: 0.85rem;"></div>
                          </div>
                          <div>
                            <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Location</div>
                            <div id="client-modal-address" style="color: #fff; font-size: 0.85rem; line-height: 1.4;"></div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Issue Details -->
                      <div style="margin-bottom: 1rem;">
                        <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Issue Details</div>
                        <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                          <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1rem;">
                            <span id="client-modal-category" style="background: rgba(59,130,246,0.1); color: #3b82f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; white-space: nowrap;"></span>
                            <div id="client-modal-subject" style="color: #fff; font-size: 1rem; font-weight: 600; line-height: 1.4;"></div>
                          </div>
                          <div id="client-modal-desc" style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap;"></div>
                        </div>
                      </div>
                      
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                        <div style="font-size: 0.75rem; color: #64748b;">Submitted: <span id="client-modal-date"></span></div>
                        <div id="client-modal-status-badge"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- MY PROFILE SECTION -->
              <div id="content-profile" class="dashboard-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                  <div>
                    <div style="color: #E53935; font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 0.5rem; text-transform: uppercase;">Account Details</div>
                    <h1 style="color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: -0.5px;">My profile</h1>
                    <p style="color: #94a3b8; font-size: 0.9rem;">Keep your contact and installation details up to date.</p>
                  </div>
                  <div>
                    <button id="theme-toggle-btn" onclick="window.toggleThemeMode()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                      <span id="theme-icon">${themeIcon}</span> <span id="theme-text">${themeText}</span>
                    </button>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                  
                  <!-- Subscriber Information Card -->
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem;">
                    <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0 0 2rem 0;">Subscriber information</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                      
                      <!-- Row 1: Account Number & Plan -->
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-left: 2px solid #E53935; padding-left: 1rem; margin-bottom: 1rem;">
                        <div>
                          <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Account number</div>
                          <div style="color: #fff; font-size: 0.95rem; font-weight: 500;">
                            <span id="ui-profile-acct">${acctNum}</span>
                          </div>
                        </div>
                        <div>
                          <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Internet plan</div>
                          <div style="color: #fff; font-size: 0.95rem; font-weight: 500;">
                            <span id="ui-profile-plan">${plan}</span>
                          </div>
                        </div>
                      </div>

                      <div id="container-name" style="padding: 0.75rem; border-radius: 8px; transition: all 0.2s;">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Full name</div>
                        <div style="color: #fff; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center;">
                          <span id="ui-profile-name">${name}</span>
                          <span id="preview-name" style="color: #10b981; font-weight: 600; margin-left: 0.75rem; font-size: 0.85rem; display: none;"></span>
                        </div>
                      </div>
                      
                      <div id="container-address" style="padding: 0.75rem; border-radius: 8px; transition: all 0.2s;">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Address</div>
                        <div style="color: #fff; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center;">
                          <span id="ui-profile-address">Please add address</span>
                          <span id="preview-address" style="color: #10b981; font-weight: 600; margin-left: 0.75rem; font-size: 0.85rem; display: none;"></span>
                        </div>
                      </div>

                      <div id="container-email" style="padding: 0.75rem; border-radius: 8px; transition: all 0.2s;">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Email address</div>
                        <div style="color: #fff; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center;">
                          <span id="ui-profile-email">${email}</span>
                          <span id="preview-email" style="color: #10b981; font-weight: 600; margin-left: 0.75rem; font-size: 0.85rem; display: none;"></span>
                        </div>
                      </div>

                      <div id="container-phone" style="padding: 0.75rem; border-radius: 8px; transition: all 0.2s;">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Phone Number</div>
                        <div style="color: #fff; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center;">
                          <span id="ui-profile-phone">Please add phone number</span>
                          <span id="preview-phone" style="color: #10b981; font-weight: 600; margin-left: 0.75rem; font-size: 0.85rem; display: none;"></span>
                        </div>
                      </div>

                      <div id="container-fb" style="padding: 0.75rem; border-radius: 8px; transition: all 0.2s;">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Facebook Profile</div>
                        <div style="color: #fff; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center;">
                          <span id="ui-profile-fb">Please add Facebook profile</span>
                          <span id="preview-fb" style="color: #10b981; font-weight: 600; margin-left: 0.75rem; font-size: 0.85rem; display: none;"></span>
                        </div>
                      </div>
                      
                      <div id="container-pass" style="padding: 0.75rem; border-radius: 8px; transition: all 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                          <div style="color: #64748b; font-size: 0.75rem; font-weight: 600;">Password</div>
                          <button id="toggle-pass-btn" onclick="window.togglePasswordVisibility()" style="background: transparent; border: none; color: #E53935; font-size: 0.75rem; font-weight: 600; cursor: pointer; text-decoration: underline;">Show</button>
                        </div>
                        <div style="color: #fff; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center;">
                          <span id="ui-profile-pass-masked">••••••••</span>
                          <span id="ui-profile-pass-real" style="display: none;">Please add password</span>
                          <span id="preview-pass" style="color: #10b981; font-weight: 600; margin-left: 0.75rem; font-size: 0.85rem; display: none;"></span>
                        </div>
                      </div>

                    </div>
                  </div>

                  <!-- Alter Details Card -->
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                      <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Alter Details</h3>
                      <div style="color: #94a3b8; font-size: 0.85rem;">Editable</div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                      <div>
                        <label style="display: block; color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Full Name</label>
                        <input type="text" id="edit-name" onkeyup="window.handleInputPreview('edit-name', 'preview-name')" onfocus="this.style.borderColor='#E53935'; this.style.boxShadow='0 0 0 3px rgba(229,57,53,0.1)'; window.handleInputFocus('container-name', true);" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'; window.handleInputFocus('container-name', false);" placeholder="Your full name" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem; border-radius: 6px; font-size: 0.9rem; outline: none; transition: all 0.2s;">
                      </div>
                      
                      <div>
                        <label style="display: block; color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Address</label>
                        <input type="text" id="edit-address" onkeyup="window.handleInputPreview('edit-address', 'preview-address')" onfocus="this.style.borderColor='#E53935'; this.style.boxShadow='0 0 0 3px rgba(229,57,53,0.1)'; window.handleInputFocus('container-address', true);" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'; window.handleInputFocus('container-address', false);" placeholder="Add address" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem; border-radius: 6px; font-size: 0.9rem; outline: none; transition: all 0.2s;">
                      </div>
                      
                      <div>
                        <label style="display: block; color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Email Address</label>
                        <input type="email" id="edit-email" onkeyup="window.handleInputPreview('edit-email', 'preview-email')" onfocus="this.style.borderColor='#E53935'; this.style.boxShadow='0 0 0 3px rgba(229,57,53,0.1)'; window.handleInputFocus('container-email', true);" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'; window.handleInputFocus('container-email', false);" placeholder="Add email address" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem; border-radius: 6px; font-size: 0.9rem; outline: none; transition: all 0.2s;">
                      </div>
                      
                      <div>
                        <label style="display: block; color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Phone Number</label>
                        <input type="text" id="edit-phone" onkeyup="window.handleInputPreview('edit-phone', 'preview-phone')" onfocus="this.style.borderColor='#E53935'; this.style.boxShadow='0 0 0 3px rgba(229,57,53,0.1)'; window.handleInputFocus('container-phone', true);" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'; window.handleInputFocus('container-phone', false);" placeholder="Add phone number" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem; border-radius: 6px; font-size: 0.9rem; outline: none; transition: all 0.2s;">
                      </div>
                      
                      <div>
                        <label style="display: block; color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Facebook Profile</label>
                        <input type="text" id="edit-fb" onkeyup="window.handleInputPreview('edit-fb', 'preview-fb')" onfocus="this.style.borderColor='#E53935'; this.style.boxShadow='0 0 0 3px rgba(229,57,53,0.1)'; window.handleInputFocus('container-fb', true);" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'; window.handleInputFocus('container-fb', false);" placeholder="Your exact Facebook name" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem; border-radius: 6px; font-size: 0.9rem; outline: none; transition: all 0.2s;">
                      </div>
                      
                      <div>
                        <label style="display: block; color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Password</label>
                        <div style="position: relative;">
                          <input type="password" id="edit-pass" onkeyup="window.handleInputPreview('edit-pass', 'preview-pass')" onfocus="this.style.borderColor='#E53935'; this.style.boxShadow='0 0 0 3px rgba(229,57,53,0.1)'; window.handleInputFocus('container-pass', true);" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'; window.handleInputFocus('container-pass', false);" placeholder="Change your portal password" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem; padding-right: 3.5rem; border-radius: 6px; font-size: 0.9rem; outline: none; transition: all 0.2s;">
                          <button type="button" onclick="window.toggleEditPassword(event)" style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #E53935; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Show</button>
                        </div>
                      </div>
                    </div>

                    <button onclick="window.triggerSaveChanges()" style="width: 100%; background: #E53935; color: #fff; border: none; padding: 0.85rem; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f44336'" onmouseout="this.style.background='#e53935'">
                      Save changes
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Confirmation Modal -->
        <div id="save-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 1000; align-items: center; justify-content: center;">
          <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2rem; width: 100%; max-width: 450px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <h3 style="color: #fff; font-size: 1.25rem; font-weight: 700; margin: 0 0 1rem 0;">Confirm Changes</h3>
            <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem;">Are you sure you want to save these changes to your account?</p>
            <div style="background: #0b0f19; border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
              <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Information to change:</div>
              <ul id="modal-changes-list" style="color: #fff; font-size: 0.9rem; margin: 0; padding-left: 1.2rem; font-weight: 500;">
              </ul>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
              <button onclick="window.cancelSaveChanges()" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=\'transparent\'">Cancel</button>
              <button onclick="window.confirmSaveChanges()" id="modal-confirm-btn" style="background: #E53935; border: none; color: #fff; padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f44336'" onmouseout="this.style.background='#E53935'">Proceed</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

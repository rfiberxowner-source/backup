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
    const outstandingBalance = user.ammount || user.amount || '0.00';
    const plan = user.Plan || user.plan || 'Please add plan';
    const acctNum = user.accountNumber || user.account || 'Please add account number';
    const email = user.email || 'Please add email address';
    const name = user.name || 'Please add name';

    window.logoutClient = function () {
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
    
    window.renderClientReportsTable = function() {
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
      const annBox = document.getElementById('announcements-box');
      const annCount = document.getElementById('announcements-count');
      
      if (recBox && annBox) {
        let recentItems = [];
        let annItems = [];
        
        reports.forEach(t => {
          let tTime = new Date(t.processedDate || t.date).getTime();
          let dateStr = new Date(t.processedDate || t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          if (t.status === 'Fixed' || t.status === 'Read') {
             let html = `<div class="client-ticket-update" onclick="window.viewClientReport('${t.id}')" style="background: rgba(59,130,246,0.03); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px; padding: 0.75rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.08)'" onmouseout="this.style.background='rgba(59,130,246,0.03)'">`;
             html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">';
             html += '<div style="display: flex; align-items: center; gap: 0.5rem;">';
             html += '<div style="width: 28px; height: 28px; background: rgba(59,130,246,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 0.75rem;">🎫</div>';
             html += '<span style="color: #fff; font-size: 0.9rem; font-weight: 600;">Ticket ' + t.status + '</span>';
             html += '</div>';
             html += '<span style="color: #64748b; font-size: 0.75rem;">' + dateStr + '</span>';
             html += '</div>';
             html += '<div style="color: #94a3b8; font-size: 0.85rem; padding-left: 2.25rem;">Your report "<strong>' + (t.subject || 'Ticket') + '</strong>" has been marked as ' + t.status + '.</div>';
             html += '</div>';
             recentItems.push({ time: tTime, html: html });
          }
          if (t.status === 'Read') {
             let html = `<div class="client-ticket-announcement" onclick="window.viewClientReport('${t.id}')" style="background: rgba(16,185,129,0.03); border: 1px solid rgba(16,185,129,0.15); border-radius: 10px; padding: 0.75rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(16,185,129,0.08)'" onmouseout="this.style.background='rgba(16,185,129,0.03)'">`;
             html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">';
             html += '<div style="display: flex; align-items: flex-start; gap: 0.75rem;">';
             html += '<div style="width: 28px; height: 28px; background: rgba(16,185,129,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 0.75rem; flex-shrink: 0;">📣</div>';
             html += '<div>';
             html += '<div style="color: #fff; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.25rem;">Admin has read your ticket</div>';
             html += '<div style="color: #94a3b8; font-size: 0.8rem; line-height: 1.4;">The admin has viewed your report "' + (t.subject||'Ticket') + '".</div>';
             html += '</div></div>';
             html += '<span style="color: #64748b; font-size: 0.75rem;">' + dateStr + '</span>';
             html += '</div></div>';
             annItems.push({ time: tTime, html: html });
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

            annItems.push({ time: tTime, html: aHtml });
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
            html += '<div style="color: #94a3b8; font-size: 0.85rem; padding-left: 2.25rem;">You paid <strong style="color:#fff;">₱' + (p.amount || '0') + '</strong> for ' + (p.period || '-') + '. <span style="color: #3b82f6; font-size: 0.75rem;">View receipt →</span></div>';
            html += '</div>';
            
            recentItems.push({ time: tTime, html: html });
          });
        }
        
        recentItems.sort((a,b) => b.time - a.time);
        annItems.sort((a,b) => b.time - a.time);

        if (recentItems.length > 0) {
          recBox.innerHTML = recentItems.slice(0, 15).map(i => i.html).join('');
          if (recCount) recCount.textContent = Math.min(recentItems.length, 15);
        } else {
          recBox.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 3rem;">You\'re all caught up. New service updates will appear here.</div>';
          if (recCount) recCount.textContent = '0';
        }

        if (annItems.length > 0) {
          annBox.innerHTML = annItems.slice(0, 15).map(i => i.html).join('');
          if (annCount) annCount.textContent = Math.min(annItems.length, 15);
        } else {
          annBox.innerHTML = '<div style="text-align: center;"><div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">There are no announcements right now.</div><button style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 2rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.05)\'" onmouseout="this.style.background=\'transparent\'">Need help? Contact support</button></div>';
          if (annCount) annCount.textContent = '0';
        }
      }
    };
    
    window.viewClientReport = function(id) {
      const r = window.clientReportsData[id];
      if(!r) return;
      
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
    
    window.closeClientReport = function() {
      document.getElementById('client-ticket-modal').style.display = 'none';
    };
    
    window.markReportFixed = async function(e, id) {
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
        try { initializeApp(firebaseConfig); } catch(err) {}
        
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
      } catch(err) {
        console.error('Error marking report fixed:', err);
        alert('Failed to mark report as Done.');
        e.target.innerHTML = 'Done';
        e.target.disabled = false;
      }
    };

    window.currentRatingScore = 0;
    window.currentRatingReportId = null;

    window.setRating = function(score) {
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
    
    window.openRatingModal = function(reportId) {
      window.currentRatingReportId = reportId;
      window.setRating(0); // reset
      const fb = document.getElementById('rating-feedback');
      if (fb) fb.value = '';
      const modal = document.getElementById('rating-modal');
      if (modal) modal.style.display = 'flex';
    };

    window.closeRatingModal = function() {
      const modal = document.getElementById('rating-modal');
      if (modal) modal.style.display = 'none';
      window.currentRatingReportId = null;
    };

    window.skipRating = function() {
      window.closeRatingModal();
    };

    window.submitRating = async function() {
      if (window.currentRatingScore < 1) return;
      const btn = document.getElementById('btn-submit-rating');
      btn.innerHTML = '...';
      btn.disabled = true;
      
      try {
        const firebaseConfig = {
          apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
          authDomain: "portal-c293a.firebaseapp.com",
          projectId: "portal-c293a",
          storageBucket: "portal-c293a.firebasestorage.app",
          messagingSenderId: "159583415029",
          appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
        };
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        try { initializeApp(firebaseConfig); } catch(err) {}
        const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        
        const feedback = document.getElementById('rating-feedback').value || '';
        
        await updateDoc(doc(db, "reports", window.currentRatingReportId), {
          rating: window.currentRatingScore,
          feedback: feedback
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

        // Fetch previous month's payment for same account
        let prevCharges = 0;
        let prevPaid = true;
        try {
          const paymentsQ = query(collection(db, "payments"), where("accountNumber", "==", accountNumber));
          const allPaySnap = await getDocs(paymentsQ);
          const allPays = [];
          allPaySnap.forEach(d => {
            const pd = d.data();
            allPays.push({ id: d.id, ...pd, isPaidRec: true, sortDate: pd.datePaid || pd.dateSent || '' });
          });

          // Fetch billing emails for this user
          const userStr = localStorage.getItem('clientUser');
          const userObj = userStr ? JSON.parse(userStr) : {};
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

          const currentIdx = allPays.findIndex(p => p.id === paymentDocId);
          if (currentIdx > 0) {
            prevCharges = parseFloat(String(allPays[currentIdx - 1].amount).replace(/,/g, '')) || 0;
            prevPaid = allPays[currentIdx - 1].isPaidRec;
          }
        } catch (e) { console.warn('Could not fetch previous charges:', e); }

        const currentCharges = isPaid ? 0 : amount;
        const remainingBalance = prevPaid ? 0 : prevCharges;
        const totalAmountDue = currentCharges + remainingBalance;

        const prevPaymentText = prevPaid && prevCharges > 0 ? '\u20b1' + prevCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' CR' : '\u20b10.00';

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
                    <div style="background: #1a1a1a; color: #fff; padding: 0.5rem 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Account No.</div>
                    <div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #ddd; color: #333;">${statementDateStr}</div>
                    <div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #ddd; color: #333;">${accountNumber}</div>
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
                    <span>\u20b1${prevCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #444; margin-bottom: 0.25rem; padding-left: 1rem;">
                    <span><em>Less:</em> Payments Received — ${prevPaid && prevCharges > 0 ? 'Thank You!' : 'Unpaid'}</span>
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
                    <span>\u20b1${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #1a1a1a; padding-left: 1rem; border-top: 1px solid #eee; padding-top: 0.5rem; margin-top: 0.5rem;">
                    <span><strong>Total Current Charges</strong> — <em style="font-weight: 400; color: #888;">Please pay on or before the due date</em></span>
                    <span>\u20b1${currentCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                    <span style="color: #444;">: \u20b1${prevCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
        activeBtn.style.borderColor = '#E53935';
        activeBtn.style.background = 'rgba(229,57,53,0.05)';
      }

      let html = '';
      if (method === 'gcash') {
        html = `
          <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
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
            <div>
              <div style="color: #fff; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: #007DFE;">GCash</span> Transfer
              </div>
              <div style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 0.5rem;">Scan this QR code using your GCash app to pay instantly.</div>
              <div style="color: #cbd5e1; font-size: 0.9rem;">Or send manually to: <strong style="color: #fff; letter-spacing: 1px; font-size: 1.1rem; margin-left: 0.25rem;">0917-123-4567</strong></div>
              <div style="margin-top: 1.25rem; padding: 0.6rem 1rem; background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); border-radius: 8px; display: inline-block; color: #E53935; font-size: 0.8rem; font-weight: 600;">
                <i style="margin-right:0.25rem">⚠️</i> Please include your Account Number in the message!
              </div>
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
            if (match) currentSpeed = parseInt(match[1]);

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
              const { collection: coll, getDocs: gd } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
              const billingRef = coll(db, "users", user.id, "billing_emails");
              const billingSnap = await gd(billingRef);

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
            } catch (billingErr) {
              console.error('Error fetching billing emails:', billingErr);
            }

            // ===== FETCH PAYMENT HISTORY =====
            try {
              const { collection: coll, getDocs: gd, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
              const q = query(coll(db, "payments"), where("userId", "==", user.id));
              const paySnap = await gd(q);
              
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
                      pHtml += '<td style="padding: 1rem 0; color: #94a3b8; font-size: 0.85rem;">' + (p.period || '-') + '</td>';
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
            } catch (e) { console.error('Error fetching payments:', e); }

            // Fetch Reports / Tickets
            try {
              const { collection: coll, getDocs: gd, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
              const q = query(coll(db, "reports"), where("userId", "==", user.id));
              const repSnap = await gd(q);
              
              window.clientReportsData = {};
              
              if (repSnap.empty) {
                window.renderClientReportsTable();
              } else {
                repSnap.forEach(d => {
                  window.clientReportsData[d.id] = { id: d.id, ...d.data() };
                });
                window.renderClientReportsTable();
              }
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
                <div id="ui-topbar-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #E53935; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem;">
                  ${name.charAt(0).toUpperCase()}
                </div>
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
                <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem; position: relative; overflow: hidden; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                  <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 250px; background: #E53935; border-radius: 200px 0 0 200px; transform: translateX(120px);"></div>
                  <div style="position: relative; z-index: 1;">
                    <div style="color: #E53935; font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 0.5rem; text-transform: uppercase;">Welcome Back</div>
                    <h1 id="ui-overview-welcome" style="color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.5px;">${name}</h1>
                    <p style="color: #94a3b8; font-size: 0.9rem;">Your connection, account, and support - right where you need them.</p>
                  </div>
                  <div style="position: relative; z-index: 1;">
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 0.4rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem;">
                      <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div>
                      <span style="color: #10b981; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Active</span>
                    </div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Account number</div>
                    <div id="ui-overview-acct" style="color: #fff; font-size: 1.25rem; font-weight: 600;">${acctNum}</div>
                  </div>
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Current fiber plan</div>
                    <div id="ui-overview-plan" style="color: #fff; font-size: 1.25rem; font-weight: 600;">${plan}</div>
                  </div>
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Account email</div>
                    <div id="ui-overview-email" style="color: #fff; font-size: 1.25rem; font-weight: 600; min-height: 1.5rem;">
                      <!-- Populated by JS. Might be an "Add email" link. -->
                    </div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
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
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; min-height: 200px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                      <h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0;">Announcements</h3>
                      <div id="announcements-count" style="width: 24px; height: 24px; border-radius: 50%; background: rgba(16,185,129,0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">0</div>
                    </div>
                    <div id="announcements-box" style="margin-top: 2rem; max-height: 480px; overflow-y: auto; padding-right: 0.5rem;">
                      <div style="text-align: center;">
                        <div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">There are no announcements right now.</div>
                        <button style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 2rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=\'transparent\'">
                          Need help? Contact support
                        </button>
                      </div>
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

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Current plan</div>
                    <div id="ui-billing-plan" style="color: #fff; font-size: 1.5rem; font-weight: 600;">${plan}</div>
                  </div>
                  <div style="background: #1a202c; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">Outstanding balance</div>
                    <div id="ui-billing-balance" style="color: #fff; font-size: 1.5rem; font-weight: 600;">₱${outstandingBalance}</div>
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

                  <div style="display: flex; justify-content: flex-end;">
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
                  <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 0.4rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div>
                    <span style="color: #10b981; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Active</span>
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

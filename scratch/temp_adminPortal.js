window.renderAdminLayout = (activeRoute, pageTitle, contentHtml) => {
  let isAdmin = false;
  let adminRole = 'Minimal';
  let adminName = 'Admin';
  try { 
    const u = localStorage.getItem('adminUser');
    if (u) {
      isAdmin = true; 
      const data = JSON.parse(u);
      adminRole = data.role || 'Minimal';
      adminName = data.name || 'Admin User';
    }
  } catch (e) { }

  if (!isAdmin) {
    setTimeout(() => window.router.navigate('/RFiberXAdminportal'), 0);
    return '<div style="min-height: 100vh; background: #0b0f19;"></div>';
  }

  // RBAC checks for routing
  if (adminRole === 'OJT' && ['banking', 'accounts', 'communications'].includes(activeRoute)) {
     setTimeout(() => window.router.navigate('/RFiberXAdminportal-dashboard'), 0);
     return '<div style="min-height: 100vh; background: #0b0f19;"></div>';
  }
  if (adminRole === 'Minimal' && ['dashboard', 'banking', 'reports', 'accounts', 'communications'].includes(activeRoute)) {
     return '<div style="min-height: 100vh; background: #0b0f19; color: #fff; display: flex; align-items:center; justify-content:center;">Access Denied. You have Minimal role.</div>';
  }

  const navItem = (title, route, iconSvg, isActive) => `
    <a href="#" onclick="event.preventDefault(); window.router.navigate('${route}')" style="display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1rem; border-radius: 8px; color: ${isActive ? '#fff' : '#94a3b8'}; text-decoration: none; font-size: 0.95rem; font-weight: 500; ${isActive ? 'background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2);' : 'background: transparent; border: 1px solid transparent; transition: all 0.2s;'}" onmouseover="${!isActive ? 'this.style.background=\'rgba(255,255,255,0.05)\'; this.style.color=\'#fff\'' : ''}" onmouseout="${!isActive ? 'this.style.background=\'transparent\'; this.style.color=\'#94a3b8\'' : ''}">
      <div style="width: 24px; display: flex; justify-content: center; color: ${isActive ? '#E53935' : '#64748b'};">
        ${iconSvg}
      </div>
      ${title}
    </a>
  `;

  // Icons
  const iconCommand = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
  const iconBanking = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`;
  const iconReports = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
  const iconTeam = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
  const iconComms = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;

  const currDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return `
    <div style="display: flex; min-height: 100vh; background: #0b0f19; color: #fff; font-family: 'Inter', sans-serif;">
      
      <!-- Admin Sidebar -->
      <div style="width: 260px; background: #0f131f; border-right: 1px solid rgba(255,255,255,0.05); position: fixed; top: 0; bottom: 0; left: 0; display: flex; flex-direction: column; z-index: 10; overflow-y: auto;">
        
        <div style="height: 80px; padding: 0 2rem; display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #E53935 0%, #ff5252 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(229,57,53,0.3);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
            </div>
            <span style="font-size: 1.25rem; font-weight: 800; color: #fff; letter-spacing: -0.5px;">RFiber<span style="color: #E53935;">X</span><span style="font-size: 0.75rem; font-weight: 600; color: #94a3b8; margin-left: 0.25rem; letter-spacing: 0;">ADMIN</span></span>
          </div>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; gap: 2rem;">
          <div>
            <div style="padding: 0 2rem; font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 0.75rem; text-transform: uppercase;">Core</div>
            <nav style="display: flex; flex-direction: column; gap: 0.25rem; padding: 0 1rem;">
              ${['Admin', 'Technician', 'OJT'].includes(adminRole) ? navItem('Dashboard', '/RFiberXAdminportal-dashboard', iconCommand, activeRoute === 'dashboard') : ''}
              ${['Admin', 'Technician'].includes(adminRole) ? navItem('Payment Management', '/RFiberXAdminportal-banking', iconBanking, activeRoute === 'banking') : ''}
              ${['Admin', 'Technician'].includes(adminRole) ? navItem('Reports', '/RFiberXAdminportal-reports', iconReports, activeRoute === 'reports') : ''}
            </nav>
          </div>
          <div>
            <div style="padding: 0 2rem; font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 0.75rem; text-transform: uppercase;">Administration</div>
            <nav style="display: flex; flex-direction: column; gap: 0.25rem; padding: 0 1rem;">
              ${['Admin', 'Technician'].includes(adminRole) ? navItem('Accounts & Teams', '/RFiberXAdminportal-accounts', iconTeam, activeRoute === 'accounts') : ''}
            </nav>
          </div>
          <div>
            <div style="padding: 0 2rem; font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 0.75rem; text-transform: uppercase;">Communications</div>
            <nav style="display: flex; flex-direction: column; gap: 0.25rem; padding: 0 1rem;">
              ${['Admin', 'Technician'].includes(adminRole) ? navItem('Communications', '/RFiberXAdminportal-communications', iconComms, activeRoute === 'communications') : ''}
            </nav>
          </div>
        </div>
        
        <div style="padding: 1.5rem; flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #b147ff; color: #fff; display: flex; justify-content: center; align-items: center; font-weight: 700; font-size: 1rem;">
              ${adminName.substring(0,2).toUpperCase()}
            </div>
            <div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #fff;">${adminName}</div>
              <div style="font-size: 0.7rem; color: #94a3b8;">${adminRole === 'Minimal' ? 'Unassigned' : adminRole}</div>
            </div>
          </div>
          <button onclick="window.logoutAdminEffect()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.4rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8'">
            Out
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div style="flex: 1; margin-left: 260px; display: flex; flex-direction: column; max-height: 100vh; overflow-y: auto;">
        
        <!-- Header -->
        <header style="height: 80px; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(11, 15, 25, 0.8); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 5;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <h1 style="font-size: 1.25rem; font-weight: 600; color: #fff; margin: 0; font-family: 'Outfit', sans-serif;">${pageTitle}</h1>
          </div>
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <div style="color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.02); padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${currDate}
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main style="flex: 1; padding: 2rem;">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
};

window.adminRoutes = {
  '/RFiberXAdminportal': () => {
    let html = `
      <div style="min-height: 100vh; background: #0b0f19; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; position: relative; overflow: hidden;">
        
        <div style="position: absolute; top: -100px; left: -100px; width: 400px; height: 400px; background: rgba(229, 57, 53, 0.15); filter: blur(100px); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -150px; right: -150px; width: 500px; height: 500px; background: rgba(37, 99, 235, 0.1); filter: blur(120px); border-radius: 50%;"></div>
        
        <div style="background: rgba(21, 26, 39, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); padding: 3rem; border-radius: 24px; width: 100%; max-width: 440px; position: relative; z-index: 1; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <div style="text-align: center; margin-bottom: 2.5rem;">
            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #E53935 0%, #ff5252 100%); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(229,57,53,0.35); margin-bottom: 1.5rem; position: relative;">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
               <div style="position: absolute; top: -4px; right: -4px; width: 14px; height: 14px; background: #10b981; border: 2px solid #151a27; border-radius: 50%;"></div>
            </div>
            <h1 style="font-size: 1.75rem; font-weight: 800; color: #fff; margin: 0 0 0.5rem 0; letter-spacing: -0.5px; font-family: 'Outfit', sans-serif;">System Access</h1>
            <p style="color: #94a3b8; font-size: 0.95rem; margin: 0;">Authorized personnel only</p>
          </div>

          <form id="admin-login-form" onsubmit="event.preventDefault(); window.handleAdminLogin();">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Email Address</label>
              <div style="position: relative;">
                <div style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #64748b;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <input type="email" id="admin-email" placeholder="admin@rfiberx.com" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem 1rem 1rem 3rem; border-radius: 12px; font-size: 0.95rem; outline: none; transition: all 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#E53935'; this.style.background='rgba(229,57,53,0.02)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
              </div>
            </div>

            <div style="margin-bottom: 2rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Security Key</label>
              <div style="position: relative;">
                <div style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #64748b;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <input type="password" id="admin-password" placeholder="••••••••" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem 1rem 1rem 3rem; border-radius: 12px; font-size: 0.95rem; outline: none; transition: all 0.2s; box-sizing: border-box; letter-spacing: 2px;" onfocus="this.style.borderColor='#E53935'; this.style.background='rgba(229,57,53,0.02)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
              </div>
            </div>

            <div id="admin-login-error" style="display: none; background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; padding: 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; font-weight: 500;"></div>

            <button type="submit" id="admin-login-btn" style="width: 100%; background: #E53935; color: #fff; border: none; padding: 1rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(229,57,53,0.3); display: flex; align-items: center; justify-content: center; gap: 0.5rem;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(229,57,53,0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px rgba(229,57,53,0.3)'">
              Authenticate
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </form>
          
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  },

  '/RFiberXAdminportal-dashboard': () => {
    const content = `
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">COMMAND CENTER</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #fff; font-family: 'Outfit', sans-serif;">System Overview</div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">ACTIVE CLIENTS</div>
              <div id="dash-clients" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">0</div>
            </div>
            <div style="width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3b82f6;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: #3b82f6; font-weight: 500; display: flex; align-items: center; gap: 0.25rem; margin-top: 0.5rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            Live Connections
          </div>
        </div>

        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">OVERDUE ACCOUNTS</div>
              <div id="dash-overdue" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">0</div>
            </div>
            <div style="width: 40px; height: 40px; background: rgba(229, 57, 53, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #E53935;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: #E53935; font-weight: 500; display: flex; align-items: center; gap: 0.25rem; margin-top: 0.5rem;">
             Action Required
          </div>
        </div>

        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">MONTHLY REVENUE</div>
              <div id="dash-revenue" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">₱0</div>
            </div>
            <div style="width: 40px; height: 40px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #10b981;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: #10b981; font-weight: 500; display: flex; align-items: center; gap: 0.25rem; margin-top: 0.5rem;">
             Current Month
          </div>
        </div>
      </div>

      <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; font-weight: 600; color: #fff; margin: 0;">Revenue Overview</h3>
          <div style="display: flex; gap: 1.5rem;">
            <div>
              <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.25rem;">TOTAL</div>
              <div id="rev-total" style="font-size: 1.1rem; font-weight: 600; color: #fff;">₱0</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.25rem;">THIS MONTH</div>
              <div id="rev-month" style="font-size: 1.1rem; font-weight: 600; color: #10b981;">₱0</div>
            </div>
          </div>
        </div>
        
        <div style="height: 200px; display: flex; align-items: flex-end; gap: 1rem; position: relative;">
          <!-- Chart Background Grid -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); z-index: 1;">
            <div style="position: absolute; top: 25%; left: 0; right: 0; border-top: 1px dashed rgba(255,255,255,0.05);"></div>
            <div style="position: absolute; top: 50%; left: 0; right: 0; border-top: 1px dashed rgba(255,255,255,0.05);"></div>
            <div style="position: absolute; top: 75%; left: 0; right: 0; border-top: 1px dashed rgba(255,255,255,0.05);"></div>
          </div>
          
          <!-- SVG Line -->
          <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 170px; z-index: 2; pointer-events: none;">
             <path id="rev-line" d="" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4));"></path>
          </svg>

          <!-- Bars -->
          ${Array(6).fill(0).map((_, i) => `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; z-index: 3;">
              <div id="rev-amt-${i}" style="font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.5rem; opacity: 0; transition: opacity 0.2s;" class="rev-tooltip">₱0</div>
              <div id="rev-bar-${i}" style="width: 40px; background: linear-gradient(180deg, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0.1) 100%); border-radius: 4px 4px 0 0; height: 0px; transition: height 1s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(59,130,246,0.2); border-bottom: none; cursor: pointer;" onmouseover="this.previousElementSibling.style.opacity='1'; this.style.background='linear-gradient(180deg, rgba(96,165,250,0.9) 0%, rgba(59,130,246,0.2) 100%)'" onmouseout="this.previousElementSibling.style.opacity='0'; this.style.background='linear-gradient(180deg, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0.1) 100%)'"></div>
              <div id="rev-label-${i}" style="font-size: 0.7rem; color: #64748b; margin-top: 0.5rem; font-weight: 500; height: 15px;">...</div>
            </div>
          `).join('')}
        </div>
      </div>
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" onload="if(window.initDashboard) window.initDashboard()" style="display:none;">
    `;
    return window.renderAdminLayout('dashboard', 'Command Center', content);
  },


  '/RFiberXAdminportal-banking': () => {
    const content = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">OUTSTANDING BALANCE</div>
            <div style="width: 24px; height: 24px; background: rgba(229, 57, 53, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #E53935;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></div>
          </div>
          <div id="admin-outstanding-amount" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">₱0</div>
          <div id="admin-outstanding-accounts" style="font-size: 0.7rem; color: #E53935; font-weight: 500;">Across 0 accounts</div>
          <div style="display: flex; gap: 4px; margin-top: 1rem; height: 24px; align-items: flex-end;">
            ${Array(8).fill(0).map((_, i) => `<div style="flex: 1; background: #ff4757; border-radius: 2px 2px 0 0; height: ${30 + Math.random() * 70}%; box-shadow: 0 0 8px rgba(229,57,53,0.4);"></div>`).join('')}
          </div>
        </div>

        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">TOTAL ACCOUNTS</div>
            <div style="width: 24px; height: 24px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #3b82f6;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
          </div>
          <div id="admin-total-accounts" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">0</div>
          <div style="font-size: 0.7rem; color: #3b82f6; font-weight: 500;">Active & Inactive</div>
          <div style="display: flex; gap: 4px; margin-top: 1rem; height: 24px; align-items: flex-end;">
            ${Array(8).fill(0).map((_, i) => `<div style="flex: 1; background: #3b82f6; border-radius: 2px 2px 0 0; height: ${30 + Math.random() * 70}%; box-shadow: 0 0 8px rgba(59,130,246,0.4);"></div>`).join('')}
          </div>
        </div>

        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">OVERDUE ACCOUNTS</div>
            <div style="width: 24px; height: 24px; background: rgba(245, 158, 11, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #f59e0b;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          </div>
          <div id="admin-overdue-accounts" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">0</div>
          <div style="font-size: 0.7rem; color: #f59e0b; font-weight: 500;">Needs attention</div>
          <div style="display: flex; gap: 4px; margin-top: 1rem; height: 24px; align-items: flex-end;">
            ${Array(8).fill(0).map((_, i) => `<div style="flex: 1; background: #f59e0b; border-radius: 2px 2px 0 0; height: ${30 + Math.random() * 70}%; box-shadow: 0 0 8px rgba(245,158,11,0.4);"></div>`).join('')}
          </div>
        </div>
        
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 1rem; right: 1rem; z-index: 10;">
            <select id="chart-month" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; cursor: pointer; outline: none;">
              <option value="">All Months</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="March 2026">March 2026</option>
              <option value="February 2026">February 2026</option>
              <option value="January 2026">January 2026</option>
            </select>
          </div>
          <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem; width: 100%;">ACCOUNTS STATUS</div>
          <div style="width: 100%; height: 90px; position: relative;">
            <canvas id="adminStatusChart"></canvas>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 1rem;">Billing Management</h3>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="position: relative; width: 250px;">
            <svg style="position: absolute; left: 10px; top: 10px; color: #64748b;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input id="bm-search" type="text" placeholder="Search customer name..." style="width: 100%; background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem 0.5rem 2rem; border-radius: 4px; font-size: 0.85rem; outline: none;">
          </div>
          <select id="bm-month" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; width: 140px;">
            <option value="">All Months</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="May 2026">May 2026</option>
            <option value="April 2026">April 2026</option>
            <option value="March 2026">March 2026</option>
            <option value="February 2026">February 2026</option>
            <option value="January 2026">January 2026</option>
          </select>
          <select id="bm-plan" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; width: 140px;">
            <option value="">All Plans</option>
            <option value="30Mbps">30Mbps</option>
            <option value="50Mbps">50Mbps</option>
            <option value="70Mbps">70Mbps</option>
            <option value="100Mbps">100Mbps</option>
            <option value="200Mbps">200Mbps</option>
          </select>
          <select id="bm-status" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; width: 120px;">
            <option value="">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; text-align: left;">
          <thead>
            <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
              <th style="padding: 1rem;">BILL ID</th>
              <th style="padding: 1rem;">CUSTOMER</th>
              <th style="padding: 1rem;">ACCOUNT #</th>
              <th style="padding: 1rem;">MONTH</th>
              <th style="padding: 1rem;">PLAN</th>
              <th style="padding: 1rem;">AMOUNT</th>
              <th style="padding: 1rem;">DUE DATE</th>
              <th style="padding: 1rem;">STATUS</th>
              <th style="padding: 1rem;">RECEIPT</th>
            </tr>
          </thead>
          <tbody id="bm-tbody">
            <tr><td colspan="8" style="padding: 1rem; color: #fff; text-transform: none; text-align: center;">Loading bills...</td></tr>
          </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 style="font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">Payment History</h3>
        <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1rem;">Completed customer payments appear here automatically with their selected payment method.</p>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="position: relative; width: 250px;">
            <svg style="position: absolute; left: 10px; top: 10px; color: #64748b;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input id="ph-search" type="text" placeholder="Search customer name..." style="width: 100%; background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem 0.5rem 2rem; border-radius: 4px; font-size: 0.85rem; outline: none;">
          </div>
          <select id="ph-month" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; width: 140px;">
            <option value="">All Months</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="May 2026">May 2026</option>
            <option value="April 2026">April 2026</option>
            <option value="March 2026">March 2026</option>
            <option value="February 2026">February 2026</option>
            <option value="January 2026">January 2026</option>
          </select>
          <select id="ph-plan" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; width: 140px;">
            <option value="">All Plans</option>
            <option value="30Mbps">30Mbps</option>
            <option value="50Mbps">50Mbps</option>
            <option value="70Mbps">70Mbps</option>
            <option value="100Mbps">100Mbps</option>
            <option value="200Mbps">200Mbps</option>
          </select>
        </div>
        <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; max-height: 480px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; text-align: left;">
          <thead>
            <tr style="background: rgba(15, 19, 31, 0.95); border-bottom: 1px solid rgba(255,255,255,0.05); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(4px);">
              <th style="padding: 1rem;">PAYMENT ID</th>
              <th style="padding: 1rem;">CUSTOMER</th>
              <th style="padding: 1rem;">ACCOUNT #</th>
              <th style="padding: 1rem;">MONTH</th>
              <th style="padding: 1rem;">PLAN</th>
              <th style="padding: 1rem;">AMOUNT</th>
              <th style="padding: 1rem;">PAYMENT METHOD</th>
              <th style="padding: 1rem;">DATE PAID</th>
              <th style="padding: 1rem;">STATUS</th>
              <th style="padding: 1rem;">RECEIPT</th>
            </tr>
          </thead>
          <tbody id="ph-tbody">
            <tr><td colspan="10" style="padding: 1rem; color: #fff; text-transform: none; text-align: center;">Loading payments...</td></tr>
          </tbody>
          </table>
        </div>
      </div>
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" onload="if(window.initAdminBanking) window.initAdminBanking()" style="display:none;">
    `;
    return window.renderAdminLayout('banking', 'Portal Banking', content);
  },

  '/RFiberXAdminportal-reports': () => {
    const content = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
           <div style="font-size: 0.7rem; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">REPORTS CENTER</div>
           <div style="font-size: 1.5rem; font-weight: 700; color: #fff; font-family: 'Outfit', sans-serif;">Analytics & exports</div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
           <button style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=\'transparent\'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Full Report</button>
           <button style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=\'transparent\'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Technicians</button>
           <button style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=\'transparent\'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg> Ratings</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">TOTAL TICKETS</div>
          <div id="admin-total-tickets" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">0</div>
          <div style="font-size: 0.7rem; color: #fff; font-weight: 500;">All service requests</div>
          <div style="display: flex; gap: 4px; margin-top: 1rem; height: 24px; align-items: flex-end;">
            ${Array(12).fill(0).map((_, i) => `<div style="flex: 1; background: #00E5FF; border-radius: 2px 2px 0 0; height: ${30 + Math.random() * 70}%; box-shadow: 0 0 8px rgba(0,229,255,0.4);"></div>`).join('')}
          </div>
        </div>

        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">RESOLVED</div>
          <div id="admin-resolved-tickets" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">0</div>
          <div style="font-size: 0.7rem; color: #fff; font-weight: 500;">Completed support work</div>
          <div style="display: flex; gap: 4px; margin-top: 1rem; height: 24px; align-items: flex-end;">
            ${Array(12).fill(0).map((_, i) => `<div style="flex: 1; background: #10b981; border-radius: 2px 2px 0 0; height: ${30 + Math.random() * 70}%; box-shadow: 0 0 8px rgba(16,185,129,0.4);"></div>`).join('')}
          </div>
        </div>

        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">SERVICE RATE</div>
          <div id="admin-service-rate" style="font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">0.0 ★</div>
          <div style="font-size: 0.7rem; color: #fff; font-weight: 500;">Average rating out of 5</div>
          <div style="display: flex; gap: 4px; margin-top: 1rem; height: 24px; align-items: flex-end;">
            ${Array(12).fill(0).map((_, i) => `<div style="flex: 1; background: #fbbf24; border-radius: 2px 2px 0 0; height: ${30 + Math.random() * 70}%; box-shadow: 0 0 8px rgba(251,191,36,0.4);"></div>`).join('')}
          </div>
        </div>
      </div>
      
      <div style="margin-top: 2rem; background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Client Service Requests</h3>
            <div id="admin-table-ticket-count" style="background: rgba(16,185,129,0.1); color: #10b981; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">0</div>
          </div>
          <div style="display: flex; gap: 1rem;">
            <input type="text" id="admin-reports-search" placeholder="Search client name..." style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; outline: none;" onkeyup="if(window.renderAdminReportsTable) window.renderAdminReportsTable()">
            <select id="admin-reports-filter" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; outline: none; cursor: pointer;" onchange="if(window.renderAdminReportsTable) window.renderAdminReportsTable()">
              <option value="All" style="background: #151a27; color: #fff;">All Statuses</option>
              <option value="Pending" style="background: #151a27; color: #fff;">Pending</option>
              <option value="Read" style="background: #151a27; color: #fff;">Read</option>
              <option value="Fixed" style="background: #151a27; color: #fff;">Fixed</option>
            </select>
          </div>
        </div>
        <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem;">
            <thead>
              <tr style="background: rgba(15, 19, 31, 0.95); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <th style="padding: 1rem; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Report ID</th>
                <th style="padding: 1rem; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Customer Info</th>
                <th style="padding: 1rem; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Subject</th>
                <th style="padding: 1rem; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Category</th>
                <th style="padding: 1rem; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Status</th>
              </tr>
            </thead>
            <tbody id="admin-reports-tbody">
              <tr><td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">Loading reports...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Ticket Details Modal -->
      <div id="admin-ticket-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center;">
        <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 600px; max-width: 90%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: #151a27;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h2 style="color: #fff; font-size: 1.25rem; font-weight: 600; margin: 0;">Ticket Details</h2>
              <span id="modal-ticket-id" style="background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; color: #94a3b8; font-family: monospace; font-size: 0.75rem;"></span>
            </div>
            <button onclick="window.closeAdminReport()" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#64748b'">&times;</button>
          </div>
          <!-- Body -->
          <div style="padding: 1.5rem; overflow-y: auto; flex: 1;">
            <!-- Customer Info -->
            <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem;">
              <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 1rem;">Customer Details</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Name & Account</div>
                  <div id="modal-ticket-name" style="color: #fff; font-weight: 600; font-size: 0.95rem;"></div>
                  <div id="modal-ticket-account" style="color: #cbd5e1; font-size: 0.85rem;"></div>
                </div>
                <div>
                  <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Contact Info</div>
                  <div id="modal-ticket-phone" style="color: #fff; font-size: 0.85rem;"></div>
                  <div id="modal-ticket-fb" style="color: #cbd5e1; font-size: 0.85rem;"></div>
                </div>
                <div>
                  <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Plan</div>
                  <div id="modal-ticket-plan" style="color: #fff; font-size: 0.85rem;"></div>
                </div>
                <div>
                  <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.25rem;">Location</div>
                  <div id="modal-ticket-address" style="color: #fff; font-size: 0.85rem; line-height: 1.4;"></div>
                </div>
              </div>
            </div>
            
            <!-- Issue Details -->
            <div style="margin-bottom: 1rem;">
              <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Issue Details</div>
              <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1rem;">
                  <span id="modal-ticket-category" style="background: rgba(59,130,246,0.1); color: #3b82f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; white-space: nowrap;"></span>
                  <div id="modal-ticket-subject" style="color: #fff; font-size: 1rem; font-weight: 600; line-height: 1.4;"></div>
                </div>
                <div id="modal-ticket-desc" style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap;"></div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
              <div style="font-size: 0.75rem; color: #64748b;">Submitted: <span id="modal-ticket-date"></span></div>
              <div id="modal-ticket-status-badge"></div>
            </div>
          </div>
        </div>
      </div>
      
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" onload="if(window.initAdminReports) window.initAdminReports()" style="display:none;">
    `;
    return window.renderAdminLayout('reports', 'Reports', content);
  },

  '/RFiberXAdminportal-accounts': () => {
    const content = `
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" onload="window.initAdminAccounts()" style="display:none;">
      <div style="margin-bottom: 1.5rem;">
         <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">ADMINISTRATION</div>
         <div style="font-size: 1.5rem; font-weight: 700; color: #fff; font-family: 'Outfit', sans-serif;">Accounts & team</div>
      </div>

      <!-- Metrics Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">TOTAL ACCOUNTS</div>
          <div id="metric-total-clients" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">Active client connections</div>
        </div>
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">PLAN DISTRIBUTION</div>
            <div id="metric-plan-legend">
              <div style="font-size: 0.75rem; color: #64748b;">Loading...</div>
            </div>
          </div>
          <div id="metric-plan-donut-container" style="width: 70px; height: 70px; position: relative;"></div>
        </div>
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;">STAFF ACCOUNTS</div>
          <div id="metric-total-staff" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">Technicians & Administrators</div>
        </div>
      </div>

      <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 0.25rem;">Add Staff Account</h3>
        <p style="color: #64748b; font-size: 0.8rem; margin-bottom: 1rem;">Create login access for staff dashboard users</p>
        <div id="add-staff-msg" style="display:none; padding:0.5rem; border-radius:4px; font-size:0.8rem; font-weight:600; margin-bottom:1rem;"></div>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="add-staff-name" placeholder="Full Name" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1rem; border-radius: 4px; font-size: 0.8rem; flex: 1;">
          <input type="email" id="add-staff-email" placeholder="Email" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1rem; border-radius: 4px; font-size: 0.8rem; flex: 1;">
          <input type="text" id="add-staff-phone" placeholder="Phone Number" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1rem; border-radius: 4px; font-size: 0.8rem; flex: 1;">
          <input type="text" id="add-staff-password" placeholder="Password" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1rem; border-radius: 4px; font-size: 0.8rem; flex: 1;">
          <button id="add-staff-btn" onclick="window.submitNewStaffAccount()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; width: 120px; cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">Add Staff</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        
        <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
              <h3 style="font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 0.25rem;">Clients</h3>
              <p id="admin-clients-count" style="color: #64748b; font-size: 0.75rem; margin: 0;">0 customer accounts</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="admin-clients-search" placeholder="Search by name, email, or acct #..." style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.8rem; width: 250px; outline: none;" onkeyup="window.renderAdminClientsTable()">
              <select id="admin-clients-plan-filter" style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.8rem; outline: none; cursor: pointer;" onchange="window.renderAdminClientsTable()">
                <option value="All">All Plans</option>
                <option value="30Mbps">30Mbps</option>
                <option value="50Mbps">50Mbps</option>
                <option value="70Mbps">70Mbps</option>
                <option value="100Mbps">100Mbps</option>
                <option value="200Mbps">200Mbps</option>
              </select>
            </div>
          </div>
          <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden;">
            <div style="max-height: 400px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; text-align: left;">
                <thead style="position: sticky; top: 0; background: #0f131f; z-index: 10;">
                  <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <th style="padding: 1rem;">ID</th><th style="padding: 1rem;">NAME</th><th style="padding: 1rem;">EMAIL</th><th style="padding: 1rem;">ACCOUNT #</th><th style="padding: 1rem;">PLAN</th>
                  </tr>
                </thead>
                <tbody id="admin-clients-tbody">
                  <tr><td colspan="5" style="padding: 1rem; color: #fff; text-transform: none;">Loading clients...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem;">
        <h3 style="font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 0.25rem;">Technician Management</h3>
        <p id="admin-technician-count" style="color: #64748b; font-size: 0.8rem; margin-bottom: 1rem;">0 records</p>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <input type="text" id="admin-technician-search" onkeyup="window.filterAdminAccounts()" placeholder="Search Name..." style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1rem; border-radius: 4px; font-size: 0.8rem; flex: 1;">
        </div>
        <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; text-align: left;">
              <thead>
                <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <th style="padding: 1rem;">ID</th><th style="padding: 1rem;">TECHNICIAN</th><th style="padding: 1rem;">CONTACT</th><th style="padding: 1rem;">EMAIL</th><th style="padding: 1rem;">ROLE</th>
                </tr>
              </thead>
              <tbody id="admin-technician-tbody">
                <tr><td colspan="5" style="padding: 1rem; color: #fff; text-transform: none;">Loading technicians...</td></tr>
              </tbody>
            </table>
          </div>
      </div>
      
      <!-- Admin Account Modal -->
      <div id="admin-account-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center;">
        <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 500px; max-width: 90%; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(59,130,246,0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <h2 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0; font-family: 'Outfit', sans-serif;">Account Details</h2>
                <div style="color: #94a3b8; font-size: 0.75rem;">Technician / Admin Information</div>
              </div>
            </div>
            <button onclick="window.closeAdminAccountModal()" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.5rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#64748b'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <!-- Body -->
          <div style="padding: 1.5rem;">
            <input type="hidden" id="modal-account-id-hidden">
            <div id="modal-account-update-msg" style="display:none; padding:0.75rem; border-radius:6px; margin-bottom:1rem; font-size:0.8rem; font-weight:600;"></div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
              <div>
                <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">ID (Unchangeable)</label>
                <div id="modal-account-id" style="color: #94a3b8; font-size: 0.9rem; font-weight: 500;">-</div>
              </div>
              <div>
                <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Technician Name</label>
                <input type="text" id="modal-account-name" oninput="window.checkAdminStaffChanges()" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; outline: none;">
              </div>
              <div>
                <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Email</label>
                <input type="email" id="modal-account-email" oninput="window.checkAdminStaffChanges()" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; outline: none;">
              </div>
              <div>
                <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Contact Number</label>
                <input type="text" id="modal-account-contact" oninput="window.checkAdminStaffChanges()" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; outline: none;">
              </div>
              <div style="grid-column: span 2;">
                <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Password</label>
                <input type="text" id="modal-account-password" oninput="window.checkAdminStaffChanges()" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem; outline: none;">
              </div>
            </div>

            <!-- Roles Section -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem;">
              <div style="font-size: 0.75rem; font-weight: 600; color: #fff; margin-bottom: 0.75rem;">Assigned Roles</div>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span id="role-badge-admin" style="background: rgba(255,255,255,0.05); color: #64748b; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;">Admin</span>
                <span id="role-badge-technician" style="background: rgba(255,255,255,0.05); color: #64748b; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;">Technician</span>
                <span id="role-badge-ojt" style="background: rgba(255,255,255,0.05); color: #64748b; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;">OJT</span>
                <span id="role-badge-minimal" style="background: rgba(255,255,255,0.05); color: #64748b; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;">Minimal</span>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 1.25rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button onclick="window.closeAdminAccountModal()" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">Cancel</button>
            <button id="modal-account-update-btn" onclick="window.requestAdminStaffUpdate()" style="background: #3b82f6; color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Update Staff</button>
          </div>
        </div>
      </div>

      <!-- Client Details Modal -->
      <div id="admin-client-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center;">
        <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 600px; max-width: 95%; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(16,185,129,0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <h2 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0; font-family: 'Outfit', sans-serif;">Client Details</h2>
                <div style="color: #94a3b8; font-size: 0.75rem;">Customer Account Information</div>
              </div>
            </div>
            <button onclick="window.closeAdminClientModal()" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.5rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#64748b'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <!-- Body -->
          <div style="padding: 1.5rem; max-height: 60vh; overflow-y: auto;">
            <input type="hidden" id="modal-client-id-hidden">
            <div id="modal-client-update-msg" style="display:none; padding:0.75rem; border-radius:6px; margin-bottom:1rem; font-size:0.8rem; font-weight:600;"></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
              <div>
                <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Name</div>
                <div id="modal-client-name" style="color: #fff; font-size: 0.9rem; font-weight: 500;">-</div>
              </div>
              <div>
                <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Email</div>
                <div id="modal-client-email" style="color: #fff; font-size: 0.9rem; font-weight: 500;">-</div>
              </div>
              <div>
                <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Account Number</div>
                <div id="modal-client-acct" style="color: #fff; font-size: 0.9rem; font-weight: 500;">-</div>
              </div>
              <div>
                <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Address</div>
                <div id="modal-client-address" style="color: #fff; font-size: 0.9rem; font-weight: 500;">-</div>
              </div>
              <div>
                <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Facebook</div>
                <div id="modal-client-fb" style="color: #fff; font-size: 0.9rem; font-weight: 500;">-</div>
              </div>
              <div>
                <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem;">Phone Number</div>
                <div id="modal-client-phone" style="color: #fff; font-size: 0.9rem; font-weight: 500;">-</div>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1.5rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px;">Editable Details</div>
              <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600;">Plan</label>
                  <select id="modal-client-plan-input" onchange="window.handleAdminClientPlanChange()" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; outline: none; cursor: pointer;">
                    <option value="30Mbps">30Mbps - Starter RFiberX</option>
                    <option value="50Mbps">50Mbps - Value RFiberX</option>
                    <option value="70Mbps">70Mbps - Family RFiberX</option>
                    <option value="100Mbps">100Mbps - Pro RFiberX</option>
                    <option value="200Mbps">200Mbps - Extreme RFiberX</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600;">Amount</label>
                  <input type="text" id="modal-client-amount-input" oninput="window.checkAdminClientChanges()" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; outline: none;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600;">Password</label>
                  <input type="text" id="modal-client-password-input" oninput="window.checkAdminClientChanges()" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; outline: none;">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 1.25rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button onclick="window.closeAdminClientModal()" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">Cancel</button>
            <button id="modal-client-update-btn" onclick="window.requestAdminClientUpdate()" style="background: #10b981; color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">Update Client</button>
          </div>
        </div>
      </div>

      <!-- Admin Confirm Modal -->
      <div id="admin-confirm-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center;">
        <div style="background: #0f131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 400px; max-width: 90%; padding: 1.5rem; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="width: 48px; height: 48px; background: rgba(245,158,11,0.1); color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Confirm Update</h3>
          <p id="admin-confirm-msg" style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">Are you sure you want to update this section?</p>
          <div style="display: flex; justify-content: center; gap: 0.75rem;">
            <button onclick="document.getElementById('admin-confirm-modal').style.display='none'" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">Cancel</button>
            <button id="admin-confirm-proceed-btn" style="background: #f59e0b; color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">Proceed</button>
          </div>
        </div>
      </div>
    `;
    return window.renderAdminLayout('accounts', 'Accounts & team', content);
  },

  '/RFiberXAdminportal-communications': () => {
    // Send billing email function
    window.sendBillingEmail = async function () {
      const acctInput = document.getElementById('comm-acct-number');
      const statusEl = document.getElementById('comm-status');
      const sendBtn = document.getElementById('comm-send-btn');
      const accountNumber = acctInput ? acctInput.value.trim() : '';

      if (!accountNumber) {
        statusEl.innerHTML = '<div style="background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">Please enter an account number.</div>';
        return;
      }

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
      statusEl.innerHTML = '';

      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, query, where, getDocs, addDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const firebaseConfig = {
          apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
          authDomain: "portal-c293a.firebaseapp.com",
          projectId: "portal-c293a",
          storageBucket: "portal-c293a.firebasestorage.app",
          messagingSenderId: "159583415029",
          appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
        };

        let app;
        try { app = initializeApp(firebaseConfig); } catch (e) { }
        const db = getFirestore();

        // Query the users collection by accountNumber
        const q = query(collection(db, "users"), where("accountNumber", "==", accountNumber));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          statusEl.innerHTML = '<div style="background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">No user found with account number: <strong>' + accountNumber + '</strong></div>';
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send Billing Statement';
          return;
        }

        // Get the first matching user
        let userId = null;
        let userData = null;
        snapshot.forEach(docSnap => {
          if (!userId) {
            userId = docSnap.id;
            userData = docSnap.data();
          }
        });

        const now = new Date();
        const billingMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 7); // 7th day of the current month
        const dueDateStr = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        let newBillId = '';
        for (let d = 0; d < 12; d++) {
          newBillId += Math.floor(Math.random() * 10).toString();
        }
        if (newBillId.charAt(0) === '0') newBillId = (Math.floor(Math.random() * 9) + 1).toString() + newBillId.substring(1);

        // Create a billing email document inside the user's billing_emails sub-collection
        const billingEmailData = {
          billId: newBillId,
          accountNumber: userData.accountNumber || accountNumber,
          plan: userData.Plan || userData.plan || '',
          amount: userData.ammount || userData.amount || '0',
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          facebook: userData.facebook || '',
          address: '',
          billingMonth: billingMonth,
          dueDate: dueDateStr,
          dateSent: now.toISOString(),
          status: 'unread',
          type: 'billing_statement'
        };

        // Add to sub-collection: users/{userId}/billing_emails
        const billingRef = collection(db, "users", userId, "billing_emails");
        await addDoc(billingRef, billingEmailData);

        statusEl.innerHTML = '<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; padding: 1rem; border-radius: 8px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.75rem;"><div style="width: 20px; height: 20px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.7rem; flex-shrink: 0;">✓</div> Billing statement sent to <strong>' + (userData.name || accountNumber) + '</strong> (₱' + billingEmailData.amount + ' - ' + billingMonth + ')</div>';

        // Append to the sent log table
        const logBody = document.getElementById('comm-log-body');
        if (logBody) {
          const noRowsMsg = logBody.querySelector('.no-rows');
          if (noRowsMsg) noRowsMsg.remove();

          logBody.innerHTML = '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 0.75rem 1rem; color: #fff; font-size: 0.85rem;">' + (userData.name || '-') + '</td><td style="padding: 0.75rem 1rem; color: #94a3b8; font-size: 0.85rem;">' + accountNumber + '</td><td style="padding: 0.75rem 1rem; color: #fff; font-size: 0.85rem;">' + (billingEmailData.plan || '-') + '</td><td style="padding: 0.75rem 1rem; color: #fff; font-size: 0.85rem;">₱' + billingEmailData.amount + '</td><td style="padding: 0.75rem 1rem; color: #94a3b8; font-size: 0.85rem;">' + billingMonth + '</td><td style="padding: 0.75rem 1rem; color: #94a3b8; font-size: 0.85rem;">' + dueDateStr + '</td><td style="padding: 0.75rem 1rem;"><span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">Sent</span></td></tr>' + logBody.innerHTML;
        }

        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Billing Statement';
      } catch (err) {
        console.error('Error sending billing email:', err);
        statusEl.innerHTML = '<div style="background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">Error: ' + err.message + '</div>';
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Billing Statement';
      }
    };

    const content = `
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">COMMUNICATIONS CENTER</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #fff; font-family: 'Outfit', sans-serif;">Billing Statements & Notifications</div>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.25rem;">Send billing statements directly to client accounts. Statements will appear in their portal dashboard.</p>
      </div>

      <!-- Send Billing Email Section -->
      <div style="background: #151a27; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
          <div style="width: 36px; height: 36px; background: rgba(229,57,53,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #E53935;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <div>
            <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Send Billing Statement</h3>
            <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Generate and send a monthly billing statement to a client's portal</p>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 250px;">
            <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Account Number</label>
            <input type="text" id="comm-acct-number" value="lWKJ-opsJ-N3iD" placeholder="e.g. lWKJ-opsJ-N3iD" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; font-family: 'JetBrains Mono', monospace, 'Inter', sans-serif; letter-spacing: 0.5px;" onfocus="this.style.borderColor='#E53935'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
          </div>
          <button id="comm-send-btn" onclick="window.sendBillingEmail()" style="background: #E53935; color: #fff; border: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(229,57,53,0.3); white-space: nowrap; display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#d32f2f'" onmouseout="this.style.background='#E53935'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            Send Billing Statement
          </button>
        </div>

        <div id="comm-status" style="margin-top: 1rem;"></div>

        <div style="margin-top: 3rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f59e0b;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Maintenance Advisory</h3>
              <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Send outage or maintenance announcements to clients</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Method</label>
               <select id="comm-advisory-type" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="Email">Email Broadcast</option>
                 <option value="Messenger">Messenger Chat</option>
               </select>
             </div>
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Target Audience</label>
               <select id="comm-advisory-target" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="All">All Active Clients</option>
                 <option value="Affected">Affected Area Only</option>
               </select>
             </div>
             <div style="grid-column: span 2;">
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Advisory Message</label>
               <textarea id="comm-advisory-msg" rows="4" placeholder="Enter the maintenance details..." style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
             </div>
          </div>
          <button id="comm-advisory-btn" onclick="window.sendMaintenanceAdvisory()" style="background: #f59e0b; color: #000; border: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(245,158,11,0.3); display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
            Send Advisory
          </button>
          <div id="comm-advisory-status"></div>
        </div>

        <div style="margin-top: 3rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f59e0b;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Maintenance Advisory</h3>
              <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Send outage or maintenance announcements to clients</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Method</label>
               <select id="comm-advisory-type" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="Email">Email Broadcast</option>
                 <option value="Messenger">Messenger Chat</option>
               </select>
             </div>
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Target Audience</label>
               <select id="comm-advisory-target" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="All">All Active Clients</option>
                 <option value="Affected">Affected Area Only</option>
               </select>
             </div>
             <div style="grid-column: span 2;">
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Advisory Message</label>
               <textarea id="comm-advisory-msg" rows="4" placeholder="Enter the maintenance details..." style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
             </div>
          </div>
          <button id="comm-advisory-btn" onclick="window.sendMaintenanceAdvisory()" style="background: #f59e0b; color: #000; border: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(245,158,11,0.3); display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
            Send Advisory
          </button>
          <div id="comm-advisory-status"></div>
        </div>

        <div style="margin-top: 3rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f59e0b;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Maintenance Advisory</h3>
              <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Send outage or maintenance announcements to clients</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Method</label>
               <select id="comm-advisory-type" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="Email">Email Broadcast</option>
                 <option value="Messenger">Messenger Chat</option>
               </select>
             </div>
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Target Audience</label>
               <select id="comm-advisory-target" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="All">All Active Clients</option>
                 <option value="Affected">Affected Area Only</option>
               </select>
             </div>
             <div style="grid-column: span 2;">
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Advisory Message</label>
               <textarea id="comm-advisory-msg" rows="4" placeholder="Enter the maintenance details..." style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
             </div>
          </div>
          <button id="comm-advisory-btn" onclick="window.sendMaintenanceAdvisory()" style="background: #f59e0b; color: #000; border: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(245,158,11,0.3); display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
            Send Advisory
          </button>
          <div id="comm-advisory-status"></div>
        </div>

        <div style="margin-top: 3rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f59e0b;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Maintenance Advisory</h3>
              <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Send outage or maintenance announcements to clients</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Method</label>
               <select id="comm-advisory-type" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="Email">Email Broadcast</option>
                 <option value="Messenger">Messenger Chat</option>
               </select>
             </div>
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Target Audience</label>
               <select id="comm-advisory-target" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="All">All Active Clients</option>
                 <option value="Affected">Affected Area Only</option>
               </select>
             </div>
             <div style="grid-column: span 2;">
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Advisory Message</label>
               <textarea id="comm-advisory-msg" rows="4" placeholder="Enter the maintenance details..." style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
             </div>
          </div>
          <button id="comm-advisory-btn" onclick="window.sendMaintenanceAdvisory()" style="background: #f59e0b; color: #000; border: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(245,158,11,0.3); display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
            Send Advisory
          </button>
          <div id="comm-advisory-status"></div>
        </div>

        <div style="margin-top: 3rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f59e0b;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0;">Maintenance Advisory</h3>
              <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Send outage or maintenance announcements to clients</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Method</label>
               <select id="comm-advisory-type" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="Email">Email Broadcast</option>
                 <option value="Messenger">Messenger Chat</option>
               </select>
             </div>
             <div>
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Target Audience</label>
               <select id="comm-advisory-target" style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; cursor:pointer;">
                 <option value="All">All Active Clients</option>
                 <option value="Affected">Affected Area Only</option>
               </select>
             </div>
             <div style="grid-column: span 2;">
               <label style="display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase;">Advisory Message</label>
               <textarea id="comm-advisory-msg" rows="4" placeholder="Enter the maintenance details..." style="width: 100%; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.95rem; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
             </div>
          </div>
          <button id="comm-advisory-btn" onclick="window.sendMaintenanceAdvisory()" style="background: #f59e0b; color: #000; border: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(245,158,11,0.3); display: flex; align-items: center; gap: 0.5rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
            Send Advisory
          </button>
          <div id="comm-advisory-status"></div>
        </div>
      </div>
      </div>
    `;
    return window.renderAdminLayout('communications', 'Communications', content);
  }
};
window._getAdminDb = async function() {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
  const firestore = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const firebaseConfig = {
    apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
    authDomain: "portal-c293a.firebaseapp.com",
    projectId: "portal-c293a",
    storageBucket: "portal-c293a.firebasestorage.app",
    messagingSenderId: "159583415029",
    appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
  };
  let app;
  try { app = initializeApp(firebaseConfig); } catch (e) { }
  return { db: firestore.getFirestore(), firestore };
};

window.logoutAdminEffect = function() {
  localStorage.removeItem('adminUser');
  window.router.navigate('/RFiberXAdminportal');
};

window.handleAdminLogin = async function() {
  const email = document.getElementById('admin-email').value.trim();
  const pass = document.getElementById('admin-password').value.trim();
  const errEl = document.getElementById('admin-login-error');
  const btn = document.getElementById('admin-login-btn');
  
  if(!email || !pass) return;
  
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = 'Authenticating...';
  
  try {
    // Special Owner override
    if (email === 'rfiberxowner@rfiberx.net' && pass === 'owner') {
      localStorage.setItem('adminUser', JSON.stringify({ email: email, role: 'Admin', name: 'Owner', id: 'owner-01' }));
      setTimeout(() => window.router.navigate('/RFiberXAdminportal-dashboard'), 500);
      return;
    }
    
    // Normal auth flow
    const { db, firestore } = await window._getAdminDb();
    const q = firestore.query(firestore.collection(db, "admin"), firestore.where("email", "==", email));
    const snap = await firestore.getDocs(q);
    
    if (snap.empty) {
      throw new Error("Invalid credentials");
    }
    
    const doc = snap.docs[0];
    const data = doc.data();
    
    if (data.password !== pass) {
      throw new Error("Invalid credentials");
    }
    
    localStorage.setItem('adminUser', JSON.stringify({
      email: data.email,
      role: data.role || 'Minimal',
      name: data.name || 'Staff User',
      id: doc.id
    }));
    
    setTimeout(() => window.router.navigate('/RFiberXAdminportal-dashboard'), 500);
    
  } catch (err) {
    errEl.style.display = 'block';
    errEl.innerText = err.message;
    btn.disabled = false;
    btn.innerHTML = 'Authenticate <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
  }
};


window.initDashboard = async function () {
  try {
    const { db, firestore } = await window._getAdminDb();
    const { collection, collectionGroup, getDocs } = firestore;

    const dashClients = document.getElementById('dash-clients');
    const dashOverdue = document.getElementById('dash-overdue');
    const dashRevenue = document.getElementById('dash-revenue');
    
    // Fetch total users
    const usersSnap = await getDocs(collection(db, "users"));
    if (dashClients) dashClients.innerText = usersSnap.size;

    // Fetch overdue accounts
    const billsSnap = await getDocs(collectionGroup(db, "billing_emails"));
    const overdueSet = new Set();
    billsSnap.docs.forEach(d => {
      const b = d.data();
      if (b.status && b.status.toLowerCase() === 'overdue' && b.accountNumber) {
        overdueSet.add(b.accountNumber);
      }
    });
    if (dashOverdue) dashOverdue.innerText = overdueSet.size;

    // Fetch revenue from payments (Past 6 months)
    const paymentsSnap = await getDocs(collection(db, "payments"));
    const monthlyRevenue = {};
    const monthKeys = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const k = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      monthKeys.push(k);
      monthlyRevenue[k] = 0;
    }
    const thisMonthKey = monthKeys[0];
    let thisMonthRev = 0;

    paymentsSnap.docs.forEach(d => {
      const p = d.data();
      const amt = parseFloat(p.amount) || 0;
      
      let pDate;
      if (p.timestamp && p.timestamp.toDate) {
        pDate = p.timestamp.toDate();
      } else if (p.datePaid) {
        pDate = new Date(p.datePaid);
      } else if (p.date) {
        pDate = new Date(p.date);
      }
      
      if (pDate && !isNaN(pDate)) {
        const pk = pDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        if (monthlyRevenue[pk] !== undefined) {
          monthlyRevenue[pk] += amt;
        }
        if (pk === thisMonthKey) {
          thisMonthRev += amt;
        }
      }
    });

    if (dashRevenue) dashRevenue.innerText = '₱' + thisMonthRev.toLocaleString();

    // Chart processing
    let maxRev = 1; // Prevent division by zero
    for (const mk of monthKeys) {
      if (monthlyRevenue[mk] > maxRev) maxRev = monthlyRevenue[mk];
    }
    
    const points = [];
    const numBars = 6;
    
    for (let bi = 0; bi < numBars; bi++) {
      const uiIndex = 5 - bi; 
      const labelEl = document.getElementById('rev-label-' + uiIndex);
      const barEl = document.getElementById('rev-bar-' + uiIndex);
      const amtEl = document.getElementById('rev-amt-' + uiIndex);
      
      const mk = monthKeys[bi];
      const monthName = mk.split(' ')[0].substring(0, 3);
      const mAmt = monthlyRevenue[mk];
      
      if (labelEl) labelEl.innerText = monthName;
      if (amtEl) amtEl.innerText = '₱' + mAmt.toLocaleString();
      
      const hPct = mAmt > 0 ? (mAmt / maxRev) : 0;
      // Height for bar graph (percentage based)
      const barH = hPct > 0 ? Math.max(2, Math.round(hPct * 100)) : 0;
      if (barEl) barEl.style.height = barH + '%';
      
      // Calculate coordinates for the line graph
      const chartHeight = 220; // Matches CSS height of container
      const y = hPct > 0 ? chartHeight - (hPct * chartHeight) : chartHeight;
      points.push({x: uiIndex, y: y});
    }
    
    const svgLine = document.getElementById('rev-line');
    if (svgLine) {
      points.sort((a,b) => a.x - b.x);
      const w = svgLine.parentElement.clientWidth || 1000;
      // We have 6 flex columns. The center of each column is at (1/12 + i/6) * w
      const gap = w / 6;
      const dPath = points.map((p, i) => {
        const x = gap/2 + (p.x * gap);
        // Show point circle
        const circle = document.getElementById('rev-point-' + p.x);
        if(circle) {
          circle.setAttribute('cx', x);
          circle.setAttribute('cy', p.y);
          circle.style.display = 'block';
        }
        return `${i === 0 ? 'M' : 'L'}${x},${p.y}`;
      }).join(' ');
      svgLine.setAttribute('d', dPath);
      
      // Also update on resize to keep SVG coordinates accurate
      window.addEventListener('resize', () => {
        const newW = svgLine.parentElement.clientWidth || 1000;
        const newGap = newW / 6;
        const newPath = points.map((p, i) => {
          const nx = newGap/2 + (p.x * newGap);
          const c = document.getElementById('rev-point-' + p.x);
          if(c) c.setAttribute('cx', nx);
          return `${i === 0 ? 'M' : 'L'}${nx},${p.y}`;
        }).join(' ');
        svgLine.setAttribute('d', newPath);
      });
    }
    
  } catch (err) {
    console.error('Init Dashboard error:', err);
  }
};



window.initAdminBanking = async function() {
  try {
    const { db, firestore } = await window._getAdminDb();
    
    // Stats: outstanding balance, total accounts, overdue accounts
    const allUsers = await firestore.getDocs(firestore.collection(db, "users"));
    document.getElementById('admin-total-accounts').innerText = allUsers.size;
    
    const bills = await firestore.getDocs(firestore.collectionGroup(db, "billing_emails"));
    let outSum = 0;
    const outSet = new Set();
    let overdueCount = 0;
    
    bills.docs.forEach(d => {
      const b = d.data();
      if (b.status === 'Pending' || b.status === 'Overdue') {
        outSum += parseFloat(b.amount) || 0;
        if(b.accountNumber) outSet.add(b.accountNumber);
      }
      if (b.status === 'Overdue' && b.accountNumber) overdueCount++;
    });
    
    document.getElementById('admin-outstanding-amount').innerText = '₱' + outSum.toLocaleString();
    document.getElementById('admin-outstanding-accounts').innerText = `Across ${outSet.size} accounts`;
    document.getElementById('admin-overdue-accounts').innerText = overdueCount;
    
    // Donut Chart logic (stubbed with mock for visual completion as ChartJS is heavy)
    const ctx = document.getElementById('adminStatusChart');
    if (ctx && window.Chart) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Paid', 'Pending', 'Overdue'],
          datasets: [{ data: [65, 25, 10], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'], borderWidth: 0 }]
        },
        options: { cutout: '70%', plugins: { legend: { display: false } } }
      });
    }

    // Attach listeners
    ['bm-search', 'bm-month', 'bm-plan', 'bm-status'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener(id === 'bm-search' ? 'input' : 'change', window.renderBills);
    });
    ['ph-search', 'ph-month', 'ph-plan'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener(id === 'ph-search' ? 'input' : 'change', window.renderPayments);
    });

    await window.renderBills();
    await window.renderPayments();
  } catch (err) {
    console.error(err);
  }
};

window.renderBills = async function() {
  const tb = document.getElementById('bm-tbody');
  if(!tb) return;
  tb.innerHTML = '<tr><td colspan="9" style="padding: 1rem; text-align:center;">Loading...</td></tr>';
  
  try {
    const s = document.getElementById('bm-search').value.toLowerCase();
    const m = document.getElementById('bm-month').value;
    const p = document.getElementById('bm-plan').value;
    const st = document.getElementById('bm-status').value;
    
    const { db, firestore } = await window._getAdminDb();
    const bills = await firestore.getDocs(firestore.collectionGroup(db, "billing_emails"));
    
    let html = '';
    bills.docs.forEach(d => {
      const b = d.data();
      if(st && b.status !== st) return;
      if(s && !(b.customerName || '').toLowerCase().includes(s)) return;
      if(m && b.month !== m) return;
      if(p && b.plan !== p) return;
      
      const badgeColor = b.status === 'Overdue' ? '#E53935' : (b.status === 'Paid' ? '#10b981' : '#f59e0b');
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.02);">
          <td style="padding: 1rem; font-family: monospace;">${d.id.substring(0,6)}</td>
          <td style="padding: 1rem; color: #fff;">${b.customerName || 'Unknown'}</td>
          <td style="padding: 1rem; font-family: monospace;">${b.accountNumber || 'N/A'}</td>
          <td style="padding: 1rem;">${b.month || '-'}</td>
          <td style="padding: 1rem;">${b.plan || '-'}</td>
          <td style="padding: 1rem; color: #fff;">₱${parseFloat(b.amount || 0).toLocaleString()}</td>
          <td style="padding: 1rem;">${b.dueDate || '-'}</td>
          <td style="padding: 1rem;"><span style="color: ${badgeColor}; background: ${badgeColor}22; padding: 0.2rem 0.5rem; border-radius: 4px;">${b.status || 'Pending'}</span></td>
          <td style="padding: 1rem;">-</td>
        </tr>
      `;
    });
    
    if(!html) html = '<tr><td colspan="9" style="padding: 1rem; text-align:center;">No bills found</td></tr>';
    tb.innerHTML = html;
  } catch(e) { console.error(e); }
};

window.renderPayments = async function() {
  const tb = document.getElementById('ph-tbody');
  if(!tb) return;
  tb.innerHTML = '<tr><td colspan="10" style="padding: 1rem; text-align:center;">Loading...</td></tr>';
  
  try {
    const s = document.getElementById('ph-search').value.toLowerCase();
    const m = document.getElementById('ph-month').value;
    const p = document.getElementById('ph-plan').value;
    
    const { db, firestore } = await window._getAdminDb();
    const q = firestore.query(firestore.collection(db, "payments"), firestore.orderBy("timestamp", "desc"));
    const payments = await firestore.getDocs(q);
    
    let html = '';
    payments.docs.forEach(d => {
      const pm = d.data();
      if(s && !(pm.customerName || '').toLowerCase().includes(s)) return;
      if(m && pm.month !== m) return;
      if(p && pm.plan !== p) return;
      
      let dateStr = pm.date || '-';
      if (pm.timestamp && pm.timestamp.toDate) {
        dateStr = pm.timestamp.toDate().toLocaleDateString();
      }
      
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.02);">
          <td style="padding: 1rem; font-family: monospace;">${d.id.substring(0,8)}</td>
          <td style="padding: 1rem; color: #fff;">${pm.customerName || 'Unknown'}</td>
          <td style="padding: 1rem; font-family: monospace;">${pm.accountNumber || 'N/A'}</td>
          <td style="padding: 1rem;">${pm.month || '-'}</td>
          <td style="padding: 1rem;">${pm.plan || '-'}</td>
          <td style="padding: 1rem; color: #fff;">₱${parseFloat(pm.amount || 0).toLocaleString()}</td>
          <td style="padding: 1rem;">${pm.method || 'Online'}</td>
          <td style="padding: 1rem;">${dateStr}</td>
          <td style="padding: 1rem;"><span style="color: #10b981; background: rgba(16,185,129,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">Completed</span></td>
          <td style="padding: 1rem;">-</td>
        </tr>
      `;
    });
    
    if(!html) html = '<tr><td colspan="10" style="padding: 1rem; text-align:center;">No payments found</td></tr>';
    tb.innerHTML = html;
  } catch(e) { console.error(e); }
};

window.initAdminReports = async function() {
  await window.renderAdminReportsTable();
};

window.renderAdminReportsTable = async function() {
  const tb = document.getElementById('admin-reports-tbody');
  if(!tb) return;
  
  try {
    const { db, firestore } = await window._getAdminDb();
    const s = (document.getElementById('admin-reports-search').value || '').toLowerCase();
    const f = document.getElementById('admin-reports-filter').value;
    
    const q = firestore.query(firestore.collection(db, "reports"), firestore.orderBy("timestamp", "desc"));
    const snap = await firestore.getDocs(q);
    
    let html = '';
    let total = snap.size;
    let resolved = 0;
    
    snap.docs.forEach(d => {
      const r = d.data();
      const status = r.status || 'Pending';
      if (status === 'Fixed') resolved++;
      
      if(f !== 'All' && status !== f) return;
      if(s && !(r.name || '').toLowerCase().includes(s)) return;
      
      const stColor = status === 'Pending' ? '#f59e0b' : (status === 'Read' ? '#3b82f6' : '#10b981');
      const rId = d.id;
      
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onclick="window.openAdminReport('${rId}')" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 1rem; font-family: monospace; color: #94a3b8;">${rId.substring(0,8)}</td>
          <td style="padding: 1rem;"><div style="color: #fff; font-weight: 600;">${r.name || 'Unknown'}</div><div style="font-size: 0.7rem;">${r.accountNumber || '-'}</div></td>
          <td style="padding: 1rem; color: #fff;">${r.subject || 'No Subject'}</td>
          <td style="padding: 1rem;">${r.category || 'General'}</td>
          <td style="padding: 1rem;"><span style="color: ${stColor}; background: ${stColor}22; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.7rem;">${status}</span></td>
        </tr>
      `;
    });
    
    document.getElementById('admin-total-tickets').innerText = total;
    document.getElementById('admin-resolved-tickets').innerText = resolved;
    document.getElementById('admin-service-rate').innerText = '4.8 ★';
    
    if(!html) html = '<tr><td colspan="5" style="padding: 2rem; text-align:center;">No reports found</td></tr>';
    tb.innerHTML = html;
  } catch(e) { console.error(e); }
};

window.openAdminReport = async function(id) {
  try {
    const { db, firestore } = await window._getAdminDb();
    const doc = await firestore.getDoc(firestore.doc(db, "reports", id));
    if(!doc.exists()) return;
    const r = doc.data();
    
    document.getElementById('modal-ticket-id').innerText = id;
    document.getElementById('modal-ticket-name').innerText = r.name || '-';
    document.getElementById('modal-ticket-account').innerText = r.accountNumber || '-';
    document.getElementById('modal-ticket-phone').innerText = r.contactNumber || '-';
    document.getElementById('modal-ticket-fb').innerText = r.fbLink || '-';
    document.getElementById('modal-ticket-plan').innerText = r.plan || '-';
    document.getElementById('modal-ticket-address').innerText = r.completeAddress || '-';
    document.getElementById('modal-ticket-category').innerText = r.category || 'General';
    document.getElementById('modal-ticket-subject').innerText = r.subject || 'No Subject';
    document.getElementById('modal-ticket-desc').innerText = r.description || '-';
    
    const dStr = r.timestamp && r.timestamp.toDate ? r.timestamp.toDate().toLocaleString() : '-';
    document.getElementById('modal-ticket-date').innerText = dStr;
    
    const status = r.status || 'Pending';
    const stColor = status === 'Pending' ? '#f59e0b' : (status === 'Read' ? '#3b82f6' : '#10b981');
    document.getElementById('modal-ticket-status-badge').innerHTML = `<div style="color: ${stColor}; background: ${stColor}22; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; border: 1px solid ${stColor}44;">${status}</div>`;
    
    document.getElementById('admin-ticket-modal').style.display = 'flex';
  } catch(e) { console.error(e); }
};

window.closeAdminReport = function() {
  document.getElementById('admin-ticket-modal').style.display = 'none';
};

window.initAdminAccounts = async function() {
  await window.renderAdminClientsTable();
  await window.filterAdminAccounts();
};

window.renderAdminClientsTable = async function() {
  const tb = document.getElementById('admin-clients-tbody');
  if(!tb) return;
  
  try {
    const { db, firestore } = await window._getAdminDb();
    const s = (document.getElementById('admin-clients-search').value || '').toLowerCase();
    const p = document.getElementById('admin-clients-plan-filter').value;
    
    const snap = await firestore.getDocs(firestore.collection(db, "users"));
    
    let html = '';
    const planCounts = {};
    let total = 0;
    
    snap.docs.forEach(d => {
      const u = d.data();
      const plan = u.plan || 'Unknown';
      
      // Update plan counts (before filter)
      planCounts[plan] = (planCounts[plan] || 0) + 1;
      total++;
      
      // Apply filters
      if(p !== 'All' && plan !== p) return;
      if(s && !(u.fullName || '').toLowerCase().includes(s) && !(u.email || '').toLowerCase().includes(s) && !(u.accountNumber || '').toLowerCase().includes(s)) return;
      
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); cursor: pointer;" onclick="window.openAdminClientModal('${d.id}', '${u.fullName}', '${u.email}', '${u.accountNumber}', '${plan}', '${u.contactNumber || ''}', '${u.address || ''}')" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 1rem; font-family: monospace;">${d.id.substring(0,8)}</td>
          <td style="padding: 1rem; color: #fff;">${u.fullName || 'Unknown'}</td>
          <td style="padding: 1rem;">${u.email || '-'}</td>
          <td style="padding: 1rem; font-family: monospace;">${u.accountNumber || '-'}</td>
          <td style="padding: 1rem; color: #10b981;">${plan}</td>
        </tr>
      `;
    });
    
    document.getElementById('admin-clients-count').innerText = `${total} customer accounts`;
    document.getElementById('metric-total-clients').innerText = total;
    
    // Plan Legend & Donut
    let legendHtml = '';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    let i = 0;
    for(const k in planCounts) {
       const c = colors[i%colors.length];
       legendHtml += `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;"><div style="width:8px; height:8px; border-radius:50%; background:${c}"></div><div style="font-size:0.75rem; color:#cbd5e1;">${k} (${planCounts[k]})</div></div>`;
       i++;
    }
    document.getElementById('metric-plan-legend').innerHTML = legendHtml || '<div style="font-size: 0.75rem; color: #64748b;">No data</div>';
    
    if(!html) html = '<tr><td colspan="5" style="padding: 1rem; text-align:center;">No clients found</td></tr>';
    tb.innerHTML = html;
  } catch(e) { console.error(e); }
};

window.filterAdminAccounts = async function() {
  const tb = document.getElementById('admin-technician-tbody');
  if(!tb) return;
  
  try {
    const { db, firestore } = await window._getAdminDb();
    const s = (document.getElementById('admin-technician-search').value || '').toLowerCase();
    
    const snap = await firestore.getDocs(firestore.collection(db, "admin"));
    let html = '';
    let count = 0;
    
    snap.docs.forEach(d => {
      const u = d.data();
      if(s && !(u.name || '').toLowerCase().includes(s)) return;
      count++;
      
      const role = u.role || 'Minimal';
      let rColor = '#64748b';
      if(role === 'Admin') rColor = '#e53935';
      else if(role === 'Technician') rColor = '#3b82f6';
      else if(role === 'OJT') rColor = '#f59e0b';
      
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); cursor: pointer;" onclick="window.openAdminAccountModal('${d.id}', '${u.name}', '${u.email}', '${u.contact || ''}', '${u.password || ''}', '${role}')" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 1rem; font-family: monospace;">${d.id.substring(0,8)}</td>
          <td style="padding: 1rem; color: #fff;">${u.name || 'Unknown'}</td>
          <td style="padding: 1rem;">${u.contact || '-'}</td>
          <td style="padding: 1rem;">${u.email || '-'}</td>
          <td style="padding: 1rem;"><span style="color:${rColor}; border:1px solid ${rColor}44; background:${rColor}22; padding: 0.2rem 0.5rem; border-radius: 4px;">${role}</span></td>
        </tr>
      `;
    });
    
    document.getElementById('admin-technician-count').innerText = `${count} records`;
    document.getElementById('metric-total-staff').innerText = snap.size;
    
    if(!html) html = '<tr><td colspan="5" style="padding: 1rem; text-align:center;">No staff found</td></tr>';
    tb.innerHTML = html;
  } catch(e) { console.error(e); }
};

window.submitNewStaffAccount = async function() {
  const name = document.getElementById('add-staff-name').value.trim();
  const email = document.getElementById('add-staff-email').value.trim();
  const phone = document.getElementById('add-staff-phone').value.trim();
  const pass = document.getElementById('add-staff-password').value.trim();
  const msg = document.getElementById('add-staff-msg');
  const btn = document.getElementById('add-staff-btn');
  
  if(!name || !email || !pass) {
    msg.style.display = 'block';
    msg.style.background = 'rgba(229,57,53,0.1)';
    msg.style.color = '#e53935';
    msg.innerText = 'Name, Email, and Password are required';
    return;
  }
  
  btn.disabled = true;
  btn.innerText = 'Adding...';
  
  try {
    const { db, firestore } = await window._getAdminDb();
    
    // Check email exists
    const q = firestore.query(firestore.collection(db, "admin"), firestore.where("email", "==", email));
    const exist = await firestore.getDocs(q);
    if(!exist.empty) throw new Error("Email already registered for staff");
    
    await firestore.addDoc(firestore.collection(db, "admin"), {
      name, email, contact: phone, password: pass, role: 'Minimal', createdAt: firestore.serverTimestamp()
    });
    
    msg.style.display = 'block';
    msg.style.background = 'rgba(16,185,129,0.1)';
    msg.style.color = '#10b981';
    msg.innerText = 'Staff account added successfully! Default role is Minimal.';
    
    document.getElementById('add-staff-name').value = '';
    document.getElementById('add-staff-email').value = '';
    document.getElementById('add-staff-phone').value = '';
    document.getElementById('add-staff-password').value = '';
    
    await window.filterAdminAccounts();
  } catch(e) {
    msg.style.display = 'block';
    msg.style.background = 'rgba(229,57,53,0.1)';
    msg.style.color = '#e53935';
    msg.innerText = e.message;
  }
  
  btn.disabled = false;
  btn.innerText = 'Add Staff';
  setTimeout(() => msg.style.display = 'none', 3000);
};

// Staff Modal Logic
let currentStaffRole = 'Minimal';
window.openAdminAccountModal = function(id, name, email, contact, pass, role) {
  document.getElementById('modal-account-id-hidden').value = id;
  document.getElementById('modal-account-id').innerText = id;
  document.getElementById('modal-account-name').value = name;
  document.getElementById('modal-account-email').value = email;
  document.getElementById('modal-account-contact').value = contact;
  document.getElementById('modal-account-password').value = pass;
  
  const m = document.getElementById('modal-account-update-msg');
  m.style.display = 'none';
  
  window.setModalStaffRole(role);
  
  // Attach badge clicks
  ['admin', 'technician', 'ojt', 'minimal'].forEach(r => {
    const el = document.getElementById('role-badge-' + r);
    if(el) {
       el.onclick = () => {
         window.setModalStaffRole(r.charAt(0).toUpperCase() + r.slice(1));
         window.checkAdminStaffChanges();
       };
    }
  });
  
  const btn = document.getElementById('modal-account-update-btn');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  
  // If technician, disable update
  try {
     const au = JSON.parse(localStorage.getItem('adminUser'));
     if(au.role === 'Technician') {
        document.getElementById('modal-account-name').disabled = true;
        document.getElementById('modal-account-email').disabled = true;
        document.getElementById('modal-account-contact').disabled = true;
        document.getElementById('modal-account-password').disabled = true;
        btn.style.display = 'none';
     } else {
        btn.style.display = 'block';
     }
  } catch(e) {}
  
  document.getElementById('admin-account-modal').style.display = 'flex';
};

window.setModalStaffRole = function(r) {
  currentStaffRole = r;
  ['admin', 'technician', 'ojt', 'minimal'].forEach(rl => {
    const el = document.getElementById('role-badge-' + rl);
    if(el) {
       if(rl.toLowerCase() === r.toLowerCase()) {
          let c = '#64748b';
          if(r==='Admin') c='#e53935'; else if(r==='Technician') c='#3b82f6'; else if(r==='OJT') c='#f59e0b';
          el.style.background = c + '44';
          el.style.color = '#fff';
          el.style.borderColor = c;
       } else {
          el.style.background = 'rgba(255,255,255,0.05)';
          el.style.color = '#64748b';
          el.style.borderColor = 'rgba(255,255,255,0.1)';
       }
    }
  });
};

window.checkAdminStaffChanges = function() {
  const btn = document.getElementById('modal-account-update-btn');
  btn.disabled = false;
  btn.style.opacity = '1';
};

window.requestAdminStaffUpdate = async function() {
  const id = document.getElementById('modal-account-id-hidden').value;
  const name = document.getElementById('modal-account-name').value;
  const email = document.getElementById('modal-account-email').value;
  const contact = document.getElementById('modal-account-contact').value;
  const pass = document.getElementById('modal-account-password').value;
  const role = currentStaffRole;
  
  const msg = document.getElementById('modal-account-update-msg');
  const btn = document.getElementById('modal-account-update-btn');
  btn.disabled = true;
  btn.innerText = 'Updating...';
  
  try {
    const { db, firestore } = await window._getAdminDb();
    await firestore.updateDoc(firestore.doc(db, "staff", id), {
      name, email, contact, password: pass, role
    });
    
    msg.style.display = 'block';
    msg.style.background = 'rgba(16,185,129,0.1)';
    msg.style.color = '#10b981';
    msg.innerText = 'Staff updated successfully!';
    
    await window.filterAdminAccounts();
    setTimeout(window.closeAdminAccountModal, 1500);
  } catch(e) {
    msg.style.display = 'block';
    msg.style.background = 'rgba(229,57,53,0.1)';
    msg.style.color = '#e53935';
    msg.innerText = e.message;
  }
  btn.disabled = false;
  btn.innerText = 'Update Staff';
};

window.closeAdminAccountModal = function() {
  document.getElementById('admin-account-modal').style.display = 'none';
};

// Client Modal Logic (View Only basically for now, since it wasn't fully elaborated, just structure)
window.openAdminClientModal = function(id, name, email, account, plan, contact, address) {
  document.getElementById('modal-client-id-hidden').value = id;
  // Fallbacks to ID logic
  document.getElementById('admin-client-modal').style.display = 'flex';
};
window.closeAdminClientModal = function() {
  document.getElementById('admin-client-modal').style.display = 'none';
};


window.sendBillingEmail = async function () {
  const acctInput = document.getElementById('comm-acct-number');
  const statusEl = document.getElementById('comm-status');
  const sendBtn = document.getElementById('comm-send-btn');
  const accountNumber = acctInput ? acctInput.value.trim() : '';

  if (!accountNumber) {
    statusEl.innerHTML = '<div style="background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">Please enter an account number.</div>';
    return;
  }

  sendBtn.disabled = true;
  sendBtn.innerHTML = 'Sending...';
  statusEl.innerHTML = '';

  try {
    const { db, firestore } = await window._getAdminDb();
    
    // Query users
    const q = firestore.query(firestore.collection(db, "users"), firestore.where("accountNumber", "==", accountNumber));
    const snapshot = await firestore.getDocs(q);

    if (snapshot.empty) {
      statusEl.innerHTML = '<div style="background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">No user found with account number: <strong>' + accountNumber + '</strong></div>';
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Send Billing Statement';
      return;
    }

    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;

    if (!userData.email) {
      statusEl.innerHTML = '<div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #f59e0b; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">Customer does not have an email address on file.</div>';
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Send Billing Statement';
      return;
    }

    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 15);
    const dueDateStr = dueDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });

    let amountToBill = 0;
    if (userData.plan === '30Mbps') amountToBill = 1000;
    else if (userData.plan === '50Mbps') amountToBill = 1500;
    else if (userData.plan === '70Mbps') amountToBill = 2000;
    else if (userData.plan === '100Mbps') amountToBill = 2500;
    else if (userData.plan === '200Mbps') amountToBill = 3500;

    await firestore.addDoc(firestore.collection(db, 'users', userId, 'billing_emails'), {
      to: userData.email,
      customerName: userData.fullName || 'Customer',
      accountNumber: userData.accountNumber,
      month: currentMonth,
      plan: userData.plan || 'Unknown',
      amount: amountToBill,
      dueDate: dueDateStr,
      status: 'Pending',
      createdAt: firestore.serverTimestamp()
    });

    statusEl.innerHTML = '<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; padding: 1rem; border-radius: 8px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Billing statement queued for ' + (userData.fullName || 'Customer') + ' (' + userData.email + ')</div>';
    acctInput.value = '';

  } catch (err) {
    statusEl.innerHTML = '<div style="background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.2); color: #E53935; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">Error: ' + err.message + '</div>';
  }

  sendBtn.disabled = false;
  sendBtn.innerHTML = 'Send Billing Statement';
};

window.sendMaintenanceAdvisory = async function() {
  const type = document.getElementById('comm-advisory-type').value;
  const target = document.getElementById('comm-advisory-target').value;
  const msg = document.getElementById('comm-advisory-msg').value.trim();
  const statusEl = document.getElementById('comm-advisory-status');
  const btn = document.getElementById('comm-advisory-btn');
  
  if(!msg) {
    statusEl.innerHTML = '<div style="color: #E53935; margin-top: 0.5rem; font-size: 0.8rem;">Please enter an advisory message.</div>';
    return;
  }
  
  btn.disabled = true;
  btn.innerText = 'Sending...';
  
  try {
     const { db, firestore } = await window._getAdminDb();
     
     // To simulate sending, we add to a "communications" collection
     await firestore.addDoc(firestore.collection(db, "communications"), {
        type: type,
        target: target,
        message: msg,
        sender: JSON.parse(localStorage.getItem('adminUser')).name || 'Admin',
        timestamp: firestore.serverTimestamp()
     });
     
     statusEl.innerHTML = '<div style="color: #10b981; margin-top: 0.5rem; font-size: 0.8rem;">Advisory sent successfully via ' + type + ' to ' + target + '.</div>';
     document.getElementById('comm-advisory-msg').value = '';
  } catch(e) {
     statusEl.innerHTML = '<div style="color: #E53935; margin-top: 0.5rem; font-size: 0.8rem;">Error: ' + e.message + '</div>';
  }
  btn.disabled = false;
  btn.innerText = 'Send Advisory';
};

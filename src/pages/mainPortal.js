export const mainViews = {
  '/': () => `
    <section class="hero">
      <div class="hero-content">
        <h2 class="hero-kicker">RFIBERX</h2>
        <h1 class="hero-title">FAST INTERNET</h1>
        <p class="hero-subtitle">Experience next-level connectivity and seamless reliability.</p>
        <button class="btn btn-white" onclick="window.router.navigate('/subscriptions')">Get Unlimited Network Now</button>
      </div>
    </section>

    <section class="section-container scroll-animate">
      <div class="section-header-left">
        <h2>Fiber Plans</h2>
        <p>Your NEXT-LEVEL FIBER experience starts here.</p>
      </div>
      <div class="bundle-grid">
        <div class="bundle-card">
          <div class="img-placeholder" style="background: url('/laptop.jpg') center/cover no-repeat;"></div>
          <div class="card-content">
            <h3>Starter Plan</h3>
            <p>Reliable 30Mbps connection for everyday browsing and social media.</p>
            <button class="btn btn-outline" onclick="window.router.navigate('/subscriptions')">Check plans</button>
          </div>
        </div>
        <div class="bundle-card">
          <div class="img-placeholder" style="background: url('/family.jpg') center/cover no-repeat;"></div>
          <div class="card-content">
            <h3>Family Plan</h3>
            <p>Smooth 70Mbps speed perfect for households with multiple devices.</p>
            <button class="btn btn-outline" onclick="window.router.navigate('/subscriptions')">Check plans</button>
          </div>
        </div>
        <div class="bundle-card">
          <div class="img-placeholder" style="background: url('/gaming.jpg') center/cover no-repeat;"></div>
          <div class="card-content">
            <h3>Gaming Plan</h3>
            <p>Ultra-fast 200Mbps speeds dedicated for gamers and enthusiasts.</p>
            <button class="btn btn-outline" onclick="window.router.navigate('/subscriptions')">Check plans</button>
          </div>
        </div>
      </div>
    </section>

    <section class="pldt-ad scroll-animate">
      <div class="pldt-ad-content">
        <h2>MORE SHOWS.<br>MORE GAMING.</h2>
        <p>Power your entertainment with Fiber Plan 2499! Enjoy lag-free gaming in Valorant, Dota, and Mobile Legends, alongside smooth, seamless streaming for Netflix, YouTube, anime, and all your favorite websites.</p>
        <button class="btn btn-white rounded-pill" onclick="window.router.navigate('/subscriptions')">APPLY NOW</button>
      </div>
      <div class="pldt-overlay-card">
        <h3>RFiberX Super Plan 2000</h3>
        <div class="speed">1 GBPS</div>
        <p>NO CAP LIMIT, 100% RELIABILITY</p>
      </div>
    </section>

    <section class="our-company scroll-animate">
      <div class="our-company-content" style="display: flex; align-items: center; justify-content: space-between; gap: 4rem;">
        <div class="our-company-text" style="flex: 1;">
          <h2 class="our-company-title">Our Company</h2>
          <p class="our-company-desc">We believe that quality connectivity should be straightforward and accessible. Through practical solutions and a customer-first approach, we strive to deliver dependable internet services that enhance daily life and support your continuous growth.</p>
          <button class="btn btn-company" onclick="window.router.navigate('/about')">Learn More <span class="btn-arrow">→</span></button>
        </div>
        <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
          <div style="display: flex; align-items: center; justify-content: center;">
            <img src="/logo.png" alt="RFiberX" style="width: 100%; max-width: 600px; height: auto;" />
          </div>
        </div>
      </div>
      <div style="background: #fafafa; border-radius: 20px; padding: 4rem 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin-top: 4rem; max-width: 1100px; margin-left: auto; margin-right: auto;">
        
        <div style="text-align: center; padding: 0 1.5rem;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: #991b1b; font-weight: 700;">Our Purpose</h2>
          <p style="color: #4b5563; line-height: 1.6; font-size: 0.95rem;">We are dedicated to empowering individuals, families, and businesses by providing seamless digital connectivity. We strive to make everyday communication and online experiences smoother and more accessible for everyone.</p>
        </div>

        <div style="text-align: center; padding: 0 1.5rem;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: #991b1b; font-weight: 700;">Our Vision</h2>
          <p style="color: #4b5563; line-height: 1.6; font-size: 0.95rem;">We envision a future where technology bridges gaps rather than creating them, building robust and forward-looking networks that enable continuous growth, collaboration, and endless digital possibilities.</p>
        </div>

        <div style="text-align: center; padding: 0 1.5rem;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: #991b1b; font-weight: 700;">Our Mission</h2>
          <p style="color: #4b5563; line-height: 1.6; font-size: 0.95rem;">Our team is committed to providing innovative telecommunication services that enhance daily life. We work tirelessly to simplify how people connect, ensuring you stay online and thriving every single day.</p>
        </div>
      </div>
    </section>
  `,

  '/subscriptions': () => `
    <section class="section-container scroll-animate" style="max-width: 1600px; width: 95%; background: linear-gradient(rgba(10, 15, 26, 0.8), rgba(10, 15, 26, 0.8)), url('/8.png') center/cover no-repeat; border-radius: 16px; padding: 3rem 1rem;">
      <div class="section-header-left" style="text-align: center; margin-bottom: 4rem;">
        <h2>Choose Your Power</h2>
        <p>Unbeatable plans for every need. No hidden fees.</p>
      </div>
      <div class="pricing-grid">
        <!-- Plan 1 -->
        <div id="starter" class="bundle-card" style="padding: 1.5rem;">
          <h3 style="font-size: 1.5rem;">Starter RFiberX</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--accent-color); margin: 1rem 0;">₱800<span style="font-size: 1rem; color: #555;">/mo</span></div>
          <p style="margin-bottom: 2rem; line-height: 2;">Up to 30 Mbps<br>Unlimited Data<br>Standard Router<br>Good for 10 devices</p>
          <button class="btn btn-outline" style="margin-top: auto;" onclick="window.router.openSignupForm('Starter RFiberX', 'Up to 30 Mbps', '₱800/mo')">Get Started</button>
        </div>
        
        <!-- Plan 2 -->
        <div id="value" class="bundle-card" style="padding: 1.5rem;">
          <h3 style="font-size: 1.5rem;">Value RFiberX</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--accent-color); margin: 1rem 0;">₱1000<span style="font-size: 1rem; color: #555;">/mo</span></div>
          <p style="margin-bottom: 2rem; line-height: 2;">Up to 50 Mbps<br>Unlimited Data<br>Standard Router<br>HD Streaming Ready</p>
          <button class="btn btn-outline" style="margin-top: auto;" onclick="window.router.openSignupForm('Value RFiberX', 'Up to 50 Mbps', '₱1000/mo')">Get Started</button>
        </div>

        <!-- Plan 3 -->
        <div id="family" class="bundle-card" style="padding: 1.5rem;">
          <h3 style="font-size: 1.5rem;">Family RFiberX</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--accent-color); margin: 1rem 0;">₱1300<span style="font-size: 1rem; color: #555;">/mo</span></div>
          <p style="margin-bottom: 2rem; line-height: 2;">Up to 70 Mbps<br>Unlimited Data<br>Dual-Band Router 5G<br>Great for 10 devices</p>
          <button class="btn btn-outline" style="margin-top: auto;" onclick="window.router.openSignupForm('Family RFiberX', 'Up to 70 Mbps', '₱1300/mo')">Get Started</button>
        </div>

        <!-- Plan 4 (Most Popular) -->
        <div id="pro" class="bundle-card popular-card" style="padding: 1.5rem; border-color: var(--accent-color); z-index: 1;">
          <div style="position: absolute; top: 0; right: 0; background: var(--accent-color); color: #fff; padding: 0.2rem 1rem; font-size: 0.8rem; font-weight: bold; border-bottom-left-radius: 16px;">MOST POPULAR</div>
          <h3 style="font-size: 1.5rem;">Pro RFiberX</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--accent-color); margin: 1rem 0;">₱1500<span style="font-size: 1rem; color: #555;">/mo</span></div>
          <p style="margin-bottom: 2rem; line-height: 2;">Up to 100 Mbps<br>Unlimited Data<br>Dual-Band Router 5G<br>4K Streaming & Gaming</p>
          <button class="btn btn-outline" style="margin-top: auto; background: var(--accent-color); color: #fff;" onclick="window.router.openSignupForm('Pro RFiberX', 'Up to 100 Mbps', '₱1500/mo')">Get Started</button>
        </div>

        <!-- Plan 5 -->
        <div id="extreme" class="bundle-card" style="padding: 1.5rem;">
          <h3 style="font-size: 1.5rem;">Extreme RFiberX</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--accent-color); margin: 1rem 0;">₱2000<span style="font-size: 1rem; color: #555;">/mo</span></div>
          <p style="margin-bottom: 2rem; line-height: 2;">Up to 200 Mbps<br>Unlimited Data<br>Dual-Band Router 5G<br></p>
          <button class="btn btn-outline" style="margin-top: auto;" onclick="window.router.openSignupForm('Extreme RFiberX', 'Up to 200 Mbps', '₱2000/mo')">Get Started</button>
        </div>
        
        <!-- Plan 6 -->
        <div id="ultra" class="bundle-card" style="padding: 1.5rem;">
          <h3 style="font-size: 1.5rem;">Ultra RFiberX</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--accent-color); margin: 1rem 0;">₱4500<span style="font-size: 1rem; color: #555;">/mo</span></div>
          <p style="margin-bottom: 2rem; line-height: 2;">Dual-Band Router 5G<br>Unlimited Data<br>Up to 50 devices<br></p>
          <button class="btn btn-outline" style="margin-top: auto;" onclick="window.router.openSignupForm('Ultra RFiberX', 'Up to 500 Mbps', '₱4500/mo')">Get Started</button>
        </div>
      </div>

      <!-- Application Form Accordion -->
      <div id="signup-form-container" class="signup-container">
        <div style="background: var(--glass-bg); padding: 3rem; border-radius: 16px; border: 1px solid var(--accent-color); max-width: 800px; margin: 0 auto; text-align: left;">
          <h2 style="margin-bottom: 2rem; text-align: center;">Complete Your Application</h2>
          <form onsubmit="window.router.submitApplication(event)">
            <div class="contact-grid" style="gap: 2rem;">
              <div>
                <div class="form-group">
                  <label>Selected Plan</label>
                  <input type="text" id="selected-plan-input" class="form-control" readonly style="background: rgba(229, 57, 53, 0.1); border-color: var(--accent-color); font-weight: bold; color: var(--accent-color);">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label>Plan Speed</label>
                    <input type="text" id="selected-plan-speed" class="form-control" readonly style="background: rgba(0,0,0,0.4); color: #888;">
                  </div>
                  <div class="form-group">
                    <label>Price</label>
                    <input type="text" id="selected-plan-price" class="form-control" readonly style="background: rgba(0,0,0,0.4); color: #888;">
                  </div>
                </div>
                <div class="form-group">
                  <label>Gmail Address</label>
                  <input type="email" id="applicant-email" class="form-control" placeholder="john@gmail.com" pattern=".+@gmail\.com$" title="Please provide a valid @gmail.com address" required>
                </div>
                <div class="form-group">
                  <label>Facebook Name</label>
                  <input type="text" id="applicant-facebook" class="form-control" placeholder="John Doe" required>
                </div>
                <div class="form-group">
                  <label>Phone Number (11 digits)</label>
                  <input type="tel" id="applicant-phone" class="form-control" placeholder="09123456789" maxlength="11" pattern="^09[0-9]{9}$" title="Phone number must start with 09 and be exactly 11 digits" oninput="this.value=this.value.replace(/[^0-9]/g,'')" required>
                </div>
              </div>
              <div>
                <div class="form-group">
                  <label>Location</label>
                  <input type="text" class="form-control" value="Magdalena" readonly style="background: rgba(0,0,0,0.4); color: #888;">
                </div>
                <div class="form-group">
                  <label>Sub Location</label>
                  <select id="applicant-sublocation" class="form-control" required onchange="document.getElementById('other-location-group').style.display = this.value === 'Other' ? 'block' : 'none';" style="appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=%22white%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position-x: 95%; background-position-y: 50%;">
                    <option value="" disabled selected>Select Sub Location</option>
                    <option style="background: #111;">Salasad</option>
                    <option style="background: #111;">Brgy. Ilog</option>
                    <option style="background: #111;">Bucal</option>
                    <option style="background: #111;">Ibabang Butnong</option>
                    <option style="background: #111;">Poblacion</option>
                    <option style="background: #111;">Munting Ambling</option>
                    <option style="background: #111;">Cigaras</option>
                    <option style="background: #111;">Tipunan</option>
                    <option style="background: #111;">Balanac</option>
                    <option style="background: #111;">Malinao</option>
                    <option style="background: #111;">Ilayang Butnong</option>
                    <option style="background: #111;">Sabang</option>
                    <option style="background: #111;">Buenavista</option>
                    <option style="background: #111;">Malaking Ambling</option>
                    <option style="background: #111;" value="Other">Other (Please specify)</option>
                  </select>
                </div>
                <div class="form-group" id="other-location-group" style="display: none;">
                  <label>Insert Location</label>
                  <input type="text" id="applicant-other-location" class="form-control" placeholder="Enter your complete sub-location">
                </div>
                <div class="form-group">
                  <label>Additional Details / Landmarks</label>
                  <textarea id="applicant-landmarks" class="form-control" rows="2" placeholder="e.g., Near the blue gate, beside the bakery, etc."></textarea>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-outline" style="width: 100%; margin-top: 1rem; background: var(--accent-color); color: #fff; border-color: var(--accent-color);">Submit Application</button>
          </form>
        </div>
      </div>
    </section>

    <!-- Compare All Plans Table -->
    <section class="section-container scroll-animate compare-section" style="border-top: 1px solid var(--glass-border);">
      <div class="compare-header">
        <h2>Compare <span>All Plans</span></h2>
        <p>See exactly what's included with every plan.</p>
      </div>
      <div class="compare-table-wrapper">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Plan 800</th>
              <th>Plan 1000</th>
              <th class="highlight-col">Plan 1300</th>
              <th>Plan 1500</th>
              <th>Plan 2000</th>
              <th>Plan 4500</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Download Speed</td>
              <td>30 Mbps</td>
              <td>50 Mbps</td>
              <td class="highlight-col">70 Mbps</td>
              <td>100 Mbps</td>
              <td>200 Mbps</td>
              <td>500 Mbps</td>
            </tr>
            <tr>
              <td>Data Cap</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
              <td class="highlight-col">Unlimited</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Free Modem</td>
              <td class="check">✓</td>
              <td class="check">✓</td>
              <td class="highlight-col check">✓</td>
              <td class="check">✓</td>
              <td class="check">✓</td>
              <td class="check">✓</td>
            </tr>
            <tr>
              <td>Best Used For</td>
              <td>Social Media & Chatting</td>
              <td>Online School & Browsing</td>
              <td class="highlight-col">HD Streaming & Working</td>
              <td>Online Gaming & Video Calls</td>
              <td>Heavy Gaming, 4K Streaming & Large Downloads</td>
              <td>Enterprise, Bulk Streaming & Max Performance</td>
            </tr>
            <tr>
              <td>Recommended Devices</td>
              <td>Up to 8 devices</td>
              <td>Up to 12 devices</td>
              <td class="highlight-col">Up to 15 devices</td>
              <td>Up to 20 devices</td>
              <td>Up to 30 devices</td>
              <td>Up to 50 devices</td>
            </tr>
            <tr>
              <td>Streaming Quality</td>
              <td>Standard HD</td>
              <td>Full HD (1080p)</td>
              <td class="highlight-col">Multiple Full HD Screens</td>
              <td>4K Ultra HD</td>
              <td>Multiple 4K Streams Simultaneously</td>
              <td>8K / Multiple 4K Streams + Zero Buffering</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="section-container scroll-animate faq-section">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h2 style="font-size: 2.5rem; color: #fff;">Frequently Asked Questions</h2>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          How long does installation take?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          Standard installations usually take between 2 to 4 hours. Once you sign up, our dispatch team will contact you within 24 hours to schedule a convenient time.
        </div>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          Can I upgrade or downgrade my plan?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          Absolutely! You can easily request an upgrade or downgrade using our website portal, or you can directly <a href="#" onclick="window.scrollTo(0, document.body.scrollHeight); return false;" style="color: var(--accent-color); font-weight: bold; text-decoration: none;">Contact</a> our support team for assistance.
        </div>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          Is RFiberX available in my area?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          We are rapidly expanding our coverage. You can check the availability in your area by starting the application process or directly <a href="#" onclick="window.scrollTo(0, document.body.scrollHeight); return false;" style="color: var(--accent-color); font-weight: bold; text-decoration: none;">Contact</a> our sales team.
        </div>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          What happens if my internet goes down?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          If you experience any issues, you can easily <a href="#" onclick="window.scrollTo(0, document.body.scrollHeight); return false;" style="color: var(--accent-color); font-weight: bold; text-decoration: none;">Contact</a> our support team or the company directly.
        </div>
      </div>
    </section>

    <!-- Not Sure Which Plan Banner -->
    <section class="section-container scroll-animate" style="margin-bottom: 4rem;">
      <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 4rem 3rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 2rem; position: relative; overflow: hidden;">
        <!-- Subtle accent glow -->
        <div style="position: absolute; top: -50px; left: -50px; width: 150px; height: 150px; background: var(--accent-color); filter: blur(100px); opacity: 0.3; z-index: 0;"></div>
        
        <div style="flex: 1; min-width: 300px; z-index: 1;">
          <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem;">
            Not Sure Which Plan?
          </h2>
          <p style="color: var(--text-secondary); font-size: 1.15rem; max-width: 600px;">
            Talk to our experts and we'll help you find the perfect plan for your home or business. No commitments.
          </p>
        </div>
        <div style="z-index: 1;">
          <button class="btn btn-outline" onclick="window.router.navigate('/contact')" style="background: #fff; color: var(--bg-color); border: none; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; padding: 1.25rem 2.5rem; font-size: 1.1rem; box-shadow: 0 10px 25px rgba(255,255,255,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Talk to an Expert
          </button>
        </div>
      </div>
    </section>
  `,

  '/support': () => `
    <section class="section-container scroll-animate" style="text-align: center; padding-top: 6rem; border-bottom: 1px solid var(--glass-border);">
      <h1 style="font-size: 3rem; margin-bottom: 1.5rem;">How can we help?</h1>
      <p style="color: var(--text-secondary); font-size: 1.2rem; margin-bottom: 3rem; max-width: 600px; margin-inline: auto;">Browse the categories below to find exactly what you need.</p>
      
      <div class="bundle-grid" style="margin-bottom: 4rem;">
        <div class="bundle-card" style="padding: 2.5rem; text-align: center; cursor: pointer; transition: transform 0.3s ease, border-color 0.3s ease;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='var(--accent-color)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='transparent';" onclick="window.router.navigate('/support/billing')">
          <div style="margin-bottom: 1.5rem; color: var(--accent-color);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.4rem;">Billing & Payments</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">Securely manage your statements, review current charges, and process monthly payments seamlessly.</p>
        </div>
        
        <div class="bundle-card" style="padding: 2.5rem; text-align: center; cursor: pointer; transition: transform 0.3s ease, border-color 0.3s ease;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='var(--accent-color)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='transparent';" onclick="window.router.navigate('/support/technical')">
          <div style="margin-bottom: 1.5rem; color: var(--accent-color);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.4rem;">Technical Support</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">Access our comprehensive troubleshooting guide to resolve internet issues and optimize your Wi-Fi setup.</p>
        </div>
        
        <div class="bundle-card" style="padding: 2.5rem; text-align: center; cursor: pointer; transition: transform 0.3s ease, border-color 0.3s ease;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='var(--accent-color)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='transparent';" onclick="window.router.navigate('/support/account')">
          <div style="margin-bottom: 1.5rem; color: var(--accent-color);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.4rem;">Account Management</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">Easily update your plan, request a service relocation, or initiate a change of account ownership.</p>
        </div>
        
        <div class="bundle-card" style="padding: 2.5rem; text-align: center; cursor: pointer; transition: transform 0.3s ease, border-color 0.3s ease;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='var(--accent-color)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='transparent';" onclick="window.router.navigate('/support/outages')">
          <div style="margin-bottom: 1.5rem; color: var(--accent-color);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.4rem;">Outages & Network</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">Stay informed about network status, scheduled maintenance, and report any downed lines in your area.</p>
        </div>
      </div>
    </section>

    <section class="section-container scroll-animate" style="margin-bottom: 5rem; max-width: 1200px;">
      <h2 style="margin-bottom: 2.5rem; font-size: 2.5rem; text-align: center;">Quick Resources</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; align-items: start;">
        
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; border-left: 4px solid var(--accent-color); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-10px)'; this.style.boxShadow='0 10px 20px rgba(229, 57, 53, 0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" onclick="const d = document.getElementById('guide-1'); if(d.style.maxHeight === '0px' || d.style.maxHeight === ''){ d.style.maxHeight = '500px'; d.style.opacity = '1'; d.style.marginTop = '1.5rem'; d.style.paddingTop = '1.5rem'; d.style.borderTop = '1px dashed rgba(255,255,255,0.1)'; document.getElementById('icon-1').style.transform = 'rotate(45deg)'; } else { d.style.maxHeight = '0px'; d.style.opacity = '0'; d.style.marginTop = '0'; d.style.paddingTop = '0'; d.style.borderTop = 'none'; document.getElementById('icon-1').style.transform = 'rotate(0deg)'; }">
          <h3 style="color: #fff; margin-bottom: 1rem; font-size: 1.3rem; display: flex; justify-content: space-between; align-items: center;">New Subscriber Guide <span id="icon-1" style="color: var(--accent-color); font-size: 1.5rem; transition: transform 0.3s ease;">+</span></h3>
          <p style="color: var(--text-secondary); line-height: 1.6;">Everything you need to know about getting started with RFiberX, from your first bill to understanding your router's lights.</p>
          <div id="guide-1" style="max-height: 0px; opacity: 0; overflow: hidden; transition: all 0.4s ease; color: var(--text-secondary); font-size: 0.95rem;">
            <strong style="color: #fff;">1. Your First Bill:</strong> It may include a pro-rated charge depending on your activation date.<br><br>
            <strong style="color: #fff;">2. Router Lights:</strong> 'PON' should be steady green. 'LOS' should be off. If 'LOS' is red, there is a physical connection issue.<br><br>
            <strong style="color: #fff;">3. Wi-Fi Setup:</strong> For the best coverage, place your router in an open, central location away from thick walls or microwaves.
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; border-left: 4px solid var(--accent-color); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-10px)'; this.style.boxShadow='0 10px 20px rgba(229, 57, 53, 0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" onclick="const d = document.getElementById('guide-2'); if(d.style.maxHeight === '0px' || d.style.maxHeight === ''){ d.style.maxHeight = '500px'; d.style.opacity = '1'; d.style.marginTop = '1.5rem'; d.style.paddingTop = '1.5rem'; d.style.borderTop = '1px dashed rgba(255,255,255,0.1)'; document.getElementById('icon-2').style.transform = 'rotate(45deg)'; } else { d.style.maxHeight = '0px'; d.style.opacity = '0'; d.style.marginTop = '0'; d.style.paddingTop = '0'; d.style.borderTop = 'none'; document.getElementById('icon-2').style.transform = 'rotate(0deg)'; }">
          <h3 style="color: #fff; margin-bottom: 1rem; font-size: 1.3rem; display: flex; justify-content: space-between; align-items: center;">Speed Test Diagnostics <span id="icon-2" style="color: var(--accent-color); font-size: 1.5rem; transition: transform 0.3s ease;">+</span></h3>
          <p style="color: var(--text-secondary); line-height: 1.6;">Experiencing slow speeds? Learn how to properly test your connection and optimize your home network for maximum performance.</p>
          <div id="guide-2" style="max-height: 0px; opacity: 0; overflow: hidden; transition: all 0.4s ease; color: var(--text-secondary); font-size: 0.95rem;">
            <strong style="color: #fff;">Step 1:</strong> Connect a laptop or PC directly to the router using a LAN cable.<br><br>
            <strong style="color: #fff;">Step 2:</strong> Ensure no other devices are downloading heavy files or streaming video.<br><br>
            <strong style="color: #fff;">Step 3:</strong> Go to speedtest.net and select a local server.<br><br>
            <strong style="color: #fff;">Note:</strong> Wi-Fi speeds are naturally slower than wired connections due to environmental interference.
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; border-left: 4px solid var(--accent-color); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-10px)'; this.style.boxShadow='0 10px 20px rgba(229, 57, 53, 0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';" onclick="const d = document.getElementById('guide-3'); if(d.style.maxHeight === '0px' || d.style.maxHeight === ''){ d.style.maxHeight = '500px'; d.style.opacity = '1'; d.style.marginTop = '1.5rem'; d.style.paddingTop = '1.5rem'; d.style.borderTop = '1px dashed rgba(255,255,255,0.1)'; document.getElementById('icon-3').style.transform = 'rotate(45deg)'; } else { d.style.maxHeight = '0px'; d.style.opacity = '0'; d.style.marginTop = '0'; d.style.paddingTop = '0'; d.style.borderTop = 'none'; document.getElementById('icon-3').style.transform = 'rotate(0deg)'; }">
          <h3 style="color: #fff; margin-bottom: 1rem; font-size: 1.3rem; display: flex; justify-content: space-between; align-items: center;">Service Relocation <span id="icon-3" style="color: var(--accent-color); font-size: 1.5rem; transition: transform 0.3s ease;">+</span></h3>
          <p style="color: var(--text-secondary); line-height: 1.6;">Moving soon? Discover the step-by-step process for transferring your RFiberX internet connection to your new address.</p>
          <div id="guide-3" style="max-height: 0px; opacity: 0; overflow: hidden; transition: all 0.4s ease; color: var(--text-secondary); font-size: 0.95rem;">
            <strong style="color: #fff;">1. Check Availability:</strong> Contact us to verify if RFiberX facilities are available in your new location.<br><br>
            <strong style="color: #fff;">2. Request Transfer:</strong> Provide your new address and preferred relocation date (at least 1 week in advance).<br><br>
            <strong style="color: #fff;">3. Setup & Activation:</strong> Our technicians will visit your new home, lay the fiber, and set up your existing modem. The standard fee depends on the line distance but is often waived.
          </div>
        </div>

      </div>
    </section>
    
    <section class="section-container scroll-animate" style="text-align: center; margin-bottom: 4rem;">
      <h2 style="margin-bottom: 1.5rem; font-size: 2.5rem;">Still need help?</h2>
      <p style="color: var(--text-secondary); margin-bottom: 3rem; font-size: 1.1rem;">Our dedicated support team is available at working hours to assist you.</p>
      
      <div style="display: flex; justify-content: center; gap: 2.5rem; margin-bottom: 3rem; flex-wrap: wrap;">
        
        <div style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(229, 57, 53, 0.1); border: 2px solid var(--accent-color); margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; color: var(--accent-color); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <p style="color: var(--accent-color); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Technician</p>
        </div>
        
        <div style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(229, 57, 53, 0.1); border: 2px solid var(--accent-color); margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; color: var(--accent-color); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <p style="color: var(--accent-color); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Technician</p>
        </div>
        
        <div style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(229, 57, 53, 0.1); border: 2px solid var(--accent-color); margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; color: var(--accent-color); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <p style="color: var(--accent-color); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Technician</p>
        </div>

        <div style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(229, 57, 53, 0.1); border: 2px solid var(--accent-color); margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; color: var(--accent-color); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <p style="color: var(--accent-color); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Technician</p>
        </div>

        <div style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(229, 57, 53, 0.1); border: 2px solid var(--accent-color); margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; color: var(--accent-color); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <p style="color: var(--accent-color); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Technician</p>
        </div>

      </div>
      
      <button class="btn btn-outline" onclick="window.router.navigate('/contact')" style="width: auto;">Contact Support</button>
    </section>
  `,

  '/contact': () => `
    <section class="section-container scroll-animate" style="padding-top: 6rem; margin-bottom: 4rem;">
      <div style="text-align: center; margin-bottom: 4rem;">
        <h1 style="font-size: 3.5rem; margin-bottom: 1rem;">Get in Touch</h1>
        <p style="color: var(--text-secondary); font-size: 1.2rem;">We're ready to answer your questions and get you connected.</p>
      </div>

      <div class="contact-grid">
        <!-- Contact Form -->
        <div style="background: var(--glass-bg); padding: 3rem; border-radius: 16px; border: 1px solid var(--glass-border); backdrop-filter: blur(10px);">
          <h2 style="margin-bottom: 2rem;">Send us a message</h2>
          <form onsubmit="window.router.submitContactMessage(event)">
            
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="contact-name" class="form-control" placeholder="John Doe" required>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="contact-email" class="form-control" placeholder="john@example.com" required>
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="contact-phone" class="form-control" placeholder="09123456789" maxlength="11" pattern="^09[0-9]{9}$" oninput="this.value=this.value.replace(/[^0-9]/g,'')" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Location</label>
                <input type="text" class="form-control" value="Magdalena" readonly style="background: rgba(0,0,0,0.4); color: #888;">
              </div>
              <div class="form-group">
                <label>Sub Location</label>
                <select id="contact-sublocation" class="form-control" required style="appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=%22white%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position-x: 95%; background-position-y: 50%;" onchange="document.getElementById('contact-other-location-group').style.display = this.value === 'Other' ? 'block' : 'none';">
                  <option value="" disabled selected>Select Sub Location</option>
                  <option style="background: #111;">Salasad</option>
                  <option style="background: #111;">Brgy. Ilog</option>
                  <option style="background: #111;">Bucal</option>
                  <option style="background: #111;">Ibabang Butnong</option>
                  <option style="background: #111;">Poblacion</option>
                  <option style="background: #111;">Munting Ambling</option>
                  <option style="background: #111;">Cigaras</option>
                  <option style="background: #111;">Tipunan</option>
                  <option style="background: #111;">Balanac</option>
                  <option style="background: #111;">Malinao</option>
                  <option style="background: #111;">Ilayang Butnong</option>
                  <option style="background: #111;">Sabang</option>
                  <option style="background: #111;">Buenavista</option>
                  <option style="background: #111;">Malaking Ambling</option>
                  <option value="Other" style="background: #111;">Other (Please specify)</option>
                </select>
              </div>
            </div>

            <div class="form-group" id="contact-other-location-group" style="display: none;">
              <label>Insert Location</label>
              <input type="text" id="contact-other-location" class="form-control" placeholder="Enter your complete sub-location">
            </div>

            <div class="form-group">
              <label>Subject</label>
              <select id="contact-subject" class="form-control" style="appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=%22white%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position-x: 95%; background-position-y: 50%;" onchange="const msg = document.getElementById('contact-message'); if(this.value === 'Technical Support') msg.placeholder = 'e.g., No internet'; else if(this.value === 'Billing Question') msg.placeholder = 'e.g., How can we pay our internet fee?'; else msg.placeholder = 'How can we help you?';">
                <option value="Technical Support" style="background: #111;">Technical Support</option>
                <option value="Billing Question" style="background: #111;">Billing Question</option>
                <option value="Other" style="background: #111;">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea id="contact-message" class="form-control" rows="4" placeholder="e.g., No internet" required></textarea>
            </div>
            <button type="submit" class="btn btn-outline" style="width: 100%;">Submit Message</button>
          </form>
        </div>

        <!-- Contact Info -->
        <div>
          <h2 style="margin-bottom: 2rem;">Contact Information</h2>
          
          <div style="margin-bottom: 2.5rem; display: flex; gap: 1rem;">
            <div>
              <h3 style="margin-bottom: 0.5rem;">Technical Support</h3>
              <p style="color: var(--text-secondary); font-size: 1.1rem;">+63 09913746474</p>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">Available 24/7, 365 days a year</p>
            </div>
          </div>

          <div style="margin-bottom: 2.5rem; display: flex; gap: 1rem;">
            <div>
              <h3 style="margin-bottom: 0.5rem;">Email Us</h3>
              <p style="color: var(--text-secondary); font-size: 1.1rem;">technicians@rfiberx.net</p>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">We aim to reply within 2 hours.</p>
            </div>
          </div>

          <div style="margin-bottom: 2.5rem; display: flex; gap: 1rem;">
            <div>
              <h3 style="margin-bottom: 0.5rem;">Headquarters</h3>
              <p style="color: var(--text-secondary); line-height: 1.6;">
                Carnation Street, Barangay Uno<br>
                Calamba 4027, Laguna
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="section-container scroll-animate faq-section" style="margin-top: -2rem;">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h2 style="font-size: 2.5rem; color: #fff;">Frequently Asked Questions</h2>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          How long does installation take?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          Standard installations usually take between 2 to 4 hours. Once you sign up, our dispatch team will contact you within 24 hours to schedule a convenient time.
        </div>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          Can I upgrade or downgrade my plan?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          Absolutely! You can easily request an upgrade or downgrade using our website portal, or you can directly <a href="#" onclick="window.scrollTo(0, document.body.scrollHeight); return false;" style="color: var(--accent-color); font-weight: bold; text-decoration: none;">Contact</a> our support team for assistance.
        </div>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          Is RFiberX available in my area?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          We are rapidly expanding our coverage. You can check the availability in your area by starting the application process or directly <a href="#" onclick="window.scrollTo(0, document.body.scrollHeight); return false;" style="color: var(--accent-color); font-weight: bold; text-decoration: none;">Contact</a> our sales team.
        </div>
      </div>
      <div class="faq-item" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          What happens if my internet goes down?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          If you experience any issues, you can easily <a href="#" onclick="window.scrollTo(0, document.body.scrollHeight); return false;" style="color: var(--accent-color); font-weight: bold; text-decoration: none;">Contact</a> our support team or the company directly.
        </div>
      </div>
    </section>
  `,

  '/apply': () => `
    <section class="section-container scroll-animate" style="padding-top: 6rem;">
      <div style="text-align: center; margin-bottom: 4rem;">
        <h1 style="font-size: 3.5rem; margin-bottom: 1rem;">Join the RFiberX Team</h1>
        <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 600px; margin: 0 auto;">We're building the future of Filipino connectivity. If you're passionate about technology and community, we want to hear from you.</p>
      </div>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: var(--glass-bg); padding: 3rem; border-radius: 16px; border: 1px solid var(--glass-border); backdrop-filter: blur(10px);">
          <h2 style="margin-bottom: 2rem; text-align: center;">Application Form</h2>
          <form onsubmit="event.preventDefault(); alert('Application submitted successfully! We will review your information and get back to you.')">
            <div class="contact-grid" style="gap: 2rem;">
              <div>
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" class="form-control" placeholder="Juan Dela Cruz" required>
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" class="form-control" placeholder="juan@example.com" required>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" class="form-control" placeholder="0912 345 6789" required>
                </div>
              </div>
              <div>
                <div class="form-group">
                  <label>Position Applying For</label>
                  <select class="form-control" required style="appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=%22white%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position-x: 95%; background-position-y: 50%;">
                    <option value="Field Technician" selected style="background: #111;">Field Technician</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Years of Experience</label>
                  <select class="form-control" required style="appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=%22white%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position-x: 95%; background-position-y: 50%;">
                    <option value="" disabled selected style="background: #111;">Select Experience</option>
                    <option style="background: #111;">Fresh Graduate</option>
                    <option style="background: #111;">1-2 Years</option>
                    <option style="background: #111;">3-5 Years</option>
                    <option style="background: #111;">5+ Years</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Why do you want to join RFiberX?</label>
                  <textarea class="form-control" rows="4" placeholder="Tell us about yourself and why you'd be a great fit..." required></textarea>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-outline" style="width: 100%; margin-top: 1rem; background: var(--accent-color); color: #fff; border-color: var(--accent-color);">Submit Application</button>
          </form>
        </div>
      </div>
    </section>


  `,

  '/about': () => `
    <!-- Who We Are Hero -->
    <section id="who-we-are" class="about-hero scroll-animate" style="position: relative; overflow: hidden;">
      <img src="/logo.png" alt="RFiberX Logo" style="position: absolute; right: -50px; top: 0px; opacity: 0.05; pointer-events: none; z-index: 0; width: 600px; max-width: 100vw;" />
      <div class="about-hero-content" style="position: relative; z-index: 1;">
        <h2 class="about-hero-kicker">ABOUT RFIBERX</h2>
        <h1 class="about-hero-title">Who We Are</h1>
        <p class="about-hero-desc">At RFiberX, we are dedicated to delivering fast and dependable telecommunications directly to your doorstep. Founded with the vision of making high-speed internet accessible and straightforward, we have established ourselves as a trusted partner in fiber-optic connectivity. Our focus is on providing seamless, high-quality service so that every household and business we serve can stay connected to what matters most.</p>
      </div>
    </section>

    <!-- Purpose, Vision, Mission -->
    <section id="purpose" class="section-container scroll-animate" style="margin-bottom: 4rem;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        
        <!-- Mission Card -->
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem 2rem; text-align: center; position: relative; overflow: hidden; transition: all 0.3s ease; cursor: default;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='#E53935'; this.style.boxShadow='0 20px 40px rgba(229, 57, 53, 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">
          <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: #E53935; filter: blur(80px); border-radius: 50%; opacity: 0.3; z-index: 0;"></div>
          <div style="width: 80px; height: 80px; background: rgba(229, 57, 53, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; color: #E53935; position: relative; z-index: 1;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <h2 style="font-size: 2rem; margin-bottom: 1.5rem; color: #fff; position: relative; z-index: 1;">Our <span style="color: #E53935;">Mission</span></h2>
          <p style="color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem; position: relative; z-index: 1;">Since our founding, RFiberX has been on a mission to provide fast, reliable, and affordable internet access without the hassle. We strive to build a strong digital backbone that empowers homes and businesses alike, ensuring every connection we make is a step toward a more connected community.</p>
        </div>

        <!-- Vision Card -->
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem 2rem; text-align: center; position: relative; overflow: hidden; transition: all 0.3s ease; cursor: default;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='#E53935'; this.style.boxShadow='0 20px 40px rgba(229, 57, 53, 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">
          <div style="position: absolute; top: -50px; left: -50px; width: 150px; height: 150px; background: #E53935; filter: blur(80px); border-radius: 50%; opacity: 0.3; z-index: 0;"></div>
          <div style="width: 80px; height: 80px; background: rgba(229, 57, 53, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; color: #E53935; position: relative; z-index: 1;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          <h2 style="font-size: 2rem; margin-bottom: 1.5rem; color: #fff; position: relative; z-index: 1;">Our <span style="color: #E53935;">Vision</span></h2>
          <p style="color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem; position: relative; z-index: 1;">We envision a future where every neighborhood enjoys seamless, high-speed connectivity. By building robust technological bridges, we aim to be the reliable foundation that allows education to flourish online and local businesses to compete, grow, and succeed on a broader stage.</p>
        </div>

        <!-- Mandate Card -->
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem 2rem; text-align: center; position: relative; overflow: hidden; transition: all 0.3s ease; cursor: default;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='#E53935'; this.style.boxShadow='0 20px 40px rgba(229, 57, 53, 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">
          <div style="position: absolute; bottom: -50px; right: -50px; width: 150px; height: 150px; background: #E53935; filter: blur(80px); border-radius: 50%; opacity: 0.3; z-index: 0;"></div>
          <div style="width: 80px; height: 80px; background: rgba(229, 57, 53, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; color: #E53935; position: relative; z-index: 1;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h2 style="font-size: 2rem; margin-bottom: 1.5rem; color: #fff; position: relative; z-index: 1;">Our <span style="color: #E53935;">Mandate</span></h2>
          <p style="color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem; position: relative; z-index: 1;">To bridge communication gaps through innovative telecommunication services, empowering communities with forward-looking network infrastructure that fosters continuous growth, collaboration, and endless digital possibilities.</p>
        </div>
        
      </div>
    </section>



    <!-- Owner Section -->
    <section id="owner" class="section-container scroll-animate">
      <div class="about-owner">
        <div class="about-owner-avatar">
          <div class="about-owner-placeholder">&#128100;</div>
        </div>
        <div class="about-owner-info">
          <h3 class="about-owner-kicker">Leadership</h3>
          <h2 class="about-owner-name">The Founder</h2>
          <h3 style="font-size: 1.75rem; margin-bottom: 1rem; color: var(--accent-color);">Rendell Blanco Noceto</h3>
          <p class="about-owner-role">Founder & CEO, RFiberX Network and Data Solution</p>
          <p class="about-owner-bio">Driven by a passion for technology and a commitment to our hometown, our founder established RFiberX to bring reliable, high-speed internet directly to Magdalena. From our very first installation to where we are today, we have remained dedicated to providing our neighbors with the dependable connectivity they need to learn, work, and stay entertained.</p>
          <blockquote class="about-owner-quote">"Our goal is simple — to ensure our community has the seamless connection it deserves."</blockquote>
        </div>
      </div>
    </section>

    <!-- Our Journey Timeline -->
    <section id="journey" class="journey-section scroll-animate">
      <div class="journey-header">
        <h2>Our <span>Journey</span></h2>
        <p style="color: var(--text-secondary); font-size: 1.1rem;">Key milestones in our mission to connect every Filipino.</p>
      </div>
      <div class="journey-timeline">
        <div class="journey-line"></div>
        
        <div class="journey-item">
          <div class="journey-dot" style="top: 20px;"></div>
          <div class="journey-content">
            <div class="journey-year">2024</div>
            <h3 class="journey-title">Company Founded</h3>
            <p class="journey-desc">RFIBER was founded with a vision to provide world-class internet connectivity across the Philippines.</p>
          </div>
        </div>

        <div class="journey-item">
          <div class="journey-dot" style="top: 20px;"></div>
          <div class="journey-content">
            <div class="journey-year">2025</div>
            <h3 class="journey-title">Pure Fiber Infrastructure</h3>
            <p class="journey-desc">Established our pure fiber infrastructure in Magdalena, delivering fast and stable speeds up to 200 Mbps to power seamless streaming, gaming, and online learning for local households.</p>
          </div>
        </div>

        <div class="journey-item">
          <div class="journey-dot" style="top: 20px;"></div>
          <div class="journey-content">
            <h3 class="journey-title">Expansion</h3>
            <p class="journey-desc">Grew our local network footprint by connecting new barangays, ensuring that more families and small businesses have access to the seamless digital experience they deserve.</p>
          </div>
        </div>

        <div class="journey-item">
          <div class="journey-dot" style="top: 20px;"></div>
          <div class="journey-content">
            <h3 class="journey-title">Most Reliable</h3>
            <p class="journey-desc">Earned the trust of the Magdalena community as the most reliable local network by offering fast, same-day technician response to keep our subscribers connected without the wait.</p>
          </div>
        </div>

        <div class="journey-item">
          <div class="journey-dot" style="top: 20px;"></div>
          <div class="journey-content">
            <div class="journey-year">2026</div>
            <h3 class="journey-title">Subscribed</h3>
            <p class="journey-desc">Join your neighbors in Magdalena who have already made the switch to seamless connectivity. With speeds up to 200 Mbps, absolutely no data caps, and our guaranteed same-day technician support, getting connected has never been this stress-free.</p>
          </div>
        </div>

        <div class="journey-item">
          <div class="journey-dot" style="top: 20px;"></div>
          <div class="journey-content">
            <h3 class="journey-title">Digital Advancement</h3>
            <p class="journey-desc">RFiberX officially went fully digital to bring you maximum convenience. We launched our new website, introduced automated email updates, and rolled out a secure online payment portal that accepts direct bank transfers. Powered by our newly created apps, managing your account and getting support is now just a tap away.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Us & Join Us CTA -->
    <section class="about-cta scroll-animate">
      <div class="about-cta-inner">
        <div class="about-cta-card">
          <h3>Contact Us</h3>
          <p>Have questions or need assistance? Our team is ready to help you get connected with the perfect plan.</p>
          <button class="btn btn-outline" onclick="window.router.navigate('/contact')" style="width: auto;">Get in Touch <span class="btn-arrow">&#8594;</span></button>
        </div>
        <div class="about-cta-card">
          <h3>Join Us</h3>
          <p>Be part of the RFiberX family. We're always looking for talented, passionate individuals to join our growing team.</p>
          <button class="btn btn-outline" onclick="window.router.navigate('/apply')" style="width: auto;">Apply Now <span class="btn-arrow">&#8594;</span></button>
        </div>
      </div>
    </section>
  `,

  '/support/billing': () => `
    <section class="section-container scroll-animate" style="padding-top: 6rem; max-width: 1000px;">
      <div style="text-align: center; margin-top: 2rem; margin-bottom: 4rem;">
        <h2 class="about-mission-title" style="font-size: 3rem; margin-bottom: 1rem;">Billing & <span style="color: var(--accent-color);">Payments</span></h2>
        <p style="font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">Manage your statements, understand your charges, and securely process your payments.</p>
      </div>
      
      <div style="background: var(--glass-bg); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 2rem;">
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">Payment Methods</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 1.05rem;">Payments can be securely processed directly through our billing system. We currently accept the following payment methods:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; transition: transform 0.2s ease, border-color 0.2s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--accent-color)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.05)';">
            <h3 style="color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-color);"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              GCash
            </h3>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Send your payment via GCash to our official company number:</p>
            <p style="font-weight: 700; font-size: 1.4rem; color: var(--accent-color); letter-spacing: 1px;">+63 09058395471</p>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; transition: transform 0.2s ease, border-color 0.2s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--accent-color)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.05)';">
            <h3 style="color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-color);"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              Bank Transfer (BDO Only)
            </h3>
            <p style="color: var(--text-secondary);">Direct bank deposits or online transfers to our official BDO account. Details will be provided upon checkout.</p>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid var(--glass-border); padding-top: 2rem; margin-top: 1rem;">
          <p style="color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 1rem;">If you are already online and have account, please visit the Payment Processing System</p>
          <a href="/clientlogin" target="_blank" rel="noopener noreferrer" class="btn btn-white" style="text-decoration: none;">Go TO RFiberX Payment Processing System</a>
        </div>
      </div>
      
      <div style="background: var(--glass-bg); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 3rem;">
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">Frequently Asked Questions</h2>
        
        <div style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--accent-color);">
          <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">When is my bill due?</h4>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 0;">The start of your billing cycle is the <strong style="color: #fff;">1st of the month</strong>, and the due date is every <strong style="color: #fff;">7th of the month</strong>.</p>
        </div>
        
        <div style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--accent-color);">
          <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">How do I get my Statement of Account (SOA)?</h4>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 0;">We send e-Statements to your registered email address. You can also view it in our upcoming Mobile App.</p>
        </div>
        
        <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--accent-color);">
          <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">Why is my first bill higher than expected?</h4>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 0;">Your first bill includes the one-time <strong style="color: #fff;">installation fee</strong> plus an <strong style="color: #fff;">advance fee</strong> required for your internet service to be fully activated. Subsequent bills will only reflect your regular monthly plan rate.</p>
        </div>
      </div>
      
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
        <button class="btn btn-white rounded-pill" onclick="window.router.navigate('/subscriptions')" style="font-size: 1.1rem; padding: 1rem 2.5rem;">Ready to Have Connection</button>
        <button class="btn btn-outline" onclick="window.router.navigate('/support')" style="width: auto; border: none;">← Back to Support</button>
      </div>
    </section>
  `,

  '/support/technical': () => `
    <section class="section-container scroll-animate" style="padding-top: 6rem; max-width: 1000px;">
      <div style="text-align: center; margin-top: 2rem; margin-bottom: 4rem;">
        <h2 class="about-mission-title" style="font-size: 3rem; margin-bottom: 1rem;">Technical <span style="color: var(--accent-color);">Support</span></h2>
        <p style="font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">Find solutions to common connectivity issues and router configurations to get you back online quickly.</p>
      </div>
      
      <div style="background: var(--glass-bg); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 2rem;">
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">Basic Troubleshooting Guide</h2>
        <ol style="padding-left: 1.5rem; color: var(--text-secondary); line-height: 2; font-size: 1.05rem;">
          <li style="margin-bottom: 1rem;"><strong style="color: #fff;">Check the LOS Light:</strong> If the Red LOS light on your modem is blinking, there is a fiber cut. Please contact support immediately.</li>
          <li style="margin-bottom: 1rem;"><strong style="color: #fff;">Restart Your Modem:</strong> Turn off the modem, unplug it for 5 seconds, then plug it back in. Wait 1-2 minutes for all lights to stabilize.</li>
          <li style="margin-bottom: 1rem;"><strong style="color: #fff;">Check Your Cables:</strong> Ensure the yellow/connector fiber patch cord is securely connected to the router and wall outlet without bending sharply.</li>
          <li><strong style="color: #fff;">Isolate the Issue:</strong> Connect a laptop directly to the router using a LAN cable. If the internet works, the issue might be your Wi-Fi signal.</li>
        </ol>
      </div>

      <div style="background: var(--glass-bg); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 3rem;">
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">Optimizing Your Wi-Fi</h2>
        
        <div style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--accent-color);">
          <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">Where should I place my router?</h4>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 0;">Place your router in an open, central location, off the floor. Avoid putting it near thick walls, microwaves, or large metal objects.</p>
        </div>
        
        <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--accent-color);">
          <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">2.4GHz vs 5GHz?</h4>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 0;">Use <strong style="color: #fff;">5GHz</strong> for devices close to the router (faster speeds, less range). Use <strong style="color: #fff;">2.4GHz</strong> for devices far from the router or older devices (slower speeds, longer range).</p>
        </div>
      </div>

      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; border-top: 1px solid var(--glass-border); padding-top: 3rem; margin-top: 2rem;">
        <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 600px;">If theres another concern that you might be encountering try contacting the Technicians</p>
        <button class="btn btn-white rounded-pill" onclick="window.router.navigate('/contact')" style="font-size: 1.1rem; padding: 1rem 2.5rem;">Contact Technicians</button>
        <button class="btn btn-outline" onclick="window.router.navigate('/support')" style="width: auto; border: none; margin-top: 1rem;">← Back to Support</button>
      </div>
    </section>
  `,

  '/support/account': () => `
    <section class="section-container scroll-animate" style="padding-top: 6rem; max-width: 1000px;">
      <div style="text-align: center; margin-top: 2rem; margin-bottom: 4rem;">
        <h2 class="about-mission-title" style="font-size: 3rem; margin-bottom: 1rem;">Account <span style="color: var(--accent-color);">Management</span></h2>
        <p style="font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">Need to make changes to your existing service? We've got you covered.</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3rem;">
        <div style="background: var(--glass-bg); padding: 2rem; border-radius: 16px; border: 1px solid var(--glass-border);">
          <h3 style="margin-bottom: 1rem; color: var(--accent-color);">Upgrading Your Plan</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">Want faster speeds? You can upgrade your plan at any time without any termination fees. The new speed and billing rate will take effect within 24 hours.</p>
        </div>
        
        <div style="background: var(--glass-bg); padding: 2rem; border-radius: 16px; border: 1px solid var(--glass-border);">
          <h3 style="margin-bottom: 1rem; color: var(--accent-color);">Transfer of Location</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">Moving to a new house? We can transfer your connection to your new address, subject to facility availability in the new area. A standard relocation fee is based on the complexity of the work, most of the time is free.</p>
          <p style="color: var(--text-secondary);">To request a transfer, please contact our support team at least 1 week before your move.</p>
        </div>
        
        <div style="background: var(--glass-bg); padding: 2rem; border-radius: 16px; border: 1px solid var(--glass-border);">
          <h3 style="margin-bottom: 1rem; color: var(--accent-color);">Change of Account Name</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">To transfer ownership of the account, both the current owner and new owner must submit valid Information to our nearest business center.</p>
        </div>

        <div style="text-align: center; border-top: 1px solid var(--glass-border); padding-top: 2rem; margin-top: 1rem;">
          <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.6;">If you already had Payment Process account and also want some changes there, contact the <a href="#" onclick="window.router.navigate('/contact'); return false;" style="color: var(--accent-color); font-weight: bold; text-decoration: underline;">IT Specialist</a> for that.</p>
        </div>
      </div>

      <div style="text-align: center;">
        <button class="btn btn-outline" onclick="window.router.navigate('/support')" style="width: auto;">← Back to Support</button>
      </div>
    </section>
  `,

  '/support/outages': () => `
    <section class="section-container scroll-animate" style="padding-top: 6rem; max-width: 1000px;">
      <div style="text-align: center; margin-top: 2rem; margin-bottom: 4rem;">
        <h2 class="about-mission-title" style="font-size: 3rem; margin-bottom: 1rem;">Outages & <span style="color: var(--accent-color);">Network</span></h2>
        <p style="font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">Stay updated on network maintenance and localized outages.</p>
      </div>
      
      <div style="background: rgba(229, 57, 53, 0.1); border: 1px solid var(--accent-color); padding: 2rem; border-radius: 16px; text-align: center; margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center;">
        <h2 style="color: var(--accent-color); margin-bottom: 0.5rem; font-size: 2rem;">Stay Updated</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 1.1rem; max-width: 500px;">To stay updated about maintenance, news and updates, follow our official page.</p>
        <a href="https://www.facebook.com/RFiber1" target="_blank" rel="noopener noreferrer" class="btn btn-white" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Follow our page
        </a>
      </div>

      <div style="background: var(--glass-bg); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 3rem;">
        <h2 style="margin-bottom: 1.5rem; color: #dc2626;">Report a Downed Line</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">If you see a fallen fiber optic cable or a damaged distribution box on a utility pole, please <b>DO NOT</b> touch it. Report it immediately to our hotline.</p>
        <div style="background: #111; padding: 1.5rem; border-radius: 8px; font-family: monospace; font-size: 1.2rem; text-align: center; letter-spacing: 2px;">
          Call: +63 09913746474
        </div>
      </div>

      <div style="background: var(--glass-bg); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 3rem;">
        <h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">Scheduled Maintenance</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">To ensure optimal performance, we actively and quickly fix broken or downed lines on the same schedule that they occur.</p>
        <p style="color: var(--text-secondary);">We will notify affected subscribers via SMS and Email at least 24 hours prior to any scheduled maintenance.</p>
      </div>

      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; border-top: 1px solid var(--glass-border); padding-top: 3rem; margin-top: 2rem;">
        <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 600px;">If theres another concern that you might be encountering try contacting the Technicians</p>
        <button class="btn btn-white rounded-pill" onclick="window.router.navigate('/contact')" style="font-size: 1.1rem; padding: 1rem 2.5rem;">Contact Technicians</button>
        <button class="btn btn-outline" onclick="window.router.navigate('/support')" style="width: auto; border: none; margin-top: 1rem;">← Back to Support</button>
      </div>
    </section>
  `
};

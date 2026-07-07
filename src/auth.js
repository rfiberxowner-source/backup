// Firebase login logic
window.toggleLoginMethod = function() {
  const isName = document.getElementById('loginMethodToggle').checked;
  const bg = document.getElementById('loginToggleBg');
  const circle = document.getElementById('loginToggleCircle');
  const label = document.getElementById('loginInputLabel');
  const input = document.getElementById('loginIdentifier');
  
  if (isName) {
    bg.style.backgroundColor = '#E53935';
    circle.style.transform = 'translateX(20px)';
    label.textContent = 'Full Name';
    input.placeholder = 'e.g. Jasper Mangulabnan';
  } else {
    bg.style.backgroundColor = '#2d3748';
    circle.style.transform = 'translateX(0px)';
    label.textContent = 'Email address';
    input.placeholder = 'you@example.com';
  }
};

window.submitLogin = async function(event) {
  const isName = document.getElementById('loginMethodToggle').checked;
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorMsg = document.getElementById('loginErrorMsg');
  
  errorMsg.style.display = 'none';
  
  if (!identifier || !password) {
    errorMsg.textContent = 'Please enter both ' + (isName ? 'name' : 'email') + ' and password.';
    errorMsg.style.display = 'block';
    return;
  }

  try {
    const queryField = isName ? 'name' : 'email';
    
    // Import Firestore
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
    try {
      app = initializeApp(firebaseConfig);
    } catch(e) {
      // Firebase already initialized
    }
    const db = getFirestore();
    
    const q = query(collection(db, "users"), where(queryField, "==", identifier));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      errorMsg.textContent = 'Account not found. Please try again.';
      errorMsg.style.display = 'block';
      return;
    }
    
    let authenticated = false;
    let userData = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().password === password) {
        authenticated = true;
        userData = { id: doc.id, ...doc.data() };
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    });
    
    if (authenticated) {
      // Small delay for smooth transition
      const btn = event.target.querySelector('button[type="submit"]');
      if (btn) btn.innerHTML = 'Signing in...';
      
      setTimeout(() => {
        window.router.navigate('/dashboard');
      }, 500);
    } else {
      errorMsg.textContent = 'Incorrect password. Please try again.';
      errorMsg.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    errorMsg.textContent = 'An error occurred during login. Please check console.';
    errorMsg.style.display = 'block';
  }
};
window.submitAdminLogin = async (event) => {
  event.preventDefault();
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const errorMsg = document.getElementById('admin-login-error');
  
  errorMsg.style.display = 'none';

  if (!email || !password) {
    errorMsg.textContent = 'Please enter both email and password.';
    errorMsg.style.display = 'block';
    return;
  }

  try {
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
    try {
      app = initializeApp(firebaseConfig);
    } catch(e) { }
    const db = getFirestore();
    
    const q = query(collection(db, "admin"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      errorMsg.textContent = 'Invalid credentials.';
      errorMsg.style.display = 'block';
      return;
    }
    
    let authenticated = false;
    let adminData = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().password === password) {
        authenticated = true;
        adminData = { id: doc.id, ...doc.data() };
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      }
    });
    
    if (authenticated) {
      const btn = event.target.querySelector('button[type="submit"]');
      if (btn) btn.innerHTML = 'Authorizing...';
      
      setTimeout(() => {
        window.router.navigate('/RFiberXAdminportal-dashboard');
      }, 500);
    } else {
      errorMsg.textContent = 'Invalid credentials.';
      errorMsg.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    errorMsg.textContent = 'System error during login. Please check console.';
    errorMsg.style.display = 'block';
  }
};

window.submitAdminRegister = async (event) => {
  event.preventDefault();
  const name = document.getElementById('admin-reg-name').value.trim();
  const email = document.getElementById('admin-reg-email').value.trim();
  const password = document.getElementById('admin-reg-password').value;
  const errorMsg = document.getElementById('admin-reg-error');
  const successMsg = document.getElementById('admin-reg-success');
  const btn = document.getElementById('admin-reg-btn');
  
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  if (!name || !email || !password) {
    errorMsg.textContent = 'Please fill out all fields.';
    errorMsg.style.display = 'block';
    return;
  }

  btn.innerHTML = 'Creating...';
  btn.disabled = true;

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, query, where, getDocs, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const firebaseConfig = {
      apiKey: "AIzaSyB80-L7Y9KHJbyCG-Q8qd3D-s6yAwFkRYE",
      authDomain: "portal-c293a.firebaseapp.com",
      projectId: "portal-c293a",
      storageBucket: "portal-c293a.firebasestorage.app",
      messagingSenderId: "159583415029",
      appId: "1:159583415029:web:bb5221ff531fa1005a33bc"
    };
    
    let app;
    try {
      app = initializeApp(firebaseConfig);
    } catch(e) { }
    const db = getFirestore();
    
    const q = query(collection(db, "admin"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      errorMsg.textContent = 'Email is already registered as an administrator.';
      errorMsg.style.display = 'block';
      btn.innerHTML = 'Create Account';
      btn.disabled = false;
      return;
    }
    
    await addDoc(collection(db, "admin"), {
      name: name,
      email: email,
      password: password,
      role: 'Minimal',
      createdAt: new Date().toISOString()
    });
    
    successMsg.textContent = 'Admin account created successfully! Redirecting...';
    successMsg.style.display = 'block';
    
    setTimeout(() => {
      window.router.navigate('/RFiberXAdminportal');
    }, 2000);
    
  } catch (error) {
    console.error(error);
    errorMsg.textContent = 'System error during registration. Please check console.';
    errorMsg.style.display = 'block';
    btn.innerHTML = 'Create Account';
    btn.disabled = false;
  }
};

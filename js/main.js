import { setGlobalData } from './state.js';
import { injectToastContainer, initializeBootstrapComponents, injectSignOutModal } from './utils.js';
import { injectComponents } from './components.js';
import { setupLoginForm, setupSignupForm, setupForgotPassword, setupPasswordStrength, setupPasswordToggles } from './auth.js';
import { setupOrganizerForm, setupFileUploads } from './organizer.js';
import { initializeEvents, setupGlobalInteractions } from './events.js';
import { initBookingPage } from './booking.js';
import { initProfilePage } from './profile.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('SyncEvent App Initialized');

    // 1. Determine Path to Data using import.meta.url for reliability
    const dataUrl = new URL('../json/data.json', import.meta.url);

    // 2. Fetch Data
    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            setGlobalData(data);
            initializeEvents();

            if (document.getElementById('booking-event-title')) initBookingPage();
            if (document.getElementById('profile-upcoming-events')) initProfilePage();
        })
        .catch(err => console.log('Data fetch error:', err));

    // 3. Setup Forms & Validation
    setupLoginForm();
    setupSignupForm();
    setupOrganizerForm();
    setupPasswordToggles();
    setupFileUploads();
    setupForgotPassword();
    setupPasswordStrength();
    injectComponents();
    setupGlobalInteractions();

    // 4. Inject Containers
    injectToastContainer();
    injectSignOutModal();

    // 5. Initialize Icons (Global)
    if (window.lucide) lucide.createIcons();

    // 6. Initialize Bootstrap Components
    initializeBootstrapComponents();
});

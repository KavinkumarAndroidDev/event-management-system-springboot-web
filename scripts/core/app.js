import { setGlobalData } from '../shared/state.js';
import { injectToastContainer, initializeBootstrapComponents, injectSignOutModal } from '../shared/utils.js';
import { injectComponents } from '../components/navbar.js';
import { setupLoginForm, setupSignupForm, setupForgotPassword, setupPasswordStrength, setupPasswordToggles } from '../../features/auth/auth.js';
import { setupOrganizerForm, setupFileUploads } from '../../features/organizer/organizer.js';
import { initializeEvents, setupGlobalInteractions } from '../../features/events/events.js';
import { initBookingPage } from '../../features/events/booking.js';
import { initProfilePage } from '../../features/profile/profile.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('SyncEvent App Initialized');

    // 1. Fetch Data from API Endpoints
    Promise.all([
        fetch('http://localhost:3000/users').then(res => res.json()),
        fetch('http://localhost:3000/events').then(res => res.json()),
        fetch('http://localhost:3000/registrations').then(res => res.json()),
        fetch('http://localhost:3000/payments').then(res => res.json())
    ])
        .then(([users, events, registrations, payments]) => {
            const data = { users, events, registrations, payments };
            setGlobalData(data);
            initializeEvents();

            if (document.getElementById('booking-event-title')) initBookingPage();
            if (document.getElementById('profile-upcoming-events')) initProfilePage();
        })
        .catch(err => console.log('API fetch error:', err));

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

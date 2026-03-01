import { setGlobalData } from '../shared/state.js';
import { injectToastContainer, initializeBootstrapComponents, injectSignOutModal } from '../shared/utils.js';
import { injectComponents } from '../components/navbar.js';
import { setupLoginForm, setupSignupForm } from '../../features/auth/auth.js';
import { setupOrganizerForm, setupFileUploads } from '../../features/organizer/organizer.js';
import { setupContactForm } from '../../features/about/contact.js';
import { initializeEvents, setupGlobalInteractions } from '../../features/events/events.js';
import { initBookingPage } from '../../features/events/booking.js';
import { initProfilePage } from '../../features/profile/profile.js';

// Safe Lucide initializer
// NOTE: The Lucide CDN UMD build exposes lucide.createIcons() but does NOT support
// a { root } option — passing unknown options silently breaks icon rendering.
// We always call createIcons() with no arguments to re-scan the entire document.
window.initIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
};

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
    setupContactForm();
    setupFileUploads();
    injectComponents();
    setupGlobalInteractions();

    // 4. Inject Containers
    injectToastContainer();
    injectSignOutModal();

    // 5. Initialize Icons (Global)
    window.initIcons();

    // 6. Initialize Bootstrap Components
    initializeBootstrapComponents();
});
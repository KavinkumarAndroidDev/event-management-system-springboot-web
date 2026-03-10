/**
 * SyncEvent Main Application Entry Point
 * =====================================
 * This is the orchestration layer of the application. It handles:
 * 1. Global initialization (Icons, Toasts, RBAC).
 * 2. Parallel data fetching from the mock API.
 * 3. Centralized State Store population.
 * 4. Dynamic routing and feature-module loading based on page path and user role.
 */

import { setGlobalData } from './shared/state.js';
import { injectToastContainer, initializeBootstrapComponents, injectSignOutModal, injectBackToTopButton, showRestrictedAccessModal, checkPageAccess } from './shared/utils.js';
import { injectComponents } from './components/navbar.js';

/**
 * Lucide Icon Initializer
 * Automatically creates SVG icons from <i data-lucide="..."> tags.
 */
window.initIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
};

/**
 * Application Bootstrapper
 * Runs once the base HTML is fully parsed.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('SyncEvent App Initializing...');

    const path = window.location.pathname;
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role?.name;

    // ─────────────────────────────────────────────────────────────────────────────
    // 0. ACCESS CONTROL (RBAC)
    // ─────────────────────────────────────────────────────────────────────────────
    // Check permissions immediately. If access is denied, we block further 
    // initialization and show the restricted access modal.
    const access = checkPageAccess();
    if (!access.hasAccess) {
        showRestrictedAccessModal(access.redirect);
        return;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. DATA SYNCHRONIZATION
    // ─────────────────────────────────────────────────────────────────────────────
    // Fetch all core application entities concurrently to optimize performance.
    // The data is then saved into the centralized 'state.js' store.
    const dataPromise = Promise.all([
        fetch('http://localhost:3000/users').then(res => res.json()),
        fetch('http://localhost:3000/events').then(res => res.json()),
        fetch('http://localhost:3000/registrations').then(res => res.json()),
        fetch('http://localhost:3000/payments').then(res => res.json()),
        fetch('http://localhost:3000/categories').then(res => res.json()),
        fetch('http://localhost:3000/venues').then(res => res.json())
    ])
        .then(([users, events, registrations, payments, categories, venues]) => {
            const data = { users, events, registrations, payments, categories, venues };
            
            // Populate the central state store
            setGlobalData(data);
            
            // Dispatch custom event for vanilla JS components that rely on events
            document.dispatchEvent(new CustomEvent('dataLoaded', { detail: data }));
            return data;
        })
        .catch(err => {
            console.error('API Synchronization Failure:', err);
            return null;
        });

    /**
     * Data Readiness Wrapper
     * Ensures that logic requiring the global state only runs after the API 
     * fetch has successfully resolved.
     * 
     * @param {Function} callback - Logic to execute once state is ready.
     */
    const whenDataReady = async (callback) => {
        const data = await dataPromise;
        if (data && typeof callback === 'function') {
            callback(data);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. DYNAMIC ROUTING & MODULE LOADING
    // ─────────────────────────────────────────────────────────────────────────────
    // Instead of loading all feature logic upfront, we dynamically import 
    // only the modules needed for the current page.

    // ADMIN FEATURES
    if (path.includes('/pages/admin/')) {
        const admin = await import('./features/admin/admin.js');
        
        // Base admin UI (sidebar etc)
        admin.initAdminPage();

        // Sub-page specific initialization
        if (path.includes('dashboard.html')) {
            whenDataReady(() => admin.initAdminDashboard());
        } else if (path.includes('event-approvals.html')) {
            whenDataReady(() => admin.initEventApprovals());
        } else if (path.includes('organizer-approval.html')) {
            whenDataReady(() => admin.initOrganizerApprovals());
        } else if (path.includes('user-management.html')) {
            whenDataReady(() => admin.initUserManagement());
        } else if (path.includes('events.html')) {
            whenDataReady(() => admin.initAdminEvents());
        } else if (path.includes('offers.html')) {
            whenDataReady(() => admin.initAdminOffers());
        } else if (path.includes('categories.html')) {
            whenDataReady(() => admin.initAdminCategories());
        } else if (path.includes('venues.html')) {
            whenDataReady(() => admin.initAdminVenues());
        } else if (path.includes('tickets-registrations.html')) {
            whenDataReady(() => admin.initAdminTickets());
        } else if (path.includes('payments-revenue.html')) {
            whenDataReady(() => admin.initAdminPayments());
        } else if (path.includes('reports-analytics.html')) {
            whenDataReady(() => admin.initAdminReports());
        } else if (path.includes('feedback-moderation.html')) {
            whenDataReady(() => admin.initAdminFeedback());
        } else if (path.includes('notifications.html')) {
            whenDataReady(() => admin.initAdminNotifications());
        } else if (path.includes('profile.html')) {
            admin.initAdminProfile();
        }
    }

    // ORGANIZER FEATURES
    if (path.includes('/pages/organizer/') && !path.includes('signup.html')) {
        const admin = await import('./features/admin/admin.js');
        admin.initAdminPage(); // Organizers use common layout logic

        const org = await import('./features/organizer/organizer.js');

        if (path.includes('dashboard.html')) {
            whenDataReady(() => org.initOrganizerDashboard());
        } else if (path.includes('my-events.html')) {
            whenDataReady(() => org.initMyEvents());
        } else if (path.includes('registrations.html')) {
            whenDataReady(() => org.initRegistrations());
        } else if (path.includes('ticket-management.html')) {
            whenDataReady(() => org.initTicketManagement());
        } else if (path.includes('reports.html')) {
            whenDataReady(() => org.initReports());
        } else if (path.includes('profile.html')) {
            whenDataReady(() => org.initOrganizerProfile());
        } else if (path.includes('notifications.html')) {
            whenDataReady(() => org.initOrganizerNotifications());
        } else if (path.includes('payments.html')) {
            whenDataReady(() => org.initOrganizerPayments());
        } else if (path.includes('offers.html')) {
            whenDataReady(() => org.initOrganizerOffers());
        }
    }

    // GUEST / ATTENDEE FEATURES
    if (path.includes('/organizer/signup')) {
        const { setupOrganizerForm, setupFileUploads } = await import('./features/organizer/organizer.js');
        setupOrganizerForm();
        setupFileUploads();
    }

    if (path.includes('/events') && !path.includes('details') && !path.includes('booking')) {
        const { initializeEvents, setupGlobalInteractions } = await import('./features/events/events.js');
        whenDataReady(() => initializeEvents());
        setupGlobalInteractions();
    } else if (path.includes('/events/details')) {
        const { initializeDetails } = await import('./features/events/details.js');
        const { validateBookingAccess } = await import('./features/attendee/attendee.js');
        whenDataReady(() => {
            initializeDetails();
            validateBookingAccess(role);
        });
    } else if (path.includes('/events/booking')) {
        const { initBookingPage } = await import('./features/events/booking.js');
        whenDataReady(() => initBookingPage());
    }

    // HOME PAGE
    if (path === '/' || path.endsWith('/index.html') || path === '') {
        const { initializeEvents } = await import('./features/events/events.js');
        whenDataReady(() => initializeEvents());
    }

    // ATTENDEE PROFILE
    if (path.includes('/pages/profile/')) {
        const { initProfilePage } = await import('./features/profile/profile.js');
        whenDataReady(() => initProfilePage());
    }

    // AUTH (LOGIN/SIGNUP)
    if (path.includes('/auth/login')) {
        const { setupLoginForm } = await import('./features/auth/login.js');
        setupLoginForm();
    } else if (path.includes('/auth/signup')) {
        const { setupSignupForm } = await import('./features/auth/signup.js');
        setupSignupForm();
    }

    // ABOUT / CONTACT
    if (path.includes('/about/contact')) {
        const { setupContactForm } = await import('./features/about/about.js');
        setupContactForm();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. GLOBAL UI INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────
    injectComponents();           // Navbar, Footer
    injectToastContainer();      // Toast system
    injectSignOutModal();        // Signout dialog
    injectBackToTopButton();     // Scroll helper
    window.initIcons();          // Lucide icons
    initializeBootstrapComponents(); // Tooltips & Popovers
});

import { showToast } from './utils.js';

export function updateNavbar() {
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    const path = window.location.pathname;
    const isEventsPage = path.includes('events.html');
    const isHtmlDir = path.includes('/html/');
    const isLoginPage = path.includes('login.html');

    // Login Page Warning
    if (isLoginPage && user) {
        showToast('Notice', 'You are already logged in. Logging in again will start a new session.', 'info');
    }

    const headerRight = document.querySelector('.header-right');
    const headerCenter = document.querySelector('.header-center');

    // Determine path depth
    const isInHtmlDir = window.location.pathname.includes('/html/');
    const isInEventsDir = window.location.pathname.includes('/events/');
    let rootPath = './';
    if (isInEventsDir) rootPath = '../../';
    else if (isInHtmlDir) rootPath = '../';

    // 1. Update Header Center (Nav Links)
    if (headerCenter) {
        headerCenter.innerHTML = `
            <a href="${rootPath}index.html" class="btn btn-text nav-link-btn text-neutral-900">Home</a>
            <a href="${rootPath}html/events/events.html" class="btn btn-text nav-link-btn text-neutral-900">Events</a>
            <a href="${rootPath}html/about.html" class="btn btn-text nav-link-btn text-neutral-900">About</a>
            <a href="${rootPath}html/contact.html" class="btn btn-text nav-link-btn text-neutral-900">Contact</a>
            <div class="dropdown">
                <button class="btn btn-text nav-link-btn dropdown-toggle text-neutral-900"
                    data-bs-toggle="dropdown" aria-expanded="false">Location</button>
                <ul class="dropdown-menu">
                    <li><button class="dropdown-item" type="button">Coimbatore</button></li>
                    <li><button class="dropdown-item" type="button">Chennai</button></li>
                    <li><button class="dropdown-item" type="button">Madurai</button></li>
                </ul>
            </div>
        `;
    }

    if (!headerRight) return;

    if (user) {
        // Logged In State
        const initials = user.profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const firstName = user.profile.fullName.split(' ')[0];

        // 2. Update Header Right (User Profile)
        headerRight.innerHTML = `
            <a href="${rootPath}html/notifications.html" class="icon-circle btn p-0 me-2 text-decoration-none d-inline-flex align-items-center justify-content-center">
                <i data-lucide="bell" width="20" height="20"></i>
            </a>
            
            <div class="dropdown d-inline-block">
                <div class="d-flex align-items-center gap-2 cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
                    <span class="avatar-circle">${initials}</span>
                    <span class="welcome-text d-none d-sm-inline-block">Welcome, ${firstName}</span>
                </div>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="${rootPath}html/profile.html">My Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" id="logoutBtn">Logout</button></li>
                </ul>
            </div>
        `;

        document.querySelector('.site-header')?.classList.remove('search-variant');

        // Attach Logout Listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                const modalEl = document.getElementById('signOutModal');
                if (modalEl) new bootstrap.Modal(modalEl).show();
            });
        }

    } else {
        // Guest State
        headerRight.innerHTML = `
            <div id="guestState" class="auth-state">
                <a href="${rootPath}html/login.html" class="btn btn-text">Login</a>
                <a href="${rootPath}html/signup.html" class="btn btn-primary">
                    <span>Signup</span>
                    <i data-lucide="arrow-right" class="btn-icon"></i>
                </a>
            </div>
        `;
    }

    // Location Selector Logic
    const locationDropdown = document.querySelector('.header-center .dropdown-toggle');
    if (locationDropdown) {
        const locationItems = document.querySelectorAll('.header-center .dropdown-item');
        locationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                locationDropdown.innerText = e.target.innerText;
            });
        });
    }

    if (window.lucide) lucide.createIcons();
}
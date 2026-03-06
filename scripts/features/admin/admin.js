import { injectSignOutModal, populateSidebarUserInfo, showToast } from '../../shared/utils.js';

export function initAdminPage() {
    console.log('Admin Page Initialized');

    // Global Admin Initializations
    injectSignOutModal();
    populateSidebarUserInfo();

    // Setup Admin specific global listeners
    setupAdminLogout();
}

function setupAdminLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const modalEl = document.getElementById('signOutModal');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        });
    }

    // Simplified: injectSignOutModal handles the confirm button
}

/**
 * Shared helper for showing approval/rejection modals across admin pages
 */
export function showApproveModal(name, onConfirm) {
    const modalText = document.getElementById('approveModalText');
    if (modalText) {
        modalText.textContent = `Are you sure you want to approve "${name}"? This event will be published and visible to all users.`;
    }
    const modalEl = document.getElementById('approveModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

export function showRejectModal(name, onConfirm) {
    const modalText = document.getElementById('rejectModalText');
    if (modalText) {
        modalText.textContent = `Please provide a reason for rejecting "${name}":`;
    }
    const modalEl = document.getElementById('rejectModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

import { showToast } from '../../shared/utils.js';

export function initAttendeeFeatures() {
    console.log('Attendee Features Initialized');
    // Implement attendee specific global logic here
}

/**
 * Restricted booking check for Event Details page
 */
export function validateBookingAccess(role) {
    if (role !== 'ATTENDEE') {
        const bookingBtn = document.getElementById('bookEventBtn');
        if (bookingBtn) {
            bookingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Attendee Access Only', 'Only attendees can book events. Please sign up as an attendee to continue.', 'warning');
            });
        }
    }
}

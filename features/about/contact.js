import { showToast } from '../../scripts/shared/utils.js';

export function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    import('../../scripts/shared/utils.js').then(m => {
        m.setupRealtimeValidation('contactForm');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (form.checkValidity()) {
            // Form is valid
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            // Show loading state
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';

            setTimeout(() => {
                showToast('Message Sent', 'We have received your message and will get back to you shortly.', 'success');
                form.reset();
                form.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));

                btn.disabled = false;
                btn.innerHTML = originalText;
                if (window.initIcons) window.initIcons({ root: btn });
            }, 1000); // Simulate network request
        }
    });
}

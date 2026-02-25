import { state } from './state.js';
import { showToast } from './utils.js';

export function performLogin(email, password, rememberMe = false, onRedirect = null) {
    if (!state.users || state.users.length === 0) {
        showToast('System Error', 'User data not loaded yet. Please try again.', 'warning');
        return false;
    }

    const user = state.users.find(u => u.profile.email === email && u.password === password);

    if (user) {
        if (user.accountStatus.status !== 'ACTIVE') {
            // Create the suspended modal dynamically if it doesn't exist
            let modalEl = document.getElementById('suspendedAccountModal');
            if (!modalEl) {
                modalEl = document.createElement('div');
                modalEl.id = 'suspendedAccountModal';
                modalEl.className = 'modal fade';
                modalEl.tabIndex = -1;
                modalEl.innerHTML = `
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 shadow-lg rounded-4">
                            <div class="modal-header border-0 pb-0">
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body text-center pt-0 pb-4 px-4">
                                <div class="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-3 mb-3">
                                    <i data-lucide="ban" width="32" height="32"></i>
                                </div>
                                <h4 class="fw-bold mb-2">Account Suspended</h4>
                                <p class="text-neutral-600 mb-4">Your account is currently suspended. Please contact support to resolve this issue.</p>
                                <button type="button" class="btn btn-primary w-100 rounded-pill mb-2" data-bs-dismiss="modal">Close</button>
                                <a href="contact.html" class="btn btn-outline-dark w-100 rounded-pill">Contact Support</a>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modalEl);
                if (window.lucide) lucide.createIcons();
            }
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
            return false;
        }

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        }

        const sessionUser = { ...user };
        delete sessionUser.password;
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));

        showToast('Success', `Welcome back, ${user.profile.fullName}!`, 'success');

        setTimeout(() => {
            if (onRedirect) {
                onRedirect(user);
            } else {
                const role = user.role.name;
                if (role === 'ATTENDEE') {
                    window.location.href = '../index.html';
                } else if (role === 'ORGANIZER') {
                    window.location.href = 'organizer-dashboard.html';
                } else if (role === 'ADMIN') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
            }
        }, 1000);
        return true;
    } else {
        showToast('Error', 'Invalid email or password.', 'danger');
        return false;
    }
}

export function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        const emailInput = form.querySelector('input[type="email"]');
        const rememberMe = document.getElementById('rememberMe');
        if (emailInput) emailInput.value = savedEmail;
        if (rememberMe) rememberMe.checked = true;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');

        if (form.checkValidity()) {
            const emailInput = form.querySelector('input[type="email"]');
            const passwordInput = form.querySelector('input[type="password"]');
            const rememberMe = document.getElementById('rememberMe');

            const email = emailInput.value;
            const password = passwordInput.value;
            const remember = rememberMe ? rememberMe.checked : false;

            const success = performLogin(email, password, remember);

            if (success) {
                const btn = form.querySelector('button[type="submit"]');
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';
                }
            } else {
                passwordInput.value = '';
                form.classList.remove('was-validated');
            }
        }
    });
}

export function setupSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    // Real-time password match validation
    const passwordInputs = form.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
        const password = passwordInputs[0];
        const confirm = passwordInputs[1];

        const validateMatch = () => {
            if (confirm.value && password.value !== confirm.value) {
                confirm.setCustomValidity("Passwords do not match");
            } else {
                confirm.setCustomValidity("");
            }
        };

        password.addEventListener('input', validateMatch);
        confirm.addEventListener('input', validateMatch);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        form.classList.add('was-validated');

        if (form.checkValidity()) {
            const email = form.querySelector('input[type="email"]').value;

            // Edge Case: Email exists
            const exists = state.users.some(u => u.profile.email === email);
            if (exists) {
                showToast('Error', 'Email already registered. Please login.', 'warning');
                return;
            }

            showToast('Success', 'Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    });
}

export function setupForgotPassword() {
    const form = document.getElementById('forgotPasswordForm');
    if (!form) return;

    const newPassInput = document.getElementById('fpNewPassword');
    const confirmPassInput = document.getElementById('fpConfirmPassword');

    const validateMatch = () => {
        if (confirmPassInput.value && newPassInput.value !== confirmPassInput.value) {
            confirmPassInput.setCustomValidity("Passwords do not match");
        } else {
            confirmPassInput.setCustomValidity("");
        }
    };
    newPassInput.addEventListener('input', validateMatch);
    confirmPassInput.addEventListener('input', validateMatch);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');

        if (form.checkValidity()) {
            const email = document.getElementById('fpEmail').value;
            const oldPass = document.getElementById('fpOldPassword').value;
            const newPass = document.getElementById('fpNewPassword').value;

            const user = state.users.find(u => u.profile.email === email && u.password === oldPass);

            if (!user) {
                showToast('Error', 'Invalid email or old password.', 'danger');
                return;
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
            if (!passwordRegex.test(newPass)) {
                showToast('Error', 'Password must be at least 6 chars, contain 1 uppercase, 1 lowercase, and 1 special char.', 'warning');
                return;
            }

            if (newPass === oldPass) {
                showToast('Error', 'New password cannot be the same as the old password.', 'warning');
                return;
            }

            showToast('Success', 'Password reset successfully! You can now login.', 'success');
            const modalEl = document.getElementById('forgotPasswordModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            form.reset();
            form.classList.remove('was-validated');
        }
    });
}

export function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        const wrapper = btn.closest('.input-group') || btn.closest('.position-relative');
        if (!wrapper) return;

        const input = wrapper.querySelector('input');
        if (input && btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                if (window.lucide && window.lucide.createIcons) {
                    const iconName = isPassword ? 'eye' : 'eye-off';
                    btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
                    window.lucide.createIcons({
                        root: btn,
                        attrs: {
                            width: 20,
                            height: 20,
                            "stroke-width": 1.5
                        }
                    });
                }
            });
        }
    });
}

export function setupPasswordStrength() {
    const passwordInput = document.querySelector('#signupForm input[type="password"]');
    const strengthMeter = document.getElementById('passwordStrength');

    if (!passwordInput || !strengthMeter) return;

    const progressBar = strengthMeter.querySelector('.progress-bar');
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqSpecial = document.getElementById('req-special');

    passwordInput.addEventListener('focus', () => {
        strengthMeter.classList.remove('d-none');
    });

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let strength = 0;

        const hasLength = val.length >= 6;
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

        const updateRequirement = (el, isValid) => {
            if (isValid) {
                el.classList.remove('text-neutral-400');
                el.classList.add('text-success');
            } else {
                el.classList.remove('text-success');
                el.classList.add('text-neutral-400');
            }
        };

        updateRequirement(reqLength, hasLength);
        updateRequirement(reqUpper, hasUpper);
        updateRequirement(reqLower, hasLower);
        updateRequirement(reqSpecial, hasSpecial);

        if (hasLength) strength += 25;
        if (hasUpper) strength += 25;
        if (hasLower) strength += 25;
        if (hasSpecial) strength += 25;

        progressBar.style.width = strength + '%';

        if (strength <= 25) {
            progressBar.className = 'progress-bar bg-danger';
        } else if (strength <= 50) {
            progressBar.className = 'progress-bar bg-warning';
        } else if (strength <= 75) {
            progressBar.className = 'progress-bar bg-info';
        } else {
            progressBar.className = 'progress-bar bg-success';
        }
    });
}
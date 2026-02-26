import { showToast } from '../../scripts/shared/utils.js';

export function setupOrganizerForm() {
    const form = document.getElementById('organizerForm');
    if (!form) return;

    const btnNext1 = document.getElementById('orgBtnNext1');
    const btnNext2 = document.getElementById('orgBtnNext2');
    const btnBack1 = document.getElementById('orgBtnBack1');
    const btnBack2 = document.getElementById('orgBtnBack2');

    // Password match validation for Step 1
    const step1 = document.getElementById('step1');
    if (step1) {
        const passwordInputs = step1.querySelectorAll('input[type="password"]');
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
    }

    const showStep = (step) => {
        document.getElementById('step1').classList.add('d-none');
        document.getElementById('step2').classList.add('d-none');
        document.getElementById('step3').classList.add('d-none');
        document.getElementById('step' + step).classList.remove('d-none');

        const progress = document.getElementById('stepperProgress');
        const ind1 = document.getElementById('stepIndicator1');
        const ind2 = document.getElementById('stepIndicator2');
        const ind3 = document.getElementById('stepIndicator3');
        const subtext = document.getElementById('stepSubtext');

        [ind1, ind2, ind3].forEach(el => el.classList.remove('active', 'completed'));

        if (step === 1) {
            progress.style.width = '0%';
            ind1.classList.add('active');
            subtext.innerText = 'Apply to host and manage events on SyncEvent.';
        } else if (step === 2) {
            progress.style.width = '50%';
            ind1.classList.add('completed');
            ind2.classList.add('active');
            subtext.innerText = 'Tell us about your organization';
        } else if (step === 3) {
            progress.style.width = '100%';
            ind1.classList.add('completed');
            ind2.classList.add('completed');
            ind3.classList.add('active');
            subtext.innerText = 'Help us verify your organization';
        }
    };

    const validateStep = (stepId) => {
        const stepEl = document.getElementById(stepId);
        const inputs = stepEl.querySelectorAll('input, select, textarea');
        let valid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.classList.add('is-invalid');
                valid = false;
            } else {
                input.classList.remove('is-invalid');
            }
            input.addEventListener('input', () => input.classList.remove('is-invalid'));
            input.addEventListener('change', () => input.classList.remove('is-invalid'));
        });
        return valid;
    };

    if (btnNext1) btnNext1.addEventListener('click', () => validateStep('step1') ? showStep(2) : showToast('Error', 'Please fill all required fields', 'danger'));
    if (btnNext2) btnNext2.addEventListener('click', () => validateStep('step2') ? showStep(3) : showToast('Error', 'Please fill all required fields', 'danger'));
    if (btnBack1) btnBack1.addEventListener('click', () => showStep(1));
    if (btnBack2) btnBack2.addEventListener('click', () => showStep(2));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep('step3')) {
            const confirmCheckbox = document.getElementById('confirmDetails');
            if (!confirmCheckbox.checked) {
                showToast('Error', 'Please confirm that details are accurate', 'warning');
                return;
            }
            document.getElementById('formContainer').classList.add('d-none');
            document.getElementById('successState').classList.remove('d-none');
        } else {
            showToast('Error', 'Please complete verification details', 'danger');
        }
    });
}

export function setupFileUploads() {
    document.querySelectorAll('.upload-box').forEach(box => {
        const wrapper = box.closest('.position-relative');
        if (!wrapper) return;

        const input = wrapper.querySelector('input[type="file"]');
        if (!input) return;

        const originalContent = box.innerHTML;

        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file) {
                box.classList.add('border-success', 'bg-success-subtle');
                input.classList.remove('is-invalid');

                box.innerHTML = `
                    <div class="d-flex flex-column align-items-center justify-content-center position-relative" style="z-index: 10;">
                        <i data-lucide="file-check" class="text-success mb-2" width="32" height="32"></i>
                        <p class="fw-medium text-neutral-900 mb-1 text-break text-center" style="max-width: 200px; font-size: 0.9rem;">${file.name}</p>
                        <p class="small text-neutral-500 mb-3">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-file">Remove</button>
                            <button type="button" class="btn btn-sm btn-outline-primary btn-change-file">Change</button>
                        </div>
                    </div>
                `;

                if (window.lucide) lucide.createIcons({ root: box });

                box.querySelector('.btn-remove-file').addEventListener('click', (e) => {
                    e.preventDefault();
                    input.value = '';
                    box.innerHTML = originalContent;
                    box.classList.remove('border-success', 'bg-success-subtle');
                    if (window.lucide) lucide.createIcons({ root: box });
                });

                box.querySelector('.btn-change-file').addEventListener('click', () => input.click());
            }
        });
    });
}

const fs = require('fs');
const file = 'd:/project-vsc/EMS/html/events/event-details.html';
const content = fs.readFileSync(file, 'utf8');

const targetContainerOpen = '<div class="d-flex flex-column gap-3 mt-4">';
const targetContainerClose = '</div>';

const startIndex = content.lastIndexOf(targetContainerOpen);
if (startIndex !== -1) {
    const pre = content.substring(0, startIndex);
    const postStart = content.substring(startIndex + targetContainerOpen.length);
    const endIndex = postStart.indexOf(targetContainerClose);

    if (endIndex !== -1) {
        const post = postStart.substring(endIndex + targetContainerClose.length);
        const replacement = `
                    <form id="modalLoginForm" class="text-start mt-4 w-100" novalidate>
                        <div class="mb-3">
                            <label class="form-label fw-medium text-neutral-900 small">Email</label>
                            <input type="email" class="form-control" name="email" placeholder="john@example.com" required>
                        </div>
                        <div class="mb-4">
                            <label class="form-label fw-medium text-neutral-900 small">Password</label>
                            <input type="password" class="form-control" name="password" placeholder="••••••••" required>
                        </div>
                        <div class="d-flex flex-column gap-3">
                            <button type="submit" class="btn btn-primary rounded-pill w-100 d-flex align-items-center justify-content-center gap-2">Log in to continue</button>
                            <a href="../../html/signup.html" class="btn btn-outline-dark rounded-pill w-100">Create an account</a>
                        </div>
                    </form>`;
        fs.writeFileSync(file, pre + replacement + post, 'utf8');
        console.log('Replaced successfully via local script');
    } else {
        console.log('Target container close not found');
    }
} else {
    console.log('Target container open not found');
}

import { state } from '../../scripts/shared/state.js';
import { showToast } from '../../scripts/shared/utils.js';

export function initBookingPage() {
    // Auth Check
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = '../login.html';
        return;
    }

    const user = JSON.parse(userStr);
    if (user.role && user.role.name !== 'ATTENDEE') {
        window.location.href = '../../index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId || !state.events) return;

    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    // Populate Header Info
    document.getElementById('booking-event-title').textContent = event.title;
    const date = new Date(event.schedule.startDateTime);
    document.getElementById('booking-event-date').textContent =
        date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' • ' + event.venue.name;
    document.getElementById('summary-event-title').textContent = event.title;
    document.getElementById('summary-event-date').textContent =
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Update Summary Image
    const summaryImg = document.getElementById('summary-event-img');
    if (summaryImg) {
        summaryImg.setAttribute('src', event.media.thumbnail);
        summaryImg.setAttribute('alt', event.title);
        summaryImg.style.objectFit = 'cover';
    }

    // Render Tickets
    const container = document.getElementById('tickets-container');
    const cart = {};
    let currentDiscount = 0; // Discount percentage

    event.tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'card-custom';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 class="fw-bold text-neutral-900 mb-1">${ticket.type.replace('_', ' ')}</h4>
                    <div class="fs-5 fw-bold text-primary">₹${ticket.price}</div>
                </div>
                <div class="ticket-action" data-id="${ticket.id}" data-price="${ticket.price}">
                    <button class="btn btn-outline-primary rounded-pill px-4 btn-add">Add</button>
                    <div class="quantity-control d-none">
                        <button class="quantity-btn btn-minus"><i data-lucide="minus" width="16"></i></button>
                        <span class="fw-bold mx-2 count">0</span>
                        <button class="quantity-btn btn-plus"><i data-lucide="plus" width="16"></i></button>
                    </div>
                </div>
            </div>
            <hr class="border-neutral-100 my-3">
            <ul class="list-unstyled mb-0 text-neutral-400 small">
                ${ticket.benefits.map(b => `<li class="mb-1"><i data-lucide="check" width="14" class="me-2 text-success"></i>${b}</li>`).join('')}
            </ul>
        `;
        container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();

    // Event Delegation for Ticket Actions
    container.addEventListener('click', (e) => {
        const actionDiv = e.target.closest('.ticket-action');
        if (!actionDiv) return;

        const id = actionDiv.dataset.id;
        const btnAdd = actionDiv.querySelector('.btn-add');
        const qtyControl = actionDiv.querySelector('.quantity-control');
        const countSpan = actionDiv.querySelector('.count');
        const card = actionDiv.closest('.card-custom');

        // Calculate total current tickets
        const totalTickets = Object.values(cart).reduce((a, b) => a + b, 0);

        if (e.target.closest('.btn-add')) {
            if (totalTickets >= 10) {
                showToast('Limit Reached', 'You can only book up to 10 tickets at a time.', 'warning');
                return;
            }
            cart[id] = 1;
            card.classList.add('selected');
            btnAdd.classList.add('d-none');
            qtyControl.classList.remove('d-none');
            countSpan.textContent = 1;
        } else if (e.target.closest('.btn-plus')) {
            if (totalTickets >= 10) {
                showToast('Limit Reached', 'You can only book up to 10 tickets at a time.', 'warning');
                return;
            }
            cart[id] = (cart[id] || 0) + 1;
            countSpan.textContent = cart[id];
        } else if (e.target.closest('.btn-minus')) {
            cart[id] = (cart[id] || 0) - 1;
            if (cart[id] <= 0) {
                delete cart[id];
                btnAdd.classList.remove('d-none');
                qtyControl.classList.add('d-none');
                card.classList.remove('selected');
            } else {
                countSpan.textContent = cart[id];
            }
        }
        updateSummary(cart, event.tickets);
    });

    // Update Sticky Summary
    function updateSummary(cart, tickets) {
        let subtotal = 0;
        let count = 0;
        Object.keys(cart).forEach(id => {
            const ticket = tickets.find(t => t.id === id);
            if (ticket) {
                subtotal += ticket.price * cart[id];
                count += cart[id];
            }
        });

        const sticky = document.getElementById('sticky-summary');

        // Calculate financial breakdowns
        const discountAmount = (subtotal * currentDiscount) / 100;
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = subtotalAfterDiscount * 0.18; // 18% tax
        const total = subtotalAfterDiscount + taxAmount;

        const isPaymentStep = !document.getElementById('step-payment').classList.contains('d-none');

        if (count > 0) {
            if (!isPaymentStep) sticky.classList.add('visible');
            document.getElementById('sticky-total').textContent = `₹${total.toFixed(2)}`;
            document.getElementById('sticky-count').textContent = `${count} Ticket${count > 1 ? 's' : ''}`;

            // Populate Right side summary box metrics
            const subtotalEl = document.getElementById('summary-subtotal');
            if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;

            const taxEl = document.getElementById('summary-tax');
            if (taxEl) taxEl.textContent = `₹${taxAmount.toFixed(2)}`;

            const totalEl = document.getElementById('summary-total');
            if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;

            const payBtnAmount = document.getElementById('pay-btn-amount');
            if (payBtnAmount) payBtnAmount.textContent = `₹${total.toFixed(2)}`;

            const discountRow = document.getElementById('summary-discount-row');
            if (discountRow && currentDiscount > 0) {
                discountRow.classList.remove('d-none');
                document.getElementById('summary-discount').textContent = `-₹${discountAmount.toFixed(2)}`;
            } else if (discountRow) {
                discountRow.classList.add('d-none');
            }

        } else {
            sticky.classList.remove('visible');
            currentDiscount = 0; // Reset discount if cart empty
            if (document.getElementById('summary-discount-row')) document.getElementById('summary-discount-row').classList.add('d-none');
        }
    }

    // Discount Code Logic
    const btnApplyDiscount = document.getElementById('btn-apply-discount');
    if (btnApplyDiscount) {
        btnApplyDiscount.addEventListener('click', () => {
            const codeInput = document.getElementById('discount-code').value.trim();
            if (!codeInput) return;

            // Check global or mock offers
            const mockOffers = [
                { code: 'SAVE20', discountPercentage: 20 },
                { code: 'EARLYBIRD', discountPercentage: 15 },
                { code: 'FESTIVAL50', discountPercentage: 50 },
                { code: 'WELCOME10', discountPercentage: 10 }
            ];

            let offer = null;
            if (event.pricing && event.pricing.offers) {
                offer = event.pricing.offers.find(o => o.code.toUpperCase() === codeInput.toUpperCase());
            }
            if (!offer) {
                offer = mockOffers.find(o => o.code.toUpperCase() === codeInput.toUpperCase());
            }

            if (offer) {
                currentDiscount = offer.discountPercentage;
                showToast('Success', `Offer applied! ${currentDiscount}% off.`, 'success');
                updateSummary(cart, event.tickets);
            } else {
                currentDiscount = 0;
                showToast('Invalid Code', 'The offer code entered is not valid.', 'danger');
                updateSummary(cart, event.tickets);
            }
        });
    }

    // Proceed to Payment
    const proceedBtn = document.getElementById('btn-proceed');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            document.getElementById('step-select-tickets').classList.add('d-none');
            document.getElementById('step-payment').classList.remove('d-none');
            document.getElementById('sticky-summary').classList.remove('visible');

            document.getElementById('step1-indicator').classList.remove('active');
            document.getElementById('step2-indicator').classList.add('active');

            // Render booking summary items
            const summaryContainer = document.getElementById('booking-summary-items');
            if (summaryContainer) {
                summaryContainer.innerHTML = '';
                Object.keys(cart).forEach(id => {
                    const ticket = event.tickets.find(t => t.id === id);
                    const qty = cart[id];
                    summaryContainer.innerHTML += `
                        <div class="d-flex justify-content-between small">
                            <span class="text-neutral-600">${qty} x ${ticket.type}</span>
                            <span class="fw-medium">₹${ticket.price * qty}</span>
                        </div>
                    `;
                });
            }
        });
    }

    // Go Back Logic
    const goBackBtn = document.getElementById('btn-go-back');
    if (goBackBtn) {
        goBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('step-payment').classList.add('d-none');
            document.getElementById('step-select-tickets').classList.remove('d-none');
            document.getElementById('step2-indicator').classList.remove('active');
            document.getElementById('step1-indicator').classList.add('active');

            // Re-evaluate sticky summary visibility
            if (Object.keys(cart).length > 0) {
                document.getElementById('sticky-summary').classList.add('visible');
            }
        });
    }

    // Payment Option Selection Logic
    const paymentOptions = document.querySelectorAll('.payment-method-card');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Reset all options
            paymentOptions.forEach(opt => {
                opt.classList.remove('border-primary', 'bg-primary-subtle', 'bg-opacity-10');
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            });
            // Select clicked option
            option.classList.add('border-primary', 'bg-primary-subtle', 'bg-opacity-10');
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    // Handle Payment with Validation
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        // Enforce Novalidate to handle manually
        paymentForm.setAttribute('novalidate', true);

        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!paymentForm.checkValidity()) {
                e.stopPropagation();
                paymentForm.classList.add('was-validated');
                return; // Stop processing if validaton fails
            }

            const btn = document.getElementById('btn-pay-now');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';

            const paymentMethodEl = document.querySelector('.payment-method-card input[type="radio"]:checked');
            const method = paymentMethodEl ? paymentMethodEl.id.replace('pay-', '').toUpperCase() : 'CARD';

            // Calculate total one more time
            let subtotal = 0;
            Object.keys(cart).forEach(id => {
                const ticket = event.tickets.find(t => t.id === id);
                if (ticket) subtotal += ticket.price * cart[id];
            });
            const discountAmount = (subtotal * currentDiscount) / 100;
            const subtotalAfterDiscount = subtotal - discountAmount;
            const taxAmount = subtotalAfterDiscount * 0.18;
            const totalAmount = subtotalAfterDiscount + taxAmount;

            const regId = 'REG-' + Date.now();
            const payId = 'PAY-' + Date.now();

            let firstTicketName = Object.keys(cart).length > 0 ? event.tickets.find(t => t.id === Object.keys(cart)[0]).type.replace('_', ' ') : 'General';
            let totalTicketsQty = Object.values(cart).reduce((a, b) => a + b, 0);

            const registrationData = {
                id: regId,
                userId: user.id,
                eventId: event.id,
                eventName: event.title,
                date: event.schedule.startDateTime,
                location: `${event.venue.name}, ${event.venue.address.city}`,
                ticketType: firstTicketName,
                quantity: totalTicketsQty,
                price: subtotalAfterDiscount + taxAmount,
                status: 'CONFIRMED',
                img: event.media.thumbnail
            };

            const paymentData = {
                id: payId,
                userId: user.id,
                eventTitle: event.title,
                date: new Date().toISOString(),
                tickets: `${firstTicketName} x ${totalTicketsQty}`,
                method: method,
                amount: totalAmount,
                status: 'Confirmed'
            };

            // 1. Deduct ticket quantities
            const updatedTickets = event.tickets.map(ticket => {
                if (cart[ticket.id]) {
                    return { ...ticket, availableQuantity: Math.max(0, ticket.availableQuantity - cart[ticket.id]) };
                }
                return ticket;
            });

            // 2. Perform all API calls in parallel
            Promise.all([
                fetch('http://localhost:3000/registrations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationData)
                }).then(r => r.json()),
                fetch('http://localhost:3000/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData)
                }).then(r => r.json()),
                fetch(`http://localhost:3000/events/${event.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tickets: updatedTickets })
                }).then(r => r.json())
            ])
                .then(([newReg, newPay, updatedEvent]) => {
                    state.registrations.push(newReg);
                    state.payments.push(newPay);

                    // Update the global state with the new event ticket counts
                    const eventIndex = state.events.findIndex(e => e.id === event.id);
                    if (eventIndex !== -1) {
                        state.events[eventIndex] = updatedEvent;
                    }

                    const modal = new bootstrap.Modal(document.getElementById('successModal'));
                    modal.show();
                    btn.innerHTML = originalText;
                    btn.disabled = false;

                    // Close modal and redirect after 3 seconds
                    setTimeout(() => {
                        modal.hide();
                        window.location.href = '../profile/profile.html';
                    }, 3000);
                })
                .catch(err => {
                    console.error('Booking Error:', err);
                    showToast('Payment Failed', 'There was an issue processing your booking.', 'danger');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }
}


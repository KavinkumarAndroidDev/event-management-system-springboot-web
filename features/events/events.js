import { state } from '../../scripts/shared/state.js';
import { performLogin } from '../auth/auth.js';

export function initializeEvents() {
    const events = state.events;

    // Homepage: Featured Events
    const featuredContainer = document.getElementById('featured-events');
    if (featuredContainer && events) {
        const featured = events.filter(e => e.status.isFeatured).slice(0, 5);
        featuredContainer.innerHTML = featured.map(e => createEventCard(e)).join('');
    }

    // Events Page: All Events
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid && events) {
        setupPagination(events);
    }

    // Single Event Page
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    if (eventId && events) {
        const event = events.find(e => e.id === eventId);
        if (event) {
            populateSingleEvent(event);
        }
    }
}

export function createEventCard(event) {
    const minPrice = Math.min(...event.tickets.map(t => t.price));
    const date = new Date(event.schedule.startDateTime);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const path = window.location.pathname;
    let link = 'features/events/event-details.html?id=' + event.id;

    if (path.includes('/features/events/')) {
        link = 'event-details.html?id=' + event.id;
    } else if (path.includes('/features/')) {
        link = '../events/event-details.html?id=' + event.id;
    }

    return `
    <div class="col">
        <div class="card border-0 shadow-sm h-100 event-card" style="border-radius:16px; overflow:hidden;">
            <img src="${event.media.thumbnail}" class="card-img-top" style="height:200px; object-fit:cover;" alt="${event.title}">
            <div class="card-body p-3 d-flex flex-column">
                <div class="text-primary fw-semibold small mb-2">
                    ${dateStr} • ${timeStr}
                </div>
                <h6 class="fw-semibold text-neutral-900 mb-2" style="line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                    ${event.title}
                </h6>
                <p class="text-neutral-400 small text-truncate mb-2">
                    ${event.venue.name}, ${event.venue.address.city}
                </p>
                <div class="fw-semibold text-neutral-900 small mt-auto">
                    ${minPrice === 0 ? 'Free' : '₹' + minPrice + ' onwards'}
                </div>
            </div>
            <a href="${link}" class="stretched-link"></a>
        </div>
    </div>
    `;
}

export function populateSingleEvent(event) {
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('event-title', event.title);
    if (event.category) {
        setText('event-category', event.category.name);
        const iconEl = document.getElementById('event-category-icon');
        // Check if iconEl exists and hasn't been replaced by SVG yet, or is an SVG
        if (iconEl) {
            const newIcon = document.createElement('i');
            newIcon.id = 'event-category-icon';
            newIcon.setAttribute('data-lucide', event.category.icon);
            // Preserve classes if any (e.g. text-primary)
            newIcon.className = iconEl.getAttribute('class') || '';
            iconEl.replaceWith(newIcon);
            if (window.lucide) lucide.createIcons({ root: newIcon.parentElement });
        }
    }

    const startDate = new Date(event.schedule.startDateTime);
    const endDate = new Date(event.schedule.endDateTime);
    const dateStr = `${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    setText('event-date', dateStr);
    setText('event-location', `${event.venue.name}, ${event.venue.address.city}`);

    const minPrice = Math.min(...event.tickets.map(t => t.price));
    setText('event-price', minPrice === 0 ? 'Free' : `₹${minPrice}`);

    setText('event-description', event.fullDescription);
    setText('venue-name', event.venue.name);
    setText('venue-address', `${event.venue.address.street}, ${event.venue.address.city}, ${event.venue.address.pincode}`);

    const heroImg = document.getElementById('event-hero-image');
    if (heroImg) heroImg.src = event.media.thumbnail;

    // Populate Organizer
    const organizerCard = document.getElementById('event-organizer-card');
    if (organizerCard && event.organizer) {
        organizerCard.innerHTML = `
            <div class="card-custom p-4 border border-neutral-100 shadow-sm bg-white w-100 d-flex flex-column flex-sm-row align-items-sm-center gap-4">
                <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 72px; height: 72px; font-size: 2rem;">
                    ${event.organizer.name.charAt(0)}
                </div>
                <div class="flex-grow-1">
                    <h4 class="fw-bold mb-1 text-neutral-900">${event.organizer.name}</h4>
                    <div class="d-flex align-items-center gap-3 small text-neutral-500 mb-2 mt-2">
                        <span class="d-flex align-items-center text-warning fw-medium bg-warning bg-opacity-10 px-2 py-1 rounded-pill">
                            <i data-lucide="star" class="fill-warning me-1" width="14"></i> ${event.organizer.rating}
                        </span>
                        <span class="d-flex align-items-center gap-1 text-primary fw-medium"><i data-lucide="award" width="14"></i> Verified Organizer</span>
                    </div>
                </div>
                <div class="mt-3 mt-sm-0 w-100" style="max-width: 200px;">
                    <a href="mailto:${event.organizer.contactEmail}" class="btn btn-outline-primary rounded-pill w-100 d-flex align-items-center justify-content-center gap-2">
                        <i data-lucide="mail" width="16"></i> Contact
                    </a>
                </div>
            </div>
        `;
    }

    // Populate Policies
    const policiesList = document.getElementById('event-policies-list');
    if (policiesList && event.policies) {
        policiesList.innerHTML = `
            <div class="col-12">
                <div class="card-custom p-4 border border-neutral-100 shadow-sm bg-white">
                    <div class="row g-4">
                        <div class="col-md-6 d-flex gap-3">
                            <div class="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                                <i data-lucide="rotate-ccw" width="24"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold mb-2 text-neutral-900">Refund Policy</h6>
                                <p class="text-neutral-500 small mb-0 lh-base">${event.policies.refundPolicy}</p>
                            </div>
                        </div>
                        <div class="col-md-6 d-flex gap-3">
                            <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                                <i data-lucide="shield-check" width="24"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold mb-2 text-neutral-900">Terms & Conditions</h6>
                                <p class="text-neutral-500 small mb-0 lh-base">${event.policies.termsAndConditions}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Populate Tickets Count Only
    const ticketsCount = document.getElementById('event-ticket-count');
    if (ticketsCount && event.tickets && event.tickets.length > 0) {
        let totalAvailable = 0;
        event.tickets.forEach(ticket => {
            totalAvailable += ticket.availableQuantity || 0;
        });
        ticketsCount.textContent = totalAvailable > 0 ? `${totalAvailable} tickets remaining` : 'Sold out';
        if (totalAvailable <= 0) {
            ticketsCount.classList.add('text-danger');
            ticketsCount.classList.remove('text-neutral-400');
            const bookBtn = document.querySelector('.btn-primary');
            if (bookBtn && bookBtn.textContent.includes('Book tickets')) {
                bookBtn.disabled = true;
                bookBtn.textContent = 'Sold Out';
            }
        }
    }

    setText('breadcrumb-active', event.title);
    document.title = `${event.title} - SyncEvent`;

    const bookBtn = document.getElementById('btn-book-tickets');
    if (bookBtn) {
        bookBtn.onclick = (e) => {
            e.preventDefault();
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) {
                const modalEl = document.getElementById('loginRequiredModal');
                if (modalEl) {
                    const bsModal = new bootstrap.Modal(modalEl);
                    bsModal.show();

                    const loginForm = document.getElementById('modalLoginForm');
                    if (loginForm) {
                        loginForm.onsubmit = (subEvent) => {
                            subEvent.preventDefault();
                            subEvent.stopPropagation();
                            loginForm.classList.add('was-validated');
                            if (loginForm.checkValidity()) {
                                const email = loginForm.querySelector('input[type="email"]').value;
                                const pwd = loginForm.querySelector('input[type="password"]').value;
                                const success = performLogin(email, pwd, false, (user) => {
                                    // Custom redirect after success
                                    window.location.href = `booking.html?id=${event.id}`;
                                });

                                if (success) {
                                    const submitBtn = loginForm.querySelector('button[type="submit"]');
                                    submitBtn.disabled = true;
                                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';
                                } else {
                                    loginForm.querySelector('input[type="password"]').value = '';
                                    loginForm.classList.remove('was-validated');
                                }
                            }
                        };
                    }
                } else {
                    window.location.href = '../auth/login.html';
                }
            } else {
                window.location.href = `booking.html?id=${event.id}`;
            }
        };
    }
}

function setupPagination(events) {
    const itemsPerPage = 9;
    let currentPage = 1;
    let paginationContainer = document.getElementById('pagination-controls');

    if (!paginationContainer) return;

    const newContainer = paginationContainer.cloneNode(false);
    paginationContainer.parentNode.replaceChild(newContainer, paginationContainer);
    paginationContainer = newContainer;

    const renderPage = (page) => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageEvents = events.slice(start, end);

        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            eventsGrid.innerHTML = pageEvents.map(e => createEventCard(e)).join('');
            if (window.lucide) lucide.createIcons();
        }
        renderControls(page);
    };

    const renderControls = (page) => {
        const totalPages = Math.ceil(events.length / itemsPerPage);
        let html = '';
        html += `<button class="pagination-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}><i data-lucide="chevron-left" width="16" height="16"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        html += `<button class="pagination-btn" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" width="16" height="16"></i></button>`;
        paginationContainer.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    };

    paginationContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.pagination-btn');
        if (btn && !btn.disabled && !btn.classList.contains('active')) {
            const newPage = parseInt(btn.dataset.page);
            if (newPage && newPage !== currentPage) {
                currentPage = newPage;
                renderPage(currentPage);
                document.getElementById('events-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    renderPage(1);
}

export function setupGlobalInteractions() {
    // Search Inputs
    document.querySelectorAll('input[type="search"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (document.getElementById('events-grid')) {
                filterEvents(query);
            }
        });
    });

    // Clear Filters Logic
    const clearFilters = (e) => {
        e.preventDefault();
        // Uncheck all checkboxes
        document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(box => {
            box.checked = false;
        });
        // Clear Search
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) searchInput.value = '';

        // Reset Pills
        document.querySelectorAll('.filter-pill').forEach(pill => pill.classList.remove('active'));
        const todayPill = document.querySelector('.filter-pill');
        if (todayPill) todayPill.classList.add('active');

        const bsCollapseElements = document.querySelectorAll('.collapse.show');
        bsCollapseElements.forEach(el => {
            const toggle = document.querySelector(`[data-bs-target="#${el.id}"]`);
            if (toggle) toggle.classList.add('collapsed');
        });

        if (document.getElementById('events-grid')) filterEvents();
    };

    const clearDesktop = document.getElementById('clear-filters-desktop');
    if (clearDesktop) clearDesktop.addEventListener('click', clearFilters);

    const clearMobile = document.getElementById('clear-filters-mobile');
    if (clearMobile) clearMobile.addEventListener('click', clearFilters);

    // Pre-select category from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        document.querySelectorAll('#collapseCategories input[type="checkbox"]').forEach(box => {
            if (box.nextElementSibling.textContent.trim().toLowerCase() === categoryParam.toLowerCase()) {
                box.checked = true;
                const bsCollapseEl = document.getElementById('collapseCategories');
                if (bsCollapseEl) {
                    bsCollapseEl.classList.add('show');
                    const toggle = document.querySelector('[data-bs-target="#collapseCategories"]');
                    if (toggle) toggle.classList.remove('collapsed');
                }
            }
        });
        if (document.getElementById('events-grid')) filterEvents();
    }

    // Filter Pills (Visual Toggle)
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', function () {
            const group = this.closest('.d-flex');
            if (group) {
                group.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                this.classList.add('active');
            }
            if (document.getElementById('events-grid')) filterEvents();
        });
    });

    // Sidebar Checkboxes
    document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(box => {
        box.addEventListener('change', () => {
            if (document.getElementById('events-grid')) filterEvents();
        });
    });
}

function filterEvents(query) {
    if (!state.events) return;

    let filtered = state.events;

    // 1. Search Query
    if (typeof query !== 'string') {
        const searchInput = document.querySelector('input[type="search"]');
        query = searchInput ? searchInput.value.toLowerCase() : '';
    }

    if (query) {
        filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(query) ||
            e.venue.address.city.toLowerCase().includes(query) ||
            (e.category && e.category.name.toLowerCase().includes(query))
        );
    }

    // 2. City Filters
    const cityCheckboxes = document.querySelectorAll('#collapseCity input[type="checkbox"]');
    if (cityCheckboxes.length > 0) {
        const selectedCities = Array.from(cityCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.nextElementSibling.textContent.trim().toLowerCase());

        if (selectedCities.length > 0) {
            filtered = filtered.filter(e => selectedCities.includes(e.venue.address.city.toLowerCase()));
        }
    }

    // 3. Category Filters
    const categoryCheckboxes = document.querySelectorAll('#collapseCategories input[type="checkbox"]');
    if (categoryCheckboxes.length > 0) {
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.nextElementSibling.textContent.trim().toLowerCase());

        if (selectedCategories.length > 0) {
            filtered = filtered.filter(e => e.category && selectedCategories.includes(e.category.name.toLowerCase()));
        }
    }

    setupPagination(filtered);
}

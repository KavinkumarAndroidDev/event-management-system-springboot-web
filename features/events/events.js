import { state } from '../../scripts/shared/state.js';
import { performLogin } from '../auth/auth.js';

export function initializeEvents() {
    const events = state.events;

    // Homepage: Featured Events
    const featuredContainer = document.getElementById('featured-events');
    if (featuredContainer && events) {
        const featured = events.filter(e => e.status.isFeatured).slice(0, 5);
        featuredContainer.innerHTML = '';
        featured.forEach(e => {
            featuredContainer.appendChild(createEventCard(e));
        });
    }

    // Top Organizers (Homepage)
    const organizersGrid = document.getElementById('top-organizers-grid');
    if (organizersGrid && events) {
        // Extract unique organizers from events and sort by rating
        const uniqueOrganizersMap = new Map();
        events.forEach(e => {
            if (e.organizer && !uniqueOrganizersMap.has(e.organizer.id)) {
                uniqueOrganizersMap.set(e.organizer.id, e.organizer);
            }
        });
        const topOrganizers = Array.from(uniqueOrganizersMap.values())
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);

        organizersGrid.innerHTML = '';
        topOrganizers.forEach(org => {
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="card card-custom border-0 shadow-sm p-4 h-100 text-center rounded-4 d-flex flex-column align-items-center">
                    <div class="org-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold mb-3 flex-shrink-0" style="width: 72px; height: 72px; font-size: 2rem;"></div>
                    <div class="mt-auto w-100">
                        <div class="org-name fw-bold text-neutral-900 fs-5 mb-1"></div>
                        <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 fw-medium d-flex align-items-center gap-1" style="font-size: 0.75rem;">
                                <i data-lucide="check-circle" width="12"></i> Verified
                            </span>
                            <span class="d-flex align-items-center text-warning fw-semibold bg-warning bg-opacity-10 px-2 py-1 rounded-pill" style="font-size: 0.75rem;">
                                <i data-lucide="star" class="fill-warning me-1" width="12"></i> <span class="org-rating"></span>
                            </span>
                        </div>
                        <a href="#" class="org-contact btn btn-outline-primary rounded-pill w-100 btn-sm">Contact Organizer</a>
                    </div>
                </div>
            `;
            col.querySelector('.org-avatar').textContent = org.name.charAt(0);
            col.querySelector('.org-name').textContent = org.name;
            col.querySelector('.org-rating').textContent = org.rating;
            col.querySelector('.org-contact').href = `mailto:${org.contactEmail}`;
            organizersGrid.appendChild(col);
        });

        if (window.lucide) {
            if (window.initIcons) window.initIcons({ root: organizersGrid });
        }
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

    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
        <div class="card border-0 shadow-sm h-100 event-card" style="border-radius:16px; overflow:hidden;">
            <img src="" class="card-img-top ec-img" style="height:200px; object-fit:cover;" alt="Event Image">
            <div class="card-body p-3 d-flex flex-column">
                <div class="ec-datetime text-primary fw-semibold small mb-2"></div>
                <h6 class="ec-title fw-semibold text-neutral-900 mb-2" style="line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;"></h6>
                <p class="ec-location text-neutral-400 small text-truncate mb-2"></p>
                <div class="ec-price fw-semibold text-neutral-900 small mt-auto"></div>
            </div>
            <a href="" class="stretched-link ec-link"></a>
        </div>
    `;

    col.querySelector('.ec-img').src = event.media.thumbnail;
    col.querySelector('.ec-img').alt = event.title;
    col.querySelector('.ec-datetime').textContent = `${dateStr} • ${timeStr}`;
    col.querySelector('.ec-title').textContent = event.title;
    col.querySelector('.ec-location').textContent = `${event.venue.name}, ${event.venue.address.city}`;
    col.querySelector('.ec-price').textContent = minPrice === 0 ? 'Free' : '₹' + minPrice + ' onwards';
    col.querySelector('.ec-link').href = link;

    return col;
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
            if (window.initIcons) window.initIcons({ root: newIcon.parentElement });
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
            <div class="card-custom p-4 border border-1 border-neutral-100 shadow-sm bg-white w-100" style="border-radius: 16px;">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 64px; height: 64px; font-size: 1.5rem;" id="org-avatar"></div>
                        <div>
                            <h5 class="fw-bold mb-1 text-neutral-900 d-flex align-items-center gap-2">
                                <span id="org-name"></span>
                                <i data-lucide="badge-check" class="text-primary" width="18" height="18"></i>
                            </h5>
                            <div class="d-flex align-items-center text-neutral-500 small mt-1">
                                <span class="d-flex align-items-center text-warning fw-semibold gap-1 me-3">
                                    <i data-lucide="star" class="fill-warning" width="14" height="14"></i>
                                    <span id="org-rating"></span>
                                </span>
                                <span class="d-flex align-items-center gap-1">
                                    <i data-lucide="calendar-days" width="14" height="14"></i>
                                    <span id="org-events-count"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <a href="#" class="btn btn-outline-primary rounded-pill px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2 w-100" id="org-contact">
                            <i data-lucide="mail" width="16" height="16"></i> Contact Organizer
                        </a>
                    </div>
                </div>
            </div>
        `;
        organizerCard.querySelector('#org-avatar').textContent = event.organizer.name.charAt(0);
        organizerCard.querySelector('#org-name').textContent = event.organizer.name;
        organizerCard.querySelector('#org-rating').textContent = `${event.organizer.rating} Rating`;
        organizerCard.querySelector('#org-events-count').textContent = '10+ Past Events'; // Placeholder, as actual count isn't in event object
        organizerCard.querySelector('#org-contact').href = `mailto:${event.organizer.contactEmail}`;
        if (window.initIcons) window.initIcons({ root: organizerCard });
    }

    // Populate Policies
    const policiesList = document.getElementById('event-policies-list');
    if (policiesList && event.policies) {
        policiesList.innerHTML = `
            <div class="col-md-6">
                <div class="card-custom h-100 p-4 border-0 shadow-sm bg-white d-flex flex-column gap-3" style="border-radius: 16px; transition: transform 0.2s; cursor: default;">
                    <i data-lucide="rotate-ccw" width="32" class="text-danger flex-shrink-0"></i>
                    <div>
                        <h5 class="fw-bold mb-2 text-neutral-900">Refund Policy</h5>
                        <p class="text-neutral-500 small mb-0 lh-lg" id="policy-refund"></p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card-custom h-100 p-4 border-0 shadow-sm bg-white d-flex flex-column gap-3" style="border-radius: 16px; transition: transform 0.2s; cursor: default;">
                    <i data-lucide="file-check-2" width="32" class="text-success flex-shrink-0"></i>
                    <div>
                        <h5 class="fw-bold mb-2 text-neutral-900">Terms & Conditions</h5>
                        <p class="text-neutral-500 small mb-0 lh-lg" id="policy-terms"></p>
                    </div>
                </div>
            </div>
        `;
        policiesList.querySelector('#policy-refund').textContent = event.policies.refundPolicy;
        policiesList.querySelector('#policy-terms').textContent = event.policies.termsAndConditions;
        if (window.initIcons) window.initIcons({ root: policiesList });
    }

    // Populate Event Guide
    const guideList = document.getElementById('event-guide-list');
    if (guideList) {
        let durationHrs = 0;
        if (event.schedule && event.schedule.startDateTime && event.schedule.endDateTime) {
            durationHrs = Math.round((new Date(event.schedule.endDateTime) - new Date(event.schedule.startDateTime)) / (1000 * 60 * 60));
        }
        const capacity = event.venue && event.venue.capacity ? event.venue.capacity : 0;
        const categoryName = event.category ? event.category.name : 'General';

        const guideItems = [
            { icon: 'clock', title: 'Duration', text: `${durationHrs} Hours`, bg: 'primary' },
            { icon: 'users', title: 'Capacity', text: `${capacity} People`, bg: 'success' },
            { icon: 'tag', title: 'Category', text: categoryName, bg: 'warning' }
        ];

        guideList.innerHTML = ''; // Clear existing content
        guideItems.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            const card = document.createElement('div');
            card.className = 'card-custom h-100 d-flex align-items-center gap-3 p-3 border-0 shadow-sm';
            card.style.cssText = 'border-radius: 12px; background: white;';

            const iconDiv = document.createElement('div');
            iconDiv.className = `bg-${item.bg} bg-opacity-10 text-${item.bg} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`;
            iconDiv.style.cssText = 'width: 48px; height: 48px;';
            iconDiv.innerHTML = `<i data-lucide="${item.icon}" width="24"></i>`;
            card.appendChild(iconDiv);

            const textContentDiv = document.createElement('div');
            const captionDiv = document.createElement('div');
            captionDiv.className = 'caption text-neutral-400 small fw-medium mb-1';
            captionDiv.textContent = item.title;
            textContentDiv.appendChild(captionDiv);

            const valueDiv = document.createElement('div');
            valueDiv.className = 'fw-bold text-neutral-900';
            valueDiv.textContent = item.text;
            textContentDiv.appendChild(valueDiv);

            card.appendChild(textContentDiv);
            col.appendChild(card);
            guideList.appendChild(col);
        });

        if (window.lucide) {
            if (window.initIcons) window.initIcons({ root: guideList });
        }
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
                showEventLoginModal(event.id);
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

        renderPaginatedEvents(pageEvents);
        renderControls(page);
    };

    function renderPaginatedEvents(pageEvents) {
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            eventsGrid.innerHTML = '';
            pageEvents.forEach(e => {
                eventsGrid.appendChild(createEventCard(e));
            });
            if (window.initIcons) window.initIcons({ root: eventsGrid });
        }
    }

    const renderControls = (page) => {
        const totalPages = Math.ceil(events.length / itemsPerPage);
        let html = '';
        html += `<button class="pagination-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}><i data-lucide="chevron-left" width="16" height="16"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        html += `<button class="pagination-btn" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" width="16" height="16"></i></button>`;
        paginationContainer.innerHTML = html;
        if (window.initIcons) window.initIcons();
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

function showEventLoginModal(eventId) {
    let modalEl = document.getElementById('eventLoginModal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'eventLoginModal';
        modalEl.className = 'modal fade';
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4 p-2">
                    <div class="modal-header border-0 pb-0">
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body pt-0 pb-4 px-4 text-center">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
                            <i data-lucide="lock" width="32" height="32"></i>
                        </div>
                        <h4 class="fw-bold mb-2">Login Required</h4>
                        <p class="text-neutral-500 mb-4">Please login or enter your details to continue booking.</p>
                        
                        <div id="modal-login-form-container-events" class="text-start w-100"></div>
                        <div class="text-center mt-3">
                            <span class="text-neutral-400 small">New here? <a href="../auth/signup.html" onclick="sessionStorage.setItem('postLoginRedirect', window.location.href)" class="text-primary text-decoration-none fw-medium">Create an account</a></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);
        if (window.initIcons) window.initIcons();

        import('../auth/auth.js').then(m => {
            m.setupLoginForm('modal-login-form-container-events', true, {
                action: (user) => {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    setTimeout(() => {
                        const currentUrl = window.location.href;
                        window.location.href = currentUrl;
                    }, 2000); // Wait for the success modal animation
                },
                message: 'Redirecting you back...'
            });
        });
    }

    const bsModal = new window.bootstrap.Modal(modalEl);
    bsModal.show();
}
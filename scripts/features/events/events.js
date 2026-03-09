import { state, getCategory, getVenue, getUser } from '../../shared/state.js';
import { showLoading, hideLoading } from '../../shared/utils.js';

export function initializeEvents() {
    // Filter to only show PUBLISHED events on public pages
    let events = state.events ? state.events.filter(e => e.status?.current === 'PUBLISHED') : null;

    // Show loading for main grid if it exists
    let eventsGrid = document.getElementById('events-grid');
    if (eventsGrid) {
        if (events === null) {
            showLoading('events-grid', 'Fetching the latest events...');
        } else {
            hideLoading('events-grid');
        }
    }

    // Homepage: Featured Events Carousel
    const carouselInner = document.getElementById('featured-events-carousel-inner');
    if (carouselInner) {
        if (events) {
            const featured = events.filter(e => e.status?.current === 'PUBLISHED' && (e.status?.isFeatured || e.isFeatured) && !e.title.toLowerCase().includes('template') && !e.title.toLowerCase().includes('placeholder'));
            if (featured.length > 0) {
                carouselInner.innerHTML = '';

                const itemsPerPage = 4;
                for (let i = 0; i < featured.length; i += itemsPerPage) {
                    const slideEvents = featured.slice(i, i + itemsPerPage);
                    const itemDiv = document.createElement('div');
                    itemDiv.className = `carousel-item ${i === 0 ? 'active' : ''}`;

                    const row = document.createElement('div');
                    row.className = 'row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 py-2';

                    slideEvents.forEach(e => {
                        try {
                            row.appendChild(createEventCard(e));
                        } catch (err) {
                            console.error('Failed to render featured event:', e, err);
                        }
                    });

                    itemDiv.appendChild(row);
                    carouselInner.appendChild(itemDiv);
                }
                if (window.initIcons) window.initIcons({ root: carouselInner });
            } else {
                carouselInner.innerHTML = '<div class="text-center py-5 text-neutral-400">No featured events available at the moment.</div>';
            }
        } else {
            // Still loading
            carouselInner.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';
        }
    }

    // Top Organizers (Homepage)
    const organizersGrid = document.getElementById('top-organizers-grid');
    if (organizersGrid && events) {
        // Extract unique organizers from events and sort by rating
        const uniqueOrganizersMap = new Map();
        events.forEach(e => {
            const org = getUser(e.organizerId)?.profile;
            if (org && !uniqueOrganizersMap.has(e.organizerId)) {
                uniqueOrganizersMap.set(e.organizerId, { ...org, id: e.organizerId, rating: 4.8 }); // Default rating if missing
            }
        });
        const topOrganizers = Array.from(uniqueOrganizersMap.values())
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10);

        organizersGrid.innerHTML = '';

        // Repeat for seamless loop
        const displayOrganizers = [...topOrganizers, ...topOrganizers, ...topOrganizers];

        displayOrganizers.forEach((org, index) => {
            const item = document.createElement('div');
            item.className = 'marquee-item';
            
            const displayName = org.fullName || org.name || 'Organizer';
            const avatarChar = displayName ? displayName.charAt(0) : '?';
            const rating = org.rating || '4.8';

            item.innerHTML = `
                <div class="org-minimal-card d-flex flex-column align-items-center p-3 text-center">
                    <div class="org-avatar-wrapper mb-3">
                        ${org.profileImage ? 
                            `<img src="${org.profileImage}" alt="${displayName}" class="rounded-circle" style="width: 80px; height: 80px; object-fit: cover; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">` :
                            `<div class="org-avatar-initials rounded-circle d-flex align-items-center justify-content-center fw-bold bg-primary bg-opacity-10 text-primary" style="width: 80px; height: 80px; font-size: 1.75rem; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">${avatarChar}</div>`
                        }
                        <div class="verified-badge-mini position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; margin-right: 5px; margin-bottom: 5px;">
                            <i data-lucide="check-circle" class="text-primary" width="16" height="16" style="fill: #fff;"></i>
                        </div>
                    </div>
                    <div class="org-info">
                        <h6 class="org-name fw-bold text-neutral-900 mb-1" style="font-size: 0.95rem;">${displayName}</h6>
                        <div class="d-flex align-items-center justify-content-center gap-2">
                             <div class="d-flex align-items-center text-warning" style="font-size: 0.75rem;">
                                <i data-lucide="star" class="fill-warning me-1" width="12"></i>
                                <span class="fw-semibold">${rating}</span>
                            </div>
                            <span class="text-neutral-400" style="font-size: 0.7rem;">• Top Host</span>
                        </div>
                    </div>
                </div>
            `;
            organizersGrid.appendChild(item);
        });


        if (window.lucide) {
            if (window.initIcons) window.initIcons({ root: organizersGrid });
        }
    }

    // Events Page: All Events
    if (eventsGrid && events) {
        setupPagination(events);
        loadDynamicCategories();
        loadDynamicVenues();
    }
}

async function loadDynamicCategories() {
    const container = document.getElementById('collapseCategories');
    if (!container) return;

    try {
        const res = await fetch('http://localhost:3000/categories');
        const cats = await res.json();
        const activeCats = cats.filter(c => c.status === 'ACTIVE');

        const row = container.querySelector('.d-flex.flex-column.gap-2');
        if (row) {
            row.innerHTML = activeCats.map(c => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="cat-${c.id}" value="${c.name}">
                    <label class="form-check-label text-neutral-900" for="cat-${c.id}"
                        style="font-family: 'Inter', sans-serif; font-size: 14px;">${c.name}</label>
                </div>
            `).join('');

            // Re-bind listeners for the new checkboxes
            row.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', () => filterEvents());
            });
        }
    } catch (e) {
        console.error('Error loading categories', e);
    }
}

async function loadDynamicVenues() {
    const container = document.getElementById('collapseCity');
    if (!container) return;

    try {
        const res = await fetch('http://localhost:3000/venues');
        const venues = await res.json();
        const activeVenues = venues.filter(v => v.status === 'ACTIVE');
        
        // Extract unique cities
        const uniqueCities = [...new Set(activeVenues.map(v => v.address?.city || v.city).filter(Boolean))].sort();

        const row = container.querySelector('.d-flex.flex-column.gap-2');
        if (row) {
            row.innerHTML = uniqueCities.map((city, idx) => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="city-${idx}" value="${city}">
                    <label class="form-check-label text-neutral-900" for="city-${idx}"
                        style="font-family: 'Inter', sans-serif; font-size: 14px;">${city}</label>
                </div>
            `).join('');

            // Re-bind listeners
            row.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', () => filterEvents());
            });
        }
    } catch (e) {
        console.error('Error loading venues', e);
    }
}


export function createEventCard(event) {
    const minPrice = Math.min(...event.tickets.map(t => t.price));
    const date = new Date(event.schedule.startDateTime);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const loc = getVenue(event.venueId) || { name: 'Multiple Locations', address: { city: 'Various' } };
    const locName = loc.name || 'Unknown Venue';
    const locCity = (loc.address && loc.address.city) || loc.city || 'Various';

    const path = window.location.pathname;
    let link = 'pages/events/details.html?id=' + event.id;

    if (path.includes('/pages/events/')) {
        link = 'details.html?id=' + event.id;
    } else if (path.includes('/pages/')) {
        link = '../events/details.html?id=' + event.id;
    }

    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
        <div class="card border-0 shadow-sm h-100 event-card" style="border-radius:16px; overflow:hidden;">
            <img src="${event.media?.thumbnail || 'https://dummyimage.com/600x400/eeeeee/999999&text=No+Image'}" class="card-img-top ec-img" style="height:200px; object-fit:cover;" alt="${event.title}">
            <div class="card-body p-3 d-flex flex-column">
                <div class="ec-datetime text-primary fw-semibold small mb-2">${dateStr} • ${timeStr}</div>
                <h6 class="ec-title fw-semibold text-neutral-900 mb-2" style="line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${event.title}</h6>
                <p class="ec-location text-neutral-400 small text-truncate mb-2"><i data-lucide="map-pin" width="14" height="14" class="me-1"></i>${locName}, ${locCity}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <div class="ec-price fw-semibold text-neutral-900 small">${minPrice === 0 ? 'Free' : `₹${minPrice} onwards`}</div>
                </div>
            </div>
            <a href="${link}" class="stretched-link ec-link"></a>
        </div>
    `;

    return col;
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

    // 0. Status Filter (MANDATORY: Only PUBLISHED events in public listing)
    let filtered = state.events.filter(e => e.status?.current === 'PUBLISHED');

    // 1. Search Query
    if (typeof query !== 'string') {
        const searchInput = document.querySelector('input[type="search"]');
        query = searchInput ? searchInput.value.toLowerCase() : '';
    }

    if (query) {
        filtered = filtered.filter(e => {
            const venue = getVenue(e.venueId);
            const category = getCategory(e.categoryId);
            return e.title.toLowerCase().includes(query) ||
                (venue?.address?.city?.toLowerCase().includes(query)) ||
                (category?.name?.toLowerCase().includes(query));
        });
    }

    // 2. City Filters
    const cityCheckboxes = document.querySelectorAll('#collapseCity input[type="checkbox"]');
    if (cityCheckboxes.length > 0) {
        const selectedCities = Array.from(cityCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.nextElementSibling.textContent.trim().toLowerCase());

        if (selectedCities.length > 0) {
            filtered = filtered.filter(e => {
                const city = getVenue(e.venueId)?.address?.city?.toLowerCase();
                return city && selectedCities.includes(city);
            });
        }
    }

    // 3. Category Filters
    const categoryCheckboxes = document.querySelectorAll('#collapseCategories input[type="checkbox"]');
    if (categoryCheckboxes.length > 0) {
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.nextElementSibling.textContent.trim().toLowerCase());

        if (selectedCategories.length > 0) {
            filtered = filtered.filter(e => {
                const catName = getCategory(e.categoryId)?.name?.toLowerCase();
                return catName && selectedCategories.includes(catName);
            });
        }
    }

    if (filtered.length === 0) {
        const grid = document.getElementById('events-grid');
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-neutral-400 mb-3">
                    <i data-lucide="search-x" width="48" height="48"></i>
                </div>
                <h5 class="text-neutral-600">No events found matching your filters</h5>
                <p class="text-neutral-400 small">Try clearing some filters to see more events.</p>
                <button class="btn btn-outline-primary rounded-pill btn-sm mt-3" onclick="document.getElementById('clear-filters-desktop').click()">Clear All Filters</button>
            </div>
        `;
        if (window.initIcons) window.initIcons({ root: grid });
    } else {
        setupPagination(filtered);
    }

    // Update dynamic heading if it exists
    const heading = document.getElementById('events-title-heading');
    if (heading) {
        const checkedCities = Array.from(cityCheckboxes).filter(cb => cb.checked);
        if (checkedCities.length === 1) {
            heading.textContent = `Events in ${checkedCities[0].nextElementSibling.textContent}`;
        } else if (checkedCities.length > 1) {
            heading.textContent = 'Events in Multiple Cities';
        } else {
            heading.textContent = 'All Events';
        }
    }
}


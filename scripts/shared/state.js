export const state = {
    users: [],
    events: [],
    registrations: [],
    payments: [],
    categories: [],
    venues: []
};

export function setGlobalData(data) {
    state.users = data.users || [];
    state.events = data.events || [];
    state.registrations = data.registrations || [];
    state.payments = data.payments || [];
    state.categories = data.categories || [];
    state.venues = data.venues || [];
}

// Lookup Helpers
export const getCategory = (id) => state.categories.find(c => c.id === id);
export const getVenue = (id) => state.venues.find(v => v.id === id);
export const getUser = (id) => state.users.find(u => u.id === id);
export const getEvent = (id) => state.events.find(e => e.id === id);

export function getEventWithDetails(event) {
    if (!event) return null;
    return {
        ...event,
        category: getCategory(event.categoryId),
        venue: getVenue(event.venueId),
        organizer: getUser(event.organizerId)?.profile
    };
}

/**
 * Central State Store
 * ===================
 * This module acts as the Single Source of Truth for the application's data.
 * It holds the current state of users, events, registrations, etc., and provides
 * synchronous lookup helpers for feature-specific modules.
 * 
 * Flow: 
 * 1. app.js fetches data from the API.
 * 2. app.js calls setGlobalData() to populate this store.
 * 3. Feature modules (admin, organizer, etc.) import this state or use helpers to access data.
 */

/**
 * The global state object containing all application data entities.
 * @type {Object}
 * @property {Array} users - List of all registered users.
 * @property {Array} events - List of all events (approved, pending, or draft).
 * @property {Array} registrations - Tracking for all ticket bookings.
 * @property {Array} payments - Transaction records for registrations.
 * @property {Array} categories - Available event categories (e.g., Tech, Music).
 * @property {Array} venues - Registered hosting locations.
 */
export const state = {
    users: [],
    events: [],
    registrations: [],
    payments: [],
    categories: [],
    venues: []
};

/**
 * Updates the global state with fresh data fetched from the API.
 * This is typically called once during the initial application load in app.js.
 * 
 * @param {Object} data - The raw data object returned from the mock API server.
 */
export function setGlobalData(data) {
    state.users = data.users || [];
    state.events = data.events || [];
    state.registrations = data.registrations || [];
    state.payments = data.payments || [];
    state.categories = data.categories || [];
    state.venues = data.venues || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** 
 * Finds a category by its unique ID. 
 * @param {string} id - The category ID.
 * @returns {Object|undefined} - The category object if found.
 */
export const getCategory = (id) => state.categories.find(c => c.id === id);

/** 
 * Finds a venue by its unique ID. 
 * @param {string} id - The venue ID.
 * @returns {Object|undefined} - The venue object if found.
 */
export const getVenue = (id) => state.venues.find(v => v.id === id);

/** 
 * Finds a user by their unique ID. 
 * @param {string} id - The user ID.
 * @returns {Object|undefined} - The user object if found.
 */
export const getUser = (id) => state.users.find(u => u.id === id);

/** 
 * Finds an event by its unique ID. 
 * @param {string} id - The event ID.
 * @returns {Object|undefined} - The event object if found.
 */
export const getEvent = (id) => state.events.find(e => e.id === id);

/**
 * Enriches a raw event object with nested details for UI rendering.
 * Maps IDs (categoryId, venueId, organizerId) to actual data objects from the state.
 * 
 * @param {Object} event - The raw event object from the events array.
 * @returns {Object|null} - The enriched event object or null if input is invalid.
 */
export function getEventWithDetails(event) {
    if (!event) return null;
    return {
        ...event,
        category: getCategory(event.categoryId),
        venue: getVenue(event.venueId),
        organizer: getUser(event.organizerId)?.profile
    };
}

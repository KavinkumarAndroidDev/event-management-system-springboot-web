export const state = {
    users: [],
    events: [],
    registrations: [],
    payments: []
};

export function setGlobalData(data) {
    state.users = data.users || [];
    state.events = data.events || [];
    state.registrations = data.registrations || [];
    state.payments = data.payments || [];
}
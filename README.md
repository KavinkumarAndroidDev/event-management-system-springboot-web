# SyncEvent (EMS) - Event Management System

SyncEvent is a premium, modular Event Management System built with modern Vanilla JavaScript and Bootstrap. It provides a seamless experience for Admins, Organizers, and Attendees to manage and discover events.

## 🚀 Key Features

- **Multi-Role Support**: RBAC (Role-Based Access Control) for Admin, Organizer, and Attendee.
- **Dynamic Module Loading**: Optimized performance through lazy-loading feature-specific JS modules.
- **Real-time Validation**: Robust form handling with instant user feedback.
- **Responsive UI**: Sleek, mobile-first design using Bootstrap 5 and Lucide icons.
- **Centralized State**: Single-source-of-truth architecture for predictable data management.

## 📁 Project Structure

```text
EMS/
├── css/                   # Compiled CSS and theme variables
├── data/                  # Mock API data (db.json)
├── pages/                 # HTML templates
│   ├── admin/             # Admin-only dashboard & management
│   ├── auth/              # Login/Signup flows
│   ├── events/            # Public event browsing & booking
│   ├── organizer/         # Organizer-only dashboard & signup
│   └── profile/           # User profile & registration history
├── scripts/               # JavaScript logic
│   ├── features/          # Feature-specific modules (Admin, Organizer, etc.)
│   ├── shared/            # Shared state, utilities, and helpers
│   └── app.js             # Main application entry & orchestrator
├── scss/                  # Styling source files
└── index.html             # Application landing page
```

## 🏗️ Architecture & Logic Flow

### 1. Data Flow
The application follows a unidirectional data flow:
- **API**: Data is fetched from `http://localhost:3000` (json-server).
- **State Store (`state.js`)**: Fetched data is normalized and stored in a central global object.
- **UI Component**: JavaScript modules observe the state (or use lookup helpers) to render dynamic content.

### 2. Orchestration (`app.js`)
The `app.js` file acts as the brain of the app. It manages:
- **Initialization**: Sets up global components (Toasts, Modals, Icons).
- **Data Sync**: Runs a `Promise.all` fetch to ensure all data is ready before rendering.
- **Routing**: Detects the current URL path and dynamically imports the necessary feature script.

### 3. Access Control (RBAC)
Permissions are enforced at the orchestrator level. Before a module is loaded, `checkPageAccess()` verifies if the user's role matches the requirements for that specific URL pattern.

## 🛠️ Development Guide

### Setup
1. Clone the repository.
2. Ensure you have Node.js installed.
3. Start the mock server: `npx json-server data/db.json --port 3000`.
4. Open `index.html` via a Live Server.

### Coding Standards
- **Modules**: Keep feature logic separate from shared utilities.
- **Documentation**: Use JSDoc for all public functions. Include `@param` and `@returns` tags.
- **UI Integrity**: Use the shared `utils.js` for toasts, loading spinners, and modals to maintain visual consistency.

## 📜 Role Definitions
| Role | Capabilities |
| :--- | :--- |
| **Admin** | System stats, User moderation, Event approvals, Category management. |
| **Organizer** | Create events, Manage tickets, View attendee reports, Manage offers. |
| **Attendee** | Browse events, Book tickets, Manage personal profile. |

---
*Built with ❤️ for Event Enthusiasts.*
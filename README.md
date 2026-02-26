# SyncEvent - Event Management System (EMS)

## 📌 Overview
**SyncEvent** is a modern, web-based Event Management System designed to connect attendees with exciting events while providing organizers with powerful tools to manage their listings. The platform features a responsive design, role-based authentication, and a seamless booking experience.

## 🚀 Features

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC):** Distinct workflows for **Attendees**, **Organizers**, and **Admins**.
- **Secure Login/Signup:** 
  - Real-time password validation.
  - "Remember Me" functionality using LocalStorage.
  - Account status checks (prevents suspended users from logging in).
- **Session Management:** Persists user sessions securely via browser storage.

### 📅 Event Discovery & Booking
- **Featured Events:** Highlighted events displayed prominently on the landing page.
- **Categorized Browsing:** Filter events by categories like Music, Workshops, Sports, and Food.
- **Booking System:** Integrated flow for users to register and book tickets.

### 🛠 Organizer Tools
- **Organizer Dashboard:** Dedicated interface for creating and managing events.
- **Real-time Statistics:** Track event performance and attendee counts.

### 💻 Technical Highlights
- **Dynamic UI Injection:** Shared components (like Navbars) are injected via JavaScript to maintain consistency.
- **Centralized State Management:** Uses a shared state module to manage data across the application.
- **Toast Notifications:** Custom feedback system for success/error messages.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (SCSS), JavaScript (ES6+ Modules).
- **Framework:** [Bootstrap 5.3](https://getbootstrap.com/) (Responsive Grid & Components).
- **Icons:** [Lucide Icons](https://lucide.dev/).
- **Backend (Simulation):** [JSON Server](https://github.com/typicode/json-server) (REST API Mock).
- **Package Manager:** npm.

## 📂 Project Structure

The project follows a **Feature-Based Architecture**, grouping logic and views by domain rather than file type.

```text
EMS/
├── index.html                  # Landing Page (Home)
├── assets/                     # Static assets (Images, SVGs, Favicons)
├── scss/                       # Source SASS files
├── css/                        # Compiled CSS
├── scripts/
│   ├── core/
│   │   └── app.js              # Main Application Entry Point
│   ├── shared/
│   │   ├── utils.js            # Utilities (Toast notifications, Formatters)
│   │   └── state.js            # Centralized State Store
│   └── components/
│       └── navbar.js           # Dynamic Navbar Component
├── features/                   # 🔥 Feature Domain Logic
│   ├── auth/                   # Authentication (Login, Signup, Logic)
│   ├── events/                 # Event Listing, Details, Booking
│   ├── profile/                # User Profile Management
│   ├── organizer/              # Organizer Dashboard & Signup
│   ├── notifications/          # User Notifications
│   └── about/                  # Static Pages (About, Contact)
├── data/
│   └── data.json               # Database file for JSON Server
└── package.json                # Project dependencies
```

## 🔧 Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd EMS
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Mock Backend**
    The application uses `json-server` to simulate a REST API.
    ```bash
    # Install json-server globally (if not already installed)
    npm install -g json-server

    # Run the server watching the data file
    json-server --watch data/data.json --port 3000
    ```

4.  **Run the Application**
    Open `index.html` in your browser.
    > **Note:** Use a local server (like VS Code's **Live Server**) to ensure ES Modules load correctly without CORS issues.

## 🧠 Core Logic Explained

### Authentication Flow (`features/auth/auth.js`)
The authentication system is built on top of the centralized `state` object.
1.  **Login:** When a user logs in, the system searches the loaded `state.users`.
2.  **Status Check:** It verifies if `accountStatus.status` is `ACTIVE`. If the account is `SUSPENDED`, a Bootstrap modal is dynamically created and shown, blocking access.
3.  **Redirection:** Upon success, the user is redirected based on their role:
    - `ATTENDEE` → Home Page (`index.html`)
    - `ORGANIZER` → Organizer Dashboard
    - `ADMIN` → Admin Dashboard

### Data Management
- **Fetching:** Data is fetched from `http://localhost:3000` using the Fetch API.
- **State:** The `scripts/shared/state.js` module acts as a singleton store, ensuring that user data and event lists are consistent across different pages.

### UI Components
- **Navbar:** The navigation bar is not hardcoded in every HTML file. Instead, `scripts/components/navbar.js` injects the correct HTML based on whether the user is logged in or a guest.

## 🤝 Contributing
We welcome contributions to SyncEvent! To ensure a smooth collaboration, please follow these guidelines:

### 🎨 Design & UI Standards
Please refer to our **Design System** before making UI changes. We enforce strict consistency:
- **Colors:** Use semantic tokens (e.g., `primary`, `neutral-900`) defined in `scss/_variables.scss`.
- **Typography:** `DM Sans` for headings, `Inter` for body text.
- **Spacing:** Follow the 8px grid system (`8, 16, 24, 32...`).

### 🛠 Development Workflow
1.  **Fork & Branch:** Create a branch for your feature (`git checkout -b feature/amazing-feature`).
2.  **Code:** Implement your changes. Remember to compile SCSS if you modify styles:
    ```bash
    npx sass scss/main.scss css/main.css
    ```
3.  **Test:** Ensure the `json-server` is running and verify flows.
4.  **Pull Request:** Open a PR describing your changes.
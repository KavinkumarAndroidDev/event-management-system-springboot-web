# SyncEvent - Event Management System (EMS)

## 📌 Overview
**SyncEvent** is a modern, high-performance web application designed for seamless event discovery and management. It bridges the gap between event enthusiasts and organizers by providing a robust platform for booking tickets, tracking attendance, and managing event lifecycles.

## 🚀 Key Features

### 🔐 Advanced Authentication (RBAC)
- **Granular Roles:** Optimized workflows for Attendees, Organizers, and Admins.
- **Security First:** Real-time password validation (min 8 chars, mixed case, special symbols).
- **Session Continuity:** "Remember Me" logic leveraging LocalStorage and persistent state monitoring.

### 📅 Event Lifecycle & Booking
- **Smart Discovery:** Categorized event browsing (Music, Tech, Workshops) with real-time filtering.
- **Seamless Booking:** Integrated logic for ticket selection, discount application, and secure payment processing.
- **Automated Refunds:** Cancelled registrations now automatically trigger payment status updates to `Refunded`.

### 🛠 Organizer Excellence
- **Centralized Dashboard:** A premium, dark-themed experience for monitoring event performance.
- **Attendee Insights:** Real-time registration tracking and verification tools.
- **Ticket Management:** Dynamic ticket type creation and inventory management.

## 💻 Tech Stack

- **Frontend:** Semantic HTML5, Vanilla JavaScript (ES6+), and Modular SCSS.
- **Styling:** [Bootstrap 5.3](https://getbootstrap.com/) for grid systems and premium UI components.
- **Visuals:** [Lucide Icons](https://lucide.dev/) for high-quality SVG iconography.
- **Backend Infrastructure:** [JSON Server](https://github.com/typicode/json-server) providing a high-fidelity REST API simulation.

## 📂 Project Structure

```text
EMS/
├── index.html                  # Main Entry Point
├── assets/                     # Design Assets & Iconography
├── scss/                       # Modular Stylesheets (Tokens, Components, Layouts)
├── css/                        # Optimized Production Styles
├── scripts/
│   ├── core/                   # Bootstrap logic & Icon initialization
│   ├── shared/                 # Central State Store & Shared Utilities
│   ├── components/             # Reusable UI Elements (Navbar, Toasts)
│   └── features/               # 🔥 Domain-Specific Logic
│       ├── auth/               # Secure Login & Identity Management
│       ├── events/             # Discovery, Details, & Booking Orchestration
│       ├── profile/            # User History & Registration Management
│       └── organizer/          # Professional Dashboard & Signup Flow
├── data/
│   └── data.json               # Local Mock Database
└── package.json                # Dependency Manifest
```

## 🔧 Rapid Setup

1.  **Clone & Install**
    ```bash
    git clone <repository-url>
    cd EMS
    npm install
    ```

2.  **Launch the Backend**
    ```bash
    # Install json-server if needed
    npm install -g json-server
    
    # Start the data engine
    json-server --watch data/data.json --port 3000
    ```

3.  **Run Development Server**
    Serve `index.html` using a local server (e.g., Live Server in VS Code) to ensure ES module compatibility.

## 🤝 Contribution Guide

We maintain a high bar for visual and code quality. 

- **UI Consistency:** Follow the [Design System](file:///d:/project-vsc/EMS/DESIGN_SYSTEM.md).
- **Styling:** Modify styles only in `.scss` files. Compile before pushing:
  ```bash
  npx sass scss/main.scss css/main.css
  ```
- **State Management:** Always use the centralized `state.js` store for data persistence.
# SyncEvent (EMS) - Data Schema Documentation

This document outlines the data structure for the SyncEvent (EMS) application. It serves as a blueprint for future REST API development, ensuring data consistency across the platform.

---

## 1. User Entity (`users`)
Represents all system users, including Admins, Organizers, and Attendees.

### Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique identifier (e.g., `USR-1001`) |
| `password` | `String` | Hashed password (currently plain-text in mock) |
| `profile` | `Object` | Personal/Organization details |
| `role` | `Object` | Role name and permissions |
| `accountStatus` | `Object` | Verification and login metadata |
| `preferences` | `Object` | User settings (language, notifications) |
| `statistics` | `Object` | Summary of user activity |
| `savedEvents` | `Array<String>` | List of saved event IDs |

### Example
```json
{
  "id": "USR-1002",
  "profile": {
    "fullName": "Priya Menon",
    "email": "priya@techevents.in",
    "phone": "9845012345",
    "organizationName": "Priya Events",
    "bio": "Organizer of tech events"
  },
  "role": {
    "name": "ORGANIZER",
    "permissions": ["CREATE_EVENT", "MANAGE_EVENT"]
  },
  "accountStatus": {
    "status": "ACTIVE",
    "isEmailVerified": true
  }
}
```

---

## 2. Event Entity (`events`)
The core entity representing events created by organizers.

### Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique identifier (e.g., `EVT-1001`) |
| `title` | `String` | Title of the event |
| `description` | `String` | Short summary |
| `fullDescription`| `String` | Detailed event information |
| `categoryId` | `String` | Reference to Category ID |
| `venueId` | `String` | Reference to Venue ID |
| `organizerId` | `String` | Reference to User ID (Organizer) |
| `schedule` | `Object` | Start/End times and deadline |
| `tickets` | `Array<Object>` | Types, price, and quantities |
| `status` | `Object` | Current state (`DRAFT`, `PENDING`, `PUBLISHED`, `COMPLETED`) |
| `pricing.offers` | `Array<Object>`| Discount codes and percentages |

### Example
```json
{
  "id": "EVT-1001",
  "title": "DevFest Chennai 2026",
  "categoryId": "CAT-1",
  "schedule": {
    "startDateTime": "2026-04-15T09:00:00.000Z",
    "endDateTime": "2026-04-15T18:00:00.000Z"
  },
  "status": {
    "current": "PUBLISHED",
    "isFeatured": true
  }
}
```

---

## 3. Registration Entity (`registrations`)
Records an attendee's booking for a specific event.

### Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique identifier (e.g., `REG-101`) |
| `userId` | `String` | Reference to Attendee ID |
| `eventId` | `String` | Reference to Event ID |
| `ticketId` | `String` | Reference to specific ticket in event |
| `quantity` | `Number` | Number of tickets booked |
| `totalAmount` | `Number` | Total cost paid |
| `status` | `String` | `CONFIRMED`, `CANCELLED` |
| `paymentId` | `String` | Reference to Payment ID |

---

## 4. Payment Entity (`payments`)
Tracks financial transactions for registrations.

### Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique identifier (e.g., `PAY-1001`) |
| `registrationId`| `String` | Reference to Registration ID |
| `method` | `String` | Payment gateway (e.g., `RAZORPAY`) |
| `amount` | `Number` | Transaction amount |
| `status` | `String` | `CONFIRMED`, `REFUNDED`, `FAILED` |
| `razorpayId` | `String` | Reference ID from the gateway |

---

## 5. Other Entities

### Categories (`categories`)
Defines event types (e.g., Technology, Music).
- **Key Fields**: `id`, `name`, `icon`, `color`, `status`.

### Venues (`venues`)
Defines physical locations for events.
- **Key Fields**: `id`, `name`, `location`, `address`, `capacity`, `amenities`.

### Feedback (`feedbacks`)
User reviews for completed events.
- **Key Fields**: `id`, `eventId`, `userId`, `rating` (1-5), `comment`, `status` (`VISIBLE`, `FLAGGED`).

### Notifications (`notifications`)
System and user-specific alerts.
- **Key Fields**: `id`, `type`, `title`, `message`, `targetUserId`, `read` (Boolean).

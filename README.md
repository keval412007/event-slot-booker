# Event Slot Booker API

Backend REST API for booking event slots built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 📁 Project Structure

```text
event-slot-booker/
├── config/
│   └── db.js                 # MongoDB connection using Mongoose
├── models/
│   ├── EventSlot.js          # EventSlot Schema & Model
│   └── Booking.js            # Booking Schema & Model
├── controllers/
│   ├── slotController.js     # Logic for slots CRUD and availability
│   └── bookingController.js  # Booking, capacity checks, duplicate prevention, cancellation
├── routes/
│   ├── slotRoutes.js         # Routes for /api/slots
│   └── bookingRoutes.js      # Routes for /api/bookings
├── .env                      # Environment variables (PORT, MONGO_URI)
├── package.json              # Project metadata & dependencies
├── postman_collection.json   # Postman collection for all testing scenarios
└── server.js                 # Express app initialization & server entry point
```

---

## ⚙️ Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env`:**
   Make sure MongoDB is running locally, or replace with your MongoDB Atlas connection string:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/event_slot_booker
   ```

3. **Start the Server:**
   - Production / Standard:
     ```bash
     npm start
     ```
   - Development (with Nodemon auto-reload):
     ```bash
     npm run dev
     ```

---

## 📌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/slots` | Create a new event slot |
| `GET` | `/api/slots` | Get all slots with calculated `availableSeats` |
| `GET` | `/api/slots/:id` | Get single slot details & active booking count |
| `POST` | `/api/slots/:id/book` | Book a student into a slot |
| `GET` | `/api/slots/:id/bookings` | View active bookings for a specific slot |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel an existing booking (frees a seat) |
| `DELETE` | `/api/slots/:id` | Delete slot (blocked if active bookings exist) |

---

## 🧪 Postman Testing Guide

Import `postman_collection.json` into Postman or test manually:

### 1. Create Event Slot
- **POST** `http://localhost:5000/api/slots`
- **Body (JSON)**:
  ```json
  {
    "eventName": "AI & Cloud Computing Workshop",
    "date": "2026-10-15",
    "startTime": "10:00 AM",
    "endTime": "12:00 PM",
    "location": "Lab 3, CS Department",
    "capacity": 2,
    "status": "Open"
  }
  ```

### 2. Get All Slots
- **GET** `http://localhost:5000/api/slots`
- Notice `availableSeats: 2` (calculated as `capacity - activeBookings`).

### 3. Book Slot
- **POST** `http://localhost:5000/api/slots/<SLOT_ID>/book`
- **Body (JSON)**:
  ```json
  {
    "studentName": "Rahul Sharma",
    "email": "rahul@example.com",
    "rollNo": "CS-101"
  }
  ```

### 4. Test Duplicate Booking
- Send the same booking request again with `rahul@example.com`.
- **Response**: `400 Bad Request` - *"Duplicate Booking: An active booking already exists with this email for this slot"*.

### 5. Test Slot Full
- Book a second student to reach capacity (2/2).
- Attempt to book a 3rd student.
- **Response**: `400 Bad Request` - *"Full Slot: This slot has reached maximum capacity"*.

### 6. Cancel Booking
- **PATCH** `http://localhost:5000/api/bookings/<BOOKING_ID>/cancel`
- **Response**: `200 OK` - Status changed to `Cancelled`.
- Calling `GET /api/slots` will now show `availableSeats: 1` again!

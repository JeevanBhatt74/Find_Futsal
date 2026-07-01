# FindFutsal

FindFutsal is a premium booking network for Futsal courts in Nepal. It connects futsal enthusiasts with local venues, making it easy to discover, check availability, and book matches seamlessly.

## Features

### For Users
* **Discover Venues**: Search and filter futsal courts by city, price, and amenities.
* **Instant Booking**: Check real-time availability and book slots effortlessly.
* **User Dashboard**: Manage your bookings, profile, and history.
* **Partner with Us**: Venue owners can submit their courts to be listed on the platform.

### For Admins
* **Admin Dashboard**: View platform statistics, total revenue, and active venues.
* **Venue Management**: Approve or reject new venue listing requests.
* **User Management**: Oversee platform users and roles.

## Tech Stack

**Frontend:**
* React (Vite)
* TypeScript
* Tailwind CSS
* Lucide React (Icons)
* Zustand (State Management)
* React Router

**Backend:**
* Node.js
* Express.js
* MongoDB / Mongoose
* JWT Authentication
* TypeScript

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* MongoDB database instance

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FindFutsal
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the backend directory based on `.env.example` and add your MongoDB connection string and JWT secrets.

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run Development Servers**
   Open two terminal windows:
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the app.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.

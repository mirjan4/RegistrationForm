# Markaz Pros’ Annual Gathering - Event Registration System

A full-stack MERN application for event registration with a modern purple gradient theme and glassmorphism UI.

## 🚀 Features
- **Modern UI**: Responsive, mobile-friendly design using React and Tailwind CSS.
- **Registration Form**: Validated fields (Name, Phone, Place) with duplicate prevention.
- **Admin Dashboard**: Protected route to view, search, and delete registrations.
- **Export to CSV**: Download participant data easily.
- **Real-time Count**: Displays total registrations on the landing page.
- **Toast Notifications**: Smooth feedback for user actions.

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide React, Axios, React Hot Toast.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB.

## 🏃‍♂️ How to Run

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running locally (or provide a URI)

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create/verify `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/markaz_event
   ```
4. Start the server:
   ```bash
   npm run dev
   # OR
   node server.js
   ```

### 3. Frontend Setup
1. Open another terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173` (or the port shown in the terminal).

### 🔐 Admin Access
- **URL**: `http://localhost:5173/admin`
- **Username**: `admin`
- **Password**: `admin123`

## 📂 Project Structure
```
markaz-event-system/
├── backend/
│   ├── models/
│   │   └── Registration.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminLogin.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── RegistrationForm.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── tailwind.config.js
    └── package.json
```

# CampusEats

A full-stack campus food delivery and canteen pre-order web application built with React and Spring Boot.

## 📋 Project Overview

CampusEats is a comprehensive food ordering system designed specifically for campus environments. Students can browse menus from various campus canteens, place pre-orders, make payments, and pick up their food using QR codes - all while skipping the queue!

## 🚀 Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.2**
- **MongoDB** - NoSQL Database
- **Spring Security + JWT** - Authentication & Authorization
- **Stripe API** - Payment Processing
- **Maven** - Build Tool

### Frontend
- **React 19** - UI Library
- **Vite** - Build Tool & Dev Server
- **TailwindCSS** - Styling Framework
- **React Router 7** - Client-side Routing
- **Axios** - HTTP Client
- **EmailJS** - Email Notifications
- **html5-qrcode** - QR Code Scanning
- **Recharts** - Analytics & Charts

## 📁 Project Structure

```
CampusEats/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/campuseats/
│   │   │   │   ├── config/          # Security & CORS config
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── model/           # MongoDB Models
│   │   │   │   ├── repository/      # Data Access Layer
│   │   │   │   ├── security/        # JWT Components
│   │   │   │   └── service/         # Business Logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── README.md
│
└── frontend/                # React frontend
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── context/         # React Context (Auth)
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── README.md
```

## ⚙️ Setup Instructions

### Prerequisites
- **Java 17+**
- **Maven 3.6+**
- **Node.js 18+** and npm
- **MongoDB 4.4+**

### Backend Setup

1. **Install MongoDB** and ensure it's running on `localhost:27017`

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Configure application.properties:**
   ```properties
   # Update these values
   jwt.secret=your-secret-key-change-this-in-production-make-it-at-least-256-bits
   stripe.api.key=your-stripe-secret-key-here
   ```

4. **Build and run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Frontend will start on `http://localhost:5173`

## 🎯 Features

### ✅ Implemented
- User authentication (signup/login) with JWT
- Secure password hashing
- Protected routes
- Responsive UI with TailwindCSS
- API proxy configuration
- MongoDB integration

### 🚧 In Development
- **Food Booking Management** - Browse menus, place orders, track status
- **Review System** - Rate and review orders
- **QR Code Features** - Generate and scan QR codes for order pickup
- **Payment Integration** - Stripe payment processing
- **Email Notifications** - Order confirmations via EmailJS
- **Analytics Dashboard** - Order statistics with Recharts

## 👥 Team Structure

This is a team project with 4 members, each working on dedicated branches:

- **Team Leader** - Food Booking Management, Review System, QR Code Features
- **Member 2** - [Assign responsibilities]
- **Member 3** - [Assign responsibilities]
- **Member 4** - [Assign responsibilities]

## 🔐 API Endpoints

### Public Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints
All other endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## 🛠️ Development Workflow

1. **Create feature branch** from your assigned branch
2. **Develop your feature** following the project structure
3. **Test locally** with both backend and frontend running
4. **Commit and push** to your branch
5. **Create pull request** for review

## 📝 License

Private - Team Project

---

**Happy Coding! 🚀**
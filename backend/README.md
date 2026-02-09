# CampusEats Backend

Spring Boot backend for CampusEats - Campus Food Delivery and Canteen Pre-order System.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2**
- **MongoDB** - NoSQL Database
- **Spring Security + JWT** - Authentication & Authorization
- **Stripe API** - Payment Processing
- **Maven** - Build Tool

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/campuseats/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/           # MongoDB Models
│   │   │   ├── repository/      # MongoDB Repositories
│   │   │   ├── security/        # JWT Security Components
│   │   │   ├── service/         # Business Logic
│   │   │   └── CampusEatsApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── .gitignore
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB 4.4+

## Setup Instructions

### 1. Install MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a FREE M0 cluster
3. Create a database user and whitelist your IP
4. Get your connection string

📖 **Detailed Guide:** See [MONGODB_SETUP.md](MONGODB_SETUP.md)

**Option B: Local MongoDB**

Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)

### 2. Configure Environment Variables

**Create a `.env` file** in the backend directory (or set system environment variables):

```properties
# MongoDB Atlas connection string (or use localhost)
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.xxxxx.mongodb.net/campuseats?retryWrites=true&w=majority

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Stripe API Key (optional for now)
STRIPE_API_KEY=sk_test_your-stripe-key

# CORS Origins
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Windows PowerShell:**
```powershell
$env:MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/campuseats?retryWrites=true&w=majority"
$env:JWT_SECRET="your-secret-key-here"
```

> **Note:** If `MONGODB_URI` is not set, the application will use `mongodb://localhost:27017/campuseats`

### 3. Build the Project

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Protected Routes

All other routes require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Development

### Adding New Features

1. Create model in `model/` package
2. Create repository in `repository/` package
3. Create service in `service/` package
4. Create controller in `controller/` package
5. Add DTOs in `dto/` package if needed

### Testing

```bash
mvn test
```

## Team Responsibilities

- **Food Booking Management** - Order creation, management, and tracking
- **Review System** - User reviews and ratings
- **QR Code Features** - QR code generation and scanning for orders

## License

Private - Team Project

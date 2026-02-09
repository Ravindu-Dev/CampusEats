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

Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)

### 2. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/campuseats

# JWT Secret (Change this!)
jwt.secret=your-secret-key-change-this-in-production-make-it-at-least-256-bits

# Stripe API Key
stripe.api.key=your-stripe-secret-key-here

# CORS (Update for production)
cors.allowed.origins=http://localhost:5173
```

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

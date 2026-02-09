# CampusEats Frontend

React frontend for CampusEats - Campus Food Delivery and Canteen Pre-order System.

## Tech Stack

- **React 19** - UI Library
- **Vite** - Build Tool & Dev Server
- **TailwindCSS** - Styling
- **React Router 7** - Routing
- **Axios** - HTTP Client
- **EmailJS** - Email Notifications
- **html5-qrcode** - QR Code Scanning
- **Recharts** - Analytics Charts

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React Context providers
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .gitignore
```

## Prerequisites

- Node.js 18+ and npm

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

### Authentication
- User signup and login
- JWT token management
- Protected routes

### Food Booking Management
- Browse campus canteen menus
- Place orders
- Track order status
- QR code pickup

### Review System
- Rate and review orders
- View restaurant ratings
- Share feedback

### QR Code Features
- Generate QR codes for orders
- Scan QR codes for pickup
- Order verification

## Development Guidelines

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation if needed

### Adding New Services

1. Create service file in `src/services/`
2. Use the `api` instance from `src/services/api.js`
3. Handle errors appropriately

### Styling

- Use TailwindCSS utility classes
- Follow the existing color scheme (primary-600, etc.)
- Ensure responsive design (use `md:`, `lg:` breakpoints)

## Team Responsibilities

- **Food Booking Management** - Order creation, management, and tracking
- **Review System** - User reviews and ratings
- **QR Code Features** - QR code generation and scanning for orders

## License

Private - Team Project

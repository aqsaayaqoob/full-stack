# ShopEase - Full-Stack E-Commerce Application

A modern full-stack e-commerce application built with React, Node.js, Express, and SQLite.

## Features

- **Product Catalog**: Browse products by category, search functionality
- **Shopping Cart**: Add/remove items, update quantities
- **User Authentication**: Register, login, JWT-based auth
- **Order Management**: Place orders, view order history
- **Admin Dashboard**: Manage products, view orders, update order status

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Context API for state management
- CSS (custom styling)

### Backend
- Node.js with Express
- SQLite with better-sqlite3
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd full-stack
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Seed the database with sample data:
```bash
npm run seed
```

4. Start the development servers:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001`.

### Running Individual Services

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Demo Accounts

After seeding the database, you can use these accounts:

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@example.com      | admin123    |
| Customer | customer@example.com   | customer123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with search/filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/:id/status` - Update order status (admin)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js      # SQLite setup & schema
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js          # Auth endpoints
│   │   │   ├── cart.js          # Cart endpoints
│   │   │   ├── categories.js    # Category endpoints
│   │   │   ├── orders.js        # Order endpoints
│   │   │   └── products.js      # Product endpoints
│   │   ├── index.js             # Express app entry
│   │   └── seed.js              # Database seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── context/             # React Context providers
│   │   ├── pages/               # Page components
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI
└── package.json                 # Root package.json
```

## License

MIT

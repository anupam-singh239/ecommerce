# 🛍️ E-Commerce Website

A modern, full-stack e-commerce web application built using the MERN stack. The platform provides product browsing, user authentication, shopping cart, wishlist, order management, product reviews, coupons, and online payment integration.

## ✨ Features

### 🛒 Shopping Experience
- Browse and search products
- Filter products by category and brand
- Product details and pricing
- Shopping cart management
- Wishlist functionality
- Product reviews and ratings
- Address management
- Order history and tracking

### 👤 User Account
- User registration and login
- Profile management
- Profile image upload
- Password change
- Saved addresses

### 💳 Orders and Payments
- Cash on Delivery
- Razorpay payment integration
- PayPal sandbox integration
- Coupon and discount support
- Order status management

### 🛠️ Admin Dashboard
- Add, edit, and delete products
- Manage product stock and prices
- Manage offers and coupons
- View and manage orders
- Manage users
- Dashboard statistics

## 🧰 Technology Stack

**Frontend**
- React
- Vite
- Redux Toolkit
- Tailwind CSS
- React Router
- Lucide React

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT and cookie-based authentication

**Additional Services**
- Cloudinary for image storage
- Razorpay for payment processing
- PayPal Sandbox for payment testing

## 📁 Project Structure

```text
ecommerce/
├── client/       # React frontend
├── server/       # Node.js and Express backend
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- MongoDB Atlas account or MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ecommerce
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory and configure your required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Add other required credentials for Cloudinary and payment services according to your project configuration.

Start the backend:

```bash
npm start
```

If your project does not define a `start` script, use the command configured in your `server/package.json`.

### 3. Set up the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## 🌐 Deployment

The application can be deployed using:

- **Frontend:** Render Static Site
- **Backend:** Render Web Service
- **Database:** MongoDB Atlas

Configure environment variables, frontend API URLs, and backend CORS settings before deployment.

## 🔐 Security

- Keep API keys and database credentials in environment variables.
- Never commit `.env` files or payment secrets to GitHub.
- Use test credentials while developing payment integrations.

## 🎯 Project Goal

To provide a convenient online shopping experience with product discovery, secure authentication, inventory management, order processing, and payment integration.

## 👨‍💻 Author

**Anupam Singh**

Full-Stack Development Project

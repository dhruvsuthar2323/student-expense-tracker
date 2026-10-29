const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();

// --------------- Middleware ---------------

// CORS — allow the frontend to send cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: false }));

// Parse cookies
app.use(cookieParser());

// --------------- Routes ---------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);

// Future phase routes:
 app.use('/api/transactions', transactionRoutes);
 app.use('/api/budgets', budgetRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/users', userRoutes);

// Handle 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler (must be last)
app.use(errorHandler);

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

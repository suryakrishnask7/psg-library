require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const issueRoutes = require('./routes/issueRoutes');
const authRoutes = require('./routes/authRoutes');
const seedDB = require('./seed');
const { seedDefaultUsers } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database and initialize defaults
connectDB().then(async () => {
  try {
    await seedDefaultUsers();
  } catch (err) {
    console.error('Default users initialization error:', err.message);
  }
});

// Middleware
app.use(cors({
  origin: '*', // Allows Vercel frontend, local development, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Healthcheck & Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PSG Library Management System API is live and operational 📚',
    version: '1.0.0',
    documentation: '/api/books, /api/issues, /api/auth, /api/books/stats',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Seed API endpoint (useful for instant database setup in cloud & demo)
app.post('/api/seed', async (req, res) => {
  try {
    await seedDB();
    await seedDefaultUsers();
    res.json({ success: true, message: 'Database successfully seeded with PSG Library catalogue & demo users!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Seeding failed', error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 PSG Library Backend Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`🌐 Ready for Render Deployment on port: ${PORT}`);
  console.log(`=========================================`);
});

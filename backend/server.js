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
const startKeepAliveCron = require('./utils/keepAlive');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database and initialize defaults
connectDB().then(async () => {
  try {
    await seedDefaultUsers();
    // Auto-seed books if database is completely empty
    const Book = require('./models/Book');
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('⚡ Empty database detected. Auto-seeding 50 PSG books & circulation records...');
      await seedDB();
    }
  } catch (err) {
    console.error('Default initialization error:', err.message);
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

// Favicon handler to prevent 404 in logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Healthcheck & Root Endpoints
app.get('/', (req, res) => {
  const liveUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  res.json({
    message: 'PSG Library Management System API is live and operational 📚',
    serverUrl: liveUrl,
    version: '1.0.0',
    documentation: '/api/auth, /api/books, /api/issues, /api/books/stats (also accessible without /api prefix)',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
  });
});

app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Seed API endpoint (useful for instant database setup in cloud & demo)
app.post(['/api/seed', '/seed'], async (req, res) => {
  try {
    await seedDB();
    await seedDefaultUsers();
    res.json({ success: true, message: 'Database successfully seeded with PSG Library catalogue & demo users!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Seeding failed', error: err.message });
  }
});

// Mount Routes on BOTH /api/... and root /... so requests never 404
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/books', '/books'], bookRoutes);
app.use(['/api/issues', '/issues'], issueRoutes);

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
  const isRender = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL);
  const liveUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

  console.log(`=========================================`);
  console.log(`🚀 PSG Library Backend Server`);
  if (isRender) {
    console.log(`📡 Live Cloud URL: ${liveUrl}`);
    console.log(`🌐 Hosting Platform: Render Production Mode (Port ${PORT})`);
  } else {
    console.log(`📡 Local Dev URL: http://localhost:${PORT}`);
  }
  console.log(`=========================================`);

  // Start Render keep-alive background worker
  startKeepAliveCron();
});

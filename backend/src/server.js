import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/database.js';
import authRoute from './routes/authRoute.js';
import matchRoute from './routes/matchRoute.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', authRoute); // Authentication routes
app.use('/api', matchRoute); // Product matching route

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Visual Product Matcher API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      match: 'POST /api/match',
      products: 'GET /api/products',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum size is 10MB.',
    });
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      error: err.message,
    });
  }
  
  // Generic error
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Visual Product Matcher API Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log('='.repeat(60) + '\n');
  console.log('Available endpoints:');
  console.log(`  GET  /api/health     - Health check`);
  console.log(`  GET  /api/products   - List all products`);
  console.log(`  POST /api/match      - Find similar products`);
  console.log('\n' + '='.repeat(60) + '\n');
});

export default app;

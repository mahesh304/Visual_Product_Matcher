import mongoose from 'mongoose';

/**
 * MongoDB Database Connection
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visual-product-matcher';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Don't exit - allow app to run without DB for now
    console.log('⚠️  Running without database - authentication disabled');
  }
};

export default connectDB;

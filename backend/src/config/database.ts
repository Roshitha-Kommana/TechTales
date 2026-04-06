import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/techtales';

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log(`🔌 Attempting to connect to MongoDB at ${DATABASE_URL}...`);
    await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Attempting to start server anyway...');
    console.error('   Database operations will fail until MongoDB is available.');
    console.error(`   Please ensure MongoDB is running at: ${DATABASE_URL}`);
    console.error('   On Windows, you can start MongoDB with: net start MongoDB');
    // Don't exit - allow server to start without DB for development
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});



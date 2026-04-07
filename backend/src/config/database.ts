import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URI_LOCAL = process.env.MONGO_URI_LOCAL || process.env.DATABASE_URL || 'mongodb://localhost:27017/techtales';
const MONGO_URI_ATLAS = process.env.MONGO_URI_ATLAS;

const connectWithUrl = async (url: string) => {
  await mongoose.connect(url, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
    socketTimeoutMS: 45000,
  });
  const dbType = url.includes('mongodb+srv') ? 'ATLAS' : 'LOCAL';
  console.log(`✅ Connected to ${dbType} MongoDB successfully!`);
  console.log(`   Database: ${mongoose.connection.name}`);
};

const logConnectionWarnings = (url: string) => {
  console.error('⚠️  Attempting to start server anyway...');
  console.error('   Database operations will fail until MongoDB is available.');
  console.error(`   Please ensure MongoDB is running at: ${url}`);
  console.error('   On Windows, you can start MongoDB with: net start MongoDB');
};

export const connectDatabase = async (): Promise<void> => {
  const isAtlas = NODE_ENV === 'production';
  const dbUrl = (isAtlas && MONGO_URI_ATLAS) ? MONGO_URI_ATLAS : MONGO_URI_LOCAL;

  try {
    console.log(`🔌 Attempting to connect to ${isAtlas ? 'ATLAS' : 'LOCAL'} MongoDB...`);
    await connectWithUrl(dbUrl);
  } catch (error: any) {
    console.error(`❌ ${isAtlas ? 'ATLAS' : 'LOCAL'} MongoDB connection error:`, error.message);
    
    // Fallback to LOCAL if we were trying ATLAS
    if (isAtlas && MONGO_URI_ATLAS) {
      console.log(`🔄 Falling back to LOCAL MongoDB...`);
      try {
        await connectWithUrl(MONGO_URI_LOCAL);
      } catch (fallbackError: any) {
        console.error('❌ LOCAL MongoDB fallback connection error:', fallbackError.message);
        logConnectionWarnings(MONGO_URI_LOCAL);
      }
    } else {
      logConnectionWarnings(dbUrl);
    }
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});


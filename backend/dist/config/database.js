"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/storywizard';
const connectDatabase = async () => {
    try {
        console.log(`🔌 Attempting to connect to MongoDB at ${DATABASE_URL}...`);
        await mongoose_1.default.connect(DATABASE_URL, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB successfully!');
        console.log(`   Database: ${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('⚠️  Attempting to start server anyway...');
        console.error('   Database operations will fail until MongoDB is available.');
        console.error(`   Please ensure MongoDB is running at: ${DATABASE_URL}`);
        console.error('   On Windows, you can start MongoDB with: net start MongoDB');
        // Don't exit - allow server to start without DB for development
    }
};
exports.connectDatabase = connectDatabase;
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
//# sourceMappingURL=database.js.map
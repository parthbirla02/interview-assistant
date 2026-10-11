const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/interview_assistant';
    
    // Attempt standard connection first
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if no local mongod
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`⚠️ Could not connect to primary MongoDB at ${mongoURI} (${primaryErr.message}).`);
      console.log('🔄 Initializing in-memory MongoDB Server fallback for instant offline/zero-config operation...');
      
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Connected to In-Memory MongoDB: ${conn.connection.host}`);
      return conn;
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    console.log('Connecting to in-memory MongoDB...');
    await mongoose.connect(uri, options);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to in-memory MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

    console.log('Connected to in-memory MongoDB successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
    
    if (mongoServer) {
      await mongoServer.stop();
      console.log('Stopped in-memory MongoDB server');
    }
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Export connection state checker
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, disconnectDB, isConnected };

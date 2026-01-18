const mongoose = require('mongoose');

const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI. Did you forget to set up your .env file?');
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });

  const connection = mongoose.connection;

  connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
};

module.exports = connectDB;

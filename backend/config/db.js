const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/psg_library';
    
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host} [DB: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn(`Tip: For cloud deployment, set MONGODB_URI to your MongoDB Atlas connection string in .env or Render dashboard.`);
    // If running in development and local mongo fails, don't instantly crash the process, let server respond with configuration hints
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_slot_booker';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);

    // Try connecting to the specified MongoDB instance
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected successfully!`);
  } catch (err) {
    console.warn(`Local MongoDB not detected (${err.message}). Starting in-memory MongoDB server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`In-memory MongoDB Connected successfully at: ${uri}`);
    } catch (memErr) {
      console.error(`Failed to connect to MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

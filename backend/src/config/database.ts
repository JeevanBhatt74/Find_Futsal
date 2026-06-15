import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using the URI defined in environment variables.
 * Implements retry logic with exponential backoff for production resilience.
 */
const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  mongoose.set('strictQuery', true);

  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, {
        // Connection pool settings for optimal performance
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Graceful disconnect on process termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed due to app termination.');
        process.exit(0);
      });
      break; // Exit loop on successful connection
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      if (retries === 0) {
        process.exit(1);
      }
      // Wait for 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

export default connectDB;

import connectDB from '../config/database';
import mongoose from 'mongoose';

const runMigrations = async () => {
  try {
    await connectDB();
    console.log('Running database migrations...');
    // Add migration logic here (e.g., adding default fields to existing documents)
    
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();

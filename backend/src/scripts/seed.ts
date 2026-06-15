import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User';
import Venue from '../models/Venue';
import connectDB from '../config/database';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing database...');
    await User.deleteMany({});
    await Venue.deleteMany({});

    console.log('Seeding admin user...');
    const adminUser = await User.create({
      fullName: 'System Admin',
      email: 'admin@findfutsal.com',
      phone: '+9779840000000',
      password: 'password123',
      role: 'admin',
    });

    console.log('Seeding venue...');
    await Venue.create({
      name: 'Kathmandu Futsal Hub',
      location: {
        address: 'Baneshwor',
        city: 'Kathmandu',
        district: 'Kathmandu',
      },
      pricePerHour: 1500,
      contactPhone: '+9779841111111',
      ownerId: adminUser._id,
      surfaceType: 'Artificial Turf',
      cancellationPolicy: 'Moderate',
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

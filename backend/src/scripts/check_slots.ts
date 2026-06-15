import mongoose from 'mongoose';
import Slot from '../models/Slot';
import Venue from '../models/Venue';
import connectDB from '../config/database';

const check = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');
    const venues = await Venue.find();
    console.log(`Found ${venues.length} venues.`);
    for (const venue of venues) {
      console.log(`Venue: ${venue.name} (_id: ${venue._id})`);
    }
    const slots = await Slot.find();
    console.log(`Found ${slots.length} slots.`);
    if (slots.length > 0) {
      console.log('Sample slots:');
      slots.slice(0, 5).forEach(s => {
        console.log(`- Slot ID: ${s._id}, Start: ${s.startTime}, End: ${s.endTime}, Status: ${s.status}`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();

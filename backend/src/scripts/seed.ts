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

    console.log('Seeding venues...');
    const reliableImages = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDutFiPUSROLDIm2hymA2PDe8Loo8YXD2EjTbFvLg5w4SnsXjJNrprc6v_yWSjMwcgx1XqoJ8RagldzlymShbmDepQBw6RwzHaqDI8Mb2hjWEqjTOnSgXCVw_xR-DyhCblo1nsoGBfOOlt0KAkDnTEBo7BjPDOfeBTLgjk678p4IR7feHtxVccy_MEUc9R_7GU7l4veRm4JASlV86-zlmCEboWNOmnPbjdatj_jrdqb-FzaGDRGamVRC8zYU0DGrYnvLpT_0dJpHZs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBHYAwbuuNT8wCGl_u7n38Tf2Tfh3hQe0fXkkT78_ZBDNGk1cwSG_8wdOtqFeeezanXLouEaO0Abyrqy6_HsZtffYEYE21sDi0wgGe6MznjTw4-acuk8TtvqMVKDyWBmx6MfSBUgFUABdC2Sq-C2vN_3npanw5I2Y9TR7-rgKKA-rD_b1bYcozoACwITATkLQSSyPuHIzR0fz98BNF6dj-6QQL0V7dLY-sxlrDzMVbjdj1KQrZPW3fw5zEjoCZjSIq_MN1HpE3GFj8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCfy8T51ixMd3CiaU9mwVb38Zf8nR3tZYKxkrpYotgnroSmKb_gEc-9O_WDpRtbEs4gbucjBbzlpy9IycOdEiKNApCHkh7cpONIhKoUh4_qhETMYtuTkOW0aHwKgq7AkBCdCn7grWY6LSQEDtrGMVuJcKmb8m_ym8mbkofY4OvDMrP0D5JEv2SATqCh2cMDBlD1DyfpLqbGhNlBzXP4jt9VIpJ8xno8GheWCpDJcM6ZspuN0HFlbVZHPiiE8E2CHu_ORJXRuiY_SQ8'
    ];

    const sampleImages = [
      { url: reliableImages[0], isPrimary: true },
      { url: reliableImages[1], isPrimary: false },
      { url: reliableImages[2], isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1575361204481-48a2b5b310fb?q=80&w=1200', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1518605368461-1eb47b85f269?q=80&w=1200', isPrimary: false }
    ];

    const venues = [
      {
        name: 'Dhuku Futsal Hub',
        description: 'Premium indoor futsal arena located in the heart of Baluwatar. Features FIFA standard artificial turf.',
        location: { address: 'Baluwatar', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.7284, longitude: 85.3283 },
        pricePerHour: 1800, contactPhone: '+9779841111111', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Moderate',
        amenities: ['Floodlights', 'Showers', 'Parking', 'Cafeteria'], rating: 4.9, totalReviews: 124,
        images: [sampleImages[0], sampleImages[1], sampleImages[2], sampleImages[3], sampleImages[4]]
      },
      {
        name: 'Shantinagar Futsal',
        description: 'Outdoor turf futsal with spacious parking and great cafe.',
        location: { address: 'Shantinagar', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.6888, longitude: 85.3414 },
        pricePerHour: 1500, contactPhone: '+9779842222222', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Flexible',
        amenities: ['Floodlights', 'Parking', 'Cafeteria'], rating: 4.7, totalReviews: 89,
        images: [sampleImages[1], sampleImages[2], sampleImages[3], sampleImages[4], sampleImages[0]]
      },
      {
        name: 'X-Cel Futsal',
        description: 'Large training pitch suitable for 6v6 matches.',
        location: { address: 'Balaju', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.7335, longitude: 85.3050 },
        pricePerHour: 1200, contactPhone: '+9779843333333', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Strict',
        amenities: ['Floodlights', 'Parking', 'Showers'], rating: 4.5, totalReviews: 56,
        images: [sampleImages[2], sampleImages[3], sampleImages[4], sampleImages[0], sampleImages[1]]
      },
      {
        name: 'Field Futsal',
        description: 'High quality turf, completely covered for all weather play.',
        location: { address: 'Sanepa', city: 'Lalitpur', district: 'Lalitpur', latitude: 27.6756, longitude: 85.3052 },
        pricePerHour: 2000, contactPhone: '+9779844444444', ownerId: adminUser._id, surfaceType: 'Indoor Wood', cancellationPolicy: 'Moderate',
        amenities: ['Showers', 'Parking', 'Cafeteria'], rating: 4.8, totalReviews: 210,
        images: [sampleImages[3], sampleImages[4], sampleImages[0], sampleImages[1], sampleImages[2]]
      },
      {
        name: 'Baneshwor Recreation Centre',
        description: 'Affordable and accessible community futsal ground.',
        location: { address: 'Baneshwor', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.6930, longitude: 85.3400 },
        pricePerHour: 1000, contactPhone: '+9779845555555', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Flexible',
        amenities: ['Floodlights', 'Parking'], rating: 4.2, totalReviews: 45,
        images: [sampleImages[4], sampleImages[0], sampleImages[1], sampleImages[2], sampleImages[3]]
      },
      {
        name: 'The Arena Futsal',
        description: 'Premium quality turf with a 5-a-side layout.',
        location: { address: 'Gwarko', city: 'Lalitpur', district: 'Lalitpur', latitude: 27.6685, longitude: 85.3340 },
        pricePerHour: 1600, contactPhone: '+9779846666666', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Moderate',
        amenities: ['Floodlights', 'Parking', 'Showers', 'Cafeteria'], rating: 4.6, totalReviews: 130,
        images: [sampleImages[0], sampleImages[2], sampleImages[4], sampleImages[1], sampleImages[3]]
      },
      {
        name: 'Grassroots Futsal',
        description: 'Top notch facilities with ample space for spectators.',
        location: { address: 'Mandikatar', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.7405, longitude: 85.3478 },
        pricePerHour: 1400, contactPhone: '+9779847777777', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Flexible',
        amenities: ['Floodlights', 'Parking', 'Cafeteria'], rating: 4.4, totalReviews: 75,
        images: [sampleImages[1], sampleImages[3], sampleImages[0], sampleImages[2], sampleImages[4]]
      },
      {
        name: 'Whitehouse Futsal',
        description: 'Well-maintained turf with an attached restaurant.',
        location: { address: 'Khumaltar', city: 'Lalitpur', district: 'Lalitpur', latitude: 27.6534, longitude: 85.3312 },
        pricePerHour: 1300, contactPhone: '+9779848888888', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Moderate',
        amenities: ['Showers', 'Parking', 'Cafeteria'], rating: 4.1, totalReviews: 40,
        images: [sampleImages[2], sampleImages[4], sampleImages[1], sampleImages[3], sampleImages[0]]
      },
      {
        name: 'Samakhusi Futsal',
        description: 'Popular among locals, very busy during evenings.',
        location: { address: 'Samakhusi', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.7310, longitude: 85.3138 },
        pricePerHour: 1200, contactPhone: '+9779849999999', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Flexible',
        amenities: ['Floodlights', 'Parking'], rating: 4.3, totalReviews: 112,
        images: [sampleImages[3], sampleImages[0], sampleImages[2], sampleImages[4], sampleImages[1]]
      },
      {
        name: 'Excel Futsal Arena',
        description: 'Huge venue, great for corporate events and tournaments.',
        location: { address: 'Bhaktapur', city: 'Bhaktapur', district: 'Bhaktapur', latitude: 27.6722, longitude: 85.4277 },
        pricePerHour: 1700, contactPhone: '+9779850000000', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Strict',
        amenities: ['Floodlights', 'Showers', 'Parking', 'Cafeteria'], rating: 4.7, totalReviews: 180,
        images: [sampleImages[4], sampleImages[1], sampleImages[3], sampleImages[0], sampleImages[2]]
      },
      {
        name: 'Velocity Futsal',
        description: 'High performance turf perfect for competitive matches.',
        location: { address: 'Koteshwor', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.6751, longitude: 85.3468 },
        pricePerHour: 1500, contactPhone: '+9779851111111', ownerId: adminUser._id, surfaceType: 'Indoor Wood', cancellationPolicy: 'Moderate',
        amenities: ['Showers', 'Parking', 'Cafeteria'], rating: 4.8, totalReviews: 95,
        images: [sampleImages[0], sampleImages[3], sampleImages[1], sampleImages[4], sampleImages[2]]
      },
      {
        name: 'Goalden Futsal',
        description: 'Cozy and well-lit venue for night matches.',
        location: { address: 'Boudha', city: 'Kathmandu', district: 'Kathmandu', latitude: 27.7215, longitude: 85.3612 },
        pricePerHour: 1100, contactPhone: '+9779852222222', ownerId: adminUser._id, surfaceType: 'Artificial Turf', cancellationPolicy: 'Flexible',
        amenities: ['Floodlights', 'Parking'], rating: 4.0, totalReviews: 30,
        images: [sampleImages[1], sampleImages[4], sampleImages[2], sampleImages[0], sampleImages[3]]
      }
    ];

    await Venue.insertMany(venues);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

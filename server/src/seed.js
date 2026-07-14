const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const User = require('./models/User');

const seedCategories = [
  { name: 'Barber', icon: '✂️', description: 'Haircuts, beard trims, and styling services' },
  { name: 'Hair Salon', icon: '💇', description: 'Full hair salon treatments, coloring, and styling' },
  { name: 'Beauty Salon', icon: '💅', description: 'Manicures, pedicures, makeup, and skin care' },
  { name: 'Grocery Store', icon: '🛒', description: 'Supermarkets, organic food shops, and grocery delivery' },
  { name: 'Shopkeeper', icon: '🏪', description: 'General retail shops and neighborhood stores' },
  { name: 'Restaurant', icon: '🍕', description: 'Fine dining, cafes, fast food, and local eateries' },
  { name: 'Cafe', icon: '☕', description: 'Coffee houses, bakeries, and tea shops' },
  { name: 'Bakery', icon: '🍰', description: 'Fresh bread, cakes, pastries, and baked goods' },
  { name: 'Mechanic', icon: '🔧', description: 'Car repairs, oil changes, engine tuning, and tire services' },
  { name: 'Electrician', icon: '⚡', description: 'Home electrical installations, repairs, and wiring' },
  { name: 'Plumber', icon: '🪠', description: 'Leaking pipe repairs, drainage cleaning, and tap installation' },
  { name: 'Photographer', icon: '📸', description: 'Event photography, portraits, weddings, and videography' },
  { name: 'Tutor', icon: '🎓', description: 'School, college, and university level coaching and classes' },
  { name: 'Doctor', icon: '🏥', description: 'General physicians, specialists, clinics, and health consultations' },
  { name: 'Dentist', icon: '🦷', description: 'Dental cleaning, fillings, crowns, and oral health checkups' },
  { name: 'Pharmacy', icon: '💊', description: 'Medicines, prescriptions, and health essentials' },
  { name: 'Gym Trainer', icon: '🏋️', description: 'Fitness coaching, gym plans, and personal training' },
  { name: 'Home Cleaning', icon: '🧹', description: 'Full house cleaning, vacuuming, and dusting services' },
  { name: 'Laundry Service', icon: '🧺', description: 'Laundry, ironing, dry cleaning, and fabric care' },
  { name: 'Painter', icon: '🎨', description: 'Wall painting, interior design, and home renovation painting' },
  { name: 'Carpenter', icon: '🪚', description: 'Furniture making, wood repairs, and custom woodwork' },
  { name: 'AC Technician', icon: '❄️', description: 'Air conditioner installation, servicing, and gas refills' },
  { name: 'Mobile Repair', icon: '📱', description: 'Phone diagnostics, screen replacement, and mobile repairs' },
  { name: 'Computer Repair', icon: '💻', description: 'Laptop and desktop repairs, upgrades, and troubleshooting' },
  { name: 'Car Wash', icon: '🚿', description: 'Detailing, polishing, vacuuming, and exterior washing' },
  { name: 'Tailor', icon: '🪡', description: 'Custom stitching, alterations, suits, and dresses fitting' },
  { name: 'Cleaning Service', icon: '🧼', description: 'Professional home and office cleaning services' },
  { name: 'Real Estate Agent', icon: '🏢', description: 'Property dealers, rental assistance, and buying/selling agents' },
  { name: 'Lawyer', icon: '⚖️', description: 'Lawyer consults, agreement drafting, and legal support' },
  { name: 'Accountant', icon: '📊', description: 'Tax filing, bookkeeping, and financial consultation' },
  { name: 'Travel Agency', icon: '✈️', description: 'Domestic and international travel planning and bookings' },
  { name: 'Event Planner', icon: '🎉', description: 'Event planning, coordination, and venue management' }
];

const seedPlans = [
  { name: 'Free', price: 0, durationDays: 30, features: ['List 1 Business Profile', 'Manage up to 5 Services', 'Basic Search Visibility'] },
  { name: 'Premium', price: 29, durationDays: 30, features: ['List up to 3 Business Profiles', 'Unlimited Services Listing', 'Enhanced Search Visibility', 'Verified Bronze/Silver Badge', 'WhatsApp Redirect Analytics'] },
  { name: 'Enterprise', price: 89, durationDays: 30, features: ['Unlimited Business Profiles', 'Unlimited Services Listing', 'Top Search Visibility', 'Verified Gold/Premium Badge', 'Full Analytics Dashboard', 'Featured Business Slots'] }
];

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace';
    await mongoose.connect(mongoUri);
    console.log('💚 Connected to MongoDB for seeding database...');

    // 1. Seed Categories
    await Category.deleteMany();
    console.log('🧹 Old categories deleted.');
    await Category.insertMany(seedCategories);
    console.log('📦 Categories seeded successfully.');

    // 2. Seed Subscription Plans
    await SubscriptionPlan.deleteMany();
    console.log('🧹 Old subscription plans deleted.');
    await SubscriptionPlan.insertMany(seedPlans);
    console.log('📦 Subscription plans seeded successfully.');

    // 3. Seed Super Admin
    await User.deleteMany({ role: 'super_admin' });
    console.log('🧹 Old super admins deleted.');
    
    const superAdmin = await User.create({
      fullName: 'Super Admin',
      email: 'admin@marketplace.com',
      password: 'Admin@123',
      role: 'super_admin',
      isEmailVerified: true
    });
    console.log('📦 Super admin created successfully.');
    console.log(`🔑 Credentials:\nEmail: admin@marketplace.com\nPassword: Admin@123`);

    mongoose.connection.close();
    console.log('🔌 Database connection closed. Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

runSeed();

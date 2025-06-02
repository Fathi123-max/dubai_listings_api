#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Property from '../src/models/Property.js';
import Review from '../src/models/Review.js';
import { connectDB, disconnectDB } from '../src/utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    phone: '+971501234567',
  },
  {
    name: 'Real Estate Agent',
    email: 'agent@example.com',
    password: 'password123',
    role: 'agent',
    phone: '+971501234568',
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    phone: '+971501234569',
  },
];

const properties = [
  {
    title: 'Luxury Apartment in Downtown Dubai',
    description: 'Beautiful luxury apartment with amazing views of Burj Khalifa',
    price: 2500000,
    location: {
      type: 'Point',
      coordinates: [55.2744, 25.1972], // Downtown Dubai
      address: 'Downtown Dubai, Dubai, UAE',
    },
    propertyType: 'apartment',
    propertyStatus: 'for-sale',
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    yearBuilt: 2020,
    features: ['Swimming Pool', 'Gym', 'Parking', 'Balcony', 'Security'],
    amenities: [
      'Air Conditioning',
      'Central Heating',
      'Laundry',
      'Microwave',
      'Refrigerator',
      'TV',
      'WiFi',
    ],
    images: [
      'https://example.com/images/property1-1.jpg',
      'https://example.com/images/property1-2.jpg',
    ],
  },
  {
    title: 'Villa in Palm Jumeirah',
    description: 'Stunning beachfront villa with private pool',
    price: 15000000,
    location: {
      type: 'Point',
      coordinates: [55.1381, 25.1128], // Palm Jumeirah
      address: 'Palm Jumeirah, Dubai, UAE',
    },
    propertyType: 'villa',
    propertyStatus: 'for-sale',
    bedrooms: 5,
    bathrooms: 6,
    area: 450,
    yearBuilt: 2019,
    features: [
      'Private Beach',
      'Swimming Pool',
      'Garden',
      'Gym',
      'Parking',
      'Security',
      'Maid Room',
    ],
    amenities: [
      'Air Conditioning',
      'Central Heating',
      'Laundry',
      'Microwave',
      'Refrigerator',
      'TV',
      'WiFi',
      'Dishwasher',
    ],
    images: [
      'https://example.com/images/property2-1.jpg',
      'https://example.com/images/property2-2.jpg',
    ],
  },
];

const reviews = [
  {
    rating: 5,
    comment: 'Amazing property with great views!',
  },
  {
    rating: 4,
    comment: 'Lovely place, would recommend!',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
        passwordConfirm: hashedPassword,
        emailVerified: true,
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create properties
    console.log('Creating properties...');
    const createdProperties = [];
    for (const propertyData of properties) {
      const property = new Property({
        ...propertyData,
        user: createdUsers[1]._id, // Assign to agent
      });
      await property.save();
      createdProperties.push(property);
      console.log(`Created property: ${property.title}`);
    }

    // Create reviews
    console.log('Creating reviews...');
    for (let i = 0; i < reviews.length; i++) {
      const review = new Review({
        ...reviews[i],
        property: createdProperties[0]._id, // Review for the first property
        user: createdUsers[2]._id, // Review by the regular user
      });
      await review.save();
      console.log(`Created review by ${createdUsers[2].name}`);
    }

    console.log('Database seeded successfully!');
    console.log('\nSample Users:');
    console.log('------------');
    console.log('Admin:', {
      email: 'admin@example.com',
      password: 'password123',
    });
    console.log('Agent:', {
      email: 'agent@example.com',
      password: 'password123',
    });
    console.log('User:', {
      email: 'user@example.com',
      password: 'password123',
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

// Run the seeder
if (process.env.NODE_ENV !== 'production') {
  seedDatabase();
} else {
  console.error('Seeding is not allowed in production environment');
  process.exit(1);
}

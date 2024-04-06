//TODO: seeds script should come here, so we'll be able to put some data in our local env
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const faker = require('faker');

// Load environment variables
dotenv.config(); 

// Import your models
const User = require('./models/User.js');
const Item = require('./models/Item.js');
const Comment = require('./models/Comment.js');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB: ', err));

// Seed data generation
const generateUsers = (numUsers) => {
  const users = [];
  for (let i = 0; i < numUsers; i++) {
    users.push({
      name: faker.name.findName(),
      email: faker.internet.email(),
      // ...other user properties
    });
  }
  return users;
};

// Generate similar functions for items and comments:
const generateItems = (numItems) => { /* ... */ };
const generateComments = (numComments, users, items) => { /* ... */ };

// Seed function
const seedDB = async () => {
  await User.deleteMany({}); // Clear the all collections first
  await Item.deleteMany({});
  await Comment.deleteMany({});

  const users = generateUsers(100); // Generate 10 sample users
  const createdUsers = await User.insertMany(users);

  const items = generateItems(100); // Generate 5 sample items
  const itemsWithUserRefs = items.map(item => ({ ...item, user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id}));
  const createdItems = await Item.insertMany(itemsWithUserRefs);

  const comments = generateComments(100, createdUsers, createdItems); 
  await Comment.insertMany(comments);

  console.log('Database seeded!');
  mongoose.disconnect();
};

seedDB();

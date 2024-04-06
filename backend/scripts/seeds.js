//TODO: seeds script should come here, so we'll be able to put some data in our local env
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

dotenv.config();

faker.seed(42);

// Import your models
const User = require('../models/User.js');
const Item = require('../models/Item.js');
const Comment = require('../models/Comment.js');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB: ', err));

// Seed data generation
const generateUsers = (numUsers) => {
    const users = [];
    for (let i = 0; i < numUsers; i++) {
        users.push({
            username: faker.internet.userName().slice(-8),
            email: faker.internet.email(),
            // bio: faker.person.bio(),
            name: faker.person.fullName(),
            password: faker.internet.password(),
        });
    }
    return users;
};

const generateItems = (numItems) => {
    const items = [];
    for (let i = 0; i < numItems; i++) {
        items.push({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription()
        });
    }
    return items;
};

const generateComments = (numComments, users, items) => {
    const comments = [];
    for (let i = 0; i < numComments; i++) {
        comments.push({
            content: faker.commerce.productAdjective(),
            user: users[Math.floor(Math.random() * users.length)]._id,
            item: items[Math.floor(Math.random() * items.length)]._id
        });
    }
    return comments;
};


// Seed function
const seedDB = async () => {
    await User.deleteMany({}); // Clear the all collections first
    await Item.deleteMany({});
    await Comment.deleteMany({});

    const users = generateUsers(100); // Generate 100 sample users
    const createdUsers = await User.insertMany(users);

    const items = generateItems(100); // Generate 100 sample items
    const itemsWithUserRefs = items.map(item => ({ ...item, user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id }));
    const createdItems = await Item.insertMany(itemsWithUserRefs);

    const comments = generateComments(100, createdUsers, createdItems);
    await Comment.insertMany(comments);

    console.log('Database seeded!');
    mongoose.disconnect();
};

seedDB();
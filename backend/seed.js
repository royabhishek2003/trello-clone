require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Board = require('./models/Board');
const List = require('./models/List');
const Card = require('./models/Card');
const OrgLimit = require('./models/OrgLimit');
const connectDB = require('./config/db');

const USERS = [
  { firstName: 'Tony', lastName: 'Stark', email: 'tony@stark.com', password: 'password123' },
  { firstName: 'Bruce', lastName: 'Wayne', email: 'bruce@wayne.com', password: 'password123' },
  { firstName: 'Peter', lastName: 'Parker', email: 'peter@parker.com', password: 'password123' },
  { firstName: 'Natasha', lastName: 'Romanoff', email: 'natasha@romanoff.com', password: 'password123' }
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected.');

    // 1. Seed Users (Upsert)
    console.log('Seeding users...');
    const userDocs = [];
    for (const userData of USERS) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created user: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`User already exists: ${user.firstName} ${user.lastName}`);
      }
      userDocs.push(user);
    }

    const tony = userDocs[0]; // Tony Stark is main user

    // 2. Seed Organization (Upsert)
    console.log('Seeding organization...');
    let acmeCorp = await Organization.findOne({ name: 'Acme Corp', owner: tony._id });
    if (!acmeCorp) {
      acmeCorp = await Organization.create({
        name: 'Acme Corp',
        owner: tony._id,
        members: userDocs.map(u => ({
          user: u._id,
          role: u._id.equals(tony._id) ? 'admin' : 'member'
        }))
      });
      console.log('Created organization: Acme Corp');
    } else {
      console.log('Organization already exists: Acme Corp');
    }

    // Set Tony's active organization
    if (!tony.activeOrganization || !tony.activeOrganization.equals(acmeCorp._id)) {
      tony.activeOrganization = acmeCorp._id;
      await tony.save();
    }

    // 3. Seed Boards (Upsert)
    console.log('Seeding boards...');
    let productRoadmap = await Board.findOne({ orgId: acmeCorp._id.toString(), title: 'Product Roadmap' });
    if (!productRoadmap) {
      productRoadmap = await Board.create({
        orgId: acmeCorp._id.toString(),
        title: 'Product Roadmap',
        imageId: 'sample_id',
        imageThumbUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
        imageFullUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        imageUserName: 'Sample User',
        imageLinkHTML: '<a href="#">Unsplash</a>'
      });
      console.log('Created board: Product Roadmap');
      
      // 4. Seed Lists & Cards inside the new board
      const listTitles = ['Backlog', 'Todo', 'In Progress', 'Done'];
      const createdLists = [];
      for (let i = 0; i < listTitles.length; i++) {
        const list = await List.create({
          title: listTitles[i],
          order: i,
          boardId: productRoadmap._id
        });
        createdLists.push(list);
      }
      console.log('Created lists for Product Roadmap.');

      // Add cards to Todo
      const todoList = createdLists[1];
      await Card.create({ title: 'Design Database Schema', order: 0, description: 'Design Mongoose models', listId: todoList._id });
      await Card.create({ title: 'Setup Express Server', order: 1, description: 'Configure routes and middleware', listId: todoList._id });
      
      // Add cards to In Progress
      const inProgressList = createdLists[2];
      await Card.create({ title: 'Refactor Frontend Auth', order: 0, description: 'Bypass JWT on frontend', listId: inProgressList._id });
      
      console.log('Created sample cards.');
    } else {
      console.log('Board already exists: Product Roadmap');
    }

    let devSprint = await Board.findOne({ orgId: acmeCorp._id.toString(), title: 'Development Sprint' });
    if (!devSprint) {
      devSprint = await Board.create({
        orgId: acmeCorp._id.toString(),
        title: 'Development Sprint',
        imageId: 'sample_id2',
        imageThumbUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop',
        imageFullUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
        imageUserName: 'Sample User',
        imageLinkHTML: '<a href="#">Unsplash</a>'
      });
      console.log('Created board: Development Sprint');
    } else {
      console.log('Board already exists: Development Sprint');
    }

    console.log('Syncing Organization Board Limits...');
    const boards = await Board.find({});
    const orgCounts = {};
    for (const board of boards) {
      orgCounts[board.orgId] = (orgCounts[board.orgId] || 0) + 1;
    }
    for (const orgId of Object.keys(orgCounts)) {
      const count = orgCounts[orgId];
      let orgLimit = await OrgLimit.findOne({ orgId });
      if (orgLimit) {
        orgLimit.count = count;
        await orgLimit.save();
      } else {
        await OrgLimit.create({ orgId, count });
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

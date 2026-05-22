require('dotenv').config();
const mongoose = require('mongoose');
const Board = require('./models/Board');
const OrgLimit = require('./models/OrgLimit');
const connectDB = require('./config/db');

const fixLimits = async () => {
  try {
    await connectDB();
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
    console.log('Fixed limits successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixLimits();

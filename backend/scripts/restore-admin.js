require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const Org = require('./backend/models/Organization');
const User = require('./backend/models/User');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI.replace(/"/g, '').replace(/'/g, '');
    await mongoose.connect(uri);
    console.log('Connected to DB');
    const user = await User.findOne({ email: 'tony@stark.com' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    const orgs = await Org.find({ 'members.user': user._id });
    for (const org of orgs) {
      const member = org.members.find(m => m.user.toString() === user._id.toString());
      if (member) {
        member.role = 'admin';
      }
      await org.save();
      console.log('Made admin of org:', org.name);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();

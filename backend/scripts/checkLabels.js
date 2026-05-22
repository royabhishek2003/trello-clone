require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Label = require('../models/Label');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const labels = await Label.find();
    console.log(labels);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Card = require('../models/Card');
const Label = require('../models/Label');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected securely");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

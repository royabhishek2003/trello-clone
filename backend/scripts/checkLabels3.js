require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Card = require('../models/Card');
const Label = require('../models/Label');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const cards = await Card.find({ labels: { $exists: true, $not: {$size: 0} } }).populate('labels');
    console.log('Cards with labels: ' + cards.length);
    if(cards.length > 0) {
       console.log('Sample card labels: ', cards[0].title, cards[0].labels);
    }
    
    const home = await Card.findOne({ title: 'home page' });
    console.log('Home page card labels: ', home ? home.labels : 'Card not found');
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

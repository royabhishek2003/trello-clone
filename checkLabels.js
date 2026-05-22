const mongoose = require('mongoose');
const Card = require('./backend/models/Card');
require('dotenv').config({ path: 'c:/Users/hp/OneDrive/Desktop/trello-clone/trello-clone/backend/.env' });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const cards = await Card.find({ labels: { $exists: true, $not: {$size: 0} } }).populate('labels');
    console.log("Cards with labels:", JSON.stringify(cards, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

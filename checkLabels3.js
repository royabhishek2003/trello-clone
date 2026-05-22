const mongoose = require('mongoose');
const Card = require('./backend/models/Card');
const Label = require('./backend/models/Label');

mongoose.connect('mongodb+srv://kishanabhishek2003_db_user:UQd5ObQkuSmICl7f@cluster0.5usyeea.mongodb.net/trello-clone')
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

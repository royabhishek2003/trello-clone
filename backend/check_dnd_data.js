const mongoose = require('mongoose');
require('dotenv').config();

const List = require('./models/List');
const Card = require('./models/Card');
const Board = require('./models/Board');
const Organization = require('./models/Organization');

async function checkAllDataAnomalies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const boards = await Board.find({});
    console.log(`Checking all ${boards.length} boards...`);
    
    let totalAnomalies = 0;
    
    for (const board of boards) {
      const lists = await List.find({ boardId: board._id }).sort('order');
      
      const listIds = new Set();
      let listDuplicates = 0;
      
      for (const list of lists) {
        if (listIds.has(list._id.toString())) {
          console.error(`\n[ANOMALY] Board "${board.title}": DUPLICATE LIST ID FOUND: ${list._id}`);
          listDuplicates++;
          totalAnomalies++;
        }
        listIds.add(list._id.toString());
        
        const cards = await Card.find({ listId: list._id }).sort('order');
        const cardIds = new Set();
        let cardDuplicates = 0;
        
        for (const card of cards) {
          if (cardIds.has(card._id.toString())) {
            console.error(`\n[ANOMALY] Board "${board.title}", List "${list.title}": DUPLICATE CARD ID FOUND: ${card._id}`);
            cardDuplicates++;
            totalAnomalies++;
          }
          cardIds.add(card._id.toString());
        }
      }
      
      const listOrders = lists.map(l => l.order);
      const uniqueListOrders = new Set(listOrders);
      if (listOrders.length !== uniqueListOrders.size) {
          console.error(`\n[ANOMALY] Board "${board.title}": Duplicate list ORDERS found! [${listOrders.join(', ')}]`);
          totalAnomalies++;
      }
      
      let totalCardsInBoard = 0;
      for (const list of lists) {
          const cards = await Card.find({ listId: list._id }).sort('order');
          const cardOrders = cards.map(c => c.order);
          totalCardsInBoard += cards.length;
          const uniqueCardOrders = new Set(cardOrders);
          if (cardOrders.length !== uniqueCardOrders.size) {
              console.error(`\n[ANOMALY] Board "${board.title}", List "${list.title}": Duplicate card ORDERS found! [${cardOrders.join(', ')}]`);
              totalAnomalies++;
          }
      }
      
      console.log(`Board "${board.title}": ${lists.length} lists, ${totalCardsInBoard} total cards.`);
    }
    
    console.log(`\nScan complete. Total anomalies found: ${totalAnomalies}`);
    mongoose.disconnect();
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
  }
}

checkAllDataAnomalies();

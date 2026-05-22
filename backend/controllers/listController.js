const List = require('../models/List');
const Card = require('../models/Card');
const Board = require('../models/Board');
const { createAuditLog } = require('../services/auditLogService');

// @desc    Get lists for a board
// @route   GET /api/lists
// @access  Private
const getLists = async (req, res) => {
  try {
    const { boardId } = req.query;
    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const lists = await List.find({ boardId }).sort({ order: 1 }).lean();
    const listIds = lists.map(l => l._id);
    
    const cards = await Card.find({ listId: { $in: listIds } }).sort({ order: 1 }).lean();
    
    lists.forEach(list => {
      list.cards = cards.filter(card => card.listId.toString() === list._id.toString());
    });

    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a list in a board
// @route   POST /api/lists
// @access  Private
const createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ error: 'Title and Board ID are required' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Find last list to determine order position
    const lastList = await List.findOne({ boardId }).sort({ order: -1 });
    const order = lastList ? lastList.order + 1 : 1;

    const list = new List({
      title,
      order,
      boardId
    });

    await list.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: list._id.toString(),
        entityType: 'LIST',
        entityTitle: list.title,
        action: 'CREATE'
      },
      req.user,
      board.orgId
    );

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update list details
// @route   PATCH /api/lists/:id
// @access  Private
const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const list = await List.findById(id).populate('boardId');
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    list.title = title || list.title;
    await list.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: list._id.toString(),
        entityType: 'LIST',
        entityTitle: list.title,
        action: 'UPDATE'
      },
      req.user,
      list.boardId.orgId
    );

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a list
// @route   DELETE /api/lists/:id
// @access  Private
const deleteList = async (req, res) => {
  try {
    const { id } = req.params;

    const list = await List.findById(id).populate('boardId');
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const orgId = list.boardId.orgId;
    const listTitle = list.title;

    // Cascade delete associated cards
    await Card.deleteMany({ listId: id });
    await List.findByIdAndDelete(id);

    // Create Audit Log
    await createAuditLog(
      {
        entityId: id,
        entityType: 'LIST',
        entityTitle: listTitle,
        action: 'DELETE'
      },
      req.user,
      orgId
    );

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Copy a list (with cards)
// @route   POST /api/lists/:id/copy
// @access  Private
const copyList = async (req, res) => {
  try {
    const { id } = req.params;

    const sourceList = await List.findById(id).populate('boardId');
    if (!sourceList) {
      return res.status(404).json({ error: 'List not found' });
    }

    const orgId = sourceList.boardId.orgId;
    const boardId = sourceList.boardId._id;

    // Find last order position
    const lastList = await List.findOne({ boardId }).sort({ order: -1 });
    const newOrder = lastList ? lastList.order + 1 : 1;

    // Create duplicate list
    const copiedList = new List({
      title: `${sourceList.title} - Copy`,
      order: newOrder,
      boardId
    });

    await copiedList.save();

    // Fetch and duplicate all cards associated with the source list
    const cards = await Card.find({ listId: id }).sort({ order: 1 });
    if (cards && cards.length > 0) {
      const duplicatedCards = cards.map((card) => ({
        title: card.title,
        order: card.order,
        description: card.description || '',
        listId: copiedList._id
      }));

      const insertedCards = await Card.insertMany(duplicatedCards);

      // Fetch and duplicate all audit logs for the original cards
      const AuditLog = require('../models/AuditLog');
      const originalCardIds = cards.map(c => c._id.toString());
      const auditLogs = await AuditLog.find({ entityId: { $in: originalCardIds }, entityType: 'CARD' });

      if (auditLogs && auditLogs.length > 0) {
        const duplicatedLogs = [];
        
        for (let i = 0; i < cards.length; i++) {
          const originalId = cards[i]._id.toString();
          const newId = insertedCards[i]._id.toString();
          
          const logsForThisCard = auditLogs.filter(log => log.entityId === originalId);
          logsForThisCard.forEach(log => {
            duplicatedLogs.push({
              orgId: log.orgId,
              action: log.action,
              entityId: newId,
              entityType: 'CARD',
              entityTitle: log.entityTitle,
              userId: log.userId,
              userImage: log.userImage,
              userName: log.userName,
              createdAt: log.createdAt,
              updatedAt: log.updatedAt
            });
          });
        }
        
        if (duplicatedLogs.length > 0) {
          await AuditLog.insertMany(duplicatedLogs);
        }
      }
    }

    // Create Audit Log
    await createAuditLog(
      {
        entityId: copiedList._id.toString(),
        entityType: 'LIST',
        entityTitle: copiedList.title,
        action: 'CREATE'
      },
      req.user,
      orgId
    );

    res.status(201).json(copiedList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reorder lists on a board
// @route   PUT /api/lists/reorder
// @access  Private
const reorderLists = async (req, res) => {
  try {
    const { items, boardId } = req.body; // items: array of { _id, order }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    // Build Mongoose bulkWrite operations
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id, boardId },
        update: { $set: { order: item.order } }
      }
    }));

    await List.bulkWrite(bulkOps);
    res.json({ message: 'Lists reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLists,
  createList,
  updateList,
  deleteList,
  copyList,
  reorderLists
};

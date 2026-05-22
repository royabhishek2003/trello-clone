const Card = require('../models/Card');
const List = require('../models/List');
const AuditLog = require('../models/AuditLog');
const { createAuditLog } = require('../services/auditLogService');

// @desc    Get detailed card by ID
// @route   GET /api/cards/:id
// @access  Private
const getCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id)
      .populate('labels')
      .populate({
        path: 'listId',
        select: 'title boardId',
        populate: {
          path: 'boardId',
          select: 'orgId'
        }
      });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get activity logs for a card
// @route   GET /api/cards/:id/activity
// @access  Private
const getCardLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await AuditLog.find({
      entityId: id,
      entityType: 'CARD'
    }).sort({ createdAt: -1 }).limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a card in a list
// @route   POST /api/cards
// @access  Private
const createCard = async (req, res) => {
  try {
    const { title, listId } = req.body;

    if (!title || !listId) {
      return res.status(400).json({ error: 'Title and List ID are required' });
    }

    const list = await List.findById(listId).populate('boardId');
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Determine card order position inside the list
    const lastCard = await Card.findOne({ listId }).sort({ order: -1 });
    const order = lastCard ? lastCard.order + 1 : 1;

    const card = new Card({
      title,
      order,
      listId
    });

    await card.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: card._id.toString(),
        entityType: 'CARD',
        entityTitle: card.title,
        action: 'CREATE'
      },
      req.user,
      list.boardId.orgId
    );

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update card details (title, description)
// @route   PATCH /api/cards/:id
// @access  Private
const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, dueDate, isDateComplete, hasDueTime } = req.body;

    const card = await Card.findById(id).populate('labels').populate({
      path: 'listId',
      populate: { path: 'boardId' }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const orgId = card.listId.boardId.orgId;

    if (title !== undefined) {
      card.title = title;
    }
    if (description !== undefined) {
      card.description = description;
    }
    if (startDate !== undefined) {
      card.startDate = startDate;
    }
    if (dueDate !== undefined) {
      card.dueDate = dueDate;
    }
    if (isDateComplete !== undefined) {
      card.isDateComplete = isDateComplete;
    }
    if (hasDueTime !== undefined) {
      card.hasDueTime = hasDueTime;
    }

    await card.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: card._id.toString(),
        entityType: 'CARD',
        entityTitle: card.title,
        action: 'UPDATE'
      },
      req.user,
      orgId
    );

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a card
// @route   DELETE /api/cards/:id
// @access  Private
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findById(id).populate({
      path: 'listId',
      populate: { path: 'boardId' }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const orgId = card.listId.boardId.orgId;
    const cardTitle = card.title;

    await Card.findByIdAndDelete(id);

    // Create Audit Log
    await createAuditLog(
      {
        entityId: id,
        entityType: 'CARD',
        entityTitle: cardTitle,
        action: 'DELETE'
      },
      req.user,
      orgId
    );

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Copy a card
// @route   POST /api/cards/:id/copy
// @access  Private
const copyCard = async (req, res) => {
  try {
    const { id } = req.params;

    const sourceCard = await Card.findById(id).populate({
      path: 'listId',
      populate: { path: 'boardId' }
    });

    if (!sourceCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const orgId = sourceCard.listId.boardId.orgId;
    const listId = sourceCard.listId._id;

    // Find last card in list to position duplicate at the end
    const lastCard = await Card.findOne({ listId }).sort({ order: -1 });
    const newOrder = lastCard ? lastCard.order + 1 : 1;

    const copiedCard = new Card({
      title: `${sourceCard.title} - Copy`,
      order: newOrder,
      description: sourceCard.description || '',
      listId
    });

    await copiedCard.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: copiedCard._id.toString(),
        entityType: 'CARD',
        entityTitle: copiedCard.title,
        action: 'CREATE'
      },
      req.user,
      orgId
    );

    res.status(201).json(copiedCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reorder cards (within list or across lists)
// @route   PUT /api/cards/reorder
// @access  Private
const reorderCards = async (req, res) => {
  try {
    const { items } = req.body; // items: array of { _id, order, listId }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    // Build bulkWrite updates for all moved items
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { order: item.order, listId: item.listId } }
      }
    }));

    await Card.bulkWrite(bulkOps);
    res.json({ message: 'Cards reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update card labels
// @route   PATCH /api/cards/:id/labels
// @access  Private
const updateCardLabels = async (req, res) => {
  try {
    const { id } = req.params;
    const { labels } = req.body; // array of label ObjectIds

    const card = await Card.findById(id).populate({
      path: 'listId',
      populate: { path: 'boardId' }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const orgId = card.listId.boardId.orgId;

    card.labels = labels;
    await card.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: card._id.toString(),
        entityType: 'CARD',
        entityTitle: card.title,
        action: 'UPDATE'
      },
      req.user,
      orgId
    );

    const updatedCard = await Card.findById(id).populate('labels');
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCard,
  getCardLogs,
  createCard,
  updateCard,
  deleteCard,
  copyCard,
  reorderCards,
  updateCardLabels
};

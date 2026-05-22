const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const { createAuditLog } = require('../services/auditLogService');
const {
  hasAvailableCount,
  incrementAvailableCount,
  decreaseAvailableCount
} = require('../services/orgLimitService');
const { checkSubscription } = require('../services/subscriptionService');

// @desc    Get all boards for organization
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res) => {
  try {
    const { orgId } = req.query;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const boards = await Board.find({ orgId }).sort({ order: 1, createdAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single board by ID
// @route   GET /api/boards/:id
// @access  Private
const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res) => {
  try {
    const { title, image, orgId } = req.body;

    if (!title || !orgId) {
      return res.status(400).json({ error: 'Title and Organization ID are required' });
    }

    // Check if organization has active subscription (Taskify Pro)
    const isPro = await checkSubscription(orgId);

    // If not pro, check limit
    if (!isPro) {
      const canCreate = await hasAvailableCount(orgId);
      if (!canCreate) {
        return res.status(403).json({
          error: 'You have reached the free limit of 5 boards. Please upgrade to create more.'
        });
      }
    }

    // Image details parse: format image string expected is "id|thumb|full|username|linkHTML"
    if (!image) {
      return res.status(400).json({ error: 'Board background image is required' });
    }

    const [imageId, imageThumbUrl, imageFullUrl, imageUserName, imageLinkHTML] = image.split('|');

    if (!imageId || !imageThumbUrl || !imageFullUrl || !imageUserName || !imageLinkHTML) {
      return res.status(400).json({ error: 'Invalid board background image format' });
    }

    const board = new Board({
      orgId,
      title,
      imageId,
      imageThumbUrl,
      imageFullUrl,
      imageUserName,
      imageLinkHTML
    });

    await board.save();

    // Increment count if not Pro
    if (!isPro) {
      await incrementAvailableCount(orgId);
    }

    // Create Audit Log
    await createAuditLog(
      {
        entityId: board._id.toString(),
        entityType: 'BOARD',
        entityTitle: board.title,
        action: 'CREATE'
      },
      req.user,
      orgId
    );

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update board details
// @route   PATCH /api/boards/:id
// @access  Private
const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    board.title = title || board.title;
    await board.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: board._id.toString(),
        entityType: 'BOARD',
        entityTitle: board.title,
        action: 'UPDATE'
      },
      req.user,
      board.orgId
    );

    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const orgId = board.orgId;
    const boardTitle = board.title;

    // Delete all lists and cards associated with this board
    const lists = await List.find({ boardId: id });
    const listIds = lists.map((list) => list._id);

    await Card.deleteMany({ listId: { $in: listIds } });
    await List.deleteMany({ boardId: id });
    await Board.findByIdAndDelete(id);

    // Decrement count if not Pro
    const isPro = await checkSubscription(orgId);
    if (!isPro) {
      await decreaseAvailableCount(orgId);
    }

    // Create Audit Log
    await createAuditLog(
      {
        entityId: id,
        entityType: 'BOARD',
        entityTitle: boardTitle,
        action: 'DELETE'
      },
      req.user,
      orgId
    );

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reorder boards
// @route   PUT /api/boards/reorder
// @access  Private
const reorderBoards = async (req, res) => {
  try {
    const { items, orgId } = req.body;

    if (!items || !Array.isArray(items) || !orgId) {
      return res.status(400).json({ error: 'Items array and Organization ID are required' });
    }

    // Update each board's order
    const updates = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id, orgId },
        update: { $set: { order: item.order } }
      }
    }));

    if (updates.length > 0) {
      await Board.bulkWrite(updates);
    }

    res.json({ message: 'Boards reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  reorderBoards
};

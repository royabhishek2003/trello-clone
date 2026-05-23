const Comment = require('../models/Comment');
const Card = require('../models/Card');
const { createAuditLog } = require('../services/auditLogService');

// @desc    Add a comment to a card
// @route   POST /api/cards/:cardId/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { text, mentions } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const card = await Card.findById(cardId).populate({
      path: 'listId',
      populate: { path: 'boardId' }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const orgId = card.listId.boardId.orgId;

    const comment = new Comment({
      cardId,
      userId: req.user._id,
      text,
      mentions: mentions || []
    });

    await comment.save();

    // Create Audit Log for the comment creation (optional, since we merge comments)
    // Trello might not create a separate audit log for comments, but if they do:
    // await createAuditLog(
    //   {
    //     entityId: cardId,
    //     entityType: 'CARD',
    //     entityTitle: card.title,
    //     action: 'UPDATE' // or 'COMMENT' if added
    //   },
    //   req.user,
    //   orgId
    // );

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'firstName lastName email imageUrl')
      .populate('mentions', 'firstName lastName email imageUrl');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Edit a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, mentions } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    if (text !== undefined) comment.text = text;
    if (mentions !== undefined) comment.mentions = mentions;

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'firstName lastName email imageUrl')
      .populate('mentions', 'firstName lastName email imageUrl');

    res.json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Soft delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.isDeleted = true;
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment
};

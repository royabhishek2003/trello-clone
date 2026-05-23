const express = require('express');
const router = express.Router();
const {
  uploadAttachments,
  addLinkAttachment,
  getCardAttachments,
  deleteAttachment,
  renameAttachment
} = require('../controllers/attachmentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// Route: /api/attachments

// Get attachments for a card
router.get('/:cardId', protect, getCardAttachments);

// Upload attachments to a card
router.post('/:cardId/upload', protect, upload.array('files', 10), uploadAttachments);

// Add link attachment
router.post('/:cardId/link', protect, addLinkAttachment);

// Delete an attachment
router.delete('/:attachmentId', protect, deleteAttachment);

// Rename an attachment
router.patch('/:attachmentId', protect, renameAttachment);

module.exports = router;

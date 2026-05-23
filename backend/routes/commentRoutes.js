const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// All comment routes are protected
router.use(protect);

router.post('/cards/:cardId/comments', createComment);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);

module.exports = router;

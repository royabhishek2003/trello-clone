const express = require('express');
const { body } = require('express-validator');
const { getBoards, getBoardById, createBoard, updateBoard, deleteBoard, reorderBoards } = require('../controllers/boardController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put('/reorder', reorderBoards);

router.route('/')
  .get(getBoards)
  .post(
    [
      body('title', 'Board title is required').notEmpty(),
      body('image', 'Board background image is required').notEmpty(),
      body('orgId', 'Organization ID is required').notEmpty()
    ],
    validate,
    createBoard
  );

router.route('/:id')
  .get(getBoardById)
  .patch(
    [body('title', 'Board title is required').notEmpty()],
    validate,
    updateBoard
  )
  .delete(deleteBoard);

module.exports = router;

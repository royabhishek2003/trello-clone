const express = require('express');
const { body } = require('express-validator');
const { 
  getBoards, 
  getBoardById, 
  createBoard, 
  updateBoard, 
  deleteBoard, 
  reorderBoards,
  updateBoardBackground,
  uploadBoardBackground,
  removeBoardBackground
} = require('../controllers/boardController');
const { getLabelsByBoard, createLabel } = require('../controllers/labelController');
const upload = require('../middleware/uploadMiddleware');
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

router.route('/:id/labels')
  .get(getLabelsByBoard)
  .post(createLabel);

router.route('/:id/background')
  .patch(
    [
      body('backgroundType', 'Background type is required').isIn(['color', 'gradient', 'image']),
      body('backgroundValue', 'Background value is required').notEmpty()
    ],
    validate,
    updateBoardBackground
  )
  .delete(removeBoardBackground);

router.route('/:id/background/upload')
  .post(
    upload.single('image'),
    uploadBoardBackground
  );

module.exports = router;

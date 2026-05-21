const express = require('express');
const { body } = require('express-validator');
const {
  getLists,
  createList,
  updateList,
  deleteList,
  copyList,
  reorderLists
} = require('../controllers/listController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getLists)
  .post(
    [
      body('title', 'List title is required').notEmpty(),
      body('boardId', 'Board ID is required').notEmpty()
    ],
    validate,
    createList
  );

router.put(
  '/reorder',
  [
    body('items', 'Items array is required').isArray(),
    body('boardId', 'Board ID is required').notEmpty()
  ],
  validate,
  reorderLists
);

router.route('/:id')
  .patch(
    [body('title', 'List title is required').notEmpty()],
    validate,
    updateList
  )
  .delete(deleteList);

router.post('/:id/copy', copyList);

module.exports = router;

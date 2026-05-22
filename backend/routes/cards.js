const express = require('express');
const { body } = require('express-validator');
const {
  getCard,
  getCardLogs,
  createCard,
  updateCard,
  deleteCard,
  copyCard,
  reorderCards,
  updateCardLabels,
  searchCards
} = require('../controllers/cardController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title', 'Card title is required').notEmpty(),
    body('listId', 'List ID is required').notEmpty()
  ],
  validate,
  createCard
);

router.put(
  '/reorder',
  [body('items', 'Items array is required').isArray()],
  validate,
  reorderCards
);

router.get('/search', searchCards);

router.route('/:id')
  .get(getCard)
  .patch(updateCard)
  .delete(deleteCard);

router.patch('/:id/labels', updateCardLabels);

router.get('/:id/activity', getCardLogs);
router.post('/:id/copy', copyCard);

module.exports = router;

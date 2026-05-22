const express = require('express');
const {
  updateLabel,
  deleteLabel
} = require('../controllers/labelController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/:id')
  .patch(updateLabel)
  .delete(deleteLabel);

module.exports = router;

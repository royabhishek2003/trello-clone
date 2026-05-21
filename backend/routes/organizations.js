const express = require('express');
const { body } = require('express-validator');
const {
  getOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  getActivityLogs
} = require('../controllers/organizationController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrganizations)
  .post(
    [body('name', 'Organization name is required').notEmpty()],
    validate,
    createOrganization
  );

router.route('/:id')
  .get(getOrganization)
  .patch(
    [body('name', 'Organization name is required').notEmpty()],
    validate,
    updateOrganization
  );

router.get('/:id/activity', getActivityLogs);

module.exports = router;

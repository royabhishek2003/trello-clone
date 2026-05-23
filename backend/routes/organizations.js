const express = require('express');
const { body } = require('express-validator');
const {
  getOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getActivityLogs,
  inviteMembers,
  revokeInvitation,
  removeMember,
  updateMemberRole
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
  )
  .delete(deleteOrganization);

router.get('/:id/activity', getActivityLogs);

router.post('/:id/invitations', inviteMembers);
router.delete('/:id/invitations/:email', revokeInvitation);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/members/:userId', updateMemberRole);

module.exports = router;

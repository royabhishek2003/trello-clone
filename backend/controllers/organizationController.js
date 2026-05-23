const Organization = require('../models/Organization');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get user's organizations
// @route   GET /api/orgs
// @access  Private
const getOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({
      'members.user': req.user._id
    }).populate('owner', 'firstName lastName email imageUrl');

    res.json(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create organization
// @route   POST /api/orgs
// @access  Private
const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Default image
    const imageUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;

    const org = new Organization({
      name,
      imageUrl,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'admin'
        }
      ]
    });

    // Auto-add all other mock users to the workspace
    const allUsers = await User.find({ _id: { $ne: req.user._id } });
    for (const u of allUsers) {
      const role = u.email.toLowerCase().includes('peter') ? 'admin' : 'member';
      org.members.push({ user: u._id, role });
    }

    await org.save();

    // Set as active org if user doesn't have one set
    const user = await User.findById(req.user._id);
    if (!user.activeOrganization) {
      user.activeOrganization = org._id;
      await user.save();
    }

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single organization details
// @route   GET /api/orgs/:id
// @access  Private
const getOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const org = await Organization.findById(id)
      .populate('owner', 'firstName lastName email imageUrl')
      .populate('members.user', 'firstName lastName email imageUrl');

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Verify membership
    const isMember = org.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view this organization' });
    }

    res.json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update organization
// @route   PATCH /api/orgs/:id
// @access  Private
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Only owner/admin can update org settings
    const member = org.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update organization details' });
    }

    org.name = name || org.name;
    await org.save();

    res.json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get organization activity logs
// @route   GET /api/orgs/:id/activity
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await AuditLog.find({ orgId: id }).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Invite members
// @route   POST /api/orgs/:id/invitations
// @access  Private
const inviteMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { emails, role } = req.body;
    
    if (!emails) {
      return res.status(400).json({ error: 'Emails are required' });
    }

    const org = await Organization.findById(id).populate('members.user');
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const isAdmin = org.members.some(m => m.user._id.toString() === req.user._id.toString() && m.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can invite members' });
    }

    const emailList = emails.split(',').map(e => e.trim().toLowerCase()).filter(e => e);
    const addedInvitations = [];

    for (const email of emailList) {
      const isMember = org.members.some(m => m.user.email.toLowerCase() === email);
      if (isMember) continue;

      const isInvited = org.invitations.some(i => i.email.toLowerCase() === email);
      if (isInvited) continue;

      org.invitations.push({
        email,
        role: role || 'member'
      });
      addedInvitations.push(email);
    }

    await org.save();
    res.json({ message: 'Invitations sent', added: addedInvitations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Revoke invitation
// @route   DELETE /api/orgs/:id/invitations/:email
// @access  Private
const revokeInvitation = async (req, res) => {
  try {
    const { id, email } = req.params;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const isAdmin = org.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can revoke invitations' });
    }

    org.invitations = org.invitations.filter(i => i.email.toLowerCase() !== email.toLowerCase());
    await org.save();

    res.json({ message: 'Invitation revoked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Remove member
// @route   DELETE /api/orgs/:id/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Prevent removing the workspace owner
    if (org.owner.toString() === userId) {
      return res.status(400).json({ error: 'Cannot remove the workspace owner' });
    }

    const isAdmin = org.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    const targetMember = org.members.find(m => m.user.toString() === userId);
    if (!targetMember) {
      return res.status(404).json({ error: 'Member not found in organization' });
    }

    if (targetMember.role === 'admin') {
      const adminCount = org.members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin' });
      }
    }

    org.members = org.members.filter(m => m.user.toString() !== userId);
    await org.save();

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update member role
// @route   PATCH /api/orgs/:id/members/:userId
// @access  Private
const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const isAdmin = org.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    const member = org.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.role === 'admin' && role === 'member') {
      const adminCount = org.members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot change role of the last admin' });
      }
    }

    member.role = role;
    await org.save();

    res.json({ message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  getActivityLogs,
  inviteMembers,
  revokeInvitation,
  removeMember,
  updateMemberRole
};

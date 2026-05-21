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

module.exports = {
  getOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  getActivityLogs
};

const Attachment = require('../models/Attachment');
const Card = require('../models/Card');
const { uploadFile, deleteFile, getFileUrl } = require('../services/s3Service');
const { createAuditLog } = require('../services/auditLogService');

// @desc    Upload attachments to a card
// @route   POST /api/attachments/:cardId/upload
// @access  Private
const uploadAttachments = async (req, res) => {
  try {
    const { cardId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const card = await Card.findById(cardId).populate({
      path: 'listId',
      populate: { path: 'boardId' }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const orgId = card.listId.boardId.orgId;
    const uploadedAttachments = [];

    // Process all files
    for (const file of files) {
      const isImage = file.mimetype.startsWith('image/');
      
      let fileType = 'other';
      if (isImage) fileType = 'image';
      else if (file.mimetype === 'application/pdf') fileType = 'pdf';
      else if (file.mimetype.includes('zip')) fileType = 'zip';
      else if (file.mimetype.startsWith('video/')) fileType = 'video';
      else if (file.mimetype.includes('document') || file.mimetype.includes('msword')) fileType = 'document';

      // Upload to S3
      const { url, key } = await uploadFile(file.buffer, file.mimetype, file.originalname);

      // Save to Database
      const attachment = new Attachment({
        cardId,
        uploader: req.user._id,
        fileName: file.originalname, // Could allow users to rename later
        originalName: file.originalname,
        fileUrl: url,
        fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        storageKey: key,
        isImage
      });

      await attachment.save();
      uploadedAttachments.push(attachment);

      // Add to Card's attachments array
      card.attachments.push(attachment._id);
    }

    await card.save();

    // Create Audit Log
    const fileNames = files.map(f => f.originalname).join(', ');
    await createAuditLog(
      {
        entityId: card._id.toString(),
        entityType: 'CARD',
        entityTitle: card.title,
        action: 'UPDATE' // Using standard UPDATE action to keep it simple, or custom ATTACHMENT
      },
      req.user,
      orgId
    );

    // Populate uploader info before sending back
    const populatedAttachments = await Attachment.find({ _id: { $in: uploadedAttachments.map(a => a._id) } })
      .populate('uploader', 'firstName lastName email imageUrl')
      .sort({ createdAt: -1 });

    res.status(201).json(populatedAttachments);
  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload attachments' });
  }
};

// @desc    Get all attachments for a card
// @route   GET /api/attachments/:cardId
// @access  Private
const getCardAttachments = async (req, res) => {
  try {
    const { cardId } = req.params;
    
    // Ensure card exists and user has access (simplified here)
    let attachments = await Attachment.find({ cardId })
      .populate('uploader', 'firstName lastName email imageUrl')
      .sort({ createdAt: -1 });

    // Generate fresh presigned URLs for all attachments
    attachments = await Promise.all(attachments.map(async (attachment) => {
      const freshUrl = await getFileUrl(attachment.storageKey);
      
      // Update DB asynchronously in background so we don't block the response
      Attachment.updateOne({ _id: attachment._id }, { fileUrl: freshUrl }).catch(err => console.error("Failed to update attachment url", err));
      
      const doc = attachment.toObject();
      doc.fileUrl = freshUrl;
      return doc;
    }));

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete an attachment
// @route   DELETE /api/attachments/:attachmentId
// @access  Private
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const card = await Card.findById(attachment.cardId).populate({
      path: 'listId',
      populate: { path: 'boardId' }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const orgId = card.listId.boardId.orgId;

    // Delete from S3
    await deleteFile(attachment.storageKey);

    // Delete from Database
    await Attachment.findByIdAndDelete(attachmentId);

    // Remove from Card attachments array
    card.attachments = card.attachments.filter(id => id.toString() !== attachmentId);
    await card.save();

    // Create Audit Log
    await createAuditLog(
      {
        entityId: card._id.toString(),
        entityType: 'CARD',
        entityTitle: card.title,
        action: 'UPDATE'
      },
      req.user,
      orgId
    );

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Rename an attachment
// @route   PATCH /api/attachments/:attachmentId
// @access  Private
const renameAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const { fileName } = req.body;

    if (!fileName || fileName.trim() === '') {
      return res.status(400).json({ error: 'File name is required' });
    }

    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    attachment.fileName = fileName.trim();
    await attachment.save();

    const populatedAttachment = await Attachment.findById(attachmentId)
      .populate('uploader', 'firstName lastName email imageUrl');

    res.json(populatedAttachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadAttachments,
  getCardAttachments,
  deleteAttachment,
  renameAttachment
};

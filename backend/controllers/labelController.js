const Label = require('../models/Label');
const Card = require('../models/Card');
const Board = require('../models/Board');

// @desc    Get all labels for a board
// @route   GET /api/boards/:id/labels
// @access  Private
const getLabelsByBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const labels = await Label.find({ boardId: id });
    res.json(labels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a label for a board
// @route   POST /api/boards/:id/labels
// @access  Private
const createLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, color } = req.body;

    if (!color) {
      return res.status(400).json({ error: 'Color is required' });
    }

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const label = new Label({
      boardId: id,
      title: title || '',
      color
    });

    await label.save();
    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a label
// @route   PATCH /api/labels/:id
// @access  Private
const updateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, color } = req.body;

    const label = await Label.findById(id);
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    if (title !== undefined) label.title = title;
    if (color !== undefined) label.color = color;

    await label.save();
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a label
// @route   DELETE /api/labels/:id
// @access  Private
const deleteLabel = async (req, res) => {
  try {
    const { id } = req.params;

    const label = await Label.findById(id);
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    // Remove this label ID from all cards that have it
    await Card.updateMany(
      { labels: id },
      { $pull: { labels: id } }
    );

    await Label.findByIdAndDelete(id);
    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLabelsByBoard,
  createLabel,
  updateLabel,
  deleteLabel
};

const Theatre = require('../models/Theatre');

// @desc    Get all theatres with optional city filter
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { isActive: true };

    if (city && city !== 'All') {
      filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const theatres = await Theatre.find(filter).sort({ name: 1 });
    const cities = await Theatre.distinct('city', { isActive: true });

    res.json({
      success: true,
      count: theatres.length,
      cities,
      data: theatres,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    res.json({ success: true, data: theatre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create theatre (Admin)
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, data: theatre, message: 'Theatre added successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update theatre (Admin)
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    res.json({ success: true, data: theatre, message: 'Theatre updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete theatre (Admin)
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    res.json({ success: true, message: 'Theatre removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};

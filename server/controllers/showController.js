const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');

// Helper function to generate default 70-seat layout
const generateDefaultSeats = (priceTiers = { vip: 22, premium: 16, standard: 12 }) => {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const seatsPerRow = 10;

  rows.forEach((row) => {
    let tier = 'Standard';
    let price = priceTiers.standard || 12;

    if (row === 'A' || row === 'B') {
      tier = 'VIP';
      price = priceTiers.vip || 22;
    } else if (row === 'C' || row === 'D' || row === 'E') {
      tier = 'Premium';
      price = priceTiers.premium || 16;
    }

    for (let col = 1; col <= seatsPerRow; col++) {
      seats.push({
        seatNumber: `${row}${col}`,
        row,
        col,
        tier,
        price,
        status: 'available',
      });
    }
  });

  return seats;
};

// @desc    Get shows grouped by theatre for a movie and date
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res) => {
  try {
    const { movieId, date, city } = req.query;

    const query = { isActive: true };
    if (movieId) query.movie = movieId;
    if (date) query.date = date;

    let shows = await Show.find(query)
      .populate('movie', 'title poster certificate duration genres languages rating')
      .populate('theatre', 'name city address amenities phone rating')
      .sort({ startTime: 1 });

    // Filter by city if theatre populated
    if (city && city !== 'All') {
      shows = shows.filter(
        (show) => show.theatre && show.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Group shows by Theatre for easy UI rendering
    const theatreMap = new Map();

    shows.forEach((show) => {
      if (!show.theatre) return;
      const theatreId = show.theatre._id.toString();

      if (!theatreMap.has(theatreId)) {
        theatreMap.set(theatreId, {
          theatre: show.theatre,
          shows: [],
        });
      }

      theatreMap.get(theatreId).shows.push({
        _id: show._id,
        screenName: show.screenName,
        date: show.date,
        startTime: show.startTime,
        format: show.format,
        language: show.language,
        priceTiers: show.priceTiers,
        totalSeats: show.totalSeats,
        availableSeatsCount: show.availableSeatsCount,
      });
    });

    const groupedTheatres = Array.from(theatreMap.values());

    res.json({
      success: true,
      count: shows.length,
      theatresCount: groupedTheatres.length,
      data: groupedTheatres,
      rawShows: shows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single show with seat layout
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.json({
      success: true,
      data: show,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new show (Admin)
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res) => {
  try {
    const { movie, theatre, screenName, date, startTime, priceTiers, format, language } = req.body;

    if (!movie || !theatre || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'Movie, theatre, date, and startTime are required' });
    }

    const tiers = priceTiers || { vip: 22, premium: 16, standard: 12 };
    const seats = generateDefaultSeats(tiers);

    const show = await Show.create({
      movie,
      theatre,
      screenName: screenName || 'Screen 1 (IMAX)',
      date,
      startTime,
      priceTiers: tiers,
      seats,
      totalSeats: seats.length,
      availableSeatsCount: seats.length,
      format: format || 'IMAX 3D',
      language: language || 'English',
    });

    const populatedShow = await Show.findById(show._id).populate('movie').populate('theatre');

    res.status(201).json({
      success: true,
      data: populatedShow,
      message: 'Show scheduled successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete show (Admin)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, message: 'Show cancelled and deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  deleteShow,
  generateDefaultSeats,
};

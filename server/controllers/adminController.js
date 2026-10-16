const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get Admin Dashboard Overview Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      revenueResult,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments({ isActive: true }),
      Theatre.countDocuments({ isActive: true }),
      Show.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
      Booking.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = revenueResult.length > 0 ? Number(revenueResult[0].totalRevenue.toFixed(2)) : 0;

    // Monthly revenue aggregation
    const monthlyStats = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShows,
        recentBookings,
        monthlyStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminStats };

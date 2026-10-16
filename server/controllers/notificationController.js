const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user._id },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    }

    res.json({ success: true, message: 'Notifications updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserNotifications, markAsRead };

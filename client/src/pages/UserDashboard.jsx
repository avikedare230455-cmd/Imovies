import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Bell,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  XCircle,
  Save,
  CheckCircle,
} from 'lucide-react';
import { bookingAPI, notificationAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TicketCard from '../components/TicketCard';

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, notifsRes] = await Promise.all([
        bookingAPI.getMyBookings(),
        notificationAPI.getNotifications(),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      if (notifsRes.success) setNotifications(notifsRes.data || []);
    } catch (err) {
      console.error('[Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setCancelReason('Change of plans');
    setCancelModalOpen(true);
  };

  const confirmCancellation = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      const res = await bookingAPI.cancelBooking(bookingToCancel._id, {
        reason: cancelReason,
      });

      if (res.success) {
        success(res.message || 'Booking cancelled and refund processed!');
        setCancelModalOpen(false);
        setBookingToCancel(null);
        fetchDashboardData();
      }
    } catch (err) {
      error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      success('Profile details updated successfully');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') return b.bookingStatus === 'confirmed';
    if (filterStatus === 'Cancelled') return b.bookingStatus === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header Profile Banner */}
      <div className="p-6 rounded-3xl cinema-glass border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h1>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <div className="flex items-center space-x-2 mt-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-400 font-bold text-[10px] uppercase">
              {user?.role === 'admin' ? 'Cinema Director' : 'IMovies Member'}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{bookings.length} Bookings Total</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'bookings'
                ? 'bg-rose-600 text-white shadow-glow-crimson'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-rose-600 text-white shadow-glow-crimson'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'notifications'
                ? 'bg-rose-600 text-white shadow-glow-crimson'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Your Cinema Admission Passes</h2>
            <div className="flex items-center space-x-2 text-xs">
              {['All', 'Active', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading bookings history...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 cinema-glass rounded-2xl border border-slate-800 text-center">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No Bookings Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You don't have any {filterStatus.toLowerCase()} tickets at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((b) => (
                <TicketCard key={b._id} booking={b} onCancel={handleCancelClick} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl cinema-glass border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Account Profile</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Email cannot be changed</span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-crimson transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Notifications History */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl cinema-glass border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Notification Feed</h2>
          <div className="space-y-3 divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No notifications found.</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="pt-3 flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-500 mt-1">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white text-center">
              Cancel Ticket Reservation?
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1">
              Are you sure you want to cancel booking <span className="text-white font-mono font-bold">{bookingToCancel.bookingId}</span>?
            </p>

            {/* Refund Calculation Box */}
            <div className="my-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Original Paid:</span>
                <span className="text-slate-200">${bookingToCancel.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Cancellation Fee (10%):</span>
                <span>-${(bookingToCancel.totalAmount * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
                <span>Estimated Refund (90%):</span>
                <span>${(bookingToCancel.totalAmount * 0.9).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Booked wrong date or time">Booked wrong date or time</option>
                <option value="Health emergency">Health emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancellation}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-glow-crimson"
              >
                {cancelling ? 'Processing...' : 'Confirm & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

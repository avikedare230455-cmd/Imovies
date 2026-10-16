import React, { useState, useEffect } from 'react';
import { Bell, Check, Film, AlertCircle, Sparkles } from 'lucide-react';
import { notificationAPI } from '../api';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAsRead({});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl cinema-glass border border-slate-700/60 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-rose-500" />
          <h3 className="font-semibold text-slate-100 text-sm">Notifications</h3>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 py-1">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">No notifications right now</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`py-3 px-2 rounded-lg transition-colors ${
                notif.isRead ? 'opacity-70' : 'bg-rose-500/5'
              }`}
            >
              <div className="flex items-start space-x-2.5">
                <div className="mt-0.5 p-1 rounded-full bg-slate-800 text-rose-400 flex-shrink-0">
                  {notif.type === 'booking_success' ? (
                    <Film className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed break-words">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {new Date(notif.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

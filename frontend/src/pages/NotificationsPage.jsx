import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Clock, 
  Armchair, 
  Info, 
  CheckCircle2, 
  Trash2,
  Loader2
} from 'lucide-react';

export default function NotificationsPage({ setActivePage }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <Bell className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Student Sign-In Required</h2>
        <p className="text-xs text-slate-500">
          Please sign in to view your due-date notifications, overdue alerts, and seat confirmations.
        </p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 bg-aditya-700 hover:bg-aditya-800 text-white font-bold text-xs rounded-xl transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredList = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'OVERDUE_ALERT':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'DUE_DATE_REMINDER':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'SEAT_RESERVATION':
        return <Armchair className="w-5 h-5 text-aditya-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">In-App Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated alerts for approaching book due-dates, overdue warnings, and seat check-in updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'ALL'
              ? 'bg-aditya-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'UNREAD'
              ? 'bg-aditya-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-aditya-600 animate-spin mx-auto" />
          <span className="text-xs text-slate-400 mt-2 block">Loading notifications...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You're All Caught Up</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No notifications pending in your inbox. Upcoming book due-dates and seat alerts will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const isOverdue = item.type === 'OVERDUE_ALERT';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !item.isRead
                    ? isOverdue
                      ? 'bg-red-50/60 border-red-200 ring-1 ring-red-300'
                      : 'bg-aditya-50/40 border-aditya-200 ring-1 ring-aditya-200'
                    : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isOverdue
                      ? 'bg-red-100'
                      : item.type === 'DUE_DATE_REMINDER'
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                  }`}>
                    {getIconForType(item.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-aditya-600" title="Unread" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      {item.message}
                    </p>

                    <div className="text-[10px] font-semibold text-slate-400 pt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="shrink-0 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[11px] rounded-lg transition"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

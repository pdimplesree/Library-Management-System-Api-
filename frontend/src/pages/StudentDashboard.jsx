import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { 
  User, 
  Armchair, 
  Bookmark, 
  Bell, 
  QrCode, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function StudentDashboard({ setActivePage }) {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [myReservation, setMyReservation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        const [loansRes, resRes, notifRes] = await Promise.all([
          api.getMyLoans(),
          api.getMyReservation(),
          api.getNotifications(),
        ]);

        if (loansRes.success) setLoans(loansRes.data || []);
        if (resRes.success) setMyReservation(resRes.data || null);
        if (notifRes.success && notifRes.data) {
          setNotifications(notifRes.data.notifications || []);
        }
      } catch (e) {
        console.error('Failed to load student dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Student Portal Sign-In Required</h2>
        <p className="text-xs text-slate-500">
          Please log in with your registered college roll number to view your personalized dashboard.
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

  const activeLoans = loans.filter(l => l.status !== 'RETURNED');
  const overdueLoans = activeLoans.filter(l => l.status === 'OVERDUE' || (l.dueDate && new Date(l.dueDate) < new Date()));
  const unreadNotifs = notifications.filter(n => !n.isRead);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-aditya-900 via-aditya-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/20">
            <User className="w-8 h-8 text-aditya-200" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-aditya-200 uppercase tracking-wider">Student Profile</span>
              <span className="w-1.5 h-1.5 rounded-full bg-aditya-300" />
              <span className="text-xs text-slate-300 font-mono">{user.studentId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user.name}</h1>
            <p className="text-xs text-slate-300">
              Department of {user.department || 'Computer Science & Engineering'} • Year {user.yearOfStudy || 3}
            </p>
          </div>
        </div>

        {/* Current Hall Status Pill */}
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/15">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-300 uppercase block">Current Hall Presence</span>
            <span className="text-xs font-black">
              {user.isInside ? 'Physically Inside Library' : 'Outside Library'}
            </span>
          </div>
          <span className={`w-4 h-4 rounded-full ${user.isInside ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Library Pass</div>
              <div className="text-lg font-black text-slate-900">Student Access QR</div>
            </div>
            <QrCode className="w-5 h-5 text-aditya-700" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <QRCodeSVG value={user.studentId} size={110} level="M" includeMargin={true} bgColor="#ffffff" fgColor="#0f172a" />
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="font-bold text-slate-900">{user.name}</div>
              <div className="font-mono text-slate-700">{user.studentId}</div>
              <div>{user.department} • Year {user.yearOfStudy}</div>
              <div className="text-emerald-700 font-semibold">{user.isInside ? 'Library entry verified' : 'Outside library'}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-3xl p-6 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Entry Status</div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{user.isInside ? 'Seat Occupied' : 'Seat Available'}</div>
          <div className="text-xs text-emerald-800 mt-2">
            {user.isInside ? 'You are inside the library and your desk is filled automatically.' : 'Scan in at the gate to auto-fill a study seat.'}
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (If overdue) */}
      {overdueLoans.length > 0 && (
        <div className="p-5 bg-red-50 border-2 border-red-200 rounded-3xl flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 space-y-1">
              <strong className="text-sm font-black text-red-800 block">
                You have {overdueLoans.length} overdue book(s)!
              </strong>
              <p>
                Return deadline has passed for "{overdueLoans[0].book.title}". Please return to avoid daily penalty fines.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('loans')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
          >
            View Loans
          </button>
        </div>
      )}

      {/* 3 Overview Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Seat Reservation Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seat Reservation</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-aditya-700 flex items-center justify-center">
                <Armchair className="w-5 h-5" />
              </div>
            </div>

            {myReservation ? (
              <div className="space-y-2">
                <div className="text-2xl font-black text-slate-900">
                  Seat {myReservation.seat.seatNumber}
                </div>
                <div className="text-xs text-slate-500">
                  {myReservation.seat.zone} (Floor {myReservation.seat.floor})
                </div>
                <StatusBadge status={myReservation.status} size="xs" />
              </div>
            ) : (
              <div>
                <div className="text-lg font-bold text-slate-700">No Active Seat Booking</div>
                <div className="text-xs text-slate-400 mt-1">Reserve a desk before visiting to guarantee study space.</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActivePage('seats')}
            className="w-full py-2.5 bg-aditya-50 hover:bg-aditya-100 text-aditya-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {myReservation ? 'Manage Reservation' : 'Browse Available Seats'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Borrowed Books Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Book Loans</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900">{activeLoans.length}</div>
              <div className="text-xs text-slate-500 mt-1">
                {overdueLoans.length > 0 ? (
                  <span className="text-red-600 font-bold">{overdueLoans.length} loan(s) overdue!</span>
                ) : (
                  <span>All borrowed books within due return dates.</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('loans')}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            View Return Deadlines <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* In-App Notifications Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In-App Notifications</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900">{unreadNotifs.length}</div>
              <div className="text-xs text-slate-500 mt-1">
                {unreadNotifs.length > 0 ? 'Unread deadline and seat notices' : 'All notices marked as read'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('notifications')}
            className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            View Notifications Inbox <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Student Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setActivePage('occupancy')}
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition text-left space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-aditya-700 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-800">Live Occupancy</div>
            <div className="text-xs text-slate-500">Check current crowd level</div>
          </button>

          <button
            onClick={() => setActivePage('seats')}
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition text-left space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <Armchair className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-800">Seat Map</div>
            <div className="text-xs text-slate-500">50 configurable study desks</div>
          </button>

          <button
            onClick={() => setActivePage('books')}
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition text-left space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-800">Book Search</div>
            <div className="text-xs text-slate-500">Find copies and rack location</div>
          </button>

          <button
            onClick={() => setActivePage('qr-scanner')}
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition text-left space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-800">Student ID Scanner</div>
            <div className="text-xs text-slate-500">Scan your library pass at entry and exit</div>
          </button>
        </div>
      </div>
    </div>
  );
}

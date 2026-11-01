import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { 
  Armchair, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  User, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function SeatReservationPage({ setActivePage }) {
  const { user } = useAuth();
  const [seats, setSeats] = useState([]);
  const [myReservation, setMyReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [notification, setNotification] = useState(null);

  const fetchSeatData = async () => {
    try {
      const seatsRes = await api.getSeats();
      if (seatsRes.success) setSeats(seatsRes.data);

      if (user) {
        const myRes = await api.getMyReservation();
        if (myRes.success) setMyReservation(myRes.data);
      }
    } catch (e) {
      console.error('Failed to load seat data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatData();
    const interval = setInterval(fetchSeatData, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const handleReserveSeat = async (seat) => {
    if (!user) {
      setNotification({
        type: 'error',
        message: 'Please sign in to your student account to reserve a seat.',
      });
      return;
    }

    if (seat.status !== 'AVAILABLE') {
      setNotification({
        type: 'error',
        message: `Seat ${seat.seatNumber} is currently ${seat.status.toLowerCase()} and cannot be reserved.`,
      });
      return;
    }

    setActionLoading(true);
    setNotification(null);

    try {
      const res = await api.reserveSeat(seat.id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Seat ${seat.seatNumber} reserved successfully! Please check in when you arrive.`,
        });
        await fetchSeatData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Seat reservation failed.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async (reservationId) => {
    if (!window.confirm('Are you sure you want to release / cancel this seat?')) return;

    setActionLoading(true);
    setNotification(null);

    try {
      const res = await api.cancelReservation(reservationId);
      if (res.success) {
        setNotification({
          type: 'success',
          message: 'Seat released successfully. Available for other students.',
        });
        setMyReservation(null);
        await fetchSeatData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Release failed.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered seats
  const filteredSeats = seats.filter(s => {
    if (selectedFloor !== 'ALL' && s.floor !== parseInt(selectedFloor)) return false;
    if (selectedZone !== 'ALL' && s.zone !== selectedZone) return false;
    return true;
  });

  const availableCount = seats.filter(s => s.status === 'AVAILABLE').length;
  const occupiedCount = seats.filter(s => s.status === 'OCCUPIED').length;
  const reservedCount = seats.filter(s => s.status === 'RESERVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Seat Availability & Reservation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Students can reserve a desk for one hour. Entry verification automatically changes an assigned seat to Occupied.
          </p>
        </div>

        {!user && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-aditya-200 bg-aditya-50">
            <p className="text-sm text-aditya-900">Sign in with a student account to reserve a seat.</p>
            <button
              onClick={() => setActivePage('login')}
              className="px-4 py-2 bg-aditya-700 hover:bg-aditya-800 text-white font-bold text-xs rounded-xl"
            >
              Student Sign In
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSeatData}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin text-aditya-600' : ''}`} />
            Refresh Seats
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {user && user.isInside && (
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-medium">
          You are currently inside the library. Your seat is already assigned and the reservation option is disabled until you exit the library.
        </div>
      )}

      {/* Student's Current Active Reservation Card */}
      {user && myReservation && (
        <div className="bg-gradient-to-r from-aditya-900 to-aditya-800 text-white p-6 rounded-3xl shadow-lg border border-aditya-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Armchair className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-aditya-200 uppercase">Your Active Booking</span>
                <h3 className="text-xl font-bold">
                  Seat {myReservation.seat.seatNumber} — {myReservation.seat.zone} (Floor {myReservation.seat.floor})
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                myReservation.status === 'CHECKED_IN' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'
              }`}>
                {myReservation.status === 'CHECKED_IN' ? 'Occupied & In-Use' : 'Reserved · Waiting for entry scan'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="text-aditya-200">
              <div>Reserved at: <strong className="text-white">{new Date(myReservation.startTime).toLocaleTimeString()}</strong></div>
              {myReservation.status === 'ACTIVE' && myReservation.expiryTime && (
                <div className="mt-1">
                  Check in by: <strong className="text-white">{new Date(myReservation.expiryTime).toLocaleTimeString()}</strong>
                  <span className="ml-1 text-amber-200">(expires after 1 hour)</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {myReservation.status !== 'CHECKED_IN' && (
                <button
                  onClick={() => handleRelease(myReservation.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-bold rounded-xl transition shadow flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Release / Cancel Seat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend & Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase">Total Desks</div>
            <div className="text-2xl font-black text-slate-800">{seats.length || 50}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
            <div className="text-xs font-bold text-emerald-600 uppercase">Available</div>
            <div className="text-2xl font-black text-emerald-700">{availableCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
            <div className="text-xs font-bold text-amber-600 uppercase">Reserved</div>
            <div className="text-2xl font-black text-amber-700">{reservedCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
            <div className="text-xs font-bold text-rose-600 uppercase">Occupied</div>
            <div className="text-2xl font-black text-rose-700">{occupiedCount}</div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Zone Filter</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-aditya-500"
              >
                <option value="ALL">All Library Zones</option>
                <option value="General Reading">General Reading (Floor 1)</option>
                <option value="Digital Library">Digital Library (Floor 1)</option>
                <option value="Quiet Study Zone">Quiet Study Zone (Floor 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Floor Filter</label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-aditya-500"
              >
                <option value="ALL">All Floors</option>
                <option value="1">Floor 1 (30 Seats)</option>
                <option value="2">Floor 2 (20 Seats)</option>
              </select>
            </div>
          </div>

          {/* Seat Color Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-lg bg-emerald-500 border border-emerald-600 inline-block" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-lg bg-amber-400 border border-amber-500 inline-block" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-lg bg-rose-500 border border-rose-600 inline-block" />
              <span>Occupied</span>
            </div>
          </div>
        </div>

        {/* 50 Interactive Seats Grid */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Showing {filteredSeats.length} configured seats
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {filteredSeats.map((seat) => {
              const isAvailable = seat.status === 'AVAILABLE';
              const isReserved = seat.status === 'RESERVED';
              const isOccupied = seat.status === 'OCCUPIED';
              const isMine = myReservation && myReservation.seat.id === seat.id;

              return (
                <button
                  type="button"
                  key={seat.id}
                  onClick={() => isAvailable && user?.role === 'STUDENT' && !user?.isInside && handleReserveSeat(seat)}
                  disabled={!isAvailable || actionLoading || !user || user.role !== 'STUDENT' || Boolean(user?.isInside)}
                  className={`relative p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between min-h-[105px] select-none ${
                    isMine
                      ? 'bg-aditya-50 border-aditya-500 ring-2 ring-aditya-500 shadow-md'
                      : isAvailable
                      ? 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-400 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
                      : isReserved
                      ? 'bg-amber-50/40 border-amber-200 opacity-90 cursor-not-allowed'
                      : 'bg-rose-50/40 border-rose-200 opacity-90 cursor-not-allowed'
                  }`}
                >
                  {/* Power Socket Tag */}
                  {seat.hasPowerSocket && (
                    <div className="absolute top-1.5 right-1.5 text-amber-500" title="Equipped with 230V power plug">
                      <Zap className="w-3 h-3 fill-amber-400" />
                    </div>
                  )}

                  {/* Seat Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-700'
                      : isReserved
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    <Armchair className="w-4 h-4" />
                  </div>

                  {/* Seat Label */}
                  <div className="font-extrabold text-sm text-slate-800">{seat.seatNumber}</div>

                  {/* Status Indicator */}
                  <div className="w-full">
                    {user?.role !== 'STUDENT' && isAvailable ? (
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-full block">
                        Student access only
                      </span>
                    ) : user?.isInside && isAvailable ? (
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-full block">
                        Locked
                      </span>
                    ) : isAvailable ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-full block">
                        Reserve
                      </span>
                    ) : isReserved ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-full block">
                        Reserved
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100/70 px-1.5 py-0.5 rounded-full block">
                        Occupied
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

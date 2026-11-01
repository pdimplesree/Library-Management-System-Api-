import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Armchair, CheckCircle2, RefreshCw, UserRoundCheck, Users } from 'lucide-react';

export default function LibrarianDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [assignment, setAssignment] = useState({ studentId: '', seatId: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [dashboardResponse, studentsResponse, reservationsResponse] = await Promise.all([
        api.getLibrarianDashboard(),
        api.getLibrarianStudents(),
        api.getLibrarianReservations(),
      ]);
      if (dashboardResponse.success) setDashboard(dashboardResponse.data);
      if (studentsResponse.success) setStudents(studentsResponse.data || []);
      if (reservationsResponse.success) setReservations(reservationsResponse.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to load librarian data.' });
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, [refresh]);

  const verifyStudent = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await api.verifyStudentEntry(studentId.trim());
      if (response.success) {
        setMessage({ type: 'success', text: response.data.message });
        setStudentId('');
        await refresh();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Student verification failed.' });
    } finally {
      setBusy(false);
    }
  };

  const assignSeat = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await api.assignStudentSeat(assignment.studentId, Number(assignment.seatId));
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setAssignment({ studentId: '', seatId: '' });
        await refresh();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Seat assignment failed.' });
    } finally {
      setBusy(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await api.cancelStudentReservation(reservationId);
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        await refresh();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to cancel this reservation.' });
    } finally {
      setBusy(false);
    }
  };

  if (!user || user.role !== 'LIBRARIAN') {
    return <div className="max-w-2xl mx-auto p-8 my-12 bg-white rounded-3xl border text-center">
      <h1 className="text-xl font-bold">Librarian access required</h1>
      <p className="text-sm text-slate-500 mt-2">Sign in with a librarian account to manage attendance and seats.</p>
    </div>;
  }

  const seats = dashboard?.seats || [];
  const availableSeats = seats.filter((seat) => seat.status === 'AVAILABLE');
  const insideStudents = dashboard?.insideStudents || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-aditya-700">Librarian workspace</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Attendance & Seat Desk</h1>
          <p className="text-sm text-slate-500 mt-1">Verify student entry and exit. Seats are occupied and released automatically.</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white text-sm font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm ${message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {message.text}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Students inside', value: dashboard?.occupancy?.studentsInside ?? '—', icon: Users },
          { label: 'Occupied seats', value: dashboard?.occupancy?.occupiedSeats ?? '—', icon: Armchair },
          { label: 'Available seats', value: dashboard?.occupancy?.availableSeats ?? '—', icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border p-5 flex items-center gap-4">
            <span className="p-3 rounded-xl bg-aditya-50 text-aditya-700"><Icon className="w-5 h-5" /></span>
            <div><div className="text-xs uppercase font-bold text-slate-500">{label}</div><div className="text-2xl font-black mt-1">{value}</div></div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={verifyStudent} className="bg-white rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <UserRoundCheck className="w-5 h-5 text-aditya-700" />
            <div><h2 className="font-bold text-lg">Student ID verification</h2><p className="text-xs text-slate-500">Scanning inside/outside toggles entry or checkout and frees seats on exit.</p></div>
          </div>
          <label className="block text-xs font-bold uppercase text-slate-600" htmlFor="verify-student-id">Student ID</label>
          <input id="verify-student-id" value={studentId} onChange={(event) => setStudentId(event.target.value)} required placeholder="Scan or enter student ID" className="w-full border rounded-xl px-4 py-3 text-sm" />
          <button disabled={busy} className="w-full rounded-xl bg-aditya-700 hover:bg-aditya-800 disabled:opacity-50 text-white font-bold py-3">
            Verify entry / checkout
          </button>
        </form>

        <form onSubmit={assignSeat} className="bg-white rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Armchair className="w-5 h-5 text-aditya-700" />
            <div><h2 className="font-bold text-lg">Reserve seat for a student</h2><p className="text-xs text-slate-500">Entry verification changes this reservation to Occupied automatically.</p></div>
          </div>
          <label className="block text-xs font-bold uppercase text-slate-600" htmlFor="assignment-student">Student</label>
          <select id="assignment-student" value={assignment.studentId} onChange={(event) => setAssignment({ ...assignment, studentId: event.target.value })} required className="w-full border rounded-xl px-4 py-3 text-sm">
            <option value="">Select a student</option>
            {students.filter((student) => !student.isInside).map((student) => (
              <option key={student.id} value={student.studentId}>{student.name} ({student.studentId})</option>
            ))}
          </select>
          <label className="block text-xs font-bold uppercase text-slate-600" htmlFor="assignment-seat">Available seat</label>
          <select id="assignment-seat" value={assignment.seatId} onChange={(event) => setAssignment({ ...assignment, seatId: event.target.value })} required className="w-full border rounded-xl px-4 py-3 text-sm">
            <option value="">Select a seat</option>
            {availableSeats.map((seat) => <option key={seat.id} value={seat.id}>{seat.seatNumber} · {seat.zone}</option>)}
          </select>
          <button disabled={busy || !availableSeats.length} className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3">
            Reserve seat for student
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold text-lg mb-4">Students currently inside</h2>
          {insideStudents.length ? <div className="space-y-3">
            {insideStudents.map((student) => {
              const seat = seats.find((item) => item.currentUser?.id === student.id);
              return <div key={student.id} className="flex justify-between items-center border-b last:border-0 pb-3 last:pb-0">
                <div><div className="font-semibold text-sm">{student.name}</div><div className="text-xs text-slate-500">{student.studentId}</div></div>
                <div className="text-right"><span className="text-xs text-emerald-700 font-bold">INSIDE</span><div className="text-xs text-slate-500">{seat ? `Seat ${seat.seatNumber}` : 'No seat assigned'}</div></div>
              </div>;
            })}
          </div> : <p className="text-sm text-slate-500">No students are currently marked inside.</p>}
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold text-lg mb-4">Active student reservations</h2>
          {reservations.length ? <div className="space-y-3">
            {reservations.map((reservation) => <div key={reservation.id} className="flex justify-between items-center border-b last:border-0 pb-3 last:pb-0">
              <div><div className="font-semibold text-sm">{reservation.user?.name}</div><div className="text-xs text-slate-500">{reservation.user?.studentId} · Seat {reservation.seat?.seatNumber}</div></div>
              <div className="flex items-center gap-2">
                <StatusBadge status={reservation.status} />
                {reservation.status === 'ACTIVE' && !reservation.user?.isInside && (
                  <button type="button" disabled={busy} onClick={() => cancelReservation(reservation.id)} className="text-xs font-bold text-rose-700 hover:bg-rose-50 px-2 py-1 rounded disabled:opacity-50">
                    Cancel
                  </button>
                )}
              </div>
            </div>)}
          </div> : <p className="text-sm text-slate-500">No active reservations.</p>}
        </div>
      </section>

      <section className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-lg mb-4">Seat monitor</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {seats.map((seat) => (
            <div key={seat.id} className="rounded-xl border p-3 text-center">
              <div className="font-bold text-sm">{seat.seatNumber}</div>
              <div className="text-[10px] text-slate-500 mt-1">{seat.currentUser?.name || seat.zone}</div>
              <div className={`text-[10px] font-bold mt-2 ${seat.status === 'OCCUPIED' ? 'text-rose-700' : seat.status === 'RESERVED' ? 'text-amber-700' : 'text-emerald-700'}`}>{seat.status}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

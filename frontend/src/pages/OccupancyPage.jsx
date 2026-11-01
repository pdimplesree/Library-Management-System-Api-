import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { 
  Users, 
  Armchair, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function OccupancyPage({ setActivePage }) {
  const [occupancy, setOccupancy] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOccupancyData = async () => {
    setRefreshing(true);
    try {
      const [occRes, seatsRes] = await Promise.all([
        api.getOccupancy(),
        api.getSeats(),
      ]);

      if (occRes.success) setOccupancy(occRes.data);
      if (seatsRes.success) setSeats(seatsRes.data);
    } catch (e) {
      console.error('Failed to load occupancy data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOccupancyData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchOccupancyData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Zone statistics
  const zones = [
    {
      name: 'General Reading Hall',
      floor: 'Floor 1',
      total: seats.filter(s => s.zone === 'General Reading').length || 20,
      occupied: seats.filter(s => s.zone === 'General Reading' && s.status === 'OCCUPIED').length,
      reserved: seats.filter(s => s.zone === 'General Reading' && s.status === 'RESERVED').length,
      desc: 'Collaborative study space with reading tables.'
    },
    {
      name: 'Digital Library & Research Lab',
      floor: 'Floor 1',
      total: seats.filter(s => s.zone === 'Digital Library').length || 10,
      occupied: seats.filter(s => s.zone === 'Digital Library' && s.status === 'OCCUPIED').length,
      reserved: seats.filter(s => s.zone === 'Digital Library' && s.status === 'RESERVED').length,
      desc: 'Equipped with PCs, e-journal access, and power outlets.'
    },
    {
      name: 'Quiet Study & Reference Zone',
      floor: 'Floor 2',
      total: seats.filter(s => s.zone === 'Quiet Study Zone').length || 20,
      occupied: seats.filter(s => s.zone === 'Quiet Study Zone' && s.status === 'OCCUPIED').length,
      reserved: seats.filter(s => s.zone === 'Quiet Study Zone' && s.status === 'RESERVED').length,
      desc: 'Silent research cubicles for individual preparation.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Live Library Occupancy</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              DEMO MODE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time hall crowd levels, student headcounts, and seat availability calculated via Aditya API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-aditya-600 focus:ring-aditya-500"
            />
            Auto-refresh (5s)
          </label>

          <button
            onClick={fetchOccupancyData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-aditya-600' : ''}`} />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Project Demonstration Notice:</strong> Figures displayed reflect real data from the project's backend MySQL database generated through student QR scans and reservations. As required by university evaluation criteria, this application does not claim to represent physical Aditya University building counts without authorized campus gate integration.
        </div>
      </div>

      {/* Main KPI Occupancy Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Meter Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hall Occupancy Meter</span>
              <StatusBadge status={occupancy ? occupancy.crowdStatus : 'LOW'} size="sm" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">
                {occupancy ? occupancy.occupancyPercentage : 0}%
              </span>
              <span className="text-sm font-semibold text-slate-400">capacity filled</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (occupancy?.occupancyPercentage || 0) > 85
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                    : (occupancy?.occupancyPercentage || 0) > 50
                    ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-400 to-aditya-600'
                }`}
                style={{ width: `${Math.min(100, occupancy?.occupancyPercentage || 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>0 (Empty)</span>
              <span>75 (Moderate)</span>
              <span>150 (Max Capacity)</span>
            </div>
          </div>

          {/* Important Mathematical Principle Breakdown */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-aditya-600" />
              API Mathematical Model
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Available seats are strictly calculated as <strong className="font-mono text-aditya-700">Total Seats (50) − Occupied Seats − Reserved Seats</strong>. Physical students inside the hall ({occupancy?.studentsInside || 0}) are tracked independently from seated occupants.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Last updated: {occupancy?.lastUpdated ? new Date(occupancy.lastUpdated).toLocaleTimeString() : 'Just now'}
          </div>
        </div>

        {/* 4 Quantitative Metrics Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students Physically Inside</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-aditya-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900">
                {occupancy ? occupancy.studentsInside : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Verified via ID card QR gate entry scans
              </div>
            </div>
            <button
              onClick={() => setActivePage('qr-scanner')}
              className="text-xs font-bold text-aditya-600 hover:text-aditya-700 flex items-center gap-1"
            >
              Open Student ID Scanner →
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Library Seats</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Armchair className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-600">
                {occupancy ? occupancy.availableSeats : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Out of {occupancy ? occupancy.totalSeats : 50} total reading seats
              </div>
            </div>
            <button
              onClick={() => setActivePage('seats')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Reserve an Available Seat →
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currently Occupied Seats</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <Armchair className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900">
                {occupancy ? occupancy.occupiedSeats : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Active students checked into individual desks
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Auto-released when student scans exit
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reserved Seats (Pending)</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-amber-600">
                {occupancy ? occupancy.reservedSeats : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Booked online, awaiting student check-in
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Hold duration before release: 15 mins
            </div>
          </div>
        </div>
      </div>

      {/* Zone-by-Zone Occupancy Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-aditya-700" />
          <h2 className="text-xl font-bold text-slate-900">Zone & Floor Density Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zones.map((zone, idx) => {
            const avail = Math.max(0, zone.total - zone.occupied);
            const occPct = zone.total > 0 ? Math.round((zone.occupied / zone.total) * 100) : 0;

            return (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-aditya-600 uppercase">{zone.floor}</span>
                    <h3 className="text-base font-bold text-slate-900">{zone.name}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg border border-slate-200 text-slate-700">
                    {avail} free
                  </span>
                </div>

                <p className="text-xs text-slate-500">{zone.desc}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Occupancy</span>
                    <span>{occPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-aditya-600 h-full rounded-full transition-all"
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <span>Total: <strong>{zone.total}</strong></span>
                  <span>Occupied: <strong>{zone.occupied}</strong></span>
                  <span>Reserved: <strong>{zone.reserved}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

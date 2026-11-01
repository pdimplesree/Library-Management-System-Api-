import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { 
  Users, 
  Armchair, 
  BookOpen, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function LandingPage({ setActivePage, onSearchQuery }) {
  const [occupancy, setOccupancy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.getOccupancy().then(res => {
      if (res.success) setOccupancy(res.data);
    }).catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearchQuery) onSearchQuery(searchQuery);
      setActivePage('books');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aditya-900 via-aditya-800 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-aditya-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aditya-700/60 border border-aditya-500/30 text-aditya-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Aditya University • B.Tech 3rd Year API Subject Project
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Smart Library Management <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-aditya-300 to-amber-200">
              API & Live Occupancy System
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Eliminate wasted library visits. Track real-time hall occupancy, reserve available reading seats, search catalog inventory, and get automated book due-date reminders.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2 p-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
            <div className="flex-1 flex items-center pl-3 gap-2">
              <Search className="w-5 h-5 text-slate-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by title, author, or ISBN..."
                className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-aditya-600 hover:bg-aditya-500 text-white font-semibold text-sm rounded-xl transition shadow"
            >
              Search
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActivePage('occupancy')}
              className="px-6 py-3 bg-white text-aditya-900 hover:bg-slate-100 font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg"
            >
              <Users className="w-4 h-4 text-aditya-700" />
              View Live Occupancy
            </button>
            <button
              onClick={() => setActivePage('seats')}
              className="px-6 py-3 bg-aditya-700/80 hover:bg-aditya-600 text-white border border-aditya-500/40 font-bold text-sm rounded-xl transition flex items-center gap-2 backdrop-blur-md"
            >
              <Armchair className="w-4 h-4" />
              Reserve a Seat
            </button>
            <button
              onClick={() => setActivePage('qr-scanner')}
              className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl transition flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Student ID Entry Scan
            </button>
          </div>
        </div>
      </section>

      {/* Live Metrics Snapshot Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-aditya-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students Inside</div>
              <div className="text-2xl font-black text-slate-900">
                {occupancy ? occupancy.studentsInside : '--'}
                <span className="text-xs font-normal text-slate-500 ml-1">/ {occupancy ? occupancy.totalCapacity : 150}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Seats</div>
              <div className="text-2xl font-black text-emerald-600">
                {occupancy ? occupancy.availableSeats : '--'}
                <span className="text-xs font-normal text-slate-500 ml-1">/ {occupancy ? occupancy.totalSeats : 50}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crowd Density</div>
              <div className="mt-0.5">
                <StatusBadge status={occupancy ? occupancy.crowdStatus : 'LOW'} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">API Architecture</div>
              <div className="text-sm font-bold text-slate-800">Spring Boot + MySQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Aditya University Campus
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Every feature connects directly to backend Spring REST APIs and MySQL database records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-aditya-50 text-aditya-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Live Occupancy Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Distinguishes between total students physically inside the hall and seated occupants. Calculates real-time availability:               <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono text-aditya-700">Available = Total Seats − Occupied − Reserved</code>.
            </p>
            <button
              onClick={() => setActivePage('occupancy')}
              className="text-aditya-700 hover:text-aditya-800 text-sm font-bold flex items-center gap-1"
            >
              Explore Occupancy Page <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Armchair className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Seat Reservation & Check-In</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Interactive 50-seat visual map across General Reading, Digital Library, and Quiet Study zones. Features transactional concurrency locks to prevent double-booking.
            </p>
            <button
              onClick={() => setActivePage('seats')}
              className="text-emerald-700 hover:text-emerald-800 text-sm font-bold flex items-center gap-1"
            >
              Reserve a Seat <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">QR ID Entry & Exit Scanner</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Browser webcam QR scanning validates registered student IDs, records timestamps in MySQL, prevents invalid duplicate scans, and automatically frees reserved seats upon exit.
            </p>
            <button
              onClick={() => setActivePage('qr-scanner')}
              className="text-purple-700 hover:text-purple-800 text-sm font-bold flex items-center gap-1"
            >
              Open Student ID Scanner <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* API Subject Architecture Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Aditya University • API Lab Submission</span>
              <h3 className="text-2xl font-black mt-1">REST API Architecture & Communication Flow</h3>
            </div>
            <button
              onClick={() => setActivePage('login')}
              className="px-4 py-2 bg-aditya-600 hover:bg-aditya-500 text-white text-xs font-bold rounded-lg transition"
            >
              Role-Based Sign In
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-blue-300 font-bold block mb-1">1. Frontend Layer</span>
              <p className="text-xs text-slate-300">React + Vite SPA communicating via asynchronous JSON HTTP Fetch calls with Bearer JWT tokens.</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-emerald-300 font-bold block mb-1">2. Security & Auth</span>
              <p className="text-xs text-slate-300">Spring Security FilterChain, stateless JWT verification, and BCrypt salted password hashes.</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-amber-300 font-bold block mb-1">3. REST Controllers</span>
              <p className="text-xs text-slate-300">Clean REST endpoints (`/api/auth`, `/api/library`, `/api/reservations`, `/api/books`, `/api/loans`).</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-purple-300 font-bold block mb-1">4. Relational Storage</span>
              <p className="text-xs text-slate-300">Normalized MySQL tables with Foreign Keys, indexed lookups, and transactional concurrency integrity.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

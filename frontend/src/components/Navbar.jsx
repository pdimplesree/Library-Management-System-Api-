import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  Library, 
  Users, 
  Armchair, 
  BookOpen, 
  Bookmark, 
  Bell, 
  QrCode, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [occupancy, setOccupancy] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch live occupancy quick preview
    const fetchQuickOccupancy = () => {
      api.getOccupancy().then(res => {
        if (res.success) setOccupancy(res.data);
      }).catch(() => {});
    };

    fetchQuickOccupancy();
    const occInterval = setInterval(fetchQuickOccupancy, 10000);

    return () => clearInterval(occInterval);
  }, []);

  useEffect(() => {
    if (user) {
      api.getNotifications().then(res => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      }).catch(() => {});
    }
  }, [user, activePage]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: UserIcon, roles: ['STUDENT'] },
    { id: 'occupancy', label: 'Live Occupancy', icon: Users },
    { id: 'seats', label: 'Seat Availability', icon: Armchair },
    { id: 'books', label: 'Book Search', icon: BookOpen },
    { id: 'loans', label: 'My Loans', icon: Bookmark, roles: ['STUDENT'] },
    { id: 'qr-scanner', label: 'ID Scan', icon: QrCode, roles: ['STUDENT', 'LIBRARIAN'] },
    { id: 'librarian', label: 'Librarian Desk', icon: Users, roles: ['LIBRARIAN'] },
    { id: 'admin', label: 'Admin Portal', icon: ShieldAlert, roles: ['ADMIN'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['STUDENT'] },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top University Branding Bar */}
      <div className="bg-aditya-900 text-white text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide uppercase">Aditya University</span>
          <span className="text-aditya-300">|</span>
          <span className="text-aditya-200 hidden sm:inline">Central Library Automation & API Systems</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-400 text-amber-950">
            DEMO MODE
          </span>
          {occupancy && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-aditya-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Inside: <strong className="text-white">{occupancy.studentsInside}</strong> / {occupancy.totalCapacity}
            </span>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Project Title */}
          <div 
            onClick={() => setActivePage('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-aditya-700 text-white flex items-center justify-center shadow-md group-hover:bg-aditya-800 transition">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 leading-tight block">Smart Library</span>
              <span className="text-xs text-slate-500 font-medium">Aditya Portal & API Tracking</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.roles && (!user || !item.roles.includes(user.role))) return null;

              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-aditya-50 text-aditya-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications Bell */}
                {user.role === 'STUDENT' && (
                  <button
                    onClick={() => setActivePage('notifications')}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {/* User Info & Inside Status */}
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800 leading-none">{user.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                      <span>{user.studentId}</span>
                      {user.role === 'STUDENT' && <span className={`w-2 h-2 rounded-full ${user.isInside ? 'bg-emerald-500' : 'bg-slate-400'}`} title={user.isInside ? 'Currently inside library' : 'Outside library'} />}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-aditya-700 hover:bg-aditya-800 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  <LogIn className="w-4 h-4" />
                  Portal Login
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            if (item.roles && (!user || !item.roles.includes(user.role))) return null;

            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-aditya-50 text-aditya-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          {user && (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.name})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

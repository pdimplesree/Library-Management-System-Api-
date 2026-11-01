import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import OccupancyPage from './pages/OccupancyPage';
import SeatReservationPage from './pages/SeatReservationPage';
import BookSearchPage from './pages/BookSearchPage';
import MyLoansPage from './pages/MyLoansPage';
import NotificationsPage from './pages/NotificationsPage';
import QRScannerPage from './pages/QRScannerPage';
import AdminDashboard from './pages/AdminDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import { Heart, Library } from 'lucide-react';

function AppContent() {
  const [activePage, setActivePage] = useState('landing');
  const [sharedSearchQuery, setSharedSearchQuery] = useState('');

  const handleLandingSearch = (query) => {
    setSharedSearchQuery(query);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage setActivePage={setActivePage} onSearchQuery={handleLandingSearch} />;
      case 'login':
        return <LoginPage setActivePage={setActivePage} />;
      case 'dashboard':
        return <StudentDashboard setActivePage={setActivePage} />;
      case 'occupancy':
        return <OccupancyPage setActivePage={setActivePage} />;
      case 'seats':
        return <SeatReservationPage setActivePage={setActivePage} />;
      case 'books':
        return <BookSearchPage initialSearchQuery={sharedSearchQuery} />;
      case 'loans':
        return <MyLoansPage setActivePage={setActivePage} />;
      case 'notifications':
        return <NotificationsPage setActivePage={setActivePage} />;
      case 'qr-scanner':
        return <QRScannerPage />;
      case 'admin':
        return <AdminDashboard setActivePage={setActivePage} />;
      case 'librarian':
        return <LibrarianDashboard />;
      default:
        return <LandingPage setActivePage={setActivePage} onSearchQuery={handleLandingSearch} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-aditya-700" />
            <strong className="text-slate-800">Aditya University Smart Library System</strong>
            <span>• Application Programming Interface (API) Course Project</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Spring Boot REST Backend</span>
            <span>•</span>
            <span>MySQL 8.0 Relational Database</span>
            <span>•</span>
            <span>React + Tailwind UI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { extractStudentId } from '../utils/studentId';
import StatusBadge from '../components/StatusBadge';
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Bookmark, 
  Clock, 
  Armchair, 
  PlusCircle, 
  RefreshCw, 
  BellRing, 
  CheckCircle2, 
  AlertCircle, 
  Layers,
  ArrowRightLeft,
  Loader2
} from 'lucide-react';

export default function AdminDashboard({ setActivePage }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [allVisits, setAllVisits] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, BOOKS, LOANS, VISITS, STUDENTS
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: '',
    email: '',
    password: '',
    department: 'CSE',
    yearOfStudy: 1,
    phone: '',
  });
  const [newLibrarian, setNewLibrarian] = useState({ staffId: '', name: '', email: '', password: '', phone: '' });
  const [studentScannerActive, setStudentScannerActive] = useState(false);
  const studentVideoRef = useRef(null);
  const studentScannerControlsRef = useRef(null);

  // Add Book Form state
  const [newBook, setNewBook] = useState({
    isbn: '',
    title: '',
    author: '',
    category: 'Computer Science',
    publisher: '',
    totalCopies: 5,
    shelfLocation: 'Rack CS-05',
    description: '',
  });

  // Issue Loan Form state
  const [newLoan, setNewLoan] = useState({
    bookId: 1,
    userId: 2,
    dueDateOffsetDays: 14,
  });

  const fetchAdminData = async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoading(true);

    try {
      const [dashRes, studRes, visRes, librarianRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminStudents(),
        api.getVisits(),
        api.getAdminLibrarians(),
      ]);

      if (dashRes.success) setStats(dashRes.data);
      if (studRes.success) setStudents(studRes.data);
      if (visRes.success) setAllVisits(visRes.data);
      if (librarianRes.success) setLibrarians(librarianRes.data);
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  useEffect(() => () => studentScannerControlsRef.current?.stop(), []);

  const toggleStudentScanner = async () => {
    if (studentScannerActive) {
      studentScannerControlsRef.current?.stop();
      studentScannerControlsRef.current = null;
      setStudentScannerActive(false);
      return;
    }

    try {
      const reader = new BrowserMultiFormatReader();
      studentScannerControlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        studentVideoRef.current,
        (result, _error, controls) => {
          if (result) {
            setNewStudent((current) => ({
              ...current,
              studentId: extractStudentId(result.getText()),
            }));
            controls.stop();
            studentScannerControlsRef.current = null;
            setStudentScannerActive(false);
          }
        }
      );
      setStudentScannerActive(true);
    } catch (err) {
      setNotification({ type: 'error', message: `Could not start student ID scanner: ${err.message}` });
      setStudentScannerActive(false);
    }
  };

  const handleRegisterStudent = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setNotification(null);

    try {
      const payload = {
        ...newStudent,
        studentId: extractStudentId(newStudent.studentId),
        yearOfStudy: Number(newStudent.yearOfStudy),
      };
      const res = await api.registerStudent(payload);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Student ${res.data.name} (${res.data.studentId}) registered successfully.`,
        });
        setNewStudent({
          studentId: '',
          name: '',
          email: '',
          password: '',
          department: 'CSE',
          yearOfStudy: 1,
          phone: '',
        });
        await fetchAdminData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to register student.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterLibrarian = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setNotification(null);
    try {
      const response = await api.registerLibrarian({
        ...newLibrarian,
        staffId: newLibrarian.staffId.trim().toUpperCase(),
      });
      if (response.success) {
        setNotification({ type: 'success', message: `Librarian account ${response.data.studentId} created.` });
        setNewLibrarian({ staffId: '', name: '', email: '', password: '', phone: '' });
        await fetchAdminData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to create librarian account.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setNotification(null);

    try {
      const res = await api.addBook(newBook);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Book "${res.data.title}" added to catalog with ${res.data.totalCopies} copies!`,
        });
        setNewBook({
          isbn: '',
          title: '',
          author: '',
          category: 'Computer Science',
          publisher: '',
          totalCopies: 5,
          shelfLocation: 'Rack CS-05',
          description: '',
        });
        fetchAdminData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to add book.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueLoan = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setNotification(null);

    try {
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + parseInt(newLoan.dueDateOffsetDays));

      const payload = {
        bookId: parseInt(newLoan.bookId),
        userId: parseInt(newLoan.userId),
        issueDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
      };

      const res = await api.issueAdminLoan(payload);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Book loan issued to student ID ${res.data.user.studentId}! Due on ${res.data.dueDate}`,
        });
        fetchAdminData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to issue loan.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerReminders = async () => {
    setActionLoading(true);
    setNotification(null);

    try {
      const res = await api.triggerReminders();
      if (res.success) {
        setNotification({
          type: 'success',
          message: 'Scheduled reminder job executed! Scanned overdue loans and dispatched in-app notifications.',
        });
        fetchAdminData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to trigger scan.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          This section is restricted to system administrators.
        </p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 bg-aditya-700 hover:bg-aditya-800 text-white font-bold text-xs rounded-xl transition"
        >
          Sign In with an Admin Account
        </button>
      </div>
    );
  }

  const occ = stats?.occupancy;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Admin Control Center</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              SYSTEM ADMINISTRATION
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{user.name}</strong> ({user.email}). Manage user accounts, reports, and system configuration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerReminders}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <BellRing className="w-4 h-4" />
            Trigger Due-Date Check
          </button>
          <button
            onClick={fetchAdminData}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin text-aditya-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification banner */}
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

      {activeTab === 'LIBRARIANS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Librarian account management</h3>
            <p className="text-xs text-slate-500 mt-1">Create role-specific staff accounts. Librarians receive access only to the attendance and seat-management desk.</p>
          </div>
          <form onSubmit={handleRegisterLibrarian} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input required aria-label="Staff ID" value={newLibrarian.staffId} onChange={(event) => setNewLibrarian({ ...newLibrarian, staffId: event.target.value })} placeholder="Staff ID" className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
            <input required aria-label="Librarian name" value={newLibrarian.name} onChange={(event) => setNewLibrarian({ ...newLibrarian, name: event.target.value })} placeholder="Full name" className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
            <input required type="email" aria-label="Librarian email" value={newLibrarian.email} onChange={(event) => setNewLibrarian({ ...newLibrarian, email: event.target.value })} placeholder="Email" className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
            <input required type="password" minLength={8} aria-label="Initial librarian password" value={newLibrarian.password} onChange={(event) => setNewLibrarian({ ...newLibrarian, password: event.target.value })} placeholder="Initial password (8+)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
            <input aria-label="Librarian phone" value={newLibrarian.phone} onChange={(event) => setNewLibrarian({ ...newLibrarian, phone: event.target.value })} placeholder="Phone (optional)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
            <button type="submit" disabled={actionLoading} className="sm:col-span-2 lg:col-span-5 justify-self-start px-4 py-2.5 bg-aditya-700 hover:bg-aditya-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl">
              {actionLoading ? 'Creating account...' : 'Create librarian account'}
            </button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                <tr><th className="py-3 px-4">Staff ID</th><th className="py-3 px-4">Name</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Role</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {librarians.map((librarian) => (
                  <tr key={librarian.id}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{librarian.studentId}</td>
                    <td className="py-3 px-4 font-semibold">{librarian.name}</td>
                    <td className="py-3 px-4">{librarian.email}</td>
                    <td className="py-3 px-4"><StatusBadge status="LIBRARIAN" size="xs" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Students Inside</div>
          <div className="text-3xl font-black text-slate-900">{occ?.studentsInside || 0}</div>
          <div className="text-[11px] text-slate-500">of {occ?.totalCapacity || 150} capacity</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Occupied Seats</div>
          <div className="text-3xl font-black text-rose-600">{occ?.occupiedSeats || 0}</div>
          <div className="text-[11px] text-slate-500">Available: {occ?.availableSeats || 50}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Catalog Titles</div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalBooks || 0}</div>
          <div className="text-[11px] text-slate-500">Textbooks in database</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Active Loans</div>
          <div className="text-3xl font-black text-aditya-600">{stats?.activeLoans || 0}</div>
          <div className="text-[11px] text-slate-500">Currently checked out</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Overdue Books</div>
          <div className="text-3xl font-black text-red-600">{stats?.overdueLoans || 0}</div>
          <div className="text-[11px] text-red-600 font-bold">Needs recovery notice</div>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs gap-1">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'OVERVIEW' ? 'bg-aditya-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Recent Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('BOOKS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'BOOKS' ? 'bg-aditya-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Add New Book
        </button>
        <button
          onClick={() => setActiveTab('LOANS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'LOANS' ? 'bg-aditya-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Issue Demo Loan
        </button>
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'STUDENTS' ? 'bg-aditya-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Registered Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('LIBRARIANS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'LIBRARIANS' ? 'bg-aditya-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Librarians ({librarians.length})
        </button>
      </div>

      {/* Tab 1: OVERVIEW Activity Logs */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Visits Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Gate Entry / Exit Logs</h3>
              <span className="text-xs text-slate-500">Live MySQL records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Entry Time</th>
                    <th className="py-2.5 px-3">Exit Time</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allVisits.slice(0, 7).map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-800 block">{v.user.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{v.user.studentId}</span>
                      </td>
                      <td className="py-2.5 px-3">{new Date(v.entryTime).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-3">
                        {v.exitTime ? new Date(v.exitTime).toLocaleTimeString() : '--'}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={v.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Book Loans */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Recent Borrowing Activity</h3>
              <span className="text-xs text-slate-500">Loan Status</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Book</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recentLoans || []).slice(0, 7).map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-800 block truncate max-w-[150px]">{l.book.title}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{l.book.isbn}</span>
                      </td>
                      <td className="py-2.5 px-3">{l.user.name}</td>
                      <td className="py-2.5 px-3 font-mono">{l.dueDate}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={l.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Add New Book Form */}
      {activeTab === 'BOOKS' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-aditya-50 text-aditya-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add Book to Central Catalog</h3>
              <p className="text-xs text-slate-500">Enter catalog metadata to seed or update library inventory.</p>
            </div>
          </div>

          <form onSubmit={handleAddBook} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ISBN Number</label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  placeholder="e.g. 978-0134685991"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={newBook.totalCopies}
                  onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Book Title</label>
              <input
                type="text"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                placeholder="e.g. Building Microservices with Spring Boot"
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Author(s)</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="e.g. Sam Newman"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={newBook.category}
                  onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="API Architecture">API Architecture</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Networking">Networking</option>
                  <option value="Databases">Databases</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shelf Location</label>
                <input
                  type="text"
                  value={newBook.shelfLocation}
                  onChange={(e) => setNewBook({ ...newBook, shelfLocation: e.target.value })}
                  placeholder="e.g. Rack CS-05"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Publisher</label>
                <input
                  type="text"
                  value={newBook.publisher}
                  onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                  placeholder="e.g. O'Reilly Media"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Syllabus Reference</label>
              <textarea
                value={newBook.description}
                onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                rows="3"
                placeholder="Recommended reference textbook for Aditya University B.Tech curriculum..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-aditya-700 hover:bg-aditya-800 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {actionLoading ? 'Saving Book to MySQL...' : 'Save Book to Catalog'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Issue Demo Loan Form */}
      {activeTab === 'LOANS' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Issue Demo Book Loan</h3>
              <p className="text-xs text-slate-500">Create upcoming or overdue loans to demonstrate deadline reminder notifications.</p>
            </div>
          </div>

          <form onSubmit={handleIssueLoan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Student</label>
              <select
                value={newLoan.userId}
                onChange={(e) => setNewLoan({ ...newLoan, userId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500 font-semibold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId}) — {s.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Book</label>
              <select
                value={newLoan.bookId}
                onChange={(e) => setNewLoan({ ...newLoan, bookId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500 font-semibold"
              >
                {(stats?.recentLoans || []).map((l, idx) => (
                  <option key={idx} value={l.book.id}>
                    {l.book.title} (Available: {l.book.availableCopies})
                  </option>
                ))}
                <option value="1">Effective Java (3rd Edition)</option>
                <option value="2">Clean Code: Handbook of Agile Software</option>
                <option value="4">Spring Boot in Action</option>
                <option value="5">RESTful Web APIs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Return Due-Date Offset (For Testing)</label>
              <select
                value={newLoan.dueDateOffsetDays}
                onChange={(e) => setNewLoan({ ...newLoan, dueDateOffsetDays: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-aditya-500 font-semibold"
              >
                <option value="2">Due in 2 days (Triggers upcoming reminder notification)</option>
                <option value="-5">Due 5 days ago (Triggers instant OVERDUE alert!)</option>
                <option value="14">Standard 14 days loan period</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              {actionLoading ? 'Issuing Loan...' : 'Issue Book Loan Record'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Registered Students */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">Registered Student Accounts</h3>
            <span className="text-xs text-slate-500">Aditya University Registered Records</span>
          </div>

          <form onSubmit={handleRegisterStudent} className="rounded-2xl border border-aditya-100 bg-aditya-50/40 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900">Add Student by typing or scanning their ID</h4>
                <p className="text-xs text-slate-500 mt-1">Use a webcam or a USB barcode scanner, then complete the student details.</p>
              </div>
              <button
                type="button"
                onClick={toggleStudentScanner}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-aditya-300"
              >
                {studentScannerActive ? 'Stop ID Scanner' : 'Scan Student Barcode / QR'}
              </button>
            </div>

            {studentScannerActive && (
              <video
                ref={studentVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full max-h-64 rounded-xl bg-slate-900 object-contain"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                required
                aria-label="Student ID"
                value={newStudent.studentId}
                onChange={(event) => setNewStudent({ ...newStudent, studentId: extractStudentId(event.target.value) })}
                placeholder="Student ID / Roll No"
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
              <input
                required
                aria-label="Student name"
                value={newStudent.name}
                onChange={(event) => setNewStudent({ ...newStudent, name: event.target.value })}
                placeholder="Full name"
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
              <input
                type="email"
                aria-label="Student email"
                value={newStudent.email}
                onChange={(event) => setNewStudent({ ...newStudent, email: event.target.value })}
                placeholder="Email (optional)"
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
              <input
                required
                type="password"
                minLength={8}
                aria-label="Initial password"
                value={newStudent.password}
                onChange={(event) => setNewStudent({ ...newStudent, password: event.target.value })}
                placeholder="Initial password (8+ characters)"
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
              <input
                required
                aria-label="Department"
                value={newStudent.department}
                onChange={(event) => setNewStudent({ ...newStudent, department: event.target.value })}
                placeholder="Department"
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
              <select
                aria-label="Year of study"
                value={newStudent.yearOfStudy}
                onChange={(event) => setNewStudent({ ...newStudent, yearOfStudy: event.target.value })}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              >
                {[1, 2, 3, 4].map((year) => <option key={year} value={year}>Year {year}</option>)}
              </select>
            </div>
            <p className="text-[11px] text-slate-500">If email is left blank, one will be generated from the student ID. Set a unique initial password for this student.</p>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2.5 bg-aditya-700 hover:bg-aditya-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl"
            >
              {actionLoading ? 'Adding student...' : 'Add Student'}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Current Hall Presence</th>
                  <th className="py-3 px-4">Library Pass QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 align-top">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.studentId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="py-3 px-4">{s.department}</td>
                    <td className="py-3 px-4">Year {s.yearOfStudy}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.isInside ? 'INSIDE' : 'OUTSIDE'} size="xs" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2 w-fit">
                        <QRCodeSVG value={s.studentId} size={52} level="M" includeMargin={true} bgColor="#ffffff" fgColor="#0f172a" />
                        <div className="text-[10px] text-slate-500 font-mono leading-tight">
                          <div className="font-bold text-slate-700">Library Pass</div>
                          <div>{s.studentId}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

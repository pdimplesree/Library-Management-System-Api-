import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { 
  Bookmark, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  BookOpen, 
  Loader2,
  Info
} from 'lucide-react';

export default function MyLoansPage({ setActivePage }) {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchLoans = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getMyLoans();
      if (res.success) setLoans(res.data);
    } catch (e) {
      console.error('Failed to load loans:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [user]);

  const handleReturnBook = async (loanId, title) => {
    if (!window.confirm(`Confirm return of borrowed book: "${title}"?`)) return;

    setActionLoading(true);
    setNotification(null);

    try {
      const res = await api.returnBook(loanId);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Book "${title}" returned successfully! Available copies updated in catalog.`,
        });
        await fetchLoans();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to process return.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Student Sign-In Required</h2>
        <p className="text-xs text-slate-500">
          Please sign in to view your borrowed books, upcoming due dates, and return history.
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
  const pastLoans = loans.filter(l => l.status === 'RETURNED');
  const hasOverdue = activeLoans.some(l => l.status === 'OVERDUE' || (l.dueDate && new Date(l.dueDate) < new Date()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Borrowed Books & Deadlines</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tracking active library loans, return due-dates, and in-app automated deadline reminders.
          </p>
        </div>

        <button
          onClick={() => setActivePage('books')}
          className="flex items-center gap-2 px-4 py-2.5 bg-aditya-700 hover:bg-aditya-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <BookOpen className="w-4 h-4" />
          Browse Library Catalogue
        </button>
      </div>

      {/* Notifications / Alerts */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Overdue Warning Alert Banner */}
      {hasOverdue && (
        <div className="p-5 bg-red-50 border-2 border-red-200 rounded-3xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 space-y-1">
            <strong className="text-sm font-black text-red-800 block">
              ACTION REQUIRED: You have overdue library books!
            </strong>
            <p>
              One or more borrowed items have passed their official return deadline. Please return them to avoid daily penalty fines and borrowing restriction holds on your student account.
            </p>
          </div>
        </div>
      )}

      {/* Active Borrowed Books List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Active Borrowed Books ({activeLoans.length})</h2>
          <span className="text-xs text-slate-500">Max allowed concurrent loans: 4 items</span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-aditya-600 animate-spin mx-auto" />
            <span className="text-xs text-slate-400 mt-2 block">Loading borrowed books...</span>
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Active Borrowed Books</h3>
            <p className="text-xs text-slate-500">You currently do not have any borrowed items. Search the catalog to check out books.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => {
              const today = new Date();
              const due = new Date(loan.dueDate);
              const diffTime = due - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isOverdue = diffDays < 0 || loan.status === 'OVERDUE';

              return (
                <div
                  key={loan.id}
                  className={`bg-white rounded-3xl border p-6 shadow-sm space-y-4 flex flex-col justify-between ${
                    isOverdue ? 'border-red-300 ring-1 ring-red-300 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-aditya-50 text-aditya-700 border border-aditya-200">
                        {loan.book.category}
                      </span>
                      <StatusBadge status={isOverdue ? 'OVERDUE' : 'BORROWED'} size="sm" />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                        {loan.book.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Author: <strong className="text-slate-700">{loan.book.author}</strong>
                      </div>
                    </div>

                    {/* Timeline Box */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Issue Date</span>
                        <span className="font-semibold text-slate-700">{loan.issueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Due Date</span>
                        <span className={`font-bold ${isOverdue ? 'text-red-700 font-mono' : 'text-slate-800'}`}>
                          {loan.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Remaining Days Counter */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-aditya-600'}`} />
                      {isOverdue ? (
                        <span className="font-bold text-red-700">
                          Overdue by {Math.abs(diffDays)} day(s)! Return immediately.
                        </span>
                      ) : (
                        <span className="font-medium text-slate-600">
                          <strong className="text-slate-900">{diffDays} day(s)</strong> remaining until due date.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Return Button */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleReturnBook(loan.id, loan.book.title)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Return Book (Demo Action)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Completed Loans History */}
      {pastLoans.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-slate-900">Return History ({pastLoans.length})</h2>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Return Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastLoans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{l.book.title}</td>
                      <td className="py-3 px-4">{l.book.category}</td>
                      <td className="py-3 px-4">{l.issueDate}</td>
                      <td className="py-3 px-4">{l.dueDate}</td>
                      <td className="py-3 px-4 font-medium text-emerald-700">{l.returnDate || 'Returned'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status="RETURNED" size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

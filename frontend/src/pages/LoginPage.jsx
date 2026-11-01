import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Library, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const roles = [
  { id: 'STUDENT', label: 'Student', identifier: 'Student ID / Roll No', placeholder: 'Enter your student ID' },
  { id: 'LIBRARIAN', label: 'Librarian', identifier: 'Staff ID or email', placeholder: 'Enter your librarian ID' },
  { id: 'ADMIN', label: 'Admin', identifier: 'Admin ID or email', placeholder: 'Enter your admin ID' },
];

export default function LoginPage({ setActivePage }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState('STUDENT');
  const selectedRole = roles.find((role) => role.id === activeRole);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your account ID and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = await login(identifier.trim(), password, activeRole);
      setActivePage(user.role === 'ADMIN' ? 'admin' : user.role === 'LIBRARIAN' ? 'librarian' : 'dashboard');
    } catch (err) {
      setError(err.message || 'Sign-in failed. Check your account details and selected role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-aditya-900 to-aditya-800 text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
            <Library className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Aditya University Portal</h2>
          <p className="text-xs text-aditya-200">Sign in to your role-specific library account</p>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50" role="tablist" aria-label="Login role">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={activeRole === role.id}
              onClick={() => {
                setActiveRole(role.id);
                setError('');
              }}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
                activeRole === role.id
                  ? 'border-aditya-700 text-aditya-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {role.label} Login
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                {selectedRole.identifier}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={selectedRole.placeholder}
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-aditya-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-aditya-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-aditya-700 hover:bg-aditya-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying account...</> : `Sign In as ${selectedRole.label}`}
            </button>
          </form>
          <p className="text-[11px] text-slate-500 text-center">
            Use your own account credentials. Your selected role determines which tools you can access.
          </p>
        </div>
      </div>
    </div>
  );
}

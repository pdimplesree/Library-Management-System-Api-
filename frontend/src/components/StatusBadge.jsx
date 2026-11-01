import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const s = (status || '').toUpperCase();

  const configs = {
    AVAILABLE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Available' },
    RESERVED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Reserved' },
    OCCUPIED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Occupied' },
    ACTIVE: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Active' },
    CHECKED_IN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Checked In' },
    BORROWED: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', label: 'Borrowed' },
    OVERDUE: { bg: 'bg-red-100 text-red-800 border-red-300 font-bold', dot: 'bg-red-600 animate-pulse', label: 'OVERDUE' },
    RETURNED: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400', label: 'Returned' },
    INSIDE: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', label: 'Inside Library' },
    OUTSIDE: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Outside' },
    LOW: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Low Crowding' },
    MODERATE: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Moderate' },
    HIGH: { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: 'High Density' },
    FULL: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600', label: 'Capacity Full' },
  };

  const config = configs[s] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400', label: status };

  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

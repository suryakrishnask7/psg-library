import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Hash,
  BookOpen,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { bookAPI } from '../services/api';

export default function CirculationDesk({ onLoanReturned, onToast }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [returningId, setReturningId] = useState(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await bookAPI.getIssues({
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        limit: 50,
      });
      if (res.data.success) {
        setIssues(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      if (onToast) onToast('Failed to load circulation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  const handleReturn = async (issueId, bookTitle, studentName) => {
    try {
      setReturningId(issueId);
      const res = await bookAPI.returnIssue(issueId);
      if (res.data.success) {
        if (onToast) onToast(`"${bookTitle}" returned by ${studentName}`, 'success');
        await fetchIssues();
        if (onLoanReturned) onLoanReturned();
      }
    } catch (err) {
      if (onToast) onToast(err.response?.data?.message || 'Failed to return book', 'error');
    } finally {
      setReturningId(null);
    }
  };

  // Quick summary counts
  const activeCount = issues.filter((i) => i.status === 'Issued').length;
  const overdueCount = issues.filter((i) => i.status === 'Overdue').length;
  const returnedCount = issues.filter((i) => i.status === 'Returned').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>PSG Circulation & Lending Desk</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live Registry
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track student borrowings, monitor return deadlines, and process check-ins
          </p>
        </div>

        {/* Quick Loan KPI Chips */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-800 flex items-center gap-1.5 font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Active: {activeCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-800 flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Overdue: {overdueCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Returned: {returnedCount}</span>
          </div>
          <button
            onClick={fetchIssues}
            title="Refresh Registry"
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or book title..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50/80 hover:bg-gray-100/70 focus:bg-white text-xs rounded-full border border-gray-200/80 focus:border-blue-500 focus:outline-none"
          />
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-full border border-gray-200/60 text-xs self-stretch sm:self-auto justify-center">
          {['All', 'Issued', 'Overdue', 'Returned'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                statusFilter === s
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span>Loading circulation ledger...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            No circulation records match the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student & Member</th>
                  <th className="py-3 px-4">Book Title & ISBN</th>
                  <th className="py-3 px-4">Lending Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {issues.map((rec) => {
                  const isIssued = rec.status === 'Issued';
                  const isOverdue = rec.status === 'Overdue';
                  const isReturned = rec.status === 'Returned';

                  return (
                    <tr key={rec._id} className="hover:bg-blue-50/20 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {rec.studentName ? rec.studentName.charAt(0) : 'S'}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">
                              {rec.studentName}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <span className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                                {rec.rollNumber}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{rec.department}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Book Title & ISBN */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-gray-900 line-clamp-1">
                          {rec.bookTitle}
                        </span>
                        <span className="font-mono text-[11px] text-gray-400 block">
                          ISBN: {rec.bookIsbn}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">
                        <div>
                          <span className="text-gray-400">Issued: </span>
                          <span>{new Date(rec.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Due: </span>
                          <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-gray-800'}`}>
                            {new Date(rec.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {rec.returnDate && (
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Returned: {new Date(rec.returnDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3" /> In Circulation
                          </span>
                        )}
                      </td>

                      {/* Return Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => handleReturn(rec._id, rec.bookTitle, rec.studentName)}
                            disabled={returningId === rec._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{returningId === rec._id ? 'Processing...' : 'Mark Return'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


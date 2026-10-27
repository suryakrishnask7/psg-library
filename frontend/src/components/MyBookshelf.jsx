import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  RotateCcw,
  MapPin,
  Barcode,
  CheckCircle2,
  AlertTriangle,
  BookmarkCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { bookAPI } from '../services/api';

export default function MyBookshelf({ user, onReturnComplete, onGoToCatalog, onToast }) {
  const [loans, setLoans] = useState({ active: [], history: [], activeCount: 0 });
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('active'); // 'active' | 'history'

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const res = await bookAPI.getMyLoans(user?.identifier);
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load my loans:', err);
      if (onToast) onToast('Failed to load your borrowed books', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.identifier) {
      fetchMyLoans();
    }
  }, [user]);

  const handleSelfReturn = async (issueId, bookTitle) => {
    try {
      setReturningId(issueId);
      const res = await bookAPI.selfReturnBook(issueId);
      if (res.data.success) {
        if (onToast) onToast(`"${bookTitle}" returned to PSG Library shelf!`, 'success');
        await fetchMyLoans();
        if (onReturnComplete) onReturnComplete();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to return book';
      if (onToast) onToast(msg, 'error');
    } finally {
      setReturningId(null);
    }
  };

  // Calculate days remaining or overdue
  const getDueStatus = (dueDateStr) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffMs = due - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        isOverdue: true,
      };
    } else if (diffDays === 0) {
      return {
        label: 'Due Today',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        isOverdue: false,
      };
    } else if (diffDays <= 3) {
      return {
        label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        isOverdue: false,
      };
    } else {
      return {
        label: `Due in ${diffDays} days`,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        isOverdue: false,
      };
    }
  };

  const maxAllowed = user?.maxBooksAllowed || 4;
  const currentCount = loans.active.length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quota Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Personal Digital Bookshelf
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-mono font-medium text-gray-500">ID: {user?.identifier}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Welcome, {user?.name}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.department} • {user?.role === 'faculty' ? 'Faculty Member' : 'Student'}
          </p>
        </div>

        {/* Quota Gauge */}
        <div className="flex items-center gap-4 bg-gray-50 p-3.5 px-4 rounded-2xl border border-gray-200/70">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Borrowing Quota
            </span>
            <span className="text-lg font-bold text-gray-900">
              <span className="text-blue-600">{currentCount}</span>
              <span className="text-gray-400"> / {maxAllowed}</span>
            </span>
            <span className="text-[11px] text-gray-500 block">
              {maxAllowed - currentCount} more book{maxAllowed - currentCount === 1 ? '' : 's'} allowed
            </span>
          </div>

          <button
            onClick={fetchMyLoans}
            title="Refresh Bookshelf"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-tabs: Active Borrowings vs History */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-gray-100 rounded-full border border-gray-200/60 text-xs">
          <button
            onClick={() => setActiveSubTab('active')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold transition-all ${
              activeSubTab === 'active'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Currently Holding ({loans.active.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold transition-all ${
              activeSubTab === 'history'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Past Borrowing History ({loans.history.length})</span>
          </button>
        </div>

        {currentCount < maxAllowed && (
          <button
            onClick={onGoToCatalog}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>Browse library catalog to borrow more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Borrowed Books List */}
      {activeSubTab === 'active' && (
        <div>
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span>Checking your digital loans...</span>
            </div>
          ) : loans.active.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs max-w-md mx-auto my-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No Books Currently Borrowed</h3>
              <p className="text-xs text-gray-500 mb-4">
                Your bookshelf is clear! Browse the PSG Library catalog to find textbooks, research volumes, and engineering references.
              </p>
              <button
                onClick={onGoToCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
              >
                <span>Browse & Borrow Books</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.active.map((loan) => {
                const dueStatus = getDueStatus(loan.dueDate);

                return (
                  <div
                    key={loan._id}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                          {loan.book?.department || loan.department}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${dueStatus.color}`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{dueStatus.label}</span>
                        </span>
                      </div>

                      {/* Title & Author */}
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-1">
                        {loan.bookTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {loan.book?.author ? `by ${loan.book.author}` : ''}
                      </p>

                      {/* Meta chips */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          <span className="truncate">{loan.book?.shelfLocation || 'Main Stack'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate font-mono text-[11px]">
                          <Barcode className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{loan.bookIsbn}</span>
                        </div>
                      </div>

                      {/* Date details */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 pb-3 border-t border-gray-100">
                        <span>Issued: {new Date(loan.issueDate).toLocaleDateString()}</span>
                        <span className="font-semibold text-gray-800">
                          Due Date: {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Self-Return Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleSelfReturn(loan._id, loan.bookTitle)}
                        disabled={returningId === loan._id}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${returningId === loan._id ? 'animate-spin' : ''}`} />
                        <span>{returningId === loan._id ? 'Processing Return...' : 'Return Book to Library (Self-Checkin)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Past Borrowing History List */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          {loans.history.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No completed loan records found in your history.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Book Title & ISBN</th>
                    <th className="py-3 px-4">Borrowed On</th>
                    <th className="py-3 px-4">Returned On</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loans.history.map((h) => (
                    <tr key={h._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block">{h.bookTitle}</span>
                        <span className="font-mono text-[10px] text-gray-400">ISBN: {h.bookIsbn}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(h.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">
                        {h.returnDate ? new Date(h.returnDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Returned
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


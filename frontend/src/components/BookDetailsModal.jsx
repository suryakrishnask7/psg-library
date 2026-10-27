import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Barcode,
  Calendar,
  Building,
  User,
  Clock,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookOpen,
  Edit2,
  Trash2,
} from 'lucide-react';
import { bookAPI } from '../services/api';

export default function BookDetailsModal({
  isOpen,
  onClose,
  book,
  onEdit,
  onDelete,
  onIssue,
  onReturnComplete,
}) {
  const [loanHistory, setLoanHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    if (isOpen && book?._id) {
      loadBookDetails();
    }
  }, [isOpen, book]);

  const loadBookDetails = async () => {
    try {
      setLoadingHistory(true);
      const res = await bookAPI.getById(book._id);
      if (res.data.success) {
        setLoanHistory(res.data.issues || []);
      }
    } catch (err) {
      console.error('Failed to load loan history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReturnItem = async (issueId) => {
    try {
      setReturningId(issueId);
      await bookAPI.returnIssue(issueId);
      await loadBookDetails();
      if (onReturnComplete) onReturnComplete();
    } catch (err) {
      console.error('Failed to return book:', err);
    } finally {
      setReturningId(null);
    }
  };

  if (!isOpen || !book) return null;

  const isOutOfStock = book.availableCopies <= 0;
  const isLowStock = book.availableCopies > 0 && book.availableCopies <= 2;
  const borrowedCount = book.totalCopies - book.availableCopies;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cover Accent Banner */}
        <div
          className="p-6 text-white relative"
          style={{ backgroundColor: book.coverColor || '#1a73e8' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-2">
                {book.department}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">{book.title}</h2>
              <p className="text-sm text-white/90 mt-1 font-medium">by {book.author}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Inventory Status Strip */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 text-center">
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Total Stock
              </span>
              <span className="text-xl font-bold text-gray-900">{book.totalCopies}</span>
              <span className="text-[11px] text-gray-400 block">volumes</span>
            </div>
            <div className="border-x border-gray-200">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Available
              </span>
              <span className={`text-xl font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {book.availableCopies}
              </span>
              <span className="text-[11px] text-gray-400 block">in shelf</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                Borrowed
              </span>
              <span className="text-xl font-bold text-blue-600">{borrowedCount}</span>
              <span className="text-[11px] text-gray-400 block">with students</span>
            </div>
          </div>

          {/* Book Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50/60 border border-gray-100">
              <span className="text-gray-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Shelf Location
              </span>
              <span className="font-semibold text-gray-800">{book.shelfLocation || 'Floor 2'}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/60 border border-gray-100">
              <span className="text-gray-400 block mb-1 flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5 text-gray-500" />
                ISBN / Acc No.
              </span>
              <span className="font-mono font-semibold text-gray-800">{book.isbn}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/60 border border-gray-100">
              <span className="text-gray-400 block mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                Publisher
              </span>
              <span className="font-medium text-gray-800">{book.publisher || 'PSG Academic'}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/60 border border-gray-100">
              <span className="text-gray-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Edition & Year
              </span>
              <span className="font-medium text-gray-800">
                {book.edition || '1st Ed.'} ({book.publishedYear || '—'})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/60 border border-gray-100 col-span-2">
              <span className="text-gray-400 block mb-1">Stock Status</span>
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Available
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Overview & Syllabus Topics
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                {book.description}
              </p>
            </div>
          )}

          {/* Active Borrowers / Loan History Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Active Borrowers & Recent Loans
              </h4>
              <span className="text-xs text-gray-400">{loanHistory.length} records</span>
            </div>

            {loadingHistory ? (
              <div className="text-center py-4 text-xs text-gray-400">Loading loan records...</div>
            ) : loanHistory.length === 0 ? (
              <div className="text-center py-5 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-500">
                No active or past loans found for this title. Ready for checkout!
              </div>
            ) : (
              <div className="space-y-2">
                {loanHistory.map((rec) => {
                  const isIssued = rec.status === 'Issued';
                  const isOverdue = rec.status === 'Overdue';
                  const isReturned = rec.status === 'Returned';

                  return (
                    <div
                      key={rec._id}
                      className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{rec.studentName}</span>
                          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                            {rec.rollNumber}
                          </span>
                          <span className="text-[11px] text-gray-500">{rec.department}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                          <span>Issued: {new Date(rec.issueDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={isOverdue ? 'text-rose-600 font-semibold' : ''}>
                            Due: {new Date(rec.dueDate).toLocaleDateString()}
                          </span>
                          {rec.returnDate && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700">
                                Returned: {new Date(rec.returnDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status & Return Action */}
                      <div className="flex items-center gap-2">
                        {isReturned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Issued
                          </span>
                        )}

                        {!isReturned && (
                          <button
                            onClick={() => handleReturnItem(rec._id)}
                            disabled={returningId === rec._id}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{returningId === rec._id ? 'Returning...' : 'Return'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Bar at Bottom of Details */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(book);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Record</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onDelete(book);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onIssue(book);
                }}
                disabled={isOutOfStock}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Issue Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

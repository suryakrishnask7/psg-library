import React from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  User,
  Hash,
  Building2,
  MapPin,
  Barcode,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export default function ConfirmIssueModal({
  isOpen,
  onClose,
  onConfirm,
  issueDetails,
  isSubmitting = false,
}) {
  if (!isOpen || !issueDetails) return null;

  const {
    bookTitle,
    bookAuthor,
    isbn,
    shelfLocation,
    coverColor,
    studentName,
    rollNumber,
    department,
    issueDate = new Date(),
    dueDate,
  } = issueDetails;

  const formattedIssueDate = new Date(issueDate).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Confirm Book Checkout</h2>
              <p className="text-xs text-white/80">PSG Library • Loan Agreement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Book Summary Card */}
          <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex items-start gap-3">
            <div
              className="w-2.5 h-12 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: coverColor || '#1a73e8' }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate">{bookTitle}</h4>
              <p className="text-xs text-gray-500 truncate">{bookAuthor ? `by ${bookAuthor}` : ''}</p>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" />
                  {shelfLocation || 'Main Stack'}
                </span>
                <span>•</span>
                <span className="font-mono flex items-center gap-1">
                  <Barcode className="w-3 h-3" />
                  {isbn}
                </span>
              </div>
            </div>
          </div>

          {/* Member Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-500" />
                Borrower / Student
              </span>
              <span className="font-semibold text-gray-900 block truncate">{studentName}</span>
              <span className="text-[11px] font-mono text-gray-500">{rollNumber}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-500" />
                Department
              </span>
              <span className="font-semibold text-gray-900 block truncate">{department}</span>
              <span className="text-[11px] text-gray-500">PSG Tech</span>
            </div>
          </div>

          {/* Lending Dates Strip */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-blue-600 font-medium block flex items-center gap-1 mb-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Issue Date
              </span>
              <span className="font-semibold text-gray-900">{formattedIssueDate}</span>
            </div>

            <div>
              <span className="text-blue-700 font-medium block flex items-center gap-1 mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                Return Due Date
              </span>
              <span className="font-bold text-blue-900">{formattedDueDate}</span>
            </div>
          </div>

          {/* College Late Return Fine Policy Alert */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Library Overdue Fine Policy:</span>
              <span>
                Please return this volume on or before the due date. A late penalty fee of <span className="font-bold">₹5 per day</span> is automatically calculated for late returns.
              </span>
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming...' : 'Confirm Checkout & Issue'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


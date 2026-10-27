import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';

export default function ConfirmReturnModal({
  isOpen,
  onClose,
  onConfirm,
  returnDetails,
  isSubmitting = false,
}) {
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !returnDetails) return null;

  const {
    bookTitle,
    bookAuthor,
    studentName,
    rollNumber,
    department,
    issueDate,
    dueDate,
  } = returnDetails;

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays > 0;
  const overdueDays = isOverdue ? diffDays : 0;
  const fineRatePerDay = 5; // Standard PSG Library Fine: ₹5 per day
  const totalFine = overdueDays * fineRatePerDay;

  const handleConfirm = () => {
    onConfirm({
      fineAmount: totalFine,
      remarks: remarks.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isOverdue ? 'bg-gradient-to-r from-rose-600 to-amber-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Confirm Book Return</h2>
              <p className="text-xs text-white/80">PSG Circulation Desk • Check-in & Fine Verification</p>
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
          {/* Book & Borrower Summary */}
          <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/70 space-y-2">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Book to Check In
              </span>
              <h4 className="text-sm font-bold text-gray-900 leading-snug">{bookTitle}</h4>
              <p className="text-xs text-gray-500">{bookAuthor ? `by ${bookAuthor}` : ''}</p>
            </div>

            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Borrower: <span className="font-semibold text-gray-900">{studentName}</span>
              </span>
              <span className="font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                {rollNumber}
              </span>
            </div>
          </div>

          {/* Timeline & Due Date Comparison */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-500" />
                Issue Date
              </span>
              <span className="font-medium text-gray-800">
                {new Date(issueDate).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                Scheduled Due Date
              </span>
              <span className="font-medium text-gray-800">
                {new Date(dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Automated Fine Calculation Display */}
          {isOverdue ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Overdue Return Detected
                </span>
                <span className="text-xs font-bold text-rose-700">
                  {overdueDays} Day{overdueDays === 1 ? '' : 's'} Late
                </span>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-600 block">Calculated Fine Penalty:</span>
                  <span className="text-[11px] text-gray-400">
                    {overdueDays} days overdue × ₹{fineRatePerDay}/day
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-600 tracking-tight">
                    ₹{totalFine}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-rose-800">
                Notice: Please collect this fine amount at the library circulation desk or clear online.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    Returned On-Time
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Volume returned before deadline. Zero penalty fee.
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold text-emerald-700">₹0</span>
              </div>
            </div>
          )}

          {/* Remarks (Optional) */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
              Return Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={isOverdue ? 'e.g. Fine collected at counter' : 'e.g. Book checked in good condition'}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            />
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
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer ${
                isOverdue ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Processing Check-in...' : isOverdue ? `Confirm Return (Fine: ₹${totalFine})` : 'Confirm Return & Check-in'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

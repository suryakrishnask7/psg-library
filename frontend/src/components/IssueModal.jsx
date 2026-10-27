import React, { useState } from 'react';
import { X, ArrowUpRight, User, Hash, Building2, Calendar, BookOpen, AlertCircle } from 'lucide-react';

export default function IssueModal({
  isOpen,
  onClose,
  book,
  onConfirmIssue,
  isSubmitting = false,
}) {
  if (!isOpen || !book) return null;

  // Default due date: 14 days from now in YYYY-MM-DD
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    department: 'Computer Science',
    contactEmail: '',
    dueDate: defaultDue,
    remarks: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.studentName.trim()) errs.studentName = 'Student or Faculty name is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Roll number / ID is required';
    if (!formData.department.trim()) errs.department = 'Department is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onConfirmIssue({
      bookId: book._id,
      studentName: formData.studentName.trim(),
      rollNumber: formData.rollNumber.trim().toUpperCase(),
      department: formData.department.trim(),
      contactEmail: formData.contactEmail.trim(),
      dueDate: formData.dueDate,
      remarks: formData.remarks.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Issue Book to Member</h2>
              <p className="text-xs text-white/80">PSG Circulation Desk • 14-day standard lending</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book Summary Card */}
        <div className="p-4 bg-blue-50/60 border-b border-blue-100/70 flex items-start gap-3">
          <div
            className="w-3 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: book.coverColor || '#1a73e8' }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">{book.title}</h4>
            <p className="text-xs text-gray-600 truncate">by {book.author}</p>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
              <span className="font-mono">ISBN: {book.isbn}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">
                {book.availableCopies} of {book.totalCopies} copies in shelf
              </span>
            </div>
          </div>
        </div>

        {/* Issue Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Student / Faculty Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              placeholder="e.g. Priyadharshini M"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                errors.studentName
                  ? 'border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.studentName && <p className="text-xs text-red-500 mt-1">{errors.studentName}</p>}
          </div>

          {/* Roll Number & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                Roll No / ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                placeholder="23MX105"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 ${
                  errors.rollNumber
                    ? 'border-red-400 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {errors.rollNumber && <p className="text-xs text-red-500 mt-1">{errors.rollNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Due Date & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Return Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="student@psgtech.ac.in"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Librarian Remarks (Optional)
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Reference copy only for project work"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || book.availableCopies <= 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isSubmitting ? 'Issuing...' : 'Confirm Checkout'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

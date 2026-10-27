import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  book,
  isDeleting = false,
}) {
  if (!isOpen || !book) return null;

  const borrowedCount = book.totalCopies - book.availableCopies;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Delete Book from PSG Catalog?
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Are you sure you want to remove <span className="font-semibold text-gray-800">"{book.title}"</span>? This action cannot be undone.
          </p>

          {borrowedCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left mb-4">
              <span className="font-bold block mb-0.5">Active Borrowing Warning:</span>
              <span>
                {borrowedCount} {borrowedCount === 1 ? 'copy is' : 'copies are'} currently checked out to students. Deleting will force close these active loan records.
              </span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(borrowedCount > 0)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

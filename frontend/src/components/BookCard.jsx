import React from 'react';
import {
  MapPin,
  Barcode,
  Layers,
  Edit2,
  Trash2,
  BookOpen,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookmarkCheck,
} from 'lucide-react';

export default function BookCard({
  book,
  user,
  isBorrowedByMe = false,
  onView,
  onEdit,
  onDelete,
  onIssue,
  onSelfBorrow,
  onQuickReturn,
}) {
  const isLibrarian = user?.role === 'librarian';
  const isOutOfStock = book.availableCopies <= 0;
  const isLowStock = book.availableCopies > 0 && book.availableCopies <= 2;
  const borrowedCount = book.totalCopies - book.availableCopies;
  const percentage = book.totalCopies > 0
    ? Math.round((book.availableCopies / book.totalCopies) * 100)
    : 0;

  // Status badge config
  const statusConfig = isOutOfStock
    ? {
        label: 'Out of Stock',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      }
    : isLowStock
    ? {
        label: 'Low Stock',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertCircle,
      }
    : {
        label: `${book.availableCopies} Available`,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Banner with cover accent & department */}
      <div
        className="h-3 relative overflow-hidden"
        style={{ backgroundColor: book.coverColor || '#1a73e8' }}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Header: Department & Status Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold tracking-wide text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 truncate max-w-[160px]">
              {book.department}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.bg}`}
            >
              <StatusIcon className="w-3 h-3" />
              <span>{statusConfig.label}</span>
            </span>
          </div>

          {/* Title & Author */}
          <h3
            onClick={() => onView(book)}
            className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug mb-1"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1">
            by {book.author}
          </p>

          {/* Shelf Location & ISBN metadata chips */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 truncate" title={`Shelf: ${book.shelfLocation}`}>
              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="truncate font-medium">{book.shelfLocation || 'Main Stack'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate" title={`ISBN: ${book.isbn}`}>
              <Barcode className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-mono text-[11px]">{book.isbn}</span>
            </div>
          </div>
        </div>

        {/* Stock & Availability Meter */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              Live Availability
            </span>
            <span className="font-semibold text-gray-800">
              <span className={book.availableCopies > 0 ? 'text-blue-600' : 'text-rose-600'}>
                {book.availableCopies}
              </span>
              <span className="text-gray-400"> / {book.totalCopies} in shelf</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Card Action Buttons based on User Role */}
          {isLibrarian ? (
            /* Librarian Actions */
            <div className="flex items-center justify-between gap-1.5 pt-1">
              <button
                onClick={() => onIssue(book)}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-blue-50 disabled:hover:text-blue-700 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Issue</span>
              </button>

              {borrowedCount > 0 && (
                <button
                  onClick={() => onQuickReturn(book)}
                  title="Quick return an issued copy"
                  className="flex items-center justify-center py-1.5 px-2.5 rounded-xl text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 hover:border-emerald-200 border border-transparent transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => onView(book)}
                title="View book details & loan history"
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEdit(book)}
                title="Edit book record"
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(book)}
                title="Delete book record"
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Student & Faculty Self-Service Actions */
            <div className="flex items-center justify-between gap-2 pt-1">
              {isBorrowedByMe ? (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>In Your Bookshelf</span>
                </div>
              ) : (
                <button
                  onClick={() => onSelfBorrow(book)}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Borrow Book'}</span>
                </button>
              )}

              <button
                onClick={() => onView(book)}
                title="View syllabus & book details"
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

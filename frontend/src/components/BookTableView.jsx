import React from 'react';
import {
  MapPin,
  Barcode,
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

export default function BookTableView({
  books,
  user,
  myBorrowedBookIds = new Set(),
  onView,
  onEdit,
  onDelete,
  onIssue,
  onSelfBorrow,
  onQuickReturn,
}) {
  if (!books || books.length === 0) return null;

  const isLibrarian = user?.role === 'librarian';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Book Details</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Shelf & ISBN</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {books.map((book) => {
              const isOutOfStock = book.availableCopies <= 0;
              const isLowStock = book.availableCopies > 0 && book.availableCopies <= 2;
              const borrowed = book.totalCopies - book.availableCopies;
              const isBorrowedByMe = myBorrowedBookIds.has(book._id);

              return (
                <tr
                  key={book._id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Title & Author */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-2.5 h-10 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: book.coverColor || '#1a73e8' }}
                      />
                      <div>
                        <button
                          onClick={() => onView(book)}
                          className="font-semibold text-gray-900 group-hover:text-blue-600 text-left line-clamp-1 transition-colors"
                        >
                          {book.title}
                        </button>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {book.author} {book.edition && `• ${book.edition}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                      {book.department}
                    </span>
                  </td>

                  {/* Shelf & ISBN */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>{book.shelfLocation || 'Main Stack'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px] mt-0.5">
                      <Barcode className="w-3 h-3" />
                      <span>{book.isbn}</span>
                    </div>
                  </td>

                  {/* Stock Counts */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-gray-900">{book.availableCopies}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{book.totalCopies}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {borrowed > 0 ? `${borrowed} loaned` : 'none loaned'}
                    </p>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3" />
                        Low ({book.availableCopies})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Available
                      </span>
                    )}
                  </td>

                  {/* Action Buttons based on User Role */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {isLibrarian ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onIssue(book)}
                          disabled={isOutOfStock}
                          title="Issue copy to student"
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Issue
                        </button>

                        {borrowed > 0 && (
                          <button
                            onClick={() => onQuickReturn(book)}
                            title="Quick return copy"
                            className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onView(book)}
                          title="View Details"
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEdit(book)}
                          title="Edit Book"
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDelete(book)}
                          title="Delete Book"
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {isBorrowedByMe ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <BookmarkCheck className="w-3.5 h-3.5" /> In Bookshelf
                          </span>
                        ) : (
                          <button
                            onClick={() => onSelfBorrow(book)}
                            disabled={isOutOfStock}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isOutOfStock ? 'Depleted' : 'Borrow Book'}
                          </button>
                        )}

                        <button
                          onClick={() => onView(book)}
                          title="View Details"
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

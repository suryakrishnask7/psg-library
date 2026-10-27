import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import SearchBar from './components/SearchBar';
import BookCard from './components/BookCard';
import BookTableView from './components/BookTableView';
import BookModal from './components/BookModal';
import IssueModal from './components/IssueModal';
import BookDetailsModal from './components/BookDetailsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import CirculationDesk from './components/CirculationDesk';
import AnalyticsView from './components/AnalyticsView';
import Toast from './components/Toast';
import { bookAPI } from './services/api';
import { BookOpen, RefreshCw, Plus, Cloud, Database, Globe } from 'lucide-react';

export default function App() {
  // Navigation & Tab state
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'circulation' | 'analytics'

  // Books Data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issuingBook, setIssuingBook] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);

  // Loading flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Toast notification
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Library Statistics
  const loadStats = useCallback(async () => {
    try {
      const res = await bookAPI.getStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Fetch Books with current query parameters
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const [sortField, sortOrder] = sortBy.split('-');

      const params = {
        search: debouncedSearch.trim() || undefined,
        department: department !== 'All' ? department : undefined,
        status: status !== 'All' ? status : undefined,
        sortBy: sortField,
        order: sortOrder,
        limit: 50,
      };

      const res = await bookAPI.getAll(params);
      if (res.data.success) {
        setBooks(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      showToast('Unable to connect to PSG Library API server', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, department, status, sortBy]);

  // Initial load & when filters change
  useEffect(() => {
    fetchBooks();
    loadStats();
  }, [fetchBooks, loadStats]);

  // Add / Edit Book Submit
  const handleSaveBook = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingBook) {
        const res = await bookAPI.update(editingBook._id, formData);
        if (res.data.success) {
          showToast(`"${formData.title}" updated successfully!`, 'success');
        }
      } else {
        const res = await bookAPI.create(formData);
        if (res.data.success) {
          showToast(`"${formData.title}" catalogued in PSG Library!`, 'success');
        }
      }
      setIsBookModalOpen(false);
      setEditingBook(null);
      fetchBooks();
      loadStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving book details';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Book Submit
  const handleDeleteBook = async (force = false) => {
    if (!deletingBook) return;
    try {
      setIsDeleting(true);
      const res = await bookAPI.delete(deletingBook._id, force);
      if (res.data.success) {
        showToast(res.data.message || 'Book removed from catalog', 'success');
        setIsDeleteModalOpen(false);
        setDeletingBook(null);
        fetchBooks();
        loadStats();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete book';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Issue Book Submit
  const handleIssueBook = async (issueData) => {
    try {
      setIsSubmitting(true);
      const res = await bookAPI.issueBook(issueData);
      if (res.data.success) {
        showToast(res.data.message || 'Book issued successfully!', 'success');
        setIsIssueModalOpen(false);
        setIssuingBook(null);
        fetchBooks();
        loadStats();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to issue book';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Return directly from book card or table
  const handleQuickReturn = async (book) => {
    try {
      const res = await bookAPI.returnBookByBookId(book._id);
      if (res.data.success) {
        showToast(res.data.message || '1 copy returned to shelf', 'success');
        fetchBooks();
        loadStats();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'No active loans to return for this book';
      showToast(msg, 'error');
    }
  };

  // Seed / Reset Database Demo Action
  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      const res = await bookAPI.seedDatabase();
      if (res.data.success) {
        showToast('PSG Library reset & seeded with 20+ academic textbooks!', 'success');
        fetchBooks();
        loadStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Seeding failed', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#202124]">
      {/* Top App Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingBook(null);
          setIsBookModalOpen(true);
        }}
        onSeedData={handleSeedDatabase}
        isSeeding={isSeeding}
        stats={stats}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Catalog & Stock Management */}
        {activeTab === 'catalog' && (
          <div>
            {/* Real-time KPI Stats Overview */}
            <StatsOverview
              stats={stats}
              selectedDepartment={department}
              onSelectDepartment={setDepartment}
            />

            {/* Google-like Search, Filters & View Toggle */}
            <SearchBar
              search={search}
              setSearch={setSearch}
              department={department}
              setDepartment={setDepartment}
              status={status}
              setStatus={setStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalResults={books.length}
            />

            {/* Books Display */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-xs font-medium">Querying PSG Central Library Stacks...</span>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs max-w-md mx-auto my-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Books Found</h3>
                <p className="text-xs text-gray-500 mb-4">
                  No catalog items match your search or filter criteria. Try clearing filters or catalog a new book.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearch('');
                      setDepartment('All');
                      setStatus('All');
                    }}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => {
                      setEditingBook(null);
                      setIsBookModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Add Book
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {books.map((book) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    onView={(b) => {
                      setSelectedBook(b);
                      setIsDetailsModalOpen(true);
                    }}
                    onEdit={(b) => {
                      setEditingBook(b);
                      setIsBookModalOpen(true);
                    }}
                    onDelete={(b) => {
                      setDeletingBook(b);
                      setIsDeleteModalOpen(true);
                    }}
                    onIssue={(b) => {
                      setIssuingBook(b);
                      setIsIssueModalOpen(true);
                    }}
                    onQuickReturn={handleQuickReturn}
                  />
                ))}
              </div>
            ) : (
              <BookTableView
                books={books}
                onView={(b) => {
                  setSelectedBook(b);
                  setIsDetailsModalOpen(true);
                }}
                onEdit={(b) => {
                  setEditingBook(b);
                  setIsBookModalOpen(true);
                }}
                onDelete={(b) => {
                  setDeletingBook(b);
                  setIsDeleteModalOpen(true);
                }}
                onIssue={(b) => {
                  setIssuingBook(b);
                  setIsIssueModalOpen(true);
                }}
                onQuickReturn={handleQuickReturn}
              />
            )}
          </div>
        )}

        {/* Tab 2: Circulation & Lending Desk */}
        {activeTab === 'circulation' && (
          <CirculationDesk
            onLoanReturned={() => {
              fetchBooks();
              loadStats();
            }}
            onToast={showToast}
          />
        )}

        {/* Tab 3: Analytics & Visual Reports */}
        {activeTab === 'analytics' && <AnalyticsView stats={stats} />}
      </main>

      {/* Cloud Ready Deployment Footer Banner */}
      <footer className="border-t border-gray-200/80 bg-white py-6 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-gray-800">PSG Library System</span>
            <span>•</span>
            <span>Designed for PSG College of Technology</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              Backend: Render Ready
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
              <Globe className="w-3.5 h-3.5 text-black" />
              Frontend: Vercel Ready
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Database: MongoDB Atlas
            </span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Book Modal */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setEditingBook(null);
        }}
        onSubmit={handleSaveBook}
        initialData={editingBook}
        isSubmitting={isSubmitting}
      />

      {/* View Book Details Modal */}
      <BookDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        onEdit={(b) => {
          setEditingBook(b);
          setIsBookModalOpen(true);
        }}
        onDelete={(b) => {
          setDeletingBook(b);
          setIsDeleteModalOpen(true);
        }}
        onIssue={(b) => {
          setIssuingBook(b);
          setIsIssueModalOpen(true);
        }}
        onReturnComplete={() => {
          fetchBooks();
          loadStats();
          showToast('Book copy successfully checked back into stock!', 'success');
        }}
      />

      {/* Issue / Checkout Modal */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setIssuingBook(null);
        }}
        book={issuingBook}
        onConfirmIssue={handleIssueBook}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBook(null);
        }}
        onConfirm={handleDeleteBook}
        book={deletingBook}
        isDeleting={isDeleting}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}

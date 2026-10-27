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
import MyBookshelf from './components/MyBookshelf';
import LoginPage from './components/LoginPage';
import ConfirmIssueModal from './components/ConfirmIssueModal';
import Toast from './components/Toast';
import { bookAPI } from './services/api';
import { BookOpen, RefreshCw, Cloud, Database, Globe } from 'lucide-react';

export default function App() {
  // Authentication state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('psg_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation & Tab state
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'bookshelf' | 'circulation' | 'analytics'

  // Books Data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Student active borrowings tracking
  const [myBorrowedBookIds, setMyBorrowedBookIds] = useState(new Set());
  const [myLoansCount, setMyLoansCount] = useState(0);

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

  // Issue Confirmation Modal state (Confirmation before checkout)
  const [isConfirmIssueOpen, setIsConfirmIssueOpen] = useState(false);
  const [pendingIssueDetails, setPendingIssueDetails] = useState(null);
  const [pendingIssueBook, setPendingIssueBook] = useState(null);

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

  // Load user's borrowed books if logged in as student or faculty
  const loadMyLoans = useCallback(async () => {
    if (!user || user.role === 'librarian') return;
    try {
      const res = await bookAPI.getMyLoans(user.identifier);
      if (res.data.success) {
        const activeLoans = res.data.data.active || [];
        const ids = new Set(activeLoans.map((l) => (l.book?._id || l.book)));
        setMyBorrowedBookIds(ids);
        setMyLoansCount(activeLoans.length);
      }
    } catch (err) {
      console.error('Failed to load my loans:', err);
    }
  }, [user]);

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

  // Refresh books and stats when user or filters change
  useEffect(() => {
    if (user) {
      fetchBooks();
      loadStats();
      loadMyLoans();
    }
  }, [user, fetchBooks, loadStats, loadMyLoans]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('psg_token');
    localStorage.removeItem('psg_user');
    setUser(null);
    setActiveTab('catalog');
    showToast('Logged out successfully', 'info');
  };

  // Open Confirmation Modal before Issuing a Book
  const initiateSelfBorrow = (book) => {
    const loanDays = user?.role === 'faculty' ? 30 : 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDays);

    setPendingIssueBook(book);
    setPendingIssueDetails({
      bookTitle: book.title,
      bookAuthor: book.author,
      isbn: book.isbn,
      shelfLocation: book.shelfLocation,
      coverColor: book.coverColor,
      studentName: user?.name,
      rollNumber: user?.identifier,
      department: user?.department,
      issueDate: new Date(),
      dueDate,
    });
    setIsConfirmIssueOpen(true);
  };

  // Finalize Book Checkout after user confirmation
  const handleConfirmSelfBorrow = async () => {
    if (!pendingIssueBook) return;
    try {
      setIsSubmitting(true);
      const res = await bookAPI.selfIssueBook(pendingIssueBook._id);
      if (res.data.success) {
        setIsConfirmIssueOpen(false);
        setPendingIssueBook(null);
        setPendingIssueDetails(null);
        showToast(res.data.message || `"${pendingIssueBook.title}" added to your bookshelf!`, 'success');
        fetchBooks();
        loadStats();
        loadMyLoans();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not borrow book';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add / Edit Book Submit (Librarian)
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

  // Delete Book Submit (Librarian)
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

  // Manual Issue Book Submit (Librarian)
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

  // Seed / Reset Database Demo Action (Librarian)
  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      const res = await bookAPI.seedDatabase();
      if (res.data.success) {
        showToast('PSG Library reset & seeded with catalog & demo users!', 'success');
        fetchBooks();
        loadStats();
        loadMyLoans();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Seeding failed', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // If not logged in, show the sleek Login & Portal Switcher page
  if (!user) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            setActiveTab('catalog');
          }}
          onToast={showToast}
        />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      </>
    );
  }

  const isLibrarian = user.role === 'librarian';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#202124]">
      {/* Top App Bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingBook(null);
          setIsBookModalOpen(true);
        }}
        onSeedData={handleSeedDatabase}
        isSeeding={isSeeding}
        stats={stats}
        myLoansCount={myLoansCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Catalog & Live Stock (Available to both Students & Librarians) */}
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
                  No catalog items match your search or filter criteria. Try clearing filters.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setDepartment('All');
                    setStatus('All');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {books.map((book) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    user={user}
                    isBorrowedByMe={myBorrowedBookIds.has(book._id)}
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
                    onSelfBorrow={initiateSelfBorrow}
                  />
                ))}
              </div>
            ) : (
              <BookTableView
                books={books}
                user={user}
                myBorrowedBookIds={myBorrowedBookIds}
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
                onSelfBorrow={initiateSelfBorrow}
              />
            )}
          </div>
        )}

        {/* Tab 2: Student & Faculty "My Bookshelf" */}
        {activeTab === 'bookshelf' && !isLibrarian && (
          <MyBookshelf
            user={user}
            onReturnComplete={() => {
              fetchBooks();
              loadStats();
              loadMyLoans();
            }}
            onGoToCatalog={() => setActiveTab('catalog')}
            onToast={showToast}
          />
        )}

        {/* Tab 3: Librarian Circulation Desk */}
        {activeTab === 'circulation' && isLibrarian && (
          <CirculationDesk
            onLoanReturned={() => {
              fetchBooks();
              loadStats();
            }}
            onToast={showToast}
          />
        )}

        {/* Tab 4: Librarian Analytics */}
        {activeTab === 'analytics' && isLibrarian && <AnalyticsView stats={stats} />}
      </main>

      {/* Cloud Ready Deployment Footer Banner */}
      <footer className="border-t border-gray-200/80 bg-white py-6 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-gray-800">PSG Library System</span>
            <span>•</span>
            <span>{isLibrarian ? 'Librarian Administrative Mode' : `Logged in as ${user.name} (${user.identifier})`}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              Backend: Render
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
              <Globe className="w-3.5 h-3.5 text-black" />
              Frontend: Vercel
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              MongoDB Atlas
            </span>
          </div>
        </div>
      </footer>

      {/* Modals for Librarians */}
      {isLibrarian && (
        <>
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
        </>
      )}

      {/* View Book Details Modal (Role-Guarded) */}
      <BookDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        user={user}
        isBorrowedByMe={selectedBook ? myBorrowedBookIds.has(selectedBook._id) : false}
        onEdit={(b) => {
          if (isLibrarian) {
            setEditingBook(b);
            setIsBookModalOpen(true);
          }
        }}
        onDelete={(b) => {
          if (isLibrarian) {
            setDeletingBook(b);
            setIsDeleteModalOpen(true);
          }
        }}
        onIssue={(b) => {
          if (isLibrarian) {
            setIssuingBook(b);
            setIsIssueModalOpen(true);
          }
        }}
        onSelfBorrow={initiateSelfBorrow}
        onReturnComplete={() => {
          fetchBooks();
          loadStats();
          loadMyLoans();
          showToast('Book copy successfully checked back into stock!', 'success');
        }}
      />

      {/* Confirmation Modal before Issuing a Book */}
      <ConfirmIssueModal
        isOpen={isConfirmIssueOpen}
        onClose={() => {
          setIsConfirmIssueOpen(false);
          setPendingIssueBook(null);
          setPendingIssueDetails(null);
        }}
        onConfirm={handleConfirmSelfBorrow}
        issueDetails={pendingIssueDetails}
        isSubmitting={isSubmitting}
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

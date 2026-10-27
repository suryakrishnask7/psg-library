const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookStats,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { returnBookByBookId } = require('../controllers/issueController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

// Stats route should come before /:id
router.get('/stats', getBookStats);

// Catalog listing is public for all students & faculty to browse
router.route('/')
  .get(getBooks)
  .post(protect, authorize('librarian'), createBook); // Strictly Librarian only

// Book details: optionalAuth checks role to only return loans to librarians
router.route('/:id')
  .get(optionalAuth, getBookById)
  .put(protect, authorize('librarian'), updateBook)     // Strictly Librarian only
  .delete(protect, authorize('librarian'), deleteBook); // Strictly Librarian only

// Manual return by librarian
router.post('/:bookId/return', protect, authorize('librarian'), returnBookByBookId);

module.exports = router;

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

// Stats route should come before /:id
router.get('/stats', getBookStats);

router.route('/')
  .get(getBooks)
  .post(createBook);

router.route('/:id')
  .get(getBookById)
  .put(updateBook)
  .delete(deleteBook);

router.post('/:bookId/return', returnBookByBookId);

module.exports = router;

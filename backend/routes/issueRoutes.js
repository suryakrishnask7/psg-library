const express = require('express');
const router = express.Router();
const {
  getIssues,
  getMyLoans,
  selfIssueBook,
  selfReturnBook,
  createIssue,
  returnIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

// Student / Member self-service endpoints (protected)
router.get('/my-loans', protect, getMyLoans);
router.post('/self-issue', protect, selfIssueBook);
router.put('/:id/self-return', protect, selfReturnBook);

// General & Librarian issue management
router.route('/')
  .get(getIssues)
  .post(createIssue);

router.put('/:id/return', returnIssue);

module.exports = router;

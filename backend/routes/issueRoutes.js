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
const { protect, authorize } = require('../middleware/authMiddleware');

// Student & Faculty self-service endpoints (strictly restricted to their own account)
router.get('/my-loans', protect, getMyLoans);
router.post('/self-issue', protect, selfIssueBook);
router.put('/:id/self-return', protect, selfReturnBook);

// Campus-wide Circulation Ledger & Manual Operations (Strictly Librarian Only)
router.route('/')
  .get(protect, authorize('librarian'), getIssues)
  .post(protect, authorize('librarian'), createIssue);

router.put('/:id/return', protect, authorize('librarian'), returnIssue);

module.exports = router;

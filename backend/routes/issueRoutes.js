const express = require('express');
const router = express.Router();
const {
  getIssues,
  createIssue,
  returnIssue,
} = require('../controllers/issueController');

router.route('/')
  .get(getIssues)
  .post(createIssue);

router.put('/:id/return', returnIssue);

module.exports = router;

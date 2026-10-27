const IssueRecord = require('../models/IssueRecord');
const Book = require('../models/Book');

// Get all issue records
exports.getIssues = async (req, res) => {
  try {
    const { status, rollNumber, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (rollNumber) {
      query.rollNumber = new RegExp(rollNumber.trim(), 'i');
    }

    if (search && search.trim() !== '') {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [
        { studentName: reg },
        { rollNumber: reg },
        { bookTitle: reg },
        { bookIsbn: reg },
        { department: reg },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    // Check for overdue status dynamically
    const now = new Date();
    await IssueRecord.updateMany(
      { status: 'Issued', dueDate: { $lt: now } },
      { $set: { status: 'Overdue' } }
    );

    const total = await IssueRecord.countDocuments(query);
    const records = await IssueRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('book', 'title author department coverColor shelfLocation');

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('getIssues error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Issue a book to a student
exports.createIssue = async (req, res) => {
  try {
    const {
      bookId,
      studentName,
      rollNumber,
      department,
      contactEmail,
      contactPhone,
      dueDate,
      remarks,
    } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }
    if (!studentName || !rollNumber || !department) {
      return res.status(400).json({
        success: false,
        message: 'Student Name, Roll Number, and Department are required',
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: `"${book.title}" currently has 0 available copies in stock. All copies are issued.`,
      });
    }

    // Check if student already holds an unreturned copy of this exact book
    const existingLoan = await IssueRecord.findOne({
      book: book._id,
      rollNumber: rollNumber.trim().toUpperCase(),
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (existingLoan) {
      return res.status(400).json({
        success: false,
        message: `Student (${rollNumber.toUpperCase()}) already has an active issue of this book.`,
      });
    }

    // Decrement available copies
    book.availableCopies -= 1;
    await book.save();

    // Default due date: 14 days from now if not given
    const calculatedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const issueRecord = new IssueRecord({
      book: book._id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      studentName: studentName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department: department.trim(),
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      issueDate: new Date(),
      dueDate: calculatedDueDate,
      status: 'Issued',
      remarks: remarks || '',
    });

    await issueRecord.save();

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" successfully issued to ${studentName} (${rollNumber.toUpperCase()})`,
      data: issueRecord,
      bookAvailableCopies: book.availableCopies,
    });
  } catch (error) {
    console.error('createIssue error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Return an issued book
exports.returnIssue = async (req, res) => {
  try {
    const issue = await IssueRecord.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }

    if (issue.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book has already been returned' });
    }

    // Increment available copies on the book
    const book = await Book.findById(issue.book);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      await book.save();
    }

    issue.status = 'Returned';
    issue.returnDate = new Date();
    if (req.body.remarks) {
      issue.remarks = req.body.remarks;
    }
    await issue.save();

    res.json({
      success: true,
      message: `Book "${issue.bookTitle}" marked as returned by ${issue.studentName}`,
      data: issue,
      book,
    });
  } catch (error) {
    console.error('returnIssue error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Direct return from book ID (returns the oldest active issue for this book or for a given roll number)
exports.returnBookByBookId = async (req, res) => {
  try {
    const { rollNumber } = req.body;
    const query = {
      book: req.params.bookId,
      status: { $in: ['Issued', 'Overdue'] },
    };

    if (rollNumber) {
      query.rollNumber = rollNumber.trim().toUpperCase();
    }

    const issue = await IssueRecord.findOne(query).sort({ issueDate: 1 });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'No active issue record found for this book to return.',
      });
    }

    const book = await Book.findById(req.params.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      await book.save();
    }

    issue.status = 'Returned';
    issue.returnDate = new Date();
    await issue.save();

    res.json({
      success: true,
      message: `1 copy of "${issue.bookTitle}" returned successfully by ${issue.studentName}`,
      data: issue,
      book,
    });
  } catch (error) {
    console.error('returnBookByBookId error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

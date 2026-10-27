const IssueRecord = require('../models/IssueRecord');
const Book = require('../models/Book');

// Get all issue records (Librarian view)
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
      .populate('book', 'title author department coverColor shelfLocation totalCopies availableCopies');

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

// Get loans belonging to the currently logged in Student or Faculty member
exports.getMyLoans = async (req, res) => {
  try {
    const identifier = req.user ? req.user.identifier : req.query.rollNumber;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Member identifier is required' });
    }

    // Refresh overdue status
    const now = new Date();
    await IssueRecord.updateMany(
      { status: 'Issued', dueDate: { $lt: now } },
      { $set: { status: 'Overdue' } }
    );

    const loans = await IssueRecord.find({
      rollNumber: identifier.toUpperCase(),
    })
      .sort({ createdAt: -1 })
      .populate('book', 'title author department coverColor shelfLocation isbn');

    const activeLoans = loans.filter((l) => ['Issued', 'Overdue'].includes(l.status));
    const pastLoans = loans.filter((l) => l.status === 'Returned');

    res.json({
      success: true,
      data: {
        all: loans,
        active: activeLoans,
        history: pastLoans,
        activeCount: activeLoans.length,
      },
    });
  } catch (error) {
    console.error('getMyLoans error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Self-issue a book (Student / Faculty self-service checkout)
exports.selfIssueBook = async (req, res) => {
  try {
    const user = req.user;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: `"${book.title}" is currently out of stock. All ${book.totalCopies} copies are issued.`,
      });
    }

    // Check quota / max allowed books for this student/faculty
    const currentActiveLoans = await IssueRecord.countDocuments({
      rollNumber: user.identifier,
      status: { $in: ['Issued', 'Overdue'] },
    });

    const maxAllowed = user.maxBooksAllowed || 4;
    if (currentActiveLoans >= maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `You have reached your borrowing limit of ${maxAllowed} books. Please return a book before issuing a new one.`,
      });
    }

    // Check if user already holds a copy of this exact book
    const existingLoan = await IssueRecord.findOne({
      book: book._id,
      rollNumber: user.identifier,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (existingLoan) {
      return res.status(400).json({
        success: false,
        message: `You already have an active loan for "${book.title}". Each student can only check out one copy per title.`,
      });
    }

    // Decrement available copies
    book.availableCopies -= 1;
    await book.save();

    // Standard borrowing duration: 14 days for students, 30 days for faculty
    const loanDurationDays = user.role === 'faculty' ? 30 : 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDurationDays);

    const issueRecord = new IssueRecord({
      book: book._id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      studentName: user.name,
      rollNumber: user.identifier,
      department: user.department,
      contactEmail: user.email,
      contactPhone: user.phone || '',
      issueDate: new Date(),
      dueDate,
      status: 'Issued',
      remarks: 'Self-checkout via PSG Digital Portal',
    });

    await issueRecord.save();

    res.status(201).json({
      success: true,
      message: `"${book.title}" checked out successfully! Return due on ${dueDate.toLocaleDateString()}.`,
      data: issueRecord,
      bookAvailableCopies: book.availableCopies,
    });
  } catch (error) {
    console.error('selfIssueBook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Self-service return of a book by student/faculty
exports.selfReturnBook = async (req, res) => {
  try {
    const user = req.user;
    const issueId = req.params.id;

    const issue = await IssueRecord.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    // Only allow if this loan belongs to this member, or if user is librarian
    if (user.role !== 'librarian' && issue.rollNumber !== user.identifier) {
      return res.status(403).json({
        success: false,
        message: 'You can only return books checked out under your own ID',
      });
    }

    if (issue.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'This book has already been returned' });
    }

    // Restore book stock
    const book = await Book.findById(issue.book);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      await book.save();
    }

    const now = new Date();
    issue.status = 'Returned';
    issue.returnDate = now;

    // Automated Late Fine Calculation: ₹5/day overdue
    let fine = 0;
    let overdueDays = 0;
    if (now > new Date(issue.dueDate)) {
      const diffMs = now.getTime() - new Date(issue.dueDate).getTime();
      overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      fine = overdueDays * 5; // ₹5 per day
    }
    issue.fineAmount = req.body.fineAmount !== undefined ? Number(req.body.fineAmount) : fine;

    if (req.body.remarks) {
      issue.remarks = req.body.remarks;
    }
    await issue.save();

    const returnMsg = overdueDays > 0
      ? `"${issue.bookTitle}" returned! Overdue by ${overdueDays} day(s). Late fine: ₹${issue.fineAmount}`
      : `"${issue.bookTitle}" returned on schedule! Zero late fine.`;

    res.json({
      success: true,
      message: returnMsg,
      data: issue,
      fineAmount: issue.fineAmount,
      overdueDays,
    });
  } catch (error) {
    console.error('selfReturnBook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Issue a book to a student (Librarian manual issue)
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

    const cleanRoll = rollNumber.trim().toUpperCase();

    // Check if student already holds an unreturned copy of this exact book
    const existingLoan = await IssueRecord.findOne({
      book: book._id,
      rollNumber: cleanRoll,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (existingLoan) {
      return res.status(400).json({
        success: false,
        message: `Student (${cleanRoll}) already has an active issue of this book.`,
      });
    }

    // Decrement available copies
    book.availableCopies -= 1;
    await book.save();

    const calculatedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const issueRecord = new IssueRecord({
      book: book._id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      studentName: studentName.trim(),
      rollNumber: cleanRoll,
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
      message: `Book "${book.title}" successfully issued to ${studentName} (${cleanRoll})`,
      data: issueRecord,
      bookAvailableCopies: book.availableCopies,
    });
  } catch (error) {
    console.error('createIssue error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Return an issued book (Librarian manual return)
exports.returnIssue = async (req, res) => {
  try {
    const issue = await IssueRecord.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }

    if (issue.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book has already been returned' });
    }

    const book = await Book.findById(issue.book);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      await book.save();
    }

    const now = new Date();
    issue.status = 'Returned';
    issue.returnDate = now;

    // Automated Late Fine Calculation: ₹5/day overdue
    let fine = 0;
    let overdueDays = 0;
    if (now > new Date(issue.dueDate)) {
      const diffMs = now.getTime() - new Date(issue.dueDate).getTime();
      overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      fine = overdueDays * 5; // ₹5 per day
    }
    issue.fineAmount = req.body.fineAmount !== undefined ? Number(req.body.fineAmount) : fine;

    if (req.body.remarks) {
      issue.remarks = req.body.remarks;
    }
    await issue.save();

    const returnMsg = overdueDays > 0
      ? `"${issue.bookTitle}" returned by ${issue.studentName}! Overdue by ${overdueDays} day(s). Late fine: ₹${issue.fineAmount}`
      : `"${issue.bookTitle}" returned on schedule by ${issue.studentName}! Zero late fine.`;

    res.json({
      success: true,
      message: returnMsg,
      data: issue,
      book,
      fineAmount: issue.fineAmount,
      overdueDays,
    });
  } catch (error) {
    console.error('returnIssue error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Direct return from book ID
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

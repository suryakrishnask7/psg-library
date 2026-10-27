const Book = require('../models/Book');
const IssueRecord = require('../models/IssueRecord');

// Get all books with filter, search, sort, and pagination
exports.getBooks = async (req, res) => {
  try {
    const {
      search,
      department,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Search filter across title, author, isbn, shelfLocation
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex },
        { shelfLocation: searchRegex },
        { publisher: searchRegex },
      ];
    }

    // Department filter
    if (department && department !== 'All') {
      query.department = department;
    }

    // Status filter (Available, Low Stock, Out of Stock)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sort order
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('getBooks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Library Statistics for Overview Dashboard
exports.getBookStats = async (req, res) => {
  try {
    const totalTitles = await Book.countDocuments();
    
    // Aggregation for total copies and available copies
    const copyStats = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
        },
      },
    ]);

    const totalCopies = copyStats[0]?.totalCopies || 0;
    const availableCopies = copyStats[0]?.availableCopies || 0;
    const issuedCopies = Math.max(0, totalCopies - availableCopies);

    // Department breakdown
    const departmentBreakdown = await Book.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Status counts
    const availableCount = await Book.countDocuments({ status: 'Available' });
    const lowStockCount = await Book.countDocuments({ status: 'Low Stock' });
    const outOfStockCount = await Book.countDocuments({ status: 'Out of Stock' });

    // Active issue records count
    const activeLoans = await IssueRecord.countDocuments({ status: 'Issued' });
    const totalIssuedEver = await IssueRecord.countDocuments();

    // Recent activity (latest 5 issues)
    const recentActivity = await IssueRecord.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('book', 'title author department');

    res.json({
      success: true,
      stats: {
        totalTitles,
        totalCopies,
        availableCopies,
        issuedCopies,
        availableCount,
        lowStockCount,
        outOfStockCount,
        activeLoans,
        totalIssuedEver,
        departmentBreakdown,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('getBookStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single book by ID with loan history (strictly restricted to librarians)
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Confidential borrower records: ONLY librarians can view who holds this book
    let issues = [];
    if (req.user && req.user.role === 'librarian') {
      issues = await IssueRecord.find({ book: book._id })
        .sort({ createdAt: -1 })
        .limit(15);
    }

    res.json({
      success: true,
      data: book,
      issues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new book
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      department,
      totalCopies,
      availableCopies,
      shelfLocation,
      edition,
      publishedYear,
      publisher,
      description,
      coverColor,
      coverImage,
      tags,
    } = req.body;

    // Check if ISBN already exists
    const existing = await Book.findOne({ isbn: isbn.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Book with ISBN ${isbn} already exists (${existing.title})`,
      });
    }

    const parsedTotal = parseInt(totalCopies, 10) || 1;
    const parsedAvailable =
      availableCopies !== undefined && availableCopies !== null
        ? parseInt(availableCopies, 10)
        : parsedTotal;

    const book = new Book({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      department: department || 'Computer Science',
      totalCopies: parsedTotal,
      availableCopies: Math.min(parsedTotal, Math.max(0, parsedAvailable)),
      shelfLocation: shelfLocation || 'Bay A-01, Floor 2',
      edition: edition || '1st Edition',
      publishedYear: parseInt(publishedYear, 10) || new Date().getFullYear(),
      publisher: publisher || 'PSG Academic Press',
      description: description || '',
      coverColor: coverColor || '#1a73e8',
      coverImage: coverImage || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book record created successfully',
      data: book,
    });
  } catch (error) {
    console.error('createBook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update book details
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const {
      title,
      author,
      isbn,
      department,
      totalCopies,
      availableCopies,
      shelfLocation,
      edition,
      publishedYear,
      publisher,
      description,
      coverColor,
      coverImage,
      tags,
    } = req.body;

    // Check ISBN collision if changed
    if (isbn && isbn.trim() !== book.isbn) {
      const existing = await Book.findOne({ isbn: isbn.trim(), _id: { $ne: book._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another book already uses ISBN ${isbn}`,
        });
      }
      book.isbn = isbn.trim();
    }

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (department) book.department = department;
    if (shelfLocation !== undefined) book.shelfLocation = shelfLocation;
    if (edition !== undefined) book.edition = edition;
    if (publishedYear !== undefined) book.publishedYear = parseInt(publishedYear, 10);
    if (publisher !== undefined) book.publisher = publisher;
    if (description !== undefined) book.description = description;
    if (coverColor !== undefined) book.coverColor = coverColor;
    if (coverImage !== undefined) book.coverImage = coverImage;
    if (tags !== undefined) {
      book.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }

    // Total copies & available copies adjustment
    if (totalCopies !== undefined) {
      const newTotal = parseInt(totalCopies, 10);
      const currentlyBorrowed = book.totalCopies - book.availableCopies;
      
      if (newTotal < currentlyBorrowed) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total copies to ${newTotal}. Currently ${currentlyBorrowed} copies are actively issued to students.`,
        });
      }

      const diff = newTotal - book.totalCopies;
      book.totalCopies = newTotal;

      if (availableCopies !== undefined) {
        book.availableCopies = Math.min(newTotal, Math.max(0, parseInt(availableCopies, 10)));
      } else {
        book.availableCopies = Math.max(0, book.availableCopies + diff);
      }
    } else if (availableCopies !== undefined) {
      book.availableCopies = Math.min(book.totalCopies, Math.max(0, parseInt(availableCopies, 10)));
    }

    await book.save();

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book,
    });
  } catch (error) {
    console.error('updateBook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete book record
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if there are active loans
    const activeIssues = await IssueRecord.countDocuments({
      book: book._id,
      status: 'Issued',
    });

    const force = req.query.force === 'true';

    if (activeIssues > 0 && !force) {
      return res.status(400).json({
        success: false,
        hasActiveLoans: true,
        message: `Cannot delete "${book.title}". There are ${activeIssues} copies currently borrowed by students. Return all copies first or use force delete.`,
      });
    }

    // Clean up issue records if force deleted
    if (force) {
      await IssueRecord.deleteMany({ book: book._id });
    }

    await Book.findByIdAndDelete(book._id);

    res.json({
      success: true,
      message: `"${book.title}" was successfully deleted from catalog.`,
    });
  } catch (error) {
    console.error('deleteBook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


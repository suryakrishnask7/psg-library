const User = require('../models/User');
const IssueRecord = require('../models/IssueRecord');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Login user (Student, Faculty, or Librarian)
exports.login = async (req, res) => {
  try {
    const { identifier, password, portal } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ID/Roll Number/Email and Password',
      });
    }

    const cleanId = identifier.trim();

    // Query by identifier (case-insensitive) or email
    const user = await User.findOne({
      $or: [
        { identifier: cleanId.toUpperCase() },
        { email: cleanId.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Portal validation if requested
    if (portal === 'librarian' && user.role !== 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This portal is strictly for Library Staff & Librarians.',
      });
    }

    if (portal === 'student' && user.role === 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Librarian accounts should log in via the Librarian Portal.',
      });
    }

    const token = signToken(user._id);

    // Active loan count for this member
    const activeLoansCount = await IssueRecord.countDocuments({
      rollNumber: user.identifier,
      status: { $in: ['Issued', 'Overdue'] },
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        identifier: user.identifier,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        maxBooksAllowed: user.maxBooksAllowed,
        activeLoansCount,
      },
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register new member (Student / Faculty)
exports.register = async (req, res) => {
  try {
    const { name, identifier, email, password, role = 'student', department, phone } = req.body;

    if (!name || !identifier || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required registration fields',
      });
    }

    // Check existing
    const existing = await User.findOne({
      $or: [{ identifier: identifier.trim().toUpperCase() }, { email: email.trim().toLowerCase() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this ID/Roll Number or Email already exists',
      });
    }

    const maxBooks = role === 'faculty' ? 6 : role === 'librarian' ? 10 : 3;

    const user = new User({
      name: name.trim(),
      identifier: identifier.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      password,
      role: ['student', 'faculty'].includes(role) ? role : 'student',
      department: department.trim(),
      phone: phone || '',
      maxBooksAllowed: maxBooks,
    });

    await user.save();

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        identifier: user.identifier,
        email: user.email,
        role: user.role,
        department: user.department,
        maxBooksAllowed: user.maxBooksAllowed,
        activeLoansCount: 0,
      },
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    const activeLoans = await IssueRecord.countDocuments({
      rollNumber: user.identifier,
      status: { $in: ['Issued', 'Overdue'] },
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        identifier: user.identifier,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        maxBooksAllowed: user.maxBooksAllowed,
        activeLoansCount: activeLoans,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: seed default users and ensure librarian password is updated
exports.seedDefaultUsers = async () => {
  const defaultUsers = [
    {
      name: 'Dr. K. S. Meenakshi',
      identifier: 'LIB-PSG-01',
      email: 'librarian@psgtech.ac.in',
      password: '1234',
      role: 'librarian',
      department: 'Central Library',
      phone: '+91 94433 11223',
      maxBooksAllowed: 20,
    },
    {
      name: 'Aravind Swaminathan',
      identifier: '23MX105',
      email: 'aravind.s@psgtech.ac.in',
      password: 'student123',
      role: 'student',
      department: 'Computer Applications (MCA)',
      phone: '+91 98765 43210',
      maxBooksAllowed: 4,
    },
    {
      name: 'Kavitha Raman',
      identifier: '24CS101',
      email: 'kavitha.r@psgtech.ac.in',
      password: 'student123',
      role: 'student',
      department: 'Computer Science',
      phone: '+91 98451 23456',
      maxBooksAllowed: 4,
    },
    {
      name: 'Dr. S. Radhakrishnan',
      identifier: 'FAC-CSE-42',
      email: 'radhakrishnan@psgtech.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science',
      phone: '+91 94422 55667',
      maxBooksAllowed: 6,
    },
  ];

  for (const u of defaultUsers) {
    const existing = await User.findOne({
      $or: [{ email: u.email }, { identifier: u.identifier }],
    });

    if (existing) {
      if (u.role === 'librarian') {
        existing.password = '1234';
        await existing.save();
      }
    } else {
      const user = new User(u);
      await user.save();
    }
  }
  console.log('Seeded default PSG Library accounts. Librarian: librarian@psgtech.ac.in / 1234');
};


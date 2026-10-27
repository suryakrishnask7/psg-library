const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN / Accession Number is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department / Category is required'],
      enum: [
        'Computer Science',
        'Information Technology',
        'Electronics & Comm',
        'Mechanical Eng',
        'Civil Eng',
        'Electrical & Electronics',
        'Management Studies (MBA)',
        'Artificial Intelligence & Data Science',
        'Applied Science & Humanities',
        'General Reference'
      ],
      default: 'Computer Science',
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total number of copies is required'],
      min: [1, 'Must have at least 1 copy'],
      default: 5,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative'],
      default: 5,
    },
    shelfLocation: {
      type: String,
      default: 'Bay A-01, Floor 2',
      trim: true,
    },
    edition: {
      type: String,
      default: 'Latest Edition',
      trim: true,
    },
    publishedYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    publisher: {
      type: String,
      default: 'PSG Academic Press',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    coverColor: {
      type: String,
      default: '#1a73e8', // Google Material Blue
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Low Stock', 'Out of Stock'],
      default: 'Available',
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute status based on available copies
bookSchema.pre('save', function (next) {
  if (this.availableCopies <= 0) {
    this.status = 'Out of Stock';
    this.availableCopies = 0;
  } else if (this.availableCopies <= 2) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Available';
  }
  next();
});

// Also create text index for high-performance search across title, author, isbn, shelf
bookSchema.index({
  title: 'text',
  author: 'text',
  isbn: 'text',
  publisher: 'text',
  description: 'text',
});

module.exports = mongoose.model('Book', bookSchema);


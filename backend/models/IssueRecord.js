const mongoose = require('mongoose');

const issueRecordSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    bookTitle: {
      type: String,
      required: true,
    },
    bookIsbn: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student / Faculty name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll Number / Staff ID is required'],
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: [true, 'Student department is required'],
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setDate(d.getDate() + 14); // 14-day borrowing policy
        return d;
      },
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Issued', 'Returned', 'Overdue'],
      default: 'Issued',
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick queries
issueRecordSchema.index({ rollNumber: 1, status: 1 });
issueRecordSchema.index({ book: 1, status: 1 });

module.exports = mongoose.model('IssueRecord', issueRecordSchema);

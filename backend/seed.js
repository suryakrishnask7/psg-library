require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const IssueRecord = require('./models/IssueRecord');
const connectDB = require('./config/db');

const sampleBooks = [
  {
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    isbn: '978-0262033848',
    department: 'Computer Science',
    totalCopies: 12,
    availableCopies: 8,
    shelfLocation: 'Floor 2, Bay CS-01',
    edition: '4th Edition',
    publishedYear: 2022,
    publisher: 'MIT Press',
    description: 'The definitive textbook on modern algorithms covering sorting, graph algorithms, dynamic programming, and complexity theory.',
    coverColor: '#1a73e8',
    tags: ['Algorithms', 'Data Structures', 'Core CS'],
  },
  {
    title: 'Computer Networks: A Systems Approach',
    author: 'Larry L. Peterson, Bruce S. Davie',
    isbn: '978-0128182000',
    department: 'Computer Science',
    totalCopies: 8,
    availableCopies: 5,
    shelfLocation: 'Floor 2, Bay CS-04',
    edition: '6th Edition',
    publishedYear: 2021,
    publisher: 'Morgan Kaufmann',
    description: 'Explores the key principles of computer networking using the Internet as primary example, covering protocols, congestion control, and SDN.',
    coverColor: '#0284c7',
    tags: ['Networking', 'TCP/IP', 'Distributed Systems'],
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '978-0134610993',
    department: 'Artificial Intelligence & Data Science',
    totalCopies: 10,
    availableCopies: 6,
    shelfLocation: 'Floor 3, Bay AI-02',
    edition: '4th Global Edition',
    publishedYear: 2021,
    publisher: 'Pearson',
    description: 'The leading and most comprehensive foundation textbook in Artificial Intelligence, machine learning, search algorithms, and robotics.',
    coverColor: '#7c3aed',
    tags: ['AI', 'Machine Learning', 'Robotics'],
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    isbn: '978-0262035613',
    department: 'Artificial Intelligence & Data Science',
    totalCopies: 7,
    availableCopies: 2,
    shelfLocation: 'Floor 3, Bay AI-05',
    edition: '1st Edition',
    publishedYear: 2016,
    publisher: 'MIT Press',
    description: 'An authoritative introduction to deep learning mathematical foundations, convolutional networks, sequence models, and deep generative models.',
    coverColor: '#9333ea',
    tags: ['Deep Learning', 'Neural Networks', 'PyTorch'],
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    isbn: '978-0078022159',
    department: 'Information Technology',
    totalCopies: 10,
    availableCopies: 9,
    shelfLocation: 'Floor 2, Bay IT-03',
    edition: '7th Edition',
    publishedYear: 2020,
    publisher: 'McGraw-Hill Education',
    description: 'Fundamental concepts of database management, SQL, relational calculus, transaction processing, concurrency, and NoSQL architectures.',
    coverColor: '#059669',
    tags: ['Database', 'SQL', 'NoSQL', 'System Design'],
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    department: 'Information Technology',
    totalCopies: 6,
    availableCopies: 1,
    shelfLocation: 'Floor 2, Bay IT-08',
    edition: '1st Edition',
    publishedYear: 2017,
    publisher: "O'Reilly Media",
    description: 'The definitive guide to distributed systems, reliability, scalability, consistency models, and batch/stream processing architectures.',
    coverColor: '#ea580c',
    tags: ['Distributed Systems', 'Architecture', 'Big Data'],
  },
  {
    title: 'Microelectronic Circuits',
    author: 'Adel S. Sedra, Kenneth C. Smith, Tony Chan Carusone',
    isbn: '978-0190853464',
    department: 'Electronics & Comm',
    totalCopies: 8,
    availableCopies: 4,
    shelfLocation: 'Floor 1, Bay ECE-02',
    edition: '8th Edition',
    publishedYear: 2020,
    publisher: 'Oxford University Press',
    description: 'The standard reference for analog and digital electronic circuits, MOSFETs, BJTs, operational amplifiers, and IC design.',
    coverColor: '#0891b2',
    tags: ['Circuits', 'Analog Electronics', 'VLSI'],
  },
  {
    title: 'Digital Signal Processing: Principles, Algorithms & Apps',
    author: 'John G. Proakis, Dimitris G. Manolakis',
    isbn: '978-0131873742',
    department: 'Electronics & Comm',
    totalCopies: 9,
    availableCopies: 7,
    shelfLocation: 'Floor 1, Bay ECE-06',
    edition: '4th Edition',
    publishedYear: 2018,
    publisher: 'Pearson',
    description: 'Comprehensive treatment of discrete-time signals, Z-transform, DFT/FFT, digital filter design, and spectrum estimation.',
    coverColor: '#2563eb',
    tags: ['DSP', 'Signals', 'Communications'],
  },
  {
    title: 'Shigley’s Mechanical Engineering Design',
    author: 'Richard G. Budynas, J. Keith Nisbett',
    isbn: '978-0073398204',
    department: 'Mechanical Eng',
    totalCopies: 10,
    availableCopies: 5,
    shelfLocation: 'Floor 1, Bay MECH-01',
    edition: '11th Edition',
    publishedYear: 2020,
    publisher: 'McGraw-Hill',
    description: 'Industry-standard textbook on failure prevention, mechanical components, shafts, gears, bearings, fasteners, and finite element modeling.',
    coverColor: '#d97706',
    tags: ['Machine Design', 'Mechanics', 'CAD'],
  },
  {
    title: 'Thermodynamics: An Engineering Approach',
    author: 'Yunus A. Çengel, Michael A. Boles, Mehmet Kanoğlu',
    isbn: '978-1259822674',
    department: 'Mechanical Eng',
    totalCopies: 12,
    availableCopies: 10,
    shelfLocation: 'Floor 1, Bay MECH-05',
    edition: '9th Edition',
    publishedYear: 2019,
    publisher: 'McGraw-Hill Education',
    description: 'Covers energy transfer, First and Second Laws of Thermodynamics, entropy, power cycles, and refrigeration systems.',
    coverColor: '#dc2626',
    tags: ['Thermal', 'Energy', 'Thermodynamics'],
  },
  {
    title: 'Design of Reinforced Concrete Structures',
    author: 'N. Subramanian',
    isbn: '978-0198086949',
    department: 'Civil Eng',
    totalCopies: 8,
    availableCopies: 6,
    shelfLocation: 'Floor 1, Bay CIVIL-02',
    edition: '2nd Edition',
    publishedYear: 2018,
    publisher: 'Oxford University Press',
    description: 'Complies with Indian Standard IS 456:2000, covering limit state design of beams, slabs, columns, footings, and earthquake resistance.',
    coverColor: '#475569',
    tags: ['Civil', 'Structures', 'Concrete', 'IS 456'],
  },
  {
    title: 'Electric Machinery Fundamentals',
    author: 'Stephen J. Chapman',
    isbn: '978-0073529547',
    department: 'Electrical & Electronics',
    totalCopies: 7,
    availableCopies: 4,
    shelfLocation: 'Floor 1, Bay EEE-03',
    edition: '5th Edition',
    publishedYear: 2019,
    publisher: 'McGraw-Hill',
    description: 'Explains AC and DC motors, generators, transformers, power electronics interfacing, and induction machine dynamics.',
    coverColor: '#ca8a04',
    tags: ['Electrical', 'Motors', 'Power Systems'],
  },
  {
    title: 'Marketing Management',
    author: 'Philip Kotler, Kevin Lane Keller, Alexander Chernev',
    isbn: '978-0135887158',
    department: 'Management Studies (MBA)',
    totalCopies: 9,
    availableCopies: 8,
    shelfLocation: 'Floor 3, Bay MBA-01',
    edition: '16th Edition',
    publishedYear: 2022,
    publisher: 'Pearson',
    description: 'The benchmark corporate text on strategic marketing, consumer behavior analysis, brand positioning, and digital omni-channel campaigns.',
    coverColor: '#16a34a',
    tags: ['MBA', 'Marketing', 'Business Strategy'],
  },
  {
    title: 'Financial Management: Theory and Practice',
    author: 'Prasanna Chandra',
    isbn: '978-9353166526',
    department: 'Management Studies (MBA)',
    totalCopies: 8,
    availableCopies: 5,
    shelfLocation: 'Floor 3, Bay MBA-04',
    edition: '10th Edition',
    publishedYear: 2019,
    publisher: 'McGraw-Hill',
    description: 'In-depth coverage of corporate finance, capital budgeting, cost of capital, dividend policy, working capital management, and valuation.',
    coverColor: '#0d9488',
    tags: ['Finance', 'Capital Budgeting', 'Corporate Valuation'],
  },
  {
    title: 'Higher Engineering Mathematics',
    author: 'B.S. Grewal',
    isbn: '978-8193328491',
    department: 'Applied Science & Humanities',
    totalCopies: 15,
    availableCopies: 11,
    shelfLocation: 'Floor 2, Bay ASH-01',
    edition: '44th Edition',
    publishedYear: 2021,
    publisher: 'Khanna Publishers',
    description: 'Comprehensive guide covering differential calculus, linear algebra, vector calculus, Fourier series, transforms, and numerical methods.',
    coverColor: '#4f46e5',
    tags: ['Mathematics', 'Calculus', 'Linear Algebra'],
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin (Uncle Bob)',
    isbn: '978-0132350884',
    department: 'Computer Science',
    totalCopies: 6,
    availableCopies: 0, // Set to 0 to demonstrate "Out of Stock" status
    shelfLocation: 'Floor 2, Bay CS-07',
    edition: '1st Edition',
    publishedYear: 2008,
    publisher: 'Prentice Hall',
    description: 'Principles, patterns, and practices of writing readable, maintainable, and clean code with meaningful naming, small functions, and TDD.',
    coverColor: '#e11d48',
    tags: ['Software Engineering', 'Refactoring', 'Agile'],
  },
  {
    title: 'Operating System Concepts (Dinosaur Book)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    isbn: '978-1119800361',
    department: 'Computer Science',
    totalCopies: 11,
    availableCopies: 7,
    shelfLocation: 'Floor 2, Bay CS-02',
    edition: '10th Edition',
    publishedYear: 2021,
    publisher: 'Wiley',
    description: 'Classic text on operating systems principles: process management, threads, memory paging, file systems, synchronization, and virtualization.',
    coverColor: '#0284c7',
    tags: ['Operating Systems', 'Kernels', 'Linux'],
  },
  {
    title: 'Modern Control Engineering',
    author: 'Katsuhiko Ogata',
    isbn: '978-0136156734',
    department: 'Electrical & Electronics',
    totalCopies: 6,
    availableCopies: 3,
    shelfLocation: 'Floor 1, Bay EEE-07',
    edition: '5th Edition',
    publishedYear: 2017,
    publisher: 'Pearson',
    description: 'Analysis and design of control systems, root locus, frequency response, state-space representations, and PID controller tuning.',
    coverColor: '#059669',
    tags: ['Control Systems', 'State Space', 'Automation'],
  },
  {
    title: 'Pattern Recognition and Machine Learning',
    author: 'Christopher M. Bishop',
    isbn: '978-0387310732',
    department: 'Artificial Intelligence & Data Science',
    totalCopies: 5,
    availableCopies: 2,
    shelfLocation: 'Floor 3, Bay AI-03',
    edition: '1st Edition',
    publishedYear: 2016,
    publisher: 'Springer',
    description: 'Rigorous Bayesian treatment of machine learning algorithms, Gaussian processes, graphical models, and variational inference.',
    coverColor: '#6366f1',
    tags: ['Machine Learning', 'Bayesian', 'Pattern Recognition'],
  },
  {
    title: 'PSG Design Data Book (Engineers Data Book)',
    author: 'Faculty of Mechanical Engineering, PSG Tech',
    isbn: '978-8192735504',
    department: 'Mechanical Eng',
    totalCopies: 20,
    availableCopies: 16,
    shelfLocation: 'Floor 1, Bay PSG-REF-01',
    edition: 'Revised Edition 2023',
    publisher: 'Kalaikathir Achchagam (PSG Tech)',
    description: 'The legendary PSG Tech Design Data Hand Book used across Indian engineering universities for design of machine elements, bearings, shafts, and gears.',
    coverColor: '#1a73e8',
    tags: ['PSG Tech', 'Machine Design', 'Engineering Reference'],
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Clearing existing collections for fresh seed...');
    await Book.deleteMany({});
    await IssueRecord.deleteMany({});

    console.log(`Inserting ${sampleBooks.length} academic books...`);
    const insertedBooks = await Book.insertMany(sampleBooks);
    console.log(`Inserted ${insertedBooks.length} books successfully!`);

    // Create realistic issue records for some of the books
    const clrs = insertedBooks.find(b => b.isbn === '978-0262033848');
    const aiBook = insertedBooks.find(b => b.isbn === '978-0134610993');
    const cleanCode = insertedBooks.find(b => b.isbn === '978-0132350884');
    const ddia = insertedBooks.find(b => b.isbn === '978-1449373320');
    const shigley = insertedBooks.find(b => b.isbn === '978-0073398204');

    const issues = [];

    if (clrs) {
      issues.push({
        book: clrs._id,
        bookTitle: clrs.title,
        bookIsbn: clrs.isbn,
        studentName: 'Aravind Swaminathan',
        rollNumber: '23MX105',
        department: 'Computer Applications (MCA)',
        contactEmail: 'aravind.s@psgtech.ac.in',
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: 'Issued',
      });
      issues.push({
        book: clrs._id,
        bookTitle: clrs.title,
        bookIsbn: clrs.isbn,
        studentName: 'Pooja Venkatesh',
        rollNumber: '22CS089',
        department: 'Computer Science',
        contactEmail: 'pooja.v@psgtech.ac.in',
        issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        status: 'Overdue',
        remarks: '1st reminder notice sent via email',
      });
    }

    if (aiBook) {
      issues.push({
        book: aiBook._id,
        bookTitle: aiBook.title,
        bookIsbn: aiBook.isbn,
        studentName: 'Sanjay Kumar',
        rollNumber: '24AI024',
        department: 'Artificial Intelligence & Data Science',
        contactEmail: 'sanjay.k@psgtech.ac.in',
        issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        status: 'Issued',
      });
    }

    if (cleanCode) {
      issues.push({
        book: cleanCode._id,
        bookTitle: cleanCode.title,
        bookIsbn: cleanCode.isbn,
        studentName: 'Karthik Raja',
        rollNumber: '21IT054',
        department: 'Information Technology',
        contactEmail: 'karthik.r@psgtech.ac.in',
        issueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        status: 'Returned',
      });
    }

    if (ddia) {
      issues.push({
        book: ddia._id,
        bookTitle: ddia.title,
        bookIsbn: ddia.isbn,
        studentName: 'Divya Dharshini',
        rollNumber: '23IT012',
        department: 'Information Technology',
        contactEmail: 'divya.d@psgtech.ac.in',
        issueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'Issued',
      });
    }

    if (shigley) {
      issues.push({
        book: shigley._id,
        bookTitle: shigley.title,
        bookIsbn: shigley.isbn,
        studentName: 'Vigneshwaran M',
        rollNumber: '22ME078',
        department: 'Mechanical Eng',
        contactEmail: 'vignesh.m@psgtech.ac.in',
        issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: 'Issued',
      });
    }

    if (issues.length > 0) {
      await IssueRecord.insertMany(issues);
      console.log(`Inserted ${issues.length} initial issue loan records.`);
    }

    console.log('Seeding completed successfully!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

module.exports = seedDB;

if (require.main === module) {
  seedDB();
}


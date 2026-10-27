require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const IssueRecord = require('./models/IssueRecord');
const User = require('./models/User');
const connectDB = require('./config/db');

// Exactly 10 classic titles with 5 copies each = 50 Total Books in Library
// Exactly 40 Borrowed, 10 Available
const sampleBooks = [
  {
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald Rivest',
    isbn: '978-0262033848',
    department: 'Computer Science',
    totalCopies: 5,
    availableCopies: 1, // 4 borrowed
    status: 'Low Stock',
    shelfLocation: 'Floor 2, Bay CS-01',
    edition: '4th Edition',
    publishedYear: 2022,
    publisher: 'MIT Press',
    description: 'The definitive textbook on algorithms covering sorting, graph theory, and dynamic programming.',
    coverColor: '#1a73e8',
    tags: ['Algorithms', 'Data Structures'],
  },
  {
    title: 'Operating System Concepts (Dinosaur Book)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    isbn: '978-1119800361',
    department: 'Computer Science',
    totalCopies: 5,
    availableCopies: 1, // 4 borrowed
    status: 'Low Stock',
    shelfLocation: 'Floor 2, Bay CS-02',
    edition: '10th Edition',
    publishedYear: 2021,
    publisher: 'Wiley',
    description: 'Classic text on operating systems principles: process management, paging, file systems, and kernels.',
    coverColor: '#0284c7',
    tags: ['OS', 'Kernels', 'Linux'],
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    isbn: '978-0078022159',
    department: 'Information Technology',
    totalCopies: 5,
    availableCopies: 1, // 4 borrowed
    status: 'Low Stock',
    shelfLocation: 'Floor 2, Bay IT-03',
    edition: '7th Edition',
    publishedYear: 2020,
    publisher: 'McGraw-Hill Education',
    description: 'Fundamental concepts of relational database management, SQL, indexing, and NoSQL systems.',
    coverColor: '#059669',
    tags: ['Database', 'SQL', 'DBMS'],
  },
  {
    title: 'Computer Networks: A Systems Approach',
    author: 'Larry L. Peterson, Bruce S. Davie',
    isbn: '978-0128182000',
    department: 'Computer Science',
    totalCopies: 5,
    availableCopies: 1, // 4 borrowed
    status: 'Low Stock',
    shelfLocation: 'Floor 2, Bay CS-04',
    edition: '6th Edition',
    publishedYear: 2021,
    publisher: 'Morgan Kaufmann',
    description: 'Core principles of computer networking, internet protocols, routing, and cloud infrastructure.',
    coverColor: '#0891b2',
    tags: ['Networking', 'TCP/IP'],
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '978-0134610993',
    department: 'Artificial Intelligence & Data Science',
    totalCopies: 5,
    availableCopies: 0, // 5 borrowed (Out of stock)
    status: 'Out of Stock',
    shelfLocation: 'Floor 3, Bay AI-02',
    edition: '4th Edition',
    publishedYear: 2021,
    publisher: 'Pearson',
    description: 'The global standard textbook in artificial intelligence, search agents, and machine learning.',
    coverColor: '#7c3aed',
    tags: ['AI', 'Search', 'Agents'],
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    isbn: '978-0262035613',
    department: 'Artificial Intelligence & Data Science',
    totalCopies: 5,
    availableCopies: 0, // 5 borrowed (Out of stock)
    status: 'Out of Stock',
    shelfLocation: 'Floor 3, Bay AI-05',
    edition: '1st Edition',
    publishedYear: 2016,
    publisher: 'MIT Press',
    description: 'Authoritative mathematical foundations of deep neural networks, CNNs, and generative models.',
    coverColor: '#9333ea',
    tags: ['Deep Learning', 'Neural Networks'],
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin (Uncle Bob)',
    isbn: '978-0132350884',
    department: 'Information Technology',
    totalCopies: 5,
    availableCopies: 0, // 5 borrowed (Out of stock)
    status: 'Out of Stock',
    shelfLocation: 'Floor 2, Bay IT-07',
    edition: '1st Edition',
    publishedYear: 2008,
    publisher: 'Prentice Hall',
    description: 'Software craftsmanship, unit testing, refactoring patterns, and maintainable software architecture.',
    coverColor: '#dc2626',
    tags: ['Clean Code', 'Software Engineering'],
  },
  {
    title: 'Microelectronic Circuits',
    author: 'Adel S. Sedra, Kenneth C. Smith',
    isbn: '978-0190853464',
    department: 'Electronics & Comm',
    totalCopies: 5,
    availableCopies: 2, // 3 borrowed
    status: 'Low Stock',
    shelfLocation: 'Floor 1, Bay ECE-02',
    edition: '8th Edition',
    publishedYear: 2020,
    publisher: 'Oxford University Press',
    description: 'The standard reference for analog circuits, MOSFET amplifiers, and digital IC design.',
    coverColor: '#d97706',
    tags: ['Circuits', 'Electronics'],
  },
  {
    title: 'Shigley’s Mechanical Engineering Design',
    author: 'Richard G. Budynas, J. Keith Nisbett',
    isbn: '978-0073398204',
    department: 'Mechanical Eng',
    totalCopies: 5,
    availableCopies: 2, // 3 borrowed
    status: 'Low Stock',
    shelfLocation: 'Floor 1, Bay MECH-01',
    edition: '11th Edition',
    publishedYear: 2020,
    publisher: 'McGraw-Hill',
    description: 'Engineering components, machine elements, fatigue failure, shafts, bearings, and gears.',
    coverColor: '#ea580c',
    tags: ['Machine Design', 'Mechanical'],
  },
  {
    title: 'PSG Design Data Book (Engineers Data Book)',
    author: 'Faculty of Mechanical Engineering, PSG Tech',
    isbn: '978-8192735504',
    department: 'Mechanical Eng',
    totalCopies: 5,
    availableCopies: 2, // 3 borrowed
    status: 'Low Stock',
    shelfLocation: 'Floor 1, Bay PSG-REF-01',
    edition: 'Revised 2023',
    publisher: 'Kalaikathir Achchagam (PSG Tech)',
    description: 'The legendary PSG Tech engineering handbook used across Indian universities for machine elements.',
    coverColor: '#2563eb',
    tags: ['PSG Tech', 'Reference', 'Design Data'],
  },
];

// Student borrower names and roll numbers for 40 active loans
const studentPool = [
  { name: 'Aravind Swaminathan', roll: '23MX105', dept: 'Computer Applications (MCA)' },
  { name: 'Kavitha Raman', roll: '24CS101', dept: 'Computer Science' },
  { name: 'Sanjay Kumar', roll: '24AI024', dept: 'Artificial Intelligence & Data Science' },
  { name: 'Pooja Venkatesh', roll: '22CS089', dept: 'Computer Science' },
  { name: 'Vigneshwaran M', roll: '22ME078', dept: 'Mechanical Eng' },
  { name: 'Divya Dharshini', roll: '23IT012', dept: 'Information Technology' },
  { name: 'Karthik Raja', roll: '21IT054', dept: 'Information Technology' },
  { name: 'Dr. S. Radhakrishnan', roll: 'FAC-CSE-42', dept: 'Computer Science' },
  { name: 'Ananya S', roll: '24CS112', dept: 'Computer Science' },
  { name: 'Manoj Prabhakar', roll: '23EC045', dept: 'Electronics & Comm' },
  { name: 'Sneha R', roll: '24AI055', dept: 'Artificial Intelligence & Data Science' },
  { name: 'Gowtham N', roll: '22ME034', dept: 'Mechanical Eng' },
  { name: 'Harish Babu', roll: '23MX118', dept: 'Computer Applications (MCA)' },
  { name: 'Deepika M', roll: '24CS145', dept: 'Computer Science' },
  { name: 'Naveen Kumar', roll: '23EC089', dept: 'Electronics & Comm' },
  { name: 'Pavithra T', roll: '23IT038', dept: 'Information Technology' },
  { name: 'Rohit Balaji', roll: '24AI018', dept: 'Artificial Intelligence & Data Science' },
  { name: 'Sowmya G', roll: '22CS067', dept: 'Computer Science' },
  { name: 'Vijay Anand', roll: '23ME091', dept: 'Mechanical Eng' },
  { name: 'Abinaya K', roll: '24MX104', dept: 'Computer Applications (MCA)' },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Clearing existing collections...');
    await Book.deleteMany({});
    await IssueRecord.deleteMany({});

    console.log(`Inserting 10 academic titles (5 copies each = 50 total books)...`);
    const insertedBooks = await Book.insertMany(sampleBooks);

    // Number of borrowed copies for each book (Total = 40 borrowed)
    // CLRS: 4
    // OS: 4
    // DBMS: 4
    // Networks: 4
    // AI: 5
    // Deep Learning: 5
    // Clean Code: 5
    // Microelectronic: 3
    // Shigley: 3
    // PSG Data Book: 3
    // Sum = 4 + 4 + 4 + 4 + 5 + 5 + 5 + 3 + 3 + 3 = 40 borrowed!

    const borrowCounts = [4, 4, 4, 4, 5, 5, 5, 3, 3, 3];
    const issues = [];
    let studentIndex = 0;

    insertedBooks.forEach((book, bIdx) => {
      const needed = borrowCounts[bIdx];
      for (let i = 0; i < needed; i++) {
        const student = studentPool[studentIndex % studentPool.length];
        studentIndex++;

        // Randomize issue dates between 2 to 18 days ago
        const daysAgo = (i * 3 + bIdx * 2) % 18 + 2;
        const issueDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        // Due date is 14 days after issue
        const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        const isOverdue = dueDate < new Date();

        issues.push({
          book: book._id,
          bookTitle: book.title,
          bookIsbn: book.isbn,
          studentName: student.name,
          rollNumber: student.roll,
          department: student.dept,
          contactEmail: `${student.roll.toLowerCase()}@psgtech.ac.in`,
          contactPhone: '+91 98450 ' + (10000 + issues.length),
          issueDate,
          dueDate,
          returnDate: null,
          status: isOverdue ? 'Overdue' : 'Issued',
          remarks: isOverdue ? 'Automated overdue reminder sent' : '',
        });
      }
    });

    console.log(`Creating exactly ${issues.length} active issue records (40 borrowed)...`);
    await IssueRecord.insertMany(issues);

    console.log('==============================================');
    console.log(`✅ Seed Successful!`);
    console.log(`📚 Total Books: 50`);
    console.log(`📖 Currently Borrowed: ${issues.length}`);
    console.log(`🟢 Available in Stacks: 10`);
    console.log('==============================================');

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

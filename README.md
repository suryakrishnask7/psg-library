# 📚 PSG Library — College Library Management System

A full-stack **MERN (MongoDB, Express, React, Node.js)** College Library Management System built for **PSG College of Technology / PSG Institutions**. Designed with **Google Material Design 3 (M3)** minimalistic elegance, subtle elevation, rounded containers, and instant live inventory tracking.

Ready for production deployment across:
- **Backend**: [Render](https://render.com)
- **Frontend**: [Vercel](https://vercel.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 🔐 Portals & Role-Based Access Control

PSG Library provides two distinct, purpose-built portals with Google Material 3 minimalist elegance:

### 1. 🎓 Student & Faculty Portal
- **Browse & Availability**: Search the catalog by title, author, ISBN, shelf location, or department.
- **Real-Time Availability**: Check physical copies in stacks before walking to the library.
- **Self-Checkout / Self-Issue**: Students and faculty can issue books directly to their account with 1-click.
- **My Bookshelf (Digital Lending Wallet)**:
  - View currently borrowed books.
  - Return countdown timer (e.g. *"Due in 9 days"*, *"Due Today"*, or *"Overdue"*).
  - Self-service **"Return Book"** button to immediately check copies back into library inventory.
  - Complete borrowing history ledger.

### 2. 🗝️ Librarian Administrative Portal
- **Catalog Management**: Add, update, and delete physical book records.
- **Stock Control**: Adjust total physical copies, shelf locations, and categories.
- **Circulation Desk**: Campus-wide ledger of all student loans, filterable by *Issued*, *Overdue*, and *Returned*.
- **Institutional Analytics**: Departmental allocations, stock health, and circulation metrics.

---

## 👥 Demo Login Credentials (Ready to Test)

The system is pre-seeded with ready-to-test accounts. You can use the **1-Click Demo Fillers** on the login page or enter:

| Role | Portal | Identifier / Roll No | Password | Notes |
|---|---|---|---|---|
| **Head Librarian** | Librarian Portal | `LIB-PSG-01` | `admin123` | Full admin privileges |
| **Student** | Student Portal | `23MX105` | `student123` | Aravind (MCA, 4 books limit) |
| **Student** | Student Portal | `24CS101` | `student123` | Kavitha (CSE, 4 books limit) |
| **Faculty** | Student Portal | `FAC-CSE-42` | `faculty123` | Dr. Radhakrishnan (CSE, 6 books limit) |

*(New students and faculty can also register directly using the "Register an account" option).*

---

### 1. 📖 Book Records & Catalog Management (Librarian CRUD)
- **Add Book**: Record Title, Author, ISBN / Accession Number, Department, Shelf Location, Edition, Year, Publisher, Cover Accent Color, and Inventory Copies.
- **View Details**: Full-screen modal with shelf location pin, circulation history, and active borrowers.
- **Update Details**: Dynamic stock adjustment (automatically calculates available copies based on active student loans).
- **Delete Book**: Guarded deletion with warnings if physical copies are currently checked out to students.

### 2. ⚡ Live Stock & Availability Tracking
- Real-time stock counters (`Total Copies`, `Available in Stacks`, `Currently Borrowed`).
- Automatic status badges:
  - 🟢 **Available** (> 2 copies in stack)
  - 🟡 **Low Stock** (1–2 copies remaining)
  - 🔴 **Out of Stock** (0 copies available)
- Stock availability progress bars on every book card.

### 3. 🔄 Circulation & Lending Desk
- **Checkout / Issue Book**: Issue physical volumes to students and faculty members with Roll Number, Department, Contact Email, and 14-day automatic return due date.
- **One-Click Return**: Check books back into stack from either the Circulation Ledger, Book Details Modal, or Book Card.
- **Overdue Monitoring**: Dynamic overdue alerts and reminder indicators.

### 4. 🔍 Google-Style Search & Filtering
- Prominent rounded search bar with instant debounce across title, author, ISBN, shelf location, and publisher.
- Department filter chips: *Computer Science, IT, AI & Data Science, ECE, Mechanical, Electrical, Civil, MBA, Applied Sciences*.
- View Switchers: **Card Grid View** (visual covers with stock meters) and **Librarian Table View** (dense, efficient tabular layout).

### 5. 🎨 Google Material 3 Minimalist Elegance
- Clean typography (`Plus Jakarta Sans` / Roboto).
- Soft tonal surfaces, pill badges, and smooth backdrop blur dialogs.
- Material snackbar toast notifications for all operations.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons | Material 3 Design System, Axios |
| **Backend** | Node.js, Express.js, Mongoose, CORS, Morgan | REST API, Atlas Cloud Ready |
| **Database** | MongoDB Atlas / Local MongoDB | Schemas for `Book` & `IssueRecord` |
| **Hosting** | Render (API) + Vercel (SPA) | Pre-configured `render.yaml` & `vercel.json` |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB running locally OR a MongoDB Atlas connection string

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd "PSG Library"

# Install both backend and frontend dependencies
npm run install:all
```

### 2. Configure Environment Variables
- In `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/psg_library
```
*(Or your MongoDB Atlas URI)*

- In `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Sample PSG Catalog
```bash
npm run seed
```
*(Populates 20+ realistic academic textbooks across engineering & management disciplines along with sample student loan records).*

### 4. Run Both Servers
In Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:5173
```

---

## ☁️ Cloud Deployment Guide

### Part 1: Database on MongoDB Atlas
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Shared Cluster**.
3. In **Database Access**, create a user (e.g. `psgadmin`) with a strong password.
4. In **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere, necessary for Render).
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```text
   mongodb+srv://psgadmin:<password>@cluster0.xxxxx.mongodb.net/psg_library?retryWrites=true&w=majority
   ```

---

### Part 2: Backend on Render
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service** and connect your GitHub repository.
4. Fill in the exact settings:
   - **Name**: `psg-library-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start / Run Command**: `node server.js`
   - **Plan**: `Free`
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String from Part 1>`
   *(Optional: Render automatically provides `RENDER_EXTERNAL_URL`, which activates the 24/7 Keep-Alive Cron)*
6. Click **Deploy Web Service**.
7. Once deployed, note down your Render backend URL:
   `https://psg-library-api.onrender.com`

> **⏰ Automated 24/7 Keep-Alive Cron**:
> Render's free tier spins down web services after 15 minutes of inactivity. We built an automated keep-alive worker in `backend/utils/keepAlive.js` that automatically detects your Render URL and self-pings `/api/health` every 14 minutes, keeping your service **awake 24/7 with zero spin-down delay**.

---

### Part 3: Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project** and import your repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://psg-library-api.onrender.com/api` (your Render backend URL)
5. Click **Deploy**.
6. Vercel will build and assign a production URL (e.g., `https://psg-library.vercel.app`).
   The included `frontend/vercel.json` ensures full client-side SPA routing works seamlessly without 404s.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/books` | Get books with search, department, status filters, sort, & pagination |
| `GET` | `/api/books/stats` | Dashboard statistics, inventory breakdown, active loans |
| `GET` | `/api/books/:id` | Get book details & recent loan history |
| `POST` | `/api/books` | Add new book to catalog |
| `PUT` | `/api/books/:id` | Update book details and inventory |
| `DELETE` | `/api/books/:id` | Delete book (supports `?force=true`) |
| `POST` | `/api/books/:id/return` | Quick return of a book copy |
| `GET` | `/api/issues` | Get circulation loan registry |
| `POST` | `/api/issues` | Checkout / issue a book to student |
| `PUT` | `/api/issues/:id/return` | Mark loan as returned |
| `POST` | `/api/seed` | Reset & seed database with PSG academic collection |
| `GET` | `/api/health` | Healthcheck endpoint for monitoring |

---

## 🏛️ About PSG Library
Built to modern digital standards for **PSG College of Technology**, Coimbatore, providing students, faculty, and librarians with a streamlined, clutter-free book borrowing and inventory experience.


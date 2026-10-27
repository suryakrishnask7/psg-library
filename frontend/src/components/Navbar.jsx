import React from 'react';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Layers,
  ClipboardList,
  BarChart3,
  BookmarkCheck,
  LogOut,
  User,
  GraduationCap,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onSeedData,
  isSeeding,
  stats,
  myLoansCount = 0,
}) {
  const isLibrarian = user?.role === 'librarian';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-1.5">
                  PSG <span className="text-blue-600 font-extrabold">Library</span>
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLibrarian
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {isLibrarian ? <ShieldCheck className="w-3 h-3 text-amber-600" /> : <GraduationCap className="w-3 h-3 text-blue-600" />}
                  <span>{isLibrarian ? 'Librarian Desk' : 'Student & Faculty Portal'}</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden md:block">
                PSG College of Technology • Library Management System
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Material Design 3 Segmented / Pill style) */}
          <nav className="flex items-center p-1 bg-gray-100/90 rounded-full border border-gray-200/60 text-xs">
            {/* Catalog tab for both */}
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isLibrarian ? <Layers className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              <span>{isLibrarian ? 'Catalog & Stock' : 'Browse & Check Availability'}</span>
            </button>

            {/* If Student / Faculty: Show "My Bookshelf" */}
            {!isLibrarian && (
              <button
                onClick={() => setActiveTab('bookshelf')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  activeTab === 'bookshelf'
                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>My Bookshelf</span>
                {myLoansCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {myLoansCount}
                  </span>
                )}
              </button>
            )}

            {/* If Librarian: Show Circulation Desk & Analytics */}
            {isLibrarian && (
              <>
                <button
                  onClick={() => setActiveTab('circulation')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium transition-all ${
                    activeTab === 'circulation'
                      ? 'bg-white text-blue-700 shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Circulation Ledger</span>
                  {stats?.activeLoans > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                      {stats.activeLoans}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-white text-blue-700 shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Analytics</span>
                </button>
              </>
            )}
          </nav>

          {/* User Profile Chip & Actions */}
          <div className="flex items-center gap-2">
            {/* Librarian Admin CTAs */}
            {isLibrarian && (
              <>
                <button
                  onClick={onSeedData}
                  disabled={isSeeding}
                  title="Reset & load sample PSG catalog"
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Seeding...' : 'Seed Data'}</span>
                </button>

                <button
                  onClick={onOpenAddModal}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full shadow-sm hover:shadow transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Add Book</span>
                </button>
              </>
            )}

            {/* Member Info Pill */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 pl-2.5 pr-1.5 py-1 rounded-full text-xs">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-gray-900 block truncate max-w-[130px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-gray-500 font-mono block">
                  {user?.identifier}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                title="Log out from portal"
                className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

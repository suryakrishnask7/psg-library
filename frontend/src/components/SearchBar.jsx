import React from 'react';
import { Search, X, LayoutGrid, ListFilter, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Comm',
  'Mechanical Eng',
  'Electrical & Electronics',
  'Civil Eng',
  'Management Studies (MBA)',
  'Applied Science & Humanities',
];

const STATUS_FILTERS = [
  { label: 'All Stock', value: 'All' },
  { label: 'Available', value: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Low Stock (≤2)', value: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Out of Stock', value: 'Out of Stock', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export default function SearchBar({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalResults,
}) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-4 mb-6">
      {/* Top Search Line & View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Google-like Pill Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title, author, ISBN, shelf location (e.g. Bay CS-01), or publisher..."
            className="w-full pl-11 pr-10 py-2.5 bg-gray-50/70 hover:bg-gray-100/70 focus:bg-white text-sm text-gray-900 placeholder-gray-400 rounded-full border border-gray-200/90 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-8 pr-7 py-2 bg-gray-50 text-xs font-medium text-gray-700 rounded-full border border-gray-200/90 hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
            >
              <option value="createdAt-desc">Newest Added</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="availableCopies-desc">Most Available Copies</option>
              <option value="availableCopies-asc">Lowest Stock First</option>
              <option value="totalCopies-desc">Highest Total Inventory</option>
            </select>
          </div>

          {/* Grid / Table View Switcher */}
          <div className="flex items-center p-1 bg-gray-100 rounded-full border border-gray-200/60">
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Librarian Table View"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Department Filter Chips (Horizontal Scrollable) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
          <span>Filter by Department:</span>
          <span className="text-gray-400">{totalResults} titles matching</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {DEPARTMENTS.map((dept) => {
            const isSelected = department === dept;
            return (
              <button
                key={dept}
                onClick={() => setDepartment(dept)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200/80 hover:bg-gray-100'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Status Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
        <span className="text-gray-400 text-[11px] font-medium mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" />
          Availability:
        </span>
        {STATUS_FILTERS.map((s) => {
          const isSelected = status === s.value;
          return (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


import React from 'react';
import { BookOpen, Plus, RefreshCw, Layers, ClipboardList, BarChart3, Database } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onSeedData,
  isSeeding,
  stats,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & College Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-1.5">
                  PSG <span className="text-blue-600 font-extrabold">Library</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  Central Catalog
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden md:block">
                PSG College of Technology • Library Management System
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Material Design 3 Segmented / Pill style) */}
          <nav className="flex items-center p-1 bg-gray-100/90 rounded-full border border-gray-200/60">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catalog & Stock</span>
            </button>

            <button
              onClick={() => setActiveTab('circulation')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'circulation'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Circulation Desk</span>
              {stats?.activeLoans > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                  {stats.activeLoans}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Quick Seed Button for instant testing */}
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              title="Reset & load sample PSG catalog"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Seed Data'}</span>
            </button>

            {/* Add Book Button (Google Material Fab/Pill Style) */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Book</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

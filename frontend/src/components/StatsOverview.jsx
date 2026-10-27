import React from 'react';
import { BookOpen, CheckCircle2, Bookmark, AlertTriangle, Library, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats, onSelectDepartment, selectedDepartment }) {
  if (!stats) return null;

  const availabilityPercentage = stats.totalCopies > 0
    ? Math.round((stats.availableCopies / stats.totalCopies) * 100)
    : 0;

  const metricCards = [
    {
      title: 'Total Titles',
      value: stats.totalTitles || 0,
      subtext: 'Catalogued distinct titles',
      icon: BookOpen,
      iconBg: 'bg-blue-50 text-blue-600',
      borderHover: 'hover:border-blue-300',
    },
    {
      title: 'Physical Copies',
      value: stats.totalCopies || 0,
      subtext: 'Total volumes on campus',
      icon: Library,
      iconBg: 'bg-indigo-50 text-indigo-600',
      borderHover: 'hover:border-indigo-300',
    },
    {
      title: 'Available Now',
      value: stats.availableCopies || 0,
      subtext: `${availabilityPercentage}% inventory ready`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderHover: 'hover:border-emerald-300',
      highlight: true,
    },
    {
      title: 'Currently Borrowed',
      value: stats.issuedCopies || 0,
      subtext: `${stats.activeLoans || 0} active student loans`,
      icon: Bookmark,
      iconBg: 'bg-amber-50 text-amber-600',
      borderHover: 'hover:border-amber-300',
    },
    {
      title: 'Low / Out of Stock',
      value: (stats.lowStockCount || 0) + (stats.outOfStockCount || 0),
      subtext: `${stats.outOfStockCount || 0} depleted titles`,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      borderHover: 'hover:border-rose-300',
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 5-Column Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs transition-all duration-200 ${card.borderHover}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  {card.value.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 truncate">
                {card.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live availability gauge bar */}
      <div className="bg-white rounded-2xl p-3 px-4 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Real-time Stack Availability</span>
          <span className="text-gray-400">•</span>
          <span className="text-blue-700 font-bold">{stats.availableCopies} Copies Available</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{stats.totalCopies} Total</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                availabilityPercentage > 50
                  ? 'bg-emerald-500'
                  : availabilityPercentage > 20
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, availabilityPercentage)}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">
            {availabilityPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

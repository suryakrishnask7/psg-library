import React from 'react';
import {
  BarChart3,
  PieChart,
  Library,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Building,
  TrendingUp,
} from 'lucide-react';

export default function AnalyticsView({ stats }) {
  if (!stats) return null;

  const totalCopies = stats.totalCopies || 0;
  const availableCopies = stats.availableCopies || 0;
  const issuedCopies = stats.issuedCopies || 0;
  const totalTitles = stats.totalTitles || 0;

  const departments = stats.departmentBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>PSG Library Analytics & Intelligence</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Holistic collection metrics, departmental allocations, and circulation health
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Departmental Holdings Breakdown
            </h3>
            <span className="text-xs text-gray-400">{departments.length} Disciplines</span>
          </div>

          <div className="space-y-3 pt-2">
            {departments.map((dept) => {
              const share = totalTitles > 0 ? Math.round((dept.count / totalTitles) * 100) : 0;
              return (
                <div key={dept._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">{dept._id}</span>
                    <span className="text-gray-500">
                      <span className="font-bold text-gray-900">{dept.count}</span> titles ({dept.totalCopies} copies)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Availability Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Stock & Circulation Health
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-medium text-emerald-700 block">Available in Stacks</span>
              <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                {availableCopies}
              </span>
              <span className="text-[11px] text-emerald-600">
                {totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0}% of inventory
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-xs font-medium text-blue-700 block">Actively Borrowed</span>
              <span className="text-2xl font-bold text-blue-900 mt-1 block">
                {issuedCopies}
              </span>
              <span className="text-[11px] text-blue-600">
                {stats.activeLoans || 0} active borrowers
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-xs font-medium text-amber-700 block">Low Stock Titles</span>
              <span className="text-2xl font-bold text-amber-900 mt-1 block">
                {stats.lowStockCount || 0}
              </span>
              <span className="text-[11px] text-amber-600">≤2 copies left in stack</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <span className="text-xs font-medium text-rose-700 block">Out of Stock</span>
              <span className="text-2xl font-bold text-rose-900 mt-1 block">
                {stats.outOfStockCount || 0}
              </span>
              <span className="text-[11px] text-rose-600">100% borrowed</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 space-y-1">
            <span className="font-semibold text-gray-800 block">PSG Tech Library Insights:</span>
            <p>
              Computer Science & AI titles experience the highest turnover rate. Ensure reserve copies are kept in the Reference Section (Floor 1).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

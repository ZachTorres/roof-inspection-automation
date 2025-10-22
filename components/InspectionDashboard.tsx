'use client';

import { useInspectionStore } from '@/lib/store';
import { format } from 'date-fns';

export default function InspectionDashboard() {
  const inspections = useInspectionStore((state) => state.inspections);

  const stats = {
    total: inspections.length,
    thisMonth: inspections.filter((i) => {
      const date = new Date(i.customerInfo.inspectionDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    totalValue: inspections.reduce((sum, i) => sum + (i.analysis?.totalEstimate || 0), 0),
    avgValue: inspections.length > 0
      ? inspections.reduce((sum, i) => sum + (i.analysis?.totalEstimate || 0), 0) / inspections.length
      : 0,
    pending: inspections.filter((i) => i.claimStatus === 'submitted' || i.claimStatus === 'under-review').length,
    approved: inspections.filter((i) => i.claimStatus === 'approved').length,
  };

  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.customerInfo.inspectionDate).getTime() - new Date(a.customerInfo.inspectionDate).getTime())
    .slice(0, 5);

  if (inspections.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-uc-navy dark:text-white mb-6">Inspection Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-md p-4 border border-uc-blue/10">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Total Inspections</p>
          <p className="text-3xl font-bold text-uc-blue">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-md p-4 border border-uc-blue/10">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">This Month</p>
          <p className="text-3xl font-bold text-uc-blue">{stats.thisMonth}</p>
        </div>

        <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-md p-4 border border-uc-blue/10">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${(stats.totalValue / 1000).toFixed(0)}k
          </p>
        </div>

        <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-md p-4 border border-uc-blue/10">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Avg Value</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${stats.avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-md p-4 border border-uc-blue/10">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Pending Claims</p>
          <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
        </div>

        <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-md p-4 border border-uc-blue/10">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-md p-6 border border-uc-blue/10">
        <h3 className="text-lg font-bold text-uc-navy dark:text-white mb-4">Recent Inspections</h3>
        <div className="space-y-3">
          {recentInspections.map((inspection) => (
            <div
              key={inspection.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-uc-navy rounded-lg hover:bg-slate-100 dark:hover:bg-uc-navy-dark transition-colors"
            >
              <div>
                <p className="font-semibold text-uc-navy dark:text-white">{inspection.customerInfo.name}</p>
                <p className="text-sm text-uc-navy/60 dark:text-slate-400">{inspection.customerInfo.address}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-uc-blue">
                  ${inspection.analysis?.totalEstimate?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {format(new Date(inspection.customerInfo.inspectionDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

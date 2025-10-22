'use client';

import { useState, useEffect } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { InspectionData, FollowUp, FollowUpType, ClaimStatus } from '@/lib/types';
import { showToast } from '@/lib/toast';

interface ClaimTrackerProps {
  inspection: Partial<InspectionData>;
  onBack: () => void;
  onNewInspection: () => void;
}

export default function ClaimTracker({ inspection, onBack, onNewInspection }: ClaimTrackerProps) {
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('submitted');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [newFollowUp, setNewFollowUp] = useState<{
    type: FollowUpType;
    dueDate: string;
    notes: string;
  }>({
    type: 'adjuster',
    dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    notes: '',
  });

  useEffect(() => {
    // Initialize with default follow-ups
    const defaultFollowUps: FollowUp[] = [
      {
        id: '1',
        type: 'adjuster',
        dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        status: 'pending',
        notes: 'Follow up on initial claim review',
      },
      {
        id: '2',
        type: 'homeowner',
        dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        status: 'pending',
        notes: 'Schedule roof assessment with homeowner',
      },
    ];
    setFollowUps(defaultFollowUps);
  }, []);

  const addFollowUp = () => {
    if (!newFollowUp.notes) {
      showToast('Please add follow-up notes', 'error');
      return;
    }

    const followUp: FollowUp = {
      id: Date.now().toString(),
      ...newFollowUp,
      status: 'pending',
    };

    setFollowUps([...followUps, followUp]);
    setNewFollowUp({
      type: 'adjuster',
      dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      notes: '',
    });
    showToast('Follow-up task added', 'success');
  };

  const toggleFollowUpStatus = (id: string) => {
    setFollowUps(
      followUps.map((f) =>
        f.id === id
          ? { ...f, status: f.status === 'pending' ? 'completed' : 'pending' as const }
          : f
      )
    );
    showToast('Status updated', 'info');
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps(followUps.filter((f) => f.id !== id));
    showToast('Follow-up removed', 'info');
  };

  const getFollowUpColor = (followUp: FollowUp) => {
    if (followUp.status === 'completed') return 'bg-green-50 border-green-300 dark:bg-green-900/20';

    const daysUntilDue = differenceInDays(new Date(followUp.dueDate), new Date());
    if (daysUntilDue < 0) return 'bg-red-50 border-red-300 dark:bg-red-900/20';
    if (daysUntilDue <= 2) return 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20';
    return 'bg-blue-50 border-blue-300 dark:bg-blue-900/20';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'under-review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return styles[status as keyof typeof styles] || styles.submitted;
  };

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');
  const overdueFollowUps = pendingFollowUps.filter(
    (f) => differenceInDays(new Date(f.dueDate), new Date()) < 0
  );

  return (
    <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-xl p-8 border border-uc-blue/10">
      <h2 className="text-2xl font-bold mb-6 text-uc-navy dark:text-white">
        Step 4: Claim Tracking & Follow-ups
      </h2>

      {/* Claim Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 dark:bg-uc-navy rounded-lg p-4 border border-uc-blue/20">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Customer</p>
          <p className="font-semibold text-uc-navy dark:text-white">
            {inspection.customerInfo?.name || 'N/A'}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-uc-navy rounded-lg p-4 border border-uc-blue/20">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Claim Number</p>
          <p className="font-semibold text-uc-navy dark:text-white">
            {inspection.customerInfo?.claimNumber || 'N/A'}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-uc-navy rounded-lg p-4 border border-uc-blue/20">
          <p className="text-sm text-uc-navy/70 dark:text-slate-400 mb-1">Total Amount</p>
          <p className="font-semibold text-green-600 dark:text-green-400">
            ${inspection.analysis?.totalEstimate?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Claim Status */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-uc-navy dark:text-white">
          Claim Status
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={claimStatus}
            onChange={(e) => setClaimStatus(e.target.value as ClaimStatus)}
            className={`px-4 py-2 rounded-lg font-semibold ${getStatusBadge(claimStatus)}`}
          >
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <span className="text-sm text-uc-navy/70 dark:text-slate-400">
            Updated: {format(new Date(), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      {/* Follow-up Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-uc-blue/10 rounded-lg p-4 text-center border border-uc-blue/20">
          <p className="text-3xl font-bold text-uc-blue dark:text-uc-blue-light">
            {pendingFollowUps.length}
          </p>
          <p className="text-sm text-uc-navy/70 dark:text-slate-400">Pending Follow-ups</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center border border-red-300 dark:border-red-800">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {overdueFollowUps.length}
          </p>
          <p className="text-sm text-uc-navy/70 dark:text-slate-400">Overdue Tasks</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center border border-green-300 dark:border-green-800">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {followUps.filter((f) => f.status === 'completed').length}
          </p>
          <p className="text-sm text-uc-navy/70 dark:text-slate-400">Completed</p>
        </div>
      </div>

      {/* Follow-up List */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-uc-navy dark:text-white">
          Follow-up Schedule
        </h3>

        {followUps.length === 0 ? (
          <div className="text-center py-8 text-uc-navy/60 dark:text-slate-400">
            No follow-ups scheduled yet
          </div>
        ) : (
          <div className="space-y-3">
            {followUps
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((followUp) => {
                const daysUntilDue = differenceInDays(new Date(followUp.dueDate), new Date());

                return (
                  <div
                    key={followUp.id}
                    className={`border-2 rounded-lg p-4 ${getFollowUpColor(followUp)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={followUp.status === 'completed'}
                          onChange={() => toggleFollowUpStatus(followUp.id)}
                          className="mt-1 w-5 h-5 text-uc-blue rounded focus:ring-2 focus:ring-uc-blue"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-white dark:bg-uc-navy-dark border border-uc-blue/30">
                              {followUp.type.charAt(0).toUpperCase() + followUp.type.slice(1)}
                            </span>
                            <span className="text-sm text-uc-navy/70 dark:text-slate-400">
                              Due: {format(new Date(followUp.dueDate), 'MMM dd, yyyy')}
                            </span>
                            {followUp.status === 'pending' && daysUntilDue < 0 && (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500 text-white">
                                {Math.abs(daysUntilDue)} days overdue
                              </span>
                            )}
                            {followUp.status === 'pending' && daysUntilDue >= 0 && daysUntilDue <= 2 && (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500 text-white">
                                Due soon
                              </span>
                            )}
                          </div>
                          <p className={`text-uc-navy dark:text-slate-300 ${followUp.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                            {followUp.notes}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteFollowUp(followUp.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add New Follow-up */}
      <div className="bg-slate-50 dark:bg-uc-navy rounded-lg p-6 mb-8 border border-uc-blue/20">
        <h3 className="text-lg font-semibold mb-4 text-uc-navy dark:text-white">
          Schedule New Follow-up
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={newFollowUp.type}
            onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value as FollowUpType })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy-dark dark:border-uc-blue/30 dark:text-white"
          >
            <option value="adjuster">Insurance Adjuster</option>
            <option value="mortgage">Mortgage Company</option>
            <option value="homeowner">Homeowner</option>
          </select>
          <input
            type="date"
            value={newFollowUp.dueDate}
            onChange={(e) => setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy-dark dark:border-uc-blue/30 dark:text-white"
          />
        </div>
        <textarea
          placeholder="Follow-up notes and action items..."
          value={newFollowUp.notes}
          onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy-dark dark:border-uc-blue/30 dark:text-white"
        />
        <button
          onClick={addFollowUp}
          className="w-full bg-uc-blue hover:bg-uc-blue-dark text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          Add Follow-up Task
        </button>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-slate-300 hover:bg-slate-400 text-uc-navy font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNewInspection}
          className="bg-uc-blue hover:bg-uc-blue-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          New Inspection
        </button>
      </div>
    </div>
  );
}

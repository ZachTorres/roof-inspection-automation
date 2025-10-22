'use client';

import { useState } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import DamageAnalyzer from '@/components/DamageAnalyzer';
import ReportGenerator from '@/components/ReportGenerator';
import ClaimTracker from '@/components/ClaimTracker';
import InspectionDashboard from '@/components/InspectionDashboard';
import { ToastContainer } from '@/lib/toast';
import type { InspectionData } from '@/lib/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inspectionData, setInspectionData] = useState<Partial<InspectionData> | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-uc-navy-dark dark:to-uc-navy">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-uc-navy dark:text-white mb-4">
            United Roofing Inspection Reports
          </h1>
          <p className="text-lg text-uc-navy/70 dark:text-slate-300">
            Professional insurance claim documentation
          </p>
          <p className="text-sm text-uc-blue mt-2 font-semibold">
            Experience the Royal Treatment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center relative">
            {/* Progress Bar Background */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-slate-300 dark:bg-uc-navy-light z-0 mx-6">
              <div
                className="h-full bg-uc-blue transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            {[
              { num: 1, label: 'Upload Photos', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { num: 2, label: 'Analyze Damage', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
              { num: 3, label: 'Generate Report', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { num: 4, label: 'Track Claims', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 ${
                    currentStep >= step.num
                      ? 'bg-uc-blue text-white shadow-lg scale-110'
                      : currentStep === step.num - 1
                      ? 'bg-uc-blue/50 text-white shadow-md'
                      : 'bg-slate-300 text-slate-600 dark:bg-uc-navy-light dark:text-slate-400'
                  }`}
                >
                  {currentStep > step.num ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStep >= step.num
                    ? 'text-uc-blue dark:text-uc-blue-light'
                    : 'text-uc-navy/70 dark:text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Dashboard - Show only on step 1 */}
          {currentStep === 1 && <InspectionDashboard />}

          {currentStep === 1 && (
            <PhotoUploader
              onNext={(data) => {
                setInspectionData(data);
                setCurrentStep(2);
              }}
            />
          )}

          {currentStep === 2 && (
            <DamageAnalyzer
              photos={inspectionData?.photos || []}
              onNext={(analysis) => {
                setInspectionData({ ...inspectionData, analysis });
                setCurrentStep(3);
              }}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && inspectionData && (
            <ReportGenerator
              inspectionData={inspectionData as InspectionData}
              onNext={(reportData) => {
                setInspectionData({ ...inspectionData, ...reportData });
                setCurrentStep(4);
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && inspectionData && (
            <ClaimTracker
              inspection={inspectionData as InspectionData}
              onBack={() => setCurrentStep(1)}
              onNewInspection={() => {
                setInspectionData(null);
                setCurrentStep(1);
              }}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </main>
  );
}

'use client';

import { useState } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import DamageAnalyzer from '@/components/DamageAnalyzer';
import ReportGenerator from '@/components/ReportGenerator';
import ClaimTracker from '@/components/ClaimTracker';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inspectionData, setInspectionData] = useState<any>(null);

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
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            {[
              { num: 1, label: 'Upload Photos' },
              { num: 2, label: 'Analyze Damage' },
              { num: 3, label: 'Generate Report' },
              { num: 4, label: 'Track Claims' }
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                    currentStep >= step.num
                      ? 'bg-uc-blue text-white shadow-lg'
                      : 'bg-slate-300 text-slate-600 dark:bg-uc-navy-light dark:text-slate-400'
                  }`}
                >
                  {step.num}
                </div>
                <span className="text-sm text-uc-navy dark:text-slate-300">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
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

          {currentStep === 3 && (
            <ReportGenerator
              inspectionData={inspectionData}
              onNext={(reportData) => {
                setInspectionData({ ...inspectionData, ...reportData });
                setCurrentStep(4);
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <ClaimTracker
              inspection={inspectionData}
              onBack={() => setCurrentStep(1)}
              onNewInspection={() => {
                setInspectionData(null);
                setCurrentStep(1);
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

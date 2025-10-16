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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            United Roofing Inspection Reports
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Professional insurance claim documentation
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.num}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
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

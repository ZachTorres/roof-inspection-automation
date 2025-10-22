'use client';

import { useState, useEffect } from 'react';
import { analyzeRoofPhotos } from '@/lib/roofAnalyzer';
import { DamageItem, DamageAnalysis, PhotoFile } from '@/lib/types';
import { showToast } from '@/lib/toast';
import { validateCost } from '@/lib/validation';

interface DamageAnalyzerProps {
  photos: PhotoFile[];
  onNext: (analysis: DamageAnalysis) => void;
  onBack: () => void;
}

// Template data removed - now using actual AI analysis from roofAnalyzer

export default function DamageAnalyzer({ photos, onNext, onBack }: DamageAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [damageItems, setDamageItems] = useState<DamageItem[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [analysisStatus, setAnalysisStatus] = useState('Initializing AI models...');

  useEffect(() => {
    async function runAnalysis() {
      try {
        setAnalysisStatus('Loading TensorFlow.js AI models (first load: 30-60s)...');
        setAnalysisProgress({ current: 0, total: photos.length });

        // Prepare photos for analysis
        const photosForAnalysis = photos.map(photo => ({
          file: photo.file,
          category: photo.category,
        }));

        // Run AI analysis with progress tracking
        const results = await analyzeRoofPhotos(
          photosForAnalysis,
          (current, total) => {
            setAnalysisProgress({ current, total });
            setAnalysisStatus(`Analyzing photo ${current} of ${total} with computer vision...`);
          }
        );

        setDamageItems(results);
        setAnalyzing(false);
        showToast(`AI analysis complete: ${results.length} findings detected`, 'success');
      } catch (error) {
        console.error('Analysis error:', error);

        // Fallback to basic findings on error
        setDamageItems([{
          id: '1',
          category: 'Manual Review Required',
          severity: 'minor',
          description: 'AI analysis could not be completed. Please manually review the uploaded photos and add findings below. This may occur on first load as AI models download.',
          estimatedCost: 0,
          location: 'N/A',
        }]);
        setAnalyzing(false);
        showToast('AI analysis failed. Please add findings manually.', 'warning');
      }
    }

    runAnalysis();
  }, [photos]);

  const addDamageItem = () => {
    const newItem: DamageItem = {
      id: Date.now().toString(),
      category: 'Other',
      severity: 'minor',
      description: '',
      estimatedCost: 0,
      location: '',
    };
    setDamageItems([...damageItems, newItem]);
    showToast('New finding added', 'info');
  };

  const updateDamageItem = (id: string, field: keyof DamageItem, value: string | number) => {
    setDamageItems(
      damageItems.map((item) => {
        if (item.id === id) {
          // Validate cost
          if (field === 'estimatedCost') {
            const cost = typeof value === 'number' ? value : parseFloat(value as string) || 0;
            if (!validateCost(cost)) {
              showToast('Invalid cost amount', 'error');
              return item;
            }
            return { ...item, [field]: cost };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const removeDamageItem = (id: string) => {
    setDamageItems(damageItems.filter((item) => item.id !== id));
    showToast('Finding removed', 'info');
  };

  const totalEstimate = damageItems.reduce((sum, item) => sum + item.estimatedCost, 0);

  const handleNext = () => {
    if (damageItems.length === 0) {
      showToast('Please add at least one damage finding', 'error');
      return;
    }

    // Validate all damage items
    const invalidItems = damageItems.filter(
      item => !item.category || !item.description || !item.location
    );

    if (invalidItems.length > 0) {
      showToast('Please fill in all required fields for each finding', 'error');
      return;
    }

    onNext({ damageItems, totalEstimate });
  };

  return (
    <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-xl p-8 border border-uc-blue/10">
      <h2 className="text-2xl font-bold mb-6 text-uc-navy dark:text-white">
        Step 2: AI-Powered Damage Analysis
      </h2>

      {analyzing ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-300 border-t-uc-blue mb-4"></div>
          <p className="text-lg text-uc-navy dark:text-slate-300 font-semibold">
            {analysisStatus}
          </p>
          {analysisProgress.total > 0 && (
            <>
              <p className="text-sm text-uc-navy/60 dark:text-slate-400 mt-2">
                Progress: {analysisProgress.current} / {analysisProgress.total} photos
              </p>
              <div className="w-64 mx-auto mt-4 bg-slate-200 dark:bg-uc-navy rounded-full h-2">
                <div
                  className="bg-uc-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
                ></div>
              </div>
            </>
          )}
          <p className="text-xs text-uc-navy/50 dark:text-slate-500 mt-4">
            Using TensorFlow.js computer vision to detect roof damage
          </p>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-blue-50 dark:bg-uc-blue/10 rounded-lg p-6 mb-6 border border-uc-blue/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-uc-navy/70 dark:text-slate-400">Total Findings</p>
                <p className="text-2xl font-bold text-uc-navy dark:text-white">
                  {damageItems.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-uc-navy/70 dark:text-slate-400">Estimated Cost</p>
                <p className="text-2xl font-bold text-uc-blue dark:text-uc-blue-light">
                  ${totalEstimate.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-uc-navy/70 dark:text-slate-400">Severity Breakdown</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded">
                    {damageItems.filter((i) => i.severity === 'minor').length} Minor
                  </span>
                  <span className="px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded">
                    {damageItems.filter((i) => i.severity === 'moderate').length} Moderate
                  </span>
                  <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded">
                    {damageItems.filter((i) => i.severity === 'severe').length} Severe
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Damage Items */}
          <div className="space-y-4 mb-6">
            {damageItems.map((item, index) => (
              <div
                key={item.id}
                className="border border-slate-300 dark:border-uc-blue/30 rounded-lg p-4 bg-white/50 dark:bg-uc-navy/50"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-uc-navy dark:text-white">
                    Finding #{index + 1}
                  </h3>
                  <button
                    onClick={() => removeDamageItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove finding"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Category *"
                    value={item.category}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'category', e.target.value)
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                  />
                  <select
                    value={item.severity}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'severity', e.target.value)
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Location *"
                    value={item.location}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'location', e.target.value)
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Estimated Cost *"
                    value={item.estimatedCost}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'estimatedCost', e.target.value)
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                    min="0"
                    max="1000000"
                  />
                  <textarea
                    placeholder="Description *"
                    value={item.description}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'description', e.target.value)
                    }
                    rows={3}
                    className="col-span-2 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Button */}
          <button
            onClick={addDamageItem}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-uc-blue/30 rounded-lg text-uc-navy dark:text-slate-400 hover:border-uc-blue hover:text-uc-blue transition-colors"
          >
            + Add Additional Finding
          </button>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="bg-slate-300 hover:bg-slate-400 text-uc-navy font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="bg-uc-blue hover:bg-uc-blue-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Next: Generate Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}

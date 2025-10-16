'use client';

import { useState, useEffect } from 'react';

interface DamageAnalyzerProps {
  photos: any[];
  onNext: (analysis: any) => void;
  onBack: () => void;
}

interface DamageItem {
  id: string;
  category: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  estimatedCost: number;
  location: string;
}

export default function DamageAnalyzer({ photos, onNext, onBack }: DamageAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [damageItems, setDamageItems] = useState<DamageItem[]>([]);

  useEffect(() => {
    // Simulate AI analysis - in production, this would call an AI API
    setTimeout(() => {
      const analyzedDamage: DamageItem[] = [];

      // Analyze photos by category
      const categories = photos.reduce((acc: any, photo: any) => {
        acc[photo.category] = (acc[photo.category] || 0) + 1;
        return acc;
      }, {});

      // Generate damage findings based on photo categories
      if (categories.damage || categories.shingles) {
        analyzedDamage.push({
          id: '1',
          category: 'Shingles',
          severity: 'moderate',
          description: 'Missing and damaged shingles detected on north-facing slope. Evidence of wind damage with lifted edges and granule loss.',
          estimatedCost: 2500,
          location: 'North slope',
        });
      }

      if (categories.flashing) {
        analyzedDamage.push({
          id: '2',
          category: 'Flashing',
          severity: 'minor',
          description: 'Flashing around chimney shows signs of deterioration and requires resealing to prevent water infiltration.',
          estimatedCost: 450,
          location: 'Chimney perimeter',
        });
      }

      if (categories.gutters) {
        analyzedDamage.push({
          id: '3',
          category: 'Gutters',
          severity: 'minor',
          description: 'Gutter sections showing separation at seams with potential for water overflow and fascia damage.',
          estimatedCost: 350,
          location: 'East side gutter system',
        });
      }

      if (categories.vents) {
        analyzedDamage.push({
          id: '4',
          category: 'Ventilation',
          severity: 'moderate',
          description: 'Ridge vent damage observed with improper sealing that could compromise attic ventilation and energy efficiency.',
          estimatedCost: 800,
          location: 'Ridge line',
        });
      }

      if (categories.chimney) {
        analyzedDamage.push({
          id: '5',
          category: 'Chimney',
          severity: 'moderate',
          description: 'Chimney cap missing with exposed mortar joints showing weather deterioration and potential for water damage.',
          estimatedCost: 650,
          location: 'Main chimney',
        });
      }

      // Add general findings
      analyzedDamage.push({
        id: '6',
        category: 'General',
        severity: 'minor',
        description: 'Overall roof age estimated at 15-18 years. General wear consistent with age and local weather patterns.',
        estimatedCost: 0,
        location: 'Entire roof system',
      });

      setDamageItems(analyzedDamage);
      setAnalyzing(false);
    }, 2500);
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
  };

  const updateDamageItem = (id: string, field: keyof DamageItem, value: any) => {
    setDamageItems(
      damageItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeDamageItem = (id: string) => {
    setDamageItems(damageItems.filter((item) => item.id !== id));
  };

  const totalEstimate = damageItems.reduce((sum, item) => sum + item.estimatedCost, 0);

  const handleNext = () => {
    if (damageItems.length === 0) {
      alert('Please add at least one damage finding');
      return;
    }
    onNext({ damageItems, totalEstimate });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Step 2: Damage Analysis
      </h2>

      {analyzing ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Analyzing inspection photos with AI...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Detecting damage patterns, estimating costs, and categorizing findings
          </p>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Findings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {damageItems.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${totalEstimate.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Severity Breakdown</p>
                <div className="flex gap-2 mt-1">
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
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Finding #{index + 1}
                  </h3>
                  <button
                    onClick={() => removeDamageItem(item.id)}
                    className="text-red-500 hover:text-red-700"
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
                    placeholder="Category"
                    value={item.category}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'category', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <select
                    value={item.severity}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'severity', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Location"
                    value={item.location}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'location', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Estimated Cost"
                    value={item.estimatedCost}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'estimatedCost', parseFloat(e.target.value) || 0)
                    }
                    className="px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'description', e.target.value)
                    }
                    rows={3}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Button */}
          <button
            onClick={addDamageItem}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            + Add Additional Finding
          </button>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Next: Generate Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}

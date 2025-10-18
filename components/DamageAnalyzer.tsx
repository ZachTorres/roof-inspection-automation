'use client';

import { useState, useEffect } from 'react';
import { analyzeRoofPhotos } from '@/lib/roofAnalyzer';

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

// Realistic damage templates based on photo category
const damageTemplates = {
  shingles: [
    {
      category: 'Asphalt Shingles',
      severity: 'moderate' as const,
      descriptions: [
        'Multiple missing shingles detected on {location} slope. Wind damage evident with lifted tab edges and granule loss indicating age-related wear.',
        'Curling and buckling shingles observed on {location}. Thermal cycling has compromised shingle integrity, exposing underlying felt paper.',
        'Hail damage impact marks visible across {location}. Granule displacement and bruising patterns consistent with recent storm activity.',
      ],
      costs: [1800, 2200, 2500, 2800],
      locations: ['north-facing', 'south-facing', 'east-facing', 'west-facing', 'front', 'rear'],
    },
    {
      category: 'Shingle Deterioration',
      severity: 'minor' as const,
      descriptions: [
        'Granule loss detected on {location} exposing asphalt layer. UV degradation accelerating aging process, recommend monitoring.',
        'Minor lifting of shingle edges on {location} creating potential water infiltration points during heavy rain events.',
        'Isolated shingle cracking observed due to thermal expansion cycles. No immediate structural concern but warrants attention.',
      ],
      costs: [650, 850, 950],
      locations: ['ridge line', 'hip sections', 'valley areas', 'transition points'],
    },
  ],
  flashing: [
    {
      category: 'Metal Flashing',
      severity: 'moderate' as const,
      descriptions: [
        'Step flashing separation detected at {location} interface. Sealant failure allowing water penetration risk behind siding.',
        'Chimney counter-flashing deterioration with rust-through sections. Immediate attention required to prevent interior water damage.',
        'Valley flashing showing corrosion and improper overlap. High-flow water areas experiencing accelerated wear patterns.',
      ],
      costs: [1200, 1450, 1650],
      locations: ['chimney', 'wall-to-roof', 'dormer', 'skylight'],
    },
  ],
  gutters: [
    {
      category: 'Gutter System',
      severity: 'minor' as const,
      descriptions: [
        'Gutter sections exhibiting seam separation at {location}. Thermal expansion/contraction causing joint failure and overflow potential.',
        'Debris accumulation in gutter runs creating water backup. Recommending professional cleaning and installation of gutter guards.',
        'Downspout disconnect at {location} causing foundation exposure. Improper water routing may lead to basement moisture issues.',
      ],
      costs: [380, 520, 680],
      locations: ['east elevation', 'west elevation', 'front fascia', 'rear section'],
    },
  ],
  vents: [
    {
      category: 'Roof Ventilation',
      severity: 'moderate' as const,
      descriptions: [
        'Ridge vent installation showing gaps and improper sealing. Compromised attic ventilation affecting energy efficiency and moisture control.',
        'Turbine vent bearing failure causing rotation issues. Inadequate exhaust ventilation may lead to premature roof system failure.',
        'Soffit vent blockage reducing intake airflow. Imbalanced ventilation system contributing to heat and moisture buildup in attic space.',
      ],
      costs: [750, 900, 1100],
      locations: ['ridge system', 'roof penetrations', 'soffit areas'],
    },
  ],
  chimney: [
    {
      category: 'Chimney Structure',
      severity: 'severe' as const,
      descriptions: [
        'Chimney cap missing exposing flue opening. Direct water entry and animal access risk. Mortar crown showing significant weathering cracks.',
        'Masonry spalling and efflorescence on {location} face. Freeze-thaw cycles causing brick deterioration requiring tuckpointing repairs.',
        'Chimney flashing boot deterioration with active leak signs. Water staining on interior ceiling indicates ongoing moisture intrusion.',
      ],
      costs: [1850, 2200, 2650],
      locations: ['north', 'south', 'east', 'west'],
    },
  ],
  damage: [
    {
      category: 'Storm Damage',
      severity: 'severe' as const,
      descriptions: [
        'Impact damage from fallen limb on {location}. Penetration through roof deck visible, requires immediate temporary protection and structural assessment.',
        'Wind uplift damage affecting {location} field. Multiple shingles displaced and felt paper compromised. Emergency repairs recommended.',
        'Hail strike patterns across {location} consistent with recent severe weather. Functional damage present warranting full replacement consideration.',
      ],
      costs: [3200, 3800, 4500],
      locations: ['main roof section', 'secondary roof area', 'primary slope', 'garage roof'],
    },
  ],
  general: [
    {
      category: 'Overall Assessment',
      severity: 'minor' as const,
      descriptions: [
        'Roof system age estimated at {age} years based on material condition and installation techniques. Remaining serviceable life approximately {life} years with proper maintenance.',
        'General wear patterns consistent with local climate exposure. No immediate concerns but recommend annual inspections and preventive maintenance program.',
        'Moss and algae growth on {location} indicating moisture retention. Cosmetic issue currently but may accelerate material degradation if left untreated.',
      ],
      costs: [0, 0, 650],
      locations: ['shaded areas', 'north-facing slopes', 'low-slope sections'],
      ages: ['12-15', '15-18', '18-20', '20-25'],
      lives: ['3-5', '5-7', '7-10'],
    },
  ],
};

export default function DamageAnalyzer({ photos, onNext, onBack }: DamageAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [damageItems, setDamageItems] = useState<DamageItem[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [analysisStatus, setAnalysisStatus] = useState('Initializing AI models...');

  useEffect(() => {
    async function runAnalysis() {
      try {
        setAnalysisStatus('Loading AI models (first time may take 30-60 seconds)...');
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
            setAnalysisStatus(`Analyzing photo ${current} of ${total}...`);
          }
        );

        setDamageItems(results);
        setAnalyzing(false);
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
    <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-xl p-8 border border-uc-blue/10">
      <h2 className="text-2xl font-bold mb-6 text-uc-navy dark:text-white">
        Step 2: Damage Analysis
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
            Using AI-powered computer vision to detect roof damage
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
                className="border border-slate-300 dark:border-uc-blue/30 rounded-lg p-4 bg-white/50 dark:bg-uc-navy/50"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-uc-navy dark:text-white">
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
                    placeholder="Location"
                    value={item.location}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'location', e.target.value)
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Estimated Cost"
                    value={item.estimatedCost}
                    onChange={(e) =>
                      updateDamageItem(item.id, 'estimatedCost', parseFloat(e.target.value) || 0)
                    }
                    className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                  />
                  <textarea
                    placeholder="Description"
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

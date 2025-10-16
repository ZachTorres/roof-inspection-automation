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

  useEffect(() => {
    // More realistic AI simulation with varied results
    setTimeout(() => {
      const analyzedDamage: DamageItem[] = [];

      // Count photos by category
      const categories = photos.reduce((acc: any, photo: any) => {
        acc[photo.category] = (acc[photo.category] || 0) + 1;
        return acc;
      }, {});

      let idCounter = 1;

      // Generate varied findings based on uploaded photo categories
      Object.entries(categories).forEach(([category, count]: [string, any]) => {
        const templates = damageTemplates[category as keyof typeof damageTemplates];

        if (templates && templates.length > 0) {
          // Pick random templates based on number of photos
          const numFindings = Math.min(count, Math.ceil(count / 2) + 1);

          for (let i = 0; i < numFindings && i < templates.length; i++) {
            const template = templates[i % templates.length];
            const randomDesc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
            const randomCost = template.costs[Math.floor(Math.random() * template.costs.length)];
            const randomLocation = template.locations[Math.floor(Math.random() * template.locations.length)];

            let description = randomDesc.replace('{location}', randomLocation);

            // Handle special replacements for general category
            if (category === 'general' && template.ages) {
              const randomAge = template.ages[Math.floor(Math.random() * template.ages.length)];
              const randomLife = template.lives![Math.floor(Math.random() * template.lives!.length)];
              description = description.replace('{age}', randomAge).replace('{life}', randomLife);
            }

            analyzedDamage.push({
              id: (idCounter++).toString(),
              category: template.category,
              severity: template.severity,
              description,
              estimatedCost: randomCost,
              location: randomLocation.charAt(0).toUpperCase() + randomLocation.slice(1),
            });
          }
        }
      });

      // Always add a general assessment if we have photos
      if (photos.length > 0 && !categories.general) {
        const template = damageTemplates.general[Math.floor(Math.random() * damageTemplates.general.length)];
        const randomDesc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
        const randomLocation = template.locations[Math.floor(Math.random() * template.locations.length)];
        const randomAge = template.ages![Math.floor(Math.random() * template.ages!.length)];
        const randomLife = template.lives![Math.floor(Math.random() * template.lives!.length)];

        analyzedDamage.push({
          id: (idCounter++).toString(),
          category: 'Overall Assessment',
          severity: 'minor',
          description: randomDesc.replace('{location}', randomLocation).replace('{age}', randomAge).replace('{life}', randomLife),
          estimatedCost: template.costs[Math.floor(Math.random() * template.costs.length)],
          location: 'Entire roof system',
        });
      }

      // Ensure we have at least one finding
      if (analyzedDamage.length === 0) {
        analyzedDamage.push({
          id: '1',
          category: 'General Inspection',
          severity: 'minor',
          description: 'Initial visual inspection completed. Roof system shows normal wear patterns for age. Detailed assessment pending photo review and category assignment.',
          estimatedCost: 0,
          location: 'Overall',
        });
      }

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
            Analyzing inspection photos...
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

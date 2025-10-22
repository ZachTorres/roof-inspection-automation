'use client';

import { useState } from 'react';
import { RoofMeasurement } from '@/lib/types';

interface RoofMeasurementsProps {
  onSave: (measurements: RoofMeasurement) => void;
  initialData?: RoofMeasurement;
}

export default function RoofMeasurements({ onSave, initialData }: RoofMeasurementsProps) {
  const [measurements, setMeasurements] = useState<RoofMeasurement>(
    initialData || {
      totalSquares: 0,
      pitch: '4/12',
      stories: 1,
      roofType: 'Asphalt Shingles',
      approximateAge: 0,
      layers: 1,
      accessibility: 'moderate',
    }
  );

  const [showHelp, setShowHelp] = useState(false);

  const handleUpdate = (field: keyof RoofMeasurement, value: any) => {
    setMeasurements({ ...measurements, [field]: value });
  };

  const handleSave = () => {
    if (measurements.totalSquares <= 0) {
      alert('Please enter roof square footage');
      return;
    }
    onSave(measurements);
  };

  const pitchOptions = ['2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12'];
  const roofTypes = [
    'Asphalt Shingles',
    'Architectural Shingles',
    'Metal',
    'Tile',
    'Slate',
    'Wood Shake',
    'TPO',
    'EPDM',
    'Built-Up',
    'Other',
  ];

  return (
    <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-xl p-8 border border-uc-blue/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-uc-navy dark:text-white">Roof Measurements & Details</h3>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-uc-blue hover:text-uc-blue-dark"
          title="Help"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-uc-blue/10 rounded-lg border border-uc-blue/20">
          <h4 className="font-semibold text-uc-navy dark:text-white mb-2">Measurement Guide</h4>
          <ul className="text-sm text-uc-navy/70 dark:text-slate-300 space-y-1">
            <li>• 1 Square = 100 square feet of roof area</li>
            <li>• Pitch is the slope ratio (rise over run)</li>
            <li>• Include all roof sections and dormers</li>
            <li>• Count layers if re-roofing is needed</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Squares */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Total Squares (100 sq ft each) *
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={measurements.totalSquares}
            onChange={(e) => handleUpdate('totalSquares', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
            placeholder="e.g., 25.5"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {measurements.totalSquares > 0 && `≈ ${Math.round(measurements.totalSquares * 100)} sq ft`}
          </p>
        </div>

        {/* Pitch */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Roof Pitch *
          </label>
          <select
            value={measurements.pitch}
            onChange={(e) => handleUpdate('pitch', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          >
            {pitchOptions.map((pitch) => (
              <option key={pitch} value={pitch}>
                {pitch}
              </option>
            ))}
          </select>
        </div>

        {/* Stories */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Number of Stories *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={measurements.stories}
            onChange={(e) => handleUpdate('stories', parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          />
        </div>

        {/* Roof Type */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Roof Material *
          </label>
          <select
            value={measurements.roofType}
            onChange={(e) => handleUpdate('roofType', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          >
            {roofTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Approximate Age */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Approximate Age (years) *
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={measurements.approximateAge}
            onChange={(e) => handleUpdate('approximateAge', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          />
        </div>

        {/* Last Replacement */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Last Replacement Date
          </label>
          <input
            type="date"
            value={measurements.lastReplacement || ''}
            onChange={(e) => handleUpdate('lastReplacement', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          />
        </div>

        {/* Number of Layers */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Number of Layers
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={measurements.layers}
            onChange={(e) => handleUpdate('layers', parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {measurements.layers > 1 && 'Multiple layers may require tear-off'}
          </p>
        </div>

        {/* Accessibility */}
        <div>
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Accessibility
          </label>
          <select
            value={measurements.accessibility}
            onChange={(e) => handleUpdate('accessibility', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-uc-navy dark:text-slate-300 mb-2">
            Additional Notes
          </label>
          <textarea
            value={measurements.notes || ''}
            onChange={(e) => handleUpdate('notes', e.target.value)}
            rows={3}
            placeholder="Any additional observations about the roof structure, access points, or special considerations..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-uc-blue hover:bg-uc-blue-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          Save Measurements
        </button>
      </div>
    </div>
  );
}

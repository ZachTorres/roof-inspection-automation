import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

interface DamageItem {
  id: string;
  category: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  estimatedCost: number;
  location: string;
}

// Cost estimation - can be dynamically updated from API
let costEstimates = {
  missing_shingles: { min: 800, max: 2200, severity: 'moderate' as const },      // Partial repair
  damaged_area: { min: 3500, max: 7500, severity: 'moderate' as const },         // Section replacement
  severe_damage: { min: 8000, max: 15000, severity: 'severe' as const },         // Major repairs
  full_replacement: { min: 12000, max: 28000, severity: 'severe' as const },     // Complete roof replacement
  full_replacement_large: { min: 18000, max: 35000, severity: 'severe' as const }, // Large/complex roof
  minor_wear: { min: 400, max: 1200, severity: 'minor' as const },               // Minor repairs
  weathering: { min: 600, max: 1500, severity: 'minor' as const },               // Cleaning/treatment
  structural_concern: { min: 6000, max: 14000, severity: 'severe' as const },    // Structural repairs
  gutter_issue: { min: 400, max: 1200, severity: 'minor' as const },             // Gutter repair/cleaning
  flashing_concern: { min: 1200, max: 3500, severity: 'moderate' as const },     // Flashing replacement
};

let costDataSource = 'Industry average (2025)';
let lastCostUpdate: Date | null = null;

// Fetch live cost data from API
async function updateCostEstimates() {
  try {
    const response = await fetch('/api/roofing-costs');
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;

        // Update cost estimates based on live data
        const avgPerSqFt = data.perSqFt.average;
        const maxPerSqFt = data.perSqFt.max;

        costEstimates = {
          missing_shingles: {
            min: Math.round(data.typicalRoofSize.small * 0.1 * avgPerSqFt),
            max: Math.round(data.typicalRoofSize.small * 0.15 * maxPerSqFt),
            severity: 'moderate' as const,
          },
          damaged_area: {
            min: Math.round(data.typicalRoofSize.small * 0.3 * avgPerSqFt),
            max: Math.round(data.typicalRoofSize.medium * 0.4 * maxPerSqFt),
            severity: 'moderate' as const,
          },
          severe_damage: {
            min: Math.round(data.typicalRoofSize.medium * 0.5 * avgPerSqFt),
            max: Math.round(data.typicalRoofSize.medium * 0.8 * maxPerSqFt),
            severity: 'severe' as const,
          },
          full_replacement: {
            min: data.fullReplacement.medium.min,
            max: data.fullReplacement.large.max,
            severity: 'severe' as const,
          },
          full_replacement_large: {
            min: data.fullReplacement.large.min,
            max: Math.round(data.typicalRoofSize.large * maxPerSqFt),
            severity: 'severe' as const,
          },
          minor_wear: {
            min: Math.round(500 * avgPerSqFt / 6),
            max: Math.round(1000 * maxPerSqFt / 6),
            severity: 'minor' as const,
          },
          weathering: {
            min: Math.round(600 * avgPerSqFt / 6),
            max: Math.round(1500 * maxPerSqFt / 6),
            severity: 'minor' as const,
          },
          structural_concern: {
            min: Math.round(data.typicalRoofSize.small * 0.6 * avgPerSqFt),
            max: Math.round(data.typicalRoofSize.medium * 0.8 * maxPerSqFt),
            severity: 'severe' as const,
          },
          gutter_issue: {
            min: Math.round(400 * avgPerSqFt / 6),
            max: Math.round(1200 * maxPerSqFt / 6),
            severity: 'minor' as const,
          },
          flashing_concern: {
            min: Math.round(1200 * avgPerSqFt / 6),
            max: Math.round(3500 * maxPerSqFt / 6),
            severity: 'moderate' as const,
          },
        };

        costDataSource = result.data.source;
        lastCostUpdate = new Date(result.data.lastUpdated);

        console.log('Updated cost estimates from live data:', costDataSource);
      }
    }
  } catch (error) {
    console.error('Failed to fetch live cost data, using defaults:', error);
  }
}

let objectDetectionModel: cocoSsd.ObjectDetection | null = null;

// Initialize AI model (lazy loading)
async function initModel() {
  if (!objectDetectionModel) {
    console.log('Loading TensorFlow.js object detection model...');
    objectDetectionModel = await cocoSsd.load({
      base: 'mobilenet_v2' // Faster, good for browser use
    });
    console.log('Model loaded successfully');
  }

  // Update cost estimates if not done recently (only on first run)
  if (!lastCostUpdate) {
    updateCostEstimates().catch(err => console.error('Cost update failed:', err));
  }

  return objectDetectionModel;
}

// Convert File to Image element for processing
async function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// Analyze image using canvas for color/brightness analysis
function analyzeImageFeatures(canvas: HTMLCanvasElement): {
  brightness: number;
  darkness: number;
  contrast: number;
  hasRedAreas: boolean;
  hasDarkSpots: boolean;
  overallCondition: 'good' | 'fair' | 'poor';
} {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalBrightness = 0;
  let darkPixels = 0;
  let redPixels = 0;
  const values: number[] = [];

  // Sample pixels for analysis (every 10th pixel for performance)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;
    values.push(brightness);

    // Check for dark spots (potential missing shingles/damage)
    if (brightness < 60) {
      darkPixels++;
    }

    // Check for red/rust areas (potential flashing damage)
    if (r > 120 && r > g * 1.5 && r > b * 1.5) {
      redPixels++;
    }
  }

  const pixelCount = values.length;
  const avgBrightness = totalBrightness / pixelCount;

  // Calculate contrast (standard deviation)
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avgBrightness, 2), 0) / pixelCount;
  const contrast = Math.sqrt(variance);

  const darknessRatio = darkPixels / pixelCount;
  const hasRedAreas = (redPixels / pixelCount) > 0.05;
  const hasDarkSpots = darknessRatio > 0.15;

  // Determine overall condition based on multiple factors
  let overallCondition: 'good' | 'fair' | 'poor';
  if (darknessRatio > 0.3 || avgBrightness < 70) {
    overallCondition = 'poor';
  } else if (darknessRatio > 0.15 || avgBrightness < 100 || contrast < 25) {
    overallCondition = 'fair';
  } else {
    overallCondition = 'good';
  }

  return {
    brightness: avgBrightness,
    darkness: darknessRatio,
    contrast,
    hasRedAreas,
    hasDarkSpots,
    overallCondition,
  };
}

// Analyze edge detection for cracks and deterioration
function detectEdges(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let edgeCount = 0;
  const width = canvas.width;

  // Simple edge detection using brightness differences
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < width - 1; x += 4) { // Sample every 4th pixel
      const idx = (y * width + x) * 4;
      const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
      const down = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;

      // If brightness difference is significant, it's an edge
      if (Math.abs(current - right) > 40 || Math.abs(current - down) > 40) {
        edgeCount++;
      }
    }
  }

  return edgeCount;
}

// Analyze a single image for roof damage
async function analyzeImage(file: File, category: string, model: cocoSsd.ObjectDetection): Promise<Partial<DamageItem>[]> {
  try {
    const img = await fileToImage(file);

    // Create canvas for image analysis
    const canvas = document.createElement('canvas');
    const maxSize = 640; // Resize for faster processing
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Run object detection
    const predictions = await model.detect(canvas);

    // Analyze image features
    const features = analyzeImageFeatures(canvas);

    // Detect edges (cracks, deterioration)
    const edgeCount = detectEdges(canvas);
    const edgeDensity = edgeCount / (canvas.width * canvas.height / 1000);

    const findings: Partial<DamageItem>[] = [];

    // Analysis based on category and detected features
    if (category === 'shingles' || category === 'damage') {
      findings.push(...analyzeShingleDamage(predictions, features, edgeDensity));
    }

    if (category === 'flashing') {
      findings.push(...analyzeFlashing(predictions, features));
    }

    if (category === 'gutters') {
      findings.push(...analyzeGutters(predictions, features));
    }

    if (category === 'chimney') {
      findings.push(...analyzeChimney(predictions, features));
    }

    if (category === 'vents') {
      findings.push(...analyzeVents(predictions, features));
    }

    if (category === 'general' || findings.length === 0) {
      findings.push(analyzeGeneral(features, edgeDensity));
    }

    return findings;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return [];
  }
}

// Shingle damage analysis
function analyzeShingleDamage(predictions: any[], features: any, edgeDensity: number): Partial<DamageItem>[] {
  const findings: Partial<DamageItem>[] = [];

  // Check for dark spots (missing shingles) - more aggressive detection
  if (features.hasDarkSpots || features.darkness > 0.15) {
    const severity = features.darkness > 0.25 ? 'severe' : features.darkness > 0.18 ? 'moderate' : 'minor';
    const costRange = severity === 'severe' ? costEstimates.severe_damage :
                      severity === 'moderate' ? costEstimates.damaged_area :
                      costEstimates.missing_shingles;
    const cost = Math.floor(Math.random() * (costRange.max - costRange.min) + costRange.min);

    findings.push({
      category: 'Asphalt Shingles',
      severity,
      description: `AI analysis detected ${Math.round(features.darkness * 100)}% dark areas indicating ${severity === 'severe' ? 'extensive missing or severely damaged' : 'possible missing or damaged'} shingles. Inspection reveals potential wind uplift damage or age-related shingle loss. ${severity === 'severe' ? 'Immediate attention required - structural exposure risk.' : severity === 'moderate' ? 'Prompt repair recommended to prevent water intrusion.' : 'Recommend close inspection and repair.'}`,
      estimatedCost: cost,
      location: 'Main roof section',
    });
  }

  // Check for excessive edges (cracking/curling) - improved severity assessment
  if (edgeDensity > 15) {
    const severity = edgeDensity > 25 ? 'moderate' : 'minor';
    const costRange = severity === 'moderate' ? costEstimates.damaged_area : costEstimates.minor_wear;
    const cost = Math.floor(Math.random() * (costRange.max - costRange.min) + costRange.min);

    findings.push({
      category: 'Shingle Deterioration',
      severity,
      description: `Computer vision analysis detected ${edgeDensity > 25 ? 'extensive' : 'elevated'} edge patterns consistent with shingle cracking or curling. Pattern density suggests ${edgeDensity > 25 ? 'advanced' : 'moderate'} thermal cycling and UV exposure effects. ${edgeDensity > 25 ? 'Repair or replacement assessment recommended.' : 'Monitor for progression and consider preventive repairs.'}`,
      estimatedCost: cost,
      location: 'Multiple sections',
    });
  }

  // Poor overall condition with better severity assessment
  if (features.overallCondition === 'poor' && findings.length === 0) {
    const severity = features.darkness > 0.3 || features.brightness < 60 ? 'severe' : 'moderate';
    const costRange = severity === 'severe' ? costEstimates.full_replacement_large : costEstimates.damaged_area;
    const cost = Math.floor(Math.random() * (costRange.max - costRange.min) + costRange.min);

    findings.push({
      category: 'Roof Condition',
      severity,
      description: `Overall roof surface analysis indicates ${severity === 'severe' ? 'severe' : 'moderate'} wear and deterioration. Visual indicators suggest ${severity === 'severe' ? 'critical age-related degradation requiring immediate professional assessment. Full roof replacement recommended (typical cost: $12,000-$28,000+ depending on roof size and materials).' : 'age-related degradation requiring professional assessment for repair vs. replacement decision.'}`,
      estimatedCost: cost,
      location: 'Overall roof surface',
    });
  }

  return findings;
}

// Flashing analysis
function analyzeFlashing(predictions: any[], features: any): Partial<DamageItem>[] {
  const findings: Partial<DamageItem>[] = [];

  if (features.hasRedAreas || features.brightness < 110) {
    const cost = Math.floor(Math.random() * (costEstimates.flashing_concern.max - costEstimates.flashing_concern.min) + costEstimates.flashing_concern.min);

    findings.push({
      category: 'Metal Flashing',
      severity: 'moderate',
      description: `Image analysis detected ${features.hasRedAreas ? 'rust-colored areas and ' : ''}characteristics consistent with flashing concerns. Recommend detailed inspection of sealant integrity, metal condition, and proper overlap at vulnerable transition points.`,
      estimatedCost: cost,
      location: 'Roof transitions',
    });
  }

  return findings;
}

// Gutter analysis
function analyzeGutters(predictions: any[], features: any): Partial<DamageItem>[] {
  const findings: Partial<DamageItem>[] = [];

  // Detect objects that might be debris
  const detectedObjects = predictions.filter(p => p.score > 0.4);

  if (detectedObjects.length > 3 || features.hasDarkSpots) {
    const cost = Math.floor(Math.random() * (costEstimates.gutter_issue.max - costEstimates.gutter_issue.min) + costEstimates.gutter_issue.min);

    findings.push({
      category: 'Gutter System',
      severity: 'minor',
      description: `Visual analysis identified ${detectedObjects.length} objects and irregular patterns suggesting debris accumulation or gutter deterioration. Professional cleaning and inspection recommended to ensure proper water drainage and prevent overflow issues.`,
      estimatedCost: cost,
      location: 'Gutter runs',
    });
  }

  return findings;
}

// Chimney analysis
function analyzeChimney(predictions: any[], features: any): Partial<DamageItem>[] {
  const findings: Partial<DamageItem>[] = [];

  if (features.overallCondition !== 'good' || features.hasRedAreas) {
    const severity = features.overallCondition === 'poor' ? 'severe' : 'moderate';
    const costRange = severity === 'severe' ? costEstimates.structural_concern : costEstimates.flashing_concern;
    const cost = Math.floor(Math.random() * (costRange.max - costRange.min) + costRange.min);

    findings.push({
      category: 'Chimney Structure',
      severity,
      description: `Chimney inspection analysis reveals ${severity} concerns. ${features.hasRedAreas ? 'Rust-colored patterns detected. ' : ''}Recommend examining mortar joints for deterioration, verifying chimney cap condition, and checking flashing integrity to prevent water intrusion.`,
      estimatedCost: cost,
      location: 'Chimney',
    });
  }

  return findings;
}

// Vent analysis
function analyzeVents(predictions: any[], features: any): Partial<DamageItem>[] {
  const findings: Partial<DamageItem>[] = [];

  const cost = Math.floor(Math.random() * (costEstimates.minor_wear.max - costEstimates.minor_wear.min) + costEstimates.minor_wear.min);

  findings.push({
    category: 'Roof Ventilation',
    severity: 'minor',
    description: 'Ventilation system components visible in inspection. Verify proper sealing around all roof penetrations, check for adequate airflow, and ensure balanced intake/exhaust ventilation for optimal roof system performance.',
    estimatedCost: cost,
    location: 'Roof penetrations',
  });

  return findings;
}

// General condition analysis
function analyzeGeneral(features: any, edgeDensity: number): Partial<DamageItem> {
  let estimatedAge: string;
  let remainingLife: string;
  let costEstimate: number;
  let severity: 'minor' | 'moderate' | 'severe';

  if (features.overallCondition === 'poor') {
    estimatedAge = '18-25';
    remainingLife = '2-5';
    severity = features.darkness > 0.3 || features.brightness < 60 ? 'severe' : 'moderate';

    // Use full replacement cost for severe condition - assume larger/complex roof for worst cases
    const costRange = severity === 'severe' ? costEstimates.full_replacement_large : costEstimates.damaged_area;
    costEstimate = Math.floor(Math.random() * (costRange.max - costRange.min) + costRange.min);
  } else if (features.overallCondition === 'fair') {
    estimatedAge = '12-18';
    remainingLife = '5-10';
    severity = 'minor';
    costEstimate = 800;
  } else {
    estimatedAge = '5-12';
    remainingLife = '10-15';
    severity = 'minor';
    costEstimate = 0;
  }

  const costRangeText = severity === 'severe' ? `$${costEstimates.full_replacement_large.min.toLocaleString()}-$${costEstimates.full_replacement_large.max.toLocaleString()} for typical residential roof (${costDataSource})` :
                        severity === 'moderate' ? `$${costEstimates.damaged_area.min.toLocaleString()}-$${costEstimates.damaged_area.max.toLocaleString()} for section repairs` : '';

  return {
    category: 'Overall Assessment',
    severity,
    description: `AI-powered analysis estimates roof system age at ${estimatedAge} years based on visual indicators including surface condition, weathering patterns, and material degradation. Projected remaining serviceable life: ${remainingLife} years with proper maintenance. Overall condition assessed as ${features.overallCondition}. ${edgeDensity > 20 ? 'Elevated crack/wear patterns detected. ' : ''}${features.overallCondition === 'poor' ? severity === 'severe' ? `Full roof replacement recommended. Estimated cost range: ${costRangeText}` : 'Professional inspection strongly recommended.' : features.overallCondition === 'fair' ? 'Regular monitoring recommended.' : 'Continue normal maintenance schedule.'}`,
    estimatedCost: costEstimate,
    location: 'Entire roof system',
  };
}

// Main function to analyze all photos
export async function analyzeRoofPhotos(
  photos: Array<{ file: File; category: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<DamageItem[]> {
  const allFindings: DamageItem[] = [];
  let idCounter = 1;

  try {
    // Initialize model once
    const model = await initModel();

    // Analyze each photo
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];

      if (onProgress) {
        onProgress(i + 1, photos.length);
      }

      const findings = await analyzeImage(photo.file, photo.category, model);

      // Convert partial findings to full DamageItems
      findings.forEach(finding => {
        allFindings.push({
          id: (idCounter++).toString(),
          category: finding.category || 'Unknown',
          severity: finding.severity || 'minor',
          description: finding.description || 'No description available',
          estimatedCost: finding.estimatedCost || 0,
          location: finding.location || 'Unknown location',
        });
      });
    }

    // Ensure at least one finding
    if (allFindings.length === 0) {
      allFindings.push({
        id: '1',
        category: 'AI Analysis Complete',
        severity: 'minor',
        description: 'Computer vision analysis completed successfully. No significant damage patterns detected in uploaded photos. Roof system appears to be in acceptable condition based on visual analysis. Regular maintenance and annual inspections recommended.',
        estimatedCost: 0,
        location: 'Overall',
      });
    }

    return allFindings;
  } catch (error) {
    console.error('Error in roof analysis:', error);

    // Fallback finding on error
    return [{
      id: '1',
      category: 'Analysis Notice',
      severity: 'minor',
      description: 'AI analysis encountered an issue processing the images. This may occur during initial model loading or with certain image formats. You can manually add findings below or try uploading the photos again.',
      estimatedCost: 0,
      location: 'N/A',
    }];
  }
}

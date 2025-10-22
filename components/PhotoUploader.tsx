'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import PhotoLightbox from './PhotoLightbox';
import PhotoAnnotator, { Annotation } from './PhotoAnnotator';
import RoofMeasurements from './RoofMeasurements';
import { getWeatherData, getWeatherIcon } from '@/lib/weatherService';
import {
  CustomerInfo,
  PhotoFile,
  PhotoCategory,
  InspectionData,
  RoofMeasurement,
  WeatherData,
} from '@/lib/types';
import {
  validateCustomerInfo,
  validateImageFile,
  formatPhone,
} from '@/lib/validation';
import { showToast } from '@/lib/toast';

interface PhotoUploaderProps {
  onNext: (data: InspectionData) => void;
}

export default function PhotoUploader({ onNext }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<(PhotoFile & { annotations?: string; annotationsData?: Annotation[] })[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    claimNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [annotatingIndex, setAnnotatingIndex] = useState<number | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [roofMeasurements, setRoofMeasurements] = useState<RoofMeasurement | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Cleanup URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, [photos]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      showToast('Some files were rejected. Please check file types and sizes.', 'error');
    }

    // Validate and add accepted files
    const validPhotos: PhotoFile[] = [];
    const invalidFiles: string[] = [];

    acceptedFiles.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation) {
        invalidFiles.push(`${file.name}: ${validation.message}`);
      } else {
        validPhotos.push({
          file,
          preview: URL.createObjectURL(file),
          category: 'general',
        });
      }
    });

    if (invalidFiles.length > 0) {
      showToast(invalidFiles.join(', '), 'error');
    }

    if (validPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...validPhotos]);
      showToast(`${validPhotos.length} photo(s) uploaded successfully`, 'success');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
    showToast('Photo removed', 'info');
  };

  const updatePhotoCategory = (index: number, category: PhotoCategory) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = { ...newPhotos[index], category };
      return newPhotos;
    });
  };

  const handlePhoneChange = (value: string) => {
    setCustomerInfo({ ...customerInfo, phone: value });
    setErrors({ ...errors, phone: '' });
  };

  const handlePhoneBlur = () => {
    if (customerInfo.phone) {
      const formatted = formatPhone(customerInfo.phone);
      setCustomerInfo({ ...customerInfo, phone: formatted });
    }
  };

  const handleFetchWeather = async () => {
    if (!customerInfo.address) {
      showToast('Please enter property address first', 'error');
      return;
    }
    setLoadingWeather(true);
    const weather = await getWeatherData(customerInfo.address);
    if (weather) {
      setWeatherData(weather);
      showToast('Weather data captured', 'success');
    } else {
      showToast('Could not fetch weather data', 'error');
    }
    setLoadingWeather(false);
  };

  const handleAnnotationSave = (dataUrl: string, annotations: Annotation[]) => {
    if (annotatingIndex === null) return;
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[annotatingIndex] = {
        ...newPhotos[annotatingIndex],
        annotations: dataUrl,
        annotationsData: annotations,
      };
      return newPhotos;
    });
    setAnnotatingIndex(null);
    showToast('Annotations saved', 'success');
  };

  const handleExportPhotos = () => {
    photos.forEach((photo, index) => {
      const link = document.createElement('a');
      link.href = photo.annotations || photo.preview;
      link.download = `inspection-photo-${index + 1}.png`;
      link.click();
    });
    showToast('Photos exported', 'success');
  };

  const handleSubmit = () => {
    // Validate photos
    if (photos.length === 0) {
      showToast('Please upload at least one photo', 'error');
      return;
    }

    // Validate customer info
    const validationErrors = validateCustomerInfo(customerInfo);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      showToast('Please fix the form errors before proceeding', 'error');
      return;
    }

    // Clear errors and proceed
    setErrors({});
    onNext({
      photos,
      customerInfo,
      roofMeasurements: roofMeasurements || undefined,
      weatherData: weatherData || undefined
    });
  };

  return (
    <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-xl p-8 border border-uc-blue/10">
      <h2 className="text-2xl font-bold mb-6 text-uc-navy dark:text-white">
        Step 1: Upload Inspection Photos
      </h2>

      {/* Customer Information */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-uc-navy dark:text-slate-200">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Customer Name *"
              value={customerInfo.name}
              onChange={(e) => {
                setCustomerInfo({ ...customerInfo, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Property Address *"
              value={customerInfo.address}
              onChange={(e) => {
                setCustomerInfo({ ...customerInfo, address: e.target.value });
                setErrors({ ...errors, address: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white ${
                errors.address ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white ${
                errors.phone ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={customerInfo.email}
              onChange={(e) => {
                setCustomerInfo({ ...customerInfo, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white ${
                errors.email ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <input
            type="date"
            value={customerInfo.inspectionDate}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, inspectionDate: e.target.value })
            }
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          />

          <input
            type="text"
            placeholder="Insurance Claim Number"
            value={customerInfo.claimNumber}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, claimNumber: e.target.value })
            }
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-uc-blue dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
          />
        </div>
      </div>

      {/* Weather & Roof Measurements */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-slate-300 dark:border-uc-blue/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-uc-navy dark:text-white">Weather Conditions</h4>
            <button
              onClick={handleFetchWeather}
              disabled={loadingWeather || !customerInfo.address}
              className="px-3 py-1 text-sm bg-uc-blue hover:bg-uc-blue-dark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingWeather ? 'Loading...' : 'Capture Weather'}
            </button>
          </div>
          {weatherData ? (
            <div className="space-y-2 text-sm text-uc-navy dark:text-slate-300">
              <p className="flex items-center gap-2">
                <span className="text-2xl">{getWeatherIcon(weatherData.condition)}</span>
                <span className="font-medium">{weatherData.temperature}°F - {weatherData.condition}</span>
              </p>
              <p>Wind: {weatherData.windSpeed} mph | Humidity: {weatherData.humidity}%</p>
              {weatherData.precipitation > 0 && <p>Precipitation: {weatherData.precipitation} in</p>}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No weather data captured</p>
          )}
        </div>

        <div className="border border-slate-300 dark:border-uc-blue/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-uc-navy dark:text-white">Roof Measurements</h4>
            <button
              onClick={() => setShowMeasurements(true)}
              className="px-3 py-1 text-sm bg-uc-blue hover:bg-uc-blue-dark text-white rounded-lg transition-colors"
            >
              {roofMeasurements ? 'Edit' : 'Add'} Measurements
            </button>
          </div>
          {roofMeasurements ? (
            <div className="space-y-1 text-sm text-uc-navy dark:text-slate-300">
              <p><span className="font-medium">{roofMeasurements.totalSquares}</span> squares ({Math.round(roofMeasurements.totalSquares * 100)} sq ft)</p>
              <p>Pitch: {roofMeasurements.pitch} | Type: {roofMeasurements.roofType}</p>
              <p>Age: ~{roofMeasurements.approximateAge} years | {roofMeasurements.stories} {roofMeasurements.stories === 1 ? 'story' : 'stories'}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No measurements added</p>
          )}
        </div>
      </div>

      {/* Photo Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-uc-blue bg-blue-50 dark:bg-uc-blue/10'
            : 'border-slate-300 hover:border-uc-blue dark:border-uc-blue/30 dark:hover:border-uc-blue'
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-4 text-lg text-uc-navy dark:text-slate-300">
          {isDragActive
            ? 'Drop photos here...'
            : 'Drag & drop inspection photos, or click to select'}
        </p>
        <p className="mt-2 text-sm text-uc-navy/60 dark:text-slate-400">
          Supports: JPG, PNG, WEBP (Max 10MB per file)
        </p>
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-uc-navy dark:text-slate-200">
              Uploaded Photos ({photos.length})
            </h3>
            <button
              onClick={handleExportPhotos}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-uc-navy dark:hover:bg-uc-navy-light text-uc-navy dark:text-white rounded-lg transition-colors text-sm font-medium"
            >
              Export All Photos
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div
                  className="relative cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={photo.annotations || photo.preview}
                    alt={`Inspection ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {photo.annotations && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Annotated
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnnotatingIndex(index);
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-uc-blue hover:bg-uc-blue-dark text-white rounded transition-colors"
                    title="Annotate Photo"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index);
                    }}
                    className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    aria-label="Remove photo"
                    title="Remove Photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <select
                  value={photo.category}
                  onChange={(e) => updatePhotoCategory(index, e.target.value as PhotoCategory)}
                  className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white focus:ring-2 focus:ring-uc-blue"
                >
                  <option value="general">General</option>
                  <option value="shingles">Shingles</option>
                  <option value="flashing">Flashing</option>
                  <option value="gutters">Gutters</option>
                  <option value="vents">Vents</option>
                  <option value="chimney">Chimney</option>
                  <option value="damage">Visible Damage</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-uc-blue hover:bg-uc-blue-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={photos.length === 0}
        >
          Next: Analyze Damage
        </button>
      </div>

      {/* Modals */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onAnnotate={(index) => {
            setLightboxIndex(null);
            setAnnotatingIndex(index);
          }}
        />
      )}

      {annotatingIndex !== null && (
        <PhotoAnnotator
          imageUrl={photos[annotatingIndex].preview}
          onSave={handleAnnotationSave}
          onClose={() => setAnnotatingIndex(null)}
          initialAnnotations={photos[annotatingIndex].annotationsData}
        />
      )}

      {showMeasurements && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <RoofMeasurements
              onSave={(measurements) => {
                setRoofMeasurements(measurements);
                setShowMeasurements(false);
                showToast('Roof measurements saved', 'success');
              }}
              initialData={roofMeasurements || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

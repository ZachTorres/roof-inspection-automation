'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CustomerInfo,
  PhotoFile,
  PhotoCategory,
  InspectionData,
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
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    claimNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    onNext({ photos, customerInfo });
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
          <h3 className="text-xl font-semibold mb-4 text-uc-navy dark:text-slate-200">
            Uploaded Photos ({photos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.preview}
                  alt={`Inspection ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <svg
                    className="w-4 h-4"
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
    </div>
  );
}

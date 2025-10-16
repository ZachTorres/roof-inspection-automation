'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface PhotoUploaderProps {
  onNext: (data: any) => void;
}

interface PhotoFile {
  file: File;
  preview: string;
  category: string;
}

export default function PhotoUploader({ onNext }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    claimNumber: '',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      category: 'general',
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
  });

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const updatePhotoCategory = (index: number, category: string) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index].category = category;
      return newPhotos;
    });
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }
    if (!customerInfo.name || !customerInfo.address) {
      alert('Please fill in customer name and address');
      return;
    }
    onNext({ photos, customerInfo });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Step 1: Upload Inspection Photos
      </h2>

      {/* Customer Information */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Customer Name *"
            value={customerInfo.name}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, name: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            placeholder="Property Address *"
            value={customerInfo.address}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, address: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={customerInfo.phone}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, phone: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={customerInfo.email}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, email: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="date"
            value={customerInfo.inspectionDate}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, inspectionDate: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            placeholder="Insurance Claim Number"
            value={customerInfo.claimNumber}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, claimNumber: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Photo Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
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
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          {isDragActive
            ? 'Drop photos here...'
            : 'Drag & drop inspection photos, or click to select'}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Supports: JPG, PNG, WEBP
        </p>
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
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
                  onChange={(e) => updatePhotoCategory(index, e.target.value)}
                  className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Next: Analyze Damage
        </button>
      </div>
    </div>
  );
}

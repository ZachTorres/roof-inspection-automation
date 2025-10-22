// Simple toast notification system (replaces alert())

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];
let toastIdCounter = 0;

export function showToast(message: string, type: ToastType = 'info') {
  const toast: ToastMessage = {
    id: `toast-${++toastIdCounter}`,
    type,
    message,
  };

  toastListeners.forEach(listener => listener(toast));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, dismissToast };
}

// Toast container component
export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            max-w-md p-4 rounded-lg shadow-lg border-l-4 animate-slide-in
            ${toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-100' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-100' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

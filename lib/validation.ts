// Input validation utilities

import { ValidationError, CustomerInfo } from './types';

// Email validation using RFC 5322 simplified regex
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number validation (US format)
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // US phone numbers should have 10 digits
  return cleaned.length === 10 || cleaned.length === 11;
}

// Format phone number to (XXX) XXX-XXXX
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Validate file type for image uploads
export function validateImageFile(file: File): ValidationError | null {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      field: 'file',
      message: 'Invalid file type. Only JPG, PNG, and WEBP images are allowed.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      field: 'file',
      message: 'File size exceeds 10MB limit.',
    };
  }

  return null;
}

// Validate customer information
export function validateCustomerInfo(info: Partial<CustomerInfo>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!info.name || info.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Customer name must be at least 2 characters.',
    });
  }

  if (!info.address || info.address.trim().length < 5) {
    errors.push({
      field: 'address',
      message: 'Property address must be at least 5 characters.',
    });
  }

  if (info.email && !validateEmail(info.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address.',
    });
  }

  if (info.phone && !validatePhone(info.phone)) {
    errors.push({
      field: 'phone',
      message: 'Please enter a valid 10-digit phone number.',
    });
  }

  return errors;
}

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate cost estimate
export function validateCost(cost: number): boolean {
  return typeof cost === 'number' && cost >= 0 && cost <= 1000000 && !isNaN(cost);
}

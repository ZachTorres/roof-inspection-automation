// Core type definitions for the roof inspection application

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  inspectionDate: string;
  claimNumber: string;
}

export interface PhotoFile {
  file: File;
  preview: string;
  category: PhotoCategory;
}

export type PhotoCategory =
  | 'general'
  | 'shingles'
  | 'flashing'
  | 'gutters'
  | 'vents'
  | 'chimney'
  | 'damage';

export type DamageSeverity = 'minor' | 'moderate' | 'severe';

export interface DamageItem {
  id: string;
  category: string;
  severity: DamageSeverity;
  description: string;
  estimatedCost: number;
  location: string;
}

export interface DamageAnalysis {
  damageItems: DamageItem[];
  totalEstimate: number;
}

export interface ReportData {
  reportUrl?: string;
  reportFileName?: string;
  generatedDate?: string;
}

export type ClaimStatus = 'submitted' | 'under-review' | 'approved' | 'denied';

export type FollowUpType = 'adjuster' | 'mortgage' | 'homeowner';

export interface FollowUp {
  id: string;
  type: FollowUpType;
  dueDate: string;
  status: 'pending' | 'completed';
  notes: string;
}

export interface Inspection {
  id: string;
  customerInfo: CustomerInfo;
  analysis: DamageAnalysis;
  reportUrl?: string;
  reportFileName?: string;
  generatedDate?: string;
  claimStatus: ClaimStatus;
  followUps: FollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionData {
  customerInfo: CustomerInfo;
  photos: PhotoFile[];
  analysis?: DamageAnalysis;
  reportUrl?: string;
  reportFileName?: string;
  generatedDate?: string;
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

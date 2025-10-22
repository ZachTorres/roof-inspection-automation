import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Inspection } from './types';

interface StoreState {
  inspections: Inspection[];
  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
  getInspection: (id: string) => Inspection | undefined;
}

export const useInspectionStore = create<StoreState>()(
  persist(
    (set, get) => ({
      inspections: [],

      addInspection: (inspection) =>
        set((state) => ({
          inspections: [...state.inspections, inspection],
        })),

      updateInspection: (id, updates) =>
        set((state) => ({
          inspections: state.inspections.map((inspection) =>
            inspection.id === id ? { ...inspection, ...updates } : inspection
          ),
        })),

      deleteInspection: (id) =>
        set((state) => ({
          inspections: state.inspections.filter((inspection) => inspection.id !== id),
        })),

      getInspection: (id) => {
        return get().inspections.find((inspection) => inspection.id === id);
      },
    }),
    {
      name: 'roof-inspection-storage',
    }
  )
);

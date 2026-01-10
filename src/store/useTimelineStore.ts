import { create } from 'zustand';
import type { Severity, AssetType } from '@/lib/types';

interface TimelineState {
  // Domain
  domain: string;
  
  // Filters
  selectedSeverity: Severity | null;
  selectedAssetType: AssetType | null;
  dateRange: { from: Date | null; to: Date | null };
  
  // UI State
  expandedEventId: string | null;
  isFiltersPanelOpen: boolean;
  
  // Actions
  setDomain: (domain: string) => void;
  setSeverity: (severity: Severity | null) => void;
  setAssetType: (type: AssetType | null) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  toggleEvent: (id: string) => void;
  collapseAllEvents: () => void;
  toggleFiltersPanel: () => void;
  resetFilters: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  domain: 'example.com',
  selectedSeverity: null,
  selectedAssetType: null,
  dateRange: { from: null, to: null },
  expandedEventId: null,
  isFiltersPanelOpen: true,

  setDomain: (domain) => set({ domain }),
  setSeverity: (severity) => set({ selectedSeverity: severity }),
  setAssetType: (type) => set({ selectedAssetType: type }),
  setDateRange: (range) => set({ dateRange: range }),
  toggleEvent: (id) => set((state) => ({ 
    expandedEventId: state.expandedEventId === id ? null : id 
  })),
  collapseAllEvents: () => set({ expandedEventId: null }),
  toggleFiltersPanel: () => set((state) => ({ 
    isFiltersPanelOpen: !state.isFiltersPanelOpen 
  })),
  resetFilters: () => set({
    selectedSeverity: null,
    selectedAssetType: null,
    dateRange: { from: null, to: null },
  }),
}));

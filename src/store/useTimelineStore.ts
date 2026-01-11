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
  
  // Asset History Modal State
  isAssetHistoryModalOpen: boolean;
  assetHistoryDomain: string | null;
  assetHistoryPath: string | null;
  
  // Actions
  setDomain: (domain: string) => void;
  setSeverity: (severity: Severity | null) => void;
  setAssetType: (type: AssetType | null) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  toggleEvent: (id: string) => void;
  collapseAllEvents: () => void;
  toggleFiltersPanel: () => void;
  resetFilters: () => void;
  openAssetHistoryModal: (domain: string, path: string) => void;
  closeAssetHistoryModal: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  domain: '',
  selectedSeverity: null,
  selectedAssetType: null,
  dateRange: { from: null, to: null },
  expandedEventId: null,
  isFiltersPanelOpen: true,
  isAssetHistoryModalOpen: false,
  assetHistoryDomain: null,
  assetHistoryPath: null,

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
  openAssetHistoryModal: (domain, path) => set({ 
    isAssetHistoryModalOpen: true, 
    assetHistoryDomain: domain, 
    assetHistoryPath: path 
  }),
  closeAssetHistoryModal: () => set({ 
    isAssetHistoryModalOpen: false, 
    assetHistoryDomain: null, 
    assetHistoryPath: null 
  }),
}));

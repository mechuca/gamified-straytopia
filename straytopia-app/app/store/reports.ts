import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CareLocationMetadata } from '@/app/lib/location';

const storage = createJSONStorage(() => AsyncStorage);

export type ReportType = 'injured' | 'feeding' | 'water' | 'rescue' | 'sick' | 'aggressive' | 'abandoned' | 'adoption' | 'other';
export type ReportSeverity = 'urgent' | 'today' | 'soon';
export type ReportStatus = 'submitted' | 'reviewing' | 'dispatched' | 'resolved' | 'failed';

export interface Report {
  id: string;
  type: ReportType;
  severity: ReportSeverity;
  location: string;
  description: string;
  photoUri: string | null;
  media?: {
    uri: string;
    fileName?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
  } | null;
  locationMetadata?: CareLocationMetadata | null;
  status: ReportStatus;
  createdAt: number;
  timeline: Array<{ step: string; at: number }>;
}

export interface ReportState {
  reports: Report[];
  draft: Partial<Report> | null;
  startDraft: () => void;
  patchDraft: (patch: Partial<Report>) => void;
  submitReport: () => Report;
  updateReport: (id: string, patch: Partial<Report>) => void;
  reset: () => void;
}

export const useReports = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      draft: null,
      startDraft: () => set({ draft: { id: `SY-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: Date.now() } }),
      patchDraft: (patch) => set((state) => ({
        draft: state.draft ? { ...state.draft, ...patch } : patch,
      })),
      submitReport: () => {
        const draft = get().draft;
        if (!draft) throw new Error('No draft');
        const report: Report = {
          id: draft.id || `SY-${Math.floor(1000 + Math.random() * 9000)}`,
          type: draft.type || 'other',
          severity: draft.severity || 'today',
          location: draft.location || '',
          description: draft.description || '',
          photoUri: draft.photoUri || null,
          media: draft.media ?? null,
          locationMetadata: draft.locationMetadata ?? null,
          status: 'submitted',
          createdAt: draft.createdAt || Date.now(),
          timeline: [{ step: 'Report submitted', at: Date.now() }],
        };
        set((state) => ({
          reports: [report, ...state.reports],
          draft: null,
        }));
        return report;
      },
      updateReport: (id, patch) => set((state) => ({
        reports: state.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })),
      reset: () => set({ reports: [], draft: null }),
    }),
    { name: 'straytopia-reports', storage }
  )
);

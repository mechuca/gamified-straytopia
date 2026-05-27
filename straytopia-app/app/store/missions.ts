import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/app/store/user';
import { usePoints } from '@/app/store/points';
import { insertMissionProof, respondToOpsTaskAssignment, updateMissionProofStatus, upsertMissionTask } from '@/app/lib/spineSync';

const storage = createJSONStorage(() => AsyncStorage);

export type MissionType = 'feeding' | 'water' | 'rescue' | 'medical' | 'urgent';
export type MissionStatus = 'available' | 'accepted' | 'in-progress' | 'proof-pending' | 'verifying' | 'completed' | 'rejected' | 'review';
export type AnimalType = 'dog' | 'cat' | 'bird' | 'other';

export interface Mission {
  id: string;
  source?: 'local' | 'ops';
  opsTaskId?: string | null;
  caseId?: string | null;
  type: MissionType;
  title: string;
  description: string;
  animalType: AnimalType;
  location: string;
  distance: string;
  estimatedTime: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  proofRequired: string;
  impactPoints: number;
  safetyNote: string;
  status: MissionStatus;
  acceptedAt: number | null;
  completedAt: number | null;
  verificationResult: 'verified' | 'review' | 'rejected' | null;
}

export type OpsMissionInput = Pick<Mission, 'id' | 'opsTaskId' | 'caseId' | 'type' | 'title' | 'description' | 'animalType' | 'location' | 'distance' | 'estimatedTime' | 'urgency' | 'proofRequired' | 'impactPoints' | 'safetyNote' | 'status'>;

export interface MissionState {
  missions: Mission[];
  activeMissionId: string | null;
  completedCount: number;
  syncOpsMissions: (missions: OpsMissionInput[]) => void;
  acceptMission: (id: string) => void;
  declineMission: (id: string) => void;
  startProof: (id: string) => void;
  submitProof: (id: string) => void;
  verifyMission: (id: string, result: 'verified' | 'review' | 'rejected') => void;
  verifyMissionFromHub: (id: string, result: 'verified' | 'review' | 'rejected') => void;
  markMissionReviewFromHub: (id: string) => void;
  completeMission: (id: string) => void;
  setActiveMission: (id: string | null) => void;
  reset: () => void;
}

const seedMissions: Mission[] = [
  {
    id: 'm1', type: 'feeding', title: 'Feed two dogs near 12th Main',
    description: 'Two friendly street dogs are waiting near the corner shop on 12th Main. They need a meal.',
    animalType: 'dog', location: '12th Main, Indiranagar', distance: '0.3 km',
    estimatedTime: 15, urgency: 'medium', proofRequired: 'Photo of food bowl with dogs',
    impactPoints: 50, safetyNote: 'Approach slowly. Keep distance if they seem nervous.',
    status: 'available', acceptedAt: null, completedAt: null, verificationResult: null,
  },
  {
    id: 'm2', type: 'water', title: 'Refill water bowls at Park Street',
    description: 'The water station near Park Street is dry. Three cats and a dog rely on it.',
    animalType: 'cat', location: 'Park Street corner', distance: '0.5 km',
    estimatedTime: 10, urgency: 'high', proofRequired: 'Photo of filled water bowl',
    impactPoints: 30, safetyNote: 'Use clean water. Avoid plastic containers.',
    status: 'available', acceptedAt: null, completedAt: null, verificationResult: null,
  },
  {
    id: 'm3', type: 'rescue', title: 'Injured puppy near bus stop',
    description: 'A small puppy with a limp was spotted near the 100 Feet Road bus stop.',
    animalType: 'dog', location: '100 Feet Road bus stop', distance: '0.8 km',
    estimatedTime: 30, urgency: 'critical', proofRequired: 'Photo of the animal and location',
    impactPoints: 100, safetyNote: 'Do not attempt to pick up. Call the volunteer number if available.',
    status: 'available', acceptedAt: null, completedAt: null, verificationResult: null,
  },
  {
    id: 'm4', type: 'medical', title: 'Check on nursing mother cat',
    description: 'A mother cat with kittens was reported behind the temple. Needs a wellness check.',
    animalType: 'cat', location: 'Behind Old Temple, 80 Feet Road', distance: '1.2 km',
    estimatedTime: 20, urgency: 'high', proofRequired: 'Photo of mother and kittens',
    impactPoints: 75, safetyNote: 'Observe from a distance. Do not disturb the nest.',
    status: 'available', acceptedAt: null, completedAt: null, verificationResult: null,
  },
  {
    id: 'm5', type: 'urgent', title: 'Dog trapped in drain near Market',
    description: 'A dog fell into an open drain near the main market. Needs immediate help.',
    animalType: 'dog', location: 'Main Market, 1st cross', distance: '0.6 km',
    estimatedTime: 25, urgency: 'critical', proofRequired: 'Photo showing the situation',
    impactPoints: 120, safetyNote: 'Do not enter the drain. Alert nearby volunteers.',
    status: 'available', acceptedAt: null, completedAt: null, verificationResult: null,
  },
  {
    id: 'm6', type: 'feeding', title: 'Feed the colony near school',
    description: 'A colony of 5-6 dogs gathers near the school gate after 4 PM.',
    animalType: 'dog', location: 'Government School, 5th Main', distance: '0.9 km',
    estimatedTime: 20, urgency: 'low', proofRequired: 'Photo of food bowls',
    impactPoints: 40, safetyNote: 'Best time: after 4 PM when school ends.',
    status: 'available', acceptedAt: null, completedAt: null, verificationResult: null,
  },
];

export const useMissions = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: seedMissions,
      activeMissionId: null,
      completedCount: 0,
      syncOpsMissions: (incoming) => set((state) => {
        const localMissions = state.missions.filter((m) => m.source !== 'ops');
        const existingById = new Map(state.missions.map((m) => [m.id, m]));
        const opsMissions = incoming.map((mission) => {
          const existing = existingById.get(mission.id);
          return {
            ...mission,
            source: 'ops' as const,
            acceptedAt: existing?.acceptedAt ?? null,
            completedAt: existing?.completedAt ?? null,
            verificationResult: existing?.verificationResult ?? null,
            status: existing?.status === 'completed' || existing?.status === 'verifying' ? existing.status : mission.status,
          };
        });
        const activeStillVisible = state.activeMissionId ? [...localMissions, ...opsMissions].some((m) => m.id === state.activeMissionId) : false;
        return { missions: [...opsMissions, ...localMissions], activeMissionId: activeStillVisible ? state.activeMissionId : null };
      }),
      acceptMission: (id) => {
        const mission = get().missions.find((m) => m.id === id);
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === id ? { ...m, status: 'accepted' as const, acceptedAt: Date.now() } : m
          ),
          activeMissionId: id,
        }));

        if (mission) {
          if (mission.source === 'ops' && mission.opsTaskId) {
            void respondToOpsTaskAssignment({ taskId: mission.opsTaskId, response: 'accepted' });
          } else {
            void upsertMissionTask({
              missionId: mission.id,
              missionType: mission.type,
              missionTitle: mission.title,
              severity: mission.urgency,
              status: 'assigned',
              blockName: useUser.getState().neighborhood?.name ?? null,
            });
          }
        }
      },
      declineMission: (id) => {
        const mission = get().missions.find((m) => m.id === id);
        set((state) => ({
          missions: state.missions.map((m) => (m.id === id ? { ...m, status: 'rejected' as const } : m)),
          activeMissionId: state.activeMissionId === id ? null : state.activeMissionId,
        }));
        if (mission?.source === 'ops' && mission.opsTaskId) {
          void respondToOpsTaskAssignment({ taskId: mission.opsTaskId, response: 'declined', reason: 'Declined from mobile.' });
        }
      },
      startProof: (id) => {
        const mission = get().missions.find((m) => m.id === id);
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === id ? { ...m, status: 'in-progress' as const } : m
          ),
        }));
        if (mission) {
          void upsertMissionTask({
            missionId: mission.id,
            opsTaskId: mission.opsTaskId ?? null,
            missionType: mission.type,
            missionTitle: mission.title,
            severity: mission.urgency,
            status: 'in_progress',
            blockName: useUser.getState().neighborhood?.name ?? null,
          });
        }
      },
      submitProof: (id) => {
        const mission = get().missions.find((m) => m.id === id);
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === id ? { ...m, status: 'verifying' as const } : m
          ),
        }));
        if (mission) {
          void upsertMissionTask({
            missionId: mission.id,
            opsTaskId: mission.opsTaskId ?? null,
            missionType: mission.type,
            missionTitle: mission.title,
            severity: mission.urgency,
            status: 'proof_pending',
            blockName: useUser.getState().neighborhood?.name ?? null,
          });
        }
      },
      verifyMission: (id, result) => {
        const mission = get().missions.find((m) => m.id === id);
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status:
                    result === 'verified'
                      ? ('completed' as const)
                      : result === 'review'
                        ? ('review' as const)
                        : ('rejected' as const),
                  verificationResult: result,
                  completedAt: result === 'verified' ? Date.now() : null,
                }
              : m
          ),
          completedCount: result === 'verified' ? get().completedCount + 1 : get().completedCount,
        }));

        if (mission) {
          void upsertMissionTask({
            missionId: mission.id,
            opsTaskId: mission.opsTaskId ?? null,
            missionType: mission.type,
            missionTitle: mission.title,
            severity: mission.urgency,
            status: result === 'verified' ? 'completed' : 'blocked',
            blockName: useUser.getState().neighborhood?.name ?? null,
          });
          void updateMissionProofStatus({
            missionId: mission.id,
            opsTaskId: mission.opsTaskId ?? null,
            verificationStatus: result === 'verified' ? 'verified' : result === 'review' ? 'needs_review' : 'rejected',
          });
        }
      },
      verifyMissionFromHub: (id, result) => set((state) => ({
        missions: state.missions.map((m) => {
          if (m.id !== id) return m;
          if (result === 'verified' && m.status !== 'completed') {
            usePoints.getState().award(m.impactPoints, 'Ops-verified mission');
          }
          return {
                ...m,
                status:
                  result === 'verified'
                    ? ('completed' as const)
                    : result === 'review'
                      ? ('review' as const)
                      : ('rejected' as const),
                verificationResult: result,
                completedAt: result === 'verified' ? (m.completedAt ?? Date.now()) : null,
              };
        }),
        completedCount: result === 'verified' && !state.missions.find((m) => m.id === id && m.status === 'completed')
          ? state.completedCount + 1
          : state.completedCount,
      })),
      markMissionReviewFromHub: (id) => set((state) => ({
        missions: state.missions.map((m) =>
          m.id === id && m.status !== 'completed' ? { ...m, status: 'verifying' as const } : m
        ),
      })),
      completeMission: (id) => set((state) => ({
        missions: state.missions.map((m) =>
          m.id === id ? { ...m, status: 'completed' as const, completedAt: Date.now(), verificationResult: 'verified' } : m
        ),
        completedCount: get().completedCount + 1,
      })),
      setActiveMission: (id) => set({ activeMissionId: id }),
      reset: () => set({ missions: seedMissions, activeMissionId: null, completedCount: 0 }),
    }),
    { name: 'straytopia-missions', storage }
  )
);

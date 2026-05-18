import {
  PawPrint, Droplets, Eye, BookOpen, AlertTriangle, Users,
  Target, Heart, Shield, Trophy, Award, Flame, Zap, Moon,
  Siren, Stethoscope, Clipboard, CheckCircle, Home, MapPin,
  Clock, Camera, FileText, Bell, Star,
} from 'lucide-react';

export type MissionStatus = 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed' | 'expired';

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  status: MissionStatus;
  order: number;
  unlocksAfterMissionId?: string;
  rewardPoints: number;
  rewardHearts: number;
  requiresProof: boolean;
  proofType?: 'photo' | 'note' | 'location' | 'photo_and_location';
  location: string;
  distance: string;
  time: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  safety: string;
  tone: string;
  lat?: number;
  lng?: number;
}

export interface ImpactMetric {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  detailTitle: string;
  detailDescription: string;
  relatedEvents: string[];
  ctaLabel?: string;
}

export interface ImpactEvent {
  id: string;
  title: string;
  animalName?: string;
  location: string;
  timeAgo: string;
  type: 'feeding' | 'water' | 'proof' | 'rescue_report' | 'story';
  status: 'verified' | 'pending' | 'review_needed';
  points: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  state: 'locked' | 'in_progress' | 'earned';
  progressCurrent?: number;
  progressTarget?: number;
  criteria: string;
  tone: string;
  earnedDate?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  zone: string;
  rank: number;
  points: number;
  missionsCompleted: number;
  badgesEarned: number;
  isCurrentUser?: boolean;
  change: 'up' | 'down' | 'same' | 'new';
  tone: string;
  recentActions: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  zone: string;
  careLevel: string;
  nextLevel: string;
  levelThreshold: number;
  points: number;
  streak: number;
  bestStreak: number;
  hearts: number;
  missionsCompleted: number;
  animalsHelped: number;
  badgesEarned: number;
  leaderboardOptIn: boolean;
  avatarLetter: string;
  avatarTone: string;
}

export interface ProofEntry {
  id: string;
  missionTitle: string;
  type: 'photo' | 'note';
  status: 'verified' | 'pending' | 'review_needed';
  timeAgo: string;
  points: number;
}

export interface CareStory {
  id: string;
  type: 'rescue' | 'milestone' | 'before-after' | 'photo' | 'video';
  mediaType?: 'photo' | 'video';
  imageUrl?: string;
  title: string;
  body: string;
  fullBody: string;
  badge: string;
  badgeTone: string;
  helpers: string[];
  hearts: number;
  reporter: string;
  respondent: string;
  date: string;
  location: string;
}

export interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const missions: Mission[] = [
  { id: 'm1', title: 'Offer Food', subtitle: 'Small feeding mission', description: 'Give safe food or biscuits to one stray animal nearby.', icon: PawPrint, status: 'available', order: 1, rewardPoints: 10, rewardHearts: 1, requiresProof: true, proofType: 'photo', location: 'Near your area', distance: '0.3 km', time: 10, urgency: 'medium', safety: 'Keep distance. Do not force interaction.', tone: 'jungle', lat: 12.9716, lng: 77.6412 },
  { id: 'm2', title: 'Refill Water', subtitle: 'Water care mission', description: 'Help a nearby water bowl or water point.', icon: Droplets, status: 'locked', order: 2, unlocksAfterMissionId: 'm1', rewardPoints: 15, rewardHearts: 1, requiresProof: true, proofType: 'photo', location: 'Park Street corner', distance: '0.5 km', time: 10, urgency: 'high', safety: 'Use clean water. Avoid plastic containers.', tone: 'sky', lat: 12.9734, lng: 77.6398 },
  { id: 'm3', title: 'Care Check-in', subtitle: 'Proof and note', description: 'Upload a photo and add a short note about the care action.', icon: Eye, status: 'locked', order: 3, unlocksAfterMissionId: 'm2', rewardPoints: 20, rewardHearts: 1, requiresProof: true, proofType: 'photo_and_location', location: 'Behind Old Temple', distance: '1.2 km', time: 15, urgency: 'medium', safety: 'Observe from a distance.', tone: 'plum', lat: 12.9698, lng: 77.6445 },
  { id: 'm4', title: 'Share Care Story', subtitle: 'Tell a care update', description: 'Share the story of the animal you helped so others can continue care.', icon: BookOpen, status: 'locked', order: 4, unlocksAfterMissionId: 'm3', rewardPoints: 20, rewardHearts: 1, requiresProof: false, proofType: 'note', location: 'Your area', distance: '—', time: 10, urgency: 'low', safety: 'Keep stories factual and respectful.', tone: 'gold', lat: 12.9716, lng: 77.6412 },
  { id: 'm5', title: 'Spot & Report', subtitle: 'Report an animal', description: 'Mark location, condition, and urgency for an animal that may need help.', icon: AlertTriangle, status: 'locked', order: 5, unlocksAfterMissionId: 'm4', rewardPoints: 25, rewardHearts: 1, requiresProof: true, proofType: 'photo_and_location', location: 'Government School area', distance: '0.9 km', time: 15, urgency: 'medium', safety: 'Do not approach aggressive animals.', tone: 'coral', lat: 12.9750, lng: 77.6380 },
  { id: 'm6', title: 'Invite a Care Buddy', subtitle: 'Build your care circle', description: 'Invite one trusted person to join your local care path.', icon: Users, status: 'locked', order: 6, unlocksAfterMissionId: 'm5', rewardPoints: 30, rewardHearts: 2, requiresProof: false, location: 'Your area', distance: '—', time: 5, urgency: 'low', safety: 'Only invite people who genuinely care.', tone: 'jungle', lat: 12.9716, lng: 77.6412 },
];

export const missionChecklists: Record<string, { key: string; label: string }[]> = {
  m1: [
    { key: 'safe_spot', label: 'Found a safe, quiet spot to approach' },
    { key: 'offered_food', label: 'Offered safe food (no spices, no bones)' },
    { key: 'kept_distance', label: 'Kept a respectful distance' },
    { key: 'ready_proof', label: 'Ready to take a proof photo' },
  ],
  m2: [
    { key: 'clean_bowl', label: 'Found or placed a clean water bowl' },
    { key: 'fresh_water', label: 'Filled with fresh, clean water' },
    { key: 'shaded_spot', label: 'Placed bowl in a shaded, safe spot' },
    { key: 'ready_proof', label: 'Ready to take a proof photo' },
  ],
  m3: [
    { key: 'observed_animal', label: 'Observed the animal from a distance' },
    { key: 'noted_condition', label: 'Noted the animal\'s condition (healthy/injured/pregnant)' },
    { key: 'checked_surroundings', label: 'Checked surroundings for hazards' },
    { key: 'ready_proof', label: 'Ready to upload photo and location' },
  ],
  m4: [
    { key: 'recalled_interaction', label: 'Recalled your interaction with the animal' },
    { key: 'wrote_story', label: 'Wrote a short, respectful care story' },
    { key: 'added_details', label: 'Added location and date details' },
    { key: 'ready_share', label: 'Ready to share the story' },
  ],
  m5: [
    { key: 'spotted_animal', label: 'Spotted an animal that may need help' },
    { key: 'assessed_condition', label: 'Assessed condition from a safe distance' },
    { key: 'noted_location', label: 'Noted exact location and landmarks' },
    { key: 'ready_proof', label: 'Ready to take a photo and pin location' },
  ],
  m6: [
    { key: 'identified_buddy', label: 'Identified a trusted person to invite' },
    { key: 'shared_mission', label: 'Shared Straytopia mission with them' },
    { key: 'explained_care', label: 'Explained how care missions work' },
    { key: 'confirmed_interest', label: 'Confirmed their interest in joining' },
  ],
};

export const impactMetrics: ImpactMetric[] = [
  { id: 'im1', title: 'Animals Helped', value: 0, subtitle: 'unique animals', icon: Heart, detailTitle: 'Animals You Helped', detailDescription: 'Complete your first mission to start helping animals.', relatedEvents: [], ctaLabel: 'Start First Mission' },
  { id: 'im2', title: 'Meals Offered', value: 0, subtitle: 'feeding missions', icon: PawPrint, detailTitle: 'Meals Offered', detailDescription: 'Complete feeding missions to provide meals.', relatedEvents: [], ctaLabel: 'Start Feeding Mission' },
  { id: 'im3', title: 'Water Refills', value: 0, subtitle: 'water points active', icon: Droplets, detailTitle: 'Water Refills', detailDescription: 'Refill water points to keep animals hydrated.', relatedEvents: [], ctaLabel: 'Find Water Mission' },
  { id: 'im4', title: 'Proofs Submitted', value: 0, subtitle: 'verified submissions', icon: Camera, detailTitle: 'Proofs Submitted', detailDescription: 'Submit proof photos to verify your care actions.', relatedEvents: [], ctaLabel: 'Submit Another Proof' },
  { id: 'im5', title: 'Stories Shared', value: 0, subtitle: 'care stories', icon: BookOpen, detailTitle: 'Stories Shared', detailDescription: 'Share care stories to inspire others.', relatedEvents: [], ctaLabel: 'Share Another Story' },
  { id: 'im6', title: 'Rescue Reports', value: 0, subtitle: 'cases opened', icon: Shield, detailTitle: 'Rescue Reports', detailDescription: 'File rescue reports to help animals in danger.', relatedEvents: [], ctaLabel: 'File Another Report' },
];

export const impactEvents: ImpactEvent[] = [];

export const badges: Badge[] = [
  { id: 'b1', title: 'First Feeder', description: 'Complete your first feeding mission', icon: PawPrint, state: 'locked', progressCurrent: 0, progressTarget: 1, criteria: 'Complete your first feeding mission', tone: 'jungle' },
  { id: 'b2', title: 'Water Guardian', description: 'Refill 3 water bowls', icon: Droplets, state: 'locked', progressCurrent: 0, progressTarget: 3, criteria: 'Complete 3 water missions', tone: 'sky' },
  { id: 'b3', title: 'Proof Hero', description: 'Submit 5 verified proofs', icon: Camera, state: 'locked', progressCurrent: 0, progressTarget: 5, criteria: 'Submit 5 verified proofs', tone: 'plum' },
  { id: 'b4', title: 'Care Streak', description: 'Complete missions 3 days in a row', icon: Flame, state: 'locked', progressCurrent: 0, progressTarget: 3, criteria: 'Complete missions 3 days in a row', tone: 'gold' },
  { id: 'b5', title: 'Neighborhood Helper', description: 'Help 5 animals in your care zone', icon: Heart, state: 'locked', progressCurrent: 0, progressTarget: 5, criteria: 'Help 5 animals in your care zone', tone: 'coral' },
  { id: 'b6', title: 'Rescue Reporter', description: 'Submit your first rescue report', icon: AlertTriangle, state: 'locked', progressCurrent: 0, progressTarget: 1, criteria: 'Submit your first rescue report', tone: 'coral' },
  { id: 'b7', title: 'Story Keeper', description: 'Share 3 care stories', icon: BookOpen, state: 'locked', progressCurrent: 0, progressTarget: 3, criteria: 'Share 3 care stories', tone: 'gold' },
  { id: 'b8', title: 'Care Champion', description: 'Joined the leaderboard', icon: Trophy, state: 'locked', progressCurrent: 0, progressTarget: 1, criteria: 'Register for the leaderboard', tone: 'sky' },
];

export const leaderboardUsers: LeaderboardUser[] = [
  { id: 'lu1', name: 'Ananya', avatar: 'A', zone: 'Indiranagar', rank: 1, points: 920, missionsCompleted: 32, badgesEarned: 11, change: 'same', tone: 'coral', recentActions: ['Fed 3 animals', 'Refilled 2 water points', 'Shared rescue story'] },
  { id: 'lu2', name: 'Rahul', avatar: 'R', zone: 'Indiranagar', rank: 2, points: 790, missionsCompleted: 25, badgesEarned: 9, change: 'up', tone: 'sky', recentActions: ['Completed rescue mission', 'Submitted 4 proofs'] },
  { id: 'lu3', name: 'Meera', avatar: 'M', zone: 'Indiranagar', rank: 3, points: 710, missionsCompleted: 22, badgesEarned: 8, change: 'up', tone: 'jungle', recentActions: ['Water refill at park', 'Care check-in on kittens'] },
  { id: 'lu4', name: 'Vikram', avatar: 'V', zone: 'Indiranagar', rank: 4, points: 580, missionsCompleted: 18, badgesEarned: 6, change: 'down', tone: 'plum', recentActions: ['Fed colony near school'] },
  { id: 'lu5', name: 'Kavitha', avatar: 'K', zone: 'Indiranagar', rank: 5, points: 490, missionsCompleted: 15, badgesEarned: 5, change: 'same', tone: 'gold', recentActions: ['Shared care story', 'Filed 2 reports'] },
  { id: 'lu6', name: 'Arjun', avatar: 'A', zone: 'Indiranagar', rank: 6, points: 420, missionsCompleted: 13, badgesEarned: 4, change: 'new', tone: 'coral', recentActions: ['First mission completed'] },
  { id: 'lu7', name: 'Priya', avatar: 'P', zone: 'Indiranagar', rank: 7, points: 380, missionsCompleted: 11, badgesEarned: 4, change: 'up', tone: 'sky', recentActions: ['Water refill', 'Feeding mission'] },
];

export const userProfile: UserProfile = {
  id: 'up1', name: 'Sarath', zone: 'Indiranagar Care Zone', careLevel: 'New Helper', nextLevel: 'Kindness Keeper', levelThreshold: 50, points: 0, streak: 0, bestStreak: 0, hearts: 0, missionsCompleted: 0, animalsHelped: 0, badgesEarned: 0, leaderboardOptIn: false, avatarLetter: 'S', avatarTone: 'jungle',
};

export const proofGallery: ProofEntry[] = [];

export const careStories: CareStory[] = [
  { id: 'cs1', type: 'photo', mediaType: 'photo', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', title: 'Pluto found his forever home', body: 'After 3 months of care, the limping tan dog from the bakery was adopted by a family on 100 Feet Road.', fullBody: 'After 3 months of consistent care and feeding, Pluto — a limping tan dog who lived near the bakery on 100 Feet Road — was finally adopted by a loving family. The rescue started when a Straytopia user reported Pluto injured near the bakery. Three helpers coordinated feeding and medical check-ins until he was healthy enough for adoption.', badge: 'ADOPTION', badgeTone: 'plum', helpers: ['A', 'R', 'S'], hearts: 47, reporter: 'Ananya K.', respondent: 'Rahul M.', date: '2 days ago', location: '100 Feet Road, Indiranagar' },
  { id: 'cs2', type: 'video', mediaType: 'video', imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop', title: 'Feeding time at the park', body: 'Daily feeding routine for 12 street dogs near Cubbon Park. Watch how they now recognize our volunteers.', fullBody: 'Every morning at 7 AM, our volunteers arrive at Cubbon Park with fresh food and water. These 12 street dogs have been part of our feeding program for over 6 months. They now recognize the volunteers and gather at the usual spot. This video shows the morning routine.', badge: 'VIDEO', badgeTone: 'sky', helpers: ['M', 'K'], hearts: 89, reporter: 'Meera S.', respondent: 'Meera S.', date: '1 day ago', location: 'Cubbon Park, Bangalore' },
  { id: 'cs3', type: 'photo', mediaType: 'photo', imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop', title: 'Milo gained 2kg in 30 days', body: 'From severely underweight to a healthy, happy pup. Consistent feeding and care check-ins made the difference.', fullBody: 'Milo was found severely underweight near the metro station, weighing just 8kg. A Straytopia helper started daily feeding and water check-ins. Over 30 days, with consistent nutrition and monitoring, Milo gained 2kg and is now at a healthy 10kg.', badge: '30 DAY UPDATE', badgeTone: 'plum', helpers: [], hearts: 64, reporter: 'Meera S.', respondent: 'Meera S.', date: '3 days ago', location: 'Indiranagar Metro Station' },
  { id: 'cs4', type: 'photo', mediaType: 'photo', imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=400&fit=crop', title: 'Rani rescued from busy highway', body: 'A scared mother dog was safely moved from the highway median to a shelter near CMH Road.', fullBody: 'Rani, a pregnant mother dog, was spotted living dangerously on the median of a busy highway near CMH Road. Three Straytopia helpers coordinated a careful rescue over two days. Rani gave birth to 4 healthy puppies a week later.', badge: 'RESCUE', badgeTone: 'coral', helpers: ['K', 'V', 'M'], hearts: 38, reporter: 'Kavitha R.', respondent: 'Vikram P.', date: '5 days ago', location: 'CMH Road, Indiranagar' },
  { id: 'cs5', type: 'video', mediaType: 'video', imageUrl: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=600&h=400&fit=crop', title: 'Water station setup tutorial', body: 'Learn how to set up a permanent water station for stray animals in your neighborhood.', fullBody: 'This video shows step-by-step how to set up a durable water station using simple materials. Place it in a shaded area, use a heavy bowl that won\'t tip over, and refill daily. Over 100 such stations are now active across Bangalore.', badge: 'TUTORIAL', badgeTone: 'jungle', helpers: [], hearts: 45, reporter: 'Straytopia', respondent: 'Bangalore Community', date: '1 week ago', location: 'Bangalore' },
  { id: 'cs6', type: 'photo', mediaType: 'photo', imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&h=400&fit=crop', title: 'Sheru recovered from injury', body: 'Hit by a scooter last month, Sheru is now walking again thanks to quick rescue reports.', fullBody: 'Sheru was hit by a scooter near the 80 Feet Road crossing last month. A passerby quickly filed a rescue report on Straytopia, and within hours, two helpers arrived to assess his condition. Today, Sheru is walking normally.', badge: 'RECOVERY', badgeTone: 'jungle', helpers: ['P', 'A'], hearts: 52, reporter: 'Priya N.', respondent: 'Arjun D.', date: '4 days ago', location: '80 Feet Road, Indiranagar' },
  { id: 'cs7', type: 'milestone', mediaType: 'photo', imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop', title: '12,000 animals helped across India', body: 'From Bangalore to Mumbai, Delhi to Chennai — Straytopia helpers have reached 12,000 unique animals nationwide.', fullBody: 'Straytopia has officially helped 12,000 unique animals across India. What started as a small community in Bangalore has grown into a nationwide movement.', badge: 'NATIONAL MILESTONE', badgeTone: 'gold', helpers: [], hearts: 0, reporter: 'Straytopia', respondent: 'India Community', date: '2 weeks ago', location: 'India' },
  { id: 'cs8', type: 'photo', mediaType: 'photo', imageUrl: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=600&h=400&fit=crop', title: 'Kittens saved from monsoon flood', body: 'A litter of 5 kittens was rescued from a flooded drain in Domlur. All kittens are now safe with a foster family.', fullBody: 'During heavy monsoon rains, a Straytopia helper noticed a litter of 5 kittens trapped in a flooded drain near Domlur Lake. An SOS was triggered, and two rescue operators responded within 30 minutes.', badge: 'RESCUE', badgeTone: 'plum', helpers: ['R', 'S'], hearts: 64, reporter: 'Rahul M.', respondent: 'Straytopia Rescue', date: '1 day ago', location: 'Domlur, Bangalore' },
];

export const communityImpact = {
  zone: {
    name: 'Indiranagar Care Zone',
    helpers: 47,
    animalsHelped: 234,
    missionsCompleted: 892,
    waterPoints: 12,
    rescues: 18,
    storiesShared: 34,
  },
  city: {
    name: 'Bangalore',
    helpers: 1240,
    animalsHelped: 5680,
    missionsCompleted: 18420,
    waterPoints: 100,
    rescues: 342,
    storiesShared: 890,
  },
  national: {
    name: 'India',
    helpers: 12400,
    animalsHelped: 12000,
    missionsCompleted: 89200,
    waterPoints: 840,
    rescues: 2100,
    storiesShared: 4200,
  },
};

export const weeklyCareData = [
  { day: 'Mon', count: 0 }, { day: 'Tue', count: 0 }, { day: 'Wed', count: 0 },
  { day: 'Thu', count: 0 }, { day: 'Fri', count: 0 }, { day: 'Sat', count: 0 },
  { day: 'Sun', count: 0 },
];

export const notificationSettings: NotificationSetting[] = [
  { key: 'mission_reminders', label: 'Mission reminders', description: 'Daily prompts for available missions', enabled: true },
  { key: 'urgent_alerts', label: 'Nearby urgent alerts', description: 'Critical animal situations near you', enabled: true },
  { key: 'badge_updates', label: 'Badge updates', description: 'When you earn or progress toward badges', enabled: true },
  { key: 'leaderboard_updates', label: 'Leaderboard updates', description: 'Weekly rank changes and promotions', enabled: false },
];

export const savedAnimals: { id: string; name: string; type: string; location: string; lastCare: string; missionsCompleted: number; tone: string }[] = [];

export const recognitionCards = [
  { id: 'rc1', title: 'Top 10 in Zone', desc: 'Reach top 10 in your care zone leaderboard', icon: Trophy, tone: 'gold', requirement: 'Earn 500+ care points' },
  { id: 'rc2', title: '7 Day Care Streak', desc: 'Complete at least one mission every day for a week', icon: Flame, tone: 'coral', requirement: 'Maintain 7 consecutive days' },
  { id: 'rc3', title: 'Water Guardian', desc: 'Refill 5 water stations in your zone', icon: Droplets, tone: 'sky', requirement: 'Complete 5 water missions' },
  { id: 'rc4', title: 'Verified Helper', desc: 'Get 10 proof submissions verified', icon: CheckCircle, tone: 'jungle', requirement: '10 verified proofs' },
  { id: 'rc5', title: 'Community Care Champion', desc: 'Help 15 different animals in your zone', icon: Heart, tone: 'coral', requirement: '15 unique animals helped' },
];

import { useEffect, useState } from 'react';
import { ensureAuthed, supabase } from '@/app/lib/supabase';

export type VerifiedStory = {
  id: string;
  title: string;
  body: string;
  badge: string;
  occurred_at: string;
};

export type VerifiedLeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  mission_count: number;
  is_me: boolean;
};

export type VerifiedImpact = {
  stats: {
    completed_missions: number;
    reports_filed: number;
    resolved_reports: number;
    verified_points: number;
  };
  stories: VerifiedStory[];
  leaderboard: VerifiedLeaderboardEntry[];
};

const emptyImpact: VerifiedImpact = {
  stats: { completed_missions: 0, reports_filed: 0, resolved_reports: 0, verified_points: 0 },
  stories: [],
  leaderboard: [],
};

function normalizeImpact(value: unknown): VerifiedImpact {
  const root = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const stats = root.stats && typeof root.stats === 'object' ? root.stats as Record<string, unknown> : {};
  return {
    stats: {
      completed_missions: Number(stats.completed_missions ?? 0),
      reports_filed: Number(stats.reports_filed ?? 0),
      resolved_reports: Number(stats.resolved_reports ?? 0),
      verified_points: Number(stats.verified_points ?? 0),
    },
    stories: Array.isArray(root.stories) ? root.stories as VerifiedStory[] : [],
    leaderboard: Array.isArray(root.leaderboard) ? root.leaderboard as VerifiedLeaderboardEntry[] : [],
  };
}

export function useVerifiedImpact() {
  const [impact, setImpact] = useState<VerifiedImpact>(emptyImpact);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const sb = client;
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        await ensureAuthed();
        const result = await sb.rpc('mobile_get_verified_impact');
        if (!mounted) return;
        setImpact(result.error ? emptyImpact : normalizeImpact(result.data));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const channel = sb
      .channel('mobile_verified_impact')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, []);

  return { impact, loading };
}

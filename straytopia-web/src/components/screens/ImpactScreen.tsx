'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Share2, Bookmark } from 'lucide-react';
import { useApp, Screen } from '@/store/app';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { careStories, communityImpact } from '@/lib/mock';
import { MascotView } from '@/mascot';
import { ScreenHeader, Card, Pill, Skeleton, EmptyState } from '@/components/ui';

const C: ThemeColors = COLOR;

interface ImpactScreenProps {
  setScreen: (s: Screen) => void;
  impactEvents: string[];
  profile: any;
}

export function ImpactScreen({ setScreen, impactEvents, profile }: ImpactScreenProps) {
  const { likedStories, bookmarkedStories, toggleLikeStory, toggleBookmarkStory, skeletonLoading } = useApp();
  const [filter, setFilter] = useState<'zone' | 'city' | 'state'>('zone');
  const [selectedStory, setSelectedStory] = useState<typeof careStories[0] | null>(null);
  const data = communityImpact[filter === 'state' ? 'national' : filter];

  if (selectedStory) {
    const isLiked = likedStories.includes(selectedStory.id);
    const isBookmarked = bookmarkedStories.includes(selectedStory.id);
    return (
      <div className="px-4 pb-[100px]">
        <ScreenHeader title="Story" onBack={() => setSelectedStory(null)} />
        {selectedStory.imageUrl && (
          <div className="rounded-[20px] overflow-hidden mb-4 relative">
            <img src={selectedStory.imageUrl} alt={selectedStory.title} className="w-full h-[220px] object-cover block" />
            {selectedStory.mediaType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={C.jungle}><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <Pill tone={selectedStory.badgeTone} variant="soft">{selectedStory.badge}</Pill>
          <div className="flex items-center gap-2 ml-auto">
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic('select'); toggleLikeStory(selectedStory.id); }} className="bg-none border-none cursor-pointer flex items-center">
              <Heart size={18} color={isLiked ? C.coral : C.muted} fill={isLiked ? C.coral : 'none'} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic('select'); toggleBookmarkStory(selectedStory.id); }} className="bg-none border-none cursor-pointer flex items-center">
              <Bookmark size={18} color={isBookmarked ? C.gold : C.muted} fill={isBookmarked ? C.gold : 'none'} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { if (navigator.share) navigator.share({ title: selectedStory.title, text: selectedStory.body, url: window.location.href }); }} className="bg-none border-none cursor-pointer flex items-center">
              <Share2 size={18} color={C.muted} />
            </motion.button>
          </div>
        </div>
        <div className="font-['Fredoka'] font-semibold text-[22px] mb-2 leading-tight" style={{ color: C.ink }}>{selectedStory.title}</div>
        <div className="flex items-center gap-3 mb-4">
          <div className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.muted }}>{selectedStory.date}</div>
          <div className="flex items-center gap-1"><MapPin size={12} color={C.muted} /><span className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.muted }}>{selectedStory.location}</span></div>
        </div>
        <div className="font-['Nunito'] font-medium text-[15px] leading-relaxed mb-5" style={{ color: C.ink2 }}>{selectedStory.fullBody}</div>
        <div className="flex gap-4 mb-5 p-3.5 rounded-2xl" style={{ backgroundColor: C.surface, border: `2px solid ${C.hairline}` }}>
          <div className="flex-1"><div className="font-['Nunito'] font-extrabold text-[11px] uppercase tracking-[0.06] mb-1" style={{ color: C.muted }}>Reported by</div><div className="font-['Fredoka'] font-semibold text-sm" style={{ color: C.ink }}>{selectedStory.reporter}</div></div>
          <div className="flex-1"><div className="font-['Nunito'] font-extrabold text-[11px] uppercase tracking-[0.06] mb-1" style={{ color: C.muted }}>Responded by</div><div className="font-['Fredoka'] font-semibold text-sm" style={{ color: C.ink }}>{selectedStory.respondent}</div></div>
        </div>
        {selectedStory.helpers.length > 0 && (
          <div className="mb-5">
            <div className="font-['Nunito'] font-extrabold text-[12px] uppercase tracking-[0.06] mb-2" style={{ color: C.muted }}>Helpers involved</div>
            <div className="flex gap-2">
              {selectedStory.helpers.map((h) => (
                <div key={h} className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold font-['Fredoka'] border-2" style={{ backgroundColor: C.sky, borderColor: C.paper }}>{h}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (impactEvents.length === 0 && !skeletonLoading) {
    return (
      <div className="px-4 pb-[100px]">
        <ScreenHeader title="Impact" />
        <EmptyState icon={Heart} title="No impact yet" subtitle="Complete your first mission to start making a difference in your community." actionLabel="Start Mission" onAction={() => setScreen('home')} />
      </div>
    );
  }

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Impact" />
      <MascotView scene="impact_updated" compact />

      <div className="mt-2">
        <div className="flex gap-2 mb-4">
          {[{ key: 'zone' as const, label: 'Neighbourhood' }, { key: 'city' as const, label: 'City' }, { key: 'state' as const, label: 'National' }].map((f) => (
            <motion.button key={f.key} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f.key)} className="flex-1 py-2.5 px-2 rounded-xl border-none font-['Nunito'] font-extrabold text-[12px] uppercase tracking-[0.06] cursor-pointer" style={{ backgroundColor: filter === f.key ? C.jungle : C.surface, color: filter === f.key ? '#fff' : C.ink2 }}>{f.label}</motion.button>
          ))}
        </div>

        {skeletonLoading ? (
          <div className="flex flex-col gap-4 mb-5">
            <Skeleton width="100%" height={120} />
            <Skeleton width="100%" height={180} />
            <Skeleton width="100%" height={180} />
          </div>
        ) : (
          <>
            <div className="mb-5 p-[18px] rounded-[24px]" style={{ backgroundColor: C.jungle }}>
              <div className="font-['Nunito'] font-extrabold text-[11px] text-white/70 uppercase tracking-[0.08] mb-3">{data.name}</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center"><div className="font-['Fredoka'] font-semibold text-[22px] text-white">{typeof data.helpers === 'number' ? data.helpers.toLocaleString() : data.helpers}</div><div className="font-['Nunito'] font-semibold text-[11px] text-white/70">Helpers</div></div>
                <div className="text-center"><div className="font-['Fredoka'] font-semibold text-[22px] text-white">{typeof data.animalsHelped === 'number' ? data.animalsHelped.toLocaleString() : data.animalsHelped}</div><div className="font-['Nunito'] font-semibold text-[11px] text-white/70">Animals</div></div>
                <div className="text-center"><div className="font-['Fredoka'] font-semibold text-[22px] text-white">{typeof data.missionsCompleted === 'number' ? data.missionsCompleted.toLocaleString() : data.missionsCompleted}</div><div className="font-['Nunito'] font-semibold text-[11px] text-white/70">Missions</div></div>
              </div>
            </div>

            <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Care Feed</div>
            <div className="flex flex-col gap-3.5 mb-5">
              {careStories.map((s) => {
                const isLiked = likedStories.includes(s.id);
                const isBookmarked = bookmarkedStories.includes(s.id);
                return (
                  <motion.div key={s.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedStory(s)} className="cursor-pointer">
                    <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: C.surface, border: `2.5px solid ${C.hairline}`, borderBottomWidth: 4 }}>
                      {s.imageUrl && <img src={s.imageUrl} alt={s.title} className="w-full h-40 object-cover block" />}
                      <div className="p-3.5">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill tone={s.badgeTone} variant="soft">{s.badge}</Pill>
                          {s.mediaType === 'video' && <Pill tone="sky" variant="soft">Video</Pill>}
                          <div className="flex items-center gap-2 ml-auto">
                            <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); haptic('select'); toggleLikeStory(s.id); }} className="bg-none border-none cursor-pointer flex items-center">
                              <Heart size={14} color={isLiked ? C.coral : C.muted} fill={isLiked ? C.coral : 'none'} />
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); haptic('select'); toggleBookmarkStory(s.id); }} className="bg-none border-none cursor-pointer flex items-center">
                              <Bookmark size={14} color={isBookmarked ? C.gold : C.muted} fill={isBookmarked ? C.gold : 'none'} />
                            </motion.button>
                          </div>
                        </div>
                        <div className="font-['Fredoka'] font-semibold text-[15px] mb-1.5 leading-tight" style={{ color: C.ink }}>{s.title}</div>
                        <div className="font-['Nunito'] font-medium text-[13px] leading-relaxed" style={{ color: C.ink2 }}>{s.body}</div>
                        <div className="flex items-center gap-2 mt-2.5">
                          <span className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>{s.date}</span>
                          <span className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>·</span>
                          <span className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>{s.location}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-2 p-3.5 rounded-[24px] flex items-center gap-2.5" style={{ backgroundColor: C.paper2 }}>
          <Heart size={18} color={C.coral} />
          <div className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.ink2 }}>Every mission you complete adds to your community's impact. Check your personal stats on the Ranks tab.</div>
        </div>
      </div>
    </div>
  );
}

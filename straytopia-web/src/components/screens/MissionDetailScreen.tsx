'use client';
import { MapPin, Clock, Zap, Shield, AlertCircle } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { Mission } from '@/lib/mock';
import { MascotView } from '@/mascot';
import { ScreenHeader, Pill, Card } from '@/components/ui';
import { MissionMap } from './MissionMap';

const C: ThemeColors = COLOR;

interface MissionDetailScreenProps {
  mission: Mission;
  onBack: () => void;
  onStart: () => void;
  status: string;
}

export function MissionDetailScreen({ mission, onBack, onStart, status }: MissionDetailScreenProps) {
  const MI = mission.icon;

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title={mission.title} onBack={onBack} />
      <MascotView scene="mission_detail" compact />

      <div className="mb-5 p-6 rounded-[24px] mt-4" style={{ backgroundColor: (C as any)[mission.tone] || C.jungle }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <MI size={32} color="#fff" />
          </div>
          <div>
            <div className="font-['Fredoka'] font-semibold text-[22px] text-white mb-1">{mission.title}</div>
            <Pill tone="paper" variant="soft">{mission.urgency}</Pill>
          </div>
        </div>
      </div>

      {mission.lat && mission.lng && (
        <MissionMap lat={mission.lat} lng={mission.lng} location={mission.location} distance={mission.distance} />
      )}

      <div className="flex flex-col gap-3 mb-6">
        {[
          { icon: MapPin, label: mission.location },
          { icon: Clock, label: `${mission.time} min` },
          { icon: Zap, label: `+${mission.rewardPoints} pts` },
          { icon: Shield, label: 'Verified by AI' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ backgroundColor: C.surface, border: `2px solid ${C.hairline}` }}>
            <item.icon size={20} color={C.ink2} />
            <span className="font-['Nunito'] font-semibold text-[15px]" style={{ color: C.ink }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>About this mission</div>
        <div className="font-['Nunito'] font-medium text-[15px] leading-relaxed" style={{ color: C.ink2 }}>{mission.description}</div>
      </div>

      <div className="mb-6">
        <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Safety Tips</div>
        <div className="p-3.5 rounded-[24px] flex items-center gap-2.5" style={{ backgroundColor: C.paper2 }}>
          <AlertCircle size={18} color={C.coral} />
          <div className="font-['Nunito'] font-semibold text-sm" style={{ color: C.ink2 }}>{mission.safety}</div>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={status === 'completed'}
        className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}
      >
        {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'Continue Mission' : 'Start Mission'}
      </button>
    </div>
  );
}

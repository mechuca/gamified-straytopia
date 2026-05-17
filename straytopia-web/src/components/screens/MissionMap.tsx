'use client';
import { MapPin } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';

const C: ThemeColors = COLOR;

interface MissionMapProps {
  lat: number;
  lng: number;
  location: string;
  distance: string;
}

export function MissionMap({ lat, lng, location, distance }: MissionMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.003}%2C${lat - 0.002}%2C${lng + 0.003}%2C${lat + 0.002}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="mb-5">
      <div className="rounded-[20px] overflow-hidden relative h-[180px]" style={{ border: `2px solid ${C.hairline}`, backgroundColor: C.paper2 }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          className="border-none block"
          style={{ filter: 'saturate(0.8) brightness(1.05)' }}
          loading="lazy"
          title="Mission location map"
        />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="rounded-[14px] p-2.5 flex items-center justify-between" style={{ backgroundColor: C.surface, backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.jungle }}>
                <MapPin size={16} color="#fff" />
              </div>
              <div>
                <div className="font-['Fredoka'] font-semibold text-sm" style={{ color: C.ink }}>{location}</div>
                <div className="font-['Nunito'] font-semibold text-xs" style={{ color: C.muted }}>{distance} away</div>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[10px] px-3.5 py-2 no-underline"
              style={{ backgroundColor: C.jungle }}
            >
              <div className="font-['Fredoka'] font-semibold text-sm text-white">Navigate</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

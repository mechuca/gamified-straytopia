'use client';
import { useState, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { Mission } from '@/lib/mock';
import { MascotView } from '@/mascot';
import { ScreenHeader } from '@/components/ui';

const C: ThemeColors = COLOR;

interface ProofUploadScreenProps {
  mission: Mission;
  onBack: () => void;
  onSuccess: () => void;
}

export function ProofUploadScreen({ mission, onBack, onSuccess }: ProofUploadScreenProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    haptic('medium');
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onSuccess, 500);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Submit Proof" onBack={onBack} />
      <MascotView scene="proof_required" compact />

      <div className="flex flex-col items-center gap-6 py-6">
        <div className="w-[100px] h-[100px] rounded-[28px] flex items-center justify-center" style={{ backgroundColor: C.paper2, border: `3px dashed ${C.hairline2}` }}>
          <Camera size={40} color={C.muted} />
        </div>
        <div className="font-['Fredoka'] font-semibold text-xl text-center" style={{ color: C.ink }}>Take a photo of your care action</div>
        <div className="font-['Nunito'] font-medium text-[15px] text-center max-w-[280px] leading-relaxed" style={{ color: C.ink2 }}>AI will verify your proof and award points</div>

        {uploading && (
          <div className="w-full max-w-[280px]">
            <div className="h-2 rounded-sm overflow-hidden mb-2" style={{ backgroundColor: C.paper2 }}>
              <div className="h-full rounded-sm" style={{ width: `${progress}%`, backgroundColor: C.jungle, transition: 'width 0.2s ease' }} />
            </div>
            <div className="font-['Nunito'] font-semibold text-[13px] text-center" style={{ color: C.muted }}>AI Verification: {progress}%</div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
          style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : 'Upload Photo'}
        </button>
      </div>
    </div>
  );
}

'use client';
import { motion } from 'framer-motion';
import { MascotState } from './mascot.types';

interface MascotProps {
  state: MascotState;
  size?: number;
  prefersReducedMotion?: boolean;
}

const BODY_COLOR = '#E9B97A';
const BODY_DARK = '#9C6A38';
const BODY_LIGHT = '#F6D9A9';
const OUTLINE = '#1A1B1F';
const NOSE = '#1A1B1F';
const BLUSH = '#F09A8A';
const WHITE = '#fff';

export function Mascot({ state, size = 80, prefersReducedMotion }: MascotProps) {
  const isReduced = prefersReducedMotion;

  // Eye configurations per state
  const getEyes = () => {
    switch (state) {
      case 'happy':
      case 'celebrating':
      case 'missionComplete':
      case 'participationConfirmed':
      case 'proud':
      case 'impactProud':
        return (
          <>
            <path d="M78 76 Q84 82 90 76" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M110 76 Q116 82 122 76" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
          </>
        );
      case 'worried':
      case 'errorSupport':
        return (
          <>
            <path d="M78 80 Q84 76 90 80" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M110 80 Q116 76 122 80" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
          </>
        );
      case 'curious':
      case 'guideMission':
      case 'unlockNext':
        return (
          <>
            <circle cx="84" cy="78" r="6" fill={OUTLINE} />
            <circle cx="116" cy="78" r="6" fill={OUTLINE} />
            <circle cx="86" cy="76" r="2.5" fill={WHITE} />
            <circle cx="118" cy="76" r="2.5" fill={WHITE} />
          </>
        );
      case 'sleepy':
      case 'calmNeutral':
      case 'cancelNeutral':
        return (
          <>
            <path d="M78 80 Q84 78 90 80" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M110 80 Q116 78 122 80" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
          </>
        );
      default:
        return (
          <>
            <circle cx="84" cy="78" r="6" fill={OUTLINE} />
            <circle cx="116" cy="78" r="6" fill={OUTLINE} />
            <circle cx="86" cy="76" r="2" fill={WHITE} />
            <circle cx="118" cy="76" r="2" fill={WHITE} />
          </>
        );
    }
  };

  // Mouth configurations per state
  const getMouth = () => {
    switch (state) {
      case 'happy':
      case 'celebrating':
      case 'missionComplete':
      case 'participationConfirmed':
      case 'proud':
      case 'impactProud':
        return (
          <path d="M92 104 Q100 114 108 104" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
        );
      case 'worried':
      case 'errorSupport':
        return (
          <path d="M94 108 Q100 104 106 108" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
        );
      case 'curious':
      case 'guideMission':
      case 'unlockNext':
        return (
          <>
            <ellipse cx="100" cy="106" rx="4" ry="5" fill={OUTLINE} />
            <ellipse cx="100" cy="105" rx="2" ry="2" fill={WHITE} />
          </>
        );
      default:
        return (
          <path d="M100 100 Q100 108 94 110 M100 100 Q100 108 106 110" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
        );
    }
  };

  // Tail animation per state
  const getTailAnimation = () => {
    if (isReduced) return {};
    switch (state) {
      case 'happy':
      case 'celebrating':
      case 'missionComplete':
      case 'participationConfirmed':
      case 'proud':
      case 'impactProud':
        return { rotate: [0, 15, -10, 15, 0] };
      case 'curious':
      case 'guideMission':
      case 'unlockNext':
        return { rotate: [0, 8, -5, 8, 0] };
      case 'worried':
      case 'errorSupport':
        return { rotate: [0, -3, 2, -3, 0] };
      default:
        return { rotate: [0, 5, -3, 5, 0] };
    }
  };

  // Body bounce per state
  const getBodyAnimation = () => {
    if (isReduced) return {};
    switch (state) {
      case 'celebrating':
      case 'missionComplete':
      case 'participationConfirmed':
        return { y: [0, -6, 0] };
      case 'welcome':
      case 'guideMission':
      case 'unlockNext':
        return { y: [0, -3, 0] };
      default:
        return { y: [0, -2, 0] };
    }
  };

  const tailDuration = state === 'celebrating' || state === 'happy' ? 0.6 : 1.2;
  const bodyDuration = state === 'celebrating' ? 0.5 : 2.6;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      animate={getBodyAnimation()}
      transition={{ duration: bodyDuration, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label={`Mascot ${state}`}
    >
      {/* Shadow */}
      <ellipse cx="100" cy="184" rx="62" ry="8" fill="rgba(0,0,0,0.12)" />

      {/* Tail */}
      <motion.path
        d="M155 120 Q175 105 170 88 Q168 80 162 84"
        fill={BODY_COLOR}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={getTailAnimation()}
        transition={{ duration: tailDuration, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '155px 120px' }}
      />

      {/* Body */}
      <ellipse cx="100" cy="135" rx="58" ry="44" fill={BODY_COLOR} />
      <ellipse cx="100" cy="135" rx="58" ry="44" fill="none" stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="100" cy="148" rx="34" ry="22" fill={BODY_LIGHT} />

      {/* Head */}
      <circle cx="100" cy="78" r="48" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="4" />

      {/* Ears */}
      <path d="M58 56 Q44 50 42 78 Q44 96 64 88 Z" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <path d="M142 56 Q156 50 158 78 Q156 96 136 88 Z" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />

      {/* Blush */}
      <ellipse cx="70" cy="92" rx="9" ry="5" fill={BLUSH} opacity="0.7" />
      <ellipse cx="130" cy="92" rx="9" ry="5" fill={BLUSH} opacity="0.7" />

      {/* Snout */}
      <ellipse cx="100" cy="95" rx="22" ry="16" fill={BODY_LIGHT} />

      {/* Eyes */}
      {getEyes()}

      {/* Nose */}
      <ellipse cx="100" cy="96" rx="5.5" ry="4" fill={NOSE} />

      {/* Mouth */}
      {getMouth()}

      {/* Paws */}
      <ellipse cx="78" cy="174" rx="14" ry="9" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="122" cy="174" rx="14" ry="9" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" />

      {/* Celebration sparkles */}
      {(state === 'celebrating' || state === 'missionComplete' || state === 'participationConfirmed') && !isReduced && (
        <>
          <motion.circle cx="40" cy="40" r="3" fill="#FFC83D" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
          <motion.circle cx="160" cy="35" r="3" fill="#2DC653" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
          <motion.circle cx="150" cy="55" r="2.5" fill="#FF5A4A" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }} />
          <motion.circle cx="45" cy="60" r="2.5" fill="#1CB0F6" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.9 }} />
        </>
      )}
    </motion.svg>
  );
}

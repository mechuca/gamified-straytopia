'use client';
import { motion } from 'framer-motion';
import { MascotMood, MascotTrigger } from './mascotTypes';

interface SaathiProps {
  mood: MascotMood;
  trigger: MascotTrigger;
  size?: number;
  prefersReducedMotion?: boolean;
}

const BODY = '#E9B97A';
const BODY_DARK = '#9C6A38';
const BODY_LIGHT = '#F6D9A9';
const OUTLINE = '#1A1B1F';
const BLUSH = '#F09A8A';
const WHITE = '#fff';

function Eyes({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'happy':
    case 'celebrating':
    case 'proud':
      return (
        <>
          <path d="M78 76 Q84 82 90 76" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M110 76 Q116 82 122 76" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
        </>
      );
    case 'concerned':
      return (
        <>
          <path d="M78 80 Q84 76 90 80" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M110 80 Q116 76 122 80" fill="none" stroke={OUTLINE} strokeWidth="4.5" strokeLinecap="round" />
        </>
      );
    case 'thinking':
    case 'encouraging':
      return (
        <>
          <circle cx="84" cy="78" r="6" fill={OUTLINE} />
          <circle cx="116" cy="78" r="6" fill={OUTLINE} />
          <circle cx="86" cy="76" r="2.5" fill={WHITE} />
          <circle cx="118" cy="76" r="2.5" fill={WHITE} />
        </>
      );
    case 'serious':
    case 'calm':
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
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'happy':
    case 'celebrating':
    case 'proud':
      return <path d="M92 104 Q100 114 108 104" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />;
    case 'concerned':
      return <path d="M94 108 Q100 104 106 108" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />;
    case 'thinking':
    case 'encouraging':
      return (
        <>
          <ellipse cx="100" cy="106" rx="4" ry="5" fill={OUTLINE} />
          <ellipse cx="100" cy="105" rx="2" ry="2" fill={WHITE} />
        </>
      );
    default:
      return <path d="M100 100 Q100 108 94 110 M100 100 Q100 108 106 110" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />;
  }
}

export function Saathi({ mood, trigger, size = 80, prefersReducedMotion = false }: SaathiProps) {
  const isReduced = prefersReducedMotion;

  const bodyAnim = !isReduced && (mood === 'celebrating' || mood === 'proud')
    ? { y: [0, -4, 0] }
    : !isReduced && (mood === 'happy' || mood === 'encouraging')
    ? { y: [0, -2, 0] }
    : {};

  const bodyDur = mood === 'celebrating' ? 0.5 : 2.6;

  const tailAnim = !isReduced && (mood === 'celebrating' || mood === 'happy' || mood === 'proud')
    ? { rotate: [0, 12, -8, 12, 0] }
    : !isReduced && mood === 'thinking'
    ? { rotate: [0, 6, -4, 6, 0] }
    : !isReduced
    ? { rotate: [0, 4, -2, 4, 0] }
    : {};

  const tailDur = mood === 'celebrating' ? 0.5 : 1.2;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      animate={bodyAnim}
      transition={{ duration: bodyDur, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label={`Saathi mascot: ${mood}`}
    >
      <ellipse cx="100" cy="184" rx="62" ry="8" fill="rgba(0,0,0,0.12)" />
      <motion.path
        d="M155 120 Q175 105 170 88 Q168 80 162 84"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={tailAnim}
        transition={{ duration: tailDur, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '155px 120px' }}
      />
      <ellipse cx="100" cy="135" rx="58" ry="44" fill={BODY} />
      <ellipse cx="100" cy="135" rx="58" ry="44" fill="none" stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="100" cy="148" rx="34" ry="22" fill={BODY_LIGHT} />
      <circle cx="100" cy="78" r="48" fill={BODY} stroke={OUTLINE} strokeWidth="4" />
      <path d="M58 56 Q44 50 42 78 Q44 96 64 88 Z" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <path d="M142 56 Q156 50 158 78 Q156 96 136 88 Z" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="70" cy="92" rx="9" ry="5" fill={BLUSH} opacity="0.7" />
      <ellipse cx="130" cy="92" rx="9" ry="5" fill={BLUSH} opacity="0.7" />
      <ellipse cx="100" cy="95" rx="22" ry="16" fill={BODY_LIGHT} />
      <Eyes mood={mood} />
      <ellipse cx="100" cy="96" rx="5.5" ry="4" fill={OUTLINE} />
      <Mouth mood={mood} />
      <ellipse cx="78" cy="174" rx="14" ry="9" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="122" cy="174" rx="14" ry="9" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="4" />
      {(mood === 'celebrating' || mood === 'proud') && !isReduced && (
        <>
          <motion.circle cx="40" cy="40" r="3" fill="#FFC83D" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
          <motion.circle cx="160" cy="35" r="3" fill="#2DC653" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
          <motion.circle cx="150" cy="55" r="2.5" fill="#FF5A4A" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }} />
        </>
      )}
    </motion.svg>
  );
}

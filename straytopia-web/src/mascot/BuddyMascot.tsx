'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, TargetAndTransition } from 'framer-motion';
import { BUDDY_POSES, SCENE_TO_POSE } from '@/lib/masko';
import { Saathi } from './Saathi';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface BuddyMascotProps {
  scene: string;
  size?: number;
  prefersReducedMotion?: boolean;
}

const POSE_ANIMATIONS: Record<string, TargetAndTransition> = {
  idle: {
    y: [0, -3, 0],
    transition: { duration: 3, repeat: Infinity, ease: [0.22, 1, 0.36, 1] },
  },
  wave: {
    scale: [1, 1.05, 1],
    transition: { duration: 1.5, repeat: 2, ease: [0.22, 1, 0.36, 1] },
  },
  celebrate: {
    y: [0, -8, 0],
    scale: [1, 1.08, 1],
    transition: { duration: 0.8, repeat: 2, ease: [0.22, 1, 0.36, 1] },
  },
  alert: {
    y: [0, -4, 0],
    transition: { duration: 1, repeat: 2, ease: [0.22, 1, 0.36, 1] },
  },
  thinking: {
    rotate: [0, -3, 3, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1] },
  },
  loading: {
    y: [0, -2, 0],
    transition: { duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] },
  },
  empty: {
    y: [0, -2, 0],
    transition: { duration: 3, repeat: Infinity, ease: [0.22, 1, 0.36, 1] },
  },
  sad: {
    y: [0, 2, 0],
    transition: { duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] },
  },
  rescue: {
    scale: [1, 1.04, 1],
    transition: { duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] },
  },
};

export function BuddyMascot({ scene, size = 80, prefersReducedMotion = false }: BuddyMascotProps) {
  const darkMode = useApp((s) => s.darkMode);
  const COLOR = getTheme(darkMode);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const poseName = SCENE_TO_POSE[scene] || 'idle';
  const pose = BUDDY_POSES[poseName] || BUDDY_POSES.idle;
  const anim = POSE_ANIMATIONS[poseName] || POSE_ANIMATIONS.idle;

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    const img = new Image();
    img.src = pose.url;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
  }, [pose.url]);

  if (prefersReducedMotion || imageError) {
    return <Saathi mood={getMoodFromPose(poseName)} trigger={getTriggerFromPose(poseName)} size={size} prefersReducedMotion={prefersReducedMotion} />;
  }

  if (!imageLoaded) {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale: [0.9, 1, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: size * 0.6, height: size * 0.6, borderRadius: '50%', backgroundColor: COLOR.jungleSoft }}
        />
      </div>
    );
  }

  return (
    <motion.div
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      animate={anim}
    >
      <img
        src={pose.url}
        alt={pose.alt}
        style={{ width: size, height: size, objectFit: 'contain', imageRendering: 'auto' }}
        draggable={false}
      />
    </motion.div>
  );
}

function getMoodFromPose(pose: string) {
  const map: Record<string, 'calm' | 'happy' | 'proud' | 'thinking' | 'concerned' | 'celebrating' | 'encouraging' | 'serious'> = {
    idle: 'calm', wave: 'happy', celebrate: 'celebrating', sad: 'concerned',
    alert: 'thinking', thinking: 'thinking', rescue: 'proud', loading: 'thinking', empty: 'calm',
  };
  return map[pose] || 'calm';
}

function getTriggerFromPose(pose: string) {
  const map: Record<string, 'wave' | 'point' | 'celebrate' | 'unlock' | 'blink' | 'focus' | 'none'> = {
    idle: 'none', wave: 'wave', celebrate: 'celebrate', sad: 'blink',
    alert: 'blink', thinking: 'blink', rescue: 'focus', loading: 'blink', empty: 'none',
  };
  return map[pose] || 'none';
}

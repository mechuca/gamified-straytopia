'use client';
import { useState, useEffect, useCallback } from 'react';
import { MascotState } from './mascot.types';
import { MASCOT_MESSAGES } from './mascotConfig';

interface UseMascotSceneProps {
  screen: string;
  tab: string;
  missionsCompleted: number;
  leaderboardOptedIn: boolean;
  hasName: boolean;
  hasActiveMission: boolean;
  justCompleted: boolean;
  showConfirmDialog: boolean;
  justCancelled: boolean;
  prefersReducedMotion: boolean;
}

export function useMascotScene({
  screen, tab, missionsCompleted, leaderboardOptedIn,
  hasName, hasActiveMission, justCompleted, showConfirmDialog,
  justCancelled, prefersReducedMotion,
}: UseMascotSceneProps) {
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [bubbleSub, setBubbleSub] = useState<string | undefined>();

  const showMessage = useCallback((state: MascotState, duration = 4000) => {
    const msg = MASCOT_MESSAGES[state];
    if (!msg) return;
    setMascotState(state);
    setBubbleText(msg.text);
    setBubbleSub(msg.sub);
    setShowBubble(true);
    if (!prefersReducedMotion) {
      const t = setTimeout(() => setShowBubble(false), duration);
      return () => clearTimeout(t);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (justCancelled) {
      showMessage('cancelNeutral', 3000);
      return;
    }
    if (justCompleted) {
      showMessage('missionComplete', 5000);
      return;
    }
    if (showConfirmDialog) {
      showMessage('confirmParticipation', 6000);
      return;
    }

    switch (screen) {
      case 'onboarding':
        showMessage('welcome', 5000);
        break;
      case 'home':
        if (missionsCompleted === 0 && !hasActiveMission) {
          showMessage('guideMission', 5000);
        } else if (hasActiveMission) {
          showMessage('missionOpen', 4000);
        } else if (missionsCompleted > 0) {
          showMessage('curious', 4000);
        } else {
          showMessage('idle', 3000);
        }
        break;
      case 'success':
        showMessage('celebrating', 5000);
        break;
      case 'stories':
        if (missionsCompleted > 0) {
          showMessage('impactProud', 4000);
        } else {
          showMessage('curious', 4000);
        }
        break;
      case 'league':
        if (!leaderboardOptedIn) {
          showMessage('leaderboardCTA', 5000);
        } else {
          showMessage('proud', 4000);
        }
        break;
      case 'profile':
        if (!hasName) {
          showMessage('profileEmpty', 4000);
        } else {
          showMessage('profileComplete', 4000);
        }
        break;
      case 'verify':
        showMessage('calmNeutral', 3000);
        break;
      case 'report-submitted':
        showMessage('proud', 4000);
        break;
      default:
        showMessage('idle', 3000);
        break;
    }
  }, [screen, tab, missionsCompleted, leaderboardOptedIn, hasName, hasActiveMission, justCompleted, showConfirmDialog, justCancelled, showMessage]);

  return { mascotState, showBubble, bubbleText, bubbleSub, setMascotState, setShowBubble };
}

import { Easing, withTiming, withSpring, withRepeat, withSequence, withDelay } from 'react-native-reanimated';
import { MOTION } from './theme';

export const D = MOTION.duration;
export const E = {
  out: Easing.bezierFn(...MOTION.easing.out),
  spring: Easing.bezierFn(...MOTION.easing.spring),
};
export const S = MOTION.spring;

export function timingPress(depth: number) {
  return withSpring(depth, S.press);
}

export function timingRelease() {
  return withSpring(0, S.press);
}

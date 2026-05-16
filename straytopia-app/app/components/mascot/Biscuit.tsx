import React from 'react';
import Svg, { Ellipse, Circle, Path } from 'react-native-svg';

interface BiscuitProps {
  size?: number;
  mood?: 'happy' | 'wow' | 'sleepy';
}

export function Biscuit({ size = 200, mood = 'happy' }: BiscuitProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Ellipse cx="100" cy="184" rx="62" ry="8" fill="rgba(0,0,0,0.12)" />
      <Ellipse cx="100" cy="135" rx="58" ry="44" fill="#E9B97A" />
      <Ellipse cx="100" cy="135" rx="58" ry="44" fill="none" stroke="#1A1B1F" strokeWidth="4" />
      <Ellipse cx="100" cy="148" rx="34" ry="22" fill="#F6D9A9" />
      <Path d="M155 120 Q175 105 170 88 Q168 80 162 84" fill="#E9B97A" stroke="#1A1B1F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="100" cy="78" r="48" fill="#E9B97A" stroke="#1A1B1F" strokeWidth="4" />
      <Path d="M58 56 Q44 50 42 78 Q44 96 64 88 Z" fill="#9C6A38" stroke="#1A1B1F" strokeWidth="4" strokeLinejoin="round" />
      <Path d="M142 56 Q156 50 158 78 Q156 96 136 88 Z" fill="#9C6A38" stroke="#1A1B1F" strokeWidth="4" strokeLinejoin="round" />
      <Ellipse cx="70" cy="92" rx="9" ry="5" fill="#F09A8A" opacity="0.7" />
      <Ellipse cx="130" cy="92" rx="9" ry="5" fill="#F09A8A" opacity="0.7" />
      <Ellipse cx="100" cy="95" rx="22" ry="16" fill="#F6D9A9" />
      {mood === 'happy' && (
        <>
          <Path d="M78 76 Q84 82 90 76" fill="none" stroke="#1A1B1F" strokeWidth="4.5" strokeLinecap="round" />
          <Path d="M110 76 Q116 82 122 76" fill="none" stroke="#1A1B1F" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}
      {mood === 'wow' && (
        <>
          <Circle cx="84" cy="78" r="6" fill="#1A1B1F" />
          <Circle cx="116" cy="78" r="6" fill="#1A1B1F" />
          <Circle cx="86" cy="76" r="2" fill="#fff" />
          <Circle cx="118" cy="76" r="2" fill="#fff" />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <Path d="M78 80 Q84 78 90 80" fill="none" stroke="#1A1B1F" strokeWidth="4.5" strokeLinecap="round" />
          <Path d="M110 80 Q116 78 122 80" fill="none" stroke="#1A1B1F" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}
      <Ellipse cx="100" cy="96" rx="5.5" ry="4" fill="#1A1B1F" />
      <Path d="M100 100 Q100 108 94 110 M100 100 Q100 108 106 110" fill="none" stroke="#1A1B1F" strokeWidth="3.5" strokeLinecap="round" />
      <Ellipse cx="78" cy="174" rx="14" ry="9" fill="#9C6A38" stroke="#1A1B1F" strokeWidth="4" />
      <Ellipse cx="122" cy="174" rx="14" ry="9" fill="#9C6A38" stroke="#1A1B1F" strokeWidth="4" />
    </Svg>
  );
}

export function BiscuitMini({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx="24" cy="24" r="22" fill="#E9B97A" stroke="#1A1B1F" strokeWidth="3" />
      <Ellipse cx="11" cy="14" rx="5" ry="6" fill="#9C6A38" stroke="#1A1B1F" strokeWidth="3" />
      <Ellipse cx="37" cy="14" rx="5" ry="6" fill="#9C6A38" stroke="#1A1B1F" strokeWidth="3" />
      <Ellipse cx="17" cy="24" rx="2.5" ry="3" fill="#1A1B1F" />
      <Ellipse cx="31" cy="24" rx="2.5" ry="3" fill="#1A1B1F" />
      <Ellipse cx="24" cy="31" rx="3" ry="2.2" fill="#1A1B1F" />
      <Path d="M24 33 Q22 36 19 36 M24 33 Q26 36 29 36" stroke="#1A1B1F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

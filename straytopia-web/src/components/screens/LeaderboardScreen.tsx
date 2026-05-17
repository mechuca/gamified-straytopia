'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { leaderboardUsers } from '@/lib/mock';
import { MascotView } from '@/mascot';
import { ScreenHeader, Card, Avatar } from '@/components/ui';

const C: ThemeColors = COLOR;

interface LeaderboardScreenProps {
  setScreen: (s: any) => void;
  users: typeof leaderboardUsers;
  profile: any;
  onJoin: () => void;
  onCancel: () => void;
  name: string;
  setName: (n: string) => void;
  phone: string;
  setPhone: (p: string) => void;
  gender: string;
  setGender: (g: string) => void;
  neighborhood: string;
}

export function LeaderboardScreen({
  setScreen, users, profile, onJoin, onCancel,
  name, setName, phone, setPhone, gender, setGender, neighborhood,
}: LeaderboardScreenProps) {
  const [showRegister, setShowRegister] = useState(!profile.leaderboardOptIn);
  const [regStep, setRegStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [consents, setConsents] = useState({ c1: false, c2: false, c3: false });
  const [localName, setLocalName] = useState(name);
  const [localPhone, setLocalPhone] = useState(phone);
  const [localGender, setLocalGender] = useState(gender);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [locations, setLocations] = useState<string[]>(neighborhood ? [neighborhood] : []);
  const [locationSearch, setLocationSearch] = useState('');

  const allConsented = consents.c1 && consents.c2 && consents.c3;
  const canRegister = allConsented && localName.trim().length > 0 && otpVerified;
  const phoneValid = /^(\+91[\s]?)?[6-9]\d{9}$/.test(localPhone.replace(/\s/g, ''));

  const handleSendOtp = () => { if (phoneValid) setOtp(''); setRegStep('otp'); };
  const handleVerifyOtp = () => { if (otp.length === 4) { setOtpVerified(true); setRegStep('details'); } };
  const handleAddLocation = (loc: string) => { if (loc && !locations.includes(loc)) setLocations([...locations, loc]); setLocationSearch(''); };
  const handleRemoveLocation = (loc: string) => setLocations(locations.filter((l) => l !== loc));

  const handleJoin = () => {
    setName(localName);
    setPhone(localPhone);
    setGender(localGender);
    onJoin();
    setShowRegister(false);
  };

  const neighborhoods = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Electronic City', 'Jayanagar', 'BTM Layout', 'Marathahalli', 'MG Road', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur'];
  const filteredLocations = locationSearch ? neighborhoods.filter((n) => n.toLowerCase().includes(locationSearch.toLowerCase()) && !locations.includes(n)) : [];

  if (!showRegister && profile.leaderboardOptIn) {
    return (
      <div className="px-4 pb-[100px]">
        <ScreenHeader title="Ranks" />
        <MascotView scene="leaderboard_success" compact />

        <div className="mb-4 mt-3 p-4 rounded-[24px]" style={{ backgroundColor: C.jungle }}>
          <div className="flex items-center gap-3">
            <Avatar name={profile.name} size={44} tone={profile.avatarTone} />
            <div className="flex-1">
              <div className="font-['Fredoka'] font-semibold text-base text-white">{profile.name}</div>
              <div className="font-['Nunito'] font-medium text-[13px] text-white/70">Rank #{users.length + 1} · {profile.points} pts</div>
            </div>
          </div>
        </div>

        <div className="font-['Fredoka'] font-semibold text-base mb-2.5 flex items-center gap-2" style={{ color: C.ink }}>
          <MapPin size={16} color={C.coral} />
          {profile.neighborhood || 'Indiranagar'} Care Zone
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-3 rounded-[24px]" style={{ backgroundColor: C.surface }}>
            <div className="font-['Fredoka'] font-semibold text-lg" style={{ color: C.jungleDeep }}>{users.length + 1}</div>
            <div className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>Your Rank</div>
          </div>
          <div className="text-center p-3 rounded-[24px]" style={{ backgroundColor: C.surface }}>
            <div className="font-['Fredoka'] font-semibold text-lg" style={{ color: C.skyDeep }}>{users.length}</div>
            <div className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>Zone Helpers</div>
          </div>
          <div className="text-center p-3 rounded-[24px]" style={{ backgroundColor: C.surface }}>
            <div className="font-['Fredoka'] font-semibold text-lg" style={{ color: C.goldDeep }}>{users.reduce((sum, u) => sum + u.points, 0) + profile.points}</div>
            <div className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>Zone Points</div>
          </div>
        </div>

        <div className="font-['Fredoka'] font-semibold text-sm mb-2" style={{ color: C.ink }}>Top Helpers</div>
        {users.map((u) => (
          <div key={u.id} className="mb-2 p-3 rounded-[24px]" style={{ backgroundColor: C.surface, border: `2.5px solid ${C.hairline}`, borderBottomWidth: 4 }}>
            <div className="flex items-center gap-3">
              <div className="font-['Fredoka'] font-semibold text-xl w-7 text-center" style={{ color: C.muted }}>
                {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : u.rank}
              </div>
              <Avatar name={u.name} size={36} tone={u.tone} />
              <div className="flex-1">
                <div className="font-['Fredoka'] font-semibold text-[15px]" style={{ color: C.ink }}>{u.name}</div>
                <div className="font-['Nunito'] font-medium text-[13px]" style={{ color: C.muted }}>{u.zone}</div>
              </div>
              <div className="text-right">
                <div className="font-['Fredoka'] font-semibold text-base" style={{ color: C.goldDeep }}>{u.points} pts</div>
                <div className="flex items-center justify-end gap-0.5">
                  {u.change === 'up' && <TrendingUp size={12} color={C.jungle} />}
                  {u.change === 'down' && <TrendingDown size={12} color={C.coral} />}
                  {u.change === 'same' && <Minus size={12} color={C.muted} />}
                  <span className="font-['Nunito'] font-bold text-[11px]" style={{ color: C.muted }}>{u.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (regStep === 'phone') {
    return (
      <div className="px-4 pb-[100px]">
        <ScreenHeader title="Join Ranks" />
        <MascotView scene="leaderboard_registration" compact />
        <div className="mt-4">
          <div className="font-['Fredoka'] font-semibold text-xl mb-2" style={{ color: C.ink }}>Verify your phone</div>
          <div className="font-['Nunito'] font-medium text-[15px] mb-5 leading-relaxed" style={{ color: C.ink2 }}>We'll send a 4-digit OTP to verify your number.</div>
          <div>
            <label className="font-['Nunito'] font-bold text-[12px] uppercase tracking-[0.06] mb-1.5 block" style={{ color: C.muted }}>Phone number *</label>
            <input value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel" className="w-full p-3.5 rounded-2xl font-['Fredoka'] text-lg outline-none" style={{ border: `2px solid ${phoneValid || !localPhone ? C.hairline : C.coral}`, color: C.ink, backgroundColor: C.surface }} />
            {localPhone && !phoneValid && <div className="font-['Nunito'] font-semibold text-xs mt-1.5" style={{ color: C.coral }}>Enter a valid 10-digit Indian number</div>}
          </div>
          <div className="mt-6">
            <button onClick={handleSendOtp} disabled={!phoneValid} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: C.sky, boxShadow: `0 4px 0 0 ${C.skyDeep}` }}>Send OTP</button>
          </div>
        </div>
      </div>
    );
  }

  if (regStep === 'otp') {
    return (
      <div className="px-4 pb-[100px]">
        <ScreenHeader title="Join Ranks" onBack={() => setRegStep('phone')} />
        <MascotView scene="leaderboard_registration" compact />
        <div className="mt-4">
          <div className="font-['Fredoka'] font-semibold text-xl mb-2" style={{ color: C.ink }}>Enter OTP</div>
          <div className="font-['Nunito'] font-medium text-[15px] mb-5 leading-relaxed" style={{ color: C.ink2 }}>We sent a code to {localPhone}</div>
          <div className="flex gap-3 justify-center mb-6">
            {[0, 1, 2, 3].map((i) => (
              <input key={i} value={otp[i] || ''} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val) { const newOtp = otp.split(''); newOtp[i] = val; setOtp(newOtp.join('')); if (i < 3) { const next = (e.target as HTMLElement).nextElementSibling as HTMLInputElement; if (next) next.focus(); } } }} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) { const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement; if (prev) prev.focus(); } }} maxLength={1} inputMode="numeric" pattern="[0-9]*" type="tel" autoComplete={i === 0 ? 'one-time-code' : 'off'} className="w-14 h-16 text-center rounded-2xl font-['Fredoka'] text-[28px] outline-none" style={{ border: `2px solid ${C.hairline}`, color: C.ink, backgroundColor: C.surface }} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <button onClick={handleVerifyOtp} disabled={otp.length !== 4} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: C.sky, boxShadow: `0 4px 0 0 ${C.skyDeep}` }}>Verify OTP</button>
            <button onClick={() => { haptic('light'); setOtp(''); setRegStep('phone'); }} className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] mb-1" style={{ border: `2.5px solid ${C.hairline2}`, color: C.ink2 }}>Change number</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Join Ranks" onBack={() => setRegStep('otp')} />
      <MascotView scene="leaderboard_registration" compact />
      <div className="mt-4">
        <div className="flex flex-col gap-3.5 mb-5">
          <div>
            <label className="font-['Nunito'] font-bold text-[12px] uppercase tracking-[0.06] mb-1.5 block" style={{ color: C.muted }}>Display name *</label>
            <input value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="Your name" className="w-full p-3.5 rounded-2xl font-['Fredoka'] text-lg outline-none" style={{ border: `2px solid ${C.hairline}`, color: C.ink, backgroundColor: C.surface }} />
          </div>
          <div>
            <label className="font-['Nunito'] font-bold text-[12px] uppercase tracking-[0.06] mb-1.5 block" style={{ color: C.muted }}>Gender</label>
            <div className="flex flex-wrap gap-2">
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                <motion.button key={g} whileTap={{ scale: 0.95 }} onClick={() => setLocalGender(g)} className="px-3.5 py-2 rounded-xl font-['Nunito'] font-bold text-[13px] cursor-pointer" style={{ border: `2px solid ${localGender === g ? C.sky : C.hairline}`, backgroundColor: localGender === g ? C.skySoft : C.surface, color: localGender === g ? C.skyDeep : C.ink }}>{g}</motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div className="font-['Nunito'] font-bold text-[12px] uppercase tracking-[0.06] mb-2" style={{ color: C.muted }}>Care zones</div>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {locations.map((loc) => (
              <div key={loc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: C.jungleSoft, border: `1.5px solid ${C.jungle}` }}>
                <MapPin size={14} color={C.jungle} />
                <span className="font-['Nunito'] font-bold text-[13px]" style={{ color: C.jungleDeep }}>{loc}</span>
                <button onClick={() => handleRemoveLocation(loc)} className="bg-none border-none p-0 cursor-pointer flex"><X size={14} color={C.jungleDeep} /></button>
              </div>
            ))}
          </div>
          <div className="relative">
            <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && locationSearch.trim()) handleAddLocation(locationSearch.trim()); }} placeholder="Add another area..." className="w-full py-3 px-4 pl-10 rounded-[14px] font-['Nunito'] text-[15px] outline-none" style={{ border: `2px solid ${C.hairline}`, color: C.ink, backgroundColor: C.surface }} />
            <MapPin size={18} color={C.muted} className="absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {filteredLocations.length > 0 && (
            <div className="max-h-[120px] overflow-y-auto mt-2 flex flex-col gap-1">
              {filteredLocations.map((n) => (
                <motion.button key={n} whileTap={{ scale: 0.98 }} onClick={() => handleAddLocation(n)} className="py-2.5 px-3.5 rounded-xl text-left bg-transparent border-none font-['Nunito'] font-bold text-[14px] cursor-pointer" style={{ color: C.ink }}>{n}</motion.button>
              ))}
            </div>
          )}
        </div>

        <div className="font-['Fredoka'] font-semibold text-base mb-3" style={{ color: C.ink }}>Consent</div>
        {[
          { key: 'c1', label: 'I agree to show my first name, care zone, points, rank, and badges.' },
          { key: 'c2', label: 'I understand exact proof locations and private reports are not public.' },
          { key: 'c3', label: 'I can turn this off later from Profile.' },
        ].map((c) => (
          <motion.div key={c.key} whileTap={{ scale: 0.98 }} onClick={() => setConsents((prev) => ({ ...prev, [c.key]: !prev[c.key as keyof typeof prev] }))} className="flex gap-3 items-start py-3 cursor-pointer" style={{ borderBottom: `1px solid ${C.hairline}` }}>
            <div className="w-6 h-6 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ backgroundColor: consents[c.key as keyof typeof consents] ? C.jungle : C.paper2, border: consents[c.key as keyof typeof consents] ? 'none' : `2px solid ${C.hairline2}` }}>
              {consents[c.key as keyof typeof consents] && <Check size={16} color="#fff" />}
            </div>
            <span className="font-['Nunito'] font-semibold text-sm leading-relaxed" style={{ color: C.ink }}>{c.label}</span>
          </motion.div>
        ))}

        <div className="mt-6 flex flex-col gap-2.5">
          <button onClick={handleJoin} disabled={!canRegister} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: C.sky, boxShadow: `0 4px 0 0 ${C.skyDeep}` }}>Join Ranks</button>
          <button onClick={() => setShowRegister(false)} className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] mb-1" style={{ border: `2.5px solid ${C.hairline2}`, color: C.ink2 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { motion } from 'framer-motion';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { MascotView } from '@/mascot';
import { ScreenHeader } from '@/components/ui';

const C: ThemeColors = COLOR;

interface InviteBuddyScreenProps {
  onBack: () => void;
}

export function InviteBuddyScreen({ onBack }: InviteBuddyScreenProps) {
  const shareText = encodeURIComponent('Join me on Straytopia! Help stray animals in our neighborhood. One small act of care at a time.');
  const shareUrl = encodeURIComponent('https://straytopia.vercel.app');

  const WhatsAppIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.568.696 4.976 1.904 7.056L2.2 29.8l6.944-1.68A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#25D366"/>
      <path d="M22.4 20.16c-.32-.16-1.88-.92-2.16-1.04-.28-.12-.48-.16-.68.16s-.76 1.04-.92 1.24c-.16.2-.36.24-.68.08-.32-.16-1.36-.52-2.6-1.64-.96-.88-1.6-1.96-1.8-2.28-.2-.32-.04-.48.12-.68.12-.16.28-.4.44-.6.16-.2.2-.36.32-.6.12-.24.04-.44-.04-.6-.08-.16-.68-1.64-.92-2.24-.24-.6-.48-.52-.68-.52h-.56c-.2 0-.52.08-.76.36-.24.28-.92.92-.92 2.24s.96 2.6 1.08 2.76c.12.16 1.88 3.16 4.6 4.24.64.28 1.12.44 1.52.56.64.2 1.2.16 1.64.12.52-.08 1.6-.64 1.8-1.28.24-.64.24-1.16.16-1.28-.08-.12-.28-.2-.6-.36z" fill="#fff"/>
    </svg>
  );

  const TelegramIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#0088cc"/>
      <path d="M22.2 10.4l-2.4 12.4c-.2.8-.6 1-1.2.6l-3.2-2.4-1.6 1.6c-.2.2-.4.4-.8.4l.2-3.2 6-5.4c.2-.2 0-.4-.4-.2l-7.4 4.6-3.2-1c-.8-.2-.8-.8.2-1.2l12.4-4.8c.6-.2 1.2.2 1 1z" fill="#fff"/>
    </svg>
  );

  const SMSIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 7.8 2 15c0 3.6 1.6 6.8 4.2 9.2.2.2.4.4.4.8l.4 2.4c0 .4.4.6.8.4l2.8-1.4c.2-.2.4-.2.6-.2 1.2.4 2.4.6 3.8.6 7.732 0 14-5.8 14-13S23.732 2 16 2z" fill={C.jungle}/>
      <path d="M10 14h12M10 18h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const GmailIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#EA4335"/>
      <path d="M8 12l8 5 8-5M8 12v8h16v-8M8 12l8 5 8-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#1877F2"/>
      <path d="M20 16h-3v8h-4v-8h-2v-3h2v-2.5c0-1.5.8-2.5 2.5-2.5h2.5v3h-1.5c-.5 0-.5.2-.5.5V13h3l-.5 3z" fill="#fff"/>
    </svg>
  );

  const InstagramIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="ig" x1="2" y1="30" x2="30" y2="2">
          <stop offset="0%" stopColor="#FEDA75"/>
          <stop offset="25%" stopColor="#FA7E1E"/>
          <stop offset="50%" stopColor="#D62976"/>
          <stop offset="75%" stopColor="#962FBF"/>
          <stop offset="100%" stopColor="#4F5BD5"/>
        </linearGradient>
      </defs>
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="url(#ig)"/>
      <rect x="8" y="8" width="16" height="16" rx="4" stroke="#fff" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="16" r="4" stroke="#fff" strokeWidth="2" fill="none"/>
      <circle cx="22" cy="10" r="1.5" fill="#fff"/>
    </svg>
  );

  const sharePlatforms = [
    { name: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', url: 'https://wa.me/?text=' },
    { name: 'Telegram', icon: <TelegramIcon />, color: '#0088cc', url: 'https://t.me/share/url?url=&text=' },
    { name: 'SMS', icon: <SMSIcon />, color: C.jungle, url: 'sms:?body=' },
    { name: 'Gmail', icon: <GmailIcon />, color: '#EA4335', url: 'mailto:?subject=&body=' },
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', url: 'https://www.facebook.com/sharer/sharer.php?u=' },
    { name: 'Instagram', icon: <InstagramIcon />, color: '#E4405F', url: '' },
  ];

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Invite Care Buddy" onBack={onBack} />
      <MascotView scene="onboarding_welcome" compact={false} />

      <div className="text-center mt-2">
        <div className="font-['Fredoka'] font-semibold text-[22px] mb-2" style={{ color: C.ink }}>Share Straytopia</div>
        <div className="font-['Nunito'] font-medium text-[15px] max-w-[280px] mx-auto mb-6 leading-relaxed" style={{ color: C.ink2 }}>Invite friends to join your care circle and help more animals together.</div>

        <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
          {sharePlatforms.map((p) => (
            <motion.button
              key={p.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptic('select');
                if (p.url) {
                  const fullUrl = p.name === 'Gmail'
                    ? `${p.url}${encodeURIComponent('Join Straytopia - Help stray animals')}&${encodeURIComponent(shareText)}`
                    : p.name === 'SMS'
                    ? `${p.url}${shareText}`
                    : `${p.url}${shareUrl}&text=${shareText}`;
                  window.open(fullUrl, '_blank');
                }
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border-none cursor-pointer"
              style={{ backgroundColor: C.paper2 }}
            >
              {p.icon}
              <div className="font-['Nunito'] font-bold text-xs" style={{ color: p.color }}>{p.name}</div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6">
          <button onClick={() => { haptic('light'); onBack(); }} className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] mb-1" style={{ border: `2.5px solid ${C.hairline2}`, color: C.ink2 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

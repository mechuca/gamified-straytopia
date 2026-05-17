'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Heart, Droplets, Star, CheckCircle2, Siren, MapPin, Camera, X, Check, AlertCircle, Loader2, Shield, Users } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { MascotView } from '@/mascot';
import { ScreenHeader, Card, Pill } from '@/components/ui';

const C: ThemeColors = COLOR;

interface ReportSuccessScreenProps {
  condition: string;
  urgency: string;
  photo: string | null;
  onBack: () => void;
  onSuccess: () => void;
}

function ReportSuccessScreen({ condition, urgency, photo, onBack, onSuccess }: ReportSuccessScreenProps) {
  const [phase, setPhase] = useState<'dispatching' | 'tracking'>('dispatching');
  const [dispatchStep, setDispatchStep] = useState(0);
  const reportId = Math.floor(Math.random() * 90000 + 10000);

  const dispatchSteps = [
    { icon: MapPin, label: 'Locating nearby shelters...', color: C.sky },
    { icon: Siren, label: 'Alerting rescue operators...', color: C.coral },
    { icon: Users, label: 'Notifying nearby helpers...', color: C.jungle },
    { icon: CheckCircle2, label: 'Report dispatched!', color: C.gold },
  ];

  useEffect(() => {
    if (phase !== 'dispatching') return;
    if (dispatchStep < 3) {
      const timer = setTimeout(() => setDispatchStep((s) => s + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase('tracking'), 1000);
      return () => clearTimeout(timer);
    }
  }, [dispatchStep, phase]);

  const caseJourney = [
    { status: 'reported', label: 'Reported', time: 'Just now', done: true, icon: AlertTriangle },
    { status: 'dispatched', label: 'Alert Sent', time: 'Just now', done: true, icon: Siren },
    { status: 'rescued', label: 'Rescued', time: 'Pending', done: false, icon: Heart },
    { status: 'treated', label: 'Medical Care', time: 'Pending', done: false, icon: Droplets },
    { status: 'healed', label: 'Healed', time: 'Pending', done: false, icon: Star },
    { status: 'rehabilitated', label: 'Rehabilitated', time: 'Pending', done: false, icon: CheckCircle2 },
  ];

  if (phase === 'dispatching') {
    return (
      <div className="px-4 pb-[100px]">
        <div className="flex flex-col items-center justify-center min-h-[80dvh] gap-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: C.coralSoft }}
          >
            <Siren size={56} color={C.coralDeep} />
          </motion.div>

          <div className="text-center">
            <motion.div
              key={dispatchStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-['Fredoka'] font-semibold text-[22px] mb-2"
              style={{ color: C.ink }}
            >
              {dispatchSteps[dispatchStep].label}
            </motion.div>
            <div className="font-['Nunito'] font-medium text-[15px]" style={{ color: C.ink2 }}>Connecting you with rescue teams</div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            {dispatchSteps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= dispatchStep ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-2.5 rounded-[14px]"
                style={{ backgroundColor: i <= dispatchStep ? `${s.color}15` : 'transparent' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: i <= dispatchStep ? s.color : C.paper2 }}>
                  {i < dispatchStep ? <Check size={16} color="#fff" /> : <s.icon size={16} color={i <= dispatchStep ? '#fff' : C.muted} />}
                </div>
                <span className="font-['Nunito'] font-bold text-sm" style={{ color: i <= dispatchStep ? C.ink : C.muted }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Case Tracking" onBack={onBack} />
      <MascotView scene="mission_success" compact={false} />

      <div className="flex flex-col items-center gap-5 py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: C.coralSoft }}
        >
          <CheckCircle2 size={40} color={C.coralDeep} />
        </motion.div>

        <div className="text-center">
          <div className="font-['Fredoka'] font-semibold text-2xl mb-1" style={{ color: C.ink }}>Report Submitted</div>
          <div className="font-['Nunito'] font-medium text-sm" style={{ color: C.muted }}>Case #{reportId}</div>
        </div>

        <div className="w-full max-w-[300px] p-4 rounded-[24px]" style={{ backgroundColor: C.paper2 }}>
          <div className="flex justify-between mb-2">
            <span className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.muted }}>Condition</span>
            <span className="font-['Fredoka'] font-semibold text-sm" style={{ color: C.ink }}>{condition}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.muted }}>Urgency</span>
            <Pill tone={urgency === 'critical' ? 'coral' : urgency === 'high' ? 'coral' : urgency === 'medium' ? 'gold' : 'jungle'}>{urgency}</Pill>
          </div>
          <div className="flex justify-between">
            <span className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.muted }}>Photo</span>
            <span className="font-['Fredoka'] font-semibold text-sm" style={{ color: photo ? C.jungleDeep : C.muted }}>{photo ? 'Attached' : 'None'}</span>
          </div>
        </div>

        <div className="w-full max-w-[300px]">
          <div className="font-['Fredoka'] font-semibold text-lg mb-4" style={{ color: C.ink }}>Case Journey</div>
          <div className="flex flex-col gap-0">
            {caseJourney.map((item, i) => {
              const isLast = i === caseJourney.length - 1;
              return (
                <div key={item.status} className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: item.done ? 1 : 0.7 }}
                      transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: item.done ? C.jungle : C.paper2, border: item.done ? 'none' : `2px solid ${C.hairline}` }}
                    >
                      <item.icon size={16} color={item.done ? '#fff' : C.muted} />
                    </motion.div>
                    {!isLast && (
                      <div className="w-0.5 h-8 rounded-sm" style={{ backgroundColor: item.done ? C.jungle : C.hairline }} />
                    )}
                  </div>
                  <div className="pt-1.5 pb-0">
                    <div className="font-['Fredoka'] font-semibold text-[15px]" style={{ color: item.done ? C.ink : C.muted }}>{item.label}</div>
                    <div className="font-['Nunito'] font-medium text-[13px]" style={{ color: item.done ? C.jungleDeep : C.muted }}>{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-[300px] p-3.5 rounded-[24px] flex items-center gap-2.5" style={{ backgroundColor: C.jungle }}>
          <Shield size={18} color="#fff" />
          <div className="font-['Nunito'] font-semibold text-[13px] text-white/90">You'll get updates as the case progresses. Stay safe and keep distance from the animal.</div>
        </div>

        <div className="flex flex-col gap-2.5 w-full max-w-[300px]">
          <button onClick={() => { haptic('medium'); onSuccess(); }} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1" style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}>Back to Home</button>
          <button onClick={() => { haptic('light'); onBack(); }} className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] mb-1" style={{ border: `2.5px solid ${C.hairline2}`, color: C.ink2 }}>File Another Report</button>
        </div>
      </div>
    </div>
  );
}

interface ReportAnimalScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function ReportAnimalScreen({ onBack, onSuccess }: ReportAnimalScreenProps) {
  const [step, setStep] = useState(0);
  const [condition, setCondition] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const conditions = ['Injured', 'Sick', 'Trapped', 'Aggressive', 'Pregnant', 'Abandoned', 'In Danger'];
  const urgencies = [
    { key: 'low' as const, label: 'Low', desc: 'Animal is safe but needs attention', color: C.jungle },
    { key: 'medium' as const, label: 'Medium', desc: 'Animal may need help soon', color: C.gold },
    { key: 'high' as const, label: 'High', desc: 'Animal is in immediate danger', color: C.coral },
    { key: 'critical' as const, label: 'Critical', desc: 'Life-threatening situation', color: C.coralDeep },
  ];

  if (step === 4) {
    return (
      <ReportSuccessScreen
        condition={condition}
        urgency={urgency}
        photo={photo}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Report Animal" onBack={onBack} />
      <MascotView scene="mission_detail" compact />

      <div className="mt-4">
        <div className="flex gap-1.5 justify-center mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2 rounded-sm transition-all duration-300" style={{ width: i <= step ? 28 : 8, backgroundColor: i <= step ? C.coral : C.paper2 }} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>What condition is the animal in?</div>
            <div className="flex flex-wrap gap-2 mb-6">
              {conditions.map((c) => (
                <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => { haptic('select'); setCondition(c); }} className="px-4 py-2.5 rounded-[14px] font-['Nunito'] font-bold text-sm cursor-pointer" style={{
                  border: `2px solid ${condition === c ? C.coral : C.hairline}`,
                  backgroundColor: condition === c ? C.coralSoft : C.surface,
                  color: condition === c ? C.coralDeep : C.ink,
                }}>{c}</motion.button>
              ))}
            </div>
            <button onClick={() => { haptic('medium'); condition && setStep(1); }} disabled={!condition} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 0 ${C.coralDeep}` }}>Next</button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>How urgent is this?</div>
            <div className="flex flex-col gap-2.5 mb-6">
              {urgencies.map((u) => (
                <motion.div key={u.key} whileTap={{ scale: 0.98 }} onClick={() => { haptic('select'); setUrgency(u.key); }} className="p-3.5 rounded-2xl cursor-pointer" style={{
                  border: `2px solid ${urgency === u.key ? u.color : C.hairline}`,
                  backgroundColor: urgency === u.key ? `${u.color}15` : C.surface,
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: urgency === u.key ? u.color : C.paper2, border: urgency === u.key ? 'none' : `2px solid ${C.hairline2}` }}>
                      {urgency === u.key && <Check size={14} color="#fff" />}
                    </div>
                    <div>
                      <div className="font-['Fredoka'] font-semibold text-[15px]" style={{ color: u.color }}>{u.label}</div>
                      <div className="font-['Nunito'] font-medium text-[13px]" style={{ color: C.ink2 }}>{u.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button onClick={() => { haptic('medium'); setStep(2); }} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1" style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 0 ${C.coralDeep}` }}>Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Add a photo (optional)</div>
            <div className="font-['Nunito'] font-medium text-sm mb-4" style={{ color: C.ink2 }}>A photo helps rescue teams identify the animal and assess the situation faster.</div>
            {photo ? (
              <div className="mb-5">
                <div className="w-full h-[200px] rounded-[20px] overflow-hidden relative border-2" style={{ backgroundColor: C.paper2, borderColor: C.hairline }}>
                  <img src={photo} alt="Animal" className="w-full h-full object-cover" />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPhoto(null)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                  >
                    <X size={18} color="#fff" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setPhoto(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="w-full h-[180px] rounded-[20px] flex flex-col items-center justify-center gap-3 cursor-pointer mb-5"
                style={{ border: `2px dashed ${C.hairline2}`, backgroundColor: C.surface }}
              >
                <Camera size={32} color={C.muted} />
                <div className="font-['Fredoka'] font-semibold text-base" style={{ color: C.ink2 }}>Tap to take a photo</div>
                <div className="font-['Nunito'] font-medium text-[13px]" style={{ color: C.muted }}>or choose from gallery</div>
              </motion.button>
            )}
            <button onClick={() => { haptic('medium'); setStep(3); }} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1" style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 0 ${C.coralDeep}` }}>Next</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Add notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the location, animal appearance, or any other details..."
              className="w-full min-h-[120px] p-3.5 rounded-2xl font-['Nunito'] text-[15px] outline-none resize-none mb-4"
              style={{ border: `2px solid ${C.hairline}`, color: C.ink, backgroundColor: C.surface }}
            />
            <div className="mb-5 p-3.5 rounded-[24px] flex items-center gap-2.5" style={{ backgroundColor: C.paper2 }}>
              <AlertCircle size={18} color={C.coral} />
              <div className="font-['Nunito'] font-semibold text-sm" style={{ color: C.ink2 }}>Do not approach aggressive or injured animals. Report and let trained helpers respond.</div>
            </div>
            <button onClick={() => { setSubmitting(true); setTimeout(() => { setSubmitting(false); setStep(4); }, 1500); }} disabled={submitting} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5" style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 0 ${C.coralDeep}` }}>
              {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Submit Report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

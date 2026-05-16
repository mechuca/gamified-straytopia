# Straytopia Mascot System

## Purpose

Saathi (meaning "companion" in Hindi) is Straytopia's care companion mascot. It guides users through the humane civic-tech stray animal welfare journey — from first-time onboarding to mission completion, badge earning, and leaderboard participation.

Saathi is not decoration. It is emotional architecture that:
- Welcomes new users and reduces first-time friction
- Explains locked missions without frustration
- Encourages during active missions
- Celebrates completed care actions
- Guides privacy and consent decisions
- Builds trust in the platform

## Personality

- Warm, calm, intelligent, trustworthy
- Safety-aware and emotionally expressive
- Premium and humane (civic-tech, not a pet game)
- Serious during rescue alerts, proud during achievement, calm during empty states
- Never childish, cartoonish, noisy, or distracting

## Visual Design

Saathi is a gentle care companion inspired by stray animals:
- Simple readable silhouette (dog/cat-inspired)
- Soft eyes, expressive ears, minimal shape language
- Works small on mobile (40px) and large on onboarding (120px)
- Works on both dark and light UI
- Premium and memorable, no excessive detail

### SVG Component
Located at: `src/mascot/Saathi.tsx`

State-based expressions:
- **Eyes**: happy (curved), concerned (worried arcs), thinking (wide circles), serious/calm (gentle lines)
- **Mouth**: happy (smile), concerned (frown), thinking (open), default (neutral)
- **Tail**: animated wag speed varies by mood
- **Body**: subtle bounce for celebrating/proud states
- **Sparkles**: appear during celebration states

## Mascot Scenes

| Scene | Mood | When | Message |
|-------|------|------|---------|
| `onboarding_welcome` | happy | Onboarding screen 1 | "Welcome to Straytopia. I'll help you begin your care journey." |
| `onboarding_mission` | encouraging | Onboarding screen 2 | "Start small. One safe care action can help one animal today." |
| `onboarding_impact` | proud | Onboarding screen 3 | "Every completed mission becomes visible impact." |
| `onboarding_privacy` | serious | Onboarding screen 4 | "You control your proof, location, and leaderboard participation." |
| `home_empty` | calm | Home with no missions done | "Your first care mission is ready." |
| `mission_available` | happy | First mission available | "Start with one simple mission." |
| `mission_locked` | thinking | Tapping a locked mission | "Complete the previous mission to unlock this one." |
| `mission_detail` | serious | Mission detail page | "Read the safety steps before you begin." |
| `mission_active` | encouraging | Active mission checklist | "Take your time. Keep distance and care safely." |
| `proof_required` | encouraging | Proof upload screen | "Add a photo or note so your care action can be verified." |
| `mission_success` | celebrating | Mission complete screen | "You helped one animal today." |
| `badge_earned` | proud | Badge earned modal | "You earned your first care badge." |
| `second_mission_unlocked` | happy | After first mission | "Your next care mission is now unlocked." |
| `impact_empty` | calm | Impact tab before first mission | "Your impact will appear after your first completed mission." |
| `impact_updated` | proud | Impact tab after missions | "Your care action is now part of your impact." |
| `leaderboard_intro` | calm | Leaderboard before opt-in | "Leaderboard is optional. Join only when you are ready." |
| `leaderboard_registration` | serious | Registration screen | "Choose what safe public details can be shown." |
| `leaderboard_privacy` | serious | Privacy confirmation | "Exact proof locations and private reports stay protected." |
| `leaderboard_success` | celebrating | After joining leaderboard | "Your care progress can now inspire others." |
| `profile_beginner` | calm | Profile before first mission | "This is your care profile. Your progress starts here." |
| `profile_progress` | proud | Profile after missions | "Your badges, missions, and impact grow as you help." |
| `loading` | calm | Loading states | "Finding your care path..." |
| `error` | concerned | Error states | "Something didn't load. Let's try again." |

## Mascot Moods

| Mood | Visual |
|------|--------|
| `calm` | Gentle eyes, neutral mouth, slow tail |
| `happy` | Curved eyes, smile, moderate tail wag |
| `proud` | Curved eyes, smile, body bounce, sparkles |
| `thinking` | Wide eyes, open mouth, gentle tail |
| `concerned` | Worried eye arcs, frown, slow tail |
| `celebrating` | Curved eyes, big smile, fast tail, sparkles, body bounce |
| `encouraging` | Wide eyes, open mouth, moderate tail |
| `serious` | Gentle eye lines, neutral mouth, minimal tail |

## Where Mascot Appears

1. **Onboarding** — Large mascot with speech bubble, guides through 4 screens
2. **Home** — Mascot in welcome/mission guidance area above care path
3. **Mission Detail** — Compact mascot card with safety guidance
4. **Active Mission** — Compact mascot card with encouragement
5. **Proof Upload** — Compact mascot card pointing to proof area
6. **Success Screen** — Large mascot celebrating with confetti
7. **Impact Empty** — Full mascot with CTA to start first mission
8. **Impact Updated** — Compact mascot showing pride
9. **Leaderboard Intro** — Full mascot explaining opt-in
10. **Leaderboard Registration** — Compact mascot as privacy guide
11. **Leaderboard Success** — Compact mascot celebrating
12. **Profile Beginner** — Compact mascot as guide
13. **Profile Progress** — Compact mascot showing pride
14. **Locked Mission Modal** — Medium mascot explaining lock

## MascotView Component

```tsx
<MascotView
  scene="home_empty"
  mood="calm"           // optional, auto-derived from scene
  message="Custom msg"  // optional, overrides default
  sub="Subtitle"        // optional
  actionLabel="Start"   // optional CTA button text
  onAction={fn}         // optional CTA handler
  size="md"             // sm | md | lg
  compact={false}       // horizontal card vs vertical layout
  showBubble={true}     // show/hide speech bubble
  prefersReducedMotion={false}
/>
```

## State Mapper

`getMascotState()` in `src/mascot/getMascotState.ts` converts app state into mascot scenes:

```ts
getMascotState({
  isNewUser, hasActiveMission, missionStatus,
  checklistProgress, badgeUnlocked, rescueAlert,
  leaderboardVisible, errorState, userInactive,
  screen, missionsCompleted, leaderboardOptedIn,
})
```

## Reduced Motion

All animations respect `prefers-reduced-motion`:
- No tail wag, body bounce, or sparkle animations
- Instant opacity transitions (no duration)
- Mascot still displays but static

## Future Rive Integration

The system is designed for easy Rive upgrade:

### Expected Rive Setup
- **File**: `public/rive/straytopia_mascot.riv`
- **Artboard**: `StraytopiaMascot`
- **State Machine**: `MascotMachine`
- **View Model**: `MascotVM` (future)

### Integration Point
Replace `Saathi.tsx` SVG with `@rive-app/react-webgl2` component:

```tsx
// Future Rive integration
import { useRive, useStateMachineInput } from '@rive-app/react-webgl2';

function RiveMascot({ mood, trigger }) {
  const { rive, RiveComponent } = useRive({
    src: '/rive/straytopia_mascot.riv',
    artboard: 'StraytopiaMascot',
    stateMachines: 'MascotMachine',
    autoplay: true,
  });

  // Map mood to Rive state machine inputs
  // const moodInput = useStateMachineInput(rive, 'MascotMachine', 'mood');
  // useEffect(() => { if (moodInput) moodInput.value = mood; }, [mood]);

  return <RiveComponent style={{ width: size, height: size }} />;
}
```

### TODO for Rive
1. Create `straytopia_mascot.riv` in Rive editor
2. Define `MascotMachine` state machine with inputs: `mood`, `trigger`
3. Map each mood (calm, happy, proud, thinking, concerned, celebrating, encouraging, serious) to Rive states
4. Add trigger animations (wave, point, celebrate, unlock, blink, focus)
5. Replace `Saathi.tsx` with Rive component in `MascotView.tsx`
6. Keep SVG fallback for when Rive file is missing

## Future Lottie Usage

Lottie can be used for specific moments:
- Badge unlock confetti burst
- Mission complete celebration
- Second mission unlock reveal

Add Lottie files to `public/lottie/` and use `lottie-react` or `@lottiefiles/react-lottie-player`.

## Adding New Mascot Scenes

1. Add scene name to `MascotScene` type in `mascotTypes.ts`
2. Add message config to `MASCOT_MESSAGES` in `mascotMessages.ts`
3. Add mapping logic in `getMascotState.ts`
4. Use `<MascotView scene="new_scene" />` in the target screen

## Analytics Events

Tracked via `logAnalytics()` in Zustand store:
- `mascot_scene_viewed` — when scene changes
- `mascot_cta_clicked` — when mascot CTA is tapped
- `onboarding_started`, `onboarding_completed`
- `mission_viewed`, `mission_started`, `mission_completed`
- `checklist_completed`, `proof_submitted`
- `badge_earned`, `second_mission_unlocked`
- `impact_viewed`
- `leaderboard_registration_started`, `leaderboard_confirmed`, `leaderboard_cancelled`
- `profile_viewed`
- `demo_reset`

## File Structure

```
src/mascot/
  index.ts              — exports
  mascotTypes.ts        — type definitions
  mascotMessages.ts     — scene-to-message mappings
  getMascotState.ts     — app state to mascot scene mapper
  Saathi.tsx            — SVG mascot component (fallback)
  BuddyMascot.tsx       — Buddy static PNG + framer-motion
  MascotView.tsx        — main mascot UI component

src/lib/masko.ts        — Buddy pose URLs and scene mapping
src/store/app.ts        — Zustand journey state
src/app/page.tsx        — all screens with mascot integration
public/rive/            — Rive asset directory (for future .riv file)
docs/STRAYTOPIA_MASCOT_SYSTEM.md — this file
```

---

## Masko.ai Integration (ACTIVE — Static Images)

Buddy the desi street dog is now the primary mascot, powered by Masko.ai static images with framer-motion animations.

### Mascot Identity
- **Name:** Buddy
- **Description:** A small, scrappy Indian street dog (desi mutt) with warm golden-brown fur and a cream-colored belly. One ear stands up, the other flops down. Big round expressive eyes with a hopeful sparkle. Wears a teal bandana around the neck. Short snout, slightly scruffy fur, wagging tail. Friendly, approachable, slightly mischievous. Feels like a rescued stray who found a home — not a purebred. Compact body, oversized head for cuteness. Kawaii style, sitting pose, warm and inviting, civic-tech feel, not childish.
- **Style:** Kawaii
- **Masko Collection ID:** `4502bba0-5687-4e3b-b29e-4b07bf9bb48f`
- **Masko CDN Slug:** `buddy-1d5rfgcx`
- **Project ID:** `05c11f8e-ab67-4223-a89b-bb7c24442053`

### Architecture
```
MascotView
  └── BuddyMascot (static PNG + framer-motion)
        ├── Transparent PNG from Masko CDN
        ├── Framer-motion pose animations (bounce, tilt, scale)
        ├── Confetti/sparkle overlays for celebrations
        └── Saathi SVG fallback (loading/error/reduced-motion)
```

### How It Works
1. `MascotView` maps each `MascotScene` to a Buddy pose name
2. `BuddyMascot` loads the transparent PNG from Masko CDN
3. Framer-motion applies subtle animations (bounce, tilt, scale)
4. Falls back to SVG Saathi during loading, errors, or reduced-motion
5. Confetti/sparkle overlays added on success screens

### Generated Poses (9/10)
| Pose | Scene | Animation | URL |
|------|-------|-----------|-----|
| `idle` | Default, home, profile | Gentle bounce | `idle-f4118034.png` |
| `wave` | Onboarding welcome | Scale pulse ×2 | `wave-086c507f.png` |
| `celebrate` | Success, badge, levelup | Jump bounce ×2 | `celebrate-26a411d8.png` |
| `sad` | Error states | Slow droop | `sad-1d06416f.png` |
| `alert` | Mission available, proof | Quick bounce ×2 | `alert-d69d5640.png` |
| `thinking` | Locked missions | Head tilt sway | `thinking-685068cf.png` |
| `rescue` | Rescue/adoption | Gentle pulse | `rescue-06c350bf.png` |
| `loading` | Loading states | Soft bounce | `loading-a2f33b31.png` |
| `empty` | Empty states | Slow float | `empty-64e48274.png` |

Missing: `sleeping` (ran out of credits)

### CDN URLs
All images served from: `https://assets.masko.ai/1c59eb4f/buddy-1d5rfgcx/{name}-{hash}.png`

Transparent versions used (background removed automatically by Masko).

### Credit Costs
- Static image pose: 1 credit each
- **Total for 9 poses: 9 credits** (1 credit remaining)

### Current Status
- 9/10 Buddy poses generated and live on CDN
- Framer-motion animations applied per pose
- Confetti overlay on success screens
- SVG Saathi fallback active
- All CDN URLs configured in `src/lib/masko.ts`

### Adding More Poses
1. Add credits at https://masko.ai/dashboard
2. Generate new image via Masko API or dashboard
3. Add URL to `BUDDY_POSES` in `src/lib/masko.ts`
4. Map scene to pose in `SCENE_TO_POSE`

# Straytopia — Mobile App Prototype

A fully clickable, locally-stated prototype of Straytopia, a citizen app for protecting street animals.

## What handoff visuals were used

- **Color system**: jungle/coral/gold/sky/plum palette with soft/deep/ink variants
- **Typography**: Fredoka (display), Nunito (body), JetBrains Mono (stats)
- **3D chunky buttons**: offset bottom shadow that compresses on press
- **Rounded cards**: 24px radius, 2.5px border + 4px bottom border
- **Biscuit mascot**: SVG character with 3 moods (happy/wow/sleepy)
- **Motion language**: RiseIn stagger, Pop spring, Bob idle, Confetti celebration, Shake error
- **Warm cream background** (#FFFCEF) with paper-2/paper-3 surfaces
- **Pill badges**, stat strips, avatar system, photo placeholders
- **Empty/error/success state patterns** from the handoff

## What old handoff logic was changed

| Old Handoff | New Logic |
|---|---|
| XP language everywhere | **Impact Points** (no XP visible) |
| Full onboarding (name, phone, camera, notifications) | **Location-only onboarding** — nothing else asked upfront |
| Quest path with nodes | **Mission cards** (feeding, water, rescue, medical, urgent) |
| Leaderboard opt-in during onboarding | **Opt-in only after first mission acceptance** |
| Simple registration | **Full registration flow**: name → phone → OTP → avatar → privacy |
| No privacy controls | **4 privacy modes**: name only, name+avatar, avatar+initials, private |
| No mission task flow | **Full task flow**: accept → task → proof → AI verify → success |
| No badge system | **14 badges** with progress tracking, unlock animations, detail modals |
| Basic report flow | **9 report categories**, severity levels, timeline tracking |

## Screens completed (21 screens)

### Onboarding
- [x] Location permission + auto-detect
- [x] Manual area selection (4 neighborhoods)

### Home (Quest tab)
- [x] Mission cards with urgency, distance, time, IP rewards
- [x] Impact summary (completed/available/points)
- [x] Report CTA card
- [x] Pull-to-refresh

### Stories tab
- [x] Rescue stories, milestones, before/after cards
- [x] Filter chips

### League tab
- [x] Gold league standings with rank movement
- [x] Scope toggle (today/week/month/all/nearby)
- [x] Promotion banner
- [x] Opt-in CTA for non-registered users

### You (Profile) tab
- [x] Streak hero card
- [x] Impact Points summary
- [x] Stats grid (4 metrics)
- [x] Badge row (horizontal scroll)
- [x] Quick links

### Mission flow
- [x] Quick action menu (Feed Proof / File Report)
- [x] Mission detail (type, location, time, urgency, safety note)
- [x] Accept mission confirmation
- [x] Leaderboard opt-in modal (shown only on first accept)
- [x] Mission task screen (checklist, safety, start CTA)
- [x] Proof submission (photo upload, location, timestamp)
- [x] AI verification (5-step animation with progress)
- [x] Mission success (confetti, points, badge unlock)

### Registration flow
- [x] Name input
- [x] Phone input + validation
- [x] OTP verification (mock: 123456)
- [x] Avatar selection (9 options including animal avatars)
- [x] Display privacy selection (4 modes)

### Report flow
- [x] New report (9 categories, 3 severity levels, notes)
- [x] Report submitted (case ID, timeline, privacy note)

### Badges
- [x] Badge grid (14 badges, earned/locked states)
- [x] Badge detail modal (criteria, earned date)

### Settings
- [x] Privacy, notifications, demo reset

### Celebration
- [x] Level up screen

## Mission logic

1. User sees mission cards on Home
2. Taps a card → Mission detail
3. Taps "Accept Mission" → Confirm screen
4. If first mission AND no leaderboard choice → Opt-in modal
5. Opt-in → Registration flow (name → phone → OTP → avatar → privacy)
6. Private → Skip registration, go to task
7. Task screen → "I Completed This" → Proof submission
8. Submit proof → AI verification animation (auto-resolves to verified)
9. Verified → Impact Points awarded, badges unlocked, success screen

## Leaderboard opt-in logic

- Only appears after **first mission acceptance**
- Shows benefits list + privacy guarantee
- "Join Leaderboard" → Registration flow
- "Continue Privately" → Skip to mission task
- Private users: can complete missions, earn points, unlock badges privately
- Can join leaderboard later from profile

## Registration logic

- Name: required, min 2 chars
- Phone: required, format validated
- OTP: mock code `123456`, wrong code shows error, resend works
- Age/Gender: not asked in prototype (can be added later)
- Avatar: 9 options (letters + animal emojis), instant preview
- Privacy: 4 modes, phone never shown publicly

## Badge logic

- 14 badges across categories: feeding, water, rescue, medical, streaks, community
- States: locked (0.55 opacity), in progress (X/Y counter), unlocked (colored)
- Auto-unlocked on mission completion
- Detail modal shows criteria and earned date

## Report logic

- 9 categories with color-coded urgency tones
- 3 severity levels: Urgent/Today/This week
- Generates case ID (SY-XXXX format)
- Timeline: submitted → reviewing → dispatched → resolved
- Privacy strip on success screen

## AI verification logic

- 5-step animation: quality → location/time → match → duplicate → confidence
- Each step completes with 900ms delay
- Auto-resolves to "verified" in prototype
- Awards Impact Points and unlocks badges on success

## Impact Points logic

- Awarded after verified proof submission
- Amount varies by mission type (30-120 points)
- Displayed on mission cards, success screen, profile
- No "XP" language anywhere in UI

## Libraries used

| Library | Purpose |
|---|---|
| expo-router v3 | File-based navigation |
| react-native-reanimated 3 | All animations |
| react-native-gesture-handler | Button press, pan gestures |
| react-native-svg | Biscuit mascot |
| zustand | State management (7 stores) |
| expo-haptics | Haptic feedback |
| expo-location | Location permission |
| expo-image-picker | Proof photo upload |
| expo-font | Custom font loading |
| lucide-react-native | Icon library |
| nativewind v4 | Tailwind CSS for RN |
| zod | Form validation schemas |

## Files created

- **63 source files** (TypeScript/TSX)
- **3,982 lines of code**
- 7 Zustand stores
- 8 primitive/motion/mascot components
- 21 screens across 10 route groups
- 1 form schema file
- 4 lib utility files

## How to run

```bash
cd /Users/home/Desktop/Straytopia/straytopia-app
npm start
# Press i for iOS simulator, a for Android, w for web
```

## Ops Hub Spine (Supabase)

This prototype can optionally sync reports and assigned tasks via Supabase.

Synced flows when configured:
- Report submission syncs to `cases`
- Ops accept/reject updates the report timeline
- Missions write progress into `tasks` (assigned -> in progress -> proof pending -> completed)
- Proof submission writes into `proofs`

Environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

If these are not set, the app continues to run purely on local state.

## How to test each flow

| Flow | Steps |
|---|---|
| Onboarding | Open app → tap "Use my location" or "Pick manually" → select area → Home |
| Mission | Home → tap any mission card → Accept → Start → Upload photo → Submit → Watch verify → Success |
| Leaderboard opt-in | Accept first mission → see opt-in modal → Join → register → or Continue Privately |
| Registration | Opt-in → Join → enter name → enter phone → OTP: 123456 → pick avatar → pick privacy → Task |
| Report | Home → "File a Report" → pick category → pick severity → Send → See case opened |
| Badges | You tab → tap "See all" → tap any earned badge → detail modal |
| League | League tab → see standings → tap scope tabs |
| Profile | You tab → see stats, badges, streak |
| Settings | You tab → gear icon → Reset Demo to start over |
| Quick action | Tap center coral + button → choose Feed Proof or File Report |

## How to reset demo state

You tab → Settings gear → "Reset Everything" → confirm → app restarts at onboarding.

## Known limitations

- **No real backend**: All state is local (Zustand + AsyncStorage)
- **Mock OTP**: Always `123456`
- **AI verification**: Auto-resolves to verified after 5 seconds
- **No real camera**: Uses image picker for proof photos
- **No real location**: Uses mock neighborhoods
- **No dark mode**: Light theme only (v1 scope)
- **No push notifications**: Not implemented in prototype
- **Font loading**: Falls back to system fonts if Google Fonts fail to download
- **Web support**: Some RN-specific APIs (haptics, gesture handler) may not work on web

## Final QA Checklist

- [x] TypeScript compiles with zero errors
- [x] Location-only onboarding works
- [x] Manual location fallback works
- [x] Home page shows missions
- [x] Mission cards are clickable
- [x] Mission detail shows full info
- [x] Accept mission works
- [x] Leaderboard opt-in appears only after first mission acceptance
- [x] Join leaderboard → registration flow works
- [x] Continue privately works
- [x] Name validation works
- [x] Phone validation works
- [x] Mock OTP works (123456)
- [x] Avatar selection works
- [x] Display privacy selection works
- [x] Mission task flow works
- [x] Proof submission works
- [x] AI verification states work
- [x] Verified state awards Impact Points
- [x] No visible XP language
- [x] Badge unlock works
- [x] Leaderboard shows only for opted-in users
- [x] Report flow works
- [x] Report success/tracking works
- [x] Profile works
- [x] Settings works
- [x] Demo reset works
- [x] All modals work
- [x] All back buttons work
- [x] All primary buttons work
- [x] No dead-end buttons
- [x] No "coming soon" dead ends
- [x] Fonts load (with fallback)
- [x] Icons consistent (Lucide)
- [x] Mobile layout polished

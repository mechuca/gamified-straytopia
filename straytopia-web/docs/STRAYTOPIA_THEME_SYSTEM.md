# Straytopia Theme System

## Light Theme Philosophy

The light theme is intentionally warm, civic, and humane.

- Backgrounds use warm cream instead of harsh white.
- Surfaces feel soft and calm, not clinical.
- Text uses near-black and slate neutrals for strong readability.
- Green remains the primary action color, with teal, amber, and coral supporting status and context.

## Dark Theme Philosophy

The dark theme is calm, premium, and readable.

- Backgrounds use deep charcoal and green-black tones instead of pure black.
- Elevated surfaces are separated with subtle border and shadow contrast.
- Accent colors are softened to avoid neon fatigue.
- Text hierarchy uses near-white, soft gray, and muted slate values with clear contrast.

## Semantic Color Tokens

- `background`: app page background
- `surface`: primary content surface
- `surfaceElevated`: dialogs, bottom sheets, raised panels
- `card`: standard card background
- `cardMuted`: muted card background
- `textPrimary`: main readable text
- `textSecondary`: supporting readable text
- `textMuted`: metadata and subdued labels
- `border`: subtle card and input borders
- `borderStrong`: stronger interactive borders and separators
- `primary`: main CTA color
- `primaryHover`: pressed / stronger CTA color
- `primarySoft`: soft CTA tint background
- `success`: positive state color
- `successSoft`: soft positive tint
- `warning`: caution / active mission color
- `warningSoft`: soft caution tint
- `danger`: destructive / alert color
- `dangerSoft`: soft destructive tint
- `info`: informational accent
- `infoSoft`: soft informational tint
- `locked`: readable locked-state color
- `lockedSoft`: muted locked-state surface
- `completed`: completed state color
- `completedSoft`: completed state surface
- `missionActive`: mission currently available / active
- `missionLocked`: mission locked state
- `missionCompleted`: mission completed state
- `navBackground`: bottom navigation background
- `navActive`: active navigation icon/text
- `navInactive`: inactive navigation icon/text
- `shadow`: shared shadow color
- `overlay`: modal / tour backdrop overlay
- `mascotBubble`: mascot speech bubble surface
- `mascotBubbleText`: mascot bubble text color

## Legacy Compatibility Tokens

The app still exposes these aliases for backward compatibility while screens are progressively migrated:

- `jungle`, `jungleDeep`, `jungleSoft`, `jungleInk`
- `coral`, `coralDeep`, `coralSoft`, `coralInk`
- `gold`, `goldDeep`, `goldSoft`, `goldInk`
- `sky`, `skyDeep`, `skySoft`
- `plum`, `plumDeep`, `plumSoft`
- `paper`, `paper2`, `paper3`
- `ink`, `ink2`, `muted`
- `hairline`, `hairline2`

## When To Use Each Token

### Surfaces

- Use `background` for page backgrounds.
- Use `surface` for primary sections.
- Use `surfaceElevated` for modals, action sheets, and elevated focus panels.
- Use `card` for default cards.
- Use `cardMuted` for secondary stat strips and subdued surfaces.

### Text

- Use `textPrimary` for titles, strong labels, and main copy.
- Use `textSecondary` for explanatory copy.
- Use `textMuted` for metadata, labels, and timestamps.

### Actions

- Use `primary` for main CTA buttons.
- Use `danger` only for destructive or emergency actions.
- Use `warning` for active / caution states.
- Use `info` for informational accents.

## Accessibility Rules

- Body text must maintain WCAG AA contrast.
- Never place `textMuted` on `cardMuted` if the contrast becomes borderline.
- Locked states must remain readable, not faded into invisibility.
- Active navigation and CTA states must not rely only on color. Use stronger shape, emphasis, or weight.
- Error, success, and warning states should combine color with iconography and copy.

## Mission State Color Rules

- Locked missions: `missionLocked` on `lockedSoft`
- Active missions: `missionActive` on `warningSoft`
- Completed missions: `missionCompleted` on `completedSoft`

The mission connector line must remain visible in both themes and should never disappear into the page background.

## Badge State Color Rules

- Earned: use badge tone with strong contrast and optional glow
- In progress: use soft tone surface with readable text
- Locked: use `locked` and `lockedSoft` while preserving icon visibility

## Mascot Rules

- Mascot speech bubbles must use `mascotBubble` and `mascotBubbleText`
- The mascot must sit on a visible themed surface in both modes
- CTA chips inside mascot surfaces should use `primary` / `primarySoft`

## Adding New Colors Safely

1. Add a semantic token first.
2. Map that token in both light and dark themes.
3. Avoid direct hex values inside screen components.
4. Test the color on:
   - page background
   - card surface
   - elevated surface
   - button states
   - text contrast

## Future Screen Testing Checklist

Test each new screen in Light and Dark for:

1. Page background readability
2. Card separation from page background
3. Primary CTA readability
4. Secondary CTA readability
5. Body text contrast
6. Icon visibility
7. Disabled/locked state clarity
8. Modal overlay strength
9. Bottom navigation separation
10. Mascot bubble readability

## Manual Theme Testing Checklist

Run through these flows in both themes:

1. Onboarding
2. Home / Missions
3. Locked mission modal
4. Mission detail
5. Active mission checklist
6. Proof upload
7. Mission success
8. Badge earned
9. Impact empty state
10. Impact populated state
11. Leaderboard intro
12. Leaderboard registration
13. Active leaderboard
14. Profile
15. Theme switcher
16. Floating plus action sheet
17. Reset dialog

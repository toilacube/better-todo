# Todo Manager - Modern UI System Design
## Motion-First Minimalist Interface

**Version:** 2.0  
**Design Philosophy:** Modern minimalism with fluid animations  
**Last Updated:** 2025-10-11

---

## 1. Design Principles

### 1.1 Core Values
1. **Motion as Communication** - Animations guide user attention and provide feedback
2. **Brutal Minimalism** - Only essential elements, maximum impact
3. **Monospace Precision** - Technical aesthetic with clean alignment
4. **Spatial Breathing** - Generous whitespace for mental clarity
5. **Responsive Feedback** - Every interaction has smooth, meaningful animation

### 1.2 Design Language
- **Geometric purity** - Sharp corners, precise alignment
- **Kinetic interface** - Elements move with purpose and physics
- **Typographic hierarchy** - Size and weight create clear information structure
- **Subtle depth** - Motion creates z-axis without shadows

---

## 2. Color System

### 2.1 Core Palette

```
LIGHT MODE
──────────────────────────────────
Background     #FFFFFF  White
Primary        #000000  Black
Secondary      #6B7280  Gray-500
Tertiary       #D1D5DB  Gray-300
Subtle         #F3F4F6  Gray-100

DARK MODE
──────────────────────────────────
Background     #000000  Black
Primary        #FFFFFF  White
Secondary      #9CA3AF  Gray-400
Tertiary       #374151  Gray-700
Subtle         #1F2937  Gray-800
```

### 2.2 Functional Colors

```
Success        Same as Primary (animated check)
Error          Same as Primary (animated shake)
Warning        Same as Secondary
Disabled       30% opacity of Primary
```

**No Color Coding**: Success/error communicated through motion, not color

### 2.3 Opacity Scale

```
Invisible      0%      Hidden elements
Ghost          10%     Background lines, dividers
Muted          30%     Inactive buttons, placeholders
Subtle         50%     Secondary text, counters
Active         70%     Hover states
Full           100%    Primary content, active elements
```

---

## 3. Typography System

### 3.1 Font Stack

```css
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 
             'Monaco', 'Cascadia Code', 'Consolas', 
             monospace;
```

**Fallback Strategy:**
1. JetBrains Mono (preferred - excellent ligatures)
2. Fira Code (good alternative)
3. SF Mono (macOS native)
4. Monaco (macOS fallback)
5. Cascadia Code (Windows 11)
6. Consolas (Windows fallback)
7. System monospace

### 3.2 Type Scale

```
Hero           48px / 3rem      font-weight: 300
Title          32px / 2rem      font-weight: 400
Heading        24px / 1.5rem    font-weight: 400
Body Large     18px / 1.125rem  font-weight: 400
Body           16px / 1rem      font-weight: 400
Small          14px / 0.875rem  font-weight: 400
Tiny           12px / 0.75rem   font-weight: 400
```

### 3.3 Line Height

```
Tight      1.2      Headlines, numbers
Normal     1.5      Body text, tasks
Relaxed    1.8      Settings descriptions
```

### 3.4 Letter Spacing

```
Tight      -0.02em  Large headings
Normal     0        Body text (monospace already spaced)
Wide       0.05em   All-caps labels
```

---

## 4. Spacing & Grid System

### 4.1 Base Unit: 8px

```
┌────────────────────────────────┐
│  Space    Value    Usage       │
├────────────────────────────────┤
│  xs       4px      Tight gaps  │
│  sm       8px      Icon gaps   │
│  md       16px     Default     │
│  lg       24px     Sections    │
│  xl       32px     Major gaps  │
│  2xl      48px     Page spacing│
│  3xl      64px     Breathing   │
└────────────────────────────────┘
```

### 4.2 Container Widths

```
Task View       640px   (40rem)
Stats View      960px   (60rem)
Modal           480px   (30rem)
Mobile          100%    (full width)
```

### 4.3 Component Spacing

```
┌─────────────────────────────────────┐
│  Component         Padding          │
├─────────────────────────────────────┤
│  Page Container    32px all sides   │
│  Task Item         16px vertical    │
│  Input Field       16px vertical    │
│  Button            12px all sides   │
│  Modal             32px all sides   │
│  Card              24px all sides   │
└─────────────────────────────────────┘
```

---

## 5. Animation System

### 5.1 Animation Principles

1. **Purposeful Motion** - Every animation communicates state or guides attention
2. **Physics-Based** - Natural easing curves (no linear motion)
3. **Responsive Speed** - Fast enough to feel snappy, slow enough to track
4. **Reduced Motion Respect** - Honor `prefers-reduced-motion` media query

### 5.2 Timing Functions

```css
/* Primary Easing */
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);    /* Default */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Playful */
--ease-sharp: cubic-bezier(0.4, 0.0, 1, 1);       /* Exit */

/* Spring Physics */
--spring-soft: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 5.3 Duration Scale

```
┌────────────────────────────────────┐
│  Speed       ms      Usage         │
├────────────────────────────────────┤
│  Instant     100     Hover states  │
│  Fast        200     Toggles       │
│  Normal      300     Transitions   │
│  Smooth      400     Slides        │
│  Slow        600     Page changes  │
└────────────────────────────────────┘
```

### 5.4 Core Animations

#### Task Entry
```
Animation: Fade + Slide from bottom
Duration: 300ms
Easing: ease-smooth
Transform: translateY(20px) → translateY(0)
Opacity: 0 → 1
Stagger: 50ms per item
```

#### Task Completion
```
Animation: Scale + Fade
Duration: 400ms
Easing: spring-snappy
Transform: scale(0.95) → scale(1)
Opacity: 1 → 0.4
Strikethrough: 0% → 100% (200ms)
```

#### Checkbox Toggle
```
Unchecked → Checked:
  - Circle border: 2px → 0px (100ms)
  - Fill: transparent → solid (150ms, ease-sharp)
  - Check icon: scale(0) → scale(1) (200ms, spring-snappy)
  - Rotate: -45deg → 0deg (200ms)
```

#### Expand/Collapse
```
Animation: Height + Opacity
Duration: 400ms
Easing: ease-smooth
Height: 0 → auto (with max-height trick)
Opacity: 0 → 1
Children stagger: 30ms delay each
Arrow rotation: 90deg (200ms, ease-smooth)
```

#### Hover States
```
Buttons/Icons:
  Duration: 100ms
  Transform: scale(1.05)
  Opacity: +20%

Task Items:
  Duration: 150ms
  Background: fade in subtle (0 → 10% opacity)
  Action buttons: opacity 0 → 100%
```

#### Page Transitions
```
Exit:
  Duration: 300ms
  Opacity: 1 → 0
  Transform: translateX(-20px)

Enter:
  Duration: 400ms
  Delay: 100ms (after exit)
  Opacity: 0 → 1
  Transform: translateX(20px) → 0
```

#### Modal Animations
```
Backdrop:
  Duration: 200ms
  Opacity: 0 → 1

Content:
  Duration: 300ms
  Delay: 50ms
  Transform: translateY(-20px) + scale(0.95) → normal
  Opacity: 0 → 1
  Easing: spring-soft
```

#### Delete Animation
```
Phase 1 - Shrink (200ms):
  Transform: scale(0.9)
  Opacity: 0.5

Phase 2 - Slide out (300ms):
  Height: auto → 0
  Margin: normal → 0
  Opacity: 0.5 → 0
  Transform: translateX(-100px)
```

#### Add Subtask Input
```
Enter:
  Duration: 250ms
  Height: 0 → 48px
  Opacity: 0 → 1
  Transform: translateY(-10px) → 0

Exit:
  Duration: 200ms
  Height: 48px → 0
  Opacity: 1 → 0
```

---

## 6. Component Specifications

### 6.1 Header

```
┌─────────────────────────────────────────────────────┐
│  TODO                         [📊] [🌙] [⚙️]        │
└─────────────────────────────────────────────────────┘

Height: 80px
Border-bottom: 1px solid (10% opacity)
Typography: Title (32px)

Icons:
  Size: 24px
  Spacing: 16px between
  Hover: scale(1.1) + rotate(5deg) - 100ms
  Active: scale(0.95) - 50ms
```

### 6.2 Tab Navigation

```
┌─────────────────────────────────────────────────────┐
│  DAILY                    MUST-DO                   │
│  ▬▬▬▬                                               │
└─────────────────────────────────────────────────────┘

Typography: Body Large (18px), uppercase, letter-spacing: 0.05em
Active indicator: 3px height, 100% width, slides between tabs (300ms)
Inactive opacity: 40%
Hover: opacity 70%, 150ms transition
Gap: 48px between tabs
```

### 6.3 Task Input

```
┌─────────────────────────────────────────────────────┐
│  > add new task_                              [+]   │
└─────────────────────────────────────────────────────┘

Height: 64px
Typography: Body Large (18px)
Prefix: "> " (prompt symbol)
Cursor: Blinking block (600ms interval)
Border-bottom: 2px, animates on focus (200ms)
Plus button: 
  - Rotates 90deg on hover (200ms)
  - Scale animation on click (100ms)
```

### 6.4 Task Item

```
Standard Task:
┌─────────────────────────────────────────────────────┐
│  [ ]  prepare presentation               [+]  [×]   │
└─────────────────────────────────────────────────────┘

With Subtasks:
┌─────────────────────────────────────────────────────┐
│  [˅] [✓] prepare presentation (2/2)      [+]  [×]   │
│       │                                              │
│       ├─ [✓] create slides                          │
│       └─ [✓] practice delivery                      │
└─────────────────────────────────────────────────────┘

Height: 56px per item
Checkbox: 24px circle, 2px border
Typography: Body (16px)
Action buttons: 
  - Hidden by default (opacity: 0)
  - Fade in on hover (150ms)
  - 20px size

Indent per level: 32px
Connecting line: 1px, 10% opacity, animates with expand

Hover state:
  - Background: subtle (10% opacity) - fade in 150ms
  - Actions visible
  - Slight lift (translateY(-1px))
```

### 6.5 Checkbox States

```
Empty:        [ ]  Circle, 2px border
Hover:        [○]  Border thickens to 3px (100ms)
Checking:     [◐]  Fill animates 0→100% (150ms)
Checked:      [●]  Solid fill, check mark scales in

Check Icon Animation:
  0ms:   scale(0), rotate(-45deg)
  100ms: scale(1.2), rotate(0)
  200ms: scale(1)
```

### 6.6 Subtask Input Inline

```
Parent Task
┌─────────────────────────────────────────────────────┐
│  > enter subtask_                             [✓]   │
└─────────────────────────────────────────────────────┘

Height: 48px
Indent: Matches parent + 32px
Animation: Slides down from parent (250ms)
Background: Subtle (5% opacity)
Border-left: 2px accent (animates width 0→100%)
```

### 6.7 Statistics Cards

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│             1,234                                   │
│             TOTAL TASKS                             │
│                                                     │
└─────────────────────────────────────────────────────┘

Dimensions: Square aspect ratio
Padding: 32px
Typography: 
  - Number: Hero (48px), weight: 300
  - Label: Small (14px), uppercase, 50% opacity
Border: 1px, 10% opacity
Hover: 
  - Border opacity: 30% (200ms)
  - Scale: 1.02 (300ms, ease-smooth)

Number Count-Up Animation:
  Duration: 800ms
  Easing: ease-smooth
  From: 0 → actual value
```

### 6.8 Charts

**Styling:**
- Grid lines: 1px, 10% opacity
- Axes: 1px, 30% opacity
- Data line: 2px, 100% opacity
- Data points: 6px circles, appear with scale animation
- Bars: Animate height from 0 (600ms, ease-smooth)

**Animation on Load:**
- Fade in grid (200ms)
- Draw line path (800ms, linear)
- Stagger bar growth (50ms delay each)
- Scale in data points (200ms, spring-snappy)

**Interaction:**
- Tooltip: Fade + slide up (150ms)
- Hover point: Scale 1.5x (100ms)

### 6.9 History Cards

```
┌─────────────────────────────────────────────────────┐
│  MON, OCT 7                              [5/5] 100% │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [✓]  complete project proposal                    │
│       ├─ [✓] research                              │
│       └─ [✓] write draft                           │
│                                                     │
│  [✓]  team standup                                 │
│                                                     │
└─────────────────────────────────────────────────────┘

Border: 1px, 10% opacity
Border-radius: 8px (modern touch)
Padding: 24px
Margin-bottom: 16px

Header:
  - Date: Body (16px), uppercase
  - Counter: Small (14px), monospace tabular nums
  
Animation on scroll into view:
  - Slide up + fade (400ms, stagger 100ms)
  - Scale from 0.95 to 1
  
Hover:
  - Border color: 20% opacity
  - Slight shadow effect via translateY(-2px)
```

### 6.10 Settings Modal

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  SETTINGS                                     [×]   │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  NOTIFICATION INTERVAL                              │
│  ┌───────────────────────────┐                     │
│  │  3                        │ hours               │
│  └───────────────────────────┘                     │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  AUTO CARRY-OVER              ●━━━━━━━━━ ON        │
│  Move incomplete tasks to                          │
│  next day automatically                            │
│                                                     │
└─────────────────────────────────────────────────────┘

Width: 480px
Padding: 32px
Border: 1px, 20% opacity
Border-radius: 12px

Labels: Small (14px), uppercase, 50% opacity
Divider: 1px, 10% opacity

Toggle Switch:
  Track: 48px × 24px, border-radius: 24px
  Thumb: 20px circle
  Animation: 200ms, spring-soft
  Active state: Thumb slides, track fills

Backdrop:
  Background: Black, 60% opacity
  Blur: 4px (backdrop-filter)
  Click to close
```

---

## 7. Interaction Patterns

### 7.1 Micro-interactions

**Button Press:**
```
1. Scale down to 0.95 (50ms)
2. Scale back to 1 (100ms, spring-snappy)
3. Execute action
```

**Input Focus:**
```
1. Border color change (100ms)
2. Border width 1px → 2px (100ms)
3. Cursor appears with blink animation
```

**Task Completion:**
```
1. Checkbox fills (150ms)
2. Check icon draws (200ms)
3. Text fades to 40% (300ms)
4. Strikethrough animates (200ms, delay 100ms)
5. Subtasks cascade complete (50ms stagger)
```

**Delete Gesture:**
```
1. Hover → highlight with subtle background
2. Click delete
3. Flash red border (100ms pulse)
4. Shrink + fade (300ms)
5. Height collapse (200ms)
6. Items below slide up to fill space (300ms)
```

### 7.2 Loading States

**Skeleton Screen:**
- Shimmer animation: gradient moves left to right (1500ms loop)
- Opacity: 10% → 20% → 10%
- Width: Varies per content type

**Spinner (if needed):**
- 24px circle, 2px stroke
- Rotates 360deg (800ms linear infinite)
- Stroke dasharray animates (appearing/disappearing arc)

### 7.3 Empty States

**No Tasks:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    [ + ]                            │
│                                                     │
│              NO TASKS YET                           │
│         Press Enter to add one                      │
│                                                     │
└─────────────────────────────────────────────────────┘

Icon: 48px, 20% opacity, subtle pulse (2s loop)
Text: Small (14px), 40% opacity
Breathing animation: scale 1 → 1.02 → 1 (3s ease-in-out)
```

**No History:**
```
               NOTHING TO SHOW
         Complete tasks to see stats
```

---

## 8. Motion Choreography

### 8.1 Page Load Sequence

```
Timeline (Total: 1000ms)

0ms:    Background fade in
100ms:  Header slide down + fade
200ms:  Tab bar fade in
300ms:  Input field slide up + fade
400ms:  First task appears
450ms:  Second task appears
500ms:  Third task appears
        (Continue stagger for remaining tasks)
```

### 8.2 Tab Switch

```
Timeline (Total: 400ms)

0ms:    Active tab indicator slides (300ms)
        Current tasks fade out (200ms) + slide left (20px)
150ms:  New tasks fade in (250ms) + slide right to center
        (Crossfade overlap creates smooth transition)
```

### 8.3 Modal Open/Close

```
Open (350ms total):
0ms:    Backdrop fade in (200ms)
50ms:   Modal scale + slide up (300ms)

Close (250ms total):
0ms:    Modal scale down + fade (200ms)
100ms:  Backdrop fade out (150ms)
```

### 8.4 Task Expansion

```
Timeline (400ms total):

0ms:    Arrow rotates 90deg (200ms)
100ms:  First subtask appears (fade + slide)
150ms:  Second subtask appears
200ms:  Third subtask appears
        (50ms stagger between each)
```

---

## 9. Responsive Behavior

### 9.1 Breakpoints

```
Mobile:     < 640px
Tablet:     640px - 1024px
Desktop:    > 1024px
```

### 9.2 Layout Adaptations

**Mobile (< 640px):**
- Container padding: 16px
- Font size: -2px from base scale
- Task item height: 48px
- Action buttons always visible (no hover requirement)
- Larger touch targets: 44px minimum

**Tablet (640px - 1024px):**
- Standard specs apply
- Slightly reduced container max-width: 560px

**Desktop (> 1024px):**
- Full specs as documented
- Hover animations enabled
- Keyboard shortcuts functional

### 9.3 Touch Interactions

**Swipe to Delete:**
- Swipe left on task item (100px threshold)
- Red indicator slides in from right
- Release to confirm delete
- Smooth spring animation back if cancelled

**Pull to Refresh:**
- Pull down gesture on task list
- Spinner appears at top
- Refresh animation (800ms)
- Tasks reload with stagger animation

---

## 10. Accessibility

### 10.1 Motion

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All animations respect user's motion preferences.

### 10.2 Keyboard Navigation

- Tab order: logical flow top to bottom
- Focus indicators: 2px outline, 100% opacity, 0 offset
- Enter: Confirm actions
- Escape: Cancel/close modals
- Arrow keys: Navigate between tasks
- Space: Toggle checkboxes

### 10.3 Screen Readers

- Semantic HTML elements
- ARIA labels for icon buttons
- Status announcements for task completion
- Live regions for dynamic updates

---

## 11. Dark Mode Transitions

**Toggle Animation (400ms):**

```
Phase 1 (200ms):
  - Entire interface fades to 50% opacity
  - Colors begin transitioning

Phase 2 (200ms):
  - Interface fades back to 100%
  - All colors fully transitioned
  - Smooth interpolation (ease-smooth)
```

**No Flash:** Background transitions first, then foreground elements.

---

## 12. Performance Guidelines

### 12.1 Animation Performance

- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating: `width`, `height`, `top`, `left`
- Use `will-change` sparingly, remove after animation
- Max 60fps target

### 12.2 Optimization

```css
/* Good - GPU accelerated */
transform: translateY(10px);
opacity: 0.5;

/* Avoid - CPU bound */
margin-top: 10px;
height: 100px;
```

---

## 13. Implementation Notes

### 13.1 CSS Variables

```css
:root {
  /* Colors */
  --color-bg: #ffffff;
  --color-fg: #000000;
  --color-secondary: #6b7280;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Typography */
  --font-mono: 'JetBrains Mono', monospace;
  --text-hero: 3rem;
  --text-title: 2rem;
  --text-body: 1rem;
  
  /* Animation */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

[data-theme="dark"] {
  --color-bg: #000000;
  --color-fg: #ffffff;
  --color-secondary: #9ca3af;
}
```

### 13.2 Animation Library Recommendation

Consider using:
- **Framer Motion** (React) - Declarative animations
- **GSAP** - Complex timeline animations
- **CSS Transitions** - Simple state changes

### 13.3 Testing Animations

- Test on 60Hz and 120Hz+ displays
- Verify reduced-motion compatibility
- Check performance on low-end devices
- Test all easing curves feel natural

---

## 14. Design Assets

### 14.1 Required Fonts

**Primary:**
- JetBrains Mono (Variable font preferred)
  - Weights: 300, 400
  - License: OFL (Open Font License)
  - Download: https://www.jetbrains.com/lp/mono/

**Fallback:**
- System monospace fonts (built-in)

### 14.2 Icon Set

All icons: 20px or 24px, 2px stroke, monochrome
- Lucide Icons (recommended)
- Feather Icons (alternative)
- Or custom SVG icons matching style

---

## 15. Example Timings Summary

```
┌──────────────────────────────────────────────┐
│  Action              Duration    Easing      │
├──────────────────────────────────────────────┤
│  Hover               100ms       smooth      │
│  Click feedback      150ms       spring      │
│  Checkbox toggle     200ms       spring      │
│  Task expand         400ms       smooth      │
│  Task delete         500ms       smooth      │
│  Page transition     400ms       smooth      │
│  Modal open          350ms       soft spring │
│  Tab switch          400ms       smooth      │
│  List stagger        50ms/item   smooth      │
└──────────────────────────────────────────────┘
```

---

## End of UI Design Document

This design system creates a modern, fluid interface where motion enhances usability without overwhelming the minimalist aesthetic. Every animation serves a purpose: feedback, guidance, or delight.

**Key Takeaways:**
- Monospace typography for technical precision
- Generous spacing for clarity
- Physics-based animations for natural feel
- Black/white/gray palette with motion as the accent
- 100ms to 600ms timing range keeps interface snappy

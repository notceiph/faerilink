### Visual identity
- **Mood**: cozy, soft “glass” surfaces over a pastel-to-deep gradient, with subtle grain and starry background.
- **Accent**: lilac-violet (`--accent`) with strong contrast on text/actions.
- **Surfaces**: translucent, blurred containers with soft borders and layered shadows.

### Design tokens (CSS variables)
Use these as your single source of truth. Override under `html[data-theme="dark"]` for dark mode.

```css
:root {
  /* Color */
  --bg: #f9f6fb;
  --bg-elev: rgba(255,255,255,0.72);
  --bg-soft: rgba(255,255,255,0.55);
  --text: #2e2a32;
  --text-subtle: #5e5667;
  --muted: #8e86a0;
  --accent: #845ef7;
  --accent-contrast: #ffffff;
  --chip: #e9e2ff;
  --chip-text: #2b2440;
  --success: #2f9e44;

  /* Shape & spacing */
  --radius: 16px;
  --radius-pill: 999px;
  --space-2xs: .25rem; --space-xs: .5rem; --space-sm: .75rem;
  --space-md: 1rem; --space-lg: 1.5rem; --space-xl: 2rem; --space-2xl: 3rem;

  /* Type */
  --font: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --fs-sm: .875rem; --fs-md: 1rem; --fs-lg: 1.125rem; --fs-xl: 1.25rem;

  /* Elevation & borders */
  --shadow-1: 0 6px 18px rgba(20, 16, 25, 0.12), 0 2px 6px rgba(20, 16, 25, 0.08);
  --shadow-2: 0 10px 30px rgba(20,16,25,0.18), 0 3px 10px rgba(20,16,25,0.10);
  --ring: 0 0 0 3px color-mix(in oklab, var(--accent) 30%, transparent);

  /* Motion */
  --ease: cubic-bezier(.22, .61, .36, 1);
  --ease-soft: cubic-bezier(.16,.84,.44,1);
  --dur-1: 120ms; --dur-2: 220ms; --dur-3: 400ms;

  /* Backgrounds */
  --gradient:
    radial-gradient(1200px 1200px at 10% -10%, #ffdff6 0%, transparent 50%),
    radial-gradient(1000px 1000px at 100% 0%, #e6f0ff 0%, transparent 45%),
    linear-gradient(180deg, #ffffff 0%, #faf7ff 100%);
  --grain: url("data:image/svg+xml,%3Csvg ... feTurbulence fractal noise ... %3C/svg%3E");
}

html[data-theme="dark"] {
  --bg: #0f0d12; --bg-elev: rgba(25, 21, 30, 0.82); --bg-soft: rgba(25, 21, 30, 0.6);
  --text: #f0ebf7; --text-subtle: #cbc3d9; --muted: #a79dbb;
  --accent: #b794f4; --accent-contrast: #111016;
  --chip: #2b2435; --chip-text: #f0ebf7;
  --gradient:
    radial-gradient(1200px 1200px at 10% -10%, #3a2b4a 0%, transparent 50%),
    radial-gradient(1000px 1000px at 100% 0%, #1b2544 0%, transparent 45%),
    linear-gradient(180deg, #18141d 0%, #0f0d12 100%);
}
```

- Background and grain usage:
```134:142:faerilink/brnding/style.css
.sky { position: fixed; inset: 0; pointer-events: none; }
.stars, .glow { position: absolute; inset: 0; }
.glow { background-image: var(--grain); mix-blend-mode: overlay; opacity: .35; }
```

### Theming and motion
- **Theme state**: set `html[data-theme="light"|"dark"]` and optionally `data-theme-auto="true"`.
- **Motion state**: set `html[data-motion="auto"|"reduced"]`. In reduced mode, disable transitions/animations.
- Prefs are determined by system media queries, overridable via user choice. See behavior:
```36:49:faerilink/brnding/script.js
function applyTheme(){... document.documentElement.dataset.theme = chosen; ...}
function applyMotion(){... document.documentElement.dataset.motion = chosen === 'reduced' ? 'reduced' : 'auto'; ...}
```

### Layout and surfaces
- **Page background**: `background: var(--gradient), var(--bg); background-attachment: fixed;`
- **Surface container**: translucent “glass” with blur, soft border, shadow.
```110:116:faerilink/brnding/style.css
.container {
  background: var(--bg-elev);
  border-radius: var(--radius);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-1);
  border: 1px solid color-mix(in oklab, var(--text) 8%, transparent);
}
```
- **Spacing utilities**: `row` (flex + `gap: var(--space-md)`), `stack-md/stack-lg` for vertical rhythm.

### Components
- **Buttons**
  - Default `.btn`: soft surface, 44px min height, subtle hover/active, focus ring via `--ring`.
  - Accent `.btn-accent`: filled with `--accent`, no border, high contrast text.
- **Icon buttons**: 40×40 grid center, elevated surface.
- **Chips**: pill radius, soft background `--chip`, pressed state outlined with `color-mix` of `--accent`.
- **Cards**: soft elevated surfaces with 3D tilt on hover (disabled when motion is reduced). Title, URL, badges, actions.
- **Badges**: small pill using `color-mix` of `--accent` (~12%) for gentle hint.
- **Toast**: centered bottom, fades in/out with `--dur-3`, high-contrast on `--accent`.
- **Modals**: centered panel inside dim/backdrop blur, focus-trapped.
- **Bottom nav (mobile)**: fixed translucent bar with pill-active background.

Citations:
```158:176:faerilink/brnding/style.css
.btn { ... min-height: 44px; ... }
.btn-accent { background: var(--accent); color: var(--accent-contrast); border-color: transparent; }
```

```186:196:faerilink/brnding/style.css
.chip { border-radius: var(--radius-pill); ... background: --chip; color: --chip-text; }
.chip[aria-pressed="true"] { outline: 2px solid color-mix(in oklab, var(--accent) 60%, transparent); }
```

```234:236:faerilink/brnding/style.css
.card:hover { box-shadow: 0 18px 50px rgba(20, 16, 25, 0.2); }
.card[data-tilt="on"]:hover { transform: perspective(900px) rotateX(3deg) rotateY(-2deg) translateY(-2px); }
```

### Background effects
- Add a fixed overlay container with stars and grain:
```40:44:faerilink/brnding/index.html
<div class="sky parallax" aria-hidden="true">
  <div class="stars layer-1"></div>
  <div class="stars layer-2"></div>
  <div class="glow"></div>
</div>
```
- Stars use tiny radial gradients; grain is an inline SVG with `feTurbulence` blended via `mix-blend-mode: overlay`.

### Interaction patterns
- **Easing**: default `--ease`; softer `--ease-soft` for larger moves.
- **Durations**: 120/220/400ms.
- **Reduced motion**: kill animations/transitions and disable tilt; respect `prefers-reduced-motion`.
- **Focus**: no default outline; use `box-shadow: var(--ring)` on focus-visible.
- **Card tilt**: 6° range on pointer move with perspective; reset on leave.
- **List/Grid switch**: swap `display` and grid columns responsively.

### Accessibility
- 44px minimum hit targets for interactive controls.
- Live region toast (`role="status" aria-live="polite"`).
- Dialogs: focus trap, Escape to close, backdrop click to dismiss.
- Visible focus styles via `--ring`.
- Color choices ensure AA for text and critical UI.

### Implementation checklist (to port the style)
- **Tokens**: copy the variables block and dark overrides.
- **HTML root flags**: set `data-theme` and `data-motion`; optionally implement toggles that read system prefs with media queries.
- **Page background**: apply `var(--gradient), var(--bg)` and add `.sky + .glow` overlay if you want the grain/stars.
- **Surfaces**: wrap key sections in `.container` variants.
- **Components**: adopt the button, chip, card, modal patterns; keep radii/shadows consistent.
- **Motion**: use the provided easings/durations; disable in reduced motion.

If you want, I can extract this into a reusable `tokens.css` + `base.css` and a minimal JS utility for theme/motion toggling for your other app.

- Added: extracted tokens, themes, and component rules from `style.css` and behaviors from `script.js`.
- Key items: color tokens, gradient/grain background, glass surfaces, button/chip/card specs, modal/toast patterns, motion and accessibility rules.
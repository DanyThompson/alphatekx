# AlphaArchitect Style Guide

## Design Philosophy
**Vibe:** Dark-first, glass-morphism, premium SaaS / funded-startup aesthetic.
Every generated app must feel like it came from a well-funded product team, not a demo.

---

## Color Tokens

### Brand Colors
| Token           | Value      | Usage                                  |
|-----------------|------------|----------------------------------------|
| `--brand`       | `#6366f1`  | Primary CTAs, active nav, highlights   |
| `--brand-light` | `#818cf8`  | Hover states, icon accents             |
| `--brand-dark`  | `#4f46e5`  | Pressed states, dark gradients         |
| `--accent`      | `#06b6d4`  | Secondary CTAs, data viz, badges       |
| `--accent-light`| `#22d3ee`  | Hover on accent elements               |

### Surface Colors (Dark Mode)
| Token        | Value      | Usage                        |
|--------------|------------|------------------------------|
| `--bg-0`     | `#04060f`  | Page background              |
| `--bg-1`     | `#07091b`  | Sidebar background           |
| `--bg-2`     | `#0a0e24`  | Card background              |
| `--bg-3`     | `#0f1430`  | Elevated card / modal        |
| `--border`   | `rgba(99,102,241,0.12)` | Default border  |
| `--border-hover` | `rgba(99,102,241,0.28)` | Hover border |

### Text Colors
| Token      | Value       | Usage                        |
|------------|-------------|------------------------------|
| `--text-1` | `#f1f5f9`   | Primary headings             |
| `--text-2` | `#94a3b8`   | Body copy, descriptions      |
| `--text-3` | `#475569`   | Muted labels, placeholders   |

### Status Colors
| Status  | Color       | Hex       |
|---------|-------------|-----------|
| Success | Green       | `#10b981` |
| Warning | Amber       | `#f59e0b` |
| Error   | Red         | `#ef4444` |
| Info    | Brand       | `#6366f1` |

---

## Typography

### Font Stack
- **Primary:** Inter (Google Fonts, variable font: 300–900)
- **Monospace:** Fira Code (for code blocks)
- **Fallback:** system-ui, sans-serif

### Scale
| Role         | Size  | Weight | Line Height |
|--------------|-------|--------|-------------|
| Display      | 48px  | 900    | 1.1         |
| H1           | 36px  | 800    | 1.15        |
| H2           | 28px  | 700    | 1.2         |
| H3           | 22px  | 700    | 1.25        |
| H4           | 18px  | 600    | 1.3         |
| Body Large   | 16px  | 400    | 1.65        |
| Body         | 14px  | 400    | 1.6         |
| Small        | 12px  | 500    | 1.5         |
| Label        | 11px  | 700    | 1.4 (uppercase + tracking) |

---

## Spacing System (4px base)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96px`

- **Section padding:** `py-24` (96px) on desktop, `py-16` on mobile
- **Card padding:** `p-6` (24px) standard, `p-8` (32px) featured
- **Component gap:** `gap-6` (24px) between cards, `gap-4` (16px) between list items
- **Inline gap:** `gap-2` (8px) for icon+label, `gap-3` (12px) for button+icon

---

## Component Patterns

### Buttons
```
Primary CTA:   gradient(135deg, #6366f1, #4f46e5) — bold, shadow, hover lifts
Secondary CTA: border + brand color, transparent bg
Ghost:         transparent, border on hover
Destructive:   red tint border + red text
```
**Rule:** Max 1 primary CTA per section. CTAs must be 44px+ tall for mobile.

### Cards
```
Standard:  glass bg (rgba(10,14,36,0.7)) + border + hover lift
Featured:  gradient bg + glowing border + top-line accent
Stat:      glass + shimmer top accent line + animated counter
```

### Navigation
```
Fixed navbar: blur(20px) backdrop + subtle border
Sidebar: 64px wide (icons only) or 240px (with labels)
Active state: brand color bg + brand border
```

---

## Section Layout Rules

### Landing Pages — Required Sections (in order)
1. **Navbar** — sticky, logo + nav links + primary CTA button
2. **Hero** — headline + subhead + 2 CTAs (primary + secondary) + social proof
3. **Logo Strip** — "Trusted by" with 5–8 client logos
4. **Features/Benefits** — 3-column grid, icon + title + description
5. **How It Works** — numbered steps (3 steps)
6. **Social Proof** — testimonials (3 cards) + ratings
7. **Pricing** — 3 tiers (Starter / Pro / Enterprise) with feature comparison
8. **FAQ** — accordion, 6–8 questions
9. **Final CTA** — full-width gradient section, bold headline + primary CTA
10. **Footer** — links + social + copyright

### Dashboard Apps — Required Sections
1. Sidebar nav (collapsible)
2. Header with breadcrumb + user avatar
3. Stats bar (4 KPI cards)
4. Main content area (table OR kanban OR chart)
5. Recent activity feed

---

## Conversion Optimization Rules

1. **Above the Fold:** Primary CTA must be visible WITHOUT scrolling on 1280×720.
2. **CTA Copy:** Action verbs only — "Book a Demo", "Start Free Trial", "Get Quote" — NOT "Submit" or "Click Here".
3. **Social Proof:** Always place trust signals (logos, stars, counts) within 2 sections of the hero.
4. **Friction Reduction:** Free tier CTAs say "No credit card required." Paid CTAs say "Cancel anytime."
5. **Color Contrast:** All CTAs must have ≥4.5:1 contrast ratio.
6. **Urgency:** Use subtle urgency on pricing ("Most popular", limited spots) — never fake countdowns.

---

## Animation Rules
- Hero entrance: GSAP `from` with `opacity:0, y:30, stagger:0.12`
- Scroll reveals: `ScrollTrigger` with `start:'top 85%'`
- Stat counters: GSAP `countUp` animation on viewport enter
- Hover lifts: `translateY(-2px)` with `0.25s ease`
- No janky CSS transitions on layout-affecting properties

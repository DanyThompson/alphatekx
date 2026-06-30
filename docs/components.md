# AlphaArchitect Component Catalog

## Usage Rules
- ALWAYS use components from this catalog when the use case matches.
- NEVER write raw unstyled HTML for these patterns.
- Reference components by their class names (applied via `<style>` in the single-file app).

---

## Navigation

### `NavbarFixed`
**Use for:** All landing pages, marketing sites, SaaS apps.
**Structure:** `logo | nav-links | CTA button`
**Behavior:** Transparent on load → opaque glass on scroll (JS scroll listener).
**Classes:** `.navbar`, `.nav-link`, `.btn-primary`
```
<nav class="navbar">
  <div class="nav-inner">
    <a class="nav-brand">Logo</a>
    <div class="nav-links">...</div>
    <button class="btn btn-primary btn-sm">Book a Demo</button>
  </div>
</nav>
```

### `SidebarApp`
**Use for:** Dashboard apps, management systems, admin panels.
**Variants:** `sidebar-wide` (240px with labels) | `sidebar-collapsed` (64px icons-only)
**Classes:** `.sidebar`, `.nav-item`, `.nav-item.active`, `.nav-section-label`

---

## Hero Sections

### `HeroCenter` — Centered, gradient headline
**Use for:** SaaS landing pages, AI product launches.
**Required elements:** Badge → H1 → Subheadline → 2 CTAs → Social proof row
**Classes:** `.hero-section`, `.hero-badge`, `.gradient-heading`, `.hero-actions`, `.hero-social-proof`

### `HeroSplit` — Left text, right visual
**Use for:** B2B services, consulting, product demos.
**Required elements:** H1 → Subheadline → CTA → List of benefits | Right: image/mockup/demo

### `HeroDashboard` — App screenshot in hero
**Use for:** SaaS products with a visual UI to showcase.
**Pattern:** HeroCenter layout + mockup browser frame beneath CTAs.

---

## Feature Sections

### `FeatureGrid3Col`
**Use for:** Listing 6 features in a 3-column grid.
**Each card:** Icon (`.icon-wrap.icon-indigo`) + Title + Description
**Classes:** `.feature-card`

### `FeatureAlternating`
**Use for:** Deep-dive feature explanations (3–4 features).
**Pattern:** Alternating left/right image + text with feature list.

### `FeatureTabbed`
**Use for:** Product with multiple major modules (e.g., CRM with Sales, Support, Analytics tabs).

---

## Social Proof

### `TestimonialCards`
**Pattern:** 3 cards in a row. Each: avatar + name + role + company + star rating + quote.
**Classes:** `.testimonial-card`, `.avatar`, `.star-rating`
**Rule:** Use realistic names, roles, companies. No "John Doe" or "Happy Customer".

### `LogoStrip`
**Pattern:** Grayscale logos, slightly transparent, `filter: grayscale(1) opacity(0.5)`
**Behavior:** Optionally auto-scroll via CSS marquee animation.

### `StatsRow`
**Pattern:** 4 numbers with labels (e.g., "10,000+ users", "99.9% uptime").
**Classes:** `.stat-card`, `[data-count]` for GSAP counter animation.

---

## Pricing

### `PricingTable3Tier`
**Tiers:** Starter (free/low) | Pro (popular, highlighted) | Enterprise (contact)
**Classes:** `.pricing-card`, `.pricing-card.popular`
**Required:** Feature comparison list, CTA per tier, "Most popular" badge on Pro.
**Rule:** Pro tier must be visually distinct — larger, glowing border.

---

## Data Display

### `DataTable`
**Use for:** Any list of records (users, orders, products, etc.)
**Required features:** Search, sort on column headers, pagination (10/page), row hover actions.
**Classes:** `.data-table`, `.row-actions`

### `KanbanBoard`
**Use for:** Task/project management, pipeline management.
**Library:** SortableJS for drag-drop.
**Classes:** `.kanban-col`, `.kanban-card`, `.sortable-ghost`

### `StatsDashboard`
**Pattern:** 4 KPI stat cards on top + Chart.js charts below.
**Required:** Animated counters, line/bar/doughnut charts with dark config.

---

## Forms & Inputs

### `ContactForm`
**Fields:** Name, Email, Company (optional), Message, Submit CTA
**Validation:** Required fields, email format, min-length message.
**Success state:** Replace form with confirmation message + animation.

### `MultiStepForm`
**Use for:** Onboarding, quote builders, complex registrations.
**Pattern:** Progress bar + step indicator + Back/Next buttons.

### `SearchBar`
**Classes:** `.search-bar` with `.search-icon` inside.
**Behavior:** Debounced input (300ms), clear button, keyboard shortcut hint.

---

## Modals & Overlays

### `ModalDialog`
**Classes:** `.modal-overlay`, `.modal-box`
**Behavior:** Click outside to close, Escape key to close, focus trap.
**Required:** Close button (X), title, content, action buttons.

### `DropdownMenu`
**Classes:** `.dropdown`, `.dropdown-menu`, `.dropdown-item`
**Behavior:** Click to toggle, click outside to close, keyboard navigation.

---

## Feedback

### `ToastSystem`
**Classes:** `.toast-container`, `.toast-item`, `.toast-success/error/info/warning`
**Behavior:** Auto-dismiss after 4s, max 3 visible at once.

### `EmptyState`
**Classes:** `.empty-state`, `.empty-icon`
**Required:** Icon + heading + subtext + optional CTA button.

### `SkeletonLoader`
**Classes:** `.skeleton`
**Use:** Whenever data is loading — never show empty UI.

---

## Layout Utilities

### Grid System
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` — standard 3-col
- `grid grid-cols-2 lg:grid-cols-4 gap-4` — stat cards
- `flex flex-col lg:flex-row gap-8` — split layout

### Section Wrapper
```
<section class="section-wrapper">
  <div class="section-inner"> ... </div>
</section>
```
`.section-wrapper { padding: 96px 0; }`
`.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }`

### Section Header (standard pattern)
```
<div class="section-header">
  <span class="section-badge">Badge Label</span>
  <h2 class="section-title">Main Heading</h2>
  <p class="section-desc">Supporting description text.</p>
</div>
```

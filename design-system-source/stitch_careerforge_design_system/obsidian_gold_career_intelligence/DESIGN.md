---
name: Obsidian Gold Career Intelligence
colors:
  surface: '#151310'
  surface-dim: '#151310'
  surface-bright: '#3c3836'
  surface-container-lowest: '#100e0b'
  surface-container-low: '#1e1b19'
  surface-container: '#221f1c'
  surface-container-high: '#2d2927'
  surface-container-highest: '#383431'
  on-surface: '#e8e1dd'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e8e1dd'
  inverse-on-surface: '#33302d'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c9c6c5'
  on-secondary: '#313030'
  secondary-container: '#474646'
  on-secondary-container: '#b7b4b4'
  tertiary: '#b9ceff'
  on-tertiary: '#002e6a'
  tertiary-container: '#8eb2ff'
  on-tertiary-container: '#004291'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#151310'
  on-background: '#e8e1dd'
  surface-variant: '#383431'
typography:
  display-xl:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '300'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '300'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-base:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '300'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.15em
  stat-mono:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  display-xl-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '300'
    lineHeight: 40px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1152px
  dashboard-max: 1440px
  gutter: 24px
  margin-sm: 16px
  margin-lg: 32px
---

## Brand & Style

The design system is built on a narrative of **Dark Editorial Luxury & AI Intelligence**. It positions the platform not just as a tool, but as an elite career accelerator. The aesthetic combines the precision of high-performance developer environments with the prestige of luxury materials.

The style is a sophisticated blend of **Minimalism** and **Glassmorphism**, specifically utilizing "Liquid Glass" effects. The UI should evoke a sense of exclusivity, algorithmic mastery, and craftsmanship. Every element is designed to feel intentional, using purposeful whitespace and surgical clarity to manage complex data.

**Key Visual Principles:**
- **The Obsidian Canvas:** A deep, near-black foundation that provides infinite depth for light and color.
- **Precision & Polish:** Hairline borders and subtle radial glows that suggest high-end engineering.
- **Editorial Hierarchy:** A mix of classic serif displays and technical monospaced accents to balance human expertise with AI power.

## Colors

The palette is anchored in high-contrast prestige. The primary driver is **Artisan Metallic Gold**, used sparingly to denote intelligence, success, and primary actions. 

- **Primary (Artisan Gold):** `#d4af37`. Reserved for CTAs, active states, and critical success metrics.
- **Secondary (Obsidian):** `#070707`. The base layer for the entire application.
- **Tertiary (Intelligence Blue):** `#3b82f6`. Used specifically for AI-driven insights and diagnostic data.
- **Surface Tiers:** 
    - Base: `#070707`
    - Panel: `#0a0a0a`
    - Card: `#141414`
    - Hover: `#1a1a1a`
- **Functional States:** Success uses Emerald (`#10b981`), Warning uses Amber (`#f59e0b`), and Error uses Crimson (`#ef4444`). These are always presented with low-opacity backgrounds and high-vibrancy text/borders.

## Typography

The typography system uses a high-low mix to create an editorial feel.

- **Display & Headlines:** Use **Newsreader** (as a high-quality alternative to Fraunces) for a traditional, authoritative, and literary feel. It should be used for hero sections and major module headings.
- **Interface & Body:** **Plus Jakarta Sans** provides a modern, legible, and welcoming contrast. We use a light weight (300) for body text on dark backgrounds to reduce optical "smearing" and maintain a premium look.
- **Technical Metadata:** **JetBrains Mono** is used for "Stat Mono" and "Label Caps" to signify AI-generated data, scores, and technical categories.

All headers maintain a tight negative letter-spacing for a "tucked" professional appearance, while labels use wide tracking for maximum scanability.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model with strict container constraints to preserve the editorial layout.

- **Marketing/Landing Pages:** Centered `max-w-6xl` (1152px) content area to maintain focus and readable line lengths.
- **Application Dashboard:** A flexible 12-column layout with a fixed-width left sidebar (240px). 
- **Rhythm:** A 4px baseline grid ensures consistent vertical alignment. Section padding is generous (80px to 120px) on landing pages to allow "Liquid Glass" elements room to breathe.
- **Breakpoints:**
    - **Mobile (<768px):** Single column, margins reduced to 16px.
    - **Tablet (768px - 1024px):** 2-column grid for dashboards, margins 24px.
    - **Desktop (>1024px):** Full multi-column expansion, fixed sidebar visibility.

## Elevation & Depth

Hierarchy is established through **Liquid Glass Materials** and **Tonal Layering** rather than traditional heavy shadows.

- **Surface Stacking:** Objects closer to the user are lighter. The base is `#070707`, cards are `#141414`, and floating elements use the Glass Material.
- **Liquid Glass Material:** Navigation bars and modals use a backdrop blur (32px), high saturation (200%), and a semi-transparent dark fill. They must include a "Hairline Gold Border" (`rgba(212, 175, 55, 0.18)`).
- **Ambient Glows:** Use soft, highly diffused radial gradients behind major modules. For example, a primary CTA may have a subtle gold glow (`rgba(212, 175, 55, 0.08)`) with a 120px blur radius to suggest energy and focal importance.
- **Interactive Depth:** On hover, cards do not just lighten; they transition their border opacity from 0.15 to 0.35 and translate -2px on the Y-axis.

## Shapes

The shape language is **Rounded**, leaning towards a modern "Squircle" aesthetic. 

- **Standard Elements:** Buttons and input fields use `0.5rem` (rounded-md/lg).
- **Container Elements:** Cards and dashboard modules use `1rem` (rounded-xl) or `1.5rem` (rounded-2xl) to create a softer, more premium container feel.
- **Utility Elements:** Feature pills and avatar chips use `full` (pill-shaped) to distinguish them from structural layout components.
- **Borders:** All borders are strictly 1px ("Hairline") to maintain the precision-tooled aesthetic.

## Components

- **Buttons:** 
    - *Primary:* Solid Gold (`#d4af37`), black text, bold. Subtle outer glow on hover.
    - *Secondary:* Dark surface, 1px gold border, off-white text.
- **Job Cards:** Feature a background of `#141414`, a hairline gold border, and a Newsreader headline. Include a "Match Score" using the Stat Mono typography in the top right.
- **ATS Gauge:** A radial SVG progress ring. The track is `#27272a`. The indicator color is dynamic based on the score (Gold for high, Amber for medium). Center text uses Stat Mono.
- **Input Fields:** Deep obsidian backgrounds (`#0c0c0c`) with a subtle 1px border. On focus, the border brightens to Gold with a soft glow ring.
- **Skill Chips:** 
    - *Matched:* Dark emerald background, bright emerald text, leading checkmark icon.
    - *Gap:* Dark amber background, bright gold text, leading "plus" icon.
- **Career Roadmap:** A vertical or horizontal timeline using JetBrains Mono for "Week X" indicators and newsreader for milestone titles. Each milestone is a card with a progress gauge.
- **Resume Builder Sidebar:** Uses a "Liquid Glass" panel with high backdrop blur to overlay the main resume preview, emphasizing the AI assistant's presence.
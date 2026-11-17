---
name: Critical Dispatch
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#ba0035'
  on-tertiary: '#ffffff'
  tertiary-container: '#e21e49'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 52px
    fontWeight: '700'
    lineHeight: 58px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 19px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lead:
    fontFamily: Newsreader
    fontSize: 21px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Newsreader
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-badge:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
  metadata:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3.5rem
---

## Brand & Style

This design system is tailored for high-impact independent journalism, analytical criticism, investigative culture essays, and premium subscriber newsletters. It fuses two distinct editorial archetypes:
1. **The Investigative Tech & Power Digest:** Sharp, uncompromising, data-aware, and built for direct reader engagement (monetized newsletters, insider deep-dives, and exclusive investigations).
2. **The European Cultural & Videogame Essayist:** Monographic curation, literary authority, artistic reverence, and uncompromising typographic discipline.

The emotional signature is **authoritative, incisive, uncompromised, and intellectually honest**. It strips away generic algorithmic noise, endless engagement loops, and intrusive ad-tech clutter. Instead, it offers an ivory-white canvas punctuated by stark pitch-black typography, crisp geometric accents, and bold status markers that command respect.

### Visual Style
- **High-Contrast Editorial Minimalism with Modernist Precision:** A pristine, breathable layout governed by deliberate rules of hierarchy, fine hairline separators (`1px solid #e5e5e5`), and distinct architectural rhythm.
- **Micro-Accents:** The palette relies heavily on stark monochrome foundations with high-voltage focal cues: electric cyan (`#00c2ff` / `#0284c7`) denoting primary reader actions and subscription tiers, flanked by an editorial crimson (`#e11d48`) badge signal for urgent breaking dossiers or curated monographs.

## Colors

The color palette is built around an uncompromising editorial reading experience. The canvas uses crisp, warm-tinted off-white surfaces that reduce glare during long-form reading, paired with deep slate-blacks that maximize legibility without harsh absolute black fatigue.

### Palette Architecture
- **Primary (`#0284c7` / Bright Accent `#00c2ff`):** Used deliberately for high-priority subscription buttons, active tab indicators, and PRO subscriber markers. It creates an energetic, contemporary digital pulse.
- **Secondary (`#0f172a`):** Deep obsidian slate, applied to primary headlines, dominant mastheads, and high-impact structural panels (e.g., newsletter footer CTA boxes).
- **Tertiary (`#e11d48`):** Crimson editorial red. Reserved for exclusive monographic identifiers, breaking alerts, and high-priority authorial stamps.
- **Neutral (`#64748b` with light variants `#94a3b8` / `#cbd5e1`):** Governs bylines, timestamps, estimated reading time, sub-captions, and micro-metadata.
- **Surfaces & Borders:** Base background sits on `#fcfbf9` (soft warm ivory) transitioning to pure `#ffffff` inside cards and reading modules. Dividing rules strictly follow `#e5e5e5` and `#f1f5f9`.

## Typography

The typographical pairing creates intentional tension between modern digital journalism and classical literary gravitas:
- **Headlines (`Space Grotesk`):** Dense, condensed, geometric, and authoritative. Carries urgent news headlines and newsletter titles with maximum optical punch. Titles use tight letter-spacing (`-0.02em` to `-0.03em`) to mimic physical print mastheads.
- **Long-Form Reading (`Newsreader`):** A warm, editorial serif with generous optical proportion, optimized for extensive analytical essays. The leading is intentionally open (`line-height: 1.65` to `1.75`) to preserve reader focus across deep-dive investigations.
- **Metadata, Badges & Micro-Copy (`Space Grotesk` Uppercase):** Byline attribution, publication dates, and reading durations run in all-caps with generous character spacing (`0.06em` to `0.08em`) for crisp, technical scanability.

## Layout & Spacing

The layout is built upon an adaptive 12-column editorial grid structured to support asymmetrical compositions, hero investigations, and clean sequential feeds:

- **Desktop (>= 1200px):** 12-column layout with max-width constrained to `1280px` for portal frontpages and `740px` for focused reading articles. Margins sit at `2.5rem`, with gutters at `1.5rem`.
- **Tablet (768px - 1199px):** 8-column layout with `2rem` margins, collapsing tertiary sidebars beneath main stream content.
- **Mobile (< 768px):** 4-column layout with `1rem` margins and `1rem` gutters. Asymmetrical multi-column card splits stack into vertical editorial feeds.

### Spacing Philosophy
Spacing operates on a strict baseline multiple:
- Fine metadata groupings use `space-xs` (6px) and `space-sm` (12px).
- Internal article card paddings rely on `space-md` (20px).
- Major thematic breakups, paywall gates, and newsletter conversion modules invoke `space-xl` (56px) to generate decisive editorial pauses.

## Elevation & Depth

This design system adopts a **flat, architectural depth model** with zero reliance on heavy skeuomorphic drop shadows. Hierarchy is communicated through surface contrasts, hairlines, and precise structural layering:

1. **Subtle Hairline Borders:** Dividers between article streams, featured boxes, and navigation bars use crisp `1px` lines in `#e5e5e5` (darker contrast `#0f172a` for primary category banners).
2. **Surface Contrasts:** The main body rests on `#fcfbf9` or `#ffffff`, while elevated callout modules (newsletter capture, monograph blocks) employ stark inverted slate (`#0f172a` background with white text) or faint warm neutral fills (`#f8f7f4`).
3. **Ghost Paywall Gradient:** When an article encounters an editorial gate, the reading body smoothly transitions from opaque black text to transparent ivory through a linear gradient (`linear-gradient(to bottom, rgba(252, 251, 249, 0) 0%, rgba(252, 251, 249, 1) 90%)`), culminating in a clean, elevated subscriber subscription card bordered with a clean `1px solid #e5e5e5`.

## Shapes

The design system merges crisp rectangular editorial imagery with distinctive **pill-shaped interactive markers**:

- **Badges & Pill Labels (`rounded-full` / Level 3):** All categorical tags (`EN PORTADA`, `DESTACADOS`, `SUSCRIPTORES`, `PRO`) feature full radius caps (pill shape) with small padding (`0.25rem 0.65rem`), producing sharp, graphic tags that anchor thumbnails and headline groups.
- **Interactive Buttons:** Action buttons use fully rounded pill profiles (`rounded-full`) or smooth rounded rectangles to differentiate modern app interactions from rigid, rectangular print layout columns.
- **Editorial Imagery:** Article thumbnails, author portraits, and lead photos maintain crisp square corners (`0px` or a discreet `0.25rem`), preserving journalistic authenticity without artificial rounding.

## Components

### 1. Editorial Badges & Pill Labels
- **Outlined Pill (Standard):** Transparent background, `1px solid #111827`, text in uppercase `Space Grotesk` (`10px`, weight 700, letter-spacing `0.08em`).
- **Cyan PRO Pill:** Background `#e0f2fe`, text `#0284c7`, border `1px solid #bae6fd`. High visibility for exclusive, paid tiers.
- **Monograph / Alert Pill:** Background `#ffe4e6`, text `#e11d48`, border `1px solid #fecdd3`.

### 2. Article Cards & List Items
- **Lead Hero Article:** Horizontal split (60% media visual, 40% editorial copy) on desktop. Large `Space Grotesk` bold headline, 2-line `Newsreader` teaser, and metadata row showing badge, publication date, and author signature.
- **Compact Stream Item:** 1-to-1 thumbnail on the right (120px x 80px), left-aligned headline with top pill badge and bottom byline. Separated by a clean `1px solid #e5e5e5` rule below each entry.

### 3. Action Buttons & Input Fields
- **Primary Action (Subscribe / Read PRO):** Solid `#00c2ff` or `#0284c7` background, text in crisp `#0f172a` or `#ffffff`, pill-rounded (`border-radius: 9999px`), bold `Space Grotesk` label.
- **Newsletter Email Input:** Understated field with `#ffffff` fill, `1px solid #cbd5e1` boundary, smooth pill corners, accompanied by an inline high-contrast submission button.

### 4. Paywall & Membership Gating Module
- Clean vertical stack positioned directly over the faded reading text.
- Contains an exclusive lock or tier indicator, a concise headline, benefits list in bullet points, and a prominent dual CTA: single issue purchase vs. annual full-access pass.

### 5. Newsletter Footer Banner
- Full-width dark slate canvas (`#0f172a`) with stark white typography, an electric cyan accent pill (`NEWSLETTER EXCLUSIVA`), and direct subscription form input providing zero-friction conversion.
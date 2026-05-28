# Design System

All UI styles in this project must reference the design tokens defined below. Do not use raw Tailwind default colors, fonts, or spacing utilities for product UI (e.g. `text-gray-500`, `bg-blue-600`, `font-sans`). Tailwind layout utilities (flex, grid, spacing) are acceptable, but every color/typography/radius value must come from a token below.

## Handoff Tokens (source of truth)

These tokens come from `design/handoff/styles.css` and are registered as `:root` custom properties in `src/app/globals.css`. **These are the authoritative design tokens for all AEO Auditor pages.**

### Color tokens

| Token             | Value       | Usage                                    |
| ----------------- | ----------- | ---------------------------------------- |
| `--primary`       | `#2563EB`   | Primary buttons, links, focus rings      |
| `--primary-700`   | `#1D4ED8`   | Primary button hover state               |
| `--primary-900`   | `#1E3A8A`   | Deep primary accent                      |
| `--secondary`     | `#6366F1`   | Secondary buttons and accents            |
| `--accent`        | `#EFF6FF`   | Subtle highlight / chip background       |
| `--accent-2`      | `#F5F3FF`   | Secondary accent tint                    |
| `--bg`            | `#FFFFFF`   | Page and card background                 |
| `--tint-1`        | `#F8FAFF`   | Raised surface / alternate background    |
| `--cream`         | `#FAF8F3`   | Warm tinted surface                      |
| `--ink`           | `#15201f`   | Primary text                             |
| `--ink-2`         | `#4A5568`   | Secondary / body text                    |
| `--ink-3`         | `#7C8A98`   | Muted / placeholder text                 |
| `--line`          | `#E5EAF0`   | Hairline borders                         |
| `--line-strong`   | `#CDD5DF`   | Prominent borders                        |
| `--good`          | `#10B981`   | Success / high-score indicator (A/B)     |
| `--warn`          | `#F59E0B`   | Warning / mid-score indicator (C)        |
| `--bad`           | `#EF4444`   | Error / low-score indicator (D/F)        |

### Typography tokens

| Token          | Value                                       | Usage                              |
| -------------- | ------------------------------------------- | ---------------------------------- |
| `--font-sans`  | `"Inter", ui-sans-serif, system-ui, ...`   | Body text, labels, UI copy         |
| `--font-mono`  | `ui-monospace, "JetBrains Mono", ...`       | Code, scores, monospaced data      |

### Radius tokens

| Token          | Value   | Usage                           |
| -------------- | ------- | ------------------------------- |
| `--radius-sm`  | `4px`   | Small chips                     |
| `--radius-md`  | `6px`   | Inputs, buttons (default)       |
| `--radius-lg`  | `10px`  | Cards, surfaces                 |
| `--radius-xl`  | `14px`  | Hero surfaces                   |

### Shadow tokens

| Token        | Usage                                        |
| ------------ | -------------------------------------------- |
| `--shadow-1` | Cards at rest (subtle 1px)                   |
| `--shadow-2` | Cards on hover, overlays (6px layered)       |
| `--shadow-3` | Elevated CTAs and heroes (24px with blue tint) |

## Component classes (global CSS in `src/app/globals.css`)

These classes are available globally. Use them in JSX rather than re-deriving the styles from raw utilities.

### `.card`
Surface container. White background, 1px border, `--radius-lg`, subtle shadow.

### `.input`
Form input with hover/focus/disabled/invalid states. Use `aria-invalid="true"` for error styling.

### `.label`
Form label. Pairs with `.input`. Use a real `<label htmlFor="…">`.

### `.btn` + variants
- `.btn` — base button (typography, padding, radius, focus ring)
- `.btn-primary` — primary action (filled with `--primary`)
- `.btn-cta` — CTA button (filled with `--secondary`)
- `.btn-block` — full-width modifier

### `.form-error`
Inline error text. Color: `--bad`. Use `role="alert"`.

### `.form-success`
Inline success / confirmation text. Color: `--good`.

### `.muted`
Secondary / helper text. Color: `--ink-2`.

### `.heading-display`
Display heading using `--font-sans`, bold, tight letter-spacing.

## Legacy compatibility tokens

The following tokens are also available in `src/app/globals.css` for backward compatibility with auth pages. New AEO UI should prefer the handoff tokens above.

| Legacy token                | Handoff equivalent  |
| --------------------------- | ------------------- |
| `--color-primary`           | `--primary`         |
| `--color-secondary`         | `--secondary`       |
| `--color-accent`            | `--accent`          |
| `--color-surface`           | `--tint-1`          |
| `--color-text`              | `--ink`             |
| `--color-text-secondary`    | `--ink-2`           |
| `--color-border`            | `--line`            |
| `--grade-a` … `--grade-f`   | `--good` / `--warn` / `--bad` |

## Focus & error states

- **Focus:** Buttons and inputs show a `3px rgba(37, 99, 235, 0.35)` ring. Do not override.
- **Error:** Inputs with `aria-invalid="true"` get a `--bad` border and focus ring.
- Always pair an inline `.form-error` (with `role="alert"`) with the relevant field.

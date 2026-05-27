# Design System

All UI styles in this project must reference the design tokens and component classes defined in `src/app/globals.css`. Do not use raw Tailwind default colors, fonts, or spacing utilities for product UI (e.g. `text-gray-500`, `bg-blue-600`, `font-sans`). Tailwind layout utilities (flex, grid, spacing) are acceptable, but every color/typography/radius value must come from a token below.

Import all UI primitives from `@/components/ui` (`Button`, `Input`, `Badge`, `Card`, `EmptyState`, `ProgressRing`) — never rebuild them from raw HTML.

## Color tokens

| Token                       | Value       | Usage                                |
| --------------------------- | ----------- | ------------------------------------ |
| `--color-primary`           | `#2563EB`   | Primary buttons, focus rings, links  |
| `--color-secondary`         | `#6366F1`   | Secondary accents                    |
| `--color-accent`            | `#EFF6FF`   | Subtle highlights / chips            |
| `--color-cta`               | `#6366F1`   | High-emphasis CTA button             |
| `--color-danger`            | `#DC2626`   | Destructive action / danger states   |
| `--color-background`        | `#FFFFFF`   | Page background                      |
| `--color-surface`           | `#FFFFFF`   | Card / surface background            |
| `--color-text`              | `#111827`   | Primary text                         |
| `--color-text-secondary`    | `#6B7280`   | Muted text, helper copy              |
| `--color-border`            | `#E5E7EB`   | Hairline borders                     |
| `--grade-a` … `--grade-f`   | greens→red  | Score / status / inline error states |

Inline form errors use `--grade-f` (`#DC2626`). Success messages use `--grade-a` (`#16A34A`).

### Grade scale

| Token      | Value     | Letter |
| ---------- | --------- | ------ |
| `--grade-a` | `#16A34A` | A      |
| `--grade-b` | `#65A30D` | B      |
| `--grade-c` | `#D97706` | C      |
| `--grade-d` | `#EA580C` | D      |
| `--grade-f` | `#DC2626` | F      |

## Typography tokens

| Token            | Value              | Usage                          |
| ---------------- | ------------------ | ------------------------------ |
| `--font-display` | `DM Sans` fallback | Headings, hero copy            |
| `--font-body`    | `Inter` fallback   | Body, labels, form controls    |

| Token              | Value     | Usage                       |
| ------------------ | --------- | --------------------------- |
| `--font-size-xs`   | `0.75rem` | Captions / footnotes        |
| `--font-size-sm`   | `0.875rem`| Labels, helper / error copy |
| `--font-size-md`   | `0.9375rem`| Body / form controls       |
| `--font-size-lg`   | `1.125rem`| Section headings            |
| `--font-size-xl`   | `1.5rem`  | Display copy                |

Both fonts are loaded via `next/font/google` in `src/app/layout.tsx`.

## Radius tokens

| Token            | Value      | Usage                           |
| ---------------- | ---------- | ------------------------------- |
| `--radius-sm`    | `0.25rem`  | Small chips                     |
| `--radius-md`    | `0.375rem` | Inputs, buttons (default 6px)   |
| `--radius-lg`    | `0.5rem`   | Cards, surfaces                 |
| `--radius-xl`    | `0.75rem`  | Hero surfaces                   |
| `--radius-full`  | `9999px`   | Pills, avatars                  |

## Shadow tokens

| Token         | Usage                          |
| ------------- | ------------------------------ |
| `--shadow-sm` | Resting card / surface         |
| `--shadow-md` | Hovered card / floating element|
| `--shadow-lg` | Modal / popover                |

## Spacing tokens

`--space-1` … `--space-6` (`0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`).

## Component classes

These classes are defined globally in `src/app/globals.css`. Use them in JSX rather than re-deriving the styles from raw utilities.

### `.card`
Surface container. White background (`--color-surface`), 1px border, `--radius-lg`, `--shadow-sm` resting → `--shadow-md` on hover.

### `.input`
Form input. Includes hover/focus/disabled/invalid states. Use `aria-invalid="true"` on the input to surface the inline error styling.

### `.label`
Form label. Pairs with `.input`. Use a real `<label htmlFor="…">`.

### `.hint`
Helper / hint text under a form control. Color: `--color-text-secondary`.

### `.btn` + variants
- `.btn` — base button (typography, padding, radius, focus ring).
- `.btn-primary` — primary action (filled with `--color-primary`).
- `.btn-secondary` — secondary action (accent-tinted with primary text).
- `.btn-ghost` — transparent action on neutral surfaces.
- `.btn-danger` — destructive action (filled with `--color-danger`).
- `.btn-cta` — visually distinct CTA (filled with `--color-cta`).
- `.btn-sm` / `.btn-md` / `.btn-lg` — size modifiers.
- `.btn-block` — full-width modifier.

Disabled / loading buttons set the `disabled` attribute (and `aria-busy="true"` for loading); styling drops to 40% opacity with `cursor: not-allowed`.

The `Button` component renders a spinning `Loader2` icon from `lucide-react` when `loading={true}`.

### `.badge` + variants
- `.badge` — base pill.
- Sizes: `.badge-sm` (32px height) · `.badge-lg` (48px height).
- Semantic variants: `.badge-default` · `.badge-success` · `.badge-warning` · `.badge-danger` · `.badge-info`.
- Grade variants: `.badge-grade-a` · `.badge-grade-b` · `.badge-grade-c` · `.badge-grade-d` · `.badge-grade-f` — use `--grade-*` tokens for background.

### `.form-error`
Inline error text near a form. Color: `--grade-f`. Use `role="alert"`.

### `.form-success`
Inline success / confirmation text. Color: `--grade-a`.

### `.muted`
Secondary / helper text. Color: `--color-text-secondary`.

### `.heading-display`
Display heading using `--font-display`, semibold, tight letter-spacing.

### `.spin`
Utility that applies a `spin` keyframe animation (1s linear infinite). Used for loading icons.

## Focus & error states

- **Focus:** `.btn` and `.input` show a 3px ring derived from `--color-primary`. Do not override.
- **Error:** Inputs with `aria-invalid="true"` get a red border and red focus ring derived from `--grade-f`.
- Always pair an inline `.form-error` (with `role="alert"`) with the relevant field, rather than using `alert()` or toast popups.

## UI primitives

All primitives live in `src/components/ui/` and are re-exported from `src/components/ui/index.ts`.

### `Button`
Props: `variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cta'`, `size?: 'sm' | 'md' | 'lg'`, `loading?: boolean`, `disabled?: boolean`, `block?: boolean`, plus all native `<button>` props. Loading state renders a spinning `Loader2` icon and is non-interactive.

### `Input`
Props: `label?: string`, `error?: string`, `hint?: string`, `id?: string`, plus all native `<input>` props. Renders the label above and the error / hint below the input. Setting `error` applies the error border / ring.

### `Badge`
Props: `variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'grade-a' | 'grade-b' | 'grade-c' | 'grade-d' | 'grade-f'`, `size?: 'sm' | 'lg'`, `children: ReactNode`. Grade variants use the `--grade-*` tokens.

### `Card`
Props: `children: ReactNode`, `className?: string`, plus all native `<div>` props. Surface with elevation on hover.

### `EmptyState`
Props: `icon: LucideIcon`, `title: string`, `description: string`, `cta?: { label: string; onClick: () => void }`. Renders the icon at 32px, a heading, a description, and (optionally) a primary CTA button.

### `ProgressRing`
Props: `score: number` (0–100), `grade: 'A' | 'B' | 'C' | 'D' | 'F'`, `size?: 'sm' | 'md' | 'lg'`. Renders an SVG ring whose `strokeDashoffset` reflects `score / 100` and whose stroke uses the grade token. Sizes: `sm` = 64px, `md` = 96px, `lg` = 128px.

## Authentication pages

`/auth/login` and `/auth/signup` are Client Components that use `createSupabaseBrowser` from `src/lib/supabase/browser.ts`. They follow the patterns above: `.card` wrapper, `.label` + `.input` pairs, `.btn .btn-primary .btn-block` submit, `.form-error` for inline errors, `.form-success` for the signup confirmation message.

The signup page is gated behind `NEXT_PUBLIC_SIGNUP_ENABLED`. When the env var is not `'true'`, the form is replaced with a `.muted` invite-only message.

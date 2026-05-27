# Design System

All UI styles in this project must reference the design tokens and component classes defined in `src/app/globals.css`. Do not use raw Tailwind default colors, fonts, or spacing utilities for product UI (e.g. `text-gray-500`, `bg-blue-600`, `font-sans`). Tailwind layout utilities (flex, grid, spacing) are acceptable, but every color/typography/radius value must come from a token below.

## Color tokens

| Token                       | Value       | Usage                                |
| --------------------------- | ----------- | ------------------------------------ |
| `--color-primary`           | `#2563EB`   | Primary buttons, focus rings, links  |
| `--color-secondary`         | `#6366F1`   | Secondary accents                    |
| `--color-accent`            | `#EFF6FF`   | Subtle highlights / chips            |
| `--color-background`        | `#FFFFFF`   | Card / surface background            |
| `--color-text`              | `#111827`   | Primary text                         |
| `--color-text-secondary`    | `#6B7280`   | Muted text, helper copy              |
| `--color-border`            | `#E5E7EB`   | Hairline borders                     |
| `--grade-a` … `--grade-f`   | greens→red  | Score / status / inline error states |

Inline form errors use `--grade-f` (`#DC2626`). Success messages use `--grade-a` (`#16A34A`).

## Typography tokens

| Token            | Value              | Usage                          |
| ---------------- | ------------------ | ------------------------------ |
| `--font-display` | `DM Sans` fallback | Headings, hero copy            |
| `--font-body`    | `Inter` fallback   | Body, labels, form controls    |

Both fonts are loaded via `next/font/google` in `src/app/layout.tsx`.

## Radius tokens

| Token            | Value      | Usage                           |
| ---------------- | ---------- | ------------------------------- |
| `--radius-sm`    | `0.25rem`  | Small chips                     |
| `--radius-md`    | `0.375rem` | Inputs, buttons (default 6px)   |
| `--radius-lg`    | `0.5rem`   | Cards, surfaces                 |
| `--radius-xl`    | `0.75rem`  | Hero surfaces                   |
| `--radius-full`  | `9999px`   | Pills, avatars                  |

## Component classes

These classes are defined globally in `src/app/globals.css`. Use them in JSX rather than re-deriving the styles from raw utilities.

### `.card`
Surface container. White background, 1px border, `--radius-lg`, subtle shadow.

### `.input`
Form input. Includes hover/focus/disabled/invalid states. Use `aria-invalid="true"` on the input to surface the inline error styling.

### `.label`
Form label. Pairs with `.input`. Use a real `<label htmlFor="…">`.

### `.btn` + variants
- `.btn` — base button (typography, padding, radius, focus ring).
- `.btn-primary` — primary action (filled with `--color-primary`).
- `.btn-block` — full-width modifier.

Disabled buttons should set the `disabled` attribute; styling is automatic.

### `.form-error`
Inline error text near a form. Color: `--grade-f`. Use `role="alert"`.

### `.form-success`
Inline success / confirmation text. Color: `--grade-a`.

### `.muted`
Secondary / helper text. Color: `--color-text-secondary`.

### `.heading-display`
Display heading using `--font-display`, semibold, tight letter-spacing.

## Focus & error states

- **Focus:** `.btn` and `.input` show a 3px ring derived from `--color-primary`. Do not override.
- **Error:** Inputs with `aria-invalid="true"` get a red border and red focus ring derived from `--grade-f`.
- Always pair an inline `.form-error` (with `role="alert"`) with the relevant field, rather than using `alert()` or toast popups.

## Authentication pages

`/auth/login` and `/auth/signup` are Client Components that use `createSupabaseBrowser` from `src/lib/supabase/browser.ts`. They follow the patterns above: `.card` wrapper, `.label` + `.input` pairs, `.btn .btn-primary .btn-block` submit, `.form-error` for inline errors, `.form-success` for the signup confirmation message.

The signup page is gated behind `NEXT_PUBLIC_SIGNUP_ENABLED`. When the env var is not `'true'`, the form is replaced with a `.muted` invite-only message.

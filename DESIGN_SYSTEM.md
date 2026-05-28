# Design System — Ultra Minimal

> Generated from archetype DNA. **Radical restraint — one idea per viewport, vast whitespace, black on white, no ornament.**
> Theme: `light` · Mood: _restrained, confident, quiet_ · Density: `spacious` · Contrast: `high`

This file is the single source of truth for the visual language of this app.
Archetypes define **look and feel** — typography, color, spacing, component
aesthetics, motion. They do **not** define layout: which pages exist and how
they are structured comes from the product's functional requirements. Build
each page for its own job, but style every element per the rules below.

All values below are exposed as CSS custom properties in `app/globals.css`.
Reference them with `var(--token)` — never hard-code a hex, px, or font name.

## a. Color system

| Role | Token | Value |
|------|-------|-------|
| Primary | `--color-primary` | `#2563eb` |
| Primary (hover) | `--color-primary-hover` | `#2157cf` |
| Primary (subtle bg) | `--color-primary-subtle` | `#e0e9fc` |
| Secondary | `--color-secondary` | `#6366F1` |
| Accent | `--color-accent` | `#EFF6FF` |
| Background | `--color-background` | `#FFFFFF` |
| Surface | `--color-surface` | `#F9FAFB` |
| Surface (raised) | `--color-surface-2` | `#f0f1f3` |
| Text | `--color-text` | `#111827` |
| Text (secondary) | `--color-text-secondary` | `#5d626c` |
| Text (muted) | `--color-text-muted` | `#94979e` |
| Border | `--color-border` | `#dedfe1` |
| Success / Warning / Error / Info | `--color-success` … | `#16a34a` / `#f59e0b` / `#dc2626` / `#2563eb` |

Primary is used for the main CTA, active states, and focus rings. Secondary and
accent are supporting — never let them compete with primary. Status colors are
ONLY for success/warning/error/info states, never decoration.

## b. Typography system

- **Display font:** Inter — headings, hero text, primary buttons. `var(--font-display)`
- **Body font:** Inter — paragraphs, labels, UI text. `var(--font-body)`
- **Modular scale ratio:** 1.5

| Step | Token | Size |
|------|-------|------|
| Display / H1 | `--text-display` | `54px` |
| H2 | `--text-h2` | `36px` |
| H3 | `--text-h3` | `24px` |
| Body | `--text-body` | `16px` |
| Small / caption | `--text-small` | `13px` |

**Weights:** display `500`, headings `500`, body `400`, emphasis `600`.
**Letter-spacing:** headings `-0.03em`, body `-0.005em`, uppercase labels/eyebrows `0.04em`.
This archetype uses a single sans family — do not introduce a monospace face.

## c. Spacing system

Base unit: **8px** · rhythm: **airy**.
Section padding ≈ `120px`, gap between sibling components ≈ `48px`.

| Token | Value | Typical use |
|-------|-------|-------------|
| `--space-xs` | `8px` | icon gaps, tight inline spacing |
| `--space-sm` | `16px` | button padding, input padding |
| `--space-md` | `32px` | card padding, component gaps |
| `--space-lg` | `48px` | gaps between groups |
| `--space-xl` | `80px` | sub-section spacing |
| `--space-2xl` | `128px` | section spacing |
| `--space-3xl` | `192px` | major page-section spacing |

## d. Component patterns

Use these exact class combinations. They reference the tokens above, so they
recolor and re-scale automatically. Customise by adjusting tokens, not classes.

### Buttons — _rounded-md, small footprint, solid black/ink primary, plain ghost link_
```
inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-[var(--font-display)] font-semibold px-[var(--space-md)] py-[var(--space-sm)] transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-primary-hover)]
```
Hover: background → accent, no movement. Secondary buttons swap the fill for
`bg-transparent border border-[var(--color-border)] text-[var(--color-text)]`.

### Cards — _no cards — content floats in whitespace_
```
bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-md)]
```
Padding 0. Borders: none. Hover: none.

### Inputs — _minimal bordered or underline field_
```
w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] px-[var(--space-sm)] py-[var(--space-sm)] transition-colors duration-[var(--transition-fast)] focus:outline-none focus:border-[var(--color-primary)]
```
Border treatment: single hairline. Focus: border → accent.

### Navigation — _wordmark + single hidden-menu link_
Spacing: maximal — nav is nearly empty. Active item: color only.
Build the nav structure to fit the app's information architecture, but style it
with the tokens and the look described here.

### Badges — _plain text_
```
inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)] text-xs font-medium px-2 py-0.5
```
Sizing: tiny, used sparingly.

## e. Motion rules

Philosophy: **minimal**.

| Token | Value |
|-------|-------|
| `--transition-fast` | `80ms` |
| `--transition-normal` | `120ms` |
| `--transition-slow` | `180ms` |
| `--ease` | `cubic-bezier(0.4,0,0.2,1)` |

- **Hover transitions:** 120ms color
- **Page transitions:** clean fade
- **Micro-interactions:** almost none — restraint is the point

Every interactive element gets `transition` with `duration-[var(--transition-normal)]`
and `ease-[var(--ease)]`. Decorative elements for this archetype: whitespace, the occasional 1px separator — nothing else.

## f. Anti-patterns — what NOT to do

These are hard rules. Violating them breaks the archetype:

- Do NOT use Tailwind default color utilities (`bg-blue-500`, `text-gray-600`, `border-slate-200`). Every color MUST come from a `var(--color-*)` token.
- Do NOT substitute the typefaces. Display is **Inter**, body is **Inter** — load only these via `app/globals.css`.
- Do NOT use `shadow-md`, `shadow-lg`, or `drop-shadow`. This archetype is flat — surfaces are separated by borders and spacing, never by shadow.
- Do NOT box content in borders — separation is achieved with whitespace. Cards are borderless.
- Do NOT crowd elements — generous whitespace IS the design. Lean on `--space-2xl` / `--space-3xl`.
- Do NOT add scale, bounce, or staged animations — transitions are near-instant and utilitarian.

## Token reference

Every CSS custom property in `app/globals.css`. This file and `globals.css`
are generated together from the same archetype DNA — the values below match
the `:root` block exactly. This is the authoritative token list.

| Token | Value |
|-------|-------|
| `--color-primary` | `#2563eb` |
| `--color-primary-hover` | `#2157cf` |
| `--color-primary-subtle` | `#e0e9fc` |
| `--color-secondary` | `#6366F1` |
| `--color-accent` | `#EFF6FF` |
| `--color-background` | `#FFFFFF` |
| `--color-surface` | `#F9FAFB` |
| `--color-surface-2` | `#f0f1f3` |
| `--color-text` | `#111827` |
| `--color-text-secondary` | `#5d626c` |
| `--color-text-muted` | `#94979e` |
| `--color-border` | `#dedfe1` |
| `--color-success` | `#16a34a` |
| `--color-warning` | `#f59e0b` |
| `--color-error` | `#dc2626` |
| `--color-info` | `#2563eb` |
| `--font-display` | `'Inter', system-ui, sans-serif` |
| `--font-body` | `'Inter', system-ui, sans-serif` |
| `--font-mono` | `'ui-monospace', ui-monospace, monospace` |
| `--font-weight-display` | `500` |
| `--font-weight-body` | `400` |
| `--tracking-display` | `-0.03em` |
| `--tracking-label` | `0.04em` |
| `--text-display` | `54px` |
| `--text-h2` | `36px` |
| `--text-h3` | `24px` |
| `--text-body` | `16px` |
| `--text-small` | `13px` |
| `--radius-sm` | `4px` |
| `--radius-md` | `6px` |
| `--radius-lg` | `10px` |
| `--radius-full` | `9999px` |
| `--shadow-sm` | `none` |
| `--shadow-md` | `none` |
| `--shadow-lg` | `none` |
| `--space-xs` | `8px` |
| `--space-sm` | `16px` |
| `--space-md` | `32px` |
| `--space-lg` | `48px` |
| `--space-xl` | `80px` |
| `--space-2xl` | `128px` |
| `--space-3xl` | `192px` |
| `--transition-fast` | `80ms` |
| `--transition-normal` | `120ms` |
| `--transition-slow` | `180ms` |
| `--ease` | `cubic-bezier(0.4,0,0.2,1)` |

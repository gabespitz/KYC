# Design System — Portable Reference

> **What is this?** A complete, self-contained design system extracted from a production dashboard. Drop this file into any project and use it as the single source of truth for all visual decisions.

---

## How to Use This File

### For the AI assistant
Add this file to your project root or reference it as a CLAUDE.md include. When building any frontend interface, follow every specification in this document. Do not deviate from the color palette, typography, spacing, or component patterns unless the user explicitly asks.

### For the user
Give your AI assistant one of the suggested prompts at the bottom of this file, or simply say:

> "Use the design system in IAM-DESIGN-SYSTEM-PORTABLE.md for all frontend work."

---

## Implementation Guide (Step by Step)

### Step 1: Add Google Fonts
Paste this in the `<head>` of every HTML file:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Step 2: Copy the CSS Variables
Paste the full `:root` block from Section 9 below into your `<style>` tag or main CSS file.

### Step 3: Build with components
Use the component patterns in Section 7 as building blocks. Each one includes ready-to-paste HTML and CSS.

### Step 4: Dark mode
Add the dark mode overrides from Section 10. Toggle dark mode by adding/removing the `dark` class on the `<html>` element.

### Step 5: Start from the template
Section 14 has a complete HTML boilerplate with everything pre-loaded. Use it as your starting point for any new page.

---

## 1. Color Palette

### Brand Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| main | `#25ACE3` | 37, 172, 227 | Primary brand color, main accent, active states |
| primary-dark-blue | `#03045E` | 3, 4, 94 | Dark navy, sidebar background, headings |
| primary-purple | `#221648` | 34, 22, 72 | Dark purple, deep backgrounds |
| primary-white | `#FFFFFF` | 255, 255, 255 | Backgrounds, button text on dark |

### Secondary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| secondary-blue | `#00B4D8` | 0, 180, 216 | Button hover states, secondary accent |
| secondary-green | `#3AF8CE` | 58, 248, 206 | Highlights, dark mode success |

### Tertiary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| tertiary-purple | `#A385FF` | 163, 133, 255 | Lines, icons, secondary accent |
| tertiary-blue | `#90E0EF` | 144, 224, 239 | Lines, icons, sidebar muted text |

### Semantic Colors (Status Indicators)

| State | Background | Indicator/Dot | Text |
|-------|-----------|---------------|------|
| Success | `#ECFDF3` | `#12B76A` | `#027A48` |
| Warning | `#FFFAEB` | `#F79009` | `#B54708` |
| Error | `#FEF3F2` | `#F04438` | `#B42318` |
| Brand/Info | `rgba(37,172,227,0.08)` | `#25ACE3` | `#03045E` |
| Neutral | `#F2F4F7` | `#667085` | `#344054` |

### Gray Scale

| Token | Hex | Usage |
|-------|-----|-------|
| gray-25 | `#FCFCFD` | Hover on table rows |
| gray-50 | `#F9FAFB` | Page background, table headers |
| gray-100 | `#F2F4F7` | Subtle borders, dividers, surface-2 |
| gray-200 | `#EAECF0` | Default borders, card borders |
| gray-300 | `#D0D5DD` | Active input borders |
| gray-400 | `#98A2B3` | Placeholder text |
| gray-500 | `#667085` | Secondary text, labels |
| gray-600 | `#475467` | Body text |
| gray-700 | `#344054` | Strong body text |
| gray-900 | `#101828` | Headings, primary text |

---

## 2. Typography

### Font Families

| Role | Family | Fallback |
|------|--------|----------|
| Primary (titles, body) | **Montserrat** | system-ui, sans-serif |
| Secondary (numbers, code, metrics) | **Roboto Mono** | 'SF Mono', monospace |

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Title large | 28px | 700 (Bold) | default | -0.5px | Page titles |
| Title regular | 20px | 600 (Semibold) | default | -0.5px | Section titles |
| Title small | 16px | 500 (Medium) | default | — | Card headers, nav items |
| Body large | 16px | 400 (Regular) | default | — | Large body text |
| Body regular | 14px | 400 (Regular) | 20px | -0.3px | Default body text, links |
| Caption large | 14px | 500 (Medium) | default | — | Labels, emphasis |
| Caption small | 12px | 500 (Medium) | 17px | -0.3px | Meta text, badges, helper text |
| Numbers large | 30px | 600 (Semibold) | default | — | Metric values (Roboto Mono) |
| Numbers regular | 14px | 400 (Regular) | default | — | Data values (Roboto Mono) |
| Overline | 10px | 600 (Semibold) | 17px | -0.3px | Always uppercase, one line |
| Nav label | 11.5px | 700 (Bold) | default | — | Uppercase section labels |

---

## 3. Spacing

### Base Unit: 4px

Common spacings: 4, 8, 12, 16, 20, 24, 32, 40, 48.

| Element | Spacing |
|---------|---------|
| Page content padding | 32px |
| Card internal padding | 20-24px |
| Grid gap (cards) | 16px |
| Grid gap (small modules) | 12px |
| Section margin-bottom | 24px |
| Table cell padding | 12px vertical, 16-24px horizontal |

---

## 4. Borders & Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 6px | Small buttons, nav items |
| radius-md | 8px | Default inputs, buttons, logo mark |
| radius-lg | 12px | Cards, panels, modals |
| radius-full | 9999px | Badges, pills, avatars |

| State | Color |
|-------|-------|
| Default | `#EAECF0` (gray-200) |
| Subtle | `#F2F4F7` (gray-100) |
| Focus / Active | `#25ACE3` (brand main) |
| Error | `#F04438` |

---

## 5. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-xs | `0 1px 2px rgba(16, 24, 40, 0.05)` | Cards, inputs (default) |
| shadow-sm | `0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)` | Hover states, dropdowns |
| shadow-md | `0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)` | Elevated cards |
| shadow-lg | `0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)` | Modals |

Focus ring: `box-shadow: 0 0 0 4px rgba(37, 172, 227, 0.24);`

---

## 6. Iconography

Primary set: **Lucide Icons** (https://lucide.dev). In Next.js/React projects, install `lucide-react` and import components directly (`import { Home } from "lucide-react"`). Style: outline, stroke 2px at 24px, 1.5px at 20px. Default sizes: 20px nav, 16px in buttons, 14px inline. Color: inherits via `currentColor`.

---

## 7. Component Library

### 7.1 Buttons

```css
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 14px; font-weight: 600; line-height: 1.4; cursor: pointer; border: none; transition: all 0.15s; }
.btn-primary { background: var(--primary); color: #fff; border: 1px solid var(--primary); box-shadow: var(--shadow-xs); }
.btn-primary:hover { background: #00B4D8; }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); box-shadow: var(--shadow-xs); }
.btn-secondary:hover { background: var(--surface-2); }
.btn-destructive { background: #D92D20; color: #fff; border: 1px solid #D92D20; }
.btn-destructive:hover { background: #B42318; }
```

### 7.2 Cards

```css
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: var(--shadow-xs); transition: border-color 0.15s, box-shadow 0.15s; }
.card:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); }
.metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; box-shadow: var(--shadow-xs); transition: border-color 0.15s, box-shadow 0.15s; }
.metric-card .metric-label { font-size: 14px; font-weight: 500; color: var(--muted); margin-bottom: 8px; }
.metric-card .metric-value { font-family: var(--font-mono); font-size: 30px; font-weight: 600; color: var(--text); }
.metric-card .metric-icon { width: 40px; height: 40px; background: rgba(37,172,227,0.06); border: 1px solid rgba(37,172,227,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #25ACE3; }
```

### 7.3 Badges & Tags

```css
.badge { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-display); font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 16px; }
.badge-brand   { background: rgba(37,172,227,0.08); color: #03045E; }
.badge-success { background: #ECFDF3; color: #027A48; }
.badge-warning { background: #FFFAEB; color: #B54708; }
.badge-error   { background: #FEF3F2; color: #B42318; }
.badge-gray    { background: #F2F4F7; color: #344054; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.badge-brand .badge-dot   { background: #25ACE3; }
.badge-success .badge-dot { background: #12B76A; }
.badge-warning .badge-dot { background: #F79009; }
.badge-error .badge-dot   { background: #F04438; }
.badge-gray .badge-dot    { background: #667085; }
```

### 7.4 Tables

```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead { background: var(--surface-2); position: sticky; top: 0; }
.data-table th { padding: 12px 16px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); border-bottom: 1px solid var(--border); }
.data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text); vertical-align: middle; }
.data-table tbody tr:hover { background: var(--surface-2); }
.data-table td.num { font-family: var(--font-mono); font-size: 13px; }
```

### 7.5 Forms & Inputs

```css
input, select, textarea { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); padding: 7px 11px; font-family: var(--font-display); font-size: 13px; width: 100%; transition: border-color 0.15s; }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,172,227,0.12); }
textarea { resize: vertical; min-height: 68px; }
label { display: block; font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
```

### 7.6 Sidebar Navigation

```css
.sidebar { width: 280px; background: var(--surface); border-right: 1px solid var(--border); padding: 8px 12px; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; }
.nav-label { font-size: 11.5px; font-weight: 700; color: var(--muted); padding: 14px 8px 5px; text-transform: uppercase; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; color: var(--muted); font-size: 14px; font-weight: 500; background: none; border: none; width: 100%; text-align: left; cursor: pointer; transition: color 0.15s, background 0.15s; }
.nav-item:hover { color: var(--text); background: var(--surface-2); }
.nav-item.active { color: var(--primary); background: rgba(37,172,227,0.06); font-weight: 600; }
.nav-item.active svg { color: var(--primary); }
.logo-mark { background: #25ACE3; color: #fff; font-weight: 700; font-size: 11px; width: 32px; height: 32px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
```

### 7.7 Toggles

```css
.toggle-group { display: flex; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.toggle-btn { padding: 6px 14px; font-size: 12px; font-weight: 500; border: none; background: transparent; color: var(--muted); cursor: pointer; transition: all 0.2s; font-family: var(--font-display); }
.toggle-btn.active { background: var(--primary); color: #fff; }
```

### 7.8 Empty States

```css
.empty-state { text-align: center; padding: 48px 24px; color: var(--muted); }
.empty-state svg { width: 48px; height: 48px; color: var(--subtle); margin-bottom: 16px; }
.empty-state h3 { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.empty-state p { font-size: 14px; max-width: 360px; margin: 0 auto; }
```

---

## 8. Layout Patterns

```css
body { display: flex; min-height: 100vh; background: var(--bg); color: var(--text); font-family: var(--font-display); font-size: 14px; }
.sidebar { width: 280px; flex-shrink: 0; }
.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.topbar { padding: 0 32px; height: 56px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.content { padding: 32px; max-width: 1100px; flex: 1; }
.content.full-width { max-width: none; }
```

Grids: `.metric-grid` (3 cols), `.action-grid` (2 cols), `.form-grid` (2 cols).

---

## 9. CSS Variables

```css
:root {
  --font-display: 'Montserrat', system-ui, sans-serif;
  --font-mono:    'Roboto Mono', 'SF Mono', monospace;

  /* Semantic (light mode) */
  --bg:        #F9FAFB;
  --surface:   #FFFFFF;
  --surface-2: #F2F4F7;
  --border:    #EAECF0;
  --border-sub:#F2F4F7;
  --primary:   #25ACE3;
  --primary-d: rgba(37,172,227,0.08);
  --text:      #101828;
  --muted:     #475467;
  --subtle:    #667085;
  --success:   #12B76A;
  --warning:   #F79009;
  --danger:    #F04438;
  --purple:    #A385FF;

  /* Status scale */
  --success-50:#ECFDF3; --success-700:#027A48;
  --warning-50:#FFFAEB; --warning-700:#B54708;
  --error-50:#FEF3F2;   --error-700:#B42318;

  /* Gray */
  --gray-25:#FCFCFD; --gray-50:#F9FAFB; --gray-100:#F2F4F7; --gray-200:#EAECF0;
  --gray-300:#D0D5DD; --gray-400:#98A2B3; --gray-500:#667085; --gray-600:#475467;
  --gray-700:#344054; --gray-900:#101828;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-xs: 0 1px 2px rgba(16,24,40,0.05);
  --shadow-sm: 0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06);
  --shadow-md: 0 4px 8px -2px rgba(16,24,40,0.1), 0 2px 4px -2px rgba(16,24,40,0.06);
  --shadow-lg: 0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03);
}
```

---

## 10. Dark Mode

Toggle by adding `class="dark"` to `<html>`.

```css
html.dark {
  --bg:        #0A0A2E;
  --surface:   #0F0F3D;
  --surface-2: #1A1A5E;
  --border:    #2A2A6E;
  --border-sub:#1A1A5E;
  --primary:   #25ACE3;
  --primary-d: rgba(37,172,227,0.12);
  --text:      #E6EDF3;
  --muted:     #8B949E;
  --subtle:    #3D444D;
  --success:   #3AF8CE;
  --warning:   #FBBF24;
  --danger:    #F87171;
  --purple:    #A385FF;
  --shadow-xs: none;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
}
```

---

## 11. Animations

```css
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
```

Spinner: `width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite;`

---

## 12. Responsive Breakpoints

```css
@media (max-width: 1100px) { .metric-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 768px)  {
  .sidebar { width: 100%; position: relative; height: auto; flex-direction: row; flex-wrap: wrap; border-right: none; border-bottom: 1px solid var(--border); }
  .content { padding: 16px; }
  .metric-grid, .action-grid, .form-grid { grid-template-columns: 1fr; }
}
```

---

*End of design system. This file is the single source of truth for all visual decisions in this project.*

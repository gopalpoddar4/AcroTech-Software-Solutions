# IT World — Company Website

A professional, modern IT company website built with vanilla HTML5, CSS3, and JavaScript — no frameworks, no build tools. Fully compatible with GitHub Pages.

## Project Structure

```
it-company-website/
│
├── index.html                 # Home page (Finalized in Phase 2)
│
├── pages/
│   ├── about.html             # About page (Branded shell, ready for Phase 3)
│   ├── services.html          # Services page (Branded shell, ready for Phase 3)
│   └── career.html            # Career page (Branded shell, reserved for future phase)
│
├── assets/
│   ├── images/                # General images
│   ├── icons/                 # Icon assets
│   └── logos/                 # Official company logo & favicon (place logo.png here)
│
├── css/
│   ├── variables.css          # Design tokens (colors, fonts, spacing, etc.)
│   ├── reset.css              # CSS reset / normalization
│   ├── global.css             # Global typography, buttons, cards, sections
│   ├── layout.css             # Containers, grid system, flex utilities
│   ├── components.css         # Header, footer, navigation, site logo system
│   ├── responsive.css         # Breakpoints and responsive overrides
│   └── pages/
│       ├── home.css           # Home page-specific styles (Finalized in Phase 2)
│       ├── about.css          # About page-specific styles (Phase 3)
│       ├── services.css       # Services page-specific styles (Phase 3)
│       └── career.css         # Career page-specific styles
│
├── js/
│   ├── main.js                # Global initialization (year, smooth scroll, logo detection)
│   ├── navigation.js          # Mobile menu, active page, keyboard support
│   └── components.js          # Shared component utilities
│
└── README.md
```

## Adding the Official Company Logo

Place your official logo image at:
```
assets/logos/logo.png
```
The website is pre-configured to detect this file:
- **Header:** Automatically displays the logo image in the sticky navbar.
- **Footer:** Displays the logo image in the brand footer column.
- **Favicon:** References `assets/logos/favicon.png` across all 4 pages.
- **Graceful Fallback:** While the image file is not present, an elegant typography brand badge ("IT World") is seamlessly displayed with no broken image icons or layout shift.

## Running Locally

No build step is required. Open `index.html` directly in any web browser, or serve locally:

```bash
# Python 3
python -m http.server 8000

# Node.js (if available)
npx serve .

# VS Code
# Use the "Live Server" extension — right-click index.html → Open with Live Server
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select the branch (e.g. `main`) and root folder (`/`).
4. Click **Save**. Your site will be available at:
   ```
   https://<username>.github.io/<repository-name>/
   ```

All internal links and asset paths use **relative paths**, ensuring zero broken paths under any GitHub Pages subpath.

## Design System

The visual design is driven by CSS custom properties defined in [`css/variables.css`](css/variables.css):

| Token | Value |
|-------|-------|
| Primary | `#6366F1` (Indigo) |
| Secondary | `#8B5CF6` (Purple) |
| Accent | `#06B6D4` (Cyan) |
| Dark Background | `#0B1020` |
| Dark Surface | `#111827` |
| Dark Cards | `#151D2E` |
| Typography | Inter (Google Fonts) with system fallbacks |

## Development Phases

- ✅ **Phase 1 — Structural Foundation:** Folder architecture, CSS design system, responsive navigation, footer, accessible mobile menu.
- ✅ **Phase 2 — Finalize Home Page:** Hero section with system architecture visual, Who We Are intro with 3 principles, What We Do with 4 service cards, Why IT World with distinctive 2x2 architectural layout, How We Work 4-step process timeline, prominent Final CTA with direct contact placeholders, and unified browser tab branding & favicon across all 4 pages.
- ⏳ **Phase 3 — About & Services Pages:** Detailed design of company story and full service offerings.
- ⏳ **Phase 4 — Career Page:** Detailed career planning, opportunities, and recruitment interface.

## License

All rights reserved. IT World.

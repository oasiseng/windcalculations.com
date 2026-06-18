# windcalculations.com

![WindCalculations.com logo](https://assets.zyrosite.com/cdn-cgi/image/format%3Dauto%2Cw%3D768%2Cfit%3Dcrop%2Cq%3D95/mv0LOLq49lt1GvqG/windcalculations-logo-design1-SfWY8HFp8d1mSaGl.png)

Static engineering calculator apps and reference content for WindCalculations.com.

## What this repository contains

This repository is a static-site toolset focused on transparent wind-design workflows. Most deliverables are single-file HTML tools with no required backend.

### Primary tools

- **ASCE Wind Pressure Reference Calculator** (`index.html`)
  - Client-side ASCE workflow for velocity pressure and components/cladding-style pressure calculations.
  - Live route: `https://windcalculations.com/asce-wind-pressure-calculator/`

- **RTU Wind Load Calculator** (`rtu-calculator.html`)
  - Rooftop equipment wind-load/stability workflow with force-screening metrics.
  - Live route: `https://windcalculations.com/rtu-wind-load-calculator/`

- **Nationwide Wind Speed Tool package** (`wind-speed-tool/`)
  - Production nationwide lookup tool with generated deployable HTML plus source/build pipeline.
  - See package README: `wind-speed-tool/README.md`
  - Public route (per package docs): `https://windcalculations.com/wind-speed-tool`

- **Colorado Front Range Wind Tool package** (`tools/colorado-wind/`)
  - Boulder/Front Range special wind region interpolation and overlay tool with reference data.
  - See package README: `tools/colorado-wind/README.md`

### Supporting content pages

- `ABOUT-US.md` — org/project background
- `METHODOLOGY.md` — equations, assumptions, and transparency notes
- `SERVICES.md` — engineering services context

## Repository structure

```text
.
├── index.html                         # ASCE wind pressure reference calculator
├── rtu-calculator.html                # RTU wind load calculator
├── ABOUT-US.md                        # About page content
├── METHODOLOGY.md                     # Methodology page content
├── SERVICES.md                        # Services page content
├── wind-speed-tool/
│   ├── public/nationwide-wind-tool.html      # Deployable generated nationwide tool
│   └── source/
│       ├── build_nationwide_assets.js        # Data/build script
│       └── nationwide_template.html           # Source template used for generation
└── tools/colorado-wind/
    ├── boulder-wind-tool.html                # Self-contained Front Range/Boulder tool
    ├── colorado-gust-map.kmz                # Front Range contour geodata source
    └── *.pdf                                 # Reference standards/maps
```

> Note: `tools/colorado-wind/` includes engineering reference assets (PDF/KMZ) used by that tool package.

## Tool capabilities at a glance

- **Transparent intermediate reporting** (`qz`, `qh`, factors, and substitutions) in the ASCE pressure calculator.
- **RTU-specific screening workflow** for rooftop equipment-related wind effects.
- **GIS-informed wind speed lookup** in the nationwide package (with fallback logic documented in package README).
- **Colorado Front Range overlays and interpolation logic** in the Boulder/Colorado package.
- **Static deployment model** for public-facing tools (minimal hosting complexity).

## Engineering scope (current baseline)

- Implements transparent velocity-pressure reporting (`qz`, `qh`) using ASCE Chapter 26 style forms.
- Implements low-rise Components & Cladding style net pressure form:
  - `p = qh × (GCp - GCpi)`
- Includes coefficient presets plus manual override workflows.
- Includes validation, intermediate-factor display, and formula substitution output.
- Includes visual formula proof tables, decision logs, and exportable calculation records.
- RTU tool includes explicit factorized stability screening (`fD`, `fW`) and computes `Ke` from site elevation input.
- No server-side calculation dependency for core tool execution.

## Not in scope

- Final, project-specific rooftop equipment coefficient selection and anchorage detailing under adopted code.
- Final project-specific governing load-combination selection (Engineer of Record responsibility).
- Project-specific stamped design decisions.

## Deploy and embed

### Embed the ASCE calculator on another page

```html
<iframe
  src="https://windcalculations.com/asce-wind-pressure-calculator/?embed=1"
  width="100%"
  height="900"
  style="border:0;"
  loading="lazy"
  title="ASCE Wind Pressure Reference Calculator">
</iframe>
```

### Deployable files

- For the core site calculators, publish `index.html` and `rtu-calculator.html` to the corresponding site routes.
- For nationwide wind speed, publish `wind-speed-tool/public/nationwide-wind-tool.html`.
- For Colorado/Boulder tool deployment, use `tools/colorado-wind/boulder-wind-tool.html`.

## Working in this repo

- Keep tools **client-side and auditable**.
- Prefer **clear formula traceability** over opaque automation.
- Preserve public-facing reliability: avoid introducing unnecessary runtime dependencies.
- Perform engineering QA/QC before publishing updates.

## Related live documentation routes

- Methodology: `https://windcalculations.com/wind-pressure-calculator-methodology/`
- About: `https://windcalculations.com/about-us/`
- Services: `https://windcalculations.com/services/`

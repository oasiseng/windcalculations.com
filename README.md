# windcalculations.com

![WindCalculations.com logo](https://assets.zyrosite.com/cdn-cgi/image/format%3Dauto%2Cw%3D768%2Cfit%3Dcrop%2Cq%3D95/mv0LOLq49lt1GvqG/windcalculations-logo-design1-SfWY8HFp8d1mSaGl.png)

Static engineering calculator apps for WindCalculations.com.

## Current app

- `index.html`: ASCE Wind Pressure Reference Calculator (client-side only)
- `rtu-calculator.html`: RTU wind load calculator with rooftop equipment force workflow and anchor screening metrics

## Live routes

- Calculator: `https://windcalculations.com/asce-wind-pressure-calculator/`
- RTU calculator: `https://windcalculations.com/rtu-wind-load-calculator/`
- Methodology: `https://windcalculations.com/wind-pressure-calculator-methodology/`

## Engineering scope (v1)

- Implements transparent velocity pressure reporting (`qz`, `qh`) using ASCE Chapter 26 style form.
- Implements low-rise Components & Cladding net pressure form:
  - `p = qh * (GCp - GCpi)`
- Includes coefficient presets plus manual override.
- Includes validation, intermediate-factor display, and formula substitution output.
- Includes visual formula proof tables, decision logs, and exportable calculation records.
- No backend calls and no server-side calculations.

## Not in scope (v1)

- Rooftop equipment force design workflow under ASCE Chapter 29.
- Project-specific stamped design decisions.

## Embed

Use this snippet on other website pages:

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

## Notes

- This repository is intended for public-facing reference tools.
- Always perform engineering QA/QC before publishing updates.

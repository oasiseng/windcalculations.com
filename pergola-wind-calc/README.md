# Aluminum Pergola Wind & Structure Check

A free, single-file web tool that performs a **preliminary** structural screening of a
freestanding or attached aluminum pergola under wind, gravity, and overturning
(ASCE 7-22 · ADM 2020 · ACI 318-19 · FBC 2023). Built to be embedded on
**windcalculations.com**.

> ⚠️ **Preliminary screening only — not a sealed engineering document.**
> This tool produces an order-of-magnitude check to help size members, connections, and
> footings and to spot obvious problems. It is **not** signed or sealed by a licensed
> Professional Engineer and **must not** be used for permitting, fabrication, or
> construction. All inputs, section properties, anchor allowables, foundation design, and
> code interpretations must be independently verified by a qualified engineer. **No warranty
> is made and no liability is assumed** for any use of this output. For a project-specific,
> sealed calculation, visit **https://windcalculations.com**.

---

## What it checks

- **Wind (ASCE 7-22, open structure)** — `qz = 0.00256·Kz·Kzt·Kd·Ke·V²`; net roof pressure
  `p = qz·G·C_N` (open free-roof coefficients, Fig 27.3-4/6) for member design, and a
  lateral open-frame force `F = qz·G·Cf·A_proj` (solidity ε) for overturning. Both ± cases.
- **Rafter / slat** and **carrier beam** — bending (Fb ≤ 0.75 Fcy), shear (Fv ≤ 0.6 Fsy),
  and deflection ≤ L/180; double-beam load sharing supported.
- **Post (column)** — combined axial + bending interaction with **weak-axis column
  buckling** (ADM Ch. E), exposed `K` / fixity, cantilever vs. braced.
- **Connections** — beam-to-post bolts, purlin-to-beam Tek screws, and the post base
  anchors (shear + net direct uplift; the overturning moment is resisted by the footing,
  not pried through the plate gage).
- **Post base plate** — flat-bar bending both ways (uplift cantilever + concrete bearing
  cantilever) and required thickness.
- **Footing (freestanding)** — nominal overturning and sliding factors of safety (target
  ≥ 1.5), an ASD strength line, and a direct-uplift check.

Results render live with **[Satisfactory] / [CHECK]** verdicts and can be sent to PDF with
the browser's **Print** (the on-screen form and live diagram are hidden in print).

## Custom members (new)

Any member not in the dropdown can be entered by hand: set the member's **Section** to
**"— Custom —"**, then in the **Custom Section Properties** panel enter a **name** (shown on
the report), optional **B/H** (for the labels/diagram), and **A, Ix, Iy, S**. `Iy` (weak
axis) is used for the post's column buckling — enter it for rectangular tubes; if left 0 it
falls back to `Ix` and the report flags it.

## How to host / embed

Single static `index.html`, **no build step, no dependencies, no network calls, no data
collection** (everything runs in the browser; nothing is uploaded). Fonts load from Google
Fonts via CDN. Drop it on any static host and iframe it:

```html
<iframe
  src="https://your-host.example/pergola-check/index.html"
  title="Aluminum Pergola Wind & Structure Check"
  style="width:100%; height:1400px; border:0;"
  loading="lazy">
</iframe>
```

The layout stacks the input panel above the results below ~900 px wide, so it works in a
narrow iframe column. Adjust the iframe `height` to suit your page.

## Notes & limitations (read before relying on any number)

- **Solidity ε** (lateral) is the solid fraction of the side elevation the wind actually
  hits — for an open slat frame this is typically ~0.15–0.30, not ~0.9. It strongly drives
  base shear, post bending, and overturning.
- **C_N / Cf** defaults must be confirmed against ASCE 7-22 Fig 27.3-4/6 and 29.4-1 for the
  actual roof slope, blockage, and slat solidity.
- **Member design** applies the full net pressure to each slat's tributary (no downwind
  shielding) — conservative.
- **Connection / anchor allowables** are user inputs and must come from the manufacturer's
  evaluation report (ESR/FL) for the exact product, embedment, concrete strength, **and edge
  distance** (slab-edge breakout per ACI 318 Ch. 17 often governs).
- **Footing** overturning/sliding/uplift are per isolated post footing; global stability,
  bearing pressure, and reinforcement must be confirmed by the engineer of record.
- **Local buckling** (ADM Ch. F, b/t) is not explicitly checked; the bending allowable
  assumes a compact section.
- **Custom section** properties are only as good as the values entered — use published or
  verified data.

## Tech

- Single file, vanilla HTML/CSS/JS. No frameworks. All logic is in the inline `<script>`.

## License & disclaimer

You may host and embed this tool. Suggested license: **MIT** (add a `LICENSE` file). Use is
entirely at your own risk; see the preliminary-screening disclaimer above. The tool, its
authors, and windcalculations.com accept **no liability** for any use of the results.

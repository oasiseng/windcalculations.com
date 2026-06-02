# Aluminum Fence & Railing Wind Check

A free, single-file web tool that performs a **preliminary** structural screening of an
aluminum fence, railing, or guard under wind and code guard loads (FBC 2023 · ASCE 7-22 ·
ADM 2020 · ACI 318-19). Built to be embedded on **windcalculations.com**.

> ⚠️ **Preliminary screening only — not a sealed engineering document.**
> This tool produces an order-of-magnitude check to help size members and spot obvious
> problems. It is **not** signed or sealed by a licensed Professional Engineer and **must
> not** be used for permitting, fabrication, or construction. All inputs, section
> properties, anchor allowables, and code interpretations must be independently verified by
> a qualified engineer. **No warranty is made and no liability is assumed** for any use of
> this output. For a project-specific, sealed calculation, visit **https://windcalculations.com**.

---

## What it checks

- **Wind load** — FBC fence/open-frame method: `qh = 0.00256·Kz·Kzt·Kd·V²`, then
  `PA = 0.6·max(16 psf, qh·G·Cf)` and an equivalent gross pressure `PA.EQ = ε·PA`
  (solidity ε, force coefficient Cf per ASCE 7-22 Fig. 29.3-1). `Kz` is floored at the
  15‑ft value per ASCE 7-22 Table 26.10-1.
- **Guard live loads** (toggle) — FBC 1607.8: 200 lb concentrated, 50 plf, and 50 lb
  intermediate, applied non-concurrently (governing case taken).
- **Top rail / handrail** — bending, shear, and deflection (L/180, simple span).
- **Post (cantilever)** — bending, shear, and deflection using the **cantilever span basis
  (2H)** per IBC/FBC Table 1604.3 footnote.
- **Composite snap assemblies** — optional ΣI of shell + insert (e.g. HR-14+HR-2 rail,
  HR-4+HR-2 post), feeding deflection, section modulus, and area (two-beam, S = ΣI/c).
- **Base anchorage** — tension from the base-moment couple, shear, quadratic interaction,
  and required base-plate thickness.
- **Fastener** — bolt shear **and** ADM J.5 aluminum bearing (`2·d·t·Fu/Ω`).
- **Bending allowable basis** — selectable 0.75 / 0.66 / 0.60·Fcy (with a printed note that
  ADM Ch. F local buckling, b/t, is **not** explicitly checked).

Results render live with **[Satisfactory] / [CHECK]** verdicts and can be sent to PDF with
the browser's **Print** (the on-screen form and banners are hidden in print).

## How to host / embed

It's a single static `index.html` with **no build step, no dependencies, no network calls,
and no data collection** (everything runs in the browser; nothing is uploaded). Fonts load
from Google Fonts via CDN.

Drop it on any static host (GitHub Pages, Netlify, S3, your own server) and iframe it:

```html
<iframe
  src="https://your-host.example/fence-check/index.html"
  title="Aluminum Fence & Railing Wind Check"
  style="width:100%; height:1200px; border:0;"
  loading="lazy">
</iframe>
```

The layout is responsive and stacks the input panel above the results below ~820 px wide,
so it works in a narrow iframe column. Adjust the iframe `height` to suit your page.

## Notes & limitations (read before relying on any number)

- **Section properties** for proprietary snap profiles (HR-2/HR-4/HR-14, etc.) are
  simplified and must be confirmed against the manufacturer's published data or Florida
  Product Approval. Open channels do not behave exactly like the closed-tube idealization.
- **Composite (ΣI) action** is valid only if the snap connection actually develops the
  longitudinal shear flow `q = VQ/I`; otherwise turn it off and check the profiles
  separately.
- **Anchor allowables** `[T]`/`[V]` are user inputs and must come from the anchor
  manufacturer's evaluation report (ESR/FL) for the exact diameter, embedment, concrete
  strength, **and edge distance** (slab-edge breakout per ACI 318 Ch. 17 often governs).
- **Local buckling** (ADM Ch. F, b/t) is not explicitly checked; the bending allowable
  assumes a compact section.
- **Guard vs. fence**: if any portion is mounted where the drop-off exceeds 30 in, it
  legally becomes a guard (FBC 1015.2) and the 200 lb load applies — enable the guard-load
  toggle for that condition.

## Tech

- Single file, vanilla HTML/CSS/JS. No frameworks.
- All calculation logic is in the inline `<script>`; the report is generated client-side.

## License & disclaimer

You may host and embed this tool. Suggested license: **MIT** (add a `LICENSE` file).
Use is entirely at your own risk; see the preliminary-screening disclaimer above. The tool,
its authors, and windcalculations.com accept **no liability** for any use of the results.

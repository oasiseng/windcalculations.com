# Methodology

This project implements wind pressure calculations based on the procedures outlined in:

- ASCE 7-16
- ASCE 7-22 (as adopted by applicable building codes)

The calculator is designed to provide transparent, reproducible wind parameter outputs by directly implementing standard wind load equations.

---

## 1. Basic Wind Speed (V)

Basic wind speed (Vult or Vasd) is user-provided or determined from adopted wind maps per ASCE 7 Chapter 26.

Wind speed is expressed in miles per hour (mph).

---

## 2. Velocity Pressure (qz)

**ASCE 7-22** (Eq. 26.10-1). The directionality factor is not part of the velocity pressure; it is applied in the
pressure equation:

qz = 0.00256 × Kz × Kzt × Ke × V²

**ASCE 7-16** (Eq. 26.10-1). The directionality factor is inside the velocity pressure:

qz = 0.00256 × Kz × Kzt × Kd × Ke × V²

The two forms give the same net pressure. Where:

- Kz = Velocity pressure exposure coefficient (Section 26.10, Table 26.10-1)
- Kzt = Topographic factor (Section 26.8)
- Kd = Wind directionality factor (Section 26.6): 0.85 for buildings
- Ke = Ground elevation factor (Section 26.9); 1.0 is always permitted
- V = Basic wind speed (mph)

Kz follows the Table 26.10-1 formula, Kz = 2.41 (z / zg)^(2/α) in ASCE 7-22 (2.01 in ASCE 7-16), with the
exposure constants of Table 26.11-1:

| Exposure | α (7-22) | zg, ft (7-22) | α (7-16) | zg, ft (7-16) |
|---|---|---|---|---|
| B | 7.5 | 3280 | 7.0 | 1200 |
| C | 9.8 | 2460 | 9.5 | 900 |
| D | 11.5 | 1935 | 11.5 | 700 |

For any height below 15 ft, z is taken as 15 ft, in every exposure. The value of 0.70 for Exposure B below 30 ft in
the table's footnote applies to Chapter 28 (the envelope procedure for main wind force resisting systems) only. It is
not used for components and cladding: Kz at 15 ft in Exposure B is 0.57.

The calculator displays intermediate factors to ensure transparency and traceability.

---

## 3. Exposure Categories

Exposure category (B, C, or D) significantly affects velocity pressure.

Exposure is determined based on terrain roughness per ASCE 7 definitions:

- Exposure B: Urban/suburban terrain
- Exposure C: Open terrain with scattered obstructions
- Exposure D: Flat, unobstructed coastal areas

User selection must reflect site conditions.

---

## 4. Components & Cladding Pressures

Buildings with mean roof height h ≤ 60 ft (ASCE 7-22 Chapter 30, Part 1, Eq. 30.3-1):

p = qh × Kd × [(GCp) − (GCpi)]

Buildings with h > 60 ft (Part 2, Eq. 30.4-1):

p = q × Kd × (GCp) − qi × Kd × (GCpi)

Where:

- qh = Velocity pressure at mean roof height
- q = qz at the height of the component for positive (windward) pressure, qh otherwise
- qi = qh
- GCp = External pressure coefficient, which already includes the gust effect. There is no separate G in Chapter 30.
- GCpi = Internal pressure coefficient (Table 26.13-1): ±0.18 enclosed and partially open, ±0.55 partially enclosed

Both signs of GCpi are checked and the worse one governs each direction. Under ASCE 7-16, Kd is inside q and
does not appear again in these equations.

External pressure coefficients come from these ASCE 7-22 figures, by log-linear interpolation on effective wind area:

- Walls, h ≤ 60 ft: Figure 30.3-1 (reduced 10% when the roof slope is 10° or less)
- Walls, h > 60 ft: Figure 30.4-1
- Roofs at 7° or less: Figure 30.3-2A. Its zones are set by h: edge strip 0.6h, corner 0.6h by 0.2h, Zone 1′ beyond 1.2h
- Gable roofs above 7°: Figures 30.3-2B, 2C and 2D
- Hip roofs above 7°: Figures 30.3-2E, 2F and 2G

The area range of the interpolation differs by figure and by zone (for example 10 to 500 sq ft for walls, 10 to 100,
200 or 300 sq ft for gable and hip roof zones, and 100 to 1000 sq ft for roof Zone 1′).

Net design pressures are not taken less than 16 psf in either direction at strength level (Section 30.2.2).
Allowable stress design values are 0.6 times the strength-level values.

---

## 5. Assumptions & Limitations

- Calculations assume correct user input.
- The tool does not determine structural adequacy.
- No automatic terrain mapping or GIS exposure classification is performed unless explicitly implemented.
- Results are intended for engineering support and preliminary reference.

Final design decisions must be made by a licensed Professional Engineer familiar with the specific project conditions and governing building code.

---

## Transparency Commitment

This project is intentionally designed to:

- Display intermediate values
- Show implemented equations
- Reference ASCE 7 sections
- Avoid hidden calculation logic

The objective is reproducibility and clarity, not automation of engineering judgment.

---

## Disclaimer

This calculator provides wind parameter estimates based on ASCE 7 equations and user inputs.

It does not replace professional engineering services.  
Final responsibility for structural design and code compliance remains with the Engineer of Record.

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

Velocity pressure is calculated using the ASCE 7 equation:

qz = 0.00256 × Kz × Kzt × Kd × Ke × V²

Where:

- Kz = Velocity pressure exposure coefficient (ASCE 7 Section 26.10)
- Kzt = Topographic factor
- Kd = Wind directionality factor
- Ke = Ground elevation factor (if applicable)
- V = Basic wind speed (mph)

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

Net design pressures for components and cladding are calculated using:

p = qz × G × (GCp) − qi × (GCpi)

Where:

- G = Gust effect factor
- GCp = External pressure coefficient
- qi = Internal velocity pressure (often qh)
- GCpi = Internal pressure coefficient

Pressure coefficients are selected per ASCE 7 Chapter 30 tables and figures.

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

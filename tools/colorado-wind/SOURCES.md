# Source Documents & Data Provenance

This file documents the origin, authority, and limitations of every data source
used in the Colorado Front Range Wind Speed Tool.

---

## 1. Colorado Front Range Gust Map (2013)

- **File:** `FINAL-COLORADO-FRONT-RANGE-GUST-MAP-2013.pdf`
- **Author:** Jon A. Peterka, PE — Cermak Peterka Petersen, Inc. (CPP)
- **Address:** 1415 Blue Spruce Drive, Suite 3, Fort Collins, CO 80524
- **Date:** November 18, 2013
- **Status:** SEAC-endorsed. SEAC (2019, 2025) explicitly recommends continued use.
- **Public URL:** https://seacolorado.org/docs/FINAL-COLORADO-FRONT-RANGE-GUST-MAP-2013.pdf

### What it contains
- Wind speed contour maps for the Colorado Front Range, from the Wyoming border
  to south of Denver, I-25 west to the Continental Divide.
- Recurrence intervals: 700 yr (Cat II), 1700 yr (Cat III-IV), 300 yr (Cat I),
  plus 10, 25, 50, and 100 yr serviceability maps.
- Contour values (700-yr): 115, 125, 140, 150, 165, 175, 225 mph.
- Word descriptions of each contour line location (page 9-10).
- Conversion table: 50-yr gust speed to 700-yr and other return periods.
- Conversion formula: Frc = 0.36 + 0.10 × ln(12T).

### Methodology
- Based on 3-second gust wind data from the Colorado State Climatologist's office
  (Nolan Doesken), analyzed using Type I Extreme Value Distribution.
- Original 2006 map updated to ASCE 7-10 format using recurrence interval scaling.
- Funded by the Colorado Chapter of the International Code Council involving
  35 Front Range jurisdictions.
- Technical review by Bill Esterday of CPP.

### Limitations
- No new measured wind speed data was acquired for the 2013 update — contours
  derived from 2006 50-yr map using the Frc equation.
- Contour positions are approximate — "much smaller than our ability to know
  where the contours should be placed."
- Short wind records at some stations may bias speeds slightly high (conservative).
- Map coverage ends at the Continental Divide to the west and approximately I-25
  to the east.

---

## 2. SEAC KMZ Geodata

- **File:** `colorado-gust-map.kmz`
- **Format:** KMZ (zipped KML) — Google Earth compatible
- **Origin:** SEAC / CPP
- **Contents:** Geo-referenced LineString features for all contour lines across
  all recurrence intervals (10, 25, 50, 100, 300, 700, 1700 yr).

### How we used it
- Extracted the 700-yr contour polylines using Python XML parsing.
- Simplified point density (every 2nd-4th point) to reduce file size while
  maintaining contour shape fidelity.
- Embedded coordinates directly in the HTML tool as JavaScript arrays.
- Total extracted: 7 contour lines, ~500 coordinate points.

---

## 3. SEAC 2019 Interim Recommendations (IBC 2018 / ASCE 7-16)

- **File:** `2019-06-19_SEAC_Letterhead_Wind_Committee_Interim_Recommendations.pdf`
- **Author:** SEAC Wind Loads Committee — Dale F. Jones, PE (Chair);
  Michael Negler, PE; Eric Richards, PE; Street Schellhase, PE;
  Dale Statler, PE; Jeannette Torrents, PE.
- **Date:** June 19, 2019
- **Status:** Approved by the SEAC General Membership.

### Key recommendations used
1. Continue using 2013 Gust Map for design wind speeds within its coverage area.
2. SWR boundaries in ASCE 7-16 are too far west — proposed supplemental boundaries.
3. Ke ground elevation factor (§26.9): At 5,000 ft, Ke ≈ 0.83. Optional per AHJ.
4. Risk Cat IV: use 3000-yr speeds from the Frc conversion table.
5. Wind speed terminology: V (basic wind speed, ultimate) replaces Vult in ASCE 7-22;
   VASD retained for reference. Do not cite a single "fastest mile" speed.

### Advisory status
"The above recommendations are strictly advisory in nature and are not a substitute
for the designer's engineering knowledge and professional judgment."

---

## 4. SEAC 2025 ASCE 7-22 Recommendations (2024 IBC/IRC)

- **File:** `ASCE_7-22_Final.pdf`
- **Author:** SEAC Wind Loads Committee
- **Date:** March 6, 2025
- **Status:** Current as of tool creation.

### Key recommendations used
1. **2013 Gust Map still governs** — justified per ASCE 7 §26.5.3. SEAC recommends
   communities amend their codes to reference it.
2. **ASCE 7 Hazard Tool limitations** — has been found to report misleading/erroneous
   values within the SWR. Output should be cross-referenced with Gust Map and AHJ.
3. **SWR boundaries** — ASCE 7-22 amended the eastern boundary to follow Gust Map
   north of Sedalia, but south of Sedalia the boundary is still problematic.
4. **Ke factor** — now codified in 2024 IBC. IRC lacks Ke; workaround: Ve = V × √Ke.
5. **Winter windiness** — ASCE 7-22 Chapter 7 snow drift provisions use winter wind
   parameter (W2). SEAC notes insufficient data for SWR-specific guidance.
6. **Tornado design** — ASCE 7-22 Chapter 32. Limited applicability to most structures
   due to footprint size thresholds.

### Same conversion table as 2019 (confirmed identical).

---

## 5. ASCE 7-22 Standard (Referenced, Not Included)

- **Title:** Minimum Design Loads and Associated Criteria for Buildings and
  Other Structures
- **Publisher:** American Society of Civil Engineers
- **Key sections referenced:**
  - §26.5.3 — Special Wind Regions: AHJ shall adjust mapped values
  - §26.9 — Ground Elevation Factor (Ke)
  - §26.12.3 — Wind-Borne Debris Regions (Boulder is NOT in one)
  - Chapter 26 — Wind Loads general provisions
  - Chapter 32 — Tornado Loads (new in 7-22)

---

## 6. City of Boulder Local Requirements (Referenced, Not a File)

- **Source:** City of Boulder building code amendments, plan review practice
- **Broadway divide:** Wind speeds split by Broadway Ave (~longitude -105.283)
  - West of Broadway: high wind zone (foothills/Chinook exposure)
  - East of Broadway: standard zone
- **Note:** Specific ordinance values (140-175 mph range) vary by adoption cycle.
  Always confirm current values with the City of Boulder Building Services Division.
- **Related blog post:** https://windcalculations.com/boulder-colorado-wind-load-and-permitting-guide
- **Related blog post:** https://oasisengineering.com/2025/08/03/navigating-boulder-building-code-engineering-guide/

---

## Data Integrity Notes

- All contour coordinates are directly from the SEAC/CPP KMZ file — no manual
  digitization or approximation of contour positions.
- Point simplification (thinning) was applied only for file size reduction;
  contour shape accuracy is preserved.
- The interpolation algorithm (linear between contours at a given latitude) is
  consistent with standard engineering practice for reading between map contours.
- The tool rounds interpolated values to the nearest 5 mph, consistent with
  ASCE convention for mapped wind speeds.

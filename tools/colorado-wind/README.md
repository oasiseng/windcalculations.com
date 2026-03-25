# Colorado Front Range Wind Speed Tool

Interactive web tool for determining design wind speeds along the Colorado Front Range, with special handling for the City of Boulder Broadway Avenue divide.

**Live tool:** `boulder-wind-tool.html` — single self-contained HTML file, embeddable via iframe.

---

## What It Does

1. **Displays real SEAC/CPP contour lines** (115, 125, 140, 150, 165, 175, 225 mph) on an interactive Leaflet map — geodata extracted directly from the official KMZ file.
2. **Address search** (Nominatim geocoding) or click-to-query anywhere on the map.
3. **Interpolates wind speed** between contour lines at the queried latitude using the actual SEAC polyline geometry.
4. **City of Boulder overlay** — shows Broadway Avenue as a dashed red line. Detects whether a point is within city limits and east/west of Broadway, applying the local ordinance split.
5. **Results panel** showing:
   - SEAC/CPP map reference value (700-yr MRI)
   - Estimated design wind speed with source attribution
   - Special Wind Region flag
   - Broadway side indicator (if in Boulder)
   - Visual comparison bar chart vs. Miami-Dade HVHZ (175 mph) and typical inland (115 mph)
   - Risk Category conversion table (Cat I through IV, per SEAC 2019/2025 tables)
   - K_e elevation factor note (ASCE 7-22 §26.9)
6. **CTA buttons** linking to WindCalculations.com store for engineered wind letters.

---

## Data Sources

| Source | Date | Description |
|--------|------|-------------|
| `FINAL-COLORADO-FRONT-RANGE-GUST-MAP-2013.pdf` | Nov 18, 2013 | Colorado Front Range Gust Map — ASCE 7-10 Compatible. Prepared by Jon A. Peterka, Cermak Peterka Petersen, Inc. (CPP). Endorsed by SEAC. Contains 700-yr, 1700-yr, and 300-yr recurrence maps + word descriptions of contour locations. |
| `colorado-gust-map.kmz` | 2013 | KMZ (Google Earth) file containing the actual contour polylines as geo-referenced LineString features. All recurrence intervals included (10, 25, 50, 100, 300, 700, 1700 yr). The 700-yr contours were extracted and embedded in the HTML tool. |
| `2019-06-19_SEAC_Letterhead_Wind_Committee_Interim_Recommendations.pdf` | Jun 19, 2019 | SEAC Wind Loads Committee interim recommendations for IBC 2018 / ASCE 7-16. Key points: (1) continue using 2013 Gust Map, (2) SWR boundaries need amendment, (3) K_e factor guidance, (4) Risk Cat IV 3000-yr conversion table, (5) wind speed terminology clarification (V vs V_ult vs V_ASD). |
| `ASCE_7-22_Final.pdf` | Mar 6, 2025 | SEAC Wind Loads Committee ASCE 7-22 recommendations for 2024 IBC/IRC. Key points: (1) 2013 Gust Map still governs (ASCE 7 §26.5.3), (2) ASCE 7 Hazard Tool has limitations within SWR, (3) SWR boundaries need supplemental update, (4) K_e elevation factor now in IBC but not IRC — V_e = V√K_e workaround for IRC, (5) winter windiness / snow drifting considerations. |

---

## Wind Speed Determination Logic

### SEAC Contour Interpolation
For a given latitude, the tool finds where each contour line crosses that latitude (linear interpolation between polyline vertices), then determines which two contours the query longitude falls between. The wind speed is linearly interpolated between those contour values and rounded to the nearest 5 mph.

**700-yr contour values (Risk Category II):** 115, 125, 140, 150, 165, 175, 225 mph

### City of Boulder — Broadway Divide
If the queried point is within the approximate City of Boulder boundary:
- **West of Broadway Ave** (lng ≤ -105.283): High wind zone. Chinook/downslope wind exposure. The 165 mph contour runs through Broadway per the SEAC map.
- **East of Broadway Ave** (lng > -105.283): Standard zone. Design per SEAC map interpolation (typically ~140 mph in central/east Boulder).

The tool uses `max(SEAC interpolated value, Boulder local requirement)` as the governing speed.

### Risk Category Conversion
Per the SEAC conversion table (Peterka 2013 / SEAC 2019 / SEAC 2025):

| 50-yr Gust (V_ASD) | 700-yr (Cat II) | 1700-yr (Cat III-IV) | 300-yr (Cat I) | 3000-yr (Cat IV) |
|---------------------|-----------------|----------------------|-----------------|-------------------|
| 90 | 115 | 120 | 105 | 125 |
| 100 | 125 | 135 | 120 | 140 |
| 110 | 140 | 150 | 130 | 155 |
| 120 | 150 | 160 | 140 | 170 |
| 130 | 165 | 175 | 155 | 185 |
| 140 | 175 | 190 | 165 | 195 |
| 180 | 225 | 245 | 210 | 255 |

The conversion uses Frc = 0.36 + 0.10 ln(12T), where T is the return period in years.

### K_e Elevation Factor
ASCE 7-22 §26.9. At 5,000 ft (typical Boulder), K_e ≈ 0.83 — velocity pressures are ~83% of sea-level values. Optional, subject to AHJ approval. For IRC (which lacks K_e), SEAC recommends: V_e = V × √K_e.

---

## Key Engineering Notes

1. **SEAC 2025 confirms**: The 2013 Gust Map continues to provide the most accurate wind design criteria for the Colorado Front Range. Justified per ASCE 7 §26.5.3.
2. **ASCE 7 Hazard Tool limitations**: The online tool has been found to report misleading values within the SWR. Should always be cross-referenced with the Gust Map and AHJ amendments.
3. **SWR boundary issues**: ASCE 7-16 moved the SWR boundary too far west, excluding communities with documented high winds. ASCE 7-22 amended the eastern boundary to follow the Gust Map edge north of Sedalia, but gaps remain south of Sedalia.
4. **Eastern edge continuity**: SEAC recommends interpolating between the 115 mph Gust Map contour and the ASCE 7-22 110 mph mapped value for seamless transition at the SWR boundary.
5. **Wind direction**: High winds in the Front Range come primarily from SSW through NNW (az 200°–340°). East of I-25, MWFRS frame pressures may use lower (ASCE 7-22 mapped) wind speeds for southerly wind azimuths.

---

## Deployment

The tool is a single self-contained HTML file (~38KB). No build step, no dependencies beyond CDN-loaded Leaflet.js and CARTO tile server.

**Embed on any page:**
```html
<iframe src="boulder-wind-tool.html" width="100%" height="700" frameborder="0"></iframe>
```

**Tile provider:** CARTO Voyager (free, no API key required).
**Geocoding:** OpenStreetMap Nominatim (free, rate-limited — fine for individual lookups).

---

## Disclaimer

This tool provides approximate wind speed estimates for informational and preliminary planning purposes only. It is NOT a substitute for site-specific engineering analysis by a licensed professional engineer. The user is solely responsible for verifying all design parameters with the Authority Having Jurisdiction (AHJ). Oasis Engineering LLC and WindCalculations.com assume no liability for decisions made based on this tool.

---

## License & Credits

- **Wind contour data:** SEAC / Cermak Peterka Petersen, Inc. (CPP) — Jon A. Peterka, 2013
- **SEAC recommendations:** SEAC Wind Loads Committee (Dale F. Jones, PE, Chair)
- **Tool development:** Oasis Engineering LLC / [WindCalculations.com](https://windcalculations.com)
- **Map tiles:** CARTO / OpenStreetMap contributors

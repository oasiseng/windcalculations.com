# WC-ROOF-LOW-SLOPE Calculation Logic

## Governing SOP
- `hvhz_low_slope_roofing_wind_pac…`

## Engineering Dependencies
- ASCE 7-22 Chapter 30 C&C
- ASD (typically 0.6 LF unless project-specific basis differs)
- Zone 1/2/3 pressures
- NOA system capacities (E(3), E(5), E(7))

## Relationship Logic
ASCE C&C -> zone pressures -> compare to NOA system capacity ->
If capacity >= demand, approve and populate HVHZ form section C spacing basis.

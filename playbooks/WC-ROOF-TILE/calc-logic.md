# WC-ROOF-TILE Calculation Logic

## Governing SOP
- `SOP - Roofing HVHZ`
- `Roofing_Wind_Letter_SOP`

## Engineering Dependencies
- ASCE 7-22 Chapter 30 C&C
- HVHZ wind speed = 175 mph
- Exposure C
- RAS 127 Moment Method or Uplift Method
- λ, Mg, Mf values from NOA
- Zone 1 / 2 / 3 pressures

## Relationship Map
ASCE wind calc -> Zone 1/2/3 pressures -> RAS 127 Mr required -> compare to NOA Mf ->
If Mf >= Mr -> populate HVHZ form sections D/E -> issue signed letter.

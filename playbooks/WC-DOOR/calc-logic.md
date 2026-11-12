# WC-DOOR Calculation Logic

## Engineering Dependencies
- ASCE 7-22 Chapter 30 C&C
- HVHZ override where applicable (175 mph Miami-Dade)
- `WindLoad_Letter_SOP`
- Effective area calculation (typically ~20 ft²)
- Zone 4 wall pressure

## Relationship Logic
1. Wind calcs produce required pressure.
2. Required pressure is compared against FPA tested pressure.
3. If tested pressure >= required pressure, approve and issue letter.

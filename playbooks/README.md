# WindCalculations Subcategory Framework

This folder standardizes wind-calculation project intake and delivery by subcategory.

## Master Category

- `WindCalculations`

## Subcategories

- `WC-DOOR`
- `WC-WINDOW`
- `WC-ROOF-TILE`
- `WC-ROOF-LOW-SLOPE`
- `WC-METAL-ROOF`
- `WC-SOLAR-ROOF-ATTACH`
- `WC-RAILING`
- `WC-MISC-CNC`

## Standardized Deliverable Matrix

| Subcategory | Letter | Wind Calcs | NOA/FPA | HVHZ Form | Roof Plan | RAS Calc |
|---|---|---|---|---|---|---|
| WC-DOOR | ✔ | ✔ | ✔ | ✖ | ✖ | ✖ |
| WC-WINDOW | ✔ | ✔ | ✔ | ✖ | ✖ | ✖ |
| WC-ROOF-TILE | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| WC-ROOF-LOW-SLOPE | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ |
| WC-METAL-ROOF | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ |
| WC-SOLAR-ROOF-ATTACH | ✔ | ✔ | ✔ | Optional | Optional | ✖ |
| WC-RAILING | ✔ | ✔ | ✔ | ✖ | ✖ | ✖ |
| WC-MISC-CNC | ✔ | ✔ | ✔ | ✖ | ✖ | ✖ |

## Folder Convention

Each subcategory includes:

- `inputs.md`: intake fields and required documents
- `calc-logic.md`: governing methods/dependencies and approval logic
- `deliverables.md`: deliverable package checklist

Where applicable, extra files are included (e.g., sample letter and HVHZ mapping).

## Master Source Registry

- `_documents-required-master.md`: canonical document source IDs, subcategory dependency maps, and checklist automation references.

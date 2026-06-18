# Glass Railing Preliminary Calculator

Public, single-file web calculator for preliminary screening of glass railing support hardware, anchors, posts, grab rails, and grouted post sockets.

Use this public file for hosting:

- `glass-railing-preliminary-calculator.html`

## Purpose

This tool is intended for education, practice, early layout checks, and rough screening. It helps users understand how glass railing loads can transfer into stand-offs, mounting plates, anchors, optional posts, and grab rail supports.

It is not a sealed engineering calculation, permit document, construction instruction, warranty, or substitute for a licensed professional engineer.

For project-specific engineering, contact:

- https://www.oasisengineering.com/contact

## What It Screens

- Wind pressure based on entered wind speed, exposure, elevation, and force coefficient.
- Guardrail load cases: 50 plf, 200 lb concentrated load, and 50 lb infill load.
- Stand-off barrel demand.
- Mounting plate bending demand.
- Anchor demand compared to user-entered external capacity data.
- Optional vertical post bending, shear, and deflection.
- Optional grab rail bending, shear, and deflection.
- Optional grab rail support checks:
  - wall bracket / side-mounted bolt group
  - base/floor-mounted bolt group
  - core-drilled grouted post socket

## Important Limits

The calculator does not design glass panels. Glass is assumed to be certified impact-rated safety glazing per the entered glass note, such as Category II of CPSC 16 CFR Part 1201 or Class A of ANSI Z97.1.

The calculator does not perform ACI 318 Chapter 17 concrete or CMU anchor design. Anchor results are demand checks unless a user enters an external approved capacity source.

The grouted post socket option is a simplified bearing screen using entered geometry and allowable grout/concrete bearing pressure. It does not verify grout product suitability, concrete substrate capacity, edge distance, or construction quality.

## Suggested Public Hosting Files

Recommended:

- `README.md`
- `glass-railing-preliminary-calculator.html`

Do not publish project-specific PDFs, saved JSON inputs, screenshots, or files under `tmp/`.

## Local Use

Open `glass-railing-preliminary-calculator.html` in a browser. No build step or server is required.

The calculator runs fully in the browser. It can save and load JSON input sets for practice or repeat examples.

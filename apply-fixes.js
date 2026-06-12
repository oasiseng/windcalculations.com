#!/usr/bin/env node
/*
 * apply-fixes.js — WindCalculations.com map-tool patcher
 *
 * Applies the 2026-06 audit fixes IN PLACE to the two files that carry large
 * embedded geodata blobs (safer than retyping them):
 *
 *   wind-speed-tool/public/nationwide-wind-tool.html
 *   tools/colorado-wind/boulder-wind-tool.html
 *
 * Usage:   node apply-fixes.js [repoRoot]     (repoRoot defaults to ".")
 *
 * Behavior:
 *   - Verifies every search string occurs EXACTLY once before touching a file.
 *   - Handles Windows (CRLF) checkouts: matching is done on LF-normalized
 *     content and the file's original line-ending style is preserved on write.
 *   - Writes a .bak backup next to each file before modifying it.
 *   - Idempotent: a patch whose replacement is already present is skipped.
 *   - Any mismatch aborts the entire run with a clear message and no writes.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = process.argv[2] || '.';

const PATCH_SETS = [
  {
    file: "wind-speed-tool/public/nationwide-wind-tool.html",
    patches: [
      {
        name: "Gate wind-borne debris flag on hurricane-prone region (Sec. 26.12.3.1)",
        search: "function isWindBorneDebris(vult,isHurricane,lat,lng){\n  if(vult>=140){return true;}\n  if((isHawaii(lat,lng)||isCaribbean(lat,lng))&&vult>=130){return true;}\n  return isHurricane&&vult>=130;\n}",
        replace: "function isWindBorneDebris(vult,isHurricane,lat,lng){\n  // ASCE 7 Sec. 26.12.3.1: wind-borne debris regions exist only WITHIN\n  // hurricane-prone regions (isHurricaneProne already includes Hawaii and\n  // the Caribbean territories). High inland speeds (e.g. Colorado Front\n  // Range chinook zones) do NOT trigger WBD glazing protection.\n  if(!isHurricane){return false;}\n  // Within hurricane-prone regions, 140 mph triggers WBD anywhere; the\n  // 130 mph branch is a conservative screen for the within-1-mile-of-\n  // coastal-mean-high-water condition, which cannot be computed client-side.\n  return vult>=130;\n}"
      },
      {
        name: "Label governing source correctly when mapped ASCE value exceeds Colorado overlay",
        search: "  let displaySpeed=mapped;\n  let displaySource=sourceDetail;\n  if(colorado){\n    displaySpeed=Math.max(displaySpeed,colorado.design);\n    displaySource='Colorado Front Range overlay and local note';\n    if(displaySpeed===colorado.design){\n      riskTable=coloradoRiskTable(colorado.design);\n    }\n  }",
        replace: "  let displaySpeed=mapped;\n  let displaySource=sourceDetail;\n  if(colorado){\n    if(colorado.design>displaySpeed){\n      displaySpeed=colorado.design;\n      displaySource='Colorado Front Range overlay and local note';\n      riskTable=coloradoRiskTable(colorado.design);\n    }else{\n      displaySource=sourceDetail+' (Colorado overlay cross-checked; mapped value governs)';\n    }\n  }"
      },
      {
        name: "Clarify WBD threshold label outside hurricane-prone regions",
        search: "  document.getElementById('thresholdLabel').textContent=result.threshold===130?'Hurricane/WBD Trigger':'WBD Trigger';",
        replace: "  document.getElementById('thresholdLabel').textContent=result.hurricane?(result.threshold===130?'Hurricane/WBD Trigger':'WBD Trigger'):'WBD Trigger (hurricane-prone regions only)';"
      },
      {
        name: "Correct comparison note for high-wind sites outside hurricane-prone regions",
        search: "  if(result.displaySpeed>=result.threshold){\n    note.textContent='This site meets or exceeds the wind-borne debris threshold.';\n    note.style.color='#dc2626';\n  }else if(result.displaySpeed>=140){",
        replace: "  if(result.hurricane&&result.displaySpeed>=result.threshold){\n    note.textContent='This site meets or exceeds the wind-borne debris screening threshold for this hurricane-prone region.';\n    note.style.color='#dc2626';\n  }else if(!result.hurricane&&result.displaySpeed>=140){\n    note.textContent='High wind speed, but wind-borne debris provisions apply only within hurricane-prone regions (ASCE 7 Sec. 26.12.3.1).';\n    note.style.color='#c2410c';\n  }else if(result.displaySpeed>=140){"
      },
      {
        name: "Add escapeHtml helper",
        search: "function setFlag(id,value,truthyColor){",
        replace: "function escapeHtml(value){\n  return String(value)\n    .replace(/&/g,'&amp;')\n    .replace(/</g,'&lt;')\n    .replace(/>/g,'&gt;')\n    .replace(/\"/g,'&quot;')\n    .replace(/'/g,'&#39;');\n}\n\nfunction setFlag(id,value,truthyColor){"
      },
      {
        name: "Escape geocoder-supplied address before innerHTML (XSS hardening)",
        search: "  document.getElementById('rLoc').innerHTML=address?'<span>'+address+'</span><br>'+coord:'<span>'+coord+'</span>';",
        replace: "  document.getElementById('rLoc').innerHTML=address?'<span>'+escapeHtml(address)+'</span><br>'+coord:'<span>'+coord+'</span>';"
      },
    ]
  },
  {
    file: "tools/colorado-wind/boulder-wind-tool.html",
    patches: [
      {
        name: "Replace single-crossing contour interpolation with all-crossings bracketing",
        search: "// ---- WIND SPEED INTERPOLATION ----\n// For a given lat, find where each contour line crosses that latitude\nfunction getContourLngAtLat(contourPts, lat) {\n  for (let i = 0; i < contourPts.length - 1; i++) {\n    const [lat1, lng1] = contourPts[i];\n    const [lat2, lng2] = contourPts[i + 1];\n    // Check if lat is between these two points\n    if ((lat1 >= lat && lat2 <= lat) || (lat1 <= lat && lat2 >= lat)) {\n      if (Math.abs(lat2 - lat1) < 0.0001) return (lng1 + lng2) / 2;\n      const t = (lat - lat1) / (lat2 - lat1);\n      return lng1 + t * (lng2 - lng1);\n    }\n  }\n  return null;\n}\n\nfunction getSeacSpeed(lat, lng) {\n  // For each contour, find its longitude at this latitude\n  const crossings = [];\n  for (const s of SPEEDS) {\n    if (!C[s]) continue;\n    const cLng = getContourLngAtLat(C[s], lat);\n    if (cLng !== null) {\n      crossings.push({ speed: s, lng: cLng });\n    }\n  }\n\n  if (crossings.length === 0) {\n    // Outside map coverage — use ASCE 7-22 baseline\n    return { speed: 115, interpolated: false, note: 'Outside SEAC map coverage — using ASCE 7-22 baseline' };\n  }\n\n  // Sort crossings by longitude (east to west = more negative)\n  crossings.sort((a, b) => b.lng - a.lng); // east first\n\n  // Find which zone the point is in\n  // If east of all contours → below minimum (use 115)\n  if (lng > crossings[0].lng) {\n    return { speed: 110, interpolated: false, note: 'East of SEAC map — ASCE 7-22 mapped values govern' };\n  }\n\n  // If west of all contours → above maximum\n  if (lng < crossings[crossings.length - 1].lng) {\n    return { speed: 225, interpolated: false, note: 'West of all contours — maximum zone' };\n  }\n\n  // Find which two contour lines the point is between\n  for (let i = 0; i < crossings.length - 1; i++) {\n    if (lng <= crossings[i].lng && lng >= crossings[i + 1].lng) {\n      // Between crossing[i] and crossing[i+1]\n      // Interpolate\n      const eastSpeed = crossings[i].speed;\n      const westSpeed = crossings[i + 1].speed;\n      const eastLng = crossings[i].lng;\n      const westLng = crossings[i + 1].lng;\n\n      // Linear interpolation\n      const t = (lng - eastLng) / (westLng - eastLng);\n      const rawSpeed = eastSpeed + t * (westSpeed - eastSpeed);\n      // Round to nearest 5\n      const rounded = Math.round(rawSpeed / 5) * 5;\n\n      return {\n        speed: rounded,\n        interpolated: true,\n        eastContour: eastSpeed,\n        westContour: westSpeed,\n        note: `Interpolated between ${eastSpeed} and ${westSpeed} mph contours`\n      };\n    }\n  }\n\n  // Fallback: use nearest contour\n  let nearest = crossings[0];\n  let minDist = Math.abs(lng - nearest.lng);\n  for (const c of crossings) {\n    const d = Math.abs(lng - c.lng);\n    if (d < minDist) { minDist = d; nearest = c; }\n  }\n  return { speed: nearest.speed, interpolated: false, note: `Near ${nearest.speed} mph contour` };\n}\n\n",
        replace: "// ---- WIND SPEED INTERPOLATION ----\n// For a given lat, find EVERY longitude where a contour crosses that\n// latitude. The 165 and especially 225 mph contours wiggle enough to cross\n// a single latitude several times, so returning only the first crossing\n// (the previous behavior) could place foothills points in the wrong band.\nfunction getContourLngsAtLat(contourPts, lat) {\n  const crossings = [];\n  for (let i = 0; i < contourPts.length - 1; i++) {\n    const [lat1, lng1] = contourPts[i];\n    const [lat2, lng2] = contourPts[i + 1];\n    if ((lat1 >= lat && lat2 <= lat) || (lat1 <= lat && lat2 >= lat)) {\n      if (Math.abs(lat2 - lat1) < 0.0001) {\n        crossings.push((lng1 + lng2) / 2);\n      } else {\n        const t = (lat - lat1) / (lat2 - lat1);\n        crossings.push(lng1 + t * (lng2 - lng1));\n      }\n    }\n  }\n  return crossings;\n}\n\nfunction getSeacSpeed(lat, lng) {\n  // Collect EVERY crossing of every contour at this latitude\n  const crossings = [];\n  for (const s of SPEEDS) {\n    if (!C[s]) continue;\n    const lngs = getContourLngsAtLat(C[s], lat);\n    for (const cLng of lngs) {\n      crossings.push({ speed: s, lng: cLng });\n    }\n  }\n\n  if (crossings.length === 0) {\n    // Outside map coverage — use ASCE 7-22 baseline\n    return { speed: 115, interpolated: false, note: 'Outside SEAC map coverage — using ASCE 7-22 baseline' };\n  }\n\n  // Sort crossings east to west (descending longitude; west = more negative)\n  crossings.sort((a, b) => b.lng - a.lng);\n\n  // East of all contour crossings — ASCE 7-22 mapped values govern\n  if (lng > crossings[0].lng) {\n    return { speed: 110, interpolated: false, note: 'East of SEAC map — ASCE 7-22 mapped values govern' };\n  }\n\n  // West of all contour crossings — maximum zone\n  if (lng < crossings[crossings.length - 1].lng) {\n    return { speed: 225, interpolated: false, note: 'West of all contours — maximum zone' };\n  }\n\n  // Find the bracketing pair of crossings\n  for (let i = 0; i < crossings.length - 1; i++) {\n    if (lng <= crossings[i].lng && lng >= crossings[i + 1].lng) {\n      const east = crossings[i];\n      const west = crossings[i + 1];\n\n      // Same contour on both sides (a contour loops back across this\n      // latitude): the point sits inside that contour's band.\n      if (east.speed === west.speed) {\n        return {\n          speed: east.speed,\n          interpolated: false,\n          note: `Within the ${east.speed} mph contour band`\n        };\n      }\n\n      // Linear interpolation between the two bracketing contours\n      const t = (lng - east.lng) / (west.lng - east.lng);\n      const rawSpeed = east.speed + t * (west.speed - east.speed);\n      // Round to nearest 5\n      const rounded = Math.round(rawSpeed / 5) * 5;\n\n      return {\n        speed: rounded,\n        interpolated: true,\n        eastContour: east.speed,\n        westContour: west.speed,\n        note: `Interpolated between ${east.speed} and ${west.speed} mph contours`\n      };\n    }\n  }\n\n  // Fallback: use nearest contour crossing\n  let nearest = crossings[0];\n  let minDist = Math.abs(lng - nearest.lng);\n  for (const c of crossings) {\n    const d = Math.abs(lng - c.lng);\n    if (d < minDist) { minDist = d; nearest = c; }\n  }\n  return { speed: nearest.speed, interpolated: false, note: `Near ${nearest.speed} mph contour` };\n}\n\n"
      },
      {
        name: "Add escapeHtml helper",
        search: "let marker = null;",
        replace: "let marker = null;\n\nfunction escapeHtml(value) {\n  return String(value)\n    .replace(/&/g, '&amp;')\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;')\n    .replace(/'/g, '&#39;');\n}"
      },
      {
        name: "Escape geocoder-supplied address before innerHTML (XSS hardening)",
        search: "  document.getElementById('rLoc').innerHTML = address ? `<span>${address}</span><br>${coord}` : `<span>${coord}</span>`;",
        replace: "  document.getElementById('rLoc').innerHTML = address ? `<span>${escapeHtml(address)}</span><br>${coord}` : `<span>${coord}</span>`;"
      },
    ]
  },
];

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

let hadError = false;
const plans = [];

for (const set of PATCH_SETS) {
  const filePath = path.join(repoRoot, set.file);
  if (!fs.existsSync(filePath)) {
    console.error('ERROR: file not found: ' + filePath);
    hadError = true;
    continue;
  }
  const rawOriginal = fs.readFileSync(filePath, 'utf8');
  // Git on Windows (core.autocrlf) typically checks these files out with CRLF
  // line endings. Normalize to LF for matching, and restore CRLF on write.
  const usesCRLF = rawOriginal.includes('\r\n');
  const original = usesCRLF ? rawOriginal.replace(/\r\n/g, '\n') : rawOriginal;
  let working = original;
  const applied = [];
  const skipped = [];

  for (const patch of set.patches) {
    if (working.includes(patch.replace)) {
      skipped.push(patch.name + ' (already applied)');
      continue;
    }
    const n = countOccurrences(working, patch.search);
    if (n === 1) {
      working = working.replace(patch.search, patch.replace);
      applied.push(patch.name);
    } else {
      console.error('ERROR in ' + set.file + ' — patch "' + patch.name + '": expected exactly 1 occurrence of the search text, found ' + n + '.');
      console.error('       The file may have diverged from the audited version. No files were modified.');
      hadError = true;
    }
  }

  plans.push({ filePath, rawOriginal, usesCRLF, working, applied, skipped, changed: working !== original });
}

if (hadError) {
  console.error('\nAborted: fix the mismatches above and re-run. Nothing was written.');
  process.exit(1);
}

for (const plan of plans) {
  if (!plan.changed) {
    console.log(plan.filePath + ': nothing to do' + (plan.skipped.length ? ' (' + plan.skipped.join('; ') + ')' : ''));
    continue;
  }
  const output = plan.usesCRLF ? plan.working.replace(/\n/g, '\r\n') : plan.working;
  fs.writeFileSync(plan.filePath + '.bak', plan.rawOriginal, 'utf8');
  fs.writeFileSync(plan.filePath, output, 'utf8');
  console.log(plan.filePath + ':' + (plan.usesCRLF ? ' (CRLF line endings preserved)' : ''));
  for (const name of plan.applied) console.log('  applied: ' + name);
  for (const name of plan.skipped) console.log('  skipped: ' + name);
  console.log('  backup:  ' + plan.filePath + '.bak');
}

console.log('\nDone.');
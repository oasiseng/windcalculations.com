const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');

const ROOT = __dirname;
const OUTPUT_DIR = path.join(ROOT, 'output');
const HTML_OUTPUT = path.join(ROOT, 'nationwide-wind-tool.html');
const PROCESSED_OUTPUT = path.join(OUTPUT_DIR, 'processed_wind_data.json');
const COLORADO_REF_HTML = path.join(ROOT, 'ColoradoReference', 'boulder-wind-tool.html');

const SERVICES = {
  RC_I: {
    label: 'Risk Category I',
    base: 'https://gis.asce.org/arcgis/rest/services/ASCE722/w2022_Tile_RC_I/MapServer',
    contourFile: 'wind_contours_RC_I.geojson',
  },
  RC_II: {
    label: 'Risk Category II',
    base: 'https://gis.asce.org/arcgis/rest/services/ASCE722/w2022_Tile_RC_II_new/MapServer',
    contourFile: 'wind_contours_RC_II.geojson',
  },
  RC_III_IV: {
    label: 'Risk Category III-IV',
    base: 'https://gis.asce.org/arcgis/rest/services/ASCE722/w2022_Tile_RC_III/MapServer',
    contourFile: 'wind_contours_RC_III_IV.geojson',
  },
  RC_IV: {
    label: 'Risk Category IV',
    base: 'https://gis.asce.org/arcgis/rest/services/ASCE722/w2022_Tile_RC_IV_SI/MapServer',
    contourFile: 'wind_contours_RC_IV.geojson',
  },
};

const DISPLAY_COLORS = {
  105: '#38bdf8',
  110: '#60a5fa',
  115: '#22c55e',
  120: '#84cc16',
  125: '#a3e635',
  130: '#eab308',
  135: '#fbbf24',
  140: '#f97316',
  145: '#fb7185',
  150: '#ef4444',
  155: '#dc2626',
  160: '#be123c',
  165: '#be185d',
  170: '#a21caf',
  175: '#7c3aed',
  180: '#6d28d9',
  185: '#4338ca',
  190: '#3730a3',
  195: '#312e81',
  200: '#1e1b4b',
  205: '#172554',
};

const PROMPT_RC_TABLE = {
  115: { I: 105, II: 115, 'III-IV': 120, IV: 125 },
  120: { I: 110, II: 120, 'III-IV': 130, IV: 135 },
  130: { I: 120, II: 130, 'III-IV': 140, IV: 145 },
  140: { I: 130, II: 140, 'III-IV': 150, IV: 155 },
  150: { I: 140, II: 150, 'III-IV': 165, IV: 170 },
  160: { I: 150, II: 160, 'III-IV': 175, IV: 185 },
  170: { I: 155, II: 170, 'III-IV': 185, IV: 195 },
  175: { I: 165, II: 175, 'III-IV': 190, IV: 200 },
  180: { I: 170, II: 180, 'III-IV': 200, IV: 210 },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function roundCoord(n, places = 5) {
  const factor = 10 ** places;
  return Math.round(n * factor) / factor;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'WindCalculations Codex Builder/1.0',
          Accept: 'application/json',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          const redirectUrl = new URL(res.headers.location, url).toString();
          resolve(fetchJson(redirectUrl));
          return;
        }
        if (res.statusCode !== 200) {
          let errorBody = '';
          res.on('data', (chunk) => {
            errorBody += chunk.toString('utf8');
          });
          res.on('end', () => {
            reject(new Error(`HTTP ${res.statusCode} for ${url}: ${errorBody.slice(0, 300)}`));
          });
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Invalid JSON from ${url}: ${error.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(90000, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
  });
}

function buildUrl(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function fetchServiceDiscovery(baseUrl) {
  const serviceInfo = await fetchJson(buildUrl(baseUrl, { f: 'json' }));
  const layers = [];
  for (const layer of serviceInfo.layers || []) {
    const detail = await fetchJson(buildUrl(`${baseUrl}/${layer.id}`, { f: 'json' }));
    layers.push({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      geometryType: detail.geometryType || null,
      maxRecordCount: detail.maxRecordCount || null,
      fields: (detail.fields || []).map((field) => field.name),
      extent: detail.extent || null,
    });
  }
  return {
    base: baseUrl,
    service: {
      currentVersion: serviceInfo.currentVersion,
      mapName: serviceInfo.mapName,
      maxRecordCount: serviceInfo.maxRecordCount,
      fullExtent: serviceInfo.fullExtent || null,
      supportedQueryFormats: serviceInfo.supportedQueryFormats || null,
    },
    layers,
  };
}

async function downloadLayerGeoJson(baseUrl, layerId) {
  const url = buildUrl(`${baseUrl}/${layerId}/query`, {
    where: '1=1',
    outFields: '*',
    returnGeometry: 'true',
    outSR: '4326',
    geometryPrecision: '5',
    f: 'geojson',
  });
  return fetchJson(url);
}

function pointLineDistance(point, start, end) {
  if (start[0] === end[0] && start[1] === end[1]) {
    return Math.hypot(point[0] - start[0], point[1] - start[1]);
  }
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const mag = dx * dx + dy * dy;
  const u = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / mag));
  const closest = [start[0] + u * dx, start[1] + u * dy];
  return Math.hypot(point[0] - closest[0], point[1] - closest[1]);
}

function simplifyLine(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }
  const start = points[0];
  const end = points[points.length - 1];
  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = pointLineDistance(points[i], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  if (maxDistance > tolerance) {
    const left = simplifyLine(points.slice(0, index + 1), tolerance);
    const right = simplifyLine(points.slice(index), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [start, end];
}

function encodeSignedNumber(value) {
  let sgnNum = value << 1;
  if (value < 0) {
    sgnNum = ~sgnNum;
  }
  let encoded = '';
  while (sgnNum >= 0x20) {
    encoded += String.fromCharCode((0x20 | (sgnNum & 0x1f)) + 63);
    sgnNum >>= 5;
  }
  encoded += String.fromCharCode(sgnNum + 63);
  return encoded;
}

function encodePolyline(points, precision = 4) {
  const factor = 10 ** precision;
  let lastLat = 0;
  let lastLng = 0;
  let result = '';
  for (const point of points) {
    const lat = Math.round(point[0] * factor);
    const lng = Math.round(point[1] * factor);
    result += encodeSignedNumber(lat - lastLat);
    result += encodeSignedNumber(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
  }
  return result;
}

function computeBBox(points) {
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [roundCoord(minLat, 4), roundCoord(minLng, 4), roundCoord(maxLat, 4), roundCoord(maxLng, 4)];
}

function extractSpeed(properties) {
  for (const key of ['Vmph', 'SPEED', 'WindSpeed', 'VALUE', 'CONTOUR', 'Contour', 'GRIDCODE', 'contour_mph']) {
    if (properties[key] === undefined || properties[key] === null || properties[key] === '') {
      continue;
    }
    const parsed = Number(properties[key]);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  for (const key of ['LABEL', 'Label', 'Name', 'NAME']) {
    if (!properties[key]) {
      continue;
    }
    const match = String(properties[key]).match(/(\d+)\s*mph/i);
    if (match) {
      return Number(match[1]);
    }
  }
  return null;
}

function normalizeLineCoords(coords, tolerance) {
  const points = coords
    .filter((coord) => Array.isArray(coord) && coord.length >= 2)
    .map(([lng, lat]) => [roundCoord(lat, 5), roundCoord(lng, 5)]);
  if (points.length < 2) {
    return null;
  }
  const simplified = simplifyLine(points, tolerance);
  if (simplified.length < 2) {
    return null;
  }
  return simplified;
}

function normalizeContourFeatureCollection(collection, tolerance) {
  const grouped = new Map();
  for (const feature of collection.features || []) {
    const speed = extractSpeed(feature.properties || {});
    if (!Number.isFinite(speed)) {
      continue;
    }
    const geometry = feature.geometry || {};
    const lineSets =
      geometry.type === 'LineString'
        ? [geometry.coordinates]
        : geometry.type === 'MultiLineString'
          ? geometry.coordinates
          : [];
    for (const coords of lineSets) {
      const normalized = normalizeLineCoords(coords, tolerance);
      if (!normalized) {
        continue;
      }
      if (!grouped.has(speed)) {
        grouped.set(speed, []);
      }
      grouped.get(speed).push({
        bbox: computeBBox(normalized),
        path: encodePolyline(normalized),
      });
    }
  }
  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([speed, paths]) => ({
      speed,
      color: DISPLAY_COLORS[speed] || '#1a4971',
      paths,
    }));
}

function normalizePolygonFeatureCollection(collection, tolerance) {
  const regions = [];
  let index = 1;
  for (const feature of collection.features || []) {
    const geometry = feature.geometry || {};
    const polygons =
      geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates
          : [];
    for (const polygon of polygons) {
      if (!Array.isArray(polygon) || !polygon.length) {
        continue;
      }
      const outer = normalizeLineCoords(polygon[0], tolerance);
      if (!outer || outer.length < 4) {
        continue;
      }
      regions.push({
        id: index,
        name:
          (feature.properties && (feature.properties.RefName || feature.properties.Name || feature.properties.Layer)) ||
          `Special Wind Region ${index}`,
        bbox: computeBBox(outer),
        path: encodePolyline(outer),
      });
      index += 1;
    }
  }
  return regions;
}

function normalizePolylineFeatureCollection(collection, tolerance) {
  const lines = [];
  for (const feature of collection.features || []) {
    const geometry = feature.geometry || {};
    const lineSets =
      geometry.type === 'LineString'
        ? [geometry.coordinates]
        : geometry.type === 'MultiLineString'
          ? geometry.coordinates
          : [];
    for (const coords of lineSets) {
      const normalized = normalizeLineCoords(coords, tolerance);
      if (!normalized) {
        continue;
      }
      lines.push({
        bbox: computeBBox(normalized),
        path: encodePolyline(normalized),
      });
    }
  }
  return lines;
}

function extractColoradoReference() {
  const html = fs.readFileSync(COLORADO_REF_HTML, 'utf8');
  const cMatch = html.match(/const C = (\{[\s\S]*?\n\});/);
  const rcMatch = html.match(/const RC_TABLE = (\{[\s\S]*?\n\});/);
  const broadwayMatch = html.match(/const BROADWAY_LNG = ([^;]+);/);
  if (!cMatch || !rcMatch || !broadwayMatch) {
    throw new Error('Could not extract Colorado reference data.');
  }
  const sandbox = {};
  const script = `
    ${cMatch[0]}
    ${rcMatch[0]}
    const BROADWAY_LNG = ${broadwayMatch[1]};
    result = { C, RC_TABLE, BROADWAY_LNG };
  `;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);
  const contours = Object.entries(sandbox.result.C)
    .map(([speed, points]) => {
      const normalized = points.map(([lat, lng]) => [roundCoord(lat, 4), roundCoord(lng, 4)]);
      return {
        speed: Number(speed),
        color: DISPLAY_COLORS[Number(speed)] || '#1a4971',
        paths: [{ bbox: computeBBox(normalized), path: encodePolyline(normalized) }],
      };
    })
    .sort((a, b) => a.speed - b.speed);
  return {
    contours,
    rcTable: sandbox.result.RC_TABLE,
    broadwayLng: Number(sandbox.result.BROADWAY_LNG),
    boulderBox: [39.955, -105.32, 40.095, -105.195],
    frontRangeBox: [39.35, -106.05, 41.02, -104.88],
  };
}

async function downloadArtifacts() {
  ensureDir(OUTPUT_DIR);

  const discovery = {};
  const rawCollections = {};

  for (const [key, service] of Object.entries(SERVICES)) {
    console.log(`Discovering ${key}...`);
    discovery[key] = await fetchServiceDiscovery(service.base);
  }

  console.log('Saving layer discovery...');
  fs.writeFileSync(path.join(OUTPUT_DIR, '_layer_discovery.json'), JSON.stringify(discovery, null, 2));

  for (const [key, service] of Object.entries(SERVICES)) {
    console.log(`Downloading ${key} contours...`);
    const geojson = await downloadLayerGeoJson(service.base, 2);
    rawCollections[key] = geojson;
    fs.writeFileSync(path.join(OUTPUT_DIR, service.contourFile), JSON.stringify(geojson));
  }

  console.log('Downloading special wind regions...');
  rawCollections.specialWindRegions = await downloadLayerGeoJson(SERVICES.RC_II.base, 3);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'special_wind_regions.geojson'),
    JSON.stringify(rawCollections.specialWindRegions)
  );

  console.log('Downloading hurricane-prone region boundary...');
  rawCollections.hurricaneProneBoundary = await downloadLayerGeoJson(SERVICES.RC_II.base, 1);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'hurricane_prone_regions.geojson'),
    JSON.stringify(rawCollections.hurricaneProneBoundary)
  );

  return { rawCollections, discovery };
}

function extractRasterLayerIds(discoveryEntry) {
  const layers = discoveryEntry.layers || [];
  const conus = layers.find((layer) => layer.type === 'Raster Layer' && /conus/i.test(layer.name));
  const pr = layers.find((layer) => layer.type === 'Raster Layer' && /\bpr\b/i.test(layer.name));
  return {
    conus: conus ? conus.id : 5,
    pr: pr ? pr.id : 4,
  };
}

function buildProcessedData(rawCollections, discovery) {
  const categories = {};
  categories.RC_I = normalizeContourFeatureCollection(rawCollections.RC_I, 0.012);
  categories.RC_II = normalizeContourFeatureCollection(rawCollections.RC_II, 0.012);
  categories.RC_III_IV = normalizeContourFeatureCollection(rawCollections.RC_III_IV, 0.012);
  categories.RC_IV = normalizeContourFeatureCollection(rawCollections.RC_IV, 0.012);

  const colorado = extractColoradoReference();

  return {
    generatedAt: new Date().toISOString(),
    sources: {
      RC_I: SERVICES.RC_I.base,
      RC_II: SERVICES.RC_II.base,
      RC_III_IV: SERVICES.RC_III_IV.base,
      RC_IV: SERVICES.RC_IV.base,
      ColoradoReference: 'ColoradoReference/boulder-wind-tool.html',
    },
    colors: DISPLAY_COLORS,
    promptRcTable: PROMPT_RC_TABLE,
    serviceLayers: {
      RC_I: extractRasterLayerIds(discovery.RC_I),
      RC_II: extractRasterLayerIds(discovery.RC_II),
      RC_III_IV: extractRasterLayerIds(discovery.RC_III_IV),
      RC_IV: extractRasterLayerIds(discovery.RC_IV),
    },
    categories,
    specialWindRegions: normalizePolygonFeatureCollection(rawCollections.specialWindRegions, 0.015),
    hurricaneProneBoundary: normalizePolylineFeatureCollection(rawCollections.hurricaneProneBoundary, 0.015),
    colorado,
  };
}

function buildHtml(data) {
  const htmlData = {
    generatedAt: data.generatedAt,
    colors: data.colors,
    promptRcTable: data.promptRcTable,
    serviceBases: {
      RC_I: SERVICES.RC_I.base,
      RC_II: SERVICES.RC_II.base,
      RC_III_IV: SERVICES.RC_III_IV.base,
      RC_IV: SERVICES.RC_IV.base,
    },
    serviceLayers: data.serviceLayers,
    contours: data.categories.RC_II,
    specialWindRegions: data.specialWindRegions,
    hurricaneProneBoundary: data.hurricaneProneBoundary,
    colorado: data.colorado,
  };
  const templatePath = path.join(ROOT, 'nationwide_template.html');
  const template = fs.readFileSync(templatePath, 'utf8');
  return template
    .replace('__GENERATED_DATE__', data.generatedAt.slice(0, 10))
    .replace('__DATA__', JSON.stringify(htmlData));
}

async function main() {
  console.log('Building nationwide ASCE 7-22 wind tool...');
  const { rawCollections, discovery } = await downloadArtifacts();
  const processed = buildProcessedData(rawCollections, discovery);
  fs.writeFileSync(PROCESSED_OUTPUT, JSON.stringify(processed));
  fs.writeFileSync(HTML_OUTPUT, buildHtml(processed));
  const htmlSizeKb = (fs.statSync(HTML_OUTPUT).size / 1024).toFixed(1);
  const jsonSizeKb = (fs.statSync(PROCESSED_OUTPUT).size / 1024).toFixed(1);
  console.log(`Saved ${PROCESSED_OUTPUT} (${jsonSizeKb} KB)`);
  console.log(`Saved ${HTML_OUTPUT} (${htmlSizeKb} KB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

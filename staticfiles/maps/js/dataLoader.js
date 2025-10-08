// dataLoader.js
export async function fetchGeoJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Could not fetch GeoJSON: ' + r.status);
  return r.json();
}

export async function fetchApiJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Could not fetch API JSON: ' + r.status);
  const j = await r.json();
  return Array.isArray(j) ? j : (j.results || []);
}

// Merge API rows into geojson.features[].properties by ID (string coercion)
export function mergeApiIntoGeojson(geojson, apiRows) {
  const lookup = Object.create(null);
  for (const r of apiRows) lookup[String(r.ID)] = r;
  for (const f of (geojson.features || [])) {
    const id = String((f.properties && f.properties.ID) || '');
    if (lookup[id]) f.properties = Object.assign({}, f.properties, lookup[id]);
  }
  return geojson;
}

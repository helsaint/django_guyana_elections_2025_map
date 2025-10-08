// bboxUtils.js
export function computeBBox(geojson) {
  const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  function _update(coords) {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lng,lat] = coords;
      if (lng < bbox.minX) bbox.minX = lng;
      if (lng > bbox.maxX) bbox.maxX = lng;
      if (lat < bbox.minY) bbox.minY = lat;
      if (lat > bbox.maxY) bbox.maxY = lat;
    } else {
      for (const c of coords) _update(c);
    }
  }
  function process(obj) {
    if (!obj) return;
    const t = obj.type;
    if (t === 'FeatureCollection') for (const f of obj.features) process(f);
    else if (t === 'Feature') process(obj.geometry);
    else if (t === 'GeometryCollection') for (const g of obj.geometries) process(g);
    else if (t && obj.coordinates !== undefined) _update(obj.coordinates);
  }
  process(geojson);
  return bbox.minX === Infinity ? null : bbox;
}

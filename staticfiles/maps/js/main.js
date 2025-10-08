// main.js
import { createMap } from './mapInit.js';
import { fetchGeoJson, fetchApiJson, mergeApiIntoGeojson } from './dataLoader.js';
import { blendToWhiteHSL, buildMatchExpression, partyBaseColors } from './styleUtils.js';
import { createRegionDropdown, populateRegionOptions, createLegend } from './uiControls.js';
import { openResultPopup } from './popupChart.js';
import { computeBBox } from './bboxUtils.js';

const geojsonUrl = '/static/maps/data/all_ndcs.geojson';
const apiUrl = '/static/maps/data/sample_api.json';

(async function init() {
  const map = createMap('map');

  map.on('load', async () => {
    const geojson = await fetchGeoJson(geojsonUrl);
    const apiRows = await fetchApiJson(apiUrl);
    mergeApiIntoGeojson(geojson, apiRows);

    // add geojson source & layers
    map.addSource('myShapes', { type:'geojson', data: geojson });
    map.addLayer({ id:'myShapes-fill', type:'fill', source:'myShapes', paint:{ 'fill-color':'#e0e0e0','fill-opacity':0.8 }, filter:['==','$type','Polygon'] });
    map.addLayer({ id:'myShapes-line', type:'line', source:'myShapes', paint:{'line-color':'#333','line-width':1}, filter:['==','$type','Polygon'] });

    // compute id->color using blendToWhiteHSL
    const margins = apiRows.map(r=>Number(r.margin_pct)).filter(v=>!isNaN(v));
    const minM = margins.length?Math.min(...margins):0;
    const maxM = margins.length?Math.max(...margins):1;
    const idToColor = {};
    for (const r of apiRows) {
      const id = String(r.ID);
      const baseHex = partyBaseColors[r.winner] || '#999999';
      const raw = Number(r.margin_pct);
      const norm = isNaN(raw)?0:((raw - minM)/Math.max(1e-9,(maxM-minM)));
      const factor = 0.45 + 0.55*norm;
      idToColor[id] = blendToWhiteHSL(baseHex, factor);
    }
    const matchExpr = buildMatchExpression(idToColor,'ID','#e0e0e0');
    map.setPaintProperty('myShapes-fill','fill-color', matchExpr);

    // create UI
    const select = createRegionDropdown(document.body);
    populateRegionOptions(select, geojson);
    createLegend(document.body, partyBaseColors);

    // popup on click
    let currentPopup = null;
    const apiById = Object.fromEntries(apiRows.map(r=>[String(r.ID), r]));
    map.on('click','myShapes-fill', (e) => {
      if (!e.features||!e.features.length) return;
      const feat = e.features[0]; const props = feat.properties||{};
      const id = String(props.ID||''); const apiRow = apiById[id];
      if (currentPopup) { try { currentPopup.remove(); } catch(e) {} }
      currentPopup = openResultPopup(map, e.lngLat, props, apiRow, partyBaseColors);
    });

    // region filter (simple: setFilter)
    select.addEventListener('change', ()=> {
      const val = select.value;
      if (!val) { map.setFilter('myShapes-fill',['==','$type','Polygon']); map.setFilter('myShapes-line',['==','$type','Polygon']); }
      else {
        const polyFilter = ['all', ['==','$type','Polygon'], ['any', ['==',['get','REGION'], val], ['==',['get','region'], val]]];
        map.setFilter('myShapes-fill', polyFilter);
        map.setFilter('myShapes-line', polyFilter);
        // fit to region bounds if you want
        const regionFeatures = geojson.features.filter(f=>String((f.properties && (f.properties.REGION||f.properties.region))||'')===String(val));
        if (regionFeatures.length) {
          const rb = computeBBox({type:'FeatureCollection', features:regionFeatures});
          if (rb) map.fitBounds([[rb.minX, rb.minY],[rb.maxX, rb.maxY]],{padding:40, maxZoom:13});
        }
      }
    });

    // fit to overall bounds initially
    const bbox = computeBBox(geojson);
    if (bbox) map.fitBounds([[bbox.minX, bbox.minY],[bbox.maxX, bbox.maxY]], { padding:40, maxZoom:13 });

  }); // map.on('load')
})();


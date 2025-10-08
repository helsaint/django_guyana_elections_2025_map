// uiControls.js
import { computeBBox } from './bboxUtils.js';

export function createRegionDropdown(container=document.body) {
  if (document.getElementById('region-filter')) return document.getElementById('region-select');
  const ctrl = document.createElement('div');
  ctrl.id = 'region-filter';
  ctrl.className = 'map-control';
  ctrl.innerHTML = `<label for="region-select">Region:</label>
                    <select id="region-select"><option value="">All Regions</option></select>`;
  container.appendChild(ctrl);
  return document.getElementById('region-select');
}

export function populateRegionOptions(selectEl, geojson) {
  const set = new Set();
  for (const f of (geojson.features || [])) {
    const p = f.properties || {};
    const r = p.REGION || p.region;
    if (r !== undefined && r !== null && String(r).trim() !== '') set.add(String(r));
  }
  const regions = Array.from(set).sort((a,b) => a.localeCompare(b));
  for (const r of regions) {
    const opt = document.createElement('option'); opt.value = r; opt.textContent = r; selectEl.appendChild(opt);
  }
}

export function createLegend(container=document.body, partyBaseColors) {
  if (document.getElementById('legend')) return;
  const legend = document.createElement('div');
  legend.id = 'legend';
  legend.style.position = 'absolute';
  legend.style.top = '10px';
  legend.style.right = '10px';
  legend.style.background = 'white';
  legend.style.padding = '8px';
  legend.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
  legend.style.fontFamily = 'sans-serif';
  legend.innerHTML = '<strong>Legend</strong><br/>' +
    Object.entries(partyBaseColors).map(([p,c]) =>
      `<div style="display:flex;align-items:center;margin-top:6px"><span style="width:14px;height:14px;background:${c};display:inline-block;margin-right:8px;border:1px solid #ccc"></span>${p}</div>`
    ).join('');
  container.appendChild(legend);
}

// mapInit.js
export function createMap(container='map') {
  const map = new maplibregl.Map({
    container,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [0,0],
    zoom: 2
  });
  return map;
}
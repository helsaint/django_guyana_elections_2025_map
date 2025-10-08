// styleUtils.js
export const partyBaseColors = {
  'APNU': '#189841',
  'AFC': '#FFCF00', 
  'PPPC': '#e30613',
  'WIN': '#00A3E0',
};

// convert hex -> h,s,l
function hexToHsl(hex) {
  hex = (hex||'#999').replace('#','');
  if (hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const n = parseInt(hex,16);
  const r = ((n>>16)&255)/255, g = ((n>>8)&255)/255, b = (n&255)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0,s=0; const l=(max+min)/2;
  if (max!==min) {
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h = h*60;
  }
  return { h, s: s*100, l: l*100 };
}
function hslToHex(h,s,l){
  s/=100; l/=100;
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs((h/60)%2 - 1));
  const m = l - c/2;
  let r=0,g=0,b=0;
  if (0<=h && h<60){ r=c; g=x; b=0; }
  else if (60<=h && h<120){ r=x; g=c; b=0; }
  else if (120<=h && h<180){ r=0; g=c; b=x; }
  else if (180<=h && h<240){ r=0; g=x; b=c; }
  else if (240<=h && h<300){ r=x; g=0; b=c; }
  else { r=c; g=0; b=x; }
  const R = Math.round((r+m)*255), G = Math.round((g+m)*255), B = Math.round((b+m)*255);
  return '#' + [R,G,B].map(v=>v.toString(16).padStart(2,'0')).join('');
}

// blend toward white in HSL space to preserve hue
export function blendToWhiteHSL(hex, factor) {
  const {h,s,l} = hexToHsl(hex);
  const newL = 100 - (100 - l) * factor;
  const newS = s * factor;
  return hslToHex(h, newS, newL);
}

// Build a MapLibre 'match' expression mapping feature property 'ID' to hex color
export function buildMatchExpression(idToHex, propName='ID', defaultHex='#e0e0e0') {
  const expr = ['match', ['get', propName]];
  for (const [id, hex] of Object.entries(idToHex)) { expr.push(id, hex); }
  expr.push(defaultHex);
  return expr;
}

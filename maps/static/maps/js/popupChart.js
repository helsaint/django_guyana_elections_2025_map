// popupChart.js
export function openResultPopup(map, lngLat, props, apiRow, partyBaseColors) {
  // build counts & colors
  const v1 = apiRow && !isNaN(Number(apiRow.votes_winner)) ? Number(apiRow.votes_winner) : 0;
  const v2 = apiRow && !isNaN(Number(apiRow.votes_runnerup)) ? Number(apiRow.votes_runnerup) : 0;
  const v3 = apiRow && !isNaN(Number(apiRow.votes_third)) ? Number(apiRow.votes_third) : 0;
  const v4 = apiRow && !isNaN(Number(apiRow.votes_rest)) ? Number(apiRow.votes_rest) : 0;
  const counts = [v1,v2,v3,v4];
  const labels = [apiRow && apiRow.winner || 'First', apiRow && apiRow.second || 'Second', apiRow && apiRow.third || 'Third', 'Rest'];

  const winner = apiRow ? apiRow.winner : 'n/a';
  const winnerColor = partyBaseColors && partyBaseColors[winner] ? partyBaseColors[winner] : '#1f77b4';
  const sliceColors = [
    winnerColor,
    partyBaseColors && partyBaseColors[apiRow && apiRow.second] ? partyBaseColors[apiRow.second] : '#bbbbbb',
    partyBaseColors && partyBaseColors[apiRow && apiRow.third] ? partyBaseColors[apiRow.third] : '#999999',
    '#dddddd'
  ];

  // create html with canvas + legend placeholders
  const canvasId = 'pie_' + Math.random().toString(36).slice(2,9);
  const legendId = 'leg_' + Math.random().toString(36).slice(2,9);
  const html = `
    <div style="min-width:320px;font-family:Arial,sans-serif">
      <div style="margin-bottom:8px"><strong>${escapeHtml(props.NAME || props.name || '')}</strong></div>
      <div style="margin-bottom:6px;font-size:13px">Winner: <strong>${escapeHtml(winner)}</strong> &nbsp; Margin: ${escapeHtml(String(apiRow && apiRow.margin_pct || apiRow && apiRow.margin || 'n/a'))}%</div>
      <div style="display:flex;gap:10px;align-items:center">
        <canvas id="${canvasId}" width="120" height="120" style="width:120px;height:120px"></canvas>
        <div id="${legendId}" style="font-size:12px;line-height:1.35"></div>
      </div>
      <div style="margin-top:8px;font-size:11px;color:#666">ID: ${escapeHtml(String(props.ID || ''))}</div>
    </div>
  `;

  const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(map);

  // draw pie & legend shortly after popup added
  setTimeout(() => {
    drawPie(canvasId, counts, sliceColors);
    fillLegend(legendId, labels, counts, sliceColors);
  }, 20);

  return popup;
}

// small helpers copied here to keep module self-contained
function drawPie(canvasId, counts, colors) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height, cx = w/2, cy = h/2;
  const radius = Math.min(w,h)*0.42;
  ctx.clearRect(0,0,w,h);
  const total = counts.reduce((s,v)=>s+Math.max(0,v),0);
  if (total <= 0) {
    ctx.beginPath(); ctx.fillStyle='#e6e6e6'; ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#666'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText('No votes',cx,cy);
    return;
  }
  let start = -0.5*Math.PI;
  for (let i=0;i<counts.length;i++){
    const val = Math.max(0, counts[i]);
    const angle = (val/total) * Math.PI*2;
    const end = start + angle;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,radius,start,end); ctx.closePath(); ctx.fillStyle = colors[i]||'#ccc'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,radius,start,end); ctx.closePath(); ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1; ctx.stroke();
    start = end;
  }
  ctx.beginPath(); ctx.fillStyle='#fff'; ctx.arc(cx,cy,radius*0.52,0,Math.PI*2); ctx.fill();
}
function fillLegend(legendId, labels, counts, colors) {
  const el = document.getElementById(legendId);
  if (!el) return;
  el.innerHTML = '';
  const total = counts.reduce((s,v)=>s+Math.max(0,v),0);
  for (let i=0;i<labels.length;i++){
    const v = Math.max(0, counts[i]); 
    const row = document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.marginBottom='6px';
    const sw = document.createElement('span'); sw.style.width='12px'; sw.style.height='12px'; sw.style.display='inline-block'; sw.style.marginRight='8px'; sw.style.border='1px solid #ccc'; sw.style.background = colors[i]||'#ddd';
    const txt = document.createElement('span'); txt.textContent = `${labels[i]} — ${v}`; txt.style.fontSize='12px'; txt.style.color='#222';
    row.appendChild(sw); row.appendChild(txt); el.appendChild(row);
  }
}
function escapeHtml(s){ if (s===null||s===undefined) return ''; return String(s).replace(/[&<>"'`=\/]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;','=':'&#61;','`':'&#96;'}[c])); }

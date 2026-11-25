/* Asistente de importación de tiendas: cada cadena manda un Excel distinto.
   1) Origen  2) Estructura (hoja y fila de cabeceras)  3) Mapeo de columnas  4) Revisión y confirmación */
window.Import = (() => {
  const { esc, icon, badge, btn, kpi } = UI;
  const H = () => Views.helpers;
  const FIELDS = [
    ['code', 'Código de tienda', 'Único dentro de la cadena'], ['name', 'Nombre del centro', 'Puede servir de código si no hay'],
    ['address', 'Dirección', 'Obligatorio'], ['city', 'Municipio → Localidad', 'Se enlaza con el catálogo de localidades'], ['province', 'Provincia', ''], ['cp', 'Código postal', ''],
    ['notes', 'Observaciones', 'Se guarda como nota interna'],
  ];
  const GUESS = { code: ['codigo', 'cod', 'tiendas', 'tienda', 'centro', 'id'], name: ['nombre del centro', 'nombre', 'denominacion'], address: ['direccion', 'calle', 'domicilio'], city: ['municipio', 'localidad', 'poblacion'], province: ['provincia'], cp: ['cp', 'codigo postal'], notes: ['observaciones', 'predefinido por la cadena', 'notas'] };
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  /* Ejemplos reales (recortados) de los ficheros que envió Bancosol */
  const SAMPLES = {
    1: { file: 'Tiendas Mercadona GR2026.xlsx', sheets: { Hoja1: [
      ['Centro', 'Nombre del centro', 'Dirección', 'Municipio', 'Provincia', 'PREDEFINIDO POR LA CADENA'],
      [2007, 'CALZADA', 'C/ CALZADA, 18', 'Antequera', 'Málaga', 'ECONÓMICA (sólo €)'], [2018, 'GUTENBERG', 'C/ GUTEMBERG, 1', 'Málaga', 'Málaga', 'ECONÓMICA (sólo €)'],
      [2020, 'TORROX COSTA', 'CTRA.N340, S/N', 'Torrox', 'Málaga', 'ECONÓMICA (sólo €)'], [2054, 'CAMINO DE SUÁREZ', 'C/ CAMINO DE SUÁREZ, 22', 'Málaga', 'Málaga', 'ECONÓMICA (sólo €)'],
      [2127, 'BEL-AIR', 'AVDA. BEL- AIR, 2', 'Estepona', 'Málaga', 'ECONÓMICA (sólo €)'], [2320, 'HUELÍN', 'C/ EDUARDO MARQUINA, 10', 'Málaga', 'Málaga', 'ECONÓMICA (sólo €)'],
      [2358, 'URBANIZACIÓN LOS OLIVOS', 'C/ ALMAZARA, S/N', 'Rincón de la Victoria', 'Málaga', 'ECONÓMICA (sólo €)'], [2474, 'MÁRMOLES', 'C/ MARTÍNEZ MALDONADO, 6', 'Málaga', 'Málaga', 'ECONÓMICA (sólo €)'],
      [2688, 'PLAZA COSTA DEL SOL', 'PLAZA COSTA DEL SOL, S/N', 'Torremolinos', 'Málaga', 'ECONÓMICA (sólo €)'], [2744, 'BENALMADENA COSTA', 'AVDA. DE LAS PALMERAS, 33', 'Benalmádena', 'Málaga', 'ECONÓMICA (sólo €)'],
    ] } },
    2: { file: 'TIENDAS DIA MÁLAGA GR2026.xlsx', sheets: { Hoja1: [
      ['TIENDAS DIA'], ['Tiendas', 'Centro', 'Subcentro', 'Calle', 'Municipio', 'Provincia', 'Comunidad', 'CP', ''],
      [2125, 'Sur', 'Málaga-Jaén', 'Magistrado Salvador Barbera, 7', 'Málaga', 'Málaga', 'Andalucia', 29010, ''], [2168, 'Sur', 'Málaga-Jaén', 'Molino De Velasco. Fase 3', 'Vélez-Málaga', 'Málaga', 'Andalucia', 29700, ''],
      [2179, 'Sur', 'Málaga-Jaén', 'Pza. San Francisco, s/n', 'Antequera', 'Málaga', 'Andalucia', 29200, ''], [2419, 'Sur', 'Málaga-Jaén', 'CC. La Colonia N-340 San Pedro Alcantara', 'Marbella', 'Málaga', 'Andalucia', 29670, ''],
      [7309, 'Sur', 'Málaga-Jaén', 'Avda. de la Caceria del Rey, 12', 'Mollina', 'Málaga', 'Andalucia', 29532, 'Franquicia'], [7358, 'Sur', 'Málaga-Jaén', 'Manuel Altolaguirre, 22-24', 'Málaga', 'Málaga', 'Andalucia', 29003, ''],
      [7408, 'Sur', 'Málaga-Jaén', 'Pg. La Pasadilla. Nave 1', 'Alozaina', 'Málaga', 'Andalucia', 29567, 'Añadir'], [7522, 'Sur', 'Málaga-Jaén', 'Carreterias, 94', 'Málaga', 'Málaga', 'Andalucia', 29008, ''],
      [7537, 'Sur', 'Málaga-Jaén', '', 'Málaga', 'Málaga', 'Andalucia', '', ''],
    ] } },
  };

  const fresh = () => ({ step: 1, campaign: H().activeCampaign().id, chain: '', file: '', sheets: null, sheet: '', headerRow: 0, map: {}, codeFallback: true, saveTpl: true, markMissing: true, status: 'pending', skip: {}, rejected: {}, locChoice: {} });
  let I = fresh();
  const rows = () => I.sheets?.[I.sheet] || [];
  const headers = () => (rows()[I.headerRow] || []).map((h, i) => String(h || '').trim() || `Columna ${String.fromCharCode(65 + i)}`);
  const chainObj = () => H().chain(I.chain);

  function load(sheets, file) {
    I.sheets = sheets; I.file = file; I.sheet = Object.keys(sheets)[0];
    const tpl = DB.importTemplates[I.chain];
    I.headerRow = tpl ? tpl.headerRow : rows().findIndex(r => r.filter(c => String(c).trim()).length >= 3);
    if (I.headerRow < 0) I.headerRow = 0;
    autoMap(tpl);
    I.usedTemplate = Boolean(tpl) && Object.values(tpl.map).every(column => headers().includes(column)) && I.map.address !== '' && I.map.city !== '';
    I.step = I.usedTemplate ? 4 : 2;
  }
  function autoMap(tpl) {
    const hs = headers(), used = new Set(); I.map = {};
    FIELDS.forEach(([k]) => {
      let idx = tpl?.map[k] ? hs.indexOf(tpl.map[k]) : -1;
      if (idx < 0) for (const g of GUESS[k]) { idx = hs.findIndex((h, i) => !used.has(i) && norm(h) === g); if (idx >= 0) break; }
      if (idx >= 0) { used.add(idx); I.map[k] = idx; } else I.map[k] = '';
    });
  }
  const levenshtein = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  const knownLocality = name => DB.localities.find(l => [l.name, ...(l.aliases || [])].some(x => normName(x) === normName(name)));
  const suggestLocality = (name, cp) => DB.localities.find(l => cp && l.postal_code === String(cp)) || DB.localities.map(l => ({ l, dist: levenshtein(normName(l.name), normName(name)) })).filter(x => x.dist <= 3 || normName(x.l.name).includes(normName(name)) || normName(name).includes(normName(x.l.name))).sort((a, b) => a.dist - b.dist)[0]?.l;
  const unknownCities = rs => [...new Map(rs.filter(r => r.rec.city && !knownLocality(r.rec.city)).map(r => [normName(r.rec.city), r.rec])).values()];
  const locChoice = rec => I.locChoice[normName(rec.city)] ?? (suggestLocality(rec.city, rec.cp)?.id ?? 'new');
  const DIFF_FIELDS = [['address', 'Dirección'], ['locality', 'Localidad'], ['name', 'Nombre']];
  const diffs = (rec, st) => { if (!st) return []; const locality = knownLocality(rec.city)?.id ?? (locChoice(rec) === 'new' ? null : Number(locChoice(rec)));
    const incoming = { address: rec.address, locality, name: rec.name ? `${chainObj().name} ${rec.name}` : '' };
    return DIFF_FIELDS.filter(([k]) => incoming[k] && normName(incoming[k]) !== normName(st[k] ?? '')).map(([k, label]) => ({ k, label, before: st[k], after: incoming[k] })); };
  const showValue = (k, v) => k === 'locality' ? esc(H().loc(v)?.name || '—') : esc(v ?? '—');

  function records() {
    const cell = (r, k) => I.map[k] === '' || I.map[k] == null ? '' : String(r[I.map[k]] ?? '').trim();
    return rows().slice(I.headerRow + 1).map((r, n) => ({ n, r })).filter(({ r }) => r.some(c => String(c).trim())).map(({ n, r }) => {
      const rec = Object.fromEntries(FIELDS.map(([k]) => [k, cell(r, k)]));
      if (!rec.code && I.codeFallback && rec.name) rec.code = rec.name;
      const errors = [];
      if (!rec.address) errors.push('Sin dirección'); if (!rec.city) errors.push('Sin localidad'); if (!rec.code) errors.push(I.codeFallback ? 'Sin código ni nombre' : 'Sin código');
      const existing = DB.stores.find(s => s.chain === I.chain && rec.code && (String(s.code) === rec.code || (!s.code && normName(s.name).endsWith(normName(rec.code)))));
      return { n, rec, errors, existing, changes: diffs(rec, existing), status: errors.length ? 'Error' : existing ? 'Actualiza' : 'Nueva' };
    });
  }

  /* ---------- Vista ---------- */
  function view() {
    const steps = ['Origen', 'Estructura', 'Columnas', 'Revisión'];
    const head = `<div class="stepper">${steps.map((s, i) => `<div class="step ${I.step === i + 1 ? 'active' : I.step > i + 1 ? 'done' : ''}"><span>${I.step > i + 1 ? icon('check') : i + 1}</span>${s}</div>`).join('<i></i>')}</div>`;
    return `<div class="row" style="margin-bottom:16px">${btn('Tiendas', { kind: 'ghost', size: 'sm', icon: 'back', act: 'go', data: 'data-to="tiendas"' })}</div>
      ${UI.pageHead('Importar listado de tiendas', 'Cada cadena envía su propio formato. Indica qué columna corresponde a cada dato y guarda la plantilla para la próxima vez.')}
      ${head}<div class="fade-in">${[step1, step2, step3, step4][I.step - 1]()}</div>`;
  }
  const foot = (back, next, nextLabel = 'Continuar', ok = true) => `<div class="row" style="margin-top:20px">${back ? btn('Atrás', { icon: 'back', act: 'imp-step', data: `data-v="${I.step - 1}"` }) : ''}<span class="spacer"></span>${next ? `<button class="btn primary" data-act="${next}" ${ok ? '' : 'disabled style="opacity:.5;pointer-events:none"'}>${nextLabel}${icon('chev')}</button>` : ''}</div>`;

  function step1() {
    const camps = DB.campaigns.filter(c => c.status !== 'Finalizada');
    return `<div class="grid g-main"><div class="stack">
      <div class="card card-pad"><h2 style="margin-bottom:14px">1. ¿De qué cadena es el listado?</h2>
        <div class="grid g-3">${DB.chains.map(c => `<button class="pick ${I.chain === c.id ? 'sel' : ''}" style="margin:0;flex-direction:column;align-items:flex-start;text-align:left;background:${I.chain === c.id ? 'var(--brand-50)' : 'var(--surface)'};border-color:${I.chain === c.id ? 'var(--brand)' : 'var(--border)'}" data-act="imp-chain" data-v="${c.id}"><b>${esc(c.name)}</b>${DB.importTemplates[c.id] ? badge('Plantilla guardada', 'ok') : ''}</button>`).join('')}</div>
        ${I.chain ? `<div class="small muted" style="margin-top:12px">${icon('alert')} ${esc(chainObj().note)}</div>` : ''}</div>
      <div class="card card-pad"><h2 style="margin-bottom:14px">2. Sube el fichero recibido</h2>
        <label class="dropzone ${I.chain ? '' : 'off'}">${icon('upload')}<b>Arrastra o elige un Excel o CSV</b><span class="small muted">.xlsx, .xls o .csv · los PDF se dan de alta a mano</span><input type="file" accept=".xlsx,.xls,.csv,.pdf" data-imp="file" hidden></label>
        <div class="row wrap small" style="margin-top:12px"><span class="muted">¿Sin fichero a mano? Prueba con los ejemplos de Bancosol:</span>${btn('Mercadona GR2026', { size: 'sm', icon: 'file', act: 'imp-sample', data: 'data-v="1"' })}${btn('Dia Málaga GR2026', { size: 'sm', icon: 'file', act: 'imp-sample', data: 'data-v="2"' })}</div></div>
    </div><div class="stack"><div class="card card-pad"><h2 style="margin-bottom:12px">Campaña ${esc(H().activeCampaign().name)}</h2><div class="field"><label>Las tiendas importadas quedan como</label><select class="input" data-imp="status"><option value="pending" ${I.status === 'pending' ? 'selected' : ''}>Pendiente de confirmar</option><option value="participa" ${I.status === 'participa' ? 'selected' : ''}>Participa (se generan sus turnos)</option></select></div>
      <p class="small muted">Elige de forma explícita: no hay estado por defecto. Las nuevas toman la zona de su localidad.</p></div>
      <div class="card card-pad"><h2 style="margin-bottom:8px">¿La cadena envía un PDF?</h2><p class="small muted">Por ahora los PDF no se leen: da de alta las tiendas a mano y confirma su participación. Si alguna cadena los envía de forma habitual, se valorará convertirlos a Excel.</p>${btn('Alta manual de tienda', { icon: 'plus', act: 'new', data: 'data-entity="stores"' })}</div>${historyCard()}</div></div>`;
  }

  function step2() {
    const rs = rows().slice(0, 10), width = Math.min(10, Math.max(...rs.map(r => r.length)));
    return `<div class="card"><div class="card-head"><div><h2>¿Dónde empiezan los datos?</h2><div class="small muted">${icon('file')} ${esc(I.file)} · ${rows().length} filas. Pulsa la fila que contiene los nombres de las columnas.</div></div>
      ${Object.keys(I.sheets).length > 1 ? `<select class="input" style="width:200px" data-imp="sheet">${Object.keys(I.sheets).map(s => `<option ${s === I.sheet ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>` : badge('Hoja: ' + I.sheet, 'plain')}</div>
      <div class="table-wrap"><table class="sheet"><thead><tr><th style="width:56px">Fila</th>${Array.from({ length: width }, (_, i) => `<th>${String.fromCharCode(65 + i)}</th>`).join('')}</tr></thead><tbody>
      ${rs.map((r, i) => `<tr class="click ${i === I.headerRow ? 'hdr' : i < I.headerRow ? 'skip' : ''}" data-act="imp-header" data-v="${i}"><td><b>${i + 1}</b>${i === I.headerRow ? ' ' + badge('Cabecera', 'brand') : ''}</td>${Array.from({ length: width }, (_, c) => `<td class="small">${esc(r[c] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
      ${foot(true, 'imp-next', 'Continuar')}`;
  }

  function step3() {
    const hs = headers(), sample = rows().slice(I.headerRow + 1, I.headerRow + 6), recs = records().slice(0, 5);
    return `<div class="grid g-2"><div class="card"><div class="card-head"><div><h2>Asocia cada dato a una columna</h2><div class="small muted">Lo que Bancosol guarda ⟵ columna del Excel de ${esc(chainObj().name)}</div></div>${DB.importTemplates[I.chain] ? badge('Plantilla aplicada', 'ok') : badge('Detección automática', 'info')}</div>
      <div class="card-pad stack" style="gap:12px">${FIELDS.map(([k, l, h]) => `<div class="map-row"><div><b class="small">${l}</b><div class="small faint">${h}</div></div>${icon('back', 'faint')}<select class="input" data-imp="map" data-k="${k}"><option value="">— No viene en el fichero —</option>${hs.map((x, i) => `<option value="${i}" ${String(I.map[k]) === String(i) ? 'selected' : ''}>${String.fromCharCode(65 + i)} · ${esc(x)}</option>`).join('')}</select>
        <span class="small faint ellipsis">${I.map[k] !== '' ? esc(sample[0]?.[I.map[k]] ?? '') : ''}</span></div>`).join('')}
        <hr style="border:0;border-top:1px solid var(--border);width:100%">
        <label class="row small"><input type="checkbox" class="check" data-imp="codeFallback" ${I.codeFallback ? 'checked' : ''}>Si una tienda no tiene código, usar el nombre del centro como código</label>
        <label class="row small"><input type="checkbox" class="check" data-imp="saveTpl" ${I.saveTpl ? 'checked' : ''}>Guardar este mapeo como plantilla de ${esc(chainObj().name)}</label></div></div>
      <div class="card"><div class="card-head"><h2>Vista previa</h2><span class="small muted">Primeras ${recs.length} tiendas tal como se guardarán</span></div>
        <div class="table-wrap"><table><thead><tr><th>Código</th><th>Nombre</th><th>Dirección</th><th>Municipio</th></tr></thead><tbody>${recs.map(x => `<tr><td>${x.rec.code ? `<code>${esc(x.rec.code)}</code>` : badge('Falta', 'danger')}</td><td class="small">${esc(x.rec.name) || '<span class="faint">—</span>'}</td><td class="small">${esc(x.rec.address) || badge('Falta', 'danger')}</td><td class="small">${esc(x.rec.city)}</td></tr>`).join('')}</tbody></table></div></div></div>
      ${foot(true, 'imp-review', 'Revisar importación', I.map.address !== '' && I.map.city !== '')}`;
  }

  function step4() {
    const rs = records(), c = Views.helpers.byId(DB.campaigns, I.campaign);
    const inFile = new Set(rs.filter(r => r.existing).map(r => r.existing.id));
    const missing = DB.stores.filter(s => s.chain === I.chain && !inFile.has(s.id));
    const count = st => rs.filter(r => r.status === st).length, unknown = unknownCities(rs.filter(r => r.status !== 'Error'));
    const templateNotice = I.usedTemplate ? `<div class="card card-pad row" style="margin-bottom:16px;background:var(--ok-bg);border-color:transparent">${icon('check')}<span style="flex:1">Se ha usado la plantilla guardada de <b>${esc(chainObj().name)}</b>: las columnas ya están asociadas.</span>${btn('Cambiar columnas', { size: 'sm', act: 'imp-step', data: 'data-v="3"' })}</div>` : '';
    return `${templateNotice}<div class="grid g-4" style="margin-bottom:16px">${kpi('Tiendas nuevas', count('Nueva'), 'plus', 'se darán de alta')}${kpi('Ya existentes', count('Actualiza'), 'check', `${rs.filter(r => r.changes.length).length} con datos distintos`)}${kpi('Con errores', count('Error'), 'alert', 'no se importan')}${kpi('No vienen en el listado', missing.length, 'store', `del catálogo de ${esc(chainObj().name)}`)}</div>
      <div class="grid g-main"><div class="card"><div class="card-head"><h2>Filas del fichero</h2><span class="small muted">Desmarca las que no quieras importar</span></div>
        <div class="table-wrap" style="max-height:460px;overflow:auto"><table><thead><tr><th></th><th>Código</th><th>Tienda</th><th>Municipio</th><th>Resultado</th></tr></thead><tbody>
        ${rs.map(r => `<tr><td><input type="checkbox" class="check" data-imp="skip" data-n="${r.n}" ${r.status === 'Error' ? 'disabled' : I.skip[r.n] ? '' : 'checked'}></td><td><code>${esc(r.rec.code)}</code></td><td><b class="small">${esc(r.rec.name || r.rec.address)}</b><div class="small faint">${esc(r.rec.address)}</div></td><td class="small">${esc(r.rec.city)}${r.rec.city && !knownLocality(r.rec.city) ? ' ' + badge('Por revisar', 'warn') : ''}</td>
          <td>${r.status === 'Error' ? badge(r.errors.join(', '), 'danger') : r.status === 'Nueva' ? badge('Nueva', 'info') : r.changes.length ? badge(`${r.changes.length} cambios`, 'warn') : badge('Sin cambios', 'ok')}
            ${r.status !== 'Error' && r.changes.length ? `<div class="stack" style="gap:4px;margin-top:6px">${r.changes.map(x => `<label class="row small"><input type="checkbox" class="check" data-imp="diff" data-key="${r.n}:${x.k}" ${I.rejected[`${r.n}:${x.k}`] ? '' : 'checked'}><span>${x.label}: <s class="faint">${showValue(x.k, x.before)}</s> → <b>${showValue(x.k, x.after)}</b></span></label>`).join('')}</div>` : ''}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="stack">${unknown.length ? `<div class="card"><div class="card-head"><div><h2>Localidades por revisar</h2><div class="small muted">No coinciden con el catálogo. Elige la localidad correcta o créala; la forma escrita se recordará para la próxima vez.</div></div></div>
        ${unknown.map(rec => { const sug = suggestLocality(rec.city, rec.cp), v = String(locChoice(rec)); return `<div class="list-item"><div style="flex:1"><b class="small">«${esc(rec.city)}»</b><div class="small muted">${sug ? `Sugerencia: ${esc(sug.name)}` : 'Sin coincidencias'}</div></div>
          <select class="input inline" data-imp="loc" data-city="${esc(normName(rec.city))}"><option value="new" ${v === 'new' ? 'selected' : ''}>Crear «${esc(rec.city)}»</option>${DB.localities.map(l => `<option value="${l.id}" ${v === String(l.id) ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></div>`; }).join('')}</div>` : ''}
        <div class="card"><div class="card-head"><div><h2>No vienen en el listado</h2><div class="small muted">Están en el catálogo pero la cadena no las incluye</div></div></div>
        ${missing.length ? missing.map(s => `<div class="list-item"><span class="dot" style="background:var(--text-3)"></span><div style="flex:1"><b class="small">${esc(s.name)}</b><div class="small muted">${esc(s.code || 'Sin código')} · ${esc(H().loc(s.locality)?.name)}</div></div></div>`).join('') + `<label class="row small" style="padding:12px 20px"><input type="checkbox" class="check" data-imp="markMissing" ${I.markMissing ? 'checked' : ''}>Marcarlas como «No participa» en ${esc(c.code)}</label>` : '<div class="card-pad small muted">Todas las tiendas del catálogo vienen en el fichero.</div>'}</div>
      <div class="card card-pad small muted">Al confirmar, las tiendas seleccionadas quedan como <b>Participa</b> en ${esc(c.name)} y se generan sus turnos de mañana y tarde para los días de campaña.</div></div></div>
      ${foot(true, 'imp-confirm', `Importar ${rs.filter(r => r.status !== 'Error' && !I.skip[r.n]).length} tiendas`)}`;
  }

  /* ---------- Acciones ---------- */
  const normName = x => norm(x).replace(/[^a-z0-9]/g, '');
  const findLocality = (rec, entry) => { if (!rec.city) return null; const known = knownLocality(rec.city); if (known) return known.id;
    const choice = locChoice(rec);
    if (choice !== 'new') { const l = H().byId(DB.localities, choice); (l.aliases ||= []).push(rec.city); entry.aliases.push([l.id, rec.city]); return l.id; }
    const l = { id: Math.max(...DB.localities.map(x => x.id)) + 1, name: rec.city.toLowerCase().replace(/(^|[\s-])\p{L}/gu, c => c.toUpperCase()), postal_code: String(rec.cp || ''), zone: null, aliases: [] };
    DB.localities.push(l); entry.localities.push(l.id); return l.id; };
  function confirmImport(render, go) {
    const c = H().byId(DB.campaigns, I.campaign), rs = records().filter(r => r.status !== 'Error' && !I.skip[r.n]);
    const hs = headers(); let added = 0;
    const entry = { id: DB.importHistory.length + 1, chain: I.chain, campaign: c.id, file: I.file, by: 1, date: '2026-11-12', rows: rs.length, created: [], updated: [], participation: { ...c.participation }, reasons: { ...c.reasons }, sources: c.sources.slice(), shifts: DB.shifts.map(s => s.id), localities: [], aliases: [], undone: false };
    rs.forEach(({ rec, existing }) => {
      let st = existing;
      const locality = findLocality(rec, entry);
      if (!st) {
        let name = rec.name ? `${chainObj().name} ${rec.name}` : `${chainObj().name} ${rec.address}`;
        if (DB.stores.some(s => s.name.toLowerCase() === name.toLowerCase())) name += ` (${rec.code})`;
        st = { id: Math.max(...DB.stores.map(s => s.id)) + 1, chain: I.chain, code: rec.code, name, address: rec.address, locality, zone: H().byId(DB.localities, locality)?.zone ?? null, checkout_shelfs: 1 };
        DB.stores.push(st); entry.created.push(st.id); [1, 2, 3, 4, 5, 6].forEach(d => DB.schedules.push({ store: st.id, week_day: d, open: chainObj().open, close: chainObj().close })); added++;
      } else { const accepted = diffs(rec, st).filter(x => !I.rejected[`${rs.find(r => r.existing === st).n}:${x.k}`]);
        if (accepted.length) { entry.updated.push({ id: st.id, before: Object.fromEntries(accepted.map(x => [x.k, st[x.k]])) }); accepted.forEach(x => { st[x.k] = x.k === 'locality' ? locality : x.after; }); } }
      if (I.status === 'participa' && c.participation[st.id] !== true) {
        c.participation[st.id] = true;
        const h = DB.schedules.find(x => x.store === st.id) || { open: '09:00', close: '21:30' };
        if (!DB.shifts.some(s => s.campaign === c.id && s.store === st.id)) c.days.forEach(date => [['Mañana', h.open, DB.settings.morningEnd], ['Tarde', DB.settings.afternoonStart, h.close]].forEach(([slot, start, end]) =>
          DB.shifts.push({ id: Math.max(...DB.shifts.map(s => s.id)) + 1, campaign: c.id, store: st.id, date, slot, start, end, capacity: st.checkout_shelfs === 2 ? +DB.settings.twoLinesCapacity : +DB.settings.baseCapacity, notes: '', assignments: [] })));
      }
    });
    if (I.markMissing) { const ids = new Set(rs.map(r => r.existing?.id)); DB.stores.filter(s => s.chain === I.chain && !ids.has(s.id) && !rs.some(r => r.rec.code === s.code)).forEach(s => { c.participation[s.id] = false; }); }
    if (I.saveTpl) DB.importTemplates[I.chain] = { headerRow: I.headerRow, map: Object.fromEntries(Object.entries(I.map).filter(([, v]) => v !== '').map(([k, v]) => [k, hs[v]])) };
    c.sources = c.sources.filter(s => s.chain !== I.chain).concat({ chain: I.chain, file: I.file, date: '2026-11-12', rows: rs.length });
    DB.importHistory.push(entry);
    DB.activity.unshift({ who: 1, text: `importó ${rs.length} tiendas de {chain} (${added} nuevas)`, refs: { chain: I.chain }, when: 'Ahora' });
    UI.toast(`${rs.length} tiendas de ${esc(chainObj().name)} confirmadas · ${added} nuevas${entry.localities.length ? ` · ${entry.localities.length} localidades creadas` : ''}${entry.updated.length ? ` · ${entry.updated.length} actualizadas` : ''}`);
    I = fresh(); go('tiendas/catalogo');
  }

  function undoImport(id, render) { const e = DB.importHistory.find(x => x.id === Number(id)), c = H().byId(DB.campaigns, e.campaign), keepShifts = new Set(e.shifts);
    DB.shifts.splice(0, DB.shifts.length, ...DB.shifts.filter(s => keepShifts.has(s.id)));
    DB.stores.splice(0, DB.stores.length, ...DB.stores.filter(s => !e.created.includes(s.id)));
    DB.schedules.splice(0, DB.schedules.length, ...DB.schedules.filter(h => !e.created.includes(h.store)));
    e.updated.forEach(u => Object.assign(H().byId(DB.stores, u.id), u.before));
    e.aliases.forEach(([lid, alias]) => { const l = H().byId(DB.localities, lid); l.aliases = l.aliases.filter(a => a !== alias); });
    DB.localities.splice(0, DB.localities.length, ...DB.localities.filter(l => !e.localities.includes(l.id)));
    Object.assign(c, { participation: e.participation, reasons: e.reasons, sources: e.sources }); e.undone = true;
    render(); UI.toast(`Importación de ${esc(H().chain(e.chain).name)} deshecha`); }
  const lastUndoable = () => { const seen = new Set(); return DB.importHistory.slice().reverse().filter(e => { if (seen.has(e.chain)) return false; seen.add(e.chain); return !e.undone; }).map(e => e.id); };
  const historyCard = () => { const undoable = lastUndoable(); return `<div class="card"><div class="card-head"><h2>Historial de importaciones</h2></div>${DB.importHistory.length ? DB.importHistory.slice().reverse().map(e => `<div class="list-item"><div style="flex:1"><b class="small">${esc(H().chain(e.chain).name)} · ${esc(e.file)}</b><div class="small muted">${H().R.user(e.by)} · ${UI.fmtDate(e.date)} · ${e.rows} filas · ${e.created.length} nuevas</div></div>
      ${e.undone ? badge('Deshecha') : undoable.includes(e.id) ? btn('Deshacer', { size: 'sm', icon: 'back', act: 'imp-undo', data: `data-v="${e.id}"` }) : ''}</div>`).join('') : '<div class="card-pad small muted">Aún no hay importaciones en esta sesión.</div>'}<div class="card-pad small faint" style="padding-top:0">Solo se puede deshacer la última importación de cada cadena.</div></div>`; };

  const actions = (render, go) => ({
    'imp-undo': d => UI.confirm('Deshacer importación', 'Se borran las tiendas creadas, se restauran los datos cambiados y la participación anterior.', () => { UI.close(); undoImport(d.v, render); }, 'Deshacer'),
    'imp-chain': d => { I.chain = Number(d.v); render(); },
    'imp-sample': d => { I.chain = Number(d.v); load(JSON.parse(JSON.stringify(SAMPLES[d.v].sheets)), SAMPLES[d.v].file); render(); },
    'imp-step': d => { I.step = Number(d.v); render(); },
    'imp-header': d => { I.headerRow = Number(d.v); autoMap(); render(); },
    'imp-next': () => { I.step = 3; render(); },
    'imp-review': () => { I.step = 4; render(); },
    'imp-confirm': () => confirmImport(render, go),
  });

  function onChange(el, render) {
    const k = el.dataset.imp;
    if (k === 'file') {
      const f = el.files[0]; if (!f) return;
      if (/\.pdf$/i.test(f.name)) return UI.toast('Los PDF no se leen automáticamente: usa el alta manual y confirma las tiendas.');
      const rd = new FileReader();
      rd.onload = () => {
        try {
          let sheets;
          if (/\.csv$/i.test(f.name)) { const txt = new TextDecoder().decode(rd.result); const sep = txt.split(';').length > txt.split(',').length ? ';' : ','; sheets = { CSV: txt.split(/\r?\n/).map(l => l.split(sep)) }; }
          else if (window.XLSX) { const wb = XLSX.read(rd.result); sheets = Object.fromEntries(wb.SheetNames.map(n => [n, XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: '' })])); }
          else return UI.toast('No se pudo cargar el lector de Excel (requiere conexión). Prueba con un CSV o con los ejemplos.');
          load(sheets, f.name); render();
        } catch (e) { UI.toast('No se pudo leer el fichero: ' + esc(e.message)); }
      };
      rd.readAsArrayBuffer(f); return;
    }
    if (k === 'status') I.status = el.value;
    else if (k === 'sheet') { I.sheet = el.value; I.headerRow = 0; autoMap(); }
    else if (k === 'map') I.map[el.dataset.k] = el.value === '' ? '' : Number(el.value);
    else if (k === 'skip') I.skip[el.dataset.n] = !el.checked;
    else if (k === 'diff') I.rejected[el.dataset.key] = !el.checked;
    else if (k === 'loc') I.locChoice[el.dataset.city] = el.value === 'new' ? 'new' : Number(el.value);
    else I[k] = el.checked;
    render();
  }
  return { view, actions, onChange, reset: () => { I = fresh(); } };
})();

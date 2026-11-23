/* Asistente de creación de campañas:
   1) Datos y copia  2) Días  3) Colaboradores  4) Tiendas  5) Coordinación (opcional)  6) Resumen */
window.CampaignWizard = (() => {
  const { esc, icon, btn, badge } = UI;
  const H = () => Views.helpers;
  const STEPS = ['Datos', 'Días', 'Colaboradores', 'Tiendas', 'Coordinación (opcional)', 'Resumen'];
  const STATE_LABEL = { participa: 'Participa', pending: 'Pendiente', no: 'No participa' };
  const QUESTIONS = ['¿Cómo se llama la campaña y cuándo es?', '¿Qué días se recoge en las tiendas?', '¿Qué entidades colaboran?', '¿Qué tiendas participan?', '¿Quién coordina cada zona?', 'Revisa los datos antes de crear la campaña'];
  const isIn = e => e.state !== 'no';
  const fresh = () => ({ step: 1, data: { name: '', type: 1, code: '', start: '', end: '', copyFrom: '', copy: ['zones', 'collabs', 'stores'] }, days: [], zones: {}, collabs: [], stores: [], importing: false });
  let W = fresh();

  const datesBetween = (start, end) => { const out = []; if (!start || !end) return out; for (let d = new Date(start + 'T12:00'); d <= new Date(end + 'T12:00'); d.setDate(d.getDate() + 1)) out.push(d.toISOString().slice(0, 10)); return out; };
  const weekendDays = dates => dates.filter(d => [5, 6].includes(new Date(d + 'T12:00').getDay()));
  const fmt = d => new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const source = () => H().byId(DB.campaigns, Number(W.data.copyFrom));
  const copies = kind => source() && W.data.copy.includes(kind);
  const field = (label, html, full = '') => `<div class="field ${full}"><label>${label}</label>${html}</div>`;
  const check = (name, value, checked, label, sub = '') => `<label class="list-item" style="cursor:pointer"><input type="checkbox" class="check" name="${name}" value="${value}" ${checked ? 'checked' : ''}><div style="flex:1"><b class="small">${label}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</div></label>`;
  const hint = text => `<p class="small muted" style="margin-top:0">${text}</p>`;
  const form = () => document.getElementById('cw-form');
  const search = placeholder => `<input class="input" data-cw-filter placeholder="${placeholder}" style="margin-bottom:12px">`;

  const stepData = () => { const d = W.data;
    return `<div class="form-grid">${field('Nombre', `<input class="input" name="name" required value="${esc(d.name)}" placeholder="Ej. Gran Recogida 2027">`, 'full')}
      ${field('Tipo de campaña', `<select class="input" name="type">${DB.campaignTypes.map(t => `<option value="${t.id}" ${t.id === Number(d.type) ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>`)}
      ${field('Código', `<input class="input" name="code" value="${esc(d.code)}" placeholder="GR2027">`)}
      ${field('Fecha de inicio', `<input class="input" type="date" name="start" required value="${d.start}">`)}
      ${field('Fecha de fin', `<input class="input" type="date" name="end" required value="${d.end}">`)}
      ${field('Copiar de una campaña anterior (opcional)', `<select class="input" name="copyFrom"><option value="">No copiar: empezar desde cero</option>${DB.campaigns.map(c => `<option value="${c.id}" ${String(c.id) === String(d.copyFrom) ? 'selected' : ''}>${esc(c.name)} (${esc(c.code)})</option>`).join('')}</select>`, 'full')}
      ${d.copyFrom ? `<div class="field full"><label>Qué copiar</label>${check('copy', 'zones', d.copy.includes('zones'), 'Coordinación por zona')}${check('copy', 'collabs', d.copy.includes('collabs'), 'Colaboradores participantes')}${check('copy', 'stores', d.copy.includes('stores'), 'Tiendas participantes')}</div>` : ''}</div>`; };

  const stepDays = () => `${hint('Marcados por defecto los viernes y sábados de la semana. Las excepciones por cadena se añaden después en la ficha.')}
    <div class="cw-scroll">${datesBetween(W.data.start, W.data.end).map(d => check('day', d, W.days.includes(d), fmt(d))).join('')}</div>`;

  const stepCollabs = () => `${hint(`${copies('collabs') ? `Marcados los que participaron en ${esc(source().code)}. ` : ''}Solo aparecen colaboradores validados. Entran como «Pendiente»: coordinación confirma si participan o no.`)}
    ${search('Buscar colaborador…')}<div class="cw-scroll">${DB.collabs.filter(c => c.status === 'Validado').map(c => check('collab', c.id, W.collabs.includes(c.id), esc(c.name), esc(c.type))).join('')}</div>`;

  const storeName = e => e.store ? H().byId(DB.stores, e.store).name : `${H().chain(e.chain).name} ${e.rec.name || e.rec.address}`;
  const storeMeta = e => { const st = e.store && H().byId(DB.stores, e.store), locality = st ? st.locality : e.locality;
    return `${esc(H().chain(st ? st.chain : e.chain)?.name || '')} · ${locality ? esc(H().loc(locality).name) : `${esc(e.rec.city)} ${badge('Localidad por revisar', 'warn')}`}`; };
  const originBadge = { copy: badge('De la campaña anterior', 'plain'), csv: badge('Del listado subido', 'info'), manual: badge('Añadida a mano', 'plain') };
  const stateChoice = (name, value) => `<div class="seg cw-seg">${Object.entries(STATE_LABEL).map(([v, l]) => `<label class="${v}"><input type="radio" name="${name}" value="${v}" ${value === v ? 'checked' : ''} hidden>${l}</label>`).join('')}</div>`;

  const stepStores = () => { const src = source(), chosen = new Set(W.stores.filter(e => e.store).map(e => e.store));
    const available = DB.stores.filter(s => !s.archived && !chosen.has(s.id)), count = st => W.stores.filter(e => !st || e.state === st).length;
    const filter = W.storeFilter || '', shown = W.stores.map((e, i) => [e, i]).filter(([e]) => !filter || e.state === filter);
    const chip = (v, label) => `<button type="button" class="btn ${filter === v ? 'primary' : ''}" data-act="cw-store-filter" data-v="${v}">${label} (${count(v)})</button>`;
    return `${hint(copies('stores') ? `Ya están las tiendas que participaron en ${esc(src.code)}. Indica en cada una si participa en esta campaña.` : 'Sube el listado que te ha enviado cada cadena o añade las tiendas una a una.')}
      <div class="row wrap" style="gap:12px">${btn('Subir listado de tiendas (Excel)', { kind: 'primary', icon: 'upload', act: 'cw-import' })}<span class="spacer"></span>
        <div style="position:relative;width:340px"><input class="input" data-cw-store-search autocomplete="off" placeholder="Añadir tienda: escribe su nombre…" style="width:100%">
          <div class="cw-suggest" hidden></div></div></div>
      ${W.stores.length ? `<div class="row wrap" style="gap:8px">${chip('', 'Todas')}${chip('participa', 'Participan')}${chip('pending', 'Pendientes')}${chip('no', 'No participan')}<span class="spacer"></span>
          <span class="small muted">Marcar ${filter ? 'las mostradas' : 'todas'} como:</span>${Object.entries(STATE_LABEL).map(([v, l]) => btn(l, { size: 'sm', act: 'cw-store-all', data: `data-v="${v}"` })).join('')}</div>
        ${search('Buscar por tienda, cadena o localidad…')}<div class="cw-scroll">${shown.map(([e, i]) => `<div class="list-item">
          <div style="flex:1"><b class="small">${esc(storeName(e))}</b> ${originBadge[e.origin]}<div class="small muted">${storeMeta(e)}</div></div>${stateChoice(`store-state-${i}`, e.state)}</div>`).join('') || '<div class="card-pad small muted">No hay tiendas con este estado.</div>'}</div>`
        : `<div class="card card-pad small muted" style="text-align:center">Todavía no hay tiendas en esta campaña.</div>`}`; };

  const coordinators = () => DB.users.filter(u => u.role === 'coord');
  const zonesOf = userId => DB.zones.filter(z => (W.zones[z.id] || []).includes(userId));
  const stepZones = () => { const free = DB.zones.filter(z => !(W.zones[z.id] || []).length);
    const intro = copies('zones') ? `Copiada la coordinación de ${esc(source().code)}: normalmente solo cambia una o dos personas.` : 'Puedes saltar este paso y asignar la coordinación más tarde desde la ficha de la campaña.';
    const freeBox = free.length ? `<div class="card card-pad" style="background:var(--warn-bg);border-color:transparent"><div class="row wrap" style="gap:8px">${icon('alert')}<b class="small">${free.length === 1 ? 'Una zona no tiene' : `${free.length} zonas no tienen`} coordinador:</b>${free.map(z => `<span class="chip" style="padding-right:10px;background:var(--surface)">${esc(z.name)}</span>`).join('')}</div></div>`
      : `<div class="card card-pad small" style="background:var(--ok-bg);border-color:transparent;color:var(--ok)">${icon('check')} Todas las zonas tienen coordinador.</div>`;
    const card = u => { const zones = zonesOf(u.id);
      return `<div class="list-item" data-name="${esc([u.name, ...zones.map(z => z.name)].join(' ').toLowerCase())}">${UI.avatar(u.name)}
        <div style="flex:1"><b>${esc(u.name)}</b> <span class="small muted">· ${zones.length === 1 ? '1 zona' : `${zones.length} zonas`}</span>
          <div class="row wrap" style="gap:6px;margin-top:6px">${zones.length ? zones.map(z => `<span class="chip">${esc(z.name)}<button type="button" title="Quitar ${esc(z.name)}" data-act="cw-zone-del" data-z="${z.id}" data-u="${u.id}">${icon('x')}</button></span>`).join('') : '<span class="small muted">Sin zonas en esta campaña</span>'}</div></div>
        ${btn('Añadir o quitar zonas', { icon: 'plus', act: 'cw-zone-pick', data: `data-u="${u.id}"` })}</div>`; };
    return `${hint(`${intro} Una zona puede tener varios coordinadores.`)}${freeBox}
      ${search('Buscar coordinador o zona…')}<div class="cw-scroll">${coordinators().map(card).join('')}</div>`; };

  const zonePicker = userId => { const user = H().byId(DB.users, userId), others = z => (W.zones[z.id] || []).filter(id => id !== userId).map(id => H().byId(DB.users, id).name);
    UI.modal(`Zonas de ${user.name}`, `<input class="input" data-cw-pick-filter placeholder="Buscar zona…" style="margin-bottom:12px"><div class="cw-scroll" style="max-height:50vh" id="cw-pick">
      ${DB.zones.map(z => `<label class="list-item" style="cursor:pointer" data-name="${esc(z.name.toLowerCase())}"><input type="checkbox" class="check" value="${z.id}" ${(W.zones[z.id] || []).includes(userId) ? 'checked' : ''}>
        <div style="flex:1"><b class="small">${esc(z.name)}</b><div class="small muted">${others(z).length ? `También la coordina ${esc(others(z).join(', '))}` : (W.zones[z.id] || []).length ? '' : 'Sin coordinador'}</div></div></label>`).join('')}</div>`,
      `${btn('Cancelar', { act: 'close' })}${btn('Guardar', { kind: 'primary', icon: 'check', act: 'cw-zone-save', data: `data-u="${userId}"` })}`); };

  const stepSummary = () => { const free = DB.zones.filter(z => !(W.zones[z.id] || []).length), on = W.stores.filter(isIn);
    const participa = on.filter(e => e.state === 'participa').length, pending = on.length - participa, created = on.filter(e => !e.store).length;
    const warn = t => `<div class="list-item">${icon('alert')}<span class="small">${t}</span></div>`, long = { day: 'numeric', month: 'long', year: 'numeric' };
    const edit = step => `<td style="text-align:right">${btn('Cambiar', { kind: 'ghost', size: 'sm', act: 'cw-goto', data: `data-step="${step}"` })}</td>`;
    return `<div class="table-wrap"><table><tbody>
      <tr><td>Nombre</td><td><b>${esc(W.data.name)}</b> ${esc(W.data.code)}</td>${edit(1)}</tr><tr><td>Fechas</td><td>Del ${UI.fmtDate(W.data.start, long)} al ${UI.fmtDate(W.data.end, long)} · ${W.days.length} días con voluntarios en tienda</td>${edit(2)}</tr>
      <tr><td>Colaboradores</td><td>${W.collabs.length} (entran como «Pendiente»)</td>${edit(3)}</tr><tr><td>Tiendas</td><td>${participa} participan${pending ? ` · ${pending} pendientes` : ""}${created ? ` · ${created} nuevas del listado subido` : ''}</td>${edit(4)}</tr>
      <tr><td>Coordinación</td><td>${DB.zones.length - free.length} de ${DB.zones.length} zonas con coordinador</td>${edit(5)}</tr></tbody></table></div>
      <div class="stack" style="margin-top:12px">${free.length ? warn(`${free.length} zonas sin coordinador: ${free.map(z => esc(z.name)).join(', ')}`) : ''}${pending ? warn(`${pending} tiendas quedan pendientes de confirmar participación`) : ''}${on.length ? '' : warn('La campaña se crea sin tiendas')}</div>
      <div class="card card-pad small muted" style="margin-top:16px;background:var(--info-bg);border-color:transparent">${icon('alert')} La campaña se crea como <b>Planificada</b>. Se activa desde su ficha.</div>`; };

  const fitLists = () => { const list = document.querySelector('.cw-scroll'); if (!list) return; list.style.maxHeight = 'none';
    const overflow = document.documentElement.scrollHeight - window.innerHeight; if (overflow > 0) list.style.maxHeight = `${Math.max(160, list.clientHeight - overflow - 4)}px`; };
  window.addEventListener('resize', fitLists);
  const view = () => { if (W.importing) return Import.view(); requestAnimationFrame(fitLists); const body = [stepData, stepDays, stepCollabs, stepStores, stepZones, stepSummary][W.step - 1]();
    const assigned = Object.values(W.zones).some(l => l.length);
    return `<div class="row" style="margin-bottom:16px">${btn('Campañas', { kind: 'ghost', size: 'sm', icon: 'back', act: 'cw-cancel' })}</div>
      ${UI.pageHead('Nueva campaña')}
      <div class="stepper">${STEPS.map((s, i) => `<div class="step ${W.step === i + 1 ? 'active' : W.step > i + 1 ? 'done' : ''}"><span>${W.step > i + 1 ? icon('check') : i + 1}</span>${s}</div>`).join('<i></i>')}</div>
      <div class="card card-pad" style="margin-top:16px"><form id="cw-form" class="stack" onsubmit="return false"><div><div class="small muted">Paso ${W.step} de ${STEPS.length}</div><h2 style="margin:2px 0 0">${QUESTIONS[W.step - 1]}</h2></div>${body}</form></div>
      <div class="row" style="margin-top:16px">${W.step > 1 ? btn('Anterior', { icon: 'back', act: 'cw-back' }) : btn('Rellenar con datos de ejemplo', { kind: 'ghost', act: 'cw-demo' })}<span class="spacer"></span>
        ${W.step === 5 && !assigned ? btn('Saltar', { kind: 'ghost', act: 'cw-next' }) : ''}${W.step < STEPS.length ? btn(`Siguiente: ${STEPS[W.step].replace(' (opcional)', '')}`, { kind: 'primary', act: 'cw-next' }) : btn('Crear campaña', { kind: 'primary', icon: 'check', act: 'cw-finish' })}</div>`; };

  const readStep = () => { const f = form(); if (!f) return; const fd = new FormData(f);
    if (W.step === 1) { const prevCopy = `${W.data.copyFrom}|${W.data.start}|${W.data.end}|${W.data.copy}`;
      Object.assign(W.data, { name: fd.get('name'), type: Number(fd.get('type')), code: fd.get('code'), start: fd.get('start'), end: fd.get('end'), copyFrom: fd.get('copyFrom') });
      if (fd.get('copyFrom')) W.data.copy = f.querySelector('[name=copy]') ? fd.getAll('copy') : W.data.copy;
      if (prevCopy !== `${W.data.copyFrom}|${W.data.start}|${W.data.end}|${W.data.copy}`) applyDefaults(); }
    if (W.step === 2) W.days = fd.getAll('day');
    if (W.step === 3) W.collabs = fd.getAll('collab').map(Number);
    if (W.step === 4) {
      W.stores.forEach((e, i) => { e.state = fd.get(`store-state-${i}`) || e.state; });
    } };

  const applyDefaults = () => { const src = source();
    W.days = weekendDays(datesBetween(W.data.start, W.data.end));
    W.zones = {}; if (copies('zones')) DB.zoneAssignments.filter(z => z.campaign === src.id).forEach(z => (W.zones[z.zone] ||= []).push(z.user));
    W.collabs = copies('collabs') ? DB.collabParticipation.filter(p => p.campaign === src.id).map(p => p.collab) : [];
    W.stores = W.stores.filter(e => e.origin !== 'copy');
    if (copies('stores')) Object.entries(src.participation).filter(([, v]) => v === true).forEach(([id]) => { if (!W.stores.some(e => e.store === Number(id))) W.stores.push({ store: Number(id), state: 'participa', origin: 'copy' }); }); };

  const addImported = records => { let added = 0;
    records.forEach(r => { const known = r.existing ? W.stores.find(e => e.store === r.existing) : W.stores.find(e => !e.store && e.chain === r.chain && e.rec.code === r.rec.code);
      if (!known) { W.stores.push(r.existing ? { store: r.existing, state: r.state, origin: 'csv' } : { chain: r.chain, rec: r.rec, locality: r.locality, state: r.state, origin: 'csv' }); added++; } });
    return { total: records.length, added }; };

  const createStore = e => { const id = Math.max(...DB.stores.map(s => s.id)) + 1, ch = H().chain(e.chain);
    DB.stores.push({ id, chain: e.chain, code: e.rec.code, name: storeName(e), address: e.rec.address, locality: e.locality, zone: H().byId(DB.localities, e.locality)?.zone ?? null, checkout_shelfs: 1 });
    [1, 2, 3, 4, 5, 6].forEach(d => DB.schedules.push({ store: id, week_day: d, open: ch.open, close: ch.close })); return id; };

  const create = () => { const id = Math.max(0, ...DB.campaigns.map(c => c.id)) + 1, src = source(), participation = {};
    W.stores.filter(isIn).forEach(e => { const storeId = e.store || createStore(e); if (e.state === 'participa') participation[storeId] = true; });
    DB.campaigns.push({ id, type: W.data.type, code: W.data.code, name: W.data.name, start: W.data.start, end: W.data.end, days: [...W.days].sort(), exceptions: [], status: 'Planificada', participation, reasons: {}, sources: [] });
    Object.entries(W.zones).forEach(([zone, users]) => users.forEach(user => DB.zoneAssignments.push({ campaign: id, zone: Number(zone), user })));
    let pid = Math.max(0, ...DB.collabParticipation.map(p => p.id));
    W.collabs.forEach(collab => { const prev = src && DB.collabParticipation.find(p => p.collab === collab && p.campaign === src.id); DB.collabParticipation.push({ id: ++pid, collab, campaign: id, coords: [...(prev?.coords || [])], stores: [...(prev?.stores || [])], status: 'Pendiente' }); });
    return id; };

  const setZone = (zone, user, on) => { const list = W.zones[zone] ||= []; if (on && !list.includes(user)) list.push(user); if (!on && list.includes(user)) list.splice(list.indexOf(user), 1); };
  const filterZones = () => { const q = (document.querySelector('[data-cw-filter]')?.value || '').toLowerCase().trim(), onlyFree = document.querySelector('[data-cw-free]')?.checked;
    document.querySelectorAll('.cw-scroll > *').forEach(row => { row.style.display = (!q || (row.dataset.name ?? row.textContent.toLowerCase()).includes(q))  ? '' : 'none'; }); };

  let renderRef = null, toastRef = null;
  const suggestStores = input => { const box = input.nextElementSibling, q = input.value.trim().toLowerCase(), chosen = new Set(W.stores.map(e => e.store));
    const hits = q ? DB.stores.filter(st => !st.archived && !chosen.has(st.id) && `${st.name} ${H().loc(st.locality)?.name || ''}`.toLowerCase().includes(q)).slice(0, 8) : [];
    box.hidden = !q; box.innerHTML = hits.length ? hits.map(st => `<button type="button" data-act="cw-add-store" data-id="${st.id}">${icon('plus')}<span><b>${esc(st.name)}</b><span class="muted"> · ${esc(H().loc(st.locality)?.name || '')}</span></span></button>`).join('') : '<div class="small muted" style="padding:10px 12px">No hay tiendas con ese nombre fuera de la campaña.</div>'; };
  document.addEventListener('click', e => { if (!e.target.closest('.cw-suggest, [data-cw-store-search]')) document.querySelectorAll('.cw-suggest').forEach(box => { box.hidden = true; }); });
  document.addEventListener('input', e => { if (e.target.matches('[data-cw-filter]')) filterZones();
    if (e.target.matches('[data-cw-pick-filter]')) { const q = e.target.value.toLowerCase().trim(); document.querySelectorAll('#cw-pick > *').forEach(row => { row.style.display = !q || row.dataset.name.includes(q) ? '' : 'none'; }); } if (e.target.matches('[data-cw-store-search]')) suggestStores(e.target); });
  document.addEventListener('change', e => { if (!e.target.closest('#cw-form')) return;
    readStep(); if (W.step === 1 && ['copyFrom', 'copy'].includes(e.target.name)) renderRef(); if (W.step === 4 && e.target.name.startsWith('store')) renderRef(); });

  const actions = (render, go, toast) => { renderRef = render; toastRef = toast; return {
    'cw-demo': () => { Object.assign(W.data, { name: 'Gran Recogida 2027', type: 1, code: 'GR2027', start: '2027-11-15', end: '2027-11-21', copyFrom: '1', copy: ['zones', 'collabs', 'stores'] }); applyDefaults(); render(); },
    'cw-cancel': () => { W = fresh(); go('campanas'); },
    'cw-back': () => { readStep(); W.step--; render(); },
    'cw-goto': d => { W.step = Number(d.step); render(); },
    'cw-next': () => { if (!form().reportValidity()) return; readStep();
      if (W.step === 1 && W.data.end < W.data.start) return toast('La fecha de fin no puede ser anterior a la de inicio');
      if (W.step === 2 && !W.days.length) return toast('Marca al menos un día presencial');
      W.step++; render(); },
    'cw-import': () => { readStep(); W.importing = true;
      Import.startForWizard(result => { W.importing = false; if (result) { const r = addImported(result.records); toast(`${r.total} tiendas en el listado: ${r.added} nuevas añadidas como ${STATE_LABEL[result.records[0]?.state || 'pending'].toLowerCase()}${r.total - r.added ? `, ${r.total - r.added} ya estaban y no se han cambiado` : ''}`); } render(); window.scrollTo?.(0, 0); });
      render(); window.scrollTo?.(0, 0); },
    'cw-add-store': d => { readStep(); const st = H().byId(DB.stores, d.id);
      W.stores.unshift({ store: st.id, state: 'pending', origin: 'manual' }); W.storeFilter = ''; render(); toast(`<b>${esc(st.name)}</b> añadida como pendiente`); },
    'cw-store-filter': d => { readStep(); W.storeFilter = d.v; render(); },
    'cw-store-all': d => { readStep(); W.stores.filter(e => !W.storeFilter || e.state === W.storeFilter).forEach(e => { e.state = d.v; }); render(); },
    'cw-zone-del': d => { setZone(Number(d.z), Number(d.u), false); render(); },
    'cw-zone-pick': d => zonePicker(Number(d.u)),
    'cw-zone-save': d => { const user = Number(d.u), picked = new Set([...document.querySelectorAll('#cw-pick input:checked')].map(el => Number(el.value)));
      DB.zones.forEach(z => setZone(z.id, user, picked.has(z.id))); UI.close(); render(); toast(`${esc(H().byId(DB.users, user).name)}: ${picked.size === 1 ? '1 zona' : `${picked.size} zonas`}`); },
    'cw-finish': () => { const id = create(), name = W.data.name; W = fresh(); go(`campanas/${id}`); toast(`Campaña <b>${esc(name)}</b> creada como Planificada`); },
  }; };

  return { view, actions, reset: () => { W = fresh(); } };
})();

/* Asistente de creación de campañas:
   1) Datos y copia  2) Días  3) Colaboradores  4) Tiendas  5) Coordinación (opcional)  6) Resumen */
window.CampaignWizard = (() => {
  const { esc, icon, btn } = UI;
  const H = () => Views.helpers;
  const STEPS = ['Datos', 'Días', 'Colaboradores', 'Tiendas', 'Coordinación (opcional)', 'Resumen'];
  const fresh = () => ({ step: 1, data: { name: '', type: 1, code: '', start: '', end: '', copyFrom: '', copy: ['zones', 'collabs', 'stores'] }, days: [], zones: {}, collabs: [], storesMode: 'pending' });
  let W = fresh();

  const datesBetween = (start, end) => { const out = []; for (let d = new Date(start + 'T12:00'); d <= new Date(end + 'T12:00'); d.setDate(d.getDate() + 1)) out.push(d.toISOString().slice(0, 10)); return out; };
  const weekendDays = dates => dates.filter(d => [5, 6].includes(new Date(d + 'T12:00').getDay()));
  const fmt = d => new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const source = () => H().byId(DB.campaigns, Number(W.data.copyFrom));
  const copies = kind => source() && W.data.copy.includes(kind);
  const field = (label, html, full = '') => `<div class="field ${full}"><label>${label}</label>${html}</div>`;
  const check = (name, value, checked, label, sub = '') => `<label class="list-item" style="cursor:pointer"><input type="checkbox" class="check" name="${name}" value="${value}" ${checked ? 'checked' : ''}><div style="flex:1"><b class="small">${label}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</div></label>`;

  const stepData = () => { const d = W.data, prev = DB.campaigns.filter(c => c.id);
    return `<div class="form-grid">${field('Nombre', `<input class="input" name="name" required value="${esc(d.name)}" placeholder="Ej. Gran Recogida 2027">`, 'full')}
      ${field('Tipo de campaña', `<select class="input" name="type">${DB.campaignTypes.map(t => `<option value="${t.id}" ${t.id === Number(d.type) ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>`)}
      ${field('Código', `<input class="input" name="code" value="${esc(d.code)}" placeholder="GR2027">`)}
      ${field('Fecha de inicio', `<input class="input" type="date" name="start" required value="${d.start}">`)}
      ${field('Fecha de fin', `<input class="input" type="date" name="end" required value="${d.end}">`)}
      ${field('Copiar de una campaña anterior (opcional)', `<select class="input" name="copyFrom"><option value="">No copiar: empezar desde cero</option>${prev.map(c => `<option value="${c.id}" ${String(c.id) === String(d.copyFrom) ? 'selected' : ''}>${esc(c.name)} (${esc(c.code)})</option>`).join('')}</select>`, 'full')}
      <div class="field full"><label>Qué copiar</label>${check('copy', 'zones', d.copy.includes('zones'), 'Coordinación por zona')}${check('copy', 'collabs', d.copy.includes('collabs'), 'Colaboradores participantes')}${check('copy', 'stores', d.copy.includes('stores'), 'Tiendas participantes')}</div></div>`; };

  const stepDays = () => `<p class="small muted" style="margin-top:0">Marcados por defecto los viernes y sábados de la semana. Las excepciones por cadena se añaden después en la ficha.</p>
    ${datesBetween(W.data.start, W.data.end).map(d => check('day', d, W.days.includes(d), fmt(d))).join('')}`;

  const stepZones = () => { const coords = DB.users.filter(u => u.role === 'coord');
    return `<p class="small muted" style="margin-top:0">${copies('zones') ? `Vista previa copiada de ${esc(source().code)}: revísala antes de crear. ` : 'Paso opcional: puedes saltarlo y asignar la coordinación después, por lotes o por zona. '}</p>
      <div class="table-wrap"><table><thead><tr><th>Zona</th>${coords.map(u => `<th>${esc(u.name)}</th>`).join('')}</tr></thead><tbody>
      ${DB.zones.map(z => `<tr><td><b>${esc(z.name)}</b> <span class="small faint">${esc(z.code)}</span></td>${coords.map(u => `<td><input type="checkbox" class="check" name="zone-${z.id}" value="${u.id}" ${(W.zones[z.id] || []).includes(u.id) ? 'checked' : ''}></td>`).join('')}</tr>`).join('')}</tbody></table></div>`; };

  const stepCollabs = () => `<p class="small muted" style="margin-top:0">${copies('collabs') ? `Copiado de ${esc(source().code)}. ` : ''}Solo aparecen colaboradores validados. Entran como «Pendiente»: coordinación confirma si participan o no.</p>
    ${DB.collabs.filter(c => c.status === 'Validado').map(c => check('collab', c.id, W.collabs.includes(c.id), esc(c.name), esc(c.type))).join('')}`;

  const stepStores = () => { const src = source(), confirmed = src ? Object.values(src.participation).filter(v => v === true).length : 0;
    const radio = (v, label, sub) => `<label class="list-item" style="cursor:pointer"><input type="radio" name="storesMode" value="${v}" ${W.storesMode === v ? 'checked' : ''}><div style="flex:1"><b class="small">${label}</b><div class="small muted">${sub}</div></div></label>`;
    return `${radio('pending', `Todas las tiendas activas (${DB.stores.filter(s => !s.archived).length})`, 'Participan las de cadenas con listado importado; el resto queda pendiente.')}
      ${src && W.data.copy.includes('stores') ? radio('copy', `Copiar participación de ${esc(src.code)}`, `${confirmed} tiendas participaron en esa campaña y entran como «Participa».`) : ''}
      <div class="card card-pad small muted" style="margin-top:16px;background:var(--info-bg);border-color:transparent">${icon('alert')} La campaña se crea como <b>Planificada</b>. Se activa desde su ficha.</div>`; };

  const stepSummary = () => { const free = DB.zones.filter(z => !(W.zones[z.id] || []).length), src = source();
    const stores = W.storesMode === 'copy' && src ? Object.values(src.participation).filter(v => v === true).length : 0, pending = DB.stores.filter(s => !s.archived).length - stores;
    const warn = t => `<div class="list-item">${icon('alert')}<span class="small">${t}</span></div>`;
    return `<div class="table-wrap"><table><tbody>
      <tr><td>Nombre</td><td><b>${esc(W.data.name)}</b> ${esc(W.data.code)}</td></tr><tr><td>Fechas</td><td>${esc(W.data.start)} → ${esc(W.data.end)} · ${W.days.length} días presenciales</td></tr>
      <tr><td>Colaboradores</td><td>${W.collabs.length} (entran como «Pendiente»)</td></tr><tr><td>Tiendas</td><td>${stores} participan · ${pending} pendientes</td></tr>
      <tr><td>Coordinación</td><td>${DB.zones.length - free.length} de ${DB.zones.length} zonas asignadas</td></tr></tbody></table></div>
      <div class="stack" style="margin-top:12px">${free.length ? warn(`${free.length} zonas sin coordinador: ${free.map(z => esc(z.name)).join(', ')}`) : ''}${pending ? warn(`${pending} tiendas quedan pendientes de confirmar participación`) : ''}</div>`; };

  const view = () => { const body = [stepData, stepDays, stepCollabs, stepStores, stepZones, stepSummary][W.step - 1]();
    return `<div class="row" style="margin-bottom:16px">${btn('Campañas', { kind: 'ghost', size: 'sm', icon: 'back', act: 'cw-cancel' })}</div>
      ${UI.pageHead('Nueva campaña', 'Asistente por pasos. Puedes copiar la configuración de una campaña anterior.')}
      <div class="stepper">${STEPS.map((s, i) => `<div class="step ${W.step === i + 1 ? 'active' : W.step > i + 1 ? 'done' : ''}"><span>${W.step > i + 1 ? icon('check') : i + 1}</span>${s}</div>`).join('<i></i>')}</div>
      <div class="card card-pad" style="margin-top:16px"><form id="cw-form" class="stack">${body}</form></div>
      <div class="row" style="margin-top:16px">${W.step > 1 ? btn('Anterior', { icon: 'back', act: 'cw-back' }) : ''}<span class="spacer"></span>
        ${W.step === 5 ? btn('Saltar', { kind: 'ghost', act: 'cw-skip' }) : ''}${W.step < STEPS.length ? btn('Siguiente', { kind: 'primary', act: 'cw-next' }) : btn('Crear campaña', { kind: 'primary', icon: 'check', act: 'cw-finish' })}</div>`; };

  const readStep = form => { const fd = new FormData(form);
    if (W.step === 1) { const prevCopy = `${W.data.copyFrom}|${W.data.start}|${W.data.end}|${W.data.copy}`;
      Object.assign(W.data, { name: fd.get('name'), type: Number(fd.get('type')), code: fd.get('code'), start: fd.get('start'), end: fd.get('end'), copyFrom: fd.get('copyFrom'), copy: fd.getAll('copy') });
      if (prevCopy !== `${W.data.copyFrom}|${W.data.start}|${W.data.end}|${W.data.copy}`) applyDefaults(); }
    if (W.step === 2) W.days = fd.getAll('day');
    if (W.step === 5) W.zones = Object.fromEntries(DB.zones.map(z => [z.id, fd.getAll(`zone-${z.id}`).map(Number)]));
    if (W.step === 3) W.collabs = fd.getAll('collab').map(Number);
    if (W.step === 4) W.storesMode = fd.get('storesMode') || 'pending'; };

  const applyDefaults = () => { const src = source();
    W.days = weekendDays(datesBetween(W.data.start, W.data.end));
    W.zones = {}; if (copies('zones')) DB.zoneAssignments.filter(z => z.campaign === src.id).forEach(z => (W.zones[z.zone] ||= []).push(z.user));
    W.collabs = copies('collabs') ? DB.collabParticipation.filter(p => p.campaign === src.id).map(p => p.collab) : [];
    W.storesMode = copies('stores') ? 'copy' : 'pending'; };

  const create = () => { const id = Math.max(0, ...DB.campaigns.map(c => c.id)) + 1, src = source();
    const participation = W.storesMode === 'copy' && src ? Object.fromEntries(Object.entries(src.participation).filter(([, v]) => v === true)) : {};
    DB.campaigns.push({ id, type: W.data.type, code: W.data.code, name: W.data.name, start: W.data.start, end: W.data.end, days: [...W.days].sort(), exceptions: [], status: 'Planificada', participation, reasons: {}, sources: [] });
    Object.entries(W.zones).forEach(([zone, users]) => users.forEach(user => DB.zoneAssignments.push({ campaign: id, zone: Number(zone), user })));
    let pid = Math.max(0, ...DB.collabParticipation.map(p => p.id));
    W.collabs.forEach(collab => { const prev = src && DB.collabParticipation.find(p => p.collab === collab && p.campaign === src.id); DB.collabParticipation.push({ id: ++pid, collab, campaign: id, coords: [...(prev?.coords || [])], stores: [...(prev?.stores || [])], status: 'Pendiente' }); });
    return id; };

  const actions = (render, go, toast) => ({
    'cw-cancel': () => { W = fresh(); go('campanas'); },
    'cw-back': () => { readStep(document.getElementById('cw-form')); W.step--; render(); },
    'cw-next': () => { const f = document.getElementById('cw-form'); if (!f.reportValidity()) return; readStep(f);
      if (W.step === 1 && W.data.end < W.data.start) return toast('La fecha de fin no puede ser anterior a la de inicio');
      if (W.step === 2 && !W.days.length) return toast('Marca al menos un día presencial');
      W.step++; render(); },
    'cw-skip': () => { W.zones = {}; W.step++; render(); },
    'cw-finish': () => { const id = create(), name = W.data.name; W = fresh(); go(`campanas/${id}`); toast(`Campaña <b>${esc(name)}</b> creada como Planificada`); },
  });

  return { view, actions, reset: () => { W = fresh(); } };
})();

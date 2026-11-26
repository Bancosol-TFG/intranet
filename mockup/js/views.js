/* Vistas (páginas). Cada vista recibe el estado y devuelve HTML.
   Toda referencia a otro objeto (tienda, zona, grupo…) se pinta con R.* para que sea un enlace a su ficha. */
window.Views = (() => {
  const { esc, icon, avatar, badge, btn, progress, empty, pageHead, kpi, table, rowActions, fmtDate, link } = UI;
  let CS; // estado actual (lo fija app.js)
  const byId = (list, id) => list.find(x => String(x.id) === String(id));
  const role = id => byId(DB.roles, id);
  const chain = id => byId(DB.chains, id), zone = id => byId(DB.zones, id), loc = id => byId(DB.localities, id), user = id => byId(DB.users, id);
  const ctype = id => byId(DB.campaignTypes, id), rtype = id => byId(DB.reportTypes, id);

  /* ---------- Reglas de dominio ---------- */
  const SEQ = ['GR2022', 'OKP2023', 'GR2023', 'GR2024', 'OKP2025', 'GR2025'];
  const missed = v => { const last = Math.max(-1, ...v.history.map(h => SEQ.indexOf(h))); return SEQ.length - 1 - last; };
  const toPurge = v => missed(v) >= DB.settings.inactiveCampaigns;
  const gsize = g => g ? g.members.length : 0;
  const exportBtn = what => btn('Exportar Excel', { icon: 'file', act: 'export', data: `data-what="${what}"` });
  const auditTrail = (entity, id) => DB.audit.filter(a => a.entity === entity && String(a.id) === String(id)).slice().reverse();
  const auditCard = (entity, id) => isRole('admin') ? `<div class="card"><div class="card-head"><div><h2>Historial de cambios</h2><div class="small muted">Solo Administración</div></div></div>${auditTrail(entity, id).map(a => `<div class="list-item"><div style="flex:1"><div class="small">${esc(a.text)}</div><div class="small faint">${R.user(a.who)} · ${esc(a.when)}</div></div></div>`).join('') || '<div class="card-pad small muted">Sin cambios registrados.</div>'}</div>` : '';
  const globalId = v => 'V-' + String(v.id).padStart(5, '0');
  /* Pestañas del catálogo (solo Administración): toda la base de datos en una única entrada de la barra lateral */
  const CAT_TABS = [['tiendas', 'Tiendas'], ['colaboradores', 'Colaboradores'], ['voluntarios', 'Voluntarios'], ['catalogos/zonas', 'Zonas'], ['catalogos/localidades', 'Localidades'], ['catalogos/cadenas', 'Cadenas'], ['catalogos/tipos', 'Tipos de campaña'], ['catalogos/incidencias', 'Tipos de incidencia']];
  const catalogTabs = here => { const cur = here === 'catalogos' ? 'catalogos/zonas' : CAT_TABS.find(([k]) => here === k || here.startsWith(k + '/'))?.[0];
    return `<div class="eyebrow" style="margin-bottom:6px">Catálogo</div><div class="tabs" style="margin-bottom:20px">${CAT_TABS.map(([k, l]) => `<button class="tab ${cur === k ? 'active' : ''}" data-act="go" data-to="${k}">${l}</button>`).join('')}</div>`; };
  const anonV = v => isRole('admin', 'coord') && !v.shared;
  const vName = v => anonV(v) ? `Voluntario ${globalId(v)}` : v.name;
  const volShifts = v => DB.shifts.filter(s => s.assignments.some(a => (a.kind === 'vol' && a.vol === v.id) || (a.kind === 'group' && byId(DB.groups, a.group)?.members.includes(v.id))));
  const volReports = v => DB.reports.filter(r => volShifts(v).some(s => s.id === r.shift));
  const hasAdult = (s, exceptId) => s.assignments.some(a => a.kind === 'group' ? byId(DB.groups, a.group)?.members.some(id => id !== exceptId && !byId(DB.volunteers, id)?.minor) : a.kind === 'vol' ? a.vol !== exceptId && !byId(DB.volunteers, a.vol)?.minor : true);
  const overlaps = (a, b) => a.date === b.date && a.start < b.end && b.start < a.end;
  const memberClashes = (g, s) => g.members.filter(vid => DB.shifts.some(x => x.id !== s.id && overlaps(x, s) && x.assignments.some(a => (a.kind === 'vol' && a.vol === vid) || (a.kind === 'group' && a.group !== g.id && byId(DB.groups, a.group)?.members.includes(vid)))));
  const asgPeople = x => x.kind === 'vol' ? 1 : x.kind === 'group' ? Number(x.people ?? gsize(byId(DB.groups, x.group))) : Number(x.people);
  const filled = s => s.assignments.reduce((a, x) => a + asgPeople(x), 0);
  const coverage = s => { const f = filled(s); return f === 0 ? 'Sin cubrir' : f >= s.capacity ? 'Cubierto' : 'Parcial'; };
  const covTone = s => ({ 'Sin cubrir': 'danger', Parcial: 'warn', Cubierto: 'ok' })[coverage(s)];
  const part = (c, sid) => { const v = c.participation[sid]; if (v === true) return 'Participa'; if (v === false) return 'No participa'; const st = byId(DB.stores, sid); return c.sources.some(x => x.chain === st?.chain) ? 'Participa' : 'Pendiente'; };
  const partTone = { Participa: 'ok', Pendiente: 'warn', 'No participa': '' };
  const pendingRequests = () => DB.storeRequests.filter(r => r.status === 'Pendiente');
  const STORE_FIELDS = [['name', 'Nombre'], ['address', 'Dirección'], ['code', 'Código'], ['checkout_shelfs', 'Líneas de caja'], ['locality', 'Localidad']];
  const fieldText = (k, v) => k === 'locality' ? esc(loc(v)?.name || '—') : k === 'exception' ? (v ? `${fmtDate(v.date)}: ${v.closed ? 'cerrada' : `${v.open}–${v.close}`}` : '—') : k === 'schedule' ? (v ? `${v.open}–${v.close}` : '—') : esc(v ?? '—');
  const can = (S, p) => DB.rolePerms[S.user.role].includes(p);
  const activeCampaigns = () => DB.campaigns.filter(c => c.status === 'Activa');
  const activeCampaign = () => activeCampaigns().find(c => c.id === CS?.campaign) || activeCampaigns()[0] || DB.campaigns.find(c => c.status === 'Planificada') || DB.campaigns[0];
  const zonesOf = (uid, cid = activeCampaign().id) => DB.zoneAssignments.filter(z => z.user === uid && z.campaign === cid).map(z => z.zone);
  const coordsOfZone = (zid, cid = activeCampaign().id) => DB.zoneAssignments.filter(z => z.zone === zid && z.campaign === cid).map(z => z.user);
  const contactsOf = cid => DB.contacts.filter(k => k.collab === cid);
  const mainContact = cid => contactsOf(cid).find(k => k.level === 'Responsable colaborador') || contactsOf(cid)[0];
  const storeShifts = (sid, cid) => DB.shifts.filter(s => s.store === sid && (!cid || s.campaign === cid));
  const groupShifts = gid => DB.shifts.filter(s => s.assignments.some(a => a.kind === 'group' && a.group === gid));

  const COLLAB_STATUSES = ['Confirmado', 'Pendiente', 'No participa'];
  const collabPart = (c, cid = activeCampaign().id) => DB.collabParticipation.find(p => p.collab === c.id && p.campaign === cid);
  const linkCollab = c => { if (Object.getOwnPropertyDescriptor(c, 'coords')?.get) return c;
    const ensure = () => collabPart(c) || (DB.collabParticipation.push({ id: Math.max(0, ...DB.collabParticipation.map(p => p.id)) + 1, collab: c.id, campaign: activeCampaign().id, coords: [], stores: [], status: 'Confirmado' }), collabPart(c));
    const field = k => ({ get: () => c.status === 'Validado' ? collabPart(c)?.[k] || [] : k === 'coords' ? c.pendingCoords || [] : [], set: v => { if (c.status !== 'Validado' && k === 'coords') c.pendingCoords = v; else ensure()[k] = v; }, configurable: true });
    Object.defineProperty(c, 'coords', field('coords')); Object.defineProperty(c, 'stores', field('stores')); return c; };
  DB.collabs.forEach(linkCollab);
  const COLLAB_FIELDS = [['name', 'Nombre'], ['address', 'Dirección'], ['locality', 'Localidad'], ['type', 'Tipo'], ['capacity', 'Capacidad de voluntarios']];
  const collabRequestItem = (S, r) => `<div class="list-item" style="align-items:flex-start">${avatar(user(r.by)?.name, 'sm')}<div style="flex:1"><div class="small"><b>${R.user(r.by)}</b> propone cambios en ${R.collab(r.collab)} <span class="faint">· ${fmtDate(r.date)}</span></div>
      <table class="small" style="margin:8px 0"><tbody>${Object.entries(r.changes).map(([k, v]) => `<tr><td class="muted" style="padding-right:12px">${COLLAB_FIELDS.find(f => f[0] === k)?.[1] || k}</td><td><s class="faint">${k === 'locality' ? esc(loc(byId(DB.collabs, r.collab)[k])?.name) : esc(byId(DB.collabs, r.collab)[k])}</s> → <b>${k === 'locality' ? esc(loc(v)?.name) : esc(v)}</b></td></tr>`).join('')}</tbody></table>
      ${r.note ? `<div class="small muted">«${esc(r.note)}»</div>` : ''}</div>
      ${r.status === 'Pendiente' && can(S, 'collabs.create') ? btn('Rechazar', { size: 'sm', act: 'review-collab-request', data: `data-id="${r.id}" data-ok=""` }) + btn('Aceptar', { kind: 'primary', size: 'sm', icon: 'check', act: 'review-collab-request', data: `data-id="${r.id}" data-ok="1"` }) : badge(r.status, { Aceptada: 'ok', Rechazada: '', Pendiente: 'warn' }[r.status])}</div>`;

  /* Alcance por rol */
  const scope = {
    stores: S => { const u = S.user; if (u.role === 'admin') return DB.stores; if (u.role === 'coord') { const z = zonesOf(u.id); return DB.stores.filter(s => !s.archived && z.includes(s.zone)); }
      if (u.role === 'rcol') return DB.stores.filter(s => byId(DB.collabs, u.collab).stores.includes(s.id));
      const ids = new Set(groupShifts(u.group).map(s => s.store)); return DB.stores.filter(s => ids.has(s.id)); },
    collabs: S => { const u = S.user; if (u.role === 'admin') return DB.collabs; if (u.role === 'coord') return DB.collabs.filter(c => c.coords.includes(u.id)); return DB.collabs.filter(c => c.id === u.collab); },
    groups: S => { const u = S.user; if (u.role === 'rtienda') return DB.groups.filter(g => g.id === u.group); const cs = new Set(scope.collabs(S).map(c => c.id)); return DB.groups.filter(g => !g.archived && cs.has(g.collab)); },
    volunteers: S => { const u = S.user; if (u.role === 'admin' || u.role === 'coord') return DB.volunteers.filter(v => v.collab === 1); return DB.volunteers.filter(v => v.collab === u.collab); },
    shifts: (S, cid) => { if (S.user.role === 'rtienda') return DB.shifts.filter(s => s.campaign === cid && s.assignments.some(a => a.kind === 'group' && a.group === S.user.group));
      const ids = new Set(scope.stores(S).map(s => s.id)); return DB.shifts.filter(s => s.campaign === cid && ids.has(s.store)); },
  };
  const inScope = (kind, id) => scope[kind](CS).some(x => String(x.id) === String(id));
  const collaboratorShifts = (state, campaignId, collabId) => scope.shifts(state, campaignId).filter(shift => shift.assignments.some(assignment => assignment.collab === collabId || (assignment.kind === 'group' && byId(DB.groups, assignment.group)?.collab === collabId) || (assignment.kind === 'vol' && byId(DB.volunteers, assignment.vol)?.collab === collabId)));
  const canViewVolunteer = (S, volunteer) => !!volunteer && (scope.volunteers(S).some(item => item.id === volunteer.id) || (['admin', 'coord'].includes(S.user.role) && scope.collabs(S).some(collab => collab.id === volunteer.collab)));

  /* ---------- Enlaces a objetos (solo si el rol puede abrir la ficha) ---------- */
  const isRole = (...r) => r.includes(CS.user.role);
  const R = {
    store: id => { const s = byId(DB.stores, id); if (!s) return '—'; return isRole('admin', 'coord', 'rcol') && (isRole('admin') || inScope('stores', id)) ? link(`tienda/${id}`, esc(s.name)) : esc(s.name); },
    zone: id => { const z = zone(id); if (!z) return '<span class="faint">Sin zona</span>'; return isRole('admin', 'coord') ? link(`zona/${id}`, esc(z.name), 'plain') : esc(z.name); },
    loc: id => { const l = loc(id); if (!l) return '—'; return isRole('admin', 'coord') ? link(`localidad/${id}`, esc(l.name), 'plain') : esc(l.name); },
    chain: id => { const c = chain(id); if (!c) return '—'; return isRole('admin', 'coord') ? link(`cadena/${id}`, esc(c.name), 'plain') : esc(c.name); },
    collab: id => { const c = byId(DB.collabs, id); if (!c) return '—'; return (isRole('admin') || inScope('collabs', id)) && !isRole('rtienda') ? link(isRole('rcol') ? 'entidad' : `colaboradores/${id}`, esc(c.name)) : esc(c.name); },
    group: id => { const g = byId(DB.groups, id); if (!g) return 'Grupo eliminado'; return isRole('admin') || inScope('groups', id) ? link(`grupo/${id}`, esc(g.code)) : esc(g.code); },
    campaign: id => { const c = byId(DB.campaigns, id); return isRole('admin') ? link(`campanas/${id}`, esc(c.name)) : esc(c.name); },
    user: id => { const u = user(id); if (!u) return '—'; return isRole('admin') ? link(`usuario/${id}`, esc(u.name), 'plain') : esc(u.name); },
    vol: id => { const v = byId(DB.volunteers, id); if (!v) return 'Voluntario'; return canViewVolunteer(CS, v) ? link(`voluntario/${id}`, esc(vName(v))) : esc(vName(v)); },
    shift: s => `<a class="ref plain" href="#" data-act="open-shift" data-id="${s.id}">${fmtDate(s.date, { weekday: 'short', day: 'numeric' })} · ${s.slot} ${s.start}–${s.end}</a>`,
  };
  const asg = a => a.kind === 'vol' ? R.vol(a.vol) : a.kind === 'group' ? `${R.group(a.group)} · ${asgPeople(a)} pers.` : `${R.collab(a.collab)} · ${a.people}`;
  const asgText = a => a.kind === 'vol' ? byId(DB.volunteers, a.vol)?.name : a.kind === 'group' ? byId(DB.groups, a.group)?.code : byId(DB.collabs, a.collab)?.name;
  const asgIcon = a => icon(a.kind === 'vol' ? 'user' : a.kind === 'group' ? 'users' : 'building');
  const activityText = a => esc(a.text).replace(/\{(\w+)\}/g, (_, k) => R[k] ? R[k](a.refs[k]) : '');
  const storeSub = s => `${chain(s.chain).name}${s.code ? ' · ' + s.code : ''}`;
  const stats = shifts => { const cap = shifts.reduce((a, s) => a + s.capacity, 0), f = shifts.reduce((a, s) => a + Math.min(filled(s), s.capacity), 0); return { cap, f, pct: cap ? Math.round(f / cap * 100) : 0, uncovered: shifts.filter(s => filled(s) === 0).length }; };
  const ago = date => { const n = Math.round((new Date('2026-11-12') - new Date(date)) / 864e5); return n <= 0 ? 'desde hoy' : `desde hace ${n} ${n === 1 ? 'día' : 'días'}`; };
  const openReports = shifts => { const ids = new Set(shifts.map(s => s.id)); return DB.reports.filter(r => ids.has(r.shift) && !r.solved_by); };
  const iconBox = (i, color = 'var(--brand)', bg = 'var(--brand-50)') => `<span style="width:36px;height:36px;border-radius:9px;background:${bg};color:${color};display:grid;place-items:center;flex:none">${icon(i)}</span>`;
  const todo = (i, title, text, act) => `<div class="list-item">${iconBox(i)}<div style="flex:1"><b>${title}</b><div class="small muted">${text}</div></div>${act}</div>`;
  const back = (to, label) => `<div class="row" style="margin-bottom:16px">${btn(label, { kind: 'ghost', size: 'sm', icon: 'back', act: 'go', data: `data-to="${to}"` })}</div>`;
  const detailHead = (ic, title, sub, actions = '', tag = '') => `<div class="row wrap" style="margin-bottom:24px;gap:16px">${iconBox(ic)}<div style="flex:1"><div class="row"><h1>${title}</h1>${tag}</div><div class="muted" style="margin-top:4px">${sub}</div></div>${actions}</div>`;
  const shiftRow = (s, extra = '') => `<div class="list-item"><div style="flex:1;min-width:0"><b>${R.store(s.store)}</b><div class="small muted">${R.shift(s)} · ${s.assignments.map(asg).join(', ') || 'Sin asignar'}</div></div>${badge(coverage(s), covTone(s))}${extra}</div>`;
  const visibleActivity = S => S.user.role === 'admin' ? DB.activity : DB.activity.filter(a => Object.entries(a.refs || {}).some(([k, id]) => ({ store: 'stores', collab: 'collabs', group: 'groups' })[k] && inScope(({ store: 'stores', collab: 'collabs', group: 'groups' })[k], id)));
  const feed = S => { const items = visibleActivity(S); return `<div class="card"><div class="card-head"><h2>Actividad reciente</h2><span class="small muted">de tu ámbito</span></div>${items.length ? items.slice(0, 6).map(a => `<div class="list-item" style="align-items:flex-start">${avatar(user(a.who)?.name, 'sm')}<div><div class="small">${R.user(a.who)} ${activityText(a)}</div><div class="small faint">${esc(a.when)}</div></div></div>`).join('') : empty('Sin actividad', 'No hay cambios recientes en tu ámbito.')}</div>`; };

  /* ---------- Inicio ---------- */
  function inicio(S) {
    const c = activeCampaign(), u = S.user, first = u.first_name;
    const sh = scope.shifts(S, c.id), st = stats(sh);
    const today = S.today || '2026-11-12', isCampaignDay = c.days.includes(today);
    const days = Math.max(0, Math.ceil((new Date(c.days[0]) - new Date(today)) / 864e5));
    const dayToggle = btn(isCampaignDay ? 'Volver a preparación (demo)' : 'Simular día de campaña (demo)', { kind: 'ghost', size: 'sm', icon: 'clock', act: 'sim-day', data: `data-day="${isCampaignDay ? '' : c.days[0]}"` });
    const todayShifts = sh.filter(s => s.date === today), openToday = openReports(todayShifts);
    const campaignDay = isCampaignDay ? `<div class="card" style="margin-bottom:20px;border-color:var(--brand)"><div class="card-head"><div><h2>Hoy es día de campaña</h2><div class="small muted">${fmtDate(today, { weekday: 'long', day: 'numeric', month: 'long' })} · ${todayShifts.length} turnos en tu ámbito · ${openToday.length} incidencias abiertas</div></div>${btn('Ver turnos de hoy', { size: 'sm', act: 'go', data: 'data-to="turnos"' })}</div>
      ${['Mañana', 'Tarde'].map(slot => { const list = todayShifts.filter(s => s.slot === slot); return list.length ? `<div class="card-pad small muted" style="padding-bottom:0"><b>${slot}</b> · ${list.filter(s => coverage(s) === 'Cubierto').length}/${list.length} cubiertos</div>${list.filter(s => coverage(s) !== 'Cubierto').slice(0, 4).map(s => shiftRow(s)).join('')}` : ''; }).join('')}
      ${openToday.map(r => todo('alert', esc(byId(DB.reportTypes, r.type)?.name || 'Incidencia'), esc(r.description), btn('Ver', { size: 'sm', act: 'go', data: 'data-to="incidencias"' }))).join('')}</div>` : '';
    const scopeText = { admin: 'toda la provincia', coord: zonesOf(u.id).map(R.zone).join(', ') || 'sin zonas asignadas', rcol: R.collab(u.collab), rtienda: 'grupo ' + R.group(u.group) }[u.role];
    const hero = `<div class="hero" style="margin-bottom:20px"><div class="row wrap" style="position:relative;z-index:1;align-items:flex-start">
        <div style="flex:1;min-width:260px"><span class="badge plain" style="background:rgba(255,255,255,.2);color:#fff">${esc(c.code)} · ${isCampaignDay ? 'voluntariado presencial hoy' : `voluntariado presencial en ${days} días`}</span>
          <h1 style="margin:12px 0 6px;font-size:28px">${esc(c.name)}</h1>
          <div class="muted">Semana del ${fmtDate(c.start, { day: 'numeric' })} al ${fmtDate(c.end, { day: 'numeric', month: 'long' })} · Presencial ${c.days.map(d => fmtDate(d, { weekday: 'long', day: 'numeric' })).join(' y ')}</div>
          <div class="small muted hero-links" style="margin-top:4px">Tu ámbito: ${scopeText}</div></div>
        <div class="row">${dayToggle}${btn('Ir a turnos', { icon: 'clock', act: 'go', data: 'data-to="turnos"' })}</div></div>
        <div style="position:relative;z-index:1;margin-top:20px;max-width:560px"><div class="row" style="margin-bottom:8px"><b>Cobertura de turnos</b><span class="spacer"></span><b>${st.pct}%</b></div>${progress(st.pct)}
          <div class="small muted" style="margin-top:6px">${st.f} de ${st.cap} plazas cubiertas en ${sh.length} turnos</div></div></div>`;
    const urgentList = sh.filter(s => coverage(s) !== 'Cubierto').sort((a, b) => filled(a) - filled(b)).slice(0, 5);
    const urgent = `<div class="card"><div class="card-head"><div><h2>Turnos que necesitan personas</h2><div class="small muted">De menor a mayor cobertura</div></div>${btn('Ver todos', { kind: 'ghost', size: 'sm', act: 'go', data: 'data-to="turnos"' })}</div>
      ${urgentList.length ? urgentList.map(s => `<div class="list-item"><div style="flex:1;min-width:0"><b>${R.store(s.store)}</b> <span class="small faint">${esc(storeSub(byId(DB.stores, s.store)))}</span><div class="small muted">${R.shift(s)} · ${R.zone(byId(DB.stores, s.store).zone)}</div></div>
        <div style="width:120px">${progress(filled(s) / s.capacity * 100, covTone(s))}<div class="small faint" style="margin-top:4px">${filled(s)}/${s.capacity} personas</div></div>${can(S, 'shifts.assign') ? btn('Asignar', { size: 'sm', icon: 'plus', act: 'assign', data: `data-id="${s.id}"` }) : ''}</div>`).join('') : empty('Todo cubierto', 'No hay turnos pendientes en tu ámbito.')}</div>`;

    const pendingCard = items => `<div class="card" style="margin-bottom:20px"><div class="card-head"><h2>Pendiente de tu acción</h2></div>${items.filter(Boolean).join('') || empty('Nada pendiente', 'Todo al día en tu ámbito.')}</div>`;
    const uncoveredTodo = st.uncovered ? todo('clock', `${st.uncovered} turnos sin cubrir`, 'Asigna grupos o voluntarios a los turnos que aún necesitan personas.', btn('Asignar', { size: 'sm', act: 'go', data: 'data-to="turnos"' })) : '';
    const reportsTodo = openReports(sh).length ? todo('alert', `${openReports(sh).length} incidencias abiertas`, 'Revisa y resuelve las incidencias de tu ámbito.', btn('Ver', { size: 'sm', act: 'go', data: 'data-to="incidencias"' })) : '';
    if (u.role === 'admin') {
      const pend = DB.collabs.filter(x => x.status !== 'Validado'), pendStores = DB.stores.filter(s => !s.archived && part(c, s.id) === 'Pendiente').length, reqs = pendingRequests();
      const noList = DB.chains.filter(ch => !c.sources.some(s => s.chain === ch.id)), purge = DB.volunteers.filter(toPurge).length;
      const noZone = DB.stores.filter(s => !s.zone).length, noCoord = DB.zones.filter(z => !coordsOfZone(z.id).length);
      return `${pageHead(`Hola, ${first}`, 'Esto es lo que necesita tu atención en la campaña.', btn('Importar tiendas', { icon: 'upload', act: 'go', data: 'data-to="importar"' }) + btn('Nueva campaña', { kind: 'primary', icon: 'plus', act: 'new-campaign' }), fmtDate('2026-11-12', { weekday: 'long', day: 'numeric', month: 'long' }))}
        ${campaignDay}<div class="card" style="margin-bottom:20px"><div class="card-head"><h2>Pendiente de tu acción</h2></div>
          ${pend.map(x => todo('building', `Validar a ${R.collab(x.id)}`, 'Nuevo colaborador: revisa sus datos y asígnale un coordinador.', btn('Revisar', { size: 'sm', act: 'go', data: `data-to="colaboradores/${x.id}"` }))).join('')}
          ${noCoord.length ? todo('map', `${noCoord.length} zonas sin coordinador en ${esc(c.code)}`, noCoord.map(z => R.zone(z.id)).join(', '), btn('Asignar', { size: 'sm', act: 'go', data: `data-to="campanas/${c.id}/coordinacion"` })) : ''}
          ${noZone ? todo('map', `${noZone} tiendas sin zona`, 'Asígnales zona para que un coordinador las vea.', btn('Asignar', { size: 'sm', act: 'go-filter', data: 'data-to="tiendas" data-k="zone" data-v="none"' })) : ''}
          ${noList.length ? todo('file', `Faltan listados de ${noList.length} cadenas`, noList.map(x => R.chain(x.id)).join(', ') + ': impórtalos o confirma las tiendas a mano.', btn('Importar', { size: 'sm', act: 'go', data: 'data-to="importar"' })) : ''}
          ${DB.collabRequests.filter(r => r.status === 'Pendiente').map(r => todo('building', `Cambio propuesto en ${R.collab(r.collab)}`, 'El responsable propone actualizar los datos de su entidad.', btn('Revisar', { size: 'sm', act: 'go', data: `data-to="colaboradores/${r.collab}"` }))).join('')}
          ${DB.catalogRequests.filter(r => r.status === 'Pendiente').length ? todo('list', `${DB.catalogRequests.filter(r => r.status === 'Pendiente').length} peticiones de localidad o zona`, 'Coordinación pide altas en los catálogos.', btn('Revisar', { size: 'sm', act: 'go', data: 'data-to="catalogos/solicitudes"' })) : ''}
          ${reqs.length ? todo('edit', `${reqs.length} solicitudes de cambio en tiendas`, 'Coordinación propone cambios de datos: revísalos y acéptalos o recházalos.', btn('Revisar', { size: 'sm', act: 'go', data: 'data-to="tiendas/solicitudes"' })) : ''}
          ${pendStores ? todo('store', `${pendStores} tiendas con participación pendiente`, 'Son de cadenas sin listado: confirma si participan.', btn('Revisar', { size: 'sm', act: 'go', data: `data-to="campanas/${activeCampaign().id}/tiendas"` })) : ''}
          ${purge ? todo('users', `${purge} voluntarios propuestos para baja`, `Llevan ${DB.settings.inactiveCampaigns} o más campañas sin participar.`, btn('Revisar', { size: 'sm', act: 'purge' })) : ''}
          </div>
        ${hero}
        <div class="grid g-4" style="margin-bottom:20px">${kpi('Tiendas que participan', DB.stores.filter(s => !s.archived && part(c, s.id) === 'Participa').length, 'store', `${pendStores} pendientes`)}${kpi('Turnos sin cubrir', st.uncovered, 'alert', `de ${sh.length} turnos`)}${kpi('Colaboradores', DB.collabs.length, 'building', `${pend.length} pendientes de validar`)}${kpi('Incidencias abiertas', openReports(sh).length, 'bell', 'en la campaña')}</div>
        <div class="grid g-main">${urgent}${feed(S)}</div>`;
    }
    if (u.role === 'coord') {
      return `${pageHead(`Hola, ${first}`, 'Tus zonas, tus colaboradores y los turnos que quedan por cubrir.', btn('Asignar turnos', { kind: 'primary', icon: 'clock', act: 'go', data: 'data-to="turnos"' }))}
        ${campaignDay}${pendingCard([uncoveredTodo, reportsTodo, ...scope.collabs(S).filter(x => collabPart(x)?.status === 'Pendiente').map(x => todo('phone', `Llamar a ${R.collab(x.id)}`, `Confirma si participa en ${esc(c.code)}.`, btn('Ver', { size: 'sm', act: 'go', data: `data-to="colaboradores/${x.id}"` }))), ...scope.collabs(S).filter(x => x.status !== 'Validado').map(x => todo('building', `${R.collab(x.id)} pendiente de validar`, 'Administración debe validarlo antes de asignarle turnos.', ''))])}
        ${hero}<div class="grid g-main"><div class="stack">${urgent}${feed(S)}</div>
        <div class="card"><div class="card-head"><h2>Tus colaboradores</h2><span class="small muted">a quién llamar</span></div>${scope.collabs(S).map(x => { const p = mainContact(x.id); return `<div class="list-item">${avatar(x.name, 'sm')}<div style="flex:1"><b class="small">${R.collab(x.id)}</b><div class="small muted">${esc(p?.name || '—')} · ${icon('phone')} ${esc(p?.phone || '')}</div></div>${badge(x.status, x.status === 'Validado' ? 'ok' : 'warn')}</div>`; }).join('')}</div></div>`;
    }
    if (u.role === 'rcol') {
      const col = byId(DB.collabs, u.collab), vols = scope.volunteers(S);
      return `${pageHead(`Hola, ${first}`, `Gestionas los voluntarios y grupos de ${R.collab(col.id)}.`, btn('Nuevo grupo', { icon: 'plus', act: 'group-form' }) + btn('Asignar turnos', { kind: 'primary', icon: 'clock', act: 'go', data: 'data-to="turnos"' }))}
        ${campaignDay}${pendingCard([...DB.shifts.filter(s => s.campaign === c.id).flatMap(s => s.assignments.map((a, i) => ({ s, a, i }))).filter(({ a }) => a.kind === 'group' && a.people && !a.members && byId(DB.groups, a.group)?.collab === col.id).map(({ s, a, i }) => todo('users', `Elige quién va de ${R.group(a.group)}`, `${a.people} de ${gsize(byId(DB.groups, a.group))} personas · ${R.shift(s)}`, btn('Elegir', { size: 'sm', kind: 'primary', act: 'nominate', data: `data-id="${s.id}" data-i="${i}"` }))), uncoveredTodo, reportsTodo, vols.filter(toPurge).length ? todo('users', `${vols.filter(toPurge).length} voluntarios propuestos para baja`, `Llevan ${DB.settings.inactiveCampaigns} o más campañas sin participar.`, btn('Revisar', { size: 'sm', act: 'go', data: 'data-to="voluntarios"' })) : ''])}
        ${hero}<div class="grid g-4" style="margin-bottom:20px">${kpi('Tiendas asignadas', col.stores.length, 'store', col.stores.map(R.store).join(', '))}${kpi('Grupos', DB.groups.filter(g => g.collab === col.id).length, 'users', DB.groups.filter(g => g.collab === col.id).map(g => R.group(g.id)).join(', '))}${kpi('Voluntarios', vols.length, 'heart', `${vols.filter(toPurge).length} sin participar hace tiempo`)}${kpi('Turnos sin cubrir', st.uncovered, 'alert', `de ${sh.length}`)}</div>
        <div class="card" style="margin-bottom:20px"><div class="card-head"><div><h2>Tus tiendas en ${esc(c.code)}</h2><div class="small muted">${st.uncovered ? `Te quedan ${st.uncovered} turnos sin cubrir` : 'Todos tus turnos están cubiertos'}</div></div></div>
          ${col.stores.length ? col.stores.map(id => { const ts = sh.filter(s => s.store === id), k = stats(ts), un = ts.filter(s => coverage(s) !== 'Cubierto').length; return `<div class="list-item"><div style="flex:1;min-width:0"><b>${R.store(id)}</b><div class="small muted">${ts.length} turnos · ${un ? `<span style="color:var(--danger)">${un} sin cubrir</span>` : 'todo cubierto'}</div></div><div style="width:140px">${progress(k.pct, k.pct >= 100 ? 'ok' : k.pct < 40 ? 'danger' : 'warn')}</div>${btn(un ? 'Asignar' : 'Ver', { size: 'sm', kind: un ? 'primary' : '', icon: 'clock', act: 'open-store-cal', data: `data-id="${id}"` })}</div>`; }).join('') : empty('Sin tiendas', 'Coordinación aún no te ha asignado tiendas en esta campaña.')}</div>
        <div class="grid g-main">${urgent}${feed(S)}</div>`;
    }
    const g = byId(DB.groups, u.group), col = byId(DB.collabs, g.collab), mine = sh.slice().sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)), next = mine.find(s => s.date >= today) || mine[0];
    const rcolU = DB.users.find(x => x.role === 'rcol' && x.collab === col.id), coordU = user(coordsOfZone(byId(DB.stores, next?.store)?.zone, c.id)[0] || col.coords?.[0]);
    const contact = (p, role) => p ? `<div class="list-item">${avatar(p.name)}<div style="flex:1"><b class="small">${esc(p.name)}</b><div class="small muted">${role}</div></div>${p.phone ? `<a class="btn sm" href="tel:${esc(p.phone)}">${icon('phone')} Llamar</a>` : ''}</div>` : '';
    const going = s => { const a = s.assignments.find(x => x.kind === 'group' && x.group === g.id); return a?.members ? a.members.map(id => esc(byId(DB.volunteers, id).name)).join(', ') : `${asgPeople(a)} de ${gsize(g)} (todo el grupo${a?.people ? ' · falta que tu responsable elija quién' : ''})`; };
    const nextCard = next ? (() => { const s0 = byId(DB.stores, next.store), addr = `${s0.address}, ${loc(s0.locality)?.name || ''}`; return `<div class="card card-pad" style="margin-bottom:20px;border-color:var(--brand)">
        <div class="small muted" style="text-transform:uppercase;letter-spacing:.04em">Tu próximo turno</div>
        <h1 style="margin:6px 0 2px;font-size:26px">${fmtDate(next.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${next.start}–${next.end}</h1>
        <div style="font-size:16px;margin-bottom:4px"><b>${esc(s0.name)}</b></div>
        <div class="row small muted" style="margin-bottom:12px">${icon('pin')} ${esc(addr)} · <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}" target="_blank" rel="noopener">Cómo llegar</a></div>
        <div class="small" style="margin-bottom:14px">${icon('users')} Van: ${going(next)}</div>
        ${btn('Registrar incidencia', { kind: 'primary', icon: 'alert', act: 'incident', data: `data-id="${next.id}"` })}</div>`; })() : `<div class="card" style="margin-bottom:20px">${empty('Sin turnos', 'Tu responsable aún no ha asignado turnos al grupo.')}</div>`;
    return `${pageHead(`Hola, ${first}`, `Líder del grupo ${R.group(g.id)} · ${esc(col.name)}`, '')}
      ${nextCard}<div class="grid g-main"><div class="stack">${mine.length > 1 ? `<div class="card"><div class="card-head"><h2>Otros turnos del grupo</h2></div>${mine.filter(s => s !== next).map(s => shiftRow(s, btn('Incidencia', { size: 'sm', icon: 'alert', act: 'incident', data: `data-id="${s.id}"` }))).join('')}</div>` : ''}
        <div class="card"><div class="card-head"><h2>Tu grupo</h2>${badge(gsize(g) + ' personas', 'plain')}</div>${g.members.map(id => { const v = byId(DB.volunteers, id); return `<div class="list-item">${avatar(v.name, 'sm')}<div style="flex:1"><b class="small">${esc(v.name)}</b><div class="small muted">${esc(v.phone)}</div></div>${id === g.leader ? badge('Líder', 'brand') : ''}</div>`; }).join('')}</div></div>
        <div class="card"><div class="card-head"><h2>A quién llamar</h2></div>${contact(rcolU, `Tu responsable · ${esc(col.name)}`)}${contact(coordU, 'Coordinación de la zona')}<div class="card-pad small muted">Si falta alguien o hay problemas (petos, material…), registra una incidencia.</div></div></div>`;
  }

  /* ---------- Campañas ---------- */
  function campanas(S) {
    return `${pageHead('Campañas', isRole('admin') ? 'Cada campaña dura una semana; el voluntariado presencial es viernes y sábado, con excepciones por cadena.' : 'Campaña actual y próximas en las que coordinas.', isRole('admin') ? btn('Nueva campaña', { kind: 'primary', icon: 'plus', act: 'new-campaign' }) : '')}
      <div class="grid g-3">${DB.campaigns.filter(c => isRole('admin') || c.status !== 'Finalizada').map(c => { const sh = DB.shifts.filter(s => s.campaign === c.id), st = stats(sh); return `
        <div class="card hover card-pad" data-act="go" data-to="campanas/${c.id}">
          <div class="row" style="margin-bottom:14px">${iconBox('flag')}<span class="spacer"></span>${badge(c.status)}</div>
          <h2>${esc(c.name)}</h2><div class="small muted" style="margin:4px 0 16px">${esc(ctype(c.type)?.name)} · ${esc(c.code)} · ${fmtDate(c.start)} – ${fmtDate(c.end, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          ${c.status === 'Finalizada' ? '<div class="small muted">Referencia de cobertura para la siguiente campaña.</div>' : `<div class="row small"><span class="muted">Cobertura</span><span class="spacer"></span><b>${st.pct}%</b></div>${progress(st.pct)}<div class="row small faint" style="margin-top:10px;gap:14px"><span data-act="go" data-to="campanas/${c.id}/tiendas" style="cursor:pointer;text-decoration:underline">${icon('store')} ${Object.values(c.participation).filter(v => v === true).length} tiendas</span><span>${icon('building')} ${DB.collabParticipation.filter(p => p.campaign === c.id).length}</span><span>${icon('map')} ${new Set(DB.zoneAssignments.filter(z => z.campaign === c.id).map(z => z.zone)).size} zonas</span></div>`}
        </div>`; }).join('')}</div>`;
  }

  function campana(S, id, tab = 'resumen') {
    const c = byId(DB.campaigns, id); if (!c || (!isRole('admin') && c.status === 'Finalizada')) return empty('Campaña no encontrada', '');
    const sh = DB.shifts.filter(s => s.campaign === c.id), st = stats(sh), locked = c.status === 'Finalizada' || !isRole('admin');
    const coordHtml = () => { const query = (S.f.coordQuery || '').trim().toLocaleLowerCase('es');
      const zones = DB.zones.filter(z => isRole('admin') || zonesOf(S.user.id, c.id).includes(z.id)).filter(z => `${z.name} ${z.code} ${coordsOfZone(z.id, c.id).map(uid => user(uid)?.name || '').join(' ')}`.toLocaleLowerCase('es').includes(query));
      const cards = zones.map(z => { const zs = sh.filter(s => byId(DB.stores, s.store)?.zone === z.id), k = stats(zs), coordinators = coordsOfZone(z.id, c.id), stores = DB.stores.filter(store => !store.archived && store.zone === z.id && part(c, store.id) === 'Participa').length;
        return `<article class="card coord-zone"><div class="coord-zone-head"><div><h3>${R.zone(z.id)}</h3><div class="small muted">${stores} ${stores === 1 ? 'tienda participante' : 'tiendas participantes'}</div></div>${coordinators.length ? '' : badge('Sin coordinación', 'warn')}</div>
          <div class="coord-coverage"><div class="row small"><span>Cobertura de plazas</span><span class="spacer"></span><b>${zs.length ? `${k.f}/${k.cap}` : 'Sin turnos'}</b></div>${zs.length ? progress(k.pct, k.pct >= 100 ? 'ok' : k.pct < 40 ? 'danger' : 'warn') : ''}</div>
          <div class="coord-people"><div class="small muted">Coordinación</div>${coordinators.length ? coordinators.map(uid => `<div class="row coord-person"><span>${R.user(uid)}</span><span class="spacer"></span>${locked ? '' : `<button class="btn ghost icon sm" data-act="unassign-zone" data-c="${c.id}" data-z="${z.id}" data-u="${uid}" aria-label="Quitar a ${esc(user(uid)?.name || 'coordinador')} de ${esc(z.name)}" title="Quitar coordinación">${icon('x')}</button>`}</div>`).join('') : '<div class="small muted">Pendiente de asignar</div>'}
            ${locked ? '' : `<label class="coord-add-label small" for="coord-zone-${z.id}">Añadir coordinador</label><select id="coord-zone-${z.id}" class="input" data-act-change="assign-zone" data-c="${c.id}" data-z="${z.id}"><option value="">Seleccionar coordinador</option>${DB.users.filter(u => u.role === 'coord' && u.status !== 'Inactivo' && !coordinators.includes(u.id)).map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select>`}</div></article>`; }).join('');
      return `<div class="coord-panel"><div class="coord-panel-head"><div><h2>Coordinación por zona</h2><p class="small muted">Consulta la cobertura y las personas responsables de cada zona.</p></div>${locked ? '' : `<div class="row wrap">${btn('Nueva zona', { icon: 'plus', act: 'new-zone-modal', data: `data-c="${c.id}"` })}${btn('Nueva coordinación', { kind: 'primary', icon: 'plus', act: 'new-zone-assignment', data: `data-c="${c.id}"` })}</div>`}</div>
        <div class="coord-tools"><label class="field"><span>Buscar zona o coordinador</span><input class="input" type="search" data-filter="coordQuery" value="${esc(S.f.coordQuery || '')}" placeholder="Nombre de zona o persona"></label></div>
        ${cards ? `<div class="coord-grid">${cards}</div>` : `<div class="card">${empty('Sin resultados', query ? 'Prueba con otro nombre.' : 'No hay zonas disponibles.')}</div>`}</div>`; };
    const collabHtml = () => { const ps = DB.collabParticipation.filter(p => p.campaign === c.id);
      const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
      const query = normalize((S.f.collabQuery || '').trim()), status = S.f.collabStatus || '';
      const visible = ps.filter(p => normalize(byId(DB.collabs, p.collab)?.name).includes(query) && (!status || (p.status || 'Confirmado') === status));
      return `<div class="card"><div class="card-head"><div><h2>Colaboradores que participan</h2><div class="small muted">Entidades que colaboran en esta campaña y su estado de confirmación.</div></div>
        ${locked ? '' : btn('Añadir colaborador', { icon: 'plus', act: 'add-campaign-collaborator', data: `data-c="${c.id}"` })}</div>
        <div class="toolbar collab-filters"><label class="field"><span>Buscar colaborador</span><input class="input" type="search" data-filter="collabQuery" value="${esc(S.f.collabQuery || '')}" placeholder="Nombre de la entidad"></label><label class="field"><span>Estado</span><select class="input" data-filter="collabStatus"><option value="">Todos los estados</option>${COLLAB_STATUSES.map(option => `<option value="${esc(option)}" ${status === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></label><span class="small muted collab-filter-count">${visible.length} de ${ps.length} colaboradores</span></div>
        ${table([{ label: 'Colaborador', render: p => R.collab(p.collab) }, { label: 'Localidad', render: p => R.loc(byId(DB.collabs, p.collab).locality) },
          { label: 'Estado', render: p => { const status = p.status || 'Confirmado';
            const statusBadge = badge(status, { Confirmado: 'ok', Pendiente: 'warn', 'No participa': '' }[status]);
            const control = c.status === 'Finalizada' ? statusBadge : `<button type="button" class="campaign-status-button" data-act="edit-campaign-collab-status" data-id="${p.id}" aria-label="Cambiar estado de ${esc(byId(DB.collabs, p.collab)?.name || 'colaborador')}: ${esc(status)}" title="Cambiar estado">${statusBadge}${icon('chev')}</button>`;
            return control; } },
          { label: 'Coordinación', render: p => (p.coords || []).map(R.user).join(', ') || '<span class="faint small">—</span>' },
          { label: 'Grupos', render: p => DB.groups.filter(g => g.collab === p.collab).map(g => R.group(g.id)).join(', ') || '<span class="faint small">—</span>' },
          { label: 'Turnos asignados', render: p => { const count = collaboratorShifts(S, c.id, p.collab).length; return count ? `<button type="button" class="campaign-shifts-link" data-act="campaign-collab-shifts" data-id="${p.id}">${count === 1 ? 'Ver turno' : `Ver ${count} turnos`}</button>` : '<span class="muted">Sin turnos</span>'; } },
          !locked && { label: 'Eliminar de la campaña', headerIcon: 'trash', width: '110px', render: p => btn('Eliminar', { kind: 'ghost danger', size: 'sm', icon: 'x', act: 'del-collab-part', data: `data-id="${p.id}" aria-label="Eliminar a ${esc(byId(DB.collabs, p.collab)?.name || 'colaborador')} de la campaña"`, title: 'Eliminar de la campaña' }) }], visible, { emptyText: 'No hay colaboradores que coincidan con los filtros.' })}</div>`; }
    const daysHtml = () => `<div class="grid g-2"><div class="card"><div class="card-head"><h2>Días de voluntariado presencial</h2></div>${c.days.map(d => `<div class="list-item">${iconBox('cal')}<div style="flex:1"><b>${fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}</b><div class="small muted">Mañana (apertura–${DB.settings.morningEnd}) y Tarde (${DB.settings.afternoonStart}–cierre), según el horario de cada tienda</div></div></div>`).join('')}</div>
      <div class="card"><div class="card-head"><div><h2>Excepciones por cadena</h2><div class="small muted">Días extra que ofrece alguna cadena</div></div>${locked ? '' : btn('Añadir', { size: 'sm', icon: 'plus', act: 'add-exception', data: `data-id="${c.id}"` })}</div>${c.exceptions.length ? c.exceptions.map(e => `<div class="list-item">${iconBox('cal', 'var(--info)', 'var(--info-bg)')}<div style="flex:1"><b>${R.chain(e.chain)} · ${fmtDate(e.date, { weekday: 'long', day: 'numeric', month: 'long' })}</b><div class="small muted">${esc(e.note)}</div></div></div>`).join('') : empty('Sin excepciones', 'Todas las cadenas siguen el calendario general.')}</div></div>`;
    const listHtml = () => `<div class="card"><div class="card-head"><div><h2>Listados recibidos de las cadenas</h2></div>${locked ? '' : btn('Importar listado', { kind: 'primary', size: 'sm', icon: 'upload', act: 'go', data: 'data-to="importar"' })}</div>
      ${table([{ label: 'Cadena', render: r => `${R.chain(r.id)}<div class="small faint">${esc(r.note)}</div>` }, { label: 'Listado', render: r => { const s = c.sources.find(x => x.chain === r.id); return s ? `<span class="row small">${icon('file')}${esc(s.file)}</span>` : '<span class="faint">No recibido</span>'; } },
        { label: 'Filas', render: r => c.sources.find(x => x.chain === r.id)?.rows ?? '—' }, { label: 'Estado', render: r => c.sources.some(x => x.chain === r.id) ? badge('Importado', 'ok') : badge(r.hasCode ? 'Pendiente' : 'Confirmación manual', 'warn') }], DB.chains)}</div>`;
    const kpiHtml = () => `<div class="grid g-4" style="margin-bottom:20px">${kpi('Cobertura', st.pct + '%', 'sparkle', `${st.f}/${st.cap} plazas`)}${kpi('Turnos', sh.length, 'clock', `${st.uncovered} sin cubrir`)}${kpi('Tiendas confirmadas', Object.values(c.participation).filter(v => v === true).length, 'store', `${DB.stores.filter(s => part(c, s.id) === 'Pendiente').length} pendientes`)}${kpi('Incidencias', DB.reports.filter(r => r.campaign === c.id).length, 'bell', 'registradas')}</div>
      <div class="card"><div class="card-head"><h2>Cobertura por zona</h2></div>${DB.zones.map(z => { const zs = sh.filter(s => byId(DB.stores, s.store).zone === z.id); if (!zs.length) return ''; const p = stats(zs).pct;
        return `<div class="list-item"><div style="flex:1"><b>${R.zone(z.id)}</b><div class="small muted">${zs.length} turnos · ${coordsOfZone(z.id, c.id).map(R.user).join(', ') || 'sin coordinador'}</div></div><div style="width:220px">${progress(p, p >= 100 ? 'ok' : p < 40 ? 'danger' : 'warn')}</div><b style="width:44px;text-align:right">${p}%</b></div>`; }).join('')}</div>`;
    /* Ficha en tres pestañas: preparación o resumen, tiendas y equipo. Las rutas antiguas se redirigen. */
    tab = ({ equipo: 'coordinacion', calendario: 'resumen', listados: 'tiendas' })[tab] || tab;
    const ps = DB.collabParticipation.filter(p => p.campaign === c.id), toCall = ps.filter(p => (p.status || 'Confirmado') === 'Pendiente').length;
    const zonesNoCoord = DB.zones.filter(z => DB.stores.some(s => s.zone === z.id) && !coordsOfZone(z.id, c.id).length).length;
    const pend = DB.stores.filter(s => !s.archived && part(c, s.id) === 'Pendiente').length, partic = Object.values(c.participation).filter(v => v === true).length;
    const noList = DB.chains.filter(ch => ch.hasCode && !c.sources.some(x => x.chain === ch.id)).length;
    const goBtn = (l, to, primary) => btn(l, { size: 'sm', kind: primary ? 'primary' : '', act: 'go', data: `data-to="${to}"` });
    const checks = [
      [c.days.length > 0, 'Días de campaña', c.days.length ? c.days.map(d => fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })).join(', ') + (c.exceptions.length ? ` · ${c.exceptions.length} excepciones por cadena` : '') : 'Sin días definidos', locked ? '' : btn('Editar', { size: 'sm', act: 'edit', data: `data-entity="campaigns" data-id="${c.id}"` })],
      [!zonesNoCoord, 'Coordinación por zona', zonesNoCoord ? `${zonesNoCoord} zonas con tiendas sin coordinador` : 'Todas las zonas tienen coordinador', goBtn(zonesNoCoord ? 'Asignar' : 'Ver', `campanas/${c.id}/coordinacion`, zonesNoCoord)],
      [!pend && !noList, 'Tiendas', `${partic} participan · ${pend} pendientes${noList ? ` · ${noList} cadenas sin listado` : ''}`, goBtn(pend || noList ? 'Revisar' : 'Ver', `campanas/${c.id}/tiendas`, pend || noList)],
      [ps.length > 0 && !toCall, 'Colaboradores', ps.length ? `${ps.length} en la campaña · ${toCall} por llamar` : 'Ninguno añadido', goBtn(toCall || !ps.length ? 'Confirmar' : 'Ver', `campanas/${c.id}/colaboradores`, toCall || !ps.length)],
      [st.pct >= 100, 'Turnos', `${st.pct}% cubierto · ${st.uncovered} turnos sin cubrir`, goBtn('Cubrir huecos', 'turnos', st.uncovered)],
    ];
    const done = checks.filter(x => x[0]).length;
    const checklist = `<div class="card" style="margin-bottom:20px"><div class="card-head"><div><h2>${c.status === 'Planificada' ? 'Preparación de la campaña' : 'Pendiente'}</h2><div class="small muted">${done} de ${checks.length} listos</div></div><div style="width:200px">${progress(done / checks.length * 100, done === checks.length ? 'ok' : 'warn')}</div></div>
      ${checks.map(([ok, title, detail, action]) => `<div class="list-item">${iconBox(ok ? 'check' : 'alert', ok ? 'var(--ok)' : 'var(--warn)', ok ? 'var(--ok-bg)' : 'var(--warn-bg)')}<div style="flex:1"><b>${title}</b><div class="small muted">${detail}</div></div>${c.status === 'Finalizada' ? '' : action}</div>`).join('')}</div>`;
    const body = tab === 'tiendas' ? participacionBody(S, c) + `<div style="margin-top:20px">${listHtml()}</div>`
      : tab === 'coordinacion' ? coordHtml() : tab === 'colaboradores' ? collabHtml()
      : c.status === 'Planificada' ? checklist + daysHtml() : c.status === 'Finalizada' ? balanceHtml(c) + kpiHtml() : kpiHtml() + `<div style="margin-top:20px">${checklist}</div>`;
    const tabs = [['resumen', c.status === 'Planificada' ? 'Preparación' : 'Resumen'], ['tiendas', `Tiendas${pend ? ` (${pend})` : ''}`], ['coordinacion', `Coordinación${zonesNoCoord ? ` (${zonesNoCoord})` : ''}`], ['colaboradores', `Colaboradores${toCall ? ` (${toCall})` : ''}`]];
    return `${back('campanas', 'Campañas')}
      ${pageHead(c.name, `${esc(ctype(c.type)?.name)} · ${esc(c.code)} · ${fmtDate(c.start, { day: 'numeric', month: 'long' })} – ${fmtDate(c.end, { day: 'numeric', month: 'long', year: 'numeric' })}`, c.status === 'Finalizada' ? badge('Finalizada · solo lectura') : !isRole('admin') ? badge(c.status) : badge(c.status) + btn('Editar', { icon: 'edit', act: 'edit', data: `data-entity="campaigns" data-id="${c.id}"` }) + btn(c.status === 'Activa' ? 'Finalizar campaña' : 'Activar campaña', { kind: 'primary', icon: c.status === 'Activa' ? 'check' : 'flag', act: 'campaign-status', data: `data-id="${c.id}" data-status="${c.status === 'Activa' ? 'Finalizada' : 'Activa'}"` }))}
      ${c.status === 'Finalizada' ? '<div class="card card-pad small" style="margin-bottom:16px;background:var(--warn-bg);border-color:transparent">Campaña finalizada: turnos, asignaciones y configuración en solo lectura. Las incidencias pendientes se pueden seguir cerrando.</div>' : ''}
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${tab === k ? 'active' : ''}" data-act="go" data-to="campanas/${c.id}/${k}">${l}</button>`).join('')}</div><div class="fade-in">${body}</div>`;
  }

  /* Balance de una campaña: kilos, voluntarios que asistieron, asistencia y cobertura. */
  const campaignBalance = c => { const sh = DB.shifts.filter(s => s.campaign === c.id), asg = sh.flatMap(s => s.assignments), marked = asg.filter(a => a.attended !== undefined);
    const vols = new Set(asg.filter(a => a.attended).flatMap(a => a.kind === 'vol' ? [a.vol] : a.kind === 'group' ? a.members || byId(DB.groups, a.group)?.members || [] : []));
    const kilos = Object.values(c.kilos || {}).reduce((x, y) => x + y, 0);
    return { kilos: kilos || c.summary?.kilos || 0, vols: vols.size || c.summary?.volunteers || 0, attendance: marked.length ? Math.round(marked.filter(a => a.attended).length / marked.length * 100) : c.summary?.attendance ?? null, coverage: sh.length ? stats(sh).pct : c.summary?.coverage ?? null, stores: Object.values(c.participation).filter(v => v === true).length || c.summary?.stores || 0 }; };
  const balanceHtml = c => { const b = campaignBalance(c), top = Object.entries(c.kilos || {}).sort((x, y) => y[1] - x[1]).slice(0, 5);
    return `<div class="grid g-4" style="margin-bottom:20px">${kpi('Kilos recogidos', b.kilos.toLocaleString('es-ES'), 'box', `${b.stores} tiendas`)}${kpi('Voluntarios que asistieron', b.vols, 'heart', 'personas distintas')}${kpi('Asistencia', b.attendance == null ? '—' : b.attendance + '%', 'check', 'de lo asignado')}${kpi('Turnos cubiertos', b.coverage == null ? '—' : b.coverage + '%', 'clock', 'de las plazas')}</div>
      ${top.length ? `<div class="card" style="margin-bottom:20px"><div class="card-head"><h2>Tiendas con más kilos</h2></div>${top.map(([id, kg]) => `<div class="list-item"><div style="flex:1">${R.store(Number(id))}</div><div style="width:200px">${progress(kg / top[0][1] * 100, 'ok')}</div><b style="width:80px;text-align:right">${kg.toLocaleString('es-ES')} kg</b></div>`).join('')}</div>` : ''}`; };
  function historico(S) {
    const cs = DB.campaigns.filter(c => c.status !== 'Planificada').sort((a, b) => b.start.localeCompare(a.start)), rows = cs.map(c => ({ c, b: campaignBalance(c) })), max = Math.max(1, ...rows.map(r => r.b.kilos));
    return `${pageHead('Histórico de recogidas', 'Cómo ha ido cada campaña: kilos, voluntarios, asistencia y cobertura.', '')}
      <div class="card" style="margin-bottom:20px"><div class="card-head"><h2>Kilos por campaña</h2></div>${rows.map(({ c, b }) => `<div class="list-item"><div style="width:220px">${R.campaign(c.id)}<div class="small faint">${esc(c.code)} · ${esc(c.status)}</div></div><div style="flex:1">${progress(b.kilos / max * 100, 'ok')}</div><b style="width:90px;text-align:right">${b.kilos.toLocaleString('es-ES')} kg</b></div>`).join('')}</div>
      <div class="card">${table([{ label: 'Campaña', render: r => `${R.campaign(r.c.id)}<div class="small faint">${fmtDate(r.c.start, { month: 'short', year: 'numeric' })}</div>` }, { label: 'Tiendas', render: r => r.b.stores }, { label: 'Voluntarios', render: r => r.b.vols }, { label: 'Asistencia', render: r => r.b.attendance == null ? '<span class="faint">—</span>' : r.b.attendance + '%' }, { label: 'Turnos cubiertos', render: r => r.b.coverage == null ? '<span class="faint">—</span>' : r.b.coverage + '%' }, { label: 'Kilos', render: r => `<b>${r.b.kilos.toLocaleString('es-ES')}</b>` }], rows.map(r => ({ ...r, id: r.c.id })))}</div>`;
  }

  /* ---------- Tiendas ---------- */
  function participacionBody(S, c) {
    c.reasons ||= {}; c.participation ||= {}; c.sources ||= [];
    const admin = can(S, 'stores.import');
    const q = (S.f.q || '').toLowerCase(), ch = S.f.chain || '', z = S.f.zone || '';
    const showArchived = S.f.archived === '1', picked = S.picked || [];
    const list = scope.stores(S).filter(s => (showArchived || !s.archived) && (s.name + (loc(s.locality)?.name || '') + (s.code || '')).toLowerCase().includes(q) && (!ch || String(s.chain) === ch) && (!z || (z === 'none' ? !s.zone : String(s.zone) === z)));
    const filters = `<div class="toolbar"><div class="input-icon" style="width:240px">${icon('search')}<input class="input" placeholder="Nombre, código o localidad…" data-filter="q" value="${esc(S.f.q || '')}"></div>
      <select class="input" style="width:170px" data-filter="chain"><option value="">Todas las cadenas</option>${DB.chains.map(x => `<option value="${x.id}" ${String(x.id) === ch ? 'selected' : ''}>${x.name}</option>`).join('')}</select>
      <select class="input" style="width:170px" data-filter="zone"><option value="">Todas las zonas</option><option value="none" ${z === 'none' ? 'selected' : ''}>Sin zona</option>${DB.zones.map(x => `<option value="${x.id}" ${String(x.id) === z ? 'selected' : ''}>${x.name}</option>`).join('')}</select>${admin ? `<label class="row small"><input type="checkbox" class="check" data-act="toggle-archived" ${showArchived ? 'checked' : ''}>Ver archivadas</label>` : ''}<span class="spacer"></span><span class="small muted">${list.length} tiendas</span></div>`;
    let body;
    body = `<div class="card" style="margin-bottom:16px;background:var(--info-bg);border-color:transparent"><div class="card-pad row small">${icon('alert')}<span>Las tiendas de los listados importados o copiados <b>participan</b> por defecto: desmarca las que avisen que no participan. «Pendiente» solo aparece en cadenas sin listado.</span></div></div>
        <div class="card">${filters}${table([
          { label: 'Tienda', render: r => `${R.store(r.id)}<div class="small faint">${esc(storeSub(r))} · ${esc(loc(r.locality)?.name)}</div>` },
          { label: 'Zona', render: r => R.zone(r.zone) },
          can(S, 'history.last') && { label: 'Campaña anterior', render: r => DB.history[r.id] ? R.collab(DB.history[r.id]) : '<span class="faint small">—</span>' },
          { label: 'Participa en ' + c.code, render: r => can(S, 'stores.participation') ? `<div class="seg">${['Participa', 'Pendiente', 'No participa'].map(v => `<button class="${part(c, r.id) === v ? 'active' : ''}" data-act="participation" data-id="${r.id}" data-v="${v}" data-c="${c.id}">${v}</button>`).join('')}</div>${c.reasons[r.id] && part(c, r.id) === 'No participa' ? `<div class="small faint" style="margin-top:4px">${esc(c.reasons[r.id])}</div>` : ''}` : badge(part(c, r.id), partTone[part(c, r.id)]) },
          { label: 'Turnos', render: r => { const t = DB.shifts.filter(s => s.campaign === c.id && s.store === r.id); return t.length ? `${t.length} <span class="small faint">· ${t.filter(s => coverage(s) === 'Cubierto').length} cubiertos</span>` : '<span class="faint small">—</span>'; } },
          c.status !== 'Planificada' && isRole('admin', 'coord') && { label: 'Kilos recogidos', render: r => part(c, r.id) === 'Participa' ? `<input class="input inline" style="width:90px" type="number" min="0" placeholder="kg" data-act-change="kilos" data-c="${c.id}" data-id="${r.id}" value="${(c.kilos || {})[r.id] ?? ''}">` : '' },
        ], list)}</div>`;
    return body;
  }

  function tiendas(S, tab = 'catalogo') {
    const c = activeCampaign(), admin = can(S, 'stores.import');
    const q = (S.f.q || '').toLowerCase(), ch = S.f.chain || '', z = S.f.zone || '';
    const showArchived = S.f.archived === '1', picked = S.picked || [];
    const list = scope.stores(S).filter(s => (showArchived || !s.archived) && (s.name + (loc(s.locality)?.name || '') + (s.code || '')).toLowerCase().includes(q) && (!ch || String(s.chain) === ch) && (!z || (z === 'none' ? !s.zone : String(s.zone) === z)));
    const filters = `<div class="toolbar"><div class="input-icon" style="width:240px">${icon('search')}<input class="input" placeholder="Nombre, código o localidad…" data-filter="q" value="${esc(S.f.q || '')}"></div>
      <select class="input" style="width:170px" data-filter="chain"><option value="">Todas las cadenas</option>${DB.chains.map(x => `<option value="${x.id}" ${String(x.id) === ch ? 'selected' : ''}>${x.name}</option>`).join('')}</select>
      <select class="input" style="width:170px" data-filter="zone"><option value="">Todas las zonas</option><option value="none" ${z === 'none' ? 'selected' : ''}>Sin zona</option>${DB.zones.map(x => `<option value="${x.id}" ${String(x.id) === z ? 'selected' : ''}>${x.name}</option>`).join('')}</select>${admin ? `<label class="row small"><input type="checkbox" class="check" data-act="toggle-archived" ${showArchived ? 'checked' : ''}>Ver archivadas</label>` : ''}<span class="spacer"></span><span class="small muted">${list.length} tiendas</span></div>`;
    const bulk = admin ? `<div class="toolbar" style="border-top:1px solid var(--border)"><span class="small"><b>${picked.length}</b> seleccionadas</span><select class="input inline" id="bulk-zone"><option value="">Sin zona</option>${DB.zones.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select>${btn('Asignar zona', { size: 'sm', act: 'bulk-zone' })}<span class="spacer"></span>${btn('Zona por localidad', { size: 'sm', icon: 'map', act: 'zone-by-locality', title: 'Asigna a las tiendas sin zona la zona de su localidad' })}</div>` : '';
    let body;
    if (tab === 'solicitudes' && admin) {
      const reqs = DB.storeRequests.slice().reverse();
      body = `<div class="card">${reqs.length ? reqs.map(r => requestItem(S, r)).join('') : empty('Sin solicitudes', 'Coordinación no ha propuesto cambios.')}</div>`;
    } else if (tab === 'participacion') {
      body = `<div class="card card-pad row">${icon('alert')}<span style="flex:1">La participación de las tiendas se gestiona dentro de cada campaña.</span>${btn(`Abrir ${esc(c.code)}`, { kind: 'primary', size: 'sm', act: 'go', data: `data-to="campanas/${c.id}/tiendas"` })}</div>`;
    } else {
      body = `<div class="card">${filters}${bulk}${table([
          admin && { label: '', width: '36px', render: r => `<input type="checkbox" class="check" data-act="store-pick" data-id="${r.id}" ${picked.includes(r.id) ? 'checked' : ''}>` },
          { label: 'Tienda', render: r => `<div class="cell-main">${iconBox('store')}<div>${R.store(r.id)}${r.archived ? ' ' + badge('Archivada') : ''}<small>${esc(r.address)}</small></div></div>` },
          { label: 'Cadena', render: r => R.chain(r.chain) },
          { label: 'Código', render: r => r.code ? `<code>${esc(r.code)}</code>` : badge('Sin código', 'warn') },
          { label: 'Localidad', render: r => R.loc(r.locality) },
          { label: 'Zona', render: r => admin ? `<select class="input inline" data-act-change="store-zone" data-id="${r.id}"><option value="">Sin zona</option>${DB.zones.map(x => `<option value="${x.id}" ${x.id === r.zone ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>` : R.zone(r.zone) },
          { label: 'Cajas', render: r => `${r.checkout_shelfs}` },
          { label: '', width: '90px', render: r => admin ? rowActions('stores', r.id) : '' },
        ], list)}</div>`;
    }
    return `${pageHead('Tiendas', 'Catálogo de puntos de recogida y su participación en la campaña.', exportBtn('stores') + (admin ? btn('Alta manual', { icon: 'plus', act: 'new', data: 'data-entity="stores"' }) + btn('Importar listado', { kind: 'primary', icon: 'upload', act: 'go', data: 'data-to="importar"' }) : isRole('coord') ? btn('Pedir localidad o zona', { icon: 'pin', act: 'request-catalog' }) : ''))}
      <div class="tabs">${[['catalogo', 'Catálogo'], ...(admin ? [['solicitudes', `Solicitudes de cambio${pendingRequests().length ? ` (${pendingRequests().length})` : ''}`]] : [])].map(([k, l]) => `<button class="tab ${tab === k ? 'active' : ''}" data-act="go" data-to="tiendas/${k}">${l}</button>`).join('')}</div><div class="fade-in">${body}</div>`;
  }

  const requestItem = (S, r) => `<div class="list-item" style="align-items:flex-start">${avatar(user(r.by)?.name, 'sm')}<div style="flex:1"><div class="small"><b>${R.user(r.by)}</b> propone cambios en ${R.store(r.store)} <span class="faint">· ${fmtDate(r.date)}</span>${r.status === 'Pendiente' ? ` <span class="small" style="color:var(--warn)">· pendiente ${ago(r.date)}</span>` : ''}</div>
      <table class="small" style="margin:8px 0"><tbody>${Object.entries(r.changes).map(([k, v]) => `<tr><td class="muted" style="padding-right:12px">${STORE_FIELDS.find(f => f[0] === k)?.[1] || { exception: 'Excepción de horario', schedule: 'Horario semanal' }[k] || k}</td><td>${k === 'exception' ? `<b>${fieldText(k, v)}</b>` : `<s class="faint">${fieldText(k, k === 'schedule' ? DB.schedules.find(h => h.store === r.store) : byId(DB.stores, r.store)[k])}</s> → <b>${fieldText(k, v)}</b>`}</td></tr>`).join('')}</tbody></table>
      ${r.note ? `<div class="small muted">«${esc(r.note)}»</div>` : ''}</div>
      ${r.status === 'Pendiente' && can(S, 'stores.import') ? btn('Rechazar', { size: 'sm', act: 'review-request', data: `data-id="${r.id}" data-ok=""` }) + btn('Aceptar', { kind: 'primary', size: 'sm', icon: 'check', act: 'review-request', data: `data-id="${r.id}" data-ok="1"` }) : badge(r.status, { Aceptada: 'ok', Rechazada: '', Pendiente: 'warn' }[r.status])}</div>`;

  function tienda(S, id) {
    const s = byId(DB.stores, id); if (!s) return empty('Tienda no encontrada', '');
    const c = activeCampaign(), sh = storeShifts(s.id, c.id), reps = DB.reports.filter(r => sh.some(x => x.id === r.shift));
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const sched = DB.schedules.filter(h => h.store === s.id), exc = DB.scheduleExceptions.filter(e => e.store === s.id).sort((a, b) => a.date.localeCompare(b.date)), ch = chain(s.chain), ownSchedule = sched.some(h => h.open !== ch.open || h.close !== ch.close);
    const covering = [...new Set(sh.flatMap(x => x.assignments.map(a => a.kind === 'group' ? byId(DB.groups, a.group)?.collab : a.kind === 'collab' ? a.collab : byId(DB.volunteers, a.vol)?.collab)))].filter(Boolean);
    return `${back('tiendas', 'Tiendas')}
      ${detailHead('store', esc(s.name), `${R.chain(s.chain)} ${s.code ? '· código <code>' + esc(s.code) + '</code>' : ''} · ${esc(s.address)}, ${R.loc(s.locality)}`, can(S, 'stores.import') ? btn(s.archived ? 'Restaurar' : 'Archivar', { icon: 'box', act: 'archive-store', data: `data-id="${s.id}"` }) + btn('Editar', { icon: 'edit', act: 'edit', data: `data-entity="stores" data-id="${s.id}"` }) : can(S, 'stores.propose') ? btn('Proponer cambio', { icon: 'edit', act: 'propose-store', data: `data-id="${s.id}"` }) : '', s.archived ? badge('Archivada') : badge(part(c, s.id), partTone[part(c, s.id)]))}
      ${DB.storeRequests.some(r => r.store === s.id && (r.status === 'Pendiente' || r.by === S.user.id)) ? `<div class="card" style="margin-bottom:16px"><div class="card-head"><h2>Solicitudes de cambio</h2></div>${DB.storeRequests.filter(r => r.store === s.id && (r.status === 'Pendiente' || r.by === S.user.id)).map(r => requestItem(S, r)).join('')}</div>` : ''}
      <div class="grid g-main"><div class="stack">
        <div class="card"><div class="card-head"><div><h2>Turnos en ${R.campaign(c.id)}</h2><div class="small muted">${s.checkout_shelfs} ${s.checkout_shelfs === 2 ? 'líneas' : 'línea'} de caja → ${s.checkout_shelfs === 2 ? 4 : 2} personas por turno</div></div></div>
          ${sh.length ? sh.map(x => shiftRow(x, can(S, 'shifts.assign') && filled(x) < x.capacity ? btn('Asignar', { size: 'sm', icon: 'plus', act: 'assign', data: `data-id="${x.id}"` }) : '')).join('') : empty('Sin turnos', 'Confirma la participación de la tienda para generar sus turnos.')}</div>
        <div class="card"><div class="card-head"><h2>Incidencias</h2></div>${reps.length ? reps.map(r => `<div class="list-item">${badge(rtype(r.type).name, r.solved_by ? 'ok' : 'danger')}<div style="flex:1" class="small">${esc(r.description)}<div class="faint">${R.shift(byId(DB.shifts, r.shift))} · ${R.user(r.reported_by)}</div></div></div>`).join('') : '<div class="card-pad small muted">Sin incidencias.</div>'}</div>
      </div><div class="stack">
        <div class="card card-pad"><h2 style="margin-bottom:14px">Datos</h2><dl class="dl"><dt>Cadena</dt><dd>${R.chain(s.chain)}</dd><dt>Localidad</dt><dd>${R.loc(s.locality)} <span class="faint small">${esc(loc(s.locality)?.postal_code)}</span></dd><dt>Zona</dt><dd>${R.zone(s.zone)}</dd>
          <dt>Coordinación</dt><dd>${coordsOfZone(s.zone, c.id).map(R.user).join(', ') || '—'}</dd>${can(S, 'history.last') ? `<dt>Campaña anterior</dt><dd>${DB.history[s.id] ? R.collab(DB.history[s.id]) : '—'}</dd>` : ''}<dt>Este año</dt><dd>${covering.map(R.collab).join(', ') || '—'}</dd></dl></div>
        <div class="card"><div class="card-head"><div><h2>Horario</h2><div class="small muted">${ownSchedule ? 'Horario propio de la tienda' : `Horario de la cadena ${esc(ch.name)}`}</div></div>${can(S, 'stores.import') ? btn('Editar', { size: 'sm', icon: 'edit', act: 'edit-schedule', data: `data-id="${s.id}"` }) : ''}</div><div class="card-pad"><dl class="dl">${[1, 2, 3, 4, 5, 6, 7].map(wd => { const t = sched.filter(h => h.week_day === wd).sort((a, b) => a.open.localeCompare(b.open)); return `<dt>${days[wd]}</dt><dd>${t.length ? t.map(h => `${h.open}–${h.close}`).join(', ') : '<span class="faint">Cerrado</span>'}</dd>`; }).join('')}</dl>
          <div class="row" style="margin-top:14px"><b class="small">Excepciones por fecha</b><span class="spacer"></span>${can(S, 'stores.import') ? btn('Añadir', { size: 'sm', icon: 'plus', act: 'add-sched-exc', data: `data-id="${s.id}"` }) : ''}</div>
          ${exc.length ? [...new Set(exc.map(e => e.date))].map(date => { const t = exc.filter(e => e.date === date), closed = t.some(e => e.closed); return `<div class="row small" style="margin-top:6px"><span class="muted" style="flex:1">${fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}: ${closed ? 'cerrada' : t.sort((a, b) => a.open.localeCompare(b.open)).map(e => e.open + '–' + e.close).join(', ')}</span>${can(S, 'stores.import') ? btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'add-sched-exc', data: `data-id="${s.id}" data-date="${date}"`, title: 'Editar' }) + btn('', { kind: 'ghost danger', size: 'sm', icon: 'x', act: 'del-sched-exc', data: `data-id="${s.id}" data-date="${date}"`, title: 'Quitar' }) : ''}</div>`; }).join('') : '<div class="small faint" style="margin-top:6px">Sin excepciones.</div>'}
          ${!can(S, 'stores.import') && can(S, 'stores.propose') ? '<div class="small faint" style="margin-top:10px">Para cambiar el horario o añadir una excepción, usa «Proponer cambio».</div>' : ''}</div></div>
        ${auditCard('stores', s.id)}
      </div></div>`;
  }

  /* ---------- Zonas, localidades, cadenas ---------- */
  function zona(S, id) {
    const z = zone(id); if (!z) return empty('Zona no encontrada', '');
    const c = activeCampaign(), stores = DB.stores.filter(s => s.zone === z.id), sh = DB.shifts.filter(s => s.campaign === c.id && stores.some(x => x.id === s.store)), st = stats(sh);
    return `${back(isRole('admin') ? 'catalogos/zonas' : 'tiendas', isRole('admin') ? 'Zonas' : 'Tiendas')}
      ${detailHead('map', esc(z.name), `Código ${esc(z.code)} · ${stores.length} tiendas`, isRole('admin') ? btn('Editar', { icon: 'edit', act: 'edit', data: `data-entity="zones" data-id="${z.id}"` }) : '')}
      <div class="grid g-4" style="margin-bottom:20px">${kpi('Cobertura ' + c.code, st.pct + '%', 'sparkle', `${st.f}/${st.cap} plazas`)}${kpi('Turnos sin cubrir', st.uncovered, 'alert', `de ${sh.length}`)}${kpi('Tiendas', stores.length, 'store', `${stores.filter(s => part(c, s.id) === 'Confirmada').length} confirmadas`)}${kpi('Coordinadores', coordsOfZone(z.id, c.id).length, 'users', 'en la campaña activa')}</div>
      <div class="grid g-main"><div class="card"><div class="card-head"><h2>Tiendas de la zona</h2></div>${table([
        { label: 'Tienda', render: r => R.store(r.id) }, { label: 'Cadena', render: r => R.chain(r.chain) }, { label: 'Localidad', render: r => R.loc(r.locality) },
        { label: 'Participación', render: r => badge(part(c, r.id), partTone[part(c, r.id)]) }, { label: 'Cobertura', render: r => { const p = stats(storeShifts(r.id, c.id)).pct; return `<div class="row" style="min-width:120px">${progress(p)}<span class="small">${p}%</span></div>`; } }], stores, { emptyText: 'No hay tiendas en esta zona.' })}</div>
      <div class="card"><div class="card-head"><div><h2>Coordinación por campaña</h2><div class="small muted">zone_assignment</div></div></div>${DB.campaigns.map(cc => `<div class="list-item"><div style="flex:1"><b class="small">${R.campaign(cc.id)}</b><div class="small muted">${coordsOfZone(z.id, cc.id).map(R.user).join(', ') || 'Sin coordinador'}</div></div>${isRole('admin') ? btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'go', data: `data-to="campanas/${cc.id}/coordinacion"` }) : ''}</div>`).join('')}</div></div>`;
  }
  function localidad(S, id) {
    const l = loc(id); if (!l) return empty('Localidad no encontrada', '');
    const stores = scope.stores(S).filter(s => s.locality === l.id), cols = scope.collabs(S).filter(c => c.locality === l.id || c.localities.includes(l.id));
    return `${back(isRole('admin') ? 'catalogos/localidades' : 'tiendas', isRole('admin') ? 'Localidades' : 'Tiendas')}
      ${detailHead('pin', esc(l.name), `Código postal ${esc(l.postal_code)}`, isRole('admin') ? btn('Editar', { icon: 'edit', act: 'edit', data: `data-entity="localities" data-id="${l.id}"` }) : '')}
      <div class="grid g-2"><div class="card"><div class="card-head"><h2>Tiendas</h2>${badge(stores.length, 'plain')}</div>${stores.map(s => `<div class="list-item">${iconBox('store')}<div style="flex:1">${R.store(s.id)}<div class="small muted">${R.chain(s.chain)} · ${R.zone(s.zone)}</div></div></div>`).join('') || '<div class="card-pad small muted">Ninguna.</div>'}</div>
      <div class="card"><div class="card-head"><h2>Colaboradores</h2>${badge(cols.length, 'plain')}</div>${cols.map(c => `<div class="list-item">${avatar(c.name, 'sm')}<div style="flex:1">${R.collab(c.id)}<div class="small muted">${c.locality === l.id ? 'Sede en esta localidad' : 'Colabora aquí'}</div></div></div>`).join('') || '<div class="card-pad small muted">Ninguno.</div>'}</div></div>`;
  }
  function cadena(S, id) {
    const ch = chain(id); if (!ch) return empty('Cadena no encontrada', '');
    const stores = scope.stores(S).filter(s => s.chain === ch.id), c = activeCampaign(), src = c.sources.find(s => s.chain === ch.id), tpl = DB.importTemplates[ch.id];
    return `${back(isRole('admin') ? 'catalogos/cadenas' : 'tiendas', isRole('admin') ? 'Cadenas' : 'Tiendas')}
      ${detailHead('store', esc(ch.name), `Código ${esc(ch.code)} · horario por defecto ${ch.open}–${ch.close} · ${esc(ch.note)}`, isRole('admin') ? btn('Importar listado', { kind: 'primary', icon: 'upload', act: 'go', data: 'data-to="importar"' }) : '')}
      <div class="grid g-main"><div class="card"><div class="card-head"><h2>Tiendas</h2>${badge(stores.length, 'plain')}</div>${table([{ label: 'Tienda', render: r => R.store(r.id) }, { label: 'Código', render: r => r.code ? `<code>${esc(r.code)}</code>` : badge('Sin código', 'warn') }, { label: 'Localidad', render: r => R.loc(r.locality) }, { label: 'Zona', render: r => R.zone(r.zone) }, { label: c.code, render: r => badge(part(c, r.id), partTone[part(c, r.id)]) }], stores)}</div>
      <div class="stack"><div class="card card-pad"><h2 style="margin-bottom:10px">Listado ${esc(c.code)}</h2>${src ? `<div class="row small">${icon('file')}${esc(src.file)}</div><div class="small muted">${src.rows} filas · ${fmtDate(src.date)}</div>` : '<div class="small muted">Aún no recibido.</div>'}</div>
        <div class="card card-pad"><h2 style="margin-bottom:10px">Plantilla de importación</h2>${tpl ? `<dl class="dl small">${Object.entries(tpl.map).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : '<div class="small muted">Se guardará en la primera importación.</div>'}</div></div></div>`;
  }

  /* ---------- Turnos ---------- */
  function turnos(S) {
    const camps = DB.campaigns.filter(c => c.status !== 'Finalizada');
    const c = byId(DB.campaigns, S.f.campaign) || activeCampaign();
    const all = scope.shifts(S, c.id);
    const days = [...new Set(all.map(s => s.date))].sort();
    const day = days.includes(S.f.day) ? S.f.day : days[0];
    const cov = S.f.cov || 'Todos', zf = S.f.zone || '', sf = S.f.store || '';
    const list = all.filter(s => s.date === day && (cov === 'Todos' || coverage(s) === cov) && (!zf || String(byId(DB.stores, s.store).zone) === zf) && (!sf || String(s.store) === sf));
    const storeIds = [...new Set(list.map(s => s.store))];
    const assign = can(S, 'shifts.assign');
    const card = s => { const f = filled(s), reps = DB.reports.filter(r => r.shift === s.id && !r.solved_by).length; return `
      <div class="card shift ${f >= s.capacity ? 'full' : f === 0 ? 'low' : ''} ${String(S.f.focus) === String(s.id) ? 'focus' : ''}">
        <div class="row"><b>${s.slot}</b><span class="small muted">${s.start}–${s.end}</span><span class="spacer"></span>${badge(coverage(s), covTone(s))}</div>
        <div style="margin:10px 0 6px">${progress(f / s.capacity * 100, covTone(s))}</div>
        <div class="row small muted"><span>${f} de ${s.capacity} personas</span><span class="spacer"></span>${reps ? `<a class="ref row" style="color:var(--danger)" href="#" data-act="go-filter" data-to="incidencias" data-k="shift" data-v="${s.id}">${icon('alert')}${reps} incidencia${reps > 1 ? 's' : ''}</a>` : ''}</div>
        <div class="row wrap" style="margin-top:10px;gap:6px">${s.assignments.map((a, i) => `<span class="chip">${asgIcon(a)}${asg(a)}${assign ? `<button data-act="unassign" data-id="${s.id}" data-i="${i}" title="Quitar">${icon('x')}</button>` : ''}</span>`).join('')}</div>
        <div class="row" style="margin-top:10px;gap:4px">${assign && f < s.capacity ? btn('Asignar', { size: 'sm', icon: 'plus', act: 'assign', data: `data-id="${s.id}"` }) : ''}<span class="spacer"></span>${can(S, 'incidents.manage') ? btn('', { kind: 'ghost', size: 'sm', icon: 'alert', act: 'incident', data: `data-id="${s.id}"`, title: 'Registrar incidencia' }) : ''}</div>
      </div>`; };
    const myZones = isRole('admin') ? DB.zones : zonesOf(S.user.id).map(zone);
    return `${pageHead('Turnos', `Mañana de apertura a ${DB.settings.morningEnd} y tarde de ${DB.settings.afternoonStart} a cierre. 2 personas por turno, 4 si la tienda tiene dos líneas de caja.`)}
      <div class="card" style="margin-bottom:16px"><div class="toolbar" style="border:0">
        <div class="seg">${days.map(d => `<button class="${d === day ? 'active' : ''}" data-act="filter" data-k="day" data-v="${d}">${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}${c.days.includes(d) ? '' : ' '}</button>`).join('')}</div>
        <div class="seg">${['Todos', 'Sin cubrir', 'Parcial', 'Cubierto'].map(x => `<button class="${cov === x ? 'active' : ''}" data-act="filter" data-k="cov" data-v="${x}">${x}</button>`).join('')}</div>
        ${isRole('admin', 'coord') ? `<select class="input" style="width:170px" data-filter="zone"><option value="">Todas tus zonas</option>${myZones.map(z => `<option value="${z.id}" ${String(z.id) === zf ? 'selected' : ''}>${esc(z.name)}</option>`).join('')}</select>` : ''}
        ${sf ? `<span class="chip">${icon('store')}${esc(byId(DB.stores, sf).name)}<button data-act="filter" data-k="store" data-v="" title="Quitar filtro">${icon('x')}</button></span>` : ''}
        <span class="spacer"></span><span class="small muted">${list.length} turnos · ${stats(list).f}/${stats(list).cap} plazas</span></div>
        ${days.some(d => !c.days.includes(d)) ? `<div class="small muted" style="padding:0 16px 12px">Día extra por excepción de cadena</div>` : ''}</div>
      ${storeIds.length ? `<div class="stack">${storeIds.map(sid => { const st = byId(DB.stores, sid); return `
        <div><div class="row wrap" style="margin-bottom:10px">${icon('store')}<h3>${R.store(sid)}</h3><span class="small faint">${esc(storeSub(st))} · ${R.loc(st.locality)} · ${R.zone(st.zone)} · ${st.checkout_shelfs} ${st.checkout_shelfs === 2 ? 'líneas' : 'línea'} de caja</span><span class="spacer"></span>
          ${can(S, 'history.view') && DB.history[sid] ? `<span class="small muted">Anterior: ${R.collab(DB.history[sid])}</span>` : ''}</div>
          <div class="grid g-2">${list.filter(s => s.store === sid).map(card).join('')}</div></div>`; }).join('')}</div>` : `<div class="card">${empty('No hay turnos', 'Cambia los filtros o confirma tiendas en la campaña.')}</div>`}`;
  }

  /* ---------- Colaboradores ---------- */
  function colaboradores(S) {
    const list = scope.collabs(S), admin = can(S, 'collabs.create');
    return `${pageHead('Colaboradores', admin ? 'Entidades que aportan voluntariado. Solo Administración las da de alta, las valida y les asigna coordinador.' : 'Colaboradores que tienes asignados para contactar.', exportBtn('collabs') + (admin ? btn('Nuevo colaborador', { kind: 'primary', icon: 'plus', act: 'new-collab' }) : isRole('coord') ? btn('Proponer colaborador', { icon: 'plus', act: 'new-collab' }) : ''))}
      <div class="card">${table([
        { label: 'Colaborador', render: r => `<div class="cell-main">${avatar(r.name)}<div>${R.collab(r.id)}<small>${esc(r.type)}${r.oneCampaign ? ' · Solo una campaña' : ''}</small></div></div>` },
        { label: 'Contacto principal', render: r => { const p = mainContact(r.id); return p ? `${esc(p.name)}<div class="small faint">${esc(p.phone)}</div>` : '—'; } },
        { label: 'Coordinación', render: r => r.coords.map(R.user).join(', ') || '<span class="faint small">Sin asignar</span>' },
        { label: 'Localidad', render: r => R.loc(r.locality) },
        { label: 'Grupos', render: r => r.id === 1 ? `${DB.volunteers.filter(v => v.collab === 1).length} independientes` : r.ownsVolunteers ? DB.groups.filter(g => g.collab === r.id).map(g => R.group(g.id)).join(', ') || '—' : '<span class="small faint">Solo entidad</span>' },
        { label: 'Estado', render: r => badge(r.status, r.status === 'Validado' ? 'ok' : 'warn') },
        { label: 'En ' + activeCampaign().code, render: r => { const p = collabPart(r); if (r.status !== 'Validado') return '<span class="faint small">—</span>';
          return isRole('admin', 'coord') ? `<select class="input inline" data-act-change="collab-camp-status" data-id="${r.id}"><option value="" ${p ? '' : 'selected'}>No incluido</option>${COLLAB_STATUSES.map(x => `<option ${p?.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select>` : badge(p?.status || 'No incluido'); } },
      ], list)}</div>`;
  }

  function colaborador(S, id) {
    const c = byId(DB.collabs, id); if (!c) return empty('Colaborador no encontrado', '');
    const admin = can(S, 'collabs.create'), own = S.user.role === 'rcol' && S.user.collab === c.id, vols = DB.volunteers.filter(v => v.collab === c.id), groups = DB.groups.filter(g => g.collab === c.id);
    const levels = [['Decisor', 'Toma las decisiones (p. ej. alcalde, concejal, dirección)'], ['Responsable colaborador', 'Hace el trabajo, crea los grupos y es el contacto principal del coordinador']];
    const contact = k => `<div class="row" style="padding:8px 0">${avatar(k.name, 'sm')}<div style="flex:1"><b class="small">${k.user ? R.user(k.user) : esc(k.name)}</b><div class="small muted">${icon('phone')} ${esc(k.phone)} · ${esc(k.email)}</div></div>${k.user ? badge('Accede a la app', 'info') : ''}${admin || own ? btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'edit-contact', data: `data-id="${k.id}"`, title: 'Editar contacto' }) + btn('', { kind: 'ghost', size: 'sm', icon: 'x', act: 'del-contact', data: `data-id="${k.id}"` }) : ''}</div>`;
    const camps = DB.collabParticipation.filter(p => p.collab === c.id);
    return `${S.user.role !== 'rcol' ? back('colaboradores', 'Colaboradores') : ''}
      <div class="row wrap" style="margin-bottom:24px;gap:16px">${avatar(c.name, 'lg')}<div style="flex:1"><div class="row"><h1>${esc(c.name)}</h1>${badge(c.status, c.status === 'Validado' ? 'ok' : 'warn')}</div><div class="muted" style="margin-top:4px">${esc(c.type)} · ${esc(c.address)}, ${R.loc(c.locality)} · capacidad ${c.capacity} personas</div></div>
        ${admin && c.status !== 'Validado' ? btn('Validar colaborador', { kind: 'primary', icon: 'check', act: 'validate', data: `data-id="${c.id}"` }) : ''}${admin ? btn('Editar', { icon: 'edit', act: 'edit', data: `data-entity="collabs" data-id="${c.id}"` }) : own ? btn('Proponer cambio', { icon: 'edit', act: 'propose-collab', data: `data-id="${c.id}"` }) : ''}</div>
      ${DB.collabRequests.some(r => r.collab === c.id && (r.status === 'Pendiente' || r.by === S.user.id)) ? `<div class="card" style="margin-bottom:16px"><div class="card-head"><h2>Solicitudes de cambio</h2></div>${DB.collabRequests.filter(r => r.collab === c.id && (r.status === 'Pendiente' || r.by === S.user.id)).map(r => collabRequestItem(S, r)).join('')}</div>` : ''}
      ${c.oneCampaign ? `<div class="card card-pad small" style="margin-bottom:16px;background:var(--warn-bg);border-color:transparent">Sus voluntarios participan en una sola campaña (p. ej. institutos): no se conservan para la siguiente.</div>` : ''}
      <div class="grid g-main"><div class="stack">
        <div class="card"><div class="card-head"><div><h2>Personas de contacto</h2></div>${admin || own ? btn('Añadir contacto', { size: 'sm', icon: 'plus', act: 'add-contact', data: `data-id="${c.id}"` }) : ''}</div>
          <div class="card-pad">${levels.map(([l, d], n) => `<div style="margin-left:${n * 22}px;padding-left:14px;border-left:2px solid var(--border);margin-bottom:12px"><div class="small" style="font-weight:600">${n + 1}. ${l}</div><div class="small faint">${d}</div>${contactsOf(c.id).filter(k => k.level === l).map(contact).join('') || '<div class="small faint" style="padding:6px 0">—</div>'}</div>`).join('')}
            <div style="margin-left:44px;padding-left:14px;border-left:2px solid var(--border)"><div class="small" style="font-weight:600">3. Líderes de grupo</div><div class="small faint">${groups.length ? groups.map(g => R.group(g.id)).join(', ') : 'Sin grupos'}</div></div></div></div>
        ${c.id === 1 ? `<div class="card"><div class="card-head"><div><h2>Voluntarios independientes</h2><div class="small muted">Bancosol los coordina directamente, por eso sí tiene sus datos</div></div>${btn('Ver todos', { size: 'sm', act: 'go', data: 'data-to="voluntarios"' })}</div>${vols.slice(0, 5).map(v => `<div class="list-item">${avatar(v.name, 'sm')}<div style="flex:1">${R.vol(v.id)}<div class="small muted">${R.loc(v.locality)} · ${v.history.length} campañas</div></div>${toPurge(v) ? badge('Propuesto para baja', 'warn') : ''}</div>`).join('')}</div>`
        : `<div class="card"><div class="card-head"><div><h2>Grupos</h2><div class="small muted">${c.ownsVolunteers ? (own ? 'Tú creas los grupos y ves sus voluntarios' : 'Bancosol solo ve el identificador y el número de personas') : 'No gestiona grupos en la app: se asigna la entidad a la tienda con un número de personas'}</div></div>${own ? btn('Gestionar grupos', { size: 'sm', act: 'go', data: 'data-to="grupos"' }) : ''}</div>
          ${c.ownsVolunteers ? (groups.length ? groups.map(g => `<div class="list-item">${iconBox('users')}<div style="flex:1">${R.group(g.id)}<div class="small muted">${gsize(g)} personas · ${g.leader ? 'con líder' : 'sin líder'}</div></div><span class="small faint">${groupShifts(g.id).length} turnos</span></div>`).join('') : empty('Sin grupos', 'El responsable del colaborador aún no ha creado grupos.')) : `<div class="card-pad small muted">Capacidad declarada: <b>${c.capacity} personas</b>.</div>`}</div>`}
      </div><div class="stack">
        <div class="card"><div class="card-head"><div><h2>Coordinación en ${esc(activeCampaign().code)}</h2><div class="small muted">Puede cambiar de una campaña a otra</div></div>${admin ? btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'edit', data: `data-entity="collabs" data-id="${c.id}"` }) : ''}</div>${c.coords.length ? c.coords.map(i => `<div class="list-item">${avatar(user(i).name, 'sm')}<div>${R.user(i)}<div class="small muted">${zonesOf(i).map(R.zone).join(', ')}</div></div></div>`).join('') : `<div class="card-pad small muted">Sin coordinador. Asigna uno para que lo contacte.</div>`}</div>
        <div class="card"><div class="card-head"><div><h2>Tiendas en ${esc(activeCampaign().code)}</h2><div class="small muted">Las asigna coordinación en cada campaña; su responsable gestiona los turnos</div></div>${admin || S.user.role === 'coord' ? btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'edit', data: `data-entity="collabStores" data-id="${c.id}"` }) : ''}</div>${c.stores.length ? c.stores.map(sid => `<div class="list-item"><span class="dot"></span><div style="flex:1">${R.store(sid)}<div class="small muted">${esc(storeSub(byId(DB.stores, sid)))}</div></div></div>`).join('') : '<div class="card-pad small muted">Coordinación le asigna los turnos directamente.</div>'}</div>
        <div class="card"><div class="card-head"><h2>Campañas</h2></div>${camps.filter(p => isRole('admin') || byId(DB.campaigns, p.campaign).status !== 'Finalizada').map(p => `<div class="list-item"><span class="dot"></span><span style="flex:1">${R.campaign(p.campaign)}</span>${badge(p.status || 'Confirmado', { Confirmado: 'ok', 'Pendiente': 'warn', 'No participa': '' }[p.status || 'Confirmado'])}</div>`).join('') || '<div class="card-pad small muted">Aún no ha participado.</div>'}</div>
        ${auditCard('collabs', c.id)}
      </div></div>`;
  }

  /* ---------- Grupos ---------- */
  function grupos(S) {
    const own = S.user.role === 'rcol', list = scope.groups(S);
    if (own) return `${pageHead('Grupos', 'Organiza tus voluntarios en grupos y nombra un líder. Los grupos se conservan entre campañas: revisa sus miembros al empezar cada una. Un voluntario puede estar en varios grupos si sus turnos no coinciden.', btn('Nuevo grupo', { kind: 'primary', icon: 'plus', act: 'group-form' }))}
      ${list.length ? `<div class="grid g-3">${list.map(g => `<div class="card hover card-pad" data-act="go" data-to="grupo/${g.id}"><div class="row" style="margin-bottom:12px">${iconBox('users')}<div style="flex:1"><h2>${esc(g.code)}</h2><div class="small muted">${gsize(g)} personas · ${groupShifts(g.id).length} turnos</div></div>${g.reviewedFor === activeCampaign().id ? badge('Revisado', 'ok') : badge(`Revisar para ${esc(activeCampaign().code)}`, 'warn')}</div>
        <div class="small muted" style="margin-bottom:6px">Líder: <b>${esc(byId(DB.volunteers, g.leader)?.name || 'sin asignar')}</b></div><div class="avatars">${g.members.map(id => avatar(byId(DB.volunteers, id)?.name, 'sm')).join('')}</div>${g.reviewedFor === activeCampaign().id ? '' : `<div class="row" style="margin-top:12px;gap:6px">${btn('Confirmar miembros', { size: 'sm', icon: 'check', act: 'group-review', data: `data-id="${g.id}"` })}${btn('Ajustar', { size: 'sm', icon: 'edit', act: 'group-form', data: `data-id="${g.id}"` })}</div>`}</div>`).join('')}</div>` : `<div class="card">${empty('Aún no tienes grupos', 'Crea un grupo con tus voluntarios para poder asignarlo a turnos.')}</div>`}`;
    return `${pageHead('Grupos', 'Grupos que han creado las entidades colaboradoras. Por protección de datos, solo se ve el identificador y el número de personas.', '')}
      <div class="card" style="margin-bottom:16px;background:var(--info-bg);border-color:transparent"><div class="card-pad row small">${icon('shield')}<span>Los nombres y teléfonos de estos voluntarios solo los ve el responsable de su entidad. Para cualquier gestión, contacta con él.</span></div></div>
      <div class="card">${table([
        { label: 'Grupo', render: r => `<div class="cell-main">${iconBox('users')}<div>${R.group(r.id)}<small>ID ${r.id}</small></div></div>` },
        { label: 'Entidad', render: r => R.collab(r.collab) }, { label: 'Personas', render: r => gsize(r) }, { label: 'Líder', render: r => r.leader ? badge('Asignado', 'ok') : badge('Sin líder', 'warn') },
        { label: 'Turnos', render: r => groupShifts(r.id).length },
      ], list, { emptyText: 'Ninguna entidad de tu ámbito ha creado grupos todavía.' })}</div>`;
  }
  function grupo(S, id) {
    const g = byId(DB.groups, id); if (!g) return empty('Grupo no encontrado', '');
    const own = (S.user.role === 'rcol' && S.user.collab === g.collab) || S.user.group === g.id, sh = groupShifts(g.id), p = mainContact(g.collab);
    return `${isRole('rtienda') ? '' : back('grupos', 'Grupos')}
      ${detailHead('users', esc(g.code), `Grupo de ${R.collab(g.collab)} · ${gsize(g)} personas`, S.user.role === 'rcol' && own ? btn('Editar grupo', { icon: 'edit', act: 'group-form', data: `data-id="${g.id}"` }) : '')}
      <div class="grid g-main"><div class="card"><div class="card-head"><h2>Turnos asignados</h2>${badge(sh.length, 'plain')}</div>${sh.map(s => shiftRow(s)).join('') || empty('Sin turnos', 'Aún no se ha asignado a ningún turno.')}</div>
      <div class="stack">${own ? `<div class="card"><div class="card-head"><h2>Miembros</h2></div>${g.members.map(id => `<div class="list-item">${avatar(byId(DB.volunteers, id)?.name, 'sm')}<div style="flex:1">${R.vol(id)}<div class="small muted">${esc(byId(DB.volunteers, id)?.phone)}</div></div>${id === g.leader ? badge('Líder', 'brand') : ''}</div>`).join('')}</div>`
        : `<div class="card card-pad"><h2 style="margin-bottom:10px">Miembros</h2><p class="small muted" style="margin:0">${gsize(g)} personas. Los datos personales solo los gestiona la entidad.</p></div>`}
        <div class="card card-pad"><h2 style="margin-bottom:10px">Contacto de la entidad</h2>${p ? `<div class="row">${avatar(p.name, 'sm')}<div><b class="small">${esc(p.name)}</b><div class="small muted">${icon('phone')} ${esc(p.phone)}</div></div></div>` : '—'}</div></div></div>`;
  }

  /* ---------- Voluntarios ---------- */
  function voluntarios(S) {
    const cs = new Set(scope.collabs(S).map(c => c.id)), extra = isRole('admin', 'coord') ? DB.volunteers.filter(v => v.collab !== 1 && (isRole('admin') || cs.has(v.collab))) : [];
    const q = (S.f.q || '').toLowerCase(), base = [...new Set([...scope.volunteers(S), ...extra])], vd = S.f.vdata || '';
    const list = base.filter(v => (vName(v) + (anonV(v) ? '' : v.phone) + (loc(v.locality)?.name || '')).toLowerCase().includes(q) && (S.f.vstate !== 'baja' || toPurge(v)) && (!vd || (vd === 'anon') === anonV(v)));
    const purge = base.filter(toPurge).length, canConfirm = isRole('admin', 'coord', 'rcol');
    if (S.f.vtab === 'entidades' && isRole('admin', 'coord')) return anonymousVolunteers(S);
    return `${pageHead('Voluntarios', S.user.role === 'rcol' ? 'Los voluntarios de tu entidad. Solo tú ves y gestionas sus datos.' : 'Voluntarios independientes con sus datos y, anonimizados, los de las entidades. Solo vemos los datos que cada entidad comparte.', btn('Importar Excel', { icon: 'upload', act: 'vol-import' }) + btn('Nuevo voluntario', { kind: 'primary', icon: 'plus', act: 'new', data: 'data-entity="volunteers"' }))}
      ${purge ? `<div class="card" style="margin-bottom:16px;background:var(--warn-bg);border-color:transparent"><div class="card-pad row wrap">${icon('alert')}<div style="flex:1"><b>${purge} voluntarios llevan ${DB.settings.inactiveCampaigns} o más campañas sin participar.</b><div class="small muted">La app propone darlos de baja. ${canConfirm ? 'Debes confirmarlo.' : 'Lo confirmará coordinación o administración.'}</div></div>${canConfirm ? btn('Revisar propuesta', { kind: 'primary', size: 'sm', act: 'purge' }) : ''}</div></div>` : ''}
      <div class="card"><div class="toolbar"><div class="input-icon" style="width:240px">${icon('search')}<input class="input" placeholder="Nombre, teléfono, localidad…" data-filter="q" value="${esc(S.f.q || '')}"></div>
        <span class="spacer"></span>${extra.length ? `<div class="seg">${[['', 'Todos'], ['datos', 'Con datos'], ['anon', 'Anonimizados']].map(([k, l]) => `<button class="${vd === k ? 'active' : ''}" data-act="filter" data-k="vdata" data-v="${k}">${l}</button>`).join('')}</div>` : ''}<div class="seg">${[['', 'Todos'], ['baja', 'Propuestos para baja']].map(([k, l]) => `<button class="${(S.f.vstate || '') === k ? 'active' : ''}" data-act="filter" data-k="vstate" data-v="${k}">${l}</button>`).join('')}</div></div>
      ${table([
        { label: 'Voluntario', render: r => `<div class="cell-main">${avatar(anonV(r) ? '?' : r.name)}<div>${R.vol(r.id)}</div></div>` },
        { label: 'Entidad', render: r => R.collab(r.collab) },
        { label: 'Teléfono', render: r => anonV(r) ? '<span class="faint small">Oculto</span>' : esc(r.phone) }, { label: 'Localidad', render: r => R.loc(r.locality) },
        { label: 'Grupos', render: r => DB.groups.filter(x => x.members.includes(r.id)).map(g => R.group(g.id)).join(', ') || '<span class="faint small">—</span>' },
        { label: 'Participación', render: r => r.history.length ? `<div class="row wrap" style="gap:4px">${r.history.map(h => badge(h, 'plain')).join('')}</div>` : '<span class="faint small">Nuevo</span>' },
        { label: 'Estado', render: r => r.blocked ? badge('Bloqueado', 'danger') : toPurge(r) ? badge(`${missed(r)} sin participar`, 'warn') : badge('Activo') },
        { label: '', width: '90px', render: r => anonV(r) ? '' : rowActions('volunteers', r.id) },
      ], list)}</div>`;
  }
  const volTabs = S => isRole('admin', 'coord') ? `<div class="tabs">${[['', 'Independientes (Bancosol)'], ['entidades', 'Voluntarios de entidades']].map(([k, l]) => `<button class="tab ${(S.f.vtab || '') === k ? 'active' : ''}" data-act="filter" data-k="vtab" data-v="${k}">${l}</button>`).join('')}</div>` : '';
  function anonymousVolunteers(S) {
    const cs = new Set(scope.collabs(S).map(c => c.id)), q = (S.f.q || '').toLowerCase();
    const list = DB.volunteers.filter(v => v.collab !== 1 && (isRole('admin') || cs.has(v.collab)) && (globalId(v) + byId(DB.collabs, v.collab).name).toLowerCase().includes(q));
    return `${pageHead('Voluntarios', 'Por protección de datos, de los voluntarios de entidades solo se ve su identificador global, su historial e incidencias. Los datos personales los gestiona su responsable.', '')}${volTabs(S)}
      <div class="card"><div class="toolbar"><div class="input-icon" style="width:240px">${icon('search')}<input class="input" placeholder="Identificador o entidad…" data-filter="q" value="${esc(S.f.q || '')}"></div><span class="spacer"></span><span class="small muted">${list.length} voluntarios</span></div>
      ${table([{ label: 'Identificador', render: r => link(`voluntario/${r.id}`, esc(globalId(r))) }, { label: 'Entidad', render: r => R.collab(r.collab) },
        { label: 'Campañas', render: r => r.history.length ? r.history.map(h => badge(h, 'plain')).join(' ') : '<span class="faint small">Nuevo</span>' },
        { label: 'Incidencias', render: r => volReports(r).length ? badge(volReports(r).length, 'danger') : '<span class="faint">—</span>' },
        { label: 'Estado', render: r => r.blocked ? badge('Bloqueado', 'danger') : toPurge(r) ? badge('Propuesto para baja', 'warn') : badge('Activo') },
        { label: '', width: '120px', render: r => isRole('admin') ? btn(r.blocked ? 'Desbloquear' : 'Bloquear', { size: 'sm', kind: r.blocked ? '' : 'ghost danger', act: 'vol-block', data: `data-id="${r.id}"` }) : '' }], list)}</div>`;
  }
  function voluntario(S, id) {
    const v = byId(DB.volunteers, id); if (!canViewVolunteer(S, v)) return empty('Voluntario no disponible', 'No tienes acceso a sus datos.');
    const gs = DB.groups.filter(x => x.members.includes(v.id)), sh = volShifts(v).filter(shift => scope.shifts(S, shift.campaign).some(visible => visible.id === shift.id));
    if (anonV(v)) return `${back('voluntarios', 'Voluntarios')}${detailHead('user', esc(vName(v)), '')}<div class="card"><div class="card-head"><h2>Turnos</h2></div>${sh.map(shift => `<div class="list-item"><div><b>${esc(byId(DB.stores, shift.store)?.name || 'Tienda')}</b><div class="small muted">${fmtDate(shift.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${esc(shift.start)}–${esc(shift.end)}</div></div></div>`).join('') || empty('Sin turnos', 'No tiene turnos asignados en tu ámbito.')}</div>`;
    return `${back('voluntarios', 'Voluntarios')}
      ${detailHead('user', esc(v.name), `${R.collab(v.collab)} · ${R.loc(v.locality)} · ${esc(v.phone)}`, btn('Editar', { icon: 'edit', act: 'edit', data: `data-entity="volunteers" data-id="${v.id}"` }), toPurge(v) ? badge('Propuesto para baja', 'warn') : '')}
      <div class="grid g-2 volunteer-detail"><div class="card"><div class="card-head"><h2>Turnos</h2></div>${sh.map(s => shiftRow(s)).join('') || empty('Sin turnos', 'No tiene turnos asignados.')}</div>
      <div class="stack"><div class="card card-pad"><h2>Datos de contacto</h2><dl class="dl volunteer-details"><dt>Teléfono</dt><dd>${esc(v.phone || '—')}</dd><dt>Localidad</dt><dd>${R.loc(v.locality)}</dd><dt>Entidad</dt><dd>${R.collab(v.collab)}</dd></dl></div>
      <div class="card card-pad"><h2>Datos del voluntario</h2><dl class="dl volunteer-details"><dt>Grupos</dt><dd>${gs.map(g => R.group(g.id) + (g.leader === v.id ? ' ' + badge('Líder', 'brand') : '')).join(', ') || 'Suelto'}</dd><dt>Identificador</dt><dd><code>${globalId(v)}</code></dd><dt>Edad</dt><dd>${v.minor ? `Menor · tutor: ${esc(v.tutorName || '—')} ${esc(v.tutorPhone || '')} · ${v.consent ? 'autorización recibida' : 'falta autorización'}` : 'Mayor de edad'}</dd><dt>Dónde colabora</dt><dd>${(v.localities || []).map(R.loc).join(', ') || '—'}</dd><dt>Incidencias</dt><dd>${volReports(v).length}</dd>${v.blocked ? `<dt>Estado</dt><dd>${badge('Bloqueado por Bancosol', 'danger')}</dd>` : ''}<dt>Campañas</dt><dd>${v.history.map(h => badge(h, 'plain')).join(' ') || 'Ninguna'}</dd></dl></div></div></div>`;
  }

  /* ---------- Incidencias (report) ---------- */
  function incidencias(S) {
    const c = activeCampaign(), shIds = new Set(scope.shifts(S, c.id).map(s => s.id));
    const sf = S.f.shift || '', st = S.f.rstate || 'abiertas';
    const rows = DB.reports.filter(r => r.campaign === c.id && shIds.has(r.shift) && (!sf || String(r.shift) === sf) && (st === 'todas' || (st === 'abiertas' ? !r.solved_by : r.solved_by))).sort((a, b) => (!a.solved_by && a.urgent ? 0 : 1) - (!b.solved_by && b.urgent ? 0 : 1));
    return `${pageHead('Incidencias', 'Ausencias, voluntarios que no se presentan, falta de petos… Las urgentes salen primero. Las resuelven coordinación, el responsable del colaborador o administración.', exportBtn('reports'))}
      <div class="row wrap" style="margin-bottom:16px"><div class="seg">${[['abiertas', 'Abiertas'], ['resueltas', 'Resueltas'], ['todas', 'Todas']].map(([k, l]) => `<button class="${st === k ? 'active' : ''}" data-act="filter" data-k="rstate" data-v="${k}">${l}</button>`).join('')}</div>
        ${sf ? `<span class="chip">${icon('clock')}Turno ${esc(byId(DB.stores, byId(DB.shifts, sf).store).name)}<button data-act="filter" data-k="shift" data-v="" title="Quitar filtro">${icon('x')}</button></span>` : ''}</div>
      <div class="card">${table([
        { label: 'Tipo', render: r => `${badge(rtype(r.type).name, r.solved_by ? 'ok' : r.urgent ? 'danger' : 'warn')}${r.urgent && !r.solved_by ? ' ' + badge('Urgente', 'danger') : ''}` },
        { label: 'Turno', render: r => { const s = byId(DB.shifts, r.shift); return `${R.store(s.store)}<div class="small">${R.shift(s)}</div>`; } },
        { label: 'Descripción', render: r => `<span class="small">${esc(r.description)}</span>${r.solution ? `<div class="small" style="color:var(--ok)">${icon('check')} ${esc(r.solution)}</div>` : ''}` },
        { label: 'Reportada por', render: r => `<span class="small">${R.user(r.reported_by)}</span><div class="small faint">${fmtDate(r.creation_date)}</div>${r.solved_by ? '' : `<div class="small" style="color:${r.urgent ? 'var(--danger)' : 'var(--warn)'}">Sin resolver ${ago(r.creation_date)}${r.urgent ? ' · se recuerda cada hora' : ''}</div>`}` },
        { label: '', render: r => r.solved_by ? `<span class="small muted">Resuelta por ${R.user(r.solved_by)}</span>` : can(S, 'incidents.resolve') ? `<div class="row" style="gap:4px;justify-content:flex-end">${btn('Buscar sustituto', { size: 'sm', icon: 'users', act: 'find-substitute', data: `data-id="${r.id}"` })}${btn('Resolver', { size: 'sm', icon: 'check', act: 'resolve', data: `data-id="${r.id}"` })}</div>` : '<span class="small faint">Pendiente</span>' },
      ], rows, { emptyText: 'No hay incidencias con este filtro.' })}</div>`;
  }

  /* ---------- Usuarios ---------- */
  const userScope = r => r.role === 'coord' ? zonesOf(r.id).map(R.zone).join(', ') || '<span class="faint">Sin zonas en la campaña</span>' : r.group ? 'Grupo ' + R.group(r.group) : r.collab ? R.collab(r.collab) : 'Toda la organización';
  function usuarios(S, tab = 'usuarios') {
    const body = tab === 'roles' ? `
      <div class="grid g-4" style="margin-bottom:20px">${DB.roles.map(r => `<div class="card card-pad"><div class="row" style="margin-bottom:10px"><span class="dot" style="background:${r.color}"></span><b>${esc(r.name)}</b></div><div class="small muted">${esc(r.desc)}</div><div class="small faint" style="margin-top:12px">${DB.users.filter(u => u.role === r.id).length} usuarios</div></div>`).join('')}</div>
      <div class="card"><div class="card-head"><div><h2>Matriz de permisos</h2><div class="small muted">Solo lectura · Los voluntarios no tienen acceso.</div></div>${btn('Editar permisos', { icon: 'lock', act: 'perm-edit' })}</div>
        <div class="table-wrap"><table class="matrix"><thead><tr><th>Permiso</th>${DB.roles.map(r => `<th>${esc(r.name)}</th>`).join('')}</tr></thead><tbody>
        ${DB.permissions.map(([k, l]) => `<tr><td><b>${esc(l)}</b></td>${DB.roles.map(r => `<td>${DB.rolePerms[r.id].includes(k) ? `<span style="color:var(--ok)">${icon('check')}</span>` : '<span class="faint">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>` : `
      <div class="card">${table([
        { label: 'Usuario', render: r => `<div class="cell-main">${avatar(r.name)}<div>${R.user(r.id)}${r.id === S.user.id ? ' <span class="badge brand plain">Tú</span>' : ''}<small>${esc(r.email)}</small></div></div>` },
        { label: 'Rol', render: r => `<span class="row small"><span class="dot" style="background:${role(r.role).color}"></span>${esc(role(r.role).name)}</span>` },
        { label: 'Ámbito', render: r => `<span class="small">${userScope(r)}</span>` },
        { label: 'Estado', render: r => badge(r.status, r.status === 'Inactivo' ? 'danger' : undefined) }, { label: 'Último acceso', render: r => `<span class="muted small">${esc(r.last)}</span>` },
        { label: '', width: '130px', render: r => `<span class="row" style="gap:4px;justify-content:flex-end">${btn('', { kind: 'ghost', size: 'sm', icon: 'shield', act: 'reset-password', title: 'Restablecer contraseña', data: `data-id="${r.id}"` })}${btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'edit', data: `data-entity="users" data-id="${r.id}"`, title: 'Editar' })}${btn('', { kind: r.status === 'Inactivo' ? 'ghost' : 'ghost danger', size: 'sm', icon: r.status === 'Inactivo' ? 'check' : 'x', act: 'delete', data: `data-entity="users" data-id="${r.id}"`, title: r.status === 'Inactivo' ? 'Reactivar' : 'Desactivar' })}</span>` },
      ], DB.users)}</div>`;
    return `${pageHead('Usuarios y roles', 'Quién accede a la intranet, con qué rol y sobre qué ámbito.', btn('Invitar usuario', { kind: 'primary', icon: 'mail', act: 'new', data: 'data-entity="users"' }), 'Administración')}
      <div class="tabs">${[['usuarios', `Usuarios (${DB.users.length})`], ['roles', 'Roles y permisos']].map(([k, l]) => `<button class="tab ${tab === k ? 'active' : ''}" data-act="go" data-to="usuarios/${k}">${l}</button>`).join('')}</div><div class="fade-in">${body}</div>`;
  }
  function usuario(S, id, self = false) {
    const u = user(id); if (!u) return empty('Usuario no encontrado', '');
    const r = role(u.role), za = DB.zoneAssignments.filter(z => z.user === u.id);
    const reps = DB.reports.filter(x => x.reported_by === u.id);
    return `${self ? pageHead('Mi perfil', 'Tus datos y lo que puedes hacer con tu rol.') : back('usuarios', 'Usuarios')}
      <div class="grid g-main"><div class="stack"><div class="card card-pad"><div class="row" style="gap:16px;margin-bottom:24px">${avatar(u.name, 'lg')}<div><h2 style="font-size:20px">${esc(u.name)}</h2><div class="row small muted" style="margin-top:4px"><span class="dot" style="background:${r.color}"></span>${esc(r.name)} · @${esc(u.username)}</div></div><span class="spacer"></span>${btn('Editar', { icon: 'edit', act: 'edit', data: `data-entity="users" data-id="${u.id}"` })}</div>
        <dl class="dl"><dt>Email</dt><dd>${esc(u.email)}</dd><dt>Teléfono</dt><dd>${esc(u.phone)}</dd><dt>Ámbito</dt><dd>${userScope(u)}</dd><dt>Último acceso</dt><dd>${esc(u.last)}</dd></dl></div>
        ${u.role === 'coord' ? `<div class="card"><div class="card-head"><div><h2>Zonas por campaña</h2><div class="small muted">zone_assignment</div></div></div>${DB.campaigns.map(c => { const zs = za.filter(z => z.campaign === c.id); return `<div class="list-item"><div style="flex:1"><b class="small">${R.campaign(c.id)}</b><div class="small muted">${zs.map(z => R.zone(z.zone)).join(', ') || 'Sin zonas'}</div></div>${isRole('admin') ? btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'go', data: `data-to="campanas/${c.id}/coordinacion"` }) : ''}</div>`; }).join('')}</div>
          <div class="card"><div class="card-head"><h2>Colaboradores asignados</h2></div>${DB.collabs.filter(c => c.coords.includes(u.id)).map(c => `<div class="list-item">${avatar(c.name, 'sm')}${R.collab(c.id)}</div>`).join('') || '<div class="card-pad small muted">Ninguno.</div>'}</div>` : ''}
        ${reps.length ? `<div class="card"><div class="card-head"><h2>Incidencias registradas</h2></div>${reps.map(x => `<div class="list-item">${badge(rtype(x.type).name, x.solved_by ? 'ok' : 'danger')}<span class="small" style="flex:1">${esc(x.description)}</span>${R.shift(byId(DB.shifts, x.shift))}</div>`).join('')}</div>` : ''}</div>
      <div class="card card-pad"><h2 style="margin-bottom:6px">Permisos del rol</h2><div class="small muted" style="margin-bottom:14px">${esc(r.desc)}</div>${DB.permissions.map(([k, l]) => { const ok = DB.rolePerms[u.role].includes(k); return `<div class="row small" style="padding:6px 0;${ok ? '' : 'color:var(--text-3)'}">${icon(ok ? 'check' : 'x')}${esc(l)}</div>`; }).join('')}</div></div>`;
  }
  const perfil = S => usuario(S, S.user.id, true);

  /* ---------- Catálogos ---------- */
  function catalogos(S, tab = 'zonas') {
    const T = {
      zonas: ['Zonas', 'zones', [{ label: 'Zona', render: r => R.zone(r.id) }, { label: 'Código', render: r => `<code>${esc(r.code)}</code>` }, { label: 'Tiendas', render: r => DB.stores.filter(s => s.zone === r.id).length }, { label: `Coordinación ${activeCampaign().code}`, render: r => coordsOfZone(r.id).map(R.user).join(', ') || '<span class="faint small">Sin asignar</span>' }]],
      localidades: ['Localidades', 'localities', [{ label: 'Localidad', render: r => R.loc(r.id) }, { label: 'Código postal', render: r => esc(r.postal_code) }, { label: 'Tiendas', render: r => DB.stores.filter(s => s.locality === r.id).length }, { label: 'Colaboradores', render: r => DB.collabs.filter(c => c.locality === r.id).length }]],
      cadenas: ['Cadenas', 'chains', [{ label: 'Cadena', render: r => R.chain(r.id) }, { label: 'Código', render: r => `<code>${esc(r.code)}</code>` }, { label: 'Tiendas', render: r => DB.stores.filter(s => s.chain === r.id).length }, { label: 'Plantilla', render: r => DB.importTemplates[r.id] ? badge('Guardada', 'ok') : badge('—', 'plain') }]],
      tipos: ['Tipos de campaña', 'campaignTypes', [{ label: 'Tipo', render: r => esc(r.name) }, { label: 'Campañas', render: r => DB.campaigns.filter(c => c.type === r.id).map(c => R.campaign(c.id)).join(', ') || '—' }]],
      incidencias: ['Tipos de incidencia', 'reportTypes', [{ label: 'Tipo', render: r => esc(r.name) }, { label: 'Incidencias', render: r => DB.reports.filter(x => x.type === r.id).length }]],
      solicitudes: [`Solicitudes${DB.catalogRequests.filter(r => r.status === 'Pendiente').length ? ` (${DB.catalogRequests.filter(r => r.status === 'Pendiente').length})` : ''}`, null, []],
    };
    const [title, entity, cols] = T[tab] || T.zonas, showArchived = S.f.archived === '1';
    return `${pageHead(tab === 'solicitudes' ? 'Solicitudes' : 'Catálogos', tab === 'solicitudes' ? 'Peticiones de coordinación para dar de alta localidades o zonas.' : 'Datos maestros que se usan en el resto de la aplicación. Se eligen siempre de una lista, nunca como texto libre.', entity ? btn('Añadir', { kind: 'primary', icon: 'plus', act: 'new', data: `data-entity="${entity}"` }) : '', 'Administración')}
      ${isRole('admin') ? '' : `<div class="tabs">${Object.entries(T).map(([k, [l]]) => `<button class="tab ${(T[tab] ? tab : 'zonas') === k ? 'active' : ''}" data-act="go" data-to="catalogos/${k}">${l}</button>`).join('')}</div>`}
      ${entity ? `<div class="card fade-in"><div class="toolbar"><span class="small muted">Los elementos no se borran: se archivan y dejan de aparecer en las listas.</span><span class="spacer"></span><label class="row small"><input type="checkbox" class="check" data-act="toggle-archived" ${showArchived ? 'checked' : ''}>Ver archivados</label></div>${table([...cols.map((col, i) => i ? col : { ...col, render: r => col.render(r) + (r.archived ? ' ' + badge('Archivado') : '') }), { label: '', width: '110px', render: r => r.archived ? btn('Restaurar', { size: 'sm', act: 'restore-catalog', data: `data-entity="${entity}" data-id="${r.id}"` }) : rowActions(entity, r.id) }], DB[entity].filter(r => showArchived || !r.archived))}</div>`
        : `<div class="card fade-in">${DB.catalogRequests.length ? DB.catalogRequests.slice().reverse().map(r => `<div class="list-item">${iconBox(r.kind === 'zone' ? 'map' : 'pin')}<div style="flex:1"><b class="small">${r.kind === 'zone' ? 'Zona' : 'Localidad'} «${esc(r.name)}»${r.postal_code ? ` · CP ${esc(r.postal_code)}` : ''}</b><div class="small muted">${R.user(r.by)} · ${fmtDate(r.date)}${r.note ? ` · «${esc(r.note)}»` : ''}</div></div>
          ${r.status === 'Pendiente' ? btn('Rechazar', { size: 'sm', act: 'review-catalog', data: `data-id="${r.id}" data-ok=""` }) + btn('Crear', { kind: 'primary', size: 'sm', icon: 'check', act: 'review-catalog', data: `data-id="${r.id}" data-ok="1"` }) : badge(r.status, r.status === 'Aceptada' ? 'ok' : '')}</div>`).join('') : empty('Sin solicitudes', 'Coordinación no ha pedido localidades ni zonas nuevas.')}</div>`}`;
  }

  function configuracion() {
    const st = DB.settings;
    const f = (k, l, t = 'text', h = '') => `<div class="field"><label>${l}</label><input class="input" name="${k}" type="${t}" value="${esc(st[k])}">${h ? `<span class="hint">${h}</span>` : ''}</div>`;
    return `${pageHead('Configuración', 'Reglas por defecto de turnos y depuración de voluntarios.', btn('Ir a catálogos', { icon: 'list', act: 'go', data: 'data-to="catalogos"' }), 'Administración')}
      <div class="card" style="max-width:720px"><div class="card-head"><h2>Turnos por defecto</h2></div><div class="card-pad"><form id="settings-form" class="form-grid">
          ${f('morningEnd', 'Fin del turno de mañana', 'time', 'Empieza a la apertura de la tienda (schedule)')}${f('afternoonStart', 'Inicio del turno de tarde', 'time', 'Termina al cierre de la tienda')}
          ${f('baseCapacity', 'Personas por turno', 'number')}${f('twoLinesCapacity', 'Con dos líneas de caja', 'number')}
          ${f('inactiveCampaigns', 'Proponer baja tras… campañas sin participar', 'number', 'La baja la confirma el responsable de cada colaborador (o Administración)')}
        </form><div class="row" style="margin-top:16px;justify-content:flex-end">${btn('Guardar cambios', { kind: 'primary', act: 'save-settings' })}</div></div></div>`;
  }

  return { bind: S => { CS = S; }, historico, inicio, campanas, campana, tiendas, tienda, zona, localidad, cadena, turnos, colaboradores, colaborador, grupos, grupo, voluntarios, voluntario, incidencias, usuarios, usuario, perfil, catalogos, configuracion,
    helpers: { collaboratorShifts, catalogTabs, vName, anonV, canViewVolunteer, exportBtn, auditCard, SEQ, globalId, volShifts, hasAdult, overlaps, memberClashes, COLLAB_STATUSES, COLLAB_FIELDS, collabPart, linkCollab, asgPeople, asgIcon, stats, STORE_FIELDS, activeCampaigns, R, gsize, byId, filled, coverage, can, role, chain, zone, loc, scope, toPurge, missed, asgText, activeCampaign, iconBox, storeSub, zonesOf, part } };
})();

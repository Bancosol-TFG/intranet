/* Turnos: calendario semanal por tienda, listado de tiendas, edición de turnos y avisos. */
window.Shifts = (() => {
  const { esc, icon, badge, btn, progress, empty, pageHead, fmtDate, modal, toast, close } = UI;
  const H = () => Views.helpers;
  const HOUR_FROM = 8, HOUR_TO = 22, HOUR_PX = 44;
  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const toMinutes = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
  const addDays = (date, n) => { const d = new Date(date + 'T12:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const weekOf = date => { const d = new Date(date + 'T12:00'), shift = (d.getDay() + 6) % 7; return Array.from({ length: 7 }, (_, i) => addDays(date, i - shift)); };
  const campaignDates = c => [...c.days, ...c.exceptions.map(e => e.date)];
  const over = s => H().filled(s) - s.capacity;

  const recipients = (s, actorId) => { const st = H().byId(DB.stores, s.store), ids = new Set();
    s.assignments.forEach(a => { const collab = a.kind === 'group' ? H().byId(DB.groups, a.group)?.collab : a.kind === 'collab' ? a.collab : H().byId(DB.volunteers, a.vol)?.collab;
      if (a.kind === 'group') DB.users.filter(u => u.group === a.group).forEach(u => ids.add(u.id));
      DB.users.filter(u => u.role === 'rcol' && u.collab === collab).forEach(u => ids.add(u.id)); });
    DB.zoneAssignments.filter(z => z.zone === st.zone && z.campaign === s.campaign).forEach(z => ids.add(z.user));
    ids.delete(actorId); return [...ids]; };
  const notify = (S, s, text, reason, extra = []) => { const to = new Set([...recipients(s, S.user.id), ...extra.filter(id => id !== S.user.id)]);
    to.forEach(id => DB.notifications.unshift({ id: DB.notifications.length + 1, to: id, from: S.user.id, text, reason, shift: s.id, store: s.store, when: 'Ahora', read: false }));
    Object.assign(s, { editedBy: S.user.id, editedAt: 'ahora' }); DB.audit.push({ entity: 'shifts', id: s.id, who: S.user.id, when: '2026-11-12 ' + new Date().toTimeString().slice(0, 5), text: text + (reason ? ` · Motivo: ${reason}` : '') }); return to.size; };
  const leadersOf = a => a.kind === 'group' ? DB.users.filter(u => u.group === a.group).map(u => u.id) : [];
  const shiftLabel = s => `${H().byId(DB.stores, s.store).name} · ${fmtDate(s.date, { weekday: 'short', day: 'numeric' })} ${s.start}–${s.end}`;

  /* ---------- Vista ---------- */
  function view(S) {
    const camps = DB.campaigns.filter(c => c.status !== 'Finalizada'), c = H().byId(DB.campaigns, S.f.campaign) || H().activeCampaign();
    const stores = H().scope.stores(S).filter(st => DB.shifts.some(s => s.campaign === c.id && s.store === st.id));
    const tab = S.f.tab === 'tiendas' ? 'tiendas' : 'calendario';
    const head = pageHead('Turnos', `Turnos libres dentro del horario de la tienda; por defecto mañana (apertura–${DB.settings.morningEnd}) y tarde (${DB.settings.afternoonStart}–cierre). 2 personas por turno, 4 con dos líneas de caja.`,
      H().exportBtn('shifts'));
    const tabs = `<div class="tabs">${[['calendario', 'Calendario por tienda'], ['tiendas', 'Listado de tiendas']].map(([k, l]) => `<button class="tab ${tab === k ? 'active' : ''}" data-act="filter" data-k="tab" data-v="${k}">${l}</button>`).join('')}</div>`;
    return head + tabs + `<div class="fade-in">${tab === 'tiendas' ? storeList(S, c, stores) : calendar(S, c, stores)}</div>`;
  }

  function storeList(S, c, stores) {
    const q = (S.f.q || '').toLowerCase(), zf = S.f.zone || '', cov = S.f.cov || 'Todos', only = S.f.store || '';
    const rows = stores.map(st => { const sh = DB.shifts.filter(s => s.campaign === c.id && s.store === st.id), stt = H().stats(sh);
      return { st, sh, stt, overs: sh.filter(s => over(s) > 0).length, reps: DB.reports.filter(r => !r.solved_by && sh.some(s => s.id === r.shift)).length }; })
      .filter(r => (!only || String(r.st.id) === only) && r.st.name.toLowerCase().includes(q) && (!zf || String(r.st.zone) === zf)
        && (cov === 'Todos' || (cov === 'Por cubrir' ? r.stt.uncovered : cov === 'Sobrecupo' ? r.overs : !r.stt.uncovered)));
    const zones = H().scope.stores(S).map(s => s.zone).filter((z, i, a) => z && a.indexOf(z) === i);
    return `<div class="card"><div class="toolbar"><div class="input-icon" style="width:220px">${icon('search')}<input class="input" placeholder="Buscar tienda…" data-filter="q" value="${esc(S.f.q || '')}"></div>
        <select class="input" style="width:220px" data-filter="store"><option value="">Todas las tiendas</option>${stores.map(st => `<option value="${st.id}" ${String(st.id) === only ? 'selected' : ''}>${esc(st.name)}</option>`).join('')}</select>
        <select class="input" style="width:170px" data-filter="zone"><option value="">Todas las zonas</option>${zones.map(z => `<option value="${z}" ${String(z) === zf ? 'selected' : ''}>${esc(H().zone(z).name)}</option>`).join('')}</select>
        <div class="seg">${['Todos', 'Por cubrir', 'Sobrecupo', 'Cubiertas'].map(x => `<button class="${cov === x ? 'active' : ''}" data-act="filter" data-k="cov" data-v="${x}">${x}</button>`).join('')}</div>
        <span class="spacer"></span><span class="small muted">${rows.length} tiendas</span></div>
      ${UI.table([
        { label: 'Tienda', render: r => `${H().R.store(r.st.id)}<div class="small faint">${esc(H().storeSub(r.st))} · ${H().R.zone(r.st.zone)}</div>` },
        { label: 'Días y turnos', render: r => `<div class="row wrap" style="gap:4px">${r.sh.map(s => `<span class="badge ${({ 'Sin cubrir': 'danger', Parcial: 'warn', Cubierto: 'ok' })[H().coverage(s)]}" title="${esc(shiftLabel(s))}">${fmtDate(s.date, { weekday: 'short' })} ${s.start}</span>`).join('')}</div>` },
        { label: 'Plazas', render: r => `<div style="width:120px">${progress(r.stt.pct, r.stt.pct >= 100 ? 'ok' : r.stt.pct < 40 ? 'danger' : 'warn')}<div class="small faint" style="margin-top:4px">${r.stt.f}/${r.stt.cap}</div></div>` },
        { label: 'Por cubrir', render: r => r.stt.uncovered ? badge(r.stt.uncovered, 'danger') : '<span class="faint">—</span>' },
        { label: 'Sobrecupo', render: r => r.overs ? badge(r.overs, 'warn') : '<span class="faint">—</span>' },
        { label: 'Incidencias', render: r => r.reps ? badge(r.reps, 'danger') : '<span class="faint">—</span>' },
        { label: 'Colaboradores', render: r => [...new Set(r.sh.flatMap(s => s.assignments.map(a => a.kind === 'group' ? H().byId(DB.groups, a.group)?.collab : a.kind === 'collab' ? a.collab : H().byId(DB.volunteers, a.vol)?.collab)))].filter(Boolean).map(H().R.collab).join(', ') || '<span class="faint">—</span>' },
        { label: '', width: '120px', render: r => btn('Calendario', { size: 'sm', icon: 'cal', act: 'cal-store', data: `data-id="${r.st.id}"` }) },
      ], rows.map(r => ({ ...r, id: r.st.id })))}</div>`;
  }

  /* Panel derecho de la vista dividida: candidatos compatibles con el turno seleccionado; se arrastran al turno o se asignan con un clic */
  function sidePanel(S, c, sh) {
    const s = sh.find(x => x.id === S.f.sel);
    if (!s) return `<aside class="card card-pad side-pick"><h3>Asignar</h3><p class="small muted">Selecciona un turno del calendario para ver los grupos y voluntarios disponibles en esa franja.</p></aside>`;
    const busy = (pred) => DB.shifts.some(x => x.date === s.date && x.start < s.end && s.start < x.end && x.assignments.some(pred));
    const q = (S.f.pq || '').toLowerCase(), free = s.capacity - H().filled(s);
    const groups = H().scope.groups(S).filter(g => !g.archived && !busy(a => a.kind === 'group' && a.group === g.id) && g.code.toLowerCase().includes(q));
    const vols = H().scope.volunteers(S).filter(v => !v.blocked && !busy(a => a.kind === 'vol' && a.vol === v.id) && H().vName(v).toLowerCase().includes(q));
    const byCollab = {}; groups.forEach(g => (byCollab[g.collab] ||= []).push(g));
    const item = (kind, ref, title, sub) => `<div class="pick" draggable="true" data-drag-kind="${kind}" data-drag-ref="${ref}" data-act="do-assign" data-id="${s.id}" data-kind="${kind}" data-ref="${ref}"><div style="flex:1"><b class="small">${esc(title)}</b><div class="small muted">${sub}</div></div>${icon('plus')}</div>`;
    return `<aside class="card card-pad side-pick"><div class="row"><h3 style="margin:0">${esc(s.date)} · ${s.start}–${s.end}</h3><span class="spacer"></span>${btn('', { kind: 'ghost', size: 'sm', icon: 'expand', act: 'shift-detail', data: `data-id="${s.id}"`, title: 'Ver detalle' })}</div>
      <p class="small muted">${free > 0 ? `Faltan ${free} personas` : 'Turno completo'} · solo aparecen los libres en esta franja. Arrastra al turno o pulsa para asignar.</p>
      <input class="input" placeholder="Filtrar por nombre…" data-filter="pq" value="${esc(S.f.pq || '')}">
      ${Object.entries(byCollab).map(([cid, gs]) => `<details open><summary class="small"><b>${esc(H().byId(DB.collabs, Number(cid))?.name)}</b> · ${gs.length} grupos</summary>${gs.map(g => item('group', g.id, g.code, `${H().gsize(g)} personas`)).join('')}</details>`).join('')}
      <details ${q ? 'open' : ''}><summary class="small"><b>Voluntarios sueltos</b> · ${vols.length}</summary>${vols.slice(0, 30).map(v => item('vol', v.id, H().vName(v), H().anonV(v) ? H().R.collab(v.collab) : esc(v.phone))).join('')}</details></aside>`;
  }
  /* Arrastrar candidatos del panel a un turno del calendario */
  document.addEventListener('dragstart', e => { const el = e.target.closest?.('[data-drag-kind]'); if (el) e.dataTransfer.setData('text/plain', JSON.stringify({ kind: el.dataset.dragKind, ref: el.dataset.dragRef })); });
  document.addEventListener('dragover', e => { if (e.target.closest?.('.cal-shift')) e.preventDefault(); });
  document.addEventListener('drop', e => { const t = e.target.closest?.('.cal-shift'); if (!t) return; e.preventDefault();
    const d = JSON.parse(e.dataTransfer.getData('text/plain') || '{}'); const tmp = Object.assign(document.createElement('div'), { hidden: true }); tmp.dataset.act = 'do-assign'; tmp.dataset.id = t.dataset.id; tmp.dataset.kind = d.kind; tmp.dataset.ref = d.ref; document.body.append(tmp); tmp.click(); tmp.remove(); });

  function calendar(S, c, stores) {
    if (!stores.length) return `<div class="card">${empty('Sin tiendas', 'No hay tiendas con turnos en tu ámbito para esta campaña.')}</div>`;
    const st = stores.find(x => String(x.id) === String(S.f.store)) || stores[0];
    const dates = campaignDates(c), weeks = [...new Set(dates.map(d => weekOf(d)[0]))].sort();
    const week = weeks.includes(S.f.week) ? S.f.week : weeks[0], days = weekOf(week);
    const sh = DB.shifts.filter(s => s.campaign === c.id && s.store === st.id), canEdit = H().can(S, 'shifts.assign') && c.status !== 'Finalizada';
    /* Tramos de apertura de una fecha: las excepciones sustituyen al horario semanal. Sin tramos = cerrada. */
    const hoursOf = date => { const exc = DB.scheduleExceptions.filter(e => e.store === st.id && e.date === date); if (exc.length) return exc.some(e => e.closed) ? null : exc;
      const wd = (new Date(date + 'T12:00').getDay() + 6) % 7 + 1, t = DB.schedules.filter(h => h.store === st.id && h.week_day === wd); return t.length ? t : null; };
    const top = t => (toMinutes(t) - HOUR_FROM * 60) / 60 * HOUR_PX;
    const block = s => { const o = over(s), tone = o > 0 ? 'over' : ({ 'Sin cubrir': 'low', Parcial: 'part', Cubierto: 'full' })[H().coverage(s)];
      return `<div class="cal-shift ${tone} ${S.f.sel === s.id ? 'selected' : ''}" style="top:${top(s.start)}px;height:${Math.max(28, top(s.end) - top(s.start))}px" data-act="shift-open" data-id="${s.id}">
        ${canEdit ? '<i class="cal-grip top" data-grip="top"></i><i class="cal-grip bottom" data-grip="bottom"></i>' : ''}
        <div class="row small"><b>${s.start}–${s.end}</b><span class="spacer"></span>${H().filled(s)}/${s.capacity}${o > 0 ? ' ' + icon('alert') : ''}</div>
        <div class="small cal-asg">${s.assignments.map(a => esc(H().asgText(a)) + (a.kind !== 'vol' ? ` (${H().asgPeople(a)})` : '') + (a.kind === 'group' && a.people && !a.members ? ' · falta elegir' : '')).join(', ') || 'Sin asignar'}</div></div>`; };
    const col = date => { const on = dates.includes(date), hrs = on && hoursOf(date);
      return `<div class="cal-col ${on ? '' : 'off'}" data-date="${date}">${on && hrs ? hrs.map(h => `<div class="cal-open" style="top:${top(h.open)}px;height:${top(h.close) - top(h.open)}px"></div>`).join('') : ''}
        ${on && !hrs ? '<div class="cal-note small">Tienda cerrada</div>' : ''}${!on ? '<div class="cal-note small">Sin voluntariado</div>' : ''}
        ${sh.filter(s => s.date === date).map(block).join('')}</div>`; };
    const someoneElse = DB.users.find(u => u.id !== S.user.id && ((u.role === 'rcol' && sh.some(s => s.assignments.some(a => (a.kind === 'group' ? H().byId(DB.groups, a.group)?.collab : a.collab) === u.collab))) || (u.role === 'coord' && H().zonesOf(u.id, c.id).includes(st.zone))));
    const lastEdit = sh.filter(s => s.editedBy).at(-1);
    return `<div class="card" style="margin-bottom:12px"><div class="toolbar" style="border:0">
        <select class="input" style="width:260px" data-filter="store">${stores.map(x => `<option value="${x.id}" ${x.id === st.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
        ${weeks.length > 1 ? `<div class="seg">${weeks.map(w => `<button class="${w === week ? 'active' : ''}" data-act="filter" data-k="week" data-v="${w}">Semana del ${fmtDate(w, { day: 'numeric', month: 'short' })}</button>`).join('')}</div>` : ''}
        <span class="small muted">${esc(H().storeSub(st))} · ${H().R.zone(st.zone)} · ${st.checkout_shelfs} ${st.checkout_shelfs === 2 ? 'líneas' : 'línea'} de caja${H().can(S, 'history.last') && DB.history[st.id] ? ` · anterior: ${H().R.collab(DB.history[st.id])}` : ''}</span>
        <span class="spacer"></span>${someoneElse ? `<span class="presence small" title="Simulación de presencia en tiempo real"><span class="dot" style="background:var(--ok)"></span>${esc(someoneElse.name)} también está en esta tienda</span>` : ''}</div>
        ${lastEdit ? `<div class="small faint" style="padding:0 16px 12px">Último cambio: ${H().R.user(lastEdit.editedBy)}, ${esc(lastEdit.editedAt)}. Los cambios de otros usuarios aparecen al momento.</div>` : ''}</div>
      <div class="split"><div style="min-width:0"><div class="card cal"><div class="cal-head"><div></div>${days.map(d => `<div class="cal-day ${dates.includes(d) ? '' : 'off'}"><b>${WEEKDAYS[(new Date(d + 'T12:00').getDay() + 6) % 7]} ${fmtDate(d, { day: 'numeric' })}</b>${dates.includes(d) && canEdit ? btn('', { kind: 'ghost', size: 'sm', icon: 'plus', act: 'shift-new', data: `data-store="${st.id}" data-date="${d}" data-c="${c.id}"`, title: 'Nuevo turno' }) : ''}</div>`).join('')}</div>
        <div class="cal-body" data-can="${canEdit ? 1 : 0}" data-store="${st.id}" data-c="${c.id}" style="height:${(HOUR_TO - HOUR_FROM) * HOUR_PX}px"><div class="cal-hours">${Array.from({ length: HOUR_TO - HOUR_FROM }, (_, i) => `<div style="height:${HOUR_PX}px">${String(HOUR_FROM + i).padStart(2, '0')}:00</div>`).join('')}</div>${days.map(col).join('')}</div></div>
      <div class="row wrap small muted" style="margin-top:10px;gap:14px"><span class="row"><span class="legend low"></span>Sin cubrir</span><span class="row"><span class="legend part"></span>Parcial</span><span class="row"><span class="legend full"></span>Cubierto</span><span class="row"><span class="legend over"></span>Supera la capacidad</span><span class="row"><span class="legend open"></span>Horario de la tienda</span></div></div>${sidePanel(S, c, sh)}</div>`;
  }

  /* ---------- Modales ---------- */
  function shiftModal(S, id) {
    const s = H().byId(DB.shifts, id), st = H().byId(DB.stores, s.store), f = H().filled(s), o = over(s), canEdit = H().can(S, 'shifts.assign');
    modal(`${esc(st.name)}`, `<div class="small muted" style="margin-top:-8px;margin-bottom:12px">${fmtDate(s.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${H().R.zone(st.zone)}</div>
      <div class="form-grid"><div class="field"><label>Inicio</label><input class="input" type="time" id="sh-start" value="${s.start}" ${canEdit ? '' : 'disabled'}></div><div class="field"><label>Fin</label><input class="input" type="time" id="sh-end" value="${s.end}" ${canEdit ? '' : 'disabled'}></div>
        <div class="field"><label>Capacidad</label><input class="input" type="number" min="1" id="sh-cap" value="${s.capacity}" ${canEdit ? '' : 'disabled'}></div></div>
      <div style="margin:14px 0 6px">${progress(Math.min(100, f / s.capacity * 100), o > 0 ? 'warn' : f >= s.capacity ? 'ok' : f ? 'warn' : 'danger')}</div><div class="small muted">${f} de ${s.capacity} personas</div>
      ${o > 0 ? `<div class="card card-pad small" style="margin-top:10px;background:var(--warn-bg);border-color:transparent">${icon('alert')} Supera la capacidad en <b>${o}</b>. Ajusta cuántas personas van de cada grupo o reparte el resto en otro turno. El responsable del colaborador decide quién va; al líder le llega cuántos van.</div>` : ''}
      <h3 style="margin:16px 0 8px">Asignaciones</h3>
      ${s.assignments.length ? s.assignments.map((a, i) => `<div class="list-item">${H().asgIcon(a)}<div style="flex:1"><b class="small">${esc(H().asgText(a))}</b><div class="small muted">${a.kind === 'group' ? `Grupo de ${H().gsize(H().byId(DB.groups, a.group))} personas${a.people ? (a.members ? ` · elegidos: ${a.members.length}` : ' · <b style="color:var(--warn)">falta elegir quién va</b>') : ''}` : a.kind === 'collab' ? 'Entidad sin grupos' : 'Voluntario'}</div></div>
        ${a.kind === 'group' && a.people && S.user.role === 'rcol' && H().byId(DB.groups, a.group)?.collab === S.user.collab ? btn(a.members ? 'Cambiar' : 'Elegir', { size: 'sm', act: 'nominate', data: `data-id="${s.id}" data-i="${i}"` }) : ''}${a.kind !== 'vol' ? `<label class="row small">Van <input class="input inline" style="width:64px" type="number" min="1" data-people="${i}" value="${H().asgPeople(a)}" ${canEdit ? '' : 'disabled'}></label>` : ''}
        ${canEdit ? btn('', { kind: 'ghost danger', size: 'sm', icon: 'x', act: 'shift-unassign', data: `data-id="${s.id}" data-i="${i}"`, title: 'Quitar' }) : ''}</div>`).join('') : '<div class="small muted">Sin asignar.</div>'}
      ${S.user.role === 'admin' ? `<div style="margin-top:16px">${H().auditCard('shifts', s.id)}</div>` : ''}
      ${canEdit ? `<div class="field" style="margin-top:16px"><label>Motivo del cambio (se envía en el aviso)</label><textarea class="input" id="sh-reason" rows="2" placeholder="Ej. la tienda abre media hora antes"></textarea><span class="hint">Avisamos a los líderes de grupo, responsables de colaborador y coordinación afectados.</span></div>` : ''}`,
      (canEdit ? btn('Eliminar turno', { kind: 'ghost danger', act: 'shift-delete', data: `data-id="${s.id}"` }) + btn('Asignar', { icon: 'plus', act: 'assign', data: `data-id="${s.id}"` }) : '')
      + (H().can(S, 'incidents.manage') ? btn('Incidencia', { icon: 'alert', act: 'incident', data: `data-id="${s.id}"` }) : '')
      + (canEdit ? btn('Guardar cambios', { kind: 'primary', icon: 'check', act: 'shift-save', data: `data-id="${s.id}"` }) : btn('Cerrar', { act: 'close' })));
  }

  function newShiftModal(d) {
    const st = H().byId(DB.stores, d.store);
    modal('Nuevo turno', `<p class="small muted" style="margin-top:0">${esc(st.name)} · ${fmtDate(d.date, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <div class="seg" style="margin-bottom:12px"><button data-act="shift-preset" data-v="morning">Mañana</button><button data-act="shift-preset" data-v="afternoon">Tarde</button></div>
      <div class="form-grid"><div class="field"><label>Inicio</label><input class="input" type="time" id="ns-start" value="${d.start || '10:00'}"></div><div class="field"><label>Fin</label><input class="input" type="time" id="ns-end" value="${d.end || '12:00'}"></div>
      <div class="field"><label>Capacidad</label><input class="input" type="number" min="1" id="ns-cap" value="${st.checkout_shelfs === 2 ? DB.settings.twoLinesCapacity : DB.settings.baseCapacity}"></div></div>`,
      btn('Cancelar', { act: 'close' }) + btn('Crear turno', { kind: 'primary', icon: 'check', act: 'shift-create', data: `data-store="${d.store}" data-date="${d.date}" data-c="${d.c}"` }), 'sm');
  }

  /* ---------- Acciones ---------- */
  const actions = (S, render) => ({
    'cal-store': d => { S.f.store = d.id; S.f.tab = 'calendario'; render(); },
    'shift-open': d => { S.f.sel = Number(d.id); render(); },
    'shift-detail': d => shiftModal(S, d.id),
    'shift-new': d => newShiftModal(d),
    'shift-preset': d => { const st = H().byId(DB.stores, document.querySelector('[data-act="shift-create"]').dataset.store), h = DB.schedules.find(x => x.store === st.id) || { open: '09:00', close: '21:30' };
      const [a, b] = d.v === 'morning' ? [h.open, DB.settings.morningEnd] : [DB.settings.afternoonStart, h.close]; document.getElementById('ns-start').value = a; document.getElementById('ns-end').value = b; },
    'shift-create': d => { const start = document.getElementById('ns-start').value, end = document.getElementById('ns-end').value;
      if (!start || !end || end <= start) return toast('La hora de fin debe ser posterior a la de inicio');
      DB.shifts.push({ id: Math.max(...DB.shifts.map(s => s.id)) + 1, campaign: Number(d.c), store: Number(d.store), date: d.date, slot: start < '14:00' ? 'Mañana' : 'Tarde', start, end, capacity: Number(document.getElementById('ns-cap').value) || 2, notes: '', assignments: [], editedBy: S.user.id, editedAt: 'ahora' });
      close(); render(); toast(`Turno ${start}–${end} creado`); },
    'shift-save': d => { const s = H().byId(DB.shifts, d.id), reason = document.getElementById('sh-reason').value.trim(), start = document.getElementById('sh-start').value, end = document.getElementById('sh-end').value;
      if (end <= start) return toast('La hora de fin debe ser posterior a la de inicio');
      const changes = []; if (start !== s.start || end !== s.end) changes.push(`horario ${s.start}–${s.end} → ${start}–${end}`);
      const cap = Number(document.getElementById('sh-cap').value); if (cap !== s.capacity) changes.push(`capacidad ${s.capacity} → ${cap}`);
      const leaders = [];
      document.querySelectorAll('[data-people]').forEach(el => { const a = s.assignments[el.dataset.people], n = Number(el.value); if (n && n !== H().asgPeople(a)) { changes.push(`${H().asgText(a)}: van ${n}`); a.people = n; leaders.push(...leadersOf(a)); } });
      if (!changes.length) return close();
      Object.assign(s, { start, end, capacity: cap, slot: start < '14:00' ? 'Mañana' : 'Tarde' });
      const n = notify(S, s, `Turno actualizado (${shiftLabel(s)}): ${changes.join('; ')}`, reason, leaders);
      close(); render(); toast(`Turno actualizado · ${n} avisos enviados`); },
    'shift-unassign': d => { const s = H().byId(DB.shifts, d.id), reason = document.getElementById('sh-reason')?.value.trim() || '', a = s.assignments[d.i];
      notify(S, s, `${H().asgText(a)} ya no está en el turno ${shiftLabel(s)}`, reason, leadersOf(a)); s.assignments.splice(d.i, 1); shiftModal(S, s.id); render(); toast(`${esc(H().asgText(a))} quitado del turno`); },
    'shift-delete': d => { const s = H().byId(DB.shifts, d.id), reason = document.getElementById('sh-reason')?.value.trim() || '';
      UI.confirm('Eliminar turno', `¿Eliminar el turno ${esc(shiftLabel(s))}? Se avisará a los afectados.`, () => { notify(S, s, `Turno eliminado: ${shiftLabel(s)}`, reason); DB.shifts.splice(DB.shifts.indexOf(s), 1); close(); render(); toast('Turno eliminado'); }, 'Eliminar'); },
    'notif-open': d => { const n = DB.notifications.find(x => x.id === Number(d.id)); n.read = true; S.notif = false; S.pendingF = { store: String(n.store), tab: 'calendario' }; location.hash = '#/turnos'; render(); },
    'notif-toggle': () => { S.notif = !S.notif; S.menu = false; render(); },
    'notif-read-all': () => { DB.notifications.filter(n => n.to === S.user.id).forEach(n => { n.read = true; }); render(); },
  });

  const bell = S => { const mine = DB.notifications.filter(n => n.to === S.user.id), unread = mine.filter(n => !n.read).length;
    return `<div class="menu-wrap"><button class="btn ghost icon" data-act="notif-toggle" title="Avisos" style="position:relative">${icon('bell')}${unread ? `<span class="count" style="position:absolute;top:-4px;right:-4px">${unread}</span>` : ''}</button>
      ${S.notif ? `<div class="menu" style="width:340px"><div class="row" style="padding:8px 10px"><b>Avisos</b><span class="spacer"></span>${unread ? `<button class="small" data-act="notif-read-all">Marcar leídos</button>` : ''}</div><hr>
        ${mine.length ? mine.slice(0, 8).map(n => `<button data-act="notif-open" data-id="${n.id}" style="align-items:flex-start;${n.read ? 'opacity:.6' : ''}"><div style="text-align:left"><div class="small">${esc(n.text)}</div>${n.reason ? `<div class="small muted">Motivo: ${esc(n.reason)}</div>` : ''}<div class="small faint">${esc(H().byId(DB.users, n.from)?.name || '')} · ${esc(n.when)}</div></div></button>`).join('') : '<div class="small muted" style="padding:10px">No tienes avisos.</div>'}</div>` : ''}</div>`; };

  /* ---------- Arrastre en el calendario: mover, redimensionar y crear turnos ---------- */
  const SNAP = 15, MIN_LEN = 15, DAY_START = HOUR_FROM * 60, DAY_END = HOUR_TO * 60;
  const ctx = { S: null, render: () => {} };
  let drag = null, suppressClick = false;
  const snap = m => Math.round(m / SNAP) * SNAP;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const minToStr = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const minAt = (body, y) => DAY_START + (y - body.getBoundingClientRect().top) / HOUR_PX * 60;
  const place = (el, start, end) => { el.style.top = `${(start - DAY_START) / 60 * HOUR_PX}px`; el.style.height = `${(end - start) / 60 * HOUR_PX}px`; el.querySelector('b').textContent = `${minToStr(start)}–${minToStr(end)}`; };
  const colAt = x => [...document.querySelectorAll('.cal-col')].find(c => { const r = c.getBoundingClientRect(); return x >= r.left && x < r.right; });

  function onDown(e) {
    if (e.button !== 0) return;
    const body = e.target.closest('.cal-body[data-can="1"]');
    if (!body) return;
    const blk = e.target.closest('.cal-shift'), grip = e.target.closest('.cal-grip'), col = e.target.closest('.cal-col');
    if (blk) {
      const s = H().byId(DB.shifts, Number(blk.dataset.id));
      drag = { mode: grip ? grip.dataset.grip : 'move', el: blk, s, body, date: s.date, sx: e.clientX, sy: e.clientY, moved: false,
        start0: toMinutes(s.start), end0: toMinutes(s.end), start: toMinutes(s.start), end: toMinutes(s.end) };
    } else if (col && !col.classList.contains('off')) {
      const at = clamp(snap(minAt(body, e.clientY)), DAY_START, DAY_END), el = document.createElement('div');
      el.className = 'cal-shift cal-draft'; el.innerHTML = '<b></b>'; col.appendChild(el);
      drag = { mode: 'create', el, body, date: col.dataset.date, anchor: at, start: at, end: at, sx: e.clientX, sy: e.clientY, moved: false };
    } else return;
    e.preventDefault();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }

  function onMove(e) {
    const d = drag; if (!d) return;
    if (!d.moved && Math.abs(e.clientY - d.sy) < 4 && Math.abs(e.clientX - d.sx) < 4) return;
    d.moved = true;
    const total = snap((e.clientY - d.sy) / HOUR_PX * 60);
    if (d.mode === 'move') {
      const dur = d.end0 - d.start0;
      d.start = clamp(d.start0 + total, DAY_START, DAY_END - dur); d.end = d.start + dur;
      const col = colAt(e.clientX);
      if (col && !col.classList.contains('off') && col.dataset.date !== d.date) { d.date = col.dataset.date; col.appendChild(d.el); }
      d.el.classList.add('dragging');
    } else if (d.mode === 'top') { d.start = clamp(d.start0 + total, DAY_START, d.end0 - MIN_LEN); d.end = d.end0; d.el.classList.add('dragging'); }
    else if (d.mode === 'bottom') { d.start = d.start0; d.end = clamp(d.end0 + total, d.start0 + MIN_LEN, DAY_END); d.el.classList.add('dragging'); }
    else { const cur = clamp(snap(minAt(d.body, e.clientY)), DAY_START, DAY_END); d.start = Math.min(d.anchor, cur); d.end = Math.max(d.anchor, cur); }
    place(d.el, d.start, d.end);
  }

  function onUp() {
    window.removeEventListener('pointermove', onMove);
    const d = drag; drag = null;
    if (!d || !d.moved) { if (d?.mode === 'create') d.el.remove(); return; }
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 300);
    if (d.mode === 'create') {
      d.el.remove();
      if (d.end - d.start >= MIN_LEN) newShiftModal({ store: d.body.dataset.store, date: d.date, c: d.body.dataset.c, start: minToStr(d.start), end: minToStr(d.end) });
      return;
    }
    const s = d.s, start = minToStr(d.start), end = minToStr(d.end);
    if (start === s.start && end === s.end && d.date === s.date) return ctx.render();
    const before = shiftLabel(s);
    Object.assign(s, { date: d.date, start, end, slot: start < '14:00' ? 'Mañana' : 'Tarde' });
    const n = notify(ctx.S, s, `Turno movido: ${before} → ${shiftLabel(s)}`, '');
    ctx.render(); toast(`Turno actualizado · ${n} avisos enviados`);
  }

  /* Tras un arrastre el navegador lanza un click: se ignora para no abrir el modal del turno. */
  window.addEventListener('click', e => { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }, true);
  document.addEventListener('pointerdown', onDown);

  function bind(S, render) { ctx.S = S; ctx.render = render; }

  return { view, actions, bell, notify, leadersOf, shiftLabel, bind };
})();

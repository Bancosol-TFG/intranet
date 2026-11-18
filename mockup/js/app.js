/* Shell de la aplicación: estado, router por hash, navegación por rol y acciones. */
(() => {
  const { esc, icon, avatar, btn, badge, drawer, modal, confirm, close, toast, form, readForm } = UI;
  const { R, byId, filled, can, scope, toPurge, asgText, storeSub, gsize, iconBox } = Views.helpers;
  const app = document.getElementById('app');
  const S = { user: null, f: {}, menu: false, theme: (() => { try { return localStorage.getItem('bs-theme') || 'light'; } catch { return 'light'; } })() };
  /* La sesión dura mientras la pestaña esté abierta: recargar no pide login; cerrar la pestaña o salir sí. */
  function saveSession(id) { try { if (id) sessionStorage.setItem('bs-user', String(id)); else sessionStorage.removeItem('bs-user'); } catch {} }
  try { const id = Number(sessionStorage.getItem('bs-user')); if (id) S.user = DB.users.find(u => u.id === id && u.status !== 'Inactivo') || null; } catch {}
  Views.bind(S);
  document.documentElement.dataset.theme = S.theme;

  /* ---------- Navegación y permisos de ruta ---------- */
  /* Barra lateral: «Campaña actual» trabaja sobre la campaña activa; «Catálogo» es toda la base de datos; «Administración» la configura.
     Las entradas con `to` son accesos directos a una ruta concreta (p. ej. pestañas de la campaña activa). */
  const AC = () => Views.helpers.activeCampaign().id;
  const NAV = [
    { k: 'inicio', l: 'Inicio', i: 'home', roles: 'admin coord rcol rtienda' },
    { k: 'c-resumen', l: 'Resumen', i: 'flag', roles: 'admin coord', group: 'Campaña actual', to: () => `campanas/${AC()}` },
    { k: 'c-tiendas', l: 'Tiendas participantes', i: 'store', roles: 'admin coord', group: 'Campaña actual', to: () => `campanas/${AC()}/tiendas` },
    { k: 'c-equipo', l: 'Colaboradores y equipo', i: 'building', roles: 'admin coord', group: 'Campaña actual', to: () => `campanas/${AC()}/equipo` },
    { k: 'turnos', l: 'Turnos', i: 'clock', roles: 'admin coord rcol rtienda', group: 'Campaña actual' },
    { k: 'grupos', l: 'Grupos', i: 'users', roles: 'admin coord rcol', group: 'Campaña actual' },
    { k: 'incidencias', l: 'Incidencias', i: 'alert', roles: 'admin coord rcol rtienda', group: 'Campaña actual', count: () => { const ids = new Set(scope.shifts(S, Views.helpers.activeCampaign().id).map(s => s.id)); return DB.reports.filter(r => ids.has(r.shift) && !r.solved_by).length; } },
    { k: 'entidad', l: 'Mi entidad', i: 'building', roles: 'rcol', group: 'Campaña actual' },
    { k: 'voluntarios', l: 'Mis voluntarios', i: 'heart', roles: 'rcol', group: 'Campaña actual' },
    { k: 'catalogos', l: 'Catálogo', i: 'list', roles: 'admin', group: 'Administración', to: () => 'tiendas' },
    { k: 'campanas', l: 'Campañas', i: 'flag', roles: 'admin coord', group: 'Administración' },
    { k: 'historico', l: 'Histórico', i: 'clock', roles: 'admin', group: 'Administración' },
    { k: 'usuarios', l: 'Usuarios y roles', i: 'shield', roles: 'admin', group: 'Administración' },
    { k: 'configuracion', l: 'Configuración', i: 'cog', roles: 'admin', group: 'Administración' },
    { k: 'flujos', l: 'Flujos de trabajo', i: 'route', roles: 'admin coord rcol rtienda', group: 'Ayuda' },
  ];
  const DETAIL = { tiendas: 'admin coord', colaboradores: 'admin coord', voluntarios: 'admin coord rcol', tienda: 'admin coord rcol', zona: 'admin coord', localidad: 'admin coord', cadena: 'admin coord', grupo: 'admin coord rcol rtienda', voluntario: 'admin coord rcol', usuario: 'admin', importar: 'admin', perfil: 'admin coord rcol rtienda' };
  const allowed = k => (DETAIL[k] || NAV.find(n => n.k === k)?.roles || '').split(' ').includes(S.user.role);
  const TITLES = { ...Object.fromEntries(NAV.map(n => [n.k, n.l])), catalogos: 'Catálogo', tiendas: 'Tiendas', colaboradores: 'Colaboradores', voluntarios: 'Voluntarios', perfil: 'Mi perfil', importar: 'Importar tiendas', tienda: 'Tiendas', zona: 'Zonas', localidad: 'Localidades', cadena: 'Cadenas', grupo: 'Grupos', voluntario: 'Voluntarios', usuario: 'Usuarios' };
  const PARENT = { tienda: 'tiendas', zona: 'catalogos/zonas', localidad: 'catalogos/localidades', cadena: 'catalogos/cadenas', grupo: 'grupos', voluntario: 'voluntarios', usuario: 'usuarios' };

  /* ---------- Esquemas de formulario: relaciones siempre como selector de objetos ---------- */
  const PHONE = { pattern: '[6789][0-9]{8}', title: 'Teléfono español de 9 cifras (sin espacios)' };
  const sel = (list, label = x => x.name) => () => list().filter(x => !x.archived).map(x => [x.id, label(x)]);
  const none = (t, f) => () => [['', t], ...f()];
  const SCHEMAS = {
    campaigns: { label: 'campaña', g: 'a', list: DB.campaigns, fields: [
      { key: 'name', label: 'Nombre', required: true, full: true, placeholder: 'Ej. Gran Recogida 2027' },
      { key: 'type', label: 'Tipo de campaña', type: 'select', numeric: true, options: sel(() => DB.campaignTypes) }, { key: 'code', label: 'Código', placeholder: 'GR2027', proposed: true },
      { key: 'start', label: 'Fecha de inicio', type: 'date', required: true }, { key: 'end', label: 'Fecha de fin', type: 'date', required: true } ] },
    stores: { label: 'tienda', g: 'a', list: DB.stores, fields: [
      { key: 'name', label: 'Nombre', required: true, full: true, hint: 'Único en todo el catálogo' },
      { key: 'chain', label: 'Cadena', type: 'select', numeric: true, options: sel(() => DB.chains) },
      { key: 'code', label: 'Código de tienda', hint: 'Vacío si la cadena no lo informa', proposed: true }, { key: 'checkout_shelfs', label: 'Líneas de caja', type: 'number', default: 1, hint: 'Con 2, el turno necesita 4 personas' },
      { key: 'address', label: 'Dirección', required: true, full: true },
      { key: 'locality', label: 'Localidad', type: 'select', numeric: true, required: true, options: sel(() => DB.localities, l => `${l.name} (${l.postal_code})`) },
      { key: 'zone', label: 'Zona', type: 'select', numeric: true, options: none('Sin zona', sel(() => DB.zones)) }] },
    collabs: { label: 'colaborador', g: 'o', list: DB.collabs, fields: [
      { key: 'name', label: 'Nombre de la entidad', required: true, full: true }, { key: 'address', label: 'Dirección', required: true },
      { key: 'locality', label: 'Localidad', type: 'select', numeric: true, options: sel(() => DB.localities) },
      { key: 'type', label: 'Tipo', type: 'select', options: ['Asociación', 'Universidad', 'Centro educativo', 'Empresa', 'Administración pública', 'Entidad social', 'Interno'], proposed: true },
      { key: 'capacity', label: 'Capacidad de voluntarios', type: 'number', default: 10, proposed: true },
      { key: 'coords', label: 'Coordinación asignada', type: 'multi', numeric: true, full: true, proposed: true, options: sel(() => DB.users.filter(u => u.role === 'coord')), hint: 'Varios si colabora en distintas localidades' },
      { key: 'localities', label: 'Dónde colabora', type: 'multi', numeric: true, full: true, proposed: true, options: sel(() => DB.localities) },
      { key: 'ownsVolunteers', label: '¿Gestiona sus voluntarios en la app?', type: 'select', options: [['true', 'Sí, su responsable crea grupos y voluntarios'], ['false', 'No, solo se asocia la entidad a la tienda']], bool: true, full: true, proposed: true },
      { key: 'oneCampaign', label: '¿Sus voluntarios repiten?', type: 'select', options: [['false', 'Sí, se conservan para la siguiente campaña'], ['true', 'No, participan en una sola campaña']], bool: true, full: true, proposed: true }] },
    collabStores: { label: 'grupo de tiendas', title: 'Grupo de tiendas del colaborador', list: DB.collabs, fields: [
      { key: 'stores', label: 'Tiendas en las que su responsable asigna turnos', type: 'multi', numeric: true, full: true, proposed: true, options: sel(() => scope.stores(S)) }] },
    volunteers: { label: 'voluntario', g: 'o', list: DB.volunteers, fields: [
      { key: 'name', label: 'Nombre completo', required: true, full: true }, { key: 'phone', label: 'Teléfono', required: true, ...PHONE },
      { key: 'locality', label: 'Localidad', type: 'select', numeric: true, options: sel(() => DB.localities) },
      { key: 'collab', label: 'Colaborador', type: 'select', numeric: true, full: true, options: () => DB.collabs.filter(c => c.id === (S.user.collab || 1)).map(c => [c.id, c.name]) },
      { key: 'localities', label: 'Dónde colabora', type: 'multi', numeric: true, full: true, options: sel(() => DB.localities) },
      { key: 'email', label: 'Email (opcional)', type: 'email' },
      { key: 'minor', label: 'Edad', type: 'select', options: [['false', 'Mayor de edad'], ['true', 'Menor de edad']], bool: true, full: true, hint: 'Si es menor, el nombre y el teléfono son los del padre, madre o tutor, que ha dado su autorización. La entidad es responsable de recogerla.' }] },
    users: { label: 'usuario', g: 'o', list: DB.users, fields: [
      { key: 'first_name', label: 'Nombre', required: true }, { key: 'surname', label: 'Apellidos' },
      { key: 'email', label: 'Email', type: 'email', required: true }, { key: 'username', label: 'Usuario', required: true },
      { key: 'phone', label: 'Teléfono', ...PHONE }, { key: 'role', label: 'Rol', type: 'select', options: () => DB.roles.filter(r => ['admin', 'coord'].includes(r.id)).map(r => [r.id, r.name]), hint: 'Aquí solo se crean usuarios de Bancosol. Los responsables se crean desde el contacto del colaborador y los líderes desde su grupo.' },
      { key: 'collab', label: 'Colaborador (responsables)', type: 'select', numeric: true, options: none('—', sel(() => DB.collabs)) },
      { key: 'group', label: 'Grupo (líder de grupo)', type: 'select', numeric: true, options: none('—', sel(() => DB.groups, g => g.code)), hint: 'Las zonas de coordinación se asignan por campaña' }] },
    zones: { label: 'zona', g: 'a', list: DB.zones, uses: z => DB.stores.filter(s => s.zone === z.id).length + DB.zoneAssignments.filter(a => a.zone === z.id).length, fields: [{ key: 'name', label: 'Nombre', required: true }, { key: 'code', label: 'Código', required: true }] },
    localities: { label: 'localidad', g: 'a', list: DB.localities, uses: l => DB.stores.filter(s => s.locality === l.id).length + DB.collabs.filter(c => c.locality === l.id).length, fields: [{ key: 'name', label: 'Nombre', required: true }, { key: 'postal_code', label: 'Código postal', required: true }, { key: 'zone', label: 'Zona por defecto', type: 'select', numeric: true, options: none('Sin zona', sel(() => DB.zones)), hint: 'Las tiendas nuevas de esta localidad toman esta zona' }] },
    chains: { label: 'cadena', g: 'a', list: DB.chains, uses: c => DB.stores.filter(s => s.chain === c.id).length, fields: [{ key: 'code', label: 'Código', required: true }, { key: 'name', label: 'Nombre visible', proposed: true }, { key: 'open', label: 'Apertura por defecto', type: 'time', default: '09:00' }, { key: 'close', label: 'Cierre por defecto', type: 'time', default: '21:30', hint: 'Las tiendas nuevas o importadas de la cadena toman este horario' }] },
    campaignTypes: { label: 'tipo de campaña', g: 'o', list: DB.campaignTypes, uses: t => DB.campaigns.filter(c => c.type === t.id).length, fields: [{ key: 'name', label: 'Nombre', required: true }] },
    reportTypes: { label: 'tipo de incidencia', g: 'o', list: DB.reportTypes, uses: t => DB.reports.filter(r => r.type === t.id).length, fields: [{ key: 'name', label: 'Nombre', required: true }] },
  };
  const toForm = (sc, o) => Object.fromEntries(sc.fields.map(f => [f.key, f.bool ? String(!!o[f.key]) : o[f.key]]));
  const fromForm = sc => { const d = readForm(sc.fields); sc.fields.forEach(f => { if (f.bool) d[f.key] = d[f.key] === 'true'; }); return d; };
  const nextId = list => Math.max(0, ...list.map(x => x.id)) + 1;
  const NOW = () => '2026-11-12 ' + new Date().toTimeString().slice(0, 5);
  const audit = (entity, id, text) => DB.audit.push({ entity, id: Number(id), who: S.user.id, when: NOW(), text });
  const log = (text, refs) => DB.activity.unshift({ who: S.user.id, text, refs, when: 'Ahora' });

  function openForm(entity, id) {
    const sc = SCHEMAS[entity], obj = id ? byId(sc.list, id) : {};
    const title = sc.title || (id ? `Editar ${sc.label}` : entity === 'users' ? 'Crear usuario' : `${sc.g === 'a' ? 'Nueva' : 'Nuevo'} ${sc.label}`);
    drawer(title, form(sc.fields, toForm(sc, obj)) + (sc.fields.some(f => f.proposed) ? `<p class="small muted" style="margin-top:16px"><span class="prop">Propuesta</span> campo que aún no existe en el modelo de datos.</p>` : ''),
      btn('Cancelar', { act: 'close' }) + btn(id ? 'Guardar cambios' : 'Crear', { kind: 'primary', icon: 'check', act: 'save', data: `data-entity="${entity}" data-id="${id || ''}"` }));
  }
  function save(entity, id) {
    const sc = SCHEMAS[entity]; if (!document.getElementById('entity-form').reportValidity()) return;
    const data = fromForm(sc);
    if (entity === 'users') data.name = `${data.first_name} ${data.surname || ''}`.trim();
    if (entity === 'volunteers') { const dup = DB.volunteers.find(v => String(v.id) !== String(id) && v.collab === data.collab && (v.phone.replace(/\D/g, '') === String(data.phone).replace(/\D/g, '') || v.name.toLowerCase() === String(data.name).toLowerCase())); if (dup) return toast(`Ya existe <b>${esc(dup.name)}</b> (${Views.helpers.globalId(dup)}) con ese nombre o teléfono: usa su ficha para no duplicarlo`); if (data.minor && !data.tutorName) return toast('Para un menor indica el nombre del tutor'); }
    if (entity === 'stores' && DB.stores.some(s => s.name.toLowerCase() === data.name.toLowerCase() && String(s.id) !== String(id))) return toast('Ya existe una tienda con ese nombre (el nombre es único)');
    if (id) { const obj = byId(sc.list, id), changed = Object.keys(data).filter(k => JSON.stringify(obj[k]) !== JSON.stringify(data[k])); if (changed.length) audit(entity, id, changed.map(k => `${sc.fields.find(f => f.key === k)?.label || k}: ${Array.isArray(obj[k]) ? obj[k].length : obj[k] ?? '—'} → ${Array.isArray(data[k]) ? data[k].length : data[k] ?? '—'}`).join(' · ')); Object.assign(obj, data); toast('Cambios guardados'); }
    else {
      const n = { id: nextId(sc.list), ...data };
      if (entity === 'campaigns') Object.assign(n, { days: [], exceptions: [], participation: {}, reasons: {}, sources: [] });
      if (entity === 'collabs') Object.assign(n, { status: 'Pendiente de validar', stores: [] });
      if (entity === 'volunteers') n.history = [];
      if (entity === 'users') Object.assign(n, { status: 'Pendiente', last: '—' });
      if (entity === 'chains') Object.assign(n, { name: n.name || n.code, hasCode: true, note: '', open: n.open || '09:00', close: n.close || '21:30' });
      if (entity === 'stores') { Object.assign(n, { zone: n.zone || byId(DB.localities, n.locality)?.zone || null }); const ch = byId(DB.chains, n.chain); [1, 2, 3, 4, 5, 6].forEach(d => DB.schedules.push({ store: n.id, week_day: d, open: ch?.open || '09:00', close: ch?.close || '21:30' })); }
      sc.list.push(n); audit(entity, n.id, 'Dado de alta');
      if (['collabs', 'stores', 'campaigns'].includes(entity)) log(`dio de alta ${sc.g === 'a' ? 'la' : 'el'} ${sc.label} {${{ collabs: 'collab', stores: 'store', campaigns: 'campaign' }[entity]}}`, { [{ collabs: 'collab', stores: 'store', campaigns: 'campaign' }[entity]]: n.id });
      toast(entity === 'users' ? `Cuenta creada para <b>${esc(data.email)}</b> · contraseña temporal <b>${tempPassword()}</b> (se cambia en el primer acceso)` : `${esc(data.name || data.code)} creado correctamente`);
      const to = { collabs: `colaboradores/${n.id}`, campaigns: `campanas/${n.id}`, stores: `tienda/${n.id}` }[entity];
      if (to) return close(), go(to);
    }
    close(); render();
  }
  function deactivateModal(id) { const u = byId(DB.users, id), c = Views.helpers.activeCampaign();
    if (u.status === 'Inactivo') { u.status = 'Activo'; render(); return toast(`${esc(u.name)} reactivado`); }
    if (u.id === S.user.id) return toast('No puedes desactivar tu propia cuenta');
    const zones = DB.zoneAssignments.filter(z => z.user === u.id && byId(DB.campaigns, z.campaign).status !== 'Finalizada'), parts = DB.collabParticipation.filter(p => p.coords?.includes(u.id) && byId(DB.campaigns, p.campaign).status !== 'Finalizada');
    const peers = DB.users.filter(x => x.id !== u.id && x.role === u.role && x.status !== 'Inactivo' && (u.role !== 'rcol' || x.collab === u.collab));
    const items = [...zones.map(z => `Zona ${esc(byId(DB.zones, z.zone).name)} en ${esc(byId(DB.campaigns, z.campaign).code)}`), ...parts.map(p => `Coordina a ${esc(byId(DB.collabs, p.collab).name)} en ${esc(byId(DB.campaigns, p.campaign).code)}`),
      ...(u.role === 'rcol' ? [`Responsable de ${esc(byId(DB.collabs, u.collab).name)}`] : []), ...(u.role === 'rtienda' ? [`Líder del grupo ${esc(byId(DB.groups, u.group)?.code || '')}`] : [])];
    modal(`Desactivar a ${esc(u.name)}`, `<p class="small muted" style="margin-top:0">No podrá entrar en la app. Se conserva su histórico (incidencias, cambios, avisos).</p>
      ${items.length ? `<div class="card card-pad small" style="margin-bottom:12px"><b>Tenía asignado:</b>${items.map(x => `<div>• ${x}</div>`).join('')}</div>
      <div class="field"><label>Reasignar a</label><select class="input" id="da-to"><option value="">Nadie (queda pendiente para Administración)</option>${peers.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select>${u.role === 'rtienda' ? '<span class="hint">El líder se cambia desde el grupo.</span>' : ''}</div>` : '<p class="small">No tenía nada asignado.</p>'}`,
      btn('Cancelar', { act: 'close' }) + btn('Desactivar', { kind: 'danger solid', act: 'do-deactivate', data: `data-id="${u.id}"` }), 'sm'); }
  const CATALOGS = ['zones', 'localities', 'chains', 'campaignTypes', 'reportTypes'];
  function remove(entity, id) {
    if (entity === 'users') return deactivateModal(id);
    const sc = SCHEMAS[entity], obj = byId(sc.list, id), label = obj.name || obj.code;
    if (CATALOGS.includes(entity)) return confirm(`Archivar ${sc.label}`, `¿Archivar <b>${esc(label)}</b>? Dejará de aparecer en las listas, pero se conserva en los datos existentes y en el histórico.`, () => { obj.archived = true; close(); render(); toast(`${esc(label)} archivado`, () => { obj.archived = false; render(); }); }, 'Archivar');
    const used = sc.uses?.(obj) || 0;
    if (used) return modal(`No se puede eliminar`, `<p class="muted" style="margin:0"><b>${esc(label)}</b> está en uso en ${used} registros. Reasígnalos antes de eliminarla para no dejar relaciones rotas.</p>`, btn('Entendido', { act: 'close' }), 'sm');
    confirm(`Eliminar ${sc.label}`, `¿Seguro que quieres eliminar <b>${esc(label)}</b>? Podrás deshacerlo durante unos segundos.`, () => {
      const i = sc.list.indexOf(obj); sc.list.splice(i, 1); close(); render();
      toast(`${esc(label)} eliminado`, () => { sc.list.splice(i, 0, obj); render(); });
    });
  }

  /* ---------- Turnos: asignación, incidencias, bajas ---------- */
  function assignModal(id, tab) {
    const s = byId(DB.shifts, id), st = byId(DB.stores, s.store), free = s.capacity - filled(s);
    const rcol = S.user.role === 'rcol';
    const groups = scope.groups(S), entities = rcol ? [] : scope.collabs(S).filter(c => c.status === 'Validado' && !c.ownsVolunteers);
    const vols = scope.volunteers(S).filter(v => !toPurge(v) && !v.blocked);
    const tabs = [['group', 'Grupo'], ...(entities.length ? [['collab', 'Entidad sin grupos']] : []), ['vol', rcol ? 'Voluntario suelto' : 'Voluntario independiente']];
    tab = tab || 'group';
    const sameSlot = x => x.date === s.date && x.slot === s.slot;
    const busyG = g => DB.shifts.some(x => sameSlot(x) && x.assignments.some(a => a.kind === 'group' && a.group === g.id));
    const busyV = v => DB.shifts.some(x => sameSlot(x) && x.assignments.some(a => (a.kind === 'vol' && a.vol === v.id) || (a.kind === 'group' && byId(DB.groups, a.group)?.members.includes(v.id))));
    const last = DB.history[st.id];
    const pick = (kind, ref, title, sub, off, extra = '') => `<div class="pick ${off ? 'disabled' : ''}" data-act="do-assign" data-id="${s.id}" data-kind="${kind}" data-ref="${ref}">${iconBox(kind === 'vol' ? 'user' : kind === 'group' ? 'users' : 'building')}<div style="flex:1"><b>${esc(title)}</b><div class="small muted">${sub}</div></div>${off ? '<span class="small faint">Ocupado en esta franja</span>' : extra + icon('chev')}</div>`;
    const peopleField = `<div class="field" style="margin-bottom:12px"><label>Personas que van</label><input class="input" id="assign-n" type="number" min="1" placeholder="${tab === 'group' ? 'Todo el grupo' : free}" ${tab === 'collab' ? `value="${Math.max(1, free)}"` : ''}><span class="hint">${tab === 'group' ? `Vacío = el grupo completo. Quedan ${free} plazas; puedes superarlas (se mostrará un aviso) o enviar solo una parte y repartir el resto en otro turno.` : 'Puedes superar la capacidad; se mostrará un aviso.'}</span></div>`;
    const body = tab === 'group' ? peopleField + (groups.length ? groups.map(g => { const c = byId(DB.collabs, g.collab); const clash = Views.helpers.memberClashes(g, s).length; return pick('group', g.id, g.code, `${esc(c.name)} · ${gsize(g)} personas${clash ? ` · <span style="color:var(--warn)">${clash} ${clash > 1 ? 'miembros tienen' : 'miembro tiene'} otro turno a esa hora</span>` : ''}`, busyG(g), last === c.id && can(S, 'history.last') ? badge('Repite', 'ok') : ''); }).join('') : UI.empty('Sin grupos', rcol ? 'Crea antes un grupo con tus voluntarios.' : 'Ninguna entidad de tu ámbito ha creado grupos.'))
      : tab === 'collab' ? peopleField + entities.map(c => pick('collab', c.id, c.name, `${esc(c.type)} · capacidad ${c.capacity}`, false, last === c.id && can(S, 'history.last') ? badge('Repite', 'ok') : '')).join('')
      : vols.length ? vols.map(v => pick('vol', v.id, v.name, `${esc(Views.helpers.loc(v.locality)?.name)} · ${esc(v.phone)}`, busyV(v))).join('') : UI.empty('Sin voluntarios', 'No hay voluntarios disponibles.');
    modal(S.substituteFor ? 'Buscar sustituto' : 'Asignar turno', `${S.substituteFor ? `<div class="card card-pad small" style="margin-bottom:12px;background:var(--info-bg);border-color:transparent">${icon('alert')} Al asignar, la incidencia se marcará como resuelta. Los ocupados en esta franja aparecen desactivados.</div>` : ''}
      <div class="card card-pad" style="background:var(--surface-2);margin-bottom:16px"><div class="row"><b>${R.store(st.id)}</b><span class="small faint">${esc(storeSub(st))}</span><span class="spacer"></span>${badge(free + ' plazas libres', 'brand')}</div>
        <div class="small muted">${UI.fmtDate(s.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${s.slot} · ${R.zone(st.zone)}</div>
        ${last && can(S, 'history.last') ? `<div class="small" style="margin-top:6px">${icon('clock')} Campaña anterior: ${R.collab(last)}</div>` : ''}</div>
      <div class="form-grid" style="margin-bottom:16px"><div class="field"><label>Hora inicio</label><input class="input" type="time" id="as-start" value="${s.start}"></div><div class="field"><label>Hora fin</label><input class="input" type="time" id="as-end" value="${s.end}"></div></div>
      <div class="seg" style="margin-bottom:12px">${tabs.map(([k, l]) => `<button class="${tab === k ? 'active' : ''}" data-act="assign-tab" data-id="${s.id}" data-v="${k}">${l}</button>`).join('')}</div>${body}`);
  }
  function groupModal(id) {
    const g = id ? byId(DB.groups, id) : { code: '', members: [], leader: null }, col = byId(DB.collabs, S.user.collab);
    const vols = DB.volunteers.filter(v => v.collab === col.id), otherGroups = vid => DB.groups.filter(x => x.id !== g.id && x.members.includes(vid)).map(x => x.code), taken = new Set();
    const prefix = DB.groups.find(x => x.collab === col.id)?.code.split('-')[0] || col.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').toUpperCase().slice(0, 3);
    const next = `${prefix}-${String(DB.groups.filter(x => x.collab === col.id).length + 1).padStart(2, '0')}`;
    modal(id ? `Editar grupo ${g.code}` : 'Nuevo grupo', `<form id="group-form" class="stack">
      <div class="field"><label>Identificador del grupo</label><input class="input" name="code" required value="${esc(g.code || next)}"><span class="hint">Propuesto por la app; puedes cambiarlo. Debe ser único. Es lo único que verá Bancosol, junto al número de personas.</span></div>
      <div class="field"><label>Voluntarios del grupo</label><input class="input" placeholder="Escribe un nombre para buscar en tus voluntarios…" oninput="document.querySelectorAll('[data-vname]').forEach(el => el.style.display = el.dataset.vname.includes(this.value.toLowerCase()) ? '' : 'none')" style="margin-bottom:8px"><span class="hint" style="margin-bottom:8px">Elige personas que ya participaron para no duplicarlas. ¿No está? Créala en Voluntarios.</span>${vols.filter(v => !v.blocked).map(v => `<label class="pick" data-vname="${esc(v.name.toLowerCase())}" style="cursor:pointer;margin:0 0 6px"><input type="checkbox" class="check" name="m" value="${v.id}" ${g.members.includes(v.id) ? 'checked' : ''} ${taken.has(v.id) ? 'disabled' : ''}>${avatar(v.name, 'sm')}<div style="flex:1"><b class="small">${esc(v.name)}</b><div class="small muted">${esc(v.phone)}${otherGroups(v.id).length ? ` · también en ${otherGroups(v.id).join(', ')}` : ''}</div></div></label>`).join('')}</div>
      <div class="field"><label>Líder del grupo</label><select class="input" name="leader">${vols.map(v => `<option value="${v.id}" ${v.id === g.leader ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select><span class="hint">Debe ser uno de los voluntarios del grupo.</span></div>
      <label class="row small"><input type="checkbox" class="check" name="access" ${g.id && DB.users.some(u => u.group === g.id) ? 'checked' : ''}>Dar acceso a la app al líder (ve los turnos de su grupo y registra incidencias)</label></form>`,
      btn('Cancelar', { act: 'close' }) + btn(id ? 'Guardar' : 'Crear grupo', { kind: 'primary', icon: 'check', act: 'save-group', data: `data-id="${id || ''}"` }));
  }
  function incidentModal(id) {
    const s = byId(DB.shifts, id);
    modal('Registrar incidencia', `<p class="small muted" style="margin-top:0">${R.store(s.store)} · ${UI.fmtDate(s.date, { weekday: 'long', day: 'numeric' })} · ${s.slot}</p>
      <div class="stack"><div class="field"><label>Tipo</label><select class="input" id="inc-type">${DB.reportTypes.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Descripción</label><textarea class="input" id="inc-note" placeholder="Qué ha pasado y si se ha buscado sustituto"></textarea></div>
      <label class="row small"><input type="checkbox" class="check" id="inc-urgent">Urgente (p. ej. el turno se queda sin nadie hoy)</label></div>`,
      btn('Cancelar', { act: 'close' }) + btn('Registrar', { kind: 'primary', icon: 'check', act: 'do-incident', data: `data-id="${id}"` }), 'sm');
  }
  function purgeModal() {
    const list = scope.volunteers(S).filter(toPurge);
    modal('Propuesta de bajas', `<p class="small muted" style="margin-top:0">Llevan ${DB.settings.inactiveCampaigns} o más campañas sin participar. Desmarca a quien quieras conservar.</p>
      ${list.map(v => `<label class="pick" style="cursor:pointer"><input type="checkbox" class="check purge-chk" value="${v.id}" checked>${avatar(v.name)}<div style="flex:1"><b>${esc(v.name)}</b><div class="small muted">${esc(byId(DB.collabs, v.collab).name)} · última: ${esc(v.history.at(-1) || 'nunca')}</div></div></label>`).join('')}`,
      btn('Cancelar', { act: 'close' }) + btn('Confirmar bajas', { kind: 'danger solid', act: 'do-purge' }));
  }

  /* ---------- Paleta (Ctrl+K): salta a cualquier ficha ---------- */
  function palette() {
    modal('Buscar en la intranet', `<div class="input-icon">${icon('search')}<input class="input" id="pal-q" placeholder="Páginas, tiendas, zonas, colaboradores, grupos…"></div><div id="pal-res" style="margin-top:12px"></div>`);
    const items = [...NAV.filter(n => allowed(n.k)).map(n => ({ l: n.l, s: 'Página', i: n.i, to: n.k })),
      ...(allowed('tienda') ? scope.stores(S).map(t => ({ l: t.name, s: 'Tienda', i: 'store', to: `tienda/${t.id}` })) : []),
      ...(allowed('zona') ? DB.zones.map(z => ({ l: z.name, s: 'Zona', i: 'map', to: `zona/${z.id}` })) : []),
      ...(allowed('localidad') ? DB.localities.map(z => ({ l: z.name, s: 'Localidad', i: 'pin', to: `localidad/${z.id}` })) : []),
      ...(allowed('colaboradores') ? scope.collabs(S).map(c => ({ l: c.name, s: 'Colaborador', i: 'building', to: `colaboradores/${c.id}` })) : []),
      ...(allowed('grupo') ? scope.groups(S).map(g => ({ l: g.code, s: 'Grupo', i: 'users', to: `grupo/${g.id}` })) : []),
      ...(allowed('voluntario') ? scope.volunteers(S).map(v => ({ l: v.name, s: 'Voluntario', i: 'user', to: `voluntario/${v.id}` })) : []),
      ...(allowed('usuario') ? DB.users.map(u => ({ l: u.name, s: 'Usuario', i: 'user', to: `usuario/${u.id}` })) : [])];
    const draw = q => { const r = items.filter(x => x.l.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
      document.getElementById('pal-res').innerHTML = r.length ? r.map((x, i) => `<div class="palette-item ${i ? '' : 'sel'}" data-act="go" data-to="${x.to}">${icon(x.i)}<span style="flex:1">${esc(x.l)}</span><span class="small faint">${x.s}</span></div>`).join('') : '<div class="empty small">Sin resultados</div>'; };
    const inp = document.getElementById('pal-q'); draw(''); inp.oninput = () => draw(inp.value);
    inp.onkeydown = e => { if (e.key === 'Enter') document.querySelector('.palette-item.sel')?.click(); };
  }

  /* ---------- Render ---------- */
  const go = to => { location.hash = '#/' + to; };
  const route = () => { const [page = 'inicio', a, b] = location.hash.replace(/^#\/?/, '').split('/'); return { page, a, b }; };

  const STORE_ABSENCE_REASONS = ['Cierre temporal', 'Reformas', 'Incendio u otro siniestro', 'Decisión de la cadena', 'Otro'];
  /* Crea mañana y tarde en cada día de campaña según el horario de la tienda (solo si aún no tiene turnos). */
  const ensureShifts = (c, st) => { if (DB.shifts.some(s => s.campaign === c.id && s.store === st.id)) return 0; let n = 0, id = Math.max(0, ...DB.shifts.map(s => s.id));
    const cap = st.checkout_shelfs === 2 ? DB.settings.twoLinesCapacity : DB.settings.baseCapacity;
    c.days.forEach(date => { const wd = (new Date(date + 'T12:00').getDay() + 6) % 7 + 1, h = DB.schedules.filter(x => x.store === st.id && x.week_day === wd).sort((a, b) => a.open.localeCompare(b.open)); if (!h.length) return;
      const open = h[0].open, closeT = h.at(-1).close;
      [['Mañana', open, DB.settings.morningEnd], ['Tarde', DB.settings.afternoonStart, closeT]].forEach(([slot, start, end]) => { if (end > start) { DB.shifts.push({ id: ++id, campaign: c.id, store: st.id, date, slot, start, end, capacity: cap, notes: '', assignments: [] }); n++; } }); });
    return n; };
  /* ¿La persona ya va a otro turno que se solapa? Cuenta grupos completos y personas elegidas. */
  const busyAt = (vid, s) => DB.shifts.some(x => x !== s && x.date === s.date && x.start < s.end && s.start < x.end && x.assignments.some(a => (a.kind === 'vol' && a.vol === vid) || (a.kind === 'group' && (a.members || byId(DB.groups, a.group)?.members || []).includes(vid))));
  const pendingNomination = a => a.kind === 'group' && a.people && !a.members;
  function nominateModal(sid, i) {
    const s = byId(DB.shifts, sid), a = s.assignments[i], g = byId(DB.groups, a.group);
    modal(`¿Quién va de ${esc(g.code)}?`, `<p class="small muted" style="margin-top:0">${esc(Shifts.shiftLabel(s))} · elige <b>${a.people}</b> de ${g.members.length}. Bancosol solo verá sus identificadores.</p>
      <div class="stack" style="gap:6px">${g.members.map(vid => { const v = byId(DB.volunteers, vid), busy = busyAt(vid, s); return `<label class="pick" style="margin:0;cursor:pointer;${busy ? 'opacity:.55' : ''}"><input type="checkbox" class="check nom-chk" value="${vid}" ${(a.members || []).includes(vid) ? 'checked' : ''} ${busy ? 'disabled' : ''}>${avatar(v.name, 'sm')}<div style="flex:1"><b class="small">${esc(v.name)}</b><div class="small muted">${esc(v.code || 'V-' + String(v.id).padStart(5, '0'))}${busy ? ' · <span style="color:var(--warn)">ya va a otro turno a esa hora</span>' : ''}</div></div></label>`; }).join('')}</div>`,
      btn('Más tarde', { act: 'close' }) + btn('Confirmar', { kind: 'primary', icon: 'check', act: 'do-nominate', data: `data-id="${sid}" data-i="${i}"` }), 'sm');
  }
  function substituteModal(r) {
    const s = byId(DB.shifts, r.shift), st = byId(DB.stores, s.store), missing = Math.max(1, s.capacity - filled(s)), zoneOf = colId => byId(DB.localities, byId(DB.collabs, colId)?.locality)?.zone;
    const groupBusy = g => DB.shifts.some(x => x.date === s.date && x.start < s.end && s.start < x.end && x.assignments.some(a => a.kind === 'group' && a.group === g.id));
    const groups = scope.groups(S).filter(g => !g.archived && !groupBusy(g)).map(g => ({ kind: 'group', ref: g.id, title: g.code, sub: `${esc(byId(DB.collabs, g.collab).name)} · ${gsize(g)} personas`, near: zoneOf(g.collab) === st.zone }));
    const vols = scope.volunteers(S).filter(v => !v.blocked && !toPurge(v) && !busyAt(v.id, s)).map(v => ({ kind: 'vol', ref: v.id, title: v.name, sub: `Voluntario · ${esc(Views.helpers.loc(v.locality)?.name || '')}`, near: byId(DB.localities, v.locality)?.zone === st.zone }));
    const list = [...groups, ...vols].sort((a, b) => b.near - a.near).slice(0, 8);
    modal('Sustituto para el turno', `<div class="card card-pad" style="background:var(--surface-2);margin-bottom:12px"><b>${R.store(st.id)}</b><div class="small muted">${esc(Shifts.shiftLabel(s))} · faltan ${missing} ${missing === 1 ? 'persona' : 'personas'} · ${esc(byId(DB.reportTypes, r.type).name)}</div></div>
      <div class="small muted" style="margin-bottom:8px">Libres en esa franja, primero los de la misma zona. Al elegir, se asigna, se avisa y la incidencia queda resuelta.</div>
      ${list.length ? list.map(x => `<div class="pick" data-act="do-substitute" data-id="${r.id}" data-kind="${x.kind}" data-ref="${x.ref}">${iconBox(x.kind === 'vol' ? 'user' : 'users')}<div style="flex:1"><b>${esc(x.title)}</b><div class="small muted">${x.sub}</div></div>${x.near ? badge('Misma zona', 'ok') : ''}${icon('chev')}</div>`).join('') : UI.empty('Nadie libre', 'No hay grupos ni voluntarios libres a esa hora en tu ámbito.')}`,
      btn('Ver todas las opciones', { kind: 'ghost', act: 'find-substitute-all', data: `data-id="${r.id}"` }) + btn('Cerrar', { act: 'close' }));
  }
  function attendanceModal(c) {
    const sh = DB.shifts.filter(s => s.campaign === c.id && s.assignments.length), noShow = s => DB.reports.some(r => r.shift === s.id && r.type === 2);
    modal(`Cerrar ${esc(c.code)}: asistencia`, `<p class="small muted" style="margin-top:0">Marca quién vino de verdad. Por defecto todos; los turnos con incidencia «No se presentó» vienen desmarcados. Solo cuenta como participación lo marcado.</p>
      <div class="stack" style="gap:6px;max-height:50vh;overflow:auto">${sh.map(s => s.assignments.map((a, i) => `<label class="row small" style="padding:6px 0;border-bottom:1px solid var(--border)"><input type="checkbox" class="check att-chk" data-s="${s.id}" data-i="${i}" ${noShow(s) ? '' : 'checked'}><span style="flex:1"><b>${esc(asgText(a))}</b> <span class="muted">· ${esc(Shifts.shiftLabel(s))}</span></span>${noShow(s) ? badge('No se presentó', 'danger') : ''}</label>`).join('')).join('') || '<div class="small muted">No hay turnos con personas asignadas.</div>'}</div>`,
      btn('Cancelar', { act: 'close' }) + btn('Confirmar y finalizar', { kind: 'primary', icon: 'check', act: 'do-finish', data: `data-id="${c.id}"` }));
  }
  /* Editor de tramos horarios: varias filas inicio–fin por día o por fecha. */
  const slotRow = (o, c) => `<div class="row slot-row"><input class="input" type="time" data-o value="${o || ''}"><span class="muted">–</span><input class="input" type="time" data-c value="${c || ''}">${btn('', { kind: 'ghost danger', size: 'sm', icon: 'x', act: 'slot-del', title: 'Quitar tramo' })}</div>`;
  const readSlots = k => { const sl = [...document.querySelectorAll(`[data-slots="${k}"] .slot-row`)].map(r => [r.querySelector('[data-o]').value, r.querySelector('[data-c]').value]).filter(([o, c]) => o || c).sort((a, b) => a[0].localeCompare(b[0]));
    if (sl.some(([o, c]) => !o || !c || c <= o)) { toast('Cada tramo necesita inicio y un fin posterior'); return null; }
    if (sl.some(([o], i) => i && o < sl[i - 1][1])) { toast('Hay tramos que se solapan en el mismo día'); return null; }
    return sl; };
  const addScheduleException = (store, { date, closed, open, close: closeTime }) => { DB.scheduleExceptions.splice(0, DB.scheduleExceptions.length, ...DB.scheduleExceptions.filter(e => !(e.store === store && e.date === date))); DB.scheduleExceptions.push({ id: nextId(DB.scheduleExceptions), store, date, closed, open: closed ? null : open, close: closed ? null : closeTime }); };
  function importVolunteers(rows) { const collab = S.user.collab || 1, norm = x => String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let added = 0, dups = 0, minors = 0;
    rows.forEach(([name, phone, city, minor]) => { if (!name || !phone) return;
      if (DB.volunteers.some(v => v.collab === collab && (v.phone === String(phone) || norm(v.name) === norm(name)))) { dups++; return; }
      const locality = DB.localities.find(l => norm(l.name) === norm(city))?.id || null, isMinor = /^s/i.test(String(minor)); if (isMinor) minors++;
      DB.volunteers.push({ id: nextId(DB.volunteers), collab, name, phone: String(phone), locality, localities: locality ? [locality] : [], email: '', history: [], minor: isMinor, blocked: false }); added++; });
    close(); render(); toast(`${added} voluntarios importados · ${dups} ya existían${minors ? ` · ${minors} menores: completa los datos del tutor` : ''}`); }
  const tempPassword = () => 'Bs-' + Math.random().toString(36).slice(2, 8);
  function login() {
    const demo = [[1, 'Configura campañas, importa tiendas, valida colaboradores y gestiona catálogos y usuarios.'], [2, 'Coordina sus zonas en la campaña y asigna turnos a sus colaboradores.'], [4, 'Gestiona los voluntarios y grupos de la Universidad y sus tiendas.'], [5, 'Líder del grupo UMA-02: consulta sus turnos y registra incidencias.']];
    app.innerHTML = `<div class="login">
      <div class="login-art"><div class="brand" style="padding:0;color:#fff"><span class="brand-mark" style="background:rgba(255,255,255,.2)">${icon('heart')}</span>BANCOSOL</div>
        <div><h2>Organiza el voluntariado de cada recogida, sin hojas de cálculo.</h2><p style="opacity:.85;max-width:420px">Tiendas, colaboradores, grupos y turnos en un único lugar para todo el equipo.</p></div>
        <div class="small" style="opacity:.7">Prototipo de diseño · datos de ejemplo</div></div>
      <div class="login-form"><div><h1>Iniciar sesión</h1><p class="muted">Los voluntarios no necesitan cuenta: los gestiona su entidad.</p>
        <div class="stack" style="margin:20px 0"><div class="field"><label>Usuario o email</label><input class="input" value="maria.garcia"></div><div class="field"><label>Contraseña</label><input class="input" type="password" value="prototipo"></div>
        ${btn('Entrar', { kind: 'primary', act: 'login', data: 'data-id="1" style="justify-content:center;height:40px"' })}<div class="small muted">¿Has olvidado la contraseña? Pide a Administración que te la restablezca. En el primer acceso se cambia la contraseña temporal.</div></div>
        <div class="row small faint" style="margin:24px 0 12px"><span style="flex:1;height:1px;background:var(--border)"></span>o prueba como<span style="flex:1;height:1px;background:var(--border)"></span></div>
        ${demo.map(([id, d]) => { const u = byId(DB.users, id), r = Views.helpers.role(u.role); return `<button class="role-pick" data-act="login" data-id="${id}">${avatar(u.name)}<div style="flex:1"><b>${esc(r.name)}</b> <span class="small faint">· ${esc(u.name)}</span><div class="small muted">${d}</div></div>${icon('chev')}</button>`; }).join('')}
      </div></div></div>`;
  }

  const isAdminCat = p => S.user?.role === 'admin' && ['tiendas', 'colaboradores', 'voluntarios', 'catalogos'].includes(p);
  function render() {
    if (!S.user) return login();
    Shifts.bind(S, render);
    let { page, a, b } = route();
    if (!allowed(page)) page = 'inicio';
    const V = Views;
    const views = { inicio: () => V.inicio(S), campanas: () => a === 'nueva' ? CampaignWizard.view(S) : a ? V.campana(S, a, b) : V.campanas(S), tiendas: () => V.tiendas(S, a), tienda: () => V.tienda(S, a), zona: () => V.zona(S, a), localidad: () => V.localidad(S, a), cadena: () => V.cadena(S, a),
      importar: () => Import.view(S), turnos: () => Shifts.view(S), colaboradores: () => a ? V.colaborador(S, a) : V.colaboradores(S), entidad: () => V.colaborador(S, S.user.collab),
      grupos: () => V.grupos(S), grupo: () => V.grupo(S, a), voluntarios: () => V.voluntarios(S), voluntario: () => V.voluntario(S, a), incidencias: () => V.incidencias(S),
      usuarios: () => V.usuarios(S, a), usuario: () => V.usuario(S, a), perfil: () => V.perfil(S), catalogos: () => V.catalogos(S, a), configuracion: () => V.configuracion(S), flujos: () => Flows.view(S), historico: () => V.historico(S) };
    const r = V.helpers.role(S.user.role), mine = NAV.filter(n => n.roles.includes(S.user.role));
    const here = [page, a, b].filter(Boolean).join('/'), exact = NAV.find(n => n.to?.() === here || (n.to && here.startsWith(n.to() + '/') && n.k.startsWith('k-') === false && n.k !== 'c-resumen'));
    const active = isAdminCat(page) ? 'catalogos' : exact ? exact.k : NAV.some(n => n.k === page && !n.to) ? page : page === 'catalogos' ? (NAV.find(n => n.to?.() === here)?.k || 'catalogos') : (PARENT[page] || '').split('/')[0];
    const navItem = n => { const c = n.count?.(); return `<button class="nav ${active === n.k ? 'active' : ''}" data-act="go" data-to="${n.to ? n.to() : n.k}">${icon(n.i)}${n.l}${c ? `<span class="count">${c}</span>` : ''}</button>`; };
    const groups = [...new Set(mine.map(n => n.group || 'General'))];
    const name = { campanas: () => a === 'nueva' ? 'Nueva campaña' : byId(DB.campaigns, a)?.name, colaboradores: () => byId(DB.collabs, a)?.name, tienda: () => byId(DB.stores, a)?.name, zona: () => byId(DB.zones, a)?.name, localidad: () => byId(DB.localities, a)?.name, cadena: () => byId(DB.chains, a)?.name, grupo: () => byId(DB.groups, a)?.code, voluntario: () => byId(DB.volunteers, a)?.name, usuario: () => byId(DB.users, a)?.name }[page];
    const sub = a && name ? name() : '';
    const parent = PARENT[page] && allowed(PARENT[page].split('/')[0]) ? PARENT[page] : page;
    const focus = document.activeElement?.dataset?.filter, caret = document.activeElement?.selectionStart;
    app.innerHTML = `<div class="layout">
      <aside class="sidebar" id="sidebar"><div class="brand"><span class="brand-mark">${icon('heart')}</span>BANCOSOL</div>
        ${groups.map(g => `${g === 'General' ? '' : `<div class="nav-label">${g}</div>`}${g === 'Campaña actual' ? `<div class="nav-campaign"><b>${esc(V.helpers.activeCampaign().name)}</b>${badge(V.helpers.activeCampaign().status)}</div>` : ''}${mine.filter(n => (n.group || 'General') === g).map(navItem).join('')}`).join('')}
        </aside>
      <div class="main"><header class="topbar">
          <button class="btn ghost icon menu-toggle" data-act="side">${icon('menu')}</button>
          <div class="crumbs"><a href="#/${parent}" data-act="go" data-to="${parent}">${TITLES[page]}</a>${sub ? `${icon('chev')}<b>${esc(sub)}</b>` : ''}</div>
          <div class="search" data-act="palette">${icon('search')}Buscar…<kbd>Ctrl K</kbd></div>
          ${btn('', { kind: 'ghost', icon: 'help', act: 'help', title: 'Ayuda de esta vista' })}
          ${Shifts.bell(S)}
          ${btn('', { kind: 'ghost', icon: S.theme === 'dark' ? 'sun' : 'moon', act: 'theme', title: 'Cambiar tema' })}
          <div class="menu-wrap"><button class="user-btn" data-act="menu">${avatar(S.user.name)}<div style="text-align:left;line-height:1.2"><b class="small">${esc(S.user.name)}</b><div class="small faint">${esc(r.name)}</div></div></button>
            ${S.menu ? `<div class="menu"><div style="padding:8px 10px"><b>${esc(S.user.name)}</b><div class="small muted">${esc(S.user.email)}</div></div><hr>
              <button data-act="go" data-to="perfil">${icon('user')}Mi perfil</button><button data-act="go" data-to="flujos">${icon('route')}Flujos de trabajo</button>
              <button data-act="logout">${icon('users')}Cambiar de rol (demo)</button><hr><button data-act="logout" style="color:var(--danger)">${icon('logout')}Cerrar sesión</button></div>` : ''}</div>
        </header><main class="content fade-in">${isAdminCat(page) ? V.helpers.catalogTabs(here) : ''}${views[page]()}</main></div></div>`;
    if (focus) { const el = app.querySelector(`[data-filter="${focus}"]`); el?.focus(); if (el?.setSelectionRange && caret != null) el.setSelectionRange(caret, caret); }
    if (S.f.focus) app.querySelector('.shift.focus')?.scrollIntoView?.({ block: 'center' });
  }

  /* ---------- Acciones ---------- */
  const shiftTimes = s => { const a = document.getElementById('as-start')?.value, b = document.getElementById('as-end')?.value; if (a) s.start = a; if (b) s.end = b; };
  const actions = {
    go: d => { S.menu = false; close(); if (route().page + (route().a ? '/' + route().a : '') + (route().b ? '/' + route().b : '') === d.to) render(); else go(d.to); },
    'go-filter': d => { close(); S.pendingF = { [d.k]: d.v }; go(d.to); if (route().page === d.to) { Object.assign(S.f, S.pendingF); S.pendingF = null; render(); } },
    'open-shift': d => { const s = byId(DB.shifts, d.id); close(); S.pendingF = { campaign: s.campaign, day: s.date, store: String(s.store), focus: s.id }; if (route().page === 'turnos') { Object.assign(S.f, S.pendingF); S.pendingF = null; render(); } else go('turnos'); },
    login: d => { if (byId(DB.users, d.id).status === 'Inactivo') return toast('Esta cuenta está desactivada'); S.user = byId(DB.users, d.id); S.f = {}; Import.reset(); saveSession(S.user.id); location.hash = '#/inicio'; render(); toast(`Sesión iniciada como <b>${esc(S.user.name)}</b>`); },
    logout: () => { S.user = null; S.menu = false; saveSession(null); location.hash = ''; render(); },
    menu: () => { S.menu = !S.menu; render(); },
    theme: () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = S.theme; try { localStorage.setItem('bs-theme', S.theme); } catch {} render(); },
    side: () => document.getElementById('sidebar').classList.toggle('open'),
    'perm-edit': () => { drawer('Editar permisos', `<div class="card card-pad small" style="background:var(--danger-bg, #fde8e8);color:var(--danger);border-color:transparent;margin-bottom:16px">${icon('alert')} Cambiar permisos afecta a todos los usuarios del rol. Se hará una copia de seguridad antes de aplicar.</div>
      <div class="table-wrap"><table class="matrix"><thead><tr><th>Permiso</th>${DB.roles.map(r => `<th>${esc(r.name)}</th>`).join('')}</tr></thead><tbody>${DB.permissions.map(([k, l]) => `<tr><td><b>${esc(l)}</b></td>${DB.roles.map(r => `<td><input type="checkbox" class="check perm-edit" data-role="${r.id}" data-perm="${k}" ${DB.rolePerms[r.id].includes(k) ? 'checked' : ''} ${r.id === 'admin' ? 'disabled' : ''}></td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
      btn('Cancelar', { act: 'close' }) + btn('Revisar cambios', { kind: 'danger solid', act: 'perm-review' })); document.querySelector('.drawer')?.classList.add('full'); },
    'perm-review': () => { const changes = [...document.querySelectorAll('.perm-edit')].filter(el => el.checked !== DB.rolePerms[el.dataset.role].includes(el.dataset.perm)).map(el => ({ role: el.dataset.role, perm: el.dataset.perm, on: el.checked }));
      if (!changes.length) return toast('No hay cambios');
      const label = c => `${c.on ? '+' : '−'} ${esc(DB.permissions.find(p => p[0] === c.perm)[1])} · ${esc(DB.roles.find(r => r.id === c.role).name)}`;
      modal('Confirmar cambios de permisos', `<p class="small" style="color:var(--danger);margin-top:0">Esta acción cambia lo que pueden hacer los usuarios de estos roles.</p>${changes.map(c => `<div class="small">${label(c)}</div>`).join('')}
        <div class="field" style="margin-top:12px"><label>Escribe CONFIRMAR para aplicar</label><input class="input" id="perm-ok"></div>`, btn('Cancelar', { act: 'close' }) + btn('Aplicar', { kind: 'danger solid', act: 'perm-apply' }), 'sm');
      S.permChanges = changes; },
    'perm-apply': () => { if (document.getElementById('perm-ok').value.trim() !== 'CONFIRMAR') return toast('Escribe CONFIRMAR para aplicar');
      S.permChanges.forEach(c => { const l = DB.rolePerms[c.role]; if (c.on) l.push(c.perm); else l.splice(l.indexOf(c.perm), 1); }); toast(`${S.permChanges.length} cambios aplicados · copia de seguridad guardada`); S.permChanges = null; close(); render(); },
    palette, close, help: () => UI.help(route().page, TITLES[route().page]),
    'panel-size': () => document.querySelector('.drawer')?.classList.toggle('full'), 'confirm-ok': () => UI._onConfirm?.(),
    filter: d => { S.f[d.k] = d.v; render(); },
    new: d => openForm(d.entity), edit: d => openForm(d.entity, d.id), save: d => save(d.entity, d.id), delete: d => remove(d.entity, d.id),
    validate: d => { const c = byId(DB.collabs, d.id), pending = c.coords; c.status = 'Validado'; c.coords = pending; audit('collabs', c.id, 'Validado'); render(); toast(`${esc(c.name)} validado.${c.coords.length ? '' : ' Asígnale un coordinador.'}`); },
    'add-contact': d => modal('Añadir persona de contacto', `<form id="contact-form" class="form-grid"><div class="field full"><label>Nivel <span class="prop">Propuesta</span></label><select class="input" name="level"><option>Decisor</option><option>Responsable colaborador</option></select></div>
      <div class="field full"><label>Nombre</label><input class="input" name="name" required></div><div class="field"><label>Teléfono</label><input class="input" name="phone" required pattern="${PHONE.pattern}" title="${PHONE.title}"></div><div class="field"><label>Email</label><input class="input" type="email" name="email"></div>
      <label class="row small full"><input type="checkbox" class="check" name="invite">Invitarle a la app como responsable del colaborador</label></form>`, btn('Cancelar', { act: 'close' }) + btn('Añadir', { kind: 'primary', act: 'save-contact', data: `data-id="${d.id}"` })),
    'save-contact': d => { const f = document.getElementById('contact-form'); if (!f.reportValidity()) return; const x = Object.fromEntries(new FormData(f));
      const k = { id: nextId(DB.contacts), collab: Number(d.id), level: x.level, name: x.name, phone: x.phone, email: x.email };
      if (x.invite) { const [first, ...rest] = x.name.split(' '); const u = { id: nextId(DB.users), name: x.name, first_name: first, surname: rest.join(' '), username: (x.email || x.name).split('@')[0], email: x.email, phone: x.phone, role: 'rcol', collab: k.collab, status: 'Pendiente', last: '—' }; DB.users.push(u); k.user = u.id; }
      DB.contacts.push(k); close(); render(); toast(`Contacto añadido${k.user ? ' · contraseña temporal ' + tempPassword() : ''}`); },
    'del-contact': d => { const k = byId(DB.contacts, d.id), i = DB.contacts.indexOf(k); DB.contacts.splice(i, 1); render(); toast(`${esc(k.name)} quitado`, () => { DB.contacts.splice(i, 0, k); render(); }); },
    participation: d => { const c = d.c ? byId(DB.campaigns, Number(d.c)) : Views.helpers.activeCampaign(); c.reasons ||= {};
      const st = byId(DB.stores, Number(d.id)), mine = DB.shifts.filter(s => s.campaign === c.id && s.store === st.id), withPeople = mine.filter(s => s.assignments.length);
      if (d.v === 'Participa') { c.participation[d.id] = true; delete c.reasons[d.id]; const n = ensureShifts(c, st); render(); return toast(n ? `<b>${esc(st.name)}</b> participa · se han creado ${n} turnos` : `<b>${esc(st.name)}</b> participa`); }
      if (d.v === 'Pendiente') { delete c.participation[d.id]; delete c.reasons[d.id]; return render(); }
      modal('No participa', `${withPeople.length ? `<div class="card card-pad small" style="margin-bottom:12px;background:var(--warn-bg);border-color:transparent">${icon('alert')} <b>${esc(st.name)}</b> tiene ${withPeople.length} turnos con personas asignadas: ${[...new Set(withPeople.flatMap(s => s.assignments.map(asgText)))].map(esc).join(', ')}. Al guardar se quitan sus ${mine.length} turnos y se avisa a los afectados.</div>` : mine.length ? `<p class="small muted" style="margin-top:0">Se quitarán sus ${mine.length} turnos (no tienen a nadie asignado).</p>` : ''}<div class="stack"><div class="field"><label>Motivo</label><select class="input" id="np-reason">${STORE_ABSENCE_REASONS.map(r => `<option>${r}</option>`).join('')}</select></div><div class="field"><label>Nota (opcional)</label><input class="input" id="np-note" placeholder="Ej. reabre en enero"></div></div>`,
        btn('Cancelar', { act: 'close' }) + btn('Guardar', { kind: 'primary', act: 'save-absence', data: `data-id="${d.id}" data-c="${d.c}"` })); },
    'save-absence': d => { const c = d.c ? byId(DB.campaigns, Number(d.c)) : Views.helpers.activeCampaign(), note = document.getElementById('np-note').value.trim(); c.participation[d.id] = false; c.reasons[d.id] = document.getElementById('np-reason').value + (note ? ` · ${note}` : '');
      const mine = DB.shifts.filter(s => s.campaign === c.id && s.store === Number(d.id)); let warned = 0;
      mine.forEach(s => { if (s.assignments.length) warned += Shifts.notify(S, s, `Turno anulado: ${Shifts.shiftLabel(s)} (la tienda no participa)`, c.reasons[d.id], s.assignments.flatMap(Shifts.leadersOf)); DB.shifts.splice(DB.shifts.indexOf(s), 1); });
      close(); render(); toast(`${esc(byId(DB.stores, d.id).name)} no participa${mine.length ? ` · ${mine.length} turnos quitados` : ''}${warned ? ` · ${warned} avisos` : ''}`); },
    'edit-schedule': d => { const s = byId(DB.stores, d.id), ch = byId(DB.chains, s.chain), days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      modal(`Horario de ${esc(s.name)}`, `<form id="sched-form" class="stack"><div class="small muted">Cada día puede tener varios tramos. Un día sin tramos queda cerrado.</div>${[1, 2, 3, 4, 5, 6, 7].map(wd => `<div class="row" style="align-items:flex-start"><b class="small" style="width:90px;padding-top:8px">${days[wd]}</b><div class="stack" style="flex:1;gap:6px" data-slots="${wd}">${DB.schedules.filter(h => h.store === s.id && h.week_day === wd).sort((a, b) => a.open.localeCompare(b.open)).map(h => slotRow(h.open, h.close)).join('')}</div>${btn('Tramo', { kind: 'ghost', size: 'sm', icon: 'plus', act: 'slot-add', data: `data-k="${wd}"` })}</div>`).join('')}</form>`,
        btn(`Usar horario de ${esc(ch.name)} (${ch.open}–${ch.close})`, { kind: 'ghost', act: 'reset-schedule', data: `data-id="${s.id}"` }) + btn('Cancelar', { act: 'close' }) + btn('Guardar', { kind: 'primary', act: 'save-schedule', data: `data-id="${s.id}"` })); },
    'slot-add': d => { document.querySelector(`[data-slots="${d.k}"]`).insertAdjacentHTML('beforeend', slotRow('17:00', '21:00')); },
    'slot-del': (d, el) => el.closest('.slot-row').remove(),
    'save-schedule': d => { const id = Number(d.id), rows = []; for (let wd = 1; wd <= 7; wd++) { const sl = readSlots(wd); if (!sl) return; sl.forEach(([open, close]) => rows.push({ store: id, week_day: wd, open, close })); }
      DB.schedules.splice(0, DB.schedules.length, ...DB.schedules.filter(h => h.store !== id), ...rows); close(); render(); toast('Horario guardado'); },
    'reset-schedule': d => { const id = Number(d.id), ch = byId(DB.chains, byId(DB.stores, id).chain); DB.schedules.splice(0, DB.schedules.length, ...DB.schedules.filter(h => h.store !== id), ...[1, 2, 3, 4, 5, 6].map(wd => ({ store: id, week_day: wd, open: ch.open, close: ch.close }))); close(); render(); toast('La tienda vuelve al horario de su cadena'); },
    'add-sched-exc': d => modal('Excepción de horario', `<form id="exc-form" class="stack"><div class="field"><label>Fecha</label><input class="input" type="date" name="date" required value="${d.date || ''}"></div><label class="row small"><input type="checkbox" class="check" name="closed">Cerrada todo el día</label><div class="field"><label>Tramos de apertura</label><div class="stack" style="gap:6px" data-slots="x">${(d.date ? DB.scheduleExceptions.filter(e => e.store == d.id && e.date === d.date && !e.closed).map(e => slotRow(e.open, e.close)).join('') : '') || slotRow('09:00', '14:00')}</div></div>${btn('Añadir tramo', { kind: 'ghost', size: 'sm', icon: 'plus', act: 'slot-add', data: 'data-k="x"' })}</form>`,
      btn('Cancelar', { act: 'close' }) + btn('Guardar', { kind: 'primary', act: 'save-sched-exc', data: `data-id="${d.id}"` })),
    'save-sched-exc': d => { const f = document.getElementById('exc-form'); if (!f.reportValidity()) return; const fd = new FormData(f), store = Number(d.id), date = fd.get('date'), closed = !!fd.get('closed');
      const sl = closed ? [] : readSlots('x'); if (!sl) return; if (!closed && !sl.length) return toast('Añade al menos un tramo o marca «Cerrada todo el día»');
      DB.scheduleExceptions.splice(0, DB.scheduleExceptions.length, ...DB.scheduleExceptions.filter(e => !(e.store === store && e.date === date)));
      if (closed) DB.scheduleExceptions.push({ id: nextId(DB.scheduleExceptions), store, date, closed: true, open: null, close: null });
      else sl.forEach(([open, close]) => DB.scheduleExceptions.push({ id: nextId(DB.scheduleExceptions), store, date, closed: false, open, close }));
      close(); render(); toast('Excepción guardada'); },
    'del-sched-exc': d => { const store = Number(d.id); DB.scheduleExceptions.splice(0, DB.scheduleExceptions.length, ...DB.scheduleExceptions.filter(e => !(e.store === store && e.date === d.date))); render(); toast('Excepción quitada'); },
    'new-collab': () => { const admin = can(S, 'collabs.create'), coords = DB.users.filter(u => u.role === 'coord'), f = (n, l, t = 'text', extra = '') => `<div class="field"><label>${l}</label><input class="input" name="${n}" type="${t}" ${extra}></div>`;
      modal(admin ? 'Nuevo colaborador' : 'Proponer colaborador', `<form id="nc-form" class="form-grid">
        <div class="field full"><label>Nombre de la entidad</label><input class="input" name="name" required></div>${f('address', 'Dirección', 'text', 'required')}
        <div class="field"><label>Localidad</label><select class="input" name="locality">${DB.localities.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Tipo</label><select class="input" name="type">${['Asociación', 'Universidad', 'Centro educativo', 'Empresa', 'Administración pública', 'Entidad social'].map(x => `<option>${x}</option>`).join('')}</select></div>${f('capacity', 'Capacidad de voluntarios', 'number', 'value="10" min="1"')}
        <div class="field full"><label>Coordinación</label><div class="row wrap">${coords.map(u => `<label class="row small"><input type="checkbox" class="check" name="coords" value="${u.id}" ${u.id === S.user.id ? 'checked' : ''}>${esc(u.name)}</label>`).join('')}</div></div>
        <h3 class="full" style="margin:8px 0 0">Decisor</h3>${f('dName', 'Nombre')}${f('dPhone', 'Teléfono', 'tel')}
        <h3 class="full" style="margin:8px 0 0">Responsable colaborador</h3>${f('rName', 'Nombre', 'text', 'required')}${f('rPhone', 'Teléfono', 'tel', 'required pattern="[0-9 +]{9,}"')}${f('rEmail', 'Email', 'email', 'required')}
        ${admin ? `<label class="row small full"><input type="checkbox" class="check" name="validate" checked>Validar ahora</label><label class="row small full"><input type="checkbox" class="check" name="access" checked>Crear cuenta al responsable (contraseña temporal)</label>` : '<p class="small muted full">Administración revisará la propuesta y la validará.</p>'}</form>`,
        btn('Cancelar', { act: 'close' }) + btn(admin ? 'Crear colaborador' : 'Enviar propuesta', { kind: 'primary', icon: 'check', act: 'save-new-collab' })); },
    'save-new-collab': () => { const f = document.getElementById('nc-form'); if (!f.reportValidity()) return; const fd = new FormData(f), admin = can(S, 'collabs.create'), validate = admin && fd.get('validate');
      const c = Views.helpers.linkCollab({ id: nextId(DB.collabs), name: fd.get('name'), type: fd.get('type'), status: validate ? 'Validado' : admin ? 'Pendiente de validar' : 'Propuesto por coordinación', address: fd.get('address'), locality: Number(fd.get('locality')), capacity: Number(fd.get('capacity')), localities: [Number(fd.get('locality'))], ownsVolunteers: false, oneCampaign: false, pendingCoords: [] });
      DB.collabs.push(c); c.coords = fd.getAll('coords').map(Number);
      if (fd.get('dName')) DB.contacts.push({ id: nextId(DB.contacts), collab: c.id, level: 'Decisor', name: fd.get('dName'), phone: fd.get('dPhone'), email: '' });
      const k = { id: nextId(DB.contacts), collab: c.id, level: 'Responsable colaborador', name: fd.get('rName'), phone: fd.get('rPhone'), email: fd.get('rEmail') }; DB.contacts.push(k);
      let pass = ''; if (validate && fd.get('access')) { const [first, ...rest] = k.name.split(' '); const u = { id: nextId(DB.users), name: k.name, first_name: first, surname: rest.join(' '), username: k.email.split('@')[0], email: k.email, phone: k.phone, role: 'rcol', collab: c.id, status: 'Pendiente', last: '—' }; DB.users.push(u); k.user = u.id; pass = tempPassword(); }
      log(admin ? 'dio de alta el colaborador {collab}' : 'propuso el colaborador {collab}', { collab: c.id }); close(); go(`colaboradores/${c.id}`);
      toast(admin ? `${esc(c.name)} creado${validate ? ' y validado' : ''}${pass ? ` · contraseña temporal del responsable: <b>${pass}</b>` : ''}` : 'Propuesta enviada a Administración'); },
    'edit-contact': d => { const k = byId(DB.contacts, d.id);
      modal('Editar contacto', `<form id="ec-form" class="stack"><div class="field"><label>Nombre</label><input class="input" name="name" required value="${esc(k.name)}"></div><div class="field"><label>Teléfono</label><input class="input" name="phone" required pattern="[0-9 +]{9,}" value="${esc(k.phone)}"></div><div class="field"><label>Email</label><input class="input" name="email" type="email" value="${esc(k.email)}"></div></form>`,
        btn('Cancelar', { act: 'close' }) + btn('Guardar', { kind: 'primary', act: 'save-contact-edit', data: `data-id="${k.id}"` }), 'sm'); },
    'save-contact-edit': d => { const f = document.getElementById('ec-form'); if (!f.reportValidity()) return; Object.assign(byId(DB.contacts, d.id), Object.fromEntries(new FormData(f))); close(); render(); toast('Contacto actualizado'); },
    'propose-collab': d => { const c = byId(DB.collabs, d.id), F = Views.helpers.COLLAB_FIELDS;
      modal('Proponer cambio', `<form id="pc-form" class="form-grid">${F.map(([k, l]) => `<div class="field ${k === 'name' || k === 'address' ? 'full' : ''}"><label>${l}</label>${k === 'locality' ? `<select class="input" name="locality">${DB.localities.map(x => `<option value="${x.id}" ${x.id === c.locality ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>` : `<input class="input" name="${k}" ${k === 'capacity' ? 'type="number" min="1"' : ''} value="${esc(c[k] ?? '')}">`}</div>`).join('')}
        <div class="field full"><label>Comentario para Administración</label><textarea class="input" name="note" rows="2"></textarea></div></form>`,
        btn('Cancelar', { act: 'close' }) + btn('Enviar solicitud', { kind: 'primary', act: 'save-collab-proposal', data: `data-id="${c.id}"` })); },
    'save-collab-proposal': d => { const c = byId(DB.collabs, d.id), fd = new FormData(document.getElementById('pc-form')), changes = {};
      Views.helpers.COLLAB_FIELDS.forEach(([k]) => { let v = fd.get(k); if (['capacity', 'locality'].includes(k)) v = Number(v); if (String(v) !== String(c[k] ?? '')) changes[k] = v; });
      if (!Object.keys(changes).length) return toast('No has cambiado ningún dato');
      DB.collabRequests.push({ id: nextId(DB.collabRequests), collab: c.id, by: S.user.id, date: '2026-11-12', changes, note: fd.get('note').trim(), status: 'Pendiente' }); close(); render(); toast('Solicitud enviada a Administración'); },
    'review-collab-request': d => { const r = byId(DB.collabRequests, d.id); r.status = d.ok ? 'Aceptada' : 'Rechazada'; audit('collabs', r.collab, `Solicitud ${d.ok ? 'aceptada' : 'rechazada'}: ${Object.keys(r.changes).join(', ')}`); if (d.ok) Object.assign(byId(DB.collabs, r.collab), r.changes); render(); toast(d.ok ? 'Cambios aplicados' : 'Solicitud rechazada'); },
    'group-review': d => { const g = byId(DB.groups, d.id); g.reviewedFor = Views.helpers.activeCampaign().id; render(); toast(`Miembros de <b>${esc(g.code)}</b> confirmados para ${esc(Views.helpers.activeCampaign().code)}`); },
    'vol-block': d => { const v = byId(DB.volunteers, d.id), id = Views.helpers.globalId(v); if (v.blocked) { v.blocked = false; render(); return toast(`${id} desbloqueado`); }
      confirm('Bloquear voluntario', `¿Bloquear a <b>${id}</b>? No se podrá asignar a turnos. Su responsable verá el bloqueo.`, () => { v.blocked = true; close(); render(); toast(`${id} bloqueado`); }, 'Bloquear'); },
    'vol-import': () => modal('Importar voluntarios', `<p class="small muted" style="margin-top:0">Sube un Excel o CSV con las columnas <b>Nombre, Teléfono, Localidad, Menor (sí/no)</b>. Las personas que ya existen (mismo teléfono o nombre) no se duplican.</p>
      <input type="file" class="input" accept=".xlsx,.xls,.csv" id="vi-file"><div class="row small" style="margin-top:10px"><span class="muted">¿Sin fichero?</span>${btn('Usar ejemplo', { size: 'sm', icon: 'file', act: 'vol-import-sample' })}</div><div id="vi-preview"></div>`,
      btn('Cancelar', { act: 'close' })),
    'vol-import-sample': () => { const rows = [['Ana Torres', '677200300', 'Málaga', 'no'], ['Lucía Fernández', '677100200', 'Málaga', 'no'], ['Pablo Ruiz', '677200301', 'Torremolinos', 'sí']]; importVolunteers(rows); },
    'restore-catalog': d => { byId(SCHEMAS[d.entity].list, d.id).archived = false; render(); toast('Restaurado'); },
    'request-catalog': () => modal('Pedir localidad o zona', `<form id="cr-form" class="stack"><div class="field"><label>Qué necesitas</label><select class="input" name="kind"><option value="locality">Localidad nueva</option><option value="zone">Zona nueva</option></select></div>
      <div class="field"><label>Nombre</label><input class="input" name="name" required></div><div class="field"><label>Código postal (localidades)</label><input class="input" name="postal_code" pattern="[0-9]{5}"></div>
      <div class="field"><label>Comentario</label><textarea class="input" name="note" rows="2"></textarea></div></form>`, btn('Cancelar', { act: 'close' }) + btn('Enviar', { kind: 'primary', act: 'save-catalog-request' }), 'sm'),
    'save-catalog-request': () => { const f = document.getElementById('cr-form'); if (!f.reportValidity()) return; const x = Object.fromEntries(new FormData(f)); DB.catalogRequests.push({ id: nextId(DB.catalogRequests), by: S.user.id, date: '2026-11-12', status: 'Pendiente', ...x }); close(); toast('Petición enviada a Administración'); },
    'review-catalog': d => { const r = byId(DB.catalogRequests, d.id); r.status = d.ok ? 'Aceptada' : 'Rechazada';
      if (d.ok) { if (r.kind === 'zone') DB.zones.push({ id: nextId(DB.zones), name: r.name, code: r.name.slice(0, 3).toUpperCase() }); else DB.localities.push({ id: nextId(DB.localities), name: r.name, postal_code: r.postal_code, zone: null, aliases: [] }); }
      render(); toast(d.ok ? `${r.kind === 'zone' ? 'Zona' : 'Localidad'} creada` : 'Petición rechazada'); },
    'do-deactivate': d => { const u = byId(DB.users, d.id), to = Number(document.getElementById('da-to')?.value) || null, open = cid => byId(DB.campaigns, cid).status !== 'Finalizada';
      DB.zoneAssignments.filter(z => z.user === u.id && open(z.campaign)).forEach(z => { if (to) z.user = to; else DB.zoneAssignments.splice(DB.zoneAssignments.indexOf(z), 1); });
      DB.collabParticipation.filter(p => p.coords?.includes(u.id) && open(p.campaign)).forEach(p => { p.coords = p.coords.filter(x => x !== u.id).concat(to && !p.coords.includes(to) ? [to] : []); });
      if (u.role === 'rcol') DB.contacts.filter(k => k.user === u.id).forEach(k => { delete k.user; });
      u.status = 'Inactivo'; close(); render(); toast(`${esc(u.name)} desactivado${to ? ` · reasignado a ${esc(byId(DB.users, to).name)}` : ''}`); },
    export: d => { const H = Views.helpers, c = H.activeCampaign(), shiftIds = new Set(scope.shifts(S, c.id).map(s => s.id));
      const sheets = {
        stores: () => scope.stores(S).filter(s => !s.archived).map(s => ({ Tienda: s.name, Cadena: H.chain(s.chain).name, Código: s.code || '', Dirección: s.address, Localidad: H.loc(s.locality)?.name, Zona: H.zone(s.zone)?.name || '', 'Líneas de caja': s.checkout_shelfs, [`Participa ${c.code}`]: H.part(c, s.id) })),
        shifts: () => DB.shifts.filter(s => shiftIds.has(s.id)).map(s => ({ Tienda: byId(DB.stores, s.store).name, Fecha: s.date, Inicio: s.start, Fin: s.end, Capacidad: s.capacity, Personas: filled(s), Estado: H.coverage(s), Asignados: s.assignments.map(a => `${asgText(a)} (${H.asgPeople(a)})`).join(', ') })),
        collabs: () => scope.collabs(S).map(x => ({ Colaborador: x.name, Tipo: x.type, Estado: x.status, [`En ${c.code}`]: H.collabPart(x)?.status || 'No incluido', Coordinación: x.coords.map(id => byId(DB.users, id)?.name).join(', '), Tiendas: x.stores.length })),
        reports: () => DB.reports.filter(r => shiftIds.has(r.shift)).map(r => ({ Tipo: byId(DB.reportTypes, r.type).name, Urgente: r.urgent ? 'Sí' : 'No', Tienda: byId(DB.stores, byId(DB.shifts, r.shift).store).name, Descripción: r.description, Estado: r.solved_by ? 'Resuelta' : 'Abierta', Solución: r.solution })) };
      const rows = sheets[d.what](), name = `${{ stores: 'tiendas', shifts: 'turnos', collabs: 'colaboradores', reports: 'incidencias' }[d.what]}-${c.code}`;
      if (window.XLSX) { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Datos'); XLSX.writeFile(wb, `${name}.xlsx`); }
      else { const keys = Object.keys(rows[0] || {}), csv = [keys, ...rows.map(r => keys.map(k => r[k]))].map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = `${name}.csv`; a.click(); }
      toast(`${rows.length} filas exportadas`); },
    'toggle-archived': () => { S.f.archived = S.f.archived === '1' ? '' : '1'; render(); },
    'store-pick': d => { const id = Number(d.id); S.picked = (S.picked || []).includes(id) ? S.picked.filter(x => x !== id) : [...(S.picked || []), id]; render(); },
    'bulk-zone': () => { if (!S.picked?.length) return toast('Selecciona tiendas en la tabla'); const v = document.getElementById('bulk-zone').value; S.picked.forEach(id => { byId(DB.stores, id).zone = v ? Number(v) : null; }); toast(`${S.picked.length} tiendas → ${v ? esc(byId(DB.zones, v).name) : 'sin zona'}`); S.picked = []; render(); },
    'zone-by-locality': () => { const list = DB.stores.filter(s => !s.zone && byId(DB.localities, s.locality)?.zone); list.forEach(s => { s.zone = byId(DB.localities, s.locality).zone; }); render(); toast(list.length ? `${list.length} tiendas sin zona reciben la zona de su localidad` : 'No hay tiendas sin zona con localidad asignada a una zona'); },
    'archive-store': d => { const s = byId(DB.stores, d.id); if (s.archived) { s.archived = false; render(); return toast('Tienda restaurada'); }
      confirm('Archivar tienda', `¿Archivar <b>${esc(s.name)}</b>? No aparecerá en campañas nuevas, pero se conserva su histórico.`, () => { s.archived = true; audit('stores', s.id, 'Archivada'); close(); render(); toast('Tienda archivada'); }, 'Archivar'); },
    'propose-store': d => { const s = byId(DB.stores, d.id), F = Views.helpers.STORE_FIELDS;
      modal('Proponer cambio', `<form id="prop-form" class="form-grid">${F.map(([k, l]) => `<div class="field ${k === 'address' || k === 'name' ? 'full' : ''}"><label>${l}</label>${k === 'locality' ? `<select class="input" name="${k}">${DB.localities.map(x => `<option value="${x.id}" ${x.id === s.locality ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>` : `<input class="input" name="${k}" ${k === 'checkout_shelfs' ? 'type="number" min="1" max="2"' : ''} value="${esc(s[k] ?? '')}">`}</div>`).join('')}
        <div class="field"><label>Horario semanal (lun–sáb)</label><div class="row"><input class="input" type="time" name="sopen" value="${DB.schedules.find(h => h.store === s.id)?.open || ''}"><input class="input" type="time" name="sclose" value="${DB.schedules.find(h => h.store === s.id)?.close || ''}"></div></div>
        <div class="field"><label>Excepción por fecha (opcional)</label><div class="row"><input class="input" type="date" name="edate"><select class="input" name="ekind"><option value="closed">Cerrada</option><option value="open">Horario especial</option></select></div><div class="row" style="margin-top:6px"><input class="input" type="time" name="eopen" value="09:00"><input class="input" type="time" name="eclose" value="14:00"></div></div>
        <div class="field full"><label>Comentario para Administración</label><textarea class="input" name="note" rows="2" placeholder="Explica el motivo del cambio"></textarea></div></form>`,
        btn('Cancelar', { act: 'close' }) + btn('Enviar solicitud', { kind: 'primary', act: 'save-proposal', data: `data-id="${s.id}"` })); },
    'save-proposal': d => { const s = byId(DB.stores, d.id), fd = new FormData(document.getElementById('prop-form')), changes = {};
      Views.helpers.STORE_FIELDS.forEach(([k]) => { let v = fd.get(k); if (['checkout_shelfs', 'locality'].includes(k)) v = Number(v); if (String(v ?? '') !== String(s[k] ?? '')) changes[k] = v; });
      const current = DB.schedules.find(h => h.store === s.id); if (fd.get('sopen') && (fd.get('sopen') !== current?.open || fd.get('sclose') !== current?.close)) changes.schedule = { open: fd.get('sopen'), close: fd.get('sclose') };
      if (fd.get('edate')) changes.exception = { date: fd.get('edate'), closed: fd.get('ekind') === 'closed', open: fd.get('eopen'), close: fd.get('eclose') };
      if (!Object.keys(changes).length && !fd.get('note').trim()) return toast('No has cambiado ningún dato');
      DB.storeRequests.push({ id: nextId(DB.storeRequests), store: s.id, by: S.user.id, date: '2026-11-12', changes, note: fd.get('note').trim(), status: 'Pendiente' }); close(); render(); toast('Solicitud enviada a Administración'); },
    'review-request': d => { const r = byId(DB.storeRequests, d.id); r.status = d.ok ? 'Aceptada' : 'Rechazada'; audit('stores', r.store, `Solicitud de ${byId(DB.users, r.by).name} ${d.ok ? 'aceptada' : 'rechazada'}: ${Object.keys(r.changes).join(', ')}`); if (d.ok) { const { schedule, exception, ...fields } = r.changes; Object.assign(byId(DB.stores, r.store), fields); if (schedule) DB.schedules.filter(h => h.store === r.store).forEach(h => Object.assign(h, schedule)); if (exception) addScheduleException(r.store, exception); } render(); toast(d.ok ? 'Cambios aplicados a la tienda' : 'Solicitud rechazada'); },

    'add-exception': d => modal('Excepción por cadena', `<div class="stack"><div class="field"><label>Cadena</label><select class="input" id="ex-chain">${DB.chains.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label>Día extra</label><input class="input" type="date" id="ex-date" value="2026-11-28"></div><div class="field"><label>Motivo</label><input class="input" id="ex-note" value="La cadena ofrece voluntariado otro día"></div></div>`, btn('Añadir', { kind: 'primary', act: 'save-exception', data: `data-id="${d.id}"` }), 'sm'),
    'save-exception': d => { byId(DB.campaigns, d.id).exceptions.push({ chain: Number(document.getElementById('ex-chain').value), date: document.getElementById('ex-date').value, note: document.getElementById('ex-note').value }); close(); render(); toast('Excepción añadida'); },
    'unassign-zone': d => { const i = DB.zoneAssignments.findIndex(z => z.campaign == d.c && z.zone == d.z && z.user == d.u), [x] = DB.zoneAssignments.splice(i, 1); render(); toast('Coordinador quitado de la zona', () => { DB.zoneAssignments.push(x); render(); }); },
    'del-collab-part': d => { const i = DB.collabParticipation.findIndex(p => p.id == d.id), [x] = DB.collabParticipation.splice(i, 1); render(); toast('Colaborador quitado de la campaña', () => { DB.collabParticipation.splice(i, 0, x); render(); }); },
    assign: d => { S.substituteFor = null; assignModal(d.id); }, 'assign-tab': d => { shiftTimes(byId(DB.shifts, d.id)); assignModal(d.id, d.v); },
    'do-assign': d => { const s = byId(DB.shifts, d.id); shiftTimes(s);
      const n = Number(document.getElementById('assign-n')?.value) || null, groupSize = d.kind === 'group' ? gsize(byId(DB.groups, d.ref)) : 0;
      const a = d.kind === 'vol' ? { kind: 'vol', vol: Number(d.ref) } : d.kind === 'group' ? { kind: 'group', group: Number(d.ref), ...(n && n < groupSize ? { people: n } : {}) } : { kind: 'collab', collab: Number(d.ref), people: Math.max(1, n || 1) };
      s.assignments.push(a);
      if (pendingNomination(a)) { const rcolU = DB.users.filter(u => u.role === 'rcol' && u.collab === byId(DB.groups, a.group).collab).map(u => u.id); DB.notifications.unshift(...rcolU.filter(id => id !== S.user.id).map(id => ({ id: DB.notifications.length + 1, to: id, from: S.user.id, text: `Elige quién va de ${byId(DB.groups, a.group).code}: ${a.people} personas a ${Shifts.shiftLabel(s)}`, shift: s.id, store: s.store, when: 'Ahora', read: false }))); }
      if (a.kind === 'group') log('asignó el grupo {group} a {store}', { group: a.group, store: s.store }); else if (a.kind === 'collab') log('asignó {collab} a {store}', { collab: a.collab, store: s.store }); else log('asignó un voluntario a {store}', { store: s.store });
      Shifts.notify(S, s, `${asgText(a)} asignado al turno ${Shifts.shiftLabel(s)}${a.kind === 'group' ? ` · van ${Views.helpers.asgPeople(a)} de ${gsize(byId(DB.groups, a.group))}` : ''}`, '', Shifts.leadersOf(a));
      if (S.substituteFor) { Object.assign(byId(DB.reports, S.substituteFor), { solution: `Sustituido por ${asgText(a)}`, solved_by: S.user.id, resolution_date: '2026-11-12' }); S.substituteFor = null; toast('Incidencia resuelta con el sustituto'); }
      close(); render();
      if (pendingNomination(a)) { if (S.user.role === 'rcol') return nominateModal(s.id, s.assignments.indexOf(a)); toast(`Falta que el responsable de ${esc(byId(DB.collabs, byId(DB.groups, a.group).collab).name)} elija quién va`); } toast(`<b>${esc(asgText(a))}</b> asignado · ${s.start}–${s.end}${filled(s) > s.capacity ? ` · supera la capacidad en ${filled(s) - s.capacity}` : ''}`, () => { s.assignments.splice(s.assignments.indexOf(a), 1); render(); }); },
    unassign: d => { const s = byId(DB.shifts, d.id), [a] = s.assignments.splice(d.i, 1); render(); toast(`${esc(asgText(a))} quitado del turno`, () => { s.assignments.splice(d.i, 0, a); render(); }); },
    incident: d => incidentModal(d.id),
    'do-incident': d => { const s = byId(DB.shifts, d.id); DB.reports.push({ id: nextId(DB.reports), type: Number(document.getElementById('inc-type').value), description: document.getElementById('inc-note').value || '—', solution: '', reported_by: S.user.id, solved_by: null, campaign: s.campaign, shift: s.id, creation_date: '2026-11-12', resolution_date: null, urgent: document.getElementById('inc-urgent').checked });
      const r = DB.reports.at(-1), st = byId(DB.stores, s.store), collabs = s.assignments.map(a => a.kind === 'group' ? byId(DB.groups, a.group)?.collab : a.kind === 'collab' ? a.collab : byId(DB.volunteers, a.vol)?.collab);
      const to = new Set([...DB.zoneAssignments.filter(z => z.zone === st.zone && z.campaign === s.campaign).map(z => z.user), ...DB.users.filter(u => u.role === 'rcol' && collabs.includes(u.collab)).map(u => u.id), ...(r.urgent ? DB.users.filter(u => u.role === 'admin').map(u => u.id) : [])]); to.delete(S.user.id);
      to.forEach(id => DB.notifications.unshift({ id: DB.notifications.length + 1, to: id, from: S.user.id, text: `${r.urgent ? 'URGENTE · ' : ''}Incidencia en ${Shifts.shiftLabel(s)}: ${byId(DB.reportTypes, r.type).name}`, reason: r.description, shift: s.id, store: s.store, when: 'Ahora', read: false }));
      log('registró una incidencia en {store}', { store: s.store }); close(); render(); toast(`Incidencia registrada · ${to.size} avisos enviados`); },
    'find-substitute': d => substituteModal(byId(DB.reports, d.id)),
    'find-substitute-all': d => { const r = byId(DB.reports, d.id); S.substituteFor = r.id; assignModal(r.shift); },
    'do-substitute': d => { const r = byId(DB.reports, d.id), s = byId(DB.shifts, r.shift), missing = Math.max(1, s.capacity - filled(s)), g = d.kind === 'group' ? byId(DB.groups, Number(d.ref)) : null;
      const a = d.kind === 'vol' ? { kind: 'vol', vol: Number(d.ref) } : { kind: 'group', group: g.id, ...(missing < gsize(g) ? { people: missing } : {}) };
      s.assignments.push(a); Shifts.notify(S, s, `${asgText(a)} sustituye en ${Shifts.shiftLabel(s)}`, r.description, Shifts.leadersOf(a));
      Object.assign(r, { solution: `Sustituido por ${asgText(a)}`, solved_by: S.user.id, resolution_date: '2026-11-12' }); close(); render(); toast(`<b>${esc(asgText(a))}</b> asignado · incidencia resuelta`);
      if (pendingNomination(a) && S.user.role === 'rcol') nominateModal(s.id, s.assignments.indexOf(a)); },
    nominate: d => nominateModal(Number(d.id), Number(d.i)),
    'open-store-cal': d => { S.pendingF = { store: String(d.id), tab: 'calendario' }; location.hash = '#/turnos'; },
    'do-nominate': d => { const s = byId(DB.shifts, d.id), a = s.assignments[d.i], ids = [...document.querySelectorAll('.nom-chk:checked')].map(x => Number(x.value));
      if (ids.length !== a.people) return toast(`Elige exactamente ${a.people} personas (llevas ${ids.length})`);
      a.members = ids; Shifts.notify(S, s, `${asgText(a)}: ya está elegido quién va a ${Shifts.shiftLabel(s)}`, '', Shifts.leadersOf(a)); close(); render(); toast('Personas elegidas'); },
    'do-finish': d => { const c = byId(DB.campaigns, d.id);
      document.querySelectorAll('.att-chk').forEach(el => { byId(DB.shifts, Number(el.dataset.s)).assignments[el.dataset.i].attended = el.checked; });
      const ids = new Set(DB.shifts.filter(s => s.campaign === c.id).flatMap(s => s.assignments.filter(a => a.attended).flatMap(a => a.kind === 'vol' ? [a.vol] : a.kind === 'group' ? a.members || byId(DB.groups, a.group)?.members || [] : [])));
      DB.volunteers.filter(v => ids.has(v.id) && !v.history.includes(c.code)).forEach(v => v.history.push(c.code)); if (!Views.helpers.SEQ.includes(c.code)) Views.helpers.SEQ.push(c.code);
      c.status = 'Finalizada'; DB.groups.filter(g => byId(DB.collabs, g.collab)?.oneCampaign).forEach(g => { g.archived = true; }); close(); render(); toast(`Campaña finalizada · ${ids.size} voluntarios con asistencia registrada`); },
    resolve: d => modal('Resolver incidencia', `<div class="field"><label>Solución</label><textarea class="input" id="sol" placeholder="Qué se hizo (sustituto, material entregado…)"></textarea></div>`, btn('Cancelar', { act: 'close' }) + btn('Marcar resuelta', { kind: 'primary', icon: 'check', act: 'do-resolve', data: `data-id="${d.id}"` }), 'sm'),
    'do-resolve': d => { Object.assign(byId(DB.reports, d.id), { solution: document.getElementById('sol').value || 'Resuelta', solved_by: S.user.id, resolution_date: '2026-11-12' }); close(); render(); toast('Incidencia resuelta'); },
    purge: purgeModal,
    'do-purge': () => { const ids = [...document.querySelectorAll('.purge-chk:checked')].map(x => Number(x.value)); const removed = DB.volunteers.filter(v => ids.includes(v.id)); removed.forEach(v => DB.volunteers.splice(DB.volunteers.indexOf(v), 1)); close(); render(); toast(`${removed.length} voluntarios dados de baja`, () => { DB.volunteers.push(...removed); render(); }); },
    'new-campaign': () => { CampaignWizard.reset(); go('campanas/nueva'); },
    'campaign-status': d => { const c = byId(DB.campaigns, d.id), finishing = d.status === 'Finalizada'; if (finishing) return attendanceModal(c);
      const text = finishing ? `¿Finalizar <b>${esc(c.name)}</b>? Turnos y asignaciones quedarán en solo lectura; las incidencias pendientes se podrán cerrar.` : `¿Activar <b>${esc(c.name)}</b>? ${DB.campaigns.some(x => x.status === 'Activa') ? 'Ya hay otra campaña activa: convivirán y podrás cambiar entre ellas desde la barra superior.' : ''}`;
      confirm(finishing ? 'Finalizar campaña' : 'Activar campaña', text, () => { c.status = d.status; if (finishing) { const ids = new Set(DB.shifts.filter(s => s.campaign === c.id).flatMap(s => s.assignments.flatMap(a => a.kind === 'vol' ? [a.vol] : a.kind === 'group' ? byId(DB.groups, a.group)?.members || [] : []))); DB.volunteers.filter(v => ids.has(v.id) && !v.history.includes(c.code)).forEach(v => v.history.push(c.code)); if (!Views.helpers.SEQ.includes(c.code)) Views.helpers.SEQ.push(c.code); }
      if (finishing) DB.groups.filter(g => byId(DB.collabs, g.collab)?.oneCampaign).forEach(g => { g.archived = true; }); close(); render(); toast(`Campaña ${finishing ? 'finalizada' : 'activada'}`); }, finishing ? 'Finalizar' : 'Activar'); },
    ...Shifts.actions(S, () => render()),
    ...CampaignWizard.actions(() => render(), go, toast),
    'sim-day': d => { S.today = d.day || null; render(); toast(d.day ? 'Simulando el primer día presencial de la campaña' : 'De vuelta a la preparación'); },
    'reset-password': d => { const u = byId(DB.users, d.id); confirm('Restablecer contraseña', `¿Generar una contraseña temporal para <b>${esc(u.name)}</b>? Tendrá que cambiarla al entrar.`, () => { u.status = 'Pendiente'; close(); render(); toast(`Contraseña temporal de <b>${esc(u.name)}</b>: <b>${tempPassword()}</b>`); }, 'Restablecer'); },
    'group-form': d => groupModal(d.id),
    'save-group': d => { const f = document.getElementById('group-form'); if (!f.reportValidity()) return; const fd = new FormData(f), members = fd.getAll('m').map(Number), leader = Number(fd.get('leader'));
      if (!members.length) return toast('Añade al menos un voluntario al grupo');
      if (!members.includes(leader)) return toast('El líder tiene que formar parte del grupo');
      if (DB.groups.some(x => x.id !== Number(d.id) && x.code.toLowerCase() === String(fd.get('code')).trim().toLowerCase())) return toast('Ya existe un grupo con ese identificador');
      let g = byId(DB.groups, d.id); if (!g) { g = { id: nextId(DB.groups), collab: S.user.collab }; DB.groups.push(g); }
      Object.assign(g, { code: String(fd.get('code')).trim(), members, leader, reviewedFor: Views.helpers.activeCampaign().id });
      const lv = byId(DB.volunteers, leader), acc = DB.users.find(u => u.group === g.id);
      if (fd.get('access') && !acc) { const [first, ...rest] = lv.name.split(' '); DB.users.push({ id: nextId(DB.users), name: lv.name, first_name: first, surname: rest.join(' '), username: first.toLowerCase(), email: '', phone: lv.phone, role: 'rtienda', collab: g.collab, group: g.id, status: 'Pendiente', last: '—' }); toast(`Acceso del líder creado · contraseña temporal <b>${tempPassword()}</b>`); }
      if (!fd.get('access') && acc) DB.users.splice(DB.users.indexOf(acc), 1);
      close(); render(); toast(`Grupo <b>${esc(g.code)}</b> guardado · ${members.length} personas`); },
    'del-group': d => { const g = byId(DB.groups, d.id); confirm('Eliminar grupo', `¿Eliminar <b>${esc(g.code)}</b>? Se quitará de los turnos asignados.`, () => { DB.groups.splice(DB.groups.indexOf(g), 1); DB.shifts.forEach(s => s.assignments = s.assignments.filter(a => !(a.kind === 'group' && a.group === g.id))); close(); go('grupos'); toast('Grupo eliminado'); }); },
    perm: (d, el) => { const l = DB.rolePerms[d.role]; el.checked ? l.push(d.perm) : l.splice(l.indexOf(d.perm), 1); toast('Permisos actualizados'); },
    'save-settings': () => { new FormData(document.getElementById('settings-form')).forEach((v, k) => DB.settings[k] = v); toast('Configuración guardada'); },
    ...Import.actions(() => render(), go),
  };
  /* Selectores que actúan al cambiar (relaciones editadas en línea) */
  const changeActions = {
    kilos: (d, v) => { const c = byId(DB.campaigns, Number(d.c)); c.kilos ||= {}; c.kilos[d.id] = Math.max(0, Number(v) || 0); },
    'collab-camp-status': (d, v) => { const c = byId(DB.collabs, d.id), p = Views.helpers.collabPart(c); if (!v) { if (p) DB.collabParticipation.splice(DB.collabParticipation.indexOf(p), 1); return; } if (p) p.status = v; else { c.stores = []; Views.helpers.collabPart(c).status = v; } toast(`${esc(c.name)}: ${v}`); },
    'part-status': (d, v) => { byId(DB.collabParticipation, d.id).status = v; },
    'pick-campaign': (d, v) => { S.campaign = Number(v); S.f.campaign = Number(v); },
    'store-zone': (d, v) => { const s = byId(DB.stores, d.id); s.zone = v ? Number(v) : null; toast(`${esc(s.name)} → ${v ? esc(byId(DB.zones, v).name) : 'sin zona'}`); },
    'assign-zone': (d, v) => { if (!v) return; DB.zoneAssignments.push({ campaign: Number(d.c), zone: Number(d.z), user: Number(v) }); toast(`${esc(byId(DB.users, v).name)} coordina ${esc(byId(DB.zones, d.z).name)}`); },
    'add-collab-part': (d, v) => { if (!v) return; DB.collabParticipation.push({ id: nextId(DB.collabParticipation), collab: Number(v), campaign: Number(d.c) }); toast(`${esc(byId(DB.collabs, v).name)} participa en la campaña`); },
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) { if ((S.menu || S.notif) && !e.target.closest('.menu')) { S.menu = false; S.notif = false; render(); } return; }
    const fn = actions[el.dataset.act]; if (!fn) return;
    if (el.tagName !== 'INPUT') e.preventDefault();
    e.stopPropagation(); fn(el.dataset, el);
  });
  document.addEventListener('input', e => { const k = e.target.dataset.filter; if (k) { S.f[k] = e.target.value; render(); } });
  document.addEventListener('change', e => {
    if (e.target.dataset.imp) return Import.onChange(e.target, render);
    if (e.target.id === 'vi-file') { const f = e.target.files[0], rd = new FileReader(); rd.onload = () => { try { const rows = /\.csv$/i.test(f.name) ? new TextDecoder().decode(rd.result).split(/\r?\n/).map(l => l.split(/[;,]/)) : XLSX.utils.sheet_to_json(XLSX.read(rd.result).Sheets[XLSX.read(rd.result).SheetNames[0]], { header: 1, defval: '' }); importVolunteers(rows.slice(1)); } catch (err) { toast('No se pudo leer el fichero'); } }; rd.readAsArrayBuffer(f); return; }
    const a = e.target.dataset.actChange; if (a && changeActions[a]) { changeActions[a](e.target.dataset, e.target.value); render(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && S.user) { e.preventDefault(); palette(); }
  });
  window.addEventListener('hashchange', () => { const p = route().page; if (S._page !== p || S.pendingF) { S.f = { campaign: S.f.campaign, ...(S.pendingF || {}) }; S.pendingF = null; } S._page = p; close(); render(); if (!S.f.focus) window.scrollTo?.(0, 0); });
  render();
})();

/* Datos de prueba en memoria, alineados con model.dbml (tablas y claves foráneas).
   Los campos marcados como «propuesta» no existen todavía en el DBML: cubren necesidades de Bancosol (Dudas2)
   y están documentados en revision-modelo-datos.md. Al recargar la página se restauran. */
window.DB = (() => {
  /* role, permission, role_permission, user_role (aquí un rol por usuario para simplificar la demo) */
  const roles = [
    { id: 'admin', name: 'Administración', desc: 'Máximo responsable, responsable de campaña y administrador del sistema. Ve y modifica todo.', color: '#e8590c' },
    { id: 'coord', name: 'Coordinación', desc: 'Coordina las zonas que tiene asignadas en cada campaña y gestiona los voluntarios de Bancosol.', color: '#2563eb' },
    { id: 'rcol', name: 'Responsable de colaborador', desc: 'Gestiona los voluntarios y grupos de su entidad y los asigna en sus tiendas.', color: '#7c3aed' },
    { id: 'rtienda', name: 'Responsable de grupo', desc: 'Líder de un grupo de su entidad: consulta los turnos de su grupo y registra incidencias.', color: '#0f9d58' },
  ];
  const permissions = [
    ['campaigns.manage', 'Crear y configurar campañas'], ['catalogs.manage', 'Gestionar zonas, localidades y catálogos'], ['stores.import', 'Importar y confirmar tiendas'],
    ['collabs.create', 'Dar de alta y validar colaboradores'], ['collabs.view', 'Ver colaboradores asignados'],
    ['volunteers.manage', 'Gestionar voluntarios (datos personales)'], ['groups.manage', 'Crear grupos y nombrar líder'], ['shifts.assign', 'Asignar turnos'],
    ['incidents.manage', 'Registrar incidencias'], ['stores.participation', 'Cambiar la participación de tiendas'], ['stores.propose', 'Proponer cambios en datos de tiendas'], ['incidents.resolve', 'Resolver incidencias'], ['history.last', 'Ver quién cubrió cada tienda en la campaña anterior'], ['history.view', 'Ver el histórico de campañas finalizadas'], ['users.manage', 'Gestionar usuarios y roles'],
  ];
  const rolePerms = {
    admin: permissions.map(p => p[0]),
    coord: ['collabs.view', 'volunteers.manage', 'shifts.assign', 'incidents.manage', 'stores.participation', 'stores.propose', 'history.last', 'incidents.resolve'],
    rcol: ['volunteers.manage', 'groups.manage', 'shifts.assign', 'incidents.manage', 'incidents.resolve'],
    rtienda: ['incidents.manage'],
  };

  /* zone (name, code) */
  const zones = [
    { id: 1, name: 'Málaga Centro', code: 'MCE' }, { id: 2, name: 'Málaga Este', code: 'MES' }, { id: 3, name: 'Málaga Oeste', code: 'MOE' },
    { id: 4, name: 'Costa del Sol', code: 'CSO' }, { id: 5, name: 'Axarquía', code: 'AXA' }, { id: 6, name: 'Antequera y Norte', code: 'ANT' },
  ];
  /* locality (name, postal_code) */
  const localities = [
    { id: 1, name: 'Málaga', postal_code: '29001' }, { id: 2, name: 'Rincón de la Victoria', postal_code: '29730' }, { id: 3, name: 'Torremolinos', postal_code: '29620' },
    { id: 4, name: 'Mollina', postal_code: '29532' }, { id: 5, name: 'Vélez-Málaga', postal_code: '29700' }, { id: 6, name: 'Coín', postal_code: '29100' },
    { id: 7, name: 'Antequera', postal_code: '29200' }, { id: 8, name: 'Marbella', postal_code: '29600' },
  ];
  /* chain (code). name es propuesta. */
  const chains = [
    { id: 1, code: 'MERCADONA', name: 'Mercadona', hasCode: true, note: 'Código de centro de 4 cifras' },
    { id: 2, code: 'DIA', name: 'Dia', hasCode: true, note: 'Código de tienda; columna extra para franquicias' },
    { id: 3, code: 'CARREFOUR', name: 'Carrefour', hasCode: true, note: 'Los Hiper no traen código: se usa el nombre del centro' },
    { id: 4, code: 'LIDL', name: 'Lidl', hasCode: false, note: 'Envía un PDF sin código: confirmación manual' },
    { id: 5, code: 'ECI', name: 'El Corte Inglés', hasCode: false, note: 'Usa el nombre del centro como código' },
  ];
  const campaignTypes = [{ id: 1, name: 'Gran Recogida' }, { id: 2, name: 'Operación Kilo' }, { id: 3, name: 'Recogida puntual' }];
  const reportTypes = [{ id: 1, name: 'Ausencia avisada' }, { id: 2, name: 'No se presentó' }, { id: 3, name: 'Faltan petos o material' }, { id: 4, name: 'Problema con la tienda' }, { id: 5, name: 'Otra' }];

  /* user (name, first_name, surname, phone_number, email, username) + user_role */
  const U = (id, name, surname, email, phone, role, extra = {}) => ({ id, name: `${name} ${surname}`, first_name: name, surname, email, phone, username: email.split('@')[0], role, status: 'Activo', last: '—', ...extra });
  const users = [
    U(1, 'María', 'García', 'maria.garcia@bancosol.org', '600112233', 'admin', { last: 'Hace 5 min' }),
    U(2, 'Ana', 'Ruiz', 'ana.ruiz@bancosol.org', '611223344', 'coord', { last: 'Hace 2 h' }),
    U(3, 'Carmen', 'Vega', 'carmen.vega@bancosol.org', '644556677', 'coord', { last: 'Hace 3 días' }),
    U(4, 'Luis', 'Martín', 'luis.martin@uma.es', '622334455', 'rcol', { collab: 2, last: 'Ayer' }),
    U(5, 'Rocío', 'Peña', 'rocio.pena@uma.es', '655667788', 'rtienda', { collab: 2, group: 2, last: 'Hace 1 semana' }),
    U(6, 'Pablo', 'Gómez', 'pgomez@rincondelavictoria.es', '633445566', 'rcol', { collab: 3 }),
  ];

  /* store (locality_id, chain_id, zone_id, name, address, checkout_shelfs). code y cp son propuesta. */
  const S = (id, chain, model, code, name, address, locality, zone, checkout_shelfs = 1) => ({ id, chain, code, name, address, locality, zone, checkout_shelfs });
  const stores = [
    S(1, 1, 'Supermercado', '2018', 'Mercadona Gutenberg', 'C/ Gutemberg, 1', 1, 3, 2), S(2, 1, 'Supermercado', '2054', 'Mercadona Camino de Suárez', 'C/ Camino de Suárez, 22', 1, 1),
    S(3, 1, 'Supermercado', '2320', 'Mercadona Huelín', 'C/ Eduardo Marquina, 10', 1, 3, 2), S(4, 1, 'Supermercado', '2474', 'Mercadona Mármoles', 'C/ Martínez Maldonado, 6', 1, 1),
    S(5, 1, 'Supermercado', '2358', 'Mercadona Urb. Los Olivos', 'C/ Almazara, s/n', 2, 5), S(6, 1, 'Supermercado', '2688', 'Mercadona Plaza Costa del Sol', 'Plaza Costa del Sol, s/n', 3, 4, 2),
    S(7, 2, 'Tienda', '2125', 'Dia Magistrado Salvador Barberá', 'Magistrado Salvador Barbera, 7', 1, 3), S(8, 2, 'Tienda', '7522', 'Dia Carreterías', 'Carreterias, 94', 1, 1),
    S(9, 2, 'Franquicia', '7309', 'Dia Mollina', 'Avda. de la Cacería del Rey, 12', 4, 6), S(10, 3, 'Hiper', null, 'Carrefour Rosaleda', 'Av. Luis Buñuel, 6', 1, 1, 2),
    S(11, 3, 'Market', '4521', 'Carrefour Market El Palo', 'Av. Juan Sebastián Elcano, 140', 1, 2), S(12, 4, 'Supermercado', null, 'Lidl Vélez-Málaga', 'Camino de Málaga, 40', 5, null),
  ];
  /* schedule (store_id, week_day 1-7, opening_time, closing_time) y schedule_exception */
  const schedules = stores.flatMap(s => [1, 2, 3, 4, 5, 6].map(d => ({ store: s.id, week_day: d, open: s.id === 10 ? '10:00' : '09:00', close: s.id === 10 ? '22:00' : '21:30' })));
  const scheduleExceptions = [{ id: 1, store: 9, date: '2026-11-21', open: '09:00', close: '14:00', closed: false }];

  /* collaborator (name, address, locality). El resto son propuesta: tipo, estado, capacidad, coordinadores, etc. */
  const collabs = [
    { id: 1, name: 'Bancosol (voluntariado independiente)', type: 'Interno', status: 'Validado', address: 'C/ Pacífico, 54', locality: 1, capacity: 40, coords: [2, 3], localities: [1, 3, 5], ownsVolunteers: true, oneCampaign: false, stores: [] },
    { id: 2, name: 'Universidad de Málaga', type: 'Universidad', status: 'Validado', address: 'Av. Cervantes, 2', locality: 1, capacity: 60, coords: [2], localities: [1], ownsVolunteers: true, oneCampaign: false, stores: [1, 3, 4] },
    { id: 3, name: 'Ayuntamiento de Rincón de la Victoria', type: 'Administración pública', status: 'Validado', address: 'Plaza Al-Ándalus, 1', locality: 2, capacity: 20, coords: [3], localities: [2], ownsVolunteers: true, oneCampaign: false, stores: [5] },
    { id: 4, name: 'IES Litoral', type: 'Centro educativo', status: 'Validado', address: 'C/ Pacífico, 10', locality: 1, capacity: 16, coords: [2], localities: [1], ownsVolunteers: false, oneCampaign: true, stores: [] },
    { id: 5, name: 'Cáritas Parroquial', type: 'Entidad social', status: 'Validado', address: 'Varias parroquias', locality: 1, capacity: 30, coords: [2, 3], localities: [1, 3, 5], ownsVolunteers: false, oneCampaign: false, stores: [] },
    { id: 6, name: 'Hermandad del Rocío de Coín', type: 'Asociación', status: 'Pendiente de validar', address: 'C/ Real, 3', locality: 6, capacity: 10, coords: [], localities: [6], ownsVolunteers: false, oneCampaign: false, stores: [] },
  ];
  /* contact (collaborator_id, name, email, phone_number). level es propuesta. */
  const contacts = [
    { id: 1, collab: 1, level: 'Decisor', name: 'Dirección Bancosol', phone: '952179604', email: 'info@bancosol.org' },
    { id: 2, collab: 2, level: 'Decisor', name: 'Vicerrectorado de Compromiso Social', phone: '952131000', email: 'vrsocial@uma.es' },
    { id: 3, collab: 2, level: 'Responsable colaborador', name: 'Luis Martín', phone: '622334455', email: 'luis.martin@uma.es', user: 4 },
    { id: 4, collab: 3, level: 'Decisor', name: 'Concejalía de Servicios Sociales', phone: '952402300', email: 'social@rincondelavictoria.es' },
    { id: 5, collab: 3, level: 'Responsable colaborador', name: 'Pablo Gómez', phone: '633445566', email: 'pgomez@rincondelavictoria.es', user: 6 },
    { id: 6, collab: 4, level: 'Responsable colaborador', name: 'Elena Mora (jefa de estudios)', phone: '951298500', email: 'ieslitoral@educa.es' },
    { id: 7, collab: 5, level: 'Decisor', name: 'Delegación diocesana', phone: '952224386', email: 'caritas@diocesismalaga.es' },
    { id: 8, collab: 5, level: 'Responsable colaborador', name: 'Antonio Ruiz', phone: '611000111', email: 'aruiz@caritas.es' },
    { id: 9, collab: 6, level: 'Responsable colaborador', name: 'Juan Torres', phone: '699888777', email: 'hermandad.coin@gmail.com' },
  ];

  /* Voluntarios: en el DBML son user + volunteer_participation (por colaborador y campaña). history resume esas participaciones. */
  const V = (id, collab, name, phone, locality, history, extra = {}) => ({ id, collab, name, phone, locality, localities: [locality], email: '', history, minor: false, blocked: false, ...extra });
  const volunteers = [
    V(1, 1, 'Andrés Navarro', '677100205', 1, ['GR2024', 'OKP2025', 'GR2025']), V(2, 1, 'Marta Jiménez', '677100202', 3, ['GR2025']),
    V(3, 1, 'Javier Soto', '677100210', 1, ['GR2023']), V(4, 1, 'Concha Ramos', '677100211', 5, ['GR2022', 'OKP2023']),
    V(5, 2, 'Lucía Fernández', '677100200', 1, ['GR2025']), V(6, 2, 'Daniel Ortega', '677100201', 1, ['OKP2025', 'GR2025']),
    V(7, 2, 'Paula Romero', '677100204', 1, []), V(8, 2, 'Sergio Castro', '677100203', 1, ['GR2024']),
    V(9, 3, 'Irene Molina', '677100206', 2, ['GR2025']), V(10, 3, 'Hugo Delgado', '677100207', 2, ['GR2024', 'GR2025']),
    V(11, 2, 'Rocío Peña', '655667788', 1, ['GR2024', 'GR2025']), V(12, 2, 'Nerea Campos', '677100212', 1, []),
  ];
  /* Anonimización: Bancosol solo ve los datos de sus voluntarios independientes (colaborador 1) y de los que la entidad comparte; del resto solo ve un identificador. */
  volunteers.forEach(v => { v.shared = v.collab === 1 || v.id % 4 === 0; });
  /* Grupos (propuesta): los crea el responsable del colaborador. Bancosol solo ve código y número de personas. */
  const groups = [
    { id: 1, collab: 2, code: 'UMA-01', members: [5, 6], leader: 5 },
    { id: 2, collab: 2, code: 'UMA-02', members: [11, 7, 8], leader: 11 },
    { id: 3, collab: 3, code: 'RIN-01', members: [9, 10], leader: 9 },
  ];

  /* campaign (campaign_type_id, name, start_date, end_date). code, days, exceptions y status son propuesta.
     participation ≈ store_participation (true/false; sin fila = pendiente). */
  const campaigns = [
    { id: 1, type: 1, code: 'GR2026', name: 'Gran Recogida 2026', start: '2026-11-16', end: '2026-11-22', days: ['2026-11-20', '2026-11-21'], exceptions: [{ chain: 3, date: '2026-11-28', note: 'Carrefour ofrece voluntariado el sábado siguiente' }], status: 'Activa',
      participation: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 9: true, 10: true, 11: false },
      sources: [{ chain: 1, file: 'Tiendas Mercadona GR2026.xlsx', date: '2026-11-04', rows: 81 }, { chain: 2, file: 'TIENDAS DIA MÁLAGA GR2026.xlsx', date: '2026-11-06', rows: 94 }] },
    { id: 2, type: 2, code: 'OKN2026', name: 'Operación Kilo Navidad', start: '2026-12-07', end: '2026-12-13', days: ['2026-12-11', '2026-12-12'], exceptions: [], status: 'Planificada', participation: {}, sources: [] },
    { id: 3, type: 1, code: 'GR2025', name: 'Gran Recogida 2025', start: '2025-11-17', end: '2025-11-23', days: ['2025-11-21', '2025-11-22'], exceptions: [], status: 'Finalizada', participation: {}, sources: [] },
  ];
  /* zone_assignment (campaign_id, zone_id, user_id) */
  const zoneAssignments = [
    { campaign: 1, zone: 1, user: 2 }, { campaign: 1, zone: 2, user: 2 }, { campaign: 1, zone: 3, user: 2 },
    { campaign: 1, zone: 4, user: 3 }, { campaign: 1, zone: 5, user: 3 }, { campaign: 1, zone: 6, user: 3 },
    { campaign: 3, zone: 1, user: 3 }, { campaign: 3, zone: 4, user: 2 },
  ];
  /* collaborator_participation (collaborator_id, campaign_id) */
  const collabParticipation = [[2, 1], [3, 1], [4, 1], [5, 1], [1, 1], [2, 3], [4, 3], [5, 3], [1, 3]].map(([collab, campaign], i) => { const c = collabs.find(x => x.id === collab); return { id: i + 1, collab, campaign, coords: [...c.coords], stores: campaign === 1 ? [...c.stores] : [], status: campaign === 1 && collab === 4 ? 'Pendiente' : 'Confirmado' }; });
  collabs.forEach(c => { c.pendingCoords = c.status === 'Validado' ? [] : [...c.coords]; delete c.coords; delete c.stores; });
  /* Cobertura en la campaña anterior (derivable de shift_assignment de GR2025). */
  const history = { 1: 2, 2: 1, 3: 2, 4: 2, 5: 3, 6: 5, 9: 4, 10: 5, 11: 1 };

  /* shift (date, start_time, end_time, notes, store_participation_id). capacity se deriva de checkout_shelfs.
     shift_assignment del DBML solo admite voluntarios; grupo y entidad son propuesta. */
  const shifts = []; let sid = 1;
  const plan = { 1: [['group', 1], ['vol', 2]], 3: [['group', 2]], 4: [['vol', 1]], 5: [['group', 3]], 6: [['collab', 5, 2]], 10: [['collab', 5, 2]], 2: [['vol', 4]] };
  const hours = st => schedules.find(h => h.store === st.id) || { open: '09:00', close: '21:30' };
  campaigns[0].days.forEach((date, di) => stores.forEach(st => {
    if (campaigns[0].participation[st.id] !== true) return;
    [['Mañana', hours(st).open, '14:00'], ['Tarde', '17:00', hours(st).close]].forEach(([slot, start, end], si) => {
      const as = (di === 0 && si === 0 && plan[st.id]) || (di === 1 && si === 1 && st.id === 4 ? [['group', 2]] : []);
      shifts.push({ id: sid++, campaign: 1, store: st.id, date, slot, start, end, capacity: st.checkout_shelfs === 2 ? 4 : 2, notes: '',
        assignments: as.map(([kind, ref, n]) => kind === 'collab' ? { kind, collab: ref, people: n } : kind === 'group' ? { kind, group: ref } : { kind, vol: ref }) });
    });
  }));
  shifts.push({ id: sid++, campaign: 1, store: 10, date: '2026-11-28', slot: 'Mañana', start: '10:00', end: '14:00', capacity: 4, notes: 'Excepción Carrefour', assignments: [] });

  /* report (report_type_id, description, solution, reported_by, solved_by, campaign_id, creation_date, resolution_date). shift es propuesta. */
  const reports = [
    { id: 1, type: 1, description: 'Un voluntario avisa de que no puede venir', solution: '', reported_by: 4, solved_by: null, campaign: 1, shift: 1, creation_date: '2026-11-12', resolution_date: null, urgent: true },
  ];

  /* Actividad: cada entrada guarda referencias a objetos para poder enlazarlos. */
  const activity = [
    { who: 3, text: 'importó 94 tiendas de {chain}', refs: { chain: 2 }, when: 'Hace 20 min' },
    { who: 4, text: 'asignó el grupo {group} a {store}', refs: { group: 1, store: 1 }, when: 'Hace 1 h' },
    { who: 1, text: 'dio de alta el colaborador {collab} (pendiente de validar)', refs: { collab: 6 }, when: 'Ayer' },
    { who: 2, text: 'marcó {store} como «No participa»', refs: { store: 11 }, when: 'Hace 2 días' },
  ];
  const importTemplates = { 1: { headerRow: 0, map: { code: 'Centro', name: 'Nombre del centro', address: 'Dirección', city: 'Municipio', province: 'Provincia' } } };
  const settings = { morningEnd: '14:00', afternoonStart: '17:00', baseCapacity: 2, twoLinesCapacity: 4, inactiveCampaigns: 3 };
  chains.forEach(c => Object.assign(c, c.id === 3 ? { open: '10:00', close: '22:00' } : { open: '09:00', close: '21:30' }));
  localities.forEach(l => { l.zone = stores.find(s => s.locality === l.id && s.zone)?.zone ?? null; });
  campaigns[0].reasons = { 11: 'En reformas' };
  campaigns.forEach(c => { c.reasons ||= {}; c.kilos ||= {}; });
  /* Datos de ejemplo del histórico: la campaña anterior ya cerrada. */
  Object.assign(campaigns[2], { kilos: { 1: 1840, 2: 1520, 3: 1310, 4: 980, 5: 1205, 6: 760, 7: 1430, 9: 890, 10: 2110 }, summary: { volunteers: 214, attendance: 91, coverage: 94, stores: 9 } });
  groups.forEach(g => { g.reviewedFor = g.id === 2 ? null : 1; });
  const catalogRequests = [{ id: 1, kind: 'locality', name: 'Alhaurín de la Torre', postal_code: '29130', note: 'Tenemos dos tiendas nuevas allí este año.', by: 3, date: '2026-11-11', status: 'Pendiente' }];
  const audit = [{ entity: 'stores', id: 1, who: 1, when: '2026-11-08 10:12', text: 'Líneas de caja: 1 → 2' }, { entity: 'collabs', id: 6, who: 1, when: '2026-11-11 17:40', text: 'Dado de alta (pendiente de validar)' }];
  const importHistory = [];
  const notifications = [{ id: 1, to: 5, from: 4, text: 'UMA-02 asignado al turno Mercadona Huelín · vie 20 09:00–14:00 · van 3 de 3', reason: '', shift: 5, store: 3, when: 'Hace 1 h', read: false }, { id: 2, to: 4, from: 2, text: 'Turno actualizado (Mercadona Gutenberg · vie 20 09:00–14:00): horario 09:00–14:00 → 09:30–14:00', reason: 'La tienda abre a las 9:30 ese día', shift: 1, store: 1, when: 'Ayer', read: false }];
  localities.forEach(l => { l.aliases = []; });
  const collabRequests = [{ id: 1, collab: 3, by: 6, date: '2026-11-09', changes: { address: 'Plaza Al-Ándalus, 3', capacity: 25 }, note: 'Nos hemos mudado de edificio y este año somos más.', status: 'Pendiente' }];
  const storeRequests = [{ id: 1, store: 2, by: 2, date: '2026-11-10', changes: { address: 'C/ Camino de Suárez, 24', checkout_shelfs: 2 }, note: 'Han ampliado la tienda y la entrada ahora está en el 24.', status: 'Pendiente' }];
  return { audit, catalogRequests, collabRequests, notifications, importHistory, storeRequests, roles, permissions, rolePerms, zones, localities, chains, campaignTypes, reportTypes, users, stores, schedules, scheduleExceptions, collabs, contacts, volunteers, groups,
    campaigns, zoneAssignments, collabParticipation, history, shifts, reports, activity, importTemplates, settings };
})();

const DATA = window.MOCK_DATA;
const ROLE_CATALOG = DATA.roles;
const NAV_ITEMS = [
  { id: 'home', label: 'Casa', icon: 'home' },
  { id: 'calendar', label: 'Calendario', icon: 'calendar' },
  { id: 'zones', label: 'Zonas', icon: 'map' },
  { id: 'stores', label: 'Tiendas', icon: 'store' },
  { id: 'collaborators', label: 'Colaboradores', icon: 'users' },
  { id: 'incidents', label: 'Incidencias', icon: 'alert' },
  { id: 'campaign-status', label: 'Estado de campaña', icon: 'chart' }
];
const ADMIN_NAV_ITEMS = [
  { id: 'summary', label: 'Resumen', icon: 'home' },
  { id: 'stores', label: 'Tiendas', icon: 'store' },
  { id: 'chains', label: 'Cadenas', icon: 'building' },
  { id: 'collaborators', label: 'Colaboradores', icon: 'users' },
  { id: 'zones', label: 'Zonas', icon: 'map' },
  { id: 'audit', label: 'Auditoría', icon: 'list' },
  { id: 'users', label: 'Usuarios', icon: 'users' },
  { id: 'campaigns', label: 'Campañas', icon: 'calendar' }
];
const SHORT_DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });
const DATE_WITH_YEAR_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
const DATE_ONLY_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
const DAY_NUMBER_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric' });
const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
const LONG_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('es-ES', { weekday: 'long' });
const SHORT_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
const WIZARD_STEP_NAMES = ['Datos', 'Franjas', 'Tiendas', 'Coordinación', 'Confirmar'];
const TUTORIALS = {
  campaign: {
    home: [
      ['Vista general', 'El calendario es el punto de partida. Los cinco indicadores inferiores llevan a las áreas de trabajo de la campaña.'],
      ['Navegación', 'Usa los enlaces superiores para consultar zonas, tiendas, entidades colaboradoras, incidencias y estado.'],
      ['Ayuda contextual', 'El interrogante abre esta guía solo cuando la necesitas. El perfil activo permanece visible en la cabecera.']
    ],
    calendar: [
      ['Elige una vista', 'Alterna entre día, semana y mes. En día y semana las franjas se colocan según su hora entre las 08:00 y las 23:00.'],
      ['Abre una franja', 'Selecciona una franja para ver cobertura por tienda, pendientes y conflictos. La lista se puede ordenar por tienda o estado.'],
      ['Consulta detalles', 'Desde la vista de día puedes abrir tiendas y conflictos. En mes, cada fecha muestra un único resumen de estado.']
    ],
    zones: [
      ['Explora las zonas', 'Las tarjetas resumen el código, las tiendas y la coordinación asignada a cada zona visible para tu perfil.'],
      ['Cambia el formato', 'Usa el conmutador para pasar de tarjetas a tabla sin perder el ámbito de campaña.'],
      ['Filtra tiendas', 'Abre una zona para ir al listado de tiendas con un filtro que puedes retirar.']
    ],
    stores: [
      ['Busca tiendas', 'La búsqueda contempla nombre, cadena, zona, localidad y persona que asigna turnos.'],
      ['Lee el estado', 'La columna Turnos muestra solo Completo, Pendiente o Conflicto. El conflicto prevalece sobre los demás estados.'],
      ['Abre una ficha', 'La ficha reúne horarios, cadena, zona, entidad colaboradora, persona STORE-MANAGER y un calendario compacto.']
    ],
    collaborators: [
      ['Entidades colaboradoras', 'Cada tarjeta representa una entidad, no a una persona. Los grupos muestran únicamente el conteo de voluntarios.'],
      ['Contactos', 'Los nombres de personas no voluntarias abren su ficha de contacto. Los grupos enlazan a sus líderes.'],
      ['Acciones simuladas', 'Crear o modificar un contacto y asignar una persona responsable solo muestran el flujo; no guardan cambios.']
    ],
    incidents: [
      ['Filtra por estado', 'Consulta todas las incidencias o separa las pendientes de las respondidas.'],
      ['Una respuesta como máximo', 'Una incidencia respondida muestra su única respuesta y no permite responder otra vez.'],
      ['Personas de contacto', 'El nombre de quien informa o responde abre su ficha. No se muestran datos identificables de voluntarios.']
    ],
    'campaign-status': [
      ['Ámbito visible', 'Los contadores se calculan sobre las tiendas y zonas disponibles para el perfil activo.'],
      ['Estados', 'Verde indica completo, naranja pendiente y rojo conflicto. El conflicto prevalece si afecta a una franja.'],
      ['Accede al detalle', 'Cada contador abre la lista, incidencia, conflicto o franja que explica la cifra.']
    ]
  },
  admin: {
    summary: [
      ['Administración global', 'Este contexto gestiona los datos de ejemplo de toda la intranet, no los de una campaña concreta.'],
      ['Navegación propia', 'Usa el menú de Administración para abrir cualquiera de las siete entidades.'],
      ['Simulación', 'Los formularios muestran el flujo, pero ninguna acción crea, modifica o elimina datos.']
    ],
    stores: [
      ['Listado global', 'Busca tiendas y abre una ficha con sus horarios, persona que asigna y calendario.'],
      ['Acciones', 'Ver, editar, borrar y crear son demostraciones. Borrar siempre solicita confirmación.'],
      ['Cadena y zona', 'Abre una cadena o zona para consultar sus tiendas y las relaciones de ejemplo.']
    ],
    chains: [
      ['Cadenas', 'Abre una cadena para ver sus tiendas y las acciones disponibles en cada fila.'],
      ['Crear tienda', 'Desde el detalle de cadena puedes iniciar la creación de una tienda con la cadena preseleccionada.'],
      ['Simulación', 'Las confirmaciones no alteran el listado.']
    ],
    collaborators: [
      ['Entidades', 'Cada entidad colaboradora agrupa participaciones y grupos; no representa a una persona voluntaria.'],
      ['Contactos y responsable', 'Consulta fichas de contacto, simula cambios y asigna el rol COLLABORATOR-MANAGER.'],
      ['Grupos', 'Se muestran líderes con ficha de contacto y solo el conteo de voluntarios.']
    ],
    zones: [
      ['Zonas', 'Consulta tiendas y coordinación. Una persona COORDINATOR puede coordinar varias zonas.'],
      ['Tiendas asignadas', 'En el detalle puedes marcar o desmarcar tiendas; guardar es una simulación.'],
      ['Listado completo', 'Abre la sección global de tiendas desde cualquier zona.']
    ],
    audit: [
      ['Solo lectura', 'Los eventos visibles son datos de ejemplo. El modelo no define una tabla de auditoría.'],
      ['Consulta', 'Puedes buscar por persona, acción o entidad. No hay acciones para editar o borrar eventos.'],
      ['Privacidad', 'No se presentan nombres ni datos de contacto de voluntarios.']
    ],
    users: [
      ['Usuarios del sistema', 'El listado muestra solo personal no voluntario de ejemplo y sus roles.'],
      ['Editar rol', 'Puedes abrir el formulario de rol; la acción es simulada y no persiste.'],
      ['Asignaciones', 'Las asignaciones a campañas y zonas no se gestionan en esta sección.']
    ],
    campaigns: [
      ['Asistente', 'Crear campaña abre un asistente de cinco pasos con datos, franjas diarias, tiendas y coordinación.'],
      ['Asignación', 'Puedes reutilizar coordinadores anteriores o asignar manualmente por tienda, cadena o zona.'],
      ['Confirmación', 'La confirmación final solo muestra un aviso. También puedes crear tipos de campaña por separado.']
    ]
  }
};

const state = {
  userId: null,
  activeRole: null,
  adminMode: false,
  campaignId: 'grand',
  campaignView: 'home',
  adminView: 'summary',
  calendarMode: 'week',
  calendarDate: parseDate(DATA.today),
  storeCalendarMode: 'week',
  storeCalendarDate: parseDate(DATA.today),
  zoneMode: 'cards',
  zoneFilter: null,
  storeFilter: null,
  storeSearch: '',
  incidentFilter: 'all',
  searches: {},
  shiftSort: 'order',
  popover: null,
  tutorialStep: 0,
  tutorialKey: null,
  modalStack: [],
  wizard: null,
  wizardStep: 1,
  wizardError: '',
  wizardChainSearch: '',
  zoneSelections: {}
};
const DERIVED_CONFLICTS = deriveConflicts();

document.addEventListener('click', handleClick);
document.addEventListener('change', handleChange);
document.addEventListener('input', handleInput);
document.addEventListener('submit', handleSubmit);
document.addEventListener('keydown', handleKeydown);

renderApp();

function queryElement(selector, root = document) {
  return root.querySelector(selector);
}

function queryElements(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function icon(name) {
  return `<span class="icon">${window.ICONS[name] || ''}</span>`;
}

function parseDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function addMonths(date, amount) {
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  return result;
}

function startOfWeek(date) {
  const result = new Date(date);
  const weekday = result.getDay() || 7;
  result.setDate(result.getDate() - weekday + 1);
  return result;
}

function formatShortDate(date) {
  return SHORT_DATE_FORMATTER.format(date).replace(/\.$/, '');
}

function formatDateOnly(value) {
  const date = typeof value === 'string' ? parseDate(value.slice(0, 10)) : value;
  return DATE_ONLY_FORMATTER.format(date);
}

function formatAuditDate(value) {
  const [dateValue, timeValue = ''] = String(value).split(' ');
  return `${formatDateOnly(dateValue)}${timeValue ? ` · ${timeValue}` : ''}`;
}

function formatLongDate(date) {
  return capitalizeFirst(FULL_DATE_FORMATTER.format(date));
}

function formatMonthTitle(date) {
  return capitalizeFirst(MONTH_YEAR_FORMATTER.format(date));
}

function formatDateRange(firstDate, lastDate) {
  if (formatDateKey(firstDate) === formatDateKey(lastDate)) {
    return formatLongDate(firstDate);
  }
  if (firstDate.getMonth() === lastDate.getMonth()) {
    return `${DAY_NUMBER_FORMATTER.format(firstDate)}–${DAY_NUMBER_FORMATTER.format(lastDate)} de ${MONTH_YEAR_FORMATTER.format(firstDate)}`;
  }
  return `${formatShortDate(firstDate)} – ${DATE_WITH_YEAR_FORMATTER.format(lastDate)}`;
}

function capitalizeFirst(value) {
  return value.charAt(0).toLocaleUpperCase('es') + value.slice(1);
}

function formatWeekday(date, format = 'short') {
  const formatter = format === 'long' ? LONG_WEEKDAY_FORMATTER : SHORT_WEEKDAY_FORMATTER;
  return capitalizeFirst(formatter.format(date).replace(/\.$/, ''));
}

function initials(name) {
  return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function getPerson(personId) {
  return DATA.people.find(person => person.id === personId) || null;
}

function getStore(storeId) {
  return DATA.stores.find(store => store.id === storeId) || null;
}

function getZone(zoneId) {
  return DATA.zones.find(zone => zone.id === zoneId) || null;
}

function getChain(chainId) {
  return DATA.chains.find(chain => chain.id === chainId) || null;
}

function getCollaborator(collaboratorId) {
  return DATA.collaborators.find(collaborator => collaborator.id === collaboratorId) || null;
}

function getLocality(localityId) {
  return DATA.localities.find(locality => locality.id === localityId) || null;
}

function getCampaign(campaignId = state.campaignId) {
  return DATA.campaigns.find(campaign => campaign.id === campaignId) || DATA.campaigns[0];
}

function getCurrentUser() {
  return getPerson(state.userId);
}

function isAdmin() {
  return state.activeRole === 'ADMIN';
}

function isCampaignReadonly() {
  return !state.adminMode && getCampaign().status === 'Finalizada';
}

function getVisibleZoneIds() {
  if (isAdmin()) {
    return DATA.zones.map(zone => zone.id);
  }
  return DATA.coordinatorZones[state.userId] || [];
}

function getVisibleStores() {
  const campaign = getCampaign();
  const visibleZoneIds = getVisibleZoneIds();
  return DATA.stores.filter(store => campaign.storeIds.includes(store.id) && (isAdmin() || visibleZoneIds.includes(store.zoneId)));
}

function getVisibleZones() {
  const allowedZoneIds = getVisibleZoneIds();
  return DATA.zones.filter(zone => allowedZoneIds.includes(zone.id) && getVisibleStores().some(store => store.zoneId === zone.id));
}

function getVisibleCollaborators() {
  const storeCollaboratorIds = new Set(getVisibleStores().map(store => store.collaboratorId));
  return DATA.collaborators.filter(collaborator => collaborator.campaignIds.includes(state.campaignId) && storeCollaboratorIds.has(collaborator.id));
}

function getVisibleIncidents() {
  const visibleStoreIds = new Set(getVisibleStores().map(store => store.id));
  return DATA.incidents.filter(incident => incident.campaignId === state.campaignId && visibleStoreIds.has(incident.storeId));
}

function personLink(personId, label = '') {
  const person = getPerson(personId);
  if (!person) {
    return '<span class="muted">Sin asignar</span>';
  }
  const visibleName = label || person.name;
  return `<button class="person-link" type="button" data-action="open-contact" data-id="${escapeHtml(person.id)}" aria-label="Abrir ficha de contacto de ${escapeHtml(visibleName)}">${escapeHtml(visibleName)}</button>`;
}

function personDirectory(people, label) {
  return `<div class="stack-sm"><span class="mini-label">${escapeHtml(label)}</span><div class="role-list">${people.map(person => personLink(person.id)).join(' ')}</div></div>`;
}

function personRoles(person) {
  return (person?.roles || []).map(role => `<span class="role-pill" translate="no">${escapeHtml(role)}</span>`).join(' ');
}

function actionIconButton(action, id, iconName, label, extraAttributes = '') {
  return `<button class="icon-button" type="button" data-action="${escapeHtml(action)}" data-id="${escapeHtml(id)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" ${extraAttributes}>${icon(iconName)}</button>`;
}

function getStoreShift(store, slotId, dateValue, campaign = getCampaign()) {
  const dateKey = typeof dateValue === 'string' ? dateValue : formatDateKey(dateValue);
  const slot = campaign.slotTemplate.find(item => item.id === slotId);
  if (!slot || !campaign.storeIds.includes(store.id) || dateKey < campaign.startDate || dateKey > campaign.endDate) {
    return { status: 'neutral', assigned: 0, required: 0, missing: 0, conflict: null };
  }
  let assigned = store[slotId]?.assigned ?? 0;
  let required = store[slotId]?.required ?? 0;
  if (campaign.id === 'spring') {
    required = Math.max(1, Math.min(store.checkoutShelves, 3));
    assigned = store.pastStatus === 'pending' && slotId === 'morning' ? Math.max(0, required - 1) : required;
  } else if (campaign.id === 'grand' && dateKey !== DATA.today) {
    assigned = required;
    if (dateKey === '2026-11-16' && slotId === 'morning' && store.id === 's04') {
      assigned = Math.max(0, required - 1);
    }
  }
  const conflict = DERIVED_CONFLICTS.find(item => item.campaignId === campaign.id && item.date === dateKey && item.slotId === slotId && item.storeIds.includes(store.id)) || null;
  const status = conflict ? 'conflict' : assigned < required ? 'pending' : 'complete';
  return { status, assigned, required, missing: Math.max(0, required - assigned), conflict };
}

function getVisibleConflicts(dateValue = null, slotId = null) {
  const visibleStoreIds = new Set(getVisibleStores().map(store => store.id));
  const dateKey = dateValue ? (typeof dateValue === 'string' ? dateValue : formatDateKey(dateValue)) : null;
  return DERIVED_CONFLICTS.filter(conflict => conflict.campaignId === state.campaignId && (!dateKey || conflict.date === dateKey) && (!slotId || conflict.slotId === slotId) && conflict.storeIds.some(storeId => visibleStoreIds.has(storeId))).map(conflict => {
    const visibleIndexes = conflict.storeIds.map((storeId, index) => visibleStoreIds.has(storeId) ? index : -1).filter(index => index >= 0);
    return {
      ...conflict,
      storeIds: visibleIndexes.map(index => conflict.storeIds[index]),
      assignedByIds: visibleIndexes.map(index => conflict.assignedByIds[index])
    };
  });
}

function deriveConflicts() {
  const conflicts = [];
  const samePersonGroups = new Map();
  DATA.shiftAssignments.forEach(assignment => {
    const groupKey = [assignment.campaignId, assignment.date, assignment.slotId, assignment.collaboratorId, assignment.personAlias].join('|');
    samePersonGroups.set(groupKey, [...(samePersonGroups.get(groupKey) || []), assignment]);
  });
  samePersonGroups.forEach(assignments => {
    const storesById = new Map(assignments.map(assignment => [assignment.storeId, assignment]));
    const distinctAssignments = Array.from(storesById.values());
    if (distinctAssignments.length < 2) {
      return;
    }
    const firstAssignment = distinctAssignments[0];
    conflicts.push({
      id: 'conflict-double',
      campaignId: firstAssignment.campaignId,
      date: firstAssignment.date,
      slotId: firstAssignment.slotId,
      type: 'same-person',
      collaboratorId: firstAssignment.collaboratorId,
      storeIds: distinctAssignments.map(assignment => assignment.storeId),
      assignedByIds: distinctAssignments.map(assignment => assignment.assignedById),
      personAlias: firstAssignment.personAlias,
      reason: 'La misma persona figura en dos tiendas de la entidad colaboradora durante la misma franja.'
    });
  });
  DATA.shiftAssignments.forEach(assignment => {
    const store = DATA.stores.find(item => item.id === assignment.storeId);
    if (!store) {
      return;
    }
    const effectiveOpening = store.opening;
    const effectiveClosing = store.updatedClosing || store.closing;
    if (assignment.startTime < effectiveOpening || assignment.endTime > effectiveClosing) {
      conflicts.push({
        id: 'conflict-hours',
        campaignId: assignment.campaignId,
        date: assignment.date,
        slotId: assignment.slotId,
        type: 'outside-hours',
        collaboratorId: assignment.collaboratorId,
        storeIds: [assignment.storeId],
        assignedByIds: [assignment.assignedById],
        personAlias: assignment.personAlias,
        reason: `La asignación termina a las ${assignment.endTime} y el horario efectivo de la tienda cierra a las ${effectiveClosing}.`
      });
    }
  });
  return conflicts;
}

function getPeriodSummary(dateValue, slotId, storeId = null) {
  const campaign = getCampaign();
  const dateKey = typeof dateValue === 'string' ? dateValue : formatDateKey(dateValue);
  const stores = getVisibleStores().filter(store => !storeId || store.id === storeId);
  const slot = campaign.slotTemplate.find(item => item.id === slotId);
  if (!slot || dateKey < campaign.startDate || dateKey > campaign.endDate) {
    return { status: 'neutral', assigned: 0, required: 0, completeCount: 0, pendingCount: 0, conflictCount: 0, storeCount: 0, conflicts: [] };
  }
  const details = stores.map(store => ({ store, ...getStoreShift(store, slotId, dateKey, campaign) }));
  const conflicts = getVisibleConflicts(dateKey, slotId).filter(conflict => !storeId || conflict.storeIds.includes(storeId));
  const assigned = details.reduce((total, detail) => total + detail.assigned, 0);
  const required = details.reduce((total, detail) => total + detail.required, 0);
  const completeCount = details.filter(detail => detail.status === 'complete').length;
  const pendingCount = details.filter(detail => detail.status === 'pending').length;
  const conflictCount = conflicts.length;
  let status = 'complete';
  if (!details.length) {
    status = 'neutral';
  } else if (conflictCount > 0) {
    status = 'conflict';
  } else if (pendingCount > 0) {
    status = 'pending';
  }
  return { status, assigned, required, completeCount, pendingCount, conflictCount, storeCount: details.length, conflicts, details };
}

function getStoreStatus(store) {
  if (state.campaignId === 'spring') {
    return store.pastStatus || 'complete';
  }
  const slotStatuses = getCampaign().slotTemplate.map(slot => getStoreShift(store, slot.id, DATA.today).status);
  if (slotStatuses.includes('conflict')) {
    return 'conflict';
  }
  return slotStatuses.includes('pending') ? 'pending' : 'complete';
}

function getMonthDayStatus(dateValue, storeId = null) {
  const dateKey = typeof dateValue === 'string' ? dateValue : formatDateKey(dateValue);
  const campaign = getCampaign();
  if (dateKey < campaign.startDate || dateKey > campaign.endDate) {
    return { status: 'neutral', label: 'Fuera de campaña' };
  }
  const summaries = campaign.slotTemplate.map(slot => getPeriodSummary(dateKey, slot.id, storeId));
  if (summaries.some(summary => summary.status === 'conflict')) {
    return { status: 'conflict', label: 'Conflicto en alguna franja' };
  }
  if (summaries.some(summary => summary.status === 'pending')) {
    return { status: 'pending', label: 'Falta asignar cobertura' };
  }
  if (summaries.length && summaries.every(summary => summary.status === 'complete')) {
    return { status: 'complete', label: 'Todas las franjas completas' };
  }
  return { status: 'neutral', label: 'Fuera de campaña' };
}

function getCampaignStatusCounts() {
  const campaign = getCampaign();
  const visibleStores = getVisibleStores();
  const firstDate = parseDate(campaign.startDate);
  const lastDate = parseDate(campaign.endDate);
  const pendingPeriods = [];
  const completePeriods = [];
  for (let currentDate = firstDate; formatDateKey(currentDate) <= formatDateKey(lastDate); currentDate = addDays(currentDate, 1)) {
    for (const slot of campaign.slotTemplate) {
      const summary = getPeriodSummary(currentDate, slot.id);
      if (summary.status === 'pending') {
        pendingPeriods.push({ date: new Date(currentDate), slotId: slot.id });
      }
      if (summary.status === 'complete') {
        completePeriods.push({ date: new Date(currentDate), slotId: slot.id });
      }
    }
  }
  const pendingIncidents = getVisibleIncidents().filter(incident => incident.status === 'pending');
  const unassignedStores = visibleStores.filter(store => !store.managerId);
  const conflicts = getVisibleConflicts();
  return { unassignedStores, pendingIncidents, conflicts, pendingPeriods, completePeriods };
}

function statusText(status) {
  return ({ complete: 'Completo', pending: 'Pendiente', conflict: 'Conflicto', neutral: 'Fuera de campaña' })[status] || status;
}

function statusPill(status, label = statusText(status)) {
  return `<span class="status-pill status-pill--${escapeHtml(status)}">${escapeHtml(label)}</span>`;
}

function renderApp() {
  const authView = queryElement('#auth-view');
  const application = queryElement('#application');
  if (!state.userId) {
    authView.hidden = false;
    application.hidden = true;
    renderModalStack();
    queryElement('#popover-root')?.remove();
    return;
  }
  authView.hidden = true;
  application.hidden = false;
  queryElement('#app-header').innerHTML = renderHeader();
  queryElement('#app-navigation').innerHTML = renderNavigation();
  queryElement('#main-content').innerHTML = renderMainContent();
  prepareFormControls(queryElement('#main-content'));
  queryElements('#main-content [data-search-key]').forEach(input => applySearchToInput(input));
  syncUrlState();
  renderPopover();
  renderModalStack();
}

function renderHeader() {
  const user = getCurrentUser();
  const roleBadge = `<span class="header-role" translate="no" aria-label="Rol activo ${escapeHtml(state.activeRole)}">${escapeHtml(state.activeRole)}</span>`;
  const accountButton = `<button class="account-button" type="button" data-action="toggle-account" aria-expanded="${state.popover === 'account'}" aria-label="Cuenta de ${escapeHtml(user.name)}"><span class="avatar" aria-hidden="true">${escapeHtml(initials(user.name))}</span><span><span class="account-button__name">${escapeHtml(user.name)}</span><span class="account-button__meta" translate="no">${escapeHtml(state.activeRole)}</span></span>${icon('chevronDown')}</button>`;
  if (state.adminMode) {
    return `<div class="app-header__left"><a class="brand-lockup" href="#" data-action="campaign-home" aria-label="Bancosol, volver a campaña"><img src="assets/logo.png" width="38" height="38" alt="Símbolo de Bancosol"><span class="brand-lockup__text" translate="no">Bancosol<small>INTRANET</small></span></a><span class="header-divider" aria-hidden="true"></span><div class="campaign-context"><span class="admin-navigation__label">${icon('shield')} Administración</span></div></div><div class="app-header__right">${roleBadge}<button class="button button--outline button--small" type="button" data-action="back-to-campaign">${icon('arrow')} Volver a campaña</button>${accountButton}</div>`;
  }
  const campaign = getCampaign();
  const statusClass = campaign.status === 'Finalizada' ? 'read-only-pill' : '';
  const statusLabel = campaign.status === 'Finalizada' ? 'Solo consulta' : campaign.status;
  const adminButton = isAdmin() ? `<button class="icon-button admin-entry" type="button" data-action="open-admin" aria-label="Abrir Administración" title="Administración">${icon('star')}</button>` : '';
  const notificationCount = getVisibleNotifications().length;
  const notificationButton = `<div class="header-icon-wrap"><button class="icon-button header-icon-button" type="button" data-action="toggle-notifications" aria-label="Abrir notificaciones${notificationCount ? ` (${notificationCount})` : ''}" aria-expanded="${state.popover === 'notifications'}">${icon('bell')}${notificationCount ? '<span class="notification-dot" aria-hidden="true"></span>' : ''}</button></div>`;
  return `<div class="app-header__left"><a class="brand-lockup" href="#" data-action="campaign-home" aria-label="Bancosol, ir a Casa"><img src="assets/logo.png" width="38" height="38" alt="Símbolo de Bancosol"><span class="brand-lockup__text" translate="no">Bancosol<small>INTRANET</small></span></a><span class="header-divider" aria-hidden="true"></span><div class="campaign-context"><span><span class="campaign-context__label">Campaña activa</span><span class="campaign-select-wrap"><select class="campaign-select" data-action="campaign-select" aria-label="Seleccionar campaña">${DATA.campaigns.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === campaign.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select>${icon('chevronDown')}</span></span><span class="header-campaign"><span class="campaign-status ${statusClass}">${escapeHtml(statusLabel)}</span></span></div></div><div class="app-header__right"><button class="icon-button" type="button" data-action="open-tutorial" aria-label="Ayuda de esta vista" title="Ayuda">${icon('help')}</button>${notificationButton}${adminButton}${roleBadge}${accountButton}</div>`;
}

function renderNavigation() {
  if (state.adminMode) {
    return `<div class="admin-navigation__label">${icon('shield')} Administración</div>${ADMIN_NAV_ITEMS.map(item => `<a class="nav-link ${state.adminView === item.id ? 'is-active' : ''}" href="#admin-${escapeHtml(item.id)}" data-action="admin-nav" data-view="${escapeHtml(item.id)}" ${state.adminView === item.id ? 'aria-current="page"' : ''}>${icon(item.icon)}${escapeHtml(item.label)}</a>`).join('')}`;
  }
  const items = NAV_ITEMS.filter(item => item.id === 'home' || window.CONFIG.SHOW_SECTIONS_IN_NAV);
  return items.map(item => `<a class="nav-link ${state.campaignView === item.id ? 'is-active' : ''}" href="#campaign-${escapeHtml(item.id)}" data-action="campaign-nav" data-view="${escapeHtml(item.id)}" ${state.campaignView === item.id ? 'aria-current="page"' : ''}>${icon(item.icon)}${escapeHtml(item.label)}</a>`).join('');
}

function renderMainContent() {
  const readonlyBanner = !state.adminMode && isCampaignReadonly() ? `<div class="campaign-readonly-banner" role="status">${icon('shield')}<span><strong>${escapeHtml(getCampaign().name)} · solo consulta.</strong> Las acciones de cambio de campaña están deshabilitadas.</span></div>` : '';
  return `${readonlyBanner}${state.adminMode ? renderAdminContent() : renderCampaignContent()}`;
}

function renderCampaignContent() {
  switch (state.campaignView) {
    case 'calendar': return renderCalendarPage();
    case 'zones': return renderZonesPage();
    case 'stores': return renderStoresPage();
    case 'collaborators': return renderCollaboratorsPage();
    case 'incidents': return renderIncidentsPage();
    case 'campaign-status': return renderCampaignStatusPage();
    default: return renderHomePage();
  }
}

function renderPageHeading(title, description = '', actions = '') {
  return `<div class="page-heading"><div class="page-heading__title"><div><h1 id="page-title">${escapeHtml(title)}</h1>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div></div><div class="page-heading__actions">${actions}</div></div>`;
}

function renderHomePage() {
  const user = getCurrentUser();
  const campaign = getCampaign();
  const zones = getVisibleZones();
  const stores = getVisibleStores();
  const collaborators = getVisibleCollaborators();
  const pendingIncidentCount = getVisibleIncidents().filter(incident => incident.status === 'pending').length;
  const campaignState = campaign.status === 'Finalizada' ? 'Finalizada · solo consulta' : 'En curso · coordinación abierta';
  const widgets = [
    { view: 'zones', icon: 'map', title: 'Zonas', count: zones.length, detail: `${zones.length === 1 ? 'zona visible' : 'zonas visibles'} en tu ámbito`, link: 'Explorar zonas' },
    { view: 'stores', icon: 'store', title: 'Tiendas', count: stores.length, detail: 'Participan en esta campaña', link: 'Ver tiendas' },
    { view: 'collaborators', icon: 'users', title: 'Colaboradores', count: collaborators.length, detail: 'Entidades colaboradoras activas', link: 'Ver entidades' },
    { view: 'incidents', icon: 'alert', title: 'Incidencias pendientes', count: pendingIncidentCount, detail: pendingIncidentCount ? 'Necesitan una respuesta' : 'Sin pendientes por responder', link: 'Ver todas', badge: pendingIncidentCount ? pendingIncidentCount : '' },
    { view: 'campaign-status', icon: 'chart', title: 'Estado de campaña', count: campaign.status, detail: campaignState, link: 'Ver resumen', compact: true }
  ];
  return `<section class="home-view" aria-labelledby="home-title"><div class="page-heading home-heading"><div><div class="home-welcome"><span class="welcome-dot" aria-hidden="true"></span><span class="eyebrow">${escapeHtml(campaign.name)} · ${escapeHtml(state.activeRole)}</span></div><h1 id="home-title">Hola, ${escapeHtml(user.name.split(' ')[0])}</h1></div><div class="page-heading__actions"><span class="tag tag--blue">${escapeHtml(state.activeRole)}</span><span class="muted" style="font-size:10px">Tu espacio de coordinación</span></div></div>${renderCalendarPanel({ home: true })}<div class="home-widgets" aria-label="Resumen de campaña">${widgets.map(renderHomeWidget).join('')}</div></section>`;
}

function renderHomeWidget(widget) {
  const compactCount = widget.compact ? ' style="font-size:15px;letter-spacing:-.03em"' : '';
  const badge = widget.badge ? `<span class="status-pill status-pill--pending">${widget.badge}</span>` : '';
  return `<a class="widget-card${widget.view === 'campaign-status' ? ' widget-card--campaign' : ''}" href="#campaign-${escapeHtml(widget.view)}" data-action="campaign-nav" data-view="${escapeHtml(widget.view)}" aria-label="${escapeHtml(widget.title)}: ${escapeHtml(widget.count)}. ${escapeHtml(widget.link)}"><span class="widget-card__icon">${icon(widget.icon)}</span><span class="widget-card__content"><span class="widget-card__top"><span class="widget-card__title">${escapeHtml(widget.title)}</span>${badge}</span><strong class="widget-card__count"${compactCount}>${escapeHtml(widget.count)}</strong><span class="widget-card__detail">${escapeHtml(widget.detail)}</span><span class="widget-card__link">${escapeHtml(widget.link)} ${icon('arrow')}</span></span></a>`;
}

function renderCalendarPage() {
  return `<section aria-labelledby="calendar-title">${renderPageHeading('Calendario', `${getCampaign().name} · Cobertura, franjas y conflictos`)}${renderCalendarPanel({ home: false, headingId: 'calendar-title' })}${state.calendarMode === 'day' ? renderCalendarDayDetails(state.calendarDate) : ''}</section>`;
}

function renderCalendarPanel({ home = false, headingId = '' } = {}) {
  const title = state.calendarMode === 'month' ? formatMonthTitle(state.calendarDate) : state.calendarMode === 'day' ? formatLongDate(state.calendarDate) : formatDateRange(startOfWeek(state.calendarDate), addDays(startOfWeek(state.calendarDate), 6));
  const shellClass = home ? 'home-calendar-panel' : 'calendar-panel';
  return `<section class="${shellClass}" aria-label="Calendario de campaña"><div class="calendar-toolbar"><div class="calendar-toolbar__left">${icon('calendar')}<h2 class="calendar-toolbar__title" ${headingId ? `id="${escapeHtml(headingId)}"` : ''}>Calendario</h2><div class="calendar-range-nav"><button class="icon-button" type="button" data-action="calendar-prev" aria-label="Periodo anterior">${icon('chevronLeft')}</button><span class="calendar-range" aria-live="polite">${escapeHtml(title)}</span><button class="icon-button" type="button" data-action="calendar-next" aria-label="Periodo siguiente">${icon('chevronRight')}</button></div></div><div class="calendar-toolbar__right"><button class="button button--quiet button--small" type="button" data-action="calendar-today">${icon('refresh')} Volver a hoy</button><div class="segmented-control" role="group" aria-label="Vista de calendario">${['day', 'week', 'month'].map(mode => `<button type="button" data-action="calendar-mode" data-mode="${mode}" class="${state.calendarMode === mode ? 'is-active' : ''}" aria-pressed="${state.calendarMode === mode}">${mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}</button>`).join('')}</div></div></div>${state.calendarMode === 'month' ? renderCalendarMonth(state.calendarDate) : renderCalendarTimeline({ date: state.calendarDate, mode: state.calendarMode, home })}</section>`;
}

function getCalendarDates(date, mode) {
  if (mode === 'day') {
    return [new Date(date)];
  }
  const firstDate = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(firstDate, index));
}

function renderCalendarTimeline({ date, mode, home = false, storeId = null, compact = false }) {
  const dates = getCalendarDates(date, mode);
  const dayCount = dates.length;
  const campaign = getCampaign();
  const hourLabels = Array.from({ length: 16 }, (_, index) => {
    const hour = index + 8;
    return `<span class="calendar-time-label" style="top:${(index / 15) * 100}%">${String(hour).padStart(2, '0')}:00</span>`;
  }).join('');
  const headings = dates.map(currentDate => {
    const todayClass = formatDateKey(currentDate) === DATA.today ? 'is-today' : '';
    const weekdayName = formatWeekday(currentDate, mode === 'day' ? 'long' : 'short');
    return `<div class="calendar-day-heading ${todayClass}"><span>${escapeHtml(weekdayName)}</span><span class="calendar-date-number">${currentDate.getDate()}</span></div>`;
  }).join('');
  const lanes = dates.map(currentDate => {
    const dateKey = formatDateKey(currentDate);
    const guides = Array.from({ length: 16 }, (_, index) => `<span class="calendar-guide ${index % 3 === 0 ? 'is-hour' : ''}" style="top:${(index / 15) * 100}%"></span>`).join('');
    const slots = campaign.slotTemplate.map(slot => {
      const summary = getPeriodSummary(dateKey, slot.id, storeId);
      if (summary.status === 'neutral') {
        return '';
      }
      return renderCalendarEvent(dateKey, slot, summary, compact, storeId);
    }).join('');
    return `<div class="calendar-day-lane" aria-label="${escapeHtml(formatLongDate(currentDate))}">${guides}${slots}</div>`;
  }).join('');
  const extraClasses = `${home ? ' calendar-grid--home' : ''}${compact ? ' calendar-grid--compact' : ''}`;
  return `<div class="calendar-grid${extraClasses}" style="--day-count:${dayCount}"><div class="calendar-grid__head"><span aria-hidden="true"></span><div class="calendar-grid__days">${headings}</div></div><div class="calendar-grid__body"><div class="calendar-time-rail" aria-label="Escala horaria de 08:00 a 23:00">${hourLabels}</div><div class="calendar-day-lanes">${lanes}</div></div></div>`;
}

function renderCalendarEvent(dateKey, slot, summary, compact = false, storeId = null) {
  const [startHour, startMinute] = slot.start.split(':').map(Number);
  const [endHour, endMinute] = slot.end.split(':').map(Number);
  const startOffset = (startHour * 60 + startMinute - 8 * 60) / (15 * 60);
  const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / (15 * 60);
  const statusClass = summary.status === 'conflict' ? 'calendar-event--conflict' : summary.status === 'pending' ? 'calendar-event--pending' : '';
  const coverageLabel = `${summary.assigned}/${summary.required} turnos`;
  const detailLabel = summary.status === 'conflict' ? `${summary.conflictCount} conflictos · ${summary.pendingCount} pendientes` : summary.status === 'pending' ? `${summary.pendingCount} tiendas pendientes` : `${summary.completeCount} tiendas completas`;
  const titleLabel = compact ? `${slot.label} ${coverageLabel}` : `${slot.label} · ${coverageLabel}`;
  return `<button class="calendar-event ${statusClass}" type="button" style="top:${startOffset * 100}%;height:${duration * 100}%" data-action="open-shift" data-date="${escapeHtml(dateKey)}" data-slot="${escapeHtml(slot.id)}" ${storeId ? `data-store-id="${escapeHtml(storeId)}"` : ''} aria-label="Abrir franja ${escapeHtml(slot.label)} del ${escapeHtml(dateKey)}: ${escapeHtml(detailLabel)}"><span class="calendar-event__title">${escapeHtml(titleLabel)}</span><span class="calendar-event__time">${escapeHtml(slot.start)}–${escapeHtml(slot.end)}</span><span class="calendar-event__meta">${escapeHtml(detailLabel)}</span></button>`;
}

function getMonthGridDates(date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  const weekday = monthStart.getDay() || 7;
  const gridStart = addDays(monthStart, 1 - weekday);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function renderCalendarMonth(date, storeId = null) {
  const dates = getMonthGridDates(date);
  const weekdays = SHORT_DAY_NAMES.map(day => `<div class="calendar-month__weekday">${escapeHtml(day)}</div>`).join('');
  const cells = dates.map(currentDate => {
    const dateKey = formatDateKey(currentDate);
    const inMonth = currentDate.getMonth() === date.getMonth();
    const summary = getMonthDayStatus(dateKey, storeId);
    const statusLabel = summary.status === 'neutral' ? 'Fuera de campaña' : summary.label;
    const monthClass = summary.status === 'neutral' ? '' : `month-summary--${summary.status}`;
    const currentDayClass = dateKey === DATA.today ? 'is-today' : '';
    const outsideClass = inMonth ? '' : 'is-outside';
    return `<button class="calendar-month__cell ${outsideClass}" type="button" data-action="${storeId ? 'open-store-calendar-day' : 'open-calendar-day'}" data-date="${escapeHtml(dateKey)}" ${storeId ? `data-store-id="${escapeHtml(storeId)}"` : ''} aria-label="${escapeHtml(formatLongDate(currentDate))}: ${escapeHtml(statusLabel)}"><span class="month-day-number ${currentDayClass}">${currentDate.getDate()}</span><span class="month-summary ${monthClass}">${escapeHtml(statusLabel)}</span></button>`;
  }).join('');
  return `<div class="calendar-month" role="group" aria-label="Calendario de ${escapeHtml(formatMonthTitle(date))}">${weekdays}${cells}</div>`;
}

function renderCalendarDayDetails(date) {
  const dateKey = formatDateKey(date);
  const campaign = getCampaign();
  const pendingItems = [];
  const missingItems = [];
  for (const slot of campaign.slotTemplate) {
    const summary = getPeriodSummary(dateKey, slot.id);
    for (const detail of summary.details || []) {
      if (detail.status === 'pending') {
        pendingItems.push({ store: detail.store, slot, detail });
        missingItems.push({ store: detail.store, slot, detail });
      }
    }
  }
  const conflicts = getVisibleConflicts(dateKey);
  const pendingRows = pendingItems.length ? pendingItems.map(item => `<div class="day-detail-item"><button type="button" data-action="open-store" data-id="${escapeHtml(item.store.id)}">${escapeHtml(item.store.name)} · ${escapeHtml(item.slot.label)}</button><span>${item.detail.assigned}/${item.detail.required}</span></div>`).join('') : '<div class="day-detail-item"><span>Sin tiendas pendientes</span></div>';
  const missingRows = missingItems.length ? missingItems.map(item => `<div class="day-detail-item"><button type="button" data-action="open-store" data-id="${escapeHtml(item.store.id)}">${escapeHtml(item.store.name)} · ${escapeHtml(item.slot.label)}</button><span>Faltan ${item.detail.missing}</span></div>`).join('') : '<div class="day-detail-item"><span>Sin turnos por asignar</span></div>';
  const conflictRows = conflicts.length ? conflicts.map(conflict => `<div class="day-detail-item"><button type="button" data-action="open-conflict" data-id="${escapeHtml(conflict.id)}">${escapeHtml(conflict.type === 'same-person' ? 'Asignación duplicada' : 'Fuera de horario')}</button><span>${escapeHtml(conflict.personAlias)}</span></div>`).join('') : '<div class="day-detail-item"><span>Sin conflictos</span></div>';
  return `<div class="day-details-grid"><section class="day-detail-card"><h2>${icon('clock')} Tiendas pendientes <span class="tag">${pendingItems.length}</span></h2>${pendingRows}</section><section class="day-detail-card"><h2>${icon('alert')} Turnos que faltan <span class="tag">${missingItems.reduce((total, item) => total + item.detail.missing, 0)}</span></h2>${missingRows}</section><section class="day-detail-card"><h2>${icon('warning')} Conflictos <span class="status-pill status-pill--conflict">${conflicts.length}</span></h2>${conflictRows}</section></div>`;
}

function renderZonesPage() {
  const zones = getVisibleZones();
  const toggle = `<div class="view-switch" role="group" aria-label="Formato de zonas"><button type="button" data-action="zone-mode" data-mode="cards" class="${state.zoneMode === 'cards' ? 'is-active' : ''}" aria-label="Vista de tarjetas" aria-pressed="${state.zoneMode === 'cards'}">${icon('building')}</button><button type="button" data-action="zone-mode" data-mode="table" class="${state.zoneMode === 'table' ? 'is-active' : ''}" aria-label="Vista de tabla" aria-pressed="${state.zoneMode === 'table'}">${icon('list')}</button></div>`;
  const description = isAdmin() ? 'Zonas y coordinación de la campaña seleccionada' : 'Zonas asignadas a tu coordinación';
  const content = state.zoneMode === 'cards' ? `<div class="zone-grid">${zones.map(zone => renderZoneCard(zone)).join('')}</div>` : renderZoneTable(zones);
  return `<section aria-labelledby="page-title">${renderPageHeading('Zonas', description, toggle)}${content}</section>`;
}

function renderZoneCard(zone) {
  const stores = getVisibleStores().filter(store => store.zoneId === zone.id);
  const coordinators = zone.coordinatorIds.map(personId => personLink(personId)).join(', ');
  const collaborators = new Set(stores.map(store => store.collaboratorId)).size;
  return `<article class="zone-card"><div class="zone-card__top"><span class="zone-card__code">${escapeHtml(zone.code)}</span><span class="tag">${stores.length} tiendas</span></div><h2>${escapeHtml(zone.name)}</h2><span class="muted" style="font-size:9px">Zona de la campaña</span><div class="zone-card__metrics"><div class="zone-metric"><strong>${stores.length}</strong><span>Tiendas</span></div><div class="zone-metric"><strong>${collaborators}</strong><span>Entidades</span></div></div><div class="zone-card__footer"><span class="inline-person"><span class="mini-label">Coordina</span>${coordinators || '<span class="muted">Sin asignar</span>'}</span><a class="button button--outline button--small" href="#campaign-stores" data-action="zone-stores" data-id="${escapeHtml(zone.id)}">Ver tiendas ${icon('arrow')}</a></div></article>`;
}

function renderZoneTable(zones) {
  const rows = zones.map(zone => {
    const stores = getVisibleStores().filter(store => store.zoneId === zone.id);
    return `<tr><td><span class="table-primary">${escapeHtml(zone.name)}</span><span class="table-secondary">${escapeHtml(zone.code)}</span></td><td>${stores.length}</td><td>${zone.coordinatorIds.map(personId => personLink(personId)).join(', ') || '<span class="muted">Sin asignar</span>'}</td><td>${new Set(stores.map(store => store.collaboratorId)).size}</td><td><a class="button button--outline button--small" href="#campaign-stores" data-action="zone-stores" data-id="${escapeHtml(zone.id)}">Ver tiendas</a></td></tr>`;
  }).join('');
  return `<section class="surface-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Zona</th><th>Tiendas</th><th>Coordinación</th><th>Entidades</th><th>Acción</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="table-empty">No hay zonas en este ámbito.</td></tr>'}</tbody></table></div></section>`;
}

function renderStoresPage() {
  const visibleStores = getVisibleStores();
  const selectedZone = state.zoneFilter ? getZone(state.zoneFilter) : null;
  const filterChip = selectedZone ? `<span class="filter-chip">Zona: ${escapeHtml(selectedZone.name)}<button type="button" data-action="remove-zone-filter" aria-label="Quitar filtro de zona">${icon('close')}</button></span>` : '';
  const rows = visibleStores.filter(store => {
    if (selectedZone && store.zoneId !== selectedZone.id) {
      return false;
    }
    if (state.storeFilter === 'no-manager' && store.managerId) {
      return false;
    }
    return true;
  });
  const headingDescription = selectedZone ? `Tiendas de ${selectedZone.name} · ${getCampaign().name}` : `${getCampaign().name} · ${visibleStores.length} tiendas visibles`;
  const tableRows = rows.map(store => {
    const chain = getChain(store.chainId);
    const zone = getZone(store.zoneId);
    const locality = getLocality(store.localityId);
    const manager = getPerson(store.managerId);
    return `<tr data-searchable data-search-text="${escapeHtml(`${store.name} ${chain?.name || ''} ${zone?.name || ''} ${locality?.name || ''} ${manager?.name || ''}`.toLocaleLowerCase('es'))}"><td><button class="table-link table-primary" type="button" data-action="open-store" data-id="${escapeHtml(store.id)}">${escapeHtml(store.name)}</button><span class="table-secondary">${escapeHtml(store.address)}</span></td><td>${escapeHtml(chain?.name || '—')}</td><td>${escapeHtml(zone?.name || '—')}</td><td>${escapeHtml(locality?.name || '—')}</td><td>${manager ? personLink(manager.id) : '<span class="muted">Sin asignar</span>'}</td><td>${statusPill(getStoreStatus(store))}</td><td class="table-actions">${actionIconButton('open-store', store.id, 'eye', `Ver ${store.name}`)}</td></tr>`;
  }).join('');
  const managerFilterChip = state.storeFilter === 'no-manager' ? `<span class="filter-chip">Sin persona STORE-MANAGER<button type="button" data-action="remove-manager-filter" aria-label="Quitar filtro de persona STORE-MANAGER">${icon('close')}</button></span>` : '';
  return `<section aria-labelledby="page-title">${renderPageHeading('Tiendas', headingDescription)}<section class="surface-card"><div class="toolbar-row"><div class="toolbar-row__left"><label class="search-field">${icon('search')}<input type="search" value="${escapeHtml(state.storeSearch)}" data-search-key="campaign-stores" aria-label="Buscar tiendas" placeholder="Buscar tienda, cadena, zona, localidad o persona que asigna"></label></div><div class="toolbar-row__right">${filterChip}${managerFilterChip}<span class="table-count" data-visible-count>${rows.length} tiendas</span></div></div><div class="table-wrap"><table class="data-table data-table--dense"><thead><tr><th>Tienda</th><th>Cadena</th><th>Zona</th><th>Localidad</th><th>Persona que asigna</th><th>Turnos</th><th><span class="visually-hidden">Acciones</span></th></tr></thead><tbody>${tableRows}<tr data-empty-results hidden><td colspan="7" class="table-empty">No hay tiendas que coincidan con la búsqueda.</td></tr></tbody></table></div></section></section>`;
}

function renderCollaboratorsPage() {
  const collaborators = getVisibleCollaborators();
  const cards = collaborators.map(collaborator => {
    const locality = getLocality(collaborator.localityId);
    const stores = getVisibleStores().filter(store => store.collaboratorId === collaborator.id);
    const volunteerCount = collaborator.groups.reduce((total, group) => total + group.volunteerCount, 0);
    return `<article class="collaborator-card"><div class="collaborator-card__top"><div><span class="eyebrow">Entidad colaboradora</span><h2>${escapeHtml(collaborator.name)}</h2><span class="collaborator-card__address">${escapeHtml(collaborator.address)} · ${escapeHtml(locality?.name || '')}</span></div><span class="tag tag--blue">${stores.length} tiendas</span></div><div class="collaborator-card__stats"><div class="collaborator-stat"><strong>${stores.length}</strong><span>Tiendas</span></div><div class="collaborator-stat"><strong>${collaborator.contactIds.length}</strong><span>Contactos</span></div><div class="collaborator-stat"><strong>${collaborator.groups.length}</strong><span>Grupos · ${volunteerCount} voluntarios</span></div></div><div class="stack-sm"><div><span class="mini-label">Responsable</span><div>${personLink(collaborator.managerId)}</div></div><div><span class="mini-label">Contactos</span><div>${collaborator.contactIds.map(personId => personLink(personId)).join(' · ')}</div></div></div><div class="collaborator-card__footer"><div class="collaborator-card__actions"><button class="button button--quiet button--small" type="button" data-action="collaborator-contact-form" data-id="${escapeHtml(collaborator.id)}" ${isCampaignReadonly() ? 'disabled' : ''}>${icon('plus')} Crear contacto</button><button class="button button--quiet button--small" type="button" data-action="collaborator-contact-form" data-id="${escapeHtml(collaborator.id)}" data-mode="edit" ${isCampaignReadonly() ? 'disabled' : ''}>${icon('edit')} Modificar</button><button class="button button--quiet button--small" type="button" data-action="collaborator-assign-manager" data-id="${escapeHtml(collaborator.id)}" ${isCampaignReadonly() ? 'disabled' : ''}>Asignar responsable</button></div><button class="text-button" type="button" data-action="collaborator-groups" data-id="${escapeHtml(collaborator.id)}">Ver grupos ${icon('arrow')}</button></div></article>`;
  }).join('');
  return `<section aria-labelledby="page-title">${renderPageHeading('Colaboradores', 'Entidades colaboradoras, contactos y grupos')}${cards ? `<div class="collaborator-grid">${cards}</div>` : '<div class="empty-state">No hay entidades en el ámbito de esta campaña.</div>'}</section>`;
}

function renderIncidentsPage() {
  const incidents = getVisibleIncidents().filter(incident => state.incidentFilter === 'all' || incident.status === state.incidentFilter);
  const filters = [['all', 'Todas'], ['pending', 'Pendientes'], ['answered', 'Respondidas']].map(([filter, label]) => `<button type="button" data-action="incident-filter" data-filter="${filter}" class="${state.incidentFilter === filter ? 'is-active' : ''}" aria-pressed="${state.incidentFilter === filter}">${label}</button>`).join('');
  const cards = incidents.map(incident => renderIncidentCard(incident)).join('');
  return `<section aria-labelledby="page-title">${renderPageHeading('Incidencias', 'Seguimiento y respuesta de incidencias')}<section class="surface-card"><div class="toolbar-row"><div><p class="section-description">${getVisibleIncidents().length} incidencias en ${escapeHtml(getCampaign().name)}</p></div><div class="incident-filter" role="group" aria-label="Filtrar incidencias">${filters}</div></div><div class="incident-list">${cards || '<div class="empty-state">No hay incidencias con este filtro.</div>'}</div></section></section>`;
}

function renderIncidentCard(incident) {
  const reporter = getPerson(incident.reportedBy);
  const store = getStore(incident.storeId);
  const responded = incident.status === 'answered';
  const status = responded ? statusPill('complete', 'Respondida') : statusPill('pending', 'Pendiente');
  const response = incident.response ? `<div class="incident-response"><strong>Única respuesta · ${personLink(incident.response.by)} · ${escapeHtml(formatDateOnly(incident.response.date))}</strong><p>${escapeHtml(incident.response.text)}</p></div>` : '';
  return `<article class="incident-card ${responded ? 'incident-card--answered' : ''}"><div class="incident-card__icon">${icon(responded ? 'check' : 'alert')}</div><div class="incident-card__content"><span class="eyebrow">${escapeHtml(incident.type)} · ${escapeHtml(formatDateOnly(incident.date))}</span><h2>${escapeHtml(incident.title)}</h2><p>${escapeHtml(incident.description)}</p><div class="incident-card__meta"><span>Informada por ${personLink(reporter?.id)}</span><span>Tienda: <button class="table-link" type="button" data-action="open-store" data-id="${escapeHtml(store?.id || '')}">${escapeHtml(store?.name || '—')}</button></span></div>${response}</div><div class="incident-card__actions">${status}${!responded ? `<button class="button button--outline button--small" type="button" data-action="open-incident" data-id="${escapeHtml(incident.id)}" ${isCampaignReadonly() ? 'disabled' : ''}>Responder</button>` : `<button class="button button--quiet button--small" type="button" data-action="open-incident" data-id="${escapeHtml(incident.id)}">Ver detalle</button>`}</div></article>`;
}

function renderCampaignStatusPage() {
  const counts = getCampaignStatusCounts();
  const scopeLabel = `${getVisibleStores().length} tiendas visibles · ${getCampaign().name}`;
  const cards = [
    { key: 'no-manager', icon: 'users', count: counts.unassignedStores.length, label: 'Tiendas sin STORE-MANAGER', hint: 'Revisar persona que asigna turnos', status: 'pending' },
    { key: 'incidents', icon: 'alert', count: counts.pendingIncidents.length, label: 'Incidencias sin respuesta', hint: 'Requieren atención', status: 'pending' },
    { key: 'conflicts', icon: 'warning', count: counts.conflicts.length, label: 'Conflictos activos', hint: 'Asignaciones y horarios', status: 'conflict' },
    { key: 'pending-periods', icon: 'clock', count: counts.pendingPeriods.length, label: 'Franjas pendientes', hint: 'Con cobertura por completar', status: 'pending' },
    { key: 'complete-periods', icon: 'check', count: counts.completePeriods.length, label: 'Franjas completas', hint: 'Todas las tiendas cubiertas', status: 'complete' }
  ];
  return `<section aria-labelledby="page-title">${renderPageHeading('Estado de campaña', scopeLabel)}<div class="status-cards">${cards.map(card => `<button class="status-card status-card--${card.status}" type="button" data-action="status-counter" data-counter="${card.key}" aria-label="${escapeHtml(card.label)}: ${card.count}. Abrir detalle"><span class="status-card__top"><span class="status-card__icon">${icon(card.icon)}</span>${statusPill(card.status, statusText(card.status))}</span><strong class="status-card__count">${card.count}</strong><span class="status-card__label">${escapeHtml(card.label)}</span><span class="status-card__hint">${escapeHtml(card.hint)}</span></button>`).join('')}</div><section class="surface-card" style="margin-top:16px"><div class="toolbar-row"><div><h2>Alcance visible</h2><p class="section-description">Los contadores respetan las zonas y tiendas asignadas al perfil ${escapeHtml(state.activeRole)}.</p></div><span class="tag tag--blue">${escapeHtml(scopeLabel)}</span></div><div class="entity-detail-grid"><div class="entity-detail-card"><span>Personas que asignan turnos</span><strong>${getVisibleStores().filter(store => store.managerId).length} de ${getVisibleStores().length} tiendas</strong></div><div class="entity-detail-card"><span>Incidencias respondidas</span><strong>${getVisibleIncidents().filter(incident => incident.status === 'answered').length}</strong></div><div class="entity-detail-card"><span>Franjas por revisar</span><strong>${counts.pendingPeriods.length + counts.conflicts.length} pendientes o con conflicto</strong></div></div></section></section>`;
}

function renderAdminContent() {
  switch (state.adminView) {
    case 'stores': return renderAdminStores();
    case 'chains': return renderAdminChains();
    case 'collaborators': return renderAdminCollaborators();
    case 'zones': return renderAdminZones();
    case 'audit': return renderAdminAudit();
    case 'users': return renderAdminUsers();
    case 'campaigns': return renderAdminCampaigns();
    default: return renderAdminSummary();
  }
}

function renderAdminSummary() {
  const summaries = [
    { id: 'stores', label: 'Tiendas', count: DATA.stores.length, hint: 'Gestión de establecimientos', icon: 'store' },
    { id: 'chains', label: 'Cadenas', count: DATA.chains.length, hint: 'Tiendas agrupadas por cadena', icon: 'building' },
    { id: 'collaborators', label: 'Colaboradores', count: DATA.collaborators.length, hint: 'Entidades y grupos', icon: 'users' },
    { id: 'zones', label: 'Zonas', count: DATA.zones.length, hint: 'Coordinación territorial', icon: 'map' },
    { id: 'audit', label: 'Auditoría', count: DATA.audit.length, hint: 'Eventos de ejemplo · solo lectura', icon: 'list' },
    { id: 'users', label: 'Usuarios', count: DATA.people.length, hint: 'Personas y roles', icon: 'users' },
    { id: 'campaigns', label: 'Campañas', count: DATA.campaigns.length, hint: 'Campañas y tipos', icon: 'calendar' }
  ];
  return `<section aria-labelledby="page-title">${renderPageHeading('Resumen de administración', 'Gestión global · independiente de la campaña seleccionada')}<div class="admin-summary-grid">${summaries.map(item => `<a class="admin-summary-card" href="#admin-${item.id}" data-action="admin-nav" data-view="${item.id}"><span class="admin-summary-card__icon">${icon(item.icon)}</span><span class="admin-summary-card__body"><strong>${escapeHtml(item.label)}</strong><span class="admin-summary-card__count">${item.count}</span><span class="admin-summary-card__hint">${escapeHtml(item.hint)}</span></span></a>`).join('')}</div><div class="callout" style="margin-top:15px">La administración es un contexto global. La campaña elegida en el dashboard no limita estas secciones.</div></section>`;
}

function renderAdminStores() {
  const rows = DATA.stores.map(store => {
    const chain = getChain(store.chainId);
    const zone = getZone(store.zoneId);
    const locality = getLocality(store.localityId);
    const manager = getPerson(store.managerId);
    const searchText = `${store.name} ${chain?.name || ''} ${zone?.name || ''} ${locality?.name || ''} ${manager?.name || ''}`.toLocaleLowerCase('es');
    return `<tr data-searchable data-search-text="${escapeHtml(searchText)}"><td><button class="table-link table-primary" type="button" data-action="open-store" data-id="${escapeHtml(store.id)}">${escapeHtml(store.name)}</button><span class="table-secondary">${escapeHtml(store.address)}</span></td><td>${chain ? `<button class="table-link" type="button" data-action="open-chain" data-id="${escapeHtml(chain.id)}">${escapeHtml(chain.name)}</button>` : '—'}</td><td>${zone ? escapeHtml(zone.name) : '—'}</td><td>${escapeHtml(locality?.name || '—')}</td><td>${manager ? personLink(manager.id) : '<span class="muted">Sin asignar</span>'}</td><td class="table-actions">${actionIconButton('edit-admin-item', store.id, 'edit', `Editar ${store.name}`, 'data-entity="store"')}${actionIconButton('delete-admin-item', store.id, 'trash', `Borrar ${store.name}`, 'data-entity="store"')}</td></tr>`;
  }).join('');
  return renderAdminTablePage('Tiendas', 'Gestión global de tiendas y horarios', 'admin-stores', 'Buscar por tienda, cadena, zona o localidad', `<button class="button button--primary button--small" type="button" data-action="create-admin-item" data-entity="store">${icon('plus')} Crear tienda</button>`, ['Tienda', 'Cadena', 'Zona', 'Localidad', 'Persona que asigna', 'Acciones'], rows, 6);
}

function renderAdminChains() {
  const rows = DATA.chains.map(chain => {
    const stores = DATA.stores.filter(store => store.chainId === chain.id);
    const searchText = `${chain.name} ${chain.code} ${stores.map(store => store.name).join(' ')}`.toLocaleLowerCase('es');
    return `<tr data-searchable data-search-text="${escapeHtml(searchText)}"><td><button class="table-link table-primary" type="button" data-action="open-chain" data-id="${escapeHtml(chain.id)}">${escapeHtml(chain.name)}</button></td><td><span class="tag">${escapeHtml(chain.code)}</span></td><td>${stores.length}</td><td><button class="button button--outline button--small" type="button" data-action="open-chain" data-id="${escapeHtml(chain.id)}">Abrir tiendas</button></td><td class="table-actions">${actionIconButton('edit-admin-item', chain.id, 'edit', `Editar ${chain.name}`, 'data-entity="chain"')}${actionIconButton('delete-admin-item', chain.id, 'trash', `Borrar ${chain.name}`, 'data-entity="chain"')}</td></tr>`;
  }).join('');
  return renderAdminTablePage('Cadenas', 'Cadenas comerciales y tiendas asociadas', 'admin-chains', 'Buscar cadena, código o tienda', `<button class="button button--primary button--small" type="button" data-action="create-admin-item" data-entity="chain">${icon('plus')} Crear cadena</button>`, ['Cadena', 'Código', 'Tiendas', 'Listado', 'Acciones'], rows, 5);
}

function renderAdminCollaborators() {
  const rows = DATA.collaborators.map(collaborator => {
    const stores = DATA.stores.filter(store => store.collaboratorId === collaborator.id);
    const locality = getLocality(collaborator.localityId);
    const manager = getPerson(collaborator.managerId);
    const volunteerCount = collaborator.groups.reduce((total, group) => total + group.volunteerCount, 0);
    const searchText = `${collaborator.name} ${collaborator.address} ${locality?.name || ''} ${manager?.name || ''}`.toLocaleLowerCase('es');
    return `<tr data-searchable data-search-text="${escapeHtml(searchText)}"><td><button class="table-link table-primary" type="button" data-action="open-collaborator" data-id="${escapeHtml(collaborator.id)}">${escapeHtml(collaborator.name)}</button><span class="table-secondary">${escapeHtml(collaborator.address)} · ${escapeHtml(locality?.name || '')}</span></td><td>${stores.length}</td><td>${collaborator.contactIds.map(personId => personLink(personId)).join(', ')}</td><td>${personLink(collaborator.managerId)}</td><td>${collaborator.groups.length} grupos · ${volunteerCount} voluntarios</td><td class="table-actions">${actionIconButton('edit-admin-item', collaborator.id, 'edit', `Editar ${collaborator.name}`, 'data-entity="collaborator"')}${actionIconButton('delete-admin-item', collaborator.id, 'trash', `Borrar ${collaborator.name}`, 'data-entity="collaborator"')}</td></tr>`;
  }).join('');
  return renderAdminTablePage('Colaboradores', 'Entidades colaboradoras, contactos y grupos', 'admin-collaborators', 'Buscar entidad, localidad o responsable', `<button class="button button--primary button--small" type="button" data-action="create-admin-item" data-entity="collaborator">${icon('plus')} Crear colaborador</button>`, ['Entidad', 'Tiendas', 'Contactos', 'Responsable', 'Grupos', 'Acciones'], rows, 6);
}

function renderAdminZones() {
  const rows = DATA.zones.map(zone => {
    const stores = DATA.stores.filter(store => store.zoneId === zone.id);
    const coordinatorNames = zone.coordinatorIds.map(personId => getPerson(personId)?.name || '').join(' ');
    const searchText = `${zone.name} ${zone.code} ${coordinatorNames} ${stores.map(store => store.name).join(' ')}`.toLocaleLowerCase('es');
    return `<tr data-searchable data-search-text="${escapeHtml(searchText)}"><td><button class="table-link table-primary" type="button" data-action="open-admin-zone" data-id="${escapeHtml(zone.id)}">${escapeHtml(zone.name)}</button><span class="table-secondary">${escapeHtml(zone.code)}</span></td><td>${stores.length}</td><td>${zone.coordinatorIds.map(personId => personLink(personId)).join(', ') || '<span class="muted">Sin asignar</span>'}</td><td><button class="button button--outline button--small" type="button" data-action="open-admin-zone" data-id="${escapeHtml(zone.id)}">Ver tiendas</button></td><td class="table-actions">${actionIconButton('edit-admin-item', zone.id, 'edit', `Editar ${zone.name}`, 'data-entity="zone"')}${actionIconButton('delete-admin-item', zone.id, 'trash', `Borrar ${zone.name}`, 'data-entity="zone"')}</td></tr>`;
  }).join('');
  return renderAdminTablePage('Zonas', 'Zonas globales y asignaciones de coordinación', 'admin-zones', 'Buscar zona, código, tienda o coordinador', `<button class="button button--primary button--small" type="button" data-action="create-admin-item" data-entity="zone">${icon('plus')} Crear zona</button>`, ['Zona', 'Tiendas', 'Coordinación', 'Listado', 'Acciones'], rows, 5);
}

function renderAdminAudit() {
  const rows = DATA.audit.map(event => {
    const actor = getPerson(event.actorId);
    const searchText = `${actor?.name || ''} ${event.action} ${event.entity} ${event.detail} ${event.date}`.toLocaleLowerCase('es');
    return `<tr data-searchable data-search-text="${escapeHtml(searchText)}"><td>${escapeHtml(formatAuditDate(event.date))}</td><td>${personLink(event.actorId)}</td><td>${escapeHtml(event.action)}</td><td>${escapeHtml(event.entity)}</td><td>${escapeHtml(event.detail)}</td></tr>`;
  }).join('');
  const note = `<div class="admin-section-note">${icon('shield')} Eventos de ejemplo y solo lectura. El modelo de datos no define una tabla de auditoría.</div>`;
  return `${renderPageHeading('Auditoría', 'Consulta de eventos de ejemplo · solo lectura')}${note}<section class="surface-card"><div class="toolbar-row"><label class="search-field">${icon('search')}<input type="search" value="${escapeHtml(state.searches['admin-audit'] || '')}" data-search-key="admin-audit" aria-label="Buscar eventos de auditoría" placeholder="Buscar persona, acción o entidad"></label><span class="tag admin-audit-badge">Solo lectura</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Persona</th><th>Acción</th><th>Entidad</th><th>Detalle</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="table-empty">No hay eventos de ejemplo.</td></tr>'}<tr data-empty-results hidden><td colspan="5" class="table-empty">No hay eventos con esa búsqueda.</td></tr></tbody></table></div></section>`;
}

function renderAdminUsers() {
  const rows = DATA.people.map(person => {
    const searchText = `${person.name} ${person.title} ${person.email} ${person.roles.join(' ')}`.toLocaleLowerCase('es');
    return `<tr data-searchable data-search-text="${escapeHtml(searchText)}"><td>${personLink(person.id)}<span class="table-secondary">${escapeHtml(person.email)}</span></td><td>${escapeHtml(person.title)}</td><td><div class="role-list">${personRoles(person)}</div></td><td class="table-actions">${actionIconButton('open-contact', person.id, 'eye', `Ver ficha de ${person.name}`)}${actionIconButton('edit-admin-item', person.id, 'edit', `Editar rol de ${person.name}`, 'data-entity="user"')}</td></tr>`;
  }).join('');
  const note = `<div class="admin-section-note">${icon('users')} El rol se puede editar en una simulación. Las asignaciones a campañas y zonas no se gestionan aquí.</div>`;
  return `${renderPageHeading('Usuarios', 'Personas no voluntarias y roles del catálogo')}${note}<section class="surface-card"><div class="toolbar-row"><label class="search-field">${icon('search')}<input type="search" value="${escapeHtml(state.searches['admin-users'] || '')}" data-search-key="admin-users" aria-label="Buscar usuarios" placeholder="Buscar nombre, correo o rol"></label><button class="button button--primary button--small" type="button" data-action="create-admin-item" data-entity="user">${icon('plus')} Crear usuario</button><span class="table-count" data-visible-count>${DATA.people.length} usuarios de ejemplo</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Persona</th><th>Descripción</th><th>Roles</th><th>Acciones</th></tr></thead><tbody>${rows}<tr data-empty-results hidden><td colspan="4" class="table-empty">No hay usuarios con esa búsqueda.</td></tr></tbody></table></div></section>`;
}

function renderAdminCampaigns() {
  const rows = DATA.campaigns.map(campaign => {
    const type = DATA.campaignTypes.find(item => item.id === campaign.campaignTypeId);
    const searchText = `${campaign.name} ${type?.name || ''} ${campaign.status}`.toLocaleLowerCase('es');
    return `<tr data-searchable data-search-text="${escapeHtml(searchText)}"><td><button class="table-link table-primary" type="button" data-action="open-campaign-detail" data-id="${escapeHtml(campaign.id)}">${escapeHtml(campaign.name)}</button></td><td>${escapeHtml(type?.name || '—')}</td><td>${escapeHtml(formatDateOnly(campaign.startDate))} – ${escapeHtml(formatDateOnly(campaign.endDate))}</td><td>${statusPill(campaign.status === 'En curso' ? 'complete' : 'neutral', campaign.status)}</td><td>${campaign.storeIds.length}</td><td class="table-actions">${actionIconButton('open-campaign-detail', campaign.id, 'eye', `Ver ${campaign.name}`)}${actionIconButton('edit-admin-item', campaign.id, 'edit', `Editar ${campaign.name}`, 'data-entity="campaign"')}${actionIconButton('delete-admin-item', campaign.id, 'trash', `Borrar ${campaign.name}`, 'data-entity="campaign"')}</td></tr>`;
  }).join('');
  const actions = `<button class="button button--outline button--small" type="button" data-action="create-campaign-type">${icon('plus')} Crear tipo</button><button class="button button--primary button--small" type="button" data-action="start-campaign-wizard">${icon('plus')} Crear campaña</button>`;
  return renderAdminTablePage('Campañas', 'Campañas y tipos · gestión global', 'admin-campaigns', 'Buscar campaña o tipo', actions, ['Campaña', 'Tipo', 'Rango de fechas', 'Estado', 'Tiendas', 'Acciones'], rows, 6);
}

function renderAdminTablePage(title, description, searchKey, placeholder, actions, headings, rows, colspan) {
  const headerRow = headings.map(heading => `<th>${escapeHtml(heading)}</th>`).join('');
  const bodyRows = rows || `<tr><td colspan="${colspan}" class="table-empty">No hay resultados de ejemplo.</td></tr>`;
  return `${renderPageHeading(title, description)}<section class="surface-card"><div class="admin-action-bar"><div class="admin-action-bar__left"><label class="search-field">${icon('search')}<input type="search" value="${escapeHtml(state.searches[searchKey] || '')}" data-search-key="${escapeHtml(searchKey)}" aria-label="${escapeHtml(placeholder)}" placeholder="${escapeHtml(placeholder)}"></label></div><div class="admin-action-bar__right">${actions}</div></div><div class="table-wrap"><table class="data-table"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}<tr data-empty-results hidden><td colspan="${colspan}" class="table-empty">No hay resultados con esa búsqueda.</td></tr></tbody></table></div></section>`;
}

function renderPopover() {
  queryElement('#popover-root')?.remove();
  queryElements('[data-action="toggle-account"]').forEach(button => button.setAttribute('aria-expanded', String(state.popover === 'account')));
  queryElements('[data-action="toggle-notifications"]').forEach(button => button.setAttribute('aria-expanded', String(state.popover === 'notifications')));
  if (!state.popover || !state.userId) {
    return;
  }
  const root = document.createElement('div');
  root.id = 'popover-root';
  root.innerHTML = `<div class="popover-layer"><button class="popover-backdrop" type="button" data-action="close-popover" aria-label="Cerrar menú"></button>${state.popover === 'notifications' ? renderNotificationsPopover() : renderAccountPopover()}</div>`;
  queryElement('#application').append(root);
}

function getVisibleNotifications() {
  const visibleStoreIds = new Set(getVisibleStores().map(store => store.id));
  const visibleIncidentIds = new Set(getVisibleIncidents().map(incident => incident.id));
  return DATA.notifications.filter(notification => notification.campaignId === state.campaignId && (notification.type === 'shift' || notification.type === 'store' && visibleStoreIds.has(notification.storeId) || notification.type === 'incident' && visibleIncidentIds.has(notification.incidentId)));
}

function renderNotificationsPopover() {
  const notifications = getVisibleNotifications();
  const list = notifications.length ? notifications.map(notification => {
    const notificationIcon = notification.type === 'incident' ? 'alert' : notification.type === 'store' ? 'store' : 'calendar';
    const date = notification.date || DATA.today;
    return `<button class="notification-item" type="button" data-action="open-notification" data-id="${escapeHtml(notification.id)}"><span class="notification-icon">${icon(notificationIcon)}</span><span class="notification-item__copy"><strong>${escapeHtml(notification.title)}</strong><span>${escapeHtml(notification.description)}</span><small>${escapeHtml(formatDateOnly(date))} · ${escapeHtml(getCampaign().name)}</small></span></button>`;
  }).join('') : '<div class="empty-state" style="min-height:100px"><strong>Sin novedades</strong><p>No hay notificaciones para esta campaña.</p></div>';
  return `<section class="popover-card" aria-label="Notificaciones"><div class="popover-card__heading"><strong>Novedades</strong><span>${notifications.length} de ejemplo</span></div>${list}</section>`;
}

function renderAccountPopover() {
  const user = getCurrentUser();
  return `<section class="popover-card popover-card--account" aria-label="Menú de cuenta"><div class="account-menu-profile"><span class="avatar" aria-hidden="true">${escapeHtml(initials(user.name))}</span><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(state.activeRole)}</small></span></div><button class="account-menu-action" type="button" data-action="account-contact">${icon('users')} Ver ficha de contacto</button><button class="account-menu-action" type="button" data-action="logout">${icon('logout')} Cerrar sesión</button></section>`;
}

function renderModalStack() {
  const root = queryElement('#modal-root');
  if (!root) {
    return;
  }
  document.body.classList.toggle('has-modal', state.modalStack.length > 0);
  root.innerHTML = state.modalStack.map((modal, index) => {
    const isTop = index === state.modalStack.length - 1;
    const body = typeof modal.body === 'function' ? modal.body() : modal.body || '';
    const footer = typeof modal.footer === 'function' ? modal.footer() : modal.footer || '';
    const sizeClass = modal.size ? `modal-dialog--${escapeHtml(modal.size)}` : '';
    return `<div class="modal-layer" style="--modal-depth:${index}" data-modal-layer="${index}" aria-hidden="${isTop ? 'false' : 'true'}" ${isTop ? '' : 'inert'}><section class="modal-dialog ${sizeClass}" role="dialog" aria-modal="${isTop ? 'true' : 'false'}" aria-labelledby="modal-title-${index}" tabindex="-1"><header class="modal-header"><div>${modal.eyebrow ? `<span class="modal-header__eyebrow">${escapeHtml(modal.eyebrow)}</span>` : ''}<h2 class="modal-header__title" id="modal-title-${index}">${escapeHtml(modal.title || 'Detalle')}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Cerrar ventana">${icon('close')}</button></header><div class="modal-body">${body}</div>${footer ? `<footer class="modal-footer">${footer}</footer>` : ''}</section></div>`;
  }).join('');
  prepareFormControls(root);
  queryElements('.modal-body [data-search-key]', root).forEach(input => applySearchToInput(input));
}

function prepareFormControls(root) {
  queryElements('input:not([name])', root).forEach(input => {
    const wizardSlot = input.dataset.wizardDate ? `${input.dataset.wizardDate}-${input.dataset.slotIndex}-${input.dataset.slotProp}` : '';
    const controlId = input.dataset.searchKey || input.dataset.storeId || input.dataset.chainId || input.dataset.zoneId || wizardSlot || input.id || input.type;
    input.name = `mock-${controlId}`;
  });
  queryElements('input:not([autocomplete]):not([type="checkbox"]):not([type="radio"])', root).forEach(input => input.setAttribute('autocomplete', 'off'));
  queryElements('input[type="email"], input[name="code"], input[name$="-code"]', root).forEach(input => input.setAttribute('spellcheck', 'false'));
  queryElements('input[placeholder], textarea[placeholder]', root).forEach(input => {
    const placeholder = input.getAttribute('placeholder').trimEnd();
    if (!placeholder.endsWith('…')) {
      input.setAttribute('placeholder', `${placeholder.replace(/[.]+$/, '')}…`);
    }
  });
}

function syncUrlState() {
  if (!state.userId) {
    return;
  }
  const parameters = new URLSearchParams();
  if (state.adminMode) {
    parameters.set('admin', state.adminView);
    Object.entries(state.searches).forEach(([key, value]) => {
      if (value) {
        parameters.set(`search-${key}`, value);
      }
    });
  } else {
    parameters.set('campaign', state.campaignId);
    parameters.set('view', state.campaignView);
    if (state.campaignView === 'calendar') {
      parameters.set('mode', state.calendarMode);
      parameters.set('date', formatDateKey(state.calendarDate));
    }
    if (state.zoneFilter) {
      parameters.set('zone', state.zoneFilter);
    }
    if (state.storeFilter) {
      parameters.set('store-filter', state.storeFilter);
    }
    if (state.storeSearch) {
      parameters.set('store-search', state.storeSearch);
    }
    if (state.incidentFilter !== 'all') {
      parameters.set('incident-filter', state.incidentFilter);
    }
  }
  const hash = `#${parameters.toString()}`;
  try {
    window.history.replaceState(null, '', hash);
  } catch {
    window.location.hash = hash;
  }
}

function openModal(modal) {
  state.modalStack.push({ ...modal, returnFocus: document.activeElement });
  renderModalStack();
  const topDialog = queryElement('.modal-layer:last-child .modal-dialog');
  const focusTarget = topDialog?.querySelector('[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])');
  if (focusTarget) {
    focusTarget.focus({ preventScroll: true });
  } else {
    topDialog?.focus({ preventScroll: true });
  }
}

function closeTopModal() {
  if (!state.modalStack.length) {
    return;
  }
  const closingModal = state.modalStack.pop();
  renderModalStack();
  if (state.modalStack.length) {
    queryElement('.modal-layer:last-child .modal-dialog')?.focus({ preventScroll: true });
  } else if (closingModal.returnFocus?.isConnected) {
    closingModal.returnFocus.focus({ preventScroll: true });
  }
}

function openTutorial() {
  state.tutorialStep = 0;
  state.tutorialKey = state.adminMode ? `admin:${state.adminView}` : `campaign:${state.campaignView}`;
  openModal({
    title: 'Ayuda de esta vista',
    size: 'compact',
    eyebrow: state.adminMode ? 'Administración' : getCampaign().name,
    body: renderTutorialBody,
    footer: renderTutorialFooter
  });
}

function getTutorialSteps() {
  const [context, view] = String(state.tutorialKey || '').split(':');
  const tutorialGroup = context === 'admin' ? TUTORIALS.admin : TUTORIALS.campaign;
  return tutorialGroup[view] || tutorialGroup.home;
}

function renderTutorialBody() {
  const steps = getTutorialSteps();
  const currentStep = steps[state.tutorialStep] || steps[0];
  const dots = steps.map((step, index) => `<span class="${index === state.tutorialStep ? 'is-active' : ''}" aria-hidden="true"></span>`).join('');
  return `<div class="tutorial-progress"><span class="mini-label">Paso ${state.tutorialStep + 1} de ${steps.length}</span><span class="tutorial-progress__dots">${dots}</span></div><h3 class="tutorial-step-title">${escapeHtml(currentStep[0])}</h3><p class="tutorial-step-copy">${escapeHtml(currentStep[1])}</p>`;
}

function renderTutorialFooter() {
  const steps = getTutorialSteps();
  const lastStep = state.tutorialStep >= steps.length - 1;
  return `<div class="modal-footer__left"><button class="button button--quiet button--small" type="button" data-action="tutorial-prev" ${state.tutorialStep === 0 ? 'disabled' : ''}>Anterior</button></div><div class="modal-footer__right">${lastStep ? `<button class="button button--primary button--small" type="button" data-action="close-modal">Listo</button>` : `<button class="button button--primary button--small" type="button" data-action="tutorial-next">Siguiente ${icon('arrow')}</button>`}</div>`;
}

function openContactModal(personId) {
  const person = getPerson(personId);
  if (!person) {
    return;
  }
  openModal({
    title: 'Ficha de contacto',
    size: 'compact',
    eyebrow: 'Persona no voluntaria',
    body: `<div class="contact-profile"><span class="avatar" aria-hidden="true">${escapeHtml(initials(person.name))}</span><div><h3>${escapeHtml(person.name)}</h3><p>${escapeHtml(person.title)}</p></div></div><div class="role-list" style="margin-bottom:15px">${personRoles(person)}</div><div class="contact-lines"><div class="contact-line">${icon('mail')}<a href="mailto:${escapeHtml(person.email)}">${escapeHtml(person.email)}</a></div><div class="contact-line">${icon('phone')}<a href="tel:${escapeHtml(person.phone.replace(/\s/g, ''))}">${escapeHtml(person.phone)}</a></div></div>${person.collaboratorId ? `<hr class="modal-divider"><div class="contact-line">${icon('building')}<span>Entidad: ${escapeHtml(getCollaborator(person.collaboratorId)?.name || '—')}</span></div>` : ''}`,
    footer: `<span class="modal-footer__left muted" style="font-size:9px">Datos ficticios de contacto</span><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function openStoreModal(storeId) {
  const store = getStore(storeId);
  if (!store) {
    return;
  }
  state.storeCalendarMode = 'week';
  state.storeCalendarDate = state.campaignId === 'spring' ? parseDate(getCampaign().startDate) : parseDate(DATA.today);
  openModal({
    title: store.name,
    size: 'wide',
    eyebrow: 'Ficha de tienda',
    body: () => renderStoreModalBody(store.id),
    footer: () => renderStoreModalFooter(store.id)
  });
}

function renderStoreModalBody(storeId) {
  const store = getStore(storeId);
  if (!store) {
    return '<div class="empty-state"><strong>Tienda no disponible</strong></div>';
  }
  const chain = getChain(store.chainId);
  const zone = getZone(store.zoneId);
  const locality = getLocality(store.localityId);
  const collaborator = getCollaborator(store.collaboratorId);
  const manager = getPerson(store.managerId);
  const managerBlock = manager ? `<div class="contact-line">${icon('users')}<span>${personLink(manager.id)} <span class="role-pill" translate="no">STORE-MANAGER</span><small class="table-secondary">Persona que asigna turnos · ${escapeHtml(collaborator?.name || '')}</small></span></div>` : `<div class="callout callout--warning">Esta tienda todavía no tiene persona STORE-MANAGER asignada.</div>`;
  const scheduleDays = SHORT_DAY_NAMES.map((day, index) => `<div class="schedule-day"><strong>${day}</strong><span>${index === 6 ? '10:00–18:00' : `09:00–${escapeHtml(store.updatedClosing || store.closing)}`}</span></div>`).join('');
  const slotRows = getCampaign().slotTemplate.map(slot => {
    const detail = getStoreShift(store, slot.id, state.storeCalendarDate);
    const summary = getPeriodSummary(state.storeCalendarDate, slot.id, store.id);
    const conflict = summary.conflicts[0];
    const statusAction = conflict ? `<button class="text-button" type="button" data-action="open-conflict" data-id="${escapeHtml(conflict.id)}">Ver conflicto</button>` : '';
    return `<div class="store-shift-row"><div><strong>${escapeHtml(slot.label)} · ${escapeHtml(slot.start)}–${escapeHtml(slot.end)}</strong><span>Cobertura ${detail.assigned}/${detail.required}${detail.missing ? ` · faltan ${detail.missing}` : ''}</span></div><div>${statusPill(detail.status)}${statusAction}</div></div>`;
  }).join('');
  return `<div class="store-modal-layout"><div class="store-details-column"><div class="store-detail-heading"><div><h3>${escapeHtml(store.name)}</h3><p>${escapeHtml(store.address)} · ${escapeHtml(locality?.name || '')}</p></div>${statusPill(getStoreStatus(store))}</div><div class="store-data-grid"><div class="store-data-item"><span>Cadena</span><strong>${escapeHtml(chain?.name || '—')}</strong></div><div class="store-data-item"><span>Zona</span><strong>${escapeHtml(zone?.name || '—')}</strong></div><div class="store-data-item"><span>Entidad colaboradora</span><strong>${escapeHtml(collaborator?.name || '—')}</strong></div><div class="store-data-item"><span>Localidad</span><strong>${escapeHtml(locality?.name || '—')}</strong></div><div class="store-data-item"><span>Cajas de cobro</span><strong>${store.checkoutShelves}</strong></div><div class="store-data-item"><span>Horario actualizado</span><strong>09:00–${escapeHtml(store.updatedClosing || store.closing)}</strong></div></div><section class="store-schedule-card"><h3>Horario de apertura semanal</h3><div class="schedule-week">${scheduleDays}</div>${store.updatedClosing !== store.closing ? '<p class="form-helper">Horario actualizado para esta campaña; sustituye el cierre anterior.</p>' : ''}</section><section class="store-schedule-card"><h3>Persona que asigna turnos</h3>${managerBlock}</section><section class="store-schedule-card"><div class="toolbar-row" style="margin-bottom:8px"><h3>Turnos de la fecha</h3><span class="tag">${escapeHtml(formatShortDate(state.storeCalendarDate))}</span></div><div class="store-shift-list">${slotRows}</div></section></div><div class="store-calendar-column"><div class="calendar-toolbar"><div class="calendar-toolbar__left"><h3 class="calendar-toolbar__title">Calendario de tienda</h3><span class="calendar-range">${escapeHtml(calendarRangeLabel(state.storeCalendarDate, state.storeCalendarMode))}</span></div><div class="calendar-toolbar__right"><div class="calendar-range-nav"><button class="icon-button" type="button" data-action="store-calendar-prev" aria-label="Periodo anterior">${icon('chevronLeft')}</button><button class="icon-button" type="button" data-action="store-calendar-next" aria-label="Periodo siguiente">${icon('chevronRight')}</button></div><button class="button button--quiet button--small" type="button" data-action="store-calendar-today">Volver a hoy</button></div></div><div class="toolbar-row" style="margin-bottom:9px"><span class="mini-label">Vista</span><div class="segmented-control" role="group" aria-label="Vista del calendario de tienda">${['day', 'week', 'month'].map(mode => `<button type="button" data-action="store-calendar-mode" data-mode="${mode}" class="${state.storeCalendarMode === mode ? 'is-active' : ''}" aria-pressed="${state.storeCalendarMode === mode}">${mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}</button>`).join('')}</div></div>${state.storeCalendarMode === 'month' ? renderCalendarMonth(state.storeCalendarDate, store.id) : renderCalendarTimeline({ date: state.storeCalendarDate, mode: state.storeCalendarMode, storeId: store.id, compact: true })}</div></div>`;
}

function renderStoreModalFooter(storeId) {
  const readonly = isCampaignReadonly();
  return `<div class="modal-footer__left"><span class="muted" style="font-size:9px">${escapeHtml(getCampaign().name)} · acciones simuladas</span></div><div class="modal-footer__right">${isAdmin() ? `<button class="button button--quiet button--small" type="button" data-action="edit-admin-item" data-entity="store" data-id="${escapeHtml(storeId)}" ${readonly ? 'disabled' : ''}>${icon('edit')} Editar ficha</button>` : ''}<button class="button button--outline button--small" type="button" data-action="simulate-store-assignment" data-id="${escapeHtml(storeId)}" ${readonly ? 'disabled' : ''}>Simular asignación</button><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>`;
}

function calendarRangeLabel(date, mode) {
  if (mode === 'month') {
    return formatMonthTitle(date);
  }
  if (mode === 'day') {
    return formatLongDate(date);
  }
  return formatDateRange(startOfWeek(date), addDays(startOfWeek(date), 6));
}

function openShiftModal(dateKey, slotId, storeId = null) {
  const slot = getCampaign().slotTemplate.find(item => item.id === slotId);
  if (!slot) {
    return;
  }
  state.shiftSort = 'order';
  openModal({
    title: storeId ? `${getStore(storeId)?.name || 'Tienda'} · ${slot.label.toLocaleLowerCase('es')}` : `Franja de ${slot.label.toLocaleLowerCase('es')}`,
    size: 'xl',
    eyebrow: formatLongDate(parseDate(dateKey)),
    body: () => renderShiftModalBody(dateKey, slotId, storeId),
    footer: () => `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Cobertura calculada sobre las tiendas visibles del perfil ${escapeHtml(state.activeRole)}.</span></div><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function renderShiftModalBody(dateKey, slotId, storeId = null) {
  const slot = getCampaign().slotTemplate.find(item => item.id === slotId);
  const summary = getPeriodSummary(dateKey, slotId, storeId);
  const details = [...(summary.details || [])];
  if (state.shiftSort === 'status') {
    const statusRank = { conflict: 0, pending: 1, complete: 2, neutral: 3 };
    details.sort((first, second) => statusRank[first.status] - statusRank[second.status] || first.store.name.localeCompare(second.store.name, 'es'));
  }
  const rows = details.map(detail => {
    const chain = getChain(detail.store.chainId);
    return `<article class="shift-store-row"><div class="shift-store-row__name"><button class="table-link" type="button" data-action="open-store" data-id="${escapeHtml(detail.store.id)}"><strong>${escapeHtml(detail.store.name)}</strong></button><small>${escapeHtml(chain?.name || '')} · ${escapeHtml(getZone(detail.store.zoneId)?.name || '')}</small></div><span class="shift-fraction" aria-label="Cobertura ${detail.assigned} de ${detail.required}">${detail.assigned}/${detail.required}</span>${statusPill(detail.status)}<button class="button button--quiet button--small" type="button" data-action="open-store" data-id="${escapeHtml(detail.store.id)}">Abrir tienda</button></article>`;
  }).join('');
  const conflicts = summary.conflicts.map(conflict => `<button class="calendar-issue calendar-issue--conflict" type="button" data-action="open-conflict" data-id="${escapeHtml(conflict.id)}">${icon('warning')}<span><strong>${escapeHtml(conflict.type === 'same-person' ? 'Persona asignada a dos tiendas' : 'Asignación fuera de horario')}</strong><small>${escapeHtml(conflict.reason)}</small></span></button>`).join('');
  const pendingCount = details.filter(detail => detail.status === 'pending').length;
  return `<div class="shift-popup-toolbar"><div><p class="modal-copy">${escapeHtml(slot.start)}–${escapeHtml(slot.end)} · ${summary.assigned}/${summary.required} turnos asignados · ${pendingCount} tiendas pendientes · ${summary.conflicts.length} conflictos</p></div><div class="segmented-control" role="group" aria-label="Ordenar tiendas"><button type="button" data-action="shift-sort" data-sort="order" class="${state.shiftSort === 'order' ? 'is-active' : ''}" aria-pressed="${state.shiftSort === 'order'}">Orden de Tiendas</button><button type="button" data-action="shift-sort" data-sort="status" class="${state.shiftSort === 'status' ? 'is-active' : ''}" aria-pressed="${state.shiftSort === 'status'}">Por estado</button></div></div>${conflicts ? `<div class="stack-sm" style="margin-bottom:13px">${conflicts}</div>` : ''}<div class="shift-store-list">${rows || '<div class="empty-state"><strong>Sin tiendas participantes</strong><p>Esta franja está fuera de campaña o no hay tiendas visibles.</p></div>'}</div>`;
}

function openConflictModal(conflictId) {
  const conflict = getVisibleConflicts().find(item => item.id === conflictId);
  if (!conflict) {
    return;
  }
  openModal({
    title: conflict.type === 'same-person' ? 'Conflicto de asignación' : 'Conflicto de horario',
    size: 'xl',
    eyebrow: `${getCampaign().name} · ${formatLongDate(parseDate(conflict.date))}`,
    body: () => renderConflictModalBody(conflict),
    footer: `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Alias anónimo para proteger la identidad de la persona voluntaria.</span></div><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function renderConflictModalBody(conflict) {
  const collaborator = getCollaborator(conflict.collaboratorId);
  const slot = getCampaign().slotTemplate.find(item => item.id === conflict.slotId);
  const storeRows = conflict.storeIds.map((storeId, index) => {
    const store = getStore(storeId);
    const assigningPersonId = conflict.assignedByIds[index];
    return `<div class="day-detail-item"><button type="button" data-action="open-store" data-id="${escapeHtml(storeId)}">${escapeHtml(store?.name || 'Tienda')}</button><span>Persona que asigna: ${personLink(assigningPersonId)}</span></div>`;
  }).join('');
  const title = conflict.type === 'same-person' ? 'La misma persona en dos tiendas' : 'Turno fuera del horario actualizado';
  const reasonLabel = conflict.type === 'same-person' ? 'Misma franja y entidad colaboradora' : `Cierre efectivo ${getStore(conflict.storeIds[0])?.updatedClosing || 'actualizado'}`;
  return `<section class="conflict-detail"><h3>${icon('warning')} ${escapeHtml(title)}</h3><p>${escapeHtml(conflict.reason)}</p><div class="conflict-detail__meta"><div><strong>Entidad colaboradora</strong>${escapeHtml(collaborator?.name || '—')}</div><div><strong>Franja</strong>${escapeHtml(slot?.label || '—')} · ${escapeHtml(slot?.start || '')}–${escapeHtml(slot?.end || '')}</div><div><strong>Persona afectada</strong>${escapeHtml(conflict.personAlias)}</div><div><strong>Motivo</strong>${escapeHtml(reasonLabel)}</div></div></section><hr class="modal-divider"><h3 style="margin:0 0 9px;font-size:11px">Tiendas y personas que asignan</h3><div class="stack-sm">${storeRows}</div><div class="callout callout--conflict" style="margin-top:13px">El conflicto se deriva de las asignaciones y de los horarios actualizados. No se muestra ningún dato identificable de voluntarios.</div>`;
}

function openIncidentModal(incidentId) {
  const incident = getVisibleIncidents().find(item => item.id === incidentId);
  if (!incident) {
    return;
  }
  const answered = incident.status === 'answered';
  openModal({
    title: answered ? 'Incidencia respondida' : 'Responder incidencia',
    size: 'xl',
    eyebrow: `${incident.type} · ${formatDateOnly(incident.date)}`,
    body: () => renderIncidentModalBody(incident),
    footer: answered ? `<div class="modal-footer__left"><span class="status-pill status-pill--complete">Respondida · solo lectura</span></div><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>` : `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Una incidencia admite una respuesta como máximo.</span></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button><button class="button button--primary button--small" type="submit" form="incident-response-form" ${isCampaignReadonly() ? 'disabled' : ''}>Enviar respuesta simulada</button></div>`
  });
}

function renderIncidentModalBody(incident) {
  const reporter = getPerson(incident.reportedBy);
  const store = getStore(incident.storeId);
  const answer = incident.response ? `<section class="incident-response"><strong>Única respuesta · ${personLink(incident.response.by)} · ${escapeHtml(formatDateOnly(incident.response.date))}</strong><p>${escapeHtml(incident.response.text)}</p></section>` : '';
  const form = incident.status === 'pending' ? `<form id="incident-response-form" data-form="incident-response"><div class="form-field form-field--full"><label for="incident-response-text">Respuesta</label><textarea id="incident-response-text" name="response" required placeholder="Escribe una respuesta para esta incidencia…" ${isCampaignReadonly() ? 'disabled' : ''}></textarea><p class="form-helper">La respuesta se simula y no se guarda.</p></div></form>` : '';
  return `<div class="entity-detail-grid"><div class="entity-detail-card"><span>Estado</span><strong>${incident.status === 'answered' ? 'Respondida' : 'Pendiente'}</strong></div><div class="entity-detail-card"><span>Fecha</span><strong>${escapeHtml(formatDateOnly(incident.date))}</strong></div><div class="entity-detail-card"><span>Tienda</span><strong><button class="table-link" type="button" data-action="open-store" data-id="${escapeHtml(store?.id || '')}">${escapeHtml(store?.name || '—')}</button></strong></div></div><div class="stack-sm" style="margin-top:14px"><div><span class="mini-label">${escapeHtml(incident.title)}</span><p class="modal-copy" style="margin-top:5px">${escapeHtml(incident.description)}</p></div><div><span class="mini-label">Informada por</span><div>${personLink(reporter?.id)}</div></div></div>${answer}${isCampaignReadonly() && incident.status === 'pending' ? '<div class="callout" style="margin-top:12px">La campaña está finalizada; no se pueden simular cambios desde esta vista.</div>' : ''}${form}`;
}

function openCollaboratorGroups(collaboratorId) {
  const collaborator = getCollaborator(collaboratorId);
  if (!collaborator) {
    return;
  }
  const groupRows = collaborator.groups.map(group => `<div class="shift-store-row"><div class="shift-store-row__name"><strong>${escapeHtml(group.name)}</strong><small>Líder: ${personLink(group.leaderId)}</small></div><span class="shift-fraction">${group.volunteerCount} voluntarios</span><span class="tag">Grupo</span></div>`).join('');
  openModal({
    title: 'Grupos de colaborador',
    size: 'xl',
    eyebrow: collaborator.name,
    body: `<p class="modal-copy">La entidad tiene ${collaborator.groups.length} grupos. Se muestra el conteo de voluntarios, sin nombres ni datos de contacto.</p><div class="shift-store-list">${groupRows}</div>`,
    footer: `<div class="modal-footer__left">${personLink(collaborator.managerId)} <span class="mini-label">Responsable</span></div><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function openCollaboratorContactForm(collaboratorId, mode = 'create') {
  const collaborator = getCollaborator(collaboratorId);
  const title = mode === 'edit' ? 'Modificar contacto' : 'Crear contacto';
  const contact = getPerson(collaborator?.contactIds[0]);
  openModal({
    title,
    size: 'compact',
    eyebrow: collaborator?.name || 'Entidad colaboradora',
    body: `${mode === 'edit' && contact ? personDirectory([contact], 'Ficha de contacto') : ''}<p class="modal-copy">Formulario de ejemplo. No se guarda ningún dato de contacto.</p><form id="contact-simulation-form" data-form="mock-change" data-change-label="${escapeHtml(title)}"><div class="form-field"><label for="contact-name">Nombre y apellidos</label><input id="contact-name" name="name" type="text" value="${mode === 'edit' ? escapeHtml(contact?.name || '') : ''}" placeholder="Nombre de contacto…" required></div><div class="form-field"><label for="contact-email">Correo electrónico</label><input id="contact-email" name="email" type="email" value="${mode === 'edit' ? escapeHtml(contact?.email || '') : ''}" placeholder="contacto@entidad.test…" required></div><div class="form-field"><label for="contact-phone">Teléfono</label><input id="contact-phone" name="phone" type="tel" value="${mode === 'edit' ? escapeHtml(contact?.phone || '') : ''}" placeholder="600 000 000…"></div></form>`,
    footer: `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Simulación sin persistencia</span></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button><button class="button button--primary button--small" type="submit" form="contact-simulation-form">${mode === 'edit' ? 'Simular cambio' : 'Simular creación'}</button></div>`
  });
}

function openCollaboratorManagerForm(collaboratorId) {
  const collaborator = getCollaborator(collaboratorId);
  const managers = DATA.people.filter(person => person.roles.includes('COLLABORATOR-MANAGER'));
  openModal({
    title: 'Asignar responsable',
    size: 'compact',
    eyebrow: collaborator?.name || 'Entidad colaboradora',
    body: `<p class="modal-copy">El responsable de una entidad usa el rol exacto COLLABORATOR-MANAGER. La asignación es simulada.</p><form id="manager-simulation-form" data-form="mock-change" data-change-label="Asignación de responsable"><div class="form-field"><label for="collaborator-manager">Responsable</label><select id="collaborator-manager" name="manager" required>${managers.map(person => `<option value="${escapeHtml(person.id)}" ${person.id === collaborator?.managerId ? 'selected' : ''}>${escapeHtml(person.name)} · COLLABORATOR-MANAGER</option>`).join('')}</select></div>${personDirectory(managers, 'Fichas de contacto disponibles')}</form>`,
    footer: `<div class="modal-footer__left"><span class="muted" style="font-size:9px">No se guardan cambios</span></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button><button class="button button--primary button--small" type="submit" form="manager-simulation-form">Simular asignación</button></div>`
  });
}

function openAdminZoneModal(zoneId) {
  const zone = getZone(zoneId);
  if (!zone) {
    return;
  }
  if (!state.zoneSelections[zoneId]) {
    state.zoneSelections[zoneId] = DATA.stores.filter(store => store.zoneId === zoneId).map(store => store.id);
  }
  openModal({
    title: `Zona ${zone.name}`,
    size: 'xl',
    eyebrow: `Administración global · ${zone.code}`,
    body: () => renderAdminZoneModalBody(zoneId),
    footer: () => `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Marcar tiendas es una simulación de asignación.</span></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="open-admin-stores">Abrir listado completo</button><button class="button button--primary button--small" type="button" data-action="save-zone-selection" data-id="${escapeHtml(zoneId)}">Simular cambios</button><button class="button button--outline button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function renderAdminZoneModalBody(zoneId) {
  const zone = getZone(zoneId);
  if (!zone) {
    return '<div class="empty-state"><strong>Zona no disponible</strong></div>';
  }
  const assignedStoreIds = new Set(state.zoneSelections[zoneId] || []);
  const stores = DATA.stores.map(store => `<label class="wizard-store-row"><input type="checkbox" data-action="zone-store-toggle" data-zone-id="${escapeHtml(zoneId)}" data-store-id="${escapeHtml(store.id)}" ${assignedStoreIds.has(store.id) ? 'checked' : ''}><span><strong>${escapeHtml(store.name)}</strong></span><small>${escapeHtml(getChain(store.chainId)?.name || '')} · ${escapeHtml(getZone(store.zoneId)?.name || '')}</small></label>`).join('');
  return `<p class="modal-copy">Marca o desmarca tiendas para una simulación de pertenencia a ${escapeHtml(zone.name)}. Los datos originales no cambian.</p><div class="entity-detail-grid" style="margin-bottom:13px"><div class="entity-detail-card"><span>Código</span><strong>${escapeHtml(zone.code)}</strong></div><div class="entity-detail-card"><span>Coordinación</span><strong>${zone.coordinatorIds.map(personId => personLink(personId)).join(', ') || 'Sin asignar'}</strong></div><div class="entity-detail-card"><span>Tiendas marcadas</span><strong>${assignedStoreIds.size}</strong></div></div><div class="table-wrap"><div class="stack-sm" style="padding:6px">${stores}</div></div>`;
}

function openChainModal(chainId) {
  const chain = getChain(chainId);
  if (!chain) {
    return;
  }
  openModal({
    title: chain.name,
    size: 'xl',
    eyebrow: `Cadena · ${chain.code}`,
    body: () => renderChainModalBody(chainId),
    footer: () => `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Listado global · acciones simuladas</span></div><div class="modal-footer__right"><button class="button button--outline button--small" type="button" data-action="edit-admin-item" data-entity="chain" data-id="${escapeHtml(chainId)}">${icon('edit')} Editar cadena</button><button class="button button--primary button--small" type="button" data-action="create-store-for-chain" data-id="${escapeHtml(chainId)}">${icon('plus')} Crear tienda</button><button class="button button--quiet button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function renderChainModalBody(chainId) {
  const chain = getChain(chainId);
  if (!chain) {
    return '<div class="empty-state"><strong>Cadena no disponible</strong></div>';
  }
  const stores = DATA.stores.filter(store => store.chainId === chainId);
  const rows = stores.map(store => `<tr><td><button class="table-link table-primary" type="button" data-action="open-store" data-id="${escapeHtml(store.id)}">${escapeHtml(store.name)}</button><span class="table-secondary">${escapeHtml(store.address)}</span></td><td>${escapeHtml(getZone(store.zoneId)?.name || '—')}</td><td>${escapeHtml(getLocality(store.localityId)?.name || '—')}</td><td>${personLink(store.managerId)}</td><td class="table-actions">${actionIconButton('open-store', store.id, 'eye', `Ver ${store.name}`)}${actionIconButton('edit-admin-item', store.id, 'edit', `Editar ${store.name}`, 'data-entity="store"')}${actionIconButton('delete-admin-item', store.id, 'trash', `Borrar ${store.name}`, 'data-entity="store"')}</td></tr>`).join('');
  return `<div class="entity-detail-grid" style="margin-bottom:13px"><div class="entity-detail-card"><span>Nombre</span><strong>${escapeHtml(chain.name)}</strong></div><div class="entity-detail-card"><span>Código</span><strong>${escapeHtml(chain.code)}</strong></div><div class="entity-detail-card"><span>Tiendas</span><strong>${stores.length}</strong></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Tienda</th><th>Zona</th><th>Localidad</th><th>Persona que asigna</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function openCollaboratorAdminModal(collaboratorId) {
  const collaborator = getCollaborator(collaboratorId);
  if (!collaborator) {
    return;
  }
  openModal({
    title: collaborator.name,
    size: 'xl',
    eyebrow: 'Entidad colaboradora · administración global',
    body: () => renderCollaboratorAdminModalBody(collaboratorId),
    footer: () => `<div class="modal-footer__left"><span class="muted" style="font-size:9px">${collaborator.groups.length} grupos · ${collaborator.groups.reduce((total, group) => total + group.volunteerCount, 0)} voluntarios representados solo por conteo</span></div><div class="modal-footer__right"><button class="button button--outline button--small" type="button" data-action="collaborator-contact-form" data-id="${escapeHtml(collaboratorId)}">${icon('plus')} Crear contacto</button><button class="button button--quiet button--small" type="button" data-action="collaborator-contact-form" data-id="${escapeHtml(collaboratorId)}" data-mode="edit">Modificar contacto</button><button class="button button--quiet button--small" type="button" data-action="collaborator-assign-manager" data-id="${escapeHtml(collaboratorId)}">Asignar responsable</button><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function renderCollaboratorAdminModalBody(collaboratorId) {
  const collaborator = getCollaborator(collaboratorId);
  const locality = getLocality(collaborator.localityId);
  const stores = DATA.stores.filter(store => store.collaboratorId === collaboratorId);
  const contacts = collaborator.contactIds.map(personId => `<div class="contact-line">${icon('users')} ${personLink(personId)} <span class="muted">${escapeHtml(getPerson(personId)?.title || '')}</span></div>`).join('');
  const groups = collaborator.groups.map(group => `<div class="day-detail-item"><span>${escapeHtml(group.name)} · líder ${personLink(group.leaderId)}</span><strong>${group.volunteerCount} voluntarios</strong></div>`).join('');
  const storeRows = stores.map(store => `<tr><td><button class="table-link" type="button" data-action="open-store" data-id="${escapeHtml(store.id)}">${escapeHtml(store.name)}</button></td><td>${escapeHtml(getChain(store.chainId)?.name || '')}</td><td>${escapeHtml(getZone(store.zoneId)?.name || '')}</td><td>${personLink(store.managerId)}</td></tr>`).join('');
  return `<div class="store-modal-layout"><div class="stack-md"><div class="entity-detail-grid"><div class="entity-detail-card"><span>Dirección</span><strong>${escapeHtml(collaborator.address)}</strong></div><div class="entity-detail-card"><span>Localidad</span><strong>${escapeHtml(locality?.name || '—')}</strong></div><div class="entity-detail-card"><span>Tiendas</span><strong>${stores.length}</strong></div></div><section class="store-schedule-card"><h3>Responsable · COLLABORATOR-MANAGER</h3>${personLink(collaborator.managerId)}</section><section class="store-schedule-card"><h3>Contactos de la entidad</h3><div class="stack-sm">${contacts}</div></section><section class="store-schedule-card"><h3>Grupos</h3>${groups}</section></div><section class="store-schedule-card"><h3>Tiendas colaboradoras</h3><div class="table-wrap" style="margin-top:9px"><table class="data-table"><thead><tr><th>Tienda</th><th>Cadena</th><th>Zona</th><th>Persona que asigna</th></tr></thead><tbody>${storeRows}</tbody></table></div></section></div>`;
}

function openCampaignDetailModal(campaignId) {
  const campaign = getCampaign(campaignId);
  const type = DATA.campaignTypes.find(item => item.id === campaign.campaignTypeId);
  const stores = campaign.storeIds.map(storeId => getStore(storeId)).filter(Boolean);
  const slots = campaign.slotTemplate.map(slot => `<div class="store-shift-row"><div><strong>${escapeHtml(slot.label)}</strong><span>${escapeHtml(slot.start)}–${escapeHtml(slot.end)}</span></div><span class="tag">Diaria</span></div>`).join('');
  openModal({
    title: campaign.name,
    size: 'xl',
    eyebrow: 'Campaña global · ficha de consulta',
    body: `<div class="entity-detail-grid"><div class="entity-detail-card"><span>Tipo de campaña</span><strong>${escapeHtml(type?.name || '—')}</strong></div><div class="entity-detail-card"><span>Rango</span><strong>${escapeHtml(formatDateOnly(campaign.startDate))} – ${escapeHtml(formatDateOnly(campaign.endDate))}</strong></div><div class="entity-detail-card"><span>Estado</span><strong>${escapeHtml(campaign.status)}</strong></div><div class="entity-detail-card"><span>Tiendas</span><strong>${stores.length}</strong></div><div class="entity-detail-card"><span>Entidades</span><strong>${new Set(stores.map(store => store.collaboratorId)).size}</strong></div><div class="entity-detail-card"><span>Franjas diarias</span><strong>${campaign.slotTemplate.length}</strong></div></div><hr class="modal-divider"><div class="store-modal-layout"><section><h3 style="margin:0 0 8px;font-size:11px">Franjas</h3><div class="store-shift-list">${slots}</div></section><section><h3 style="margin:0 0 8px;font-size:11px">Tiendas participantes</h3><div class="shift-store-list">${stores.map(store => `<div class="shift-store-row"><div class="shift-store-row__name"><strong>${escapeHtml(store.name)}</strong><small>${escapeHtml(getChain(store.chainId)?.name || '')} · ${escapeHtml(getZone(store.zoneId)?.name || '')}</small></div><span class="tag">Participa</span></div>`).join('')}</div></section></div>`,
    footer: `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Consulta global · la campaña no se modifica</span></div><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="close-modal">Cerrar</button></div>`
  });
}

function getAdminEntity(entity, entityId) {
  const collections = {
    store: DATA.stores,
    chain: DATA.chains,
    collaborator: DATA.collaborators,
    zone: DATA.zones,
    user: DATA.people,
    campaign: DATA.campaigns,
    campaignType: DATA.campaignTypes
  };
  return (collections[entity] || []).find(item => item.id === entityId) || null;
}

function getAdminEntityLabel(entity) {
  return ({ store: 'tienda', chain: 'cadena', collaborator: 'colaborador', zone: 'zona', user: 'usuario', campaign: 'campaña', campaignType: 'tipo de campaña' })[entity] || 'elemento';
}

function openAdminEntityForm(entity, entityId = null, mode = 'create', preselectedChainId = null) {
  const item = entityId ? getAdminEntity(entity, entityId) : null;
  const label = getAdminEntityLabel(entity);
  const actionLabel = mode === 'edit' ? 'Editar' : 'Crear';
  if (entity === 'store') {
    state.formChainId = preselectedChainId || item?.chainId || '';
  }
  openModal({
    title: `${actionLabel} ${label}`,
    size: 'xl',
    eyebrow: 'Simulación · no se guardan cambios',
    body: () => renderAdminEntityFormBody(entity, item, mode),
    footer: `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Formulario de demostración</span></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button><button class="button button--primary button--small" type="submit" form="admin-entity-form">${mode === 'edit' ? 'Simular edición' : 'Simular creación'}</button></div>`
  });
}

function renderAdminEntityFormBody(entity, item, mode) {
  const value = key => mode === 'edit' && item ? escapeHtml(item[key] ?? '') : '';
  const selectOptions = (items, selectedId, nameKey = 'name', blankLabel = 'Seleccionar') => `<option value="">${escapeHtml(blankLabel)}</option>${items.map(option => `<option value="${escapeHtml(option.id)}" ${option.id === selectedId ? 'selected' : ''}>${escapeHtml(option[nameKey])}</option>`).join('')}`;
  let fields = '';
  if (entity === 'store') {
    fields = `<div class="form-field"><label for="entity-name">Nombre de tienda</label><input id="entity-name" name="name" value="${value('name')}" required></div><div class="form-field"><label for="entity-chain">Cadena</label><select id="entity-chain" name="chain" required>${selectOptions(DATA.chains, state.formChainId || item?.chainId, 'name', 'Seleccionar cadena')}</select></div><div class="form-field"><label for="entity-zone">Zona</label><select id="entity-zone" name="zone">${selectOptions(DATA.zones, item?.zoneId, 'name', 'Sin zona')}</select></div><div class="form-field"><label for="entity-locality">Localidad</label><select id="entity-locality" name="locality" required>${selectOptions(DATA.localities, item?.localityId, 'name', 'Seleccionar localidad')}</select></div><div class="form-field form-field--full"><label for="entity-address">Dirección</label><input id="entity-address" name="address" value="${value('address')}" required></div><div class="form-field"><label for="entity-collaborator">Entidad colaboradora</label><select id="entity-collaborator" name="collaborator" required>${selectOptions(DATA.collaborators, item?.collaboratorId, 'name', 'Seleccionar entidad')}</select></div><div class="form-field"><label for="entity-manager">Persona que asigna turnos · STORE-MANAGER</label><select id="entity-manager" name="manager">${selectOptions(DATA.people.filter(person => person.roles.includes('STORE-MANAGER')), item?.managerId, 'name', 'Sin asignar')}</select></div><div class="form-field"><label for="entity-shelves">Cajas de cobro</label><input id="entity-shelves" name="checkoutShelves" type="number" min="0" value="${mode === 'edit' ? item.checkoutShelves : 2}" required></div><div class="form-field"><label for="entity-hours">Horario actualizado</label><input id="entity-hours" name="hours" value="${mode === 'edit' ? `${item.opening}–${item.updatedClosing || item.closing}` : '09:00–21:00'}"></div>`;
  } else if (entity === 'chain') {
    fields = `<div class="form-field"><label for="entity-name">Nombre de cadena</label><input id="entity-name" name="name" value="${value('name')}" required></div><div class="form-field"><label for="entity-code">Código</label><input id="entity-code" name="code" value="${value('code')}" required></div>`;
  } else if (entity === 'collaborator') {
    fields = `<div class="form-field"><label for="entity-name">Nombre de entidad</label><input id="entity-name" name="name" value="${value('name')}" required></div><div class="form-field"><label for="entity-locality">Localidad</label><select id="entity-locality" name="locality" required>${selectOptions(DATA.localities, item?.localityId, 'name', 'Seleccionar localidad')}</select></div><div class="form-field form-field--full"><label for="entity-address">Dirección</label><input id="entity-address" name="address" value="${value('address')}" required></div><div class="form-field form-field--full"><label for="entity-manager">Responsable · COLLABORATOR-MANAGER</label><select id="entity-manager" name="manager">${selectOptions(DATA.people.filter(person => person.roles.includes('COLLABORATOR-MANAGER')), item?.managerId, 'name', 'Sin asignar')}</select></div>`;
  } else if (entity === 'zone') {
    fields = `<div class="form-field"><label for="entity-name">Nombre de zona</label><input id="entity-name" name="name" value="${value('name')}" required></div><div class="form-field"><label for="entity-code">Código</label><input id="entity-code" name="code" value="${value('code')}" required></div><div class="form-field form-field--full"><label for="entity-coordinator">Coordinador</label><select id="entity-coordinator" name="coordinator">${selectOptions(DATA.people.filter(person => person.roles.includes('COORDINATOR')), item?.coordinatorIds?.[0], 'name', 'Sin asignar')}</select><p class="form-helper">Una persona COORDINATOR puede coordinar varias zonas.</p></div>`;
  } else if (entity === 'user') {
    const selectedRole = item?.roles?.[0] || '';
    fields = mode === 'edit' ? `<div class="form-field form-field--full"><label for="entity-user">Usuario</label><input id="entity-user" value="${escapeHtml(item?.name || '')}" readonly></div><div class="form-field form-field--full"><label for="entity-role">Rol</label><select id="entity-role" name="role">${ROLE_CATALOG.map(role => `<option value="${escapeHtml(role)}" translate="no" ${role === selectedRole ? 'selected' : ''}>${escapeHtml(role)}</option>`).join('')}</select></div>` : `<div class="form-field"><label for="entity-name">Nombre y apellidos</label><input id="entity-name" name="name" required></div><div class="form-field"><label for="entity-email">Correo electrónico</label><input id="entity-email" name="email" type="email" required></div><div class="form-field"><label for="entity-phone">Teléfono</label><input id="entity-phone" name="phone" type="tel"></div><div class="form-field"><label for="entity-role">Rol</label><select id="entity-role" name="role">${ROLE_CATALOG.map(role => `<option value="${escapeHtml(role)}" translate="no" ${role === 'COORDINATOR' ? 'selected' : ''}>${escapeHtml(role)}</option>`).join('')}</select></div>`;
    fields += '<div class="callout form-field--full">Las asignaciones a campañas y zonas no se gestionan en esta vista.</div>';
  } else if (entity === 'campaign') {
    fields = `<div class="form-field"><label for="entity-name">Nombre de campaña</label><input id="entity-name" name="name" value="${value('name')}" required></div><div class="form-field"><label for="entity-type">Tipo</label><select id="entity-type" name="type">${selectOptions(DATA.campaignTypes, item?.campaignTypeId, 'name', 'Seleccionar tipo')}</select></div><div class="form-field"><label for="entity-start">Fecha de inicio</label><input id="entity-start" name="startDate" type="date" value="${value('startDate')}" required></div><div class="form-field"><label for="entity-end">Fecha de fin</label><input id="entity-end" name="endDate" type="date" value="${value('endDate')}" required></div>`;
  } else if (entity === 'campaignType') {
    fields = `<div class="form-field form-field--full"><label for="entity-name">Nombre del tipo de campaña</label><input id="entity-name" name="name" value="${value('name')}" required></div>`;
  }
  if (entity === 'store') {
    fields += `<div class="form-field form-field--full">${personDirectory(DATA.people.filter(person => person.roles.includes('STORE-MANAGER')), 'Fichas de contacto de personas STORE-MANAGER')}</div>`;
  } else if (entity === 'collaborator') {
    fields += `<div class="form-field form-field--full">${personDirectory(DATA.people.filter(person => person.roles.includes('COLLABORATOR-MANAGER')), 'Fichas de contacto COLLABORATOR-MANAGER')}</div>`;
  } else if (entity === 'zone') {
    fields += `<div class="form-field form-field--full">${personDirectory(DATA.people.filter(person => person.roles.includes('COORDINATOR')), 'Fichas de contacto COORDINATOR')}</div>`;
  } else if (entity === 'user' && item) {
    fields += `<div class="form-field form-field--full">${personDirectory([item], 'Ficha de contacto')}</div>`;
  }
  return `<p class="modal-copy">${mode === 'edit' ? 'Revisa los campos y simula la edición.' : 'Completa el formulario para ver la confirmación de creación.'} La maqueta no persiste el resultado.</p><form id="admin-entity-form" data-form="mock-change" data-change-label="${escapeHtml(mode === 'edit' ? 'Edición de ' + getAdminEntityLabel(entity) : 'Creación de ' + getAdminEntityLabel(entity))}" class="modal-form-grid">${fields}</form>`;
}

function openDeleteConfirmation(entity, entityId) {
  const item = getAdminEntity(entity, entityId);
  if (!item) {
    return;
  }
  const label = getAdminEntityLabel(entity);
  const itemName = item.name || item.email || label;
  openModal({
    title: `Borrar ${label}`,
    size: 'compact',
    eyebrow: 'Confirmación requerida',
    body: `<div class="callout callout--warning">¿Confirmas que quieres borrar <strong>${escapeHtml(itemName)}</strong>? Esta acción es solo visual: no se eliminarán datos.</div>`,
    footer: `<div class="modal-footer__left"><span class="muted" style="font-size:9px">No se eliminará información</span></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button><button class="button button--danger button--small" type="button" data-action="confirm-delete">Confirmar borrado</button></div>`
  });
}

function startCampaignWizard() {
  const startDate = '2026-11-28';
  const endDate = '2026-12-02';
  state.wizardStep = 1;
  state.wizardError = '';
  state.wizardChainSearch = '';
  state.wizard = {
    name: 'Campaña de invierno',
    campaignTypeId: 'type-gr',
    startDate,
    endDate,
    dailySlots: createWizardDailySlots(startDate, endDate),
    selectedStoreIds: DATA.stores.map(store => store.id),
    coordinatorMode: 'reuse',
    coordinatorAssignments: { ...DATA.previousCoordinators },
    batchDimension: 'chain',
    batchGroupId: DATA.chains[0].id,
    batchCoordinatorId: '',
    confirmed: false
  };
  openModal({
    title: 'Asistente para crear campaña',
    size: 'xl',
    eyebrow: 'Administración · 5 pasos',
    body: renderWizardBody,
    footer: renderWizardFooter
  });
}

function createWizardDailySlots(startDate, endDate) {
  const dailySlots = {};
  const firstDate = parseDate(startDate);
  const lastDate = parseDate(endDate);
  for (let currentDate = firstDate; formatDateKey(currentDate) <= formatDateKey(lastDate); currentDate = addDays(currentDate, 1)) {
    dailySlots[formatDateKey(currentDate)] = [
      { label: 'Mañana', start: '10:00', end: '14:00' },
      { label: 'Tarde', start: '17:00', end: '21:00' }
    ];
  }
  return dailySlots;
}

function renderWizardBody() {
  const steps = WIZARD_STEP_NAMES.map((label, index) => {
    const stepNumber = index + 1;
    const status = stepNumber === state.wizardStep ? 'is-active' : stepNumber < state.wizardStep ? 'is-complete' : '';
    return `<div class="wizard-step ${status}"><span class="wizard-step__number">${stepNumber < state.wizardStep ? icon('check') : stepNumber}</span><span class="wizard-step__label">${escapeHtml(label)}</span></div>`;
  }).join('');
  const errorBanner = state.wizardError ? `<div class="wizard-error-banner" role="alert">${escapeHtml(state.wizardError)}</div>` : '';
  let content = '';
  if (state.wizardStep === 1) {
    content = renderWizardStepOne();
  } else if (state.wizardStep === 2) {
    content = renderWizardStepTwo();
  } else if (state.wizardStep === 3) {
    content = renderWizardStepThree();
  } else if (state.wizardStep === 4) {
    content = renderWizardStepFour();
  } else {
    content = renderWizardStepFive();
  }
  return `<div class="wizard-progress" aria-label="Paso ${state.wizardStep} de 5">${steps}</div>${errorBanner}${content}`;
}

function renderWizardStepOne() {
  const wizard = state.wizard;
  return `<form id="wizard-step-form" data-wizard-form="1" class="modal-form-grid"><div class="form-field form-field--full"><label for="wizard-name">Nombre de la campaña</label><input id="wizard-name" name="name" value="${escapeHtml(wizard.name)}" required></div><div class="form-field"><label for="wizard-type">Tipo de campaña</label><select id="wizard-type" name="campaignTypeId" required>${DATA.campaignTypes.map(type => `<option value="${escapeHtml(type.id)}" ${type.id === wizard.campaignTypeId ? 'selected' : ''}>${escapeHtml(type.name)}</option>`).join('')}</select></div><div class="form-field"><label for="wizard-start">Fecha de inicio</label><input id="wizard-start" name="startDate" type="date" value="${escapeHtml(wizard.startDate)}" required></div><div class="form-field"><label for="wizard-end">Fecha de fin</label><input id="wizard-end" name="endDate" type="date" value="${escapeHtml(wizard.endDate)}" required></div><div class="callout form-field--full">Al pasar al siguiente paso se preparan dos franjas de ejemplo para cada día. Podrás añadir o quitar cualquier cantidad.</div></form>`;
}

function renderWizardStepTwo() {
  const dates = Object.keys(state.wizard.dailySlots).sort();
  const days = dates.map(dateKey => {
    const slots = state.wizard.dailySlots[dateKey] || [];
    const slotRows = slots.map((slot, index) => `<div class="wizard-slot-row"><label>Nombre<input type="text" data-wizard-date="${escapeHtml(dateKey)}" data-slot-index="${index}" data-slot-prop="label" value="${escapeHtml(slot.label)}" required aria-label="Nombre de franja"></label><label>Inicio<input type="time" data-wizard-date="${escapeHtml(dateKey)}" data-slot-index="${index}" data-slot-prop="start" value="${escapeHtml(slot.start)}" required aria-label="Hora de inicio"></label><label>Fin<input type="time" data-wizard-date="${escapeHtml(dateKey)}" data-slot-index="${index}" data-slot-prop="end" value="${escapeHtml(slot.end)}" required aria-label="Hora de fin"></label><button class="icon-button" type="button" data-action="wizard-remove-slot" data-date="${escapeHtml(dateKey)}" data-index="${index}" aria-label="Quitar franja">${icon('close')}</button></div>`).join('');
    return `<section class="wizard-day-card"><div class="wizard-day-card__heading"><strong>${escapeHtml(formatLongDate(parseDate(dateKey)))}</strong><button class="button button--quiet button--small" type="button" data-action="wizard-add-slot" data-date="${escapeHtml(dateKey)}">${icon('plus')} Añadir franja</button></div>${slotRows || '<p class="form-helper">Este día no tiene franjas.</p>'}</section>`;
  }).join('');
  return `<form id="wizard-step-form" data-wizard-form="2"><p class="modal-copy">Configura la hora de inicio y fin de cada franja. Las franjas pueden variar por día.</p><div class="wizard-daily-grid">${days}</div></form>`;
}

function renderWizardStepThree() {
  const campaignStoreIds = DATA.stores.map(store => store.id);
  const search = state.wizardChainSearch.toLocaleLowerCase('es');
  const chainGroups = DATA.chains.map(chain => {
    const stores = DATA.stores.filter(store => campaignStoreIds.includes(store.id) && store.chainId === chain.id);
    const isChecked = stores.length > 0 && stores.every(store => state.wizard.selectedStoreIds.includes(store.id));
    const checkedCount = stores.filter(store => state.wizard.selectedStoreIds.includes(store.id)).length;
    const storeRows = stores.map(store => {
      const zone = getZone(store.zoneId);
      const isSelected = state.wizard.selectedStoreIds.includes(store.id);
      const searchText = `${store.name} ${zone?.name || ''}`.toLocaleLowerCase('es');
      return `<label class="wizard-store-row" data-searchable data-search-text="${escapeHtml(searchText)}"><input type="checkbox" data-action="wizard-store-toggle" data-store-id="${escapeHtml(store.id)}" ${isSelected ? 'checked' : ''}><span><strong>${escapeHtml(store.name)}</strong></span><small>${escapeHtml(zone?.name || '')} · ${escapeHtml(getLocality(store.localityId)?.name || '')}</small></label>`;
    }).join('');
    const visibleStores = stores.some(store => `${store.name} ${getZone(store.zoneId)?.name || ''}`.toLocaleLowerCase('es').includes(search));
    return visibleStores || !search ? `<details class="wizard-chain-group" open><summary>${escapeHtml(chain.name)} <span class="tag">${checkedCount}/${stores.length}</span></summary><label class="check-label" style="padding:8px 12px"><input type="checkbox" data-action="wizard-chain-toggle" data-chain-id="${escapeHtml(chain.id)}" ${isChecked ? 'checked' : ''} aria-label="Seleccionar toda la cadena ${escapeHtml(chain.name)}"><span>Seleccionar toda la cadena</span></label>${storeRows || '<p class="form-helper" style="padding:9px 12px">Sin tiendas en la selección.</p>'}</details>` : '';
  }).join('');
  return `<div><div class="toolbar-row"><div><p class="modal-copy">Selecciona tiendas individualmente o todas las tiendas de una cadena. La selección de cadena se deriva de sus tiendas.</p></div><label class="search-field">${icon('search')}<input type="search" value="${escapeHtml(state.wizardChainSearch)}" data-search-key="wizard-stores" aria-label="Buscar tiendas por cadena" placeholder="Buscar tienda o zona"></label></div><div class="stack-sm">${chainGroups || '<div class="no-results">No hay tiendas con esa búsqueda.</div>'}</div><p class="form-helper">${state.wizard.selectedStoreIds.length} tiendas seleccionadas.</p></div>`;
}

function renderWizardStepFour() {
  const stores = DATA.stores.filter(store => state.wizard.selectedStoreIds.includes(store.id));
  const coordinators = DATA.people.filter(person => person.roles.includes('COORDINATOR'));
  const coordinatorDirectory = personDirectory(coordinators, 'Fichas de contacto de coordinadores');
  const dimension = state.wizard.batchDimension;
  const batchGroups = dimension === 'chain' ? DATA.chains : DATA.zones;
  const selectedAssignments = stores.filter(store => state.wizard.coordinatorAssignments[store.id]).length;
  const batchControl = state.wizard.coordinatorMode === 'manual' ? `<div class="wizard-assignment-toolbar"><label class="mini-label" for="wizard-batch-dimension">Asignación por lote</label><select class="toolbar-select" id="wizard-batch-dimension" data-action="wizard-batch-dimension"><option value="chain" ${dimension === 'chain' ? 'selected' : ''}>Por cadena</option><option value="zone" ${dimension === 'zone' ? 'selected' : ''}>Por zona</option></select><select class="toolbar-select" data-action="wizard-batch-group" aria-label="Grupo para asignación por lote">${batchGroups.map(group => `<option value="${escapeHtml(group.id)}" ${group.id === state.wizard.batchGroupId ? 'selected' : ''}>${escapeHtml(group.name)}</option>`).join('')}</select><select class="toolbar-select" data-action="wizard-batch-coordinator" aria-label="Coordinador para asignación por lote"><option value="">Seleccionar COORDINATOR</option>${coordinators.map(person => `<option value="${escapeHtml(person.id)}" ${person.id === state.wizard.batchCoordinatorId ? 'selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select><button class="button button--outline button--small" type="button" data-action="wizard-apply-batch">Aplicar al grupo</button></div>` : `<div class="callout" style="margin-bottom:10px">Se reutilizan asignaciones de la campaña anterior solo para tiendas que participaron y tenían coordinador. Las tiendas nuevas quedan sin asignar.</div>`;
  const rows = stores.map(store => {
    const coordinatorId = state.wizard.coordinatorAssignments[store.id] || '';
    const isUnassigned = !coordinatorId;
    return `<div class="wizard-assignment-row ${isUnassigned ? 'is-unassigned' : ''}"><div class="wizard-assignment-store"><strong>${escapeHtml(store.name)}</strong><small>${escapeHtml(getChain(store.chainId)?.name || '')} · ${escapeHtml(getZone(store.zoneId)?.name || '')}</small></div><select data-action="wizard-coordinator" data-store-id="${escapeHtml(store.id)}" id="${isUnassigned && !stores.slice(0, stores.indexOf(store)).some(item => !state.wizard.coordinatorAssignments[item.id]) ? 'wizard-unassigned-first' : ''}" aria-label="Coordinador de ${escapeHtml(store.name)}"><option value="">Sin coordinador</option>${coordinators.map(person => `<option value="${escapeHtml(person.id)}" ${person.id === coordinatorId ? 'selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select>${isUnassigned ? `<span class="wizard-warning">${icon('warning')} Sin coordinador</span>` : `<span class="tag">${escapeHtml(getPerson(coordinatorId)?.name || '')}</span>`}</div>`;
  }).join('');
  return `<div><div class="toolbar-row"><div><p class="modal-copy">Asigna una persona con el rol COORDINATOR a cada tienda participante.</p></div><span class="tag ${selectedAssignments === stores.length ? 'tag--blue' : ''}">${selectedAssignments}/${stores.length} asignadas</span></div>${coordinatorDirectory}<div class="incident-filter" role="group" aria-label="Método de coordinación"><button type="button" data-action="wizard-coordinator-mode" data-mode="reuse" class="${state.wizard.coordinatorMode === 'reuse' ? 'is-active' : ''}" aria-pressed="${state.wizard.coordinatorMode === 'reuse'}">Reutilizar campaña anterior</button><button type="button" data-action="wizard-coordinator-mode" data-mode="manual" class="${state.wizard.coordinatorMode === 'manual' ? 'is-active' : ''}" aria-pressed="${state.wizard.coordinatorMode === 'manual'}">Asignación manual</button></div>${batchControl}<div class="table-wrap"><div>${rows || '<div class="empty-state"><strong>Selecciona tiendas</strong><p>Vuelve al paso anterior para elegir tiendas participantes.</p></div>'}</div></div></div>`;
}

function renderWizardStepFive() {
  const wizard = state.wizard;
  const type = DATA.campaignTypes.find(item => item.id === wizard.campaignTypeId);
  const selectedStores = DATA.stores.filter(store => wizard.selectedStoreIds.includes(store.id));
  const assignedCount = selectedStores.filter(store => wizard.coordinatorAssignments[store.id]).length;
  const dailySlotCount = Object.values(wizard.dailySlots).reduce((total, slots) => total + slots.length, 0);
  return `<div class="wizard-confirmation"><h2>Revisa la campaña antes de confirmar</h2><p><strong>Nombre:</strong> ${escapeHtml(wizard.name)}</p><p><strong>Tipo:</strong> ${escapeHtml(type?.name || '—')}</p><p><strong>Fechas:</strong> ${escapeHtml(formatDateOnly(wizard.startDate))} – ${escapeHtml(formatDateOnly(wizard.endDate))}</p><p><strong>Franjas:</strong> ${dailySlotCount} en ${Object.keys(wizard.dailySlots).length} días</p><p><strong>Tiendas participantes:</strong> ${selectedStores.length}</p><p><strong>Coordinadores asignados:</strong> ${assignedCount} de ${selectedStores.length}</p><p><strong>Método:</strong> ${wizard.coordinatorMode === 'reuse' ? 'Reutilización y ajustes de la campaña anterior' : 'Asignación manual'}</p></div><label class="check-label" style="margin-top:15px"><input type="checkbox" data-action="wizard-confirm-ack" ${wizard.confirmed ? 'checked' : ''}><span>Confirmo la revisión. Esta acción solo mostrará un aviso; no creará una campaña.</span></label>`;
}

function renderWizardFooter() {
  const step = state.wizardStep;
  if (step === 1) {
    return `<div class="modal-footer__left"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button></div><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="wizard-next">Siguiente ${icon('arrow')}</button></div>`;
  }
  if (step < 5) {
    return `<div class="modal-footer__left"><button class="button button--quiet button--small" type="button" data-action="wizard-previous">${icon('chevronLeft')} Anterior</button></div><div class="modal-footer__right"><button class="button button--primary button--small" type="button" data-action="wizard-next">Siguiente ${icon('arrow')}</button></div>`;
  }
  return `<div class="modal-footer__left"><button class="button button--quiet button--small" type="button" data-action="wizard-previous">${icon('chevronLeft')} Anterior</button></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button><button class="button button--primary button--small" type="button" data-action="wizard-confirm" ${state.wizard.confirmed ? '' : 'disabled'}>Confirmar campaña</button></div>`;
}

function captureWizardDailySlots() {
  const nextSlots = Object.fromEntries(Object.keys(state.wizard.dailySlots).map(dateKey => [dateKey, []]));
  queryElements('[data-wizard-date]').forEach(input => {
    const dateKey = input.dataset.wizardDate;
    const slotIndex = Number(input.dataset.slotIndex);
    const property = input.dataset.slotProp;
    nextSlots[dateKey] ||= [];
    nextSlots[dateKey][slotIndex] ||= { label: '', start: '', end: '' };
    nextSlots[dateKey][slotIndex][property] = input.value;
  });
  if (Object.keys(nextSlots).length) {
    state.wizard.dailySlots = nextSlots;
  }
}

function advanceWizard() {
  if (state.wizardStep === 1) {
    const form = queryElement('#wizard-step-form');
    if (!form?.reportValidity()) {
      return;
    }
    const formData = new FormData(form);
    const startDate = String(formData.get('startDate'));
    const endDate = String(formData.get('endDate'));
    if (startDate > endDate) {
      state.wizardError = 'La fecha de inicio debe ser anterior o igual a la fecha de fin.';
      renderModalStack();
      return;
    }
    const rangeChanged = startDate !== state.wizard.startDate || endDate !== state.wizard.endDate;
    state.wizard.name = String(formData.get('name')).trim();
    state.wizard.campaignTypeId = String(formData.get('campaignTypeId'));
    state.wizard.startDate = startDate;
    state.wizard.endDate = endDate;
    if (rangeChanged) {
      state.wizard.dailySlots = createWizardDailySlots(startDate, endDate);
    }
  } else if (state.wizardStep === 2) {
    const form = queryElement('#wizard-step-form');
    if (!form?.reportValidity()) {
      return;
    }
    captureWizardDailySlots();
    const invalidSlot = Object.values(state.wizard.dailySlots).flat().some(slot => slot.start >= slot.end || !slot.label.trim());
    if (invalidSlot) {
      state.wizardError = 'Cada franja necesita un nombre y una hora de fin posterior a la de inicio.';
      renderModalStack();
      return;
    }
  } else if (state.wizardStep === 3 && !state.wizard.selectedStoreIds.length) {
    state.wizardError = 'Selecciona al menos una tienda participante.';
    renderModalStack();
    return;
  } else if (state.wizardStep === 4) {
    const missingStore = DATA.stores.find(store => state.wizard.selectedStoreIds.includes(store.id) && !state.wizard.coordinatorAssignments[store.id]);
    if (missingStore) {
      state.wizardError = 'Asigna un COORDINATOR a cada tienda antes de continuar.';
      renderModalStack();
      const firstUnassigned = queryElement('#wizard-unassigned-first');
      firstUnassigned?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstUnassigned?.focus({ preventScroll: true });
      return;
    }
  }
  state.wizardError = '';
  state.wizardStep = Math.min(5, state.wizardStep + 1);
  renderModalStack();
}

function initializeWizardSlotsForRange() {
  const form = queryElement('#wizard-step-form');
  if (!form?.reportValidity()) {
    return false;
  }
  captureWizardDailySlots();
  return true;
}

function handleClick(event) {
  const modalLayer = event.target.closest('.modal-layer');
  if (modalLayer && event.target === modalLayer) {
    const topIndex = state.modalStack.length - 1;
    if (Number(modalLayer.dataset.modalLayer) === topIndex) {
      closeTopModal();
    }
    return;
  }
  const control = event.target.closest('[data-action]');
  if (!control) {
    return;
  }
  const { action } = control.dataset;
  if (control.tagName === 'A') {
    event.preventDefault();
  }
  switch (action) {
    case 'auth-tab':
      setAuthTab(control.dataset.tab);
      break;
    case 'login-as':
      startSession(control.dataset.role);
      break;
    case 'campaign-home':
      navigateCampaign('home');
      break;
    case 'campaign-nav':
      navigateCampaign(control.dataset.view);
      break;
    case 'open-admin':
      if (isAdmin()) {
        state.adminMode = true;
        state.adminView = 'summary';
        state.popover = null;
        state.modalStack = [];
        renderApp();
      }
      break;
    case 'back-to-campaign':
      state.adminMode = false;
      state.popover = null;
      state.modalStack = [];
      renderApp();
      break;
    case 'admin-nav':
      if (isAdmin()) {
        state.adminMode = true;
        state.adminView = control.dataset.view;
        state.popover = null;
        state.modalStack = [];
        renderApp();
      }
      break;
    case 'toggle-notifications':
      togglePopover('notifications');
      break;
    case 'toggle-account':
      togglePopover('account');
      break;
    case 'close-popover':
      state.popover = null;
      renderPopover();
      break;
    case 'account-contact':
      state.popover = null;
      renderPopover();
      openContactModal(state.userId);
      break;
    case 'logout':
      endSession();
      break;
    case 'open-tutorial':
      openTutorial();
      break;
    case 'tutorial-next':
      state.tutorialStep = Math.min(getTutorialSteps().length - 1, state.tutorialStep + 1);
      renderModalStack();
      break;
    case 'tutorial-prev':
      state.tutorialStep = Math.max(0, state.tutorialStep - 1);
      renderModalStack();
      break;
    case 'close-modal':
      closeTopModal();
      break;
    case 'calendar-mode':
      state.calendarMode = control.dataset.mode;
      if (state.calendarMode === 'day' && state.campaignView === 'home') {
        state.campaignView = 'calendar';
      }
      renderApp();
      break;
    case 'calendar-prev':
      moveCalendar(-1);
      renderApp();
      break;
    case 'calendar-next':
      moveCalendar(1);
      renderApp();
      break;
    case 'calendar-today':
      state.calendarDate = parseDate(DATA.today);
      renderApp();
      break;
    case 'open-calendar-day':
      state.calendarDate = parseDate(control.dataset.date);
      state.calendarMode = 'day';
      navigateCampaign('calendar');
      break;
    case 'open-store-calendar-day':
      state.storeCalendarDate = parseDate(control.dataset.date);
      state.storeCalendarMode = 'day';
      renderModalStack();
      break;
    case 'open-shift':
      openShiftModal(control.dataset.date, control.dataset.slot, control.dataset.storeId || null);
      break;
    case 'store-calendar-mode':
      state.storeCalendarMode = control.dataset.mode;
      renderModalStack();
      break;
    case 'store-calendar-prev':
      moveStoreCalendar(-1);
      renderModalStack();
      break;
    case 'store-calendar-next':
      moveStoreCalendar(1);
      renderModalStack();
      break;
    case 'store-calendar-today':
      state.storeCalendarDate = parseDate(DATA.today);
      renderModalStack();
      break;
    case 'shift-sort':
      state.shiftSort = control.dataset.sort;
      renderModalStack();
      break;
    case 'open-store':
      openStoreModal(control.dataset.id);
      break;
    case 'open-conflict':
      openConflictModal(control.dataset.id);
      break;
    case 'simulate-store-assignment':
      openStoreAssignmentModal(control.dataset.id);
      break;
    case 'zone-mode':
      state.zoneMode = control.dataset.mode;
      renderApp();
      break;
    case 'zone-stores':
      state.zoneFilter = control.dataset.id;
      state.storeFilter = null;
      navigateCampaign('stores');
      break;
    case 'remove-zone-filter':
      state.zoneFilter = null;
      renderApp();
      break;
    case 'remove-manager-filter':
      state.storeFilter = null;
      renderApp();
      break;
    case 'incident-filter':
      state.incidentFilter = control.dataset.filter;
      renderApp();
      break;
    case 'open-incident':
      openIncidentModal(control.dataset.id);
      break;
    case 'status-counter':
      handleStatusCounter(control.dataset.counter);
      break;
    case 'collaborator-groups':
      openCollaboratorGroups(control.dataset.id);
      break;
    case 'collaborator-contact-form':
      openCollaboratorContactForm(control.dataset.id, control.dataset.mode || 'create');
      break;
    case 'collaborator-assign-manager':
      openCollaboratorManagerForm(control.dataset.id);
      break;
    case 'open-contact':
      openContactModal(control.dataset.id);
      break;
    case 'open-notification':
      openNotification(control.dataset.id);
      break;
    case 'create-admin-item':
      if (isAdmin()) {
        openAdminEntityForm(control.dataset.entity);
      }
      break;
    case 'edit-admin-item':
      if (isAdmin()) {
        openAdminEntityForm(control.dataset.entity, control.dataset.id, 'edit');
      }
      break;
    case 'delete-admin-item':
      if (isAdmin()) {
        openDeleteConfirmation(control.dataset.entity, control.dataset.id);
      }
      break;
    case 'confirm-delete':
      closeTopModal();
      showToast('Confirmación recibida. No se ha eliminado ningún dato.');
      break;
    case 'open-chain':
      openChainModal(control.dataset.id);
      break;
    case 'open-collaborator':
      openCollaboratorAdminModal(control.dataset.id);
      break;
    case 'open-admin-zone':
      openAdminZoneModal(control.dataset.id);
      break;
    case 'open-campaign-detail':
      openCampaignDetailModal(control.dataset.id);
      break;
    case 'open-admin-stores':
      state.modalStack = [];
      state.adminView = 'stores';
      renderApp();
      break;
    case 'save-zone-selection':
      closeTopModal();
      showToast('Selección simulada. Las tiendas no han cambiado de zona.');
      break;
    case 'create-store-for-chain':
      openAdminEntityForm('store', null, 'create', control.dataset.id);
      break;
    case 'create-campaign-type':
      openAdminEntityForm('campaignType');
      break;
    case 'start-campaign-wizard':
      startCampaignWizard();
      break;
    case 'wizard-next':
      advanceWizard();
      break;
    case 'wizard-previous':
      state.wizardError = '';
      state.wizardStep = Math.max(1, state.wizardStep - 1);
      renderModalStack();
      break;
    case 'wizard-add-slot':
      captureWizardDailySlots();
      state.wizard.dailySlots[control.dataset.date] ||= [];
      state.wizard.dailySlots[control.dataset.date].push({ label: 'Nueva franja', start: '10:00', end: '14:00' });
      renderModalStack();
      break;
    case 'wizard-remove-slot':
      captureWizardDailySlots();
      state.wizard.dailySlots[control.dataset.date].splice(Number(control.dataset.index), 1);
      renderModalStack();
      break;
    case 'wizard-coordinator-mode':
      state.wizard.coordinatorMode = control.dataset.mode;
      state.wizardError = '';
      if (state.wizard.coordinatorMode === 'reuse') {
        state.wizard.coordinatorAssignments = { ...DATA.previousCoordinators };
      }
      renderModalStack();
      break;
    case 'wizard-apply-batch':
      applyWizardBatch();
      break;
    case 'wizard-confirm':
      if (state.wizard.confirmed) {
        state.wizard = null;
        closeTopModal();
        showToast('Confirmación recibida. No se ha creado ninguna campaña.');
      }
      break;
    case 'toast':
      showToast(control.dataset.message || 'Acción simulada.');
      break;
    case 'wizard-chain-toggle':
    case 'wizard-store-toggle':
    case 'wizard-coordinator':
    case 'wizard-batch-dimension':
    case 'wizard-batch-group':
    case 'wizard-batch-coordinator':
    case 'wizard-confirm-ack':
    case 'zone-store-toggle':
    case 'campaign-select':
      break;
    default:
      break;
  }
}

function handleChange(event) {
  const control = event.target.closest('[data-action]');
  if (!control) {
    return;
  }
  const { action } = control.dataset;
  if (action === 'campaign-select') {
    state.campaignId = control.value;
    state.calendarDate = state.campaignId === 'spring' ? parseDate(getCampaign().startDate) : parseDate(DATA.today);
    state.storeCalendarDate = new Date(state.calendarDate);
    state.storeFilter = null;
    state.zoneFilter = null;
    renderApp();
    return;
  }
  if (action === 'wizard-chain-toggle') {
    const chainStoreIds = DATA.stores.filter(store => store.chainId === control.dataset.chainId).map(store => store.id);
    state.wizard.selectedStoreIds = control.checked ? Array.from(new Set([...state.wizard.selectedStoreIds, ...chainStoreIds])) : state.wizard.selectedStoreIds.filter(storeId => !chainStoreIds.includes(storeId));
    state.wizardError = '';
    renderModalStack();
    return;
  }
  if (action === 'wizard-store-toggle') {
    const selected = new Set(state.wizard.selectedStoreIds);
    if (control.checked) {
      selected.add(control.dataset.storeId);
    } else {
      selected.delete(control.dataset.storeId);
    }
    state.wizard.selectedStoreIds = Array.from(selected);
    state.wizardError = '';
    renderModalStack();
    return;
  }
  if (action === 'wizard-coordinator') {
    state.wizard.coordinatorAssignments[control.dataset.storeId] = control.value;
    state.wizardError = '';
    renderModalStack();
    return;
  }
  if (action === 'wizard-batch-dimension') {
    state.wizard.batchDimension = control.value;
    const groups = state.wizard.batchDimension === 'chain' ? DATA.chains : DATA.zones;
    state.wizard.batchGroupId = groups[0]?.id || '';
    renderModalStack();
    return;
  }
  if (action === 'wizard-batch-group') {
    state.wizard.batchGroupId = control.value;
    return;
  }
  if (action === 'wizard-batch-coordinator') {
    state.wizard.batchCoordinatorId = control.value;
    return;
  }
  if (action === 'wizard-confirm-ack') {
    state.wizard.confirmed = control.checked;
    renderModalStack();
    return;
  }
  if (action === 'zone-store-toggle') {
    const assignedStoreIds = new Set(state.zoneSelections[control.dataset.zoneId] || []);
    if (control.checked) {
      assignedStoreIds.add(control.dataset.storeId);
    } else {
      assignedStoreIds.delete(control.dataset.storeId);
    }
    state.zoneSelections[control.dataset.zoneId] = Array.from(assignedStoreIds);
    renderModalStack();
  }
}

function handleInput(event) {
  const input = event.target.closest('[data-search-key]');
  if (!input) {
    return;
  }
  const searchKey = input.dataset.searchKey;
  if (searchKey === 'campaign-stores') {
    state.storeSearch = input.value;
  } else if (searchKey === 'wizard-stores') {
    state.wizardChainSearch = input.value;
  } else {
    state.searches[searchKey] = input.value;
  }
  syncUrlState();
  applySearchToInput(input);
}

function applySearchToInput(input) {
  const searchKey = input.dataset.searchKey;
  const searchValue = input.value.toLocaleLowerCase('es').trim();
  const container = input.closest('.modal-body') || input.closest('.surface-card') || queryElement('#main-content');
  if (!container) {
    return;
  }
  const rows = queryElements('[data-searchable]', container);
  let visibleCount = 0;
  rows.forEach(row => {
    const matches = !searchValue || (row.dataset.searchText || row.textContent).toLocaleLowerCase('es').includes(searchValue);
    row.hidden = !matches;
    if (matches) {
      visibleCount += 1;
    }
  });
  if (searchKey === 'wizard-stores') {
    queryElements('.wizard-chain-group', container).forEach(group => {
      group.hidden = !queryElements('.wizard-store-row[data-searchable]:not([hidden])', group).length;
    });
  }
  const emptyState = queryElement('[data-empty-results]', container);
  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
  }
  const countLabel = queryElement('[data-visible-count]', container);
  if (countLabel) {
    countLabel.textContent = `${visibleCount} resultado${visibleCount === 1 ? '' : 's'}`;
  }
}

function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) {
    return;
  }
  event.preventDefault();
  if (form.dataset.form === 'login') {
    const email = new FormData(form).get('email')?.toString().toLowerCase() || '';
    const role = email.includes('coord') ? 'COORDINATOR' : 'ADMIN';
    startSession(role);
    showToast(`Acceso mock iniciado como ${role}.`);
  } else if (form.dataset.form === 'register') {
    showToast('Registro simulado. No se ha creado una cuenta.');
  } else if (form.dataset.form === 'mock-change') {
    const changeLabel = form.dataset.changeLabel || 'Acción';
    closeTopModal();
    showToast(`${changeLabel} simulada. No se han guardado cambios.`);
  } else if (form.dataset.form === 'incident-response') {
    closeTopModal();
    showToast('Respuesta simulada. No se ha guardado ni añadido una respuesta.');
  } else if (form.dataset.form === 'store-assignment') {
    closeTopModal();
    showToast('Asignación simulada. No se han alterado los turnos.');
  }
}

function handleKeydown(event) {
  if (event.key === 'Tab' && state.modalStack.length) {
    const dialog = queryElement('.modal-layer:last-child .modal-dialog');
    const focusableElements = queryElements('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]', dialog).filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    if (focusableElements.length) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
  if (event.key === 'Escape') {
    if (state.modalStack.length) {
      event.preventDefault();
      closeTopModal();
    } else if (state.popover) {
      state.popover = null;
      renderPopover();
    }
  }
}

function setAuthTab(tab) {
  const loginForm = queryElement('#login-form');
  const registerForm = queryElement('#register-form');
  const loginTab = queryElement('[data-tab="login"].auth-tab');
  const registerTab = queryElement('[data-tab="register"].auth-tab');
  const showLogin = tab === 'login';
  loginForm.hidden = !showLogin;
  registerForm.hidden = showLogin;
  loginTab.classList.toggle('is-active', showLogin);
  registerTab.classList.toggle('is-active', !showLogin);
  loginTab.setAttribute('aria-selected', String(showLogin));
  registerTab.setAttribute('aria-selected', String(!showLogin));
}

function startSession(role) {
  state.activeRole = role;
  state.userId = role === 'COORDINATOR' ? 'p-coord-ana' : 'p-admin';
  state.adminMode = false;
  state.campaignId = 'grand';
  state.campaignView = 'home';
  state.calendarMode = 'week';
  state.calendarDate = parseDate(DATA.today);
  state.popover = null;
  state.modalStack = [];
  renderApp();
  queryElement('#main-content')?.focus({ preventScroll: true });
}

function endSession() {
  state.userId = null;
  state.activeRole = null;
  state.adminMode = false;
  state.modalStack = [];
  state.popover = null;
  renderApp();
  setAuthTab('login');
}

function navigateCampaign(view) {
  state.adminMode = false;
  state.campaignView = view;
  if (view === 'home') {
    state.calendarMode = 'week';
  }
  state.popover = null;
  state.modalStack = [];
  renderApp();
}

function togglePopover(popover) {
  state.popover = state.popover === popover ? null : popover;
  renderPopover();
}

function moveCalendar(direction) {
  if (state.calendarMode === 'month') {
    state.calendarDate = addMonths(state.calendarDate, direction);
  } else {
    state.calendarDate = addDays(state.calendarDate, direction * (state.calendarMode === 'day' ? 1 : 7));
  }
}

function moveStoreCalendar(direction) {
  if (state.storeCalendarMode === 'month') {
    state.storeCalendarDate = addMonths(state.storeCalendarDate, direction);
  } else {
    state.storeCalendarDate = addDays(state.storeCalendarDate, direction * (state.storeCalendarMode === 'day' ? 1 : 7));
  }
}

function handleStatusCounter(counter) {
  const counts = getCampaignStatusCounts();
  if (counter === 'no-manager') {
    state.storeFilter = 'no-manager';
    state.zoneFilter = null;
    navigateCampaign('stores');
  } else if (counter === 'incidents') {
    state.incidentFilter = 'pending';
    navigateCampaign('incidents');
  } else if (counter === 'conflicts') {
    const conflict = counts.conflicts[0];
    if (conflict) {
      openConflictModal(conflict.id);
    } else {
      navigateCampaign('calendar');
    }
  } else if (counter === 'pending-periods' || counter === 'complete-periods') {
    const periods = counter === 'pending-periods' ? counts.pendingPeriods : counts.completePeriods;
    const period = periods[0];
    if (period) {
      state.calendarDate = period.date;
      state.calendarMode = 'day';
      state.campaignView = 'calendar';
      renderApp();
      openShiftModal(formatDateKey(period.date), period.slotId);
    } else {
      navigateCampaign('calendar');
    }
  }
}

function openNotification(notificationId) {
  const notification = DATA.notifications.find(item => item.id === notificationId);
  if (!notification) {
    return;
  }
  state.popover = null;
  if (notification.campaignId !== state.campaignId) {
    state.campaignId = notification.campaignId;
  }
  renderApp();
  if (notification.type === 'shift') {
    state.calendarDate = parseDate(notification.date);
    state.campaignView = 'calendar';
    renderApp();
    openShiftModal(notification.date, notification.slotId);
  } else if (notification.type === 'incident') {
    state.campaignView = 'incidents';
    renderApp();
    openIncidentModal(notification.incidentId);
  } else if (notification.type === 'store') {
    state.campaignView = 'stores';
    renderApp();
    openStoreModal(notification.storeId);
  }
}

function openStoreAssignmentModal(storeId) {
  const store = getStore(storeId);
  if (!store) {
    return;
  }
  const slots = getCampaign().slotTemplate;
  openModal({
    title: 'Simular asignación de turno',
    size: 'compact',
    eyebrow: store.name,
    body: `<p class="modal-copy">Elige una franja para visualizar el formulario. No se seleccionan ni se identifican personas voluntarias.</p><form id="store-assignment-form" data-form="store-assignment"><div class="form-field"><label for="assignment-date">Fecha</label><input id="assignment-date" name="date" type="date" value="${escapeHtml(formatDateKey(state.calendarDate))}" required ${isCampaignReadonly() ? 'disabled' : ''}></div><div class="form-field"><label for="assignment-slot">Franja</label><select id="assignment-slot" name="slot" required ${isCampaignReadonly() ? 'disabled' : ''}>${slots.map(slot => `<option value="${escapeHtml(slot.id)}">${escapeHtml(slot.label)} · ${escapeHtml(slot.start)}–${escapeHtml(slot.end)}</option>`).join('')}</select></div><div class="callout" style="margin-top:12px">La asignación es simulada y no cambia la cobertura ni los datos de ejemplo.</div></form>`,
    footer: `<div class="modal-footer__left"><span class="muted" style="font-size:9px">Acción sin persistencia</span></div><div class="modal-footer__right"><button class="button button--quiet button--small" type="button" data-action="close-modal">Cancelar</button><button class="button button--primary button--small" type="submit" form="store-assignment-form" ${isCampaignReadonly() ? 'disabled' : ''}>Simular asignación</button></div>`
  });
}

function applyWizardBatch() {
  const coordinatorId = state.wizard.batchCoordinatorId;
  if (!coordinatorId) {
    state.wizardError = 'Selecciona una persona COORDINATOR para aplicar la asignación por lote.';
    renderModalStack();
    return;
  }
  const dimension = state.wizard.batchDimension;
  const groupId = state.wizard.batchGroupId;
  const stores = DATA.stores.filter(store => state.wizard.selectedStoreIds.includes(store.id) && (dimension === 'chain' ? store.chainId === groupId : store.zoneId === groupId));
  stores.forEach(store => {
    state.wizard.coordinatorAssignments[store.id] = coordinatorId;
  });
  state.wizardError = '';
  renderModalStack();
  showToast(`Asignación por ${dimension === 'chain' ? 'cadena' : 'zona'} simulada para ${stores.length} tiendas.`);
}

function showToast(message) {
  const region = queryElement('#toast-region');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon('check')}<span>${escapeHtml(message)}</span>`;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3400);
}

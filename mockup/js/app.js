(() => {
  const DATA = window.MOCK_DATA;
  const ROLE = DATA.roleNames;
  const DAY_START_HOUR = 8;
  const DAY_END_HOUR = 23;
  const ADMIN_ENTITIES = [
    { id: "stores", title: "Tiendas", icon: "store" },
    { id: "chains", title: "Cadenas", icon: "building" },
    { id: "collaborators", title: "Colaboradores", icon: "users" },
    { id: "zones", title: "Zonas", icon: "grid" },
    { id: "audit", title: "Auditoría", icon: "audit" },
    { id: "users", title: "Usuarios", icon: "user" },
    { id: "campaigns", title: "Campañas", icon: "campaign" }
  ];
  const ROUTES = new Set([
    "dashboard", "zones", "stores", "collaborators", "reports", "calendar", "admin",
    "admin-stores", "admin-chains", "admin-collaborators", "admin-zones", "admin-audit",
    "admin-users", "admin-campaigns"
  ]);
  const TUTORIALS = {
    dashboard: [
      { selector: "[data-guide='campaign']", title: "Ámbito de campaña", text: "Cambia de campaña desde aquí. La selección actualiza los datos de todas las vistas." },
      { selector: ".summary-reports", title: "Incidencias pendientes", text: "El resumen muestra solo las que aún no tienen respuesta. Usa “Ver todas” para consultar el historial." },
      { selector: ".calendar-card", title: "Calendario de turnos", text: "Cambia entre día, semana y mes. Al abrir una franja verás las tiendas y su cobertura." },
      { selector: ".health-card", title: "Estado de la campaña", text: "Los contadores resumen pendientes, conflictos y franjas completas dentro de tu ámbito." }
    ],
    zones: [
      { selector: "[data-guide='zone-layout']", title: "Formato de zonas", text: "Alterna entre tarjetas y tabla sin perder el ámbito de campaña." },
      { selector: "[data-guide='zone-card']", title: "Acceso a las tiendas", text: "Abre una zona para ver sus tiendas. El filtro queda visible y se puede quitar." }
    ],
    stores: [
      { selector: "[data-guide='stores-search']", title: "Búsqueda y filtros", text: "Busca por nombre, cadena, localidad o persona asignada. Los filtros activos aparecen como chips." },
      { selector: "[data-guide='stores-table']", title: "Resumen de tiendas", text: "La tabla concentra horarios, cobertura, cadena, zona y contacto de quien asigna los turnos." }
    ],
    collaborators: [
      { selector: "[data-guide='collaborator-list']", title: "Entidades colaboradoras", text: "Consulta actividad, tiendas y contactos. El voluntariado se representa solo mediante contadores." }
    ],
    reports: [
      { selector: "[data-guide='report-filters']", title: "Estado de las incidencias", text: "Filtra entre pendientes y respondidas. Una incidencia respondida conserva una única respuesta." },
      { selector: "[data-guide='report-list']", title: "Detalle de una incidencia", text: "Abre una fila para consultar la descripción, la persona que la comunicó y su respuesta." }
    ],
    calendar: [
      { selector: "[data-guide='calendar-page']", title: "Vistas del calendario", text: "Usa día, semana o mes. Los días fuera de campaña aparecen en gris." },
      { selector: ".calendar-timeline, .calendar-month-grid, .calendar-day-details", title: "Cobertura de franjas", text: "Las franjas se colocan según sus horas. En el mes, cada día resume ambas franjas y los conflictos prevalecen." }
    ],
    admin: [
      { selector: "[data-guide='admin-nav']", title: "Navegación de administración", text: "Accede desde este menú a las siete entidades del panel." },
      { selector: "[data-guide='admin-cards']", title: "Resumen de entidades", text: "Cada tarjeta resume los datos principales y lleva al listado correspondiente." }
    ],
    "admin-stores": [{ selector: "[data-guide='admin-table']", title: "Gestión de tiendas", text: "Busca y consulta datos del modelo. Las acciones son visuales y no cambian los datos." }],
    "admin-chains": [{ selector: "[data-guide='admin-table']", title: "Gestión de cadenas", text: "Abre una cadena para consultar, editar, borrar o crear sus tiendas." }],
    "admin-collaborators": [{ selector: "[data-guide='admin-table']", title: "Entidades colaboradoras", text: "Consulta responsables, contactos y grupos sin exponer datos personales de voluntarios." }],
    "admin-zones": [{ selector: "[data-guide='admin-table']", title: "Zonas", text: "Consulta las tiendas de una zona, añade o quita establecimientos y abre el listado completo." }],
    "admin-audit": [{ selector: "[data-guide='admin-table']", title: "Auditoría", text: "Este panel es de solo lectura y muestra eventos de ejemplo para la maqueta." }],
    "admin-users": [{ selector: "[data-guide='admin-table']", title: "Usuarios", text: "El rol se puede editar en el formulario visual. Las asignaciones de campaña y zona se gestionan en contexto." }],
    "admin-campaigns": [{ selector: "[data-guide='admin-actions']", title: "Campañas", text: "El asistente reúne datos, selección de cadenas y tiendas, y una confirmación final." }]
  };
  const ADMIN_COLUMNS = {
    stores: [
      { label: "Tienda", render: (record) => `<div class="table-primary-cell"><strong>${escapeHTML(record.name)}</strong><span class="table-secondary">${escapeHTML(getChain(record.chainId)?.name || "")}</span></div>` },
      { label: "Zona · localidad", render: (record) => `${escapeHTML(getZone(record.zoneId)?.name || "—")} · ${escapeHTML(record.locality)}` },
      { label: "Cajas", render: (record) => `${formatNumber(record.checkoutShelfs)}` },
      { label: "Asignación", render: (record) => record.managerId ? personLink(record.managerId) : `<span class="state-badge is-pending">Sin asignación</span>` }
    ],
    chains: [
      { label: "Cadena", render: (record) => `<strong>${escapeHTML(record.name)}</strong>` },
      { label: "Código", render: (record) => `<span class="tag">${escapeHTML(record.code)}</span>` },
      { label: "Tiendas", render: (record) => formatNumber(DATA.stores.filter((store) => store.chainId === record.id).length) }
    ],
    collaborators: [
      { label: "Colaborador", render: (record) => `<strong>${escapeHTML(record.name)}</strong>` },
      { label: "Localidad", render: (record) => escapeHTML(record.locality) },
      { label: "Tiendas", render: (record) => formatNumber(DATA.stores.filter((store) => store.collaboratorId === record.id).length) },
      { label: "Responsable", render: (record) => personLink(record.responsibleId) },
      { label: "Grupos", render: (record) => formatNumber(Math.max(1, record.groups?.length || 0)) },
      { label: "Voluntariado", render: (record) => `${formatNumber(getVolunteerCount(record.id))} personas · anónimo` }
    ],
    zones: [
      { label: "Zona", render: (record) => `<strong>${escapeHTML(record.name)}</strong>` },
      { label: "Código", render: (record) => `<span class="tag">${escapeHTML(record.code)}</span>` },
      { label: "Tiendas", render: (record) => formatNumber(DATA.stores.filter((store) => store.zoneId === record.id).length) },
      { label: "COORDINATOR", render: (record) => personLink(record.coordinatorId) }
    ],
    audit: [
      { label: "Fecha", render: (record) => escapeHTML(formatAuditDate(record.date)) },
      { label: "Evento", render: (record) => `<strong>${escapeHTML(record.action)}</strong>` },
      { label: "Entidad", render: (record) => escapeHTML(record.entity) },
      { label: "Usuario", render: (record) => personLink(record.actorId) }
    ],
    users: [
      { label: "Usuario", render: (record) => `<div class="table-primary-cell">${personLink(record.id)}<span class="table-secondary">${escapeHTML(record.email)}</span></div>` },
      { label: "Teléfono", render: (record) => escapeHTML(record.phone) },
      { label: "Roles", render: (record) => roleTags(record.roles) }
    ],
    campaigns: [
      { label: "Campaña", render: (record) => `<strong>${escapeHTML(record.name)}</strong>` },
      { label: "Tipo", render: (record) => escapeHTML(getCampaignType(record.typeId)?.name || "—") },
      { label: "Fechas", render: (record) => `${formatDate(record.startDate)} — ${formatDate(record.endDate)}` },
      { label: "Estado", render: (record) => campaignBadge(record) }
    ]
  };
  const ADMIN_FORM_FIELDS = {
    stores: [
      { name: "name", label: "Nombre de tienda", type: "text", full: true },
      { name: "chainId", label: "Cadena", type: "select", options: () => DATA.chains.map((item) => [item.id, item.name]) },
      { name: "zoneId", label: "Zona", type: "select", options: () => DATA.zones.map((item) => [item.id, item.name]) },
      { name: "locality", label: "Localidad", type: "text" },
      { name: "address", label: "Dirección", type: "text", full: true },
      { name: "checkoutShelfs", label: "Cajas", type: "number" }
    ],
    chains: [
      { name: "name", label: "Nombre de cadena", type: "text" },
      { name: "code", label: "Código", type: "text" }
    ],
    collaborators: [
      { name: "name", label: "Nombre", type: "text", full: true },
      { name: "address", label: "Dirección", type: "text", full: true },
      { name: "locality", label: "Localidad", type: "text" }
    ],
    zones: [
      { name: "name", label: "Nombre de zona", type: "text" },
      { name: "code", label: "Código", type: "text" }
    ],
    users: [
      { name: "name", label: "Nombre", type: "text" },
      { name: "email", label: "Correo electrónico", type: "email" },
      { name: "phone", label: "Teléfono", type: "tel" },
      { name: "role", label: "Rol", type: "select", options: () => Object.values(ROLE).map((value) => [value, value]) }
    ],
    campaigns: [
      { name: "name", label: "Nombre de campaña", type: "text", full: true },
      { name: "typeId", label: "Tipo de campaña", type: "select", options: () => DATA.campaignTypes.map((item) => [item.id, item.name]) },
      { name: "startDate", label: "Fecha de inicio", type: "date" },
      { name: "endDate", label: "Fecha de fin", type: "date" }
    ]
  };

  const state = {
    signedIn: false,
    authMode: "login",
    role: null,
    activeUserId: null,
    currentView: "dashboard",
    campaignId: "grand",
    openDropdown: null,
    zoneLayout: "cards",
    zoneFilter: null,
    missingManagerFilter: false,
    storeSearch: "",
    collaboratorSearch: "",
    reportSearch: "",
    reportFilter: "all",
    adminSearch: "",
    calendarViews: { home: "week", calendar: "week" },
    calendarOffsets: {},
    shiftSort: "default",
    popupStack: [],
    tutorialOpen: false,
    tutorialStep: 0,
    toastTimer: null
  };

  const formatNumber = (value) => new Intl.NumberFormat("es-ES").format(value);
  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const icon = (name) => window.ICONS[name] || "";
  const currentCampaign = () => DATA.campaigns.find((campaign) => campaign.id === state.campaignId) || DATA.campaigns[0];
  const getUser = (id) => DATA.users.find((user) => user.id === id);
  const getChain = (id) => DATA.chains.find((chain) => chain.id === id);
  const getZone = (id) => DATA.zones.find((zone) => zone.id === id);
  const getStore = (id) => DATA.stores.find((store) => store.id === id);
  const getCollaborator = (id) => DATA.collaborators.find((collaborator) => collaborator.id === id);
  const getReport = (id) => DATA.reports.find((report) => report.id === id);
  const getConflict = (id) => DATA.conflicts.find((conflict) => conflict.id === id);
  const getCampaignType = (id) => DATA.campaignTypes.find((type) => type.id === id);

  function parseDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(date, amount) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
  }

  function startOfWeek(date) {
    const weekday = date.getDay() === 0 ? 6 : date.getDay() - 1;
    return addDays(date, -weekday);
  }

  function getTodayDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function getDayDifference(firstDate, secondDate) {
    const first = Date.UTC(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
    const second = Date.UTC(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate());
    return Math.round((second - first) / 86400000);
  }

  function isToday(date) {
    return toISODate(date) === toISODate(getTodayDate());
  }

  function formatDate(value, options = { day: "2-digit", month: "short", year: "numeric" }) {
    return new Intl.DateTimeFormat("es-ES", options).format(parseDate(value));
  }

  function formatDateTime(value) {
    const [date, time] = value.split(" ");
    return `${formatDate(date, { day: "2-digit", month: "short" })} · ${time}`;
  }

  function formatAuditDate(value) {
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(normalized));
  }

  function getCampaignState(campaign) {
    return campaign.readOnly ? "Finalizada" : "En curso";
  }

  function campaignBadge(campaign) {
    const isPast = campaign.readOnly;
    return `<span class="status-badge ${isPast ? "status-past" : "status-current"}">${escapeHTML(getCampaignState(campaign))}</span>`;
  }

  function getCampaignStores() {
    const campaign = currentCampaign();
    if (!campaign.storeIds) return DATA.stores;
    const ids = new Set(campaign.storeIds);
    return DATA.stores.filter((store) => ids.has(store.id));
  }

  function getCoordinatorZoneIds() {
    const assignment = DATA.zoneAssignments.find((item) => item.campaignId === state.campaignId && item.userId === state.activeUserId);
    return assignment ? assignment.zoneIds : [];
  }

  function getScopedStores() {
    const campaignStores = getCampaignStores();
    if (state.role !== ROLE.coordinator) return campaignStores;
    const zoneIds = new Set(getCoordinatorZoneIds());
    return campaignStores.filter((store) => zoneIds.has(store.zoneId));
  }

  function getStoreViewItems() {
    let stores = getScopedStores();
    if (state.zoneFilter) stores = stores.filter((store) => store.zoneId === state.zoneFilter);
    if (state.missingManagerFilter) stores = stores.filter((store) => !store.managerId);
    const query = state.storeSearch.trim().toLocaleLowerCase("es-ES");
    if (query) {
      stores = stores.filter((store) => {
        const manager = getUser(store.managerId);
        const values = [store.name, store.address, store.locality, store.postalCode, getChain(store.chainId)?.name, getZone(store.zoneId)?.name, manager?.name, store.managerId ? ROLE.storeManager : ""];
        return values.some((value) => String(value || "").toLocaleLowerCase("es-ES").includes(query));
      });
    }
    return stores;
  }

  function getScopedZones() {
    const storeZoneIds = new Set(getScopedStores().map((store) => store.zoneId));
    return DATA.zones.filter((zone) => storeZoneIds.has(zone.id));
  }

  function getScopedReports() {
    const campaignReports = DATA.reports.filter((report) => report.campaignId === state.campaignId);
    if (state.role === ROLE.admin) return campaignReports;
    const visibleReporterIds = new Set(getScopedStores().map((store) => store.managerId).filter(Boolean));
    visibleReporterIds.add(state.activeUserId);
    return campaignReports.filter((report) => visibleReporterIds.has(report.reportedBy));
  }

  function getScopedConflicts() {
    const conflicts = DATA.conflicts.filter((conflict) => conflict.campaignId === state.campaignId);
    if (state.role === ROLE.admin) return conflicts;
    const visibleIds = new Set(getScopedStores().map((store) => store.id));
    return conflicts.filter((conflict) => conflict.storeIds.every((storeId) => visibleIds.has(storeId)));
  }

  function getScopedCollaborators() {
    const storeCollaboratorIds = new Set(getScopedStores().map((store) => store.collaboratorId));
    return DATA.collaborators.filter((collaborator) => collaborator.campaignIds.includes(state.campaignId) && storeCollaboratorIds.has(collaborator.id));
  }

  function getVolunteerCount(collaboratorId) {
    return DATA.volunteers.filter((volunteer) => volunteer.collaboratorId === collaboratorId).length;
  }

  function getSlotData(store, date, slot) {
    if (date < currentCampaign().startDate || date > currentCampaign().endDate) {
      return { state: "outside", assigned: 0, total: 0, conflict: null };
    }
    const coverage = store.coverage[slot];
    const override = DATA.slotOverrides.find((item) => item.date === date && item.slot === slot && item.complete);
    const assigned = override ? coverage.total : coverage.assigned;
    const conflict = getScopedConflicts().find((item) => item.date === date && item.slot === slot && item.storeIds.includes(store.id));
    if (conflict) return { state: "conflict", assigned, total: coverage.total, conflict };
    return { state: assigned >= coverage.total ? "complete" : "pending", assigned, total: coverage.total, conflict: null };
  }

  function getSlotAggregate(date, slot, stores) {
    if (date < currentCampaign().startDate || date > currentCampaign().endDate) {
      return { state: "outside", assigned: 0, total: 0, conflicts: [] };
    }
    const values = stores.map((store) => ({ store, ...getSlotData(store, date, slot) }));
    const assigned = values.reduce((total, value) => total + value.assigned, 0);
    const total = values.reduce((sum, value) => sum + value.total, 0);
    const conflicts = [...new Set(values.map((value) => value.conflict).filter(Boolean))];
    const status = conflicts.length ? "conflict" : assigned >= total && total > 0 ? "complete" : "pending";
    return { state: status, assigned, total, conflicts };
  }

  function getStoreCoverage(store) {
    const assigned = store.coverage.morning.assigned + store.coverage.afternoon.assigned;
    const total = store.coverage.morning.total + store.coverage.afternoon.total;
    return { assigned, total };
  }

  function getStoreSlotCampaignStatus(store, slot) {
    const hasConflict = getScopedConflicts().some((conflict) => conflict.storeIds.includes(store.id) && conflict.slot === slot);
    if (hasConflict) return "conflict";
    const coverage = store.coverage[slot];
    return coverage.assigned >= coverage.total ? "complete" : "pending";
  }

  function getStoreCampaignStatus(store) {
    const statuses = ["morning", "afternoon"].map((slot) => getStoreSlotCampaignStatus(store, slot));
    if (statuses.includes("conflict")) return "conflict";
    return statuses.every((status) => status === "complete") ? "complete" : "pending";
  }

  function getDayAggregate(date, stores) {
    const iso = typeof date === "string" ? date : toISODate(date);
    const morning = getSlotAggregate(iso, "morning", stores);
    const afternoon = getSlotAggregate(iso, "afternoon", stores);
    if (morning.state === "outside" || afternoon.state === "outside") {
      return { state: "outside", assigned: 0, total: 0, conflicts: [], morning, afternoon };
    }
    const conflicts = [...new Set([...morning.conflicts, ...afternoon.conflicts])];
    const assigned = morning.assigned + afternoon.assigned;
    const total = morning.total + afternoon.total;
    const status = conflicts.length ? "conflict" : morning.state === "complete" && afternoon.state === "complete" ? "complete" : "pending";
    return { state: status, assigned, total, conflicts, morning, afternoon };
  }

  function getStatusLabel(status) {
    return { complete: "Completa", pending: "Pendiente", conflict: "Conflicto", outside: "Fuera de campaña" }[status];
  }

  function personLink(userId, label = null) {
    const user = getUser(userId);
    if (!user) return `<span class="table-secondary">Sin asignación</span>`;
    const name = label || user.name;
    return `<button class="person-contact-link" type="button" data-action="open-contact" data-user-id="${escapeHTML(user.id)}" aria-label="Abrir ficha de contacto de ${escapeHTML(user.name)}">${escapeHTML(name)}${icon("eye")}</button>`;
  }

  function roleTags(roles) {
    return `<span class="person-roles">${roles.map((role) => `<span class="person-role-tag">${escapeHTML(role)}</span>`).join("")}</span>`;
  }

  function stateBadge(status) {
    const labels = { complete: "Completa", pending: "Pendiente", conflict: "Conflicto", outside: "Fuera de campaña" };
    const warning = status === "conflict" ? icon("warning") : "";
    return `<span class="state-badge is-${status}">${warning}${labels[status]}</span>`;
  }

  function slotLabel(slot) {
    return slot === "morning" ? "Mañana" : "Tarde";
  }

  function renderPageHeading(title, description, actions = "", guide = "") {
    const guideAttribute = guide ? ` data-guide="${escapeHTML(guide)}"` : "";
    const eyebrow = state.currentView.startsWith("admin") ? "ADMINISTRACIÓN" : currentCampaign().name;
    return `<div class="view-heading"${guideAttribute}><div><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div><div class="view-heading-actions">${actions}</div></div>`;
  }

  function renderDashboard() {
    const zones = getScopedZones();
    const stores = getScopedStores();
    const collaborators = getScopedCollaborators();
    const reports = getScopedReports();
    const pendingReports = reports.filter((report) => !report.solution);
    const completeStores = stores.filter((store) => getStoreCampaignStatus(store) === "complete").length;
    const assignedStores = stores.filter((store) => store.managerId).length;
    const allCampaignDates = `${formatDate(currentCampaign().startDate)} — ${formatDate(currentCampaign().endDate)}`;
    return `<section class="dashboard-page">
      <div class="dashboard-title-row">
        <div><p class="eyebrow">PANEL DE CAMPAÑA</p><h1>${escapeHTML(currentCampaign().name)}</h1><p>${escapeHTML(allCampaignDates)} · ${formatNumber(stores.length)} tiendas en tu ámbito</p></div>
        <div class="dashboard-title-meta">${campaignBadge(currentCampaign())}<span class="tag">${state.role === ROLE.admin ? "Ámbito completo" : "Ámbito asignado"}</span></div>
      </div>
      <div class="dashboard-grid">
        <a class="summary-card summary-zones" href="#zones" data-route="zones" data-guide="home-zones">
          <div class="summary-heading"><h2>Zonas</h2><span class="nav-icon">${icon("grid")}</span></div>
          <div class="summary-number">${formatNumber(zones.length)}<small>zonas asignadas</small></div>
          <div class="summary-detail">${zones.slice(0, 3).map((zone) => escapeHTML(zone.name)).join(" · ")}${zones.length > 3 ? " · …" : ""}</div>
          <div class="summary-tags"><span class="tag">Ver zonas</span><span class="tag">${formatNumber(completeStores)} tiendas completas</span></div>
        </a>
        <a class="summary-card summary-stores" href="#stores" data-route="stores" data-guide="home-stores">
          <div class="summary-heading"><h2>Tiendas</h2><span class="nav-icon">${icon("store")}</span></div>
          <div class="summary-number">${formatNumber(stores.length)}<small>en el ámbito</small></div>
          <div class="summary-detail">${formatNumber(assignedStores)} con persona asignada · ${formatNumber(stores.length - assignedStores)} sin asignación</div>
          <div class="summary-tags"><span class="tag">${formatNumber(stores.reduce((sum, store) => sum + getStoreCoverage(store).assigned, 0))} turnos asignados</span></div>
        </a>
        <a class="summary-card summary-collaborators" href="#collaborators" data-route="collaborators" data-guide="home-collaborators">
          <div class="summary-heading"><h2>Colaboradores</h2><span class="nav-icon">${icon("users")}</span></div>
          <div class="summary-number">${formatNumber(collaborators.length)}<small>entidades activas</small></div>
          <div class="summary-detail">${formatNumber(collaborators.reduce((sum, item) => sum + getVolunteerCount(item.id), 0))} voluntarios protegidos por datos</div>
          <div class="summary-tags">${collaborators.slice(0, 2).map((item) => `<span class="tag">${escapeHTML(item.name)}</span>`).join("")}</div>
        </a>
        <section class="summary-card summary-reports" aria-labelledby="home-reports-title" data-guide="home-reports">
          <div class="summary-heading"><h2 id="home-reports-title">Incidencias pendientes</h2><span class="nav-icon">${icon("alert")}</span></div>
          <div class="summary-report-list">${pendingReports.length ? pendingReports.slice(0, 4).map((report) => `<button class="summary-report-item" type="button" data-action="open-report" data-report-id="${escapeHTML(report.id)}"><span class="summary-report-dot" aria-hidden="true"></span><span class="summary-report-title">${escapeHTML(report.type)} · ${escapeHTML(report.description)}</span><span class="summary-report-date">${formatDate(report.creationDate, { day: "2-digit", month: "short" })}</span></button>`).join("") : `<p class="muted-note">No hay incidencias pendientes.</p>`}</div>
          <div class="summary-tags"><a class="link-button" href="#reports" data-route="reports">Ver todas · ${formatNumber(reports.length)}</a></div>
        </section>
        <section class="panel calendar-card" aria-labelledby="home-calendar-title" data-guide="calendar">
          <div class="panel-heading"><div><h2 id="home-calendar-title">Calendario de turnos</h2><p>Franjas de campaña · mañana y tarde</p></div><a class="link-button" href="#calendar" data-route="calendar">Abrir calendario</a></div>
          ${renderCalendar("home")}
        </section>
        <section class="panel health-card" aria-labelledby="health-title" data-guide="health">
          <div class="panel-heading"><div><h2 id="health-title">Estado de la campaña</h2><p>Resumen transversal · ${formatNumber(stores.length)} tiendas visibles</p></div><span class="tag">Ahora</span></div>
          ${renderHealthItems()}
        </section>
      </div>
    </section>`;
  }

  function renderHealthItems() {
    const stores = getScopedStores();
    const pendingReports = getScopedReports().filter((report) => !report.solution).length;
    const conflicts = getScopedConflicts();
    let pendingSlots = 0;
    let completeSlots = 0;
    stores.forEach((store) => {
      ["morning", "afternoon"].forEach((slot) => {
        const status = getStoreSlotCampaignStatus(store, slot);
        if (status === "pending") pendingSlots += 1;
        if (status === "complete") completeSlots += 1;
      });
    });
    const missing = stores.filter((store) => !store.managerId).length;
    const items = [
      { label: "Tiendas sin persona asignada", count: missing, status: missing ? "pending" : "complete", action: "missing-stores" },
      { label: "Incidencias sin respuesta", count: pendingReports, status: pendingReports ? "pending" : "complete", action: "pending-reports" },
      { label: "Conflictos activos", count: conflicts.length, status: conflicts.length ? "conflict" : "complete", action: "conflicts" },
      { label: "Franjas pendientes", count: pendingSlots, status: pendingSlots ? "pending" : "complete", action: "pending-slots" },
      { label: "Franjas completas", count: completeSlots, status: "complete", action: "complete-slots" }
    ];
    return `<div class="health-list">${items.map((item) => `<button class="health-item is-${item.status}" type="button" data-action="health-item" data-health="${item.action}"><span class="health-item-label">${escapeHTML(item.label)}</span><span class="health-item-count">${formatNumber(item.count)}</span><span class="icon-slot" aria-hidden="true">${icon("right")}</span></button>`).join("")}</div>`;
  }

  function renderZones() {
    const zones = getScopedZones();
    const storeCount = getScopedStores().length;
    const actions = `<div class="view-switch" data-guide="zone-layout" aria-label="Formato de zonas"><button type="button" data-action="zone-layout" data-layout="cards" aria-pressed="${state.zoneLayout === "cards"}">Tarjetas</button><button type="button" data-action="zone-layout" data-layout="table" aria-pressed="${state.zoneLayout === "table"}">Tabla</button></div>`;
    const content = state.zoneLayout === "cards" ? `<div class="zone-card-grid">${zones.map((zone, index) => {
      const stores = getScopedStores().filter((store) => store.zoneId === zone.id);
      const coordinator = getUser(zone.coordinatorId);
      return `<article class="zone-card"${index === 0 ? ` data-guide="zone-card"` : ""}><div class="zone-card-header"><a class="zone-card-main" href="#stores" data-route="stores" data-zone-id="${escapeHTML(zone.id)}"><h2 class="zone-card-title">${escapeHTML(zone.name)}</h2><span class="table-secondary">Abrir las tiendas de la zona →</span></a><span class="zone-code">${escapeHTML(zone.code)}</span></div><a class="zone-card-main" href="#stores" data-route="stores" data-zone-id="${escapeHTML(zone.id)}"><div class="zone-card-count">${formatNumber(stores.length)}<span>tiendas</span></div></a><div class="zone-card-footer"><span>COORDINATOR</span>${coordinator ? personLink(coordinator.id) : `<span class="table-secondary">Sin asignación</span>`}</div></article>`;
    }).join("")}</div>` : `<div class="table-scroll"><table class="data-table"><caption class="sr-only">Zonas asignadas en la campaña</caption><thead><tr><th>Zona</th><th>Código</th><th>Tiendas</th><th>COORDINATOR</th><th></th></tr></thead><tbody>${zones.map((zone) => `<tr><td><a class="link-button" href="#stores" data-route="stores" data-zone-id="${escapeHTML(zone.id)}">${escapeHTML(zone.name)}</a></td><td>${escapeHTML(zone.code)}</td><td>${formatNumber(getScopedStores().filter((store) => store.zoneId === zone.id).length)}</td><td>${personLink(zone.coordinatorId)}</td><td><a class="link-button" href="#stores" data-route="stores" data-zone-id="${escapeHTML(zone.id)}">Ver tiendas</a></td></tr>`).join("")}</tbody></table></div>`;
    return `${renderPageHeading("Zonas", `${formatNumber(zones.length)} zonas y ${formatNumber(storeCount)} tiendas asignadas en esta campaña.`, actions)}<section class="panel page-panel">${content}</section>`;
  }

  function renderStores() {
    const stores = getStoreViewItems();
    const total = getScopedStores().length;
    const zone = state.zoneFilter ? getZone(state.zoneFilter) : null;
    const chip = zone ? `<span class="filter-chip">Zona: ${escapeHTML(zone.name)}<button type="button" data-action="clear-zone-filter" aria-label="Quitar filtro de zona">${icon("close")}</button></span>` : "";
    const missingChip = state.missingManagerFilter ? `<span class="filter-chip">Sin persona asignada<button type="button" data-action="clear-missing-filter" aria-label="Quitar filtro de asignación">${icon("close")}</button></span>` : "";
    const clearSearch = state.storeSearch ? `<button class="text-button" type="button" data-action="clear-store-search">Limpiar búsqueda</button>` : "";
    return `${renderPageHeading("Tiendas", "Resumen de turnos, datos del establecimiento y persona que asigna las franjas.")}
      <section class="panel page-panel">
        <div class="table-toolbar" data-guide="stores-search"><div class="toolbar-left"><label class="search-control"><span>${icon("search")}</span><span class="sr-only">Buscar tiendas</span><input type="search" name="store-search" autocomplete="off" placeholder="Buscar tienda, cadena, zona o persona…" value="${escapeHTML(state.storeSearch)}" data-search="stores"></label>${chip}${missingChip}${clearSearch}</div><span class="result-count" id="store-result-count">${formatNumber(stores.length)} de ${formatNumber(total)} tiendas</span></div>
        <div class="table-scroll" data-guide="stores-table"><table class="data-table"><caption class="sr-only">Tiendas incluidas en ${escapeHTML(currentCampaign().name)}</caption><thead><tr><th>Tienda</th><th>Zona · localidad</th><th>Turnos</th><th>Cajas</th><th>Persona que asigna</th><th>Colaborador</th></tr></thead><tbody id="stores-table-body">${renderStoreRows(stores)}</tbody></table></div>
      </section>`;
  }

  function renderStoreRows(stores = getStoreViewItems()) {
    if (!stores.length) return `<tr><td class="table-empty" colspan="6">No hay tiendas que coincidan con estos filtros.</td></tr>`;
    return stores.map((store) => {
      const overallStatus = getStoreCampaignStatus(store);
      const chain = getChain(store.chainId);
      const zone = getZone(store.zoneId);
      const collaborator = getCollaborator(store.collaboratorId);
      const storeStatusLabel = overallStatus === "complete" ? "Completo" : getStatusLabel(overallStatus);
      return `<tr><td><div class="table-primary-cell"><button class="link-button" type="button" data-action="open-store" data-store-id="${escapeHTML(store.id)}">${escapeHTML(store.name)}</button><span class="table-secondary">${escapeHTML(chain?.name || "")}</span></div></td><td>${escapeHTML(zone?.name || "—")}<span class="table-secondary"> · ${escapeHTML(store.locality)}</span></td><td><span class="state-badge is-${overallStatus}" aria-label="Turnos: ${storeStatusLabel}">${storeStatusLabel}</span></td><td>${formatNumber(store.checkoutShelfs)}</td><td>${store.managerId ? `<div class="table-primary-cell">${personLink(store.managerId)}<span class="table-secondary">${ROLE.storeManager}</span></div>` : `<span class="state-badge is-pending">Sin asignación</span>`}</td><td>${escapeHTML(collaborator?.name || "—")}</td></tr>`;
    }).join("");
  }

  function getVisibleCollaborators() {
    const query = state.collaboratorSearch.trim().toLocaleLowerCase("es-ES");
    return getScopedCollaborators().filter((collaborator) => {
      if (!query) return true;
      return [collaborator.name, collaborator.address, collaborator.locality, ...collaborator.contactIds.map((id) => getUser(id)?.name)].some((value) => String(value || "").toLocaleLowerCase("es-ES").includes(query));
    });
  }

  function renderCollaboratorCards(collaborators = getVisibleCollaborators()) {
    if (!collaborators.length) return `<div class="panel empty-state"><strong>No hay colaboradores en este ámbito</strong><span>Prueba otra campaña o revisa el acceso de la cuenta.</span></div>`;
    return collaborators.map((collaborator) => {
      const storeCount = getScopedStores().filter((store) => store.collaboratorId === collaborator.id).length;
      const groups = getCollaboratorGroups(collaborator);
      const contacts = collaborator.contactIds.map((id) => `<div class="collaborator-contact-item">${personLink(id)}<button class="text-button" type="button" data-action="edit-collaborator-contact" data-collaborator-id="${escapeHTML(collaborator.id)}" data-user-id="${escapeHTML(id)}">Modificar</button></div>`).join("");
      return `<article class="panel collaborator-card"><div><p class="eyebrow">ENTIDAD COLABORADORA</p><h2>${escapeHTML(collaborator.name)}</h2><p class="collaborator-address">${icon("pin")} ${escapeHTML(collaborator.address)} · ${escapeHTML(collaborator.locality)}</p></div><div class="collaborator-stats"><div class="collaborator-stat"><strong>${formatNumber(storeCount)}</strong><span>tiendas</span></div><div class="collaborator-stat"><strong>${formatNumber(getVolunteerCount(collaborator.id))}</strong><span>voluntarios · protegidos</span></div><div class="collaborator-stat"><strong>${formatNumber(groups.length)}</strong><span>grupos</span></div><div class="collaborator-stat"><strong>${formatNumber(collaborator.contactIds.length)}</strong><span>contactos</span></div></div><div class="collaborator-responsible"><span>${ROLE.collaboratorManager}</span>${personLink(collaborator.responsibleId)}</div><div class="collaborator-contact-list"><span class="table-secondary">Contactos:</span>${contacts}</div><div class="collaborator-card-actions"><button class="button button-soft" type="button" data-action="create-collaborator-contact" data-collaborator-id="${escapeHTML(collaborator.id)}">Crear contacto</button><button class="button button-soft" type="button" data-action="assign-collaborator-responsible" data-collaborator-id="${escapeHTML(collaborator.id)}">Asignar responsable</button><button class="button button-quiet" type="button" data-action="view-collaborator-groups" data-collaborator-id="${escapeHTML(collaborator.id)}">Ver grupos</button></div></article>`;
    }).join("");
  }

  function renderCollaborators() {
    const collaborators = getVisibleCollaborators();
    return `${renderPageHeading("Colaboradores", "Entidades participantes, contactos y resumen de actividad. El voluntariado se muestra sin datos personales.")}
      <div class="table-toolbar" data-guide="collaborator-list"><div class="toolbar-left"><label class="search-control"><span>${icon("search")}</span><span class="sr-only">Buscar colaboradores</span><input type="search" name="collaborator-search" autocomplete="off" placeholder="Buscar colaborador o contacto…" value="${escapeHTML(state.collaboratorSearch)}" data-search="collaborators"></label></div><span class="result-count" id="collaborator-result-count">${formatNumber(collaborators.length)} entidades</span></div>
      <div id="collaborator-list-grid" class="collaborator-grid">${renderCollaboratorCards(collaborators)}</div>`;
  }

  function getVisibleReports() {
    const query = state.reportSearch.trim().toLocaleLowerCase("es-ES");
    return getScopedReports().filter((report) => {
      const isPending = !report.solution;
      if (state.reportFilter === "pending" && !isPending) return false;
      if (state.reportFilter === "answered" && isPending) return false;
      if (!query) return true;
      const reporter = getUser(report.reportedBy);
      return [report.type, report.description, reporter?.name, report.creationDate].some((value) => String(value || "").toLocaleLowerCase("es-ES").includes(query));
    });
  }

  function renderReports() {
    const reports = getVisibleReports();
    const allCount = getScopedReports().length;
    const pendingCount = getScopedReports().filter((report) => !report.solution).length;
    const answeredCount = allCount - pendingCount;
    return `${renderPageHeading("Incidencias", "Consulta pendientes y respondidas. Cada incidencia admite una única respuesta.")}
      <section class="panel page-panel">
        <div class="report-toolbar" data-guide="report-filters"><div class="toolbar-left"><div class="view-switch" aria-label="Filtrar incidencias"><button type="button" class="filter-tab" data-action="report-filter" data-filter="all" aria-pressed="${state.reportFilter === "all"}">Todas · ${formatNumber(allCount)}</button><button type="button" class="filter-tab" data-action="report-filter" data-filter="pending" aria-pressed="${state.reportFilter === "pending"}">Pendientes · ${formatNumber(pendingCount)}</button><button type="button" class="filter-tab" data-action="report-filter" data-filter="answered" aria-pressed="${state.reportFilter === "answered"}">Respondidas · ${formatNumber(answeredCount)}</button></div><label class="search-control"><span>${icon("search")}</span><span class="sr-only">Buscar incidencias</span><input type="search" name="report-search" autocomplete="off" placeholder="Buscar incidencia o contacto…" value="${escapeHTML(state.reportSearch)}" data-search="reports"></label></div><span class="result-count" id="report-result-count">${formatNumber(reports.length)} resultados</span></div>
        <div class="reports-list" id="reports-list" data-guide="report-list">${renderReportRows(reports)}</div>
      </section>`;
  }

  function renderReportRows(reports = getVisibleReports()) {
    if (!reports.length) return `<div class="empty-state"><strong>No hay incidencias con este filtro</strong><span>Selecciona otro estado o cambia la búsqueda.</span></div>`;
    return reports.map((report) => {
      const reporter = getUser(report.reportedBy);
      const status = report.solution ? "complete" : "pending";
      return `<article class="report-row"><div class="report-row-main"><button class="link-button" type="button" data-action="open-report" data-report-id="${escapeHTML(report.id)}">${escapeHTML(report.type)} · ${escapeHTML(report.description)}</button><span class="report-row-description">${escapeHTML(report.description)}</span></div><div class="report-row-meta"><span>${formatDate(report.creationDate)}</span><span>Comunicada por ${reporter ? personLink(reporter.id) : "—"}</span></div>${stateBadge(status)}</article>`;
    }).join("");
  }

  function renderCalendarPage() {
    return `${renderPageHeading("Calendario", "Franjas de mañana y tarde · abre cada franja para consultar tiendas, cobertura y conflictos.")}
      <section class="panel calendar-page-panel" data-guide="calendar-page"><div class="panel-heading"><div><h2>Calendario de campaña</h2><p>Los totales se calculan sobre las tiendas de tu ámbito.</p></div>${renderCalendarLegend()}</div>${renderCalendar("calendar")}</section>`;
  }

  function renderCalendarLegend() {
    return `<div class="calendar-legend" aria-label="Estados de las franjas"><span><i class="legend-dot is-complete" aria-hidden="true"></i>Completa</span><span><i class="legend-dot is-pending" aria-hidden="true"></i>Pendiente</span><span><i class="legend-dot is-conflict" aria-hidden="true"></i>Conflicto</span><span><i class="legend-dot is-outside" aria-hidden="true"></i>Fuera de campaña</span></div>`;
  }

  function getCalendarMode(scope) {
    return state.calendarViews[scope] || "week";
  }

  function getCalendarOffset(scope, mode = getCalendarMode(scope)) {
    const key = `${scope}:${mode}`;
    if (Object.hasOwn(state.calendarOffsets, key)) return state.calendarOffsets[key];
    if (mode === "day") return getDayDifference(parseDate(currentCampaign().startDate), getTodayDate());
    return 0;
  }

  function getTodayOffset(mode) {
    const campaignStart = parseDate(currentCampaign().startDate);
    const today = getTodayDate();
    if (mode === "day") return getDayDifference(campaignStart, today);
    if (mode === "week") return getDayDifference(startOfWeek(campaignStart), startOfWeek(today)) / 7;
    return (today.getFullYear() - campaignStart.getFullYear()) * 12 + today.getMonth() - campaignStart.getMonth();
  }

  function getCalendarDates(scope, mode) {
    const start = parseDate(currentCampaign().startDate);
    const offset = getCalendarOffset(scope, mode);
    if (mode === "day") return [addDays(start, offset)];
    if (mode === "month") {
      const monthStart = new Date(start.getFullYear(), start.getMonth() + offset, 1);
      const gridStart = startOfWeek(monthStart);
      return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
    }
    const weekStart = addDays(startOfWeek(start), offset * 7);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }

  function getCalendarRangeLabel(dates, mode) {
    if (mode === "month") return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(dates[10]);
    if (mode === "day") return formatDate(toISODate(dates[0]), { weekday: "long", day: "numeric", month: "long" });
    return `${formatDate(toISODate(dates[0]), { day: "numeric", month: "short" })} — ${formatDate(toISODate(dates[6]), { day: "numeric", month: "short", year: "numeric" })}`;
  }

  function renderCalendar(scope, storeId = null) {
    const mode = getCalendarMode(scope);
    const dates = getCalendarDates(scope, mode);
    const stores = storeId ? [getStore(storeId)].filter(Boolean) : getScopedStores();
    const range = getCalendarRangeLabel(dates, mode);
    const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const viewButtons = [["day", "Día"], ["week", "Semana"], ["month", "Mes"]].map(([value, label]) => `<button type="button" data-action="calendar-view" data-scope="${escapeHTML(scope)}" data-view="${value}" aria-pressed="${mode === value}">${label}</button>`).join("");
    let body = "";
    if (mode === "day") body = renderCalendarDay(dates[0], stores, scope, storeId);
    if (mode === "week") body = renderTimeline(scope, dates, stores, mode);
    if (mode === "month") body = `<div class="calendar-month-grid">${weekdays.map((day) => `<span class="month-weekday">${day}</span>`).join("")}${dates.map((date) => renderMonthDay(date, stores, scope, storeId)).join("")}</div>`;
    const storeClass = storeId ? " calendar-component--store" : "";
    return `<div class="calendar-component${storeClass}" data-calendar-scope="${escapeHTML(scope)}" data-calendar-mode="${mode}"><div class="calendar-toolbar"><div class="calendar-toolbar-left"><div class="calendar-navigation"><button class="calendar-nav-button" type="button" data-action="calendar-shift" data-scope="${escapeHTML(scope)}" data-direction="-1" aria-label="Periodo anterior">${icon("left")}</button><span class="calendar-range">${escapeHTML(range)}</span><button class="calendar-nav-button" type="button" data-action="calendar-shift" data-scope="${escapeHTML(scope)}" data-direction="1" aria-label="Periodo siguiente">${icon("right")}</button><button class="calendar-today-button" type="button" data-action="calendar-today" data-scope="${escapeHTML(scope)}">Volver a hoy</button></div></div><div class="calendar-toolbar-right"><div class="calendar-view-switch" role="group" aria-label="Vista del calendario">${viewButtons}</div></div></div>${body}</div>`;
  }

  function renderTimeline(scope, dates, stores, mode) {
    const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => DAY_START_HOUR + index);
    const dayColumns = dates.map((date) => renderTimelineDayColumn(date, stores, scope)).join("");
    const timeRail = `<div class="timeline-time-rail"><span class="timeline-head-spacer" aria-hidden="true"></span><div class="timeline-time-labels">${hours.map((hour) => `<span>${String(hour).padStart(2, "0")}:00</span>`).join("")}</div><span class="timeline-time-end">23:00</span></div>`;
    return `<div class="calendar-timeline"><div class="calendar-timeline-body calendar-timeline-body--${mode}">${timeRail}${dayColumns}</div></div>`;
  }

  function renderTimelineDayColumn(date, stores, scope) {
    const iso = toISODate(date);
    const outside = iso < currentCampaign().startDate || iso > currentCampaign().endDate;
    const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(date).replace(".", "");
    const today = isToday(date);
    const events = ["morning", "afternoon"].map((slot) => renderTimelineEvent(iso, slot, stores)).join("");
    return `<section class="timeline-day-column${outside ? " is-outside" : ""}" aria-label="${escapeHTML(formatDate(iso, { weekday: "long", day: "numeric", month: "long" }))}"><header class="timeline-day-heading"><span>${escapeHTML(weekday)}</span><strong class="timeline-day-number${today ? " is-today" : ""}"${today ? ` aria-current="date"` : ""}>${new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(date)}</strong></header><div class="timeline-track">${events}</div><span class="timeline-day-end" aria-hidden="true"></span></section>`;
  }

  function renderTimelineEvent(date, slot, stores) {
    const summary = getSlotAggregate(date, slot, stores);
    const fraction = summary.state === "outside" ? "—" : `${formatNumber(summary.assigned)}/${formatNumber(summary.total)}`;
    const rows = stores.map((store) => ({ store, ...getSlotData(store, date, slot) }));
    const pendingStores = rows.filter((row) => row.state === "pending").length;
    const conflicts = [...new Set(rows.map((row) => row.conflict).filter(Boolean))];
    const note = summary.state === "outside" ? "Fuera de campaña" : summary.state === "conflict" ? `${conflicts.length} conflicto${conflicts.length === 1 ? "" : "s"}` : summary.state === "pending" ? `${formatNumber(pendingStores)} tiendas con turnos por asignar` : "Todas las tiendas completas";
    const warning = summary.state === "conflict" ? icon("warning") : "";
    const disabled = summary.state === "outside" ? " disabled" : "";
    const times = slot === "morning" ? "10:00–14:00" : "17:00–21:00";
    return `<button class="timeline-event timeline-event--${slot} is-${summary.state}" type="button" data-action="open-shift" data-date="${escapeHTML(date)}" data-slot="${slot}" aria-label="${slotLabel(slot)}, ${times}, ${formatDate(date, { day: "numeric", month: "long" })}, ${fraction} turnos, ${getStatusLabel(summary.state)}"${disabled}><span class="timeline-event-time">${slotLabel(slot)} · ${times}</span><strong class="timeline-event-fraction">${warning}${fraction}</strong><span class="timeline-event-status">${getStatusLabel(summary.state)}</span><span class="timeline-event-detail">${escapeHTML(note)}</span></button>`;
  }

  function renderCalendarDay(date, stores, scope, storeId) {
    const iso = toISODate(date);
    return `<div class="calendar-day-view" data-day-scope="${escapeHTML(scope)}">${renderTimeline(scope, [date], stores, "day")}${renderCalendarDayDetails(iso, stores)}</div>`;
  }

  function renderCalendarDayDetails(date, stores) {
    const day = getDayAggregate(date, stores);
    if (day.state === "outside") return `<div class="calendar-day-details"><div class="day-detail-empty">${stateBadge("outside")}<span>Esta fecha queda fuera del periodo de la campaña.</span></div></div>`;
    const rows = ["morning", "afternoon"].flatMap((slot) => stores.map((store) => ({ slot, store, ...getSlotData(store, date, slot) })));
    const pending = rows.filter((row) => row.state === "pending");
    const conflicts = day.conflicts;
    const pendingMarkup = pending.length ? pending.map((row) => `<button class="day-detail-row" type="button" data-action="open-store" data-store-id="${escapeHTML(row.store.id)}"><span><strong>${escapeHTML(row.store.name)}</strong><small>${slotLabel(row.slot)} · ${formatNumber(row.assigned)}/${formatNumber(row.total)} asignados</small></span><span class="day-detail-missing">Faltan ${formatNumber(row.total - row.assigned)}</span></button>`).join("") : `<p class="day-detail-empty">No hay turnos pendientes para esta fecha.</p>`;
    const conflictMarkup = conflicts.length ? conflicts.map((conflict) => `<button class="day-conflict-row" type="button" data-action="open-conflict" data-conflict-id="${escapeHTML(conflict.id)}"><span>${icon("warning")}</span><span><strong>${conflict.type === "same-person" ? "Misma persona en dos tiendas" : "Turno fuera del horario"}</strong><small>${escapeHTML(conflict.storeIds.map((storeId) => getStore(storeId)?.name || "Tienda").join(" · "))} · ${escapeHTML(conflict.volunteerAlias)}</small><small>${escapeHTML(conflict.reason)}</small></span></button>`).join("") : `<p class="day-detail-empty">No hay conflictos para esta fecha.</p>`;
    return `<div class="calendar-day-details"><section class="day-detail-panel"><div class="day-detail-heading"><h3>Turnos pendientes</h3><span class="state-badge ${pending.length ? "is-pending" : "is-complete"}">${formatNumber(pending.length)} tiendas</span></div><div class="day-detail-list">${pendingMarkup}</div></section><section class="day-detail-panel day-detail-panel--conflicts"><div class="day-detail-heading"><h3>Incidencias de turnos</h3><span class="state-badge ${conflicts.length ? "is-conflict" : "is-complete"}">${formatNumber(conflicts.length)} conflictos</span></div><div class="day-detail-list">${conflictMarkup}</div></section></div>`;
  }

  function renderMonthDay(date, stores, scope, storeId) {
    const iso = toISODate(date);
    const campaign = currentCampaign();
    const campaignStart = parseDate(campaign.startDate);
    const visibleMonth = new Date(campaignStart.getFullYear(), campaignStart.getMonth() + getCalendarOffset(scope, "month"), 1);
    const outsideMonth = date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear();
    const summary = getDayAggregate(iso, stores);
    const fraction = summary.state === "outside" ? "—" : `${formatNumber(summary.assigned)}/${formatNumber(summary.total)}`;
    const warning = summary.state === "conflict" ? icon("warning") : "";
    const today = isToday(date);
    const storeAttribute = storeId ? ` data-store-id="${escapeHTML(storeId)}"` : "";
    const outsideClass = outsideMonth ? " is-outside-month" : "";
    const disabled = summary.state === "outside" ? " disabled" : "";
    return `<button class="month-day-summary is-${summary.state}${outsideClass}" type="button" data-action="open-day" data-date="${escapeHTML(iso)}"${storeAttribute}${today ? ` aria-current="date"` : ""} aria-label="${formatDate(iso, { weekday: "long", day: "numeric", month: "long" })}: ${fraction} turnos, ${getStatusLabel(summary.state)}"${disabled}><span class="month-day-number${today ? " is-today" : ""}">${new Intl.DateTimeFormat("es-ES", { day: "numeric" }).format(date)}</span><strong class="month-day-fraction">${fraction}</strong><span class="month-day-status">${warning}${getStatusLabel(summary.state)}</span></button>`;
  }

  function renderCampaignMenu() {
    return `<div class="dropdown-heading">Selecciona una campaña</div>${DATA.campaigns.map((campaign) => `<button class="campaign-option" type="button" data-action="select-campaign" data-campaign-id="${escapeHTML(campaign.id)}" aria-current="${campaign.id === state.campaignId}"><span class="campaign-option-copy"><strong>${escapeHTML(campaign.name)}</strong><span>${formatDate(campaign.startDate)} — ${formatDate(campaign.endDate)}</span></span>${campaignBadge(campaign)}</button>`).join("")}`;
  }

  function renderNotificationMenu() {
    const icons = { calendar: "calendar", report: "alert", store: "store" };
    return `<div class="dropdown-heading">Novedades de la campaña</div>${DATA.notifications.map((notification) => `<button class="notification-option" type="button" data-action="open-notification" data-notification-id="${escapeHTML(notification.id)}"><span class="nav-icon">${icon(icons[notification.kind] || "bell")}</span><span class="notification-option-copy"><strong>${escapeHTML(notification.title)}</strong><span>${escapeHTML(notification.detail)}</span></span></button>`).join("")}`;
  }

  function renderProfileMenu() {
    const user = getUser(state.activeUserId);
    if (!user) return "";
    return `<div class="profile-menu-head">${personLink(user.id)}<span>${escapeHTML(user.email)} · ${escapeHTML(state.role)}</span></div><button class="profile-option" type="button" data-action="open-own-contact"><span class="nav-icon">${icon("user")}</span>Mi ficha de contacto</button><button class="profile-option" type="button" data-action="open-account-settings"><span class="nav-icon">${icon("edit")}</span>Ajustes de cuenta</button><button class="profile-option" type="button" data-action="open-preferences"><span class="nav-icon">${icon("list")}</span>Preferencias</button><button class="profile-option is-danger" type="button" data-action="logout"><span class="nav-icon">${icon("logout")}</span>Cerrar sesión</button>`;
  }

  function renderTopbar() {
    const campaign = currentCampaign();
    const adminMode = state.currentView.startsWith("admin");
    const brand = document.getElementById("brand-link");
    brand.href = adminMode ? "#admin" : "#dashboard";
    brand.dataset.route = adminMode ? "admin" : "dashboard";
    brand.setAttribute("aria-label", adminMode ? "Ir al resumen de administración" : "Ir al dashboard");
    document.getElementById("campaign-picker").hidden = adminMode;
    document.querySelectorAll(".primary-nav [data-nav='dashboard'], .primary-nav [data-nav='zones'], .primary-nav [data-nav='stores'], .primary-nav [data-nav='collaborators'], .primary-nav [data-nav='reports'], .primary-nav [data-nav='calendar']").forEach((link) => {
      link.hidden = adminMode;
    });
    document.getElementById("campaign-name").textContent = campaign.name;
    const campaignStatus = document.getElementById("campaign-status");
    campaignStatus.className = `status-badge ${campaign.readOnly ? "status-past" : "status-current"}`;
    campaignStatus.textContent = getCampaignState(campaign);
    document.querySelector("#campaign-trigger .icon-slot").innerHTML = icon("chevron");
    document.getElementById("campaign-menu").innerHTML = renderCampaignMenu();
    document.getElementById("notifications-menu").innerHTML = renderNotificationMenu();
    document.getElementById("profile-menu").innerHTML = renderProfileMenu();
    const menuIds = { campaign: "campaign-menu", notifications: "notifications-menu", profile: "profile-menu" };
    Object.entries(menuIds).forEach(([key, id]) => {
      document.getElementById(id).hidden = state.openDropdown !== key;
    });
    document.querySelector('[data-action="toggle-campaign"]').setAttribute("aria-expanded", String(state.openDropdown === "campaign"));
    document.querySelector('[data-action="toggle-notifications"]').setAttribute("aria-expanded", String(state.openDropdown === "notifications"));
    document.querySelector('[data-action="toggle-profile"]').setAttribute("aria-expanded", String(state.openDropdown === "profile"));
    const roleBadge = document.getElementById("role-badge");
    roleBadge.textContent = state.role || "";
    roleBadge.setAttribute("aria-label", `Rol activo: ${state.role || ""}`);
    document.getElementById("admin-entry").hidden = state.role !== ROLE.admin || adminMode;
    const adminModeLabel = document.getElementById("admin-mode-label");
    adminModeLabel.hidden = !adminMode;
    if (adminMode) adminModeLabel.setAttribute("aria-current", "page");
    else adminModeLabel.removeAttribute("aria-current");
    document.getElementById("admin-return").hidden = !adminMode;
    document.getElementById("notifications-anchor").hidden = adminMode;
    document.getElementById("section-links").hidden = adminMode || !window.CONFIG.SHOW_SECTIONS_IN_NAV;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const route = link.dataset.nav;
      const active = route === state.currentView || route === "admin" && state.currentView.startsWith("admin");
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function renderAdminNavigation() {
    const navItems = [{ id: "admin", title: "Resumen", icon: "grid" }, ...ADMIN_ENTITIES.map((entity) => ({ id: `admin-${entity.id}`, title: entity.title, icon: entity.icon }))];
    return `<aside class="admin-sidebar" data-guide="admin-nav"><p class="admin-sidebar-label">ADMINISTRACIÓN</p><nav aria-label="Navegación de administración">${navItems.map((item) => `<a class="admin-nav-link" href="#${item.id}" data-route="${item.id}"${item.id === state.currentView ? ` aria-current="page"` : ""}><span class="nav-icon">${icon(item.icon)}</span><span>${escapeHTML(item.title)}</span></a>`).join("")}</nav></aside>`;
  }

  function renderAdminSummary() {
    const recentAudit = DATA.audit.length;
    const records = {
      stores: { count: DATA.stores.length, detail: `${DATA.stores.filter((store) => !store.managerId).length} sin persona asignada` },
      chains: { count: DATA.chains.length, detail: "Códigos y tiendas asociadas" },
      collaborators: { count: DATA.collaborators.length, detail: `${formatNumber(DATA.volunteers.length)} voluntarios · anónimos` },
      zones: { count: DATA.zones.length, detail: "Asignaciones de campaña" },
      audit: { count: recentAudit, detail: "Eventos de muestra · solo lectura" },
      users: { count: DATA.users.length, detail: "Roles de acceso" },
      campaigns: { count: DATA.campaigns.length, detail: `${DATA.campaignTypes.length} tipos de campaña` }
    };
    return `${renderPageHeading("Administración", "Resumen de entidades y herramientas de gestión del mockup.", "", "admin-heading")}<div class="admin-summary-grid" data-guide="admin-cards">${ADMIN_ENTITIES.map((entity) => `<a class="admin-summary-card" href="#admin-${entity.id}" data-route="admin-${entity.id}"><div class="admin-summary-card-top"><h2>${escapeHTML(entity.title)}</h2><span class="nav-icon">${icon(entity.icon)}</span></div><span class="admin-summary-count">${formatNumber(records[entity.id].count)}</span><span class="admin-summary-detail">${escapeHTML(records[entity.id].detail)}</span></a>`).join("")}</div>`;
  }

  function getAdminRecords(entity) {
    const map = { stores: DATA.stores, chains: DATA.chains, collaborators: DATA.collaborators, zones: DATA.zones, audit: DATA.audit, users: DATA.users, campaigns: DATA.campaigns };
    return map[entity] || [];
  }

  function getAdminRecordId(entity, record) {
    if (entity === "audit") return record.id;
    return record.id;
  }

  function getAdminRecordTitle(entity, record) {
    if (entity === "audit") return `${record.action} · ${record.entity}`;
    if (entity === "users") return record.name;
    return record.name || "Registro";
  }

  function getAdminVisibleRecords(entity) {
    const query = state.adminSearch.trim().toLocaleLowerCase("es-ES");
    const records = getAdminRecords(entity);
    if (!query) return records;
    return records.filter((record) => JSON.stringify(record).toLocaleLowerCase("es-ES").includes(query) || getAdminRecordTitle(entity, record).toLocaleLowerCase("es-ES").includes(query));
  }

  function renderAdminRows(entity) {
    const records = getAdminVisibleRecords(entity);
    if (!records.length) return `<tr><td class="table-empty" colspan="${(ADMIN_COLUMNS[entity] || []).length + (entity === "audit" ? 0 : 1)}">No hay resultados para esta búsqueda.</td></tr>`;
    return records.map((record) => {
      const columns = ADMIN_COLUMNS[entity] || [];
      const contextualAction = entity === "zones" ? `<button class="button button-quiet" type="button" data-action="admin-zone-stores" data-zone-id="${escapeHTML(record.id)}">Tiendas</button>` : entity === "chains" ? `<button class="button button-quiet" type="button" data-action="admin-chain-stores" data-chain-id="${escapeHTML(record.id)}">Tiendas</button>` : "";
      const actions = entity === "audit" ? "" : `<td class="table-actions"><div class="admin-row-actions"><button class="button button-quiet" type="button" data-action="admin-view" data-entity="${entity}" data-record-id="${escapeHTML(getAdminRecordId(entity, record))}" aria-label="Ver ${escapeHTML(getAdminRecordTitle(entity, record))}">${icon("eye")} Ver</button>${contextualAction}<button class="button button-quiet" type="button" data-action="admin-edit" data-entity="${entity}" data-record-id="${escapeHTML(getAdminRecordId(entity, record))}" aria-label="Editar ${escapeHTML(getAdminRecordTitle(entity, record))}">${icon("edit")} Editar</button><button class="button button-quiet" type="button" data-action="admin-delete" data-entity="${entity}" data-record-id="${escapeHTML(getAdminRecordId(entity, record))}" aria-label="Eliminar ${escapeHTML(getAdminRecordTitle(entity, record))}">${icon("trash")} Borrar</button></div></td>`;
      return `<tr>${columns.map((column) => `<td>${column.render(record)}</td>`).join("")}${actions}</tr>`;
    }).join("");
  }

  function renderAdminEntity(entity) {
    const descriptor = ADMIN_ENTITIES.find((item) => item.id === entity);
    if (!descriptor) return renderAdminSummary();
    const isAudit = entity === "audit";
    const actions = isAudit ? "" : entity === "campaigns" ? `<button class="button button-soft" type="button" data-action="campaign-type-create">Crear tipo</button><button class="button button-primary" type="button" data-action="campaign-wizard">${icon("plus")} Crear campaña</button>` : entity === "zones" || entity === "chains" ? `<a class="button button-soft" href="#admin-stores" data-route="admin-stores">Ver todas las tiendas</a><button class="button button-primary" type="button" data-action="admin-create" data-entity="${entity}">${icon("plus")} Crear ${escapeHTML(descriptor.title.toLocaleLowerCase("es-ES"))}</button>` : `<button class="button button-primary" type="button" data-action="admin-create" data-entity="${entity}">${icon("plus")} Crear ${escapeHTML(descriptor.title.toLocaleLowerCase("es-ES"))}</button>`;
    const description = entity === "audit" ? "Eventos de ejemplo basados en actividad de campaña · vista de solo lectura." : entity === "users" ? "Los roles se editan aquí. Las asignaciones a campañas y zonas se hacen en su contexto." : `${formatNumber(getAdminRecords(entity).length)} registros de muestra · acciones sin persistencia.`;
    const columns = ADMIN_COLUMNS[entity] || [];
    return `${renderPageHeading(descriptor.title, description, "", "admin-entity-heading")}<section class="panel admin-entity-panel"><div class="admin-entity-toolbar" data-guide="admin-actions"><div class="toolbar-left"><label class="search-control"><span>${icon("search")}</span><span class="sr-only">Buscar ${escapeHTML(descriptor.title.toLocaleLowerCase("es-ES"))}</span><input type="search" name="admin-search" autocomplete="off" placeholder="Buscar…" value="${escapeHTML(state.adminSearch)}" data-search="admin"></label><span class="result-count" id="admin-result-count">${formatNumber(getAdminVisibleRecords(entity).length)} resultados</span></div><div class="admin-entity-toolbar-actions">${actions}</div></div><div class="table-scroll" data-guide="admin-table"><table class="data-table"><caption class="sr-only">${escapeHTML(descriptor.title)} del panel de administración</caption><thead><tr>${columns.map((column) => `<th>${escapeHTML(column.label)}</th>`).join("")}${isAudit ? "" : "<th>Acciones</th>"}</tr></thead><tbody id="admin-table-body" data-admin-entity="${entity}">${renderAdminRows(entity)}</tbody></table></div>${entity === "users" ? `<p class="form-note">No se muestran datos personales de voluntariado. Los datos de prueba se limitan a cuentas no voluntarias.</p>` : ""}${entity === "audit" ? `<p class="form-note">El modelo de datos actual no incluye una tabla de auditoría; este contenido solo ilustra la vista solicitada.</p>` : ""}</section>`;
  }

  function renderAdminWorkspace() {
    const content = state.currentView === "admin" ? renderAdminSummary() : renderAdminEntity(state.currentView.replace("admin-", ""));
    return `<div class="admin-layout">${renderAdminNavigation()}<section class="admin-content">${content}</section></div>`;
  }

  function renderView() {
    if (state.currentView === "dashboard") return renderDashboard();
    if (state.currentView === "zones") return renderZones();
    if (state.currentView === "stores") return renderStores();
    if (state.currentView === "collaborators") return renderCollaborators();
    if (state.currentView === "reports") return renderReports();
    if (state.currentView === "calendar") return renderCalendarPage();
    if (state.currentView.startsWith("admin")) return renderAdminWorkspace();
    return renderDashboard();
  }

  function renderReadOnlyBanner() {
    const banner = document.getElementById("readonly-banner");
    const campaign = currentCampaign();
    const adminMode = state.currentView.startsWith("admin");
    banner.hidden = !campaign.readOnly || adminMode;
    banner.innerHTML = campaign.readOnly && !adminMode ? `${icon("clock")}<span><strong>Solo lectura:</strong> ${escapeHTML(campaign.name)} ha finalizado. La consulta está disponible y las acciones de cambio están deshabilitadas.</span>` : "";
  }

  function render() {
    const authShell = document.getElementById("auth-shell");
    const appShell = document.getElementById("app-shell");
    authShell.hidden = state.signedIn;
    appShell.hidden = !state.signedIn;
    document.getElementById("login-panel").hidden = state.authMode !== "login";
    document.getElementById("register-panel").hidden = state.authMode !== "register";
    if (!state.signedIn) {
      document.getElementById("popup-root").innerHTML = "";
      document.getElementById("tutorial-root").innerHTML = "";
      return;
    }
    renderTopbar();
    renderReadOnlyBanner();
    const main = document.getElementById("main-content");
    main.classList.toggle("main-content--dashboard", state.currentView === "dashboard");
    document.getElementById("view-root").innerHTML = renderView();
    renderPopupStack();
    renderTutorial();
  }

  function renderCalendarSlotPopup(popup, index) {
    const date = popup.date;
    const stores = popup.storeId ? [getStore(popup.storeId)].filter(Boolean) : getScopedStores();
    let rows = stores.map((store) => ({ store, ...getSlotData(store, date, popup.slot) }));
    if (state.shiftSort === "status") {
      const order = { complete: 0, pending: 1, conflict: 2, outside: 3 };
      rows = rows.sort((first, second) => order[first.state] - order[second.state] || first.store.order - second.store.order);
    } else {
      rows = rows.sort((first, second) => first.store.order - second.store.order);
    }
    const summary = getSlotAggregate(date, popup.slot, stores);
    const sortButtons = `<div class="sort-switch" role="group" aria-label="Ordenar tiendas"><button type="button" data-action="shift-sort" data-sort="default" aria-pressed="${state.shiftSort === "default"}">Orden de tiendas</button><button type="button" data-action="shift-sort" data-sort="status" aria-pressed="${state.shiftSort === "status"}">Por estado</button></div>`;
    const rowMarkup = rows.length ? rows.map((row) => `<article class="shift-store-row is-${row.state}"><div class="shift-store-main"><button class="link-button" type="button" data-action="open-store" data-store-id="${escapeHTML(row.store.id)}">${escapeHTML(row.store.name)}</button><span>${escapeHTML(getZone(row.store.zoneId)?.name || "")} · ${escapeHTML(getChain(row.store.chainId)?.name || "")}</span></div><strong class="shift-fraction">${row.state === "outside" ? "—" : `${formatNumber(row.assigned)}/${formatNumber(row.total)}`}</strong><div>${stateBadge(row.state)}${row.conflict ? `<button class="shift-conflict-action" type="button" data-action="open-conflict" data-conflict-id="${escapeHTML(row.conflict.id)}">${icon("warning")} Ver conflicto</button>` : ""}</div><div class="shift-store-assigner"><span>${ROLE.storeManager}</span>${row.store.managerId ? personLink(row.store.managerId) : `<span>Sin asignación</span>`}</div><span class="table-secondary">${formatNumber(row.store.checkoutShelfs)} cajas</span></article>`).join("") : `<div class="empty-state"><strong>No hay tiendas en este ámbito</strong><span>Revisa la campaña o el rol activo.</span></div>`;
    const body = `<div class="slot-summary">${stateBadge(summary.state)}<strong>${summary.state === "outside" ? "Fuera de campaña" : `${formatNumber(summary.assigned)} / ${formatNumber(summary.total)} turnos`}</strong><span>${formatNumber(stores.length)} tiendas visibles · ${slotLabel(popup.slot).toLocaleLowerCase("es-ES")} · ${popup.slot === "morning" ? "10:00–14:00" : "17:00–21:00"}</span></div><div class="table-toolbar"><span class="result-count">${formatNumber(rows.length)} tiendas</span>${sortButtons}</div><div class="shift-list">${rowMarkup}</div>`;
    return dialogMarkup(index, `Franja de ${slotLabel(popup.slot).toLocaleLowerCase("es-ES")}`, formatDate(date, { weekday: "long", day: "numeric", month: "long" }), body, "wide");
  }

  function renderDaySummaryPopup(popup, index) {
    const stores = popup.storeId ? [getStore(popup.storeId)].filter(Boolean) : getScopedStores();
    const summary = getDayAggregate(popup.date, stores);
    const slots = ["morning", "afternoon"].map((slot) => {
      const slotSummary = summary[slot];
      const timeRange = slot === "morning" ? "10:00–14:00" : "17:00–21:00";
      return `<section class="day-summary-slot"><div><h3>${slotLabel(slot)} · ${timeRange}</h3><strong>${formatNumber(slotSummary.assigned)}/${formatNumber(slotSummary.total)}</strong></div>${stateBadge(slotSummary.state)}<button class="button button-soft" type="button" data-action="open-day-slot" data-date="${escapeHTML(popup.date)}" data-slot="${slot}"${popup.storeId ? ` data-store-id="${escapeHTML(popup.storeId)}"` : ""}>Ver tiendas</button></section>`;
    }).join("");
    const body = `<div class="slot-summary">${stateBadge(summary.state)}<strong>${summary.state === "outside" ? "Fuera de campaña" : `${formatNumber(summary.assigned)} / ${formatNumber(summary.total)} turnos del día`}</strong><span>${formatNumber(stores.length)} tiendas visibles</span></div><div class="day-summary-slot-grid">${slots}</div>${renderCalendarDayDetails(popup.date, stores)}`;
    return dialogMarkup(index, "Resumen del día", formatDate(popup.date, { weekday: "long", day: "numeric", month: "long" }), body, "wide");
  }

  function renderStorePopup(popup, index) {
    const store = getStore(popup.storeId);
    if (!store) return dialogMarkup(index, "Tienda no disponible", "", `<p class="muted-note">No se encuentra la tienda seleccionada.</p>`, "wide");
    const collaborator = getCollaborator(store.collaboratorId);
    const manager = getUser(store.managerId);
    const coverage = getStoreCoverage(store);
    const morningStatus = getStoreSlotCampaignStatus(store, "morning");
    const afternoonStatus = getStoreSlotCampaignStatus(store, "afternoon");
    const overallStatus = getStoreCampaignStatus(store);
    const overview = `<div class="store-overview-grid"><section class="store-detail-card"><h3>Establecimiento</h3><p><strong>${escapeHTML(store.address)}</strong></p><p>${escapeHTML(store.locality)} · ${escapeHTML(store.postalCode)}</p><p>${escapeHTML(getZone(store.zoneId)?.name || "")} · ${escapeHTML(getChain(store.chainId)?.name || "")}</p><p>Mañana ${escapeHTML(store.schedule.morning.opening)}–${escapeHTML(store.schedule.morning.closing)} · tarde ${escapeHTML(store.schedule.afternoon.opening)}–${escapeHTML(store.schedule.afternoon.closing)}</p></section><section class="store-detail-card"><h3>Turnos de campaña</h3><div class="store-metric-pair"><span>Mañana</span><span class="store-metric-value"><strong>${formatNumber(store.coverage.morning.assigned)}/${formatNumber(store.coverage.morning.total)}</strong>${stateBadge(morningStatus)}</span></div><div class="store-metric-pair"><span>Tarde</span><span class="store-metric-value"><strong>${formatNumber(store.coverage.afternoon.assigned)}/${formatNumber(store.coverage.afternoon.total)}</strong>${stateBadge(afternoonStatus)}</span></div><div class="store-metric-pair"><span>Total asignado</span><strong>${formatNumber(coverage.assigned)}/${formatNumber(coverage.total)}</strong></div></section><section class="store-detail-card"><h3>${ROLE.storeManager}</h3><p>${manager ? personLink(manager.id) : `<span class="state-badge is-pending">Sin asignación</span>`}</p><p>${manager ? escapeHTML(manager.email) : "La tienda no tiene una persona asignada."}</p><p>${manager ? escapeHTML(manager.phone) : ""}</p></section><section class="store-detail-card"><h3>Entidad colaboradora</h3><p><strong>${escapeHTML(collaborator?.name || "—")}</strong></p><p>${escapeHTML(collaborator?.address || "")}</p><p>${collaborator ? collaborator.contactIds.map((id) => personLink(id)).join(" ") : ""}</p><p>${formatNumber(store.checkoutShelfs)} cajas</p></section></div>`;
    const body = `<div class="dialog-body--store">${overview}<section class="store-calendar-panel"><div class="panel-heading"><div><h3>Calendario de esta tienda</h3><p>Franjas de 10:00–14:00 y 17:00–21:00</p></div><div class="store-calendar-status">${stateBadge(overallStatus)}<span class="tag">${formatNumber(coverage.assigned)}/${formatNumber(coverage.total)} turnos</span></div></div>${renderCalendar(`store-${store.id}`, store.id)}</section></div>`;
    return dialogMarkup(index, store.name, `${getChain(store.chainId)?.name || ""} · ${getZone(store.zoneId)?.name || ""}`, body, "store", true);
  }

  function renderConflictPopup(popup, index) {
    const conflict = getConflict(popup.conflictId);
    if (!conflict) return dialogMarkup(index, "Conflicto no disponible", "", `<p class="muted-note">No se encuentra el detalle seleccionado.</p>`, "wide");
    const collaborator = getCollaborator(conflict.collaboratorId);
    const affected = conflict.storeIds.map((storeId, storeIndex) => {
      const store = getStore(storeId);
      const assignerId = conflict.assignerIds[storeIndex];
      return `<div class="conflict-affected-item"><div><strong>${escapeHTML(store?.name || "Tienda")}</strong><p class="table-secondary">${ROLE.storeManager}: ${personLink(assignerId)}</p></div><button class="button button-soft" type="button" data-action="open-store" data-store-id="${escapeHTML(storeId)}">Abrir tienda</button></div>`;
    }).join("");
    const kind = conflict.type === "same-person" ? "Misma persona en dos tiendas" : "Turno fuera del horario actualizado";
    const body = `<div class="conflict-detail-grid"><section class="detail-block"><h3>Tipo de conflicto</h3><p><span class="state-badge is-conflict">${icon("warning")}${escapeHTML(kind)}</span></p><p>${formatDate(conflict.date, { weekday: "long", day: "numeric", month: "long" })} · ${escapeHTML(slotLabel(conflict.slot))}</p></section><section class="detail-block"><h3>Entidad colaboradora</h3><p><strong>${escapeHTML(collaborator?.name || "—")}</strong></p><p>Afectado: <strong>${escapeHTML(conflict.volunteerAlias)}</strong></p></section><section class="detail-block detail-block-wide"><h3>Motivo</h3><p>${escapeHTML(conflict.reason)}</p></section></div><section class="detail-block conflict-stores-block"><h3>Tiendas y asignación</h3><div class="conflict-affected-list">${affected}</div></section>`;
    return dialogMarkup(index, "Detalle del conflicto", "Datos de voluntariado anonimizados", body, "wide");
  }

  function renderContactPopup(popup, index) {
    const user = getUser(popup.userId);
    if (!user) return dialogMarkup(index, "Ficha de contacto", "", `<p class="muted-note">El contacto no está disponible.</p>`, "small");
    const collaborator = user.collaboratorId ? getCollaborator(user.collaboratorId) : null;
    const body = `<div class="contact-detail-grid"><section class="detail-block"><h3>Persona</h3><p><strong>${escapeHTML(user.name)}</strong></p><p>${roleTags(user.roles)}</p></section><section class="detail-block"><h3>Entidad colaboradora</h3><p>${escapeHTML(collaborator?.name || "Administración")}</p></section><section class="detail-block"><h3>Correo</h3><p>${icon("mail")} ${escapeHTML(user.email)}</p></section><section class="detail-block"><h3>Teléfono</h3><p>${icon("phone")} ${escapeHTML(user.phone)}</p></section></div>`;
    return dialogMarkup(index, "Ficha de contacto", "Persona no voluntaria · datos de muestra", body, "wide");
  }

  function getCollaboratorGroups(collaborator) {
    if (collaborator?.groups?.length) return collaborator.groups;
    return [{ id: `group-${collaborator?.id || "sample"}`, name: "Grupo principal", leaderId: collaborator?.responsibleId, volunteerCount: 0 }];
  }

  function renderCollaboratorGroupsPopup(popup, index) {
    const collaborator = getCollaborator(popup.collaboratorId);
    if (!collaborator) return dialogMarkup(index, "Grupos no disponibles", "", `<p class="muted-note">No se encuentra la entidad colaboradora.</p>`, "wide");
    const groups = getCollaboratorGroups(collaborator);
    const groupCards = groups.map((group) => `<article class="collaborator-group-card"><div><h3>${escapeHTML(group.name)}</h3><p>${ROLE.collaboratorManager} · líder</p>${personLink(group.leaderId)}</div><div class="collaborator-group-count"><strong>${formatNumber(group.volunteerCount)}</strong><span>voluntarios</span></div></article>`).join("");
    const body = `<p class="muted-note">Los grupos muestran su líder y el conteo de voluntarios. No se muestran nombres ni datos personales del voluntariado.</p><div class="collaborator-group-list">${groupCards}</div>`;
    return dialogMarkup(index, `Grupos · ${collaborator.name}`, `${formatNumber(groups.length)} grupos en la entidad`, body, "wide");
  }

  function renderCollaboratorContactForm(popup, index) {
    const collaborator = getCollaborator(popup.collaboratorId);
    const user = popup.userId ? getUser(popup.userId) : null;
    const title = user ? "Modificar contacto" : "Crear contacto";
    const body = `<form class="admin-form" data-form="collaborator-contact"><label class="sr-only" for="collaborator-contact-id">Identificador de entidad</label><input id="collaborator-contact-id" type="hidden" name="collaboratorId" value="${escapeHTML(collaborator?.id || "")}"><div class="form-grid"><div class="form-field is-full"><label for="collaborator-contact-name">Nombre y apellidos</label><input id="collaborator-contact-name" name="name" type="text" autocomplete="off" value="${escapeHTML(user?.name || "")}" placeholder="Nombre Apellido…" required></div><div class="form-field"><label for="collaborator-contact-email">Correo electrónico</label><input id="collaborator-contact-email" name="email" type="email" autocomplete="off" spellcheck="false" value="${escapeHTML(user?.email || "")}" placeholder="nombre@ejemplo.es…" required></div><div class="form-field"><label for="collaborator-contact-phone">Teléfono</label><input id="collaborator-contact-phone" name="phone" type="tel" inputmode="tel" autocomplete="off" value="${escapeHTML(user?.phone || "")}" placeholder="600 000 000…"></div></div><p class="form-note">El contacto es una persona no voluntaria. La confirmación no guarda datos.</p><div class="dialog-footer"><button class="button button-quiet" type="button" data-action="close-popup">Cancelar</button><button class="button button-primary" type="submit">${user ? "Confirmar modificación" : "Crear contacto"}</button></div></form>`;
    return dialogMarkup(index, title, collaborator?.name || "Entidad colaboradora", body, "wide", true);
  }

  function renderCollaboratorResponsiblePopup(popup, index) {
    const collaborator = getCollaborator(popup.collaboratorId);
    if (!collaborator) return dialogMarkup(index, "Responsable no disponible", "", `<p class="muted-note">No se encuentra la entidad colaboradora.</p>`, "wide");
    const options = collaborator.contactIds.map((userId) => {
      const user = getUser(userId);
      return user ? `<option value="${escapeHTML(user.id)}"${user.id === collaborator.responsibleId ? " selected" : ""}>${escapeHTML(user.name)} · ${escapeHTML(user.roles.join(", "))}</option>` : "";
    }).join("");
    const body = `<form class="admin-form" data-form="collaborator-responsible"><div class="form-field"><label for="collaborator-responsible-select">Responsable de ${escapeHTML(collaborator.name)} · ${ROLE.collaboratorManager}</label><select id="collaborator-responsible-select" name="userId" autocomplete="off" required>${options}</select></div><p class="form-note">El cambio se muestra solo en esta simulación.</p><div class="dialog-footer"><button class="button button-quiet" type="button" data-action="close-popup">Cancelar</button><button class="button button-primary" type="submit">Confirmar asignación simulada</button></div></form>`;
    return dialogMarkup(index, "Asignar responsable", collaborator.name, body, "wide", true);
  }

  function renderReportPopup(popup, index) {
    const report = getReport(popup.reportId);
    if (!report) return dialogMarkup(index, "Incidencia no disponible", "", `<p class="muted-note">No se encuentra la incidencia seleccionada.</p>`, "wide");
    const reporter = getUser(report.reportedBy);
    const solver = getUser(report.solvedBy);
    const isAnswered = Boolean(report.solution);
    const response = isAnswered ? `<section class="incident-response"><h3>Respuesta única</h3><p class="incident-description">${escapeHTML(report.solution)}</p><p class="incident-response-note">Respondida por ${solver ? personLink(solver.id) : "—"} · ${report.resolutionDate ? formatDate(report.resolutionDate) : ""}. No se admiten más respuestas.</p></section>` : `<form class="incident-response" data-form="report-response"><label for="report-response-text">Respuesta simulada</label><textarea id="report-response-text" name="response" autocomplete="off" placeholder="Escribe una respuesta de ejemplo…" required${currentCampaign().readOnly ? " disabled" : ""}></textarea><p class="incident-response-note">La respuesta solo genera un aviso visual; no se guarda.</p><button class="button button-primary" type="submit"${currentCampaign().readOnly ? " disabled" : ""}>Enviar respuesta simulada</button></form>`;
    const body = `<div class="contact-detail-grid"><section class="detail-block"><h3>Estado</h3><p>${stateBadge(isAnswered ? "complete" : "pending")}</p><p>${escapeHTML(report.type)} · ${formatDate(report.creationDate)}</p></section><section class="detail-block"><h3>Comunicada por</h3><p>${reporter ? personLink(reporter.id) : "—"}</p><p>${reporter ? escapeHTML(reporter.email) : ""}</p></section></div><p class="incident-description">${escapeHTML(report.description)}</p>${response}`;
    return dialogMarkup(index, `Incidencia · ${report.type}`, formatDate(report.creationDate), body, "wide");
  }

  function getAdminRecord(entity, recordId) {
    return getAdminRecords(entity).find((record) => record.id === recordId);
  }

  function renderAdminRecordPopup(popup, index) {
    const record = getAdminRecord(popup.entity, popup.recordId);
    if (!record) return dialogMarkup(index, "Registro no disponible", "", `<p class="muted-note">No se encuentra el registro seleccionado.</p>`, "wide");
    const columns = ADMIN_COLUMNS[popup.entity] || [];
    const body = `<div class="contact-detail-grid">${columns.map((column) => `<section class="detail-block"><h3>${escapeHTML(column.label)}</h3><p>${column.render(record)}</p></section>`).join("")}</div>`;
    return dialogMarkup(index, getAdminRecordTitle(popup.entity, record), ADMIN_ENTITIES.find((entity) => entity.id === popup.entity)?.title || "", body, "wide");
  }

  function getZonePopupVisibleStores(popup) {
    const query = (popup.search || "").trim().toLocaleLowerCase("es-ES");
    if (!query) return DATA.stores;
    return DATA.stores.filter((store) => [store.name, store.address, store.locality, getChain(store.chainId)?.name, getZone(store.zoneId)?.name].some((value) => String(value || "").toLocaleLowerCase("es-ES").includes(query)));
  }

  function renderZoneStoreRows(popup) {
    const selectedIds = new Set(popup.selectedStoreIds || []);
    const stores = getZonePopupVisibleStores(popup);
    if (!stores.length) return `<div class="empty-state"><strong>No hay tiendas que coincidan</strong><span>Cambia la búsqueda para ver otros establecimientos.</span></div>`;
    return stores.map((store) => `<label class="zone-store-option"><input type="checkbox" data-zone-store-id="${escapeHTML(store.id)}"${selectedIds.has(store.id) ? " checked" : ""}><span><strong>${escapeHTML(store.name)}</strong><small>${escapeHTML(getChain(store.chainId)?.name || "")} · ${escapeHTML(getZone(store.zoneId)?.name || "")} · ${escapeHTML(store.locality)}</small></span></label>`).join("");
  }

  function renderAdminZoneStoresPopup(popup, index) {
    const zone = getZone(popup.zoneId);
    if (!zone) return dialogMarkup(index, "Zona no disponible", "", `<p class="muted-note">No se encuentra la zona seleccionada.</p>`, "wide");
    const body = `<form class="zone-store-assignment" data-form="zone-stores"><div class="table-toolbar"><label class="search-control"><span>${icon("search")}</span><span class="sr-only">Buscar tiendas para la zona</span><input type="search" name="zone-store-search" autocomplete="off" placeholder="Buscar tienda, cadena o localidad…" value="${escapeHTML(popup.search || "")}" data-search="zone-stores"></label><span id="zone-selected-count" class="result-count"></span></div><div id="zone-store-list" class="zone-store-list">${renderZoneStoreRows(popup)}</div><p class="form-note">Marca o desmarca tiendas para esta zona. La selección es temporal y no se guarda.</p><div class="dialog-footer"><button class="button button-quiet" type="button" data-action="close-popup">Cancelar</button><button class="button button-primary" type="submit">Confirmar cambios simulados</button></div></form>`;
    return dialogMarkup(index, `Tiendas · ${zone.name}`, "Añadir o quitar establecimientos de la zona", body, "wide", true);
  }

  function renderAdminChainStoresPopup(popup, index) {
    const chain = getChain(popup.chainId);
    if (!chain) return dialogMarkup(index, "Cadena no disponible", "", `<p class="muted-note">No se encuentra la cadena seleccionada.</p>`, "wide");
    const stores = DATA.stores.filter((store) => store.chainId === chain.id);
    const rows = stores.map((store) => `<tr><td><strong>${escapeHTML(store.name)}</strong><span class="table-secondary">${escapeHTML(store.locality)} · ${escapeHTML(getZone(store.zoneId)?.name || "")}</span></td><td>${store.managerId ? personLink(store.managerId) : `<span class="state-badge is-pending">Sin asignación</span>`}</td><td>${formatNumber(store.checkoutShelfs)}</td><td><div class="admin-row-actions"><button class="button button-quiet" type="button" data-action="admin-view" data-entity="stores" data-record-id="${escapeHTML(store.id)}">Ver</button><button class="button button-quiet" type="button" data-action="admin-edit" data-entity="stores" data-record-id="${escapeHTML(store.id)}">Editar</button><button class="button button-quiet" type="button" data-action="admin-delete" data-entity="stores" data-record-id="${escapeHTML(store.id)}">Borrar</button></div></td></tr>`).join("");
    const body = `<div class="table-scroll"><table class="data-table"><caption class="sr-only">Tiendas de ${escapeHTML(chain.name)}</caption><thead><tr><th>Tienda</th><th>Persona que asigna</th><th>Cajas</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div><div class="dialog-footer"><span class="result-count">${formatNumber(stores.length)} tiendas</span><button class="button button-primary" type="button" data-action="admin-chain-store-create" data-chain-id="${escapeHTML(chain.id)}">${icon("plus")} Crear tienda en esta cadena</button></div>`;
    return dialogMarkup(index, `Tiendas · ${chain.name}`, `Cadena ${chain.code}`, body, "wide");
  }

  function renderAdminFormPopup(popup, index) {
    const descriptor = ADMIN_ENTITIES.find((item) => item.id === popup.entity);
    const record = popup.recordId ? getAdminRecord(popup.entity, popup.recordId) : null;
    const fields = ADMIN_FORM_FIELDS[popup.entity] || [];
    const formFields = fields.map((field) => renderFormField(field, record, popup.entity, popup.initialValues)).join("");
    const help = popup.entity === "users" ? `<p class="form-note">${record ? `Ficha de contacto: ${personLink(record.id)} · ` : ""}El rol es editable aquí. Las asignaciones a campañas y zonas no se modifican desde este formulario.</p>` : `<p class="form-note">Vista de prueba: confirmar cerrará el formulario sin guardar cambios.</p>`;
    const body = `<form class="admin-form" data-form="admin-record"><div class="form-grid">${formFields}</div>${help}<div class="dialog-footer"><button class="button button-quiet" type="button" data-action="close-popup">Cancelar</button><button class="button button-primary" type="submit">${popup.mode === "edit" ? "Confirmar edición simulada" : "Crear registro simulado"}</button></div></form>`;
    return dialogMarkup(index, `${popup.mode === "edit" ? "Editar" : "Crear"} ${descriptor?.title.toLocaleLowerCase("es-ES") || "registro"}`, record ? getAdminRecordTitle(popup.entity, record) : "Datos de muestra", body, "wide", true);
  }

  function getFieldValue(field, record, entity, initialValues = {}) {
    if (Object.hasOwn(initialValues, field.name)) return initialValues[field.name];
    if (!record) return field.name === "startDate" ? "2026-12-01" : field.name === "endDate" ? "2026-12-20" : field.name === "role" ? ROLE.coordinator : "";
    if (field.name === "role") return record.roles?.[0] || ROLE.coordinator;
    return record[field.name] ?? "";
  }

  function renderFormField(field, record, entity, initialValues = {}) {
    const value = getFieldValue(field, record, entity, initialValues);
    const id = `field-${entity}-${field.name}`;
    const required = field.required ? " required" : "";
    let control = "";
    if (field.type === "select") {
      const options = field.options ? field.options() : [];
      control = `<select id="${id}" name="${escapeHTML(field.name)}" autocomplete="off"${required}>${options.map(([optionValue, label]) => `<option value="${escapeHTML(optionValue)}"${String(value) === String(optionValue) ? " selected" : ""}>${escapeHTML(label)}</option>`).join("")}</select>`;
    } else {
      const spellcheck = field.type === "email" ? ` spellcheck="false"` : "";
      control = `<input id="${id}" name="${escapeHTML(field.name)}" type="${escapeHTML(field.type)}" autocomplete="off" value="${escapeHTML(value)}"${field.type === "number" ? " min=\"0\" inputmode=\"numeric\"" : ""}${spellcheck}${required}>`;
    }
    return `<div class="form-field${field.full ? " is-full" : ""}"><label for="${id}">${escapeHTML(field.label)}</label>${control}</div>`;
  }

  function renderDeletePopup(popup, index) {
    const record = getAdminRecord(popup.entity, popup.recordId);
    const title = record ? getAdminRecordTitle(popup.entity, record) : "este registro";
    const body = `<p class="confirm-copy">¿Confirmas la acción visual sobre <strong>${escapeHTML(title)}</strong>?</p><div class="confirm-warning">${icon("warning")}<span>La confirmación cierra esta ventana, pero el elemento seguirá en la tabla. No se borra ningún dato.</span></div><div class="dialog-footer"><button class="button button-quiet" type="button" data-action="close-popup">Cancelar</button><button class="button button-danger" type="button" data-action="confirm-delete" data-entity="${escapeHTML(popup.entity)}" data-record-id="${escapeHTML(popup.recordId)}">Confirmar simulación</button></div>`;
    return dialogMarkup(index, "Confirmar borrado", "Acción simulada", body, "small", true);
  }

  function renderCampaignTypePopup(popup, index) {
    const body = `<form class="admin-form" data-form="campaign-type"><div class="form-grid"><div class="form-field is-full"><label for="campaign-type-name">Nombre del tipo de campaña</label><input id="campaign-type-name" name="name" type="text" autocomplete="off" placeholder="Recogida local…" required></div></div><p class="form-note">El tipo solo se muestra en esta maqueta; no se añade al catálogo.</p><div class="dialog-footer"><button class="button button-quiet" type="button" data-action="close-popup">Cancelar</button><button class="button button-primary" type="submit">Crear tipo simulado</button></div></form>`;
    return dialogMarkup(index, "Crear tipo de campaña", "Nuevo tipo · simulación", body, "wide", true);
  }

  function getCampaignWizardStats(popup) {
    const selectedIds = new Set(popup.selectedStoreIds || []);
    const selectedStores = DATA.stores.filter((store) => selectedIds.has(store.id));
    return { selectedStores, selectedIds, selectedChains: new Set(selectedStores.map((store) => store.chainId)).size };
  }

  function createCampaignScheduleDays(startDate, endDate, existingDays = []) {
    if (!startDate || !endDate || startDate > endDate) return [];
    const existing = new Map(existingDays.map((day) => [day.date, day]));
    const scheduleDays = [];
    for (let date = parseDate(startDate); toISODate(date) <= endDate; date = addDays(date, 1)) {
      const iso = toISODate(date);
      const previous = existing.get(iso);
      const slots = previous?.slots?.map((slot) => ({ ...slot })) || [
        { id: `${iso}-slot-1`, startTime: "10:00", endTime: "14:00" },
        { id: `${iso}-slot-2`, startTime: "17:00", endTime: "21:00" }
      ];
      scheduleDays.push({ date: iso, slots });
    }
    return scheduleDays;
  }

  function getCampaignScheduleSlot(popup, date, slotId) {
    const day = popup.scheduleDays?.find((item) => item.date === date);
    return day?.slots.find((slot) => slot.id === slotId);
  }

  function getInvalidCampaignScheduleSlot(popup) {
    return (popup.scheduleDays || []).flatMap((day) => day.slots.map((slot) => ({ day, slot }))).find(({ slot }) => !slot.startTime || !slot.endTime || slot.startTime >= slot.endTime);
  }

  function renderCampaignScheduleDays(popup) {
    if (!popup.scheduleDays?.length) return `<div class="empty-state"><strong>No hay fechas de campaña</strong><span>Vuelve atrás y selecciona un rango de fechas válido.</span></div>`;
    return popup.scheduleDays.map((day) => {
      const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(parseDate(day.date));
      const isOpen = popup.openScheduleDate === day.date;
      const slots = day.slots.map((slot) => {
        const invalid = popup.scheduleErrorId === slot.id;
        return `<div class="wizard-time-slot${invalid ? " is-invalid" : ""}" data-schedule-id="${escapeHTML(slot.id)}"><label for="schedule-start-${escapeHTML(slot.id)}">Inicio<input id="schedule-start-${escapeHTML(slot.id)}" type="time" name="start-${escapeHTML(slot.id)}" value="${escapeHTML(slot.startTime)}" data-schedule-field="startTime" data-schedule-date="${escapeHTML(day.date)}" data-schedule-id="${escapeHTML(slot.id)}" required></label><label for="schedule-end-${escapeHTML(slot.id)}">Fin<input id="schedule-end-${escapeHTML(slot.id)}" type="time" name="end-${escapeHTML(slot.id)}" value="${escapeHTML(slot.endTime)}" data-schedule-field="endTime" data-schedule-date="${escapeHTML(day.date)}" data-schedule-id="${escapeHTML(slot.id)}" required></label><button class="button button-quiet" type="button" data-action="remove-campaign-slot" data-schedule-date="${escapeHTML(day.date)}" data-schedule-id="${escapeHTML(slot.id)}">Quitar</button>${invalid ? `<span class="wizard-time-error">La hora de fin debe ser posterior a la de inicio.</span>` : ""}</div>`;
      }).join("");
      return `<details class="wizard-day-schedule" data-schedule-date="${escapeHTML(day.date)}"${isOpen ? " open" : ""}><summary><span><strong>${formatDate(day.date, { weekday: "long", day: "numeric", month: "long" })}</strong><small>${escapeHTML(weekday)} · ${formatNumber(day.slots.length)} franjas</small></span><span class="wizard-chain-chevron">${icon("chevron")}</span></summary><div class="wizard-day-schedule-content"><div class="wizard-time-slot-list">${slots || `<p class="day-detail-empty">No hay franjas en este día.</p>`}</div><button class="button button-soft" type="button" data-action="add-campaign-slot" data-schedule-date="${escapeHTML(day.date)}">${icon("plus")} Añadir franja</button></div></details>`;
    }).join("");
  }

  function addCampaignScheduleSlot(popup, date) {
    const day = popup.scheduleDays?.find((item) => item.date === date);
    if (!day) return;
    popup.nextScheduleSlotId = (popup.nextScheduleSlotId || 0) + 1;
    const previousEnd = day.slots[day.slots.length - 1]?.endTime || "08:00";
    const startTime = previousEnd < "22:00" ? previousEnd : "08:00";
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const nextHour = startHour + 1;
    const endTime = nextHour < 24 ? `${String(nextHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}` : "23:00";
    day.slots.push({ id: `custom-${popup.nextScheduleSlotId}`, startTime, endTime });
    popup.openScheduleDate = date;
    popup.scheduleErrorId = null;
  }

  function removeCampaignScheduleSlot(popup, date, slotId) {
    const day = popup.scheduleDays?.find((item) => item.date === date);
    if (!day) return;
    day.slots = day.slots.filter((slot) => slot.id !== slotId);
    popup.openScheduleDate = date;
    if (popup.scheduleErrorId === slotId) popup.scheduleErrorId = null;
  }

  function getPreviousCampaign() {
    return DATA.campaigns.filter((campaign) => campaign.readOnly).sort((first, second) => second.endDate.localeCompare(first.endDate))[0] || null;
  }

  function getPreviousCoordinatorByZone(campaignId) {
    const coordinatorByZone = new Map();
    DATA.zoneAssignments.filter((assignment) => assignment.campaignId === campaignId).forEach((assignment) => {
      assignment.zoneIds.forEach((zoneId) => coordinatorByZone.set(zoneId, assignment.userId));
    });
    return coordinatorByZone;
  }

  function setCoordinatorMode(popup, mode) {
    popup.coordinatorMode = mode;
    popup.firstMissingStoreId = null;
    if (mode === "manual") {
      popup.coordinatorAssignments = Object.fromEntries((popup.selectedStoreIds || []).map((storeId) => [storeId, ""]));
      return;
    }
    const previous = getPreviousCampaign();
    const previousStoreIds = new Set(previous?.storeIds || DATA.stores.map((store) => store.id));
    const coordinatorByZone = getPreviousCoordinatorByZone(previous?.id);
    popup.coordinatorAssignments = Object.fromEntries((popup.selectedStoreIds || []).map((storeId) => {
      const store = getStore(storeId);
      const coordinatorId = previousStoreIds.has(storeId) ? coordinatorByZone.get(store?.zoneId) || "" : "";
      return [storeId, coordinatorId];
    }));
  }

  function getCoordinatorAssignmentStats(popup) {
    const selectedStoreIds = popup.selectedStoreIds || [];
    const assignments = popup.coordinatorAssignments || {};
    const missingStoreIds = selectedStoreIds.filter((storeId) => !assignments[storeId]);
    return { total: selectedStoreIds.length, assigned: selectedStoreIds.length - missingStoreIds.length, missingStoreIds };
  }

  function getCoordinatorBatchGroups(mode) {
    return mode === "zone" ? DATA.zones.map((zone) => [zone.id, zone.name]) : DATA.chains.map((chain) => [chain.id, chain.name]);
  }

  function renderCoordinatorBatchGroupOptions(mode, selectedId = "") {
    return getCoordinatorBatchGroups(mode).map(([id, label]) => `<option value="${escapeHTML(id)}"${id === selectedId ? " selected" : ""}>${escapeHTML(label)}</option>`).join("");
  }

  function renderCoordinatorOptions(selectedId = "") {
    const coordinators = DATA.users.filter((user) => user.roles.includes(ROLE.coordinator));
    return `<option value="">Sin asignar</option>${coordinators.map((user) => `<option value="${escapeHTML(user.id)}"${user.id === selectedId ? " selected" : ""}>${escapeHTML(user.name)}</option>`).join("")}`;
  }

  function renderCoordinatorAssignmentRows(popup) {
    const selectedStoreIds = new Set(popup.selectedStoreIds || []);
    const assignments = popup.coordinatorAssignments || {};
    const stores = DATA.stores.filter((store) => selectedStoreIds.has(store.id));
    if (!stores.length) return `<div class="empty-state"><strong>No hay tiendas seleccionadas</strong><span>Vuelve al paso anterior y selecciona al menos una tienda.</span></div>`;
    return stores.map((store) => {
      const coordinatorId = assignments[store.id] || "";
      const isMissing = !coordinatorId;
      const isFirstMissing = popup.firstMissingStoreId === store.id;
      return `<div class="coordinator-assignment-row${isMissing ? " is-missing" : ""}${isFirstMissing ? " is-missing-focus" : ""}" data-coordinator-row="${escapeHTML(store.id)}"><div class="coordinator-assignment-store"><strong>${escapeHTML(store.name)}</strong><small>${escapeHTML(getChain(store.chainId)?.name || "")} · ${escapeHTML(getZone(store.zoneId)?.name || "")} · ${escapeHTML(store.locality)}</small></div><label class="coordinator-assignment-select"><span class="sr-only">Coordinador de ${escapeHTML(store.name)}</span><select data-coordinator-store-id="${escapeHTML(store.id)}" aria-label="Coordinador de ${escapeHTML(store.name)}">${renderCoordinatorOptions(coordinatorId)}</select></label><span class="coordinator-missing-marker"${isMissing ? "" : " hidden"} aria-label="Falta asignar coordinador">${icon("warning")} Pendiente</span></div>`;
    }).join("");
  }

  function renderCoordinatorAssignmentStep(popup) {
    const previous = getPreviousCampaign();
    const stats = getCoordinatorAssignmentStats(popup);
    const coordinators = DATA.users.filter((user) => user.roles.includes(ROLE.coordinator));
    const selectedGroup = popup.batchGroupId || getCoordinatorBatchGroups(popup.batchMode || "chain")[0]?.[0] || "";
    const batchMode = popup.batchMode || "chain";
    const batchCoordinatorId = popup.batchCoordinatorId || coordinators[0]?.id || "";
    const modeActions = `<div class="coordinator-mode-switch"><button class="button ${popup.coordinatorMode === "previous" ? "button-primary" : "button-soft"}" type="button" data-action="coordinator-mode" data-mode="previous" aria-pressed="${popup.coordinatorMode === "previous"}">Reutilizar campaña anterior</button><button class="button ${popup.coordinatorMode === "manual" ? "button-primary" : "button-soft"}" type="button" data-action="coordinator-mode" data-mode="manual" aria-pressed="${popup.coordinatorMode === "manual"}">Asignar manualmente</button></div>`;
    const modeNote = popup.coordinatorMode === "previous" ? `<p class="form-note">Asignaciones de ${escapeHTML(previous?.name || "la campaña anterior")}. Las tiendas nuevas quedan sin coordinador y se marcan para revisión.</p>` : `<p class="form-note">Asigna coordinadores tienda por tienda o aplica una asignación en lote por cadena o zona.</p>`;
    const batchControls = `<div class="coordinator-batch-controls"><label>Aplicar lote<select data-coordinator-batch-mode><option value="chain"${batchMode === "chain" ? " selected" : ""}>Por cadena</option><option value="zone"${batchMode === "zone" ? " selected" : ""}>Por zona</option></select></label><label>${batchMode === "chain" ? "Cadena" : "Zona"}<select data-coordinator-batch-group>${renderCoordinatorBatchGroupOptions(batchMode, selectedGroup)}</select></label><label>Coordinador<select data-coordinator-batch-user>${renderCoordinatorOptions(batchCoordinatorId)}</select></label><button class="button button-soft" type="button" data-action="apply-coordinator-batch">Aplicar lote</button></div>`;
    return `<div class="coordinator-assignment-step"><div class="coordinator-assignment-header"><div><h3>Coordinadores por tienda</h3><p id="coordinator-assignment-count" class="result-count">${formatNumber(stats.assigned)} de ${formatNumber(stats.total)} tiendas asignadas</p></div>${modeActions}</div>${modeNote}${batchControls}<div id="coordinator-assignment-list" class="coordinator-assignment-list">${renderCoordinatorAssignmentRows(popup)}</div><p class="form-note">Las tiendas sin coordinador muestran un triángulo y bloquean el siguiente paso.</p></div>`;
  }

  function updateCoordinatorAssignmentUI() {
    const popup = state.popupStack[state.popupStack.length - 1];
    if (popup?.type !== "campaign-wizard" || popup.step !== 3) return;
    const stats = getCoordinatorAssignmentStats(popup);
    const count = document.getElementById("coordinator-assignment-count");
    if (count) count.textContent = `${formatNumber(stats.assigned)} de ${formatNumber(stats.total)} tiendas asignadas`;
    document.querySelectorAll("[data-coordinator-row]").forEach((row) => {
      const coordinatorId = popup.coordinatorAssignments?.[row.dataset.coordinatorRow] || "";
      const isMissing = !coordinatorId;
      row.classList.toggle("is-missing", isMissing);
      row.classList.toggle("is-missing-focus", isMissing && row.dataset.coordinatorRow === popup.firstMissingStoreId);
      row.querySelector(".coordinator-missing-marker").hidden = !isMissing;
      const select = row.querySelector("[data-coordinator-store-id]");
      if (select) select.value = coordinatorId;
    });
  }

  function applyCoordinatorBatch(popup) {
    const mode = document.querySelector("[data-coordinator-batch-mode]")?.value || "chain";
    const groupId = document.querySelector("[data-coordinator-batch-group]")?.value || "";
    const coordinatorId = document.querySelector("[data-coordinator-batch-user]")?.value || "";
    popup.batchMode = mode;
    popup.batchGroupId = groupId;
    popup.batchCoordinatorId = coordinatorId;
    popup.coordinatorAssignments = popup.coordinatorAssignments || {};
    const selectedStoreIds = new Set(popup.selectedStoreIds || []);
    DATA.stores.filter((store) => selectedStoreIds.has(store.id) && store[mode === "zone" ? "zoneId" : "chainId"] === groupId).forEach((store) => {
      popup.coordinatorAssignments[store.id] = coordinatorId;
    });
    popup.firstMissingStoreId = null;
    updateCoordinatorAssignmentUI();
  }

  function getCampaignWizardVisibleStores(popup) {
    const query = (popup.storeSearch || "").trim().toLocaleLowerCase("es-ES");
    if (!query) return DATA.stores;
    const matchingChainIds = new Set(DATA.chains.filter((chain) => chain.name.toLocaleLowerCase("es-ES").includes(query)).map((chain) => chain.id));
    return DATA.stores.filter((store) => matchingChainIds.has(store.chainId) || [store.name, store.address, store.locality, getZone(store.zoneId)?.name].some((value) => String(value || "").toLocaleLowerCase("es-ES").includes(query)));
  }

  function renderCampaignWizardChainList(popup) {
    const selectedIds = new Set(popup.selectedStoreIds || []);
    const visibleStores = getCampaignWizardVisibleStores(popup);
    const visibleChainIds = new Set(visibleStores.map((store) => store.chainId));
    const groups = DATA.chains.filter((chain) => visibleChainIds.has(chain.id));
    if (!groups.length) return `<div class="empty-state"><strong>No hay tiendas que coincidan</strong><span>Cambia la búsqueda para ver otras cadenas.</span></div>`;
    return groups.map((chain) => {
      const chainStores = DATA.stores.filter((store) => store.chainId === chain.id);
      const selectedCount = chainStores.filter((store) => selectedIds.has(store.id)).length;
      const stores = visibleStores.filter((store) => store.chainId === chain.id);
      return `<details class="wizard-chain-group" data-chain-id="${escapeHTML(chain.id)}"><summary><span><strong>${escapeHTML(chain.name)}</strong><small data-wizard-chain-count>${formatNumber(selectedCount)}/${formatNumber(chainStores.length)} tiendas seleccionadas</small></span><span class="wizard-chain-chevron">${icon("chevron")}</span></summary><div class="wizard-chain-controls"><label><input type="checkbox" data-wizard-chain-id="${escapeHTML(chain.id)}">Seleccionar toda la cadena</label><span>${formatNumber(chainStores.length)} tiendas</span></div><div class="wizard-chain-stores">${stores.map((store) => `<label class="wizard-store-option"><input type="checkbox" data-wizard-store-id="${escapeHTML(store.id)}"><span><strong>${escapeHTML(store.name)}</strong><small>${escapeHTML(getZone(store.zoneId)?.name || "")} · ${escapeHTML(store.locality)}</small></span></label>`).join("")}</div></details>`;
    }).join("");
  }

  function updateCampaignWizardSelectionUI() {
    const popup = state.popupStack[state.popupStack.length - 1];
    if (popup?.type !== "campaign-wizard") return;
    const { selectedIds, selectedStores, selectedChains } = getCampaignWizardStats(popup);
    document.querySelectorAll("[data-wizard-store-id]").forEach((input) => {
      input.checked = selectedIds.has(input.dataset.wizardStoreId);
    });
    document.querySelectorAll("[data-wizard-chain-id]").forEach((input) => {
      const chainStores = DATA.stores.filter((store) => store.chainId === input.dataset.wizardChainId);
      const selectedCount = chainStores.filter((store) => selectedIds.has(store.id)).length;
      input.checked = selectedCount === chainStores.length;
      input.indeterminate = selectedCount > 0 && selectedCount < chainStores.length;
      const count = input.closest(".wizard-chain-group")?.querySelector("[data-wizard-chain-count]");
      if (count) count.textContent = `${formatNumber(selectedCount)}/${formatNumber(chainStores.length)} seleccionadas`;
    });
    const selectedCount = document.getElementById("wizard-selected-count");
    if (selectedCount) selectedCount.textContent = `${formatNumber(selectedStores.length)} tiendas · ${formatNumber(selectedChains)} cadenas`;
    const nextButton = document.querySelector("#popup-root [data-action='wizard-next']");
    if (nextButton && popup.step === 1) nextButton.disabled = selectedStores.length === 0;
  }

  function updateZoneStoreSelectionUI() {
    const popup = state.popupStack[state.popupStack.length - 1];
    if (popup?.type !== "admin-zone-stores") return;
    const selectedIds = new Set(popup.selectedStoreIds || []);
    document.querySelectorAll("[data-zone-store-id]").forEach((input) => {
      input.checked = selectedIds.has(input.dataset.zoneStoreId);
    });
    const count = document.getElementById("zone-selected-count");
    if (count) count.textContent = `${formatNumber(selectedIds.size)} tiendas seleccionadas`;
  }

  function renderCampaignWizard(popup, index) {
    const labels = ["Datos básicos", "Franjas", "Tiendas", "Coordinadores", "Confirmación"];
    const progress = `<div class="wizard-progress">${labels.map((label, step) => `<span class="wizard-step-indicator${popup.step === step ? " is-active" : ""}${popup.step > step ? " is-done" : ""}"><span>${popup.step > step ? "✓" : step + 1}</span>${label}</span>`).join("")}</div>`;
    const stats = getCampaignWizardStats(popup);
    let content = "";
    if (popup.step === 0) {
      const fields = [
        { name: "name", label: "Nombre de campaña", type: "text", full: true },
        { name: "typeId", label: "Tipo", type: "select", options: () => DATA.campaignTypes.map((item) => [item.id, item.name]) },
        { name: "startDate", label: "Fecha de inicio", type: "date", required: true },
        { name: "endDate", label: "Fecha de fin", type: "date", required: true }
      ];
      const values = { name: popup.name || "Gran Recogida · nueva edición", typeId: popup.typeId || DATA.campaignTypes[0].id, startDate: popup.startDate || "2026-12-01", endDate: popup.endDate || "2026-12-20" };
      content = `<form id="campaign-wizard-form" data-form="campaign-wizard"><div class="form-grid">${fields.map((field) => renderFormField(field, values, "wizard")).join("")}</div><p class="form-note">Paso 1 de 5 · completa los datos básicos y el rango de fechas.</p></form>`;
    } else if (popup.step === 1) {
      const slotCount = (popup.scheduleDays || []).reduce((count, day) => count + day.slots.length, 0);
      content = `<div class="wizard-schedule-selection"><div class="wizard-schedule-intro"><p class="confirm-copy">Configura las franjas por cada día de la campaña.</p><span class="tag">${formatNumber(slotCount)} franjas</span></div><p class="form-note">Cada día empieza con franjas de muestra; puedes añadir o quitar tantas como necesites.</p><div class="wizard-day-schedule-list">${renderCampaignScheduleDays(popup)}</div></div>`;
    } else if (popup.step === 2) {
      content = `<div class="wizard-store-selection"><div class="wizard-store-toolbar"><label class="search-control"><span>${icon("search")}</span><span class="sr-only">Buscar cadenas y tiendas participantes</span><input type="search" name="wizard-store-search" autocomplete="off" placeholder="Buscar cadena, tienda o localidad…" value="${escapeHTML(popup.storeSearch || "")}" data-search="wizard-stores"></label><span id="wizard-selected-count" class="result-count">${formatNumber(stats.selectedStores.length)} tiendas · ${formatNumber(stats.selectedChains)} cadenas</span></div><p class="form-note">Selecciona una cadena completa o despliega para marcar tiendas individuales.</p><div id="wizard-chain-list" class="wizard-chain-list">${renderCampaignWizardChainList(popup)}</div></div>`;
    } else if (popup.step === 3) {
      content = renderCoordinatorAssignmentStep(popup);
    } else {
      const type = getCampaignType(popup.typeId);
      const scheduleCount = (popup.scheduleDays || []).reduce((count, day) => count + day.slots.length, 0);
      const coordinatorStats = getCoordinatorAssignmentStats(popup);
      content = `<div class="detail-block"><h3>Revisión final</h3><p><strong>${escapeHTML(popup.name || "Gran Recogida · nueva edición")}</strong></p><p>${escapeHTML(type?.name || "Recogida anual")}</p><p>${popup.startDate ? formatDate(popup.startDate) : "1 dic 2026"} — ${popup.endDate ? formatDate(popup.endDate) : "20 dic 2026"}</p><p>${formatNumber(scheduleCount)} franjas en ${formatNumber(popup.scheduleDays?.length || 0)} días</p><p>${formatNumber(stats.selectedStores.length)} tiendas en ${formatNumber(stats.selectedChains)} cadenas</p><p>${formatNumber(coordinatorStats.assigned)} de ${formatNumber(coordinatorStats.total)} coordinadores asignados</p></div><div class="confirm-warning">${icon("warning")}<span>La confirmación final solo muestra un aviso; no se creará ni guardará ninguna campaña.</span></div>`;
    }
    const back = popup.step > 0 ? `<button class="button button-quiet" type="button" data-action="wizard-back">Anterior</button>` : `<button class="button button-quiet" type="button" data-action="close-popup">Cancelar</button>`;
    const next = popup.step < 4 ? `<button class="button button-primary" type="button" data-action="wizard-next"${popup.step === 2 && stats.selectedStores.length === 0 ? " disabled" : ""}>Siguiente</button>` : `<button class="button button-danger" type="button" data-action="wizard-confirm">Confirmar creación de campaña</button>`;
    const body = `<div>${progress}${content}<div class="dialog-footer">${back}${next}</div></div>`;
    return dialogMarkup(index, "Crear campaña", `Paso ${popup.step + 1} de ${labels.length}`, body, "wide", true);
  }

  function renderSettingsPopup(popup, index) {
    const title = popup.kind === "preferences" ? "Preferencias" : "Ajustes de cuenta";
    const body = popup.kind === "preferences" ? `<div class="detail-block"><h3>Notificaciones</h3><p><label><input type="checkbox" checked> Avisos de calendario</label></p><p><label><input type="checkbox" checked> Incidencias de la campaña</label></p><p><label><input type="checkbox"> Resumen semanal</label></p></div><p class="form-note">Preferencias visuales; no se guardan.</p>` : `<div class="detail-block"><h3>Cuenta</h3><p>Correo y teléfono se consultan desde la ficha de contacto.</p><p>La contraseña y la configuración de seguridad no se modifican en este mockup.</p></div>`;
    return dialogMarkup(index, title, "Configuración de muestra", body, "wide");
  }

  function dialogMarkup(index, title, subtitle, body, size = "normal", bodyIsFull = false) {
    const popup = state.popupStack[index];
    const isTop = index === state.popupStack.length - 1;
    const dialogClass = size === "store" ? "dialog--store" : size === "wide" ? "dialog--wide" : size === "small" ? "dialog--small" : "";
    const bodyClass = popup?.type === "store" ? "dialog-body dialog-body--store" : "dialog-body";
    const covered = isTop ? "" : " is-covered";
    return `<div class="modal-backdrop${covered}" data-popup-index="${index}"><section class="dialog ${dialogClass}" role="dialog"${isTop ? ` aria-modal="true"` : ` aria-hidden="true"`} aria-labelledby="dialog-title-${index}" tabindex="-1"><header class="dialog-header"><div class="dialog-title-wrap"><h2 id="dialog-title-${index}">${escapeHTML(title)}</h2>${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ""}</div><button class="icon-button dialog-close" type="button" data-action="close-popup" aria-label="Cerrar ventana">${icon("close")}</button></header><div class="${bodyClass}">${bodyIsFull ? body : body}</div></section></div>`;
  }

  function renderPopup(popup, index) {
    if (popup.type === "slot") return renderCalendarSlotPopup(popup, index);
    if (popup.type === "day") return renderDaySummaryPopup(popup, index);
    if (popup.type === "store") return renderStorePopup(popup, index);
    if (popup.type === "conflict") return renderConflictPopup(popup, index);
    if (popup.type === "contact") return renderContactPopup(popup, index);
    if (popup.type === "report") return renderReportPopup(popup, index);
    if (popup.type === "collaborator-groups") return renderCollaboratorGroupsPopup(popup, index);
    if (popup.type === "collaborator-contact") return renderCollaboratorContactForm(popup, index);
    if (popup.type === "collaborator-responsible") return renderCollaboratorResponsiblePopup(popup, index);
    if (popup.type === "admin-view") return renderAdminRecordPopup(popup, index);
    if (popup.type === "admin-zone-stores") return renderAdminZoneStoresPopup(popup, index);
    if (popup.type === "admin-chain-stores") return renderAdminChainStoresPopup(popup, index);
    if (popup.type === "admin-form") return renderAdminFormPopup(popup, index);
    if (popup.type === "delete") return renderDeletePopup(popup, index);
    if (popup.type === "campaign-type") return renderCampaignTypePopup(popup, index);
    if (popup.type === "campaign-wizard") return renderCampaignWizard(popup, index);
    if (popup.type === "settings") return renderSettingsPopup(popup, index);
    return dialogMarkup(index, "Detalle", "", "", "normal");
  }

  function renderPopupStack() {
    const root = document.getElementById("popup-root");
    root.innerHTML = state.popupStack.map((popup, index) => renderPopup(popup, index)).join("");
    updateCampaignWizardSelectionUI();
    updateZoneStoreSelectionUI();
  }

  function openPopup(popup) {
    closeDropdowns();
    closeTutorial();
    state.popupStack.push(popup);
    renderPopupStack();
    const closeButton = document.querySelector("#popup-root .modal-backdrop:last-child [data-action='close-popup']");
    if (closeButton) closeButton.focus({ preventScroll: true });
  }

  function closeTopPopup() {
    if (!state.popupStack.length) return;
    state.popupStack.pop();
    renderPopupStack();
    const previousDialog = document.querySelector("#popup-root .modal-backdrop:last-child .dialog");
    if (previousDialog) previousDialog.querySelector("button, input, select, textarea")?.focus({ preventScroll: true });
  }

  function openTutorial() {
    closeDropdowns();
    closeTopPopup();
    const steps = TUTORIALS[state.currentView] || TUTORIALS.dashboard;
    if (!steps.length) return;
    state.tutorialOpen = true;
    state.tutorialStep = 0;
    renderTutorial();
  }

  function clearTutorialHighlight() {
    document.querySelectorAll(".tutorial-highlight").forEach((element) => element.classList.remove("tutorial-highlight"));
  }

  function closeTutorial() {
    clearTutorialHighlight();
    state.tutorialOpen = false;
    document.getElementById("tutorial-root").innerHTML = "";
  }

  function renderTutorial() {
    const root = document.getElementById("tutorial-root");
    clearTutorialHighlight();
    if (!state.tutorialOpen) {
      root.innerHTML = "";
      return;
    }
    const steps = TUTORIALS[state.currentView] || TUTORIALS.dashboard;
    const step = steps[state.tutorialStep];
    if (!step) {
      closeTutorial();
      return;
    }
    const target = document.querySelector(step.selector);
    if (target) target.classList.add("tutorial-highlight");
    const targetText = target ? `<p class="tutorial-target-label">Señalado: ${escapeHTML(target.getAttribute("aria-label") || target.querySelector("h2, h3")?.textContent || target.textContent.trim().slice(0, 60))}</p>` : "";
    const back = state.tutorialStep > 0 ? `<button class="button button-quiet" type="button" data-action="tutorial-back">Anterior</button>` : "";
    const nextLabel = state.tutorialStep === steps.length - 1 ? "Terminar" : "Siguiente";
    root.innerHTML = `<div class="tutorial-scrim" aria-hidden="true"></div><section class="tutorial-panel" role="dialog" aria-label="Tutorial de ${escapeHTML(state.currentView)}"><div class="tutorial-panel-top"><span>PASO ${state.tutorialStep + 1} DE ${steps.length}</span><button class="icon-button" type="button" data-action="tutorial-close" aria-label="Cerrar tutorial">${icon("close")}</button></div><div class="tutorial-copy" aria-live="polite"><h2>${escapeHTML(step.title)}</h2><p>${escapeHTML(step.text)}</p>${targetText}</div><div class="tutorial-panel-actions">${back}<button class="button button-primary" type="button" data-action="tutorial-next">${nextLabel}</button></div></section>`;
  }

  function renderToast(message) {
    const region = document.getElementById("toast-region");
    region.innerHTML = `<div class="toast" role="status">${escapeHTML(message)}</div>`;
    if (state.toastTimer) window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      region.innerHTML = "";
    }, 3000);
  }

  function closeDropdowns() {
    state.openDropdown = null;
    if (state.signedIn) renderTopbar();
  }

  function toggleDropdown(name) {
    state.openDropdown = state.openDropdown === name ? null : name;
    renderTopbar();
  }

  function signIn(role) {
    state.signedIn = true;
    state.role = role;
    state.activeUserId = role === ROLE.admin ? "u-admin" : "u-ana";
    state.currentView = "dashboard";
    state.campaignId = "grand";
    state.zoneFilter = null;
    state.missingManagerFilter = false;
    state.authMode = "login";
    state.openDropdown = null;
    state.popupStack = [];
    state.tutorialOpen = false;
    const nextHash = "#dashboard";
    if (window.location.hash !== nextHash) window.location.hash = "dashboard";
    render();
  }

  function signOut() {
    state.signedIn = false;
    state.role = null;
    state.activeUserId = null;
    state.currentView = "dashboard";
    state.openDropdown = null;
    state.popupStack = [];
    state.tutorialOpen = false;
    state.authMode = "login";
    window.location.hash = "login";
    render();
  }

  function navigate(route, options = {}) {
    if (!ROUTES.has(route)) return;
    if (route.startsWith("admin") && state.role !== ROLE.admin) route = "dashboard";
    if (Object.hasOwn(options, "zoneId")) {
      state.zoneFilter = options.zoneId;
      state.missingManagerFilter = false;
    }
    if (route === "stores" && options.clearZone) state.zoneFilter = null;
    if (route.startsWith("admin-") && route !== state.currentView) state.adminSearch = "";
    state.currentView = route;
    closeDropdowns();
    closeTutorial();
    if (window.location.hash !== `#${route}`) window.location.hash = route;
    else render();
  }

  function updateRouteFromHash() {
    if (!state.signedIn) return;
    let route = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!ROUTES.has(route)) route = "dashboard";
    if (route.startsWith("admin") && state.role !== ROLE.admin) route = "dashboard";
    state.currentView = route;
    closeTutorial();
    render();
  }

  function openHealthItem(action) {
    if (action === "missing-stores") {
      state.missingManagerFilter = true;
      state.zoneFilter = null;
      navigate("stores");
      return;
    }
    if (action === "pending-reports") {
      state.reportFilter = "pending";
      navigate("reports");
      return;
    }
    if (action === "conflicts") {
      const conflict = getScopedConflicts()[0];
      navigate("calendar");
      if (conflict) openPopup({ type: "conflict", conflictId: conflict.id });
      return;
    }
    if (action === "pending-slots" || action === "complete-slots") {
      const desired = action === "pending-slots" ? "pending" : "complete";
      const match = getScopedStores().flatMap((store) => ["morning", "afternoon"].map((slot) => ({ slot, state: getSlotData(store, currentCampaign().startDate, slot).state }))).find((item) => item.state === desired);
      navigate("calendar");
      if (match) openPopup({ type: "slot", date: currentCampaign().startDate, slot: match.slot });
    }
  }

  function openNotification(notificationId) {
    const notification = DATA.notifications.find((item) => item.id === notificationId);
    if (!notification) return;
    closeDropdowns();
    if (notification.kind === "calendar") openPopup({ type: "slot", date: notification.date, slot: notification.slot });
    if (notification.kind === "report") openPopup({ type: "report", reportId: notification.reportId });
    if (notification.kind === "store") openPopup({ type: "store", storeId: notification.storeId });
  }

  function getCurrentTutorialSteps() {
    return TUTORIALS[state.currentView] || TUTORIALS.dashboard;
  }

  function handleAction(button) {
    const action = button.dataset.action;
    if (button.disabled) return;
    if (action === "login-admin") signIn(ROLE.admin);
    else if (action === "login-coordinator") signIn(ROLE.coordinator);
    else if (action === "show-register") {
      state.authMode = "register";
      render();
    } else if (action === "show-login") {
      state.authMode = "login";
      render();
    } else if (action === "toggle-campaign") toggleDropdown("campaign");
    else if (action === "toggle-notifications") toggleDropdown("notifications");
    else if (action === "toggle-profile") toggleDropdown("profile");
    else if (action === "select-campaign") {
      state.campaignId = button.dataset.campaignId;
      state.zoneFilter = null;
      state.missingManagerFilter = false;
      state.calendarOffsets = {};
      state.openDropdown = null;
      render();
    } else if (action === "logout") signOut();
    else if (action === "open-own-contact") openPopup({ type: "contact", userId: state.activeUserId });
    else if (action === "open-account-settings") openPopup({ type: "settings", kind: "account" });
    else if (action === "open-preferences") openPopup({ type: "settings", kind: "preferences" });
    else if (action === "tutorial-open") openTutorial();
    else if (action === "tutorial-close") closeTutorial();
    else if (action === "tutorial-next") {
      if (state.tutorialStep >= getCurrentTutorialSteps().length - 1) closeTutorial();
      else {
        state.tutorialStep += 1;
        renderTutorial();
      }
    } else if (action === "tutorial-back") {
      state.tutorialStep = Math.max(0, state.tutorialStep - 1);
      renderTutorial();
    } else if (action === "zone-layout") {
      state.zoneLayout = button.dataset.layout;
      render();
    } else if (action === "clear-zone-filter") {
      state.zoneFilter = null;
      render();
    } else if (action === "clear-missing-filter") {
      state.missingManagerFilter = false;
      render();
    } else if (action === "clear-store-search") {
      state.storeSearch = "";
      render();
      document.querySelector('[data-search="stores"]')?.focus();
    } else if (action === "health-item") openHealthItem(button.dataset.health);
    else if (action === "report-filter") {
      state.reportFilter = button.dataset.filter;
      document.getElementById("reports-list").innerHTML = renderReportRows();
      document.getElementById("report-result-count").textContent = `${formatNumber(getVisibleReports().length)} resultados`;
      document.querySelectorAll("[data-action='report-filter']").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.filter === state.reportFilter)));
    } else if (action === "open-report") openPopup({ type: "report", reportId: button.dataset.reportId });
    else if (action === "open-store") openPopup({ type: "store", storeId: button.dataset.storeId });
    else if (action === "open-contact") openPopup({ type: "contact", userId: button.dataset.userId });
    else if (action === "create-collaborator-contact") openPopup({ type: "collaborator-contact", collaboratorId: button.dataset.collaboratorId });
    else if (action === "edit-collaborator-contact") openPopup({ type: "collaborator-contact", collaboratorId: button.dataset.collaboratorId, userId: button.dataset.userId });
    else if (action === "assign-collaborator-responsible") openPopup({ type: "collaborator-responsible", collaboratorId: button.dataset.collaboratorId });
    else if (action === "view-collaborator-groups") openPopup({ type: "collaborator-groups", collaboratorId: button.dataset.collaboratorId });
    else if (action === "open-shift") openPopup({ type: "slot", date: button.dataset.date, slot: button.dataset.slot, storeId: button.dataset.storeId || null });
    else if (action === "open-day") openPopup({ type: "day", date: button.dataset.date, storeId: button.dataset.storeId || null });
    else if (action === "open-day-slot") openPopup({ type: "slot", date: button.dataset.date, slot: button.dataset.slot, storeId: button.dataset.storeId || null });
    else if (action === "open-conflict") openPopup({ type: "conflict", conflictId: button.dataset.conflictId });
    else if (action === "calendar-view") {
      state.calendarViews[button.dataset.scope] = button.dataset.view;
      render();
    } else if (action === "calendar-shift") {
      const scope = button.dataset.scope;
      const mode = getCalendarMode(scope);
      const key = `${scope}:${mode}`;
      state.calendarOffsets[key] = getCalendarOffset(scope, mode) + Number(button.dataset.direction);
      render();
    } else if (action === "calendar-today") {
      const scope = button.dataset.scope;
      const mode = getCalendarMode(scope);
      state.calendarOffsets[`${scope}:${mode}`] = getTodayOffset(mode);
      render();
    } else if (action === "shift-sort") {
      state.shiftSort = button.dataset.sort;
      renderPopupStack();
    } else if (action === "open-notification") openNotification(button.dataset.notificationId);
    else if (action === "admin-zone-stores") {
      const zone = getZone(button.dataset.zoneId);
      const selectedStoreIds = DATA.stores.filter((store) => store.zoneId === zone?.id).map((store) => store.id);
      openPopup({ type: "admin-zone-stores", zoneId: button.dataset.zoneId, selectedStoreIds });
    } else if (action === "admin-chain-stores") openPopup({ type: "admin-chain-stores", chainId: button.dataset.chainId });
    else if (action === "admin-chain-store-create") openPopup({ type: "admin-form", entity: "stores", mode: "create", initialValues: { chainId: button.dataset.chainId } });
    else if (action === "admin-create") openPopup({ type: "admin-form", entity: button.dataset.entity, mode: "create" });
    else if (action === "admin-edit") openPopup({ type: "admin-form", entity: button.dataset.entity, mode: "edit", recordId: button.dataset.recordId });
    else if (action === "admin-view") openPopup({ type: "admin-view", entity: button.dataset.entity, recordId: button.dataset.recordId });
    else if (action === "admin-delete") openPopup({ type: "delete", entity: button.dataset.entity, recordId: button.dataset.recordId });
    else if (action === "confirm-delete") {
      closeTopPopup();
      renderToast("Confirmación simulada: el registro sigue en la tabla.");
    } else if (action === "add-campaign-slot") {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "campaign-wizard") {
        addCampaignScheduleSlot(popup, button.dataset.scheduleDate);
        renderPopupStack();
      }
    } else if (action === "remove-campaign-slot") {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "campaign-wizard") {
        removeCampaignScheduleSlot(popup, button.dataset.scheduleDate, button.dataset.scheduleId);
        renderPopupStack();
      }
    } else if (action === "coordinator-mode") {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "campaign-wizard") {
        setCoordinatorMode(popup, button.dataset.mode);
        renderPopupStack();
      }
    } else if (action === "apply-coordinator-batch") {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "campaign-wizard") {
        applyCoordinatorBatch(popup);
        renderToast("Asignación en lote aplicada a las tiendas seleccionadas.");
      }
    } else if (action === "campaign-type-create") openPopup({ type: "campaign-type" });
    else if (action === "campaign-wizard") openPopup({ type: "campaign-wizard", step: 0, selectedStoreIds: DATA.stores.map((store) => store.id), storeSearch: "" });
    else if (action === "wizard-back") {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "campaign-wizard") {
        popup.step = Math.max(0, popup.step - 1);
        renderPopupStack();
      }
    } else if (action === "wizard-next") advanceCampaignWizard();
    else if (action === "wizard-confirm") {
      closeTopPopup();
      renderToast("Creación confirmada en la maqueta. No se creó ninguna campaña.");
    } else if (action === "close-popup") closeTopPopup();
  }

  function advanceCampaignWizard() {
    const popup = state.popupStack[state.popupStack.length - 1];
    if (!popup || popup.type !== "campaign-wizard") return;
    if (popup.step === 0) {
      const form = document.getElementById("campaign-wizard-form");
      if (!form?.reportValidity()) return;
      if (form.elements.startDate.value > form.elements.endDate.value) {
        form.elements.endDate.setCustomValidity("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
        form.elements.endDate.reportValidity();
        form.elements.endDate.setCustomValidity("");
        return;
      }
      popup.name = form.elements.name.value;
      popup.typeId = form.elements.typeId.value;
      popup.startDate = form.elements.startDate.value;
      popup.endDate = form.elements.endDate.value;
      popup.scheduleDays = createCampaignScheduleDays(popup.startDate, popup.endDate, popup.scheduleDays);
      popup.scheduleErrorId = null;
      popup.step = 1;
      renderPopupStack();
      return;
    }
    if (popup.step === 1) {
      const invalid = getInvalidCampaignScheduleSlot(popup);
      if (invalid) {
        popup.openScheduleDate = invalid.day.date;
        popup.scheduleErrorId = invalid.slot.id;
        renderPopupStack();
        const invalidRow = document.querySelector(`.wizard-time-slot[data-schedule-id="${invalid.slot.id}"]`);
        invalidRow?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
        invalidRow?.querySelector("input")?.focus({ preventScroll: true });
        return;
      }
      popup.step = 2;
      renderPopupStack();
      return;
    }
    if (popup.step === 2) {
      if (!popup.selectedStoreIds?.length) return;
      if (popup.coordinatorMode === "manual") {
        const previousAssignments = popup.coordinatorAssignments || {};
        popup.coordinatorAssignments = Object.fromEntries(popup.selectedStoreIds.map((storeId) => [storeId, previousAssignments[storeId] || ""]));
      } else {
        setCoordinatorMode(popup, "previous");
      }
      popup.batchMode = popup.batchMode || "chain";
      popup.batchGroupId = popup.batchGroupId || DATA.chains[0]?.id || "";
      popup.batchCoordinatorId = popup.batchCoordinatorId || DATA.users.find((user) => user.roles.includes(ROLE.coordinator))?.id || "";
      popup.step = 3;
      renderPopupStack();
      return;
    }
    if (popup.step === 3) {
      const { missingStoreIds } = getCoordinatorAssignmentStats(popup);
      if (missingStoreIds.length) {
        popup.firstMissingStoreId = missingStoreIds[0];
        renderPopupStack();
        const missingRow = document.querySelector(`[data-coordinator-row="${missingStoreIds[0]}"]`);
        missingRow?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
        missingRow?.querySelector("select")?.focus({ preventScroll: true });
        renderToast("Asigna un coordinador a cada tienda marcada antes de continuar.");
        return;
      }
      popup.firstMissingStoreId = null;
      popup.step = 4;
      renderPopupStack();
    }
  }

  function onDocumentClick(event) {
    const routeLink = event.target.closest("[data-route]");
    if (routeLink && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
      event.preventDefault();
      navigate(routeLink.dataset.route, { zoneId: routeLink.dataset.zoneId });
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton);
      return;
    }
    const backdrop = event.target.closest(".modal-backdrop");
    if (backdrop && event.target === backdrop && Number(backdrop.dataset.popupIndex) === state.popupStack.length - 1) {
      closeTopPopup();
      return;
    }
    if (!event.target.closest(".dropdown-anchor")) closeDropdowns();
  }

  function onDocumentInput(event) {
    const scheduleInput = event.target.closest("[data-schedule-field]");
    if (scheduleInput) {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "campaign-wizard") {
        const slot = getCampaignScheduleSlot(popup, scheduleInput.dataset.scheduleDate, scheduleInput.dataset.scheduleId);
        if (slot) slot[scheduleInput.dataset.scheduleField] = scheduleInput.value;
        if (popup.scheduleErrorId === scheduleInput.dataset.scheduleId) {
          popup.scheduleErrorId = null;
          scheduleInput.closest(".wizard-time-slot")?.classList.remove("is-invalid");
          scheduleInput.closest(".wizard-time-slot")?.querySelector(".wizard-time-error")?.remove();
        }
      }
      return;
    }
    const input = event.target.closest("[data-search]");
    if (!input) return;
    if (input.dataset.search === "stores") {
      state.storeSearch = input.value;
      const body = document.getElementById("stores-table-body");
      if (body) body.innerHTML = renderStoreRows();
      const count = document.getElementById("store-result-count");
      if (count) count.textContent = `${formatNumber(getStoreViewItems().length)} de ${formatNumber(getScopedStores().length)} tiendas`;
    }
    if (input.dataset.search === "collaborators") {
      state.collaboratorSearch = input.value;
      const grid = document.getElementById("collaborator-list-grid");
      if (grid) grid.innerHTML = renderCollaboratorCards();
      const count = document.getElementById("collaborator-result-count");
      if (count) count.textContent = `${formatNumber(getVisibleCollaborators().length)} entidades`;
    }
    if (input.dataset.search === "reports") {
      state.reportSearch = input.value;
      const list = document.getElementById("reports-list");
      if (list) list.innerHTML = renderReportRows();
      const count = document.getElementById("report-result-count");
      if (count) count.textContent = `${formatNumber(getVisibleReports().length)} resultados`;
    }
    if (input.dataset.search === "admin") {
      state.adminSearch = input.value;
      const body = document.getElementById("admin-table-body");
      if (body) body.innerHTML = renderAdminRows(body.dataset.adminEntity);
      const count = document.getElementById("admin-result-count");
      if (count && body) count.textContent = `${formatNumber(getAdminVisibleRecords(body.dataset.adminEntity).length)} resultados`;
    }
    if (input.dataset.search === "wizard-stores") {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "campaign-wizard") {
        popup.storeSearch = input.value;
        const list = document.getElementById("wizard-chain-list");
        if (list) list.innerHTML = renderCampaignWizardChainList(popup);
        updateCampaignWizardSelectionUI();
      }
    }
    if (input.dataset.search === "zone-stores") {
      const popup = state.popupStack[state.popupStack.length - 1];
      if (popup?.type === "admin-zone-stores") {
        popup.search = input.value;
        const list = document.getElementById("zone-store-list");
        if (list) list.innerHTML = renderZoneStoreRows(popup);
        updateZoneStoreSelectionUI();
      }
    }
  }

  function onDocumentChange(event) {
    const input = event.target;
    const popup = state.popupStack[state.popupStack.length - 1];
    const scheduleInput = input.closest("[data-schedule-field]");
    if (scheduleInput && popup?.type === "campaign-wizard") {
      const slot = getCampaignScheduleSlot(popup, scheduleInput.dataset.scheduleDate, scheduleInput.dataset.scheduleId);
      if (slot) slot[scheduleInput.dataset.scheduleField] = scheduleInput.value;
      return;
    }
    const chainInput = input.closest("[data-wizard-chain-id]");
    if (chainInput && popup?.type === "campaign-wizard") {
      const selectedIds = new Set(popup.selectedStoreIds || []);
      DATA.stores.filter((store) => store.chainId === chainInput.dataset.wizardChainId).forEach((store) => {
        if (chainInput.checked) selectedIds.add(store.id);
        else selectedIds.delete(store.id);
      });
      popup.selectedStoreIds = [...selectedIds];
      updateCampaignWizardSelectionUI();
      return;
    }
    const storeInput = input.closest("[data-wizard-store-id]");
    if (storeInput && popup?.type === "campaign-wizard") {
      const selectedIds = new Set(popup.selectedStoreIds || []);
      if (storeInput.checked) selectedIds.add(storeInput.dataset.wizardStoreId);
      else selectedIds.delete(storeInput.dataset.wizardStoreId);
      popup.selectedStoreIds = [...selectedIds];
      updateCampaignWizardSelectionUI();
      return;
    }
    const coordinatorInput = input.closest("[data-coordinator-store-id]");
    if (coordinatorInput && popup?.type === "campaign-wizard") {
      popup.coordinatorAssignments = popup.coordinatorAssignments || {};
      popup.coordinatorAssignments[coordinatorInput.dataset.coordinatorStoreId] = coordinatorInput.value;
      popup.firstMissingStoreId = null;
      updateCoordinatorAssignmentUI();
      return;
    }
    const batchModeInput = input.closest("[data-coordinator-batch-mode]");
    if (batchModeInput && popup?.type === "campaign-wizard") {
      popup.batchMode = batchModeInput.value;
      popup.batchGroupId = getCoordinatorBatchGroups(popup.batchMode)[0]?.[0] || "";
      const groupInput = document.querySelector("[data-coordinator-batch-group]");
      if (groupInput) groupInput.innerHTML = renderCoordinatorBatchGroupOptions(popup.batchMode, popup.batchGroupId);
      return;
    }
    const batchGroupInput = input.closest("[data-coordinator-batch-group]");
    if (batchGroupInput && popup?.type === "campaign-wizard") {
      popup.batchGroupId = batchGroupInput.value;
      return;
    }
    const batchCoordinatorInput = input.closest("[data-coordinator-batch-user]");
    if (batchCoordinatorInput && popup?.type === "campaign-wizard") {
      popup.batchCoordinatorId = batchCoordinatorInput.value;
      return;
    }
    const zoneInput = input.closest("[data-zone-store-id]");
    if (zoneInput && popup?.type === "admin-zone-stores") {
      const selectedIds = new Set(popup.selectedStoreIds || []);
      if (zoneInput.checked) selectedIds.add(zoneInput.dataset.zoneStoreId);
      else selectedIds.delete(zoneInput.dataset.zoneStoreId);
      popup.selectedStoreIds = [...selectedIds];
      updateZoneStoreSelectionUI();
    }
  }

  function onDocumentToggle(event) {
    const details = event.target.closest(".wizard-day-schedule");
    const popup = state.popupStack[state.popupStack.length - 1];
    if (details && popup?.type === "campaign-wizard" && popup.step === 1) {
      popup.openScheduleDate = details.open ? details.dataset.scheduleDate : null;
    }
  }

  function onDocumentSubmit(event) {
    const form = event.target;
    if (form.id === "login-form") {
      event.preventDefault();
      signIn(ROLE.coordinator);
      return;
    }
    if (form.id === "register-form") {
      event.preventDefault();
      renderToast("Registro de prueba completado. No se creó ninguna cuenta.");
      state.authMode = "login";
      render();
      return;
    }
    if (form.dataset.form === "report-response") {
      event.preventDefault();
      if (!form.reportValidity()) return;
      closeTopPopup();
      renderToast("Respuesta simulada enviada. No se guardó ningún dato.");
      return;
    }
    if (form.dataset.form === "admin-record") {
      event.preventDefault();
      closeTopPopup();
      renderToast("Formulario confirmado en la maqueta. Los datos no han cambiado.");
      return;
    }
    if (form.dataset.form === "campaign-type") {
      event.preventDefault();
      if (!form.reportValidity()) return;
      closeTopPopup();
      renderToast("Tipo de campaña de muestra. No se añadió al catálogo.");
      return;
    }
    if (form.dataset.form === "collaborator-contact" || form.dataset.form === "collaborator-responsible") {
      event.preventDefault();
      if (!form.reportValidity()) return;
      closeTopPopup();
      renderToast("Cambios de colaborador simulados. No se guardó ningún dato.");
      return;
    }
    if (form.dataset.form === "zone-stores") {
      event.preventDefault();
      closeTopPopup();
      renderToast("Asignación de tiendas simulada. La zona no se ha modificado.");
      return;
    }
    if (form.dataset.form === "campaign-wizard") {
      event.preventDefault();
      advanceCampaignWizard();
    }
  }

  function onDocumentKeydown(event) {
    if (event.key === "Escape") {
      if (state.popupStack.length) {
        event.preventDefault();
        closeTopPopup();
      } else if (state.tutorialOpen) {
        closeTutorial();
      } else if (state.openDropdown) {
        closeDropdowns();
      }
    }
    if (event.key === "Tab" && state.popupStack.length) {
      const dialog = document.querySelector("#popup-root .modal-backdrop:last-child .dialog");
      const focusable = [...dialog.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function initialize() {
    document.querySelectorAll("[data-icon]").forEach((element) => {
      element.innerHTML = icon(element.dataset.icon);
    });
    document.getElementById("campaign-trigger").querySelector(".icon-slot").innerHTML = icon("chevron");
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("input", onDocumentInput);
    document.addEventListener("change", onDocumentChange);
    document.addEventListener("submit", onDocumentSubmit);
    document.addEventListener("keydown", onDocumentKeydown);
    document.addEventListener("toggle", onDocumentToggle, true);
    window.addEventListener("hashchange", updateRouteFromHash);
    render();
  }

  initialize();
})();

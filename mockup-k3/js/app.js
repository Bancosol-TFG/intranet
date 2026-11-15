const DATA = window.MockData;
const APP = document.getElementById("app");
const MODAL_ROOT = document.getElementById("modal-root");
const TOAST = document.getElementById("toast");
const DAY_MINUTES_START = 8 * 60;
const DAY_MINUTES_END = 23 * 60;
const DAY_TOTAL_MINUTES = DAY_MINUTES_END - DAY_MINUTES_START;
const DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" });
const MONTH_FORMATTER = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const WEEKDAY_LONG_FORMATTER = new Intl.DateTimeFormat("es-ES", { weekday: "long" });
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const NUMBER_FORMATTER = new Intl.NumberFormat("es-ES");
const ROLE_LABELS = {
  ADMIN: "ADMIN",
  COORDINATOR: "COORDINATOR",
  "COLLABORATOR-MANAGER": "COLLABORATOR-MANAGER",
  "STORE-MANAGER": "STORE-MANAGER",
  VOLUNTEER: "VOLUNTEER"
};
const STATUS_LABELS = {
  complete: "Completo",
  pending: "Pendiente",
  conflict: "Conflicto",
  outside: "Fuera de campaña"
};
const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"/>',
  zones: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/>',
  stores: '<path d="M4 10v10h16V10M3 4h18l-1 6a3 3 0 0 1-5 1 3 3 0 0 1-6 0 3 3 0 0 1-5-1L3 4Z"/><path d="M9 20v-5h6v5"/>',
  collaborators: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 4 4.9V20"/>',
  reports: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6M8 9h2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  star: '<path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2-4.5-4.4 6.3-.9L12 2.8Z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.3 2c-1 .8-1.8 1.2-1.8 2.5M12 17h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"/>',
  trash: '<path d="M3 6h18M8 6V3h8v3M19 6l-1 15H6L5 6M10 10v7M14 10v7"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  arrowRight: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5m6 6-6-6 6-6"/>',
  warning: '<path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16M15 4v16"/>',
  cards: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/>',
  location: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  audit: '<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  campaign: '<path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 16.8 13 21H7l-1.7-6M3 10H1v4h2"/>',
  drag: '<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
  external: '<path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>'
};

function icon(name, size = 18, className = "") {
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.info}</svg>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function toDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value, amount) {
  const date = toDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function startOfMonth(value) {
  return `${value.slice(0, 7)}-01`;
}

function addMonths(value, amount) {
  const date = toDate(startOfMonth(value));
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 10);
}

function startOfWeek(value) {
  const date = toDate(value);
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - weekday + 1);
  return date.toISOString().slice(0, 10);
}

function listDates(startDate, endDate) {
  const dates = [];
  let cursor = startDate;
  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const normalized = Math.max(0, Math.min(1439, minutes));
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function formatDate(value, formatter = DATE_FORMATTER) {
  return formatter.format(toDate(value));
}

function formatMonthRange(dateKeys) {
  if (dateKeys.length === 1) {
    return formatDate(dateKeys[0], LONG_DATE_FORMATTER);
  }
  const first = toDate(dateKeys[0]);
  const last = toDate(dateKeys[dateKeys.length - 1]);
  const firstMonth = first.getUTCMonth() === last.getUTCMonth() ? "" : new Intl.DateTimeFormat("es-ES", { month: "short" }).format(first);
  return `${first.getUTCDate()} ${firstMonth} – ${last.getUTCDate()} ${new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(last)}`;
}

function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase("es-ES") + value.slice(1);
}

function getInitials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase("es-ES");
}

function getUser(userId) {
  return DATA.users.find((user) => user.id === Number(userId));
}

function getStore(storeId) {
  return DATA.stores.find((store) => store.id === Number(storeId));
}

function getChain(chainId) {
  return DATA.chains.find((chain) => chain.id === Number(chainId));
}

function getZone(zoneId) {
  return DATA.zones.find((zone) => zone.id === Number(zoneId));
}

function getLocality(localityId) {
  return DATA.localities.find((locality) => locality.id === Number(localityId));
}

function getCollaborator(collaboratorId) {
  return DATA.collaborators.find((collaborator) => collaborator.id === Number(collaboratorId));
}

function getCampaign(campaignId = STATE.campaignId) {
  return DATA.campaigns.find((campaign) => campaign.id === Number(campaignId));
}

function getReport(reportId) {
  return DATA.reports.find((report) => report.id === Number(reportId));
}

function getSlot(slotId) {
  return DATA.slots.find((slot) => slot.id === slotId);
}

function isStoreParticipant(store, campaignId = STATE.campaignId) {
  return Number(campaignId) === 1 || store.springParticipant;
}

function isDateInCampaign(value, campaignId = STATE.campaignId) {
  const campaign = getCampaign(campaignId);
  return value >= campaign.startDate && value <= campaign.endDate;
}

function visibleStores(campaignId = STATE.campaignId) {
  return DATA.stores.filter((store) => {
    if (!isStoreParticipant(store, campaignId)) {
      return false;
    }
    if (STATE.role === "COORDINATOR") {
      const zone = getZone(store.zoneId);
      return zone && zone.coordinatorId === STATE.userId;
    }
    return true;
  });
}

function visibleZones() {
  if (STATE.role === "COORDINATOR") {
    return DATA.zones.filter((zone) => zone.coordinatorId === STATE.userId);
  }
  return DATA.zones;
}

function visibleReports() {
  const storeIds = new Set(visibleStores().map((store) => store.id));
  return DATA.reports.filter((report) => report.campaignId === STATE.campaignId && storeIds.has(report.storeId));
}

function getConflict(storeId, value, slotId, campaignId = STATE.campaignId) {
  return DATA.conflicts.find((conflict) => conflict.campaignId === Number(campaignId) && conflict.date === value && conflict.slotId === slotId && conflict.storeIds.includes(Number(storeId)));
}

function getStoreSlot(store, value, slot, campaignId = STATE.campaignId) {
  if (!isStoreParticipant(store, campaignId) || !isDateInCampaign(value, campaignId)) {
    return { status: "outside", assigned: 0, required: 0, missing: 0, conflict: null };
  }
  const conflict = getConflict(store.id, value, slot.id, campaignId);
  if (conflict) {
    return { status: "conflict", assigned: store.required, required: store.required, missing: 0, conflict };
  }
  const dateNumber = Number(value.slice(-2));
  const slotOffset = slot.id === "afternoon" ? 2 : 0;
  const pending = (store.id + dateNumber + slotOffset) % 5 === 0 || (store.id === 8 && slot.id === "morning");
  const missing = pending ? (store.required > 2 && (dateNumber + store.id) % 2 === 0 ? 2 : 1) : 0;
  return { status: pending ? "pending" : "complete", assigned: store.required - missing, required: store.required, missing, conflict: null };
}

function getAggregateSlot(value, slot, campaignId = STATE.campaignId) {
  const stores = visibleStores(campaignId);
  const results = stores.map((store) => ({ store, ...getStoreSlot(store, value, slot, campaignId) }));
  const activeResults = results.filter((result) => result.status !== "outside");
  let status = "outside";
  if (activeResults.some((result) => result.status === "conflict")) {
    status = "conflict";
  } else if (activeResults.some((result) => result.status === "pending")) {
    status = "pending";
  } else if (activeResults.length) {
    status = "complete";
  }
  return {
    status,
    stores: results,
    completeCount: activeResults.filter((result) => result.status === "complete").length,
    pendingCount: activeResults.filter((result) => result.status === "pending").length,
    conflictCount: activeResults.filter((result) => result.status === "conflict").length,
    missing: activeResults.reduce((total, result) => total + result.missing, 0)
  };
}

function getDayStatus(value, campaignId = STATE.campaignId) {
  const statuses = DATA.slots.map((slot) => getAggregateSlot(value, slot, campaignId).status);
  if (statuses.includes("conflict")) {
    return "conflict";
  }
  if (statuses.every((status) => status === "outside")) {
    return "outside";
  }
  if (statuses.includes("pending")) {
    return "pending";
  }
  return "complete";
}

function getStoreCampaignStatus(store, campaignId = STATE.campaignId) {
  const statuses = listDates(getCampaign(campaignId).startDate, getCampaign(campaignId).endDate).flatMap((value) => DATA.slots.map((slot) => getStoreSlot(store, value, slot, campaignId).status));
  if (statuses.includes("conflict")) {
    return "conflict";
  }
  if (statuses.includes("pending")) {
    return "pending";
  }
  if (statuses.every((status) => status === "outside")) {
    return "outside";
  }
  return "complete";
}

function getCampaignMetrics() {
  const stores = visibleStores();
  const reports = visibleReports();
  const values = listDates(getCampaign().startDate, getCampaign().endDate);
  const results = stores.flatMap((store) => values.flatMap((value) => DATA.slots.map((slot) => getStoreSlot(store, value, slot))));
  return {
    noManager: stores.filter((store) => !store.managerId).length,
    pendingReports: reports.filter((report) => !report.solution).length,
    conflicts: results.filter((result) => result.status === "conflict").length,
    pending: results.filter((result) => result.status === "pending").length,
    complete: results.filter((result) => result.status === "complete").length
  };
}

function statusBadge(status, label = STATUS_LABELS[status]) {
  const warning = status === "conflict" ? icon("warning", 13) : "";
  return `<span class="status-badge status-${status}">${warning}${escapeHtml(label)}</span>`;
}

function roleBadges(roles) {
  return roles.map((role) => `<span class="role-code" translate="no">${escapeHtml(ROLE_LABELS[role])}</span>`).join("");
}

function userContactButton(userId, label = null) {
  const user = getUser(userId);
  if (!user) {
    return '<span class="muted">Sin asignar</span>';
  }
  return `<button class="contact-link" type="button" data-action="contact-user" data-id="${user.id}" aria-label="Abrir contacto de ${escapeHtml(user.name)}">${icon("user", 13)}<span class="truncate">${escapeHtml(label || user.name)}</span></button>`;
}

function collaboratorContactButton(collaboratorId, contactId) {
  const collaborator = getCollaborator(collaboratorId);
  const contact = collaborator?.contacts.find((item) => item.id === Number(contactId));
  if (!contact) {
    return '<span class="muted">Sin contacto</span>';
  }
  return `<button class="contact-link" type="button" data-action="contact-collaborator" data-collaborator-id="${collaboratorId}" data-id="${contact.id}">${icon("user", 13)}${escapeHtml(contact.name)}</button>`;
}

function isReadonlyCampaign() {
  return STATE.context === "campaign" && getCampaign().readonly;
}

function mutationDisabled() {
  return isReadonlyCampaign() ? "disabled aria-describedby=\"readonly-explanation\"" : "";
}

function calendarDates() {
  if (STATE.calendarView === "day") {
    return [STATE.calendarCursor];
  }
  if (STATE.calendarView === "week") {
    const start = startOfWeek(STATE.calendarCursor);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }
  const monthStart = startOfMonth(STATE.calendarCursor);
  const gridStart = startOfWeek(monthStart);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function calendarTitle() {
  const dates = calendarDates();
  if (STATE.calendarView === "month") {
    return capitalize(formatDate(startOfMonth(STATE.calendarCursor), MONTH_FORMATTER));
  }
  return capitalize(formatMonthRange(STATE.calendarView === "week" ? [dates[0], dates[6]] : dates));
}

const TODAY = dateKey(new Date());
const STATE = {
  role: null,
  userId: null,
  context: "campaign",
  view: "home",
  campaignId: 1,
  calendarView: "week",
  calendarCursor: TODAY,
  storeCalendarCursor: TODAY,
  zoneDisplay: "cards",
  storeSearch: "",
  storeFilters: { zoneId: null, chainId: null, status: null, manager: null },
  reportFilter: "all",
  adminSection: "overview",
  adminQuery: "",
  popover: null,
  modals: [],
  slotSort: "default",
  tutorialStep: 0,
  wizard: null,
  authView: "login"
};

function navigate(view) {
  STATE.context = "campaign";
  STATE.view = view;
  STATE.popover = null;
  STATE.storeFilters = view === "stores" ? STATE.storeFilters : { zoneId: null, chainId: null, status: null, manager: null };
  renderApp();
}

function navigateAdmin(section = "overview") {
  if (STATE.role !== "ADMIN") {
    return;
  }
  STATE.context = "admin";
  STATE.adminSection = section;
  STATE.adminQuery = "";
  STATE.popover = null;
  renderApp();
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${icon(type === "success" ? "check" : "info", 19)}<span>${escapeHtml(message)}</span>`;
  TOAST.replaceChildren(toast);
  window.setTimeout(() => {
    if (toast.isConnected) {
      toast.remove();
    }
  }, 4200);
}

function openModal(modal) {
  const focusOrigin = document.activeElement;
  STATE.modals.push({ ...modal, focusOrigin });
  STATE.popover = null;
  renderModals();
}

function closeTopModal() {
  const closed = STATE.modals.pop();
  if (closed?.type === "wizard") {
    STATE.wizard = null;
  }
  renderModals();
  if (closed?.focusOrigin?.isConnected) {
    closed.focusOrigin.focus();
  }
}

function closeAllModals() {
  STATE.modals = [];
  STATE.wizard = null;
  MODAL_ROOT.replaceChildren();
}

function renderAuth() {
  const isLogin = STATE.authView === "login";
  APP.innerHTML = `
    <main class="auth-page" id="main-content">
      <section class="auth-visual" aria-labelledby="auth-visual-title">
        <div class="auth-brand">
          <span class="brand-mark"><img src="assets/logo.png" width="20" height="20" alt="Logo de la intranet"></span>
          <span>Intranet · Banco de alimentos</span>
        </div>
        <div class="auth-message">
          <span class="auth-eyebrow">Mockup visual · Datos ficticios</span>
          <h1 id="auth-visual-title">La campaña, en un solo lugar</h1>
          <p>Coordina zonas, tiendas y entidades colaboradoras con una visión clara del calendario y sus incidencias.</p>
          <div class="auth-feature-row" aria-label="Contenido del mockup">
            <div class="auth-feature"><strong>24</strong><span>tiendas de muestra</span></div>
            <div class="auth-feature"><strong>5</strong><span>zonas coordinadas</span></div>
            <div class="auth-feature"><strong>2</strong><span>campañas</span></div>
          </div>
        </div>
        <p class="small">Prototipo sin persistencia ni conexión a servicios.</p>
      </section>
      <section class="auth-form-side" aria-labelledby="auth-form-title">
        <div class="auth-card">
          <h2 id="auth-form-title">${isLogin ? "Accede a la intranet" : "Solicita tu registro"}</h2>
          <p>${isLogin ? "Explora el dashboard con un rol de prueba." : "Formulario visual. No se creará ninguna cuenta."}</p>
          <form class="auth-form" id="auth-form" data-form="${isLogin ? "login" : "register"}">
            ${isLogin ? "" : `
              <div class="field"><label for="register-name">Nombre y apellidos</label><input id="register-name" name="name" autocomplete="name" required placeholder="Por ejemplo, Marina López…"></div>
              <div class="field"><label for="register-phone">Teléfono</label><input id="register-phone" name="phone" type="tel" autocomplete="tel" placeholder="Por ejemplo, +34 600 000 000…"></div>
            `}
            <div class="field"><label for="auth-email">Correo electrónico</label><input id="auth-email" name="email" type="email" autocomplete="email" spellcheck="false" required placeholder="nombre@entidad.example…"></div>
            <div class="field"><label for="auth-password">Contraseña</label><input id="auth-password" name="password" type="password" autocomplete="${isLogin ? "current-password" : "new-password"}" required placeholder="Introduce una contraseña…"></div>
            ${isLogin ? "" : '<div class="field"><label for="register-role">Rol solicitado</label><select id="register-role" name="role"><option value="COORDINATOR">COORDINATOR</option><option value="COLLABORATOR-MANAGER">COLLABORATOR-MANAGER</option><option value="STORE-MANAGER">STORE-MANAGER</option><option value="VOLUNTEER">VOLUNTEER</option></select></div>'}
            <button class="btn" type="submit">${isLogin ? "Acceder al mockup" : "Simular solicitud de registro"}${icon("arrowRight", 16)}</button>
          </form>
          ${isLogin ? `
            <div class="auth-divider">Acceso directo</div>
            <div class="mock-login-buttons">
              <button class="btn btn-soft" type="button" data-action="login-mock" data-role="ADMIN">Entrar como admin · Solo mock</button>
              <button class="btn btn-secondary" type="button" data-action="login-mock" data-role="COORDINATOR">Entrar como coord · Solo mock</button>
            </div>
          ` : ""}
          <p class="auth-switch">${isLogin ? "¿No tienes acceso?" : "¿Ya tienes acceso?"} <button class="link-button" type="button" data-action="switch-auth">${isLogin ? "Ver registro simulado" : "Volver al acceso"}</button></p>
        </div>
      </section>
    </main>`;
}

function loginAs(role) {
  STATE.role = role;
  STATE.userId = role === "ADMIN" ? 1 : 2;
  STATE.context = "campaign";
  STATE.view = "home";
  STATE.campaignId = 1;
  STATE.calendarCursor = TODAY >= getCampaign(1).startDate && TODAY <= getCampaign(1).endDate ? TODAY : getCampaign(1).startDate;
  STATE.storeCalendarCursor = STATE.calendarCursor;
  STATE.popover = null;
  closeAllModals();
  renderApp();
}

function renderCampaignOptions() {
  return DATA.campaigns.map((campaign) => `<option value="${campaign.id}" ${campaign.id === STATE.campaignId ? "selected" : ""}>${escapeHtml(campaign.name)}${campaign.readonly ? " · Solo lectura" : ""}</option>`).join("");
}

function renderCampaignNavigation() {
  const sections = [
    ["zones", "Zonas", "zones"],
    ["stores", "Tiendas", "stores"],
    ["collaborators", "Colaboradores", "collaborators"],
    ["reports", "Incidencias", "reports"],
    ["calendar", "Calendario", "calendar"]
  ];
  return `
    <a class="nav-link ${STATE.view === "home" ? "active" : ""}" href="#/home" data-nav="home" ${STATE.view === "home" ? 'aria-current="page"' : ""}>${icon("home", 17)}<span>Casa</span></a>
    ${DATA.CONFIG.SHOW_SECTIONS_IN_NAV ? sections.map(([view, label, iconName]) => `<a class="nav-link ${STATE.view === view ? "active" : ""}" href="#/${view}" data-nav="${view}" ${STATE.view === view ? 'aria-current="page"' : ""}>${icon(iconName, 17)}<span>${label}</span></a>`).join("") : ""}
  `;
}

function renderAdminNavigation() {
  const items = [
    ["overview", "Resumen", "home"],
    ["stores", "Tiendas", "stores"],
    ["chains", "Cadenas", "link"],
    ["collaborators", "Colaboradores", "collaborators"],
    ["zones", "Zonas", "zones"],
    ["audit", "Auditoría", "audit"],
    ["users", "Usuarios", "user"],
    ["campaigns", "Campañas", "campaign"]
  ];
  return items.map(([section, label, iconName]) => `<a class="nav-link ${STATE.adminSection === section ? "active" : ""}" href="#/admin/${section}" data-admin-nav="${section}" ${STATE.adminSection === section ? 'aria-current="page"' : ""}>${icon(iconName, 16)}<span>${label}</span></a>`).join("");
}

function renderNotifications() {
  const notifications = DATA.notifications.filter((notification) => notification.campaignId === STATE.campaignId);
  if (STATE.popover !== "notifications") {
    return "";
  }
  return `<div class="popover" role="dialog" aria-label="Notificaciones de campaña">
    <div class="popover-header row-between"><h2>Notificaciones</h2><span class="badge badge-blue">${NUMBER_FORMATTER.format(notifications.length)}</span></div>
    <div class="notification-list">
      ${notifications.length ? notifications.map((notification) => `<button class="notification-item" type="button" data-action="open-notification" data-id="${notification.id}">
        <span class="notification-icon">${icon(notification.type === "calendar" ? "calendar" : notification.type === "report" ? "reports" : "stores", 16)}</span>
        <span class="notification-copy"><strong>${escapeHtml(notification.title)}</strong><span>${escapeHtml(notification.text)}</span></span>
      </button>`).join("") : '<div class="empty-state"><p>No hay notificaciones en esta campaña.</p></div>'}
    </div>
  </div>`;
}

function renderAccountMenu() {
  if (STATE.popover !== "account") {
    return "";
  }
  const user = getUser(STATE.userId);
  return `<div class="popover" role="dialog" aria-label="Perfil y ajustes">
    <div class="account-summary"><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(user.email)}</span><div class="row row-wrap" style="margin-top:8px">${roleBadges(user.roles)}</div></div>
    <div class="menu-list">
      <button class="menu-item" type="button" data-action="contact-user" data-id="${user.id}">${icon("user", 17)}Ver ficha de contacto</button>
      <div style="padding:8px 10px">
        <label for="visual-density">Densidad visual</label>
        <select id="visual-density" data-action="visual-density" name="density" autocomplete="off"><option value="normal">Normal</option><option value="compact" ${document.body.classList.contains("compact-density") ? "selected" : ""}>Compacta</option></select>
      </div>
      <div style="padding:8px 10px">
        <label for="visual-text">Tamaño de texto</label>
        <select id="visual-text" data-action="visual-text" name="textSize" autocomplete="off"><option value="normal">Estándar</option><option value="large" ${document.body.classList.contains("large-text") ? "selected" : ""}>Grande</option></select>
      </div>
      <button class="menu-item" type="button" data-action="logout">${icon("logout", 17)}Cerrar sesión</button>
    </div>
  </div>`;
}

function renderHeader() {
  const campaign = getCampaign();
  const isAdmin = STATE.context === "admin";
  const user = getUser(STATE.userId);
  return `<header>
    <div class="topbar">
      <a class="brand" href="${isAdmin ? "#/admin/overview" : "#/home"}" ${isAdmin ? 'data-admin-nav="overview"' : 'data-nav="home"'} aria-label="Intranet, inicio">
        <span class="brand-mark"><img src="assets/logo.png" width="20" height="20" alt=""></span><span class="brand-text">Intranet</span>
      </a>
      ${isAdmin ? "" : `<div class="campaign-picker"><img src="assets/logo.png" width="1" height="1" alt="" hidden><label class="sr-only" for="campaign-selector">Campaña activa</label>${icon("campaign", 17)}<select id="campaign-selector" name="campaign" autocomplete="off" data-action="select-campaign">${renderCampaignOptions()}</select></div>`}
      ${isAdmin ? `<nav class="admin-nav" aria-label="Navegación de administración">${renderAdminNavigation()}</nav>` : `<nav class="top-nav" aria-label="Navegación de campaña">${renderCampaignNavigation()}</nav>`}
      <div class="top-actions">
        <span class="role-badge" title="Rol activo" translate="no">${escapeHtml(STATE.role)}</span>
        ${isAdmin ? `<span class="admin-indicator">${icon("star", 15)}Administración</span><a class="btn btn-soft" href="#/home" data-action="back-campaign">${icon("arrowLeft", 15)}Volver a campaña</a>` : STATE.role === "ADMIN" ? `<button class="btn btn-icon" type="button" data-action="open-admin" aria-label="Abrir administración" title="Administración">${icon("star", 18)}</button>` : ""}
        ${isAdmin ? "" : `<div class="popover-wrap"><button class="btn btn-icon" type="button" data-action="toggle-popover" data-popover="notifications" aria-label="Abrir notificaciones" aria-expanded="${STATE.popover === "notifications"}">${icon("bell", 18)}</button>${renderNotifications()}</div>`}
        <button class="btn btn-icon" type="button" data-action="open-tutorial" aria-label="Abrir tutorial de esta vista" title="Tutorial">${icon("help", 18)}</button>
        <div class="popover-wrap"><button class="btn btn-icon" type="button" data-action="toggle-popover" data-popover="account" aria-label="Abrir perfil de ${escapeHtml(user.name)}" aria-expanded="${STATE.popover === "account"}">${icon("user", 18)}</button>${renderAccountMenu()}</div>
      </div>
    </div>
    <div class="campaign-subbar ${isAdmin ? "admin-subbar" : ""}">
      <div class="campaign-title">${isAdmin ? `${icon("settings", 17)}Gestión global de la intranet` : `${icon("calendar", 17)}<span>${capitalize(formatDate(campaign.startDate, SHORT_DATE_FORMATTER))} – ${formatDate(campaign.endDate, SHORT_DATE_FORMATTER)}</span><span class="badge ${campaign.readonly ? "status-pending" : "status-complete"}">${campaign.readonly ? "Campaña pasada" : "En curso"}</span>`}</div>
      ${isAdmin ? '<span class="small muted">Las acciones son simuladas y no modifican datos</span>' : `<span class="small muted">Ámbito: ${STATE.role === "ADMIN" ? "todas las zonas y tiendas" : "Norte y Centro · 10 tiendas"}</span>`}
    </div>
    ${!isAdmin && campaign.readonly ? `<div class="readonly-banner" id="readonly-explanation">${icon("lock", 15)}Campaña en solo lectura: puedes navegar y consultar, pero no realizar cambios.</div>` : ""}
  </header>`;
}

function renderPageHeader(title, description, actions = "") {
  return `<div class="page-header"><div class="page-title"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;
}

function renderApp() {
  if (!STATE.role) {
    renderAuth();
    MODAL_ROOT.replaceChildren();
    return;
  }
  let content = "";
  if (STATE.context === "admin") {
    content = renderAdmin();
  } else {
    const renderers = {
      home: renderHome,
      zones: renderZones,
      stores: renderStores,
      collaborators: renderCollaborators,
      reports: renderReports,
      calendar: renderCalendarPage
    };
    content = (renderers[STATE.view] || renderHome)();
  }
  APP.innerHTML = `<div class="app-shell">${renderHeader()}<main class="page" id="main-content" tabindex="-1">${content}</main></div>`;
  renderModals();
}

function renderCalendarToolbar(options = {}) {
  return `<div class="calendar-toolbar">
    <div class="calendar-toolbar-group">
      <div class="segmented" aria-label="Vista del calendario">
        ${["day", "week", "month"].map((view) => `<button type="button" data-action="calendar-view" data-view="${view}" class="${STATE.calendarView === view ? "active" : ""}" aria-pressed="${STATE.calendarView === view}">${view === "day" ? "Día" : view === "week" ? "Semana" : "Mes"}</button>`).join("")}
      </div>
      <button class="btn btn-secondary btn-sm" type="button" data-action="calendar-today">Volver a hoy</button>
    </div>
    <div class="calendar-toolbar-group">
      <button class="btn btn-icon" type="button" data-action="calendar-previous" aria-label="Periodo anterior">${icon("chevronLeft", 17)}</button>
      <h2 class="calendar-date-title">${escapeHtml(calendarTitle())}</h2>
      <button class="btn btn-icon" type="button" data-action="calendar-next" aria-label="Periodo siguiente">${icon("chevronRight", 17)}</button>
    </div>
    ${options.legend === false ? "" : `<div class="calendar-legend" aria-label="Leyenda de estados"><span class="legend-item"><span class="legend-dot dot-complete"></span>Completa</span><span class="legend-item"><span class="legend-dot dot-pending"></span>Pendiente</span><span class="legend-item"><span class="legend-dot dot-conflict"></span>Conflicto</span><span class="legend-item"><span class="legend-dot dot-outside"></span>Fuera de campaña</span></div>`}
  </div>`;
}

function renderTimeAxis() {
  const labels = Array.from({ length: 16 }, (_, index) => 8 + index);
  return `<div class="time-axis" aria-hidden="true">${labels.map((hour) => `<span class="time-label" style="top:${((hour * 60 - DAY_MINUTES_START) / DAY_TOTAL_MINUTES) * 100}%">${String(hour).padStart(2, "0")}:00</span>`).join("")}</div>`;
}

function renderTimeGuides() {
  return Array.from({ length: 16 }, (_, index) => `<span class="hour-guide" style="top:${(index / 15) * 100}%" aria-hidden="true"></span>`).join("");
}

function renderTimelineEvent(value, slot, options = {}) {
  const aggregate = getAggregateSlot(value, slot);
  const top = ((timeToMinutes(slot.start) - DAY_MINUTES_START) / DAY_TOTAL_MINUTES) * 100;
  const height = ((timeToMinutes(slot.end) - timeToMinutes(slot.start)) / DAY_TOTAL_MINUTES) * 100;
  const status = aggregate.status;
  let detail = `${slot.start}–${slot.end}`;
  if (status === "conflict") {
    detail = `${aggregate.conflictCount} tiendas en conflicto`;
  } else if (status === "pending") {
    detail = `${aggregate.missing} turnos por cubrir`;
  } else if (status === "complete") {
    detail = "Todas las tiendas completas";
  } else {
    detail = "Fuera de campaña";
  }
  return `<button type="button" class="calendar-event event-${status} ${options.compact ? "calendar-event-compact" : ""}" style="top:${top}%;height:${height}%" data-action="open-slot" data-date="${value}" data-slot="${slot.id}" aria-label="${escapeHtml(`${slot.label}, ${slot.start} a ${slot.end}, ${STATUS_LABELS[status]}. ${detail}`)}">
    <span class="event-heading">${status === "conflict" ? icon("warning", 12) : ""}<strong>${escapeHtml(slot.label)}</strong></span><span>${slot.start}–${slot.end}</span>${options.compact ? "" : `<span>${escapeHtml(detail)}</span>`}
  </button>`;
}

function renderTimeline(dates, options = {}) {
  return `<div class="timeline-scroll"><div class="timeline-grid ${dates.length === 1 ? "day-view" : ""}" style="--day-count:${dates.length}">
    <div class="timeline-header"><div class="timeline-corner"><span class="sr-only">Horas</span></div>${dates.map((value) => {
      const date = toDate(value);
      const inCampaign = isDateInCampaign(value);
      return `<div class="timeline-day-header" title="${escapeHtml(formatDate(value, LONG_DATE_FORMATTER))}"><strong>${capitalize(WEEKDAY_FORMATTER.format(date)).replace(".", "")}</strong><span class="day-number ${value === TODAY ? "today" : ""}">${date.getUTCDate()}</span>${inCampaign ? "" : '<span class="sr-only">Fuera de campaña</span>'}</div>`;
    }).join("")}</div>
    <div class="timeline-track">
      ${renderTimeAxis()}
      ${dates.map((value) => `<div class="timeline-day-column ${isDateInCampaign(value) ? "" : "outside-campaign"}" data-date-column="${value}">${renderTimeGuides()}${DATA.slots.map((slot) => renderTimelineEvent(value, slot, { compact: options.compact || dates.length > 1 })).join("")}</div>`).join("")}
    </div>
  </div></div>`;
}

function renderMonthCalendar(dates) {
  const month = startOfMonth(STATE.calendarCursor).slice(0, 7);
  return `<div class="month-grid">${Array.from({ length: 7 }, (_, index) => {
    const weekday = WEEKDAY_LONG_FORMATTER.format(toDate(addDays(startOfWeek("2026-11-09"), index)));
    return `<div class="month-weekday">${capitalize(weekday)}</div>`;
  }).join("")}${dates.map((value) => {
    const status = getDayStatus(value);
    const activeStores = visibleStores().filter((store) => isStoreParticipant(store));
    const dayResults = DATA.slots.map((slot) => getAggregateSlot(value, slot));
    const conflictCount = dayResults.reduce((total, result) => total + result.conflictCount, 0);
    const pending = dayResults.reduce((total, result) => total + result.missing, 0);
    const date = toDate(value);
    const detail = status === "outside" ? "Sin jornada de campaña" : status === "conflict" ? `${conflictCount} tiendas en conflicto` : status === "pending" ? `${pending} turnos por cubrir` : `${activeStores.length} tiendas completas`;
    return `<button class="month-day ${value.slice(0, 7) !== month ? "outside-month" : ""}" type="button" data-action="open-day-summary" data-date="${value}" aria-label="${escapeHtml(`${formatDate(value, LONG_DATE_FORMATTER)}, ${STATUS_LABELS[status]}`)}"><span class="month-day-number ${value === TODAY ? "today" : ""}">${date.getUTCDate()}</span><span class="month-summary status-${status}">${status === "conflict" ? icon("warning", 12) : ""}<strong>${STATUS_LABELS[status]}</strong><span>${escapeHtml(detail)}</span></span></button>`;
  }).join("")}</div>`;
}

function renderDayInsights(value) {
  const results = visibleStores().flatMap((store) => DATA.slots.map((slot) => ({ store, slot, ...getStoreSlot(store, value, slot) })));
  const pending = results.filter((result) => result.status === "pending");
  const conflicts = results.filter((result) => result.status === "conflict");
  const uniqueConflicts = [...new Map(conflicts.map((result) => [result.conflict.id, result.conflict])).values()];
  return `<aside class="day-insights" aria-label="Detalle de pendientes y conflictos">
    <section class="insight-card">
      <h3>${icon("clock", 16)}Cobertura pendiente</h3>
      ${pending.length ? `<p class="small">Faltan <strong>${NUMBER_FORMATTER.format(pending.reduce((total, result) => total + result.missing, 0))} turnos</strong> en ${NUMBER_FORMATTER.format(pending.length)} franjas de tienda.</p><ul>${pending.map((result) => `<li><button class="link-button" type="button" data-action="open-store" data-id="${result.store.id}">${escapeHtml(result.store.name)}</button> · ${escapeHtml(result.slot.label)}: faltan ${result.missing}</li>`).join("")}</ul>` : '<p class="small muted">No falta ningún turno por cubrir en las franjas visibles.</p>'}
    </section>
    <section class="insight-card">
      <h3>${icon("warning", 16)}Conflictos que revisar</h3>
      ${uniqueConflicts.length ? uniqueConflicts.map((conflict) => `<div class="conflict-card"><h4>${icon("warning", 14)}${conflict.type === "duplicate" ? "Voluntario duplicado" : "Turno fuera de horario"}</h4><p>${escapeHtml(conflict.reason)}</p><ul><li>Tiendas: ${conflict.storeIds.map((storeId) => escapeHtml(getStore(storeId).name)).join(", ")}</li><li>Entidad: ${escapeHtml(getCollaborator(conflict.collaboratorId).name)}</li><li>Asignó: ${userContactButton(conflict.assignedById)} · <span translate="no">STORE-MANAGER</span></li><li>Alias: <strong>${escapeHtml(conflict.volunteerAlias)}</strong></li></ul></div>`).join("") : '<p class="small muted">No hay conflictos en esta fecha y ámbito.</p>'}
    </section>
  </aside>`;
}

function renderCalendar(options = {}) {
  const dates = calendarDates();
  return `<section class="panel calendar-panel ${options.home ? "home-calendar" : ""}" aria-label="Calendario de campaña">
    <div class="panel-header">${options.home ? `<h2 class="widget-title">${icon("calendar", 18)}Calendario de campaña</h2>` : ""}${renderCalendarToolbar()}</div>
    <div class="calendar-body">${STATE.calendarView === "month" ? renderMonthCalendar(dates) : STATE.calendarView === "day" ? `<div class="day-calendar-layout">${renderTimeline(dates)}${renderDayInsights(STATE.calendarCursor)}</div>` : renderTimeline(dates, { compact: options.home })}</div>
  </section>`;
}

function renderCalendarPage() {
  return `${renderPageHeader("Calendario", "Consulta franjas, cobertura y conflictos en tu ámbito visible.")}${renderCalendar()}`;
}

function renderHomeWidgets() {
  const zones = visibleZones();
  const stores = visibleStores();
  const pendingReports = visibleReports().filter((report) => !report.solution);
  const metrics = getCampaignMetrics();
  return `<div class="home-widgets">
    <section class="widget" aria-labelledby="widget-zones"><div class="widget-header"><h2 class="widget-title" id="widget-zones">${icon("zones", 16)}Zonas</h2><a href="#/zones" data-nav="zones" class="small">Ver zonas</a></div><div class="widget-body">${zones.slice(0, 3).map((zone) => `<button class="widget-link" type="button" data-action="zone-stores" data-id="${zone.id}"><strong>${escapeHtml(zone.name)}</strong><span>${stores.filter((store) => store.zoneId === zone.id).length} tiendas ${icon("arrowRight", 12)}</span></button>`).join("")}${zones.length > 3 ? `<a class="small" href="#/zones" data-nav="zones">+ ${zones.length - 3} zonas más</a>` : ""}</div></section>
    <section class="widget" aria-labelledby="widget-stores"><div class="widget-header"><h2 class="widget-title" id="widget-stores">${icon("stores", 16)}Tiendas</h2><a href="#/stores" data-nav="stores" class="small">Ver tiendas</a></div><div class="widget-body">${stores.slice(0, 4).map((store) => `<button class="widget-link" type="button" data-action="open-store" data-id="${store.id}"><strong>${escapeHtml(store.name)}</strong>${statusBadge(getStoreCampaignStatus(store), getStoreCampaignStatus(store) === "complete" ? "Completo" : getStoreCampaignStatus(store) === "conflict" ? "Conflicto" : "Pendiente")}</button>`).join("")}</div></section>
    <section class="widget" aria-labelledby="widget-collaborators"><div class="widget-header"><h2 class="widget-title" id="widget-collaborators">${icon("collaborators", 16)}Colaboradores</h2><a href="#/collaborators" data-nav="collaborators" class="small">Ver entidades</a></div><div class="widget-body">${DATA.collaborators.map((collaborator) => `<a class="widget-link" href="#/collaborators" data-nav="collaborators"><strong>${escapeHtml(collaborator.name)}</strong><span>${collaborator.volunteerCount} voluntarios</span></a>`).join("")}<div class="alert alert-info small">${icon("info", 15)}<span>Conteos anónimos; datos de voluntariado protegidos.</span></div></div></section>
    <section class="widget" aria-labelledby="widget-reports"><div class="widget-header"><h2 class="widget-title" id="widget-reports">${icon("reports", 16)}Incidencias pendientes</h2><a href="#/reports" data-nav="reports" class="small">Ver todas</a></div><div class="widget-body">${pendingReports.length ? pendingReports.slice(0, 3).map((report) => `<button class="widget-link" type="button" data-action="open-report" data-id="${report.id}"><strong>${escapeHtml(getStore(report.storeId).name)}</strong><span>${formatDate(report.creationDate, SHORT_DATE_FORMATTER)}</span></button>`).join("") : '<div class="empty-state"><p>No hay incidencias pendientes.</p></div>'}</div></section>
    <section class="widget" aria-labelledby="widget-status"><div class="widget-header"><h2 class="widget-title" id="widget-status">${icon("check", 16)}Estado de la campaña</h2><span class="small muted">Todo el periodo</span></div><div class="widget-body">
      <button class="widget-link" type="button" data-action="metric-stores" data-filter="manager"><strong>Sin persona asignada</strong><span class="status-badge status-pending">${metrics.noManager}</span></button>
      <button class="widget-link" type="button" data-action="metric-reports"><strong>Incidencias sin respuesta</strong><span class="status-badge status-pending">${metrics.pendingReports}</span></button>
      <button class="widget-link" type="button" data-action="metric-calendar" data-filter="conflict"><strong>Conflictos</strong><span class="status-badge status-conflict">${metrics.conflicts}</span></button>
      <button class="widget-link" type="button" data-action="metric-stores" data-filter="pending"><strong>Franjas pendientes</strong><span class="status-badge status-pending">${metrics.pending}</span></button>
      <button class="widget-link" type="button" data-action="metric-stores" data-filter="complete"><strong>Franjas completas</strong><span class="status-badge status-complete">${metrics.complete}</span></button>
    </div></section>
  </div>`;
}

function renderHome() {
  return `${renderPageHeader("Resumen de campaña", `${getCampaign().name} · ${STATE.role === "ADMIN" ? "Vista global" : "Zonas asignadas a tu coordinación"}`)}<div class="home-layout">${renderCalendar({ home: true })}${renderHomeWidgets()}</div>`;
}

function renderZones() {
  const zones = visibleZones();
  const stores = visibleStores();
  const toolbar = `<div class="segmented" aria-label="Presentación de zonas"><button type="button" data-action="zones-display" data-display="cards" class="${STATE.zoneDisplay === "cards" ? "active" : ""}" aria-pressed="${STATE.zoneDisplay === "cards"}">${icon("cards", 14)}Tarjetas</button><button type="button" data-action="zones-display" data-display="table" class="${STATE.zoneDisplay === "table" ? "active" : ""}" aria-pressed="${STATE.zoneDisplay === "table"}">${icon("table", 14)}Tabla</button></div>`;
  let content = "";
  if (STATE.zoneDisplay === "cards") {
    content = `<div class="card-grid">${zones.map((zone) => {
      const zoneStores = stores.filter((store) => store.zoneId === zone.id);
      const pending = zoneStores.filter((store) => getStoreCampaignStatus(store) === "pending").length;
      const conflict = zoneStores.filter((store) => getStoreCampaignStatus(store) === "conflict").length;
      return `<article class="card zone-card"><div class="zone-card-header"><div><h2>${escapeHtml(zone.name)}</h2><span class="role-code" translate="no">${escapeHtml(zone.code)}</span></div><span class="badge badge-blue">${zoneStores.length} tiendas</span></div><dl class="data-list"><dt>Coordinación</dt><dd>${userContactButton(zone.coordinatorId)}</dd><dt>Entidades</dt><dd>${new Set(zoneStores.map((store) => store.collaboratorId)).size}</dd><dt>Estado</dt><dd><div class="row row-wrap">${conflict ? statusBadge("conflict", `${conflict} con conflicto`) : ""}${pending ? statusBadge("pending", `${pending} pendientes`) : ""}${!pending && !conflict ? statusBadge("complete", "Cobertura completa") : ""}</div></dd></dl><div class="actions"><button class="btn btn-soft grow" type="button" data-action="zone-stores" data-id="${zone.id}">Ver tiendas de ${escapeHtml(zone.name)}${icon("arrowRight", 15)}</button></div></article>`;
    }).join("")}</div>`;
  } else {
    content = `<div class="table-panel"><div class="table-scroll"><table><thead><tr><th>Zona</th><th>Código</th><th>Coordinación</th><th>Tiendas</th><th>Entidades</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${zones.map((zone) => {
      const zoneStores = stores.filter((store) => store.zoneId === zone.id);
      const conflict = zoneStores.some((store) => getStoreCampaignStatus(store) === "conflict");
      const pending = zoneStores.some((store) => getStoreCampaignStatus(store) === "pending");
      return `<tr><td class="strong">${escapeHtml(zone.name)}</td><td><span class="role-code">${escapeHtml(zone.code)}</span></td><td>${userContactButton(zone.coordinatorId)}</td><td class="number">${zoneStores.length}</td><td class="number">${new Set(zoneStores.map((store) => store.collaboratorId)).size}</td><td>${statusBadge(conflict ? "conflict" : pending ? "pending" : "complete")}</td><td><button class="btn btn-secondary btn-sm" type="button" data-action="zone-stores" data-id="${zone.id}">Ver tiendas</button></td></tr>`;
    }).join("")}</tbody></table></div></div>`;
  }
  return `${renderPageHeader("Zonas", "Territorios de coordinación y tiendas participantes.", toolbar)}${content}`;
}

function filteredStores() {
  const query = STATE.storeSearch.trim().toLocaleLowerCase("es-ES");
  return visibleStores().filter((store) => {
    const manager = store.managerId ? getUser(store.managerId).name : "sin asignar";
    const haystack = [store.name, getChain(store.chainId).name, getLocality(store.localityId).name, getZone(store.zoneId).name, manager, getCollaborator(store.collaboratorId).name].join(" ").toLocaleLowerCase("es-ES");
    if (query && !haystack.includes(query)) {
      return false;
    }
    if (STATE.storeFilters.zoneId && store.zoneId !== Number(STATE.storeFilters.zoneId)) {
      return false;
    }
    if (STATE.storeFilters.chainId && store.chainId !== Number(STATE.storeFilters.chainId)) {
      return false;
    }
    if (STATE.storeFilters.manager === "missing" && store.managerId) {
      return false;
    }
    if (STATE.storeFilters.status && getStoreCampaignStatus(store) !== STATE.storeFilters.status) {
      return false;
    }
    return true;
  });
}

function renderStoreFilterChips() {
  const chips = [];
  if (STATE.storeFilters.zoneId) {
    chips.push({ key: "zoneId", label: `Zona: ${getZone(STATE.storeFilters.zoneId).name}` });
  }
  if (STATE.storeFilters.chainId) {
    chips.push({ key: "chainId", label: `Cadena: ${getChain(STATE.storeFilters.chainId).name}` });
  }
  if (STATE.storeFilters.status) {
    chips.push({ key: "status", label: `Turnos: ${STATUS_LABELS[STATE.storeFilters.status]}` });
  }
  if (STATE.storeFilters.manager) {
    chips.push({ key: "manager", label: "Sin persona que asigna turnos" });
  }
  if (STATE.storeSearch) {
    chips.push({ key: "search", label: `Búsqueda: ${STATE.storeSearch}` });
  }
  if (!chips.length) {
    return "";
  }
  return `<div class="active-filters" aria-label="Filtros activos"><span class="small muted">Filtros activos:</span>${chips.map((chip) => `<button class="chip" type="button" data-action="remove-store-filter" data-filter="${chip.key}" aria-label="Quitar filtro ${escapeHtml(chip.label)}">${escapeHtml(chip.label)}${icon("close", 12)}</button>`).join("")}<button class="link-button small" type="button" data-action="clear-store-filters">Limpiar todos</button></div>`;
}

function renderStores() {
  const stores = filteredStores();
  const allVisible = visibleStores();
  const actions = `<button class="btn btn-secondary" type="button" data-action="clear-store-filters">${icon("filter", 15)}Restablecer filtros</button>`;
  return `${renderPageHeader("Tiendas", `${allVisible.length} establecimientos participantes en el ámbito visible.`, actions)}
    <form class="filter-bar" id="store-filter-form" data-form="store-filters">
      <div class="field filter-search"><label for="store-search">Buscar</label><div class="search-control">${icon("search", 16)}<input id="store-search" name="search" type="search" autocomplete="off" value="${escapeHtml(STATE.storeSearch)}" placeholder="Tienda, cadena, localidad, zona o persona…"></div></div>
      <div class="field"><label for="store-zone-filter">Zona</label><select id="store-zone-filter" name="zoneId" data-action="store-filter-change"><option value="">Todas</option>${visibleZones().map((zone) => `<option value="${zone.id}" ${Number(STATE.storeFilters.zoneId) === zone.id ? "selected" : ""}>${escapeHtml(zone.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="store-chain-filter">Cadena</label><select id="store-chain-filter" name="chainId" data-action="store-filter-change"><option value="">Todas</option>${DATA.chains.map((chain) => `<option value="${chain.id}" ${Number(STATE.storeFilters.chainId) === chain.id ? "selected" : ""}>${escapeHtml(chain.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="store-status-filter">Turnos</label><select id="store-status-filter" name="status" data-action="store-filter-change"><option value="">Todos</option><option value="complete" ${STATE.storeFilters.status === "complete" ? "selected" : ""}>Completo</option><option value="pending" ${STATE.storeFilters.status === "pending" ? "selected" : ""}>Pendiente</option><option value="conflict" ${STATE.storeFilters.status === "conflict" ? "selected" : ""}>Conflicto</option></select></div>
      <button class="btn" type="submit">Buscar</button>
    </form>
    ${renderStoreFilterChips()}
    <div class="table-panel"><div class="table-scroll"><table class="dense-table"><thead><tr><th>Tienda</th><th>Cadena</th><th>Localidad</th><th>Zona</th><th>Entidad colaboradora</th><th>Asignación de turnos</th><th>Turnos</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${stores.length ? stores.map((store) => {
      const status = getStoreCampaignStatus(store);
      return `<tr><td><button class="link-button strong" type="button" data-action="open-store" data-id="${store.id}">${escapeHtml(store.name)}</button><span class="subtle" style="display:block">${escapeHtml(store.address)}</span></td><td>${escapeHtml(getChain(store.chainId).name)}</td><td>${escapeHtml(getLocality(store.localityId).name)}</td><td><button class="link-button" type="button" data-action="zone-stores" data-id="${store.zoneId}">${escapeHtml(getZone(store.zoneId).name)}</button></td><td>${escapeHtml(getCollaborator(store.collaboratorId).name)}</td><td>${userContactButton(store.managerId)}</td><td>${statusBadge(status)}</td><td><button class="btn btn-icon btn-sm" type="button" data-action="open-store" data-id="${store.id}" aria-label="Ver ${escapeHtml(store.name)}">${icon("eye", 15)}</button></td></tr>`;
    }).join("") : '<tr><td colspan="8"><div class="empty-state"><p>No hay tiendas que coincidan con los filtros. Quita algún filtro para ampliar la búsqueda.</p></div></td></tr>'}</tbody></table></div><div class="table-footer"><span>Mostrando ${NUMBER_FORMATTER.format(stores.length)} de ${NUMBER_FORMATTER.format(allVisible.length)} tiendas</span><span>Turnos: estado agregado de la campaña</span></div></div>`;
}

function renderCollaborators() {
  const stores = visibleStores();
  const collaborators = DATA.collaborators.filter((collaborator) => stores.some((store) => store.collaboratorId === collaborator.id));
  return `${renderPageHeader("Colaboradores", "Entidades participantes, contactos y grupos con conteos anónimos.")}<div class="collaborator-grid">${collaborators.map((collaborator) => {
    const entityStores = stores.filter((store) => store.collaboratorId === collaborator.id);
    const locality = getLocality(collaborator.localityId);
    return `<article class="panel collaborator-card"><div class="panel-header"><div><h2>${escapeHtml(collaborator.name)}</h2><span class="small muted">${escapeHtml(collaborator.address)} · ${escapeHtml(locality.name)}</span></div><span class="badge badge-blue">${entityStores.length} tiendas</span></div><div class="panel-body">
      <dl class="data-list"><dt>Responsable</dt><dd>${userContactButton(collaborator.managerId)}<span class="role-code" translate="no">COLLABORATOR-MANAGER</span></dd><dt>Voluntariado</dt><dd><strong>${collaborator.volunteerCount}</strong> personas · información anónima</dd></dl>
      <section><div class="row-between"><h3>Contactos de la entidad</h3><button class="btn btn-secondary btn-sm" type="button" data-action="edit-entity" data-section="collaborators" data-id="${collaborator.id}" data-mode="contact" ${mutationDisabled()}>${icon("plus", 13)}Añadir contacto</button></div><ul class="contact-list">${collaborator.contacts.map((contact) => `<li>${collaboratorContactButton(collaborator.id, contact.id)}<button class="btn btn-ghost btn-sm" type="button" data-action="edit-entity" data-section="collaborators" data-id="${collaborator.id}" data-mode="contact" data-contact-id="${contact.id}" ${mutationDisabled()}>${icon("edit", 13)}Modificar</button></li>`).join("")}</ul></section>
      <section><div class="row-between"><h3>Grupos</h3><button class="btn btn-secondary btn-sm" type="button" data-action="assign-collaborator-manager" data-id="${collaborator.id}" ${mutationDisabled()}>${icon("settings", 13)}Asignar responsable</button></div><ul class="group-list">${collaborator.groups.map((group) => `<li><div class="group-item-copy"><strong>${escapeHtml(group.name)}</strong><span>${group.volunteerCount} voluntarios anónimos</span></div><div><span class="xsmall muted">Líder</span>${userContactButton(group.leaderId)}</div></li>`).join("")}</ul><button class="btn btn-soft btn-sm" type="button" data-action="view-groups" data-id="${collaborator.id}">${icon("collaborators", 14)}Ver resumen de grupos</button></section>
      <div class="alert alert-info">${icon("lock", 15)}<p>Nunca se muestran nombres ni datos de contacto del voluntariado.</p></div>
    </div></article>`;
  }).join("")}</div>`;
}

function renderReports() {
  const allReports = visibleReports();
  const reports = allReports.filter((report) => STATE.reportFilter === "all" || (STATE.reportFilter === "pending" ? !report.solution : Boolean(report.solution)));
  const controls = `<div class="segmented" aria-label="Filtrar incidencias">${[["all", "Todas"], ["pending", "Pendientes"], ["answered", "Respondidas"]].map(([filter, label]) => `<button type="button" data-action="report-filter" data-filter="${filter}" class="${STATE.reportFilter === filter ? "active" : ""}" aria-pressed="${STATE.reportFilter === filter}">${label}</button>`).join("")}</div>`;
  return `${renderPageHeader("Incidencias", "Consulta incidencias y su única respuesta asociada.", controls)}<div class="table-panel"><div class="report-list">${reports.length ? reports.map((report) => {
    const store = getStore(report.storeId);
    return `<article class="report-row"><div class="report-main"><strong>${escapeHtml(report.type)} · ${escapeHtml(store.name)}</strong><span>${escapeHtml(report.description)}</span></div><div>${userContactButton(report.reportedById, getUser(report.reportedById)?.name || null)}<span class="xsmall muted">Persona que informa</span></div><div class="small muted">${formatDate(report.creationDate, SHORT_DATE_FORMATTER)}</div><div>${statusBadge(report.solution ? "complete" : "pending", report.solution ? "Respondida" : "Pendiente")}</div><button class="btn btn-secondary btn-sm" type="button" data-action="open-report" data-id="${report.id}">${icon("eye", 14)}Ver detalle</button></article>`;
  }).join("") : '<div class="empty-state"><p>No hay incidencias con este filtro. Prueba otra selección.</p></div>'}</div><div class="table-footer"><span>${reports.length} de ${allReports.length} incidencias</span><span>Como máximo una respuesta por incidencia</span></div></div>`;
}

function modalFrame(content) {
  return `<div class="modal-card ${content.className || ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title-${content.layer}" ${content.description ? `aria-describedby="modal-description-${content.layer}"` : ""}>
    <div class="modal-header"><div class="grow"><h2 id="modal-title-${content.layer}">${content.title}</h2>${content.description ? `<p id="modal-description-${content.layer}">${content.description}</p>` : ""}</div><button class="btn btn-icon" type="button" data-action="close-modal" aria-label="Cerrar ventana">${icon("close", 19)}</button></div>
    <div class="modal-body">${content.body}</div>
    ${content.footer ? `<div class="modal-footer ${content.footerBetween ? "modal-footer-between" : ""}">${content.footer}</div>` : ""}
  </div>`;
}

function renderModalContent(modal, layer) {
  const renderers = {
    contact: renderContactModal,
    store: renderStoreModal,
    "store-day": renderStoreDayModal,
    slot: renderSlotModal,
    day: renderDayModal,
    report: renderReportModal,
    tutorial: renderTutorialModal,
    confirm: renderConfirmModal,
    groups: renderGroupsModal,
    "assign-manager": renderAssignManagerModal,
    "entity-form": renderEntityFormModal,
    "entity-view": renderEntityViewModal,
    "chain-stores": renderChainStoresModal,
    "zone-assignment": renderZoneAssignmentModal,
    wizard: renderWizardModal
  };
  const content = (renderers[modal.type] || renderConfirmModal)(modal);
  return { ...content, layer };
}

function renderModals() {
  if (!STATE.role) {
    MODAL_ROOT.replaceChildren();
    return;
  }
  const focused = MODAL_ROOT.querySelector(".top-modal .modal-card :focus");
  const focusId = focused?.id || "";
  const focusKey = focused?.dataset?.focusKey || "";
  MODAL_ROOT.innerHTML = STATE.modals.map((modal, index) => {
    const top = index === STATE.modals.length - 1;
    const content = modalFrame(renderModalContent(modal, index));
    return `<div class="modal-layer ${top ? "top-modal" : ""}" style="--layer:${index}" ${top ? "" : 'inert aria-hidden="true"'}><button class="modal-backdrop" type="button" data-action="close-modal" tabindex="-1" aria-label="Cerrar ventana superior"></button>${content}</div>`;
  }).join("");
  const topCard = MODAL_ROOT.querySelector(".top-modal .modal-card");
  if (topCard) {
    const restored = (focusId && topCard.querySelector(`#${CSS.escape(focusId)}`)) || (focusKey && topCard.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`));
    const target = restored || topCard.querySelector("input:not([type=hidden]), select, textarea, button:not(.modal-backdrop), a[href], [tabindex='0']");
    target?.focus({ preventScroll: true });
    if (STATE.modals.at(-1)?.type === "wizard") {
      syncWizardChainCheckboxes();
    }
  }
}

function openContact(user) {
  openModal({ type: "contact", user });
}

function renderContactModal(modal) {
  const user = modal.user;
  return {
    title: `Contacto · ${escapeHtml(user.name)}`,
    description: "Información de contacto de una persona no voluntaria.",
    body: `<div class="contact-profile"><div class="contact-avatar" aria-hidden="true">${getInitials(user.name)}</div><div><h3>${escapeHtml(user.name)}</h3><div class="row row-wrap">${user.roles?.length ? roleBadges(user.roles) : '<span class="badge badge-neutral">Contacto de entidad</span>'}</div></div></div><div class="contact-methods"><a class="contact-method" href="mailto:${escapeHtml(user.email)}">${icon("mail", 19)}<span><strong>Correo</strong><br>${escapeHtml(user.email)}</span></a><a class="contact-method" href="tel:${escapeHtml(user.phone.replace(/\s/g, ""))}">${icon("phone", 19)}<span><strong>Teléfono</strong><br>${escapeHtml(user.phone)}</span></a></div>`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar ficha</button>'
  };
}

function renderStoreMiniCalendar(store) {
  const start = startOfWeek(STATE.storeCalendarCursor);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  return `<section class="detail-section store-mini-calendar"><div class="row-between row-wrap"><div><h3>${icon("calendar", 17)}Calendario de tienda</h3><p class="small muted">${escapeHtml(formatMonthRange([dates[0], dates[6]]))}</p></div><div class="actions"><button class="btn btn-secondary btn-sm" type="button" data-action="store-calendar-today">Volver a hoy</button><button class="btn btn-icon btn-sm" type="button" data-action="store-calendar-previous" aria-label="Semana anterior">${icon("chevronLeft", 14)}</button><button class="btn btn-icon btn-sm" type="button" data-action="store-calendar-next" aria-label="Semana siguiente">${icon("chevronRight", 14)}</button></div></div><div class="timeline-scroll"><div class="timeline-grid" style="--day-count:7"><div class="timeline-header"><div class="timeline-corner"></div>${dates.map((value) => `<div class="timeline-day-header"><strong>${capitalize(WEEKDAY_FORMATTER.format(toDate(value))).replace(".", "")}</strong><span class="day-number ${value === TODAY ? "today" : ""}">${toDate(value).getUTCDate()}</span></div>`).join("")}</div><div class="timeline-track">${renderTimeAxis()}${dates.map((value) => `<div class="timeline-day-column ${isDateInCampaign(value) ? "" : "outside-campaign"}">${renderTimeGuides()}${DATA.slots.map((slot) => {
    const result = getStoreSlot(store, value, slot);
    const top = ((timeToMinutes(slot.start) - DAY_MINUTES_START) / DAY_TOTAL_MINUTES) * 100;
    const height = ((timeToMinutes(slot.end) - timeToMinutes(slot.start)) / DAY_TOTAL_MINUTES) * 100;
    return `<button class="calendar-event event-${result.status}" type="button" style="top:${top}%;height:${height}%" data-action="open-store-day" data-id="${store.id}" data-date="${value}" aria-label="${escapeHtml(`${store.name}, ${formatDate(value)}, ${slot.label}, ${STATUS_LABELS[result.status]}`)}"><strong>${slot.start} ${result.status === "conflict" ? "⚠" : ""}</strong><span>${slot.label}</span></button>`;
  }).join("")}</div>`).join("")}</div></div></div></section>`;
}

function renderStoreSchedule(store) {
  const exception = DATA.scheduleExceptions.find((item) => item.storeId === store.id && item.campaignId === STATE.campaignId);
  return `<section class="detail-section"><h3>${icon("clock", 17)}Horarios de apertura</h3><table class="schedule-table"><thead><tr><th>Día</th><th>Apertura</th><th>Cierre</th></tr></thead><tbody>${Array.from({ length: 7 }, (_, index) => {
    const day = index + 1;
    const schedule = store.schedule[day];
    const dayName = capitalize(WEEKDAY_LONG_FORMATTER.format(toDate(addDays(startOfWeek("2026-11-09"), index))));
    return `<tr><td>${dayName}</td><td>${schedule.opening}</td><td>${schedule.closing}</td></tr>`;
  }).join("")}</tbody></table>${exception ? `<div class="alert alert-warning" style="margin-top:12px">${icon("warning", 16)}<p><strong>Excepción del ${formatDate(exception.date)}:</strong> ${exception.opening}–${exception.closing}. ${escapeHtml(exception.note)}.</p></div>` : ""}</section>`;
}

function renderStoreDayContent(store, value) {
  return `<div class="shift-list">${DATA.slots.map((slot) => {
    const result = getStoreSlot(store, value, slot);
    return `<div class="shift-item"><div><div class="shift-item-title"><strong>${escapeHtml(slot.label)} · ${slot.start}–${slot.end}</strong>${statusBadge(result.status)}</div>${result.status === "outside" ? '<p>La tienda no participa en esta fecha.</p>' : `<p>Cobertura: <span class="fraction">${result.assigned}/${result.required}</span> turnos asignados${result.missing ? ` · faltan ${result.missing}` : " · cobertura completa"}.</p>${result.conflict ? `<p class="status-conflict" style="padding:6px;border-radius:4px;margin-top:6px">${escapeHtml(result.conflict.detail)}</p>` : ""}`}</div>${result.status !== "outside" && !getCampaign().readonly ? `<button class="btn btn-secondary btn-sm" type="button" data-action="simulate-assignment" data-id="${store.id}" data-date="${value}" data-slot="${slot.id}">${icon("edit", 13)}Proponer cambio</button>` : ""}</div>`;
  }).join("")}</div>`;
}

function renderStoreModal(modal) {
  const store = getStore(modal.storeId);
  const zone = getZone(store.zoneId);
  const collaborator = getCollaborator(store.collaboratorId);
  const locality = getLocality(store.localityId);
  const status = getStoreCampaignStatus(store);
  const conflicts = DATA.conflicts.filter((conflict) => conflict.campaignId === STATE.campaignId && conflict.storeIds.includes(store.id));
  return {
    className: "modal-store",
    title: `${icon("stores", 22)} ${escapeHtml(store.name)}`,
    description: `${escapeHtml(getChain(store.chainId).name)} · ${escapeHtml(locality.name)} · ${getCampaign().name}`,
    body: `<div class="stack">
      <div class="row row-wrap">${statusBadge(status)}<span class="chip">Zona: ${escapeHtml(zone.name)}</span><span class="badge badge-neutral">${store.checkouts} lineas de caja</span>${getCampaign().readonly ? '<span class="badge status-pending">Solo lectura</span>' : ""}</div>
      <div class="store-detail-grid"><div class="store-detail-side">
        <section class="detail-section"><h3>${icon("info", 17)}Datos clave</h3><dl class="data-list"><dt>Dirección</dt><dd>${escapeHtml(store.address)}<br>${escapeHtml(locality.name)} · ${locality.postalCode}</dd><dt>Cadena</dt><dd>${escapeHtml(getChain(store.chainId).name)}</dd><dt>Zona</dt><dd>${escapeHtml(zone.name)}</dd><dt>Coordinación</dt><dd>${userContactButton(zone.coordinatorId)}</dd><dt>Asigna turnos</dt><dd>${userContactButton(store.managerId)}${store.managerId ? '<span class="role-code" translate="no">STORE-MANAGER</span>' : '<span class="badge status-pending">Pendiente de asignar</span>'}</dd><dt>Entidad</dt><dd>${escapeHtml(collaborator.name)}</dd></dl><div class="actions" style="margin-top:14px"><button class="btn btn-soft btn-sm" type="button" data-action="simulate-assignment" data-id="${store.id}" data-date="${STATE.storeCalendarCursor}" data-slot="morning" ${mutationDisabled()}>${icon("plus", 14)}Proponer asignación</button></div></section>
        ${renderStoreSchedule(store)}
      </div><div class="store-detail-side">
        <section class="detail-section"><h3>${icon("collaborators", 17)}Entidad colaboradora</h3><dl class="data-list"><dt>Responsable</dt><dd>${userContactButton(collaborator.managerId)}</dd><dt>Contactos</dt><dd>${collaborator.contacts.map((contact) => collaboratorContactButton(collaborator.id, contact.id)).join("<br>")}</dd><dt>Grupos</dt><dd>${collaborator.groups.length} grupos · ${collaborator.volunteerCount} voluntarios anónimos</dd></dl></section>
        <section class="detail-section"><div class="row-between"><h3>${icon("calendar", 17)}Turnos del ${formatDate(STATE.storeCalendarCursor, SHORT_DATE_FORMATTER)}</h3></div>${renderStoreDayContent(store, STATE.storeCalendarCursor)}</section>
      </div></div>
      ${conflicts.length ? `<section class="detail-section"><h3>${icon("warning", 17)}Conflictos registrados en esta campaña</h3><div class="detail-grid">${conflicts.map((conflict) => `<div class="conflict-card"><h4>${icon("warning", 15)}${formatDate(conflict.date, SHORT_DATE_FORMATTER)} · ${getSlot(conflict.slotId).label}</h4><p>${escapeHtml(conflict.reason)}</p><ul><li>Entidad: ${escapeHtml(collaborator.name)}</li><li>Asignó ${userContactButton(conflict.assignedById)}</li><li>Alias anónimo: ${escapeHtml(conflict.volunteerAlias)}</li></ul></div>`).join("")}</div></section>` : ""}
      ${renderStoreMiniCalendar(store)}
    </div>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar tienda</button>`
  };
}

function renderStoreDayModal(modal) {
  const store = getStore(modal.storeId);
  return {
    title: `${escapeHtml(store.name)} · Turnos`,
    description: capitalize(formatDate(modal.date, LONG_DATE_FORMATTER)),
    body: renderStoreDayContent(store, modal.date),
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Volver a la tienda</button>'
  };
}

function renderSlotModal(modal) {
  const slot = getSlot(modal.slotId);
  const aggregate = getAggregateSlot(modal.date, slot);
  const order = STATE.slotSort === "status" ? { complete: 0, pending: 1, conflict: 2, outside: 3 } : null;
  const results = [...aggregate.stores].filter((result) => result.status !== "outside").sort((first, second) => order ? order[first.status] - order[second.status] || first.store.name.localeCompare(second.store.name, "es") : visibleStores().findIndex((store) => store.id === first.store.id) - visibleStores().findIndex((store) => store.id === second.store.id));
  return {
    className: "modal-wide",
    title: `${escapeHtml(slot.label)} · ${slot.start}–${slot.end}`,
    description: capitalize(formatDate(modal.date, LONG_DATE_FORMATTER)),
    body: `<div class="row row-wrap" style="margin-bottom:14px">${statusBadge(aggregate.status)}<span class="badge badge-neutral">${results.length} tiendas</span>${aggregate.missing ? `<span class="badge status-pending">${aggregate.missing} turnos por cubrir</span>` : ""}</div>
      <div class="row-between row-wrap"><p class="small muted">La fracción indica turnos asignados respecto a los necesarios.</p><button class="btn btn-secondary btn-sm" type="button" data-action="toggle-slot-sort">${icon("filter", 14)}Orden: ${STATE.slotSort === "status" ? "completas, pendientes, conflictos" : "orden de Tiendas"}</button></div>
      <div>${results.length ? results.map((result) => `<div class="store-coverage-row"><button class="link-button strong" type="button" data-action="open-store" data-id="${result.store.id}">${escapeHtml(result.store.name)}${icon("arrowRight", 13)}</button><span class="small muted">${escapeHtml(getZone(result.store.zoneId).name)}</span><span class="fraction">${result.assigned}/${result.required} turnos</span>${statusBadge(result.status)}</div>`).join("") : '<div class="empty-state"><p>No hay tiendas participantes en esta franja.</p></div>'}</div>
      ${aggregate.conflictCount ? `<div class="alert alert-danger" style="margin-top:16px">${icon("warning", 17)}<p>Pulsa una tienda en conflicto para consultar la causa, quién asignó y el alias anónimo afectado.</p></div>` : ""}`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar franja</button>'
  };
}

function renderDayModal(modal) {
  return {
    className: "modal-wide",
    title: "Resumen del día",
    description: capitalize(formatDate(modal.date, LONG_DATE_FORMATTER)),
    body: `<div class="detail-grid">${DATA.slots.map((slot) => {
      const aggregate = getAggregateSlot(modal.date, slot);
      return `<section class="detail-section"><div class="row-between"><h3>${escapeHtml(slot.label)}</h3>${statusBadge(aggregate.status)}</div><p class="muted">${slot.start}–${slot.end}</p>${aggregate.status === "outside" ? '<p class="small">Día fuera de campaña.</p>' : `<dl class="data-list"><dt>Completas</dt><dd>${aggregate.completeCount} tiendas</dd><dt>Pendientes</dt><dd>${aggregate.pendingCount} tiendas · ${aggregate.missing} turnos por cubrir</dd><dt>Conflictos</dt><dd>${aggregate.conflictCount} tiendas</dd></dl><button class="btn btn-soft" style="margin-top:14px" type="button" data-action="open-slot" data-date="${modal.date}" data-slot="${slot.id}">Consultar franja${icon("arrowRight", 14)}</button>`}</section>`;
    }).join("")}</div>${isDateInCampaign(modal.date) ? `<div style="margin-top:16px">${renderDayInsights(modal.date)}</div>` : ""}`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar resumen</button>'
  };
}

function renderReportModal(modal) {
  const report = getReport(modal.reportId);
  const store = getStore(report.storeId);
  const reporter = getUser(report.reportedById);
  const solver = report.solvedById ? getUser(report.solvedById) : null;
  const readonly = getCampaign().readonly;
  return {
    className: "modal-wide",
    title: escapeHtml(report.type),
    description: `${escapeHtml(store.name)} · ${formatDate(report.creationDate, LONG_DATE_FORMATTER)}`,
    body: `<div class="stack"><div class="row row-wrap">${statusBadge(report.solution ? "complete" : "pending", report.solution ? "Respondida" : "Pendiente")}<span class="chip">${escapeHtml(getZone(store.zoneId).name)}</span></div>
      <section class="detail-section"><h3>Descripción</h3><p>${escapeHtml(report.description)}</p></section>
      <section class="detail-section"><h3>Contactos pertinentes</h3><dl class="data-list"><dt>Persona que informa</dt><dd>${userContactButton(reporter.id)}</dd><dt>Asigna turnos</dt><dd>${userContactButton(store.managerId)}</dd><dt>Coordinación</dt><dd>${userContactButton(getZone(store.zoneId).coordinatorId)}</dd></dl></section>
      ${report.solution ? `<section class="detail-section status-complete"><h3>${icon("check", 17)}Respuesta registrada</h3><p>${escapeHtml(report.solution)}</p><p class="small muted" style="margin-top:12px">Respondida por ${userContactButton(solver.id)}. Esta incidencia no admite otra respuesta.</p></section>` : readonly ? `<div class="alert alert-warning">${icon("lock", 17)}<p>La campaña está en solo lectura. No puedes responder esta incidencia.</p></div>` : `<form class="stack" id="report-response-form" data-form="report-response" data-id="${report.id}"><div class="field"><label for="report-solution">Respuesta a la incidencia</label><textarea id="report-solution" name="solution" rows="4" required minlength="8" placeholder="Describe la solución propuesta…"></textarea><p class="field-hint">Simulación: al confirmar se cerrará la ventana sin guardar la respuesta.</p></div><div class="actions"><button class="btn" type="submit">${icon("check", 15)}Confirmar respuesta simulada</button></div></form>`}
    </div>`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar incidencia</button>'
  };
}

function tutorialSteps() {
  const key = STATE.context === "admin" ? `admin-${STATE.adminSection}` : STATE.view;
  const common = {
    home: [["Resumen general", "El calendario ocupa el bloque principal. Cambia entre día, semana y mes para consultar cobertura y estados.", "calendar"], ["Accesos directos", "Los cinco bloques inferiores enlazan con zonas, tiendas, entidades, incidencias y filtros del estado.", "cards"], ["Ámbito y campaña", "Cambia de campaña en el selector. Tu rol determina qué zonas y tiendas puedes ver.", "campaign"]],
    zones: [["Consulta tus zonas", "Alterna tarjetas y tabla. Cada zona muestra coordinación, tiendas y estado agregado.", "zones"], ["Filtra tiendas", "Pulsa Ver tiendas para abrir la tabla con un chip de zona que puedes quitar.", "filter"]],
    stores: [["Busca y filtra", "Busca por tienda, cadena, localidad, zona o persona. Los chips permiten retirar filtros.", "search"], ["Abre una tienda", "La ficha casi a pantalla completa reúne contactos, horarios, turnos, conflictos y calendario.", "stores"], ["Interpreta Turnos", "La columna usa solamente Completo, Pendiente o Conflicto. Un conflicto siempre prevalece.", "warning"]],
    collaborators: [["Entidades y contactos", "Consulta responsable, contactos y grupos de cada entidad colaboradora.", "collaborators"], ["Privacidad", "Los grupos muestran líder y número de voluntarios. El voluntariado permanece anónimo.", "lock"], ["Acciones simuladas", "Añadir o modificar contactos y asignar responsables solo muestra avisos; no cambia datos.", "edit"]],
    reports: [["Filtra por estado", "El inicio solo muestra pendientes. Aquí puedes consultar todas o las respondidas.", "reports"], ["Una única respuesta", "Las incidencias pendientes tienen un formulario simulado. Las respondidas solo muestran su respuesta.", "check"]],
    calendar: [["Navega por el tiempo", "Usa Día, Semana o Mes y Volver a hoy. El día actual aparece con un círculo azul.", "calendar"], ["Consulta cada franja", "Abre una franja para ver la fracción de cada tienda. Desde ahí puedes apilar la ficha de tienda.", "clock"], ["Detecta problemas", "La vista día detalla turnos que faltan, causas de conflictos, tiendas y alias anónimos.", "warning"]]
  };
  return common[key] || [["Administración separada", "Gestiona las entidades globales desde esta navegación. Las acciones nunca persisten cambios.", "settings"], ["Volver a campaña", "Usa el enlace superior para regresar al contexto de campaña sin cambiar tu selección.", "arrowLeft"], ["Datos de muestra", "Busca, crea, edita o borra visualmente. Siempre se solicita confirmación para borrar.", "eye"]];
}

function renderTutorialModal() {
  const steps = tutorialSteps();
  const step = steps[Math.min(STATE.tutorialStep, steps.length - 1)];
  return {
    title: `Tutorial · Paso ${STATE.tutorialStep + 1} de ${steps.length}`,
    description: "Guía bajo demanda de la vista actual.",
    body: `<div class="tutorial-illustration">${icon(step[2], 28)}</div><h3>${escapeHtml(step[0])}</h3><p class="muted">${escapeHtml(step[1])}</p><div class="tutorial-dots" aria-hidden="true">${steps.map((_, index) => `<span class="tutorial-dot ${index === STATE.tutorialStep ? "active" : ""}"></span>`).join("")}</div>`,
    footerBetween: true,
    footer: `<button class="btn btn-secondary" type="button" data-action="tutorial-previous" ${STATE.tutorialStep === 0 ? "disabled" : ""}>${icon("arrowLeft", 15)}Anterior</button><div class="actions"><button class="btn btn-ghost" type="button" data-action="close-modal">Cerrar tutorial</button>${STATE.tutorialStep < steps.length - 1 ? `<button class="btn" type="button" data-action="tutorial-next">Siguiente${icon("arrowRight", 15)}</button>` : '<button class="btn" type="button" data-action="close-modal">Finalizar</button>'}</div>`
  };
}

function openConfirmation(options) {
  openModal({ type: "confirm", ...options });
}

function renderConfirmModal(modal) {
  return {
    title: escapeHtml(modal.title || "Confirmar acción simulada"),
    description: modal.description ? escapeHtml(modal.description) : "No se modificará ningún dato.",
    body: `<div class="alert ${modal.danger ? "alert-danger" : "alert-info"}">${icon(modal.danger ? "warning" : "info", 18)}<p>${escapeHtml(modal.message || "Esta acción es una simulación visual.")}</p></div>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Cancelar</button><button class="btn ${modal.danger ? "btn-danger" : ""}" type="button" data-action="confirm-simulation">${escapeHtml(modal.confirmLabel || "Confirmar simulación")}</button>`
  };
}

function renderGroupsModal(modal) {
  const collaborator = getCollaborator(modal.collaboratorId);
  return {
    title: `Grupos · ${escapeHtml(collaborator.name)}`,
    description: "Solo se muestran líderes y conteos anónimos.",
    body: `<ul class="group-list">${collaborator.groups.map((group) => `<li><div class="group-item-copy"><strong>${escapeHtml(group.name)}</strong><span>${group.volunteerCount} voluntarios anónimos</span></div><div><span class="xsmall muted">Líder del grupo</span>${userContactButton(group.leaderId)}</div></li>`).join("")}</ul><div class="alert alert-info" style="margin-top:16px">${icon("lock", 16)}<p>Los nombres y contactos del voluntariado no están disponibles en ninguna vista.</p></div>`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar grupos</button>'
  };
}

function renderAssignManagerModal(modal) {
  const collaborator = getCollaborator(modal.collaboratorId);
  const candidates = DATA.users.filter((user) => user.roles.includes("COLLABORATOR-MANAGER"));
  return {
    title: "Asignar responsable de entidad",
    description: collaborator.name,
    body: `<form class="stack" id="assign-manager-form" data-form="simple-simulation"><div class="alert alert-info">${icon("info", 16)}<p>Solamente se listan personas con el rol exacto <span translate="no">COLLABORATOR-MANAGER</span>.</p></div><div class="field"><label for="collaborator-manager-select">Responsable</label><select id="collaborator-manager-select" name="managerId" required>${candidates.map((user) => `<option value="${user.id}" ${user.id === collaborator.managerId ? "selected" : ""}>${escapeHtml(user.name)} · COLLABORATOR-MANAGER</option>`).join("")}</select></div><div class="actions"><button class="btn" type="submit">Confirmar asignación simulada</button></div></form>`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cancelar</button>'
  };
}

const ADMIN_SECTION_META = {
  stores: { title: "Tiendas", singular: "tienda", description: "Establecimientos, cadenas, localidades y asignaciones de turnos." },
  chains: { title: "Cadenas", singular: "cadena", description: "Cadenas comerciales y acceso a sus tiendas." },
  collaborators: { title: "Colaboradores", singular: "entidad colaboradora", description: "Entidades, responsables, contactos y grupos." },
  zones: { title: "Zonas", singular: "zona", description: "Territorios y asignación temporal de tiendas." },
  audit: { title: "Auditoría", singular: "evento", description: "Vista de solo lectura con eventos ficticios." },
  users: { title: "Usuarios", singular: "usuario", description: "Cuentas no voluntarias y roles del catálogo." },
  campaigns: { title: "Campañas", singular: "campaña", description: "Campañas existentes y asistente de creación simulada." }
};

function adminSectionCount(section) {
  const counts = {
    stores: DATA.stores.length,
    chains: DATA.chains.length,
    collaborators: DATA.collaborators.length,
    zones: DATA.zones.length,
    audit: DATA.auditEvents.length,
    users: DATA.users.length,
    campaigns: DATA.campaigns.length
  };
  return counts[section] || 0;
}

function renderAdminHome() {
  const cards = Object.entries(ADMIN_SECTION_META);
  return `${renderPageHeader("Administración", "Resumen de las siete entidades de gestión global.", '<a class="btn btn-soft" href="#/home" data-action="back-campaign">' + icon("arrowLeft", 15) + 'Volver a campaña</a>')}<div class="alert alert-info" style="margin-bottom:16px">${icon("info", 17)}<p>Estás fuera del contexto de campaña. Las acciones globales permanecen disponibles aunque la última campaña consultada sea de solo lectura.</p></div><div class="admin-home-grid">${cards.map(([section, meta]) => `<button class="admin-home-card" type="button" data-action="admin-section" data-section="${section}"><span class="admin-home-icon">${icon(section === "chains" ? "link" : section === "audit" ? "audit" : section === "users" ? "user" : section === "campaigns" ? "campaign" : section, 20)}</span><strong>${meta.title}</strong><span>${adminSectionCount(section)} registros de muestra</span><span class="link-button">Abrir gestión${icon("arrowRight", 13)}</span></button>`).join("")}<div class="admin-home-card"><span class="admin-home-icon">${icon("lock", 20)}</span><strong>Privacidad</strong><span>El voluntariado se representa únicamente mediante alias anónimos y agregados.</span></div></div>`;
}

function adminActionButtons(section, id) {
  if (section === "audit") {
    return `<button class="btn btn-icon btn-sm" type="button" data-action="view-entity" data-section="${section}" data-id="${id}" aria-label="Ver evento de auditoría">${icon("eye", 15)}</button>`;
  }
  return `<div class="table-actions"><button class="btn btn-icon btn-sm" type="button" data-action="view-entity" data-section="${section}" data-id="${id}" aria-label="Ver ${ADMIN_SECTION_META[section].singular}">${icon("eye", 15)}</button><button class="btn btn-icon btn-sm" type="button" data-action="edit-entity" data-section="${section}" data-id="${id}" data-mode="edit" aria-label="Editar ${ADMIN_SECTION_META[section].singular}">${icon("edit", 15)}</button><button class="btn btn-icon btn-sm" type="button" data-action="delete-entity" data-section="${section}" data-id="${id}" aria-label="Borrar ${ADMIN_SECTION_META[section].singular}">${icon("trash", 15)}</button></div>`;
}

function adminMatches(values) {
  const query = STATE.adminQuery.trim().toLocaleLowerCase("es-ES");
  return !query || values.filter(Boolean).join(" ").toLocaleLowerCase("es-ES").includes(query);
}

function renderAdminTable() {
  const section = STATE.adminSection;
  if (section === "stores") {
    const rows = DATA.stores.filter((store) => adminMatches([store.name, getChain(store.chainId).name, getLocality(store.localityId).name, getZone(store.zoneId).name, getUser(store.managerId)?.name]));
    return { count: rows.length, html: `<table class="dense-table"><thead><tr><th>Tienda</th><th>Cadena</th><th>Localidad</th><th>Zona</th><th>Asigna turnos</th><th>Entidad</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${rows.map((store) => `<tr><td class="strong">${escapeHtml(store.name)}</td><td>${escapeHtml(getChain(store.chainId).name)}</td><td>${escapeHtml(getLocality(store.localityId).name)}</td><td>${escapeHtml(getZone(store.zoneId).name)}</td><td>${userContactButton(store.managerId)}</td><td>${escapeHtml(getCollaborator(store.collaboratorId).name)}</td><td>${adminActionButtons(section, store.id)}</td></tr>`).join("")}</tbody></table>` };
  }
  if (section === "chains") {
    const rows = DATA.chains.filter((chain) => adminMatches([chain.name, chain.code]));
    return { count: rows.length, html: `<table><thead><tr><th>Cadena</th><th>Código</th><th>Tiendas</th><th>Gestión de tiendas</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${rows.map((chain) => `<tr><td class="strong">${escapeHtml(chain.name)}</td><td><span class="role-code">${escapeHtml(chain.code)}</span></td><td>${DATA.stores.filter((store) => store.chainId === chain.id).length}</td><td><button class="btn btn-soft btn-sm" type="button" data-action="chain-stores" data-id="${chain.id}">${icon("stores", 14)}Abrir tiendas</button></td><td>${adminActionButtons(section, chain.id)}</td></tr>`).join("")}</tbody></table>` };
  }
  if (section === "collaborators") {
    const rows = DATA.collaborators.filter((collaborator) => adminMatches([collaborator.name, getUser(collaborator.managerId).name, getLocality(collaborator.localityId).name]));
    return { count: rows.length, html: `<table><thead><tr><th>Entidad</th><th>Responsable</th><th>Contactos</th><th>Grupos</th><th>Voluntariado</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${rows.map((collaborator) => `<tr><td class="strong">${escapeHtml(collaborator.name)}<span class="small muted" style="display:block">${escapeHtml(getLocality(collaborator.localityId).name)}</span></td><td>${userContactButton(collaborator.managerId)}</td><td>${collaborator.contacts.map((contact) => collaboratorContactButton(collaborator.id, contact.id)).join("<br>")}</td><td>${collaborator.groups.length} grupos</td><td><span class="badge badge-neutral">${collaborator.volunteerCount} anónimos</span></td><td>${adminActionButtons(section, collaborator.id)}</td></tr>`).join("")}</tbody></table>` };
  }
  if (section === "zones") {
    const rows = DATA.zones.filter((zone) => adminMatches([zone.name, zone.code, getUser(zone.coordinatorId).name]));
    return { count: rows.length, html: `<table><thead><tr><th>Zona</th><th>Código</th><th>Coordinación</th><th>Tiendas</th><th>Asignación</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${rows.map((zone) => `<tr><td class="strong">${escapeHtml(zone.name)}</td><td><span class="role-code">${escapeHtml(zone.code)}</span></td><td>${userContactButton(zone.coordinatorId)}</td><td>${DATA.stores.filter((store) => store.zoneId === zone.id).length}</td><td><button class="btn btn-soft btn-sm" type="button" data-action="zone-assignment" data-id="${zone.id}">${icon("edit", 14)}Marcar tiendas</button></td><td>${adminActionButtons(section, zone.id)}</td></tr>`).join("")}</tbody></table>` };
  }
  if (section === "audit") {
    const rows = DATA.auditEvents.filter((event) => adminMatches([event.action, event.entity, getUser(event.actorId).name, event.timestamp]));
    return { count: rows.length, html: `<table><thead><tr><th>Fecha y hora</th><th>Actor</th><th>Evento</th><th>Entidad</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${rows.map((event) => `<tr><td class="number">${DATE_TIME_FORMATTER.format(new Date(event.timestamp))}</td><td>${userContactButton(event.actorId)}</td><td>${escapeHtml(event.action)}</td><td>${escapeHtml(event.entity)}</td><td>${adminActionButtons(section, event.id)}</td></tr>`).join("")}</tbody></table>` };
  }
  if (section === "users") {
    const rows = DATA.users.filter((user) => adminMatches([user.name, user.email, user.phone, user.roles.join(" ")]));
    return { count: rows.length, html: `<table class="dense-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Roles</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${rows.map((user) => `<tr><td>${userContactButton(user.id)}</td><td><a href="mailto:${escapeHtml(user.email)}">${escapeHtml(user.email)}</a></td><td class="number">${escapeHtml(user.phone)}</td><td>${roleBadges(user.roles)}</td><td>${adminActionButtons(section, user.id)}</td></tr>`).join("")}</tbody></table>` };
  }
  const rows = DATA.campaigns.filter((campaign) => adminMatches([campaign.name, DATA.campaignTypes.find((type) => type.id === campaign.typeId).name, campaign.startDate, campaign.endDate]));
  return { count: rows.length, html: `<table><thead><tr><th>Campaña</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${rows.map((campaign) => `<tr><td class="strong">${escapeHtml(campaign.name)}</td><td>${escapeHtml(DATA.campaignTypes.find((type) => type.id === campaign.typeId).name)}</td><td>${formatDate(campaign.startDate, SHORT_DATE_FORMATTER)}</td><td>${formatDate(campaign.endDate, SHORT_DATE_FORMATTER)}</td><td>${statusBadge(campaign.readonly ? "outside" : "complete", campaign.readonly ? "Pasada" : "En curso")}</td><td>${adminActionButtons("campaigns", campaign.id)}</td></tr>`).join("")}</tbody></table>` };
}

function adminCreateButtons(section) {
  if (section === "audit") {
    return '<span class="badge badge-neutral">Solo lectura</span>';
  }
  if (section === "campaigns") {
    return `<button class="btn btn-secondary" type="button" data-action="create-campaign-type">${icon("plus", 15)}Crear tipo de campaña</button><button class="btn" type="button" data-action="open-wizard">${icon("campaign", 16)}Crear campaña</button>`;
  }
  return `<button class="btn" type="button" data-action="edit-entity" data-section="${section}" data-mode="create">${icon("plus", 15)}Crear ${ADMIN_SECTION_META[section].singular}</button>`;
}

function renderAdminSection() {
  const section = STATE.adminSection;
  const meta = ADMIN_SECTION_META[section];
  const table = renderAdminTable();
  return `${renderPageHeader(meta.title, meta.description, adminCreateButtons(section))}
    ${section === "audit" ? `<div class="alert alert-warning audit-notice">${icon("info", 18)}<p><strong>Datos de muestra y solo lectura.</strong> El modelo actual no contiene una tabla de auditoría. Estos eventos sirven únicamente para visualizar el diseño previsto.</p></div>` : ""}
    ${section === "users" ? '<div class="alert alert-info audit-notice">' + icon("info", 17) + '<p>Los roles usan los valores exactos del catálogo. Las campañas y zonas se gestionan desde sus propias vistas, no desde Usuarios.</p></div>' : ""}
    <div class="entity-toolbar" style="margin-bottom:14px"><form class="entity-search" data-form="admin-search"><div class="field"><label for="admin-search">Buscar en ${escapeHtml(meta.title.toLocaleLowerCase("es-ES"))}</label><div class="row"><div class="search-control grow">${icon("search", 16)}<input id="admin-search" name="query" type="search" autocomplete="off" value="${escapeHtml(STATE.adminQuery)}" placeholder="Escribe para buscar…"></div><button class="btn btn-secondary" type="submit">Buscar</button>${STATE.adminQuery ? '<button class="btn btn-ghost" type="button" data-action="clear-admin-search">Limpiar</button>' : ""}</div></div></form></div>
    <div class="table-panel"><div class="table-scroll">${table.count ? table.html : `<div class="empty-state"><p>No hay resultados para “${escapeHtml(STATE.adminQuery)}”. Prueba otra búsqueda.</p></div>`}</div><div class="table-footer"><span>${table.count} registros</span><span>Datos ficticios · cambios no persistentes</span></div></div>`;
}

function renderAdmin() {
  return STATE.adminSection === "overview" ? renderAdminHome() : renderAdminSection();
}

function getAdminEntity(section, entityId) {
  const sources = {
    stores: DATA.stores,
    chains: DATA.chains,
    collaborators: DATA.collaborators,
    zones: DATA.zones,
    users: DATA.users,
    campaigns: DATA.campaigns,
    audit: DATA.auditEvents
  };
  return sources[section]?.find((entity) => entity.id === Number(entityId));
}

function renderEntityFields(modal) {
  const entity = modal.mode === "create" ? {} : getAdminEntity(modal.section, modal.entityId) || {};
  if (modal.section === "stores") {
    return `<div class="form-grid form-grid-3"><div class="field field-full"><label for="entity-name">Nombre de tienda</label><input id="entity-name" name="name" autocomplete="off" required value="${escapeHtml(entity.name || "")}" placeholder="Nombre del establecimiento…"></div><div class="field field-full"><label for="entity-address">Dirección</label><input id="entity-address" name="address" autocomplete="off" required value="${escapeHtml(entity.address || "")}" placeholder="Calle y número…"></div><div class="field"><label for="entity-chain">Cadena</label><select id="entity-chain" name="chainId" required>${DATA.chains.map((chain) => `<option value="${chain.id}" ${Number(entity.chainId || modal.chainId) === chain.id ? "selected" : ""}>${escapeHtml(chain.name)}</option>`).join("")}</select></div><div class="field"><label for="entity-locality">Localidad</label><select id="entity-locality" name="localityId">${DATA.localities.map((locality) => `<option value="${locality.id}" ${entity.localityId === locality.id ? "selected" : ""}>${escapeHtml(locality.name)}</option>`).join("")}</select></div><div class="field"><label for="entity-zone">Zona</label><select id="entity-zone" name="zoneId">${DATA.zones.map((zone) => `<option value="${zone.id}" ${entity.zoneId === zone.id ? "selected" : ""}>${escapeHtml(zone.name)}</option>`).join("")}</select></div><div class="field"><label for="entity-collaborator">Entidad colaboradora</label><select id="entity-collaborator" name="collaboratorId">${DATA.collaborators.map((collaborator) => `<option value="${collaborator.id}" ${entity.collaboratorId === collaborator.id ? "selected" : ""}>${escapeHtml(collaborator.name)}</option>`).join("")}</select></div><div class="field"><label for="entity-manager">Persona que asigna turnos</label><select id="entity-manager" name="managerId"><option value="">Sin asignar</option>${DATA.users.filter((user) => user.roles.includes("STORE-MANAGER")).map((user) => `<option value="${user.id}" ${entity.managerId === user.id ? "selected" : ""}>${escapeHtml(user.name)} · STORE-MANAGER</option>`).join("")}</select></div><div class="field"><label for="entity-checkouts">Líneas de caja</label><input id="entity-checkouts" name="checkouts" type="number" min="0" step="1" inputmode="numeric" required value="${entity.checkouts ?? 2}"></div></div>`;
  }
  if (modal.section === "chains") {
    return `<div class="form-grid"><div class="field"><label for="entity-name">Nombre</label><input id="entity-name" name="name" autocomplete="off" required value="${escapeHtml(entity.name || "")}" placeholder="Nombre de la cadena…"></div><div class="field"><label for="entity-code">Código</label><input id="entity-code" name="code" autocomplete="off" required maxlength="8" value="${escapeHtml(entity.code || "")}" placeholder="Por ejemplo, ALI…"></div></div>`;
  }
  if (modal.section === "collaborators") {
    if (modal.mode === "contact") {
      const contact = getCollaborator(modal.entityId)?.contacts.find((item) => item.id === Number(modal.contactId)) || {};
      return `<div class="form-grid"><div class="field field-full"><label for="entity-name">Nombre del contacto</label><input id="entity-name" name="name" autocomplete="name" required value="${escapeHtml(contact.name || "")}" placeholder="Nombre y apellidos…"></div><div class="field"><label for="entity-email">Correo</label><input id="entity-email" name="email" type="email" autocomplete="email" spellcheck="false" value="${escapeHtml(contact.email || "")}" placeholder="contacto@entidad.example…"></div><div class="field"><label for="entity-phone">Teléfono</label><input id="entity-phone" name="phone" type="tel" autocomplete="tel" value="${escapeHtml(contact.phone || "")}" placeholder="+34 600 000 000…"></div></div>`;
    }
    return `<div class="form-grid"><div class="field field-full"><label for="entity-name">Nombre de la entidad</label><input id="entity-name" name="name" autocomplete="organization" required value="${escapeHtml(entity.name || "")}" placeholder="Nombre de la entidad…"></div><div class="field field-full"><label for="entity-address">Dirección</label><input id="entity-address" name="address" autocomplete="street-address" required value="${escapeHtml(entity.address || "")}" placeholder="Dirección postal…"></div><div class="field"><label for="entity-locality">Localidad</label><select id="entity-locality" name="localityId">${DATA.localities.map((locality) => `<option value="${locality.id}" ${entity.localityId === locality.id ? "selected" : ""}>${escapeHtml(locality.name)}</option>`).join("")}</select></div><div class="field"><label for="entity-manager">Responsable · COLLABORATOR-MANAGER</label><select id="entity-manager" name="managerId">${DATA.users.filter((user) => user.roles.includes("COLLABORATOR-MANAGER")).map((user) => `<option value="${user.id}" ${entity.managerId === user.id ? "selected" : ""}>${escapeHtml(user.name)}</option>`).join("")}</select></div></div>`;
  }
  if (modal.section === "zones") {
    return `<div class="form-grid"><div class="field"><label for="entity-name">Nombre</label><input id="entity-name" name="name" autocomplete="off" required value="${escapeHtml(entity.name || "")}" placeholder="Nombre de la zona…"></div><div class="field"><label for="entity-code">Código</label><input id="entity-code" name="code" autocomplete="off" required value="${escapeHtml(entity.code || "")}" placeholder="Por ejemplo, ZN-N…"></div><div class="field field-full"><label for="entity-coordinator">Coordinación · COORDINATOR</label><select id="entity-coordinator" name="coordinatorId">${DATA.users.filter((user) => user.roles.includes("COORDINATOR")).map((user) => `<option value="${user.id}" ${entity.coordinatorId === user.id ? "selected" : ""}>${escapeHtml(user.name)}</option>`).join("")}</select></div></div>`;
  }
  if (modal.section === "users") {
    return `<div class="form-grid"><div class="field field-full"><label for="entity-name">Nombre y apellidos</label><input id="entity-name" name="name" autocomplete="name" required value="${escapeHtml(entity.name || "")}" placeholder="Nombre de la persona…"></div><div class="field"><label for="entity-email">Correo</label><input id="entity-email" name="email" type="email" autocomplete="email" spellcheck="false" required value="${escapeHtml(entity.email || "")}" placeholder="persona@entidad.example…"></div><div class="field"><label for="entity-phone">Teléfono</label><input id="entity-phone" name="phone" type="tel" autocomplete="tel" value="${escapeHtml(entity.phone || "")}" placeholder="+34 600 000 000…"></div><fieldset class="field field-full"><legend>Roles del catálogo</legend><p class="field-hint">Edita los roles sin asignar campañas ni zonas desde esta ficha.</p><div class="row row-wrap">${DATA.ROLE_CATALOG.map((role) => `<label class="checkbox-label"><input type="checkbox" name="roles" value="${role}" ${entity.roles?.includes(role) ? "checked" : ""}><span translate="no">${role}</span></label>`).join("")}</div></fieldset></div>`;
  }
  if (modal.section === "campaigns") {
    return `<div class="form-grid"><div class="field field-full"><label for="entity-name">Nombre</label><input id="entity-name" name="name" autocomplete="off" required value="${escapeHtml(entity.name || "")}" placeholder="Nombre de campaña…"></div><div class="field field-full"><label for="entity-type">Tipo</label><select id="entity-type" name="typeId">${DATA.campaignTypes.map((type) => `<option value="${type.id}" ${entity.typeId === type.id ? "selected" : ""}>${escapeHtml(type.name)}</option>`).join("")}</select></div><div class="field"><label for="entity-start">Fecha de inicio</label><input id="entity-start" name="startDate" type="date" required value="${entity.startDate || "2026-12-01"}"></div><div class="field"><label for="entity-end">Fecha de fin</label><input id="entity-end" name="endDate" type="date" required value="${entity.endDate || "2026-12-07"}"></div></div>`;
  }
  return `<div class="field"><label for="entity-name">Nombre del tipo</label><input id="entity-name" name="name" autocomplete="off" required placeholder="Nuevo tipo de campaña…"></div>`;
}

function renderEntityFormModal(modal) {
  const meta = ADMIN_SECTION_META[modal.section] || { singular: "tipo de campaña" };
  const actionLabel = modal.mode === "create" ? `Crear ${meta.singular}` : modal.mode === "contact" ? "Guardar contacto simulado" : `Guardar cambios`;
  return {
    className: "modal-wide",
    title: `${modal.mode === "create" ? "Crear" : modal.mode === "contact" ? "Contacto de" : "Editar"} ${escapeHtml(meta.singular)}`,
    description: "Formulario visual; los cambios no se guardarán.",
    body: `<form class="stack" id="entity-form" data-form="entity" data-section="${modal.section}"><div class="alert alert-info">${icon("info", 16)}<p>Esta operación no altera los datos del mockup.</p></div>${renderEntityFields(modal)}<div class="actions"><button class="btn" type="submit">${escapeHtml(actionLabel)} · Simulación</button></div></form>`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cancelar</button>'
  };
}

function entityDataRows(section, entity) {
  if (section === "stores") {
    return [["Nombre", escapeHtml(entity.name)], ["Dirección", `${escapeHtml(entity.address)}, ${escapeHtml(getLocality(entity.localityId).name)}`], ["Cadena", escapeHtml(getChain(entity.chainId).name)], ["Zona", escapeHtml(getZone(entity.zoneId).name)], ["Asigna turnos", userContactButton(entity.managerId)], ["Entidad", escapeHtml(getCollaborator(entity.collaboratorId).name)], ["Líneas de caja", entity.checkouts]];
  }
  if (section === "chains") {
    return [["Nombre", escapeHtml(entity.name)], ["Código", `<span class="role-code">${escapeHtml(entity.code)}</span>`], ["Tiendas", DATA.stores.filter((store) => store.chainId === entity.id).length]];
  }
  if (section === "collaborators") {
    return [["Entidad", escapeHtml(entity.name)], ["Dirección", `${escapeHtml(entity.address)}, ${escapeHtml(getLocality(entity.localityId).name)}`], ["Responsable", `${userContactButton(entity.managerId)} <span class="role-code">COLLABORATOR-MANAGER</span>`], ["Contactos", entity.contacts.map((contact) => collaboratorContactButton(entity.id, contact.id)).join("<br>")], ["Grupos", entity.groups.map((group) => `${escapeHtml(group.name)} · ${group.volunteerCount} anónimos`).join("<br>")]];
  }
  if (section === "zones") {
    return [["Nombre", escapeHtml(entity.name)], ["Código", escapeHtml(entity.code)], ["Coordinación", userContactButton(entity.coordinatorId)], ["Tiendas", DATA.stores.filter((store) => store.zoneId === entity.id).length]];
  }
  if (section === "users") {
    return [["Nombre", escapeHtml(entity.name)], ["Correo", escapeHtml(entity.email)], ["Teléfono", escapeHtml(entity.phone)], ["Roles", roleBadges(entity.roles)]];
  }
  if (section === "campaigns") {
    return [["Nombre", escapeHtml(entity.name)], ["Tipo", escapeHtml(DATA.campaignTypes.find((type) => type.id === entity.typeId).name)], ["Inicio", formatDate(entity.startDate)], ["Fin", formatDate(entity.endDate)], ["Estado", entity.readonly ? "Pasada · solo lectura" : "En curso"]];
  }
  return [["Fecha y hora", DATE_TIME_FORMATTER.format(new Date(entity.timestamp))], ["Actor", userContactButton(entity.actorId)], ["Evento", escapeHtml(entity.action)], ["Entidad", escapeHtml(entity.entity)]];
}

function renderEntityViewModal(modal) {
  const entity = getAdminEntity(modal.section, modal.entityId);
  const meta = ADMIN_SECTION_META[modal.section];
  const extra = [];
  if (modal.section === "chains") {
    extra.push(`<button class="btn btn-soft" type="button" data-action="chain-stores" data-id="${entity.id}">${icon("stores", 15)}Abrir tiendas de la cadena</button>`);
  }
  if (modal.section === "zones") {
    extra.push(`<button class="btn btn-soft" type="button" data-action="zone-assignment" data-id="${entity.id}">${icon("edit", 15)}Marcar tiendas de la zona</button>`);
  }
  if (modal.section === "collaborators") {
    extra.push(`<button class="btn btn-soft" type="button" data-action="view-groups" data-id="${entity.id}">${icon("collaborators", 15)}Ver grupos y conteos</button>`);
  }
  return {
    className: "modal-wide",
    title: `Ver ${escapeHtml(meta.singular)}`,
    description: "Detalle de datos ficticios.",
    body: `${modal.section === "audit" ? '<div class="alert alert-warning" style="margin-bottom:16px">' + icon("lock", 16) + '<p>Evento de muestra, solo lectura. El modelo no tiene tabla de auditoría.</p></div>' : ""}<dl class="data-list">${entityDataRows(modal.section, entity).map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("")}</dl>`,
    footer: `${extra.join("")}<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar detalle</button>`
  };
}

function renderChainStoresModal(modal) {
  const chain = DATA.chains.find((item) => item.id === Number(modal.chainId));
  const stores = DATA.stores.filter((store) => store.chainId === chain.id);
  return {
    className: "modal-extra-wide",
    title: `Tiendas · ${escapeHtml(chain.name)}`,
    description: "Gestiona visualmente las tiendas de esta cadena.",
    body: `<div class="row-between row-wrap" style="margin-bottom:16px"><span class="badge badge-blue">${stores.length} tiendas</span><button class="btn" type="button" data-action="edit-entity" data-section="stores" data-mode="create" data-chain-id="${chain.id}">${icon("plus", 15)}Crear tienda en ${escapeHtml(chain.name)}</button></div><div class="chain-store-list">${stores.map((store) => `<div class="chain-store-row"><strong>${escapeHtml(store.name)}</strong><span class="small muted">${escapeHtml(getLocality(store.localityId).name)}</span><span class="small">${escapeHtml(getZone(store.zoneId).name)}</span><div>${adminActionButtons("stores", store.id)}</div></div>`).join("")}</div>`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cerrar tiendas</button>'
  };
}

function renderZoneAssignmentModal(modal) {
  const zone = getZone(modal.zoneId);
  return {
    className: "modal-extra-wide",
    title: `Asignación temporal · ${escapeHtml(zone.name)}`,
    description: "Marca o desmarca tiendas. No se modificará su zona real.",
    body: `<form class="stack" data-form="zone-assignment"><div class="alert alert-info">${icon("info", 16)}<p>Vista temporal de asignación. Al confirmar solo se mostrará un aviso.</p></div><div class="zone-assignment-grid">${DATA.stores.map((store) => `<label class="zone-assignment-item"><input type="checkbox" name="stores" value="${store.id}" ${store.zoneId === zone.id ? "checked" : ""}><span>${escapeHtml(store.name)}<small>${escapeHtml(getChain(store.chainId).name)} · actual: ${escapeHtml(getZone(store.zoneId).name)}</small></span></label>`).join("")}</div><div class="actions"><button class="btn" type="submit">Confirmar asignación simulada</button></div></form>`,
    footer: '<button class="btn btn-secondary" type="button" data-action="close-modal">Cancelar</button>'
  };
}

const WIZARD_STEPS = ["Datos básicos", "Franjas generales", "Calendario", "Tiendas", "Coordinadores", "Confirmación"];

function createWizardState() {
  const selectedStoreIds = new Set(DATA.stores.map((store) => store.id));
  const assignments = {};
  DATA.stores.forEach((store) => {
    if (selectedStoreIds.has(store.id) && store.previousCoordinatorId) {
      assignments[store.id] = store.previousCoordinatorId;
    }
  });
  return {
    step: 1,
    basics: { name: "Campaña de Invierno", typeId: 1, startDate: "2026-12-01", endDate: "2026-12-07" },
    templateSlots: [
      { id: "template-morning", label: "Mañana", start: "10:00", end: "14:00" },
      { id: "template-afternoon", label: "Tarde", start: "17:00", end: "21:00" }
    ],
    daySlots: {},
    weekCursor: "2026-12-01",
    selectedEditorDate: "2026-12-01",
    editingSlotId: null,
    selectedStoreIds,
    coordinatorMode: "automatic",
    assignments,
    batchMode: "chain",
    overlaps: [],
    error: ""
  };
}

function openCampaignWizard() {
  STATE.wizard = createWizardState();
  openModal({ type: "wizard" });
}

function syncWizard() {
  const wizard = STATE.wizard;
  const modal = MODAL_ROOT.querySelector(".top-modal");
  if (!wizard || !modal) {
    return;
  }
  if (wizard.step === 1) {
    wizard.basics.name = modal.querySelector("#wizard-name")?.value.trim() || "";
    wizard.basics.typeId = Number(modal.querySelector("#wizard-type")?.value || 1);
    wizard.basics.startDate = modal.querySelector("#wizard-start")?.value || "";
    wizard.basics.endDate = modal.querySelector("#wizard-end")?.value || "";
  }
  if (wizard.step === 2) {
    const slots = [...modal.querySelectorAll("[data-template-index]")].map((row) => ({
      id: row.dataset.templateId,
      label: row.querySelector('[name="templateLabel"]').value.trim(),
      start: row.querySelector('[name="templateStart"]').value,
      end: row.querySelector('[name="templateEnd"]').value
    }));
    wizard.templateSlots = slots;
  }
}

function materializeWizardCalendar() {
  const wizard = STATE.wizard;
  wizard.daySlots = {};
  listDates(wizard.basics.startDate, wizard.basics.endDate).forEach((value) => {
    wizard.daySlots[value] = wizard.templateSlots.map((slot, index) => ({ ...slot, id: `slot-${value}-${index}-${slot.id}` }));
  });
  wizard.weekCursor = startOfWeek(wizard.basics.startDate);
  wizard.selectedEditorDate = wizard.basics.startDate;
  wizard.editingSlotId = wizard.daySlots[wizard.basics.startDate]?.[0]?.id || null;
  wizard.overlaps = findWizardOverlaps();
}

function findWizardOverlaps() {
  const wizard = STATE.wizard;
  if (!wizard) {
    return [];
  }
  const overlaps = [];
  Object.entries(wizard.daySlots).forEach(([value, slots]) => {
    const ordered = [...slots].sort((first, second) => timeToMinutes(first.start) - timeToMinutes(second.start));
    for (let firstIndex = 0; firstIndex < ordered.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < ordered.length; secondIndex += 1) {
        const first = ordered[firstIndex];
        const second = ordered[secondIndex];
        const overlapStart = Math.max(timeToMinutes(first.start), timeToMinutes(second.start));
        const overlapEnd = Math.min(timeToMinutes(first.end), timeToMinutes(second.end));
        if (overlapStart < overlapEnd) {
          overlaps.push({ date: value, first, second, start: minutesToTime(overlapStart), end: minutesToTime(overlapEnd) });
        }
      }
    }
  });
  return overlaps;
}

function renderWizardError() {
  return STATE.wizard.error ? `<div class="alert alert-danger" role="alert" style="margin-bottom:14px">${icon("warning", 17)}<p>${escapeHtml(STATE.wizard.error)}</p></div>` : "";
}

function renderWizardBasics() {
  const basics = STATE.wizard.basics;
  return `<h3>Datos básicos</h3><p class="wizard-intro">Define el nombre, el tipo y el rango de fechas de la nueva campaña.</p>${renderWizardError()}<div class="form-grid"><div class="field field-full"><label for="wizard-name">Nombre de campaña</label><input id="wizard-name" name="name" autocomplete="off" required value="${escapeHtml(basics.name)}" placeholder="Por ejemplo, Campaña de Invierno…"></div><div class="field field-full"><label for="wizard-type">Tipo de campaña</label><select id="wizard-type" name="typeId">${DATA.campaignTypes.map((type) => `<option value="${type.id}" ${basics.typeId === type.id ? "selected" : ""}>${escapeHtml(type.name)}</option>`).join("")}</select></div><div class="field"><label for="wizard-start">Fecha de inicio</label><input id="wizard-start" name="startDate" type="date" required value="${basics.startDate}"></div><div class="field"><label for="wizard-end">Fecha de fin</label><input id="wizard-end" name="endDate" type="date" required value="${basics.endDate}"></div></div>`;
}

function renderWizardTemplates() {
  const wizard = STATE.wizard;
  return `<h3>Franjas generales</h3><p class="wizard-intro">Indica cómo suelen ser las franjas. Esta plantilla se materializará en cada día y después podrás modificar cada fecha por separado.</p>${renderWizardError()}<div class="stack">${wizard.templateSlots.map((slot, index) => `<div class="template-slot" data-template-index="${index}" data-template-id="${slot.id}"><div class="field"><label for="template-label-${index}">Etiqueta</label><input id="template-label-${index}" name="templateLabel" autocomplete="off" required value="${escapeHtml(slot.label)}" placeholder="Por ejemplo, Mañana…"></div><div class="field"><label for="template-start-${index}">Hora de inicio</label><input id="template-start-${index}" name="templateStart" type="time" step="900" required value="${slot.start}"></div><div class="field"><label for="template-end-${index}">Hora de fin</label><input id="template-end-${index}" name="templateEnd" type="time" step="900" required value="${slot.end}"></div><button class="btn btn-icon" type="button" data-action="wizard-remove-template" data-index="${index}" aria-label="Quitar franja ${escapeHtml(slot.label)}">${icon("trash", 16)}</button></div>`).join("")}</div><div class="actions" style="margin-top:14px"><button class="btn btn-secondary" type="button" data-action="wizard-add-template">${icon("plus", 15)}Añadir franja general</button></div><div class="alert alert-info" style="margin-top:16px">${icon("info", 16)}<p>Si la plantilla genera solapamientos, aparecerán detallados automáticamente en el calendario del siguiente paso.</p></div>`;
}

function renderWizardOverlapAlert() {
  const overlaps = STATE.wizard.overlaps;
  if (!overlaps.length) {
    return "";
  }
  return `<div class="alert alert-danger" role="alert" style="margin-bottom:12px">${icon("warning", 19)}<div class="grow"><p><strong>Hay ${overlaps.length} solapamientos.</strong> Debes resolverlos todos antes de continuar.</p><ul class="slot-validation-list">${overlaps.map((overlap) => `<li><strong>${formatDate(overlap.date, LONG_DATE_FORMATTER)}</strong>: “${escapeHtml(overlap.first.label)}” (${overlap.first.start}–${overlap.first.end}) choca con “${escapeHtml(overlap.second.label)}” (${overlap.second.start}–${overlap.second.end}). Solapamiento: <strong>${overlap.start}–${overlap.end}</strong>.</li>`).join("")}</ul></div></div>`;
}

function renderWizardEvent(value, slot) {
  const top = ((timeToMinutes(slot.start) - DAY_MINUTES_START) / DAY_TOTAL_MINUTES) * 100;
  const height = ((timeToMinutes(slot.end) - timeToMinutes(slot.start)) / DAY_TOTAL_MINUTES) * 100;
  const overlaps = STATE.wizard.overlaps.some((overlap) => overlap.date === value && (overlap.first.id === slot.id || overlap.second.id === slot.id));
  return `<button class="calendar-event ${overlaps ? "event-conflict" : "event-pending"} ${STATE.wizard.editingSlotId === slot.id ? "selected" : ""}" type="button" draggable="true" data-wizard-event data-id="${slot.id}" data-date="${value}" data-focus-key="wizard-event-${slot.id}" data-action="wizard-edit-slot" style="top:${top}%;height:${height}%" aria-label="Editar ${escapeHtml(slot.label)}, ${formatDate(value)}, ${slot.start} a ${slot.end}${overlaps ? ", con solapamiento" : ""}"><strong>${overlaps ? "⚠ " : ""}${escapeHtml(slot.label)}</strong><span>${slot.start}–${slot.end}</span></button>`;
}

function renderWizardEditor() {
  const wizard = STATE.wizard;
  const slot = wizard.daySlots[wizard.selectedEditorDate]?.find((item) => item.id === wizard.editingSlotId);
  if (!slot) {
    return `<aside class="wizard-event-editor"><h3>Editor de franja</h3><p class="small muted">Haz clic en una franja o usa el teclado para editar día, etiqueta y horas. Esta es la alternativa accesible al arrastre.</p><button class="btn btn-soft btn-sm" type="button" data-action="wizard-add-slot" data-date="${wizard.basics.startDate}">${icon("plus", 14)}Añadir primera franja</button></aside>`;
  }
  return `<aside class="wizard-event-editor"><h3>Editar franja</h3><p class="xsmall muted">El editor permite cualquier cambio sin arrastrar.</p><form class="stack" data-form="wizard-editor"><div class="field"><label for="wizard-editor-date">Día</label><input id="wizard-editor-date" name="date" type="date" min="${wizard.basics.startDate}" max="${wizard.basics.endDate}" required value="${wizard.selectedEditorDate}"></div><div class="field"><label for="wizard-editor-label">Etiqueta</label><input id="wizard-editor-label" name="label" autocomplete="off" required value="${escapeHtml(slot.label)}"></div><div class="field"><label for="wizard-editor-start">Inicio</label><input id="wizard-editor-start" name="start" type="time" min="08:00" max="22:45" step="900" required value="${slot.start}"></div><div class="field"><label for="wizard-editor-end">Fin</label><input id="wizard-editor-end" name="end" type="time" min="08:15" max="23:00" step="900" required value="${slot.end}"></div><button class="btn btn-sm" type="submit">Aplicar al calendario</button><button class="btn btn-danger btn-sm" type="button" data-action="wizard-delete-slot">${icon("trash", 13)}Eliminar franja</button></form></aside>`;
}

function renderWizardCalendar() {
  const wizard = STATE.wizard;
  const dates = Array.from({ length: 7 }, (_, index) => addDays(wizard.weekCursor, index));
  return `<h3>Calendario interactivo</h3><p class="wizard-intro">Añade, edita, elimina o arrastra franjas. El arrastre se ajusta a intervalos de 15 minutos; el clic y el teclado abren el editor.</p>${renderWizardError()}${renderWizardOverlapAlert()}<div class="row-between row-wrap" style="margin-bottom:10px"><div class="actions"><button class="btn btn-secondary btn-sm" type="button" data-action="wizard-week-previous">${icon("chevronLeft", 14)}Semana anterior</button><button class="btn btn-secondary btn-sm" type="button" data-action="wizard-week-next">Semana siguiente${icon("chevronRight", 14)}</button></div><strong class="small">${escapeHtml(formatMonthRange([dates[0], dates[6]]))}</strong><button class="btn btn-soft btn-sm" type="button" data-action="wizard-add-slot" data-date="${wizard.selectedEditorDate}">${icon("plus", 14)}Añadir franja</button></div><div class="wizard-calendar-layout"><div class="wizard-calendar"><div class="timeline-scroll"><div class="timeline-grid" style="--day-count:7"><div class="timeline-header"><div class="timeline-corner"></div>${dates.map((value) => `<div class="timeline-day-header"><strong>${capitalize(WEEKDAY_FORMATTER.format(toDate(value))).replace(".", "")}</strong><span class="day-number ${value === TODAY ? "today" : ""}">${toDate(value).getUTCDate()}</span>${value >= wizard.basics.startDate && value <= wizard.basics.endDate ? `<button class="link-button xsmall" type="button" data-action="wizard-add-slot" data-date="${value}" aria-label="Añadir franja el ${formatDate(value)}">${icon("plus", 11)}Añadir</button>` : ""}</div>`).join("")}</div><div class="timeline-track">${renderTimeAxis()}${dates.map((value) => `<div class="timeline-day-column wizard-drop-column" data-wizard-drop-date="${value}">${renderTimeGuides()}${(wizard.daySlots[value] || []).map((slot) => renderWizardEvent(value, slot)).join("")}</div>`).join("")}</div></div></div></div>${renderWizardEditor()}</div>`;
}

function renderWizardStores() {
  const wizard = STATE.wizard;
  return `<h3>Tiendas participantes</h3><p class="wizard-intro">Despliega cada cadena y marca tiendas individuales o la cadena completa.</p>${renderWizardError()}<div class="field" style="margin-bottom:14px"><label for="wizard-store-search">Buscar tienda</label><div class="search-control">${icon("search", 16)}<input id="wizard-store-search" type="search" autocomplete="off" data-action="wizard-store-search" placeholder="Busca una tienda dentro de las cadenas…"></div></div><div class="campaign-store-selector">${DATA.chains.map((chain) => {
    const stores = DATA.stores.filter((store) => store.chainId === chain.id);
    return `<details open data-wizard-chain-group="${chain.id}"><summary><label class="row" style="font-weight:750"><input type="checkbox" data-wizard-chain="${chain.id}" aria-label="Seleccionar toda la cadena ${escapeHtml(chain.name)}"><span>${escapeHtml(chain.name)}</span><span class="badge badge-neutral" data-chain-count="${chain.id}"></span></label></summary><div class="chain-store-checks">${stores.map((store) => `<label data-wizard-store-option><input type="checkbox" data-wizard-store="${store.id}" ${wizard.selectedStoreIds.has(store.id) ? "checked" : ""}><span>${escapeHtml(store.name)}</span></label>`).join("")}</div></details>`;
  }).join("")}</div><p class="small muted" style="margin-top:12px">Seleccionadas: <strong>${wizard.selectedStoreIds.size}</strong> de ${DATA.stores.length} tiendas.</p>`;
}

function coordinatorOptions(selectedId) {
  const coordinators = DATA.users.filter((user) => user.roles.includes("COORDINATOR"));
  return `<option value="">Sin asignar</option>${coordinators.map((user) => `<option value="${user.id}" ${Number(selectedId) === user.id ? "selected" : ""}>${escapeHtml(user.name)} · COORDINATOR</option>`).join("")}`;
}

function renderBatchOptions() {
  const wizard = STATE.wizard;
  if (wizard.batchMode === "chain") {
    return DATA.chains.map((chain) => `<option value="${chain.id}">${escapeHtml(chain.name)}</option>`).join("");
  }
  return DATA.zones.map((zone) => `<option value="${zone.id}">${escapeHtml(zone.name)}</option>`).join("");
}

function renderWizardCoordinators() {
  const wizard = STATE.wizard;
  const stores = DATA.stores.filter((store) => wizard.selectedStoreIds.has(store.id));
  const missing = stores.filter((store) => !wizard.assignments[store.id]);
  return `<h3>Coordinadores por tienda</h3><p class="wizard-intro">Reutiliza la campaña anterior o asigna manualmente personas con rol COORDINATOR.</p>${renderWizardError()}<div class="coordinator-mode"><label><input type="radio" name="coordinatorMode" value="automatic" data-action="wizard-coordinator-mode" ${wizard.coordinatorMode === "automatic" ? "checked" : ""}><span><strong>Automático: reutilizar campaña anterior</strong><small>Las tiendas que no participaron antes quedan vacías para completarlas.</small></span></label><label><input type="radio" name="coordinatorMode" value="manual" data-action="wizard-coordinator-mode" ${wizard.coordinatorMode === "manual" ? "checked" : ""}><span><strong>Asignar manualmente</strong><small>Asigna por tienda o utiliza el modo de lote por cadena o zona.</small></span></label></div>
    <div class="batch-bar"><div class="field"><label for="wizard-batch-mode">Modo de lote</label><select id="wizard-batch-mode" data-action="wizard-batch-mode"><option value="chain" ${wizard.batchMode === "chain" ? "selected" : ""}>Por cadena</option><option value="zone" ${wizard.batchMode === "zone" ? "selected" : ""}>Por zona</option></select></div><div class="field"><label for="wizard-batch-target">${wizard.batchMode === "chain" ? "Cadena" : "Zona"}</label><select id="wizard-batch-target">${renderBatchOptions()}</select></div><div class="field"><label for="wizard-batch-coordinator">Coordinador</label><select id="wizard-batch-coordinator">${coordinatorOptions(null)}</select></div><button class="btn btn-secondary" type="button" data-action="wizard-apply-batch">Aplicar a la selección</button></div>
    <div class="alert ${missing.length ? "alert-warning" : "alert-success"}" style="margin-bottom:12px">${icon(missing.length ? "warning" : "check", 17)}<p>${missing.length ? `${missing.length} tiendas no tienen coordinador. El triángulo señala cada fila pendiente; no podrás avanzar hasta completarlas.` : "Todas las tiendas seleccionadas tienen coordinador."}</p></div><div class="coordinator-store-list">${stores.map((store) => `<div class="coordinator-store-row ${wizard.assignments[store.id] ? "" : "missing"}" data-coordinator-row="${store.id}"><div class="coordinator-store-name">${wizard.assignments[store.id] ? "" : icon("warning", 15)}<span>${escapeHtml(store.name)}</span></div><div><label class="sr-only" for="wizard-coordinator-${store.id}">Coordinador de ${escapeHtml(store.name)}</label><select id="wizard-coordinator-${store.id}" data-wizard-coordinator="${store.id}" data-focus-key="coordinator-${store.id}">${coordinatorOptions(wizard.assignments[store.id])}</select></div></div>`).join("")}</div>`;
}

function renderWizardConfirmation() {
  const wizard = STATE.wizard;
  const days = listDates(wizard.basics.startDate, wizard.basics.endDate);
  const slotCount = Object.values(wizard.daySlots).reduce((total, slots) => total + slots.length, 0);
  return `<h3>Confirmación final</h3><p class="wizard-intro">Revisa el resumen y confirma explícitamente la simulación. No se creará ninguna campaña.</p>${renderWizardError()}<div class="confirmation-summary"><section class="detail-section"><h3>Campaña</h3><dl class="data-list"><dt>Nombre</dt><dd>${escapeHtml(wizard.basics.name)}</dd><dt>Tipo</dt><dd>${escapeHtml(DATA.campaignTypes.find((type) => type.id === wizard.basics.typeId).name)}</dd><dt>Inicio</dt><dd>${formatDate(wizard.basics.startDate)}</dd><dt>Fin</dt><dd>${formatDate(wizard.basics.endDate)}</dd></dl></section><section class="detail-section"><h3>Planificación</h3><dl class="data-list"><dt>Días</dt><dd>${days.length}</dd><dt>Franjas</dt><dd>${slotCount}</dd><dt>Tiendas</dt><dd>${wizard.selectedStoreIds.size}</dd><dt>Solapamientos</dt><dd><span class="status-badge status-complete">0</span></dd></dl></section></div><div class="alert alert-info" style="margin-top:16px">${icon("info", 17)}<p>La confirmación cierra el asistente y muestra un aviso. Las campañas, franjas y asignaciones originales permanecen iguales.</p></div><label class="checkbox-label" style="margin-top:18px;padding:14px;border:1px solid var(--color-border);border-radius:8px;background:white"><input type="checkbox" id="wizard-final-confirmation"><span>Confirmo que quiero ejecutar la creación simulada sin guardar datos.</span></label>`;
}

function renderWizardContent() {
  const renderers = [renderWizardBasics, renderWizardTemplates, renderWizardCalendar, renderWizardStores, renderWizardCoordinators, renderWizardConfirmation];
  return renderers[STATE.wizard.step - 1]();
}

function renderWizardModal() {
  const wizard = STATE.wizard;
  return {
    className: "modal-wizard",
    title: `${icon("campaign", 22)} Asistente de campaña`,
    description: `Paso ${wizard.step} de 6 · ${WIZARD_STEPS[wizard.step - 1]} · creación simulada`,
    body: `<div class="wizard-shell"><ol class="wizard-steps" aria-label="Pasos del asistente">${WIZARD_STEPS.map((label, index) => `<li class="wizard-step ${wizard.step === index + 1 ? "active" : wizard.step > index + 1 ? "done" : ""}" ${wizard.step === index + 1 ? 'aria-current="step"' : ""}><span class="wizard-step-number">${wizard.step > index + 1 ? "✓" : index + 1}</span><span>${label}</span></li>`).join("")}</ol><section class="wizard-content" aria-live="polite">${renderWizardContent()}</section></div>`,
    footerBetween: true,
    footer: `<button class="btn btn-secondary" type="button" data-action="wizard-previous" ${wizard.step === 1 ? "disabled" : ""}>${icon("arrowLeft", 15)}Anterior</button><span class="small muted">Los cambios de este asistente son temporales</span>${wizard.step < 6 ? `<button class="btn" type="button" data-action="wizard-next" data-focus-key="wizard-next">Siguiente${icon("arrowRight", 15)}</button>` : `<button class="btn" type="button" data-action="wizard-finish">${icon("check", 16)}Confirmar creación simulada</button>`}`
  };
}

function focusWizardTarget(selector) {
  window.requestAnimationFrame(() => {
    const target = MODAL_ROOT.querySelector(selector);
    if (target) {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      target.focus({ preventScroll: true });
    }
  });
}

function validateWizardBasics() {
  const wizard = STATE.wizard;
  if (!wizard.basics.name || !wizard.basics.startDate || !wizard.basics.endDate) {
    wizard.error = "Completa el nombre y las dos fechas antes de continuar.";
    return false;
  }
  if (wizard.basics.startDate > wizard.basics.endDate) {
    wizard.error = "La fecha de inicio debe ser anterior o igual a la fecha de fin.";
    return false;
  }
  if (listDates(wizard.basics.startDate, wizard.basics.endDate).length > 31) {
    wizard.error = "Para este mockup, elige un rango máximo de 31 días.";
    return false;
  }
  return true;
}

function wizardNext() {
  const wizard = STATE.wizard;
  syncWizard();
  wizard.error = "";
  if (wizard.step === 1 && !validateWizardBasics()) {
    renderModals();
    focusWizardTarget("#wizard-name");
    return;
  }
  if (wizard.step === 2) {
    if (!wizard.templateSlots.length || wizard.templateSlots.some((slot) => !slot.label || !slot.start || !slot.end || timeToMinutes(slot.start) >= timeToMinutes(slot.end) || timeToMinutes(slot.start) < DAY_MINUTES_START || timeToMinutes(slot.end) > DAY_MINUTES_END)) {
      wizard.error = "Añade al menos una franja con etiqueta y horas válidas entre 08:00 y 23:00.";
      renderModals();
      return;
    }
    materializeWizardCalendar();
  }
  if (wizard.step === 3) {
    wizard.overlaps = findWizardOverlaps();
    if (wizard.overlaps.length) {
      wizard.error = "Resuelve los solapamientos indicados para poder pasar a Tiendas.";
      renderModals();
      const first = wizard.overlaps[0];
      focusWizardTarget(`[data-wizard-event][data-id="${first.first.id}"]`);
      return;
    }
  }
  if (wizard.step === 4 && wizard.selectedStoreIds.size === 0) {
    wizard.error = "Selecciona al menos una tienda antes de continuar.";
    renderModals();
    focusWizardTarget("[data-wizard-store]");
    return;
  }
  if (wizard.step === 5) {
    const selected = DATA.stores.filter((store) => wizard.selectedStoreIds.has(store.id));
    const missing = selected.filter((store) => !wizard.assignments[store.id]);
    if (missing.length) {
      wizard.error = `Faltan ${missing.length} coordinadores. Asigna una persona COORDINATOR en cada fila señalada.`;
      renderModals();
      focusWizardTarget(`#wizard-coordinator-${missing[0].id}`);
      return;
    }
  }
  wizard.step = Math.min(6, wizard.step + 1);
  renderModals();
}

function wizardPrevious() {
  syncWizard();
  STATE.wizard.error = "";
  STATE.wizard.step = Math.max(1, STATE.wizard.step - 1);
  renderModals();
}

function syncWizardChainCheckboxes() {
  DATA.chains.forEach((chain) => {
    const checkbox = MODAL_ROOT.querySelector(`[data-wizard-chain="${chain.id}"]`);
    if (!checkbox || !STATE.wizard) {
      return;
    }
    const stores = DATA.stores.filter((store) => store.chainId === chain.id);
    const selected = stores.filter((store) => STATE.wizard.selectedStoreIds.has(store.id)).length;
    checkbox.checked = selected === stores.length;
    checkbox.indeterminate = selected > 0 && selected < stores.length;
    checkbox.setAttribute("aria-checked", checkbox.indeterminate ? "mixed" : String(checkbox.checked));
    const count = MODAL_ROOT.querySelector(`[data-chain-count="${chain.id}"]`);
    if (count) {
      count.textContent = `${selected}/${stores.length}`;
    }
  });
}

function moveCalendar(direction) {
  if (STATE.calendarView === "day") {
    STATE.calendarCursor = addDays(STATE.calendarCursor, direction);
  } else if (STATE.calendarView === "week") {
    STATE.calendarCursor = addDays(STATE.calendarCursor, direction * 7);
  } else {
    STATE.calendarCursor = addMonths(STATE.calendarCursor, direction);
  }
  renderApp();
}

function clearStoreFilters() {
  STATE.storeSearch = "";
  STATE.storeFilters = { zoneId: null, chainId: null, status: null, manager: null };
}

function showZoneStores(zoneId) {
  clearStoreFilters();
  STATE.storeFilters.zoneId = Number(zoneId);
  navigate("stores");
}

function openStore(storeId) {
  const store = getStore(storeId);
  if (!visibleStores().some((visibleStore) => visibleStore.id === store.id)) {
    showToast("Esta tienda está fuera de tu ámbito visible.", "info");
    return;
  }
  STATE.storeCalendarCursor = STATE.calendarCursor;
  openModal({ type: "store", storeId: Number(storeId) });
}

function openEntity(section, mode, trigger) {
  const entityId = Number(trigger.dataset.id || 0);
  if (isReadonlyCampaign() && STATE.context === "campaign") {
    showToast("La campaña está en solo lectura.", "info");
    return;
  }
  openModal({ type: "entity-form", section, mode, entityId, contactId: trigger.dataset.contactId, chainId: Number(trigger.dataset.chainId || 0) });
}

function handleClick(event) {
  const navigation = event.target.closest("[data-nav]");
  if (navigation && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    navigate(navigation.dataset.nav);
    return;
  }
  const adminNavigation = event.target.closest("[data-admin-nav]");
  if (adminNavigation && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    navigateAdmin(adminNavigation.dataset.adminNav);
    return;
  }
  const trigger = event.target.closest("[data-action]");
  if (!trigger) {
    if (STATE.popover && !event.target.closest(".popover-wrap")) {
      STATE.popover = null;
      renderApp();
    }
    return;
  }
  const action = trigger.dataset.action;
  if (trigger.disabled) {
    return;
  }
  if (action === "login-mock") {
    loginAs(trigger.dataset.role);
  } else if (action === "switch-auth") {
    STATE.authView = STATE.authView === "login" ? "register" : "login";
    renderAuth();
  } else if (action === "logout") {
    STATE.role = null;
    STATE.userId = null;
    STATE.authView = "login";
    closeAllModals();
    renderApp();
  } else if (action === "toggle-popover") {
    STATE.popover = STATE.popover === trigger.dataset.popover ? null : trigger.dataset.popover;
    renderApp();
  } else if (action === "open-admin") {
    navigateAdmin("overview");
  } else if (action === "admin-section") {
    navigateAdmin(trigger.dataset.section);
  } else if (action === "back-campaign") {
    event.preventDefault();
    STATE.context = "campaign";
    STATE.popover = null;
    renderApp();
  } else if (action === "close-modal") {
    closeTopModal();
  } else if (action === "confirm-simulation") {
    const confirmation = STATE.modals.at(-1);
    closeTopModal();
    showToast(confirmation.toast || "Acción confirmada. Los datos permanecen sin cambios.");
  } else if (action === "calendar-view") {
    STATE.calendarView = trigger.dataset.view;
    renderApp();
  } else if (action === "calendar-today") {
    STATE.calendarCursor = TODAY;
    renderApp();
  } else if (action === "calendar-previous") {
    moveCalendar(-1);
  } else if (action === "calendar-next") {
    moveCalendar(1);
  } else if (action === "open-day-summary") {
    openModal({ type: "day", date: trigger.dataset.date });
  } else if (action === "open-slot") {
    STATE.slotSort = "default";
    openModal({ type: "slot", date: trigger.dataset.date, slotId: trigger.dataset.slot });
  } else if (action === "toggle-slot-sort") {
    STATE.slotSort = STATE.slotSort === "status" ? "default" : "status";
    renderModals();
  } else if (action === "open-store") {
    openStore(trigger.dataset.id);
  } else if (action === "open-store-day") {
    openModal({ type: "store-day", storeId: Number(trigger.dataset.id), date: trigger.dataset.date });
  } else if (action === "store-calendar-previous" || action === "store-calendar-next") {
    STATE.storeCalendarCursor = addDays(STATE.storeCalendarCursor, action === "store-calendar-next" ? 7 : -7);
    renderModals();
  } else if (action === "store-calendar-today") {
    STATE.storeCalendarCursor = TODAY;
    renderModals();
  } else if (action === "contact-user") {
    const user = getUser(trigger.dataset.id);
    if (user) {
      openContact(user);
    }
  } else if (action === "contact-collaborator") {
    const collaborator = getCollaborator(trigger.dataset.collaboratorId);
    const contact = collaborator.contacts.find((item) => item.id === Number(trigger.dataset.id));
    openContact({ ...contact, roles: [] });
  } else if (action === "open-report") {
    openModal({ type: "report", reportId: Number(trigger.dataset.id) });
  } else if (action === "report-filter") {
    STATE.reportFilter = trigger.dataset.filter;
    renderApp();
  } else if (action === "zones-display") {
    STATE.zoneDisplay = trigger.dataset.display;
    renderApp();
  } else if (action === "zone-stores") {
    showZoneStores(trigger.dataset.id);
  } else if (action === "clear-store-filters") {
    clearStoreFilters();
    renderApp();
  } else if (action === "remove-store-filter") {
    const filter = trigger.dataset.filter;
    if (filter === "search") {
      STATE.storeSearch = "";
    } else {
      STATE.storeFilters[filter] = null;
    }
    renderApp();
  } else if (action === "metric-stores") {
    clearStoreFilters();
    if (trigger.dataset.filter === "manager") {
      STATE.storeFilters.manager = "missing";
    } else {
      STATE.storeFilters.status = trigger.dataset.filter;
    }
    navigate("stores");
  } else if (action === "metric-reports") {
    STATE.reportFilter = "pending";
    navigate("reports");
  } else if (action === "metric-calendar") {
    const conflict = DATA.conflicts.find((item) => item.campaignId === STATE.campaignId);
    STATE.calendarView = "day";
    STATE.calendarCursor = conflict?.date || STATE.calendarCursor;
    navigate("calendar");
  } else if (action === "open-tutorial") {
    STATE.tutorialStep = 0;
    openModal({ type: "tutorial" });
  } else if (action === "tutorial-previous") {
    STATE.tutorialStep = Math.max(0, STATE.tutorialStep - 1);
    renderModals();
  } else if (action === "tutorial-next") {
    STATE.tutorialStep += 1;
    renderModals();
  } else if (action === "open-notification") {
    const notification = DATA.notifications.find((item) => item.id === Number(trigger.dataset.id));
    STATE.popover = null;
    if (notification.type === "calendar") {
      STATE.calendarView = "day";
      STATE.calendarCursor = notification.date;
      navigate("calendar");
      openModal({ type: "day", date: notification.date });
    } else if (notification.type === "report") {
      renderApp();
      openModal({ type: "report", reportId: notification.targetId });
    } else {
      STATE.calendarCursor = "2026-11-15";
      renderApp();
      openStore(notification.targetId);
    }
  } else if (action === "simulate-assignment") {
    openConfirmation({ title: "Proponer cambio de asignación", message: "Se simulará una propuesta para esta franja. Los turnos y estados no cambiarán.", confirmLabel: "Confirmar propuesta", toast: "Propuesta simulada. Los turnos permanecen iguales." });
  } else if (action === "view-groups") {
    openModal({ type: "groups", collaboratorId: Number(trigger.dataset.id) });
  } else if (action === "assign-collaborator-manager") {
    openModal({ type: "assign-manager", collaboratorId: Number(trigger.dataset.id) });
  } else if (action === "view-entity") {
    openModal({ type: "entity-view", section: trigger.dataset.section, entityId: Number(trigger.dataset.id) });
  } else if (action === "edit-entity") {
    openEntity(trigger.dataset.section, trigger.dataset.mode || "edit", trigger);
  } else if (action === "delete-entity") {
    const section = trigger.dataset.section;
    const entity = getAdminEntity(section, Number(trigger.dataset.id));
    openConfirmation({ title: `Borrar ${ADMIN_SECTION_META[section].singular}`, message: `Vas a simular el borrado de “${entity.name || entity.action}”. Esta acción no eliminará el registro.`, confirmLabel: "Borrar de forma simulada", danger: true, toast: "Borrado simulado. El registro sigue disponible." });
  } else if (action === "chain-stores") {
    openModal({ type: "chain-stores", chainId: Number(trigger.dataset.id) });
  } else if (action === "zone-assignment") {
    openModal({ type: "zone-assignment", zoneId: Number(trigger.dataset.id) });
  } else if (action === "create-campaign-type") {
    openModal({ type: "entity-form", section: "campaignType", mode: "create", entityId: 0 });
  } else if (action === "clear-admin-search") {
    STATE.adminQuery = "";
    renderApp();
  } else if (action === "open-wizard") {
    openCampaignWizard();
  } else if (action === "wizard-next") {
    wizardNext();
  } else if (action === "wizard-previous") {
    wizardPrevious();
  } else if (action === "wizard-add-template") {
    syncWizard();
    STATE.wizard.templateSlots.push({ id: `template-${Date.now()}`, label: "Nueva franja", start: "15:00", end: "16:00" });
    STATE.wizard.error = "";
    renderModals();
  } else if (action === "wizard-remove-template") {
    syncWizard();
    STATE.wizard.templateSlots.splice(Number(trigger.dataset.index), 1);
    renderModals();
  } else if (action === "wizard-week-previous" || action === "wizard-week-next") {
    STATE.wizard.weekCursor = addDays(STATE.wizard.weekCursor, action === "wizard-week-next" ? 7 : -7);
    renderModals();
  } else if (action === "wizard-edit-slot") {
    STATE.wizard.selectedEditorDate = trigger.dataset.date;
    STATE.wizard.editingSlotId = trigger.dataset.id;
    STATE.wizard.error = "";
    renderModals();
    focusWizardTarget("#wizard-editor-label");
  } else if (action === "wizard-add-slot") {
    const wizard = STATE.wizard;
    const value = trigger.dataset.date || wizard.selectedEditorDate;
    if (value < wizard.basics.startDate || value > wizard.basics.endDate) {
      showToast(`Elige un día entre ${formatDate(wizard.basics.startDate)} y ${formatDate(wizard.basics.endDate)}.`, "info");
      return;
    }
    const newSlot = { id: `wizard-slot-${Date.now()}`, label: "Nueva franja", start: "15:00", end: "16:00" };
    wizard.daySlots[value] = [...(wizard.daySlots[value] || []), newSlot];
    wizard.selectedEditorDate = value;
    wizard.editingSlotId = newSlot.id;
    wizard.overlaps = findWizardOverlaps();
    wizard.error = "";
    renderModals();
    focusWizardTarget("#wizard-editor-label");
  } else if (action === "wizard-delete-slot") {
    const wizard = STATE.wizard;
    const value = wizard.selectedEditorDate;
    wizard.daySlots[value] = (wizard.daySlots[value] || []).filter((slot) => slot.id !== wizard.editingSlotId);
    wizard.editingSlotId = wizard.daySlots[value]?.[0]?.id || null;
    wizard.overlaps = findWizardOverlaps();
    renderModals();
  } else if (action === "wizard-apply-batch") {
    const wizard = STATE.wizard;
    const modal = MODAL_ROOT.querySelector(".top-modal");
    const targetId = Number(modal.querySelector("#wizard-batch-target").value);
    const coordinatorId = Number(modal.querySelector("#wizard-batch-coordinator").value);
    if (!coordinatorId) {
      showToast("Selecciona un coordinador para aplicar el lote.", "info");
      return;
    }
    DATA.stores.filter((store) => wizard.selectedStoreIds.has(store.id) && (wizard.batchMode === "chain" ? store.chainId === targetId : store.zoneId === targetId)).forEach((store) => {
      wizard.assignments[store.id] = coordinatorId;
    });
    renderModals();
  } else if (action === "wizard-finish") {
    if (!MODAL_ROOT.querySelector("#wizard-final-confirmation")?.checked) {
      STATE.wizard.error = "Marca la casilla de confirmación para finalizar la creación simulada.";
      renderModals();
      focusWizardTarget("#wizard-final-confirmation");
    } else {
      closeTopModal();
      showToast("Campaña simulada correctamente. No se ha creado ningún registro.");
    }
  }
}

function handleChange(event) {
  const target = event.target;
  const action = target.dataset.action;
  if (action === "select-campaign") {
    STATE.campaignId = Number(target.value);
    const campaign = getCampaign();
    STATE.calendarCursor = campaign.id === 1 && TODAY >= campaign.startDate && TODAY <= campaign.endDate ? TODAY : campaign.startDate;
    STATE.storeCalendarCursor = STATE.calendarCursor;
    clearStoreFilters();
    STATE.popover = null;
    renderApp();
  }
  if (action === "store-filter-change") {
    const form = target.closest("form");
    STATE.storeSearch = form.elements.search.value.trim();
    STATE.storeFilters.zoneId = form.elements.zoneId.value ? Number(form.elements.zoneId.value) : null;
    STATE.storeFilters.chainId = form.elements.chainId.value ? Number(form.elements.chainId.value) : null;
    STATE.storeFilters.status = form.elements.status.value || null;
    renderApp();
  }
  if (action === "visual-density") {
    document.body.classList.toggle("compact-density", target.value === "compact");
    showToast("Ajuste visual aplicado solo durante esta sesión.");
  }
  if (action === "visual-text") {
    document.body.classList.toggle("large-text", target.value === "large");
    showToast("Tamaño de texto aplicado solo durante esta sesión.");
  }
  if (target.matches("[data-wizard-chain]")) {
    const chainId = Number(target.dataset.wizardChain);
    DATA.stores.filter((store) => store.chainId === chainId).forEach((store) => {
      if (target.checked) {
        STATE.wizard.selectedStoreIds.add(store.id);
      } else {
        STATE.wizard.selectedStoreIds.delete(store.id);
      }
    });
    syncWizardChainCheckboxes();
    renderModals();
  }
  if (target.matches("[data-wizard-store]")) {
    const storeId = Number(target.dataset.wizardStore);
    if (target.checked) {
      STATE.wizard.selectedStoreIds.add(storeId);
    } else {
      STATE.wizard.selectedStoreIds.delete(storeId);
      delete STATE.wizard.assignments[storeId];
    }
    syncWizardChainCheckboxes();
    renderModals();
  }
  if (action === "wizard-coordinator-mode") {
    const wizard = STATE.wizard;
    wizard.coordinatorMode = target.value;
    wizard.assignments = {};
    if (target.value === "automatic") {
      DATA.stores.filter((store) => wizard.selectedStoreIds.has(store.id) && store.previousCoordinatorId).forEach((store) => {
        wizard.assignments[store.id] = store.previousCoordinatorId;
      });
    }
    wizard.error = "";
    renderModals();
  }
  if (action === "wizard-batch-mode") {
    STATE.wizard.batchMode = target.value;
    renderModals();
  }
  if (target.matches("[data-wizard-coordinator]")) {
    const storeId = Number(target.dataset.wizardCoordinator);
    if (target.value) {
      STATE.wizard.assignments[storeId] = Number(target.value);
    } else {
      delete STATE.wizard.assignments[storeId];
    }
    STATE.wizard.error = "";
    renderModals();
  }
}

function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) {
    return;
  }
  event.preventDefault();
  const formType = form.dataset.form;
  if (formType === "login") {
    if (form.reportValidity()) {
      loginAs("ADMIN");
      showToast("Acceso simulado como ADMIN.");
    }
  } else if (formType === "register") {
    if (form.reportValidity()) {
      form.reset();
      showToast("Solicitud simulada. No se ha creado ninguna cuenta.");
    }
  } else if (formType === "store-filters") {
    STATE.storeSearch = form.elements.search.value.trim();
    STATE.storeFilters.zoneId = form.elements.zoneId.value ? Number(form.elements.zoneId.value) : null;
    STATE.storeFilters.chainId = form.elements.chainId.value ? Number(form.elements.chainId.value) : null;
    STATE.storeFilters.status = form.elements.status.value || null;
    renderApp();
  } else if (formType === "admin-search") {
    STATE.adminQuery = form.elements.query.value.trim();
    renderApp();
  } else if (formType === "report-response") {
    if (form.reportValidity()) {
      closeTopModal();
      showToast("Respuesta simulada. La incidencia sigue pendiente y sin cambios.");
    }
  } else if (formType === "entity") {
    if (form.reportValidity()) {
      closeTopModal();
      showToast("Formulario confirmado. No se ha guardado ningún cambio.");
    }
  } else if (formType === "simple-simulation" || formType === "zone-assignment") {
    if (form.reportValidity()) {
      closeTopModal();
      showToast("Asignación simulada. Los datos originales permanecen iguales.");
    }
  } else if (formType === "wizard-editor") {
    const wizard = STATE.wizard;
    const formData = new FormData(form);
    const value = String(formData.get("date"));
    const updated = {
      id: wizard.editingSlotId,
      label: String(formData.get("label")).trim(),
      start: String(formData.get("start")),
      end: String(formData.get("end"))
    };
    if (!form.reportValidity()) {
      return;
    }
    if (!updated.label || timeToMinutes(updated.start) >= timeToMinutes(updated.end) || timeToMinutes(updated.start) < DAY_MINUTES_START || timeToMinutes(updated.end) > DAY_MINUTES_END) {
      wizard.error = "Usa una etiqueta y un intervalo válido entre 08:00 y 23:00.";
      renderModals();
      focusWizardTarget("#wizard-editor-start");
      return;
    }
    const previousDate = wizard.selectedEditorDate;
    wizard.daySlots[previousDate] = (wizard.daySlots[previousDate] || []).filter((slot) => slot.id !== updated.id);
    wizard.daySlots[value] = [...(wizard.daySlots[value] || []), updated];
    wizard.selectedEditorDate = value;
    wizard.overlaps = findWizardOverlaps();
    wizard.error = "";
    if (value < startOfWeek(wizard.weekCursor) || value > addDays(startOfWeek(wizard.weekCursor), 6)) {
      wizard.weekCursor = startOfWeek(value);
    }
    renderModals();
    showToast("Franja actualizada dentro del borrador temporal.");
  }
}

function handleInput(event) {
  const target = event.target;
  if (target.dataset.action === "wizard-store-search") {
    const query = target.value.trim().toLocaleLowerCase("es-ES");
    MODAL_ROOT.querySelectorAll("[data-wizard-store-option]").forEach((label) => {
      label.hidden = Boolean(query) && !label.textContent.toLocaleLowerCase("es-ES").includes(query);
    });
  }
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    if (STATE.modals.length) {
      event.preventDefault();
      closeTopModal();
    } else if (STATE.popover) {
      STATE.popover = null;
      renderApp();
    }
    return;
  }
  if (event.key === "Tab" && STATE.modals.length) {
    const card = MODAL_ROOT.querySelector(".top-modal .modal-card");
    const focusable = [...card.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')].filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
    if (!focusable.length) {
      return;
    }
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

function handleDragStart(event) {
  const dragged = event.target.closest("[data-wizard-event]");
  if (!dragged || !STATE.wizard) {
    return;
  }
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", JSON.stringify({ id: dragged.dataset.id, date: dragged.dataset.date }));
  document.body.classList.add("dragging");
  dragged.style.opacity = "0.55";
  dragged.inert = true;
}

function handleDragEnd(event) {
  const dragged = event.target.closest("[data-wizard-event]");
  if (dragged) {
    dragged.inert = false;
    dragged.style.opacity = "";
  }
  document.body.classList.remove("dragging");
  MODAL_ROOT.querySelectorAll(".drag-over").forEach((column) => column.classList.remove("drag-over"));
}

function handleDragOver(event) {
  const column = event.target.closest("[data-wizard-drop-date]");
  if (!column || !STATE.wizard) {
    return;
  }
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  column.classList.add("drag-over");
}

function handleDragLeave(event) {
  const column = event.target.closest("[data-wizard-drop-date]");
  if (column && !column.contains(event.relatedTarget)) {
    column.classList.remove("drag-over");
  }
}

function handleDrop(event) {
  const column = event.target.closest("[data-wizard-drop-date]");
  if (!column || !STATE.wizard) {
    return;
  }
  event.preventDefault();
  column.classList.remove("drag-over");
  let dragData;
  try {
    dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
  } catch {
    return;
  }
  const wizard = STATE.wizard;
  const newDate = column.dataset.wizardDropDate;
  if (newDate < wizard.basics.startDate || newDate > wizard.basics.endDate) {
    showToast(`La franja debe quedar entre ${formatDate(wizard.basics.startDate)} y ${formatDate(wizard.basics.endDate)}.`, "info");
    return;
  }
  const sourceSlots = wizard.daySlots[dragData.date] || [];
  const slot = sourceSlots.find((item) => item.id === dragData.id);
  if (!slot) {
    return;
  }
  const bounds = column.getBoundingClientRect();
  const relative = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
  const duration = timeToMinutes(slot.end) - timeToMinutes(slot.start);
  let start = DAY_MINUTES_START + Math.round((relative * DAY_TOTAL_MINUTES) / 15) * 15;
  start = Math.max(DAY_MINUTES_START, Math.min(DAY_MINUTES_END - duration, start));
  const updated = { ...slot, start: minutesToTime(start), end: minutesToTime(start + duration) };
  wizard.daySlots[dragData.date] = sourceSlots.filter((item) => item.id !== dragData.id);
  wizard.daySlots[newDate] = [...(wizard.daySlots[newDate] || []), updated];
  wizard.selectedEditorDate = newDate;
  wizard.editingSlotId = updated.id;
  wizard.overlaps = findWizardOverlaps();
  wizard.error = "";
  renderModals();
  focusWizardTarget(`[data-wizard-event][data-id="${updated.id}"]`);
}

document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", handleInput);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("dragstart", handleDragStart);
document.addEventListener("dragend", handleDragEnd);
document.addEventListener("dragover", handleDragOver);
document.addEventListener("dragleave", handleDragLeave);
document.addEventListener("drop", handleDrop);

window.addEventListener("hashchange", () => {
  if (!STATE.role) {
    return;
  }
  const hash = window.location.hash;
  if (hash.startsWith("#/admin/") && STATE.role === "ADMIN") {
    navigateAdmin(hash.replace("#/admin/", ""));
  } else if (hash.startsWith("#/") && !hash.startsWith("#/admin/")) {
    const view = hash.replace("#/", "");
    if (["home", "zones", "stores", "collaborators", "reports", "calendar"].includes(view)) {
      navigate(view);
    }
  }
});

renderApp();
